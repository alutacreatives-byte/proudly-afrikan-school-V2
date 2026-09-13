import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
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
  Download
} from 'lucide-react';
import { UnifiedItem } from './MySetsWorkspace';
import { exportUnifiedItem } from '../utils/exportUtils';

interface SavedResultViewerProps {
  item: UnifiedItem;
  onClose: () => void;
  onOpenInWorkbench?: () => void;
  onLaunchPractice?: (mode: 'study' | 'flashcards' | 'practice') => void;
}

export const SavedResultViewer: React.FC<SavedResultViewerProps> = ({
  item,
  onClose,
  onOpenInWorkbench,
  onLaunchPractice,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMarkingGuide, setShowMarkingGuide] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Extract underlying data
  const studySet = item.originalStudySet;
  const quiz = item.originalQuiz;
  const buildRes = item.originalBuildResource;
  const anyData = (buildRes as any)?.data || buildRes || {};

  // Extract specialized tool types
  const toolType = buildRes?.toolType || (studySet ? 'study-set' : quiz ? 'quiz' : 'custom');

  // Handle Copy full text representation
  const handleCopy = () => {
    let text = `${item.title.toUpperCase()}\n`;
    text += `Category: ${item.categoryOrSubject} | Type: ${item.kindLabel}\n`;
    text += `Created: ${new Date(item.createdAt).toLocaleDateString()}\n\n`;

    if (studySet && studySet.concepts) {
      text += `CONCEPTS & VOCABULARY:\n`;
      studySet.concepts.forEach((c, idx) => {
        text += `\n${idx + 1}. ${c.title}\n`;
        text += `Explanation: ${c.explanation}\n`;
        if (c.whyItMatters) text += `Why it matters: ${c.whyItMatters}\n`;
        if (c.keyFacts && c.keyFacts.length) text += `Key Facts: ${c.keyFacts.join(', ')}\n`;
      });
    } else if (quiz && quiz.questions) {
      text += `QUIZ QUESTIONS:\n`;
      quiz.questions.forEach((q, idx) => {
        text += `\nQuestion ${idx + 1}: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          text += `  [${String.fromCharCode(65 + oIdx)}] ${opt} ${Number(oIdx) === Number(q.correctAnswer) ? '✓' : ''}\n`;
        });
        if (q.explanation) text += `Explanation: ${q.explanation}\n`;
      });
    } else if (toolType === 'exam' && anyData.sections) {
      text += `EXAMINATION PAPER\nDuration: ${anyData.durationMinutes || 60} mins | Total Marks: ${anyData.totalMarks || 50}\n\n`;
      anyData.sections.forEach((sec: any) => {
        text += `\n--- ${sec.name.toUpperCase()} (${sec.totalMarks} Marks) ---\n`;
        (sec.questions || []).forEach((q: any) => {
          text += `\nQ${q.questionNumber}. ${q.questionText} [${q.marks} Marks]\n`;
          if (q.options) {
            q.options.forEach((opt: string, i: number) => {
              text += `   (${String.fromCharCode(65 + i)}) ${opt}\n`;
            });
          }
          if (q.correctAnswer) text += `Answer: ${q.correctAnswer}\n`;
        });
      });
    } else if (toolType === 'worksheet' && anyData.exercises) {
      text += `WORKSHEET\nInstructions: ${anyData.instructions || ''}\n\n`;
      anyData.exercises.forEach((ex: any) => {
        text += `\n${ex.sectionTitle.toUpperCase()}\n`;
        (ex.questions || []).forEach((q: any) => {
          text += `${q.number || '•'}. ${q.prompt}\n`;
          if (q.answer) text += `Answer: ${q.answer}\n`;
        });
      });
    } else if (toolType === 'lesson-plan' && anyData.phases) {
      text += `LESSON PLAN\nGrade: ${anyData.gradeLevel} | Duration: ${anyData.durationMinutes} mins\n\n`;
      if (anyData.objectives) {
        text += `Objectives:\n${anyData.objectives.map((o: string) => `• ${o}`).join('\n')}\n\n`;
      }
      anyData.phases.forEach((p: any) => {
        text += `[${p.phase} - ${p.durationMinutes}m]\nTeacher: ${p.teacherActivity}\nStudents: ${p.studentActivity}\n\n`;
      });
    } else if (toolType === 'presentation' && anyData.slides) {
      text += `PRESENTATION SLIDE DECK\n\n`;
      anyData.slides.forEach((s: any) => {
        text += `Slide ${s.slideNumber}: ${s.title}\n`;
        (s.bullets || []).forEach((b: string) => (text += `• ${b}\n`));
        if (s.speakerNotes) text += `Notes: ${s.speakerNotes}\n`;
        text += '\n';
      });
    } else if ((toolType === 'course' || toolType === 'course-builder') && anyData.modules) {
      text += `CURRICULUM COURSE\nDuration: ${anyData.totalWeeksOrHours}\n\n`;
      anyData.modules.forEach((m: any) => {
        text += `Module ${m.moduleNumber}: ${m.title}\n`;
        (m.lessons || []).forEach((l: any) => (text += `  - ${l.title} (${l.duration}): ${l.keyTakeaway}\n`));
      });
    } else if (toolType === 'learning-path' && anyData.milestones) {
      text += `LEARNING ROADMAP\n\n`;
      anyData.milestones.forEach((m: any) => {
        text += `Milestone ${m.milestoneNumber}: ${m.title} (${m.timeframe})\n`;
        if (m.skillsAcquired) text += `Skills: ${m.skillsAcquired.join(', ')}\n`;
        if (m.checkpointAssessment) text += `Assessment: ${m.checkpointAssessment}\n\n`;
      });
    } else if (toolType === 'mind-map' && (anyData.rootNode || anyData.topic)) {
      text += `MIND MAP: ${anyData.rootNode?.title || anyData.topic}\n`;
      const dumpNodes = (node: any, depth = 0) => {
        if (!node) return;
        text += `${'  '.repeat(depth)}• ${node.title || node.name || ''}\n`;
        if (node.notes) text += `${'  '.repeat(depth)}  Notes: ${node.notes}\n`;
        (node.children || []).forEach((c: any) => dumpNodes(c, depth + 1));
      };
      dumpNodes(anyData.rootNode);
    } else if (toolType === 'study-guide') {
      text += `STUDY GUIDE\n${anyData.executiveSummary || item.description}\n\n`;
      (anyData.sections || []).forEach((sec: any) => {
        text += `--- ${sec.title} ---\n${sec.content}\n\n`;
      });
    } else {
      text += item.description + '\n\n';
      if (anyData.content) text += anyData.content + '\n';
      if (anyData.summary) text += anyData.summary + '\n';
      if (anyData.keyPoints) text += anyData.keyPoints.map((p: string) => `• ${p}`).join('\n') + '\n';
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF7F0] border border-[#E3D9C9] rounded-[28px] sm:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-white border-b border-[#EAE3D6] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E02D68] to-[#C92255] text-white flex items-center justify-center shadow-sm shrink-0">
              {studySet ? <BookOpen className="w-5 h-5" /> : quiz ? <GraduationCap className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FCE8F3] text-[#D92B8A] border border-[#F5C2DC]">
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

              <h2 className="font-display font-black text-lg sm:text-xl text-[#161616] uppercase truncate mt-0.5">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PRINT</span>
            </button>

            <button
              onClick={() => exportUnifiedItem(item, 'doc')}
              className="px-3.5 py-2 rounded-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download Word Document (.doc)"
            >
              <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span className="hidden sm:inline">DOC</span>
            </button>

            <button
              onClick={() => exportUnifiedItem(item, 'pdf')}
              className="px-3.5 py-2 rounded-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download PDF Document (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {onOpenInWorkbench && (
              <button
                onClick={onOpenInWorkbench}
                className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Open in tool generator"
              >
                <span>OPEN WORKBENCH</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D92B8A]" />
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

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. STUDY SET VIEWER */}
          {studySet && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-wider">
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
                        className="px-4 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>LEARN</span>
                      </button>
                      <button
                        onClick={() => onLaunchPractice('flashcards')}
                        className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-pink-50 text-stone-800 font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span>FLASHCARDS</span>
                      </button>
                      <button
                        onClick={() => onLaunchPractice('practice')}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D92B8A]" />
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
                      className="bg-white border border-[#EAE3D6] rounded-2xl p-5 shadow-xs hover:border-[#D92B8A]/40 transition-all space-y-2.5"
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
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#E63956] uppercase">PRACTICE WORKSHEET</span>
                    <h3 className="font-display font-black text-2xl uppercase text-[#161616] mt-0.5">
                      {anyData.title || item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                    <span>Grade: {anyData.gradeLevel || 'Standard'}</span>
                    <span>•</span>
                    <span>Level: {anyData.difficulty || 'All'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F0] p-3 rounded-2xl text-xs font-mono text-stone-600">
                  <div><span className="font-bold">Name:</span> __________________</div>
                  <div><span className="font-bold">Date:</span> __________________</div>
                  <div><span className="font-bold">Class:</span> _________________</div>
                  <div><span className="font-bold">Score:</span> _____ / 100</div>
                </div>

                {anyData.instructions && (
                  <div className="text-xs sm:text-sm font-sans text-stone-700 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                    <span className="font-mono font-bold uppercase text-amber-900 block mb-1">Instructions:</span>
                    {anyData.instructions}
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                {(anyData.exercises || []).map((ex: any, eIdx: number) => (
                  <div key={eIdx} className="bg-white border border-[#EAE3D6] rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="font-display font-black text-base uppercase text-[#161616] border-b border-stone-100 pb-2">
                      {ex.sectionTitle || `Exercise ${eIdx + 1}`}
                    </h4>

                    <div className="space-y-3">
                      {(ex.questions || []).map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-3 bg-[#FAF7F0] rounded-xl space-y-2">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold text-[#E63956]">{q.number || qIdx + 1}.</span>
                            <span className="font-sans text-sm text-stone-800 font-medium">{q.prompt}</span>
                          </div>
                          {q.answer && (
                            <div className="pl-6 pt-1 text-xs font-mono text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                              <span className="font-bold uppercase">Answer Key: </span> {q.answer}
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

          {/* 5. MIND MAP VIEWER */}
          {toolType === 'mind-map' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 shadow-xs">
                <span className="text-xs font-mono font-bold text-[#D92B8A] uppercase">VISUAL CONCEPT HIERARCHY</span>
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
                        <span className="w-3 h-3 rounded-full bg-[#D92B8A]"></span>
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
          {toolType === 'presentation' && (
            <div className="space-y-6">
              {anyData.slides && anyData.slides.length > 0 ? (
                <div className="space-y-6">
                  {/* Active Slide Canvas */}
                  {(() => {
                    const currentSlide = anyData.slides[activeSlideIndex] || anyData.slides[0];
                    return (
                      <div className="bg-stone-900 text-white border border-stone-800 rounded-3xl p-8 sm:p-12 shadow-md space-y-6 min-h-[300px] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-4 border-b border-stone-800">
                            <span>SLIDE {activeSlideIndex + 1} OF {anyData.slides.length}</span>
                            <span className="uppercase text-[#D92B8A] font-bold">{anyData.title || item.title}</span>
                          </div>

                          <h3 className="font-display font-black text-2xl sm:text-4xl uppercase text-white mt-6">
                            {currentSlide.title}
                          </h3>

                          <ul className="space-y-3 mt-6 text-sm sm:text-base font-sans text-stone-300 max-w-3xl">
                            {(currentSlide.bullets || []).map((b: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="text-[#D92B8A] font-bold">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {currentSlide.speakerNotes && (
                          <div className="pt-4 border-t border-stone-800 text-xs font-mono text-stone-400 bg-stone-950/60 p-3.5 rounded-xl">
                            <span className="font-bold text-[#D92B8A] uppercase">Speaker Notes: </span>
                            {currentSlide.speakerNotes}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Slide Carousel Controls */}
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAE3D6]">
                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> PREV
                    </button>

                    <span className="text-xs font-mono font-bold text-stone-600">
                      Slide {activeSlideIndex + 1} of {anyData.slides.length}
                    </span>

                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.min(anyData.slides.length - 1, prev + 1))}
                      disabled={activeSlideIndex === anyData.slides.length - 1}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      NEXT <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

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
                          <Check className="w-3.5 h-3.5 text-[#D92B8A] shrink-0 mt-0.5" />
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

        {/* Footer Bar */}
        <div className="bg-[#FAF7F0] border-t border-[#EAE3D6] px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <span className="text-xs font-mono text-stone-500">
            Proudly Afrikan Archive ID: {item.id}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-black text-white font-mono text-xs font-bold uppercase rounded-full shadow-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
