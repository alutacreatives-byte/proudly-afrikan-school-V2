import React from 'react';
import { Type, ClipboardCopy, FileUp, ArrowDown } from 'lucide-react';
import { CreationMethod } from '../types';

interface ThreeWaysSectionProps {
  onSelectMethod: (method: CreationMethod) => void;
  activeMethod: CreationMethod;
}

export const ThreeWaysSection: React.FC<ThreeWaysSectionProps> = ({
  onSelectMethod,
  activeMethod,
}) => {
  const cards = [
    {
      id: 'topic' as CreationMethod,
      num: '01',
      badgeText: 'FASTEST',
      badgeClass: 'bg-[#E05A2B] text-white shadow-xs',
      title: 'TYPE IT.',
      subtitle: 'TOPIC & IDEA MODE',
      desc: 'Enter any topic, curriculum subject, or concept and let AI craft a structured quiz resource instantly.',
      icon: Type,
    },
    {
      id: 'text' as CreationMethod,
      num: '02',
      badgeText: 'DEEP CONTEXT',
      badgeClass: 'bg-[#FAF7F2] border border-[#E0D8C5] text-[#5E5950]',
      title: 'PASTE IT.',
      subtitle: 'NOTES & ARTICLES',
      desc: 'Paste syllabus paragraphs, lesson transcripts, or curriculum excerpts to ground the generated questions.',
      icon: ClipboardCopy,
    },
    {
      id: 'pdf' as CreationMethod,
      num: '03',
      badgeText: 'PDF • DOC • DOCX',
      badgeClass: 'bg-[#1A1A1A] text-white',
      title: 'UPLOAD IT.',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Drop in textbook chapters, PDFs, Word docs, or test drafts to extract context and synthesize quiz questions.',
      icon: FileUp,
    },
  ];

  const handleCardClick = (method: CreationMethod) => {
    onSelectMethod(method);
    const builderEl = document.getElementById('quiz-builder');
    if (builderEl) {
      builderEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-12 border-b border-stone-200/80">
      <div>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
              FLEXIBLE INPUT MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              THREE WAYS TO CREATE.
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Select an input method below to immediately jump into the quiz generator workbench.
          </p>
        </div>

        {/* 3 Elevated Soft Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeMethod === card.id;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`bg-white rounded-[2rem] border transition-all p-7 sm:p-8 flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-[#E05A2B] shadow-[0_16px_40px_-10px_rgba(224,90,43,0.15)] ring-2 ring-[#E05A2B]/20'
                    : 'border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#161616]/30'
                }`}
              >
                <div>
                  {/* Top card bar with number and pill */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-black text-2xl sm:text-3xl text-stone-400">
                      {card.num}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${card.badgeClass}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* Dark Circular Icon Badge */}
                  <div className="w-12 h-12 rounded-full bg-[#161616] text-[#E05A2B] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#E05A2B] group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight leading-tight">
                    {card.title}
                  </h3>
                  <div className="font-mono text-[11px] font-bold text-[#E05A2B] uppercase tracking-wider mt-1 mb-3">
                    {card.subtitle}
                  </div>

                  {/* Subtext Description */}
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-6 mt-6 border-t border-stone-200 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] group-hover:text-[#E05A2B] transition-colors">
                    LAUNCH BUILDER
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#161616] text-white flex items-center justify-center group-hover:bg-[#E05A2B] group-hover:translate-y-0.5 transition-all">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
