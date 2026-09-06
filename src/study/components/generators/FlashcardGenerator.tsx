import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
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

interface FlashcardGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: FlashcardResult;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  onBack,
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
  const [flashcards, setFlashcards] = useState<FlashcardResult | null>(
    existingResource && Array.isArray(existingResource.cards) && existingResource.cards.length > 0
      ? existingResource
      : null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCopy = () => {
    if (!flashcards || !Array.isArray(flashcards.cards)) return;
    const text = flashcards.cards
      .map((c, i) => `Card ${i + 1}\nFront: ${c.front}\nBack: ${c.back}\n${c.hint ? `Hint: ${c.hint}\n` : ''}`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!flashcards) return;
    const blob = new Blob([JSON.stringify(flashcards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flashcards.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flashcards.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCard = flashcards?.cards?.[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
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
        </div>

        {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-[#E63956]" />
              <h2 className="font-display font-black text-sm uppercase text-[#161616] tracking-wider">
                Deck Configuration
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Study Topic / Terminology *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Ancient Carthage Trade Networks"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Subject
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
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
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Card Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value={6}>6 Flashcards (Quick Drill)</option>
                <option value={8}>8 Flashcards (Standard Review)</option>
                <option value={12}>12 Flashcards (Comprehensive)</option>
                <option value={16}>16 Flashcards (Deep Recall)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Optional Source Material (PDF / DOC / Notes)
              </label>
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
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating Flashcards...' : 'Generate Flashcards →'}
            </button>
          </div>
        </div>

        {/* Right Active Flashcard Player */}
        <div className="lg:col-span-8">
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
