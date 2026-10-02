import React from 'react';
import { 
  FileText, 
  Layers, 
  GitBranch, 
  FileCheck2, 
  MessageSquare, 
  Gamepad2 
} from 'lucide-react';
import { StudyToolType } from '../types';

export const STUDY_TOOLS_MENU_LIST = [
  { id: 'study-guide' as StudyToolType, num: '01', title: 'Study Guide Generator', icon: FileText },
  { id: 'flashcards' as StudyToolType, num: '02', title: 'Flashcard Generator', icon: Layers },
  { id: 'learning-path' as StudyToolType, num: '03', title: 'Learning Roadmap', icon: GitBranch },
  { id: 'essay-grader' as StudyToolType, num: '04', title: 'Essay Grader', icon: FileCheck2 },
  { id: 'pdf-quiz' as StudyToolType, num: '05', title: 'Tutor Chat', icon: MessageSquare },
  { id: 'focus-quest' as StudyToolType, num: '06', title: 'Pac-Study Maze', icon: Gamepad2 },
];

interface StudyToolsMenuProps {
  activeTool?: StudyToolType | string | null;
  onSelectTool: (toolId: StudyToolType) => void;
}

export const StudyToolsMenu: React.FC<StudyToolsMenuProps> = ({ activeTool, onSelectTool }) => {
  return (
    <div id="study-tools-menu" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80">
      {STUDY_TOOLS_MENU_LIST.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id || (tool.id === 'flashcards' && activeTool === 'flashcard');
        return (
          <button
            key={tool.id}
            id={`study-menu-${tool.id}`}
            data-testid={`study-menu-${tool.id}`}
            type="button"
            onClick={() => onSelectTool(tool.id)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {tool.num}
            </span>
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E63956]'}`} />
            <span>{tool.title}</span>
          </button>
        );
      })}
    </div>
  );
};
