import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Bookmark, 
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText,
  Download
} from 'lucide-react';
import { PresentationResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportPresentation } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface StudyPresentationGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: PresentationResult;
}

export const StudyPresentationGenerator: React.FC<StudyPresentationGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [count, setCount] = useState<number>(existingResource?.slides?.length || 6);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Generation & Active Deck State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [presentation, setPresentation] = useState<PresentationResult | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useScrollToResult(presentation, isGenerating);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a presentation topic or upload source notes.');
      return;
    }

    if (!canAfford('PRESENTATION')) {
      setError('Insufficient credits for Presentation generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveSlideIndex(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Academic Presentation',
        category,
        gradeLevel,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('presentation', input)) as PresentationResult;
      setPresentation(result);
      await consumeCredits('PRESENTATION', `Generated Presentation: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextSlide = () => {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % presentation.slides.length);
  };

  const handlePrevSlide = () => {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + presentation.slides.length) % presentation.slides.length);
  };

  const handleSave = () => {
    if (!presentation) return;
    saveResourceToStorage({
      id: presentation.id || `pres-${Date.now()}`,
      toolType: 'presentation' as any,
      title: presentation.title,
      subject: presentation.subject || category,
      topic: presentation.topic || topic,
      createdAt: presentation.createdAt || new Date().toISOString(),
      data: presentation,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportDoc = () => {
    if (!presentation) return;
    exportPresentation(presentation, 'doc');
  };

  const handleExportPdf = () => {
    if (!presentation) return;
    exportPresentation(presentation, 'pdf');
  };

  const currentSlide = presentation?.slides?.[activeSlideIndex];

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#161616] p-8 max-w-none overflow-y-auto' : ''}`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b ${isFullscreen ? 'border-stone-800' : 'border-stone-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 06
            </span>
          </div>
          <h1 className={`font-display font-black text-2xl sm:text-3xl uppercase tracking-tight ${isFullscreen ? 'text-white' : 'text-[#161616]'}`}>
            PRESENTATION SLIDE GENERATOR
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {presentation && Array.isArray(presentation.slides) && presentation.slides.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Present'}
              </button>
              <button
                type="button"
                onClick={handleExportDoc}
                className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
                title="Download Word Document (.doc)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                DOC
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
                title="Download PDF Document (.pdf)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? 'Saved' : 'Save Deck'}
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
        {/* Left Form (Hidden in fullscreen) */}
        {!isFullscreen && (
          <div className="w-full space-y-6">
            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08),_0_28px_56px_-6px_rgba(100,80,60,0.10),_0_45px_80px_-12px_rgba(100,80,60,0.08)] space-y-6">

              <div className="text-left">
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2">
                  PRESENTATION TOPIC *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Great Zimbabwe Architecture & Trade"
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div>
                  <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2">
                    SUBJECT
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
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
                  <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2">
                    AUDIENCE LEVEL
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                  >
                    <option value="Primary / Middle School">Primary / Middle School</option>
                    <option value="Secondary / High School">Secondary / High School</option>
                    <option value="Undergraduate / University">Undergraduate / University</option>
                    <option value="Academic Conference / Professional">Academic Conference / Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2">
                    SLIDE COUNT
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                  >
                    <option value={5}>5 Slides (Overview / Lightning)</option>
                    <option value={6}>6 Slides (Standard Lecture Deck)</option>
                    <option value={8}>8 Slides (In-Depth Topic Presentation)</option>
                    <option value={10}>10 Slides (Comprehensive Keynote)</option>
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
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-4 rounded-full bg-[#E62E6B] hover:bg-[#d8245f] disabled:bg-stone-300 text-white font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Designing Presentation...' : 'GENERATE SLIDE DECK →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Generated Result Area */}
        <div ref={resultRef} className={`w-full scroll-mt-24 ${isFullscreen ? 'max-w-5xl mx-auto' : ''}`}>
          {presentation && currentSlide && Array.isArray(presentation.slides) && presentation.slides.length > 0 ? (
            <div className="space-y-6">
              {/* Slide Meta Bar */}
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold uppercase ${isFullscreen ? 'text-stone-400' : 'text-stone-500'}`}>
                  Slide {activeSlideIndex + 1} of {presentation.slides.length}
                </span>
                <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                  {presentation.subject || category}
                </span>
              </div>

              {/* Slide Stage Container */}
              <div className={`w-full aspect-16/10 rounded-[2.5rem] p-8 sm:p-12 border-2 flex flex-col justify-between transition-all duration-300 ${
                isFullscreen
                  ? 'bg-stone-900 border-stone-800 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]'
                  : 'bg-white border-stone-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.06)] text-[#161616]'
              }`}>
                {/* Slide Header */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#E63956] uppercase tracking-widest">
                    SECTION {activeSlideIndex + 1}
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight leading-tight">
                    {currentSlide.title}
                  </h3>
                </div>

                {/* Bullets */}
                <div className="space-y-4 my-auto py-4">
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#E63956] mt-2.5 shrink-0" />
                      <p className={`text-base sm:text-xl font-normal leading-relaxed ${isFullscreen ? 'text-stone-200' : 'text-stone-700'}`}>
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Visual Cue */}
                {currentSlide.visualCue && (
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    isFullscreen ? 'bg-stone-800/80 border-stone-700 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}>
                    <span className="font-bold text-[#E63956]">🖼️ Visual Prompt:</span>
                    <span>{currentSlide.visualCue}</span>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className={`px-6 py-3 rounded-2xl border font-display font-black text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer ${
                    isFullscreen ? 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700' : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Slide
                </button>

                {/* Thumbnails dots */}
                <div className="flex items-center gap-2">
                  {presentation.slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        idx === activeSlideIndex ? 'w-8 bg-[#E63956]' : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="px-6 py-3 rounded-2xl bg-[#E63956] hover:bg-[#D32F4C] text-white font-display font-black text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next Slide
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Speaker Notes Drawer */}
              {currentSlide.speakerNotes && (
                <div className={`p-6 rounded-2xl border space-y-2 ${
                  isFullscreen ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-stone-50/90 border-stone-200 text-stone-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-900 uppercase flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#E63956]" />
                      Speaker Notes & Presentation Guidance
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-normal leading-relaxed">
                    {currentSlide.speakerNotes}
                  </p>
                  {currentSlide.discussionPrompt && (
                    <div className="mt-2 pt-2 border-t border-stone-200/60 text-xs font-mono text-stone-600">
                      <span className="font-bold text-[#E63956]">💬 Discussion Trigger:</span> {currentSlide.discussionPrompt}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Generate Slide Deck
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Provide your presentation topic or attach curriculum materials to create structured, formatted lecture slides with speaker notes and visual prompts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
