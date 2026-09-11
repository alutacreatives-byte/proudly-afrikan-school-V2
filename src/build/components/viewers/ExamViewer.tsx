import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Eye, 
  EyeOff, 
  Sparkles, 
  FileText,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { ExamData, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface ExamViewerProps {
  resource: SavedResource;
  onBack: () => void;
  onStartQuiz?: (exam: ExamData) => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ resource, onBack, onStartQuiz }) => {
  const [showMemo, setShowMemo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const exam: ExamData = resource.data;

  const handleCopy = () => {
    let text = `${exam.title}\nSubject: ${exam.subject} | Grade: ${exam.gradeLevel}\nTotal Marks: ${exam.totalMarks} | Duration: ${exam.durationMinutes} mins\n\n`;
    text += `GENERAL INSTRUCTIONS:\n${(exam.generalInstructions || []).map((ins, i) => `${i + 1}. ${ins}`).join('\n')}\n\n`;
    (exam.sections || []).forEach((sec) => {
      text += `=== ${sec.title} (${sec.totalMarks} Marks) ===\n${sec.instructions}\n\n`;
      sec.questions.forEach((q) => {
        text += `Question ${q.questionNumber} [${q.marks} Marks]\n${q.prompt}\n`;
        if (showMemo) {
          text += `Model Answer: ${q.correctAnswer}\nMarking Guidance: ${q.markingGuidance}\n`;
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
            onClick={() => setShowMemo(!showMemo)}
            className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
              showMemo
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
            }`}
          >
            {showMemo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showMemo ? 'Hide Marking Memo' : 'Show Marking Memo'}
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

          {onStartQuiz && (
            <button
              type="button"
              onClick={() => onStartQuiz(exam)}
              className="px-4 py-2 rounded-xl bg-[#D92562] hover:bg-[#c21d53] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Practice in Quiz
            </button>
          )}
        </div>
      </div>

      {/* Main Examination Sheet */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Official Header */}
        <div className="text-center pb-6 border-b-2 border-stone-900 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            PROUDLY AFRIKAN EXAMINATION BOARD • CAPS ALIGNED
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
            {exam.title || resource.title}
          </h1>
          <div className="flex items-center justify-center gap-4 sm:gap-6 font-mono text-xs text-stone-600 font-semibold flex-wrap">
            <span>SUBJECT: {exam.subject || resource.subject}</span>
            <span>•</span>
            <span>GRADE: {exam.gradeLevel || resource.gradeLevel}</span>
            <span>•</span>
            <span>DURATION: {exam.durationMinutes || 60} MINS</span>
            <span>•</span>
            <span className="text-[#E63956] font-bold">TOTAL MARKS: {exam.totalMarks || 50}</span>
          </div>
        </div>

        {/* General Instructions */}
        {exam.generalInstructions && exam.generalInstructions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase text-stone-900 tracking-wider">
              General Examination Instructions:
            </h3>
            <ul className="list-decimal list-inside font-mono text-xs space-y-1 text-stone-700">
              {exam.generalInstructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {(exam.sections || []).map((sec, secIdx) => (
            <div key={sec.id || secIdx} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-stone-900 uppercase">
                    {sec.title}
                  </h2>
                  <p className="font-mono text-xs text-stone-500">{sec.instructions}</p>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-800">
                  [{sec.totalMarks} Marks]
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {(sec.questions || []).map((q, qIdx) => (
                  <div 
                    key={q.id || qIdx} 
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200/80 bg-stone-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                            QUESTION {q.questionNumber || qIdx + 1}
                          </span>
                          {q.questionType && (
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                              {q.questionType}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm text-stone-900 leading-relaxed whitespace-pre-wrap font-medium">
                          {q.prompt}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#E63956] shrink-0">
                        [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                      </span>
                    </div>

                    {/* Multiple Choice Options if applicable */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx}
                            className="p-3 rounded-xl bg-white border border-stone-200 font-mono text-xs text-stone-800"
                          >
                            <span className="font-bold text-[#E63956] mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teacher Marking Memorandum View */}
                    {showMemo && (
                      <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-mono text-xs space-y-2 animate-fade-in">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-amber-800">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Marking Memo & Guidance:
                        </div>
                        <p>
                          <strong className="text-amber-900">Correct Answer: </strong>
                          {q.correctAnswer}
                        </p>
                        {q.markingGuidance && (
                          <p>
                            <strong className="text-amber-900">Rubric Note: </strong>
                            {q.markingGuidance}
                          </p>
                        )}
                        {q.africanContext && (
                          <p className="text-amber-800 italic">
                            Context: {q.africanContext}
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

        {/* Memorandum Notes Footer */}
        {showMemo && exam.memorandumNotes && exam.memorandumNotes.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 font-mono text-xs space-y-2">
            <h4 className="font-bold uppercase text-amber-900 tracking-wider">
              Senior Examiner Moderation Notes:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              {exam.memorandumNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
