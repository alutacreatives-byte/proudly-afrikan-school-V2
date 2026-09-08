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
    <section className="pt-2 pb-8 border-b border-stone-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edition Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-stone-300/80 rounded-full shadow-xs text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63956] inline-block animate-pulse"></span>
            <span>PROUDLY AFRIKAN EDUCATION • RESOURCE BUILDER</span>
          </div>

          {/* Giant Oversized Display Headline matching Study and Quiz */}
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.25rem] xl:text-[6rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
            BUILD<br />
            ANYTHING.<br />
            <span className="text-[#E63956]">ABOUT<br />ANYTHING.</span>
          </h1>

          {/* Clear, comfortable, easy-to-read subtext */}
          <p className="text-base sm:text-lg lg:text-xl text-stone-700 font-normal leading-[1.6] max-w-2xl">
            Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive courses in seconds.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onStartClick}
              className="px-7 sm:px-8 py-4 bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(230,57,86,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>BUILD AN EXAM</span>
            </button>
            <button
              onClick={onUploadPdfClick}
              className="px-7 sm:px-8 py-4 bg-[#161616] hover:bg-stone-800 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <FileUp className="w-4 h-4 text-[#E63956]" />
              <span>UPLOAD PDF / DOC</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Inspiration Card */}
        <div className="lg:col-span-5 space-y-5 lg:pt-4">
          <div className="card-3d-elevated p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                <span className="text-[#E63956]">❖</span>
                <span>INSTANT INSPIRATION</span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-400">
                TAP TO TRY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {sampleTopics.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSample(s.topic, s.category, s.tool)}
                  className="text-left p-3 rounded-xl bg-white/80 border border-stone-200 hover:border-[#E63956] hover:bg-pink-50/50 transition-all flex items-center gap-2.5 group cursor-pointer shadow-xs"
                >
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <span className="font-display font-bold text-xs text-stone-800 group-hover:text-[#E63956] transition-colors truncate">
                    {s.topic}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center pt-2 border-t border-stone-200">
              <p className="font-mono text-[11px] text-stone-500 uppercase tracking-wide">
                * Click any topic above to launch pre-filled workbench.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="card-3d-elevated p-4 grid grid-cols-3 gap-3 text-center">
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
    </section>
  );
};
