import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Presentation as PresIcon, 
  Volume2, 
  Sparkles 
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { PresentationData, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface PresentationViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ resource, onBack }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);

  const pres: PresentationData = resource.data;
  const currentSlide = pres.slides?.[currentSlideIndex] || pres.slides?.[0];

  const handleNext = () => {
    if (pres.slides && currentSlideIndex < pres.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleCopy = () => {
    let text = `${pres.title}\nSubject: ${pres.subject}\n\n`;
    (pres.slides || []).forEach((s) => {
      text += `=== Slide ${s.slideNumber}: ${s.title} ===\n${s.subtitle ? `${s.subtitle}\n` : ''}`;
      (s.bulletPoints || []).forEach((b) => {
        text += `• ${b}\n`;
      });
      if (s.speakingNotes) {
        text += `Speaking Notes: ${s.speakingNotes}\n`;
      }
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveResourceToStorage(resource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportPptx = async () => {
    try {
      setExportingPptx(true);
      const ppt = new pptxgen();
      ppt.layout = 'LAYOUT_16x9';

      (pres.slides || []).forEach((slide) => {
        const s = ppt.addSlide();
        
        // Slide title
        s.addText(slide.title, {
          x: 0.8,
          y: 0.8,
          w: '80%',
          h: 1,
          fontSize: 24,
          bold: true,
          color: '161616',
          fontFace: 'Arial',
        });

        // Subtitle
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 0.8,
            y: 1.6,
            w: '80%',
            h: 0.5,
            fontSize: 14,
            italic: true,
            color: '666666',
          });
        }

        // Bullets
        const bulletItems = slide.bulletPoints.map((b) => ({
          text: b,
          options: { fontSize: 14, bullet: true, color: '333333' },
        }));

        s.addText(bulletItems as any, {
          x: 0.8,
          y: slide.subtitle ? 2.3 : 1.8,
          w: '80%',
          h: 4,
        });

        // Speaker notes
        if (slide.speakingNotes) {
          s.addNotes(slide.speakingNotes);
        }
      });

      await ppt.writeFile({ fileName: `${(pres.title || 'Presentation').replace(/[^a-z0-9]/gi, '_')}.pptx` });
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setExportingPptx(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Build
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportPptx}
            disabled={exportingPptx}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#E63956]" />
            {exportingPptx ? 'Exporting...' : 'Export PPTX'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
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
            className="px-4 py-2 rounded-xl bg-[#161616] hover:bg-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />
            {saved ? 'Saved!' : 'Save to My Sets'}
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header Metadata */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-stone-100">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
              SLIDE DECK PRESENTATION • CAPS ALIGNED
            </span>
            <h1 className="font-display font-black text-xl sm:text-2xl text-stone-900 uppercase">
              {pres.title || resource.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-stone-500">
            <span>Slide {currentSlideIndex + 1} of {pres.slides?.length || 1}</span>
          </div>
        </div>

        {/* Current Active Slide Card */}
        {currentSlide && (
          <div className="aspect-16/9 w-full bg-stone-900 text-white rounded-3xl p-6 sm:p-12 flex flex-col justify-between shadow-lg relative overflow-hidden border border-stone-800">
            {/* Subtle top decoration */}
            <div className="flex items-center justify-between text-stone-400 font-mono text-xs pb-4 border-b border-stone-800">
              <span className="uppercase tracking-wider">{pres.subject}</span>
              <span>SLIDE {currentSlide.slideNumber}</span>
            </div>

            {/* Slide Body */}
            <div className="my-auto space-y-4 max-w-2xl">
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight uppercase">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="font-mono text-xs sm:text-sm text-[#E63956] font-semibold uppercase tracking-wider">
                  {currentSlide.subtitle}
                </p>
              )}

              <ul className="space-y-2.5 pt-2">
                {(currentSlide.bulletPoints || []).map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 font-mono text-xs sm:text-sm text-stone-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63956] mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-stone-500 font-mono text-[10px] sm:text-xs pt-4 border-t border-stone-800">
              <span>Proudly Afrikan Educational Series</span>
              {currentSlide.keyTakeaway && (
                <span className="text-stone-300 italic">Key: {currentSlide.keyTakeaway}</span>
              )}
            </div>
          </div>
        )}

        {/* Carousel Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-stone-200 font-mono text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {(pres.slides || []).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex 
                    ? 'w-6 bg-[#E63956]' 
                    : 'w-2 bg-stone-200 hover:bg-stone-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!pres.slides || currentSlideIndex === pres.slides.length - 1}
            className="px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Presenter / Speaker Notes Drawer */}
        {currentSlide?.speakingNotes && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 font-mono text-xs space-y-2 text-amber-950">
            <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-amber-800">
              <Volume2 className="w-4 h-4 text-[#E63956]" />
              Teacher / Presenter Speaking Notes for Slide {currentSlide.slideNumber}:
            </div>
            <p className="leading-relaxed text-stone-800">{currentSlide.speakingNotes}</p>
          </div>
        )}

        {/* Full Deck Grid Overview */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <h3 className="font-display font-black text-base uppercase text-stone-900 tracking-wider">
            All Slides Overview ({pres.slides?.length || 0} Slides)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(pres.slides || []).map((s, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  idx === currentSlideIndex
                    ? 'bg-pink-50/50 border-[#E63956]'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-stone-400">
                  <span className="font-bold uppercase">Slide #{s.slideNumber}</span>
                  {idx === currentSlideIndex && (
                    <span className="text-[#E63956] font-bold">Active</span>
                  )}
                </div>
                <h4 className="font-display font-black text-xs text-stone-900 uppercase truncate">
                  {s.title}
                </h4>
                <p className="font-mono text-[11px] text-stone-500 line-clamp-2">
                  {s.bulletPoints?.[0] || 'Slide content...'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
