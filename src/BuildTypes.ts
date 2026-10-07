export type BuildToolId =
  | 'exam'
  | 'worksheet'
  | 'lesson-plan'
  | 'course'
  | 'presentation'
  | 'mind-map'
  | 'study-guide'
  | 'flashcards'
  | 'quiz'
  | 'search-result'
  | string;

export type BuildToolType = BuildToolId;

export interface SavedResource {
  id: string;
  toolType: BuildToolId;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  difficulty?: string;
  createdAt: string;
  updatedAt?: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface BuildToolItem {
  id: string;
  num: string;
  badge: string;
  badgeStyle?: string;
  title: string;
  description: string;
  icon: any;
  endpoint?: string;
  actionLabel?: string;
}

export interface BuildGeneratorConfig {
  toolType: BuildToolId;
  topic: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  itemCount: number;
  durationMinutes: number;
  instructions: string;
  sourceMaterial: string;
  sourceFileName: string;
}
