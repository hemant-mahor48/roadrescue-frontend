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
}

export enum IssueType {
  FLAT_TIRE = 'FLAT_TIRE',
  BATTERY_DEAD = 'BATTERY_DEAD',
  ENGINE_PROBLEM = 'ENGINE_PROBLEM',
  FUEL_SHORTAGE = 'FUEL_SHORTAGE',
  BRAKE_ISSUE = 'BRAKE_ISSUE',
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
  make: string;
  model: string;
  registrationNumber: string;
  year: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface BreakdownRequest {
  currentLocationLat: number;
  currentLocationLng: number;
  address?: string;
  issueType: IssueType;
  description: string;
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
  user: User;
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
  make: string;
  model: string;
  registrationNumber: string;
  year: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  profileImageUrl?: string;
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
