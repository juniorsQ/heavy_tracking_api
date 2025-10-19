// User related interfaces
export interface User {
  id: number;
  email: string;
  name: string;
  lastName?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  truckNumber: string;
  transportDivisionId: number;
  password: string;
  repeatPassword: string;
}

// Driver related interfaces
export interface Driver {
  id: number;
  truckNumber: string;
  available: boolean;
  userId: number;
  transportDivisionId: number;
  user?: User;
  transportDivision?: TransportDivision;
}

export interface TransportDivision {
  id: number;
  name: string;
  description?: string;
}

// Order related interfaces
export interface Order {
  id: number;
  orderNumber: string;
  bolNumber: string;
  rate: number;
  instructions: string;
  weight: number;
  assignmentDate?: Date;
  status: OrderStatus;
  material?: string;
  startTime?: string;
  endTime?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  driverId?: number;
  routeId?: number;
  createdBy?: User;
  driver?: Driver;
  route?: Route;
  orderHasRoutes?: OrderHasRoute[];
  deliveryConfirmations?: DeliveryConfirmation[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateOrderRequest {
  orderNumber: string;
  bolNumber: string;
  rate: number;
  instructions: string;
  weight: number;
  driverId: number;
  material: string;
  date: string;
  startTime: string;
  endTime: string;
  routeId: number;
}

// Route related interfaces
export interface Route {
  id: number;
  miles: string;
  routeTypeId: number;
  pickWorkPlantId: number;
  dropWorkPlantId: number;
  routeType?: RouteType;
  pickWorkPlant?: WorkPlant;
  dropWorkPlant?: WorkPlant;
}

export interface RouteType {
  id: number;
  name: string;
}

export interface WorkPlant {
  id: number;
  name: string;
  addressId: number;
  address?: Address;
}

export interface Address {
  id: number;
  address: string;
  zip: number;
  cityId: number;
  city?: City;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  state?: State;
}

export interface State {
  id: number;
  name: string;
}

export interface OrderHasRoute {
  id: number;
  orderId: number;
  routeId: number;
  order?: Order;
  route?: Route;
}

// Profile related interfaces
export interface ProfileEntity {
  user?: User;
  role?: UserRole;
  transporDivision?: TransportDivision;
  driver?: Driver;
  available?: number;
}

// Pagination interfaces
export interface PaginationEntity {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  data: Order[];
  pagination: PaginationEntity;
}

// Verification interfaces
export interface VerificationCode {
  id: number;
  userId: number;
  code: string;
  type: VerificationType;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export enum VerificationType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY'
}

export interface PasswordResetRequest {
  phoneNumber: string;
}

export interface VerifyCodeRequest {
  phoneNumber?: string;
  email?: string;
  code: string;
}

export interface ResendCodeRequest {
  phoneNumber?: string;
  email?: string;
}

export interface ConfigurePasswordRequest {
  phoneNumber: string;
  code: string;
  password: string;
  repeatPassword: string;
}

// Delivery confirmation interfaces
export interface DeliveryConfirmation {
  id: number;
  orderId: number;
  imagePath: string;
  confirmedAt: Date;
  notes?: string;
}

// Availability interfaces
export interface SetAvailabilityRequest {
  available: boolean;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

// Query parameters interfaces
export interface OrderQueryParams {
  page?: number;
  take?: number;
  today?: boolean;
  differentFromToday?: boolean;
}
