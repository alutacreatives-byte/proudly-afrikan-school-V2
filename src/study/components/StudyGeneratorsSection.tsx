import React from 'react';
import { 
  FileText, 
  Layers, 
  CheckSquare, 
  FileCheck2, 
  Presentation, 
  GitBranch, 
  ArrowUpRight
} from 'lucide-react';
import { StudyToolType } from '../types';

interface ToolItem {
  id: StudyToolType;
  toolNumber: string;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  btnText: string;
}

const STUDY_TOOLS: ToolItem[] = [
  {
    id: 'learning-path',
    toolNumber: '01',
    tag: 'PROGRESSIVE ROADMAP',
    title: 'LEARNING ROADMAP BUILDER',
    subtitle: 'Construct step-by-step competency milestones and skill progression roadmaps tailored to your goals.',
    icon: GitBranch,
    btnText: 'CREATE ROADMAP →',
  },
  {
    id: 'study-guide',
    toolNumber: '02',
    tag: 'STRUCTURED REVIEW',
    title: 'STUDY GUIDE GENERATOR',
    subtitle: 'Generate comprehensive revision notes with core principles, vocabulary breakdowns, and high-yield takeaways.',
    icon: FileText,
    btnText: 'CREATE STUDY GUIDE →',
  },
  {
    id: 'flashcards',
    toolNumber: '03',
    tag: 'ACTIVE RECALL',
    title: 'FLASHCARD GENERATOR',
    subtitle: 'Build interactive active-recall flashcard decks with instant flip animations, spaced hints, and shuffle drills.',
    icon: Layers,
    btnText: 'CREATE FLASHCARDS →',
  },
  {
    id: 'quiz',
    toolNumber: '04',
    tag: 'MASTERY CHECK',
    title: 'PRACTICE QUIZ GENERATOR',
    subtitle: 'Generate interactive multiple-choice practice tests with instant scoring, timer feedback, and deep explanations.',
    icon: CheckSquare,
    btnText: 'BUILD PRACTICE QUIZ →',
  },
  {
    id: 'pdf-quiz',
    toolNumber: '05',
    tag: 'DOCUMENT GROUNDED',
    title: 'PDF & DOCUMENT QUIZ',
    subtitle: 'Upload any reading PDF or syllabus to generate a diagnostic quiz grounded directly in your uploaded text.',
    icon: FileCheck2,
    btnText: 'UPLOAD PDF / DOC →',
  },
  {
    id: 'presentation',
    toolNumber: '06',
    tag: 'SLIDES & LECTURE',
    title: 'PRESENTATION GENERATOR',
    subtitle: 'Generate structured slide decks with presenter notes, visual prompts, and interactive discussion starters.',
    icon: Presentation,
    btnText: 'CREATE SLIDE DECK →',
  },
];

interface StudyGeneratorsSectionProps {
  onSelectTool: (toolId: StudyToolType) => void;
}

export const StudyGeneratorsSection: React.FC<StudyGeneratorsSectionProps> = ({
  onSelectTool,
}) => {
  return (
    <section id="study-generators-section" className="space-y-6 pt-4 border-t border-stone-200/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2">
        <div>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#E63956] uppercase tracking-widest block mb-1.5">
            LEARNING & STUDY SUITE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tighter uppercase leading-[0.92]">
            ALL 6 STUDY TOOLS.
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-mono font-bold text-stone-500 uppercase tracking-wider">
          ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
        </span>
      </div>

      {/* 6 Generator Cards in responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {STUDY_TOOLS.map((gen) => {
          const Icon = gen.icon;
          return (
            <div
              key={gen.id}
              onClick={() => onSelectTool(gen.id)}
              className="rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(230,57,86,0.12)] hover:border-[#E63956]/40 transition-all p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-black text-2xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                    {gen.toolNumber}
                  </span>
                  <span className="rounded-full px-3 py-1 bg-pink-50/70 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase tracking-wider">
                    {gen.tag}
                  </span>
                </div>

                <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center my-3 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl uppercase text-[#161616] mb-2 leading-tight group-hover:text-[#E63956] transition-colors">
                  {gen.title}
                </h3>

                <p className="text-sm text-stone-600 font-normal leading-relaxed">
                  {gen.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="font-display font-black text-xs uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                  {gen.btnText}
                </span>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#E63956] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
