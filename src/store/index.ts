import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, BreakdownRequest } from '../types';
import { authApi, userApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, phone: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login({ email, password });
          
          localStorage.setItem('token', response.data?.token || '');
          
          set({ 
            user: response.data?.user, 
            token: response.data?.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      register: async (email, phone, password, fullName, role = 'CUSTOMER') => {
        try {
          set({ isLoading: true });
          const response = await authApi.register({ 
            email, 
            phone, 
            password, 
            fullName,
            role: role as any
          });
          
          localStorage.setItem('token', response.data?.token || '');
          
          set({ 
            user: response.data?.user, 
            token: response.data?.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      refreshUser: async () => {
        try {
          const response = await userApi.getCurrentUser();
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Failed to refresh user', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface RequestState {
  activeRequests: BreakdownRequest[];
  currentRequest: BreakdownRequest | null;
  setActiveRequests: (requests: BreakdownRequest[]) => void;
  setCurrentRequest: (request: BreakdownRequest | null) => void;
  addRequest: (request: BreakdownRequest) => void;
  updateRequest: (id: string, updates: Partial<BreakdownRequest>) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  activeRequests: [],
  currentRequest: null,

  setActiveRequests: (requests) => set({ activeRequests: requests }),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  addRequest: (request) => set((state) => ({ 
    activeRequests: [request, ...state.activeRequests],
    currentRequest: request
  })),

  updateRequest: (id, updates) => set((state) => ({
    activeRequests: state.activeRequests.map(req => 
      req.id === id ? { ...req, ...updates } : req
    ),
    currentRequest: state.currentRequest?.id === id 
      ? { ...state.currentRequest, ...updates } 
      : state.currentRequest
  })),
}));

interface MechanicState {
  isAvailable: boolean;
  currentLocation: { lat: number; lng: number } | null;
  setAvailability: (available: boolean) => void;
  updateLocation: (location: { lat: number; lng: number }) => void;
}

export const useMechanicStore = create<MechanicState>((set) => ({
  isAvailable: false,
  currentLocation: null,

  setAvailability: (available) => set({ isAvailable: available }),

  updateLocation: (location) => set({ currentLocation: location }),
}));