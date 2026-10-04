import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Bookmark, 
  Shuffle, 
  Download,
  RotateCw
} from 'lucide-react';
import { FlashcardResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportFlashcards } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';
import { StackedFlashcardDeck } from '../StackedFlashcardDeck';

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

  // Form State
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [count, setCount] = useState<number>(existingResource?.cards?.length || 8);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Active Flashcards Deck State - always null initially when opened fresh from STUDY main page
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<FlashcardResult | null>(
    existingResource && Array.isArray(existingResource.cards) && existingResource.cards.length > 0
      ? existingResource
      : null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useScrollToResult(flashcards, isGenerating);

  // Sync / reset when existingResource changes (e.g. navigated back to main page or selected fresh)
  useEffect(() => {
    if (existingResource && Array.isArray(existingResource.cards) && existingResource.cards.length > 0) {
      setFlashcards(existingResource);
      setTopic(existingResource.topic || existingResource.title || '');
      setCategory(existingResource.subject || 'AFRICAN HISTORY');
    } else {
      setFlashcards(null);
      setTopic('');
      setCategory('AFRICAN HISTORY');
      setSourceMaterial('');
      setSourceFileName('');
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [existingResource]);

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
    setCurrentIndex(0);
    setIsFlipped(false);

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

  const handleShuffle = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length <= 1) return;
    const allCards = [...flashcards.cards];
    const candidateIndices = allCards.map((_, i) => i).filter(i => i !== currentIndex);
    const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    const chosenCard = allCards[chosenIndex];

    const remaining = allCards.filter((_, i) => i !== chosenIndex);
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    setFlashcards({ ...flashcards, cards: [chosenCard, ...remaining] });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 02
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            Active Recall Flashcards
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">

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

      {/* Main Layout: Generator / Menu directly ABOVE generation area */}
      <div className="space-y-12 sm:space-y-16">
        {/* Form Menu Column: Always open and ready in initial state */}
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
                placeholder="e.g. Ancient Carthage Trade Networks or Molecular Biology"
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
              className={`w-full py-4 text-white font-display text-sm font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
                isGenerating
                  ? 'bg-gradient-to-r from-[#E62E6B] via-[#FF5C8A] to-[#C9245F] bg-[length:200%_200%] animate-gradient-flow'
                  : 'bg-[#E62E6B] hover:bg-[#d8245f]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>{isGenerating ? 'Generating Flashcards...' : 'GENERATE FLASHCARDS'}</span>
            </button>
          </div>
        </div>

        {/* Generated Result Area: Appears ONLY after generating with clear gap */}
        <div ref={resultRef} className="w-full scroll-mt-24 pt-6 sm:pt-10">
          {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
            <div className="space-y-6">
              <StackedFlashcardDeck
                cards={flashcards.cards}
                currentIndex={currentIndex}
                onIndexChange={(idx) => {
                  setCurrentIndex(idx);
                  setIsFlipped(false);
                }}
                onShuffle={handleShuffle}
                deckTitle={flashcards.title}
                deckCategory={flashcards.subject || category}
                isFlipped={isFlipped}
                onFlipChange={setIsFlipped}
              />

              {/* All Cards Overview Grid */}
              <div className="pt-8 border-t border-stone-200 space-y-4">
                <h4 className="font-display font-black text-base sm:text-lg uppercase text-stone-900 tracking-wider">
                  Full Set Overview ({flashcards.cards.length} Cards)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {flashcards.cards.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        idx === currentIndex
                          ? 'bg-pink-50/50 border-[#E62E6B]'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-stone-400 block uppercase">
                        #{idx + 1}
                      </span>
                      <p className="font-mono text-sm sm:text-base font-bold text-stone-900 line-clamp-2">
                        {c.front}
                      </p>
                      <p className="text-sm text-stone-600 line-clamp-2 font-normal">
                        {c.back}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
