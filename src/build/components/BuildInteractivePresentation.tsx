import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { SavedResource } from '../types';
import { exportBuildResource } from '../../utils/exportUtils';

export interface BuildInteractivePresentationProps {
  resource: SavedResource;
  onGoHome?: () => void;
  onBack?: () => void;
  activeSlideIndex?: number;
  setActiveSlideIndex?: React.Dispatch<React.SetStateAction<number>>;
  onExportPdf?: () => void;
  showSpeakerNotes?: boolean;
  setShowSpeakerNotes?: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen?: boolean;
  setIsFullscreen?: React.Dispatch<React.SetStateAction<boolean>>;
  onExportDoc?: () => void;
  onExportHtml?: () => void;
  onExportMarkdown?: () => void;
}

export const BuildInteractivePresentation: React.FC<BuildInteractivePresentationProps> = ({
  resource,
  onGoHome,
  onBack,
  activeSlideIndex: externalActiveIndex,
  setActiveSlideIndex: externalSetActiveIndex,
  onExportPdf,
}) => {
  const [internalSlideIndex, setInternalSlideIndex] = useState(0);
  const currentSlideIndex = externalActiveIndex !== undefined ? externalActiveIndex : internalSlideIndex;
  const setCurrentSlideIndex = externalSetActiveIndex || setInternalSlideIndex;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const data = resource.data || {};
  const slides = data.slides || data.content?.slides || [
    {
      title: resource.title || 'Interactive Presentation',
      subtitle: `${resource.subject || 'Subject'} • ${resource.gradeLevel || 'General'}`,
      content: resource.topic || 'Comprehensive presentation overview.',
      bullets: ['Key Concept 1', 'Key Concept 2', 'Key Concept 3']
    }
  ];

  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev: number) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, totalSlides, setCurrentSlideIndex]);

  const handleNext = () => {
    setCurrentSlideIndex((prev: number) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev: number) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleCopyText = () => {
    const textToCopy = slides.map((s: any, i: number) => `Slide ${i + 1}: ${s.title}\n${s.content}\n${s.bullets?.join('\n') || ''}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      exportBuildResource(resource, 'pdf');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-[#0A0A0C] text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4'
          : 'space-y-6'
      }`}
    >
      {/* Top Header / Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#D92B8A] to-[#E63956] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-black text-base sm:text-lg text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {resource.title}
            </h2>
            <p className="font-mono text-xs text-stone-300">
              Slide {currentSlideIndex + 1} of {totalSlides} • {resource.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlideIndex(0)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#161616] font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT PDF</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D92B8A] hover:bg-[#c2237a] text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Slide Arena Stage with Animated Gradient Background from CodePen wvzMexO */}
      <div
        className={`relative w-full rounded-[2.5rem] bg-[#060609] overflow-hidden flex items-center justify-center transition-all ${
          isFullscreen ? 'flex-1 rounded-2xl w-full max-w-7xl mx-auto my-auto min-h-[500px]' : 'min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]'
        }`}
      >
        {/* Animated Gradient Background from CodePen wvzMexO */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#060609]">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-tr from-[#1b0526] via-[#090b1c] to-[#04121a] animate-pulse" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        {/* Slide Content Box */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-12 py-12 flex flex-col items-center text-center text-white">
          <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-xs font-bold uppercase tracking-widest text-pink-300 mb-6 shadow-sm">
            {currentSlide.subtitle || resource.subject}
          </span>

          <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-6 leading-tight drop-shadow-lg">
            {currentSlide.title}
          </h1>

          <p className="font-sans text-stone-200 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mb-8 drop-shadow">
            {currentSlide.content}
          </p>

          {currentSlide.bullets && currentSlide.bullets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4 text-left">
              {currentSlide.bullets.map((bullet: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-xl flex items-start gap-3 hover:bg-white/15 transition-all"
                >
                  <span className="w-6 h-6 rounded-xl bg-gradient-to-r from-[#D92B8A] to-[#E63956] text-white font-display font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-stone-100 font-medium leading-snug">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg z-20"
          title="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg z-20"
          title="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Slide Timeline Selector */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
        {slides.map((s: any, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlideIndex(idx)}
            className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentSlideIndex === idx
                ? 'bg-gradient-to-r from-[#D92B8A] to-[#E63956] text-white shadow-lg scale-105'
                : 'bg-white/5 hover:bg-white/10 text-stone-300'
            }`}
          >
            {idx + 1}. {s.title.substring(0, 18)}...
          </button>
        ))}
      </div>
    </div>
  );
};
