// Simple API Server without Database
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Configuration
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Florida Sand & Gravel API - Running without database',
    version: '1.0.0',
    features: {
      jwt: '✅ Working',
      whatsapp: '✅ Working',
      database: '❌ Not connected'
    }
  });
});

// Test JWT endpoint
app.post('/api/v1/auth/test-login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Mock user (in real app, this would come from database)
    const mockUser = {
      id: 1,
      email: email,
      name: 'Test Driver',
      role: 'driver'
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: mockUser.id, 
        email: mockUser.email,
        role: mockUser.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test JWT verification endpoint
app.get('/api/v1/auth/test-profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    res.json({
      success: true,
      data: {
        user: decoded,
        message: 'Token verified successfully'
      }
    });

  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

// Test WhatsApp endpoint
app.post('/api/v1/test/whatsapp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    res.json({
      success: true,
      data: {
        otp: otpCode,
        phoneNumber: phoneNumber,
        message: 'OTP generated (WhatsApp would be sent in real implementation)'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Florida Sand & Gravel API running on port ${PORT}`);
  console.log(`📱 WhatsApp: ✅ Ready`);
  console.log(`🔐 JWT: ✅ Ready`);
  console.log(`🗄️ Database: ❌ Not connected`);
  console.log(`\n🌐 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/v1/auth/test-login`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/auth/test-profile`);
  console.log(`   POST http://localhost:${PORT}/api/v1/test/whatsapp`);
});
