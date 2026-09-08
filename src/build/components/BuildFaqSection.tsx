import React, { useState } from 'react';
import { ChevronDown, Sparkles, FileText, Printer, Bookmark } from 'lucide-react';

export const BuildFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'HOW DOES PROUDLY AFRIKAN BUILD USE GEMINI 3.7 FLASH?',
      a: 'Proudly Afrikan Build leverages Google\'s state-of-the-art Gemini models to rapidly analyze topics, extract pedagogical hierarchies, formulate rigorous questions, and synthesize curriculum-aligned worksheets and lesson plans with high factual accuracy.',
      icon: Sparkles,
    },
    {
      q: 'CAN I USE MY OWN PDF, DOC, OR DOCX DOCUMENTS AS SOURCE MATERIAL?',
      a: 'Yes! You can paste notes or upload PDF, TXT, and Word documents in any generator. The AI will extract the source content and base all generated exams, worksheets, or courses directly on your provided materials.',
      icon: FileText,
    },
    {
      q: 'CAN I PRINT OR EXPORT THE GENERATED WORKSHEETS AND EXAMS?',
      a: 'Every generated resource includes one-click Print to PDF formatting, Copy to Clipboard, and direct saving into your "My Sets" workspace for future access.',
      icon: Printer,
    },
    {
      q: 'IS MY SAVED WORK PRESERVED BETWEEN SESSIONS?',
      a: 'Yes. All generated exams, lesson plans, courses, and mind maps are saved securely to your browser storage and accessible instantly in the My Sets tab.',
      icon: Bookmark,
    },
  ];

  return (
    <section className="space-y-8 pt-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider block mb-2">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#161616]">
            FREQUENTLY ASKED.
          </h2>
        </div>
        <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-sm leading-relaxed">
          Everything you need to know about generating exams, worksheets, lesson plans, and classroom resources.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const Icon = faq.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-[1.75rem] border transition-all overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.04)] ${
                isOpen ? 'border-[#E63956] ring-2 ring-[#E63956]/15' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen ? 'bg-[#E63956] text-white' : 'bg-stone-100 text-stone-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#161616]">
                    {faq.q}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 transition-transform ${
                  isOpen ? 'rotate-180 bg-[#E63956]/10 text-[#E63956]' : 'text-stone-500'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-7 sm:px-7 sm:pb-7 pt-0 border-t border-stone-100 mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
