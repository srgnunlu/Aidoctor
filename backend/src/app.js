const express = require('express');
const cors = require('cors');
const { initializeSupabaseAdmin } = require('./config/supabase');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const historyRoutes = require('./routes/historyRoutes');
const labRoutes = require('./routes/labRoutes');
const imagingRoutes = require('./routes/imagingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ocrRoutes = require('./routes/ocrRoutes');

try {
  initializeSupabaseAdmin();
} catch (error) {
  console.error('⚠️  Supabase initialization warning:', error.message);
  console.log('💡 Server will continue, but Supabase features may not work until SUPABASE credentials are set');
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI-Doctor API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'AI-Doctor API v1.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients', vitalRoutes);
app.use('/api/patients', historyRoutes);
app.use('/api', labRoutes);
app.use('/api', imagingRoutes);
app.use('/api', aiRoutes);
app.use('/api', chatRoutes);
app.use('/api/ocr', ocrRoutes);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

module.exports = app;
