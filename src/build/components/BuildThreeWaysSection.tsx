import React from 'react';
import { Type, ClipboardCopy, FileUp, Camera, ArrowDown } from 'lucide-react';

export type BuildCreationMethod = 'topic' | 'text' | 'pdf' | 'camera';

interface BuildThreeWaysSectionProps {
  activeMethod: BuildCreationMethod;
  onSelectMethod: (method: BuildCreationMethod) => void;
}

export const BuildThreeWaysSection: React.FC<BuildThreeWaysSectionProps> = ({
  activeMethod,
  onSelectMethod,
}) => {
  const cards = [
    {
      id: 'topic' as BuildCreationMethod,
      num: '01',
      badgeText: 'FASTEST',
      badgeClass: 'bg-[#E63956] text-white shadow-[0_4px_14px_rgba(230,57,86,0.35)]',
      title: 'TYPE IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'TOPIC & IDEA MODE',
      desc: 'Enter any topic, curriculum subject, or concept and let AI craft a structured resource instantly.',
      icon: Type,
    },
    {
      id: 'text' as BuildCreationMethod,
      num: '02',
      badgeText: 'DEEP CONTEXT',
      badgeClass: 'bg-stone-900 text-white',
      title: 'PASTE IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'NOTES & ARTICLES',
      desc: 'Paste syllabus paragraphs, lesson transcripts, or curriculum excerpts to ground the generated questions.',
      icon: ClipboardCopy,
    },
    {
      id: 'pdf' as BuildCreationMethod,
      num: '03',
      badgeText: 'PDF • DOC • DOCX',
      badgeClass: 'bg-stone-900 text-white',
      title: 'UPLOAD IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Drop in textbook chapters, PDFs, Word docs, or test drafts to extract context and synthesize classroom packs.',
      icon: FileUp,
    },
    {
      id: 'camera' as BuildCreationMethod,
      num: '04',
      badgeText: 'CAMERA • OCR',
      badgeClass: 'bg-[#E63956] text-white shadow-[0_4px_14px_rgba(230,57,86,0.35)]',
      title: 'CAPTURE IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'CAMERA & PHOTO MODE',
      desc: 'Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets to instantly digitize and build curriculum.',
      icon: Camera,
    },
  ];

  return (
    <section className="space-y-8 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider block mb-2">
            FLEXIBLE INPUT MODES
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
            FOUR WAYS TO CREATE.
          </h2>
        </div>
        <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
          Select an input method below to immediately jump into the resource generator workbench.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeMethod === card.id;
          return (
            <div
              key={card.id}
              onClick={() => onSelectMethod(card.id)}
              className={`card-3d-elevated p-6 sm:p-7 flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? 'border-2 border-[#E63956] ring-2 ring-[#E63956]/25'
                  : 'hover:border-[#E63956]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                    {card.num}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${card.badgeClass}`}>
                    {card.badgeText}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-tight mb-1 ${card.titleColor}`}>
                  {card.title}
                </h3>
                <div className="font-mono text-[11px] sm:text-xs font-bold text-[#E63956] uppercase tracking-wider mb-3">
                  {card.subtitle}
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                  LAUNCH BUILDER
                </span>
                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-[#E63956] text-stone-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
