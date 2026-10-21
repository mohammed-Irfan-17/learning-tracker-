# Google Apps Script Setup & Deployment Guide

This directory contains the backend Google Apps Script code (`Code.gs`) that powers the **Personal Learner Tracker** with a Google Sheets database.

---

## Step 1: Create a Google Spreadsheet

1. Open your browser and go to: [https://sheets.new](https://sheets.new)
2. Name the spreadsheet: **Personal Learner Tracker Database**
3. (Optional) You can leave the spreadsheet blank. The script will automatically create and format the three required tabs (`Investments`, `LearningHistory`, `DailyConcepts`) on its first run.

---

## Step 2: Open Google Apps Script

1. In the Google Sheet menu, click **Extensions** > **Apps Script**.
2. Rename the Apps Script project to **Personal Learner Tracker API**.
3. In the left files list, select `Code.gs`.
4. Delete any template code, and copy the full contents of `apps-script/Code.gs` into `Code.gs`.
5. Click the floppy disk icon (**Save project**) or press `Ctrl + S`.

---

## Step 3: Deploy as a Web App

1. In the upper-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the fields:
   - **Description**: `Personal Learner Tracker API v1`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Note: This allows your frontend React web application running in your browser to make GET and POST requests to the script without complex OAuth redirects)*.
4. Click **Deploy**.
5. When prompted with **Authorization required**:
   - Click **Authorize access**.
   - Select your Google account.
   - Click **Advanced** > **Go to Personal Learner Tracker API (unsafe)** (standard Google Apps Script prompt for custom user scripts).
   - Click **Allow**.
6. Once deployed, copy the **Web App URL** (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Step 4: Configure the Frontend

You can configure the URL in two ways:

### Option A: Using `.env` (Recommended for development & production)
In the project root, edit `.env`:
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```

### Option B: In the Web Application UI
When you open the web application at `http://localhost:5173/`, you can paste your Web App URL into the **API Connection Settings** banner and click **Save & Test Connection**.

---

## Database Schema Reference

The script initializes and maintains 3 sheets:

### 1. `Investments`
| Column | Type | Description |
|---|---|---|
| `recordId` | string | Unique record ID (e.g. `inv_...`) |
| `date` | string (YYYY-MM-DD) | Date of study |
| `hours` | number | Invested hours (positive number) |
| `category` | string | Java, DSA, SQL, Frontend, etc. |
| `description` | string | Details of work completed |
| `createdAt` | ISO 8601 string | Creation timestamp |
| `updatedAt` | ISO 8601 string | Last modified timestamp |

### 2. `LearningHistory`
| Column | Type | Description |
|---|---|---|
| `recordId` | string | Unique record ID (e.g. `lh_...`) |
| `date` | string (YYYY-MM-DD) | Date of study |
| `concept` | string | Concept or topic learned |
| `category` | string | Category |
| `notes` | string | Detailed notes or insights |
| `createdAt` | ISO 8601 string | Creation timestamp |

### 3. `DailyConcepts`
| Column | Type | Description |
|---|---|---|
| `recordId` | string | Unique record ID (e.g. `dc_...`) |
| `date` | string (YYYY-MM-DD) | Date of study |
| `concept` | string | Concept or topic learned |
| `category` | string | Category |
| `notes` | string | Notes |
| `createdAt` | ISO 8601 string | Creation timestamp |
