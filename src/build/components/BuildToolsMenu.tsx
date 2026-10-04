import { FileText, FileCheck2, BookOpen, Presentation as PresentationIcon, GitBranch, GraduationCap } from 'lucide-react';
import { BuildToolId } from '../types';

export interface BuildToolConfig {
  id: BuildToolId;
  title: string;
  badge: string;
  icon: any;
  description: string;
  endpoint: string;
  num?: string;
  actionLabel?: string;
}

export const BUILD_TOOLS_LIST: BuildToolConfig[] = [
  {
    id: 'exam',
    title: 'Exam & Test Builder',
    badge: 'EXAM',
    icon: FileCheck2,
    description: 'Generate rigorous, CAPS-aligned assessments and memo answer keys.',
    endpoint: '/api/build/exam',
  },
  {
    id: 'worksheet',
    title: 'Worksheet Generator',
    badge: 'WORKSHEET',
    icon: FileText,
    description: 'Create interactive practice exercises, drills, and student worksheets.',
    endpoint: '/api/build/worksheet',
  },
  {
    id: 'lesson-plan',
    title: 'Lesson Plan Writer',
    badge: 'LESSON PLAN',
    icon: BookOpen,
    description: 'Draft structured teacher lesson plans with objectives and rubrics.',
    endpoint: '/api/build/lesson-plan',
  },
  {
    id: 'presentation',
    title: 'Interactive Presentation',
    badge: 'SLIDES',
    icon: PresentationIcon,
    description: 'Build slide decks with speaker notes and bullet points.',
    endpoint: '/api/build/presentation',
  },
  {
    id: 'course',
    title: 'Course Module Creator',
    badge: 'COURSE',
    icon: GraduationCap,
    description: 'Structure multi-week curriculum units and learning modules.',
    endpoint: '/api/build/course',
  },
  {
    id: 'mind-map',
    title: 'Concept & Mind Map',
    badge: 'MIND MAP',
    icon: GitBranch,
    description: 'Map out conceptual relationships, timelines, and hierarchies.',
    endpoint: '/api/build/mind-map',
  },
];
