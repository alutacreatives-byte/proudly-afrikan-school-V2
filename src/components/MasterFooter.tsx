import React, { useState } from 'react';
import { ArrowUp, Mail } from 'lucide-react';
import { MainNavTab } from './MasterHeader';

interface MasterFooterProps {
  onSelectTab?: (tab: MainNavTab) => void;
  onScrollToTop?: () => void;
}

export const MasterFooter: React.FC<MasterFooterProps> = ({
  onSelectTab,
  onScrollToTop,
}) => {
  const [logoError, setLogoError] = useState(false);

  const handleScrollTop = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNav = (tab: MainNavTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Massive Brand Statement with Circular Emblem */}
        <div className="border-b border-stone-800 pb-8 mb-10">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Circular Logo Emblem with Crimson Accent Glow */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] shadow-[0_0_28px_rgba(230,57,86,0.6)] p-2 sm:p-3 flex items-center justify-center shrink-0">
              {!logoError ? (
                <img
                  src="https://sifisos.com/wp-content/uploads/2026/04/Proudly-Afrikan-Logo.png"
                  alt="Proudly Afrikan"
                  className="w-full h-full object-contain brightness-0 invert"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-display font-black text-xs sm:text-base text-white tracking-tighter">
                  PA
                </span>
              )}
            </div>

            <div className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-none select-none">
              <span className="text-white">PROUDLY </span>
              <span className="text-[#E63956]">AFRIKAN</span>
            </div>
          </div>

          <div className="font-mono text-xs sm:text-sm text-stone-400 tracking-widest uppercase mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E63956] inline-block"></span>
            <span>EMPOWERING CONTINENTAL INTELLECT & GLOBAL MASTERY</span>
          </div>
        </div>

        {/* Links and Suite Manifesto Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          {/* Col 1: About Platform */}
          <div className="md:col-span-6 space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
              ABOUT THIS PLATFORM
            </h4>
            <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed font-sans font-normal">
              Proudly Afrikan School is an African learning platform where you can study, test, create, and master anything. 
              Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, quizzes, and interactive study sets in seconds.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono max-w-lg">
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-[#E63956] shrink-0" />
                <span className="leading-tight">
                  Institutional & billing<br />inquiries:
                </span>
              </div>
              <a
                href="mailto:support@proudlyafrikan.org"
                className="text-white hover:text-[#E63956] underline font-bold transition-colors"
              >
                support@proudlyafrikan.org
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 font-mono text-xs font-bold text-white">
              <li>
                <button
                  onClick={() => handleNav('STUDY')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ STUDY COMPANION</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('QUIZ')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ QUIZ GENERATOR</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('BUILD')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ RESOURCE BUILDER</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('MY SETS')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ MY SAVED SETS</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('PLANNER')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ STUDY PLANNER</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('PRICING')}
                  className="text-white hover:text-[#E63956] transition-colors cursor-pointer flex items-center gap-1.5 uppercase text-left"
                >
                  <span>→ PRICING PLANS</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Back to top & Version */}
          <div className="md:col-span-3 space-y-4 flex flex-col items-start md:items-end">
            <button
              onClick={handleScrollTop}
              className="px-5 py-3 bg-[#18181B] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-stone-800"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
            <div className="font-mono text-[11px] text-stone-400 space-y-1 text-left md:text-right">
              <div>VERSION 1.0 • 2026</div>
              <div className="font-semibold text-stone-300">CAPS & IEB ALIGNED</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-stone-400 gap-4">
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
              className="text-white hover:text-[#E63956] font-bold transition-colors"
            >
              POWERED BY SIFISOS.COM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
