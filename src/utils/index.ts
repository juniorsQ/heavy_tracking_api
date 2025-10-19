import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { User } from '../types';

export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export class JWTUtils {
  static generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'driver' // Default role for drivers
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, config.jwtSecret);
  }
}

export class CodeUtils {
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateUUID(): string {
    return uuidv4();
  }
}

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

export class DateUtils {
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static isExpired(date: Date): boolean {
    return new Date() > date;
  }

  static formatDate(date: Date): string {
    return date.toISOString();
  }
}

export class FileUtils {
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isValidImageExtension(extension: string): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    return validExtensions.includes(extension);
  }

  static generateFileName(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    return `${timestamp}_${uuid}.${extension}`;
  }
}
