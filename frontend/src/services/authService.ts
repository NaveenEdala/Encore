import axios from 'axios';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'encore_access_token';
const REFRESH_TOKEN_KEY = 'encore_refresh_token';
const USER_KEY = 'encore_user';

export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isTokenExpiring(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return exp - now < fiveMinutes;
    } catch {
      return true;
    }
  }
};

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await authClient.post<AuthResponse>('/auth/login', request);
    const { user, access_token, refresh_token } = response.data;
    
    // Store tokens and user info
    tokenManager.setTokens(access_token, refresh_token);
    tokenManager.setUser(user);
    
    return response.data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await authClient.post<AuthResponse>('/auth/register', request);
    const { user, access_token, refresh_token } = response.data;
    
    // Store tokens and user info
    tokenManager.setTokens(access_token, refresh_token);
    tokenManager.setUser(user);
    
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await authClient.post<RefreshTokenResponse>('/auth/refresh', request);
    
    // Update access token
    const currentRefreshToken = tokenManager.getRefreshToken()!;
    tokenManager.setTokens(response.data.access_token, currentRefreshToken);
    
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await authClient.get<{ user: User }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Update stored user info
    tokenManager.setUser(response.data.user);
    
    return response.data;
  },

  logout(): void {
    tokenManager.clearTokens();
  },

  isAuthenticated(): boolean {
    const token = tokenManager.getAccessToken();
    return !!token;
  }
};

// Add response interceptor for token refresh
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshToken();
        const newToken = tokenManager.getAccessToken();
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);