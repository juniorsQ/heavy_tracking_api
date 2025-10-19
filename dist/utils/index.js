"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = exports.DateUtils = exports.ValidationUtils = exports.CodeUtils = exports.JWTUtils = exports.PasswordUtils = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
class PasswordUtils {
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    static async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
}
exports.PasswordUtils = PasswordUtils;
class JWTUtils {
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: 'driver'
        }, config_1.default.jwtSecret, { expiresIn: '7d' });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
    }
}
exports.JWTUtils = JWTUtils;
class CodeUtils {
    static generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    static generateUUID() {
        return (0, uuid_1.v4)();
    }
}
exports.CodeUtils = CodeUtils;
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }
    static isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
}
exports.ValidationUtils = ValidationUtils;
class DateUtils {
    static addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }
    static isExpired(date) {
        return new Date() > date;
    }
    static formatDate(date) {
        return date.toISOString();
    }
}
exports.DateUtils = DateUtils;
class FileUtils {
    static getFileExtension(filename) {
        return filename.split('.').pop()?.toLowerCase() || '';
    }
    static isValidImageExtension(extension) {
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        return validExtensions.includes(extension);
    }
    static generateFileName(originalName) {
        const extension = this.getFileExtension(originalName);
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)().substring(0, 8);
        return `${timestamp}_${uuid}.${extension}`;
    }
}
exports.FileUtils = FileUtils;
