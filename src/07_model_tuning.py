import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# ---------------------------------------------------------
# 1. Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = BASE_DIR / "data" / "dataset1.csv"
MODEL_DIR = BASE_DIR / "models"
RESULT_DIR = BASE_DIR / "results" / "metrics"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# 2. Load dataset
# ---------------------------------------------------------

df = pd.read_csv(DATA_PATH)

FEATURES = [
    "N",
    "P",
    "K",
    "pH",
    "EC",
    "OC",
    "S",
    "Zn",
    "Fe",
    "Cu",
    "Mn",
    "B"
]

TARGET = "Output"

X = df[FEATURES]
y = df[TARGET]


# ---------------------------------------------------------
# 3. Train-test split
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("=" * 70)
print("RANDOM FOREST HYPERPARAMETER TUNING")
print("=" * 70)

print(f"Training samples : {len(X_train)}")
print(f"Testing samples  : {len(X_test)}")
print(f"Features         : {len(FEATURES)}")


# ---------------------------------------------------------
# 4. Random Forest
# ---------------------------------------------------------

rf = RandomForestClassifier(
    random_state=42,
    class_weight="balanced"
)


# ---------------------------------------------------------
# 5. Hyperparameter grid
# ---------------------------------------------------------

param_grid = {
    "n_estimators": [100, 200, 300],
    "max_depth": [None, 5, 10, 15, 20],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf": [1, 2, 4],
    "max_features": ["sqrt", "log2"]
}


# ---------------------------------------------------------
# 6. Stratified Cross Validation
# ---------------------------------------------------------

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ---------------------------------------------------------
# 7. Grid Search
# ---------------------------------------------------------

grid_search = GridSearchCV(
    estimator=rf,
    param_grid=param_grid,
    scoring="f1_weighted",
    cv=cv,
    n_jobs=-1,
    verbose=1
)

print("\nStarting 5-fold stratified cross-validation...")
print("The test set will remain untouched during tuning.")

grid_search.fit(X_train, y_train)


# ---------------------------------------------------------
# 8. Best parameters
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("BEST PARAMETERS")
print("=" * 70)

print(grid_search.best_params_)

print(
    f"\nBest cross-validation weighted F1: "
    f"{grid_search.best_score_:.4f}"
)


# ---------------------------------------------------------
# 9. Evaluate final tuned model
# ---------------------------------------------------------

best_model = grid_search.best_estimator_

predictions = best_model.predict(X_test)


accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

weighted_f1 = f1_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

macro_f1 = f1_score(
    y_test,
    predictions,
    average="macro",
    zero_division=0
)


# ---------------------------------------------------------
# 10. Display results
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("TUNED RANDOM FOREST - FINAL TEST RESULTS")
print("=" * 70)

print(f"Accuracy        : {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Precision       : {precision:.4f}")
print(f"Recall          : {recall:.4f}")
print(f"Weighted F1     : {weighted_f1:.4f}")
print(f"Macro F1        : {macro_f1:.4f}")


# ---------------------------------------------------------
# 11. Classification report
# ---------------------------------------------------------

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Less Fertile",
            "Fertile",
            "Highly Fertile"
        ],
        zero_division=0
    )
)


# ---------------------------------------------------------
# 12. Confusion matrix
# ---------------------------------------------------------

print("Confusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ---------------------------------------------------------
# 13. Save tuned model
# ---------------------------------------------------------

model_path = (
    MODEL_DIR /
    "tuned_random_forest_12_features.pkl"
)

joblib.dump(
    best_model,
    model_path
)

print("\nTuned model saved to:")
print(model_path)


# ---------------------------------------------------------
# 14. Save metrics
# ---------------------------------------------------------

metrics = pd.DataFrame([
    {
        "Model": "Tuned Random Forest",
        "Features": 12,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "Weighted F1": weighted_f1,
        "Macro F1": macro_f1,
        "CV Weighted F1": grid_search.best_score_
    }
])

metrics_path = (
    RESULT_DIR /
    "tuned_random_forest_results.csv"
)

metrics.to_csv(
    metrics_path,
    index=False
)

print("\nMetrics saved to:")
print(metrics_path)


# ---------------------------------------------------------
# 15. Compare with baseline
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("BASELINE VS TUNED MODEL")
print("=" * 70)

print("Baseline 12-feature Random Forest accuracy : 89.20%")
print(
    f"Tuned Random Forest accuracy              : "
    f"{accuracy * 100:.2f}%"
)

print("\nTuning completed.")