import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, GraduationCap, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface CourseViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

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

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
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
        <div className="border-b-2 border-stone-900 pb-6 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956]">
            ACADEMIC COURSE SYLLABUS • {content.subject || resource.subject}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            {content.title || resource.title}
          </h1>
          {content.overview && (
            <p className="text-sm text-stone-700 font-normal pt-2 leading-relaxed">
              {content.overview}
            </p>
          )}
        </div>

        {/* Modules */}
        <div className="space-y-6">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-stone-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#E63956]" />
            Course Modules & Weekly Syllabus
          </h3>
          <div className="space-y-4">
            {content.modules && Array.isArray(content.modules) ? (
              content.modules.map((mod: any, mIdx: number) => {
                const isOpen = expandedModules[mIdx];
                return (
                  <div key={mIdx} className="rounded-2xl bg-white border border-stone-200 shadow-xs overflow-hidden">
                    <button
                      onClick={() => toggleModule(mIdx)}
                      className="w-full text-left p-6 flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-[#18181B] text-[#E63956] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {mIdx + 1}
                        </span>
                        <div>
                          <h4 className="font-display font-black text-base text-stone-900">
                            {mod.title || `Module ${mIdx + 1}`}
                          </h4>
                          <p className="text-xs text-stone-500 font-mono">
                            {mod.summary || mod.description || 'Module overview'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-6 border-t border-stone-100 space-y-4 text-xs sm:text-sm text-stone-700 font-medium">
                        {mod.keyTopics && Array.isArray(mod.keyTopics) && (
                          <div className="space-y-2">
                            <span className="font-mono text-xs font-bold uppercase text-[#E63956]">Key Topics:</span>
                            <ul className="list-disc list-inside space-y-1">
                              {mod.keyTopics.map((t: string, tIdx: number) => (
                                <li key={tIdx}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {mod.activities && (
                          <div className="p-4 rounded-xl bg-pink-50/40 border border-pink-200/60">
                            <span className="font-mono text-xs font-bold uppercase text-stone-800">Learning Activities:</span>
                            <p className="mt-1 text-stone-700">{mod.activities}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <pre className="text-xs font-mono">{JSON.stringify(content, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
