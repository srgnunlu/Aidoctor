const LAB_REFERENCE_RANGES = {
  // HEMOGRAM (Complete Blood Count)
  HEMOGRAM: {
    category: 'HEMOGRAM',
    displayName: 'Hemogram (Tam Kan Sayımı)',
    parameters: {
      WBC: {
        name: 'WBC (Beyaz Küre)',
        unit: '10³/µL',
        refMin: 4.0,
        refMax: 10.0,
        criticalLow: 2.0,
        criticalHigh: 20.0
      },
      RBC: {
        name: 'RBC (Kırmızı Küre)',
        unit: '10⁶/µL',
        refMin: 4.2,
        refMax: 5.9,
        criticalLow: 3.0,
        criticalHigh: 7.0
      },
      HGB: {
        name: 'Hemoglobin',
        unit: 'g/dL',
        refMin: 13.0,
        refMax: 17.0,
        criticalLow: 7.0,
        criticalHigh: 20.0
      },
      HCT: {
        name: 'Hematokrit',
        unit: '%',
        refMin: 40,
        refMax: 52,
        criticalLow: 20,
        criticalHigh: 60
      },
      MCV: {
        name: 'MCV',
        unit: 'fL',
        refMin: 80,
        refMax: 100
      },
      PLT: {
        name: 'Trombosit',
        unit: '10³/µL',
        refMin: 150,
        refMax: 400,
        criticalLow: 20,
        criticalHigh: 1000
      },
      NEU: {
        name: 'Nötrofil',
        unit: '%',
        refMin: 40,
        refMax: 70
      },
      LYM: {
        name: 'Lenfosit',
        unit: '%',
        refMin: 20,
        refMax: 40
      }
    }
  },

  // BIOCHEMISTRY
  BIOCHEMISTRY: {
    category: 'BIOCHEMISTRY',
    displayName: 'Biyokimya',
    parameters: {
      GLUCOSE: {
        name: 'Glukoz (Açlık)',
        unit: 'mg/dL',
        refMin: 70,
        refMax: 100,
        criticalLow: 40,
        criticalHigh: 400
      },
      CREATININE: {
        name: 'Kreatinin',
        unit: 'mg/dL',
        refMin: 0.7,
        refMax: 1.3,
        criticalHigh: 5.0
      },
      BUN: {
        name: 'BUN (Üre)',
        unit: 'mg/dL',
        refMin: 7,
        refMax: 20,
        criticalHigh: 100
      },
      URIC_ACID: {
        name: 'Ürik Asit',
        unit: 'mg/dL',
        refMin: 3.5,
        refMax: 7.2
      },
      SODIUM: {
        name: 'Sodyum',
        unit: 'mmol/L',
        refMin: 136,
        refMax: 145,
        criticalLow: 120,
        criticalHigh: 160
      },
      POTASSIUM: {
        name: 'Potasyum',
        unit: 'mmol/L',
        refMin: 3.5,
        refMax: 5.1,
        criticalLow: 2.5,
        criticalHigh: 6.5
      },
      CALCIUM: {
        name: 'Kalsiyum',
        unit: 'mg/dL',
        refMin: 8.5,
        refMax: 10.5,
        criticalLow: 6.0,
        criticalHigh: 13.0
      },
      TOTAL_PROTEIN: {
        name: 'Total Protein',
        unit: 'g/dL',
        refMin: 6.0,
        refMax: 8.3
      },
      ALBUMIN: {
        name: 'Albumin',
        unit: 'g/dL',
        refMin: 3.5,
        refMax: 5.2
      },
      AST: {
        name: 'AST (SGOT)',
        unit: 'U/L',
        refMin: 0,
        refMax: 40,
        criticalHigh: 500
      },
      ALT: {
        name: 'ALT (SGPT)',
        unit: 'U/L',
        refMin: 0,
        refMax: 41,
        criticalHigh: 500
      },
      ALP: {
        name: 'ALP',
        unit: 'U/L',
        refMin: 30,
        refMax: 120
      },
      TOTAL_BILIRUBIN: {
        name: 'Total Bilirubin',
        unit: 'mg/dL',
        refMin: 0.1,
        refMax: 1.2,
        criticalHigh: 15.0
      },
      DIRECT_BILIRUBIN: {
        name: 'Direkt Bilirubin',
        unit: 'mg/dL',
        refMin: 0.0,
        refMax: 0.3
      }
    }
  },

  // CARDIAC MARKERS
  CARDIAC: {
    category: 'CARDIAC',
    displayName: 'Kardiyak Belirteçler',
    parameters: {
      TROPONIN_I: {
        name: 'Troponin I',
        unit: 'ng/mL',
        refMin: 0,
        refMax: 0.04,
        criticalHigh: 0.4
      },
      CK_MB: {
        name: 'CK-MB',
        unit: 'ng/mL',
        refMin: 0,
        refMax: 5,
        criticalHigh: 25
      },
      BNP: {
        name: 'BNP',
        unit: 'pg/mL',
        refMin: 0,
        refMax: 100,
        criticalHigh: 400
      }
    }
  },

  // COAGULATION
  COAGULATION: {
    category: 'COAGULATION',
    displayName: 'Koagülasyon',
    parameters: {
      PT: {
        name: 'PT',
        unit: 'saniye',
        refMin: 11,
        refMax: 13.5,
        criticalHigh: 30
      },
      INR: {
        name: 'INR',
        unit: '',
        refMin: 0.8,
        refMax: 1.2,
        criticalHigh: 5.0
      },
      APTT: {
        name: 'aPTT',
        unit: 'saniye',
        refMin: 25,
        refMax: 35,
        criticalHigh: 100
      }
    }
  },

  // INFECTION MARKERS
  INFECTION: {
    category: 'INFECTION',
    displayName: 'Enfeksiyon Belirteçleri',
    parameters: {
      CRP: {
        name: 'CRP',
        unit: 'mg/L',
        refMin: 0,
        refMax: 5,
        criticalHigh: 200
      },
      PROCALCITONIN: {
        name: 'Prokalsitonin',
        unit: 'ng/mL',
        refMin: 0,
        refMax: 0.5,
        criticalHigh: 10
      }
    }
  }
};

function getParameterStatus(paramKey, value, category = 'BIOCHEMISTRY') {
  const categoryData = LAB_REFERENCE_RANGES[category];
  if (!categoryData || !categoryData.parameters[paramKey]) {
    return 'NORMAL';
  }

  const param = categoryData.parameters[paramKey];
  
  if (param.criticalLow && value < param.criticalLow) {
    return 'CRITICAL_LOW';
  }
  if (param.criticalHigh && value > param.criticalHigh) {
    return 'CRITICAL_HIGH';
  }
  if (param.refMin && value < param.refMin) {
    return 'LOW';
  }
  if (param.refMax && value > param.refMax) {
    return 'HIGH';
  }
  
  return 'NORMAL';
}

function getParameterInfo(paramKey, category = 'BIOCHEMISTRY') {
  const categoryData = LAB_REFERENCE_RANGES[category];
  if (!categoryData || !categoryData.parameters[paramKey]) {
    return null;
  }
  
  return categoryData.parameters[paramKey];
}

function getAllCategories() {
  return Object.keys(LAB_REFERENCE_RANGES).map(key => ({
    value: key,
    label: LAB_REFERENCE_RANGES[key].displayName,
    parameters: Object.keys(LAB_REFERENCE_RANGES[key].parameters)
  }));
}

module.exports = {
  LAB_REFERENCE_RANGES,
  getParameterStatus,
  getParameterInfo,
  getAllCategories
};
