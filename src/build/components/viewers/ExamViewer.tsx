import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, ChevronDown, ChevronUp, Award, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface ExamViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [expandedRubrics, setExpandedRubrics] = useState<Record<string, boolean>>({});

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

  const handlePrint = () => {
    window.print();
  };

  const toggleRubric = (qId: string) => {
    setExpandedRubrics(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div id="build-result-top" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in print:p-0">
      {/* Top Action Header */}
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
            onClick={() => setShowAnswerKeys(!showAnswerKeys)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer ${
              showAnswerKeys ? 'bg-[#E63956] text-white' : 'bg-white border border-stone-200 text-stone-800 hover:border-stone-400'
            }`}
          >
            {showAnswerKeys ? 'Hide Answer Key' : 'Show Answer Key & Rubric'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            Print / PDF
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

      {/* Examination Document Card */}
      <div className="card-3d-elevated p-8 sm:p-12 space-y-8 bg-white print:shadow-none print:border-none">
        {/* Institution Header */}
        <div className="text-center border-b-2 border-stone-900 pb-6 space-y-2">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            {content.institutionHeader || 'Proudly Afrikan Examination Board'}
          </p>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            {content.title || resource.title}
          </h1>
          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-mono font-bold text-stone-600">
            <span>SUBJECT: {content.subject || resource.subject}</span>
            <span>•</span>
            <span>GRADE: {content.gradeLevel || resource.gradeLevel}</span>
            <span>•</span>
            <span>DIFFICULTY: {content.difficulty || 'Intermediate'}</span>
          </div>
        </div>

        {/* Exam Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Duration</div>
            <div className="font-display font-black text-lg text-stone-900 flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-[#E63956]" />
              {content.durationMinutes || 60} Minutes
            </div>
          </div>
          <div className="border-x border-stone-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Total Marks</div>
            <div className="font-display font-black text-lg text-stone-900 flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-[#E63956]" />
              {content.totalMarks || 50} Marks
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Questions</div>
            <div className="font-display font-black text-lg text-stone-900 flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-4 h-4 text-[#E63956]" />
              {content.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) || '10'} Items
            </div>
          </div>
          <div className="border-l border-stone-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">Standard</div>
            <div className="font-display font-black text-lg text-[#E63956] mt-0.5">CAPS / IEB</div>
          </div>
        </div>

        {/* General Instructions */}
        {content.generalInstructions && Array.isArray(content.generalInstructions) && (
          <div className="p-6 rounded-2xl bg-stone-100/80 border border-stone-200 space-y-2">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900">
              GENERAL INSTRUCTIONS TO CANDIDATES:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-stone-700 font-medium">
              {content.generalInstructions.map((ins: string, i: number) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections & Questions */}
        <div className="space-y-10">
          {content.sections && Array.isArray(content.sections) ? (
            content.sections.map((section: any, sIdx: number) => (
              <div key={section.id || sIdx} className="space-y-6 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#161616]">
                    {section.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E63956]/10 text-[#E63956]">
                    {section.totalMarks || 'Marks'} Marks
                  </span>
                </div>
                {section.instructions && (
                  <p className="text-xs sm:text-sm font-mono text-stone-600 italic">
                    {section.instructions}
                  </p>
                )}

                <div className="space-y-6">
                  {section.questions && Array.isArray(section.questions) && section.questions.map((q: any, qIdx: number) => {
                    const qKey = `${sIdx}-${qIdx}`;
                    const isRubricOpen = expandedRubrics[qKey];
                    return (
                      <div key={q.id || qIdx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-display font-black text-stone-900 text-sm sm:text-base">
                            Question {q.questionNumber || qIdx + 1}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 font-mono text-xs font-bold text-stone-700">
                            [{q.marks || 2} Marks]
                          </span>
                        </div>

                        <p className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">
                          {q.prompt}
                        </p>

                        {/* Options if MCQ */}
                        {q.options && Array.isArray(q.options) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div
                                key={oIdx}
                                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-800 flex items-center gap-2"
                              >
                                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer Key & Marking Guidance (Toggleable) */}
                        {showAnswerKeys && (
                          <div className="mt-4 pt-4 border-t border-dashed border-stone-200 bg-pink-50/50 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold uppercase text-[#E63956] flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" />
                                Correct Answer: {q.correctAnswer || 'See rubric'}
                              </span>
                              {q.markingGuidance && (
                                <button
                                  onClick={() => toggleRubric(qKey)}
                                  className="text-xs font-mono font-bold text-stone-700 hover:text-[#E63956] flex items-center gap-1 cursor-pointer"
                                >
                                  {isRubricOpen ? 'Hide Rubric' : 'View Rubric'}
                                  {isRubricOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                            {q.markingGuidance && isRubricOpen && (
                              <p className="text-xs text-stone-700 font-mono leading-relaxed pt-2 border-t border-pink-200">
                                <strong className="text-stone-900">Marking Guidance:</strong> {q.markingGuidance}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
