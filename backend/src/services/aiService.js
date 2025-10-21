const OpenAI = require('openai');
const logger = require('../utils/logger');

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

async function analyzePatient(patientData) {
  const client = getOpenAIClient();
  try {
    const vitalSummary = patientData.vitals && patientData.vitals.length > 0
      ? patientData.vitals[0]
      : null;

    const labSummary = patientData.labs && patientData.labs.length > 0
      ? patientData.labs.map(lab => {
          if (lab.parameters && lab.parameters.length > 0) {
            const paramSummary = lab.parameters
              .map(p => `${p.name}: ${p.value} ${p.unit} [Normal: ${p.refMin}-${p.refMax}] - ${p.status}`)
              .join(', ');
            return `  * ${lab.testName || lab.category} (${lab.category}): ${paramSummary}`;
          } else {
            return `  * ${lab.testType}: ${JSON.stringify(lab.results)}`;
          }
        }).join('\n')
      : null;

    const imagingSummary = patientData.imaging && patientData.imaging.length > 0
      ? patientData.imaging.map(img => {
          let summary = `  * ${img.imagingType} - ${img.bodyPart || 'Genel'}:`;
          summary += `\n    Bulgular: ${img.findings || 'Rapor bekleniyor'}`;
          if (img.impression) summary += `\n    Yorum: ${img.impression}`;
          if (img.technique) summary += `\n    Teknik: ${img.technique}`;
          return summary;
        }).join('\n')
      : null;

    const medicalHistory = patientData.medicalHistory;

    const prompt = `
Hasta Bilgileri:
- İsim: ${patientData.name}
- Yaş: ${patientData.age}
- Cinsiyet: ${patientData.gender}
- Şikayet: ${patientData.complaint}
${vitalSummary ? `
- Vital Bulgular:
  * Nabız: ${vitalSummary.heartRate || 'N/A'} bpm
  * Tansiyon: ${vitalSummary.bloodPressureSystolic || 'N/A'}/${vitalSummary.bloodPressureDiastolic || 'N/A'} mmHg
  * Ateş: ${vitalSummary.temperature || 'N/A'}°C
  * SpO2: ${vitalSummary.oxygenSaturation || 'N/A'}%
  * Solunum: ${vitalSummary.respiratoryRate || 'N/A'}/dk
` : ''}
${labSummary ? `
- Laboratuvar Sonuçları:
${labSummary}
` : ''}
${imagingSummary ? `
- Görüntüleme Bulguları:
${imagingSummary}
` : ''}
${medicalHistory ? `
- Tıbbi Geçmiş:
  * Alerjiler: ${medicalHistory.allergies || 'Yok'}
  * Kronik Hastalıklar: ${medicalHistory.chronicDiseases || 'Yok'}
  * Kullandığı İlaçlar: ${medicalHistory.currentMedications || 'Yok'}
  * Geçirilmiş Ameliyatlar: ${medicalHistory.surgicalHistory || 'Yok'}
` : ''}

GÖREV: Bu acil servis hastası için detaylı klinik analiz yap.

Yanıtını şu JSON formatında ver:
{
  "genel_risk_skoru": <0-100 arası sayı>,
  "acil_durum": <true/false - hayati tehlike var mı?>,
  "eksik_veriler": [<string array - eksik kritik test/bulgular>],
  "olasi_tanilar": [
    {
      "tani": "<tanı adı>",
      "icd10": "<ICD-10 kodu>",
      "olasilik": <0-100 arası yüzde>,
      "severity": "<CRITICAL/HIGH/MEDIUM/LOW>",
      "aciklama": "<kısa açıklama>",
      "destekleyen_bulgular": [<string array>]
    }
  ],
  "onerilen_tetkikler": [
    {
      "test": "<test adı>",
      "oncelik": "<URGENT/HIGH/MEDIUM/LOW>",
      "neden": "<kısa açıklama>"
    }
  ],
  "acil_mudahale": [
    {
      "mudahale": "<müdahale>",
      "oncelik": "<IMMEDIATE/URGENT/ROUTINE>",
      "aciklama": "<detay>"
    }
  ],
  "risk_faktorleri": [
    {
      "risk": "<risk faktörü>",
      "seviye": "<HIGH/MEDIUM/LOW>",
      "aciklama": "<detay>"
    }
  ],
  "klinik_oneri": "<genel klinik öneri ve yorum>"
}

ÖNEMLI: 
- Tanıları olasılık sırasına göre sırala (en yüksek ilk)
- Severity seviyelerini doğru belirle (CRITICAL=hayati tehlike, HIGH=acil, MEDIUM=dikkat, LOW=rutin)
- Acil durum flag'ini sadece gerçekten hayati tehlike varsa true yap
- Eksik verileri belirt (örn: "Tam kan sayımı yok", "EKG çekilmemiş")
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen deneyimli bir acil tıp uzmanısın. Hastalar hakkında klinik karar desteği sağlıyorsun. Türkçe yanıt ver."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    let responseContent = completion.choices[0].message.content;
    
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const analysis = JSON.parse(responseContent.trim());
    
    logger.info('AI analysis generated for patient:', patientData.id);
    
    return {
      analysis,
      model: completion.model,
      tokens: completion.usage
    };
  } catch (error) {
    logger.error('AI analysis error:', error.message);
    throw new Error('AI analizi yapılamadı: ' + error.message);
  }
}

async function chatWithAI(messages, patientContext = null, recentChanges = null) {
  const client = getOpenAIClient();
  try {
    let systemMessage = `Sen AI-Doctor sisteminin Acil Tıp Asistan Doktoru'sun. Türkçe konuşursun.

# GÖREV VE YETKİLERİN:
1. **Ana Görevin**: Acil servis doktorlarına hasta yönetimi ve klinik karar desteği sağlamak
2. **Uzmanlık Alanın**: Acil tıp, triage, vital bulgu yorumlama, laboratuvar ve görüntüleme analizi
3. **Yetkilerin**: 
   - Hasta verilerini analiz edip öneriler sunmak
   - Diferansiyel tanı (ayırıcı tanı) önermek
   - İlave tetkik önerileri yapmak
   - Acil müdahale önerileri sunmak
   - Tıbbi literatür ve kılavuzlara dayalı tavsiyeler vermek

# DAVRANIŞSAL KURALLAR:
1. **Hafıza ve Süreklilik**: Daha önce konuşulan her şeyi hatırla. Tekrar sorulsa bile sabrla yanıtla.
2. **Güncel Veri Takibi**: Hastaya yeni vital bulgu, lab sonucu veya görüntüleme eklendiğinde hemen fark et ve yorumla.
3. **Proaktif Yaklaşım**: Kritik değişiklikler gördüğünde doktora uyar (örn: "Dikkat! Nabız son ölçümde 120'ye yükselmiş").
4. **Detaylı Yanıtlar**: Kısa cevaplar yerine açıklayıcı ve eğitici yanıtlar ver.
5. **Güvenlik**: Her tavsiyenin sonunda "Son karar doktorundur" hatırlatması yap.
6. **Empati**: Doktorun iş yükünü anla, pratik ve uygulanabilir öneriler sun.

# ÖNEMLİ HATIRLATMALAR:
- Sen sadece bir asistan doktorsun, nihai karar hekime aittir
- Kesinlikle kesin tanı koyma, sadece olasılıklar sun
- Risk değerlendirmesi yaparken ABD, EAU, ESC gibi kılavuzlara atıf yap
- Acil durumları (sepsis, MI, stroke vb.) hemen tanımla`;

    if (patientContext) {
      const patientInfo = buildPatientContextMessage(patientContext);
      systemMessage += `\n\n# HASTA BİLGİLERİ:\n${patientInfo}`;
    }

    if (recentChanges && recentChanges.length > 0) {
      const changesInfo = buildRecentChangesMessage(recentChanges);
      systemMessage += `\n\n# 🔔 SON DEĞİŞİKLİKLER (Yeni Eklenenler):\n${changesInfo}`;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return {
      message: completion.choices[0].message.content,
      model: completion.model,
      tokens: completion.usage
    };
  } catch (error) {
    logger.error('AI chat error:', error.message);
    throw new Error('AI chat yanıtı alınamadı: ' + error.message);
  }
}

function buildPatientContextMessage(context) {
  let message = `## Temel Bilgiler:
- İsim: ${context.name}
- Yaş: ${context.age} yaşında
- Cinsiyet: ${context.gender}
- Şikayet: ${context.complaint}
- Durum: ${context.status || 'DEĞERLENDİRME'}
- Öncelik: ${context.priority || 'orta'}`;

  if (context.vitals && context.vitals.length > 0) {
    message += `\n\n## Vital Bulgular (Toplam ${context.vitals.length} ölçüm):`;
    context.vitals.slice(0, 5).forEach((vital, index) => {
      const time = new Date(vital.recordedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      message += `\n### ${index === 0 ? '🆕 Son Ölçüm' : 'Önceki Ölçüm'} (${time}):
  - Nabız: ${vital.heartRate || 'N/A'} bpm
  - Tansiyon: ${vital.bloodPressureSystolic || 'N/A'}/${vital.bloodPressureDiastolic || 'N/A'} mmHg
  - Ateş: ${vital.temperature || 'N/A'}°C
  - SpO2: ${vital.oxygenSaturation || 'N/A'}%
  - Solunum: ${vital.respiratoryRate || 'N/A'}/dk`;
    });
  }

  if (context.labs && context.labs.length > 0) {
    const recentLabs = context.labs.slice(0, 5);
    message += `\n\n## Laboratuvar Sonuçları (Son 5/${context.labs.length} test):`;
    recentLabs.forEach((lab, index) => {
      const time = new Date(lab.orderedAt).toLocaleString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      message += `\n### ${index + 1}. ${lab.testName || lab.testType} (${time}):
  - Kategori: ${lab.category || 'N/A'}
  - Durum: ${lab.status}`;
      
      if (lab.parameters && Array.isArray(lab.parameters) && lab.parameters.length > 0) {
        message += `\n  - Parametreler:`;
        lab.parameters.forEach(param => {
          if (param && param.name && param.value !== undefined) {
            const statusIcon = param.status === 'HIGH' ? '⬆️' : param.status === 'LOW' ? '⬇️' : '✅';
            const refRange = (param.refMin !== null && param.refMax !== null) 
              ? `${param.refMin}-${param.refMax}` 
              : 'N/A';
            message += `\n    ${statusIcon} ${param.name}: ${param.value} ${param.unit || ''} (Normal: ${refRange})`;
          }
        });
      } else if (lab.results) {
        message += `\n  - Sonuçlar: ${typeof lab.results === 'object' ? JSON.stringify(lab.results, null, 2) : lab.results}`;
      }
      
      if (lab.notes) {
        message += `\n  - Not: ${lab.notes}`;
      }
    });
    if (context.labs.length > 5) {
      message += `\n_Not: ${context.labs.length - 5} eski test sonucu daha var._`;
    }
  }

  if (context.imaging && context.imaging.length > 0) {
    const recentImaging = context.imaging.slice(0, 5);
    message += `\n\n## Görüntüleme Sonuçları (Son 5/${context.imaging.length} tetkik):`;
    recentImaging.forEach((img, index) => {
      const time = new Date(img.orderedAt).toLocaleString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      message += `\n### ${index + 1}. ${img.imagingType} - ${img.bodyPart || 'Genel'} (${time}):
  - Durum: ${img.status}
  - Bulgular: ${img.findings || 'Rapor bekleniyor'}`;
      
      if (img.impression) {
        message += `\n  - Radyolog Yorumu: ${img.impression}`;
      }
      
      if (img.technique) {
        message += `\n  - Teknik: ${img.technique}`;
      }
      
      if (img.radiologist) {
        message += `\n  - Radyolog: ${img.radiologist}`;
      }
    });
    if (context.imaging.length > 5) {
      message += `\n_Not: ${context.imaging.length - 5} eski tetkik daha var._`;
    }
  }

  if (context.medicalHistory) {
    const history = context.medicalHistory;
    message += `\n\n## Tıbbi Geçmiş:
  - Alerjiler: ${history.allergies || 'Bilinen yok'}
  - Kronik Hastalıklar: ${history.chronicDiseases || 'Yok'}
  - Kullandığı İlaçlar: ${history.currentMedications || 'Yok'}
  - Geçirilmiş Ameliyatlar: ${history.surgicalHistory || 'Yok'}
  - Aile Öyküsü: ${history.familyHistory || 'Bilinmiyor'}
  - Sosyal Öykü: ${history.socialHistory || 'Bilinmiyor'}`;
  }

  return message;
}

function buildRecentChangesMessage(changes) {
  let message = '';
  
  changes.forEach(change => {
    const time = new Date(change.timestamp).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (change.type === 'vital') {
      message += `\n✅ **Yeni Vital Bulgu Eklendi** (${time}):
  - Nabız: ${change.data.heartRate || 'N/A'} bpm
  - Tansiyon: ${change.data.bloodPressureSystolic}/${change.data.bloodPressureDiastolic} mmHg
  - Ateş: ${change.data.temperature}°C
  - SpO2: ${change.data.oxygenSaturation}%
  ⚠️ Önceki ölçümle karşılaştır ve yorumla!`;
    }
    
    if (change.type === 'lab') {
      message += `\n✅ **Yeni Lab Sonucu Eklendi** (${time}):
  - Test: ${change.data.testName || change.data.testType}
  - Kategori: ${change.data.category || 'N/A'}
  - Durum: ${change.data.status}`;
      
      if (change.data.parameters && Array.isArray(change.data.parameters) && change.data.parameters.length > 0) {
        message += `\n  - Parametreler:`;
        change.data.parameters.forEach(param => {
          if (param && param.name && param.value !== undefined) {
            const statusIcon = param.status === 'HIGH' ? '⬆️🔴' : param.status === 'LOW' ? '⬇️🟡' : '✅';
            const refRange = (param.refMin !== null && param.refMax !== null) 
              ? `${param.refMin}-${param.refMax}` 
              : 'N/A';
            message += `\n    ${statusIcon} ${param.name}: ${param.value} ${param.unit || ''} (Ref: ${refRange})`;
          }
        });
      } else if (change.data.results) {
        message += `\n  - Sonuç: ${typeof change.data.results === 'object' ? JSON.stringify(change.data.results) : change.data.results}`;
      }
      
      message += `\n  ⚠️ Bu sonucu önceki değerlerle karşılaştır ve klinik tabloyla ilişkilendir!`;
    }
    
    if (change.type === 'imaging') {
      message += `\n✅ **Yeni Görüntüleme Raporu Eklendi** (${time}):
  - Tür: ${change.data.imagingType} - ${change.data.bodyPart || 'Genel'}
  - Durum: ${change.data.status}
  - Bulgular: ${change.data.findings || 'Rapor bekleniyor'}`;
      
      if (change.data.impression) {
        message += `\n  - Radyolog Yorumu: ${change.data.impression}`;
      }
      
      message += `\n  ⚠️ Bu bulguları klinik tabloyla korele et ve tanı açısından değerlendir!`;
    }
  });
  
  return message || 'Son konuşmadan bu yana yeni veri eklenmedi.';
}

function normalizeTimestamp(timestamp) {
  if (!timestamp) {
    return new Date(0);
  }
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return new Date(timestamp);
}

function detectRecentChanges(currentData, lastMessageTime) {
  const changes = [];
  const lastTime = normalizeTimestamp(lastMessageTime);
  
  if (currentData.vitals) {
    currentData.vitals.forEach(vital => {
      const recordedTime = normalizeTimestamp(vital.recordedAt);
      if (recordedTime > lastTime) {
        changes.push({
          type: 'vital',
          timestamp: vital.recordedAt,
          data: vital
        });
      }
    });
  }
  
  if (currentData.labs) {
    currentData.labs.forEach(lab => {
      const orderedTime = normalizeTimestamp(lab.orderedAt);
      if (orderedTime > lastTime) {
        changes.push({
          type: 'lab',
          timestamp: lab.orderedAt,
          data: lab
        });
      }
    });
  }
  
  if (currentData.imaging) {
    currentData.imaging.forEach(img => {
      const orderedTime = normalizeTimestamp(img.orderedAt);
      if (orderedTime > lastTime) {
        changes.push({
          type: 'imaging',
          timestamp: img.orderedAt,
          data: img
        });
      }
    });
  }
  
  changes.sort((a, b) => {
    const timeA = normalizeTimestamp(a.timestamp);
    const timeB = normalizeTimestamp(b.timestamp);
    return timeB - timeA;
  });
  
  return changes;
}

module.exports = {
  analyzePatient,
  chatWithAI,
  detectRecentChanges
};
