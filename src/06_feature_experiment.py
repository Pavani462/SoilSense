import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
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

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

TARGET = "Output"

# Experiment 1: Original project design
FEATURES_4 = ["N", "P", "K", "pH"]

# Experiment 2: All available soil parameters
FEATURES_12 = [
    "N", "P", "K", "pH",
    "EC", "OC", "S", "Zn", "Fe", "Cu", "Mn", "B"
]


def run_experiment(feature_set, experiment_name):

    X = df[feature_set]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight="balanced"
        ),

        "Gradient Boosting": GradientBoostingClassifier(
            random_state=42
        )
    }

    results = []

    print("\n" + "=" * 70)
    print(experiment_name)
    print("=" * 70)

    print(f"Features ({len(feature_set)}):")
    print(feature_set)

    for name, model in models.items():

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        accuracy = accuracy_score(y_test, predictions)

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

        results.append({
            "Experiment": experiment_name,
            "Features": len(feature_set),
            "Model": name,
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "Weighted F1": weighted_f1,
            "Macro F1": macro_f1
        })

        print("\n" + "-" * 50)
        print(name)
        print("-" * 50)

        print(f"Accuracy    : {accuracy:.4f}")
        print(f"Precision   : {precision:.4f}")
        print(f"Recall      : {recall:.4f}")
        print(f"Weighted F1 : {weighted_f1:.4f}")
        print(f"Macro F1    : {macro_f1:.4f}")

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

        print("Confusion Matrix:")

        print(
            confusion_matrix(
                y_test,
                predictions
            )
        )

        model_filename = (
            f"{experiment_name.lower().replace(' ', '_')}_"
            f"{name.lower().replace(' ', '_')}.pkl"
        )

        model_path = MODEL_DIR / model_filename

        joblib.dump(model, model_path)

        print(f"\nModel saved: {model_path}")

    return results


# Run 4-feature experiment
all_results = run_experiment(
    FEATURES_4,
    "4-Feature Experiment"
)

# Run 12-feature experiment
all_results += run_experiment(
    FEATURES_12,
    "12-Feature Experiment"
)


# Create final comparison table
results_df = pd.DataFrame(all_results)

results_path = (
    RESULT_DIR /
    "feature_experiment_comparison.csv"
)

results_df.to_csv(
    results_path,
    index=False
)

print("\n" + "=" * 70)
print("FINAL FEATURE EXPERIMENT COMPARISON")
print("=" * 70)

print(
    results_df.to_string(index=False)
)

print("\nComparison saved to:")

print(results_path)