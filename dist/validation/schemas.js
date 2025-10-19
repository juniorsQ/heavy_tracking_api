"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.deliveryConfirmationSchema = exports.orderQuerySchema = exports.setAvailabilitySchema = exports.createOrderSchema = exports.configurePasswordSchema = exports.resendCodeSchema = exports.verifyCodeSchema = exports.passwordResetSchema = exports.registerSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required()
});
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    phoneNumber: joi_1.default.string().pattern(/^[0-9]{10,15}$/).required(),
    truckNumber: joi_1.default.string().min(1).max(20).required(),
    transportDivisionId: joi_1.default.number().integer().positive().required(),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/).required(),
    repeatPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required()
});
exports.passwordResetSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string().pattern(/^[0-9]{10,15}$/).required()
});
exports.verifyCodeSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string().pattern(/^[0-9]{10,15}$/).optional(),
    email: joi_1.default.string().email().optional(),
    code: joi_1.default.string().length(6).pattern(/^[0-9]{6}$/).required()
}).or('phoneNumber', 'email');
exports.resendCodeSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string().pattern(/^[0-9]{10,15}$/).optional(),
    email: joi_1.default.string().email().optional()
}).or('phoneNumber', 'email');
exports.configurePasswordSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string().pattern(/^[0-9]{10,15}$/).required(),
    code: joi_1.default.string().length(6).pattern(/^[0-9]{6}$/).required(),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/).required(),
    repeatPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required()
});
exports.createOrderSchema = joi_1.default.object({
    orderNumber: joi_1.default.string().min(1).max(50).required(),
    bolNumber: joi_1.default.string().min(1).max(50).required(),
    rate: joi_1.default.number().positive().required(),
    instructions: joi_1.default.string().min(1).max(1000).required(),
    weight: joi_1.default.number().positive().required(),
    driverId: joi_1.default.number().integer().positive().required(),
    material: joi_1.default.string().min(1).max(100).required(),
    date: joi_1.default.string().isoDate().required(),
    startTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    routeId: joi_1.default.number().integer().positive().required()
});
exports.setAvailabilitySchema = joi_1.default.object({
    available: joi_1.default.boolean().required()
});
exports.orderQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    take: joi_1.default.number().integer().min(1).max(100).default(10),
    today: joi_1.default.boolean().default(true),
    differentFromToday: joi_1.default.boolean().default(false)
});
exports.deliveryConfirmationSchema = joi_1.default.object({
    notes: joi_1.default.string().max(500).optional()
});
exports.idParamSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required()
});
