# Design Spec: Decentralized Budget Tracker (Local-First)

## Overview
A privacy-first, local-only budget tracking application. It uses the browser's IndexedDB for all persistent storage and a local Python (FastAPI) server as a stateless engine for machine learning predictions (classification and forecasting).

## Goals
- **Privacy:** Data never leaves the user's machine (except for local ML processing).
- **Simplicity:** Vanilla JS frontend for a lightweight, "castle-grade" UI.
- **Intelligence:** Automated expense categorization and future spending forecasts.
- **Open Source:** Clean, documented structure ready for community contributions.

## Architecture (Option 1: Monolithic FastAPI Bridge)
The application is structured as a single Python process that serves the frontend and provides ML endpoints.

### Components
1.  **Backend (Python/FastAPI):**
    *   Serves static files from `/static`.
    *   `POST /classify`: Takes a list of transaction descriptions and returns suggested categories.
    *   `POST /forecast`: Takes historical monthly totals and returns a linear regression forecast.
    *   `GET /suggestions`: Returns budget advice based on current forecasts.
2.  **Frontend (Vanilla JS):**
    *   `index.html`: Shell for the UI.
    *   `app.js`: Logic for IndexedDB interactions and UI updates.
    *   `style.css`: High-quality "Castle" design (distinctive typography, cohesive colors).
3.  **Storage (IndexedDB):**
    *   Stores `transactions` {id, date, amount, description, category}.
    *   Stores `settings` {budget_limit, theme}.

## ML Strategy
- **Classification:** Uses a `RandomForestClassifier` (Scikit-Learn) trained on a small, local dataset (or pre-trained on a generic one) to map descriptions to categories (e.g., "Starbucks" -> "Food").
- **Forecasting:** Uses `LinearRegression` (Scikit-Learn) to predict next month's total spending based on the last 6-12 months of data.

## Data Flow
1.  User enters an expense in the UI.
2.  Frontend saves to IndexedDB.
3.  Frontend requests classification from `/classify` (local).
4.  User views "Forecast" tab; Frontend sends aggregated data to `/forecast` (local).
5.  Backend returns predictions; Frontend renders them.

## Open Source Readiness
- **License:** MIT.
- **Issues:** GitHub issue templates for "New Model Request" or "UI Improvement".
- **Setup:** `pip install -r requirements.txt && python main.py`.

## Success Criteria
- [ ] App loads and saves transactions entirely offline (IndexedDB).
- [ ] `/classify` suggests the correct category for 80% of common expenses.
- [ ] UI is responsive and follows the "Castle" design principles.
- [ ] No external database or cloud account required.
