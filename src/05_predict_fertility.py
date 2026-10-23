import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "random_forest.pkl"

# Replace this with the model selected after evaluation.
model = joblib.load(MODEL_PATH)

sample = pd.DataFrame([{
    "N": 80,
    "P": 40,
    "K": 45,
    "pH": 6.5
}])

prediction = model.predict(sample)[0]

labels = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile"
}

print("Input:")
print(sample.to_string(index=False))
print(f"\nPredicted Fertility: {labels[prediction]}")
