import React, { useState } from 'react';
import { Layers, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideItem {
  id: string;
  slideNumber: number;
  slideType?: string;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  speakerNotes?: string;
}

interface StackedPresentationDeckProps {
  slides: SlideItem[];
  title: string;
  themeMood?: string;
  onDownloadHtml: () => void;
  onFullscreen: () => void;
}

export const StackedPresentationDeck: React.FC<StackedPresentationDeckProps> = ({
  slides,
  title,
  themeMood = 'modern',
  onDownloadHtml,
  onFullscreen,
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIdx] || slides[0];

  if (!slides || totalSlides === 0) {
    return (
      <div className="w-full mx-auto min-h-[440px] rounded-3xl bg-amber-50/50 border border-amber-200 p-8 flex flex-col items-center justify-center text-center">
        <Layers className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="font-display font-black text-xl text-stone-900 uppercase">No Slides In Presentation</h3>
        <p className="text-sm text-stone-600 mt-1">Generate or add slides to start your presentation view.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none py-4 space-y-6">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-100 shadow-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Slide {currentSlideIdx + 1} / {totalSlides}</span>
          </span>
          <span className="text-sm font-semibold text-stone-700 truncate max-w-xs sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadHtml}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download Presentation HTML"
          >
            <Download className="w-3.5 h-3.5 text-[#E62E6B]" />
            <span>Download HTML</span>
          </button>
          <button
            type="button"
            onClick={onFullscreen}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Fullscreen Presentation"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Slide Arena */}
      <div className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] rounded-[2.5rem] bg-gradient-to-br from-stone-900 to-stone-950 text-white p-8 sm:p-12 flex flex-col justify-between shadow-2xl border border-stone-800">
        <div className="flex items-center justify-between text-stone-400 font-mono text-xs uppercase tracking-widest">
          <span>{themeMood} deck</span>
          <span>Slide {currentSlide.slideNumber}</span>
        </div>

        <div className="my-auto space-y-6 max-w-3xl mx-auto text-center px-4">
          <h2 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
            {currentSlide.title}
          </h2>
          {currentSlide.subtitle && (
            <p className="text-stone-300 text-base sm:text-lg">
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
            <ul className="space-y-3 text-left max-w-2xl mx-auto pt-4">
              {currentSlide.bulletPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-3 text-stone-200 text-sm sm:text-base font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E62E6B] mt-2 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / Speaker Notes */}
        <div className="pt-4 border-t border-stone-800 text-stone-400 text-xs font-mono flex items-center justify-between">
          <span>Speaker Notes: {currentSlide.speakerNotes || 'Standard lecture points.'}</span>
          <span>Use controls below to navigate</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full flex items-center justify-between gap-4 px-2">
        <button
          type="button"
          onClick={() => setCurrentSlideIdx((prev) => (prev - 1 + totalSlides) % totalSlides)}
          disabled={totalSlides <= 1}
          className="px-5 py-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-display font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIdx ? 'w-6 bg-[#E62E6B]' : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentSlideIdx((prev) => (prev + 1) % totalSlides)}
          disabled={totalSlides <= 1}
          className="px-5 py-3 rounded-2xl bg-stone-900 text-white font-display font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
