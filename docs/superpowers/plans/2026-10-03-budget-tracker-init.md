# Decentralized Budget Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a privacy-first, local-only budget tracker with Vanilla JS and Python ML.

**Architecture:** A monolithic FastAPI server serving a Vanilla JS frontend that stores data in the browser's IndexedDB and calls local Python endpoints for ML tasks.

**Tech Stack:** FastAPI, Scikit-Learn, Vanilla JS, IndexedDB.

**Spec:** `docs/superpowers/specs/2026-10-03-decentralized-budget-tracker.md`

## Global Constraints
- **Privacy:** Data MUST stay local; no external DBs or cloud sync.
- **Frontend:** Pure Vanilla JS; no frameworks (React/Vue/etc).
- **ML:** Scikit-Learn (RandomForest and LinearRegression).
- **Setup:** Single command `python main.py` must start the app.

## Review Focus
- **Empty State:** How the UI looks when IndexedDB is empty.
- **ML Data Minimums:** Backend behavior when < 2 months of data is provided for forecasting.
- **Storage Limits:** Browser warnings/behavior if IndexedDB hits quota.
- **Category Mismatch:** Backend return value when classification confidence is low.
- **Port Conflict:** Error handling if port 8000 is taken by another process.

---

### Task 1: Scaffolding and Project DNA

**Files:**
- Create: `main.py`
- Create: `requirements.txt`
- Create: `GEMINI.md`
- Create: `static/index.html`
- Create: `static/style.css`
- Create: `static/app.js`

- [ ] **Step 1: Create `GEMINI.md` with project mandates**
Include Vanilla JS requirement, local-first mandate, and Python ML bridge pattern.

- [ ] **Step 2: Create `requirements.txt`**
Add `fastapi`, `uvicorn`, `scikit-learn`, `pandas`.

- [ ] **Step 3: Create a basic FastAPI skeleton in `main.py`**
Serve `static/` directory and include a root redirect to `index.html`.

- [ ] **Step 4: Create a "Hello World" Vanilla JS frontend**
Verify the server runs and the page loads.

- [ ] **Step 5: Commit**
`git add . && git commit -m "chore: initial project scaffolding"`

---

### Task 2: Machine Learning Engine (Classification)

**Files:**
- Create: `ml/classifier.py`
- Create: `ml/data/categories.json` (Seed data)
- Test: `tests/test_ml.py`

**Interfaces:**
- Produces: `classify_expense(description: str) -> str`

- [ ] **Step 1: Write a test for categorization**
Assert "Starbucks" returns "Food" and "Rent" returns "Housing".

- [ ] **Step 2: Implement `RandomForestClassifier` in `ml/classifier.py`**
Train on a small set of common strings (Food, Rent, Transport, Entertainment).

- [ ] **Step 3: Run tests**
`pytest tests/test_ml.py`

- [ ] **Step 4: Commit**
`git add ml/ tests/ && git commit -m "feat: add expense classification model"`

---

### Task 3: Machine Learning Engine (Forecasting)

**Files:**
- Modify: `ml/forecaster.py`
- Test: `tests/test_ml.py`

**Interfaces:**
- Produces: `forecast_next_month(monthly_totals: List[float]) -> float`

- [ ] **Step 1: Write a test for forecasting**
Assert `[100, 110, 120]` returns approximately `130`.

- [ ] **Step 2: Implement `LinearRegression` in `ml/forecaster.py`**
Handle cases with < 2 data points by returning the average.

- [ ] **Step 3: Run tests**
`pytest tests/test_ml.py`

- [ ] **Step 4: Commit**
`git commit -m "feat: add spending forecasting model"`

---

### Task 4: FastAPI API Endpoints

**Files:**
- Modify: `main.py`
- Test: `tests/test_api.py`

**Interfaces:**
- Consumes: `ml/classifier.py`, `ml/forecaster.py`
- Produces: `POST /classify`, `POST /forecast`

- [ ] **Step 1: Implement `/classify` endpoint**
Accepts `{ "description": "string" }`, returns `{ "category": "string" }`.

- [ ] **Step 2: Implement `/forecast` endpoint**
Accepts `{ "history": [1, 2, 3] }`, returns `{ "forecast": 4.0 }`.

- [ ] **Step 3: Verify with `curl` or automated test**
`pytest tests/test_api.py`

- [ ] **Step 4: Commit**
`git commit -m "feat: expose ML models via FastAPI"`

---

### Task 5: Frontend - IndexedDB & UI Shell

**Files:**
- Modify: `static/index.html`
- Modify: `static/app.js`
- Modify: `static/style.css`

- [ ] **Step 1: Implement IndexedDB wrapper in `app.js`**
Functions for `addTransaction`, `getTransactions`, `deleteTransaction`.

- [ ] **Step 2: Build the UI Shell (Castle Design)**
Header, Transaction List, and "Add Expense" Form. Use distinctive typography.

- [ ] **Step 3: Connect Form to IndexedDB**
Verify transactions persist after page refresh.

- [ ] **Step 4: Commit**
`git commit -m "feat: local storage and UI shell"`

---

### Task 6: Integration & Budget Advisor

**Files:**
- Modify: `static/app.js`
- Modify: `static/index.html`

- [ ] **Step 1: Auto-classify on entry**
When an expense is added, call `/classify` and update the category field.

- [ ] **Step 2: Implement Forecast View**
A chart or list showing predicted next month's spend.

- [ ] **Step 3: Budget Advice Engine**
Compare forecast to a user-set limit and display suggestions (e.g. "Warning: Over budget").

- [ ] **Step 4: Final Verification**
Manual end-to-end flow: Add expense -> Suggestion appears -> Refresh -> Data remains.

- [ ] **Step 5: Commit**
`git commit -m "feat: full integration and budget advisor"`
