import React from 'react';
import { Type, ClipboardCopy, FileUp, Camera, ArrowDown } from 'lucide-react';

export type BuildCreationMethod = 'topic' | 'text' | 'pdf' | 'capture';

interface BuildThreeWaysSectionProps {
  activeMethod?: BuildCreationMethod;
  onSelectMethod: (method: BuildCreationMethod) => void;
}

export const BuildThreeWaysSection: React.FC<BuildThreeWaysSectionProps> = ({
  activeMethod = 'topic',
  onSelectMethod,
}) => {
  const cards = [
    {
      id: 'topic' as BuildCreationMethod,
      num: '01',
      badgeText: 'FASTEST',
      badgeClass: 'bg-[#E05A2B] text-white shadow-[0_4px_14px_rgba(224,90,43,0.35)]',
      title: 'TYPE IT.',
      titleColor: 'text-[#E05A2B]',
      subtitle: 'TOPIC & CONCEPT MODE',
      desc: 'Type any subject, curriculum topic, or concept to generate lesson plans, assessment packs, or practice worksheets.',
      icon: Type,
    },
    {
      id: 'text' as BuildCreationMethod,
      num: '02',
      badgeText: 'DEEP CONTEXT',
      badgeClass: 'bg-[#FAF8F5] border border-stone-200 text-stone-700 shadow-xs',
      title: 'PASTE IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'LECTURE & CLASS NOTES',
      desc: 'Paste your raw teaching notes, textbook summaries, or article snippets to build tailored classroom lessons.',
      icon: ClipboardCopy,
    },
    {
      id: 'pdf' as BuildCreationMethod,
      num: '03',
      badgeText: 'PDF • DOC • DOCX',
      badgeClass: 'bg-[#18181B] text-white shadow-xs',
      title: 'UPLOAD IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Upload syllabus PDFs, past papers, or slides to extract content and ground every lesson plan with source citations.',
      icon: FileUp,
    },
    {
      id: 'capture' as BuildCreationMethod,
      num: '04',
      badgeText: 'CAMERA • OCR',
      badgeClass: 'bg-orange-50 text-[#E05A2B] border border-orange-200 shadow-xs',
      title: 'CAPTURE IT.',
      titleColor: 'text-[#E05A2B]',
      subtitle: 'CAMERA & PHOTO MODE',
      desc: 'Photograph textbook pages, handwritten work, equations, diagrams, or worksheets to instantly digitize and build.',
      icon: Camera,
    },
  ];

  const handleCardClick = (method: BuildCreationMethod) => {
    onSelectMethod(method);
    const sectionEl = document.getElementById('build-generators-section');
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-6 pt-4 border-t border-stone-200/80">
      <div>
        {/* Section Header - Exact matching 4 Ways To Study section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
              FLEXIBLE BUILD MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              FOUR WAYS TO BUILD.
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Choose how you want to provide your teaching content to generate instant curriculum materials.
          </p>
        </div>

        {/* 4 Elevated Soft Cards - Fully responsive across mobile, tablet, and desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeMethod === card.id;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`bg-white rounded-[2rem] border transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-[#E05A2B] shadow-[0_20px_45px_-10px_rgba(224,90,43,0.18)] ring-2 ring-[#E05A2B]/20'
                    : 'border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(224,90,43,0.14)] hover:-translate-y-1 hover:border-[#E05A2B]/40'
                }`}
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#E05A2B] transition-colors">
                      {card.num}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${card.badgeClass}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#E05A2B] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#E05A2B] group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-tight mb-1 ${card.titleColor}`}>
                    {card.title}
                  </h3>
                  <div className="font-mono text-[11px] font-bold text-[#E05A2B] uppercase tracking-wider mb-2.5">
                    {card.subtitle}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#FF7A00] transition-colors">
                    SELECT MODE
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:translate-y-0.5 transition-all shadow-xs">
                    <ArrowDown className="w-3.5 h-3.5" />
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

