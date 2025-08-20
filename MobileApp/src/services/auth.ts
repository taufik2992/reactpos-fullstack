import { apiService } from './api';
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      apiService.setToken(token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await apiService.clearToken();
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile');
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Failed to get profile');
  }

  async refreshToken(): Promise<string> {
    const response = await apiService.post<{ token: string }>('/auth/refresh');
    
    if (response.data.success && response.data.data) {
      const { token } = response.data.data;
      apiService.setToken(token);
      return token;
    }
    
    throw new Error(response.data.message || 'Failed to refresh token');
  }
}

export const authService = new AuthService();