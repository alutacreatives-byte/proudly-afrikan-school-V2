export type BuildToolType = 
  | 'exam' 
  | 'worksheet' 
  | 'lesson' 
  | 'lesson-plan'
  | 'course' 
  | 'course-builder'
  | 'mindmap' 
  | 'mind-map'
  | 'presentation'
  | 'learning-path'
  | 'study-guide'
  | 'flashcards'
  | 'quiz'
  | 'search-result';

export interface SavedResource {
  id: string;
  title: string;
  toolType: BuildToolType;
  content: any;
  data?: any;
  createdAt: string;
  subject?: string;
  gradeLevel?: string;
  topic?: string;
  description?: string;
}

export interface BuildInputParams {
  topic: string;
  subject: string;
  gradeLevel: string;
  sourceText?: string;
  sourceFile?: {
    name: string;
    content: string;
    type: string;
  };
  options?: Record<string, any>;
}
