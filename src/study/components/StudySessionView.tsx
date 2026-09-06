import React, { useState, useRef } from 'react';
import { 
  StudySet, 
  StudyConcept, 
  DifferentiatedLearningMode, 
  DifferentiatedResult 
} from '../types';
import { StorageService } from '../services/storageService';
import { AIService } from '../services/aiService';
import { StudyTutorModal } from './StudyTutorModal';
import { StudyGuideModal } from './StudyGuideModal';
import { SummaryModal } from './SummaryModal';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Lightbulb, 
  ChevronRight, 
  Share2, 
  Layers, 
  Check, 
  ExternalLink,
  MessageSquare,
  Bookmark,
  Zap,
  GraduationCap,
  AlignLeft,
  Compass,
  Flame,
  Save,
  Copy
} from 'lucide-react';

interface StudySessionViewProps {
  studySet: StudySet;
  initialConceptIndex?: number;
  onFinishLesson: (setId: string, completedConceptsCount: number) => void;
  onNavigateToFlashcards: (set: StudySet) => void;
  onNavigateToPractice: (set: StudySet) => void;
  onBack: () => void;
  onGoHome?: () => void;
}

export const StudySessionView: React.FC<StudySessionViewProps> = ({
  studySet,
  initialConceptIndex = 0,
  onFinishLesson,
  onNavigateToFlashcards,
  onNavigateToPractice,
  onBack,
  onGoHome,
}) => {
  const conceptCardRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialConceptIndex);
  const [understoodConcepts, setUnderstoodConcepts] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Modal States for the Enhancements
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // DIFFERENTIATED LEARNING STATE
  const [differentiatedMode, setDifferentiatedMode] = useState<DifferentiatedLearningMode | 'none'>('none');
  const [differentiatedResult, setDifferentiatedResult] = useState<DifferentiatedResult | null>(null);
  const [isDifferentiating, setIsDifferentiating] = useState(false);
  const [diffSavedNote, setDiffSavedNote] = useState(false);
  const [diffCopied, setDiffCopied] = useState(false);

  // "EXPLAIN IT YOURSELF" State
  const [selfExplanationText, setSelfExplanationText] = useState('');
  const [isEvaluatingSelf, setIsEvaluatingSelf] = useState(false);
  const [selfFeedback, setSelfFeedback] = useState<{ feedback: string; strengthPoint: string; growthPoint: string } | null>(null);

  // Personal Notes State
  const currentConcept: StudyConcept | undefined = studySet.concepts[currentIndex];
  const [noteText, setNoteText] = useState(currentConcept ? StorageService.getNote(currentConcept.id) : '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedAlert, setNoteSavedAlert] = useState(false);
  const [noteErrorAlert, setNoteErrorAlert] = useState<string | null>(null);

  const scrollToConceptTop = () => {
    requestAnimationFrame(() => {
      if (conceptCardRef.current) {
        const elementPosition = conceptCardRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 95;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  if (!currentConcept) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center rounded-3xl shadow-lg max-w-xl mx-auto space-y-4">
        <h2 className="font-display font-black text-2xl uppercase text-stone-900">No Concepts in this Study Set</h2>
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 bg-[#D92B8A] text-white font-display text-xs font-bold uppercase rounded-full shadow-md hover:bg-[#c02479] transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleNextConcept = () => {
    if (noteText.trim() && noteText.trim() !== StorageService.getNote(currentConcept.id)) {
      StorageService.saveNote({
        targetId: currentConcept.id,
        targetTitle: currentConcept.title,
        targetType: 'concept',
        category: currentConcept.category || studySet.category || 'General Knowledge',
        content: noteText.trim(),
      });
    }

    setDifferentiatedMode('none');
    setDifferentiatedResult(null);
    setDiffSavedNote(false);
    setDiffCopied(false);
    setSelfExplanationText('');
    setSelfFeedback(null);
    setNoteErrorAlert(null);
    setNoteSavedAlert(false);

    if (currentIndex < studySet.concepts.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setNoteText(StorageService.getNote(studySet.concepts[nextIdx].id));
      scrollToConceptTop();
    } else {
      setIsCompleted(true);
      onFinishLesson(studySet.id, understoodConcepts.size);
    }
  };

  const handlePrevConcept = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setDifferentiatedMode('none');
      setDifferentiatedResult(null);
      setDiffSavedNote(false);
      setDiffCopied(false);
      setSelfExplanationText('');
      setSelfFeedback(null);
      setNoteErrorAlert(null);
      setNoteSavedAlert(false);
      setNoteText(StorageService.getNote(studySet.concepts[prevIdx].id));
      scrollToConceptTop();
    }
  };

  const handleToggleUnderstood = () => {
    const updated = new Set(understoodConcepts);
    if (updated.has(currentConcept.id)) {
      updated.delete(currentConcept.id);
    } else {
      updated.add(currentConcept.id);
    }
    setUnderstoodConcepts(updated);
  };

  const handleDifferentiatedLearning = async (mode: DifferentiatedLearningMode) => {
    if (differentiatedMode === mode) {
      setDifferentiatedMode('none');
      setDifferentiatedResult(null);
      return;
    }

    setDifferentiatedMode(mode);
    setDiffSavedNote(false);
    setDiffCopied(false);
    setIsDifferentiating(true);

    try {
      const res = await AIService.differentiatedLearning(currentConcept, studySet.title, mode);
      setDifferentiatedResult(res);
    } catch (err) {
      console.error('Differentiated learning request failed:', err);
    } finally {
      setIsDifferentiating(false);
    }
  };

  const handleSaveDifferentiatedToNotes = () => {
    if (!differentiatedResult) return;
    const noteContent = `# ${differentiatedResult.modeLabel}: ${currentConcept.title}
Study Set: ${studySet.title}
Category: ${currentConcept.category || studySet.category || 'General Knowledge'}

## ${differentiatedResult.title}
${differentiatedResult.content}

**Key Takeaway**: ${differentiatedResult.keyTakeaway}
`;

    const res = StorageService.saveNote({
      targetId: `${currentConcept.id}_${differentiatedResult.mode}`,
      targetTitle: `${differentiatedResult.modeLabel}: ${currentConcept.title}`,
      targetType: 'concept',
      category: currentConcept.category || studySet.category || 'General Knowledge',
      content: noteContent,
    });

    if (res.success) {
      setDiffSavedNote(true);
      setTimeout(() => setDiffSavedNote(false), 3000);
    }
  };

  const handleCopyDifferentiated = () => {
    if (!differentiatedResult) return;
    navigator.clipboard.writeText(`${differentiatedResult.title}\n\n${differentiatedResult.content}\n\nTakeaway: ${differentiatedResult.keyTakeaway}`);
    setDiffCopied(true);
    setTimeout(() => setDiffCopied(false), 2000);
  };

  const handleEvaluateSelfExplanation = async () => {
    if (!selfExplanationText.trim()) return;
    setIsEvaluatingSelf(true);
    const result = await AIService.evaluateSelfExplanation(
      currentConcept.title,
      currentConcept.summary,
      selfExplanationText,
      currentConcept.selfExplanationKeyPoints || [currentConcept.summary]
    );
    setSelfFeedback(result);
    setIsEvaluatingSelf(false);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      setNoteErrorAlert('Note cannot be empty');
      setTimeout(() => setNoteErrorAlert(null), 2500);
      return;
    }
    setIsSavingNote(true);
    const res = StorageService.saveNote({
      targetId: currentConcept.id,
      targetTitle: currentConcept.title,
      targetType: 'concept',
      category: currentConcept.category || studySet.category || 'General Knowledge',
      content: noteText.trim(),
    });

    if (res.success) {
      setNoteSavedAlert(true);
      setNoteErrorAlert(null);
      setTimeout(() => {
        setIsSavingNote(false);
        setNoteSavedAlert(false);
      }, 2000);
    } else {
      setIsSavingNote(false);
      setNoteErrorAlert(res.error || 'Failed to save note');
      setTimeout(() => setNoteErrorAlert(null), 2500);
    }
  };

  // LESSON COMPLETED SUMMARY SCREEN
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <StudyTutorModal
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          studySet={studySet}
          currentConcept={currentConcept}
        />
        <StudyGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          studySet={studySet}
        />
        <SummaryModal
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          studySet={studySet}
        />

        {/* Completion Header */}
        <div className="bg-white border border-stone-200/90 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 bg-pink-50 border border-pink-200 rounded-full text-[#D92B8A] shadow-sm">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-widest block">
              Learning Stage Completed
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-stone-900">
              {studySet.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto font-medium leading-relaxed">
              You have explored all {studySet.concepts.length} key concepts. Lock them into long-term memory with active recall flashcards or practice questions.
            </p>
          </div>

          {/* Concepts Mastered Mental Map List */}
          <div className="bg-stone-50 border border-stone-200/80 p-5 text-left rounded-2xl space-y-3">
            <span className="font-mono text-xs font-bold uppercase text-stone-700 block">
              Key Concepts Learned in this Set:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {studySet.concepts.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2.5 p-3 bg-white border border-stone-200 rounded-xl text-xs shadow-sm">
                  <span className="font-mono font-bold text-[#D92B8A]">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="font-display font-bold text-stone-900 truncate">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhancements Action Bar */}
          <div className="bg-white border border-stone-200 p-5 text-left rounded-2xl space-y-3 shadow-sm">
            <span className="font-mono text-xs font-bold uppercase text-[#D92B8A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Revision & Mastery Tools</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setIsTutorOpen(true)}
                className="p-4 bg-stone-50 hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase text-stone-900">
                  <GraduationCap className="w-4 h-4 text-[#D92B8A]" />
                  <span>Ask Study Tutor</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">Ask follow-up questions & clarify difficult concepts</p>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="p-4 bg-stone-50 hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase text-stone-900">
                  <FileText className="w-4 h-4 text-[#D92B8A]" />
                  <span>Revision Study Guide</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">Structured overview, facts, definitions & review Qs</p>
              </button>

              <button
                onClick={() => setIsSummaryOpen(true)}
                className="p-4 bg-stone-50 hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase text-stone-900">
                  <AlignLeft className="w-4 h-4 text-[#D92B8A]" />
                  <span>Generate Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">Quick, Standard, or Detailed takeaways</p>
              </button>
            </div>
          </div>

          {/* Next Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigateToFlashcards(studySet)}
              className="p-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Test Recall: Flashcards →</span>
            </button>

            <button
              onClick={() => onNavigateToPractice(studySet)}
              className="p-4 bg-[#18181B] hover:bg-stone-800 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Practise & Reinforce →</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center pt-2">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 relative">
      <StudyTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        studySet={studySet}
        currentConcept={currentConcept}
      />
      <StudyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        studySet={studySet}
      />
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        studySet={studySet}
        concept={currentConcept}
      />

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />

        {/* Top Study Tools Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTutorOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-pink-50 text-stone-800 border border-stone-200 rounded-full font-display text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm transition-all"
            title="Open Study Tutor for this set"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span className="hidden sm:inline">Tutor</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-pink-50 text-stone-800 border border-stone-200 rounded-full font-display text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm transition-all"
            title="Generate Revision Study Guide"
          >
            <FileText className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span className="hidden sm:inline">Study Guide</span>
          </button>

          <button
            onClick={() => setIsSummaryOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-pink-50 text-stone-800 border border-stone-200 rounded-full font-display text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm transition-all"
            title="Generate Quick or Detailed Summary"
          >
            <AlignLeft className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span className="hidden sm:inline">Summary</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
            <span className="font-mono text-xs font-bold text-[#D92B8A]">
              {(currentIndex + 1).toString().padStart(2, '0')}/{studySet.concepts.length.toString().padStart(2, '0')}
            </span>
            <div className="w-20 sm:w-28 h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D92B8A] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / studySet.concepts.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KEY CONCEPTS MENTAL MAP (Horizontal Index) */}
      <div className="bg-white border border-stone-200/90 p-3 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="font-mono text-[10px] font-bold uppercase text-stone-500 mr-1">
            Concepts:
          </span>
          {studySet.concepts.map((c, idx) => {
            const isCurrent = idx === currentIndex;
            const isUnderstood = understoodConcepts.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setDifferentiatedMode('none');
                  setDifferentiatedResult(null);
                  setDiffSavedNote(false);
                  setDiffCopied(false);
                  setSelfExplanationText('');
                  setSelfFeedback(null);
                  setNoteText(StorageService.getNote(c.id));
                  scrollToConceptTop();
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full border transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                    : isUnderstood
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{(idx + 1).toString().padStart(2, '0')}</span>
                <span className="font-display font-bold max-w-[120px] truncate">{c.title}</span>
                {isUnderstood && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN LESSON CARD */}
      <article ref={conceptCardRef} className="bg-white border border-stone-200/90 rounded-3xl shadow-xl p-6 sm:p-10 space-y-8">
        {/* Concept Title & Meta Badges */}
        <div className="border-b border-stone-200 pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-1 bg-stone-900 text-white font-mono text-[10px] font-bold uppercase rounded-full">
                {currentConcept.category || studySet.category || 'General Knowledge'}
              </span>
              <span className="px-3 py-1 bg-stone-100 border border-stone-200 font-mono text-[10px] font-bold uppercase text-stone-700 rounded-full">
                {currentConcept.difficulty}
              </span>
            </div>

            <button
              onClick={handleToggleUnderstood}
              className={`px-4 py-1.5 text-xs font-display font-bold uppercase rounded-full border transition-all flex items-center gap-1.5 ${
                understoodConcepts.has(currentConcept.id)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{understoodConcepts.has(currentConcept.id) ? 'Understood ✓' : 'Mark as Understood'}</span>
            </button>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-stone-900 tracking-tight pt-1">
            {currentConcept.title}
          </h1>

          <p className="text-base sm:text-lg font-semibold text-[#D92B8A] leading-relaxed">
            {currentConcept.summary}
          </p>
        </div>

        {/* 1. Clear Digestible Explanation */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#D92B8A]" />
            <span>Core Lesson & Context</span>
          </h2>
          <div className="text-base sm:text-lg text-stone-800 leading-relaxed space-y-4 font-normal">
            <p className="whitespace-pre-line leading-relaxed">{currentConcept.explanation}</p>
            {currentConcept.historicalContext && (
              <div className="p-5 bg-stone-50 border-l-4 border-[#D92B8A] rounded-r-2xl text-sm sm:text-base text-stone-700 space-y-1">
                <span className="font-bold font-mono text-xs uppercase text-[#D92B8A] block">Historical Context:</span>
                <p className="italic leading-relaxed">{currentConcept.historicalContext}</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Key Facts Cards */}
        {Boolean(currentConcept.keyFacts && currentConcept.keyFacts.length > 0) && (
          <section className="space-y-3 pt-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#D92B8A]" />
              <span>Key Facts to Remember</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentConcept.keyFacts.map((fact, idx) => (
                <div key={idx} className="p-4 bg-stone-50/80 border border-stone-200/90 rounded-2xl flex items-start gap-3 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-[#D92B8A] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <p className="text-sm sm:text-base text-stone-800 font-normal leading-relaxed">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Important Terminology */}
        {Boolean(currentConcept.terminology && currentConcept.terminology.length > 0) && (
          <section className="space-y-3 pt-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-[#D92B8A]" />
              <span>Key Terminology</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentConcept.terminology.map((t, idx) => (
                <div key={idx} className="p-4 bg-stone-50/80 border border-stone-200/90 rounded-2xl space-y-1.5 shadow-sm">
                  <span className="font-display font-bold text-sm text-[#D92B8A] block">
                    {t.term}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 font-normal leading-relaxed">
                    {t.definition}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Why This Matters */}
        {Boolean(currentConcept.whyItMatters) && (
          <section className="p-5 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#D92B8A] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Why This Matters</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">
              {currentConcept.whyItMatters}
            </p>
          </section>
        )}

        {/* 5. Concrete Real-World Example */}
        {Boolean(currentConcept.concreteExample) && (
          <section className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D92B8A]" />
                <span>Concrete Example</span>
              </h2>
              <span className="font-mono text-xs font-bold text-[#D92B8A]">
                {currentConcept.concreteExample?.title}
              </span>
            </div>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
              {currentConcept.concreteExample?.text}
            </p>
          </section>
        )}

        {/* 6. Visual Learning */}
        {Boolean(currentConcept.visualAid) && (
          <section className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D92B8A]" />
                <span>Visual Learning: {currentConcept.visualAid?.title}</span>
              </h2>
              <span className="font-mono text-xs bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200 font-bold text-stone-600">
                {currentConcept.visualAid?.type}
              </span>
            </div>

            {currentConcept.visualAid?.quote ? (
              <blockquote className="p-4 bg-stone-50 border-l-4 border-stone-800 rounded-r-xl italic text-base sm:text-lg text-stone-800 space-y-1.5">
                <p>"{currentConcept.visualAid.quote.text}"</p>
                <footer className="not-italic font-mono text-xs font-bold text-[#D92B8A] pt-1">
                  — {currentConcept.visualAid.quote.author} {currentConcept.visualAid.quote.year && `(${currentConcept.visualAid.quote.year})`}
                </footer>
              </blockquote>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {currentConcept.visualAid?.items?.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                    <span className="font-mono text-xs font-bold text-[#D92B8A] block">{item.label}</span>
                    <span className="font-display font-bold text-sm sm:text-base text-stone-900 block">{item.value}</span>
                    {item.detail && <p className="text-xs sm:text-sm text-stone-600 leading-normal">{item.detail}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 7. DIFFERENTIATED LEARNING */}
        <section className="pt-4 border-t border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-stone-900">
                <Sparkles className="w-4 h-4 text-[#D92B8A]" />
                <span>Differentiated Learning & Adaptation</span>
              </div>
              <p className="text-xs text-stone-500">
                Adapt this concept to match your exact learning style and cognitive pace.
              </p>
            </div>

            <button
              onClick={() => setIsTutorOpen(true)}
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#D92B8A] hover:underline uppercase self-start sm:self-auto"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ask Tutor about this concept →</span>
            </button>
          </div>

          {/* Differentiated Mode 4-Card Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleDifferentiatedLearning('simplify')}
              disabled={isDifferentiating && differentiatedMode !== 'simplify'}
              className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between gap-2 ${
                differentiatedMode === 'simplify'
                  ? 'bg-[#D92B8A] text-white border-[#D92B8A] shadow-md'
                  : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:bg-pink-50/40 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs sm:text-sm font-bold">Simplify</span>
                <Lightbulb className={`w-4 h-4 ${differentiatedMode === 'simplify' ? 'text-white' : 'text-[#D92B8A]'}`} />
              </div>
              <span className={`text-xs leading-tight ${differentiatedMode === 'simplify' ? 'text-white/90' : 'text-stone-600'}`}>
                Easier language & analogies
              </span>
            </button>

            <button
              onClick={() => handleDifferentiatedLearning('deeper')}
              disabled={isDifferentiating && differentiatedMode !== 'deeper'}
              className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between gap-2 ${
                differentiatedMode === 'deeper'
                  ? 'bg-[#18181B] text-white border-[#18181B] shadow-md'
                  : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs sm:text-sm font-bold">Go Deeper</span>
                <Compass className={`w-4 h-4 ${differentiatedMode === 'deeper' ? 'text-white' : 'text-stone-700'}`} />
              </div>
              <span className={`text-xs leading-tight ${differentiatedMode === 'deeper' ? 'text-white/80' : 'text-stone-600'}`}>
                Advanced context & nuances
              </span>
            </button>

            <button
              onClick={() => handleDifferentiatedLearning('differently')}
              disabled={isDifferentiating && differentiatedMode !== 'differently'}
              className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between gap-2 ${
                differentiatedMode === 'differently'
                  ? 'bg-[#FAF7F0] text-stone-900 border-[#D92B8A] ring-2 ring-[#D92B8A]/30'
                  : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:bg-pink-50/40 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs sm:text-sm font-bold">Explain Differently</span>
                <Sparkles className="w-4 h-4 text-[#D92B8A]" />
              </div>
              <span className="text-xs text-stone-600 leading-tight">
                New angle or fresh story
              </span>
            </button>

            <button
              onClick={() => handleDifferentiatedLearning('challenge')}
              disabled={isDifferentiating && differentiatedMode !== 'challenge'}
              className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between gap-2 ${
                differentiatedMode === 'challenge'
                  ? 'bg-[#D92B8A] text-white border-[#D92B8A] shadow-md'
                  : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:bg-pink-50/40 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs sm:text-sm font-bold">Challenge Me</span>
                <Flame className={`w-4 h-4 ${differentiatedMode === 'challenge' ? 'text-white' : 'text-[#D92B8A]'}`} />
              </div>
              <span className={`text-xs leading-tight ${differentiatedMode === 'challenge' ? 'text-white/90' : 'text-stone-600'}`}>
                Rigorous test & inquiry
              </span>
            </button>
          </div>

          {/* Differentiated Output Container */}
          {differentiatedMode !== 'none' && (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-stone-900 text-white font-mono text-xs font-bold uppercase rounded-full">
                    {differentiatedResult?.modeLabel || differentiatedMode.toUpperCase()}
                  </span>
                  <span className="font-display font-bold text-sm text-stone-900">
                    {currentConcept.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {differentiatedResult && (
                    <>
                      <button
                        onClick={handleCopyDifferentiated}
                        className="font-mono text-xs font-bold text-stone-700 hover:text-[#D92B8A] uppercase px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm flex items-center gap-1 transition-all"
                        title="Copy to clipboard"
                      >
                        {diffCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{diffCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={handleSaveDifferentiatedToNotes}
                        className="font-mono text-xs font-bold text-stone-700 hover:text-[#D92B8A] uppercase px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm flex items-center gap-1 transition-all"
                        title="Save to My Notes"
                      >
                        {diffSavedNote ? <Check className="w-3 h-3 text-emerald-600" /> : <Save className="w-3 h-3" />}
                        <span>{diffSavedNote ? 'Saved to Notes ✓' : 'Save as Note'}</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setDifferentiatedMode('none');
                      setDifferentiatedResult(null);
                    }}
                    className="font-mono text-xs font-bold text-stone-500 hover:text-stone-900 uppercase px-2.5 py-1 bg-white border border-stone-200 rounded-full"
                  >
                    Close
                  </button>
                </div>
              </div>

              {isDifferentiating ? (
                <div className="py-8 text-center font-mono text-sm text-stone-500 flex flex-col items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#D92B8A] animate-spin" />
                  <span className="font-bold text-stone-900">Adapting lesson material to "{differentiatedMode}" mode...</span>
                  <span className="text-xs text-stone-500">Working on it…</span>
                </div>
              ) : differentiatedResult ? (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                    {differentiatedResult.title}
                  </h3>

                  <div className="text-base sm:text-lg text-stone-800 leading-relaxed font-normal space-y-3 whitespace-pre-line">
                    {differentiatedResult.content}
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1 shadow-sm">
                    <span className="font-mono text-xs font-bold uppercase text-[#D92B8A] block">
                      Core Takeaway:
                    </span>
                    <p className="text-sm font-semibold text-stone-900">
                      {differentiatedResult.keyTakeaway}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* 8. "EXPLAIN IT YOURSELF" (Active Self-Explanation) */}
        <section className="pt-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#D92B8A]" />
              <span>Explain It Yourself (Active Recall)</span>
            </h2>
            <span className="font-mono text-xs text-stone-500 uppercase font-bold">
              Not Graded • Builds Retention
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-normal font-normal">
            {currentConcept.selfExplanationPrompt || `Explain how plate tectonics created the Great Rift Valley and why this region is so important for biology and human origins.`}
          </p>

          <div className="space-y-3">
            <textarea
              value={selfExplanationText}
              onChange={(e) => setSelfExplanationText(e.target.value)}
              placeholder="Type your explanation here in your own words..."
              rows={4}
              className="w-full p-4 bg-stone-50/60 border border-stone-200 rounded-2xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D92B8A]/30 focus:border-[#D92B8A] resize-none leading-relaxed placeholder:text-stone-400"
            />

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateSelfExplanation}
                disabled={!selfExplanationText.trim() || isEvaluatingSelf}
                className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
              >
                {isEvaluatingSelf ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Reviewing your explanation...</span>
                  </>
                ) : (
                  <>
                    <span>Check My Understanding</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Self-Explanation Constructive Feedback Area */}
          {selfFeedback && (
            <div className="p-5 sm:p-6 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-3 mt-3 shadow-sm animate-fadeIn">
              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#D92B8A] block">
                Feedback on Your Explanation
              </span>
              <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-normal whitespace-pre-line">
                {selfFeedback.feedback}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200">
                <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-sm">
                  <span className="font-mono font-bold text-emerald-700 block text-xs uppercase mb-1">What you nailed:</span>
                  <span className="text-stone-800 leading-relaxed font-medium">{selfFeedback.strengthPoint}</span>
                </div>
                <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-sm">
                  <span className="font-mono font-bold text-[#D92B8A] block text-xs uppercase mb-1">Keep in mind:</span>
                  <span className="text-stone-800 leading-relaxed font-medium">{selfFeedback.growthPoint}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 9. Personal Notes */}
        <section className="pt-4 border-t border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-600" />
              <span>My Personal Study Notes</span>
            </h2>
            {noteSavedAlert && (
              <span className="font-mono text-xs text-emerald-700 font-bold uppercase animate-fadeIn">
                Saved ✓
              </span>
            )}
            {noteErrorAlert && (
              <span className="font-mono text-xs text-red-600 font-bold uppercase animate-fadeIn">
                {noteErrorAlert}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="Add your personal memory hook, connection, or note for this concept..."
              className="flex-1 p-3 bg-stone-50/70 border border-stone-200 rounded-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A]/30 focus:border-[#D92B8A] px-5"
            />
            <button
              onClick={handleSaveNote}
              className="px-6 py-3 bg-[#18181B] hover:bg-stone-800 text-white font-display text-xs font-bold uppercase rounded-full shadow-sm transition-colors"
            >
              Save Note
            </button>
          </div>
        </section>
      </article>

      {/* BOTTOM CONCEPT NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrevConcept}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white border border-stone-200 font-display text-xs font-bold uppercase tracking-wider rounded-full disabled:opacity-30 flex items-center gap-2 shadow-sm hover:bg-stone-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Concept</span>
        </button>

        <button
          onClick={handleNextConcept}
          className="px-8 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <span>{currentIndex === studySet.concepts.length - 1 ? 'Finish Lesson' : 'Next Concept'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Modals */}
      <StudyTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        studySet={studySet}
        currentConcept={currentConcept}
      />
      <StudyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        studySet={studySet}
      />
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        studySet={studySet}
      />
    </div>
  );
};
