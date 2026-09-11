import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { WorksheetData, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface WorksheetViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const WorksheetViewer: React.FC<WorksheetViewerProps> = ({ resource, onBack }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const ws: WorksheetData = resource.data;

  const handleCopy = () => {
    let text = `${ws.title}\nSubject: ${ws.subject} | Grade: ${ws.gradeLevel}\n\nInstructions: ${ws.instructions}\n\n`;
    (ws.sections || []).forEach((sec) => {
      text += `=== ${sec.title} ===\n${sec.instructions}\n\n`;
      sec.questions.forEach((q) => {
        text += `Q${q.questionNumber}: ${q.prompt}\n`;
        if (q.matchingPairs) {
          q.matchingPairs.forEach((p) => {
            text += `  • ${p.left}  <-->  ${p.right}\n`;
          });
        }
        if (showAnswers) {
          text += `Answer: ${q.correctAnswer}\nExplanation: ${q.explanation}\n`;
        }
        text += '\n';
      });
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Action Header */}
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
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAnswers
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
            }`}
          >
            {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
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

      {/* Main Worksheet Sheet */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="pb-6 border-b border-stone-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
              PRACTICE WORKSHEET • CAPS ALIGNED
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. Time: {ws.estimatedTimeMinutes || 45} mins</span>
            </div>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
            {ws.title || resource.title}
          </h1>

          <div className="flex items-center gap-4 font-mono text-xs text-stone-600 font-semibold flex-wrap">
            <span>SUBJECT: {ws.subject || resource.subject}</span>
            <span>•</span>
            <span>GRADE: {ws.gradeLevel || resource.gradeLevel}</span>
          </div>

          {ws.instructions && (
            <p className="font-mono text-xs text-stone-600 pt-2 border-t border-stone-100 italic">
              Instructions: {ws.instructions}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {(ws.sections || []).map((sec, sIdx) => (
            <div key={sec.id || sIdx} className="space-y-4">
              <div className="pb-2 border-b border-stone-200">
                <h2 className="font-display font-black text-lg sm:text-xl text-stone-900 uppercase">
                  {sec.title}
                </h2>
                <p className="font-mono text-xs text-stone-500 mt-0.5">{sec.instructions}</p>
              </div>

              <div className="space-y-5">
                {(sec.questions || []).map((q, qIdx) => (
                  <div 
                    key={q.id || qIdx}
                    className="p-5 rounded-2xl border border-stone-200/90 bg-stone-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          EXERCISE {q.questionNumber || qIdx + 1}
                        </span>
                        <p className="font-mono text-sm text-stone-900 font-medium whitespace-pre-wrap">
                          {q.prompt}
                        </p>
                      </div>
                      {q.marks && (
                        <span className="font-mono text-xs font-bold text-[#E63956]">
                          [{q.marks} Marks]
                        </span>
                      )}
                    </div>

                    {/* Matching Exercise */}
                    {q.matchingPairs && q.matchingPairs.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 font-mono text-xs">
                        <div className="grid grid-cols-2 gap-4 pb-2 border-b border-stone-100 font-bold text-stone-500 uppercase text-[11px]">
                          <div>Column A (Concepts)</div>
                          <div>Column B (Definitions / Roles)</div>
                        </div>
                        {q.matchingPairs.map((pair, pIdx) => (
                          <div key={pIdx} className="grid grid-cols-2 gap-4 py-1 text-stone-800">
                            <div className="font-semibold">{pair.left}</div>
                            <div className="text-stone-600">{pair.right}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Key */}
                    {showAnswers && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-xs space-y-1.5 animate-fade-in">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Solution & Rationale:
                        </div>
                        <p>
                          <strong className="text-emerald-900">Answer: </strong>
                          {q.correctAnswer}
                        </p>
                        {q.explanation && (
                          <p className="text-emerald-800">
                            <strong className="text-emerald-900">Explanation: </strong>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
