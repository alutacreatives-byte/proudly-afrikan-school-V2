import React from 'react';
import { StudyToolType } from '../types';
import { useAuthCredit } from '../../context/AuthCreditContext';
import { useDynamicInspiration, STUDY_TOPICS_POOL } from '../../data/inspirationTopics';
import { RefreshCw } from 'lucide-react';

interface StudyHeroProps {
  onStartClick: () => void;
  onSelectSample: (sampleTopic: string, category: string, suggestedTool?: StudyToolType) => void;
  onUploadPdfClick?: () => void;
}

export const StudyHero: React.FC<StudyHeroProps> = ({ 
  onStartClick, 
  onSelectSample,
  onUploadPdfClick,
}) => {
  const { user } = useAuthCredit();
  const { topics: inspirationTopics, refreshTopics } = useDynamicInspiration(
    STUDY_TOPICS_POOL,
    'study',
    user?.email || user?.id || (user as any)?.uid
  );

  return (
    <section className="pt-2 pb-8 border-b border-stone-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-start">
          {/* Edition Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300/80 rounded-full shadow-xs text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-stone-800 self-start h-8 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#E63956] inline-block animate-pulse shrink-0"></span>
            <span className="truncate">PROUDLY AFRIKAN EDUCATION • ACTIVE STUDY SUITE</span>
          </div>

          {/* Giant Oversized Display Headline matching Build and Quiz */}
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
            STUDY<br />
            SMARTER.<br />
            <span className="text-[#E63956]">MASTER<br />ANYTHING.</span>
          </h1>

          {/* Clear, comfortable, easy-to-read subtext */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-[1.3rem] text-stone-700 font-normal leading-[1.65] max-w-2xl min-h-[4rem] sm:min-h-[3.5rem] lg:min-h-[4rem]">
            Synthesize any topic, lecture notes, or textbook PDF into structured study guides, active recall flashcards, grounded quizzes, and learning roadmaps in seconds.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onStartClick}
              className="px-7 sm:px-8 py-4 bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(230,57,86,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>EXPLORE STUDY TOOLS</span>
            </button>

            <button
              onClick={onUploadPdfClick || onStartClick}
              className="px-7 sm:px-8 py-4 bg-[#161616] hover:bg-stone-800 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>UPLOAD PDF / DOC</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Inspiration Card & Metrics */}
        <div className="lg:col-span-5 space-y-5 lg:pt-0">
          {/* Instant Inspiration Clay Card */}
          <div className="clay-card-3d p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 h-9">
              <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                <span className="text-[#FF7A00] text-sm">❖</span>
                <span>INSTANT STUDY INSPIRATION</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshTopics}
                  className="p-1 text-stone-400 hover:text-[#FF7A00] transition-colors rounded-full hover:bg-stone-200/50 cursor-pointer"
                  title="Shuffle topics"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                  TAP TO TRY
                </span>
              </div>
            </div>

            {/* 2-Column Pill Button Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-h-[10.5rem]">
              {inspirationTopics.map((item, idx) => {
                const match = item.label.match(/^(\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]|[\u2600-\u27BF])\s*(.*)$/u);
                const emoji = match ? match[1] : '';
                const title = match ? match[2] : item.label;

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectSample(item.topic, item.category, item.tool)}
                    className="h-11 px-3.5 clay-pill-3d hover:border-[#FF7A00]/40 hover:text-[#FF7A00] text-stone-800 font-medium text-xs sm:text-sm flex items-center gap-2 text-left truncate cursor-pointer transition-all"
                  >
                    {emoji && <span className="text-base shrink-0">{emoji}</span>}
                    <span className="truncate">{title}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <span className="text-xs font-mono text-stone-500 font-medium">
                * Click any topic above to launch pre-filled study workbench.
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar in Clay Lozenge */}
          <div className="grid grid-cols-3 gap-2 clay-card-3d p-3.5 rounded-2xl">
            <div className="text-center border-r border-stone-200/80 pr-2">
              <div className="font-mono text-lg sm:text-xl font-black text-[#FF7A00]">
                6
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                STUDY TOOLS
              </div>
            </div>

            <div className="text-center border-r border-stone-200/80 px-2">
              <div className="font-mono text-lg sm:text-xl font-black text-stone-900">
                PDF
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                DOCUMENT PARSER
              </div>
            </div>

            <div className="text-center pl-2">
              <div className="font-mono text-lg sm:text-xl font-black text-[#FF7A00]">
                ACTIVE
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                RECALL DRILLS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
