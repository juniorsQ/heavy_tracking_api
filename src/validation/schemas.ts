import Joi from 'joi';

// Authentication schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  truckNumber: Joi.string().min(1).max(20).required(),
  transportDivisionId: Joi.number().integer().positive().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/).required(),
  repeatPassword: Joi.string().valid(Joi.ref('password')).required()
});

export const passwordResetSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required()
});

export const verifyCodeSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  email: Joi.string().email().optional(),
  code: Joi.string().length(6).pattern(/^[0-9]{6}$/).required()
}).or('phoneNumber', 'email');

export const resendCodeSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  email: Joi.string().email().optional()
}).or('phoneNumber', 'email');

export const configurePasswordSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  code: Joi.string().length(6).pattern(/^[0-9]{6}$/).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/).required(),
  repeatPassword: Joi.string().valid(Joi.ref('password')).required()
});

// Order schemas
export const createOrderSchema = Joi.object({
  orderNumber: Joi.string().min(1).max(50).required(),
  bolNumber: Joi.string().min(1).max(50).required(),
  rate: Joi.number().positive().required(),
  instructions: Joi.string().min(1).max(1000).required(),
  weight: Joi.number().positive().required(),
  driverId: Joi.number().integer().positive().required(),
  material: Joi.string().min(1).max(100).required(),
  date: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  routeId: Joi.number().integer().positive().required()
});

export const setAvailabilitySchema = Joi.object({
  available: Joi.boolean().required()
});

// Query parameter schemas
export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  take: Joi.number().integer().min(1).max(100).default(10),
  today: Joi.boolean().default(true),
  differentFromToday: Joi.boolean().default(false)
});

// File upload schema
export const deliveryConfirmationSchema = Joi.object({
  notes: Joi.string().max(500).optional()
});

// ID parameter schema
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});
