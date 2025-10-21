const aiService = require('../services/aiService');
const patientService = require('../services/patientService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const { getFirestore } = require('../config/firebase');

const sendMessage = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return errorResponse(res, 400, 'Mesaj gerekli');
    }

    const patient = await patientService.getPatientById(patientId, userId);
    
    if (!patient) {
      return errorResponse(res, 404, 'Hasta bulunamadı');
    }

    const db = getFirestore();

    const userMessage = {
      patientId,
      userId,
      role: 'USER',
      content: message.trim(),
      createdAt: new Date().toISOString()
    };

    const userMsgRef = await db.collection('patients').doc(patientId)
      .collection('chatMessages')
      .add(userMessage);

    const chatHistorySnapshot = await db.collection('patients').doc(patientId)
      .collection('chatMessages')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const allMessages = [];
    chatHistorySnapshot.forEach(doc => {
      const data = doc.data();
      allMessages.push({
        role: data.role === 'USER' ? 'user' : 'assistant',
        content: data.content,
        createdAt: data.createdAt
      });
    });
    allMessages.reverse();

    const lastAIMessageTime = allMessages
      .filter(msg => msg.role === 'assistant')
      .slice(-1)[0]?.createdAt || new Date(0).toISOString();

    const vitalsSnapshot = await db.collection('patients').doc(patientId)
      .collection('vitalSigns')
      .orderBy('recordedAt', 'desc')
      .limit(5)
      .get();
    const vitals = [];
    vitalsSnapshot.forEach(doc => vitals.push({ id: doc.id, ...doc.data() }));

    const labsSnapshot = await db.collection('patients').doc(patientId)
      .collection('labResults')
      .orderBy('orderedAt', 'desc')
      .get();
    const labs = [];
    labsSnapshot.forEach(doc => labs.push({ id: doc.id, ...doc.data() }));

    const imagingSnapshot = await db.collection('patients').doc(patientId)
      .collection('imagingResults')
      .orderBy('orderedAt', 'desc')
      .get();
    const imaging = [];
    imagingSnapshot.forEach(doc => imaging.push({ id: doc.id, ...doc.data() }));

    const medicalHistoryDoc = await db.collection('patients').doc(patientId)
      .collection('medicalHistory')
      .doc('current')
      .get();
    const medicalHistory = medicalHistoryDoc.exists ? medicalHistoryDoc.data() : null;

    const patientContext = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      complaint: patient.complaint,
      status: patient.status,
      priority: patient.priority,
      vitals: vitals,
      labs: labs,
      imaging: imaging,
      medicalHistory: medicalHistory
    };

    const recentChanges = aiService.detectRecentChanges(
      { vitals, labs, imaging },
      lastAIMessageTime
    );

    const aiResponse = await aiService.chatWithAI(
      allMessages, 
      patientContext,
      recentChanges
    );

    const aiMessage = {
      patientId,
      userId,
      role: 'AI',
      content: aiResponse.message,
      metadata: {
        model: aiResponse.model,
        tokens: aiResponse.tokens?.total_tokens || 0,
        hasRecentChanges: recentChanges.length > 0,
        recentChangesCount: recentChanges.length
      },
      createdAt: new Date().toISOString()
    };

    const aiMsgRef = await db.collection('patients').doc(patientId)
      .collection('chatMessages')
      .add(aiMessage);

    logger.info(`Chat message sent for patient ${patientId} by user ${userId}`, {
      recentChanges: recentChanges.length,
      messageLength: message.length
    });
    
    return successResponse(res, 200, 'Mesaj gönderildi', {
      userMessage: { id: userMsgRef.id, ...userMessage },
      aiMessage: { id: aiMsgRef.id, ...aiMessage }
    });
  } catch (error) {
    logger.error('Chat error:', error);
    return errorResponse(res, 500, error.message);
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await patientService.getPatientById(patientId, userId);
    
    if (!patient) {
      return errorResponse(res, 404, 'Hasta bulunamadı');
    }

    const db = getFirestore();
    const messagesSnapshot = await db.collection('patients').doc(patientId)
      .collection('chatMessages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return successResponse(res, 200, 'Chat geçmişi alındı', messages);
  } catch (error) {
    logger.error('Get chat history error:', error);
    return errorResponse(res, 500, error.message);
  }
};

const clearChatHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await patientService.getPatientById(patientId, userId);
    
    if (!patient) {
      return errorResponse(res, 404, 'Hasta bulunamadı');
    }

    const db = getFirestore();
    const messagesSnapshot = await db.collection('patients').doc(patientId)
      .collection('chatMessages')
      .get();

    const batch = db.batch();
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    logger.info(`Chat history cleared for patient ${patientId} by user ${userId}`);
    
    return successResponse(res, 200, 'Chat geçmişi temizlendi', { deleted: messagesSnapshot.size });
  } catch (error) {
    logger.error('Clear chat history error:', error);
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};
