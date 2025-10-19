import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler, authenticateToken } from './middleware';

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
  orderQuerySchema,
  deliveryConfirmationSchema,
  idParamSchema
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

// API Routes
const apiRouter = express.Router();

// Authentication routes
apiRouter.post('/auth/drivers', 
  (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.login
);

apiRouter.post('/auth/signup-drivers',
  (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.register
);

apiRouter.get('/auth/me', authenticateToken, authController.getProfile);

apiRouter.post('/auth/password-recovery-code',
  (req, res, next) => {
    const { error } = passwordResetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.sendPasswordRecoveryCode
);

apiRouter.post('/auth/verification-codes/resend',
  (req, res, next) => {
    const { error } = resendCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.resendCode
);

apiRouter.post('/auth/verification-codes',
  (req, res, next) => {
    const { error } = verifyCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.verifyCode
);

apiRouter.put('/auth/configure-new-password',
  (req, res, next) => {
    const { error } = configurePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  authController.configureNewPassword
);

// Order routes
apiRouter.get('/orders/:id', homeController.getOrderById);
apiRouter.post('/orders',
  (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  homeController.createOrder
);

apiRouter.post('/orders/:id/confirm-delivery',
  orderDetailsController.confirmDelivery
);

apiRouter.get('/orders/:id/delivery-confirmation',
  orderDetailsController.getDeliveryConfirmation
);

apiRouter.get('/orders/:id/image',
  orderDetailsController.getDeliveryImage
);

// Driver routes
apiRouter.get('/drivers/orders',
  authenticateToken,
  (req, res, next) => {
    const { error } = orderQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  homeController.getDriverOrders
);

// User routes
apiRouter.post('/users/availables',
  (req, res, next) => {
    const { error } = setAvailabilitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  },
  homeController.setUserAvailability
);

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

// Mount API routes
app.use(`/api/${config.api.version}`, apiRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Heavy Truck Tracking API server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API Base URL: http://localhost:${PORT}/api/${config.api.version}`);
});

export default app;
