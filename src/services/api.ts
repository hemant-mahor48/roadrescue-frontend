import axios, { AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ApiResponse,
  User,
  AddVehicleRequest,
  UpdateProfileRequest,
  BreakdownRequest,
  Vehicle,
  MechanicProfile,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>('/v1/auth/register', {
      ...data, 
      role: data.role || 'CUSTOMER'
    });
    return response.data;
  },

  validateToken: async (token: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/v1/auth/validate?token=${token}`);
    return response.data;
  },
};

// User APIs
export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/v1/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/v1/users/me', data);
    return response.data;
  },

  addVehicle: async (data: AddVehicleRequest): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post<ApiResponse<Vehicle>>('/v1/users/me/vehicles', data);
    return response.data;
  },

  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('/v1/users/me/vehicles');
    return response.data;
  },
};

// Mechanic APIs
export const mechanicApi = {
  // Step 1: Register mechanic with location
  registerAsMechanic: async (data: { 
    currentLocationLat: number; 
    currentLocationLng: number 
  }): Promise<ApiResponse<MechanicProfile>> => {
    const response = await api.post<ApiResponse<MechanicProfile>>('/v1/mechanics/register', {
      currentLocationLat: data.currentLocationLat,
      currentLocationLng: data.currentLocationLng,
    });
    return response.data;
  },

  // Step 2: Submit verification documents
  submitVerification: async (data: { 
    licenseNumber: string; 
    aadhaarNumber: string; 
    profileImageUrl: string 
  }): Promise<ApiResponse<MechanicProfile>> => {
    const response = await api.post<ApiResponse<MechanicProfile>>('/v1/mechanics/verification', {
      licenseNumber: data.licenseNumber,
      aadhaarNumber: data.aadhaarNumber,
      profileImageUrl: data.profileImageUrl,
    });
    return response.data;
  },

  getMechanicProfile: async (mechanicId: string): Promise<ApiResponse<MechanicProfile>> => {
    const response = await api.get<ApiResponse<MechanicProfile>>(`/v1/mechanics/${mechanicId}/profile`);
    return response.data;
  },

  updateAvailability: async (available: boolean): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>('/v1/mechanics/availability', null, {
      params: { available }
    });
    return response.data;
  },

  updateLocation: async (lat: number, lng: number): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/v1/mechanics/location', null, {
      params: { lat, lng }
    });
    return response.data;
  },
};

// Request APIs
export const requestApi = {
  createRequest: async (data: {
    currentLocationLat: number;
    currentLocationLng: number;
    issueType: string;
    description: string;
    address?: string;
  }): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>('/v1/requests', data);
    return response.data;
  },

  getMyRequests: async (): Promise<ApiResponse<BreakdownRequest[]>> => {
    const response = await api.get<ApiResponse<BreakdownRequest[]>>('/v1/requests/my-requests');
    return response.data;
  },

  getRequestById: async (id: string): Promise<ApiResponse<BreakdownRequest>> => {
    const response = await api.get<ApiResponse<BreakdownRequest>>(`/v1/requests/${id}`);
    return response.data;
  },

  rejectRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/v1/requests/${id}/reject`);
    return response.data;
  },

  acceptRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/v1/requests/${id}/accept`);
    return response.data;
  },

  completeRequest: async (id: string, details: any): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/v1/requests/${id}/complete`, details);
    return response.data;
  },
};

export default api;