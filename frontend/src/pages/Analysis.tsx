import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

import {
  analyzeSoil,
  explainSoil,
  SoilInput,
} from '../services/api';

const initial: SoilInput = {
  N: 270,
  P: 7.9,
  K: 253,
  pH: 7.48,
  EC: 0.57,
  OC: 0.59,
  S: 3.1,
  Zn: 0.24,
  Fe: 2.49,
  Cu: 0.52,
  Mn: 7.74,
  B: 0.14,

  temperature: 25,
  humidity: 80,
  rainfall: 200,
};

const groups = [
  {
    title: 'Primary Nutrients',
    fields: [
      ['N', 'Nitrogen (N)'],
      ['P', 'Phosphorus (P)'],
      ['K', 'Potassium (K)'],
    ],
  },

  {
    title: 'Soil Properties',
    fields: [
      ['pH', 'pH'],
      ['EC', 'Electrical Conductivity (EC)'],
      ['OC', 'Organic Carbon (OC)'],
      ['S', 'Sulfur (S)'],
      ['Zn', 'Zinc (Zn)'],
      ['Fe', 'Iron (Fe)'],
      ['Cu', 'Copper (Cu)'],
      ['Mn', 'Manganese (Mn)'],
      ['B', 'Boron (B)'],
    ],
  },

  {
    title: 'Environmental Conditions',
    fields: [
      ['temperature', 'Temperature'],
      ['humidity', 'Humidity'],
      ['rainfall', 'Rainfall'],
    ],
  },
] as any[];

export default function Analysis() {
  const { t } = useLanguage();

  const {
    soil,
    setSoil,
    setResult,
  } = useApp();

  const navigate = useNavigate();

  const [data, setData] = useState<SoilInput>(
    soil || initial
  );

  const [step, setStep] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const group = groups[step];

  /* =========================================================
     UPDATE INPUT
  ========================================================= */

  const update = (
    key: keyof SoilInput,
    value: string
  ) => {
    const numericValue =
      value === '' ? 0 : Number(value);

    setData((current) => ({
      ...current,
      [key]: Number.isFinite(numericValue)
        ? numericValue
        : 0,
    }));
  };

  /* =========================================================
     VALIDATE INPUT
  ========================================================= */

  const validateData = () => {
    const requiredSoilFields: (keyof SoilInput)[] = [
      'N',
      'P',
      'K',
      'pH',
      'EC',
      'OC',
      'S',
      'Zn',
      'Fe',
      'Cu',
      'Mn',
      'B',
    ];

    for (const field of requiredSoilFields) {
      const value = data[field];

      if (
        typeof value !== 'number' ||
        !Number.isFinite(value)
      ) {
        return `${field} must contain a valid number.`;
      }
    }

    if (data.pH < 0 || data.pH > 14) {
      return 'pH must be between 0 and 14.';
    }

    if (data.temperature < -50 || data.temperature > 70) {
      return 'Please enter a valid temperature.';
    }

    if (
      data.humidity < 0 ||
      data.humidity > 100
    ) {
      return 'Humidity must be between 0 and 100%.';
    }

    if (data.rainfall < 0) {
      return 'Rainfall cannot be negative.';
    }

    return '';
  };

  /* =========================================================
     SUBMIT ANALYSIS
  ========================================================= */

  const submit = async () => {
    setLoading(true);
    setError('');

    const validationError = validateData();

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      /*
       * Send the complete soil report + environmental
       * conditions to FastAPI.
       */

      const apiResult = await analyzeSoil(data);

      /*
       * SHAP is a separate request.
       * If SHAP fails, the main analysis still succeeds.
       */

      let shapExplanation: any[] = [];

      try {
        const shapResult = await explainSoil(data);

        shapExplanation =
          shapResult?.explanation || [];
      } catch (shapError) {
        console.warn(
          'SHAP explanation failed:',
          shapError
        );

        shapExplanation = [];
      }

      /*
       * Normalize backend response into the structure
       * used by the Results page.
       */

      const normalizedResult = {
        predicted_fertility:
          apiResult?.fertility?.prediction ||
          apiResult?.predicted_fertility ||
          'Unknown',

        fertility_probabilities:
          apiResult?.fertility?.probabilities ||
          apiResult?.fertility_probabilities ||
          {},

        crop_recommendations:
          apiResult?.crop_recommendation?.top_3 ||
          apiResult?.crop_recommendations ||
          [],

        recommended_crop:
          apiResult?.crop_recommendation
            ?.recommended_crop ||
          '',

        fertilizer_guidance:
          apiResult?.fertilizer_guidance ||
          [],

        shap_explanation:
          shapExplanation,
      };

      /*
       * Save current soil data.
       */

      setSoil(data);

      /*
       * Save complete analysis result.
       */

      setResult(normalizedResult);

      /*
       * Go to Results page.
       */

      navigate('/results');

    } catch (error: any) {
      console.error(
        'Soil analysis failed:',
        error
      );

      setError(
        error?.message ||
        'Unable to connect to the analysis server.'
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="page">

      <div className="page-head">

        <span className="eyebrow">
          {t('analysis.eyebrow')}
        </span>

        <h1>
          {t('analysis.title')}
        </h1>

        <p>
          {t('analysis.desc')}
        </p>

      </div>

      {/* =====================================================
          NOTICE
      ===================================================== */}

      <div className="notice">
        <AlertCircle size={18} />

        <span>
          {t('analysis.notice')}
        </span>
      </div>

      {/* =====================================================
          STEPPER
      ===================================================== */}

      <div className="stepper">

        {groups.map(
          (groupItem, index) => (
            <div
              className={
                index === step
                  ? 'step active'
                  : index < step
                    ? 'step done'
                    : 'step'
              }
              key={groupItem.title}
            >

              <span>
                {index < step ? (
                  <CheckCircle2 size={16} />
                ) : (
                  index + 1
                )}
              </span>

              {t(
                `analysis.group${index + 1}`
              )}

            </div>
          )
        )}

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="form-card">

        <div className="form-head">

          <div>

            <h2>
              {t(
                `analysis.group${step + 1}`
              )}
            </h2>

            <p>
              {step === 0
                ? t(
                    'analysis.primaryHelp'
                  )
                : step === 1
                  ? t(
                      'analysis.propertiesHelp'
                    )
                  : t(
                      'analysis.environmentHelp'
                    )}
            </p>

          </div>

          <span className="step-count">
            {step + 1} / 3
          </span>

        </div>

        <div className="form-grid">

          {group.fields.map(
            ([key, label]: any) => (

              <label
                className="field"
                key={key}
              >

                <span>
                  {t(`field.${key}`) ||
                    label}
                </span>

                <input
                  type="number"
                  step="any"
                  value={
                    (data as any)[key]
                  }
                  onChange={(event) =>
                    update(
                      key,
                      event.target.value
                    )
                  }
                />

                <small>

                  {key === 'pH'
                    ? 'soil pH'
                    : key === 'temperature'
                      ? '°C'
                      : key === 'humidity'
                        ? '%'
                        : key === 'rainfall'
                          ? 'mm'
                          : ''}

                </small>

              </label>

            )
          )}

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="error-box">

            <AlertCircle size={17} />

            <span>
              {error}
            </span>

          </div>

        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="form-actions">

          {step > 0 ? (

            <button
              className="btn ghost"
              onClick={() =>
                setStep(step - 1)
              }
              disabled={loading}
            >
              <ChevronLeft size={17} />

              {t('common.back')}

            </button>

          ) : (
            <span />
          )}

          {step < 2 ? (

            <button
              className="btn primary"
              onClick={() =>
                setStep(step + 1)
              }
              disabled={loading}
            >
              {t('common.continue')}

              <ChevronRight size={17} />
            </button>

          ) : (

            <button
              className="btn primary"
              disabled={loading}
              onClick={submit}
            >

              {loading ? (
                <>
                  <Loader2
                    className="spin"
                    size={17}
                  />

                  {t(
                    'analysis.analyzing'
                  )}
                </>
              ) : (
                <>
                  {t(
                    'analysis.analyze'
                  )}

                  <ChevronRight
                    size={17}
                  />
                </>
              )}

            </button>

          )}

        </div>

      </div>

    </div>
  );
}