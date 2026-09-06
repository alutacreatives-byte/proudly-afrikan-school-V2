import React from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  BookOpen, 
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Home, 
  Award
} from 'lucide-react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    total: number;
    confident: number;
    struggled: number;
    setTitle?: string;
  };
  onReviewNow: () => void;
  onBackToStudy: () => void;
  onGoHome: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  result,
  onReviewNow,
  onBackToStudy,
  onGoHome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#161616]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="session-complete-modal"
        className="tactile-card bg-[#FFFFFF] rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-center animate-fadeIn"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F0] border-2 border-[#161616] flex items-center justify-center text-[#D92B8A] shadow-[2px_2px_0px_#161616]">
          <Award className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <span className="inline-block px-3 py-0.5 bg-[#D92B8A] text-white font-mono text-xs font-bold uppercase rounded mb-2 border border-[#161616]">
            SESSION COMPLETE
          </span>
          <h2 className="font-display font-black text-3xl uppercase text-[#161616]">
            GREAT STUDY SESSION
          </h2>
          {result.setTitle && (
            <p className="text-xs sm:text-sm text-[#6B6862] font-medium mt-1">
              &ldquo;{result.setTitle}&rdquo;
            </p>
          )}
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-3 bg-[#FAF7F0] border-2 border-[#161616] p-4 rounded-xl">
          <div>
            <div className="font-mono text-2xl font-black text-[#161616]">
              {result.total}
            </div>
            <div className="font-display text-xs font-bold uppercase text-[#6B6862]">
              REVIEWED
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-black text-emerald-700">
              {result.confident}
            </div>
            <div className="font-display text-xs font-bold uppercase text-[#6B6862]">
              CONFIDENT
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-black text-[#D92B8A]">
              {result.struggled}
            </div>
            <div className="font-display text-xs font-bold uppercase text-[#6B6862]">
              NEED REVIEW
            </div>
          </div>
        </div>

        {/* Next Step Recommendation */}
        <div className="p-4 bg-[#FDEAF4] border-2 border-[#161616] rounded-xl text-left space-y-1">
          <span className="font-mono text-xs font-bold uppercase text-[#D92B8A] block">
            YOUR NEXT STEP
          </span>
          <p className="text-xs sm:text-sm text-[#161616] font-semibold">
            {result.struggled > 0
              ? `Review the ${result.struggled} ${result.struggled === 1 ? 'concept' : 'concepts'} you struggled with to lock them into memory.`
              : 'Excellent recall! Practice questions or explore the next learning set.'}
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {result.struggled > 0 ? (
            <button
              id="summary-review-now-btn"
              onClick={onReviewNow}
              className="w-full py-3 bg-[#D92B8A] text-white font-display text-xs sm:text-sm font-black uppercase rounded-md tactile-btn flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REVIEW CONCEPTS ({result.struggled})</span>
            </button>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="summary-back-study-btn"
              onClick={onBackToStudy}
              className="py-2.5 bg-[#FFFFFF] text-[#161616] font-display text-xs font-black uppercase rounded-md tactile-btn flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>LEARN MORE</span>
            </button>

            <button
              id="summary-home-btn"
              onClick={onGoHome}
              className="py-2.5 bg-[#FAF7F0] text-[#161616] font-display text-xs font-black uppercase rounded-md border border-[#161616] flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>DASHBOARD</span>
            </button>
          </div>

          {/* External Quiz CTA */}
          <div className="pt-3 border-t border-[#161616]/10">
            <a
              href="https://proudlyafrikan.com/quiz"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 bg-[#FAF7F0] border-2 border-[#161616] rounded-xl hover:bg-[#FAF0F6] hover:border-[#D92B8A] transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#6B6862] uppercase tracking-wider block">
                    FEEL READY TO TEST YOUR KNOWLEDGE?
                  </span>
                  <span className="font-display font-black text-xs uppercase text-[#161616] group-hover:text-[#D92B8A] flex items-center gap-1">
                    TAKE THE PROUDLY AFRIKAN QUIZ <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#6B6862] group-hover:text-[#D92B8A]" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
