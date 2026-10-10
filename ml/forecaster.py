import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List

def forecast_next_month(monthly_totals: List[float]) -> float:
    if not monthly_totals:
        return 0.0
    if len(monthly_totals) == 1:
        return float(monthly_totals[0])
    
    X = np.array(range(len(monthly_totals))).reshape(-1, 1)
    y = np.array(monthly_totals)
    
    model = LinearRegression()
    model.fit(X, y)
    
    next_x = np.array([[len(monthly_totals)]])
    forecast = model.predict(next_x)[0]
    return max(0.0, float(forecast))
