"""Static checks for Phase 1 currency display formatting (no backend needed)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "static" / "index.html"
JS = ROOT / "static" / "app.js"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def test_currency_dropdown_has_required_currencies():
    html = read(HTML)
    assert 'id="currency-select"' in html
    for code in ("INR", "USD", "EUR", "GBP", "JPY"):
        assert f'value="{code}"' in html, f"missing currency option {code}"


def test_display_only_note_present():
    html = read(HTML)
    assert "currency-note" in html
    lowered = html.lower()
    assert "display only" in lowered
    assert "does not convert" in lowered or "not convert" in lowered


def test_formatter_uses_intl_numberformat():
    js = read(JS)
    assert "Intl.NumberFormat" in js
    assert "formatAmount" in js
    assert "SUPPORTED_CURRENCIES" in js
    assert "ledger:currency" in js
    # Zero-decimal handling: JPY must be supported and use locale-based formatting
    # (Intl auto-selects 0 fraction digits for JPY).
    assert "JPY" in js
    assert "ja-JP" in js


def test_all_render_sites_use_formatter():
    js = read(JS)
    # No leftover hardcoded dollar formatting for amounts.
    assert "${tx.amount.toFixed" not in js
    assert "${total.toFixed" not in js
    assert "${amt.toFixed" not in js
    assert "${data.forecast.toFixed" not in js
    assert "formatAmount(tx.amount)" in js
    assert "formatAmount(total)" in js
    assert "formatAmount(amt)" in js
    assert "formatAmount(data.forecast)" in js
    assert "formatAmount(0)" in js


def test_storage_is_display_only():
    js = read(JS)
    # Amounts are still stored as plain numbers; currency applies only at render.
    assert "await addTransaction({ description, amount, category, date });" in js
    assert "localStorage.getItem" in js and "ledger:currency" in js
    # Amount label/step syncs with currency without changing stored data.
    assert "amount-label" in js
