import React, { useState, useEffect } from 'react';
import { StudySet, StudyConcept, FlashcardRating } from '../types';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lightbulb, 
  Check, 
  RotateCcw,
  ArrowLeft,
  Volume2
} from 'lucide-react';

interface FlashcardsViewProps {
  studySet: StudySet;
  onBack: () => void;
  onGoHome?: () => void;
  onRecordRating: (conceptId: string, rating: FlashcardRating) => void;
  onCompleteSession: (result: { total: number; confident: number; struggled: number }) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  studySet,
  onBack,
  onGoHome,
  onRecordRating,
  onCompleteSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionRatings, setSessionRatings] = useState<Record<string, FlashcardRating>>({});

  const concepts = studySet.concepts;
  const currentConcept = concepts[currentIndex];
  const totalCards = concepts.length;

  const currentRating = currentConcept ? sessionRatings[currentConcept.id] : undefined;

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyP') {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('did_not_know');
        if (e.key === '2') handleRate('almost');
        if (e.key === '3') handleRate('knew_it');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, currentConcept]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: FlashcardRating) => {
    if (!currentConcept) return;

    onRecordRating(currentConcept.id, rating);
    const updatedRatings = { ...sessionRatings, [currentConcept.id]: rating };
    setSessionRatings(updatedRatings);

    // Auto advance if not last card
    if (currentIndex < totalCards - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setShowHint(false);
        setCurrentIndex(prev => prev + 1);
      }, 180);
    } else {
      const confident = Object.values(updatedRatings).filter(
        r => r === 'knew_it' || r === 'easy'
      ).length;
      const struggled = Object.values(updatedRatings).filter(
        r => r === 'did_not_know' || r === 'almost'
      ).length;

      onCompleteSession({
        total: totalCards,
        confident,
        struggled,
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex(prev => prev + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex(prev => prev - 1);
      scrollToTop();
    }
  };

  if (!currentConcept) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-8 shadow-lg">
        <h2 className="font-display font-black text-2xl uppercase text-stone-900">No flashcards found</h2>
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white rounded-full font-display text-xs font-bold uppercase shadow-sm transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />

          <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-800">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-[#D92B8A] font-bold">
              {progressPercentage}%
            </span>
          </div>
        </div>

        {/* Tactile Progress Bar */}
        <div className="w-full h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D92B8A] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Set Title Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-stone-500">
            {studySet.category}
          </span>
          <h2 className="font-display font-black text-lg sm:text-xl text-stone-900">
            {studySet.title}
          </h2>
        </div>

        <button
          onClick={handleFlip}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
          <span>Flip [Space]</span>
        </button>
      </div>

      {/* The 3D Flashcard Container */}
      <div
        id="interactive-flashcard"
        onClick={handleFlip}
        className={`bg-white border border-stone-200/90 rounded-3xl shadow-xl min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 flex flex-col justify-between cursor-pointer transition-all select-none relative ${
          isFlipped 
            ? 'ring-2 ring-[#D92B8A]/40' 
            : 'hover:border-stone-300'
        }`}
      >
        {/* Card Top Pill & Mode Tag */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border ${
                isFlipped 
                  ? 'bg-[#D92B8A] text-white border-[#D92B8A]' 
                  : 'bg-stone-900 text-white border-stone-900'
              }`}>
                {isFlipped ? 'Answer / Summary' : 'Question'}
              </span>

              <span className="text-xs font-mono font-bold uppercase text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                {currentConcept.difficulty}
              </span>
            </div>

            {currentRating && (
              <span className="px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-mono font-bold uppercase text-[#D92B8A]">
                Rated: {currentRating.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-stone-500 mb-3">
            {currentConcept.title}
          </h3>

          {/* Card Content: Question or Answer */}
          {!isFlipped ? (
            <div className="space-y-4 pt-2 sm:pt-4">
              <p className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-tight">
                {currentConcept.flashcardQuestion}
              </p>

              {currentConcept.flashcardHint && (
                <div className="pt-2">
                  {!showHint ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-500 hover:text-[#D92B8A] underline transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Show Hint</span>
                    </button>
                  ) : (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium text-stone-800 shadow-sm animate-fadeIn leading-relaxed"
                    >
                      <span className="font-mono font-bold text-[#D92B8A] mr-1.5">HINT:</span>
                      {currentConcept.flashcardHint}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2 sm:pt-4 animate-fadeIn">
              <p className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-stone-900 leading-snug">
                {currentConcept.flashcardAnswer}
              </p>

              {currentConcept.summary && currentConcept.summary !== currentConcept.flashcardAnswer && (
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl mt-4 shadow-sm">
                  <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase block mb-1">
                    Key Context
                  </span>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
                    {currentConcept.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Prompts / Reveal Action */}
        <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
          {!isFlipped ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs sm:text-sm font-mono text-stone-500 font-semibold">
                Click or press Space to reveal
              </span>
              <button
                id="flashcard-reveal-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95"
              >
                Reveal Answer
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="text-center font-display text-xs sm:text-sm font-bold uppercase text-stone-800 tracking-wide">
                How well did you know this?
              </div>

              {/* 4 Active Recall Rating Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  id="rating-did-not-know-btn"
                  onClick={() => handleRate('did_not_know')}
                  className="py-3 px-2 bg-red-50/70 hover:bg-red-100/80 text-red-700 font-display text-xs font-bold uppercase rounded-2xl border border-red-200 shadow-sm flex flex-col items-center justify-center gap-0.5 transition-all"
                >
                  <span>Did Not Know</span>
                  <span className="font-mono text-xs text-red-500 font-medium">[1]</span>
                </button>

                <button
                  id="rating-almost-btn"
                  onClick={() => handleRate('almost')}
                  className="py-3 px-2 bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 font-display text-xs font-bold uppercase rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center justify-center gap-0.5 transition-all"
                >
                  <span>Almost</span>
                  <span className="font-mono text-xs text-amber-500 font-medium">[2]</span>
                </button>

                <button
                  id="rating-knew-it-btn"
                  onClick={() => handleRate('knew_it')}
                  className="py-3 px-2 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 font-display text-xs font-bold uppercase rounded-2xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center gap-0.5 transition-all"
                >
                  <span>Knew It</span>
                  <span className="font-mono text-xs text-emerald-600 font-medium">[3]</span>
                </button>

                <button
                  id="rating-easy-btn"
                  onClick={() => handleRate('easy')}
                  className="py-3 px-2 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase rounded-2xl shadow-sm flex flex-col items-center justify-center gap-0.5 transition-all"
                >
                  <span>Easy</span>
                  <span className="font-mono text-xs text-pink-100 font-medium">[4]</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls (Prev / Next) */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="flashcard-prev-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 bg-white disabled:opacity-40 disabled:pointer-events-none text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 shadow-sm inline-flex items-center gap-1.5 hover:bg-stone-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-mono text-stone-600 hidden sm:inline font-medium">
          Shortcuts: Space (Flip), 1–4 (Rate), ← → (Navigate)
        </span>

        <button
          id="flashcard-next-btn"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="px-5 py-2.5 bg-white disabled:opacity-40 disabled:pointer-events-none text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 shadow-sm inline-flex items-center gap-1.5 hover:bg-stone-50 transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
