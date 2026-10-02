import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCw, 
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Shuffle, 
  Layers,
  Lightbulb,
  MousePointer,
  HelpCircle
} from 'lucide-react';

export interface StackedFlashcardItem {
  id?: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  difficulty?: string;
  subtitle?: string;
}

export interface StackedFlashcardDeckProps {
  cards: StackedFlashcardItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onShuffle?: () => void;
  deckTitle?: string;
  deckCategory?: string;
  ratingComponent?: React.ReactNode;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

// 8 Curated Premium Pastel Themes with high contrast & tactile depth
export const PASTEL_THEMES = [
  {
    name: 'Warm Cream & Honey',
    gradient: 'from-[#FFFDF7] via-[#FFF9EE] to-[#FBF3E0]',
    border: 'border-[#EADCC2]',
    badgeBg: 'bg-[#F4E8D1]',
    badgeText: 'text-[#875F19]',
    shadowColor: 'rgba(215, 194, 155, 0.45)',
    accent: '#B4823A',
  },
  {
    name: 'Soft Sage & Mint',
    gradient: 'from-[#F3FDF6] via-[#E5FBF0] to-[#CDF6DE]',
    border: 'border-[#ABEBCE]',
    badgeBg: 'bg-[#C2F0DA]',
    badgeText: 'text-[#168044]',
    shadowColor: 'rgba(159, 227, 185, 0.45)',
    accent: '#2E9E5B',
  },
  {
    name: 'Peach & Apricot',
    gradient: 'from-[#FFF7F4] via-[#FFEFE8] to-[#FDDFD1]',
    border: 'border-[#F8C6B4]',
    badgeBg: 'bg-[#FBD4C5]',
    badgeText: 'text-[#AC3F1F]',
    shadowColor: 'rgba(235, 178, 158, 0.45)',
    accent: '#D95D39',
  },
  {
    name: 'Light Lavender & Iris',
    gradient: 'from-[#F9F6FF] via-[#EFE9FE] to-[#E3D9FD]',
    border: 'border-[#CCBDF8]',
    badgeBg: 'bg-[#DBD0FA]',
    badgeText: 'text-[#5839A3]',
    shadowColor: 'rgba(195, 178, 243, 0.45)',
    accent: '#7C5AC2',
  },
  {
    name: 'Soft Sky Blue',
    gradient: 'from-[#F4F9FE] via-[#E6F3FE] to-[#CEE9FD]',
    border: 'border-[#ACD8F9]',
    badgeBg: 'bg-[#C4E2FB]',
    badgeText: 'text-[#166BA5]',
    shadowColor: 'rgba(160, 207, 243, 0.45)',
    accent: '#2A85C8',
  },
  {
    name: 'Pale Primrose & Butter',
    gradient: 'from-[#FFFFEC] via-[#FFFCD8] to-[#FAF4B2]',
    border: 'border-[#EFE284]',
    badgeBg: 'bg-[#F8EEA2]',
    badgeText: 'text-[#886B06]',
    shadowColor: 'rgba(224, 209, 107, 0.45)',
    accent: '#C49B18',
  },
  {
    name: 'Soft Coral & Rose',
    gradient: 'from-[#FFF4F1] via-[#FFE7E0] to-[#FDCEC5]',
    border: 'border-[#F9B9AB]',
    badgeBg: 'bg-[#FDCBC1]',
    badgeText: 'text-[#B43825]',
    shadowColor: 'rgba(238, 166, 150, 0.45)',
    accent: '#E05A47',
  },
  {
    name: 'Soft Amber & Sand',
    gradient: 'from-[#FFF8EE] via-[#FFEE DB] to-[#FEDEBD]',
    border: 'border-[#F8C793]',
    badgeBg: 'bg-[#FDD1A3]',
    badgeText: 'text-[#B05807]',
    shadowColor: 'rgba(238, 184, 128, 0.45)',
    accent: '#D97724',
  },
];

export const StackedFlashcardDeck: React.FC<StackedFlashcardDeckProps> = ({
  cards,
  currentIndex,
  onIndexChange,
  onShuffle,
  deckTitle,
  deckCategory,
  ratingComponent,
  isFlipped: controlledFlipped,
  onFlipChange,
}) => {
  // Controlled vs Uncontrolled Flip State
  const [internalFlipped, setInternalFlipped] = useState<boolean>(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animDirection, setAnimDirection] = useState<'next' | 'prev' | 'shuffle' | null>(null);

  // Incoming card state for smooth Previous transition
  const [incomingPrevCard, setIncomingPrevCard] = useState<{
    card: StackedFlashcardItem;
    index: number;
    theme: typeof PASTEL_THEMES[0];
  } | null>(null);

  // Touch and drag gesture state
  const [dragY, setDragY] = useState<number>(0);
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentDragYRef = useRef<number>(0);
  const currentDragXRef = useRef<number>(0);
  const hasMovedSignificantly = useRef<boolean>(false);

  // Wheel scroll throttling ref
  const wheelLockRef = useRef<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);
  const arenaRef = useRef<HTMLDivElement>(null);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || cards[0];

  const onFlipChangeRef = useRef(onFlipChange);
  useEffect(() => {
    onFlipChangeRef.current = onFlipChange;
  }, [onFlipChange]);

  const updateFlip = useCallback((flipped: boolean) => {
    setInternalFlipped(flipped);
    onFlipChangeRef.current?.(flipped);
  }, []);

  // Always reset internal flip and hint when card index changes
  useEffect(() => {
    setInternalFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    if (isDragging || hasMovedSignificantly.current) return;
    updateFlip(!isFlipped);
  }, [isDragging, isFlipped, updateFlip]);

  // Smooth Next Navigation (Front card smoothly moves away upwards to reveal the next card)
  const handleNext = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    setIsAnimating(true);
    setAnimDirection('next');
    updateFlip(false);
    setShowHint(false);

    setTimeout(() => {
      // Loop continuously: wraps around to first card
      onIndexChange((currentIndex + 1) % totalCards);
      setIsAnimating(false);
      setAnimDirection(null);
      setDragY(0);
      setDragX(0);
    }, 320);
  }, [currentIndex, isAnimating, onIndexChange, totalCards, updateFlip]);

  // Smooth Previous Navigation (Previous card smoothly glides down into view from above)
  const handlePrev = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    // Loop continuously: wraps around to last card
    const prevIdx = (currentIndex - 1 + totalCards) % totalCards;
    const prevCard = cards[prevIdx];
    const prevTheme = PASTEL_THEMES[prevIdx % PASTEL_THEMES.length];

    setIncomingPrevCard({
      card: prevCard,
      index: prevIdx,
      theme: prevTheme,
    });

    setIsAnimating(true);
    setAnimDirection('prev');
    updateFlip(false);
    setShowHint(false);

    setTimeout(() => {
      onIndexChange(prevIdx);
      setIsAnimating(false);
      setAnimDirection(null);
      setIncomingPrevCard(null);
      setDragY(0);
      setDragX(0);
    }, 320);
  }, [currentIndex, isAnimating, onIndexChange, totalCards, cards, updateFlip]);

  // Shuffle: Jumps smoothly to another random card, keeping headline & description together
  const handleShuffleClick = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    updateFlip(false);
    setShowHint(false);
    setIsAnimating(true);
    setAnimDirection('shuffle');

    if (onShuffle) {
      onShuffle();
    } else {
      const candidateIndices = cards.map((_, i) => i).filter(i => i !== currentIndex);
      const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
      onIndexChange(chosenIndex);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setAnimDirection(null);
      setDragY(0);
      setDragX(0);
    }, 320);
  }, [isAnimating, onShuffle, totalCards, cards, currentIndex, onIndexChange, updateFlip]);

  // Wheel Scroll Navigation (Support scroll up/down on the card stack)
  useEffect(() => {
    const arenaEl = arenaRef.current;
    if (!arenaEl) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default page scroll while user scrolls the flashcard deck
      e.preventDefault();

      const now = Date.now();
      // Throttle wheel triggers: at least 380ms between card advances
      if (wheelLockRef.current || now - lastWheelTimeRef.current < 380 || isAnimating) {
        return;
      }

      if (Math.abs(e.deltaY) > 20) {
        wheelLockRef.current = true;
        lastWheelTimeRef.current = now;

        if (e.deltaY > 0) {
          // Scroll DOWN -> Front card moves away, revealing next card
          handleNext();
        } else {
          // Scroll UP -> Previous card smoothly returns
          handlePrev();
        }

        setTimeout(() => {
          wheelLockRef.current = false;
        }, 400);
      }
    };

    arenaEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      arenaEl.removeEventListener('wheel', handleWheel);
    };
  }, [handleNext, handlePrev, isAnimating]);

  // Keyboard Navigation: ↑ / ↓, ← / →, Space to flip, S to shuffle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.code === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'KeyJ' || e.code === 'KeyN') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'KeyK' || e.code === 'KeyP') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleShuffleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleShuffleClick]);

  // Touch Swipe Handlers (Vertical & Horizontal support)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    hasMovedSignificantly.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current || isAnimating) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    if (Math.abs(deltaY) > 8 || Math.abs(deltaX) > 8) {
      hasMovedSignificantly.current = true;
    }

    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      currentDragYRef.current = deltaY * 0.7;
      currentDragXRef.current = 0;
      setDragY(deltaY * 0.7);
      setDragX(0);
    } else {
      currentDragXRef.current = deltaX * 0.7;
      currentDragYRef.current = 0;
      setDragX(deltaX * 0.7);
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!dragStartRef.current) return;
    const threshold = 48;
    const finalY = currentDragYRef.current;
    const finalX = currentDragXRef.current;

    currentDragYRef.current = 0;
    currentDragXRef.current = 0;
    setDragY(0);
    setDragX(0);
    setIsDragging(false);
    dragStartRef.current = null;

    if (finalY < -threshold || finalX < -threshold) {
      // Swiped Up or Left -> Next Card
      handleNext();
    } else if (finalY > threshold || finalX > threshold) {
      // Swiped Down or Right -> Prev Card
      handlePrev();
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasMovedSignificantly.current = false;
    currentDragYRef.current = 0;
    currentDragXRef.current = 0;
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      const deltaX = moveEvent.clientX - dragStartRef.current.x;

      if (Math.abs(deltaY) > 8 || Math.abs(deltaX) > 8) {
        hasMovedSignificantly.current = true;
      }

      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        currentDragYRef.current = deltaY * 0.65;
        currentDragXRef.current = 0;
        setDragY(deltaY * 0.65);
        setDragX(0);
      } else {
        currentDragXRef.current = deltaX * 0.65;
        currentDragYRef.current = 0;
        setDragX(deltaX * 0.65);
        setDragY(0);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const threshold = 55;
      const finalY = currentDragYRef.current;
      const finalX = currentDragXRef.current;

      currentDragYRef.current = 0;
      currentDragXRef.current = 0;
      setDragY(0);
      setDragX(0);
      setIsDragging(false);
      dragStartRef.current = null;

      if (finalY < -threshold || finalX < -threshold) {
        handleNext();
      } else if (finalY > threshold || finalX > threshold) {
        handlePrev();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full mx-auto min-h-[440px] rounded-3xl bg-amber-50/50 border border-amber-200 p-8 flex flex-col items-center justify-center text-center">
        <Layers className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="font-display font-black text-xl text-stone-900 uppercase">No Flashcards In Deck</h3>
        <p className="text-sm text-stone-600 mt-1">Generate or add cards to start your active recall stack session.</p>
      </div>
    );
  }

  // Active front theme
  const activeTheme = PASTEL_THEMES[currentIndex % PASTEL_THEMES.length];

  // Up to 3 background cards visibly stacked behind the front card
  const maxStackVisible = Math.min(totalCards - 1, 3);
  const backgroundStack = Array.from({ length: maxStackVisible }, (_, i) => {
    const pos = i + 1;
    const cardIdx = (currentIndex + pos) % totalCards;
    const card = cards[cardIdx];
    const theme = PASTEL_THEMES[cardIdx % PASTEL_THEMES.length];
    return { pos, cardIdx, card, theme };
  });

  return (
    <div className="w-full flex flex-col items-center select-none py-2 sm:py-4">
      {/* =================================================================== */}
      {/* STACKED FLASHCARD ARENA (CodePen Reference: Overlapping Physical Stack) */}
      {/* Scroll Up/Down & Keyboard ↑/↓ Nav, Smooth Fly-Away Animation, Continuous Loop */}
      {/* =================================================================== */}
      <div 
        ref={arenaRef}
        id="stacked-flashcard-arena"
        className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] flex items-start justify-center pt-4 sm:pt-6 px-2 sm:px-0"
        style={{ perspective: '1400px' }}
      >
        {/* 1. RENDER VISIBLE STACKED CARDS BEHIND (From back to front: Pos 3 -> 2 -> 1) */}
        {backgroundStack.slice().reverse().map(({ pos, cardIdx, card, theme }) => {
          const baseScales = [1, 0.95, 0.90, 0.85];
          const baseOffsets = [0, -22, -44, -64];
          const baseOpacities = [1, 0.96, 0.88, 0.72];
          const zIndices = [30, 20, 10, 5];

          let scale = baseScales[pos];
          let offsetY = baseOffsets[pos];
          let opacity = baseOpacities[pos];
          let rotateZ = 0;

          if (isAnimating) {
            if (animDirection === 'next') {
              scale = baseScales[pos - 1] ?? 1;
              offsetY = baseOffsets[pos - 1] ?? 0;
              opacity = baseOpacities[pos - 1] ?? 1;
            } else if (animDirection === 'prev') {
              scale = baseScales[Math.min(pos + 1, 3)];
              offsetY = baseOffsets[Math.min(pos + 1, 3)];
              opacity = baseOpacities[Math.min(pos + 1, 3)];
            } else if (animDirection === 'shuffle') {
              rotateZ = pos === 1 ? 3 : pos === 2 ? -3 : 2;
              offsetY = baseOffsets[pos] + (pos === 1 ? -6 : pos === 2 ? 6 : -3);
            }
          }

          return (
            <div
              key={`bg-card-${pos}-${cardIdx}`}
              className={`absolute inset-x-2 sm:inset-x-0 top-4 sm:top-6 h-[420px] sm:h-[480px] md:h-[550px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} p-5 sm:p-6 flex flex-col justify-between overflow-hidden pointer-events-none select-none`}
              style={{
                zIndex: zIndices[pos],
                transform: `translate3d(0, ${offsetY}px, 0) scale(${scale}) rotate(${rotateZ}deg)`,
                transformOrigin: 'top center',
                opacity,
                boxShadow: `0 20px 40px -10px rgba(28, 25, 23, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04), 0 8px 20px -4px ${theme.shadowColor}`,
                transition: isAnimating 
                  ? 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.30s ease' 
                  : 'transform 0.24s ease, opacity 0.24s ease',
              }}
            >
              {/* Exposed Top Strip of Stacked Card: Shows Card Number & Concept Preview */}
              <div className="flex items-center justify-between opacity-95 px-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.border}`}>
                    #{cardIdx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-stone-700 truncate max-w-[200px] sm:max-w-[340px]">
                    {card.front}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest hidden sm:inline">
                  Stacked
                </span>
              </div>
            </div>
          );
        })}

        {/* 2. INCOMING CARD FOR SMOOTH PREVIOUS SLIDE-IN (Drops down from above) */}
        {incomingPrevCard && isAnimating && animDirection === 'prev' && (
          <div
            className={`absolute inset-x-2 sm:inset-x-0 top-4 sm:top-6 h-[420px] sm:h-[480px] md:h-[550px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${incomingPrevCard.theme.gradient} border-2 ${incomingPrevCard.theme.border} p-6 sm:p-10 flex flex-col justify-between select-none pointer-events-none text-center`}
            style={{
              zIndex: 50,
              boxShadow: `0 26px 52px -12px rgba(28, 25, 23, 0.18), 0 12px 28px -6px ${incomingPrevCard.theme.shadowColor}`,
              animation: 'incomingCardSlideDown 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
          >
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[12px] font-mono font-bold uppercase tracking-wider ${incomingPrevCard.theme.badgeBg} ${incomingPrevCard.theme.badgeText} border ${incomingPrevCard.theme.border}`}>
                {incomingPrevCard.card.category || deckCategory || 'CONCEPT'}
              </span>
              <span className="text-[12px] font-mono font-bold text-stone-500">
                Card {incomingPrevCard.index + 1} of {totalCards}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto">
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1C1917] leading-snug tracking-tight max-w-xl text-center">
                {incomingPrevCard.card.front}
              </h2>
            </div>
          </div>
        )}

        {/* 3. ACTIVE FRONT CARD (INTERACTIVE, 3D FLIPPABLE, SCROLL-DRAGGABLE) */}
        {(() => {
          let transform = 'translate3d(0, 0, 0) scale(1)';
          let opacity = 1;

          if (isAnimating) {
            if (animDirection === 'next') {
              transform = 'translate3d(0, -118%, 0) scale(0.96) rotate(-2deg)';
              opacity = 0;
            } else if (animDirection === 'prev') {
              transform = 'translate3d(0, -22px, 0) scale(0.95)';
              opacity = 0.95;
            } else if (animDirection === 'shuffle') {
              transform = 'translate3d(-18px, 0, 0) rotate(-4deg) scale(0.98)';
              opacity = 0.95;
            }
          } else if (isDragging) {
            const rot = (dragX / 30).toFixed(2);
            transform = `translate3d(${dragX}px, ${dragY}px, 0) rotate(${rot}deg) scale(1)`;
          }

          return (
            <div
              id="active-flashcard-deck-card"
              className="absolute inset-x-2 sm:inset-x-0 top-4 sm:top-6 h-[420px] sm:h-[480px] md:h-[550px] cursor-pointer"
              style={{
                zIndex: 40,
                transform,
                opacity,
                transition: isDragging 
                  ? 'none' 
                  : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.30s ease',
                willChange: 'transform, opacity',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            >
              {/* 3D Flip Container */}
              <div
                className="w-full h-full relative"
                style={{
                  perspective: '1400px',
                  transformStyle: 'preserve-3d',
                }}
                onClick={handleFlip}
              >
                {/* 3D Flipping Card Body */}
                <div
                  className="w-full h-full relative rounded-[2rem] sm:rounded-[2.5rem] transition-transform duration-500 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* ======================================================= */}
                  {/* FRONT FACE: HEADLINE / QUESTION / CONCEPT               */}
                  {/* ======================================================= */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${activeTheme.gradient} border-2 ${activeTheme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden select-none text-center`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      boxShadow: `0 26px 52px -12px rgba(28, 25, 23, 0.16), 0 10px 24px -6px ${activeTheme.shadowColor}, 0 0 0 1px rgba(0, 0, 0, 0.04)`,
                    }}
                  >
                    {/* Top Row: Category, Card Counter & Flip Cue */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-mono font-bold uppercase tracking-wider ${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.border}`}
                        >
                          {currentCard.category || deckCategory || 'CONCEPT'}
                        </span>
                        {currentCard.difficulty && (
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900/5 text-stone-700">
                            {currentCard.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono font-bold text-stone-500">
                          #{currentIndex + 1} / {totalCards}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold border border-stone-200 shadow-xs transition-colors">
                          <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
                          <span className="text-[12px] uppercase tracking-wider hidden sm:inline">Flip</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Main Headline / Question / Term */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto">
                      <span className="text-[12px] font-mono font-bold uppercase tracking-widest text-stone-500 mb-2.5 block text-center">
                        HEADLINE / QUESTION
                      </span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1C1917] leading-snug tracking-tight max-w-xl text-center">
                        {currentCard.front}
                      </h2>
                      {currentCard.subtitle && (
                        <p className="mt-2 text-sm text-stone-600 font-medium max-w-md text-center">
                          {currentCard.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Hint & Click to Flip indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                      {currentCard.hint ? (
                        <div className="flex-1 text-left">
                          {!showHint ? (
                            <button
                              type="button"
                              id={`show-hint-btn-${currentIndex}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHint(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold transition-all shadow-xs border border-stone-200 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Show Hint</span>
                            </button>
                          ) : (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-white/95 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 shadow-sm max-w-md"
                            >
                              <span className="font-mono font-bold text-amber-600 mr-1.5">💡 HINT:</span>
                              {currentCard.hint}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] font-mono text-stone-500">
                          Active Recall Flashcard
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-mono">
                        <RotateCw className="w-3 h-3 text-stone-400" />
                        <span className="text-[12px]">Click or tap to flip</span>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* BACK FACE: DESCRIPTION / ANSWER                         */}
                  {/* Headline & Description Always Kept Together on Same Card */}
                  {/* ======================================================= */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${activeTheme.gradient} border-2 ${activeTheme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden select-none text-center`}
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      boxShadow: `0 26px 52px -12px rgba(28, 25, 23, 0.16), 0 10px 24px -6px ${activeTheme.shadowColor}, 0 0 0 1px rgba(0, 0, 0, 0.04)`,
                    }}
                  >
                    {/* Top Row: Answer Badge & Flip Back cue */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[12px] font-mono font-bold uppercase tracking-wider bg-stone-900 text-stone-100">
                        ANSWER / DESCRIPTION
                      </span>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold border border-stone-200 shadow-xs transition-colors">
                        <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span className="text-[12px] uppercase tracking-wider hidden sm:inline">Flip Back</span>
                      </div>
                    </div>



                    {/* Center: Full Description / Answer with Large Readable Typography */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto overflow-y-auto max-h-[260px] sm:max-h-[320px] custom-scrollbar">
                      <p className="text-[#1C1917] text-[19px] sm:text-[21px] md:text-[23px] font-medium leading-relaxed max-w-xl text-center [text-wrap:balance]">
                        {currentCard.back}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                      <span className="text-[12px] font-mono text-stone-500">
                        Card {currentIndex + 1} of {totalCards}
                      </span>

                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-mono">
                        <RotateCw className="w-3 h-3 text-stone-400" />
                        <span className="text-[12px]">Click or tap to flip back</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* =================================================================== */}
      {/* INTERACTIVE NAVIGATION CONTROLS (SCROLL / KEYBOARD / BUTTONS)      */}
      {/* =================================================================== */}
      <div className="w-full max-w-full flex flex-nowrap items-center justify-between gap-1.5 sm:gap-4 mt-4 px-0.5 sm:px-2">
        <button
          type="button"
          id="prev-flashcard-stack-btn"
          onClick={handlePrev}
          disabled={isAnimating || totalCards <= 1}
          className="px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 active:scale-95 font-display font-black text-[10px] sm:text-xs uppercase text-stone-800 flex items-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40 shrink-0"
          title="Previous Card (Scroll Up / ↑ Key)"
        >
          <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-700" />
          <span>Previous</span>
          <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 hidden md:inline">[↑]</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            id="shuffle-flashcard-deck-btn"
            onClick={handleShuffleClick}
            disabled={isAnimating || totalCards <= 1}
            className="px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-50 hover:bg-amber-100/90 active:scale-95 border border-amber-200 text-amber-900 font-display font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40 shrink-0"
            title="Shuffle to another complete flashcard"
          >
            <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            id="flip-flashcard-deck-bottom-btn"
            onClick={handleFlip}
            className="px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-stone-50 active:scale-95 border border-stone-200 text-stone-800 font-display font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            title="Flip Card to reveal answer"
          >
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D92B8A]" />
            <span>Flip</span>
          </button>
        </div>

        <button
          type="button"
          id="next-flashcard-stack-btn"
          onClick={handleNext}
          disabled={isAnimating || totalCards <= 1}
          className="px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#18181B] hover:bg-[#27272A] active:scale-95 text-white font-display font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40 shrink-0"
          title="Next Card (Scroll Down / ↓ Key)"
        >
          <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 hidden md:inline">[↓]</span>
          <span>Next</span>
          <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>

      {/* Tactile Progress Indicator: Directly Below Buttons Row */}
      <div className="w-full flex items-center justify-center mt-3">
        <div className="px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 font-mono text-sm font-bold text-stone-800 shadow-inner">
          <span className="text-[#1C1917]">{currentIndex + 1}</span>
          <span className="text-stone-400 mx-1">/</span>
          <span className="text-stone-500">{totalCards}</span>
        </div>
      </div>

      {/* Subtle Interaction Guide Banner */}
      <div className="w-full flex items-center justify-center gap-2 text-stone-400 text-[11px] font-mono mt-3 px-2">
        <MousePointer className="w-3 h-3 text-stone-400" />
        <span>Scroll up/down or use ↑ / ↓ keys · Cards loop continuously</span>
      </div>

      {/* Interactive Dot Navigator for rapid deck browsing */}
      {totalCards > 1 && totalCards <= 16 && (
        <div className="flex items-center justify-center gap-1.5 mt-2 px-2 flex-wrap">
          {cards.map((_, idx) => (
            <button
              key={`deck-dot-${idx}`}
              type="button"
              onClick={() => {
                if (idx !== currentIndex && !isAnimating) {
                  updateFlip(false);
                  onIndexChange(idx);
                }
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[#D92B8A]'
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              title={`Go to Card ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional Rating Component Slot (Active Recall in FlashcardsView) */}
      {ratingComponent && (
        <div className="w-full mt-6 px-2">
          {ratingComponent}
        </div>
      )}

      {/* Embedded CSS Keyframes for smooth Previous slide down */}
      <style>{`
        @keyframes incomingCardSlideDown {
          0% {
            transform: translate3d(0, -118%, 0) scale(0.96) rotate(-2deg);
            opacity: 0.3;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
