import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Bookmark, 
  BookOpen,
  HelpCircle,
  Key,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { StudyGuideResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportStudyGuide } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface StudyGuideGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: StudyGuideResult;
}

export const StudyGuideGenerator: React.FC<StudyGuideGeneratorProps> = ({
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
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [guide, setGuide] = useState<StudyGuideResult | null>(null);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleCardFlip = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const resultRef = useScrollToResult(guide, isGenerating);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source material.');
      return;
    }

    if (!canAfford('STUDY_GUIDE')) {
      setError('Insufficient credits for Study Guide generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Comprehensive Study Material',
        category,
        gradeLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('study-guide', input)) as StudyGuideResult;
      setGuide(result);
      await consumeCredits('STUDY_GUIDE', `Generated Study Guide: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!guide) return;
    saveResourceToStorage({
      id: guide.id || `guide-${Date.now()}`,
      toolType: 'study-guide' as any,
      title: guide.title,
      subject: guide.subject || category,
      topic: guide.topic || topic,
      createdAt: guide.createdAt || new Date().toISOString(),
      data: guide,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportDoc = () => {
    if (!guide) return;
    exportStudyGuide(guide, 'doc');
  };

  const handleExportPdf = () => {
    if (!guide) return;
    exportStudyGuide(guide, 'pdf');
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 01
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            STUDY GUIDE GENERATOR
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {guide && Array.isArray(guide.sections) && guide.sections.length > 0 && (
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
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? 'Saved' : 'Save Guide'}
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
                Study Topic / Unit *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Kingdom of Kush & Meroë Ironworking"
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Subject Category
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
                  Target Grade / Audience Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value="Primary / Middle School">Primary / Middle School</option>
                  <option value="Secondary / High School">Secondary / High School</option>
                  <option value="Undergraduate / University">Undergraduate / University</option>
                  <option value="Lifelong Scholar / Advanced">Lifelong Scholar / Advanced</option>
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
              className={`w-full py-4 sm:py-4.5 text-white font-display text-sm sm:text-base font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
                isGenerating
                  ? 'bg-gradient-to-r from-[#E62E6B] via-[#FF5C8A] to-[#C9245F] bg-[length:200%_200%] animate-gradient-flow'
                  : 'bg-[#E62E6B] hover:bg-[#d8245f]'
              }`}
            >
              <span>{isGenerating ? 'Generating…' : 'GENERATE'}</span>
            </button>
          </div>
        </div>

        {/* Generated Result Area */}
        <div ref={resultRef} className="w-full scroll-mt-24">
          {guide && Array.isArray(guide.sections) && guide.sections.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                    {guide.subject || category}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-[#161616] tracking-tight">
                  {guide.title}
                </h2>
                <p className="text-stone-600 font-normal leading-relaxed text-sm sm:text-base">
                  {guide.overview}
                </p>
              </div>

              {/* Exactly 12 Interactive 3D Glass Cards in Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 12 }, (_, idx) => {
                  const section = guide.sections[idx % guide.sections.length];
                  const isFlipped = Boolean(flippedCards[idx]);
                  return (
                    <div 
                      key={idx}
                      className="w-full h-[480px] sm:h-[520px] cursor-pointer group focus:outline-hidden"
                      style={{ perspective: '1600px' }}
                      onClick={() => toggleCardFlip(idx)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isFlipped}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleCardFlip(idx);
                        }
                      }}
                    >
                      <div 
                        className={`relative w-full h-full duration-700 transition-all ${reduceMotion ? '' : 'transform-gpu group-hover:-translate-y-1.5'}`}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: reduceMotion 
                            ? 'none' 
                            : (isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'),
                          boxShadow: isFlipped 
                            ? '0 30px 60px -15px rgba(0, 0, 0, 0.3)' 
                            : '0 20px 40px rgba(100, 80, 60, 0.15)',
                          borderRadius: '2rem',
                        }}
                      >
                        {/* FRONT OF CARD (Futuristic 3D Glass Surface) */}
                        <div 
                          className={`absolute inset-0 w-full h-full bg-white/85 backdrop-blur-xl border border-white/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(100,80,60,0.12),_inset_0_1px_2px_rgba(255,255,255,0.95)] flex flex-col justify-between overflow-hidden transition-all ${
                            reduceMotion && isFlipped ? 'hidden' : 'flex'
                          }`}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="space-y-4">
                            {/* Card Header: Chapter badge & Flip indicator */}
                            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                              <span className="font-mono text-[11px] font-bold text-[#E63956] uppercase tracking-wider px-3 py-1 bg-pink-50/80 rounded-full border border-pink-200/80">
                                CHAPTER {idx + 1}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-stone-400 group-hover:text-[#E63956] transition-colors flex items-center gap-1">
                                <span>Flip</span>
                                <span className="text-sm">↻</span>
                              </span>
                            </div>

                            {/* Chapter Heading (Complete, specific, no ellipses) */}
                            <h3 className="font-display font-black text-lg sm:text-xl uppercase text-[#161616] tracking-tight">
                              {section.heading}
                            </h3>

                            {/* Synopsis (No sliders) */}
                            <div className="pr-1 space-y-2">
                              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-normal">
                                {section.content}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-mono text-stone-500">
                            <span>Front (Synopsis)</span>
                            <span className="text-[#E63956] font-bold group-hover:underline">Key Points →</span>
                          </div>
                        </div>

                        {/* BACK OF CARD (Futuristic 3D Glass Surface) */}
                        <div 
                          className={`absolute inset-0 w-full h-full bg-[#FAF4EC]/90 backdrop-blur-xl border border-stone-200/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(100,80,60,0.15),_inset_0_1px_2px_rgba(255,255,255,0.8)] flex flex-col justify-between overflow-hidden transition-all ${
                            reduceMotion && !isFlipped ? 'hidden' : 'flex'
                          }`}
                          style={{ 
                            backfaceVisibility: 'hidden',
                            transform: reduceMotion ? 'none' : 'rotateY(180deg)' 
                          }}
                        >
                          <div className="space-y-4 pr-1">
                            {/* Back Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-stone-300/60">
                              <span className="font-mono text-[11px] font-bold text-amber-800 uppercase tracking-wider px-3 py-1 bg-amber-100/80 rounded-full border border-amber-200/80">
                                CHAPTER {idx + 1} • KEY POINTS
                              </span>
                              <span className="font-mono text-[11px] font-bold text-stone-500 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                                <span>Back</span>
                                <span className="text-sm">↺</span>
                              </span>
                            </div>

                            {/* Heading */}
                            <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616]">
                              KEY POINTS
                            </h3>

                            {/* Bullet Points (No sliders) */}
                            {section.bulletPoints && section.bulletPoints.length > 0 ? (
                              <ul className="space-y-2">
                                {section.bulletPoints.map((bp, bIdx) => (
                                  <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-800 font-normal leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-stone-700 text-xs sm:text-sm font-normal leading-relaxed">
                                {section.content}
                              </p>
                            )}
                          </div>

                          {/* Back Footer */}
                          <div className="pt-3 border-t border-stone-300/60 flex items-center justify-between text-[11px] font-mono text-stone-600 mt-3 shrink-0">
                            <span className="text-amber-800 font-bold">Reverse</span>
                            <span className="hover:underline">← Front</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Important Takeaways */}
              {guide.importantTakeaways && guide.importantTakeaways.length > 0 && (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <h4 className="font-display font-black text-sm uppercase text-amber-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    High-Yield Exam Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {guide.importantTakeaways.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-950">
                        <span className="font-mono font-bold text-amber-600">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Self-Test Questions */}
              {guide.reviewQuestions && guide.reviewQuestions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="font-display font-black text-lg uppercase text-[#161616] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#E63956]" />
                    Review & Self-Test Questions
                  </h4>

                  <div className="space-y-3">
                    {guide.reviewQuestions.map((q, idx) => {
                      const isRevealed = Boolean(revealedAnswers[idx]);
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-mono text-xs font-bold text-stone-900">
                              Q{idx + 1}: {q.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAnswer(idx)}
                              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[11px] font-mono font-bold text-stone-700 flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {isRevealed ? 'Hide Answer' : 'Show Answer'}
                              {isRevealed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                          {q.hint && (
                            <p className="text-[11px] font-mono text-stone-500">
                              Hint: {q.hint}
                            </p>
                          )}
                          {isRevealed && (
                            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 font-normal leading-relaxed">
                              <span className="font-mono font-bold text-emerald-800 block mb-0.5">Answer:</span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Synthesize Guide
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Configure your subject, topic, and optional source notes on the left, then click Generate Study Guide to produce formatted revision materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
