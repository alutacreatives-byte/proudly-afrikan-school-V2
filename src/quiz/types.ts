export type CreationMethod = 'topic' | 'text' | 'pdf';

export type QuestionType = 'multiple_choice' | 'true_false' | 'mixed';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type EducationLevel = 'primary' | 'high_school' | 'university' | 'general';

export type SubjectCategory =
  | 'General'
  | 'History'
  | 'Geography'
  | 'Science'
  | 'Mathematics'
  | 'Literature'
  | 'Languages'
  | 'Social Studies'
  | 'Other';

export interface QuizSettings {
  questionCount: number; // 5, 10, 15, 20, 30
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  educationLevel: EducationLevel;
  subject: SubjectCategory;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: string[]; // 4 for MC, 2 for TF ("True", "False")
  correctAnswer: string; // The exact text of the correct choice
  explanation: string;
  sourceContext?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  topicOrSource: string;
  creationMethod: CreationMethod;
  settings: QuizSettings;
  createdAt: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface QuizAttempt {
  quizId: string;
  startedAt: string;
  completedAt?: string;
  userAnswers: Record<string, UserAnswer>;
  score: number;
  totalQuestions: number;
  percentage: number;
}

export interface GenerateQuizRequest {
  creationMethod: CreationMethod;
  topic?: string;
  text?: string;
  fileName?: string;
  fileText?: string;
  settings: QuizSettings;
}

export interface GenerateQuizResponse {
  quiz: Quiz;
  error?: string;
}
