import React from 'react';
import { 
  FileText, 
  Presentation, 
  BookOpen, 
  CheckSquare, 
  Layers, 
  HelpCircle, 
  GraduationCap, 
  FileCheck,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { BuildToolType } from './BuildTypes';

export interface BuildToolMeta {
  id: BuildToolType;
  title: string;
  description: string;
  icon: any;
  color: string;
  badge: string;
  num?: string | number;
  actionLabel?: string;
  endpoint?: string;
}

export const BUILD_TOOLS_LIST: BuildToolMeta[] = [
  {
    id: 'presentation',
    title: 'Interactive Presentation',
    description: 'Create slide decks with speaker notes, key points, and visual diagrams.',
    icon: Presentation,
    color: 'from-amber-500 to-orange-600',
    badge: 'Popular',
    num: '01',
  },
  {
    id: 'exam',
    title: 'Examination Paper',
    description: 'Generate comprehensive exams with marking rubrics and model answers.',
    icon: FileCheck,
    color: 'from-rose-500 to-pink-600',
    badge: 'Formal',
    num: '02',
  },
  {
    id: 'worksheet',
    title: 'Classroom Worksheet',
    description: 'Printable student worksheets with matching, fill-in-blanks, and problem solving.',
    icon: ClipboardList,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Printable',
    num: '03',
  },
  {
    id: 'study-guide',
    title: 'Comprehensive Study Guide',
    description: 'Detailed study notes, key terms, summary sections, and review questions.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Core',
    num: '04',
  },
  {
    id: 'flashcards',
    title: 'Smart Flashcards',
    description: 'Interactive flashcards with definitions, memory tips, and self-testing.',
    icon: Layers,
    color: 'from-purple-500 to-violet-600',
    badge: 'Quick Review',
    num: '05',
  },
  {
    id: 'lesson-plan',
    title: 'Teacher Lesson Plan',
    description: 'Structured timed pacing, engagement hooks, and assessment strategies.',
    icon: GraduationCap,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Pedagogy',
    num: '06',
  },
];

interface BuildToolsMenuProps {
  activeTool?: BuildToolType | string | null;
  onSelectTool: (toolId: string) => void;
}

export const BuildToolsMenu: React.FC<BuildToolsMenuProps> = ({ onSelectTool }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {BUILD_TOOLS_LIST.map((tool) => {
        const IconComponent = tool.icon;
        return (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group relative bg-[#F7F2EB] border border-[#E4DCD0] hover:border-[#E05A2B] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E05A2B]/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-stone-200/70 text-stone-700 rounded-full">
                  {tool.badge}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-2 group-hover:text-[#E05A2B] transition-colors">
                {tool.title}
              </h3>
              <p className="font-mono text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E4DCD0]/60 flex items-center justify-between text-xs font-mono font-bold text-stone-700 group-hover:text-[#E05A2B]">
              <span>Launch Creator</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
