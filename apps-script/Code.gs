/**
 * Google Apps Script API for Personal Learner Tracker
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Replace all content in Code.gs with this script
 * 4. (Optional) Set SPREADSHEET_ID if not container-bound, or leave as null for active spreadsheet
 * 5. Click Deploy > New deployment
 * 6. Select Type: Web app
 *    - Description: Personal Learner Tracker API v1
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 7. Click Deploy, authorize permissions when prompted, and copy the Web App URL.
 * 8. Set the URL in your .env as VITE_GOOGLE_SCRIPT_URL=<YOUR_DEPLOYED_WEB_APP_URL>
 */

// If script is bound to the spreadsheet, leave as null. If standalone, paste your Sheet ID here:
var SPREADSHEET_ID = null;

// Tab Names
var TAB_INVESTMENTS = "Investments";
var TAB_LEARNING_HISTORY = "LearningHistory";
var TAB_DAILY_CONCEPTS = "DailyConcepts";

// Headers
var HEADERS = {
  Investments: ["recordId", "date", "hours", "category", "description", "createdAt", "updatedAt"],
  LearningHistory: ["recordId", "date", "concept", "category", "notes", "createdAt"],
  DailyConcepts: ["recordId", "date", "concept", "category", "notes", "createdAt"]
};

/**
 * Gets the active or referenced spreadsheet and initializes tabs/headers safely.
 */
function getSpreadsheet() {
  var ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      // Standalone script fallback
    }
    if (!ss && SPREADSHEET_ID) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }
  }
  if (!ss) {
    throw new Error("Unable to access Google Spreadsheet. Please provide a valid SPREADSHEET_ID or run as container-bound script.");
  }
  initTabs(ss);
  return ss;
}

/**
 * Initializes tabs and header rows if they do not exist, without overwriting existing data.
 */
function initTabs(ss) {
  var tabConfigs = [
    { name: TAB_INVESTMENTS, headers: HEADERS.Investments },
    { name: TAB_LEARNING_HISTORY, headers: HEADERS.LearningHistory },
    { name: TAB_DAILY_CONCEPTS, headers: HEADERS.DailyConcepts }
  ];

  tabConfigs.forEach(function(config) {
    var sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      sheet.appendRow(config.headers);
      sheet.getRange(1, 1, 1, config.headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else {
      // Check if header row exists
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(config.headers);
        sheet.getRange(1, 1, 1, config.headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
    }
  });
}

/**
 * Helper to build JSON responses with proper MIME type.
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Standard GET handler: retrieves data from the spreadsheet.
 */
function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";

    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Personal Learner Tracker API is active",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getInvestments") {
      return jsonResponse({
        success: true,
        data: getTableData(ss, TAB_INVESTMENTS, HEADERS.Investments)
      });
    }

    if (action === "getLearningHistory") {
      return jsonResponse({
        success: true,
        data: getTableData(ss, TAB_LEARNING_HISTORY, HEADERS.LearningHistory)
      });
    }

    if (action === "getDailyConcepts") {
      var dateFilter = e.parameter.date || null;
      var concepts = getTableData(ss, TAB_DAILY_CONCEPTS, HEADERS.DailyConcepts);
      if (dateFilter) {
        concepts = concepts.filter(function(item) {
          return item.date === dateFilter;
        });
      }
      return jsonResponse({
        success: true,
        data: concepts
      });
    }

    if (action === "getAll") {
      return jsonResponse({
        success: true,
        data: {
          investments: getTableData(ss, TAB_INVESTMENTS, HEADERS.Investments),
          learningHistory: getTableData(ss, TAB_LEARNING_HISTORY, HEADERS.LearningHistory),
          dailyConcepts: getTableData(ss, TAB_DAILY_CONCEPTS, HEADERS.DailyConcepts)
        }
      });
    }

    return jsonResponse({
      success: false,
      error: "Unknown GET action: " + action
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message || error.toString()
    });
  }
}

/**
 * Standard POST handler: handles creates, updates, and deletes with script lock.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for lock
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({
      success: false,
      error: "Server busy. Please try again in a few moments."
    });
  }

  try {
    var ss = getSpreadsheet();
    var payload = {};

    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action;
    if (!action) {
      return jsonResponse({ success: false, error: "Missing 'action' parameter in request" });
    }

    // ────────────────────────────
    // 1. INVESTMENTS CRUD
    // ────────────────────────────
    if (action === "createInvestment") {
      var record = payload.data || payload;
      if (!record.date || record.hours === undefined || record.hours === null || !record.category) {
        return jsonResponse({ success: false, error: "Missing required fields: date, hours, category" });
      }

      var hoursVal = parseFloat(record.hours);
      if (isNaN(hoursVal) || hoursVal <= 0) {
        return jsonResponse({ success: false, error: "Hours must be a positive number" });
      }

      var newRecordId = "inv_" + Utilities.getUuid().slice(0, 8) + "_" + Date.now();
      var nowIso = new Date().toISOString();
      var dateStr = String(record.date).trim();

      var newInvestment = {
        recordId: newRecordId,
        date: dateStr,
        hours: hoursVal,
        category: String(record.category).trim(),
        description: record.description ? String(record.description).trim() : "",
        createdAt: nowIso,
        updatedAt: nowIso
      };

      var sheetInv = ss.getSheetByName(TAB_INVESTMENTS);
      sheetInv.appendRow([
        newInvestment.recordId,
        newInvestment.date,
        newInvestment.hours,
        newInvestment.category,
        newInvestment.description,
        newInvestment.createdAt,
        newInvestment.updatedAt
      ]);

      return jsonResponse({ success: true, data: newInvestment });
    }

    if (action === "updateInvestment") {
      var updateData = payload.data || payload;
      if (!updateData.recordId) {
        return jsonResponse({ success: false, error: "Missing recordId for update" });
      }

      var sheetInv = ss.getSheetByName(TAB_INVESTMENTS);
      var rows = sheetInv.getDataRange().getValues();
      var foundRowIndex = -1;
      var existingRowData = null;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(updateData.recordId)) {
          foundRowIndex = i + 1; // 1-indexed for sheet
          existingRowData = rows[i];
          break;
        }
      }

      if (foundRowIndex === -1) {
        return jsonResponse({ success: false, error: "Investment record not found: " + updateData.recordId });
      }

      var hoursVal = updateData.hours !== undefined ? parseFloat(updateData.hours) : existingRowData[2];
      if (isNaN(hoursVal) || hoursVal <= 0) {
        return jsonResponse({ success: false, error: "Hours must be a positive number" });
      }

      var updatedRecord = {
        recordId: existingRowData[0],
        date: updateData.date ? String(updateData.date).trim() : existingRowData[1],
        hours: hoursVal,
        category: updateData.category ? String(updateData.category).trim() : existingRowData[3],
        description: updateData.description !== undefined ? String(updateData.description).trim() : existingRowData[4],
        createdAt: existingRowData[5], // Preserve original creation timestamp
        updatedAt: new Date().toISOString()
      };

      sheetInv.getRange(foundRowIndex, 1, 1, 7).setValues([[
        updatedRecord.recordId,
        updatedRecord.date,
        updatedRecord.hours,
        updatedRecord.category,
        updatedRecord.description,
        updatedRecord.createdAt,
        updatedRecord.updatedAt
      ]]);

      return jsonResponse({ success: true, data: updatedRecord });
    }

    if (action === "deleteInvestment") {
      var recordId = payload.recordId || (payload.data && payload.data.recordId);
      if (!recordId) {
        return jsonResponse({ success: false, error: "Missing recordId for deletion" });
      }

      var sheetInv = ss.getSheetByName(TAB_INVESTMENTS);
      var rows = sheetInv.getDataRange().getValues();
      var foundRowIndex = -1;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(recordId)) {
          foundRowIndex = i + 1;
          break;
        }
      }

      if (foundRowIndex === -1) {
        return jsonResponse({ success: false, error: "Record not found: " + recordId });
      }

      sheetInv.deleteRow(foundRowIndex);
      return jsonResponse({ success: true, recordId: recordId, message: "Record deleted successfully" });
    }

    // ────────────────────────────
    // 2. LEARNING HISTORY CRUD
    // ────────────────────────────
    if (action === "createLearningEntry") {
      var entry = payload.data || payload;
      if (!entry.date || !entry.concept) {
        return jsonResponse({ success: false, error: "Missing required fields: date, concept" });
      }

      var newRecordId = "lh_" + Utilities.getUuid().slice(0, 8) + "_" + Date.now();
      var nowIso = new Date().toISOString();

      var newEntry = {
        recordId: newRecordId,
        date: String(entry.date).trim(),
        concept: String(entry.concept).trim(),
        category: entry.category ? String(entry.category).trim() : "General",
        notes: entry.notes ? String(entry.notes).trim() : "",
        createdAt: nowIso
      };

      var sheetLH = ss.getSheetByName(TAB_LEARNING_HISTORY);
      sheetLH.appendRow([
        newEntry.recordId,
        newEntry.date,
        newEntry.concept,
        newEntry.category,
        newEntry.notes,
        newEntry.createdAt
      ]);

      return jsonResponse({ success: true, data: newEntry });
    }

    if (action === "deleteLearningEntry") {
      var recordId = payload.recordId || (payload.data && payload.data.recordId);
      if (!recordId) {
        return jsonResponse({ success: false, error: "Missing recordId for deletion" });
      }

      var sheetLH = ss.getSheetByName(TAB_LEARNING_HISTORY);
      var rows = sheetLH.getDataRange().getValues();
      var foundRowIndex = -1;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(recordId)) {
          foundRowIndex = i + 1;
          break;
        }
      }

      if (foundRowIndex === -1) {
        return jsonResponse({ success: false, error: "Learning entry not found: " + recordId });
      }

      sheetLH.deleteRow(foundRowIndex);
      return jsonResponse({ success: true, recordId: recordId, message: "Entry deleted successfully" });
    }

    // ────────────────────────────
    // 3. DAILY CONCEPTS CRUD
    // ────────────────────────────
    if (action === "createDailyConcepts") {
      var conceptsInput = payload.concepts || (payload.data && payload.data.concepts) || [payload.data || payload];
      if (!Array.isArray(conceptsInput) || conceptsInput.length === 0) {
        return jsonResponse({ success: false, error: "Missing or empty concepts list" });
      }

      var sheetDC = ss.getSheetByName(TAB_DAILY_CONCEPTS);
      var createdList = [];
      var rowsToAppend = [];
      var nowIso = new Date().toISOString();

      for (var c = 0; c < conceptsInput.length; c++) {
        var item = conceptsInput[c];
        if (!item.concept || !item.date) {
          continue; // skip invalid empty entries
        }

        var conceptRecord = {
          recordId: "dc_" + Utilities.getUuid().slice(0, 8) + "_" + Date.now() + "_" + c,
          date: String(item.date).trim(),
          concept: String(item.concept).trim(),
          category: item.category ? String(item.category).trim() : "Other",
          notes: item.notes ? String(item.notes).trim() : "",
          createdAt: nowIso
        };

        rowsToAppend.push([
          conceptRecord.recordId,
          conceptRecord.date,
          conceptRecord.concept,
          conceptRecord.category,
          conceptRecord.notes,
          conceptRecord.createdAt
        ]);
        createdList.push(conceptRecord);
      }

      if (rowsToAppend.length === 0) {
        return jsonResponse({ success: false, error: "No valid concepts to save" });
      }

      // Batch append rows
      var startRow = sheetDC.getLastRow() + 1;
      sheetDC.getRange(startRow, 1, rowsToAppend.length, 6).setValues(rowsToAppend);

      return jsonResponse({ success: true, data: createdList });
    }

    if (action === "deleteDailyConcept") {
      var recordId = payload.recordId || (payload.data && payload.data.recordId);
      if (!recordId) {
        return jsonResponse({ success: false, error: "Missing recordId for deletion" });
      }

      var sheetDC = ss.getSheetByName(TAB_DAILY_CONCEPTS);
      var rows = sheetDC.getDataRange().getValues();
      var foundRowIndex = -1;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(recordId)) {
          foundRowIndex = i + 1;
          break;
        }
      }

      if (foundRowIndex === -1) {
        return jsonResponse({ success: false, error: "Daily concept not found: " + recordId });
      }

      sheetDC.deleteRow(foundRowIndex);
      return jsonResponse({ success: true, recordId: recordId, message: "Concept deleted successfully" });
    }

    return jsonResponse({ success: false, error: "Unknown POST action: " + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message || err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to read table rows and map headers into array of objects.
 */
function getTableData(ss, tabName, expectedHeaders) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  var lastCol = expectedHeaders.length;
  if (lastRow <= 1) return []; // Only header or empty

  var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  var values = range.getValues();
  var results = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    // Skip empty rows
    if (!row[0] && !row[1]) continue;

    var obj = {};
    for (var h = 0; h < expectedHeaders.length; h++) {
      var header = expectedHeaders[h];
      var cellVal = row[h];

      // Format date fields consistently as YYYY-MM-DD strings
      if (header === "date" && cellVal instanceof Date) {
        obj[header] = Utilities.formatDate(cellVal, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
      } else if ((header === "createdAt" || header === "updatedAt") && cellVal instanceof Date) {
        obj[header] = cellVal.toISOString();
      } else if (header === "hours") {
        obj[header] = typeof cellVal === "number" ? cellVal : parseFloat(cellVal) || 0;
      } else {
        obj[header] = cellVal !== undefined && cellVal !== null ? String(cellVal) : "";
      }
    }
    results.push(obj);
  }

  return results;
}
