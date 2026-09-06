import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { Quiz } from '../types';

interface HeaderProps {
  onNewQuizClick: () => void;
  onScrollToSection: (id: string) => void;
  recentQuizzes: Quiz[];
  onSelectRecentQuiz: (quiz: Quiz) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewQuizClick,
  onScrollToSection,
  recentQuizzes,
  onSelectRecentQuiz,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F5F0E6] border-b-2 border-[#292929] relative">

      {/* Top micro-ticker */}
      <div className="bg-[#292929] text-[#F5F0E6] py-1.5 px-4 text-xs font-mono-code flex items-center justify-between overflow-x-auto whitespace-nowrap relative z-10">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E05A2B] animate-pulse"></span>
          <span className="tracking-wider uppercase font-bold text-[#E05A2B]">
            PROUDLY AFRIKAN EDUCATION
          </span>
          <span className="text-[#736E65] hidden sm:inline">|</span>
          <span className="hidden sm:inline text-[#D8D2C5]">
            TOOL 01: THE AI QUIZ GENERATOR
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold text-[#D8D2C5]">
          <span className="hidden md:inline">FREE & UNLIMITED</span>
          <span className="text-[#E05A2B]">⚡ GEMINI 3.7 FLASH</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4 relative z-10">
        {/* Brand logo & mark */}
        <button
          onClick={onNewQuizClick}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          aria-label="Proudly Afrikan Quiz Home"
        >
          {/* Rounded Emblem Badge with Logo on Orange Background */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#E05A2B] rounded-xl sm:rounded-2xl border border-[#292929]/20 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <img
              src="https://sifisos.com/wp-content/uploads/2026/04/Proudly-Afrikan-Logo.png"
              alt="Proudly Afrikan Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-display font-black text-base sm:text-xl tracking-tight leading-none text-[#292929]">
              PROUDLY AFRIKAN
            </div>
            <div className="font-mono-code text-[11px] sm:text-xs tracking-widest text-[#E05A2B] font-bold mt-0.5">
              QUIZ GENERATOR
            </div>
          </div>
        </button>

        {/* Action items & navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-6 font-mono-code text-xs font-bold uppercase tracking-wider text-[#4A4A4A]">
            <button
              onClick={() => onScrollToSection('quiz-builder')}
              className="hover:text-[#E05A2B] transition-colors cursor-pointer"
            >
              Builder
            </button>
            <button
              onClick={() => onScrollToSection('how-it-works')}
              className="hover:text-[#E05A2B] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onScrollToSection('faq')}
              className="hover:text-[#E05A2B] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Recent quizzes quick trigger */}
          {recentQuizzes.length > 0 && (
            <div className="relative group hidden sm:block">
              <button
                className="px-3.5 py-2 bg-[#FAF7F2] rounded-full border border-[#E0D8C5] shadow-xs text-xs font-mono-code font-bold text-[#292929] flex items-center gap-1.5 hover:bg-[#EAE4D6] transition-colors"
                title="Recent Quizzes"
              >
                <Layers className="w-3.5 h-3.5 text-[#E05A2B]" />
                <span>SAVED ({recentQuizzes.length})</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-[#FAF7F2] rounded-2xl border border-[#E0D8C5] shadow-lg p-2.5 hidden group-hover:block group-focus-within:block z-50">
                <div className="text-[10px] font-mono-code font-bold uppercase text-[#736E65] px-2 py-1 border-b border-[#292929]/10">
                  Saved Assessments
                </div>
                <div className="max-h-48 overflow-y-auto mt-1 space-y-1">
                  {recentQuizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => onSelectRecentQuiz(quiz)}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-[#E05A2B] hover:text-white transition-colors truncate block"
                    >
                      {quiz.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Create Quiz Button */}
          <button
            onClick={() => onScrollToSection('quiz-builder')}
            className="px-5 py-2.5 bg-[#E05A2B] hover:bg-[#CC4F24] text-white font-mono-code font-bold text-xs sm:text-sm tracking-wider uppercase rounded-full shadow-md hover:shadow-lg hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>MAKE QUIZ</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
