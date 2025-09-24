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