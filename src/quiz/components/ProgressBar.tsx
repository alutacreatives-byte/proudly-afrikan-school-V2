import React from 'react';

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  quizTitle: string;
  topicOrSource: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  score,
  quizTitle,
  topicOrSource,
}) => {
  const percentage = Math.round(((currentIndex) / totalQuestions) * 100);

  return (
    <div className="bg-white rounded-[2rem] border border-[#E6E0D5] shadow-[0_10px_30px_-10px_rgba(41,41,41,0.05)] p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="truncate">
          <span className="font-mono-code text-[11px] font-bold uppercase tracking-widest text-[#E05A2B] block mb-1">
            ACTIVE ASSESSMENT
          </span>
          <h3 className="font-display font-black text-lg sm:text-2xl text-[#292929] uppercase truncate">
            {quizTitle}
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono-code text-xs font-bold text-[#292929] shrink-0">
          <div className="bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#E0D8C5]">
            <span>QUESTION: </span>
            <span className="text-[#E05A2B]">{currentIndex + 1}</span>
            <span> / {totalQuestions}</span>
          </div>

          <div className="bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#E0D8C5]">
            <span>SCORE: </span>
            <span className="text-[#292929]">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3 bg-[#FAF7F2] rounded-full border border-[#E0D8C5] overflow-hidden relative">
        <div
          className="h-full bg-[#E05A2B] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
