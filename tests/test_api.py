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
