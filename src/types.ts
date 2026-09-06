export type AppTab = 'study' | 'quiz' | 'build' | 'mysets' | 'planner' | 'pricing';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  notes?: string;
  africanContext?: string;
  mastered?: boolean;
}

export interface StudySection {
  title: string;
  summary: string;
  keyPoints: string[];
  africanConnection?: string;
  mnemonic?: string;
}

export interface StudySet {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: 'Primary' | 'Secondary' | 'Undergraduate' | 'Professional';
  tags: string[];
  cards: Flashcard[];
  sections?: StudySection[];
  createdAt: string;
  updatedAt: string;
  author: string;
  favorite?: boolean;
  studyStats?: {
    timesStudied: number;
    lastScore?: number;
    lastStudied?: string;
    masteryPercentage?: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  africanContext?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizResult {
  id: string;
  setId?: string;
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
  date: string;
  xpEarned: number;
}

export interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  date: string;
  time?: string;
  durationMinutes: number;
  completed: boolean;
  associatedSetId?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  name: string;
  institution: string;
  country: string;
  streakDays: number;
  cowriesXP: number;
  avatarUrl?: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
  plan: 'free' | 'pro' | 'campus';
  studyGoalDailyMinutes: number;
}
