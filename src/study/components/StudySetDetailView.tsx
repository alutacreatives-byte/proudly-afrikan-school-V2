import React, { useState } from 'react';
import { StudySet, StudyConcept, AppView } from '../types';
import { StorageService } from '../services/storageService';
import { StudyTutorModal } from './StudyTutorModal';
import { StudyGuideModal } from './StudyGuideModal';
import { SummaryModal } from './SummaryModal';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  ArrowLeft, 
  Clock, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink,
  BookMarked,
  FileText,
  Zap,
  Tag,
  GraduationCap,
  AlignLeft,
  Bookmark
} from 'lucide-react';

interface StudySetDetailViewProps {
  studySet: StudySet;
  onBack: () => void;
  onGoHome?: () => void;
  onLaunchMode: (mode: AppView) => void;
  onLaunchConceptLesson?: (conceptIndex: number) => void;
}

export const StudySetDetailView: React.FC<StudySetDetailViewProps> = ({
  studySet,
  onBack,
  onGoHome,
  onLaunchMode,
  onLaunchConceptLesson,
}) => {
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);
  const [setNote, setSetNote] = useState<string>(() => StorageService.getNote(studySet.id));
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [noteErrorAlert, setNoteErrorAlert] = useState<string | null>(null);

  // AI Modal States
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedTutorConcept, setSelectedTutorConcept] = useState<StudyConcept | undefined>(undefined);

  const toggleExpand = (id: string) => {
    setExpandedConceptId(prev => (prev === id ? null : id));
  };

  const handleSaveSetNote = () => {
    if (!setNote.trim()) {
      setNoteErrorAlert('Note cannot be empty');
      setTimeout(() => setNoteErrorAlert(null), 2500);
      return;
    }

    const res = StorageService.saveNote({
      targetId: studySet.id,
      targetTitle: studySet.title,
      targetType: 'set',
      category: studySet.category || 'General Knowledge',
      content: setNote.trim(),
    });

    if (res.success) {
      setIsNoteSaved(true);
      setNoteErrorAlert(null);
      setTimeout(() => setIsNoteSaved(false), 2000);
    } else {
      setNoteErrorAlert(res.error || 'Failed to save note');
      setTimeout(() => setNoteErrorAlert(null), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Global Navigation: BACK + HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
      </div>

      {/* Hero Study Set Overview Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-stone-100 text-stone-800 font-mono text-xs font-bold uppercase rounded-full">
              {studySet.category || 'General Knowledge'}
            </span>
            {studySet.isCustom && (
              <span className="px-3 py-1 bg-[#D92B8A] text-white font-mono text-xs font-bold uppercase rounded-full shadow-sm">
                Custom Set
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-stone-500">
              <Clock className="w-3.5 h-3.5 text-[#D92B8A]" />
              ~{studySet.estimatedMinutes || Math.ceil((studySet.concepts || []).length * 2)} MINS ESTIMATED
            </span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase text-[#161616] leading-tight mb-3">
            {studySet.title}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {studySet.description}
          </p>
        </div>

        {/* 4 Primary Learning Actions */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <span className="font-mono text-xs font-bold text-stone-700 uppercase tracking-wider block">
            HOW WOULD YOU LIKE TO STUDY THIS SET?
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onLaunchMode('study')}
              className="p-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-black uppercase rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_4px_14px_rgba(217,43,138,0.3)] transition-all active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>LEARN</span>
            </button>

            <button
              onClick={() => onLaunchMode('flashcards')}
              className="p-4 bg-white border border-stone-200 hover:border-pink-300 text-stone-800 font-display text-xs font-black uppercase rounded-2xl shadow-sm hover:bg-pink-50/50 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Layers className="w-5 h-5 text-[#D92B8A]" />
              <span>FLASHCARDS</span>
            </button>

            <button
              onClick={() => onLaunchMode('practice')}
              className="p-4 bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-800 font-display text-xs font-black uppercase rounded-2xl shadow-sm hover:bg-stone-100 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-[#D92B8A]" />
              <span>PRACTISE</span>
            </button>

            <button
              onClick={() => onLaunchMode('review')}
              className="p-4 bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-800 font-display text-xs font-black uppercase rounded-2xl shadow-sm hover:bg-stone-100 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5 text-[#D92B8A]" />
              <span>REVIEW QUEUE</span>
            </button>
          </div>
        </div>

        {/* REVISION & STUDY ENHANCEMENTS */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REVISION & STUDY TOOLS</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setSelectedTutorConcept(undefined);
                setIsTutorOpen(true);
              }}
              className="p-4 bg-[#FAF8F5] hover:bg-pink-50/60 border border-stone-200/90 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors">
                <GraduationCap className="w-4 h-4 text-[#D92B8A]" />
                <span>STUDY TUTOR</span>
              </div>
              <p className="text-xs text-stone-600">Ask questions & get conceptual guidance</p>
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-4 bg-[#FAF8F5] hover:bg-pink-50/60 border border-stone-200/90 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors">
                <FileText className="w-4 h-4 text-[#D92B8A]" />
                <span>STUDY GUIDE GENERATOR</span>
              </div>
              <p className="text-xs text-stone-600">Generate full revision sheet with review Qs</p>
            </button>

            <button
              onClick={() => setIsSummaryOpen(true)}
              className="p-4 bg-[#FAF8F5] hover:bg-pink-50/60 border border-stone-200/90 rounded-2xl text-left space-y-1.5 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors">
                <AlignLeft className="w-4 h-4 text-[#D92B8A]" />
                <span>SUMMARY GENERATOR</span>
              </div>
              <p className="text-xs text-stone-600">Quick, Standard, or Detailed takeaways</p>
            </button>
          </div>
        </div>

        {/* Set Notes Editor */}
        <div className="pt-4 border-t border-stone-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-stone-700 uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>MY STUDY NOTES FOR THIS SET:</span>
            </span>
            {isNoteSaved && (
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
              value={setNote}
              onChange={(e) => setSetNote(e.target.value)}
              onBlur={handleSaveSetNote}
              placeholder="Add your summary notes, key ideas, or personal takeaways..."
              className="flex-1 p-3 bg-[#FAF8F5] border border-stone-300 rounded-2xl text-xs text-[#161616] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-sm"
            />
            <button
              onClick={handleSaveSetNote}
              className="px-4 py-2 bg-white border border-stone-300 font-display text-xs font-bold uppercase rounded-2xl hover:bg-stone-50 shadow-sm"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      {/* KEY CONCEPTS MENTAL MAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-xl uppercase text-[#161616]">
            Key Concepts in this Set ({studySet.concepts.length})
          </h2>
          <span className="text-xs font-mono text-stone-500">
            Click any concept to inspect details
          </span>
        </div>

        <div className="space-y-3">
          {studySet.concepts.map((concept, index) => {
            const isExpanded = expandedConceptId === concept.id;

            return (
              <div
                key={concept.id}
                className="bg-white border border-stone-200/90 rounded-3xl shadow-sm overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(concept.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full bg-[#18181B] text-[#FAF7F0] flex items-center justify-center font-mono font-bold text-xs">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616]">
                        {concept.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1 font-medium">
                        {concept.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-stone-100 rounded-full text-[10px] font-mono font-bold uppercase text-stone-600">
                      {concept.difficulty}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-stone-100 bg-[#FAF8F5] space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <span className="font-mono text-xs font-bold uppercase text-[#D92B8A]">
                        Explanation & Context
                      </span>
                      <p className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line">
                        {concept.explanation || concept.summary}
                      </p>
                    </div>

                    {concept.keyFacts && concept.keyFacts.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-stone-200">
                        <span className="font-mono text-xs font-bold uppercase text-stone-700">
                          Key Facts
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {concept.keyFacts.map((fact, fIdx) => (
                            <div key={fIdx} className="p-3 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 font-medium leading-relaxed shadow-sm">
                              • {fact}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTutorConcept(concept);
                          setIsTutorOpen(true);
                        }}
                        className="px-4 py-2 bg-white hover:bg-pink-50 text-stone-800 border border-stone-200 font-display text-xs font-bold uppercase rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span>Ask Tutor About Concept</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLaunchConceptLesson) {
                            onLaunchConceptLesson(index);
                          } else {
                            onLaunchMode('study');
                          }
                        }}
                        className="px-5 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase rounded-full shadow-md flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>OPEN FULL LESSON →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GO DEEPER */}
      {studySet.goDeeperResources && studySet.goDeeperResources.length > 0 && (
        <div className="bg-white border border-stone-200/90 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <BookMarked className="w-5 h-5 text-[#D92B8A]" />
            <h2 className="font-display font-black text-xl uppercase text-[#161616]">
              GO DEEPER: RECOMMENDED RESOURCES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studySet.goDeeperResources.map(res => (
              <div key={res.id} className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-white border border-stone-200 rounded-full text-[#D92B8A] font-bold">
                      {res.type}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500">
                      {res.topicMatch}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xs uppercase text-[#161616] pt-1">
                    {res.title}
                  </h4>
                  <p className="font-mono text-[11px] text-stone-500">
                    By {res.authorOrSource}
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug pt-1">
                    {res.description}
                  </p>
                </div>

                {res.externalUrl && (
                  <a
                    href={res.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#D92B8A] hover:underline pt-2"
                  >
                    <span>Read resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Enhancement Modals */}
      <StudyTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        studySet={studySet}
        currentConcept={selectedTutorConcept}
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
