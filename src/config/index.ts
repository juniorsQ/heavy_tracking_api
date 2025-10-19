import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  // File Upload
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://apidev.flsandgravel.com/api/v1',
    version: 'v1',
  },
};

export default config;
