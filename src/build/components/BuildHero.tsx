import React from 'react';
import { Sparkles, ArrowRight, FileUp } from 'lucide-react';
import { BuildToolType } from '../types';

interface BuildHeroProps {
  onStartClick: () => void;
  onSelectSample: (topic: string, category: string, suggestedTool?: BuildToolType) => void;
  onUploadPdfClick: () => void;
}

export const BuildHero: React.FC<BuildHeroProps> = ({
  onStartClick,
  onSelectSample,
  onUploadPdfClick,
}) => {
  const sampleTopics = [
    { topic: 'Kingdom of Mali', category: 'African History', tool: 'exam' as BuildToolType, icon: '👑' },
    { topic: 'Great Rift Valley', category: 'Geography & Ecology', tool: 'worksheet' as BuildToolType, icon: '🌍' },
    { topic: 'African Literature', category: 'Literature & Arts', tool: 'lesson' as BuildToolType, icon: '📚' },
    { topic: 'Solar In Africa', category: 'Renewable Energy', tool: 'course' as BuildToolType, icon: '⚙️' },
    { topic: 'Sustainable Farming', category: 'Agri-Tech', tool: 'mindmap' as BuildToolType, icon: '🌱' },
    { topic: 'Nubian Pyramids', category: 'Ancient Civilizations', tool: 'exam' as BuildToolType, icon: '🗿' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 pb-8">
      {/* Left Column: Bold Typography & CTA */}
      <div className="lg:col-span-7 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E63956]/10 border border-[#E63956]/20 text-[#E63956] font-mono text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#E63956] animate-pulse" />
          PROUDLY AFRIKAN EDUCATION • RESOURCE BUILDER
        </div>

        <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight text-[#161616] leading-[0.95]">
          BUILD ANYTHING.{' '}
          <span className="text-[#E63956] block mt-1">ABOUT ANYTHING.</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
          Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive courses in seconds.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onStartClick}
            className="px-7 py-4 rounded-2xl bg-[#E63956] hover:bg-[#d02e48] text-white font-display font-bold uppercase tracking-wider text-sm shadow-[0_12px_25px_rgba(230,57,86,0.35)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
          >
            BUILD AN EXAM / WORKSHEET
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onUploadPdfClick}
            className="px-7 py-4 rounded-2xl bg-[#18181B] hover:bg-black text-white font-display font-bold uppercase tracking-wider text-sm shadow-[0_12px_25px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
          >
            <FileUp className="w-4 h-4 text-[#E63956]" />
            UPLOAD PDF / DOC
          </button>
        </div>
      </div>

      {/* Right Column: Instant Inspiration Card */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-[2rem] border border-stone-200/90 p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63956]" />
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#161616]">
                INSTANT INSPIRATION
              </h3>
            </div>
            <span className="font-mono text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              TAP TO TRY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {sampleTopics.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSample(s.topic, s.category, s.tool)}
                className="text-left p-3 rounded-xl border border-stone-200/80 hover:border-[#E63956] hover:bg-[#E63956]/5 transition-all flex items-center gap-2.5 group"
              >
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <span className="font-display font-bold text-xs text-stone-800 group-hover:text-[#E63956] transition-colors truncate">
                  {s.topic}
                </span>
              </button>
            ))}
          </div>

          <div className="text-center pt-2 border-t border-stone-100">
            <p className="font-mono text-[11px] text-stone-500 uppercase tracking-wide">
              * Click any topic above to launch pre-filled workbench.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-4 grid grid-cols-3 gap-3 bg-white rounded-2xl border border-stone-200/90 p-4 text-center shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div>
            <div className="font-display font-black text-xl text-[#161616]">6</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold">Generators</div>
          </div>
          <div className="border-x border-stone-200">
            <div className="font-display font-black text-xl text-[#E63956]">PDF</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold">Document AI</div>
          </div>
          <div>
            <div className="font-display font-black text-xl text-[#161616]">CAPS</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold">IEB Aligned</div>
          </div>
        </div>
      </div>
    </div>
  );
};
