import { Link, useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  Download,
  RefreshCw,
  Save,
  Info,
  TrendingUp,
  Leaf,
  X,
  Calculator,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { useState } from 'react';

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type FertilizerType =
  | 'Urea'
  | 'DAP'
  | 'SSP'
  | 'MOP'
  | 'Zinc Sulphate'
  | 'Borax';

type FertilizerInfo = {
  name: FertilizerType;
  nutrient: string;
  reason: string;
  usage: string;
  referenceRate: number | null;
  referenceCrop: string;
  unit: string;
};

export default function Results() {
  const { soil, result, saveAnalysis } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedFertilizer, setSelectedFertilizer] =
    useState<FertilizerInfo | null>(null);

  const [landArea, setLandArea] = useState<number>(1);

  const [landUnit, setLandUnit] =
    useState<'acre' | 'hectare'>('acre');

  /*
   * ---------------------------------------------------------
   * FERTILITY
   * ---------------------------------------------------------
   */

  const localizeClass = (name: string) =>
    name === 'Less Fertile'
      ? t('results.lessFertile')
      : name === 'Fertile'
        ? t('results.fertile')
        : name === 'Highly Fertile'
          ? t('results.highlyFertile')
          : name;

  if (!result || !soil) {
    return (
      <div className="empty-state">
        <h2>{t('results.noData')}</h2>

        <Link
          className="btn primary"
          to="/analysis"
        >
          {t('results.start')}
        </Link>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * FERTILITY PROBABILITIES
   * ---------------------------------------------------------
   */

  const probabilities = Object.entries(
    result.fertility_probabilities || {}
  )
    .map(([name, value]) => ({
      name,
      value: Number(value),
    }))
    .filter((item) =>
      Number.isFinite(item.value)
    );

  const predicted =
    result.predicted_fertility ||
    'Unknown';

  const modelProbability =
    probabilities.find(
      (item) =>
        item.name === predicted
    )?.value ?? 0;

  /*
   * ---------------------------------------------------------
   * CROP RECOMMENDATION
   * ---------------------------------------------------------
   */

  const crops = Array.isArray(
    result.crop_recommendations
  )
    ? result.crop_recommendations
    : [];

  /*
   * ---------------------------------------------------------
   * SHAP EXPLANATION
   * ---------------------------------------------------------
   */

  const explanation =
    result.shap_explanation ||
    result.explanation ||
    [];

  /*
   * ---------------------------------------------------------
   * FERTILIZER RECOMMENDATIONS
   *
   * These recommendations are dynamic according
   * to the current soil readings.
   * ---------------------------------------------------------
   */

  const fertilizerRecommendations:
    FertilizerInfo[] = [];

  /*
   * ---------------------------------------------------------
   * NITROGEN
   * ---------------------------------------------------------
   */

  if (soil.N < 200) {
    fertilizerRecommendations.push({
      name: 'Urea',
      nutrient: 'Nitrogen (N)',
      reason:
        'Your measured nitrogen value is relatively low according to the threshold currently used by this project.',
      usage:
        'Urea is a concentrated nitrogen fertilizer. It is commonly applied to supply nitrogen to crops. Application should be based on the crop, soil-test recommendation and growth stage.',
      referenceRate: 80,
      referenceCrop: 'Rice',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * PHOSPHORUS
   * ---------------------------------------------------------
   */

  if (soil.P < 10) {
    fertilizerRecommendations.push({
      name: 'DAP',
      nutrient:
        'Phosphorus (P) + Nitrogen (N)',
      reason:
        'Your measured phosphorus value is relatively low according to the threshold currently used by this project.',
      usage:
        'DAP supplies phosphorus along with nitrogen. It can be used as a phosphorus source, but the correct rate depends on crop nutrient requirements and the soil-test recommendation.',
      referenceRate: 130,
      referenceCrop: 'Rice',
      unit: 'kg/ha',
    });

    fertilizerRecommendations.push({
      name: 'SSP',
      nutrient:
        'Phosphorus (P) + Sulphur (S)',
      reason:
        'SSP is another phosphorus-containing fertilizer option and can also supply sulphur.',
      usage:
        'SSP can be considered where phosphorus is deficient, particularly where sulphur supply is also relevant. The actual quantity should follow the crop-specific soil-test recommendation.',
      referenceRate: null,
      referenceCrop: 'Crop-specific',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * POTASSIUM
   * ---------------------------------------------------------
   */

  if (soil.K < 200) {
    fertilizerRecommendations.push({
      name: 'MOP',
      nutrient: 'Potassium (K)',
      reason:
        'Your measured potassium value is relatively low according to the threshold currently used by this project.',
      usage:
        'MOP, or Muriate of Potash, is a potassium fertilizer. It is commonly used to supply potassium according to crop and soil requirements.',
      referenceRate: 50,
      referenceCrop: 'Rice',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * ZINC
   * ---------------------------------------------------------
   */

  if (soil.Zn < 0.6) {
    fertilizerRecommendations.push({
      name: 'Zinc Sulphate',
      nutrient: 'Zinc (Zn)',
      reason:
        'Your measured zinc value is relatively low according to the project threshold.',
      usage:
        'Zinc sulphate is used as a zinc source where zinc deficiency is identified. The correct rate depends on crop, soil condition and the soil-test recommendation.',
      referenceRate: 10,
      referenceCrop: 'Rice',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * BORON
   * ---------------------------------------------------------
   */

  if (soil.B < 0.2) {
    fertilizerRecommendations.push({
      name: 'Borax',
      nutrient: 'Boron (B)',
      reason:
        'Your measured boron value is relatively low according to the project threshold.',
      usage:
        'Borax can supply boron where deficiency has been identified. Boron should be applied carefully because excessive boron can also harm crops.',
      referenceRate: null,
      referenceCrop: 'Crop-specific',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * NO MAJOR DEFICIENCY
   * ---------------------------------------------------------
   */

  if (
    fertilizerRecommendations.length === 0
  ) {
    fertilizerRecommendations.push({
      name: 'Urea',
      nutrient: 'Nitrogen (N)',
      reason:
        'No major N, P or K deficiency was identified by the current project thresholds.',
      usage:
        'No additional fertilizer should be applied solely because the AI system exists. Follow the soil-test recommendation and crop requirement.',
      referenceRate: null,
      referenceCrop: 'Not applicable',
      unit: 'kg/ha',
    });
  }

  /*
   * ---------------------------------------------------------
   * AREA CALCULATOR
   * ---------------------------------------------------------
   */

  const areaInHectares =
    landUnit === 'acre'
      ? Number(landArea) * 0.404686
      : Number(landArea);

  const calculatedQuantity =
    selectedFertilizer?.referenceRate !==
      null &&
    selectedFertilizer?.referenceRate !==
      undefined &&
    Number.isFinite(areaInHectares)
      ? selectedFertilizer.referenceRate *
        Math.max(areaInHectares, 0)
      : null;

  /*
   * ---------------------------------------------------------
   * ENVIRONMENT
   * ---------------------------------------------------------
   */

  const environmentCards = [
    [
      t('results.temperature'),
      soil.temperature,
      '°C',
    ],
    [
      t('results.humidity'),
      soil.humidity,
      '%',
    ],
    [
      t('results.rainfall'),
      soil.rainfall,
      'mm',
    ],
  ];

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const replaceCategory = (text: string) =>
    text.replace(
      '{category}',
      localizeClass(predicted)
    );

  const print = () => window.print();

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <>
      <div className="page print-area">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="result-top">

          <div>

            <span className="eyebrow">
              {t('results.eyebrow')}
            </span>

            <h1>
              {t('results.title')}
            </h1>

            <p>
              {t('results.desc')}
            </p>

          </div>

          <div className="result-actions">

            <button
              className="btn ghost"
              onClick={async () => {
                if (!user) {
                  navigate('/login');
                  return;
                }

                await saveAnalysis();
              }}
            >
              <Save size={16} />

              {t('results.save')}
            </button>

            <button
              className="btn ghost"
              onClick={print}
            >
              <Download size={16} />

              {t('results.pdf')}
            </button>

            <Link
              className="btn primary"
              to="/analysis"
            >
              <RefreshCw size={16} />

              {t('results.new')}
            </Link>

          </div>

        </div>

        {/* =================================================
            FERTILITY RESULT
            ================================================= */}

        <section className="result-hero farmer-result-hero result-classification-only">

          <div>

            <span className="eyebrow">
              {t('results.fertility')}
            </span>

            <div className="fertility-name">
              {localizeClass(predicted)}
            </div>

            <p>
              {t('results.confidence')}
            </p>

          </div>

          <div className="classification-icon">
            <Leaf size={40} />
          </div>

        </section>

        {/* =================================================
            WHAT DOES THIS RESULT MEAN?
            ================================================= */}

        <section className="result-section explanation-card">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t('results.fertility')}
            </span>

            <h2>
              {t('results.meaningTitle')}
            </h2>

            <p>
              {replaceCategory(
                t('results.soilMeaning')
              )}
            </p>

          </div>

        </section>

        {/* =================================================
            MODEL PROBABILITY
            ================================================= */}

        <section className="result-section probability-section">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t('results.probability')}
            </span>

            <h2>
              {t(
                'results.probabilityTitle'
              )}
            </h2>

            <p>
              {t(
                'results.modelProbabilityNote'
              )}
            </p>

          </div>

          <div className="probability-highlight">

            <strong>
              {localizeClass(predicted)}
            </strong>

            <span>
              {modelProbability}%{' '}
              {t(
                'results.modelProbability'
              )}
            </span>

          </div>

          <div className="prob-bars">

            {probabilities.map(
              (item) => (

                <div
                  className="prob-row"
                  key={item.name}
                >

                  <div>

                    <span>
                      {localizeClass(
                        item.name
                      )}
                    </span>

                    <strong>
                      {item.value}%
                    </strong>

                  </div>

                  <div className="bar">

                    <i
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            item.value
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

          <div className="disclaimer">

            <Info size={17} />

            <span>
              {t(
                'results.probabilityClarifier'
              )}
            </span>

          </div>

        </section>

        {/* =================================================
            FARMER SUMMARY
            ================================================= */}

        <section className="result-section farmer-summary">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t(
                'results.farmerSummary'
              )}
            </span>

            <h2>
              {t(
                'results.farmerTitle'
              )}
            </h2>

            <p>
              {replaceCategory(
                t(
                  'results.farmerSummaryBody'
                )
              )}
            </p>

          </div>

        </section>

        {/* =================================================
            ENVIRONMENT
            ================================================= */}

        <section className="result-section">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t(
                'results.environmentSummary'
              )}
            </span>

            <h2>
              {t(
                'results.environmentSummary'
              )}
            </h2>

            <p>
              {t(
                'results.environmentNote'
              )}
            </p>

          </div>

          <div className="environment-grid">

            {environmentCards.map(
              ([name, value, unit]) => (

                <div
                  className="environment-card"
                  key={String(name)}
                >

                  <span>
                    {String(name)}
                  </span>

                  <strong>
                    {String(value)}{' '}

                    <small>
                      {String(unit)}
                    </small>

                  </strong>

                </div>

              )
            )}

          </div>

        </section>

        {/* =================================================
            CROP RECOMMENDATIONS
            EXACTLY 3
            ================================================= */}

        <section className="result-section">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t(
                'results.cropsEyebrow'
              )}
            </span>

            <h2>
              {t(
                'results.cropsTitle'
              )}
            </h2>

            <p>
              {t(
                'results.cropsNote'
              )}
            </p>

          </div>

          <div className="crop-grid">

            {crops
              .slice(0, 3)
              .map(
                (
                  crop: any,
                  index: number
                ) => (

                  <div
                    className="crop-card"
                    key={
                      crop.crop ||
                      crop.label ||
                      index
                    }
                  >

                    <span className="crop-rank">
                      0{index + 1}
                    </span>

                    <span className="crop-emoji">
                      {index === 0
                        ? '🌾'
                        : index === 1
                          ? '🍇'
                          : '☕'}
                    </span>

                    <h3>
                      {crop.crop ||
                        crop.label ||
                        'Crop'}
                    </h3>

                    <strong>
                      {Number(
                        crop.probability ??
                          crop.score ??
                          0
                      ).toFixed(1)}
                      %
                    </strong>

                    <small>
                      {t(
                        'results.modelProbability'
                      )}
                    </small>

                    <p className="crop-probability-help">

                      {index === 0
                        ? t(
                            'results.cropTopProbabilityHelp'
                          )
                        : t(
                            'results.cropOtherProbabilityHelp'
                          )}

                    </p>

                  </div>

                )
              )}

          </div>

        </section>

        {/* =================================================
            FERTILIZER RECOMMENDATIONS
            ================================================= */}

        <section className="result-section">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t('results.fertilizerEyebrow')}
            </span>

            <h2>
              {t('results.recommendedFertilizers')}
            </h2>

            <p>
              {t('results.fertilizerSectionNote')}
            </p>

          </div>

          <div className="guidance-grid fertilizer-grid">

            {fertilizerRecommendations.map(
              (
                fertilizer,
                index
              ) => (

                <button
                  type="button"
                  className="guidance-card fertilizer-card"
                  key={`${fertilizer.name}-${index}`}
                  onClick={() => {
                    setSelectedFertilizer(
                      fertilizer
                    );

                    setLandArea(1);

                    setLandUnit(
                      'acre'
                    );
                  }}
                >

                  <div className="guidance-head">

                    <span>
                      {fertilizer.nutrient}
                    </span>

                    <span className="status">
                      {t(
                        'results.viewDetails'
                      )}
                    </span>

                  </div>

                  <div className="fertilizer-icon">
                    🧪
                  </div>

                  <h3>
                    {fertilizer.name}
                  </h3>

                  <p>
                    {fertilizer.reason}
                  </p>

                  <span className="fertilizer-click">

                    {t(
                      'results.clickForDetails'
                    )}

                    <ArrowRight
                      size={15}
                    />

                  </span>

                </button>

              )
            )}

          </div>

          <div className="disclaimer">

            <Info size={17} />

            <span>
              {t(
                'results.fertilizerDisclaimer'
              )}
            </span>

          </div>

        </section>

        {/* =================================================
            SHAP EXPLAINABILITY
            ================================================= */}

        <section className="result-section">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t(
                'results.shapEyebrow'
              )}
            </span>

            <h2>
              {t(
                'results.shapTitle'
              )}
            </h2>

            <p>
              {t(
                'results.shapNote'
              )}
            </p>

          </div>

          {explanation.length ? (

            <ResponsiveContainer
              width="100%"
              height={360}
            >

              <BarChart
                data={explanation
                  .slice(0, 10)
                  .map(
                    (item: any) => ({
                      feature:
                        item.feature ||
                        item.name ||
                        'Feature',

                      impact: Number(
                        item.shap_value ??
                          item.value ??
                          0
                      ),
                    })
                  )
                  .filter(
                    (item: any) =>
                      Number.isFinite(
                        item.impact
                      )
                  )
                  .sort(
                    (
                      a: any,
                      b: any
                    ) =>
                      Math.abs(
                        b.impact
                      ) -
                      Math.abs(
                        a.impact
                      )
                  )}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 30,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  type="number"
                />

                <YAxis
                  dataKey="feature"
                  type="category"
                  width={70}
                />

                <Tooltip />

                <Bar
                  dataKey="impact"
                  fill="#2f7d4a"
                  radius={[
                    0,
                    5,
                    5,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <p className="muted">
              {t(
                'results.shapUnavailable'
              )}
            </p>

          )}

        </section>

        {/* =================================================
            NEXT STEPS
            ================================================= */}

        <section className="result-section next-steps-card">

          <div className="section-heading compact">

            <span className="eyebrow">
              {t('results.whatToDo')}
            </span>

            <h2>
              {t('results.whatToDo')}
            </h2>

          </div>

          <div className="next-steps-grid">

            {[
              t('results.next1'),
              t('results.next2'),
              t('results.next3'),
              t('results.next4'),
            ].map(
              (
                text,
                index
              ) => (

                <div
                  className="next-step"
                  key={index}
                >

                  <span>
                    0{index + 1}
                  </span>

                  <p>
                    {text}
                  </p>

                </div>

              )
            )}

          </div>

        </section>

        {/* =================================================
            FINAL DISCLAIMER
            ================================================= */}

        <div className="disclaimer final-disclaimer">

          <Info size={18} />

          <span>
            {t(
              'results.fertilizerFinalDisclaimer'
            )}
          </span>

        </div>

        {/* =================================================
            BOTTOM ACTIONS
            ================================================= */}

        <div className="result-bottom">

          <Link
            className="btn primary"
            to="/what-if"
          >
            {t('results.whatIf')}

            <ArrowRight size={17} />

          </Link>

          <Link
            className="btn ghost"
            to="/history"
          >
            {t('results.history')}

            <TrendingUp size={17} />

          </Link>

        </div>

      </div>

      {/* =====================================================
          FERTILIZER DETAIL POPUP
          ===================================================== */}

      {selectedFertilizer && (

        <div
          className="fertilizer-modal-overlay"
          onClick={() =>
            setSelectedFertilizer(null)
          }
        >

          <div
            className="fertilizer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="fertilizer-modal-header">

              <div>

                <span className="eyebrow">
                  {t(
                    'results.fertilizerDetails'
                  )}
                </span>

                <h2>
                  {selectedFertilizer.name}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedFertilizer(null)
                }
                aria-label={t(
                  'results.close'
                )}
              >
                <X size={22} />
              </button>

            </div>

            {/* NUTRIENT */}

            <div className="fertilizer-detail-box">

              <span>
                {t(
                  'results.nutrientSupplied'
                )}
              </span>

              <strong>
                {selectedFertilizer.nutrient}
              </strong>

            </div>

            {/* WHY */}

            <div className="fertilizer-detail-section">

              <h3>
                {t(
                  'results.whyRecommended'
                )}
              </h3>

              <p>
                {selectedFertilizer.reason}
              </p>

            </div>

            {/* HOW */}

            <div className="fertilizer-detail-section">

              <h3>
                {t(
                  'results.howUsed'
                )}
              </h3>

              <p>
                {selectedFertilizer.usage}
              </p>

            </div>

            {/* CALCULATOR */}

            <div className="fertilizer-calculator">

              <div className="calculator-title">

                <Calculator size={20} />

                <h3>
                  {t(
                    'results.landQuantityCalculator'
                  )}
                </h3>

              </div>

              {selectedFertilizer.referenceRate !==
                null ? (

                <>

                  <p className="calculator-note">

                    {t(
                      'results.referenceRate'
                    )}

                    {' '}

                    <strong>
                      {
                        selectedFertilizer.referenceRate
                      }{' '}
                      {
                        selectedFertilizer.unit
                      }
                    </strong>

                    {' '}

                    {t(
                      'results.forCrop'
                    )}

                    {' '}

                    <strong>
                      {
                        selectedFertilizer.referenceCrop
                      }
                    </strong>

                  </p>

                  <div className="calculator-inputs">

                    <div>

                      <label>
                        {t(
                          'results.landArea'
                        )}
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={landArea}
                        onChange={(event) =>
                          setLandArea(
                            Number(
                              event.target.value
                            )
                          )
                        }
                      />

                    </div>

                    <div>

                      <label>
                        {t(
                          'results.unit'
                        )}
                      </label>

                      <select
                        value={landUnit}
                        onChange={(event) =>
                          setLandUnit(
                            event.target.value as
                              | 'acre'
                              | 'hectare'
                          )
                        }
                      >

                        <option value="acre">
                          {t(
                            'results.acre'
                          )}
                        </option>

                        <option value="hectare">
                          {t(
                            'results.hectare'
                          )}
                        </option>

                      </select>

                    </div>

                  </div>

                  <div className="calculator-result">

                    <span>
                      {t(
                        'results.estimatedReferenceQuantity'
                      )}
                    </span>

                    <strong>

                      {calculatedQuantity !==
                      null
                        ? calculatedQuantity.toFixed(
                            2
                          )
                        : '0.00'}{' '}
                      kg

                    </strong>

                  </div>

                  <p className="calculator-warning">

                    {t(
                      'results.calculatorWarning'
                    )}

                  </p>

                </>

              ) : (

                <div className="calculator-warning">

                  <strong>
                    {t(
                      'results.quantityNotCalculated'
                    )}
                  </strong>

                  <p>
                    {t(
                      'results.quantityNotCalculatedNote'
                    )}
                  </p>

                </div>

              )}

            </div>

            {/* APPLICATION GUIDANCE */}

            <div className="fertilizer-detail-section">

              <h3>
                {t(
                  'results.applicationGuidance'
                )}
              </h3>

              <ul className="fertilizer-steps">

                <li>
                  {t(
                    'results.applicationStep1'
                  )}
                </li>

                <li>
                  {t(
                    'results.applicationStep2'
                  )}
                </li>

                <li>
                  {t(
                    'results.applicationStep3'
                  )}
                </li>

                <li>
                  {t(
                    'results.applicationStep4'
                  )}
                </li>

              </ul>

            </div>

            {/* FOOTER */}

            <div className="fertilizer-modal-footer">

              <button
                type="button"
                className="btn primary"
                onClick={() =>
                  setSelectedFertilizer(null)
                }
              >
                {t(
                  'results.close'
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}