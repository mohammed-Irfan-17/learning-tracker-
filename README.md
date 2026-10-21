# 📚 Personal Learner Tracker

A modern, responsive full-stack Personal Learner Tracker web application built with **React**, **Vite**, **Recharts**, and live **Google Sheets** persistence via **Google Apps Script**.

---

## 🌟 Overview & Key Capabilities

The **Personal Learner Tracker** provides a centralized dashboard to log, analyze, and review daily learning activities:

1. **Main Dashboard**:
   - Live KPI summary cards: **Today's Hours**, **Current Month's Hours**, and **Total Accumulated Hours**.
   - **Monthly Learning Investment Graph**: Responsive Recharts line chart with connected red line and circular markers, month/year picker, automatic calendar aggregation, and tooltip inspection.
   - **Quick Actions**: One-click modals to log study sessions or record daily concepts.
   - **Recent Activity Feed**: Real-time snapshot of latest investments and learned concepts.

2. **Daily Investment Tracker**:
   - Log hours across key categories (*Java*, *Data Structures & Algorithms*, *SQL / Database*, *Spring Boot / Backend*, *Frontend Development*, *Project Development*, *Other*).
   - Filter records by category, exact date, or search terms.
   - In-place Edit and Delete workflows with confirmation modals and optimistic UI updates.
   - Responsive layout: clean table on desktop and card layout on mobile.

3. **Learning History**:
   - Independent knowledge log tracking concepts, frameworks, and insights over time.
   - Filter by category, date, or full-text search across concept names and notes.

4. **Everyday Learning Concepts**:
   - Fast modal to capture single or multiple concepts studied on any calendar date.
   - Batch persistence into the dedicated `DailyConcepts` spreadsheet tab.

5. **Direct Google Sheets Persistence**:
   - Real-time cloud storage in Google Sheets.
   - No mock data source — every displayed record and graph point is powered by live sheet data.

---

## 🛠️ Technology Stack

- **Frontend**: React 19
- **Build Tool**: Vite 8
- **Language**: JavaScript (ES Modules)
- **Styling**: Plain CSS (Custom Design Tokens, Navy/Dark Blue Theme)
- **Visualization**: Recharts 3
- **Database**: Google Sheets (3 initialized tabs: `Investments`, `LearningHistory`, `DailyConcepts`)
- **API Backend**: Google Apps Script Web App (`doGet`, `doPost`)
- **Version Control**: Git

---

## 📁 Project Structure

```text
personal-learner-tracker/
├── apps-script/
│   ├── Code.gs                # Complete Google Apps Script backend source code
│   └── README.md              # Apps Script setup & deployment step-by-step
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx   # Deletion confirmation modal
│   │   ├── DailyConceptsModal.jsx # Multi-concept logging modal
│   │   ├── InvestmentModal.jsx    # Investment create & edit modal
│   │   ├── LearningHistoryModal.jsx # Learning entry modal
│   │   ├── MonthlyChart.jsx   # Recharts connected red line graph
│   │   ├── Navbar.jsx         # Header, navigation tabs, connection status pill
│   │   ├── SetupBanner.jsx    # Alert banner when Google Sheets connection is needed
│   │   ├── SetupModal.jsx     # In-app connection tester & configuration modal
│   │   ├── SummaryCards.jsx   # Today, Month, All-time summary KPI cards
│   │   └── Toast.jsx          # Notification toast system
│   ├── pages/
│   │   ├── DashboardPage.jsx  # Main landing dashboard
│   │   ├── InvestmentsPage.jsx# Full table/card investment management
│   │   └── LearningHistoryPage.jsx # Persistent concept repository
│   ├── services/
│   │   ├── api.js             # Google Apps Script Web App API client
│   │   └── storageConfig.js   # URL configuration (env & localStorage)
│   ├── utils/
│   │   ├── constants.js       # Categories, palette colors, storage keys
│   │   └── dateUtils.js       # Timezone-safe calculations & monthly aggregations
│   ├── App.css                # Polished theme stylesheet
│   ├── App.jsx                # Root application coordinator
│   ├── index.css              # Design tokens, typography, resets
│   └── main.jsx               # Entrypoint
├── .env.example               # Template environment configuration
├── index.html                 # App shell HTML
├── package.json
└── vite.config.js
```

---

## 🚀 Local Installation & Running

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variable (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your Google Apps Script Web App deployment URL:
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```
*(Note: You can also configure or test the URL directly in the web UI at any time via the "Setup Sheets" pill in the header).*

### 3. Start Development Server
```bash
npm run dev
```
Open your browser to: **[http://localhost:5173/](http://localhost:5173/)**

### 4. Build for Production
```bash
npm run build
```

---

## 📊 Google Sheets & Apps Script Setup

### Step 1: Create Spreadsheet
1. Create a new Google Spreadsheet at [https://sheets.new](https://sheets.new).
2. Name it **Personal Learner Tracker Database**.

### Step 2: Paste Apps Script
1. Click **Extensions** > **Apps Script**.
2. Replace all code in `Code.gs` with the provided code in [`apps-script/Code.gs`](apps-script/Code.gs).
3. Save the script (`Ctrl + S`).

### Step 3: Deploy as Web App
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Set:
   - **Execute as**: `Me (your Google account)`
   - **Who has access**: `Anyone`
4. Click **Deploy** and authorize permissions when prompted.
5. Copy the generated **Web App URL** (`https://script.google.com/macros/s/.../exec`).

### Step 4: Connect
- Paste the URL into `.env` or paste it directly in the app's **Setup Sheets** modal and click **Save & Connect**.
- The script automatically verifies and creates the three spreadsheet tabs:
  - `Investments` (`recordId`, `date`, `hours`, `category`, `description`, `createdAt`, `updatedAt`)
  - `LearningHistory` (`recordId`, `date`, `concept`, `category`, `notes`, `createdAt`)
  - `DailyConcepts` (`recordId`, `date`, `concept`, `category`, `notes`, `createdAt`)

---

## 🧪 Testing Performed

- **Build & Compilation**: Verified zero errors with Vite 8.3.4.
- **Linting & Code Quality**: Verified with Oxlint.
- **Date & Aggregation Utilities**: Verified leap year calculations (e.g. Feb 29 in 2024, Feb 28 in 2026), full month calendar day generation, zero-hour day preservation, and multi-entry summation on identical dates.
- **Responsive Layout**: Verified table layout on desktop screens and responsive cards on mobile viewports.
- **API Error & Loading States**: Verified friendly error handling and setup instructions when unconfigured or offline.
