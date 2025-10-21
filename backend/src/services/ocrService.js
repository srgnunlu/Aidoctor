const vision = require('@google-cloud/vision');
const logger = require('../utils/logger');

let visionClient = null;

function initializeVisionClient() {
  if (!visionClient) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_VISION_API_KEY environment variable not set');
    }

    visionClient = new vision.ImageAnnotatorClient({
      apiKey: apiKey,
    });
    
    logger.info('Google Cloud Vision client initialized');
  }
  return visionClient;
}

async function extractTextFromImage(imageBuffer) {
  try {
    const client = initializeVisionClient();

    const [result] = await client.textDetection({
      image: { content: imageBuffer },
    });

    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return {
        fullText: '',
        blocks: [],
        confidence: 0,
      };
    }

    const fullText = detections[0].description || '';
    
    const blocks = detections.slice(1).map(annotation => ({
      text: annotation.description,
      confidence: annotation.confidence || 0,
      boundingBox: annotation.boundingPoly,
    }));

    const avgConfidence = blocks.length > 0
      ? blocks.reduce((sum, block) => sum + block.confidence, 0) / blocks.length
      : 0;

    logger.info('OCR text extraction completed', {
      textLength: fullText.length,
      blockCount: blocks.length,
      confidence: avgConfidence,
    });

    return {
      fullText,
      blocks,
      confidence: avgConfidence,
    };
  } catch (error) {
    logger.error('OCR extraction error', { error: error.message });
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}

async function extractStructuredLabData(fullText) {
  const lines = fullText.split('\n').filter(line => line.trim());
  
  const results = [];
  const testNamePattern = /([A-Za-zğüşıöçĞÜŞİÖÇ\s]+?)[:：]\s*([0-9.,]+)/gi;
  
  let match;
  while ((match = testNamePattern.exec(fullText)) !== null) {
    results.push({
      testName: match[1].trim(),
      value: match[2].trim(),
    });
  }

  return {
    detected: results.length > 0,
    results,
    rawText: fullText,
  };
}

async function extractStructuredImagingData(fullText) {
  const keywords = {
    findings: ['bulgu', 'finding', 'görünüm', 'izlendi', 'saptandı'],
    impression: ['sonuç', 'impression', 'değerlendirme', 'yorum'],
    bodyParts: ['akciğer', 'kalp', 'karaciğer', 'böbrek', 'beyin', 'karın', 'göğüs'],
  };

  const detectedBodyParts = [];
  for (const part of keywords.bodyParts) {
    if (fullText.toLowerCase().includes(part)) {
      detectedBodyParts.push(part);
    }
  }

  return {
    detected: detectedBodyParts.length > 0,
    bodyParts: detectedBodyParts,
    rawText: fullText,
  };
}

module.exports = {
  extractTextFromImage,
  extractStructuredLabData,
  extractStructuredImagingData,
};
