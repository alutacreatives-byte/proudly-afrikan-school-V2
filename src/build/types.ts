export type BuildToolType = 
  | 'exam' 
  | 'worksheet' 
  | 'course' 
  | 'lesson-plan' 
  | 'mind-map' 
  | 'presentation';

export interface BuildToolConfig {
  id: BuildToolType;
  navKey: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  badgeText: string;
  description: string;
  defaultItemCount: number;
}

export interface SavedResource {
  id: string;
  toolType: BuildToolType | 'course-builder' | 'learning-path' | 'study-guide' | 'flashcards' | 'quiz' | 'study-quiz' | 'search-result' | string;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  createdAt: string;
  itemCount?: number;
  durationMinutes?: number;
  data?: any;
  content?: any;
  [key: string]: any;
}

export interface GeneratorFormData {
  generatorType: BuildToolType;
  topic: string;
  gradeLevel: string;
  itemCount: number;
  sourceMaterial?: string;
  sourceMaterialName?: string;
  sourceMaterialType?: string;
}

// Exam & Quiz Generator Types
export interface ExamQuestion {
  id: string;
  questionNumber: number;
  marks: number;
  prompt: string;
  questionType?: 'multiple-choice' | 'short-answer' | 'essay' | 'structured';
  options?: string[];
  correctAnswer: string;
  markingGuidance: string;
  rubricNotes?: string;
  africanContext?: string;
}

export interface ExamSection {
  id: string;
  title: string;
  totalMarks: number;
  instructions: string;
  questions: ExamQuestion[];
}

export interface ExamData {
  title: string;
  subject: string;
  gradeLevel: string;
  term?: string;
  durationMinutes: number;
  totalMarks: number;
  overview: string;
  generalInstructions: string[];
  sections: ExamSection[];
  memorandumNotes?: string[];
}

// Worksheet Generator Types
export interface WorksheetQuestion {
  id: string;
  questionNumber: number;
  type: 'fill-in' | 'multiple-choice' | 'short-answer' | 'matching' | 'diagram-analysis';
  prompt: string;
  options?: string[];
  matchingPairs?: { left: string; right: string }[];
  correctAnswer: string;
  hint?: string;
  explanation: string;
  marks?: number;
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
}

export interface WorksheetData {
  title: string;
  subject: string;
  gradeLevel: string;
  instructions: string;
  estimatedTimeMinutes: number;
  sections: WorksheetSection[];
  teacherAnswerKey?: {
    notes: string;
    solutions: { questionNumber: number; answer: string; explanation: string }[];
  };
}

// Course Syllabus Builder Types
export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  durationWeeks: number;
  description: string;
  learningObjectives: string[];
  coreTopics: string[];
  capsAlignment?: string;
  assessments: string[];
  recommendedReadings?: string[];
}

export interface CourseData {
  title: string;
  subject: string;
  gradeLevel: string;
  totalWeeks: number;
  description: string;
  curriculumStandard: string;
  learningOutcomes: string[];
  modules: CourseModule[];
  gradingStructure?: { item: string; percentage: number }[];
}

// Lesson Plan Generator Types
export interface LessonPlan5EPhase {
  phase: 'Engage' | 'Explore' | 'Explain' | 'Elaborate' | 'Evaluate';
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  resourcesNeeded: string;
  keyQuestions: string[];
}

export interface LessonPlanData {
  title: string;
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  curriculumAlignment: string;
  learningObjectives: string[];
  priorKnowledge: string[];
  materialsAndResources: string[];
  phases: LessonPlan5EPhase[];
  differentiationStrategies: {
    supportForStruggling: string;
    extensionForAdvanced: string;
    specialEducationalNeeds: string;
  };
  assessmentMethod: string;
  homeworkOrFollowUp: string;
}

// Mind Map Generator Types
export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  color?: string;
  parentId?: string | null;
  children?: MindMapNode[];
  africanContext?: string;
}

export interface MindMapData {
  title: string;
  subject: string;
  gradeLevel: string;
  centralTopic: string;
  summary: string;
  rootNode: MindMapNode;
  keyTakeaways: string[];
}

// Presentation Generator Types
export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout: 'title' | 'bullet-points' | 'split-comparison' | 'quote' | 'summary' | 'qa';
  bulletPoints: string[];
  speakingNotes: string;
  keyTakeaway?: string;
  visualSuggestion?: string;
}

export interface PresentationData {
  title: string;
  subject: string;
  gradeLevel: string;
  totalSlides: number;
  slides: SlideItem[];
  presentationTips: string[];
}
