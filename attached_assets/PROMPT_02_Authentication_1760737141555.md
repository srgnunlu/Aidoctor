# PROMPT 2: Authentication Sistemi (Register, Login, JWT)

## 🎯 Amaç
Bu aşamada kullanıcı (doktor) kayıt, giriş ve JWT token tabanlı authentication sistemini kuracağız.

## 📋 Önkoşullar
- ✅ Prompt 1 tamamlanmış olmalı
- ✅ Backend server çalışıyor olmalı

---

## 📋 Yapılacaklar

### 1. Auth Controller Oluştur

**src/controllers/authController.js**
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

// Temporary in-memory user storage (Prompt 3'te database'e geçeceğiz)
const users = [];

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, name, title, specialty, phone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return errorResponse(res, 400, 'Email, password and name are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }

    // Password strength check
    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      title: title || '',
      specialty: specialty || '',
      phone: phone || '',
      subscriptionType: 'free',
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    logger.info('New user registered', { email, userId: newUser.id });

    // Generate tokens
    const accessToken = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(res, 201, 'User registered successfully', {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });

  } catch (error) {
    logger.error('Registration error', { error: error.message });
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    logger.info('User logged in', { email, userId: user.id });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    return errorResponse(res, 500, 'Login failed', error.message);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Generate new access token
    const newAccessToken = generateToken(user.id);

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken
    });

  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid refresh token');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Refresh token expired');
    }
    
    return errorResponse(res, 500, 'Token refresh failed', error.message);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user will be set by authMiddleware
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, 200, 'User profile retrieved', userWithoutPassword);

  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    return errorResponse(res, 500, 'Failed to get profile', error.message);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe
};
```

---

### 2. Auth Middleware Güncelle

**src/middleware/authMiddleware.js**
```javascript
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    next();

  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Not authorized, invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Not authorized, token expired');
    }
    
    return errorResponse(res, 401, 'Not authorized');
  }
};

module.exports = { protect };
```

---

### 3. Auth Routes Oluştur

**src/routes/authRoutes.js**
```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  refreshToken,
  getMe
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
```

---

### 4. app.js'e Auth Routes Ekle

**src/app.js** güncelle:
```javascript
const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes'); // YENİ

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI-Doctor API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'AI-Doctor API v1.0' });
});

// Auth routes - YENİ
app.use('/api/auth', authRoutes);

// Error handling middleware (en sonda olmalı)
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

module.exports = app;
```

---

## ✅ Test Adımları

Server'ı çalıştırın:
```bash
npm run dev
```

### Test 1: Register (Kayıt)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@doctor.com",
    "password": "123456",
    "name": "Dr. Test User",
    "title": "Acil Tıp Uzmanı",
    "specialty": "Acil Tıp",
    "phone": "+905551234567"
  }'
```

**Beklenen Çıktı:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_...",
      "email": "test@doctor.com",
      "name": "Dr. Test User",
      "title": "Acil Tıp Uzmanı",
      "specialty": "Acil Tıp",
      "phone": "+905551234567",
      "subscriptionType": "free",
      "isVerified": false,
      "createdAt": "..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@doctor.com",
    "password": "123456"
  }'
```

**Beklenen Çıktı:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Test 3: Get Profile (Protected Route)
```bash
# Önce login yapıp token'ı al, sonra:
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Beklenen Çıktı:**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "user_...",
    "email": "test@doctor.com",
    "name": "Dr. Test User",
    ...
  }
}
```

### Test 4: Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### Test 5: Invalid Token (401 Error)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
```

**Beklenen Çıktı:**
```json
{
  "success": false,
  "message": "Not authorized, invalid token"
}
```

### Test 6: Duplicate Email (400 Error)
```bash
# Aynı email ile tekrar register dene
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@doctor.com",
    "password": "123456",
    "name": "Another Doctor"
  }'
```

**Beklenen Çıktı:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

## 📝 Tamamlanma Kriterleri

✅ authController.js oluşturuldu ve çalışıyor  
✅ authMiddleware.js güncellendi ve JWT verify ediyor  
✅ authRoutes.js oluşturuldu  
✅ Register endpoint çalışıyor  
✅ Login endpoint çalışıyor  
✅ Token refresh çalışıyor  
✅ Protected route (GET /me) çalışıyor  
✅ Invalid token 401 döndürüyor  
✅ Password hash'leniyor (bcrypt)  
✅ Duplicate email kontrolü çalışıyor  

---

## 🚀 Sonraki Adım

Bu aşama tamamlandığında **PROMPT 3: Database ve Prisma Setup** ile devam edeceğiz.

Prompt 3'te:
- Prisma schema oluşturacağız
- PostgreSQL database bağlantısı yapacağız
- In-memory user storage yerine gerçek database kullanacağız
- Migrations yapacağız

---

## ⚠️ Önemli Notlar

1. **Şu anda veriler bellekte (in-memory)** - Server restart olunca kaybolur
2. **Prompt 3'te database'e geçeceğiz**
3. **JWT_SECRET'i .env'de mutlaka değiştirin**
4. **Production'da refresh token database'de saklanmalı**
5. **Email verification Prompt 7'de eklenecek**

---

**Bu prompt tamamlandığında "Prompt 2 tamamlandı, user register/login çalışıyor" diye cevap verin ve Prompt 3'e geçin.**
