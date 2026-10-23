export const en = {
  nav: {
    home: 'Home',
    analysis: 'Soil Analysis',
    upload: 'Upload Report',
    whatIf: 'What-If',
    history: 'History',
    how: 'How It Works',
    about: 'About',
    login: 'Login',
    profile: 'Profile',
  },

  common: {
    back: 'Back',
    continue: 'Continue',
    loading: 'Analyzing...',
    analyze: 'Analyze',
  },

  home: {
    eyebrow: 'AI-POWERED SOIL INTELLIGENCE',
    title: 'Understand your soil. Make better farming decisions.',
    desc: 'Turn soil laboratory values into a clear fertility assessment, crop suggestions, and explainable nutrient guidance.',
    start: 'Start Soil Analysis',
    how: 'How It Works',
    trust1: 'Built for clear decision support',
    trust2: 'Explainable ML workflow',
    preview: 'Current sample',
    featuresEyebrow: 'WHY SOILSENSE',
    featuresTitle: 'Everything in one clear workflow',
    featuresDesc: 'A practical interface for turning soil data into understandable agricultural insights.',
    card1: 'Soil Fertility',
    card1d: 'See the predicted fertility category with probability scores.',
    card2: 'Explainable AI',
    card2d: 'Understand which soil factors influenced the prediction.',
    card3: 'Crop Recommendations',
    card3d: 'Get crop suggestions using soil and environmental conditions.',
    card4: 'Nutrient Guidance',
    card4d: 'See clear project-based guidance for key nutrients.',
    fertile: 'Fertile',
    processEyebrow: 'SIMPLE PROCESS',
    processTitle: 'From soil report to useful guidance',
    step1: 'Enter soil data',
    step1d: 'Use values from your soil laboratory report.',
    step2: 'Analyze the sample',
    step2d: 'The trained models process the soil and environmental inputs.',
    step3: 'Understand the result',
    step3d: 'See fertility, probabilities, crops and nutrient guidance.',
    step4: 'Explore the model',
    step4d: 'Use SHAP and What-If analysis to understand model behavior.',
    ctaEyebrow: 'READY TO BEGIN?',
    ctaTitle: 'Turn a soil report into a clearer picture.',
    ctaDesc: 'Start with the values already available in your laboratory report.',
  },

  analysis: {
    eyebrow: 'SOIL INPUT',
    title: 'Analyze Your Soil',
    desc: 'Enter the values from your soil laboratory report to understand fertility and possible crop options.',
    notice: 'Use the values exactly as reported by your soil laboratory. Do not guess missing values.',
    group1: 'Primary Nutrients',
    group2: 'Soil Properties',
    group3: 'Environmental Conditions',
    primaryHelp: 'The main macronutrient values used by the fertility model.',
    propertiesHelp: 'Enter the remaining soil-test properties required by the model.',
    environmentHelp: 'These conditions are used by the crop recommendation model.',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    ph: 'pH',
    ec: 'Electrical Conductivity (EC)',
    oc: 'Organic Carbon (OC)',
    s: 'Sulfur (S)',
    zn: 'Zinc (Zn)',
    fe: 'Iron (Fe)',
    cu: 'Copper (Cu)',
    mn: 'Manganese (Mn)',
    b: 'Boron (B)',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
    soilNote: 'Enter the values from your laboratory report.',
    environment: 'Environmental Conditions',
    envNote: 'These values are used for crop recommendation.',
    analyzing: 'Analyzing...',
    analyze: 'Analyze Soil',
  },

  field: {
    N: 'Nitrogen (N)',
    P: 'Phosphorus (P)',
    K: 'Potassium (K)',
    pH: 'pH',
    EC: 'Electrical Conductivity (EC)',
    OC: 'Organic Carbon (OC)',
    S: 'Sulfur (S)',
    Zn: 'Zinc (Zn)',
    Fe: 'Iron (Fe)',
    Cu: 'Copper (Cu)',
    Mn: 'Manganese (Mn)',
    B: 'Boron (B)',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
  },

  results: {
    lessFertile: 'Less Fertile',
    fertile: 'Fertile',
    highlyFertile: 'Highly Fertile',

    eyebrow: 'ANALYSIS COMPLETE',
    title: 'Soil Analysis Results',
    desc: 'A clear view of the model output and supporting agricultural guidance.',

    noData: 'No analysis is available yet.',
    start: 'Start Soil Analysis',
    save: 'Save',
    pdf: 'Print / PDF',
    new: 'New Analysis',

    fertility: 'SOIL FERTILITY CATEGORY',
    confidence: 'Predicted category',
    modelProbability: 'Model probability',

    probability: 'MODEL OUTPUT',
    probabilityTitle: 'How did the model classify your soil?',
    probabilityNote:
      'These percentages show the model probability for each category. They are not a percentage measurement of soil fertility.',

    meaningTitle: 'What does this result mean?',
    meaningBody:
      'SoilSense classifies this sample as Fertile because the measured soil values match the pattern the trained model associates with the Fertile category. It does not mean that the soil is 93% fertile.',

    farmerTitle: 'What should a farmer understand?',
    farmerBody:
      'The result is a model-based classification. Use it together with your soil-test report, crop conditions, water availability and local agricultural advice. The model does not replace a laboratory or agricultural expert.',

    cropsEyebrow: 'CROP RECOMMENDATION',
    cropsTitle: 'Recommended Crops',
    cropsNote:
      'Suggestions are based on the supplied soil and environmental inputs.',

    cropTopProbabilityHelp:
      'For these soil and environmental conditions, this crop received the highest model probability among the 22 crops evaluated.',

    cropOtherProbabilityHelp:
      'For these soil and environmental conditions, this crop also received a model probability, but lower than the crops ranked above it.',

    guidanceEyebrow: 'SOIL GUIDANCE',
    guidanceTitle: 'Nutrient Guidance',
    guidanceDisclaimer:
      'This is project-based guidance. Follow your soil-test recommendations and consult an agricultural professional before applying fertilizer.',

    /* Fertilizer section */
    fertilizerEyebrow: 'SOIL GUIDANCE',
    recommendedFertilizers: 'Recommended Fertilizers',
    fertilizerSectionNote:
      'Click a fertilizer to see its purpose, usage information and area-based quantity calculator.',
    viewDetails: 'View Details',
    clickForDetails: 'Click for details',
    fertilizerDisclaimer:
      'Fertilizer recommendations are project guidance. Confirm fertilizer choice and quantity using the crop-specific soil-test recommendation.',

    /* Fertilizer modal */
    fertilizerDetails: 'FERTILIZER DETAILS',
    nutrientSupplied: 'Nutrient supplied',
    whyRecommended: 'Why was this recommended?',
    howUsed: 'How is it used?',
    landQuantityCalculator: 'Land Quantity Calculator',
    referenceRate: 'Reference rate:',
    forCrop: 'for',
    landArea: 'Land area',
    unit: 'Unit',
    acre: 'Acre',
    hectare: 'Hectare',
    estimatedReferenceQuantity: 'Estimated reference quantity',

    calculatorWarning:
      'This converts the reference rate to the selected land area. It is not a universal fertilizer prescription for every crop or soil.',

    quantityNotCalculated:
      'Quantity not automatically calculated.',

    quantityNotCalculatedNote:
      'A safe quantity cannot be calculated from the soil value alone for this fertilizer. The correct rate depends on the crop, soil-test recommendation and local agricultural guidance.',

    applicationGuidance: 'Important application guidance',

    applicationStep1:
      'Confirm the fertilizer and dose against the soil-test recommendation.',

    applicationStep2:
      'Consider the crop and its current growth stage.',

    applicationStep3:
      'Avoid applying more fertilizer simply because the soil is classified as less fertile.',

    applicationStep4:
      'Follow crop-specific recommendations for split applications where required.',

    close: 'Close',

    fertilizerFinalDisclaimer:
      'Fertilizer quantities shown in the calculator are reference calculations. Confirm the actual dose using the crop-specific soil-test recommendation.',

    shapEyebrow: 'EXPLAINABLE AI',
    shapTitle: 'Why did the model make this prediction?',
    shapNote:
      'SHAP describes model behavior and feature influence. It is not proof of biological causation.',
    shapUnavailable: 'SHAP data is not available for this result.',

    whatIf: 'Explore What-If Analysis',
    history: 'View History',

    modelProbabilityNote:
      'Model probability shows how strongly the model favors each category. It is not a percentage measurement of soil fertility.',

    soilMeaning:
      'SoilSense classifies this sample as {category} based on the pattern of the measured soil properties. This is a machine-learning classification, not a laboratory fertility percentage.',

    nutrientSummary: 'Your Soil Nutrient Summary',
    primaryNutrients: 'Primary Nutrients',
    otherProperties: 'Other Soil Properties',

    soilPropertiesNote:
      'These are the laboratory values used as inputs to the soil analysis model.',

    whatToDo: 'What should you do next?',

    next1:
      'Review the nutrient values and the guidance for nutrients that are relatively low or high.',

    next2:
      'Consider the recommended crops together with season, water availability, local climate and farming conditions.',

    next3:
      'Follow your soil-test report before applying fertilizer. Do not use the AI output as a fertilizer dosage.',

    next4:
      'Keep future soil reports so you can compare changes in soil properties over time.',

    pHMeaning:
      'Soil pH indicates how acidic or alkaline the soil is and can affect nutrient availability.',

    environmentSummary: 'Environmental Inputs',

    environmentNote:
      'These values are used by the crop recommendation model.',

    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',

    probabilityClarifier:
      'These values are model probabilities, not percentages of soil fertility.',

    farmerSummary: 'Farmer Summary',

    farmerSummaryBody:
      'Your soil is classified as {category} by the SoilSense model. Review the nutrient guidance and crop suggestions below together with your soil-test report and local farming conditions.',
  },

  guidance: {
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',

    within: 'Within project threshold',
    low: 'Relatively low',
    high: 'Relatively high',

    nWithin:
      'Your measured nitrogen value is within the threshold currently used by this project.',

    nLow:
      'Your measured nitrogen value is relatively low compared with the threshold used by this project. Follow your soil-test recommendation before applying fertilizer.',

    nHigh:
      'Your measured nitrogen value is relatively high compared with the threshold used by this project. Avoid unnecessary nitrogen application and follow your soil-test recommendation.',

    pWithin:
      'Your measured phosphorus value is within the threshold currently used by this project.',

    pLow:
      'Your measured phosphorus value is relatively low compared with the threshold used by this project. Follow your soil-test recommendation before applying fertilizer.',

    pHigh:
      'Your measured phosphorus value is relatively high compared with the threshold used by this project. Follow your soil-test recommendation before applying additional phosphorus.',

    kWithin:
      'Your measured potassium value is within the threshold currently used by this project.',

    kLow:
      'Your measured potassium value is relatively low compared with the threshold used by this project. Follow your soil-test recommendation before applying fertilizer.',

    kHigh:
      'Your measured potassium value is relatively high compared with the threshold used by this project. Follow your soil-test recommendation before applying additional potassium.',
  },

  whatIf: {
    eyebrow: 'MODEL EXPLORATION',
    title: 'What-If Analysis',
    desc: 'Change one soil value and see how the trained model responds.',
    noData: 'Run a soil analysis first.',
    noDataDesc:
      'What-If analysis uses the current soil sample as its baseline.',
    changeTitle: 'Change one value',
    changeDesc:
      'Select a parameter and test a different value.',
    parameter: 'Parameter',
    newValue: 'New value',
    run: 'Analyze Change',
    running: 'Analyzing...',
    compare: 'COMPARISON',
    current: 'Current prediction',
    changed: 'After change',
    note: '',
    disclaimer:
      'This is a model-sensitivity tool, not a fertilizer dosage calculator.',
  },

  history: {
    eyebrow: 'YOUR LOCAL RECORDS',
    title: 'Analysis History',
    desc: 'Saved analyses are stored locally in this browser for quick reference.',
    empty: 'No saved analyses yet.',
    emptyDesc:
      'Save an analysis from the results page to see it here.',
    view: 'View',
    compareTitle: 'Compare reports',
    compareDesc:
      'The history structure is ready for report-to-report comparison as the next extension.',
    compareSoon: 'Comparison ready',
  },

  upload: {
    eyebrow: 'LAB REPORT',
    title: 'Upload a Soil Report',
    desc: 'Start from a text, CSV, PDF or image report, then verify extracted values before analysis.',
    choose: 'Choose a report',
    formats: 'PDF, image, CSV or TXT',
    reviewEyebrow: 'VERIFY BEFORE ANALYSIS',
    reviewTitle: 'Extracted values',
    verify: 'Manual verification',
    extract: 'Extract values',
    valuesFound:
      'values detected. Verify them before use.',
    noValues:
      'No recognizable values found. Enter the values manually.',
    ocrNote:
      'Text and CSV files can be read directly. PDF/image OCR is assisted and must be verified against the original report.',
    ocrUnavailable:
      'PDF/image OCR is not connected in this version yet. Paste the report text below or enter the values manually.',
    assistedFile: 'Needs text/OCR verification',
    fileRead: 'File read successfully',
    continueAnalysis: 'Continue to Soil Analysis',
    disclaimer:
      'Never send unverified extracted values directly to the model. Missing or ambiguous values should be entered manually.',
    manual: 'Enter Manually',
  },

  how: {
    eyebrow: 'THE WORKFLOW',
    title: 'How SoilSense Works',
    desc: 'A simple journey from laboratory values to explainable agricultural decision support.',

    s1: 'Soil report',
    s1d:
      'Enter the values available in your laboratory report.',

    s2: 'Machine learning',
    s2d:
      'A trained Random Forest model predicts the fertility category.',

    s3: 'Prediction',
    s3d:
      'The application presents the class and probability distribution.',

    s4: 'Explainability',
    s4d:
      'SHAP highlights features that influenced the model output.',

    s5: 'What-If analysis',
    s5d:
      'Change a value and compare the model response.',

    s6: 'Recommendations',
    s6d:
      'A separate crop model and nutrient rules provide decision-support guidance.',

    techEyebrow: 'TECHNICAL OVERVIEW',
    techTitle: 'Built as a connected ML application',
    frontend: 'Frontend',
    backend: 'Backend',
    fertility: 'Fertility',
    explainability: 'Explainability',
    crop: 'Crop recommendation',
  },

  about: {
    eyebrow: 'ABOUT THE PROJECT',
    title: 'SoilSense',
    desc: 'A farmer-oriented final-year project focused on making machine-learning soil analysis easier to understand and use.',

    card1: 'Farmer-friendly',
    card1d:
      'Clear screens and simple explanations keep the focus on useful information.',

    card2: 'Explainable ML',
    card2d:
      'The application uses SHAP to show how model inputs influence predictions.',

    card3: 'Multilingual',
    card3d:
      'English, Telugu and Hindi support across the interface.',

    card4: 'Decision support',
    card4d:
      'Predictions and recommendations are presented as support tools, not guarantees.',
  },

  auth: {
    account: 'ACCOUNT',
    loginEyebrow: 'WELCOME BACK',
    signupEyebrow: 'CREATE ACCOUNT',
    loginTitle: 'Sign in to SoilSense',
    signupTitle: 'Create your SoilSense account',
    loginDesc:
      'Save soil analyses to your private history and access them from this account.',
    signupDesc:
      'Create an account to securely save and revisit your soil analyses.',
    email: 'Email address',
    password: 'Password',
    login: 'Login',
    signup: 'Create Account',
    noAccount: 'New to SoilSense?',
    haveAccount: 'Already have an account?',
    createAccount: 'Create an account',
    alreadySignedIn: 'You are already signed in',
    confirmation:
      'Check your email to confirm your account before signing in.',
    passwordShort:
      'Password must contain at least 6 characters.',
    profile: 'Profile',
    profileDesc:
      'Manage your SoilSense account and saved analyses.',
    member: 'SoilSense member',
    verified: 'Email verified',
    unverified: 'Email not verified',
    memberSince: 'Member since',
    securityTitle: 'Account security',
    securityDesc:
      'Your saved soil analyses are linked to your account and protected by your authentication session.',
    viewHistory: 'View analysis history',
    logout: 'Logout',
    loginToHistory:
      'Sign in to access your analysis history.',
    loginButton: 'Sign in',
  },

  footer: {
    desc: 'AI-assisted soil analysis for clearer agricultural decisions.',
    note: '',
  },
} as const;