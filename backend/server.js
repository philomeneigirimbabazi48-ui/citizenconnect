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

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citizenconnect')
  .then(() => {
    console.log('✅ MongoDB connected');
    const server = app.listen(5000, '0.0.0.0', () => {
      console.log('🚀 CitizenConnect running on http://127.0.0.1:5000');
      console.log('🌐 Open your browser at: http://127.0.0.1:5000');
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 5000 is already in use. Run: netstat -ano | findstr :5000 then taskkill /PID <pid> /F');
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });