import pandas as pd
import joblib
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR /
    "models" /
    "12-feature_experiment_random_forest.pkl"
)

RESULT_DIR = BASE_DIR / "results" / "metrics"

RESULT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(MODEL_PATH)


# ============================================================
# FEATURES
# ============================================================

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


CLASS_NAMES = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile"
}


# ============================================================
# BASELINE SOIL SAMPLE
# ============================================================

baseline = {
    "N": 270,
    "P": 7.9,
    "K": 253,
    "pH": 7.48,
    "EC": 0.57,
    "OC": 0.59,
    "S": 3.1,
    "Zn": 0.24,
    "Fe": 2.49,
    "Cu": 0.52,
    "Mn": 7.74,
    "B": 0.14
}


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_soil(values):

    sample = pd.DataFrame(
        [values],
        columns=FEATURES
    )

    prediction = int(
        model.predict(sample)[0]
    )

    probabilities = model.predict_proba(
        sample
    )[0]

    return prediction, probabilities


# ============================================================
# BASELINE PREDICTION
# ============================================================

baseline_prediction, baseline_probabilities = (
    predict_soil(baseline)
)


print("=" * 75)
print("WHAT-IF ANALYSIS")
print("=" * 75)

print("\nBaseline Soil Values:")

for feature in FEATURES:
    print(
        f"{feature:>3} : {baseline[feature]}"
    )

print("\nBaseline Prediction:")
print(
    CLASS_NAMES[baseline_prediction]
)

print("\nBaseline Probabilities:")

for class_index, probability in enumerate(
    baseline_probabilities
):

    print(
        f"{CLASS_NAMES[class_index]:<20} "
        f"{probability * 100:.2f}%"
    )


# ============================================================
# WHAT-IF VALUES
# ============================================================

experiments = []


# ------------------------------------------------------------
# Nitrogen
# ------------------------------------------------------------

for value in [100, 150, 200, 250, 270, 300, 350]:

    values = baseline.copy()

    values["N"] = value

    prediction, probabilities = (
        predict_soil(values)
    )

    experiments.append({
        "Changed Feature": "N",
        "Changed Value": value,
        "Predicted Class":
            CLASS_NAMES[prediction],
        "Less Fertile Probability":
            probabilities[0],
        "Fertile Probability":
            probabilities[1],
        "Highly Fertile Probability":
            probabilities[2]
    })


# ------------------------------------------------------------
# Phosphorus
# ------------------------------------------------------------

for value in [5, 10, 15, 20, 30, 40, 50]:

    values = baseline.copy()

    values["P"] = value

    prediction, probabilities = (
        predict_soil(values)
    )

    experiments.append({
        "Changed Feature": "P",
        "Changed Value": value,
        "Predicted Class":
            CLASS_NAMES[prediction],
        "Less Fertile Probability":
            probabilities[0],
        "Fertile Probability":
            probabilities[1],
        "Highly Fertile Probability":
            probabilities[2]
    })


# ------------------------------------------------------------
# Potassium
# ------------------------------------------------------------

for value in [100, 150, 200, 250, 300, 400, 500]:

    values = baseline.copy()

    values["K"] = value

    prediction, probabilities = (
        predict_soil(values)
    )

    experiments.append({
        "Changed Feature": "K",
        "Changed Value": value,
        "Predicted Class":
            CLASS_NAMES[prediction],
        "Less Fertile Probability":
            probabilities[0],
        "Fertile Probability":
            probabilities[1],
        "Highly Fertile Probability":
            probabilities[2]
    })


# ------------------------------------------------------------
# pH
# ------------------------------------------------------------

for value in [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5]:

    values = baseline.copy()

    values["pH"] = value

    prediction, probabilities = (
        predict_soil(values)
    )

    experiments.append({
        "Changed Feature": "pH",
        "Changed Value": value,
        "Predicted Class":
            CLASS_NAMES[prediction],
        "Less Fertile Probability":
            probabilities[0],
        "Fertile Probability":
            probabilities[1],
        "Highly Fertile Probability":
            probabilities[2]
    })


# ============================================================
# SAVE RESULTS
# ============================================================

results_df = pd.DataFrame(experiments)

results_path = (
    RESULT_DIR /
    "what_if_analysis.csv"
)

results_df.to_csv(
    results_path,
    index=False
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 75)
print("WHAT-IF RESULTS")
print("=" * 75)

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)

print("\nResults saved to:")
print(results_path)

print("\n" + "=" * 75)
print("WHAT-IF ANALYSIS COMPLETED")
print("=" * 75)