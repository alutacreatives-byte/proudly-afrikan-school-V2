import React, { useState } from 'react';
import { StudySet, StudyConcept } from '../types';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  Sparkles,
  BookOpen,
  RotateCcw,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';

interface PracticeViewProps {
  studySet: StudySet;
  onBack: () => void;
  onGoHome?: () => void;
  onRecordAnswer: (conceptId: string, isCorrect: boolean) => void;
  onCompletePractice: (result: { total: number; reinforced: number; needsReview: number }) => void;
  onNavigateToFlashcards?: (set: StudySet) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  studySet,
  onBack,
  onGoHome,
  onRecordAnswer,
  onCompletePractice,
  onNavigateToFlashcards,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [reinforcedIds, setReinforcedIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const concepts = studySet.concepts;
  const currentConcept = concepts[currentIndex];
  const totalQuestions = concepts.length;

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || !currentConcept) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentConcept.correctOptionIndex;
    onRecordAnswer(currentConcept.id, isCorrect);

    if (isCorrect) {
      setReinforcedIds(prev => new Set(prev).add(currentConcept.id));
    } else {
      setReviewIds(prev => new Set(prev).add(currentConcept.id));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      scrollToTop();
    } else {
      setIsCompleted(true);
      scrollToTop();
      onCompletePractice({
        total: totalQuestions,
        reinforced: reinforcedIds.size + (selectedOption === currentConcept?.correctOptionIndex ? 1 : 0),
        needsReview: reviewIds.size + (selectedOption !== currentConcept?.correctOptionIndex ? 1 : 0),
      });
    }
  };

  if (!currentConcept) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-8 shadow-lg">
        <h2 className="font-display font-black text-2xl uppercase text-stone-900">No practice questions available</h2>
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white rounded-full font-display text-xs font-bold uppercase shadow-sm transition-all"
        >
          Return to Sets
        </button>
      </div>
    );
  }

  const isCorrect = selectedOption === currentConcept.correctOptionIndex;
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // FORMATIVE PRACTICE COMPLETION SUMMARY SCREEN
  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        <div className="bg-white border border-stone-200/90 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 bg-pink-50 border border-pink-200 rounded-full text-[#D92B8A] shadow-sm">
            <Sparkles className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-widest block">
              Formative Practice Complete
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900">
              Concept Reinforcement Summary
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto font-medium leading-relaxed">
              Practicing application strengthens long-term comprehension and mental models.
            </p>
          </div>

          {/* Breakdown of Concepts Reinforced vs Scheduled for Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Concepts Reinforced ({reinforcedIds.size})</span>
              </span>
              <div className="space-y-1.5 pt-1">
                {Array.from(reinforcedIds).map(id => {
                  const c = concepts.find(item => item.id === id);
                  return (
                    <div key={id} className="text-xs text-stone-800 font-medium truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{c?.title || id}</span>
                    </div>
                  );
                })}
                {reinforcedIds.size === 0 && (
                  <p className="text-xs text-stone-500 italic">None in this session.</p>
                )}
              </div>
            </div>

            <div className="p-5 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
              <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Queued for Spaced Review ({reviewIds.size})</span>
              </span>
              <div className="space-y-1.5 pt-1">
                {Array.from(reviewIds).map(id => {
                  const c = concepts.find(item => item.id === id);
                  return (
                    <div key={id} className="text-xs text-stone-800 font-medium truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D92B8A]"></span>
                      <span>{c?.title || id}</span>
                    </div>
                  );
                })}
                {reviewIds.size === 0 && (
                  <p className="text-xs text-emerald-700 italic">All concepts demonstrated strong understanding!</p>
                )}
              </div>
            </div>
          </div>

          {/* Next Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onNavigateToFlashcards && (
              <button
                onClick={() => onNavigateToFlashcards(studySet)}
                className="flex-1 p-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Active Recall Flashcards →</span>
              </button>
            )}

            <button
              onClick={onBack}
              className="flex-1 p-4 bg-stone-900 hover:bg-stone-800 text-white font-display text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>Return to Study Set</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />

          <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-800">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D92B8A] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Practice Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl shadow-xl p-6 sm:p-10 space-y-6">
        {/* Concept Pill & Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-stone-900 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-full">
              Formative Practice
            </span>
            <span className="font-mono text-xs text-stone-600 font-bold uppercase tracking-wider">
              {currentConcept.category || studySet.category || 'Geography'}
            </span>
          </div>

          <span className="font-display font-bold text-xs sm:text-sm uppercase text-[#D92B8A] tracking-wider">
            {studySet.title || currentConcept.title}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2.5 pt-1">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 leading-tight tracking-tight">
            {currentConcept.practiceQuestion || currentConcept.flashcardQuestion}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-stone-600 font-medium">
            Select the option that best reflects the core principle:
          </p>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3 pt-1">
          {currentConcept.practiceOptions.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isThisCorrect = idx === currentConcept.correctOptionIndex;

            let optionStyle = 'bg-stone-50/70 border-stone-200 hover:bg-stone-100/90 hover:border-stone-300 text-stone-900';

            if (isAnswered) {
              if (isThisCorrect) {
                optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/40';
              } else if (isSelected && !isThisCorrect) {
                optionStyle = 'bg-red-50 border-red-400 text-red-950 opacity-90';
              } else {
                optionStyle = 'bg-stone-50/40 border-stone-200 text-stone-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 sm:p-5 text-left border rounded-2xl transition-all flex items-center justify-between gap-4 shadow-sm ${optionStyle} ${
                  !isAnswered ? 'active:scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-stone-200 font-mono font-bold text-sm bg-white text-stone-800 flex-shrink-0 shadow-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-display font-bold text-base sm:text-lg text-stone-900 leading-snug">
                    {option}
                  </span>
                </div>

                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isThisCorrect && (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Educational Explanation */}
        {isAnswered && (
          <div className={`p-6 border rounded-2xl space-y-3 shadow-sm animate-fadeIn ${
            isCorrect ? 'bg-emerald-50/90 border-emerald-200' : 'bg-amber-50/90 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <HelpCircle className="w-5 h-5 text-amber-700" />
              )}
              <span className="font-display font-bold text-sm sm:text-base uppercase tracking-wider text-stone-900">
                {isCorrect ? 'Accurate Understanding!' : 'Learning Insight'}
              </span>
            </div>

            <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-normal whitespace-pre-line">
              {currentConcept.practiceExplanation || currentConcept.explanation}
            </p>

            {currentConcept.whyItMatters && (
              <div className="pt-3 border-t border-stone-200/60 text-sm text-stone-700 space-y-1">
                <span className="font-mono font-bold text-xs uppercase text-[#D92B8A] block">Why It Matters:</span>
                <p className="leading-relaxed">{currentConcept.whyItMatters}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Button to Next Question */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <span>{currentIndex === totalQuestions - 1 ? 'Finish Practice' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
