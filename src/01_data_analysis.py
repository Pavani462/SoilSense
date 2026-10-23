import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "dataset1.csv"
FIGURES_DIR = Path(__file__).resolve().parents[1] / "results" / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("SOIL FERTILITY DATASET ANALYSIS")
print("=" * 60)

print("\n1. Dataset shape:")
print(f"Rows    : {df.shape[0]}")
print(f"Columns : {df.shape[1]}")

print("\n2. Column names:")
print(df.columns.tolist())

print("\n3. Data types:")
print(df.dtypes)

print("\n4. Missing values:")
print(df.isnull().sum())

print("\n5. Duplicate rows:")
print(df.duplicated().sum())

print("\n6. Target distribution:")
print(df["Output"].value_counts().sort_index())

print("\n7. Descriptive statistics:")
print(df.describe())

print("\n8. Class percentages:")
print((df["Output"].value_counts(normalize=True).sort_index() * 100).round(2))

# Target distribution
plt.figure(figsize=(7, 5))
df["Output"].value_counts().sort_index().plot(kind="bar")
plt.title("Soil Fertility Class Distribution")
plt.xlabel("Fertility Class (0=Less Fertile, 1=Fertile, 2=Highly Fertile)")
plt.ylabel("Number of Samples")
plt.tight_layout()
plt.savefig(FIGURES_DIR / "fertility_class_distribution.png", dpi=300)
plt.show()

# Feature distributions
features = ["N", "P", "K", "pH"]

for feature in features:
    plt.figure(figsize=(7, 5))
    plt.hist(df[feature], bins=30)
    plt.title(f"{feature} Distribution")
    plt.xlabel(feature)
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / f"{feature}_distribution.png", dpi=300)
    plt.show()

print("\nAnalysis complete.")
