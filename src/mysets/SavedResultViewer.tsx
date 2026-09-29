import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Award, 
  Tag, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  ExternalLink,
  Search,
  Eye,
  RotateCcw,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  Presentation as PresentationIcon,
  MessageSquare
} from 'lucide-react';
import { UnifiedItem } from './MySetsWorkspace';
import { exportUnifiedItem, getCleanWorksheetTitle, downloadPresentationHtml } from '../utils/exportUtils';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';

interface SavedResultViewerProps {
  item: UnifiedItem;
  onClose: () => void;
  onOpenInWorkbench?: () => void;
  onLaunchPractice?: (mode: 'study' | 'flashcards' | 'practice') => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const SavedResultViewer: React.FC<SavedResultViewerProps> = ({
  item,
  onClose,
  onOpenInWorkbench,
  onLaunchPractice,
  onBack,
  onGoHome,
}) => {
  const [showMarkingGuide, setShowMarkingGuide] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Extract underlying data
  const studySet = item.originalStudySet;
  const quiz = item.originalQuiz;
  const buildRes = item.originalBuildResource;
  const anyData = (buildRes as any)?.data || buildRes || {};

  // Extract specialized tool types
  const toolType = buildRes?.toolType || (studySet ? 'study-set' : quiz ? 'quiz' : 'custom');

  // Handle Copy full text representation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div 
        className="relative w-full max-w-5xl h-[92vh] max-h-[92vh] bg-[#FAF7F0] border border-[#E3D9C9] rounded-[24px] sm:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Global Navigation */}
        <div className="bg-white border-b border-[#EAE3D6] px-4 sm:px-8 py-4 flex flex-col gap-3 shrink-0">
          {/* Top Row: Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <GlobalNavigationButtons
              onBack={onBack || onClose}
              onGoHome={onGoHome}
              backLabel="Back"
              homeLabel="Home"
            />

            {/* Top Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportUnifiedItem(item, 'doc')}
                className="px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download Word Document (.doc)"
              >
                <Download className="w-3.5 h-3.5 text-[#E52E5E]" />
                <span className="hidden sm:inline">DOC</span>
              </button>

              <button
                onClick={() => exportUnifiedItem(item, 'pdf')}
                className="px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download PDF Document (.pdf)"
              >
                <Download className="w-3.5 h-3.5 text-[#E52E5E]" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {onOpenInWorkbench && (
                <button
                  onClick={onOpenInWorkbench}
                  className="px-3.5 py-1.5 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Open in tool generator"
                >
                  <span>WORKBENCH</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#E52E5E]" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer ml-1"
                title="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Icon, Metadata & Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E02D68] to-[#C92255] text-white flex items-center justify-center shadow-sm shrink-0">
              {studySet ? <BookOpen className="w-5 h-5" /> : quiz ? <GraduationCap className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFF0F3] text-[#E52E5E] border border-[#FFCCD4]">
                  {item.kindLabel}
                </span>
                <span className="text-xs font-mono font-semibold text-stone-500 uppercase">
                  {item.categoryOrSubject}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-mono text-stone-500">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h2 className="font-display font-black text-sm sm:text-base lg:text-xl text-[#161616] uppercase break-words mt-0.5 max-w-full">
                {item.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-8 overflow-y-auto no-scrollbar space-y-6 flex-1">
          
          {/* 1. STUDY SET VIEWER */}
          {studySet && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#DA8F00] uppercase tracking-wider">
                      ACTIVE CURRICULUM MODULE • {studySet.concepts?.length || 0} CONCEPTS
                    </span>
                    <h3 className="font-display font-black text-2xl uppercase text-[#161616] mt-1">
                      {studySet.title}
                    </h3>
                    <p className="text-sm font-sans text-stone-600 mt-1 max-w-2xl leading-relaxed">
                      {studySet.description}
                    </p>
                  </div>

                  {onLaunchPractice && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => onLaunchPractice('study')}
                        className="px-4 py-2.5 bg-[#DA8F00] hover:bg-[#c02479] text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>LEARN</span>
                      </button>
                      <button
                        onClick={() => onLaunchPractice('flashcards')}
                        className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-pink-50 text-stone-800 font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#DA8F00]" />
                        <span>FLASHCARDS</span>
                      </button>
                      <button
                        onClick={() => onLaunchPractice('practice')}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#DA8F00]" />
                        <span>PRACTICE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Concepts List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                    LEARNING CONCEPTS & DEFINITIONS ({studySet.concepts?.length || 0})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(studySet.concepts || []).map((concept, idx) => (
                    <div 
                      key={concept.id || idx}
                      className="bg-white border border-[#EAE3D6] rounded-2xl p-5 shadow-xs hover:border-[#DA8F00]/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF7F0] border border-[#EAE3D6] text-stone-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="font-display font-black text-base uppercase text-[#161616] flex-1">
                          {concept.title}
                        </h5>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pl-8">
                        {concept.explanation}
                      </p>

                      {concept.whyItMatters && (
                        <div className="pl-8 pt-1 text-xs text-stone-500 font-sans italic border-t border-stone-100 mt-2">
                          <span className="font-mono font-bold text-stone-700 not-italic uppercase text-[10px]">Context: </span>
                          {concept.whyItMatters}
                        </div>
                      )}

                      {concept.keyFacts && concept.keyFacts.length > 0 && (
                        <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                          {concept.keyFacts.map((ex, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#FAF7F0] text-stone-600 text-[11px] rounded-md font-mono">
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. QUIZ VIEWER */}
          {quiz && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#E05A2B] uppercase tracking-wider">
                    INTERACTIVE QUIZ ASSESSMENT • {quiz.questions?.length || 0} QUESTIONS
                  </span>
                  <h3 className="font-display font-black text-2xl uppercase text-[#161616] mt-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm font-sans text-stone-600 mt-1 max-w-xl">
                    {quiz.description || `Assessment on ${quiz.topicOrSource || 'curriculum topic'}.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowQuizResults(!showQuizResults)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs font-bold uppercase rounded-full transition-colors cursor-pointer"
                  >
                    {showQuizResults ? 'HIDE ANSWERS' : 'SHOW ALL ANSWERS'}
                  </button>
                  {onOpenInWorkbench && (
                    <button
                      onClick={onOpenInWorkbench}
                      className="px-5 py-2.5 bg-[#E05A2B] hover:bg-[#d04e20] text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs cursor-pointer"
                    >
                      TAKE IN QUIZ SUITE
                    </button>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(quiz.questions || []).map((q, qIdx) => {
                  const selected = userAnswers[qIdx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = Number(selected) === Number(q.correctAnswer);

                  return (
                    <div 
                      key={q.id || qIdx}
                      className="bg-white border border-[#EAE3D6] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 text-[#E05A2B] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            Q{qIdx + 1}
                          </span>
                          <h4 className="font-sans font-bold text-base text-[#161616]">
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-9">
                        {(q.options || []).map((opt, optIdx) => {
                          const isOptionCorrect = Number(optIdx) === Number(q.correctAnswer);
                          const isOptionSelected = selected === optIdx;

                          let btnStyle = "bg-[#FAF7F0] border-stone-200 text-stone-800 hover:border-orange-300";
                          if (showQuizResults || hasAnswered) {
                            if (isOptionCorrect) {
                              btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                            } else if (isOptionSelected) {
                              btnStyle = "bg-red-50 border-red-300 text-red-800";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                              }}
                              className={`px-4 py-3 rounded-xl border text-left text-xs sm:text-sm font-sans flex items-start gap-2.5 transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-white/80 border border-stone-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {(showQuizResults || hasAnswered) && isOptionCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {(showQuizResults || hasAnswered) && q.explanation && (
                        <div className="sm:ml-9 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-stone-700 font-sans">
                          <span className="font-mono font-bold text-amber-900 uppercase">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. EXAM PAPER VIEWER */}
          {toolType === 'exam' && (
            <div className="space-y-6">
              {/* Institution & Exam Header */}
              <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-3">
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">
                  {anyData.institutionHeader || 'PROUDLY AFRIKAN EXAMINATION BOARD'}
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {anyData.title || item.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold text-stone-700 pt-1">
                  <span>SUBJECT: {anyData.subject || item.categoryOrSubject}</span>
                  <span>•</span>
                  <span>GRADE: {anyData.gradeLevel || 'Secondary'}</span>
                  <span>•</span>
                  <span>DURATION: {anyData.durationMinutes || 60} MINS</span>
                  <span>•</span>
                  <span>TOTAL MARKS: {anyData.totalMarks || 50}</span>
                </div>
                {anyData.instructions && (
                  <p className="text-xs font-sans text-stone-600 italic border-t border-stone-200 pt-3 max-w-xl mx-auto">
                    {Array.isArray(anyData.instructions) ? anyData.instructions.join(' • ') : anyData.instructions}
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setShowMarkingGuide(!showMarkingGuide)}
                    className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                      showMarkingGuide
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    {showMarkingGuide ? '✓ Marking Scheme Revealed' : 'Reveal Marking Scheme'}
                  </button>
                </div>
              </div>

              {/* Exam Sections */}
              <div className="space-y-6">
                {(anyData.sections || []).map((section: any, sIdx: number) => (
                  <div key={sIdx} className="bg-white border border-[#EAE3D6] rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h4 className="font-display font-black text-lg uppercase text-[#161616]">
                          {section.name}
                        </h4>
                        {section.instructions && (
                          <p className="text-xs font-sans text-stone-500">{section.instructions}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-stone-100 rounded-full font-mono text-xs font-bold text-stone-700">
                        {section.totalMarks} Marks
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(section.questions || []).map((q: any, qIdx: number) => (
                        <div key={qIdx} className="space-y-2 border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-mono text-xs font-bold text-stone-400">
                              Question {q.questionNumber || qIdx + 1}
                            </span>
                            <span className="font-mono text-xs font-bold text-stone-600">
                              [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                            </span>
                          </div>

                          <p className="font-sans font-medium text-sm text-stone-900 leading-relaxed">
                            {q.questionText}
                          </p>

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="px-3 py-2 bg-[#FAF7F0] rounded-xl text-xs font-sans text-stone-700 flex items-center gap-2">
                                  <span className="font-mono font-bold text-stone-500">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {showMarkingGuide && (q.correctAnswer || q.explanation) && (
                            <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-sans space-y-1">
                              {q.correctAnswer && (
                                <div><span className="font-mono font-bold uppercase">Answer:</span> {q.correctAnswer}</div>
                              )}
                              {q.explanation && (
                                <div><span className="font-mono font-bold uppercase">Marking notes:</span> {q.explanation}</div>
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
          )}

          {/* 4. WORKSHEET VIEWER */}
          {toolType === 'worksheet' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-stone-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-200 pb-4">
                  <div>
                    <span className="text-[18px] font-mono font-bold text-[#E63956] uppercase block">STUDENT CLASSROOM WORKSHEET</span>
                    <h3 className="font-display font-black text-[26px] sm:text-[32px] uppercase text-[#161616] mt-1">
                      {getCleanWorksheetTitle(anyData.title || item.title, anyData.topic || item.originalBuildResource?.topic, anyData.subject || item.categoryOrSubject)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[18px] font-bold text-stone-700">
                    <span>Grade: {anyData.gradeLevel || 'Standard'}</span>
                    <span>•</span>
                    <span>Score: {anyData.totalMarks ? `Total ${anyData.totalMarks} Marks` : '100 Marks'}</span>
                  </div>
                </div>

                {anyData.description && (
                  <p className="text-[18px] font-bold text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-2xl border-2 border-stone-200">
                    {anyData.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF7F0] p-4 rounded-2xl text-[18px] font-mono font-bold text-stone-800 border-2 border-stone-200">
                  <div>Name: __________________</div>
                  <div>Date: __________________</div>
                  <div>Class: _________________</div>
                  <div>Score: _____ / {anyData.totalMarks || 100}</div>
                </div>

                {anyData.instructions && (
                  <div className="text-[18px] font-sans font-bold text-amber-950 bg-amber-50/90 p-5 rounded-2xl border-2 border-amber-300">
                    <span className="font-mono font-black uppercase text-amber-900 block mb-1.5 text-[18px]">General Instructions:</span>
                    {anyData.instructions}
                  </div>
                )}
              </div>

              {/* Activities or Exercises */}
              <div className="space-y-6">
                {(anyData.activities || anyData.exercises || []).map((act: any, aIdx: number) => (
                  <div key={aIdx} className="bg-white border-2 border-stone-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="border-b-2 border-stone-200 pb-3">
                      <h4 className="font-display font-black text-[22px] sm:text-[24px] uppercase text-[#161616]">
                        {act.title || act.sectionTitle || `Activity ${aIdx + 1}`}
                      </h4>
                      {act.instructions && (
                        <p className="text-[18px] font-bold text-stone-700 mt-1">
                          {act.instructions}
                        </p>
                      )}
                    </div>

                    {Array.isArray(act.wordBank) && act.wordBank.length > 0 && (
                      <div className="p-4 bg-indigo-50/90 border-2 border-indigo-200 rounded-2xl space-y-2">
                        <span className="text-[18px] font-black uppercase text-indigo-950 block">Word Bank:</span>
                        <div className="flex flex-wrap gap-2">
                          {act.wordBank.map((word: string, wIdx: number) => (
                            <span key={wIdx} className="px-3.5 py-1.5 bg-white border-2 border-indigo-200 rounded-xl font-bold text-[18px] text-indigo-950 shadow-xs">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {act.scenario && (
                      <div className="p-5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl space-y-1">
                        <span className="text-[18px] font-black uppercase text-amber-950 block">Practical Scenario:</span>
                        <p className="text-[18px] font-bold text-stone-900 leading-relaxed">{act.scenario}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {(act.items || act.questions || []).map((itemObj: any, iIdx: number) => (
                        <div key={iIdx} className="p-4 bg-[#FAF7F0] rounded-2xl space-y-3 border-2 border-stone-200/80">
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-[19px] font-black text-[#E63956] shrink-0">
                              {itemObj.itemNumber || itemObj.number || iIdx + 1}.
                            </span>
                            <div className="space-y-2 w-full">
                              <span className="font-sans text-[19px] text-stone-900 font-black block leading-snug">
                                {itemObj.prompt}
                              </span>
                              {itemObj.matchTarget && (
                                <div className="p-3 bg-white rounded-xl border border-stone-200 text-[18px] font-bold text-stone-800">
                                  {itemObj.matchTarget}
                                </div>
                              )}
                              {itemObj.completionSpace && (
                                <div className="text-[18px] font-mono font-bold text-stone-600 bg-white/80 p-3 rounded-xl border border-dashed border-stone-300 whitespace-pre-line">
                                  {itemObj.completionSpace}
                                </div>
                              )}
                            </div>
                          </div>
                          {(itemObj.answer || itemObj.explanation) && (
                            <div className="text-[18px] font-mono font-bold text-emerald-900 bg-emerald-50 p-3.5 rounded-xl border-2 border-emerald-300">
                              <span className="font-black uppercase">Answer Key: </span>
                              {itemObj.answer || itemObj.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Teacher Solutions / Answer Key */}
                {Array.isArray(anyData.teacherAnswerKey) && anyData.teacherAnswerKey.length > 0 && (
                  <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h4 className="font-display font-black text-[22px] uppercase text-emerald-950 border-b-2 border-emerald-200 pb-2">
                      Teacher Solutions & Answer Key
                    </h4>
                    <div className="space-y-4">
                      {anyData.teacherAnswerKey.map((keySec: any, kIdx: number) => (
                        <div key={kIdx} className="space-y-2">
                          <h5 className="font-sans font-black text-[19px] text-emerald-900">
                            {keySec.activityTitle}
                          </h5>
                          <ul className="list-disc pl-6 space-y-1 text-[18px] font-bold text-emerald-950">
                            {(keySec.answers || []).map((ans: string, aKeyIdx: number) => (
                              <li key={aKeyIdx}>{ans}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. MIND MAP VIEWER */}
          {toolType === 'mind-map' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 shadow-xs">
                <span className="text-xs font-mono font-bold text-[#DA8F00] uppercase">VISUAL CONCEPT HIERARCHY</span>
                <h3 className="font-display font-black text-2xl uppercase text-[#161616] mt-1">
                  {anyData.rootNode?.title || anyData.topic || item.title}
                </h3>
                {anyData.rootNode?.notes && (
                  <p className="text-sm font-sans text-stone-600 mt-2">{anyData.rootNode.notes}</p>
                )}
              </div>

              {/* Interactive Tree View */}
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-center">
                  <div className="px-6 py-3 bg-gradient-to-r from-[#E02D68] to-[#C92255] text-white rounded-2xl font-display font-black text-lg uppercase shadow-md text-center max-w-md">
                    {anyData.rootNode?.title || item.title}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {(anyData.rootNode?.children || []).map((branch: any, bIdx: number) => (
                    <div key={bIdx} className="bg-[#FAF7F0] border border-[#EAE3D6] rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#DA8F00]"></span>
                        <h5 className="font-display font-black text-sm uppercase text-[#161616]">
                          {branch.title}
                        </h5>
                      </div>

                      {branch.notes && (
                        <p className="text-xs font-sans text-stone-600 leading-relaxed">
                          {branch.notes}
                        </p>
                      )}

                      {branch.children && branch.children.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-stone-200">
                          {branch.children.map((sub: any, sIdx: number) => (
                            <div key={sIdx} className="p-2 bg-white rounded-xl text-xs font-sans text-stone-800 border border-stone-200">
                              <span className="font-bold text-[#161616] block">{sub.title}</span>
                              {sub.notes && <span className="text-[11px] text-stone-500 block mt-0.5">{sub.notes}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. LESSON PLAN VIEWER */}
          {toolType === 'lesson-plan' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-[#161616] uppercase tracking-wider">
                  PEDAGOGICAL LESSON PLAN • {anyData.durationMinutes || 60} MINUTES
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#161616]">
                  {anyData.title || item.title}
                </h3>
                <div className="flex items-center gap-3 font-mono text-xs text-stone-600">
                  <span>Subject: {anyData.subject || item.categoryOrSubject}</span>
                  <span>•</span>
                  <span>Grade: {anyData.gradeLevel || 'Standard'}</span>
                </div>

                {anyData.objectives && anyData.objectives.length > 0 && (
                  <div className="pt-3 border-t border-stone-100">
                    <span className="font-mono text-xs font-bold uppercase text-stone-500 block mb-1.5">
                      Learning Objectives:
                    </span>
                    <ul className="space-y-1 text-xs sm:text-sm font-sans text-stone-700 list-disc list-inside">
                      {anyData.objectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Phases */}
              <div className="space-y-4">
                {(anyData.phases || []).map((phase: any, pIdx: number) => (
                  <div key={pIdx} className="bg-white border border-[#EAE3D6] rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <h4 className="font-display font-black text-base uppercase text-[#161616]">
                        Phase {pIdx + 1}: {phase.phase}
                      </h4>
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full font-mono text-xs font-bold">
                        {phase.durationMinutes} mins
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-sans">
                      <div className="p-3.5 bg-[#FAF7F0] rounded-xl space-y-1">
                        <span className="font-mono font-bold text-stone-700 uppercase text-[11px] block">
                          Teacher Activity:
                        </span>
                        <p className="text-stone-800 leading-relaxed">{phase.teacherActivity}</p>
                      </div>

                      <div className="p-3.5 bg-[#FAF7F0] rounded-xl space-y-1">
                        <span className="font-mono font-bold text-stone-700 uppercase text-[11px] block">
                          Student Activity:
                        </span>
                        <p className="text-stone-800 leading-relaxed">{phase.studentActivity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(anyData.assessmentStrategy || anyData.homework) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {anyData.assessmentStrategy && (
                    <div className="bg-white border border-[#EAE3D6] rounded-2xl p-5 shadow-xs space-y-1">
                      <span className="font-mono font-bold text-xs uppercase text-stone-600 block">Assessment Strategy:</span>
                      <p className="text-xs sm:text-sm font-sans text-stone-800">{anyData.assessmentStrategy}</p>
                    </div>
                  )}
                  {anyData.homework && (
                    <div className="bg-white border border-[#EAE3D6] rounded-2xl p-5 shadow-xs space-y-1">
                      <span className="font-mono font-bold text-xs uppercase text-stone-600 block">Homework Assignment:</span>
                      <p className="text-xs sm:text-sm font-sans text-stone-800">{anyData.homework}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 7. SLIDE DECK VIEWER */}
          {toolType === 'presentation' && (() => {
            const itemAny = item as any;
            const rawSlides = Array.isArray(anyData.slides) && anyData.slides.length > 0
              ? anyData.slides
              : (Array.isArray(itemAny.slides) && itemAny.slides.length > 0)
                ? itemAny.slides
                : (Array.isArray(anyData.sections) && anyData.sections.length > 0)
                  ? anyData.sections.map((sec: any, idx: number) => ({
                      id: `s-${idx + 1}`,
                      slideNumber: idx + 1,
                      slideType: 'concept',
                      title: sec.heading || `Slide ${idx + 1}`,
                      subtitle: '',
                      bulletPoints: typeof sec.content === 'string' ? sec.content.split('\n').filter(Boolean) : [],
                      speakerNotes: 'Key lecture points for this topic.',
                    }))
                  : [];

            if (!rawSlides || rawSlides.length === 0) {
              return (
                <div className="bg-white border border-[#EAE3D6] rounded-3xl p-8 text-center space-y-3">
                  <PresentationIcon className="w-12 h-12 text-[#FF7A00] mx-auto opacity-70" />
                  <h4 className="font-display font-black text-xl text-stone-800">NO SLIDES FOUND IN THIS RESOURCE</h4>
                  <p className="text-sm text-stone-600 max-w-md mx-auto">This resource does not contain slide content. You can generate a fresh presentation deck using the Presentation Generator.</p>
                </div>
              );
            }

            const currentSlide = rawSlides[activeSlideIndex] || rawSlides[0];
            const currentBullets = currentSlide.bulletPoints || currentSlide.bullets || [];
            const visualCue = currentSlide.suggestedVisualOrDiagram || currentSlide.visualCue;
            const discussionPrompt = currentSlide.discussionOrEngagementPrompt;
            const themeMood = anyData.themeOrColorMood || anyData.presentationStyle || 'Educational Deck';

            return (
              <div className="space-y-6">
                {/* Presentation Subheader & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider">
                      {rawSlides.length} SLIDES &bull; {themeMood}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSpeakerNotes(prev => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        showSpeakerNotes ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{showSpeakerNotes ? 'HIDE NOTES' : 'SHOW NOTES'}</span>
                    </button>

                    <button
                      onClick={() => downloadPresentationHtml(item)}
                      className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download interactive HTML slides file to present offline"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>HTML SLIDES</span>
                    </button>

                    <button
                      onClick={() => setIsFullscreenPresentation(true)}
                      className="px-4 py-1.5 bg-gradient-to-r from-[#FF7A00] to-[#D48800] hover:brightness-105 text-white rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>PRESENT FULLSCREEN</span>
                    </button>
                  </div>
                </div>

                {/* Active Slide Canvas */}
                <div className="bg-[#18181B] text-white border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-3 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold text-[10px] tracking-wider uppercase">
                          {currentSlide.slideType || 'SLIDE'} {activeSlideIndex + 1} OF {rawSlides.length}
                        </span>
                      </div>
                      <span className="uppercase text-stone-400 font-bold truncate max-w-xs">{anyData.title || item.title}</span>
                    </div>

                    <div>
                      <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-white leading-tight">
                        {currentSlide.title}
                      </h3>
                      {currentSlide.subtitle && (
                        <p className="text-sm sm:text-base font-sans text-stone-400 mt-2 font-medium">
                          {currentSlide.subtitle}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 pt-2 text-sm sm:text-base font-sans text-stone-200 max-w-3xl">
                      {currentBullets.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 leading-relaxed">
                          <span className="text-[#FF7A00] font-bold text-base shrink-0 mt-0.5">❖</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Visual Cue & Discussion Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      {visualCue && (
                        <div className="bg-stone-900/90 border-l-4 border-[#10B981] p-3 rounded-r-xl text-xs space-y-1">
                          <span className="font-mono font-bold text-[#10B981] uppercase tracking-wider block text-[10px]">
                            SUGGESTED VISUAL / DIAGRAM
                          </span>
                          <p className="text-stone-300 leading-snug">{visualCue}</p>
                        </div>
                      )}

                      {discussionPrompt && (
                        <div className="bg-stone-900/90 border-l-4 border-[#38BDF8] p-3 rounded-r-xl text-xs space-y-1">
                          <span className="font-mono font-bold text-[#38BDF8] uppercase tracking-wider block text-[10px]">
                            DISCUSSION & ENGAGEMENT PROMPT
                          </span>
                          <p className="text-stone-300 leading-snug">{discussionPrompt}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Speaker Notes */}
                  {showSpeakerNotes && currentSlide.speakerNotes && (
                    <div className="mt-4 pt-3.5 border-t border-stone-800 text-xs font-mono text-stone-300 bg-stone-950/80 p-3.5 rounded-xl relative z-10 border border-stone-800/80">
                      <span className="font-bold text-[#FF7A00] uppercase tracking-wider">SPEAKER NOTES: </span>
                      <span className="text-stone-400 font-sans">{currentSlide.speakerNotes}</span>
                    </div>
                  )}
                </div>

                {/* Slide Thumbnail Tabs / Quick Jump */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {rawSlides.map((s: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`shrink-0 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                        idx === activeSlideIndex
                          ? 'bg-[#FF7A00] text-black border-[#FF7A00] font-bold shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border-[#EAE3D6]'
                      }`}
                    >
                      <div className="text-[10px] font-mono opacity-80 uppercase">SLIDE {idx + 1}</div>
                      <div className="text-xs font-display font-bold truncate max-w-[130px]">{s.title || `Slide ${idx + 1}`}</div>
                    </button>
                  ))}
                </div>

                {/* Slide Carousel Controls */}
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAE3D6]">
                  <button
                    onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeSlideIndex === 0}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> PREVIOUS SLIDE
                  </button>

                  <span className="text-xs font-mono font-bold text-stone-600">
                    Slide {activeSlideIndex + 1} of {rawSlides.length}
                  </span>

                  <button
                    onClick={() => setActiveSlideIndex(prev => Math.min(rawSlides.length - 1, prev + 1))}
                    disabled={activeSlideIndex === rawSlides.length - 1}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    NEXT SLIDE <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Fullscreen Presenter Mode Modal */}
                {isFullscreenPresentation && (
                  <div className="fixed inset-0 z-50 bg-[#121214] text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
                    {/* Top bar */}
                    <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#FF7A00] text-black font-bold text-xs uppercase font-mono">
                          SLIDE {activeSlideIndex + 1} / {rawSlides.length}
                        </span>
                        <span className="text-sm font-display font-bold text-stone-300 uppercase tracking-wide">
                          {currentSlide.slideType || 'SLIDE'}: {currentSlide.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowSpeakerNotes(p => !p)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer"
                        >
                          {showSpeakerNotes ? 'HIDE NOTES [N]' : 'SHOW NOTES [N]'}
                        </button>
                        <button
                          onClick={() => setIsFullscreenPresentation(false)}
                          className="p-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg cursor-pointer"
                          title="Exit Fullscreen (ESC)"
                        >
                          <Minimize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Giant Slide Content */}
                    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-8 space-y-8">
                      <div>
                        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
                          {currentSlide.title}
                        </h2>
                        {currentSlide.subtitle && (
                          <h4 className="text-lg sm:text-2xl text-stone-400 font-sans mt-3">
                            {currentSlide.subtitle}
                          </h4>
                        )}
                      </div>

                      <ul className="space-y-4 text-lg sm:text-2xl font-sans text-stone-200 max-w-4xl">
                        {currentBullets.map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-4 leading-relaxed">
                            <span className="text-[#FF7A00] font-bold text-2xl shrink-0">❖</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {showSpeakerNotes && currentSlide.speakerNotes && (
                        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl text-sm font-sans text-stone-300">
                          <strong className="text-[#FF7A00] font-mono uppercase text-xs block mb-1">Speaker Notes:</strong>
                          {currentSlide.speakerNotes}
                        </div>
                      )}
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeSlideIndex === 0}
                        className="px-6 py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl text-sm font-bold uppercase cursor-pointer"
                      >
                        &larr; PREVIOUS
                      </button>

                      <div className="flex items-center gap-1.5">
                        {rawSlides.map((_: any, i: number) => (
                          <span
                            key={i}
                            onClick={() => setActiveSlideIndex(i)}
                            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                              i === activeSlideIndex ? 'bg-[#FF7A00] scale-125' : 'bg-stone-700 hover:bg-stone-500'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.min(rawSlides.length - 1, prev + 1))}
                        disabled={activeSlideIndex === rawSlides.length - 1}
                        className="px-6 py-3 bg-[#FF7A00] hover:brightness-105 text-black font-black uppercase rounded-xl text-sm cursor-pointer"
                      >
                        NEXT &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 8. COURSE & LEARNING PATH VIEWER */}
          {(toolType === 'course' || toolType === 'course-builder') && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-[#E6425E] uppercase">CURRICULUM SYLLABUS</span>
                <h3 className="font-display font-black text-2xl uppercase text-[#161616]">
                  {anyData.title || item.title}
                </h3>
                <p className="text-sm font-sans text-stone-600">{anyData.overview || item.description}</p>
              </div>

              <div className="space-y-4">
                {(anyData.modules || []).map((mod: any, mIdx: number) => (
                  <div key={mIdx} className="bg-white border border-[#EAE3D6] rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h4 className="font-display font-black text-base uppercase text-[#161616]">
                        Module {mod.moduleNumber || mIdx + 1}: {mod.title}
                      </h4>
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full font-mono text-xs">
                        {mod.duration}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(mod.lessons || []).map((les: any, lIdx: number) => (
                        <div key={lIdx} className="p-3 bg-[#FAF7F0] rounded-xl flex items-start justify-between gap-3 text-xs font-sans">
                          <div>
                            <span className="font-bold text-stone-900">{les.title}</span>
                            <span className="block text-stone-600 mt-0.5">{les.keyTakeaway}</span>
                          </div>
                          <span className="font-mono text-stone-400 shrink-0">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. SEARCH RESULT / RESEARCH NOTE VIEWER */}
          {(toolType === 'search-result' || toolType === 'study-guide' || (!studySet && !quiz && !['exam', 'worksheet', 'mind-map', 'lesson-plan', 'presentation', 'course', 'course-builder'].includes(toolType))) && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>SAVED ARCHIVE RESULT</span>
                  </span>
                  <span className="text-xs font-mono text-stone-500 uppercase">
                    {item.categoryOrSubject}
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#161616]">
                  {anyData.title || item.title}
                </h3>

                <p className="text-sm font-sans text-stone-700 leading-relaxed bg-[#FAF7F0] p-4 rounded-2xl border border-[#EAE3D6]">
                  {anyData.summary || anyData.executiveSummary || item.description}
                </p>

                {anyData.keyPoints && anyData.keyPoints.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="font-mono text-xs font-bold uppercase text-stone-500 block">
                      Key Takeaways & Core Concepts:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {anyData.keyPoints.map((pt: string, idx: number) => (
                        <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl text-xs font-sans text-stone-800 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#DA8F00] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {anyData.sections && anyData.sections.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    {anyData.sections.map((sec: any, sIdx: number) => (
                      <div key={sIdx} className="space-y-2">
                        <h4 className="font-display font-black text-base uppercase text-[#161616]">
                          {sec.title}
                        </h4>
                        <p className="text-xs sm:text-sm font-sans text-stone-700 leading-relaxed whitespace-pre-line">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
