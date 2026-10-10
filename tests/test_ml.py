from ml.classifier import classify_expense
from ml.forecaster import forecast_next_month

def test_classifier():
    assert classify_expense("starbucks coffee") == "Food"
    assert classify_expense("apartment rent") == "Housing"
    assert classify_expense("electricity bill") == "Utilities"
    assert classify_expense("") == "General"

def test_forecaster():
    history = [100.0, 110.0, 120.0]
    forecast = forecast_next_month(history)
    assert forecast > 120.0

    assert forecast_next_month([50.0]) == 50.0
    assert forecast_next_month([]) == 0.0
