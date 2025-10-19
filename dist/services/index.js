"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.default.email.host,
            port: config_1.default.email.port,
            secure: false,
            auth: {
                user: config_1.default.email.user,
                pass: config_1.default.email.pass,
            },
        });
    }
    async sendVerificationEmail(email, code) {
        try {
            if (!config_1.default.email.user || !config_1.default.email.pass) {
                logger_1.default.warn(`Email not configured. Verification code for ${email}: ${code}`);
                return;
            }
            const mailOptions = {
                from: config_1.default.email.user,
                to: email,
                subject: 'Heavy Truck Tracking - Email Verification',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a4373;">Heavy Truck Tracking</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #1a4373; font-size: 32px; text-align: center; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Verification email sent to ${email}`);
        }
        catch (error) {
            logger_1.default.error('Error sending verification email:', error);
            logger_1.default.warn(`Email service failed. Verification code for ${email}: ${code}`);
        }
    }
    async sendPasswordResetEmail(email, code) {
        try {
            if (!config_1.default.email.user || !config_1.default.email.pass) {
                logger_1.default.warn(`Email not configured. Password reset code for ${email}: ${code}`);
                return;
            }
            const mailOptions = {
                from: config_1.default.email.user,
                to: email,
                subject: 'Heavy Truck Tracking - Password Reset',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a4373;">Heavy Truck Tracking</h2>
            <p>Your password reset code is:</p>
            <h1 style="color: #1a4373; font-size: 32px; text-align: center; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
            };
            await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Password reset email sent to ${email}`);
        }
        catch (error) {
            logger_1.default.error('Error sending password reset email:', error);
            logger_1.default.warn(`Email service failed. Password reset code for ${email}: ${code}`);
        }
    }
}
exports.EmailService = EmailService;
class SMSService {
    constructor() {
        this.client = (0, twilio_1.default)(config_1.default.twilio.accountSid, config_1.default.twilio.authToken);
    }
    async sendVerificationSMS(phoneNumber, code) {
        try {
            await this.client.messages.create({
                body: `Heavy Truck Tracking verification code: ${code}. This code expires in 10 minutes.`,
                from: config_1.default.twilio.phoneNumber,
                to: phoneNumber,
            });
            logger_1.default.info(`Verification SMS sent to ${phoneNumber}`);
        }
        catch (error) {
            logger_1.default.error('Error sending verification SMS:', error);
            throw new Error('Failed to send verification SMS');
        }
    }
    async sendPasswordResetSMS(phoneNumber, code) {
        try {
            await this.client.messages.create({
                body: `Heavy Truck Tracking password reset code: ${code}. This code expires in 10 minutes.`,
                from: config_1.default.twilio.phoneNumber,
                to: phoneNumber,
            });
            logger_1.default.info(`Password reset SMS sent to ${phoneNumber}`);
        }
        catch (error) {
            logger_1.default.error('Error sending password reset SMS:', error);
            throw new Error('Failed to send password reset SMS');
        }
    }
    async sendVerificationWhatsApp(phoneNumber, code) {
        try {
            const whatsappNumber = `whatsapp:${phoneNumber.replace('+', '')}`;
            const fromNumber = `whatsapp:${config_1.default.twilio.phoneNumber.replace('+', '')}`;
            await this.client.messages.create({
                body: `🔐 *Heavy Truck Tracking*\n\nTu código de verificación es:\n\n*${code}*\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`,
                from: fromNumber,
                to: whatsappNumber,
            });
            logger_1.default.info(`Verification WhatsApp sent to ${phoneNumber}`);
        }
        catch (error) {
            logger_1.default.error('Error sending verification WhatsApp:', error);
            throw new Error('Failed to send verification WhatsApp');
        }
    }
    async sendPasswordResetWhatsApp(phoneNumber, code) {
        try {
            const whatsappNumber = `whatsapp:${phoneNumber.replace('+', '')}`;
            const fromNumber = `whatsapp:${config_1.default.twilio.phoneNumber.replace('+', '')}`;
            await this.client.messages.create({
                body: `🔑 *Heavy Truck Tracking*\n\nTu código para restablecer contraseña es:\n\n*${code}*\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`,
                from: fromNumber,
                to: whatsappNumber,
            });
            logger_1.default.info(`Password reset WhatsApp sent to ${phoneNumber}`);
        }
        catch (error) {
            logger_1.default.error('Error sending password reset WhatsApp:', error);
            throw new Error('Failed to send password reset WhatsApp');
        }
    }
}
exports.SMSService = SMSService;
