import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  PlusCircle,
  Eye,
  Share2,
  Copy,
  Check,
  Award,
  Home,
} from 'lucide-react';
import { Quiz, UserAnswer } from '../types';
import { encodeQuizToUrl } from '../utils/quizShare';
import { ShareModal } from './ShareModal';

interface ResultsScreenProps {
  quiz: Quiz;
  userAnswers: Record<string, UserAnswer>;
  score: number;
  totalQuestions: number;
  onReviewAnswers: () => void;
  onTryAgain: () => void;
  onCreateAnother: () => void;
  onHome?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  quiz,
  userAnswers,
  score,
  totalQuestions,
  onReviewAnswers,
  onTryAgain,
  onCreateAnother,
  onHome,
}) => {
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);

  // Trigger celebration confetti if score >= 70%
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E05A2B', '#292929', '#1E3A2B', '#F5F0E6'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [percentage]);

  // Encouraging feedback copy based on prompt requirements
  let feedbackTitle = '';
  let feedbackMessage = '';

  if (percentage >= 90) {
    feedbackTitle = 'EXCELLENT.';
    feedbackMessage = 'YOU KNOW YOUR STUFF.';
  } else if (percentage >= 70) {
    feedbackTitle = 'NICE WORK.';
    feedbackMessage = "A LITTLE MORE REVISION AND YOU'VE GOT IT.";
  } else if (percentage >= 50) {
    feedbackTitle = 'GOOD START.';
    feedbackMessage = "LET'S GET THAT SCORE UP.";
  } else {
    feedbackTitle = 'TIME TO DIG IN.';
    feedbackMessage = 'PRACTICE BUILDS DEEP MASTERY.';
  }

  const handleShare = async () => {
    const shareUrl = encodeQuizToUrl(quiz);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz: ${quiz.title}`,
          text: `I scored ${score}/${totalQuestions} (${percentage}%) on "${quiz.title}" on Proudly Afrikan Quiz! Try to beat my score:`,
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLink = () => {
    const shareUrl = encodeQuizToUrl(quiz);
    copyToClipboard(shareUrl);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#E6E0D5] shadow-[0_15px_40px_-10px_rgba(41,41,41,0.08)] p-6 sm:p-10 md:p-12 text-center max-w-4xl mx-auto transition-all w-full box-border">
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAF7F2] rounded-full border border-[#E0D8C5] text-xs font-mono-code font-bold uppercase tracking-wider text-[#292929] mb-8">
        <Award className="w-4 h-4 text-[#E05A2B]" />
        <span>ASSESSMENT COMPLETE</span>
      </div>

      {/* Main Score Poster Display */}
      <div className="mb-6">
        <span className="font-display font-black text-xl sm:text-2xl text-[#5E5950] uppercase tracking-wider block">
          YOU GOT
        </span>
        <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#292929] tracking-tighter leading-none my-3">
          {score} <span className="text-[#A39E93] text-3xl sm:text-5xl">/</span> {totalQuestions}
        </div>
        <div className="inline-block px-6 py-2 bg-[#292929] text-[#F5F0E6] font-display font-black text-2xl sm:text-4xl rounded-2xl mt-2 shadow-xs">
          {percentage}%
        </div>
      </div>

      {/* Encouraging Editorial Feedback */}
      <div className="max-w-xl mx-auto my-8 p-5 sm:p-6 bg-[#FAF7F2] rounded-2xl border border-[#E0D8C5]">
        <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#E05A2B] uppercase">
          {feedbackTitle}
        </h3>
        <p className="font-display font-bold text-base sm:text-lg md:text-xl text-[#292929] uppercase mt-1">
          {feedbackMessage}
        </p>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8">
        <button
          onClick={onReviewAnswers}
          className="py-4 px-4 bg-[#292929] text-[#F5F0E6] hover:bg-[#1A1A1A] font-display font-black text-sm sm:text-base uppercase rounded-2xl shadow-sm hover:shadow-md hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#E05A2B]" />
          <span>REVIEW ANSWERS</span>
        </button>

        <button
          onClick={onTryAgain}
          className="py-4 px-4 bg-[#FAF7F2] text-[#292929] hover:bg-[#F0EBE0] font-display font-black text-sm sm:text-base uppercase rounded-2xl border border-[#E0D8C5] shadow-xs hover:shadow-md hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#292929]" />
          <span>TRY AGAIN</span>
        </button>

        <button
          onClick={onCreateAnother}
          className="py-4 px-4 bg-[#E05A2B] text-white hover:bg-[#CC4F24] font-display font-black text-sm sm:text-base uppercase rounded-2xl shadow-sm hover:shadow-md hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>CREATE ANOTHER</span>
        </button>
      </div>

      {/* Share / Home / Link Row */}
      <div className="pt-6 border-t border-[#292929]/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="px-5 py-3 bg-[#FAF7F2] text-[#292929] font-mono-code font-bold text-xs uppercase tracking-wider rounded-full border border-[#E0D8C5] hover:bg-white shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#E05A2B]" />
          <span>SHARE QUIZ</span>
        </button>

        <button
          onClick={onHome || onCreateAnother}
          className="px-5 py-3 bg-[#FAF7F2] text-[#292929] font-mono-code font-bold text-xs uppercase tracking-wider rounded-full border border-[#E0D8C5] hover:bg-white shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#292929]" />
          <span>HOME</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="px-5 py-3 bg-[#FAF7F2] text-[#292929] font-mono-code font-bold text-xs uppercase tracking-wider rounded-full border border-[#E0D8C5] hover:bg-white shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#1E3A2B]" />
              <span className="text-[#1E3A2B]">LINK COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#292929]" />
              <span>COPY LINK</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Native & Fallback Share Modal */}
      <ShareModal
        quiz={quiz}
        score={score}
        totalQuestions={totalQuestions}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
