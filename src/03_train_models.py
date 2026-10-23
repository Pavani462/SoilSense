import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "dataset1.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

FEATURES = ["N", "P", "K", "pH"]
TARGET = "Output"

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Random Forest
rf = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)
rf.fit(X_train, y_train)

# Gradient Boosting
gb = GradientBoostingClassifier(
    random_state=42
)
gb.fit(X_train, y_train)

joblib.dump(rf, MODEL_DIR / "random_forest.pkl")
joblib.dump(gb, MODEL_DIR / "gradient_boosting.pkl")

print("Models trained and saved.")
print(f"Saved: {MODEL_DIR / 'random_forest.pkl'}")
print(f"Saved: {MODEL_DIR / 'gradient_boosting.pkl'}")
