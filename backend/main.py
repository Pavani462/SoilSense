from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

import pandas as pd

import joblib

import shap

from pathlib import Path

import requests


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Soil Fertility & Crop Recommendation API",
    description=(
        "Backend API for soil fertility prediction, "
        "crop recommendation, explainability and "
        "nutrient-based fertilizer guidance."
    ),
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# MODEL PATHS
# ============================================================

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
# SHAP EXPLAINER
# ============================================================

shap_explainer = shap.TreeExplainer(
    fertility_model
)


# ============================================================
# FERTILITY CLASS NAMES
# ============================================================

FERTILITY_CLASSES = {
    0: "Less Fertile",
    1: "Fertile",
    2: "Highly Fertile",
}


# ============================================================
# SOIL INPUT
# ============================================================

class SoilInput(BaseModel):

    N: float

    P: float

    K: float

    pH: float

    EC: float

    OC: float

    S: float

    Zn: float

    Fe: float

    Cu: float

    Mn: float

    B: float

    temperature: float = 25

    humidity: float = 80

    rainfall: float = 200


# ============================================================
# CROP INPUT
# ============================================================

class CropInput(BaseModel):

    N: float

    P: float

    K: float

    temperature: float

    humidity: float

    pH: float

    rainfall: float


# ============================================================
# COMPLETE SOIL INPUT
# ============================================================

class CompleteSoilInput(BaseModel):

    N: float

    P: float

    K: float

    pH: float

    EC: float

    OC: float

    S: float

    Zn: float

    Fe: float

    Cu: float

    Mn: float

    B: float

    temperature: float = 25

    humidity: float = 80

    rainfall: float = 200


# ============================================================
# TRANSLATION INPUT
# ============================================================

class TranslationRequest(BaseModel):

    text: str

    target_language: str


# ============================================================
# WHAT-IF INPUT
# ============================================================

class WhatIfInput(BaseModel):

    N: float

    P: float

    K: float

    pH: float

    EC: float

    OC: float

    S: float

    Zn: float

    Fe: float

    Cu: float

    Mn: float

    B: float

    parameter: str

    new_value: float


# ============================================================
# HELPER: FERTILITY INPUT DATAFRAME
# ============================================================

def create_fertility_dataframe(data):

    return pd.DataFrame(
        [[
            data.N,
            data.P,
            data.K,
            data.pH,
            data.EC,
            data.OC,
            data.S,
            data.Zn,
            data.Fe,
            data.Cu,
            data.Mn,
            data.B,
        ]],
        columns=[
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
            "B",
        ],
    )


# ============================================================
# HELPER: CROP INPUT DATAFRAME
# ============================================================

def create_crop_dataframe(data):

    return pd.DataFrame(
        [[
            data.N,
            data.P,
            data.K,
            data.temperature,
            data.humidity,
            data.pH,
            data.rainfall,
        ]],
        columns=[
            "N",
            "P",
            "K",
            "temperature",
            "humidity",
            "ph",
            "rainfall",
        ],
    )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "SoilSense API is running",
        "status": "ok",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "fertility_model_loaded": True,
        "crop_model_loaded": True,
    }


# ============================================================
# DYNAMIC TRANSLATION
# ============================================================

@app.post("/translate")
def translate_text(request: TranslationRequest):

    # If there is no text
    if not request.text.strip():
        return {
            "translation": ""
        }

    # Supported languages
    language_map = {
        "en": "en",
        "te": "te",
        "hi": "hi",
    }

    target_language = language_map.get(
        request.target_language
    )

    # Check language
    if not target_language:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    # English does not need translation
    if target_language == "en":
        return {
            "translation": request.text
        }

    try:

        response = requests.post(
            "https://libretranslate.com/translate",
            data={
                "q": request.text,
                "source": "en",
                "target": target_language,
                "format": "text",
            },
            timeout=20,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="Translation service failed"
            )

        data = response.json()

        return {
            "translation": data.get(
                "translatedText",
                request.text
            )
        }

    except requests.RequestException as error:

        print(
            "Translation service error:",
            error
        )

        # If translation service fails,
        # return original English text
        return {
            "translation": request.text
        }


# ============================================================
# FERTILITY PREDICTION
# ============================================================

@app.post("/predict-fertility")
def predict_fertility(data: SoilInput):

    input_data = create_fertility_dataframe(data)

    prediction = fertility_model.predict(
        input_data
    )[0]

    probabilities = fertility_model.predict_proba(
        input_data
    )[0]

    predicted_fertility = FERTILITY_CLASSES[
        int(prediction)
    ]

    fertility_probabilities = {
        FERTILITY_CLASSES[i]: round(
            float(probabilities[i]) * 100,
            2,
        )
        for i in range(
            len(probabilities)
        )
    }

    return {
        "predicted_fertility":
            predicted_fertility,

        "fertility_probabilities":
            fertility_probabilities,
    }


# ============================================================
# CROP RECOMMENDATION
# ============================================================

@app.post("/recommend-crop")
def recommend_crop(crop: CropInput):

    input_data = create_crop_dataframe(
        crop
    )

    prediction = crop_model.predict(
        input_data
    )[0]

    probabilities = crop_model.predict_proba(
        input_data
    )[0]

    crop_names = crop_model.classes_

    ranked_crops = sorted(
        zip(
            crop_names,
            probabilities
        ),
        key=lambda x: x[1],
        reverse=True,
    )

    top_3 = [
        {
            "crop": str(crop_name),

            "probability": round(
                float(probability) * 100,
                2,
            ),
        }

        for crop_name, probability
        in ranked_crops[:3]
    ]

    return {
        "recommended_crop":
            str(prediction),

        "top_3_recommendations":
            top_3,
    }


# ============================================================
# FERTILIZER GUIDANCE
# ============================================================

def generate_fertilizer_guidance(data):

    guidance = []


    # --------------------------------------------------------
    # NITROGEN
    # --------------------------------------------------------

    if data.N < 200:

        guidance.append(
            "Nitrogen is relatively low. "
            "Fertilizer options: Urea or an "
            "ammonium-based nitrogen fertilizer. "
            "Follow the soil-test recommendation "
            "for the appropriate dose."
        )

    elif data.N > 300:

        guidance.append(
            "Nitrogen is relatively high. "
            "Avoid unnecessary nitrogen application "
            "and follow the soil-test recommendation."
        )

    else:

        guidance.append(
            "Nitrogen is within the selected "
            "project threshold. No additional "
            "nitrogen fertilizer is indicated "
            "by this project rule."
        )


    # --------------------------------------------------------
    # PHOSPHORUS
    # --------------------------------------------------------

    if data.P < 10:

        guidance.append(
            "Phosphorus is relatively low. "
            "Fertilizer options: DAP "
            "(Diammonium Phosphate) or SSP "
            "(Single Super Phosphate). "
            "Follow the soil-test recommendation "
            "for the appropriate dose."
        )

    elif data.P > 50:

        guidance.append(
            "Phosphorus is relatively high. "
            "Avoid unnecessary phosphorus application "
            "and follow the soil-test recommendation."
        )

    else:

        guidance.append(
            "Phosphorus is within the selected "
            "project threshold."
        )


    # --------------------------------------------------------
    # POTASSIUM
    # --------------------------------------------------------

    if data.K < 200:

        guidance.append(
            "Potassium is relatively low. "
            "Fertilizer option: MOP "
            "(Muriate of Potash) or another "
            "potassium-containing fertilizer. "
            "Follow the soil-test recommendation "
            "for the appropriate dose."
        )

    elif data.K > 500:

        guidance.append(
            "Potassium is relatively high. "
            "Avoid unnecessary potassium application "
            "and follow the soil-test recommendation."
        )

    else:

        guidance.append(
            "Potassium is within the selected "
            "project threshold."
        )


    # --------------------------------------------------------
    # SULPHUR
    # --------------------------------------------------------

    if data.S < 5:

        guidance.append(
            "Sulphur is relatively low. "
            "Fertilizer options include SSP "
            "(Single Super Phosphate) or another "
            "sulphur-containing fertilizer. "
            "Follow the soil-test recommendation."
        )


    # --------------------------------------------------------
    # ZINC
    # --------------------------------------------------------

    if data.Zn < 0.6:

        guidance.append(
            "Zinc is relatively low. "
            "Fertilizer option: Zinc sulphate. "
            "Follow the soil-test recommendation "
            "for the appropriate dose."
        )


    # --------------------------------------------------------
    # BORON
    # --------------------------------------------------------

    if data.B < 0.2:

        guidance.append(
            "Boron is relatively low. "
            "Fertilizer options include Borax or "
            "another boron-containing fertilizer. "
            "Follow the soil-test recommendation."
        )


    # --------------------------------------------------------
    # IF NOTHING IS LOW
    # --------------------------------------------------------

    low_nutrients = []

    if data.N < 200:
        low_nutrients.append("Nitrogen")

    if data.P < 10:
        low_nutrients.append("Phosphorus")

    if data.K < 200:
        low_nutrients.append("Potassium")

    if data.S < 5:
        low_nutrients.append("Sulphur")

    if data.Zn < 0.6:
        low_nutrients.append("Zinc")

    if data.B < 0.2:
        low_nutrients.append("Boron")


    if not low_nutrients:

        guidance.append(
            "No low nutrient was identified by "
            "the selected project thresholds. "
            "Follow the laboratory soil-test "
            "recommendation."
        )


    return guidance
# ============================================================
# COMPLETE SOIL ANALYSIS
# ============================================================

@app.post("/analyze-soil")
def analyze_soil(data: CompleteSoilInput):

    # ========================================================
    # 1. FERTILITY MODEL INPUT
    # ========================================================

    fertility_input = (
        create_fertility_dataframe(data)
    )


    # ========================================================
    # 2. FERTILITY PREDICTION
    # ========================================================

    fertility_prediction = (
        fertility_model.predict(
            fertility_input
        )[0]
    )

    fertility_probabilities = (
        fertility_model.predict_proba(
            fertility_input
        )[0]
    )

    predicted_fertility = (
        FERTILITY_CLASSES[
            int(fertility_prediction)
        ]
    )


    fertility_probability_result = {

        FERTILITY_CLASSES[i]:

            round(
                float(
                    fertility_probabilities[i]
                ) * 100,
                2,
            )

        for i in range(
            len(fertility_probabilities)
        )
    }


    # ========================================================
    # 3. CROP MODEL INPUT
    # ========================================================

    crop_input = create_crop_dataframe(
        data
    )


    # ========================================================
    # 4. CROP PREDICTION
    # ========================================================

    crop_prediction = crop_model.predict(
        crop_input
    )[0]

    crop_probabilities = (
        crop_model.predict_proba(
            crop_input
        )[0]
    )

    crop_names = crop_model.classes_


    ranked_crops = sorted(

        zip(
            crop_names,
            crop_probabilities
        ),

        key=lambda x: x[1],

        reverse=True,
    )


    top_3_crops = [

        {
            "crop": str(crop_name),

            "probability": round(
                float(probability) * 100,
                2,
            ),
        }

        for crop_name, probability
        in ranked_crops[:3]
    ]


    # ========================================================
    # 5. FERTILIZER GUIDANCE
    # ========================================================

    fertilizer_guidance = (
        generate_fertilizer_guidance(data)
    )


    # ========================================================
    # 6. RETURN RESULT
    # ========================================================

    return {

        "fertility": {

            "prediction":
                predicted_fertility,

            "probabilities":
                fertility_probability_result,
        },


        "crop_recommendation": {

            "recommended_crop":
                str(crop_prediction),

            "top_3":
                top_3_crops,
        },


        "fertilizer_guidance":
            fertilizer_guidance,
    }


# ============================================================
# SHAP EXPLANATION
# ============================================================

@app.post("/explain")
def explain_fertility(soil: SoilInput):

    input_data = (
        create_fertility_dataframe(
            soil
        )
    )


    prediction = (
        fertility_model.predict(
            input_data
        )[0]
    )


    predicted_fertility = (
        FERTILITY_CLASSES[
            int(prediction)
        ]
    )


    # ========================================================
    # SHAP VALUES
    # ========================================================

    shap_values = (
        shap_explainer.shap_values(
            input_data
        )
    )


    # ========================================================
    # HANDLE SHAP OUTPUT
    # ========================================================

    if isinstance(
        shap_values,
        list
    ):

        local_values = (
            shap_values[
                int(prediction)
            ][0]
        )

    else:

        shap_array = shap_values

        if shap_array.ndim == 3:

            local_values = (
                shap_array[
                    0,
                    :,
                    int(prediction)
                ]
            )

        else:

            local_values = (
                shap_array[0]
            )


    # ========================================================
    # BUILD EXPLANATIONS
    # ========================================================

    explanations = []


    for (
        feature,
        value,
        shap_value
    ) in zip(

        input_data.columns,

        input_data.iloc[0].values,

        local_values,

    ):

        shap_value = float(
            shap_value
        )


        if shap_value > 0:

            impact = "positive"

        elif shap_value < 0:

            impact = "negative"

        else:

            impact = "neutral"


        explanations.append(

            {

                "feature":
                    feature,

                "value":
                    round(
                        float(value),
                        4,
                    ),

                "shap_value":
                    round(
                        shap_value,
                        6,
                    ),

                "impact":
                    impact,

            }

        )


    # ========================================================
    # SORT BY IMPACT
    # ========================================================

    explanations.sort(

        key=lambda x:
            abs(
                x["shap_value"]
            ),

        reverse=True,

    )


    return {

        "predicted_fertility":
            predicted_fertility,

        "explanation":
            explanations,

    }


# ============================================================
# WHAT-IF ANALYSIS
# ============================================================

@app.post("/what-if")
def what_if_analysis(
    data: WhatIfInput
):

    allowed_parameters = [

        "N",

        "P",

        "K",

        "pH",

    ]


    if (
        data.parameter
        not in allowed_parameters
    ):

        return {

            "error": (
                "Parameter must be one of: "
                "N, P, K, pH"
            )

        }


    # ========================================================
    # BASELINE
    # ========================================================

    baseline_input = pd.DataFrame(

        [[

            data.N,

            data.P,

            data.K,

            data.pH,

            data.EC,

            data.OC,

            data.S,

            data.Zn,

            data.Fe,

            data.Cu,

            data.Mn,

            data.B,

        ]],

        columns=[

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

            "B",

        ],

    )


    baseline_prediction = (
        fertility_model.predict(
            baseline_input
        )[0]
    )


    baseline_probabilities = (
        fertility_model.predict_proba(
            baseline_input
        )[0]
    )


    baseline_class = (
        FERTILITY_CLASSES[
            int(
                baseline_prediction
            )
        ]
    )


    # ========================================================
    # MODIFIED INPUT
    # ========================================================

    modified_values = {

        "N": data.N,

        "P": data.P,

        "K": data.K,

        "pH": data.pH,

        "EC": data.EC,

        "OC": data.OC,

        "S": data.S,

        "Zn": data.Zn,

        "Fe": data.Fe,

        "Cu": data.Cu,

        "Mn": data.Mn,

        "B": data.B,

    }


    modified_values[
        data.parameter
    ] = data.new_value


    modified_input = pd.DataFrame(

        [[

            modified_values["N"],

            modified_values["P"],

            modified_values["K"],

            modified_values["pH"],

            modified_values["EC"],

            modified_values["OC"],

            modified_values["S"],

            modified_values["Zn"],

            modified_values["Fe"],

            modified_values["Cu"],

            modified_values["Mn"],

            modified_values["B"],

        ]],

        columns=[

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

            "B",

        ],

    )


    modified_prediction = (
        fertility_model.predict(
            modified_input
        )[0]
    )


    modified_probabilities = (
        fertility_model.predict_proba(
            modified_input
        )[0]
    )


    modified_class = (
        FERTILITY_CLASSES[
            int(
                modified_prediction
            )
        ]
    )


    # ========================================================
    # PROBABILITY DICTIONARIES
    # ========================================================

    baseline_probability_result = {

        FERTILITY_CLASSES[i]:

            round(
                float(
                    baseline_probabilities[i]
                ) * 100,
                2,
            )

        for i in range(
            len(
                baseline_probabilities
            )
        )
    }


    modified_probability_result = {

        FERTILITY_CLASSES[i]:

            round(
                float(
                    modified_probabilities[i]
                ) * 100,
                2,
            )

        for i in range(
            len(
                modified_probabilities
            )
        )
    }


    return {

        "parameter":
            data.parameter,

        "old_value":
            getattr(
                data,
                data.parameter
            ),

        "new_value":
            data.new_value,

        "baseline_prediction":
            baseline_class,

        "baseline_probabilities":
            baseline_probability_result,

        "new_prediction":
            modified_class,

        "new_probabilities":
            modified_probability_result,

    }
    # ============================================================
# END OF API
# ============================================================

# The backend is ready to be started with:
#
# uvicorn backend.main:app --reload
#
# Swagger documentation:
#
# http://127.0.0.1:8000/docs
#
# Dynamic translation endpoint:
#
# POST /translate
#
# Supported languages:
# English (en)
# Telugu  (te)
# Hindi   (hi)