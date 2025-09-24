export interface CompetencyLevel {
  value: string;
  label: string;
  description: string;
}

export interface Question {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuestionGenerationRequest {
  subject: string;
  competency_level: string;
  num_questions: number;
}

export interface QuestionGenerationResponse {
  questions: Question[];
  subject: string;
  competency_level: string;
  count: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Authentication types
export interface User {
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}