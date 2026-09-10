import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, Layers, BookOpen, CheckCircle } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface WorksheetViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const WorksheetViewer: React.FC<WorksheetViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

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
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer ${
              showAnswers ? 'bg-[#E63956] text-white' : 'bg-white border border-stone-200 text-stone-800 hover:border-stone-400'
            }`}
          >
            {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
          </button>
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
        <div className="border-b-2 border-stone-900 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956]">
              CLASSROOM WORKSHEET • {content.subject || resource.subject}
            </span>
            <span className="font-mono text-xs font-bold text-stone-500">
              {content.gradeLevel || resource.gradeLevel}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            {content.title || resource.title}
          </h1>
          {content.overview && (
            <p className="text-sm text-stone-700 font-normal pt-2 leading-relaxed">
              {content.overview}
            </p>
          )}
        </div>

        {/* Student Header Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-700">
          <div>STUDENT NAME: ___________________________</div>
          <div>DATE: _________________ CLASS: _________</div>
        </div>

        {/* Sections / Exercises */}
        <div className="space-y-8">
          {content.sections && Array.isArray(content.sections) ? (
            content.sections.map((sec: any, sIdx: number) => (
              <div key={sec.id || sIdx} className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-stone-900">
                  {sec.title || `Exercise ${sIdx + 1}`}
                </h3>
                {sec.instructions && (
                  <p className="text-xs sm:text-sm font-mono text-stone-600 italic">
                    {sec.instructions}
                  </p>
                )}

                <div className="space-y-4">
                  {sec.exercises && Array.isArray(sec.exercises) && sec.exercises.map((ex: any, eIdx: number) => (
                    <div key={ex.id || eIdx} className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-3">
                      <div className="font-display font-bold text-stone-900 text-sm">
                        Q{eIdx + 1}. {ex.prompt || ex.question}
                      </div>

                      {/* Answer lines or blanks for student */}
                      <div className="h-10 border-b border-dashed border-stone-300 w-full" />

                      {showAnswers && ex.answer && (
                        <div className="pt-2 text-xs font-mono font-bold text-[#E63956] flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          Answer Solution: {ex.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm font-mono text-stone-600">
              <pre>{JSON.stringify(content, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
