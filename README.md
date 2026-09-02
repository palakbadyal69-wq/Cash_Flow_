# CashFlowAI — Agentic AI Financial Controller (MVP) 🚀

Submitted for the **Razorpay AI Buildathon** (*AI Finance Controller Track*).

**CashFlowAI** is an autonomous AI financial controller designed for startup founders. Unlike traditional accounting tools that merely present historical charts, CashFlowAI calculates real metrics, evaluates solvency risk rules, tracks working capital receivables and payables in ₹ INR, and invokes Anthropic's Claude API (`claude-sonnet-4-6`) to make explicit, reasoned financial decisions.

---

## 🎯 Problem Statement

Startups rarely fail because of product flaws — they fail because they **run out of money unexpectedly**.
1. **Accelerating Burn Blindspots**: Founders track historical spend without realizing how rapidly variable cloud infrastructure and marketing expenses compound month-over-month.
2. **Receivables Working Capital Crises**: Overdue customer invoices (e.g., 20+ day payment delays on key enterprise clients) create sudden payroll liquidity shortages.
3. **Passive Financial Dashboards**: Accounting software displays graphs but provides zero actionable strategic guidance.

CashFlowAI solves this by acting as an **autonomous AI CFO**: it computes real metrics deterministically, detects solvency stress signals, and delivers a concrete verdict (e.g. `CHASE RECEIVABLES`, `CUT SPEND`, `RAISE CAPITAL`) backed by explicit ₹ INR figures.

---

## 🏗️ Architecture: The 6-Step Agentic Reasoning Chain

CashFlowAI enforces a strict boundary between **deterministic financial computation** and **LLM reasoning**. The AI model never guesses numbers; it reasons strictly from calculated signals.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CashFlowAI 6-Step Agent Pipeline                     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
 1. parseData ─────────────────────► Ingests transactions.json & balance.json
                                   │
 2. computeMetrics ────────────────► Calculates Net Flow, Burn Rate, Runway, 
                                   │  Receivables (daysOverdue) & Payables
                                   │
 3. detectRisks ───────────────────► Evaluates 5 deterministic solvency rules:
                                   │  - Accelerated Burn Rate (MoM trend)
                                   │  - Runway Below 6 Months
                                   │  - Overdue Receivables Amount at Risk
                                   │  - Large Imminent Vendor Payables
                                   │  - High Customer Concentration (>40%)
                                   │
 4. computeHealthIndicator ────────► Assigns 🟢 / 🟡 / 🔴 status deterministically
                                   │
 5. decideRecommendation ──────────► [ONLY LLM CALL] Sends computed JSON to Claude API
                                   │  Returns structured JSON decision & numeric reasoning
                                   │
 6. generateReport ────────────────► Compiles unified dashboard payload & logs steps
```

---

## ⚡ MVP Scope: Built vs. Planned Next

### What's Built (Hackathon MVP):
- ✅ **Deterministic 6-Step Pipeline**: Full separation of metric calculation from LLM decision making.
- ✅ **Solvency Health Banner**: 🟢 Healthy, 🟡 Caution, 🔴 Critical status indicators.
- ✅ **Metric Cards Row**: Cash Balance (₹), Total Received (₹), Total Spent (₹), Net Cash Flow (₹), Monthly Burn Rate (₹/mo), and Runway (Months).
- ✅ **AI Verdict Centerpiece**: Action chip (`CHASE RECEIVABLES`, `CUT SPEND`, `RAISE NOW`, `DELAY HIRING`, `RENEGOTIATE PAYABLES`), confidence badge, numeric reasoning, and priority risk tags.
- ✅ **Risk Flag List**: Severity-badged risk cards detailing ₹ amounts at risk.
- ✅ **Recharts Cash Flow Line**: Interactive historical balance trend + forward projection curve.
- ✅ **Receivables & Payables Ledger**: Side-by-side tables for tracking incoming customer payments and vendor payables with overdue rows highlighted in red.
- ✅ **Record Entry Modal**: REST `POST /api/transactions` endpoint to add live income/expense entries and automatically update cash balance.

### Planned Next (Post-Hackathon Roadmap):
- 🔮 **Scenario Planning & What-If Sandbox**: Interactive sliders to simulate hiring 3 developers or reducing marketing by 30%.
- 🔮 **Budget vs. Actual Variance Tracking**: Target budget limits per category with automated drift alerts.
- 🔮 **Automated WhatsApp / Email Alerts**: Trigger instant Razorpay payment collection reminders to clients with overdue invoices.
- 🔮 **Multi-Currency Support**: Instant USD/EUR to INR conversion for international SaaS revenue streams.
- 🔮 **Bank API Integration**: Direct read-only Open Banking / RazorpayX API sync for real-time transaction ingestion.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

> **IMPORTANT**: The backend server and frontend client MUST both be running **simultaneously in two separate terminal windows** for the application to function.

### Step 1: Install Dependencies
In the root directory (or in both `/server` and `/client` folders):
```bash
npm run install-all
```

### Step 2: Configure Environment Variables
Copy `server/.env.example` to `server/.env` and add your Anthropic API Key:
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```env
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=5000
```
*(Note: If `ANTHROPIC_API_KEY` is omitted or unset, CashFlowAI will log a startup warning and use a deterministic fallback decision generator with an explicit warning badge in the UI).*

### Step 3: Start Backend & Frontend Simultaneously

**Terminal 1 (Backend Server)**:
```bash
cd server
npm start
```
*App starts on [http://localhost:5000](http://localhost:5000).*

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
```
*(Alternatively, run `npm run preview` after `npm run build` as Vite proxy configs are set for both dev & preview).*

### Step 4: Access the Dashboard
Open your browser to: **[http://localhost:5173](http://localhost:5173)** (or [http://localhost:4173](http://localhost:4173) for preview mode).

---

## 🔧 Troubleshooting & Common Errors

### `EADDRINUSE: address already in use :::5000`
This occurs when another process (or a previous background instance) is already listening on port 5000.

**To resolve**:
1. **Find and stop the old process**:
   - **Windows**: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F` (or run `npx kill-port 5000`)
   - **Mac/Linux**: `lsof -i :5000` then `kill -9 <pid>`
2. **Or run backend on a different port**:
   ```bash
   PORT=5001 npm start
   ```
   *(If running on port 5001, update target in `client/vite.config.js` to match).*

---

## 🛠️ Project Structure

```
cashflowai/
  server/
    index.js                         # Express server & API endpoints (GET /api/dashboard, GET/POST /api/transactions)
    .env.example                     # Environment template (ANTHROPIC_API_KEY, PORT)
    .gitignore                       # Git ignore enforcing .env non-committal
    pipeline/
      parseData.js                   # Step 1: Load transactions & balance
      computeMetrics.js              # Step 2: Compute net flow, burn, runway, receivables, payables
      detectRisks.js                 # Step 3: Rule-based solvency risk detection
      computeHealthIndicator.js      # Step 4: Deterministic 🟢/🟡/🔴 status
      decideRecommendation.js        # Step 5: Isolated LLM decision engine (Claude API)
      generateReport.js              # Step 6: Pipeline orchestrator & logging
    data/
      transactions.json              # 6-month seed transactions in INR
      balance.json                   # Cash balance seed (₹25,00,000)
  client/
    vite.config.js                   # Vite config with /api proxy for dev & preview
    src/
      App.jsx                        # Main dashboard entry with connection error handling
      components/
        HealthBanner.jsx             # Top 🟢/🟡/🔴 health banner
        MetricCards.jsx              # 6 primary financial metric cards
        RecommendationCard.jsx       # AI Agent Verdict centerpiece card (with fallback indicator)
        RiskList.jsx                 # Badged risk flags list
        ForecastChart.jsx            # Recharts cash flow trend line
        ReceivablesPayablesTable.jsx # Receivables & payables ledger tables
        AddTransactionForm.jsx       # Modal to record new transactions
  README.md
```

---

## 📝 What Broke During Development

- [x] *Handled Vite dev vs. preview proxy discrepancy by mirroring `/api` proxy rule under `preview` block in `vite.config.js`.*
- [x] *Improved client connection failure diagnostics in `App.jsx` to explicitly prompt user when backend server is offline.*
- [x] *Added explicit fallback status and `fallbackReason` field in `decideRecommendation.js` so missing API keys produce clear visual feedback.*
- [x] *Added graceful `server.on('error')` handling for `EADDRINUSE` port conflicts on server startup.*

---

*Built with ❤️ for the Razorpay AI Buildathon.*
