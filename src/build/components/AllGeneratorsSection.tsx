import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Layers, 
  Network, 
  BookOpen, 
  Presentation, 
  ArrowRight 
} from 'lucide-react';
import { BuildToolType } from '../types';

interface AllGeneratorsSectionProps {
  onSelectTool: (toolId: BuildToolType) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({ onSelectTool }) => {
  const generators = [
    {
      id: 'course' as BuildToolType,
      num: '01',
      badgeText: 'CURRICULUM & MODULES',
      title: 'COURSE SYLLABUS BUILDER',
      desc: 'Design multi-week academic course modules with learning outcomes, pacing, and capstone projects.',
      icon: GraduationCap,
      actionText: 'CREATE COURSE',
    },
    {
      id: 'exam' as BuildToolType,
      num: '02',
      badgeText: 'ASSESSMENT & TESTING',
      title: 'EXAM & QUIZ GENERATOR',
      desc: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
      icon: FileText,
      actionText: 'CREATE EXAM',
    },
    {
      id: 'worksheet' as BuildToolType,
      num: '03',
      badgeText: 'PRACTICE & EXERCISES',
      title: 'WORKSHEET GENERATOR',
      desc: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
      icon: Layers,
      actionText: 'CREATE WORKSHEET',
    },
    {
      id: 'mindmap' as BuildToolType,
      num: '04',
      badgeText: 'VISUAL HIERARCHY',
      title: 'MIND MAP GENERATOR',
      desc: 'Transform topics, notes, or uploaded documents into interactive, editable visual mind maps with branching concepts.',
      icon: Network,
      actionText: 'CREATE MIND MAP',
    },
    {
      id: 'lesson' as BuildToolType,
      num: '05',
      badgeText: 'TEACHING & PEDAGOGY',
      title: 'LESSON PLAN GENERATOR',
      desc: "Create pedagogical lesson plans with timed phases, Bloom's taxonomy objectives, and assessment checks.",
      icon: BookOpen,
      actionText: 'CREATE LESSON PLAN',
    },
    {
      id: 'presentation' as BuildToolType,
      num: '06',
      badgeText: 'SLIDES & LECTURE',
      title: 'PRESENTATION GENERATOR',
      desc: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.',
      icon: Presentation,
      actionText: 'CREATE SLIDES',
    },
  ];

  return (
    <section id="all-generators-section" className="space-y-8 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider block mb-2">
            RESOURCE GENERATOR SUITE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#161616]">
            ALL 6 GENERATORS.
          </h2>
        </div>
        <div className="font-mono text-xs text-stone-500 uppercase tracking-wide">
          ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {generators.map((gen) => {
          const Icon = gen.icon;
          return (
            <div
              key={gen.id}
              onClick={() => onSelectTool(gen.id)}
              className="card-3d-elevated p-7 sm:p-8 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display font-black text-3xl sm:text-4xl text-stone-300 group-hover:text-[#E63956] transition-colors">
                    {gen.num}
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-800 group-hover:bg-[#E63956] group-hover:text-white transition-colors">
                    {gen.badgeText}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight mb-3 text-[#161616] group-hover:text-[#E63956] transition-colors">
                  {gen.title}
                </h3>

                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal mb-6">
                  {gen.desc}
                </p>
              </div>

              <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                  {gen.actionText}
                </span>
                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-[#E63956] text-stone-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
