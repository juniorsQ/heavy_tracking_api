import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler, authenticateToken, validateRequest } from './middleware';
import { JWTUtils } from './utils';

// Import controllers
import { AuthController } from './controllers/authController';
import { HomeController } from './controllers/homeController';
import { OrderDetailsController } from './controllers/orderDetailsController';
import { TransportDivisionsController } from './controllers/transportDivisionsController';
import { RoutesController, WorkPlantsController, RouteTypesController } from './controllers/routesController';

// Import validation schemas
import {
  loginSchema,
  registerSchema,
  passwordResetSchema,
  verifyCodeSchema,
  resendCodeSchema,
  configurePasswordSchema,
  createOrderSchema,
  setAvailabilitySchema,
  orderQuerySchema
} from './validation/schemas';

const app = express();

// Initialize controllers
const authController = new AuthController();
const homeController = new HomeController();
const orderDetailsController = new OrderDetailsController();
const transportDivisionsController = new TransportDivisionsController();
const routesController = new RoutesController();
const workPlantsController = new WorkPlantsController();
const routeTypesController = new RouteTypesController();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(config.upload.path)) {
  fs.mkdirSync(config.upload.path, { recursive: true });
}

// Serve static files (delivery confirmation images)
app.use('/uploads', express.static(config.upload.path));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Heavy Truck Tracking API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database status endpoint
app.get('/db-status', async (req, res) => {
  try {
    const userRoles = await prisma.userRole.findMany();
    const transportDivisions = await prisma.transportDivision.findMany();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        isVerified: true,
        roleId: true
      }
    });
    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        truckNumber: true,
        transportDivisionId: true
      }
    });

    res.json({
      success: true,
      message: 'Database status retrieved successfully',
      data: {
        userRoles: {
          count: userRoles.length,
          roles: userRoles.map(r => r.name)
        },
        transportDivisions: {
          count: transportDivisions.length,
          divisions: transportDivisions.map(d => d.name)
        },
        users: {
          count: users.length,
          users: users
        },
        drivers: {
          count: drivers.length,
          drivers: drivers
        }
      }
    });
  } catch (error) {
    logger.error('Database status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database status',
      details: error.message
    });
  }
});

// Temporary endpoint to run migrations
app.post('/migrate-database', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Run Prisma migrations
    await execAsync('npx prisma migrate deploy');
    
    res.json({
      success: true,
      message: 'Database migrations completed successfully'
    });
  } catch (error) {
    logger.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run migrations'
    });
  }
});

// Complete production database initialization
app.post('/init-production', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    
    // 1. Create User Roles
    const roles = [
      { name: 'driver' },
      { name: 'admin' },
      { name: 'dispatcher' },
      { name: 'customer' }
    ];

    for (const role of roles) {
      await prisma.userRole.createMany({
        data: [role],
        skipDuplicates: true
      });
    }

    // 2. Create Transport Divisions
    const transportDivisions = [
      {
        name: 'South Florida Division',
        description: 'Covers Miami-Dade, Broward, and Palm Beach counties'
      },
      {
        name: 'Central Florida Division',
        description: 'Covers Orange, Seminole, and Osceola counties'
      },
      {
        name: 'North Florida Division',
        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
      },
      {
        name: 'West Florida Division',
        description: 'Covers Tampa, St. Petersburg, and Clearwater areas'
      }
    ];

    await prisma.transportDivision.createMany({
      data: transportDivisions,
      skipDuplicates: true
    });

    // 3. Create Test Driver User
    const driverRole = await prisma.userRole.findFirst({
      where: { name: 'driver' }
    });

    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    const driverUser = await prisma.user.upsert({
      where: { email: 'onerbren@gmail.com' },
      update: {},
      create: {
        email: 'onerbren@gmail.com',
        name: 'Test',
        lastName: 'Driver',
        phoneNumber: '+584122119581',
        password: hashedPassword,
        isVerified: true,
        roleId: driverRole.id
      }
    });

    // Create driver profile
    const southFloridaDivision = await prisma.transportDivision.findFirst({
      where: { name: 'South Florida Division' }
    });

    if (southFloridaDivision) {
      await prisma.driver.createMany({
        data: [{
          userId: driverUser.id,
          truckNumber: 'TEST001',
          transportDivisionId: southFloridaDivision.id
        }],
        skipDuplicates: true
      });
    }

    res.json({
      success: true,
      message: 'Production database initialized successfully',
      data: {
        roles: roles.length,
        transportDivisions: transportDivisions.length,
        testUser: 'onerbren@gmail.com / Test123!'
      }
    });
  } catch (error) {
    logger.error('Production initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize production database',
      details: error.message
    });
  }
});

// Legacy endpoint for backward compatibility
app.post('/seed-database', async (req, res) => {
  try {
    // Create transport divisions directly
    await prisma.transportDivision.createMany({
      data: [
        {
          name: 'South Florida Division',
          description: 'Covers Miami-Dade, Broward, and Palm Beach counties'
        },
        {
          name: 'Central Florida Division', 
          description: 'Covers Orange, Seminole, and Osceola counties'
        },
        {
          name: 'North Florida Division',
          description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
        }
      ],
      skipDuplicates: true
    });

    // Create user roles
    await prisma.userRole.createMany({
      data: [
        { name: 'driver' },
        { name: 'admin' },
        { name: 'dispatcher' }
      ],
      skipDuplicates: true
    });

    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    logger.error('Error seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database'
    });
  }
});

// API Routes
const apiRouter = express.Router();

// Authentication routes
apiRouter.post('/auth/drivers', validateRequest(loginSchema), authController.login);
apiRouter.post('/auth/signup-drivers', validateRequest(registerSchema), authController.register);
apiRouter.get('/auth/me', authenticateToken, authController.getProfile);
apiRouter.post('/auth/password-recovery-code', validateRequest(passwordResetSchema), authController.sendPasswordRecoveryCode);
apiRouter.post('/auth/verification-codes/resend', validateRequest(resendCodeSchema), authController.resendCode);
apiRouter.post('/auth/verification-codes', validateRequest(verifyCodeSchema), authController.verifyCode);
apiRouter.put('/auth/configure-new-password', validateRequest(configurePasswordSchema), authController.configureNewPassword);

// Order routes
apiRouter.get('/orders/:id', homeController.getOrderById);
apiRouter.post('/orders', validateRequest(createOrderSchema), homeController.createOrder);
apiRouter.post('/orders/:id/confirm-delivery', orderDetailsController.confirmDelivery);
apiRouter.get('/orders/:id/delivery-confirmation', orderDetailsController.getDeliveryConfirmation);
apiRouter.get('/orders/:id/image', orderDetailsController.getDeliveryImage);

// Driver routes
apiRouter.get('/drivers/orders', authenticateToken, validateRequest(orderQuerySchema, 'query'), homeController.getDriverOrders);

// User routes
apiRouter.post('/users/availables', validateRequest(setAvailabilitySchema), homeController.setUserAvailability);

// Transport divisions routes
apiRouter.get('/transport-divisions', transportDivisionsController.getTransportDivisions);
apiRouter.get('/transport-divisions/:id', transportDivisionsController.getTransportDivisionById);

// Routes
apiRouter.get('/routes', routesController.getRoutes);
apiRouter.get('/routes/:id', routesController.getRouteById);

// Work plants routes
apiRouter.get('/work-plants', workPlantsController.getWorkPlants);
apiRouter.get('/work-plants/:id', workPlantsController.getWorkPlantById);

// Route types routes
apiRouter.get('/route-types', routeTypesController.getRouteTypes);

// Debug JWT endpoint
app.post('/debug-jwt', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    const decoded = JWTUtils.verifyToken(token);
    
    res.json({
      success: true,
      data: {
        decoded,
        config: {
          jwtSecret: config.jwtSecret ? 'SET' : 'NOT_SET',
          jwtExpiresIn: config.jwtExpiresIn
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token',
      details: error.message
    });
  }
});

// Generate test token endpoint
app.post('/generate-test-token', async (req, res) => {
  try {
    const testUser = {
      id: 1,
      email: 'onerbren@gmail.com',
      name: 'Test',
      lastName: 'Driver',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const token = JWTUtils.generateToken(testUser);
    
    res.json({
      success: true,
      data: {
        token,
        user: testUser,
        config: {
          jwtSecret: config.jwtSecret ? 'SET' : 'NOT_SET',
          jwtExpiresIn: config.jwtExpiresIn
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate token',
      details: error.message
    });
  }
});

// Force initialization endpoint
app.post('/force-init', async (req, res) => {
  try {
    logger.info('🔄 Force initializing database...');
    
    // Create User Roles
    const roles = [
      { name: 'admin' },
      { name: 'driver' },
      { name: 'dispatcher' }
    ];

    await prisma.userRole.createMany({
      data: roles,
      skipDuplicates: true
    });

    // Create Transport Divisions
    const transportDivisionsData = [
      {
        name: 'South Florida Division',
        description: 'Covers Miami, Fort Lauderdale, and West Palm Beach areas'
      },
      {
        name: 'Central Florida Division', 
        description: 'Covers Orlando, Lakeland, and Winter Haven areas'
      },
      {
        name: 'North Florida Division',
        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
      },
      {
        name: 'West Coast Division',
        description: 'Covers Tampa, St. Petersburg, and Clearwater areas'
      }
    ];

    await prisma.transportDivision.createMany({
      data: transportDivisionsData,
      skipDuplicates: true
    });

    // Create Test Driver User
    const driverRole = await prisma.userRole.findFirst({
      where: { name: 'driver' }
    });

    if (driverRole) {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      
      const driverUser = await prisma.user.upsert({
        where: { email: 'onerbren@gmail.com' },
        update: {},
        create: {
          email: 'onerbren@gmail.com',
          name: 'Test',
          lastName: 'Driver',
          phoneNumber: '+584122119581',
          password: hashedPassword,
          isVerified: true,
          roleId: driverRole.id
        }
      });

      // Create driver profile
      const southFloridaDivision = await prisma.transportDivision.findFirst({
        where: { name: 'South Florida Division' }
      });

      if (southFloridaDivision) {
        await prisma.driver.createMany({
          data: [{
            userId: driverUser.id,
            truckNumber: 'TEST001',
            transportDivisionId: southFloridaDivision.id
          }],
          skipDuplicates: true
        });
      }
    }

    // Get final counts
    const userRoles = await prisma.userRole.findMany();
    const transportDivisions = await prisma.transportDivision.findMany();
    const users = await prisma.user.findMany();
    const drivers = await prisma.driver.findMany();

    res.json({
      success: true,
      message: 'Database force initialized successfully',
      data: {
        userRoles: userRoles.length,
        transportDivisions: transportDivisions.length,
        users: users.length,
        drivers: drivers.length
      }
    });
  } catch (error) {
    logger.error('Force init error:', error);
    res.status(500).json({
      success: false,
      error: 'Force initialization failed',
      details: error.message
    });
  }
});

// Mount API routes
app.use(`/api/${config.api.version}`, apiRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Auto-initialize database on startup
async function initializeDatabase() {
  try {
    logger.info('🔄 Checking database initialization...');
    
    // Check if we have any data
    const userRoles = await prisma.userRole.findMany();
    const transportDivisions = await prisma.transportDivision.findMany();
    
    if (userRoles.length === 0 || transportDivisions.length === 0) {
      logger.info('📋 Initializing database with required data...');
      
      // Create User Roles
      const roles = [
        { name: 'admin', description: 'System administrator' },
        { name: 'driver', description: 'Truck driver' },
        { name: 'dispatcher', description: 'Load dispatcher' }
      ];

      await prisma.userRole.createMany({
        data: roles,
        skipDuplicates: true
      });

      // Create Transport Divisions
      const transportDivisionsData = [
        {
          name: 'South Florida Division',
          description: 'Covers Miami, Fort Lauderdale, and West Palm Beach areas'
        },
        {
          name: 'Central Florida Division', 
          description: 'Covers Orlando, Lakeland, and Winter Haven areas'
        },
        {
          name: 'North Florida Division',
          description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
        },
        {
          name: 'West Coast Division',
          description: 'Covers Tampa, St. Petersburg, and Clearwater areas'
        }
      ];

      await prisma.transportDivision.createMany({
        data: transportDivisionsData,
        skipDuplicates: true
      });

      logger.info('✅ Database initialized successfully');
    } else {
      logger.info('✅ Database already initialized');
    }
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
  }
}

// Start server
const PORT = config.port;
app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚀 Heavy Truck Tracking API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 API Base URL: http://192.168.0.126:${PORT}/api/${config.api.version}`);
  
  // Initialize database after server starts
  await initializeDatabase();
});

export default app;