# Decentralized Budget Tracker

A privacy-first, local-first budget tracking application with an intelligent Python machine learning backend and a minimalist Vanilla JS frontend.

---

## Architecture

- **Frontend:** Pure Vanilla JS with IndexedDB for 100% private, browser-local data storage. Styled with a custom "Castle" aesthetic supporting light and dark themes with a header toggle. Features a native CSS category breakdown chart.
- **Backend / ML Engine:** FastAPI monolith serving static assets and ML predictions. Uses **Scikit-Learn** (`RandomForestClassifier` for automated expense categorization and `LinearRegression` for spending forecasting).

---

## Currency Display

- Use the **Currency** dropdown in the header to choose from INR, USD, EUR, GBP or JPY.
- All amounts (transaction list, totals, chart labels, forecast) are formatted with `Intl.NumberFormat` using a matching locale, so grouping and symbols are correct (for example `₹1,00,000` vs `$100,000`). JPY shows with zero decimals automatically.
- The choice persists in `localStorage` (`ledger:currency`) across reloads.
- **Display only — amounts are not converted.** Stored transaction numbers in IndexedDB are never modified; only the rendering changes.
- Future Phase 2 idea: per-transaction currency with manual or `forex-python`-backed exchange rates (not part of Phase 1, no conversion happens yet).

---

## Getting Started

### Prerequisites
- Python 3.10+
- `pip`

### Installation & Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ledger-budget-tracker.git
   cd ledger-budget-tracker
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python main.py
   ```

4. Open your browser at:
   ```text
   http://127.0.0.1:8000
   ```

---

## Running Tests

To run the test suite (unit tests for ML models and FastAPI endpoints):
```bash
python -m pytest -v
```

---

## Contributing

We welcome contributions! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit issues, propose features, and contribute code.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
