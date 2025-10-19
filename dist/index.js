"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const middleware_1 = require("./middleware");
const authController_1 = require("./controllers/authController");
const homeController_1 = require("./controllers/homeController");
const orderDetailsController_1 = require("./controllers/orderDetailsController");
const transportDivisionsController_1 = require("./controllers/transportDivisionsController");
const routesController_1 = require("./controllers/routesController");
const schemas_1 = require("./validation/schemas");
const app = (0, express_1.default)();
const authController = new authController_1.AuthController();
const homeController = new homeController_1.HomeController();
const orderDetailsController = new orderDetailsController_1.OrderDetailsController();
const transportDivisionsController = new transportDivisionsController_1.TransportDivisionsController();
const routesController = new routesController_1.RoutesController();
const workPlantsController = new routesController_1.WorkPlantsController();
const routeTypesController = new routesController_1.RouteTypesController();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.maxRequests,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (!fs_1.default.existsSync(config_1.default.upload.path)) {
    fs_1.default.mkdirSync(config_1.default.upload.path, { recursive: true });
}
app.use('/uploads', express_1.default.static(config_1.default.upload.path));
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Heavy Truck Tracking API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.post('/migrate-database', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        await execAsync('npx prisma migrate deploy');
        res.json({
            success: true,
            message: 'Database migrations completed successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Migration error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run migrations'
        });
    }
});
app.post('/seed-database', async (req, res) => {
    try {
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
    }
    catch (error) {
        logger_1.default.error('Error seeding database:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to seed database'
        });
    }
});
const apiRouter = express_1.default.Router();
apiRouter.post('/auth/drivers', (0, middleware_1.validateRequest)(schemas_1.loginSchema), authController.login);
apiRouter.post('/auth/signup-drivers', (0, middleware_1.validateRequest)(schemas_1.registerSchema), authController.register);
apiRouter.get('/auth/me', middleware_1.authenticateToken, authController.getProfile);
apiRouter.post('/auth/password-recovery-code', (0, middleware_1.validateRequest)(schemas_1.passwordResetSchema), authController.sendPasswordRecoveryCode);
apiRouter.post('/auth/verification-codes/resend', (0, middleware_1.validateRequest)(schemas_1.resendCodeSchema), authController.resendCode);
apiRouter.post('/auth/verification-codes', (0, middleware_1.validateRequest)(schemas_1.verifyCodeSchema), authController.verifyCode);
apiRouter.put('/auth/configure-new-password', (0, middleware_1.validateRequest)(schemas_1.configurePasswordSchema), authController.configureNewPassword);
apiRouter.get('/orders/:id', homeController.getOrderById);
apiRouter.post('/orders', (0, middleware_1.validateRequest)(schemas_1.createOrderSchema), homeController.createOrder);
apiRouter.post('/orders/:id/confirm-delivery', orderDetailsController.confirmDelivery);
apiRouter.get('/orders/:id/delivery-confirmation', orderDetailsController.getDeliveryConfirmation);
apiRouter.get('/orders/:id/image', orderDetailsController.getDeliveryImage);
apiRouter.get('/drivers/orders', middleware_1.authenticateToken, (0, middleware_1.validateRequest)(schemas_1.orderQuerySchema, 'query'), homeController.getDriverOrders);
apiRouter.post('/users/availables', (0, middleware_1.validateRequest)(schemas_1.setAvailabilitySchema), homeController.setUserAvailability);
apiRouter.get('/transport-divisions', transportDivisionsController.getTransportDivisions);
apiRouter.get('/transport-divisions/:id', transportDivisionsController.getTransportDivisionById);
apiRouter.get('/routes', routesController.getRoutes);
apiRouter.get('/routes/:id', routesController.getRouteById);
apiRouter.get('/work-plants', workPlantsController.getWorkPlants);
apiRouter.get('/work-plants/:id', workPlantsController.getWorkPlantById);
apiRouter.get('/route-types', routeTypesController.getRouteTypes);
app.use(`/api/${config_1.default.api.version}`, apiRouter);
app.use(middleware_1.notFoundHandler);
app.use(middleware_1.errorHandler);
const PORT = config_1.default.port;
app.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`Heavy Truck Tracking API server running on port ${PORT}`);
    logger_1.default.info(`Environment: ${config_1.default.nodeEnv}`);
    logger_1.default.info(`API Base URL: http://192.168.0.126:${PORT}/api/${config_1.default.api.version}`);
});
exports.default = app;
