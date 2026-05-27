require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');

const app = express();

// Allow all origins - no CORS issues
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files directly from backend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citizenconnect')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(5000, '0.0.0.0', () => {
      console.log('🚀 CitizenConnect running on http://127.0.0.1:5000');
      console.log('🌐 Open your browser at: http://127.0.0.1:5000');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
