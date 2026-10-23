const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

export type SoilInput = {
  N: number;
  P: number;
  K: number;
  pH: number;
  EC: number;
  OC: number;
  S: number;
  Zn: number;
  Fe: number;
  Cu: number;
  Mn: number;
  B: number;

  temperature: number;
  humidity: number;
  rainfall: number;
};

export type AnalysisResult = {
  predicted_fertility: string;

  fertility_probabilities: Record<
    string,
    number
  >;

  crop_recommendations: Array<{
    crop: string;
    probability: number;
  }>;

  recommended_crop: string;

  fertilizer_guidance: string[];

  shap_explanation?: Array<{
    feature?: string;
    name?: string;
    shap_value?: number;
    value?: number;
  }>;
};

async function request(
  path: string,
  body?: unknown
) {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      method: body ? 'POST' : 'GET',

      headers: body
        ? {
            'Content-Type':
              'application/json',
          }
        : undefined,

      body: body
        ? JSON.stringify(body)
        : undefined,
    }
  );

  if (!response.ok) {
    let message =
      'Request failed';

    try {
      const data =
        await response.json();

      message =
        data?.detail ||
        message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

/*
 * ---------------------------------------------------------
 * FERTILITY
 * ---------------------------------------------------------
 */

export const predictFertility = (
  data: SoilInput
) =>
  request(
    '/predict-fertility',
    data
  );

/*
 * ---------------------------------------------------------
 * CROP RECOMMENDATION
 * ---------------------------------------------------------
 */

export const recommendCrop = (
  data: SoilInput
) =>
  request(
    '/recommend-crop',
    data
  );

/*
 * ---------------------------------------------------------
 * COMPLETE SOIL ANALYSIS
 * ---------------------------------------------------------
 */

export const analyzeSoil = (
  data: SoilInput
) =>
  request(
    '/analyze-soil',
    data
  );

/*
 * ---------------------------------------------------------
 * SHAP EXPLANATION
 * ---------------------------------------------------------
 */

export const explainSoil = (
  data: SoilInput
) =>
  request(
    '/explain',
    data
  );

/*
 * ---------------------------------------------------------
 * WHAT-IF ANALYSIS
 * ---------------------------------------------------------
 */

export const whatIf = (
  data: SoilInput & {
    parameter: string;
    new_value: number;
  }
) =>
  request(
    '/what-if',
    data
  );

export {
  API_BASE,
};