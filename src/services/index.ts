import nodemailer from 'nodemailer';
import twilio from 'twilio';
import config from '../config';
import logger from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      // Check if email credentials are configured
      if (!config.email.user || !config.email.pass) {
        logger.warn(`Email not configured. Verification code for ${email}: ${code}`);
        return;
      }

      const mailOptions = {
        from: config.email.user,
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
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      logger.warn(`Email service failed. Verification code for ${email}: ${code}`);
      // Don't throw error, just log it
    }
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    try {
      // Check if email credentials are configured
      if (!config.email.user || !config.email.pass) {
        logger.warn(`Email not configured. Password reset code for ${email}: ${code}`);
        return;
      }

      const mailOptions = {
        from: config.email.user,
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
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      logger.warn(`Email service failed. Password reset code for ${email}: ${code}`);
      // Don't throw error, just log it
    }
  }
}

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async sendVerificationSMS(phoneNumber: string, code: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Heavy Truck Tracking verification code: ${code}. This code expires in 10 minutes.`,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });
      logger.info(`Verification SMS sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending verification SMS:', error);
      throw new Error('Failed to send verification SMS');
    }
  }

  async sendPasswordResetSMS(phoneNumber: string, code: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Heavy Truck Tracking password reset code: ${code}. This code expires in 10 minutes.`,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });
      logger.info(`Password reset SMS sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending password reset SMS:', error);
      throw new Error('Failed to send password reset SMS');
    }
  }

  // WhatsApp Methods
  async sendVerificationWhatsApp(phoneNumber: string, code: string): Promise<void> {
    try {
      // Format phone number for WhatsApp (remove + and add whatsapp: prefix)
      const whatsappNumber = `whatsapp:${phoneNumber.replace('+', '')}`;
      const fromNumber = `whatsapp:${config.twilio.phoneNumber.replace('+', '')}`;
      
      await this.client.messages.create({
        body: `🔐 *Heavy Truck Tracking*\n\nTu código de verificación es:\n\n*${code}*\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`,
        from: fromNumber,
        to: whatsappNumber,
      });
      logger.info(`Verification WhatsApp sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending verification WhatsApp:', error);
      throw new Error('Failed to send verification WhatsApp');
    }
  }

  async sendPasswordResetWhatsApp(phoneNumber: string, code: string): Promise<void> {
    try {
      // Format phone number for WhatsApp (remove + and add whatsapp: prefix)
      const whatsappNumber = `whatsapp:${phoneNumber.replace('+', '')}`;
      const fromNumber = `whatsapp:${config.twilio.phoneNumber.replace('+', '')}`;
      
      await this.client.messages.create({
        body: `🔑 *Heavy Truck Tracking*\n\nTu código para restablecer contraseña es:\n\n*${code}*\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`,
        from: fromNumber,
        to: whatsappNumber,
      });
      logger.info(`Password reset WhatsApp sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending password reset WhatsApp:', error);
      throw new Error('Failed to send password reset WhatsApp');
    }
  }
}
