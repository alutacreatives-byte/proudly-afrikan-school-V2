import React, { useState } from 'react';
import { ChevronDown, Sparkles, FileText, Printer, BookmarkCheck } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: "HOW DOES PROUDLY AFRIKAN SCHOOL GENERATE LEARNING RESOURCES?",
    answer: "Our intelligent curriculum engine leverages advanced AI models grounded in African history, mathematics, sciences, literature, and cultural heritage to instantly construct high-yield study sets, interactive quizzes, flashcard decks, and pedagogical lesson plans.",
    icon: Sparkles,
  },
  {
    id: 'faq-2',
    question: "CAN I UPLOAD MY OWN STUDY MATERIALS OR PDFS?",
    answer: "Yes! You can upload lecture notes, textbooks, syllabi, or past exam papers in PDF, TXT, or text paste format. Our generator will automatically synthesize your materials into structured flashcards, quizzes, and revision guides.",
    icon: FileText,
  },
  {
    id: 'faq-3',
    question: "ARE THE GENERATED QUIZZES ALIGNED WITH CURRICULUM STANDARDS?",
    answer: "All generated assessments follow rigorous pedagogical standards with clear explanations for correct answers, Bloom's taxonomy difficulty grading, and interactive feedback designed to maximize knowledge retention.",
    icon: Printer,
  },
  {
    id: 'faq-4',
    question: "CAN I SAVE AND EXPORT MY CREATED SETS?",
    answer: "Absolutely. All generated study decks, quizzes, and lesson plans are automatically saved in your 'My Sets' workspace, where you can organize them, study offline, or export them to share with students and study groups.",
    icon: BookmarkCheck,
  },
  {
    id: 'faq-5',
    question: "IS THERE A LIMIT ON HOW MANY RESOURCES I CAN GENERATE?",
    answer: "Free accounts include generous starter credits, while Pro members enjoy unlimited generations, priority AI processing, advanced PDF parsing, and custom export formats.",
    icon: Sparkles,
  },
];

export function BuildFaqSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="space-y-8 pt-6 pb-8 border-t border-stone-200/80">
      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200/80 gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
            FREQUENTLY ASKED.
          </h2>
        </div>
        <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
          Everything you need to know about AI curriculum generators, PDF extraction, and resource exporting.
        </p>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;

          return (
            <div
              key={faq.id}
              className={`rounded-[2rem] border transition-all overflow-hidden bg-white ${
                isOpen
                  ? 'border-[#E05A2B] shadow-[0_16px_40px_rgba(224,90,43,0.14)] ring-1 ring-[#E05A2B]/20'
                  : 'border-stone-200/90 shadow-xs hover:border-stone-400/80 hover:shadow-md'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#E05A2B] text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-display font-black text-base sm:text-lg md:text-xl uppercase tracking-tight text-[#161616]">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-stone-100 text-[#E05A2B]' : 'text-stone-400 bg-stone-50'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 sm:px-8 pb-6 pt-1 text-sm sm:text-base text-stone-600 leading-relaxed border-t border-stone-100 font-normal">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
