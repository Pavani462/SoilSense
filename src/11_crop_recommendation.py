import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR /
    "data" /
    "Crop_recommendation.csv"
)

MODEL_DIR = BASE_DIR / "models"
RESULT_DIR = BASE_DIR / "results" / "metrics"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv(DATA_PATH)

print("=" * 75)
print("CROP RECOMMENDATION MODEL")
print("=" * 75)

print(f"\nDataset shape: {df.shape}")

print("\nColumns:")
print(df.columns.tolist())


# ============================================================
# FEATURES AND TARGET
# ============================================================

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

TARGET = "label"


X = df[FEATURES]
y = df[TARGET]


# ============================================================
# DATASET CHECK
# ============================================================

print("\nMissing values:")

print(
    df.isnull().sum()
)

print("\nNumber of crop classes:")

print(
    y.nunique()
)

print("\nCrop distribution:")

print(
    y.value_counts()
    .sort_index()
)


# ============================================================
# TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n" + "=" * 75)
print("DATA SPLIT")
print("=" * 75)

print(f"Training samples : {len(X_train)}")
print(f"Testing samples  : {len(X_test)}")


# ============================================================
# RANDOM FOREST MODEL
# ============================================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)


print("\nTraining Random Forest...")

model.fit(
    X_train,
    y_train
)


# ============================================================
# PREDICTION
# ============================================================

predictions = model.predict(
    X_test
)


# ============================================================
# METRICS
# ============================================================

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


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 75)
print("CROP MODEL RESULTS")
print("=" * 75)

print(
    f"Accuracy       : {accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)

print(
    f"Precision      : {precision:.4f}"
)

print(
    f"Recall         : {recall:.4f}"
)

print(
    f"Weighted F1    : {weighted_f1:.4f}"
)

print(
    f"Macro F1       : {macro_f1:.4f}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("Confusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

model_path = (
    MODEL_DIR /
    "crop_recommendation_random_forest.pkl"
)

joblib.dump(
    model,
    model_path
)

print("\nModel saved to:")

print(model_path)


# ============================================================
# SAVE METRICS
# ============================================================

metrics_df = pd.DataFrame([
    {
        "Model": "Random Forest",
        "Features": 7,
        "Number of Crops": y.nunique(),
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "Weighted F1": weighted_f1,
        "Macro F1": macro_f1
    }
])

metrics_path = (
    RESULT_DIR /
    "crop_model_results.csv"
)

metrics_df.to_csv(
    metrics_path,
    index=False
)

print("\nMetrics saved to:")

print(metrics_path)


# ============================================================
# SAMPLE CROP PREDICTION
# ============================================================

sample = pd.DataFrame(
    [
        {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 25.0,
            "humidity": 80.0,
            "ph": 6.5,
            "rainfall": 200.0
        }
    ]
)

sample_prediction = model.predict(
    sample
)[0]

sample_probabilities = model.predict_proba(
    sample
)[0]

class_names = model.classes_

top_indices = (
    sample_probabilities
    .argsort()[::-1][:5]
)

print("\n" + "=" * 75)
print("SAMPLE CROP RECOMMENDATION")
print("=" * 75)

print("\nInput values:")

print(
    sample.to_string(index=False)
)

print(
    f"\nRecommended crop: "
    f"{sample_prediction}"
)

print("\nTop 5 crop probabilities:")

for index in top_indices:

    print(
        f"{class_names[index]:<15} "
        f"{sample_probabilities[index] * 100:.2f}%"
    )


print("\n" + "=" * 75)
print("CROP RECOMMENDATION COMPLETED")
print("=" * 75)