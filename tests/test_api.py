from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (301, 302, 307, 308)
    assert "/static/index.html" in response.headers["location"]

def test_classify_endpoint():
    response = client.post("/classify", json={"description": "apartment rent"})
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Housing"

def test_forecast_endpoint():
    response = client.post("/forecast", json={"history": [100.0, 110.0, 120.0]})
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert data["forecast"] > 120.0

def test_static_theme_elements():
    response = client.get("/static/index.html")
    assert response.status_code == 200
    html = response.text
    assert 'id="theme-toggle"' in html
    assert 'data-theme' in html


def test_static_currency_elements():
    response = client.get("/static/index.html")
    assert response.status_code == 200
    html = response.text
    assert 'id="currency-select"' in html
    for code in ("INR", "USD", "EUR", "GBP", "JPY"):
        assert f'value="{code}"' in html
    assert 'id="rate-status"' in html

    js_response = client.get("/static/app.js")
    assert js_response.status_code == 200
    js = js_response.text
    assert "Intl.NumberFormat" in js
    assert "formatBaseAmount" in js
    assert "ledger:currency" in js
    assert "/rates?base=" in js


def test_rates_endpoint_live():
    import main as main_module

    main_module._RATES_CACHE.clear()
    response = client.get("/rates?base=USD")
    assert response.status_code == 200
    data = response.json()
    assert data["base"] == "USD"
    for code in ("INR", "USD", "EUR", "GBP", "JPY"):
        assert code in data["rates"]
        assert float(data["rates"][code]) > 0
    assert float(data["rates"]["USD"]) == 1.0
    # Sanity: 100 USD converts to thousands of INR/JPY, not 100.
    assert float(data["rates"]["INR"]) * 100 > 1000
    assert float(data["rates"]["JPY"]) * 100 > 1000


def test_rates_invalid_base_falls_back_to_usd():
    response = client.get("/rates?base=XXX")
    assert response.status_code == 200
    assert response.json()["base"] == "USD"

