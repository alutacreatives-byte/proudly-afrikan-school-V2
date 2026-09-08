import React, { useState, useMemo, useEffect } from 'react';
import { StudySet, AppView } from '../types';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  Search, 
  Plus, 
  Clock, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  LayoutGrid,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { 
  BROAD_SUBJECT_AREAS, 
  BroadSubjectArea, 
  setBelongsToBroadArea, 
  setMatchesSubSubject 
} from '../data/subjectCategories';
import { saveSearchResult } from '../../mysets/savedSearchService';

interface SubjectExplorerProps {
  studySets: StudySet[];
  initialCategory?: string;
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  onCreateSetClick: () => void;
  onDeleteCustomSet: (setId: string) => void;
  onOpenTutor?: (mode?: 'tutor' | 'homework', initialTopic?: string) => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const SubjectExplorer: React.FC<SubjectExplorerProps> = ({
  studySets,
  initialCategory = 'ALL SUBJECTS',
  onSelectSet,
  onCreateSetClick,
  onDeleteCustomSet,
  onOpenTutor,
  onBack,
  onGoHome,
}) => {
  const [selectedBroadArea, setSelectedBroadArea] = useState<string>(initialCategory);
  const [selectedSubSubject, setSelectedSubSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryDisplayMode, setCategoryDisplayMode] = useState<'wrap' | 'scroll'>('wrap');

  // Sync with initialCategory if passed from outside
  useEffect(() => {
    if (initialCategory) {
      const matchingBroad = BROAD_SUBJECT_AREAS.find(
        b => b.name.toUpperCase() === initialCategory.toUpperCase() ||
             b.shortName.toUpperCase() === initialCategory.toUpperCase() ||
             b.id.toUpperCase() === initialCategory.toUpperCase()
      );
      if (matchingBroad) {
        setSelectedBroadArea(matchingBroad.name);
        setSelectedSubSubject(null);
      } else if (initialCategory.toUpperCase() === 'MY CUSTOM SETS') {
        setSelectedBroadArea('MY CUSTOM SETS');
        setSelectedSubSubject(null);
      } else if (initialCategory.toUpperCase() === 'ALL SUBJECTS') {
        setSelectedBroadArea('ALL SUBJECTS');
        setSelectedSubSubject(null);
      } else {
        const parentBroad = BROAD_SUBJECT_AREAS.find(b => 
          b.subSubjects.some(sub => sub.toUpperCase() === initialCategory.toUpperCase())
        );
        if (parentBroad) {
          setSelectedBroadArea(parentBroad.name);
          const foundSub = parentBroad.subSubjects.find(sub => sub.toUpperCase() === initialCategory.toUpperCase());
          setSelectedSubSubject(foundSub || null);
        } else {
          setSelectedBroadArea(initialCategory);
          setSelectedSubSubject(null);
        }
      }
    }
  }, [initialCategory]);

  const activeBroadAreaObj = useMemo<BroadSubjectArea | undefined>(() => {
    return BROAD_SUBJECT_AREAS.find(
      b => b.name.toUpperCase() === selectedBroadArea.toUpperCase() ||
           b.shortName.toUpperCase() === selectedBroadArea.toUpperCase()
    );
  }, [selectedBroadArea]);

  const handleSelectBroadArea = (areaName: string) => {
    setSelectedBroadArea(areaName);
    setSelectedSubSubject(null);
  };

  const handleSelectSubSubject = (sub: string | null) => {
    setSelectedSubSubject(sub);
  };

  const filteredSets = useMemo(() => {
    return (studySets || []).filter(set => {
      if (!set) return false;

      // Custom sets filter
      if (selectedBroadArea === 'MY CUSTOM SETS') {
        if (!set.isCustom) return false;
      } else if (selectedBroadArea !== 'ALL SUBJECTS') {
        const belongsToArea = setBelongsToBroadArea(set, selectedBroadArea);
        if (!belongsToArea) return false;

        if (selectedSubSubject) {
          const matchesSub = setMatchesSubSubject(set, selectedSubSubject);
          if (!matchesSub) return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (set.title || '').toLowerCase().includes(q);
        const matchesDesc = (set.description || '').toLowerCase().includes(q);
        const matchesCategory = (set.category || '').toLowerCase().includes(q);
        const matchesConcepts = Array.isArray(set.concepts) && set.concepts.some(
          c =>
            c &&
            ((c.title || '').toLowerCase().includes(q) ||
            (c.summary || '').toLowerCase().includes(q) ||
            (c.flashcardQuestion || '').toLowerCase().includes(q) ||
            (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q))))
        );
        return matchesTitle || matchesDesc || matchesCategory || matchesConcepts;
      }

      return true;
    });
  }, [studySets, selectedBroadArea, selectedSubSubject, searchQuery]);

  return (
    <div className="space-y-8 pb-16 w-full max-w-full overflow-hidden">
      {/* Global Navigation: BACK + HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
      </div>

      {/* Top Editorial Header - Fully Responsive Layout */}
      <div className="border-b border-stone-200/90 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
        <div className="space-y-3 min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-stone-300/80 rounded-full shadow-sm text-xs font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2 h-2 rounded-full bg-[#D92B8A] inline-block animate-pulse"></span>
            <span>PROUDLY AFRIKAN • COMPREHENSIVE CURRICULUM</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-7xl uppercase tracking-tighter text-[#161616] leading-[0.9] break-words">
            EXPLORE<br />
            CURRICULUM<br />
            &<br />
            <span className="text-[#D92B8A]">RESOURCE<br />BUILDER.</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-stone-700 font-normal max-w-2xl leading-relaxed pt-1">
            <span className="text-[#D92B8A] font-bold">Proudly Afrikan</span> is an African learning platform where you can study and build anything across all academic disciplines.
          </p>
        </div>

        {/* Action Buttons - Stack on mobile, inline on tablet & desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
          {onOpenTutor && (
            <button
              onClick={() => onOpenTutor('homework', selectedSubSubject || (selectedBroadArea !== 'ALL SUBJECTS' ? selectedBroadArea : 'Mathematics & Science'))}
              className="w-full sm:w-auto px-5 py-3.5 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs sm:text-sm font-black tracking-wider uppercase rounded-full shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-[#D92B8A]" />
              <span>HOMEWORK HELP & TUTOR</span>
            </button>
          )}

          <button
            id="explorer-create-set-btn"
            onClick={onCreateSetClick}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black tracking-wider uppercase rounded-full shadow-[0_4px_16px_rgba(217,43,138,0.35)] flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>CREATE A STUDY SET</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-5">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="subject-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search all subjects, equations, historical events, authors, concepts, or terms..."
            className="w-full bg-white border border-stone-200/90 rounded-2xl py-3.5 pl-12 pr-20 text-sm font-medium text-stone-900 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-stone-500 hover:text-stone-900 bg-stone-100 px-3 py-1 rounded-full"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* 12 Broad Subject Categories Navigation */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono font-bold uppercase text-stone-500">
            <div className="flex items-center gap-2">
              <span className="text-stone-800">BROWSE BROAD SUBJECT AREAS</span>
              <span className="text-stone-400">•</span>
              <span className="text-[#D92B8A]">{filteredSets.length} Sets Available</span>
            </div>
            
            {/* View Mode Toggle: Wrap All vs Scroll */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-full border border-stone-200">
              <button
                onClick={() => setCategoryDisplayMode('wrap')}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                  categoryDisplayMode === 'wrap'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="View all categories wrapped neatly"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>GRID VIEW</span>
              </button>
              <button
                onClick={() => setCategoryDisplayMode('scroll')}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                  categoryDisplayMode === 'scroll'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Single line scroll"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>SLIDER</span>
              </button>
            </div>
          </div>

          {/* Category Navigation Pills - Fully Responsive */}
          <div 
            className={`${
              categoryDisplayMode === 'wrap'
                ? 'flex flex-wrap items-center gap-2 sm:gap-2.5'
                : 'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none'
            }`}
          >
            {/* All Subjects Option */}
            <button
              id="cat-filter-all-subjects"
              onClick={() => handleSelectBroadArea('ALL SUBJECTS')}
              className={`px-4 py-2.5 rounded-full font-display text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBroadArea === 'ALL SUBJECTS'
                  ? 'bg-[#18181B] text-white shadow-sm ring-2 ring-[#18181B]'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-sm'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ALL SUBJECTS</span>
            </button>

            {/* 12 Broad Categories */}
            {BROAD_SUBJECT_AREAS.map(area => {
              const isSelected = selectedBroadArea.toUpperCase() === area.name.toUpperCase();
              const isAfrican = area.id === 'african-knowledge';
              const Icon = area.icon;

              return (
                <button
                  key={area.id}
                  id={`cat-filter-${area.id}`}
                  onClick={() => handleSelectBroadArea(area.name)}
                  className={`px-4 py-2.5 rounded-full font-display text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? isAfrican 
                        ? 'bg-[#18181B] text-white shadow-sm ring-2 ring-[#18181B]'
                        : 'bg-[#D92B8A] text-white shadow-sm ring-2 ring-[#D92B8A]'
                      : isAfrican
                        ? 'bg-pink-50 text-[#D92B8A] border border-pink-200 hover:bg-pink-100/70'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-sm'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{area.name}</span>
                </button>
              );
            })}

            {/* My Custom Sets */}
            <button
              id="cat-filter-custom-sets"
              onClick={() => handleSelectBroadArea('MY CUSTOM SETS')}
              className={`px-4 py-2.5 rounded-full font-display text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBroadArea === 'MY CUSTOM SETS'
                  ? 'bg-[#18181B] text-white shadow-sm ring-2 ring-[#18181B]'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-sm'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>MY CUSTOM SETS</span>
            </button>
          </div>
        </div>

        {/* Sub-Subject Drill-down Banner if a Broad Category is Selected */}
        {activeBroadAreaObj && (
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                {React.createElement(activeBroadAreaObj.icon, { className: 'w-4 h-4 text-[#D92B8A]' })}
                <span className="font-display font-black text-sm uppercase text-[#161616]">
                  {activeBroadAreaObj.name} — Disciplines & Specific Subjects
                </span>
              </div>
              <span className="text-xs font-mono text-stone-500">
                Filter by specific discipline:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleSelectSubSubject(null)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full transition-all ${
                  selectedSubSubject === null
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                All {activeBroadAreaObj.shortName}
              </button>

              {activeBroadAreaObj.subSubjects.map(sub => {
                const isSubSelected = selectedSubSubject === sub;
                return (
                  <button
                    key={sub}
                    id={`sub-cat-${sub.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleSelectSubSubject(sub)}
                    className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full transition-all ${
                      isSubSelected
                        ? 'bg-[#D92B8A] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-pink-50 hover:text-[#D92B8A] border border-stone-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Study Sets - Responsive for Mobile (1 col), Tablet (2 cols), Desktop (3 cols) */}
      {filteredSets.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-[#D92B8A]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-[#161616]">
              {selectedSubSubject 
                ? `Study ${selectedSubSubject} with Proudly Afrikan` 
                : selectedBroadArea !== 'ALL SUBJECTS' 
                  ? `Study ${selectedBroadArea} with Proudly Afrikan` 
                  : 'No study sets found'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {searchQuery
                ? `No curriculum results matching "${searchQuery}". Create a custom study set or ask the Study Tutor for guided homework help.`
                : `Proudly Afrikan is an African learning platform where you can study anything. Generate comprehensive flashcards & practice sets, or get guided step-by-step homework help in ${selectedSubSubject || selectedBroadArea}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <button
              onClick={onCreateSetClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-black uppercase rounded-full shadow-md inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE {selectedSubSubject ? selectedSubSubject.toUpperCase() : 'A'} STUDY SET</span>
            </button>

            {onOpenTutor && (
              <button
                onClick={() => onOpenTutor('homework', selectedSubSubject || selectedBroadArea)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs font-black uppercase rounded-full shadow-md transition-colors inline-flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-[#D92B8A]" />
                <span>STUDY WITH TUTOR</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSets.map(set => (
            <div
              key={set.id}
              id={`study-set-card-${set.id}`}
              className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between group relative shadow-[0_10px_30px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_40px_rgba(217,43,138,0.12)] hover:border-pink-200 transition-all"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between mb-3.5 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-800 text-xs font-mono font-bold uppercase rounded-full truncate max-w-[160px]">
                      {set.category || 'GENERAL'}
                    </span>
                    {set.isCustom && (
                      <span className="px-2.5 py-0.5 bg-[#D92B8A] text-white text-xs font-mono font-bold uppercase rounded-full shadow-sm shrink-0">
                        CUSTOM
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-mono font-semibold text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-[#D92B8A]" />
                      {set.estimatedMinutes || 10}m
                    </span>
                    {set.isCustom && (
                      <button
                        title="Delete custom set"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${set.title}"?`)) {
                            onDeleteCustomSet(set.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 
                  onClick={() => onSelectSet(set, 'set-detail')}
                  className="font-display font-black text-lg sm:text-xl text-[#161616] uppercase leading-snug mb-2 cursor-pointer group-hover:text-[#D92B8A] transition-colors break-words"
                >
                  {set.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4 font-normal">
                  {set.description}
                </p>

                {/* Concept preview chips */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                    {(set.concepts || []).length} CONCEPTS INCLUDE:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(set.concepts || []).slice(0, 3).map(c => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-medium rounded-full truncate max-w-[180px]"
                      >
                        {c.title}
                      </span>
                    ))}
                    {(set.concepts || []).length > 3 && (
                      <span className="px-2.5 py-1 bg-stone-100 text-stone-500 text-xs font-mono font-bold rounded-full">
                        +{(set.concepts || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Launch Bar */}
              <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id={`set-study-btn-${set.id}`}
                    onClick={() => onSelectSet(set, 'study')}
                    className="py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-black uppercase rounded-full shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>LEARN</span>
                  </button>

                  <button
                    id={`set-cards-btn-${set.id}`}
                    onClick={() => onSelectSet(set, 'flashcards')}
                    className="py-2.5 bg-white border border-stone-300 hover:border-pink-300 text-stone-800 font-display text-xs font-black uppercase rounded-full shadow-sm hover:bg-pink-50/50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
                    <span>CARDS</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id={`set-practice-btn-${set.id}`}
                    onClick={() => onSelectSet(set, 'practice')}
                    className="py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#D92B8A]" />
                    <span>PRACTISE</span>
                  </button>

                  <button
                    id={`set-detail-btn-${set.id}`}
                    onClick={() => onSelectSet(set, 'set-detail')}
                    className="py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 flex items-center justify-center gap-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D92B8A]" />
                    <span>DETAILS</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
