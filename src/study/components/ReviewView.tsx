import React, { useState, useMemo } from 'react';
import { StudyConcept, StudySet, ConceptPerformance } from '../types';
import { StorageService } from '../services/storageService';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  AlertTriangle,
  FolderOpen,
  Shuffle,
  Clock,
  ExternalLink,
  BookOpen,
  BrainCircuit,
  Flame,
  Check
} from 'lucide-react';

interface ReviewItemWrapper {
  concept: StudyConcept;
  performance?: ConceptPerformance;
  set?: StudySet;
}

interface ReviewViewProps {
  reviewItems: StudyConcept[] | ReviewItemWrapper[];
  onStartReviewSession: (conceptsToReview: StudyConcept[], categoryName?: string) => void;
  onExploreSets: () => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  reviewItems,
  onStartReviewSession,
  onExploreSets,
  onBack,
  onGoHome,
}) => {
  const [activeTab, setActiveTab] = useState<'spaced' | 'interleaved'>('spaced');

  // Normalize review items to ensure safe access whether passed as StudyConcept[] or wrapper objects
  const normalizedItems: ReviewItemWrapper[] = useMemo(() => {
    const allSets = StorageService.getAllSets();
    const results: ReviewItemWrapper[] = [];
    (reviewItems || []).forEach(item => {
      if (!item) return;
      if ('concept' in item && (item as any).concept) {
        const wrapper = item as ReviewItemWrapper;
        const set = wrapper.set || allSets.find(s => s.id === wrapper.concept.setId);
        results.push({ concept: wrapper.concept, performance: wrapper.performance, set });
      } else {
        const concept = item as StudyConcept;
        if (concept && concept.id) {
          const set = allSets.find(s => s.id === concept.setId);
          results.push({ concept, set });
        }
      }
    });
    return results;
  }, [reviewItems]);

  // Group review items by subject category
  const groupedByCategory = useMemo(() => {
    const map: Record<string, ReviewItemWrapper[]> = {};
    normalizedItems.forEach(item => {
      const cat = item.concept.category || item.set?.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [normalizedItems]);

  // Interleaved pool generated from StorageService
  const interleavedConcepts = useMemo(() => {
    return StorageService.getInterleavedReviewConcepts(12);
  }, [reviewItems]);

  const totalCount = normalizedItems.length;

  return (
    <div id="review-view-root" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Global Navigation: BACK + HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
      </div>

      {/* Top Header */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-[#D92B8A] rounded-full border border-pink-200 font-mono text-xs font-bold uppercase">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Spaced & Interleaved Retention Engine</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
            Review Queue
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
            {totalCount > 0
              ? `${totalCount} ${totalCount === 1 ? 'concept needs' : 'concepts need'} active reinforcement to solidify into permanent long-term memory.`
              : 'Your review queue is currently clear! Solidify mastery across topics using interleaved practice below.'}
          </p>
        </div>

        {totalCount > 0 && (
          <button
            id="start-all-spaced-review-btn"
            onClick={() => onStartReviewSession(normalizedItems.map(r => r.concept))}
            className="px-6 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Spaced Review ({totalCount})</span>
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-stone-100/80 p-1.5 rounded-full border border-stone-200/80 max-w-md">
        <button
          id="tab-spaced-review"
          onClick={() => setActiveTab('spaced')}
          className={`flex-1 py-2.5 px-4 font-display text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${
            activeTab === 'spaced'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#D92B8A]" />
          <span>Spaced Queue ({totalCount})</span>
        </button>

        <button
          id="tab-interleaved-review"
          onClick={() => setActiveTab('interleaved')}
          className={`flex-1 py-2.5 px-4 font-display text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${
            activeTab === 'interleaved'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Shuffle className="w-4 h-4 text-[#D92B8A]" />
          <span>Interleaved ({interleavedConcepts.length})</span>
        </button>
      </div>

      {/* TAB 1: SPACED REVIEW QUEUE */}
      {activeTab === 'spaced' && (
        <>
          {totalCount === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900">
                  All Caught Up!
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed font-normal">
                  You don&apos;t have any flagged concepts in your review queue right now. As you rate flashcards, any concepts you need to revisit will appear here automatically.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  id="empty-interleaved-practice-btn"
                  onClick={() => onStartReviewSession(interleavedConcepts, 'Interleaved Practice')}
                  className="px-6 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Try Interleaved Practice</span>
                </button>
                <button
                  id="empty-explore-sets-btn"
                  onClick={onExploreSets}
                  className="px-6 py-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <FolderOpen className="w-4 h-4 text-stone-600" />
                  <span>Explore Study Sets</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(groupedByCategory) as [string, ReviewItemWrapper[]][]).map(([category, items]) => (
                <div 
                  key={category} 
                  className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
                        Subject Category
                      </span>
                      <h3 className="font-display font-black text-xl text-stone-900">
                        {category} <span className="text-stone-500 font-mono text-sm font-normal">({items.length} {items.length === 1 ? 'Concept' : 'Concepts'})</span>
                      </h3>
                    </div>

                    <button
                      onClick={() => onStartReviewSession(items.map(i => i.concept), category)}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-display text-xs font-bold uppercase rounded-full shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto active:scale-95"
                    >
                      <span>Review Subject</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map(({ concept, set }) => (
                      <div 
                        key={concept.id} 
                        className="p-5 bg-stone-50/60 border border-stone-200/90 rounded-2xl space-y-2.5 shadow-xs hover:border-pink-200 hover:bg-white transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-display font-bold text-base text-stone-900">
                            {concept.title}
                          </span>
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 uppercase rounded-full whitespace-nowrap">
                            Needs Review
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 font-normal">
                          {concept.summary}
                        </p>
                        <div className="font-mono text-xs text-stone-500 pt-1 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#D92B8A]" />
                          <span>Set:</span>
                          <span className="font-bold text-stone-800 truncate">{set?.title || concept.category || 'Study Set'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: INTERLEAVED MULTI-TOPIC REVIEW */}
      {activeTab === 'interleaved' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-stone-100 pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-[#D92B8A] font-mono text-xs font-bold uppercase rounded-full border border-pink-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cognitive Science Principle</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900">
              Why Interleaved Review Works
            </h2>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed font-normal">
              Practicing multiple topics mixed together forces your brain to continually discriminate between concepts, preventing the false sense of mastery caused by single-topic repetition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {interleavedConcepts.map((concept, idx) => (
              <div 
                key={concept.id} 
                className="p-4 bg-stone-50/60 border border-stone-200/90 rounded-2xl space-y-2 shadow-xs hover:bg-white hover:border-pink-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-pink-50 text-[#D92B8A] border border-pink-200 px-2 py-0.5 rounded-full">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 bg-white border border-stone-200 uppercase rounded-full text-stone-700 font-bold">
                      {concept.category}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-stone-900 truncate">
                    {concept.title}
                  </h4>
                  <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed font-normal">
                    {concept.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              id="start-interleaved-btn"
              onClick={() => onStartReviewSession(interleavedConcepts, 'Interleaved Multi-Topic Session')}
              className="px-7 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Start Interleaved Session ({interleavedConcepts.length} Concepts)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ PLATFORM COMPANION CALLOUT */}
      <div className="bg-stone-50/80 border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-stone-200 text-stone-700 font-mono text-xs font-bold uppercase rounded-full">
            <span>External Practice</span>
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900">
            Ready to Test Your Timed Knowledge?
          </h3>
          <p className="text-sm text-stone-600 font-normal max-w-xl">
            Take timed quizzes and global challenges on the Proudly Afrikan Quiz platform.
          </p>
        </div>

        <a
          href="https://proudlyafrikan.com/quiz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-pink-50 border border-stone-200 text-stone-900 hover:text-[#D92B8A] hover:border-pink-300 font-display text-xs font-bold uppercase rounded-full shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
        >
          <span>Take the Quiz</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
