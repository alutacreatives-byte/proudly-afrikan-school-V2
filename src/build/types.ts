export type BuildToolId = 
  | 'study-guide'
  | 'flashcards'
  | 'quiz'
  | 'essay-grader'
  | 'pdf-quiz'
  | 'tutor-chat'
  | 'presentation'
  | 'course'
  | 'learning-path'
  | 'focus-quest'
  | 'exam'
  | 'worksheet'
  | 'lesson-plan'
  | 'mind-map';

export interface SavedResource {
  id: string;
  title: string;
  topic: string;
  subject: string;
  gradeLevel?: string;
  difficulty?: string;
  toolType: string;
  createdAt: string;
  data: any;
}
