import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { CreateQuizPayload, Quiz, QuizSubmissionResponse, SubmitQuizPayload } from '../types/quiz';

export const quizApi = {
  createQuiz: async (payload: CreateQuizPayload): Promise<Quiz> => {
    const res = await apiClient.post<ApiResponse<Quiz>>('/quizzes', payload);
    return res.data.data;
  },

  getClassQuizzes: async (classId: number): Promise<Quiz[]> => {
    const res = await apiClient.get<ApiResponse<Quiz[]>>(`/quizzes/class/${classId}`);
    return res.data.data;
  },

  getPendingQuizzes: async (): Promise<Quiz[]> => {
    const res = await apiClient.get<ApiResponse<Quiz[]>>('/quizzes/student/pending');
    return res.data.data;
  },

  submitQuiz: async (quizId: number, payload: SubmitQuizPayload): Promise<QuizSubmissionResponse> => {
    const res = await apiClient.post<ApiResponse<QuizSubmissionResponse>>(`/quizzes/${quizId}/submit`, payload);
    return res.data.data;
  },
};

