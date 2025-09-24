import axios from 'axios';
import { QuestionGenerationRequest, QuestionGenerationResponse, CompetencyLevel } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await apiClient.get<{ status: string; message: string }>('/health');
    return response.data;
  },

  async getSubjects(): Promise<{ subjects: string[] }> {
    const response = await apiClient.get<{ subjects: string[] }>('/subjects');
    return response.data;
  },

  async getCompetencyLevels(): Promise<{ levels: CompetencyLevel[] }> {
    const response = await apiClient.get<{ levels: CompetencyLevel[] }>('/competency-levels');
    return response.data;
  },

  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    const response = await apiClient.post<QuestionGenerationResponse>('/generate-questions', request);
    return response.data;
  },
};

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error('Request failed: ' + error.message);
    }
  }
);