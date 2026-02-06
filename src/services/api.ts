import axios, { AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ApiResponse,
  User,
  MechanicRegistrationRequest,
  AddVehicleRequest,
  UpdateProfileRequest,
  BreakdownRequest,
  Vehicle,
  MechanicProfile,
  LocationUpdate
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
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('v1/auth/register', {...data, role: data.role || 'CUSTOMER' });
    return response.data;
  },

  validateToken: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('v1/auth/validate');
    return response.data;
  },
};

// User APIs
export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('v1/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('v1/users/me', data);
    return response.data;
  },

  addVehicle: async (data: AddVehicleRequest): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post<ApiResponse<Vehicle>>('v1/users/me/vehicles', data);
    return response.data;
  },

  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('v1/users/me/vehicles');
    return response.data;
  },
};

// Mechanic APIs
export const mechanicApi = {
  registerAsMechanic: async (data: MechanicRegistrationRequest): Promise<ApiResponse<MechanicProfile>> => {
    try {
      console.log('Making API call to /mechanics/register with data:', data);
      const response = await api.post<ApiResponse<MechanicProfile>>('v1/mechanics/register', data);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  getMechanicProfile: async (mechanicId: string): Promise<ApiResponse<MechanicProfile>> => {
    const response = await api.get<ApiResponse<MechanicProfile>>(`v1/mechanics/${mechanicId}/profile`);
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>('v1/mechanics/availability', { isAvailable });
    return response.data;
  },

  updateLocation: async (data: LocationUpdate): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('v1/mechanics/location', data);
    return response.data;
  },

  verifyMechanic: async (mechanicId: string, verified: boolean): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('v1/mechanics/verification', {
      mechanicId,
      aadhaarVerified: verified,
      policeVerificationDone: verified,
    });
    return response.data;
  },
};

// Request APIs
export const requestApi = {
  createRequest: async (data: Partial<BreakdownRequest>): Promise<ApiResponse<BreakdownRequest>> => {
    const response = await api.post<ApiResponse<BreakdownRequest>>('v1/requests', data);
    return response.data;
  },

  getMyRequests: async (): Promise<ApiResponse<BreakdownRequest[]>> => {
    const response = await api.get<ApiResponse<BreakdownRequest[]>>('/requests/my-requests');
    return response.data;
  },

  getRequestById: async (id: string): Promise<ApiResponse<BreakdownRequest>> => {
    const response = await api.get<ApiResponse<BreakdownRequest>>(`/requests/${id}`);
    return response.data;
  },

  cancelRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/requests/${id}/cancel`);
    return response.data;
  },

  acceptRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/requests/${id}/accept`);
    return response.data;
  },

  completeRequest: async (id: string, details: any): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/requests/${id}/complete`, details);
    return response.data;
  },
};

export default api;
