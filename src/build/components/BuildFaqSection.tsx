import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const BuildFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'HOW DOES THE STUDY SUITE ACCELERATE ACTIVE RECALL?',
      a: 'The Study Suite generates structured flashcards, self-grading diagnostic quizzes, and progressive mastery guides tailored specifically to high-yield syllabus concepts, forcing active cognitive retrieval rather than passive re-reading.'
    },
    {
      q: 'WHAT IS THE BUILD SUITE DESIGNED FOR?',
      a: 'BUILD is an advanced AI-powered curriculum generation engine specifically tailored for educators, trainers, and students across African and global educational frameworks (including CAPS). It generates exams, memos, lesson plans, study guides, worksheets, presentations, courses, and learning roadmaps in seconds.'
    },
    {
      q: 'HOW DO I EXPORT MY GENERATED RESOURCES?',
      a: 'Every generated resource includes instant one-click export buttons to download as Word documents (.doc), formatted PDF files, or copy directly to your clipboard for easy sharing.'
    },
    {
      q: 'CAN I UPLOAD MY OWN SYLLABUS OR TEXTBOOK PDFS?',
      a: 'Yes! You can upload PDF documents, lecture notes, or textbook chapters. Our AI engine extracts the text and uses it as precise source material for generating targeted curriculum items.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 border-t border-stone-200/80">
      {/* Header section matching image format */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8 space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#161616] uppercase tracking-tight">
            FREQUENTLY ASKED.
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p className="font-sans text-xs sm:text-sm text-stone-500 leading-relaxed">
            Everything you need to know about active recall, document-grounded quizzes, and personalized study roadmaps.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Cards */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl transition-all ${
                isOpen
                  ? 'border-2 border-[#E63956] shadow-[0_6px_25px_rgba(230,57,86,0.12)]'
                  : 'border border-stone-200/90 shadow-xs hover:border-stone-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 sm:px-8 py-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-[#FFF0F2] text-[#E63956]' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-display font-black text-sm sm:text-base text-[#161616] uppercase tracking-tight">
                    {faq.q}
                  </span>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? 'bg-[#E63956] text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 sm:px-8 pb-8 font-sans text-xs sm:text-sm text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
