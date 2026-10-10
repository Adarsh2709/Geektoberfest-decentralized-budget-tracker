from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline

# Seed training data
X_train = [
    "starbucks coffee", "mcdonalds lunch", "grocery store", "supermarket food",
    "apartment rent", "monthly lease", "electricity bill", "water utility",
    "uber ride", "gas station fuel", "subway ticket", "movie ticket",
    "netflix subscription", "spotify music", "amazon shopping", "clothing store"
]
y_train = [
    "Food", "Food", "Food", "Food",
    "Housing", "Housing", "Utilities", "Utilities",
    "Transport", "Transport", "Transport", "Entertainment",
    "Entertainment", "Entertainment", "Shopping", "Shopping"
]

model = make_pipeline(CountVectorizer(), RandomForestClassifier(n_estimators=10, random_state=42))
model.fit(X_train, y_train)

def classify_expense(description: str) -> str:
    if not description or not description.strip():
        return "General"
    prediction = model.predict([description.lower()])
    return prediction[0]
