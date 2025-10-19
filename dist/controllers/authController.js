"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = __importDefault(require("../config/database"));
const utils_1 = require("../utils");
const services_1 = require("../services");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({
                        success: false,
                        error: 'Email and password are required'
                    });
                    return;
                }
                const user = await database_1.default.user.findUnique({
                    where: { email },
                    include: {
                        role: true,
                        driver: {
                            include: {
                                transportDivision: true
                            }
                        }
                    }
                });
                if (!user) {
                    res.status(401).json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                    return;
                }
                const isPasswordValid = await utils_1.PasswordUtils.comparePassword(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                    return;
                }
                const token = utils_1.JWTUtils.generateToken(user);
                const authResponse = {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        isVerified: user.isVerified,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                };
                res.json({
                    success: true,
                    data: authResponse
                });
            }
            catch (error) {
                logger_1.default.error('Login error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.register = async (req, res) => {
            try {
                const { name, lastName, email, phoneNumber, truckNumber, transportDivisionId, password, repeatPassword } = req.body;
                if (!utils_1.ValidationUtils.isValidEmail(email)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid email format'
                    });
                    return;
                }
                if (!utils_1.ValidationUtils.isValidPassword(password)) {
                    res.status(400).json({
                        success: false,
                        error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
                    });
                    return;
                }
                if (password !== repeatPassword) {
                    res.status(400).json({
                        success: false,
                        error: 'Passwords do not match'
                    });
                    return;
                }
                if (!utils_1.ValidationUtils.isValidPhoneNumber(phoneNumber)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid phone number format'
                    });
                    return;
                }
                const existingUser = await database_1.default.user.findUnique({
                    where: { email }
                });
                if (existingUser) {
                    res.status(409).json({
                        success: false,
                        error: 'User with this email already exists'
                    });
                    return;
                }
                const existingDriver = await database_1.default.driver.findUnique({
                    where: { truckNumber }
                });
                if (existingDriver) {
                    res.status(409).json({
                        success: false,
                        error: 'Truck number already registered'
                    });
                    return;
                }
                const hashedPassword = await utils_1.PasswordUtils.hashPassword(password);
                let driverRole = await database_1.default.userRole.findUnique({
                    where: { name: 'driver' }
                });
                if (!driverRole) {
                    driverRole = await database_1.default.userRole.create({
                        data: { name: 'driver' }
                    });
                }
                const result = await database_1.default.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            email,
                            name,
                            lastName,
                            phoneNumber: `+${phoneNumber}`,
                            password: hashedPassword,
                            isVerified: false,
                            roleId: driverRole.id
                        }
                    });
                    const driver = await tx.driver.create({
                        data: {
                            truckNumber,
                            userId: user.id,
                            transportDivisionId,
                            available: true
                        }
                    });
                    return { user, driver };
                });
                const verificationCode = utils_1.CodeUtils.generateVerificationCode();
                await database_1.default.verificationCode.create({
                    data: {
                        userId: result.user.id,
                        code: verificationCode,
                        type: types_1.VerificationType.EMAIL_VERIFICATION,
                        expiresAt: utils_1.DateUtils.addMinutes(new Date(), 10)
                    }
                });
                await this.emailService.sendVerificationEmail(email, verificationCode);
                res.status(201).json({
                    success: true,
                    message: 'Registration successful. Please check your email for verification code.'
                });
            }
            catch (error) {
                logger_1.default.error('Registration error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'User not authenticated'
                    });
                    return;
                }
                const user = await database_1.default.user.findUnique({
                    where: { id: userId },
                    include: {
                        role: true,
                        driver: {
                            include: {
                                transportDivision: true
                            }
                        }
                    }
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                const profile = {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        isVerified: user.isVerified,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    },
                    role: user.role,
                    transporDivision: user.driver?.transportDivision,
                    driver: user.driver,
                    available: user.driver?.available ? 1 : 0
                };
                res.json({
                    success: true,
                    data: profile
                });
            }
            catch (error) {
                logger_1.default.error('Get profile error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.sendPasswordRecoveryCode = async (req, res) => {
            try {
                const { phoneNumber } = req.body;
                if (!phoneNumber) {
                    res.status(400).json({
                        success: false,
                        error: 'Phone number is required'
                    });
                    return;
                }
                const user = await database_1.default.user.findFirst({
                    where: { phoneNumber: `+${phoneNumber}` }
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                const code = utils_1.CodeUtils.generateVerificationCode();
                await database_1.default.passwordResetCode.create({
                    data: {
                        userId: user.id,
                        code,
                        expiresAt: utils_1.DateUtils.addMinutes(new Date(), 10)
                    }
                });
                await this.smsService.sendPasswordResetWhatsApp(`+${phoneNumber}`, code);
                res.json({
                    success: true,
                    message: 'Password recovery code sent'
                });
            }
            catch (error) {
                logger_1.default.error('Send password recovery code error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.resendCode = async (req, res) => {
            try {
                const { phoneNumber, email } = req.body;
                if (!phoneNumber && !email) {
                    res.status(400).json({
                        success: false,
                        error: 'Phone number or email is required'
                    });
                    return;
                }
                let user;
                if (email) {
                    user = await database_1.default.user.findUnique({ where: { email } });
                }
                else {
                    user = await database_1.default.user.findFirst({
                        where: { phoneNumber: `+${phoneNumber}` }
                    });
                }
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                const code = utils_1.CodeUtils.generateVerificationCode();
                if (email) {
                    await database_1.default.verificationCode.create({
                        data: {
                            userId: user.id,
                            code,
                            type: types_1.VerificationType.EMAIL_VERIFICATION,
                            expiresAt: utils_1.DateUtils.addMinutes(new Date(), 10)
                        }
                    });
                    await this.emailService.sendVerificationEmail(email, code);
                }
                else {
                    await database_1.default.passwordResetCode.create({
                        data: {
                            userId: user.id,
                            code,
                            expiresAt: utils_1.DateUtils.addMinutes(new Date(), 10)
                        }
                    });
                    await this.smsService.sendPasswordResetWhatsApp(`+${phoneNumber}`, code);
                }
                res.json({
                    success: true,
                    message: 'Verification code resent'
                });
            }
            catch (error) {
                logger_1.default.error('Resend code error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.verifyCode = async (req, res) => {
            try {
                const { phoneNumber, email, code } = req.body;
                if (!code) {
                    res.status(400).json({
                        success: false,
                        error: 'Verification code is required'
                    });
                    return;
                }
                let user;
                if (email) {
                    user = await database_1.default.user.findUnique({ where: { email } });
                }
                else if (phoneNumber) {
                    user = await database_1.default.user.findFirst({
                        where: { phoneNumber: `+${phoneNumber}` }
                    });
                }
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                let verificationCode;
                if (email) {
                    verificationCode = await database_1.default.verificationCode.findFirst({
                        where: {
                            userId: user.id,
                            code,
                            type: types_1.VerificationType.EMAIL_VERIFICATION,
                            used: false,
                            expiresAt: { gt: new Date() }
                        }
                    });
                }
                else {
                    verificationCode = await database_1.default.passwordResetCode.findFirst({
                        where: {
                            userId: user.id,
                            code,
                            used: false,
                            expiresAt: { gt: new Date() }
                        }
                    });
                }
                if (!verificationCode) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid or expired verification code'
                    });
                    return;
                }
                if (email) {
                    await database_1.default.verificationCode.update({
                        where: { id: verificationCode.id },
                        data: { used: true }
                    });
                    await database_1.default.user.update({
                        where: { id: user.id },
                        data: { isVerified: true }
                    });
                }
                else {
                    await database_1.default.passwordResetCode.update({
                        where: { id: verificationCode.id },
                        data: { used: true }
                    });
                }
                res.json({
                    success: true,
                    message: 'Code verified successfully'
                });
            }
            catch (error) {
                logger_1.default.error('Verify code error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.configureNewPassword = async (req, res) => {
            try {
                const { phoneNumber, code, password, repeatPassword } = req.body;
                if (!phoneNumber || !code || !password || !repeatPassword) {
                    res.status(400).json({
                        success: false,
                        error: 'All fields are required'
                    });
                    return;
                }
                if (password !== repeatPassword) {
                    res.status(400).json({
                        success: false,
                        error: 'Passwords do not match'
                    });
                    return;
                }
                if (!utils_1.ValidationUtils.isValidPassword(password)) {
                    res.status(400).json({
                        success: false,
                        error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
                    });
                    return;
                }
                const user = await database_1.default.user.findFirst({
                    where: { phoneNumber: `+${phoneNumber}` }
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                    return;
                }
                const passwordResetCode = await database_1.default.passwordResetCode.findFirst({
                    where: {
                        userId: user.id,
                        code,
                        used: false,
                        expiresAt: { gt: new Date() }
                    }
                });
                if (!passwordResetCode) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid or expired verification code'
                    });
                    return;
                }
                const hashedPassword = await utils_1.PasswordUtils.hashPassword(password);
                await database_1.default.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { password: hashedPassword }
                    });
                    await tx.passwordResetCode.update({
                        where: { id: passwordResetCode.id },
                        data: { used: true }
                    });
                });
                res.json({
                    success: true,
                    message: 'Password updated successfully'
                });
            }
            catch (error) {
                logger_1.default.error('Configure new password error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
        this.emailService = new services_1.EmailService();
        this.smsService = new services_1.SMSService();
    }
}
exports.AuthController = AuthController;
