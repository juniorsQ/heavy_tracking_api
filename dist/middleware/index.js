"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.notFoundHandler = exports.errorHandler = exports.authenticateToken = void 0;
const utils_1 = require("../utils");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required'
            });
            return;
        }
        const decoded = utils_1.JWTUtils.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const errorHandler = (error, req, res, next) => {
    logger_1.default.error('Unhandled error:', error);
    if (error.statusCode) {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
            details: error.details
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
};
exports.notFoundHandler = notFoundHandler;
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
        const { error } = schema.validate(data);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
