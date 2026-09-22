import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Bookmark, 
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  Eye,
  Download
} from 'lucide-react';
import { FlashcardResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportFlashcards } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface FlashcardGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: FlashcardResult;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [count, setCount] = useState<number>(existingResource?.cards?.length || 8);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Generation & Active Play State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<FlashcardResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useScrollToResult(flashcards, isGenerating);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source notes.');
      return;
    }

    if (!canAfford('QUIZ_FLASHCARDS')) {
      setError('Insufficient credits for Flashcards. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Active Recall Flashcards',
        category,
        gradeLevel,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('flashcards', input)) as FlashcardResult;
      setFlashcards(result);
      await consumeCredits('QUIZ_FLASHCARDS', `Generated Flashcards: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.cards.length);
  };

  const handlePrev = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.cards.length) % flashcards.cards.length);
  };

  const handleShuffle = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    const shuffled = [...flashcards.cards].sort(() => Math.random() - 0.5);
    setFlashcards({ ...flashcards, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleSave = () => {
    if (!flashcards) return;
    saveResourceToStorage({
      id: flashcards.id || `fc-${Date.now()}`,
      toolType: 'flashcards' as any,
      title: flashcards.title,
      subject: flashcards.subject || category,
      topic: flashcards.topic || topic,
      createdAt: flashcards.createdAt || new Date().toISOString(),
      data: flashcards,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportDoc = () => {
    if (!flashcards) return;
    exportFlashcards(flashcards, 'doc');
  };

  const handleExportPdf = () => {
    if (!flashcards) return;
    exportFlashcards(flashcards, 'pdf');
  };

  const currentCard = flashcards?.cards?.[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 03
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            FLASHCARD GENERATOR
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleShuffle}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Shuffle
              </button>
              <button
                type="button"
                onClick={handleExportDoc}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download Word Document (.doc)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                DOC
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download PDF Document (.pdf)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? 'Saved' : 'Save Set'}
              </button>
            </div>
          )}
          <GlobalNavigationButtons
            onBack={onBack}
            onGoHome={onGoHome}
            backLabel="Back"
            homeLabel="Home"
          />
        </div>
      </div>

      {/* Main Layout: Menu directly ABOVE generation area */}
      <div className="space-y-8">
        {/* Form Menu Column */}
        <div className="w-full">
          <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08),_0_28px_56px_-6px_rgba(100,80,60,0.10),_0_45px_80px_-12px_rgba(100,80,60,0.08)] space-y-6">

            <div>
              <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                Study Topic / Terminology *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Ancient Carthage Trade Networks"
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Subject
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value="AFRICAN HISTORY">African History</option>
                  <option value="SCIENCES & STEM">Sciences & STEM</option>
                  <option value="MATHEMATICS">Mathematics</option>
                  <option value="LITERATURE & ARTS">Literature & Arts</option>
                  <option value="GEOGRAPHY & ENVIRONMENT">Geography & Environment</option>
                  <option value="CIVICS & ECONOMICS">Civics & Economics</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Card Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value={6}>6 Flashcards (Quick Drill)</option>
                  <option value={8}>8 Flashcards (Standard Review)</option>
                  <option value={12}>12 Flashcards (Comprehensive)</option>
                  <option value={16}>16 Flashcards (Deep Recall)</option>
                </select>
              </div>
            </div>

            <div>
              <SourceMaterialUpload
                currentFileName={sourceFileName}
                onTextExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
                accentColor="#E62E6B"
              />
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 sm:py-4.5 bg-[#E62E6B] hover:bg-[#d8245f] text-white font-display text-sm sm:text-base font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>{isGenerating ? 'Generating Flashcards...' : 'GENERATE FLASHCARDS'}</span>
            </button>
          </div>
        </div>

        {/* Generated Result Area */}
        <div ref={resultRef} className="w-full scroll-mt-24">
          {flashcards && currentCard && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 ? (
            <div className="space-y-6">
              {/* Card Meta Bar */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                  Card {currentIndex + 1} of {flashcards.cards.length}
                </span>
                <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                  {currentCard.category || flashcards.subject || category}
                </span>
              </div>

              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full min-h-[360px] sm:min-h-[400px] p-8 sm:p-12 rounded-[2.5rem] bg-white border-2 border-stone-200/90 hover:border-[#E63956]/60 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none group"
              >
                <span className="absolute top-6 right-6 px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 group-hover:bg-[#E63956] group-hover:text-white transition-colors">
                  <RotateCw className="w-3 h-3" />
                  {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                </span>

                <div className="space-y-4 max-w-xl">
                  {!isFlipped ? (
                    <>
                      <span className="text-xs font-mono font-bold text-[#E63956] uppercase tracking-wider block">
                        PROMPT / QUESTION
                      </span>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] leading-snug">
                        {currentCard.front}
                      </h3>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
                        ANSWER / DEFINITION
                      </span>
                      <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                        {currentCard.back}
                      </p>
                    </>
                  )}
                </div>

                {currentCard.hint && !isFlipped && (
                  <div className="absolute bottom-6 left-6 right-6">
                    {showHint ? (
                      <p className="text-xs font-mono text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200 max-w-md mx-auto">
                        💡 Hint: {currentCard.hint}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(true);
                        }}
                        className="text-[11px] font-mono font-bold text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Eye className="w-3 h-3" />
                        Show Hint
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 font-display font-black text-xs uppercase text-stone-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Card
                </button>

                {/* Dots indicator */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {flashcards.cards.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        setShowHint(false);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex ? 'w-6 bg-[#E63956]' : 'w-2 bg-stone-200 hover:bg-stone-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-[#18181B] hover:bg-[#27272A] text-white font-display font-black text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next Card
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* All Cards Overview Grid */}
              <div className="pt-8 border-t border-stone-200 space-y-4">
                <h4 className="font-display font-black text-sm uppercase text-stone-900 tracking-wider">
                  Full Set Overview ({flashcards.cards.length} Cards)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {flashcards.cards.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        setShowHint(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        idx === currentIndex
                          ? 'bg-pink-50/50 border-[#E63956]'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-stone-400 block uppercase">
                        #{idx + 1}
                      </span>
                      <p className="font-mono text-xs font-bold text-stone-900 line-clamp-2">
                        {c.front}
                      </p>
                      <p className="text-xs text-stone-600 line-clamp-2 font-normal">
                        {c.back}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Generate Active Recall Cards
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Enter your study concepts and choose the deck size to create interactive active-recall flashcards with instant flip animations and hints.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
