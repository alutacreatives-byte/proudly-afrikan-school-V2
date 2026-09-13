import React from 'react';
import { Type, ClipboardCopy, FileUp, Camera, ArrowDown } from 'lucide-react';

export type StudyCreationMethod = 'topic' | 'text' | 'pdf' | 'capture';

interface StudyThreeWaysSectionProps {
  onSelectMethod: (method: StudyCreationMethod) => void;
  activeMethod?: StudyCreationMethod;
}

export const StudyThreeWaysSection: React.FC<StudyThreeWaysSectionProps> = ({
  onSelectMethod,
  activeMethod = 'topic',
}) => {
  const cards = [
    {
      id: 'topic' as StudyCreationMethod,
      num: '01',
      badgeText: 'FASTEST',
      badgeClass: 'bg-[#E63956] text-white shadow-[0_4px_14px_rgba(230,57,86,0.35)]',
      title: 'TYPE IT.',
      titleColor: 'text-[#E63956]',
      subtitle: 'TOPIC & CONCEPT MODE',
      desc: 'Type any subject, exam topic, or concept to generate flashcards, study guides, or practice quizzes.',
      icon: Type,
    },
    {
      id: 'text' as StudyCreationMethod,
      num: '02',
      badgeText: 'DEEP CONTEXT',
      badgeClass: 'bg-[#FAF8F5] border border-stone-200 text-stone-700 shadow-xs',
      title: 'PASTE IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'LECTURE & CLASS NOTES',
      desc: 'Paste your raw revision notes, textbook summaries, or article snippets to build tailored drills.',
      icon: ClipboardCopy,
    },
    {
      id: 'pdf' as StudyCreationMethod,
      num: '03',
      badgeText: 'PDF • DOC • DOCX',
      badgeClass: 'bg-[#18181B] text-white shadow-xs',
      title: 'UPLOAD IT.',
      titleColor: 'text-[#161616]',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Upload syllabus PDFs, past papers, or slides to extract content and ground every quiz with source citations.',
      icon: FileUp,
    },
    {
      id: 'capture' as StudyCreationMethod,
      num: '04',
      badgeText: 'CAMERA • OCR',
      badgeClass: 'bg-[#D92B8A] text-white shadow-[0_4px_14px_rgba(217,43,138,0.35)]',
      title: 'CAPTURE IT.',
      titleColor: 'text-[#D92B8A]',
      subtitle: 'CAMERA & PHOTO MODE',
      desc: 'Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets to instantly digitize and study.',
      icon: Camera,
    },
  ];

  const handleCardClick = (method: StudyCreationMethod) => {
    onSelectMethod(method);
    const sectionEl = document.getElementById('study-input-workbench') || document.getElementById('study-generators-section');
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-6 pt-4 border-t border-stone-200/80">
      <div>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-stone-200/80 gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956] block mb-2">
              FLEXIBLE STUDY MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              FOUR WAYS TO STUDY.
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Choose how you want to provide your study content to generate instant revision materials.
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
                    ? 'border-[#E63956] shadow-[0_20px_45px_-10px_rgba(230,57,86,0.18)] ring-2 ring-[#E63956]/20'
                    : 'border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(230,57,86,0.14)] hover:-translate-y-1 hover:border-[#E63956]/40'
                }`}
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#E63956] transition-colors">
                      {card.num}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${card.badgeClass}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#E63956] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#E63956] group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-tight mb-1 ${card.titleColor}`}>
                    {card.title}
                  </h3>
                  <div className="font-mono text-[11px] font-bold text-[#E63956] uppercase tracking-wider mb-2.5">
                    {card.subtitle}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#E63956] transition-colors">
                    SELECT MODE
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#E63956] group-hover:translate-y-0.5 transition-all shadow-xs">
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
