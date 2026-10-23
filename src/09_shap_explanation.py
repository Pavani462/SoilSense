import pandas as pd
import numpy as np
import joblib
import shap
import matplotlib.pyplot as plt

from pathlib import Path
from sklearn.model_selection import train_test_split


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = BASE_DIR / "data" / "dataset1.csv"

MODEL_PATH = (
    BASE_DIR /
    "models" /
    "12-feature_experiment_random_forest.pkl"
)

RESULT_DIR = BASE_DIR / "results"

FIGURE_DIR = RESULT_DIR / "figures"
METRICS_DIR = RESULT_DIR / "metrics"

FIGURE_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)


# ============================================================
# FEATURES AND TARGET
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

TARGET = "Output"


X = df[FEATURES]
y = df[TARGET]


# ============================================================
# SAME TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ============================================================
# LOAD FINAL RANDOM FOREST
# ============================================================

model = joblib.load(MODEL_PATH)


print("=" * 75)
print("SHAP EXPLAINABILITY ANALYSIS")
print("=" * 75)

print("Model loaded from:")
print(MODEL_PATH)

print(f"\nTest samples : {len(X_test)}")
print(f"Features     : {len(FEATURES)}")


# ============================================================
# VERIFY MODEL
# ============================================================

predictions = model.predict(X_test)

accuracy = (predictions == y_test).mean()

print(
    f"\nModel test accuracy: "
    f"{accuracy * 100:.2f}%"
)


# ============================================================
# CREATE SHAP EXPLAINER
# ============================================================

print("\nCreating SHAP TreeExplainer...")

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(X_test)

print("SHAP values generated successfully.")


# ============================================================
# HANDLE SHAP OUTPUT FORMAT
# ============================================================

if isinstance(shap_values, list):

    # Older SHAP versions
    shap_by_class = shap_values

else:

    # Newer SHAP versions
    # Expected shape:
    # samples x features x classes

    if shap_values.ndim == 3:

        shap_by_class = [
            shap_values[:, :, class_index]
            for class_index in range(shap_values.shape[2])
        ]

    else:

        raise ValueError(
            "Unexpected SHAP output shape: "
            + str(shap_values.shape)
        )


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile"
}


# ============================================================
# GLOBAL FEATURE IMPORTANCE
# ============================================================

print("\nCalculating global feature importance...")

# SHAP 0.51.0 returns multiclass values as:
# samples x features x classes
#
# We calculate the mean absolute SHAP value
# for each of the 12 features.

if isinstance(shap_values, np.ndarray):

    if shap_values.ndim == 3:

        # samples x features x classes
        global_importance = np.mean(
            np.abs(shap_values),
            axis=(0, 2)
        )

    elif shap_values.ndim == 2:

        # samples x features
        global_importance = np.mean(
            np.abs(shap_values),
            axis=0
        )

    else:

        raise ValueError(
            "Unexpected SHAP array shape: "
            + str(shap_values.shape)
        )

else:

    # Older SHAP versions may return a list:
    # one array per class
    #
    # class x samples x features

    stacked_shap = np.stack(
        shap_values,
        axis=0
    )

    global_importance = np.mean(
        np.abs(stacked_shap),
        axis=(0, 1)
    )


importance_df = pd.DataFrame({
    "Feature": FEATURES,
    "Mean Absolute SHAP": global_importance
})

importance_df = importance_df.sort_values(
    by="Mean Absolute SHAP",
    ascending=False
)

print("\nGlobal Feature Importance:")

print(
    importance_df.to_string(
        index=False
    )
)


importance_path = (
    METRICS_DIR /
    "shap_feature_importance.csv"
)

importance_df.to_csv(
    importance_path,
    index=False
)

print("\nFeature importance saved to:")
print(importance_path)
importance_df = importance_df.sort_values(
    by="Mean Absolute SHAP",
    ascending=False
)

print("\nGlobal Feature Importance:")
print(importance_df.to_string(index=False))


importance_path = (
    METRICS_DIR /
    "shap_feature_importance.csv"
)

importance_df.to_csv(
    importance_path,
    index=False
)

print("\nFeature importance saved to:")
print(importance_path)


# ============================================================
# GLOBAL SHAP SUMMARY PLOTS
# ============================================================

print("\nCreating SHAP summary plots...")


for class_index, class_name in CLASS_NAMES.items():

    plt.figure()

    shap.summary_plot(
        shap_by_class[class_index],
        X_test,
        show=False
    )

    plt.title(
        f"SHAP Feature Impact - {class_name}"
    )

    plt.tight_layout()

    safe_name = class_name.lower().replace(
        " ",
        "_"
    )

    figure_path = (
        FIGURE_DIR /
        f"shap_summary_{safe_name}.png"
    )

    plt.savefig(
        figure_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    print(
        f"Saved: {figure_path.name}"
    )


# ============================================================
# SELECT ONE TEST SAMPLE
# ============================================================

sample_position = 0

sample = X_test.iloc[[sample_position]]

actual_class = int(
    y_test.iloc[sample_position]
)

predicted_class = int(
    model.predict(sample)[0]
)

prediction_probabilities = model.predict_proba(
    sample
)[0]


print("\n" + "=" * 75)
print("SAMPLE-LEVEL EXPLANATION")
print("=" * 75)

print("\nSoil Sample:")

print(
    sample.to_string(index=False)
)

print(
    f"\nActual Class    : "
    f"{CLASS_NAMES[actual_class]}"
)

print(
    f"Predicted Class : "
    f"{CLASS_NAMES[predicted_class]}"
)

print("\nPrediction Probabilities:")

for class_index, probability in enumerate(
    prediction_probabilities
):

    print(
        f"{CLASS_NAMES[class_index]}: "
        f"{probability * 100:.2f}%"
    )


# ============================================================
# LOCAL SHAP EXPLANATION
# ============================================================

sample_shap_values = (
    shap_by_class[predicted_class][sample_position]
)

local_df = pd.DataFrame({
    "Feature": FEATURES,
    "SHAP Value": sample_shap_values,
    "Absolute SHAP": np.abs(sample_shap_values)
})

local_df = local_df.sort_values(
    by="Absolute SHAP",
    ascending=False
)


print("\nFeature contributions for predicted class:")

print(
    local_df[
        [
            "Feature",
            "SHAP Value"
        ]
    ].to_string(index=False)
)


local_path = (
    METRICS_DIR /
    "sample_shap_explanation.csv"
)

local_df.to_csv(
    local_path,
    index=False
)

print("\nLocal explanation saved to:")
print(local_path)


# ============================================================
# LOCAL SHAP BAR PLOT
# ============================================================

top_local = local_df.head(12).copy()

plt.figure(figsize=(10, 7))

plt.barh(
    top_local["Feature"][::-1],
    top_local["SHAP Value"][::-1]
)

plt.axvline(
    0,
    linewidth=1
)

plt.xlabel("SHAP Value")

plt.ylabel("Soil Feature")

plt.title(
    "Local SHAP Explanation - "
    + CLASS_NAMES[predicted_class]
)

plt.tight_layout()


local_figure_path = (
    FIGURE_DIR /
    "shap_local_explanation.png"
)

plt.savefig(
    local_figure_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


print("\nLocal SHAP plot saved to:")
print(local_figure_path)


# ============================================================
# COMPLETION
# ============================================================

print("\n" + "=" * 75)
print("SHAP ANALYSIS COMPLETED")
print("=" * 75)