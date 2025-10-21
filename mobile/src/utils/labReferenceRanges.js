export const LAB_CATEGORIES = {
  HEMOGRAM: {
    value: 'HEMOGRAM',
    label: 'Hemogram (Tam Kan Sayımı)',
    icon: 'water',
    color: '#e74c3c'
  },
  BIOCHEMISTRY: {
    value: 'BIOCHEMISTRY',
    label: 'Biyokimya',
    icon: 'test-tube',
    color: '#3498db'
  },
  CARDIAC: {
    value: 'CARDIAC',
    label: 'Kardiyak Belirteçler',
    icon: 'heart-pulse',
    color: '#e91e63'
  },
  COAGULATION: {
    value: 'COAGULATION',
    label: 'Koagülasyon',
    icon: 'blood-bag',
    color: '#9c27b0'
  },
  INFECTION: {
    value: 'INFECTION',
    label: 'Enfeksiyon Belirteçleri',
    icon: 'bacteria',
    color: '#ff9800'
  }
};

export const LAB_PARAMETERS = {
  HEMOGRAM: [
    { key: 'WBC', name: 'WBC (Beyaz Küre)', unit: '10³/µL', refMin: 4.0, refMax: 10.0 },
    { key: 'RBC', name: 'RBC (Kırmızı Küre)', unit: '10⁶/µL', refMin: 4.2, refMax: 5.9 },
    { key: 'HGB', name: 'Hemoglobin', unit: 'g/dL', refMin: 13.0, refMax: 17.0 },
    { key: 'HCT', name: 'Hematokrit', unit: '%', refMin: 40, refMax: 52 },
    { key: 'MCV', name: 'MCV', unit: 'fL', refMin: 80, refMax: 100 },
    { key: 'PLT', name: 'Trombosit', unit: '10³/µL', refMin: 150, refMax: 400 },
    { key: 'NEU', name: 'Nötrofil', unit: '%', refMin: 40, refMax: 70 },
    { key: 'LYM', name: 'Lenfosit', unit: '%', refMin: 20, refMax: 40 }
  ],
  BIOCHEMISTRY: [
    { key: 'GLUCOSE', name: 'Glukoz (Açlık)', unit: 'mg/dL', refMin: 70, refMax: 100 },
    { key: 'CREATININE', name: 'Kreatinin', unit: 'mg/dL', refMin: 0.7, refMax: 1.3 },
    { key: 'BUN', name: 'BUN (Üre)', unit: 'mg/dL', refMin: 7, refMax: 20 },
    { key: 'URIC_ACID', name: 'Ürik Asit', unit: 'mg/dL', refMin: 3.5, refMax: 7.2 },
    { key: 'SODIUM', name: 'Sodyum', unit: 'mmol/L', refMin: 136, refMax: 145 },
    { key: 'POTASSIUM', name: 'Potasyum', unit: 'mmol/L', refMin: 3.5, refMax: 5.1 },
    { key: 'CALCIUM', name: 'Kalsiyum', unit: 'mg/dL', refMin: 8.5, refMax: 10.5 },
    { key: 'TOTAL_PROTEIN', name: 'Total Protein', unit: 'g/dL', refMin: 6.0, refMax: 8.3 },
    { key: 'ALBUMIN', name: 'Albumin', unit: 'g/dL', refMin: 3.5, refMax: 5.2 },
    { key: 'AST', name: 'AST (SGOT)', unit: 'U/L', refMin: 0, refMax: 40 },
    { key: 'ALT', name: 'ALT (SGPT)', unit: 'U/L', refMin: 0, refMax: 41 },
    { key: 'ALP', name: 'ALP', unit: 'U/L', refMin: 30, refMax: 120 },
    { key: 'TOTAL_BILIRUBIN', name: 'Total Bilirubin', unit: 'mg/dL', refMin: 0.1, refMax: 1.2 },
    { key: 'DIRECT_BILIRUBIN', name: 'Direkt Bilirubin', unit: 'mg/dL', refMin: 0.0, refMax: 0.3 }
  ],
  CARDIAC: [
    { key: 'TROPONIN_I', name: 'Troponin I', unit: 'ng/mL', refMin: 0, refMax: 0.04 },
    { key: 'CK_MB', name: 'CK-MB', unit: 'ng/mL', refMin: 0, refMax: 5 },
    { key: 'BNP', name: 'BNP', unit: 'pg/mL', refMin: 0, refMax: 100 }
  ],
  COAGULATION: [
    { key: 'PT', name: 'PT', unit: 'saniye', refMin: 11, refMax: 13.5 },
    { key: 'INR', name: 'INR', unit: '', refMin: 0.8, refMax: 1.2 },
    { key: 'APTT', name: 'aPTT', unit: 'saniye', refMin: 25, refMax: 35 }
  ],
  INFECTION: [
    { key: 'CRP', name: 'CRP', unit: 'mg/L', refMin: 0, refMax: 5 },
    { key: 'PROCALCITONIN', name: 'Prokalsitonin', unit: 'ng/mL', refMin: 0, refMax: 0.5 }
  ]
};

export const getParameterStatus = (value, refMin, refMax) => {
  if (refMin !== null && refMin !== undefined && value < refMin) {
    return 'LOW';
  }
  if (refMax !== null && refMax !== undefined && value > refMax) {
    return 'HIGH';
  }
  return 'NORMAL';
};

export const getParameterStatusColor = (status) => {
  switch (status) {
    case 'HIGH':
    case 'CRITICAL_HIGH':
      return '#e74c3c';
    case 'LOW':
    case 'CRITICAL_LOW':
      return '#f39c12';
    case 'NORMAL':
    default:
      return '#27ae60';
  }
};

export const getParameterStatusIcon = (status) => {
  switch (status) {
    case 'HIGH':
    case 'CRITICAL_HIGH':
      return 'arrow-up';
    case 'LOW':
    case 'CRITICAL_LOW':
      return 'arrow-down';
    case 'NORMAL':
    default:
      return 'check';
  }
};

export const getParameterInfo = (category, paramKey) => {
  const categoryParams = LAB_PARAMETERS[category];
  if (!categoryParams) return null;
  return categoryParams.find(p => p.key === paramKey);
};

export const formatParameterValue = (value, decimals = 1) => {
  if (typeof value !== 'number') return value;
  return value.toFixed(decimals);
};
