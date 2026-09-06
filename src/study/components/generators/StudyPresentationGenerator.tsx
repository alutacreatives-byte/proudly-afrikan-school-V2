import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
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

interface StudyPresentationGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: PresentationResult;
}

export const StudyPresentationGenerator: React.FC<StudyPresentationGeneratorProps> = ({
  onBack,
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
  const [presentation, setPresentation] = useState<PresentationResult | null>(
    existingResource && Array.isArray(existingResource.slides) && existingResource.slides.length > 0
      ? existingResource
      : null
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCopy = () => {
    if (!presentation || !Array.isArray(presentation.slides)) return;
    let text = `# ${presentation.title}\nSubtitle: ${presentation.subtitle || ''}\nSubject: ${presentation.subject || category}\n\n`;
    presentation.slides.forEach((s, idx) => {
      text += `## Slide ${idx + 1}: ${s.title}\n`;
      s.bullets.forEach((b) => (text += `- ${b}\n`));
      if (s.speakerNotes) text += `\nSpeaker Notes: ${s.speakerNotes}\n`;
      if (s.discussionPrompt) text += `Discussion Prompt: ${s.discussionPrompt}\n`;
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!presentation) return;
    const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-slides.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentSlide = presentation?.slides?.[activeSlideIndex];

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#161616] p-8 max-w-none overflow-y-auto' : ''}`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b ${isFullscreen ? 'border-stone-800' : 'border-stone-200'}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
              isFullscreen ? 'bg-stone-900 border-stone-800 text-white hover:bg-stone-800' : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
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
        </div>

        {presentation && Array.isArray(presentation.slides) && presentation.slides.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
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
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8`}>
        {/* Left Form (Hidden in fullscreen) */}
        {!isFullscreen && (
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
                  Presentation Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Great Zimbabwe Architecture & Trade"
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
                  Audience Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
                >
                  <option value="Primary / Middle School">Primary / Middle School</option>
                  <option value="Secondary / High School">Secondary / High School</option>
                  <option value="Undergraduate / University">Undergraduate / University</option>
                  <option value="Academic Conference / Professional">Academic Conference / Professional</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                  Slide Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
                >
                  <option value={5}>5 Slides (Overview / Lightning)</option>
                  <option value={6}>6 Slides (Standard Lecture Deck)</option>
                  <option value={8}>8 Slides (In-Depth Topic Presentation)</option>
                  <option value={10}>10 Slides (Comprehensive Keynote)</option>
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
                {isGenerating ? 'Designing Presentation...' : 'Generate Slide Deck →'}
              </button>
            </div>
          </div>
        )}

        {/* Right Active Slide Stage */}
        <div className={isFullscreen ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-8'}>
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
