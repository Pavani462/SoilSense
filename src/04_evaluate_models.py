import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "dataset1.csv"
MODEL_DIR = BASE_DIR / "models"
RESULT_DIR = BASE_DIR / "results" / "metrics"
RESULT_DIR.mkdir(parents=True, exist_ok=True)

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

models = {
    "Random Forest": joblib.load(MODEL_DIR / "random_forest.pkl"),
    "Gradient Boosting": joblib.load(MODEL_DIR / "gradient_boosting.pkl")
}

results = []

for name, model in models.items():
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, average="weighted", zero_division=0)
    recall = recall_score(y_test, predictions, average="weighted", zero_division=0)
    f1 = f1_score(y_test, predictions, average="weighted", zero_division=0)

    results.append({
        "Model": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1-Score": f1
    })

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)
    print(classification_report(
        y_test,
        predictions,
        target_names=["Less Fertile", "Fertile", "Highly Fertile"],
        zero_division=0
    ))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

results_df = pd.DataFrame(results)
results_df.to_csv(RESULT_DIR / "model_comparison.csv", index=False)

print("\nMODEL COMPARISON")
print(results_df.to_string(index=False))

best_model = results_df.loc[results_df["F1-Score"].idxmax(), "Model"]
print(f"\nModel selected for the next stage based on weighted F1-score: {best_model}")
print("\nThe selection above is generated from the actual test results.")
