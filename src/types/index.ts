export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MECHANIC = 'MECHANIC',
  ADMIN = 'ADMIN',
}

export enum VehicleType {
  CAR = 'CAR',
  BIKE = 'BIKE',
  TRUCK = 'TRUCK',
  AUTO = 'AUTO',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
}

export enum IssueType {
  TYRE_PUNCTURE = 'TYRE_PUNCTURE',
  BATTERY_ISSUE = 'BATTERY_ISSUE',
  ENGINE_FAILURE = 'ENGINE_FAILURE',
  FUEL_EMPTY = 'FUEL_EMPTY',
  LOCKOUT = 'LOCKOUT',
  ACCIDENT = 'ACCIDENT',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  profileImageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  vehicles?: Vehicle[];
  mechanicProfile?: MechanicProfile;
}

export interface Vehicle {
  id: string;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  registrationNumber: string;
  year: number;
  color?: string;
}

export interface MechanicProfile {
  id: string;
  userId: string;
  isAvailable: boolean;
  currentLocationLat?: number;
  currentLocationLng?: number;
  licenseNumber?: string;
  aadhaarNumber?: string;
  aadhaarVerified: boolean;
  policeVerificationDone: boolean;
  rating?: number;
  totalReviews?: number;
  totalJobs?: number;
  acceptanceRate?: number;
  averageResponseTimeMins?: number;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreakdownRequest {
  id: string;
  userId: string;
  selectedVehicleId?: string;
  vehicleIds: string[];
  locationLatitude: number;
  locationLongitude: number;
  address?: string;
  issueType: IssueType;
  description: string;
  photoUrls?: string[];
  mechanicId?: string;
  mechanicName?: string;
  mechanicPhone?: string;
  mechanicProfileImageUrl?: string;
  mechanicRating?: number;
  status: RequestStatus;
  partsUsed?: string[];
  laborCharge?: number;
  partsCharge?: number;
  finalAmount?: number;
  serviceNotes?: string;
  beforeServicePhotos?: string[];
  afterServicePhotos?: string[];
  serviceStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  userDTO: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface MechanicRegistrationRequest {
  currentLocationLat: number;
  currentLocationLng: number;
}

export interface MechanicVerificationRequest {
  licenseNumber: string;
  aadhaarNumber: string;
  profileImageUrl: string;
}

export interface AddVehicleRequest {
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  registrationNumber: string;
  year: number;
  color?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  profileImageUrl?: string;
}

export interface ServiceCompletionRequest {
  serviceNotes: string;
  partsUsed: string[];
  beforeServicePhotos?: string[];
  afterServicePhotos?: string[];
  laborCharge: number;
  partsCharge: number;
}

export interface LocationUpdate {
  mechanicId: string;
  latitude: number;
  longitude: number;
}

export interface NearbyMechanic {
  mechanicId: string;
  fullName: string;
  distance: number;
  isAvailable: boolean;
  rating?: number;
}

export interface TrackingData {
  requestId: string;
  mechanicId: string;
  mechanicLat: number;
  mechanicLng: number;
  etaMinutes: number;
  distanceRemainingKm: number;
  timestamp: string;
}

export interface ActiveAssignment {
  requestId: string;
  customerId: string;
  customerLat: number;
  customerLng: number;
  issueType: string;
  estimatedPayment?: number;
  depositHoldAmount?: number;
  status?: RequestStatus;
  serviceStartedAt?: string;
}

export interface PaymentSummary {
  paymentId: string;
  requestId: string;
  estimatedAmount?: number;
  depositHoldAmount?: number;
  depositHeld?: boolean;
  depositHeldAt?: string;
  depositReleasedAt?: string;
  laborCharge: number;
  partsCharge: number;
  totalAmount: number;
  platformFee: number;
  mechanicEarning: number;
  paymentGateway?: string;
  status: string;
  paidAt?: string;
}

export interface Rating {
  id: string;
  requestId: string;
  customerId: string;
  mechanicId: string;
  score: number;
  review?: string;
  createdAt: string;
}

export interface RatingRequest {
  requestId: string;
  mechanicId: string;
  score: number;
  review?: string;
}
