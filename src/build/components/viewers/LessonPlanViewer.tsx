import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, Clock, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface LessonPlanViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const LessonPlanViewer: React.FC<LessonPlanViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
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
            PEDAGOGICAL LESSON PLAN • {content.subject || resource.subject}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            {content.title || resource.title}
          </h1>
          <p className="text-xs font-mono text-stone-500">
            Grade Level: {content.gradeLevel || resource.gradeLevel} • Duration: {content.durationMinutes || 60} mins
          </p>
        </div>

        {/* Objectives */}
        {content.objectives && (
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#E63956]" />
              Learning Objectives (Bloom's Taxonomy)
            </h3>
            <ul className="space-y-1.5">
              {Array.isArray(content.objectives) ? (
                content.objectives.map((obj: string, i: number) => (
                  <li key={i} className="text-xs sm:text-sm text-stone-700 font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs sm:text-sm text-stone-700">{content.objectives}</li>
              )}
            </ul>
          </div>
        )}

        {/* Timed Phases */}
        <div className="space-y-6">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-stone-900">
            Timed Lesson Phases
          </h3>
          <div className="space-y-4">
            {content.timedPhases && Array.isArray(content.timedPhases) ? (
              content.timedPhases.map((phase: any, pIdx: number) => (
                <div key={pIdx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-black text-base text-stone-900">
                      {phase.title || `Phase ${pIdx + 1}`}
                    </h4>
                    <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-[#E63956]/10 text-[#E63956] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {phase.durationMinutes || 15} Mins
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-stone-500">Teacher Actions</span>
                      <p className="text-xs sm:text-sm text-stone-800 font-medium">{phase.teacherActions || phase.actions}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-200/80 space-y-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-stone-600">Student Activities</span>
                      <p className="text-xs sm:text-sm text-stone-800 font-medium">{phase.studentActivities || phase.activities}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <pre className="text-xs font-mono">{JSON.stringify(content, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
