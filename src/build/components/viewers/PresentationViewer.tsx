import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, Presentation as PresentationIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface PresentationViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const slides = content.slides || [
    { slideNumber: 1, title: 'Introduction', bulletPoints: ['Overview of topic', 'Key learning goals', 'Importance in curriculum'], presenterNotes: 'Introduce the core topic with enthusiasm.' },
    { slideNumber: 2, title: 'Core Principles', bulletPoints: ['Fundamental theories', 'Historical context', 'Practical examples'], presenterNotes: 'Walk through each principle step-by-step.' },
    { slideNumber: 3, title: 'Conclusion & Q&A', bulletPoints: ['Summary of takeaways', 'Review questions', 'Further reading'], presenterNotes: 'Open the floor for student discussion.' }
  ];

  const currentSlide = slides[currentSlideIdx] || slides[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveResourceToStorage(resource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id="build-result-top" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in print:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#E63956]" />
          Back to Generators
        </button>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            Print
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E63956] hover:bg-[#d02e48] text-white font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card-3d-elevated p-8 sm:p-12 space-y-8 bg-white print:shadow-none print:border-none">
        <div className="border-b-2 border-stone-900 pb-6 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956] flex items-center gap-1.5">
              <PresentationIcon className="w-4 h-4" />
              SLIDE DECK PRESENTATION
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616] mt-1">
              {content.title || resource.title}
            </h1>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 bg-stone-100 rounded-full text-stone-700">
            Slide {currentSlideIdx + 1} of {slides.length}
          </span>
        </div>

        {/* Slide Canvas */}
        <div className="aspect-[16/9] w-full bg-[#18181B] text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative border-2 border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-widest">
              {content.subject || resource.subject}
            </span>
            <span className="font-mono text-xs text-stone-400">
              #{currentSlide.slideNumber || currentSlideIdx + 1}
            </span>
          </div>

          <div className="space-y-6 my-auto">
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              {currentSlide.title}
            </h2>
            <ul className="space-y-3">
              {currentSlide.bulletPoints && Array.isArray(currentSlide.bulletPoints) && currentSlide.bulletPoints.map((bp: string, bpIdx: number) => (
                <li key={bpIdx} className="text-sm sm:text-base text-stone-300 font-medium flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#E63956]" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800 text-xs font-mono text-stone-400">
            <span>Proudly Afrikan Presentation Suite</span>
            <span>Slide {currentSlideIdx + 1} / {slides.length}</span>
          </div>
        </div>

        {/* Slide Navigation Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
            disabled={currentSlideIdx === 0}
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-display font-bold uppercase text-xs text-stone-800 flex items-center gap-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Slide
          </button>

          {/* Presenter Notes */}
          {currentSlide.presenterNotes && (
            <div className="hidden sm:block text-center font-mono text-xs text-stone-500 max-w-md truncate">
              <strong className="text-stone-700">Presenter Note:</strong> {currentSlide.presenterNotes}
            </div>
          )}

          <button
            onClick={() => setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIdx === slides.length - 1}
            className="px-5 py-2.5 rounded-xl bg-[#E63956] hover:bg-[#d02e48] disabled:opacity-40 font-display font-bold uppercase text-xs text-white flex items-center gap-2 cursor-pointer"
          >
            Next Slide
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
