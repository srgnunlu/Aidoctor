const { getAuth, getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { email, password, name, title, specialty, phone } = req.body;

    if (!email || !password || !name) {
      return errorResponse(res, 400, 'Email, password and name are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    const auth = getAuth();
    const db = getFirestore();

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    const userData = {
      email,
      name,
      title: title || '',
      specialty: specialty || '',
      phone: phone || '',
      role: 'DOCTOR',
      subscriptionType: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    logger.info('New user registered', { email, userId: userRecord.uid });

    const customToken = await auth.createCustomToken(userRecord.uid);

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        uid: userRecord.uid,
        ...userData,
      },
      customToken,
    });

  } catch (error) {
    logger.error('Registration error', { error: error.message, code: error.code });
    
    if (error.code === 'auth/email-already-exists') {
      return errorResponse(res, 400, 'User already exists with this email');
    }
    
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const { userId } = req.user;
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, 'User not found');
    }

    const userData = userDoc.data();

    return successResponse(res, 200, 'User profile retrieved', {
      uid: userId,
      ...userData,
    });

  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    return errorResponse(res, 500, 'Failed to get profile', error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, title, specialty, phone } = req.body;
    const db = getFirestore();

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (phone !== undefined) updateData.phone = phone;

    await db.collection('users').doc(userId).update(updateData);

    const updatedDoc = await db.collection('users').doc(userId).get();

    logger.info('User profile updated', { userId });

    return successResponse(res, 200, 'Profile updated successfully', {
      uid: userId,
      ...updatedDoc.data(),
    });

  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    return errorResponse(res, 500, 'Failed to update profile', error.message);
  }
};

module.exports = {
  register,
  getMe,
  updateProfile,
};
