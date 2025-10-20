import { Request, Response } from 'express';
import prisma from '../config/database';
import { 
  PasswordUtils, 
  JWTUtils, 
  CodeUtils, 
  ValidationUtils, 
  DateUtils 
} from '../utils';
import { EmailService, SMSService } from '../services';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  PasswordResetRequest,
  VerifyCodeRequest,
  ResendCodeRequest,
  ConfigurePasswordRequest,
  VerificationType
} from '../types';
import logger from '../utils/logger';

export class AuthController {
  private emailService: EmailService;
  private smsService: SMSService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }

  // POST /api/v1/auth/drivers
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      const user = await prisma.user.findUnique({
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

      const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      const token = JWTUtils.generateToken(user);
      const authResponse: AuthResponse = {
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
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/auth/signup-drivers
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        lastName,
        email,
        phoneNumber,
        truckNumber,
        transportDivisionId,
        password,
        repeatPassword
      }: RegisterRequest = req.body;

      // Validation
      if (!ValidationUtils.isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      if (!ValidationUtils.isValidPassword(password)) {
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

      if (!ValidationUtils.isValidPhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Check if truck number already exists
      const existingDriver = await prisma.driver.findUnique({
        where: { truckNumber }
      });

      if (existingDriver) {
        res.status(409).json({
          success: false,
          error: 'Truck number already registered'
        });
        return;
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      // Get or create driver role
      let driverRole = await prisma.userRole.findUnique({
        where: { name: 'driver' }
      });

      if (!driverRole) {
        driverRole = await prisma.userRole.create({
          data: { name: 'driver' }
        });
      }

      // Create user and driver in transaction
      const result = await prisma.$transaction(async (tx) => {
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

      // Auto-verify user in development/production for testing
      await prisma.user.update({
        where: { id: result.user.id },
        data: { isVerified: true }
      });

      // Generate verification code for testing purposes
      const verificationCode = CodeUtils.generateVerificationCode();
      await prisma.verificationCode.create({
        data: {
          userId: result.user.id,
          code: verificationCode,
          type: VerificationType.EMAIL_VERIFICATION,
          expiresAt: DateUtils.addMinutes(new Date(), 10)
        }
      });

      // Try to send verification email (optional)
      try {
        await this.emailService.sendVerificationEmail(email, verificationCode);
      } catch (emailError) {
        logger.warn('Email service not configured, verification code generated:', verificationCode);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. User automatically verified for testing.',
        data: {
          verificationCode: verificationCode, // Include code in response for testing
          userId: result.user.id,
          driverId: result.driver.id
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/auth/me
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const user = await prisma.user.findUnique({
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
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/auth/password-recovery-code
  sendPasswordRecoveryCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber }: PasswordResetRequest = req.body;

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
        return;
      }

      const user = await prisma.user.findFirst({
        where: { phoneNumber: `+${phoneNumber}` }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const code = CodeUtils.generateVerificationCode();
      
      // Store verification code
      await prisma.passwordResetCode.create({
        data: {
          userId: user.id,
          code,
          expiresAt: DateUtils.addMinutes(new Date(), 10)
        }
      });

      // Send WhatsApp
      await this.smsService.sendPasswordResetWhatsApp(`+${phoneNumber}`, code);

      res.json({
        success: true,
        message: 'Password recovery code sent'
      });
    } catch (error) {
      logger.error('Send password recovery code error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/auth/verification-codes/resend
  resendCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber, email }: ResendCodeRequest = req.body;

      if (!phoneNumber && !email) {
        res.status(400).json({
          success: false,
          error: 'Phone number or email is required'
        });
        return;
      }

      let user;
      if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      } else {
        user = await prisma.user.findFirst({ 
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

      const code = CodeUtils.generateVerificationCode();
      
      if (email) {
        // Email verification
        await prisma.verificationCode.create({
          data: {
            userId: user.id,
            code,
            type: VerificationType.EMAIL_VERIFICATION,
            expiresAt: DateUtils.addMinutes(new Date(), 10)
          }
        });
        await this.emailService.sendVerificationEmail(email, code);
      } else {
        // SMS verification
        await prisma.passwordResetCode.create({
          data: {
            userId: user.id,
            code,
            expiresAt: DateUtils.addMinutes(new Date(), 10)
          }
        });
        await this.smsService.sendPasswordResetWhatsApp(`+${phoneNumber}`, code);
      }

      res.json({
        success: true,
        message: 'Verification code resent'
      });
    } catch (error) {
      logger.error('Resend code error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/auth/verification-codes
  verifyCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber, email, code }: VerifyCodeRequest = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Verification code is required'
        });
        return;
      }

      let user;
      if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      } else if (phoneNumber) {
        user = await prisma.user.findFirst({ 
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
        verificationCode = await prisma.verificationCode.findFirst({
          where: {
            userId: user.id,
            code,
            type: VerificationType.EMAIL_VERIFICATION,
            used: false,
            expiresAt: { gt: new Date() }
          }
        });
      } else {
        verificationCode = await prisma.passwordResetCode.findFirst({
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

      // Mark code as used
      if (email) {
        await prisma.verificationCode.update({
          where: { id: verificationCode.id },
          data: { used: true }
        });
        
        // Mark user as verified
        await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true }
        });
      } else {
        await prisma.passwordResetCode.update({
          where: { id: verificationCode.id },
          data: { used: true }
        });
      }

      res.json({
        success: true,
        message: 'Code verified successfully'
      });
    } catch (error) {
      logger.error('Verify code error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // PUT /api/v1/auth/configure-new-password
  configureNewPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber, code, password, repeatPassword }: ConfigurePasswordRequest = req.body;

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

      if (!ValidationUtils.isValidPassword(password)) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
        return;
      }

      const user = await prisma.user.findFirst({
        where: { phoneNumber: `+${phoneNumber}` }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const passwordResetCode = await prisma.passwordResetCode.findFirst({
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

      // Update password
      const hashedPassword = await PasswordUtils.hashPassword(password);
      
      await prisma.$transaction(async (tx) => {
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
    } catch (error) {
      logger.error('Configure new password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
