export interface QuizQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  points: number;
  correctOption?: string;
}

export interface Quiz {
  id: number;
  classId: number;
  className: string;
  subject: string;
  teacherName: string;
  title: string;
  description?: string;
  pointsReward: number;
  questionCount: number;
  hasSubmitted: boolean;
  previousScore?: number;
  previousPointsEarned?: number;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface CreateQuizQuestionPayload {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  points: number;
}

export interface CreateQuizPayload {
  classId: number;
  title: string;
  description?: string;
  pointsReward: number;
  questions: CreateQuizQuestionPayload[];
}

export interface SubmitQuizPayload {
  answers: { [questionId: number]: string };
}

export interface QuizSubmissionResponse {
  submissionId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  newTotalPoints: number;
  submittedAt: string;
}

