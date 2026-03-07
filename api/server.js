/**
 * Express Server Setup
 * Configure and run the backend API server
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, '../')));

// ============ MOCK AUTHENTICATION MIDDLEWARE ============
// Replace with your actual authentication logic

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    // Decode token and attach user info
    try {
      // Mock user object - replace with actual JWT verification
      req.user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: 'user@example.com'
      };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    // Allow guest users for cart operations
    next();
  }
};

app.use(authMiddleware);

// ============ API ROUTES ============

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============ 404 HANDLER ============

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`🚀 Celestix Payment API Server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💼 Endpoints available at: /api/*`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
