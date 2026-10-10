from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import List
from ml.classifier import classify_expense
from ml.forecaster import forecast_next_month

app = FastAPI(title="Decentralized Budget Tracker")

class ClassifyRequest(BaseModel):
    description: str

class ForecastRequest(BaseModel):
    history: List[float]

@app.post("/classify")
def classify(req: ClassifyRequest):
    category = classify_expense(req.description)
    return {"category": category}

@app.post("/forecast")
def forecast(req: ForecastRequest):
    predicted = forecast_next_month(req.history)
    return {"forecast": predicted}

@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
