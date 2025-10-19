import nodemailer from 'nodemailer';
import twilio from 'twilio';
import config from '../config';
import logger from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Only create transporter if email credentials are provided
    if (config.email.user && config.email.pass) {
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
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Email not configured. Verification code for ${email}: ${code}`);
      return;
    }

    try {
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
    }
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Email not configured. Password reset code for ${email}: ${code}`);
      return;
    }

    try {
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
    }
  }
}

export class SMSService {
  private client: twilio.Twilio | null = null;

  constructor() {
    // Only create client if Twilio credentials are provided
    if (config.twilio.accountSid && config.twilio.authToken) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    }
  }

  async sendVerificationSMS(phoneNumber: string, code: string): Promise<void> {
    if (!this.client) {
      logger.warn(`SMS not configured. Verification code for ${phoneNumber}: ${code}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: `Heavy Truck Tracking verification code: ${code}. This code expires in 10 minutes.`,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });
      logger.info(`Verification SMS sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending verification SMS:', error);
      logger.warn(`SMS service failed. Verification code for ${phoneNumber}: ${code}`);
    }
  }

  async sendPasswordResetSMS(phoneNumber: string, code: string): Promise<void> {
    if (!this.client) {
      logger.warn(`SMS not configured. Password reset code for ${phoneNumber}: ${code}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: `Heavy Truck Tracking password reset code: ${code}. This code expires in 10 minutes.`,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });
      logger.info(`Password reset SMS sent to ${phoneNumber}`);
    } catch (error) {
      logger.error('Error sending password reset SMS:', error);
      logger.warn(`SMS service failed. Password reset code for ${phoneNumber}: ${code}`);
    }
  }

  // WhatsApp Methods
  async sendVerificationWhatsApp(phoneNumber: string, code: string): Promise<void> {
    if (!this.client) {
      logger.warn(`WhatsApp not configured. Verification code for ${phoneNumber}: ${code}`);
      return;
    }

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
      logger.warn(`WhatsApp service failed. Verification code for ${phoneNumber}: ${code}`);
    }
  }

  async sendPasswordResetWhatsApp(phoneNumber: string, code: string): Promise<void> {
    if (!this.client) {
      logger.warn(`WhatsApp not configured. Password reset code for ${phoneNumber}: ${code}`);
      return;
    }

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
      logger.warn(`WhatsApp service failed. Password reset code for ${phoneNumber}: ${code}`);
    }
  }
}
