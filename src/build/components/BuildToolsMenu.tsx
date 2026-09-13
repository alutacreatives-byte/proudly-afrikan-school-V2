import React from 'react';
import {
  GraduationCap,
  FileQuestion,
  FileSpreadsheet,
  GitBranch,
  BookOpenText,
  Presentation,
} from 'lucide-react';

export interface BuildToolItem {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BUILD_TOOLS_LIST: BuildToolItem[] = [
  {
    id: 'course',
    num: '01',
    title: 'Course Syllabus',
    shortTitle: 'Course',
    badge: 'Curriculum & Modules',
    icon: GraduationCap,
  },
  {
    id: 'exam',
    num: '02',
    title: 'Exam & Quiz',
    shortTitle: 'Exam & Quiz',
    badge: 'Assessment & Testing',
    icon: FileQuestion,
  },
  {
    id: 'worksheet',
    num: '03',
    title: 'Worksheet',
    shortTitle: 'Worksheet',
    badge: 'Practice & Drills',
    icon: FileSpreadsheet,
  },
  {
    id: 'mindmap',
    num: '04',
    title: 'Mind Map',
    shortTitle: 'Mind Map',
    badge: 'Visual Hierarchy',
    icon: GitBranch,
  },
  {
    id: 'lessonplan',
    num: '05',
    title: 'Lesson Plan',
    shortTitle: 'Lesson Plan',
    badge: 'Teaching & Pedagogy',
    icon: BookOpenText,
  },
  {
    id: 'presentation',
    num: '06',
    title: 'Presentation',
    shortTitle: 'Slide Deck',
    badge: 'Slides & Lecture',
    icon: Presentation,
  },
];

interface BuildToolsMenuProps {
  activeTool?: string;
  onSelectTool?: (toolId: string) => void;
}

export const BuildToolsMenu: React.FC<BuildToolsMenuProps> = ({
  activeTool = 'exam',
  onSelectTool,
}) => {
  return (
    <div className="w-full bg-white border border-stone-200/90 rounded-2xl p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between px-1 pb-1.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E63956]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
            Build Tools
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-400 hidden sm:inline">
          Switch Tool
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BUILD_TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool?.(tool.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[64px] cursor-pointer group ${
                isActive
                  ? 'bg-[#18181B] border-[#18181B] text-white shadow-xs'
                  : 'bg-stone-50/80 border-stone-200/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#E63956]' : 'text-stone-500 group-hover:text-stone-800'
                  }`}
                />
                <span
                  className={`font-mono text-[10px] font-bold uppercase ${
                    isActive ? 'text-stone-400' : 'text-stone-400'
                  }`}
                >
                  {tool.num}
                </span>
              </div>
              <div className="truncate">
                <div
                  className={`font-display font-black text-xs uppercase tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {tool.shortTitle}
                </div>
                <div
                  className={`font-mono text-[9px] uppercase tracking-wider truncate ${
                    isActive ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {tool.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
