"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDetailsController = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../config/database"));
const utils_1 = require("../utils");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = config_1.default.upload.path;
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const fileName = utils_1.FileUtils.generateFileName(file.originalname);
        cb(null, fileName);
    }
});
const fileFilter = (req, file, cb) => {
    const extension = utils_1.FileUtils.getFileExtension(file.originalname);
    if (utils_1.FileUtils.isValidImageExtension(extension)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: config_1.default.upload.maxFileSize
    }
});
class OrderDetailsController {
    constructor() {
        this.confirmDelivery = async (req, res) => {
            try {
                const { id } = req.params;
                const orderId = parseInt(id, 10);
                if (isNaN(orderId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid order ID'
                    });
                    return;
                }
                const order = await database_1.default.order.findUnique({
                    where: { id: orderId },
                    include: {
                        driver: true
                    }
                });
                if (!order) {
                    res.status(404).json({
                        success: false,
                        error: 'Order not found'
                    });
                    return;
                }
                const userId = req.user.id;
                const driver = await database_1.default.driver.findFirst({
                    where: { userId }
                });
                if (!driver || driver.id !== order.driverId) {
                    res.status(403).json({
                        success: false,
                        error: 'You are not authorized to confirm this delivery'
                    });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        error: 'Delivery confirmation image is required'
                    });
                    return;
                }
                const deliveryConfirmation = await database_1.default.deliveryConfirmation.create({
                    data: {
                        orderId,
                        imagePath: req.file.path,
                        notes: req.body.notes || null
                    }
                });
                await database_1.default.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'COMPLETED',
                        updatedAt: new Date()
                    }
                });
                res.json({
                    success: true,
                    data: {
                        id: deliveryConfirmation.id,
                        orderId: deliveryConfirmation.orderId,
                        imagePath: deliveryConfirmation.imagePath,
                        confirmedAt: deliveryConfirmation.confirmedAt,
                        notes: deliveryConfirmation.notes
                    },
                    message: 'Delivery confirmed successfully'
                });
            }
            catch (error) {
                logger_1.default.error('Confirm delivery error:', error);
                if (req.file && fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getDeliveryConfirmation = async (req, res) => {
            try {
                const { id } = req.params;
                const orderId = parseInt(id, 10);
                if (isNaN(orderId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid order ID'
                    });
                    return;
                }
                const deliveryConfirmation = await database_1.default.deliveryConfirmation.findFirst({
                    where: { orderId },
                    include: {
                        order: {
                            include: {
                                driver: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                email: true,
                                                name: true,
                                                lastName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                if (!deliveryConfirmation) {
                    res.status(404).json({
                        success: false,
                        error: 'Delivery confirmation not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: deliveryConfirmation
                });
            }
            catch (error) {
                logger_1.default.error('Get delivery confirmation error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getDeliveryImage = async (req, res) => {
            try {
                const { id } = req.params;
                const orderId = parseInt(id, 10);
                if (isNaN(orderId)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid order ID'
                    });
                    return;
                }
                const deliveryConfirmation = await database_1.default.deliveryConfirmation.findFirst({
                    where: { orderId }
                });
                if (!deliveryConfirmation) {
                    res.status(404).json({
                        success: false,
                        error: 'Delivery confirmation not found'
                    });
                    return;
                }
                const imagePath = deliveryConfirmation.imagePath;
                if (!fs_1.default.existsSync(imagePath)) {
                    res.status(404).json({
                        success: false,
                        error: 'Image file not found'
                    });
                    return;
                }
                const ext = path_1.default.extname(imagePath).toLowerCase();
                const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                    ext === '.png' ? 'image/png' :
                        ext === '.gif' ? 'image/gif' : 'application/octet-stream';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `inline; filename="${path_1.default.basename(imagePath)}"`);
                const fileStream = fs_1.default.createReadStream(imagePath);
                fileStream.pipe(res);
            }
            catch (error) {
                logger_1.default.error('Get delivery image error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
}
exports.OrderDetailsController = OrderDetailsController;
