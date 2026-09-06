import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface FooterProps {
  onScrollToTop: () => void;
  onScrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToTop,
  onScrollToSection,
}) => {
  return (
    <footer className="bg-[#292929] text-[#F5F0E6] border-t-2 border-[#292929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Massive Brand Statement */}
        <div className="border-b border-[#4A4A4A] pb-12 mb-12">
          <div className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#F5F0E6] uppercase leading-none">
            PROUDLY <span className="text-[#E05A2B]">AFRIKAN</span>
          </div>
          <div className="font-mono-code text-sm sm:text-base text-[#A39E93] tracking-widest uppercase mt-3">
            EMPOWERING CONTINENTAL INTELLECT & GLOBAL MASTERY
          </div>
        </div>

        {/* Links and Manifesto Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
          <div className="md:col-span-6 space-y-4">
            <h4 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#E05A2B]">
              ABOUT THIS TOOL
            </h4>
            <p className="text-sm sm:text-base text-[#D8D2C5] max-w-md leading-relaxed">
              Proudly Afrikan Quiz is a fun way to learn, test yourself and share what you know. Turn your notes, articles, topics and PDFs into quizzes and see how you score.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#E05A2B]">
              NAVIGATION
            </h4>
            <ul className="space-y-2 font-mono-code text-xs font-bold text-[#F5F0E6]">
              <li>
                <button
                  onClick={() => onScrollToSection('quiz-builder')}
                  className="hover:text-[#E05A2B] transition-colors cursor-pointer"
                >
                  → QUIZ GENERATOR
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('how-it-works')}
                  className="hover:text-[#E05A2B] transition-colors cursor-pointer"
                >
                  → HOW IT WORKS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('faq')}
                  className="hover:text-[#E05A2B] transition-colors cursor-pointer"
                >
                  → FREQUENTLY ASKED QUESTIONS
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3 flex flex-col items-start md:items-end">
            <button
              onClick={onScrollToTop}
              className="px-4 py-3 bg-[#E05A2B] hover:bg-[#CC4F24] text-white font-mono-code font-bold text-xs uppercase tracking-wider brutal-border brutal-shadow-sm brutal-hover flex items-center gap-2 cursor-pointer"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-4 h-4" />
            </button>
            <span className="font-mono-code text-[11px] text-[#A39E93]">
              VERSION 1.0 • 2026
            </span>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-[#4A4A4A] flex flex-col sm:flex-row items-center justify-between text-xs font-mono-code text-[#A39E93] gap-4">
          <div>
            © {new Date().getFullYear()} PROUDLY AFRIKAN EDUCATION. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2">
            <span>DESIGNED WITH EDITORIAL RIGOR</span>
            <span>•</span>
            <a
              href="https://sifisos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E05A2B] hover:underline font-bold transition-colors"
            >
              POWERED BY SIFISOS.COM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
