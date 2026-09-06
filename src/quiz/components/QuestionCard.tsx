import React, { useEffect } from 'react';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelected: (answer: string, isCorrect: boolean) => void;
  onNextQuestion: () => void;
  selectedAnswer: string | null;
  hasAnswered: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelected,
  onNextQuestion,
  selectedAnswer,
  hasAnswered,
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasAnswered) {
        if (question.type === 'true_false') {
          if (e.key === '1' || e.key.toLowerCase() === 't') {
            onAnswerSelected('True', 'True' === question.correctAnswer);
          } else if (e.key === '2' || e.key.toLowerCase() === 'f') {
            onAnswerSelected('False', 'False' === question.correctAnswer);
          }
        } else {
          const index = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
          if (index !== -1 && index < question.options.length) {
            const opt = question.options[index];
            onAnswerSelected(opt, opt === question.correctAnswer);
          }
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          onNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, question, onAnswerSelected, onNextQuestion]);

  const formattedNum = String(questionNumber).padStart(2, '0');
  const formattedTotal = String(totalQuestions).padStart(2, '0');

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#E6E0D5] shadow-[0_15px_40px_-10px_rgba(41,41,41,0.08)] p-6 sm:p-10 md:p-12 transition-all w-full box-border">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-[#292929]/10 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292929]">
            {formattedNum}
            <span className="text-[#A39E93] text-lg sm:text-2xl font-bold"> / {formattedTotal}</span>
          </span>
          <span className="text-[11px] font-mono-code font-bold uppercase px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E0D8C5] text-[#5E5950] hidden sm:inline-block">
            {question.type === 'true_false' ? 'TRUE / FALSE' : 'MULTIPLE CHOICE'}
          </span>
        </div>

        <div className="font-mono-code text-[11px] sm:text-xs text-[#5E5950] font-bold flex items-center gap-2">
          <span>{hasAnswered ? 'ANSWER RECORDED' : 'SELECT ONE CHOICE'}</span>
        </div>
      </div>

      {/* Large Question Text */}
      <div className="mb-8">
        <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#292929] leading-snug tracking-tight break-words">
          {question.question}
        </h2>
      </div>

      {/* Large Interactive Choice Blocks */}
      <div className="space-y-3.5 mb-8">
        {question.options.map((option, idx) => {
          const letter = letters[idx] || `${idx + 1}`;
          const isUserChoice = selectedAnswer === option;
          const isCorrectChoice = option === question.correctAnswer;

          let choiceStyle = 'bg-[#FAF7F2] border-[#E0D8C5] text-[#292929] hover:bg-white hover:border-[#292929]/40 hover:shadow-sm';

          if (hasAnswered) {
            if (isCorrectChoice) {
              choiceStyle = 'bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-sm';
            } else if (isUserChoice && !isCorrectChoice) {
              choiceStyle = 'bg-[#E05A2B] text-white border-[#E05A2B] shadow-sm';
            } else {
              choiceStyle = 'bg-[#FAF7F2]/60 border-[#E0D8C5]/50 text-[#736E65] opacity-50';
            }
          }

          return (
            <button
              key={option + idx}
              onClick={() => {
                if (!hasAnswered) {
                  onAnswerSelected(option, option === question.correctAnswer);
                }
              }}
              disabled={hasAnswered}
              className={`w-full p-4 sm:p-5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${choiceStyle}`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 pr-2">
                {/* Choice Letter Stamp */}
                <span
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-display font-black text-sm sm:text-base shrink-0 ${
                    hasAnswered && isCorrectChoice
                      ? 'bg-white text-[#1E3A2B]'
                      : hasAnswered && isUserChoice && !isCorrectChoice
                      ? 'bg-white text-[#E05A2B]'
                      : 'bg-[#292929] text-[#F5F0E6]'
                  }`}
                >
                  {letter}
                </span>

                {/* Option Text */}
                <span className="font-display font-bold text-sm sm:text-lg md:text-xl leading-snug break-words">
                  {option}
                </span>
              </div>

              {/* Status Indicator Icon when answered */}
              {hasAnswered && (
                <div className="shrink-0 pl-2">
                  {isCorrectChoice && (
                    <div className="w-8 h-8 rounded-full bg-white text-[#1E3A2B] flex items-center justify-center font-bold shadow-xs">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                    </div>
                  )}
                  {isUserChoice && !isCorrectChoice && (
                    <div className="w-8 h-8 rounded-full bg-white text-[#E05A2B] flex items-center justify-center font-bold shadow-xs">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next Question Section */}
      {hasAnswered && (
        <div className="pt-6 border-t border-[#292929]/10 space-y-6">
          {/* Explanation Box */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border ${
              selectedAnswer === question.correctAnswer
                ? 'bg-[#EBF7EE] border-[#1E3A2B]/20 text-[#1E3A2B]'
                : 'bg-[#FFF3E6] border-[#E05A2B]/20 text-[#292929]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  selectedAnswer === question.correctAnswer ? 'text-[#1E3A2B]' : 'text-[#E05A2B]'
                }`}
              />
              <span className="font-mono-code font-bold text-xs sm:text-sm uppercase tracking-wider">
                {selectedAnswer === question.correctAnswer
                  ? 'CORRECT'
                  : 'NOT QUITE'}
              </span>
            </div>
            <p className="text-sm sm:text-base md:text-lg font-normal leading-relaxed text-[#292929]">
              {question.explanation}
            </p>
          </div>

          {/* Next Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono-code text-xs text-[#5E5950] hidden sm:inline">
              Press [Enter] or tap button to advance
            </span>

            <button
              onClick={onNextQuestion}
              className="w-full sm:w-auto px-8 py-4 bg-[#E05A2B] hover:bg-[#CC4F24] text-white font-display font-black text-base sm:text-lg uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-3 cursor-pointer sm:ml-auto"
            >
              <span>{questionNumber === totalQuestions ? 'SEE RESULTS' : 'NEXT QUESTION'}</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
