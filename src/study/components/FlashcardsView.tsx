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
import { StackedFlashcardDeck } from './StackedFlashcardDeck';

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
  const [conceptsList, setConceptsList] = useState<StudyConcept[]>(studySet.concepts);

  useEffect(() => {
    setConceptsList(studySet.concepts);
    setCurrentIndex(0);
  }, [studySet]);

  const concepts = conceptsList;
  const currentConcept = concepts[currentIndex];
  const totalCards = concepts.length;

  const handleShuffle = () => {
    if (conceptsList.length <= 1) return;
    const all = [...conceptsList];
    const candidateIndices = all.map((_, i) => i).filter(i => i !== currentIndex);
    const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    const chosen = all[chosenIndex];

    const remaining = all.filter((_, i) => i !== chosenIndex);
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    setConceptsList([chosen, ...remaining]);
    setCurrentIndex(0);
  };

  const currentRating = currentConcept ? sessionRatings[currentConcept.id] : undefined;

  // Keyboard rating shortcuts (1–4 when card is flipped)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (isFlipped) {
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

    // Auto advance to next card, looping continuously
    setTimeout(() => {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex(prev => (prev + 1) % totalCards);
    }, 180);

    // Check if entire deck has been reviewed and rated
    const ratedCount = Object.keys(updatedRatings).length;
    if (ratedCount >= totalCards) {
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
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % totalCards);
    scrollToTop();
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
    scrollToTop();
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

  const stackCards = concepts.map((c) => ({
    id: c.id,
    front: c.flashcardQuestion,
    back: c.flashcardAnswer + (c.summary && c.summary !== c.flashcardAnswer ? `\n\nContext: ${c.summary}` : ''),
    hint: c.flashcardHint,
    category: c.category || c.title || studySet.category,
    difficulty: c.difficulty,
  }));

  const ratingSection = (
    <div className="w-full bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-bold uppercase text-stone-800 tracking-wide">
          How well did you know this card?
        </span>
        {currentRating && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase bg-pink-50 text-[#D92B8A] border border-pink-200">
            Rated: {currentRating.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          id="rating-did-not-know-btn"
          onClick={() => handleRate('did_not_know')}
          className="py-2.5 px-2 bg-red-50 hover:bg-red-100/80 text-red-700 font-display text-xs font-bold uppercase rounded-xl border border-red-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Did Not Know</span>
          <span className="font-mono text-[10px] text-red-500 font-medium">[1]</span>
        </button>

        <button
          id="rating-almost-btn"
          onClick={() => handleRate('almost')}
          className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100/80 text-amber-700 font-display text-xs font-bold uppercase rounded-xl border border-amber-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Almost</span>
          <span className="font-mono text-[10px] text-amber-500 font-medium">[2]</span>
        </button>

        <button
          id="rating-knew-it-btn"
          onClick={() => handleRate('knew_it')}
          className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-display text-xs font-bold uppercase rounded-xl border border-emerald-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Knew It</span>
          <span className="font-mono text-[10px] text-emerald-600 font-medium">[3]</span>
        </button>

        <button
          id="rating-easy-btn"
          onClick={() => handleRate('easy')}
          className="py-2.5 px-2 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Easy</span>
          <span className="font-mono text-[10px] text-pink-100 font-medium">[4]</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-800">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full shadow-xs">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="text-[#D92B8A] font-bold">
              {progressPercentage}%
            </span>
          </div>

          <span className="text-xs font-mono text-stone-500 hidden sm:inline">
            Shortcuts: Scroll / ↑ ↓ (Navigate), Space (Flip), 1–4 (Rate)
          </span>
        </div>

        {/* Tactile Progress Bar */}
        <div className="w-full h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D92B8A] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stacked Flashcard Deck Component */}
      <StackedFlashcardDeck
        cards={stackCards}
        currentIndex={currentIndex}
        onIndexChange={(idx) => setCurrentIndex(idx)}
        onShuffle={handleShuffle}
        deckTitle={studySet.title}
        deckCategory={studySet.category}
        ratingComponent={ratingSection}
        isFlipped={isFlipped}
        onFlipChange={(flipped) => setIsFlipped(flipped)}
      />
    </div>
  );
};
