import pandas as pd
import joblib

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

FERTILITY_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "12-feature_experiment_random_forest.pkl"
)

CROP_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "crop_recommendation_random_forest.pkl"
)

RESULT_DIR = (
    BASE_DIR
    / "results"
    / "metrics"
)

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD MODELS
# ============================================================

fertility_model = joblib.load(
    FERTILITY_MODEL_PATH
)

crop_model = joblib.load(
    CROP_MODEL_PATH
)


# ============================================================
# FEATURE DEFINITIONS
# ============================================================

# Features used by the fertility model
FERTILITY_FEATURES = [
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


# Features used by the crop recommendation model
# IMPORTANT:
# The crop dataset uses "ph", not "pH".
CROP_FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]


# ============================================================
# FERTILITY CLASS NAMES
# ============================================================

CLASS_NAMES = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile"
}


# ============================================================
# SOIL AND ENVIRONMENT SAMPLE
# ============================================================

soil_sample = {
    # Soil parameters
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
    "B": 0.14,

    # Environmental parameters
    "temperature": 25.0,
    "humidity": 80.0,
    "rainfall": 200.0
}


# ============================================================
# FERTILITY PREDICTION
# ============================================================

fertility_input = pd.DataFrame([
    {
        "N": soil_sample["N"],
        "P": soil_sample["P"],
        "K": soil_sample["K"],
        "pH": soil_sample["pH"],
        "EC": soil_sample["EC"],
        "OC": soil_sample["OC"],
        "S": soil_sample["S"],
        "Zn": soil_sample["Zn"],
        "Fe": soil_sample["Fe"],
        "Cu": soil_sample["Cu"],
        "Mn": soil_sample["Mn"],
        "B": soil_sample["B"]
    }
])


fertility_prediction = int(
    fertility_model.predict(
        fertility_input
    )[0]
)


fertility_name = CLASS_NAMES[
    fertility_prediction
]


# ============================================================
# FERTILITY PROBABILITIES
# ============================================================

fertility_probabilities = (
    fertility_model.predict_proba(
        fertility_input
    )[0]
)


# ============================================================
# CROP PREDICTION
# ============================================================

# IMPORTANT:
# The crop model was trained using:
#
# N, P, K, temperature, humidity, ph, rainfall
#
# The soil_sample dictionary uses "pH".
# Therefore, we explicitly map:
#
# soil_sample["pH"] → crop model column "ph"

crop_input = pd.DataFrame([
    {
        "N": soil_sample["N"],
        "P": soil_sample["P"],
        "K": soil_sample["K"],
        "temperature": soil_sample["temperature"],
        "humidity": soil_sample["humidity"],
        "ph": soil_sample["pH"],
        "rainfall": soil_sample["rainfall"]
    }
])


crop_prediction = crop_model.predict(
    crop_input
)[0]


# ============================================================
# CROP PROBABILITIES
# ============================================================

crop_probabilities = (
    crop_model.predict_proba(
        crop_input
    )[0]
)

crop_classes = crop_model.classes_


# Get top 3 crops
top_indices = (
    crop_probabilities
    .argsort()[::-1][:3]
)


# ============================================================
# FERTILIZER RECOMMENDATION
# ============================================================

recommendations = []


# ------------------------------------------------------------
# Nitrogen
# ------------------------------------------------------------

if soil_sample["N"] < 200:

    recommendations.append(
        "Nitrogen level is relatively low. "
        "Consider a nitrogen-containing fertilizer "
        "based on local soil-test recommendations."
    )

elif soil_sample["N"] > 300:

    recommendations.append(
        "Nitrogen level is relatively high. "
        "Avoid unnecessary additional nitrogen application."
    )

else:

    recommendations.append(
        "Nitrogen level is within the selected "
        "project threshold."
    )


# ------------------------------------------------------------
# Phosphorus
# ------------------------------------------------------------

if soil_sample["P"] < 10:

    recommendations.append(
        "Phosphorus level is relatively low. "
        "Consider a phosphorus-containing fertilizer "
        "based on soil-test recommendations."
    )

elif soil_sample["P"] > 50:

    recommendations.append(
        "Phosphorus level is relatively high. "
        "Avoid unnecessary additional phosphorus application."
    )

else:

    recommendations.append(
        "Phosphorus level is within the selected "
        "project threshold."
    )


# ------------------------------------------------------------
# Potassium
# ------------------------------------------------------------

if soil_sample["K"] < 200:

    recommendations.append(
        "Potassium level is relatively low. "
        "Consider a potassium-containing fertilizer "
        "based on soil-test recommendations."
    )

elif soil_sample["K"] > 500:

    recommendations.append(
        "Potassium level is relatively high. "
        "Avoid unnecessary additional potassium application."
    )

else:

    recommendations.append(
        "Potassium level is within the selected "
        "project threshold."
    )


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("=" * 75)
print("FERTILITY + CROP + FERTILIZER RECOMMENDATION")
print("=" * 75)


# ------------------------------------------------------------
# Soil Fertility
# ------------------------------------------------------------

print("\nPredicted Soil Fertility:")

print(
    fertility_name
)


# ------------------------------------------------------------
# Fertility Probabilities
# ------------------------------------------------------------

print("\nFertility Probabilities:")

for class_index, probability in enumerate(
    fertility_probabilities
):

    print(
        f"{CLASS_NAMES[class_index]:<20} "
        f"{probability * 100:.2f}%"
    )


# ------------------------------------------------------------
# Crop Recommendation
# ------------------------------------------------------------

print("\nRecommended Crop:")

print(
    crop_prediction
)


# ------------------------------------------------------------
# Top 3 Crops
# ------------------------------------------------------------

print("\nTop 3 Crop Recommendations:")

for rank, index in enumerate(
    top_indices,
    start=1
):

    print(
        f"{rank}. "
        f"{crop_classes[index]} "
        f"- "
        f"{crop_probabilities[index] * 100:.2f}%"
    )


# ------------------------------------------------------------
# Fertilizer Guidance
# ------------------------------------------------------------

print("\nNutrient-Based Fertilizer Guidance:")

for number, recommendation in enumerate(
    recommendations,
    start=1
):

    print(
        f"{number}. {recommendation}"
    )


# ============================================================
# SAVE RESULTS
# ============================================================

result_df = pd.DataFrame({
    "Fertility": [
        fertility_name
    ],

    "Fertility Probability": [
        fertility_probabilities[
            fertility_prediction
        ]
    ],

    "Recommended Crop": [
        crop_prediction
    ],

    "Top Crop 2": [
        crop_classes[
            top_indices[1]
        ]
    ],

    "Top Crop 3": [
        crop_classes[
            top_indices[2]
        ]
    ],

    "N Recommendation": [
        recommendations[0]
    ],

    "P Recommendation": [
        recommendations[1]
    ],

    "K Recommendation": [
        recommendations[2]
    ]
})


result_path = (
    RESULT_DIR
    / "fertilizer_recommendation.csv"
)


result_df.to_csv(
    result_path,
    index=False
)


print("\nRecommendation saved to:")

print(
    result_path
)


# ============================================================
# COMPLETION
# ============================================================

print(
    "\n"
    + "=" * 75
)

print(
    "FERTILIZER RECOMMENDATION COMPLETED"
)

print(
    "=" * 75
)