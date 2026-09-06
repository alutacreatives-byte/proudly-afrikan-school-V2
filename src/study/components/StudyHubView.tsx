import React, { useState } from 'react';
import { StudySet, AppView, UserStats } from '../types';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  CalendarDays, 
  FolderPlus, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Clock, 
  Flame, 
  ChevronRight, 
  GraduationCap, 
  Folder, 
  Bookmark,
  Search
} from 'lucide-react';

interface StudyHubViewProps {
  studySets: StudySet[];
  activeSet: StudySet | null;
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  onNavigate: (view: AppView, categoryFilter?: string) => void;
  reviewItemsCount: number;
  stats: UserStats;
  onCreateSetClick: () => void;
  onBack?: () => void;
}

export const StudyHubView: React.FC<StudyHubViewProps> = ({
  studySets,
  activeSet,
  onSelectSet,
  onNavigate,
  reviewItemsCount,
  stats,
  onCreateSetClick,
  onBack,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const studyEngines = [
    {
      id: 'study' as AppView,
      num: '01',
      title: 'LEARN & GUIDED LESSONS',
      tag: 'DEEP CONCEPTS',
      subtitle: 'Master key principles, concrete historical examples, analogies, and active self-explanation.',
      icon: BookOpen,
      btnText: 'START LESSONS',
      accentColor: 'text-[#D92B8A]',
      bgAccent: 'bg-pink-50',
      isPrimary: true,
    },
    {
      id: 'flashcards' as AppView,
      num: '02',
      title: 'FLASHCARDS',
      tag: 'ACTIVE RECALL',
      subtitle: 'Test memory retention with dynamic prompt flipping and 4-tier Leitner confidence ratings.',
      icon: Layers,
      btnText: 'FLIP CARDS',
      accentColor: 'text-amber-600',
      bgAccent: 'bg-amber-50',
    },
    {
      id: 'practice' as AppView,
      num: '03',
      title: 'PRACTISE & QUIZZES',
      tag: 'FORMATIVE FEEDBACK',
      subtitle: 'Reinforce knowledge with immediate diagnostic explanations and pedagogical step-by-step rationales.',
      icon: CheckCircle2,
      btnText: 'START PRACTICE',
      accentColor: 'text-emerald-600',
      bgAccent: 'bg-emerald-50',
    },
    {
      id: 'review' as AppView,
      num: '04',
      title: 'SPACED REVIEW QUEUE',
      tag: reviewItemsCount > 0 ? `${reviewItemsCount} DUE` : 'SPACED REPETITION',
      subtitle: 'Reinforce vulnerable concepts that need retention attention using optimal memory intervals.',
      icon: RotateCcw,
      btnText: 'OPEN REVIEW QUEUE',
      badge: reviewItemsCount > 0 ? `${reviewItemsCount} Due` : undefined,
      accentColor: 'text-[#D92B8A]',
      bgAccent: 'bg-pink-50',
    },
    {
      id: 'planner' as AppView,
      num: '05',
      title: 'TIME-BOXED PLANNER',
      tag: 'STRUCTURED SESSIONS',
      subtitle: 'Time-boxed 5, 10, 20, or 30-minute high-efficiency study sprints tailored to your daily goals.',
      icon: CalendarDays,
      btnText: 'PLAN STUDY SPRINT',
      accentColor: 'text-indigo-600',
      bgAccent: 'bg-indigo-50',
    },
    {
      id: 'sets' as AppView,
      num: '06',
      title: 'SUBJECTS & STUDY SETS',
      tag: `${studySets.length} SETS AVAILABLE`,
      subtitle: 'Explore full curriculum libraries across African History, Literature, Geography, Science, and custom sets.',
      icon: FolderPlus,
      btnText: 'BROWSE ALL SETS',
      accentColor: 'text-stone-800',
      bgAccent: 'bg-stone-100',
    },
  ];

  const filteredSets = studySets.filter(s => 
    s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Back Button */}
      {onBack && (
        <button
          id="study-hub-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-stone-600 hover:text-[#D92B8A] uppercase tracking-wider transition-colors px-3.5 py-1.5 bg-white border border-stone-200 rounded-full shadow-xs hover:border-pink-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}

      {/* 1. Header Banner & Active Set Context */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-9 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-stone-100 border border-stone-300 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-stone-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D92B8A] inline-block animate-pulse"></span>
              <span>PEDAGOGICAL ARCHITECTURE • 6 STUDY ENGINES</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              STUDY. <span className="text-[#D92B8A]">THE 6 ENGINES.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-700 font-normal leading-relaxed">
              Master curriculum material through structured concept lessons, active recall flashcards, formative practice, spaced review, time-boxed planning, and comprehensive subject libraries.
            </p>
          </div>

          {/* Quick Active Set Card / Selector */}
          {activeSet && (
            <div className="w-full lg:w-96 bg-[#FAF8F5] border-2 border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                <span>ACTIVE STUDY SET</span>
                <span className="text-[#D92B8A]">{activeSet.category}</span>
              </div>
              <h3 className="font-display font-black text-lg text-stone-900 leading-snug line-clamp-2">
                {activeSet.title}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono text-stone-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#D92B8A]" />
                  {activeSet.concepts.length} Concepts
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  ~{activeSet.estimatedMinutes || 10} Mins
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex gap-2">
                <button
                  onClick={() => onSelectSet(activeSet, 'study')}
                  className="flex-1 py-2 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm text-center"
                >
                  LEARN NOW
                </button>
                <button
                  onClick={() => onSelectSet(activeSet, 'flashcards')}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center"
                >
                  CARDS
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. THE 6 STUDY ENGINES GRID */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              ALL 6 PEDAGOGICAL MODES
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#161616] leading-none">
              CHOOSE A STUDY ENGINE.
            </h2>
          </div>
          <span className="font-mono text-xs font-semibold text-stone-500 uppercase tracking-wider">
            CLICK ANY ENGINE TO LAUNCH ON YOUR ACTIVE STUDY MATERIAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyEngines.map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                id={`study-hub-engine-${engine.id}`}
                onClick={() => {
                  if (activeSet && ['study', 'flashcards', 'practice'].includes(engine.id)) {
                    onSelectSet(activeSet, engine.id);
                  } else {
                    onNavigate(engine.id);
                  }
                }}
                className={`bg-white border border-stone-200/90 rounded-3xl p-7 flex flex-col justify-between cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(217,43,138,0.14)] hover:border-pink-300 hover:-translate-y-0.5 transition-all ${
                  engine.isPrimary ? 'ring-2 ring-[#D92B8A]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="font-mono text-sm font-black text-stone-400">
                        {engine.num}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {engine.badge && (
                        <span className="px-3 py-1 bg-[#D92B8A] text-white text-xs font-mono font-bold uppercase rounded-full shadow-sm animate-pulse">
                          {engine.badge}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-mono font-bold uppercase rounded-full border border-stone-200">
                        {engine.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors leading-tight mb-2">
                    {engine.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                    {engine.subtitle}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display text-xs font-black uppercase text-stone-800 tracking-wider group-hover:translate-x-1 transition-transform">
                    <span className="w-6 h-[2px] bg-[#D92B8A] transition-all group-hover:w-10"></span>
                    <span>{engine.btnText}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AVAILABLE CURRICULUM SETS & SWITCHER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              CURRICULUM & CUSTOM SETS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616] leading-none">
              AVAILABLE STUDY SETS.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter study sets..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-full text-xs font-mono text-stone-900 focus:outline-none focus:border-[#D92B8A] w-48 sm:w-64"
              />
            </div>
            <button
              onClick={() => onNavigate('sets')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-display text-xs font-bold uppercase tracking-wider rounded-full transition-colors whitespace-nowrap"
            >
              EXPLORE ALL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.slice(0, 6).map((set) => {
            const isSelected = activeSet?.id === set.id;
            return (
              <div
                key={set.id}
                onClick={() => onSelectSet(set, 'study')}
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  isSelected 
                    ? 'border-[#D92B8A] ring-2 ring-[#D92B8A]/30 bg-pink-50/20' 
                    : 'border-stone-200/90 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-stone-100 text-stone-800 text-[11px] font-mono font-bold uppercase rounded-full border border-stone-200">
                      {set.category}
                    </span>
                    {isSelected && (
                      <span className="px-2.5 py-0.5 bg-[#D92B8A] text-white text-[10px] font-mono font-bold uppercase rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-black text-lg text-stone-900 mb-2 leading-snug">
                    {set.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {set.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>{set.concepts.length} Concepts &bull; ~{set.estimatedMinutes || 10}m</span>
                  <span className="font-display font-bold text-[#D92B8A] uppercase">LAUNCH →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
