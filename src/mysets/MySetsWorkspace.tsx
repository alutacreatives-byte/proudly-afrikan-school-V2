import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Trash2, 
  Copy, 
  Download, 
  ArrowRight,
  GraduationCap,
  Zap,
  ChevronDown,
  Bookmark
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { getRecentQuizzes, saveRecentQuiz } from '../quiz/utils/quizShare';
import { getSavedResources, saveResourceToStorage, deleteResourceFromStorage } from '../build/utils/storage';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';
import { SavedResource } from '../build/types';
import { SavedResultViewer } from './SavedResultViewer';
import { saveSearchResult } from './savedSearchService';
import { exportUnifiedItem } from '../utils/exportUtils';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';

export type ContentKind = 'all' | 'study-set' | 'quiz' | 'build' | 'search-result';

export interface UnifiedItem {
  id: string;
  kind: ContentKind;
  kindLabel: string;
  title: string;
  description: string;
  categoryOrSubject: string;
  createdAt: string;
  itemCount?: number;
  itemCountLabel?: string;
  durationMinutes?: number;
  originalStudySet?: StudySet;
  originalQuiz?: Quiz;
  originalBuildResource?: SavedResource;
}

interface MySetsWorkspaceProps {
  onOpenStudySet: (set: StudySet, view?: 'study' | 'flashcards' | 'practice') => void;
  onOpenQuiz: (quiz: Quiz) => void;
  onOpenBuildResource?: (resource: SavedResource) => void;
  onNavigateToStudy: () => void;
  onNavigateToQuiz: () => void;
  onNavigateToBuild?: () => void;
  onAddToPlanner?: (item: UnifiedItem) => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const MySetsWorkspace: React.FC<MySetsWorkspaceProps> = ({
  onOpenStudySet,
  onOpenQuiz,
  onOpenBuildResource,
  onNavigateToStudy,
  onNavigateToQuiz,
  onNavigateToBuild,
  onBack,
  onGoHome,
}) => {
  const [selectedKind, setSelectedKind] = useState<ContentKind>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [viewingItem, setViewingItem] = useState<UnifiedItem | null>(null);

  // Loaded items
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [buildResources, setBuildResources] = useState<SavedResource[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const loadAllContent = () => {
    try {
      const sets = StorageService.getAllStudySets();
      setStudySets(sets);
    } catch (e) {
      console.warn('Failed loading study sets', e);
    }

    try {
      const qs = getRecentQuizzes();
      setQuizzes(qs);
    } catch (e) {
      console.warn('Failed loading quizzes', e);
    }

    try {
      const bResources = getSavedResources();
      setBuildResources(bResources);
    } catch (e) {
      console.warn('Failed loading build resources', e);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveCurrentSearch = () => {
    if (!searchQuery.trim()) return;
    saveSearchResult({
      query: searchQuery.trim(),
      title: searchQuery.trim(),
      category: selectedSubject !== 'ALL' ? selectedSubject : 'Curriculum Search',
    });
    loadAllContent();
    showToast(`Search "${searchQuery.trim()}" saved to History!`);
  };

  // Convert all distinct data types into Unified Items
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [];

    // Study Sets
    studySets.forEach((set) => {
      items.push({
        id: `study-${set.id}`,
        kind: 'study-set',
        kindLabel: 'STUDY SET',
        title: set.title,
        description: set.description || 'Interactive concept breakdown with active recall flashcards.',
        categoryOrSubject: set.category || 'General Curriculum',
        createdAt: set.createdAt || new Date().toISOString(),
        itemCount: set.concepts?.length || 0,
        itemCountLabel: `${set.concepts?.length || 0} Concepts`,
        durationMinutes: set.estimatedMinutes || (set.concepts?.length || 1) * 3,
        originalStudySet: set,
      });
    });

    // Quizzes
    quizzes.forEach((quiz) => {
      items.push({
        id: `quiz-${quiz.id}`,
        kind: 'quiz',
        kindLabel: 'QUIZ ASSESSMENT',
        title: quiz.title,
        description: quiz.description || `Assessment on ${quiz.topicOrSource || 'custom topic'}.`,
        categoryOrSubject: quiz.settings?.subject || 'General Knowledge',
        createdAt: quiz.createdAt || new Date().toISOString(),
        itemCount: quiz.questions?.length || 0,
        itemCountLabel: `${quiz.questions?.length || 0} Questions`,
        durationMinutes: (quiz.questions?.length || 5) * 2,
        originalQuiz: quiz,
      });
    });

    // Build Resources (Exams, Worksheets, Lesson Plans, Courses, Saved Searches, etc.)
    buildResources.forEach((res) => {
      let kind: ContentKind = 'build';
      let kindLabel = 'BUILD RESOURCE';
      let itemCountLabel = '1 Document';

      if (res.toolType === 'exam') kindLabel = 'EXAM PAPER';
      else if (res.toolType === 'worksheet') kindLabel = 'WORKSHEET';
      else if (res.toolType === 'mind-map') kindLabel = 'MIND MAP';
      else if (res.toolType === 'lesson-plan') kindLabel = 'LESSON PLAN';
      else if (res.toolType === 'presentation') kindLabel = 'SLIDE DECK';
      else if (res.toolType === 'course-builder' || res.toolType === 'course') kindLabel = 'CURRICULUM COURSE';
      else if (res.toolType === 'learning-path') kindLabel = 'LEARNING PATH';
      else if (res.toolType === 'study-guide') kindLabel = 'STUDY GUIDE';
      else if (res.toolType === 'flashcards') kindLabel = 'FLASHCARD DECK';
      else if (res.toolType === 'quiz' || (res as any).toolType === 'study-quiz') kindLabel = 'PRACTICE QUIZ';
      else if (res.toolType === 'search-result') {
        kind = 'search-result';
        kindLabel = 'SAVED SEARCH';
        itemCountLabel = 'Research Archive';
      }

      const anyRes = res as any;
      const desc = anyRes.data?.summary || anyRes.data?.content || 
        (res.toolType === 'search-result' 
          ? `Archived research query: "${anyRes.topic || anyRes.data?.query || res.title}"`
          : `${anyRes.gradeLevel ? `${anyRes.gradeLevel} · ` : ''}${anyRes.topic ? `Topic: ${anyRes.topic}` : 'Created with Proudly Afrikan.'}`);

      items.push({
        id: `${kind}-${res.id}`,
        kind,
        kindLabel,
        title: res.title,
        description: desc,
        categoryOrSubject: anyRes.subject || anyRes.data?.category || 'Curriculum',
        createdAt: res.createdAt || new Date().toISOString(),
        itemCount: 1,
        itemCountLabel,
        durationMinutes: 30,
        originalBuildResource: res,
      });
    });

    return items;
  }, [studySets, quizzes, buildResources]);

  // Unique subjects for filter
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    unifiedItems.forEach((i) => {
      if (i.categoryOrSubject) set.add(i.categoryOrSubject);
    });
    return ['ALL', ...Array.from(set)];
  }, [unifiedItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      // Kind filter
      if (selectedKind !== 'all' && item.kind !== selectedKind) {
        return false;
      }
      // Subject filter
      if (selectedSubject !== 'ALL' && item.categoryOrSubject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryOrSubject.toLowerCase().includes(q) ||
          item.kindLabel.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [unifiedItems, selectedKind, selectedSubject, searchQuery, sortBy]);

  // Delete handler
  const handleDeleteItem = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    if (item.kind === 'study-set' && item.originalStudySet) {
      StorageService.deleteStudySet(item.originalStudySet.id);
      showToast('Study set removed.');
    } else if (item.kind === 'quiz' && item.originalQuiz) {
      const qs = quizzes.filter(q => q.id !== item.originalQuiz?.id);
      localStorage.setItem('proudly_afrikan_recent_quizzes', JSON.stringify(qs));
      showToast('Quiz removed.');
    } else if (item.kind === 'build' && item.originalBuildResource) {
      deleteResourceFromStorage(item.originalBuildResource.id);
      showToast('Build resource removed.');
    }
    loadAllContent();
  };

  // Duplicate handler
  const handleDuplicateItem = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.kind === 'study-set' && item.originalStudySet) {
      const dup: StudySet = {
        ...item.originalStudySet,
        id: `set-${Date.now()}`,
        title: `${item.originalStudySet.title} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveStudySet(dup);
      showToast('Study set duplicated.');
    } else if (item.kind === 'quiz' && item.originalQuiz) {
      const dup: Quiz = {
        ...item.originalQuiz,
        id: `quiz_${Date.now()}`,
        title: `${item.originalQuiz.title} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      saveRecentQuiz(dup);
      showToast('Quiz duplicated.');
    } else if (item.kind === 'build' && item.originalBuildResource) {
      const dup = {
        ...item.originalBuildResource,
        id: `res-${Date.now()}`,
        title: `${item.originalBuildResource.title} (Copy)`,
        createdAt: new Date().toISOString(),
      } as SavedResource;
      saveResourceToStorage(dup);
      showToast('Build resource duplicated.');
    }
    loadAllContent();
  };

  // Export DOC & PDF handlers
  const handleExportDoc = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    exportUnifiedItem(item, 'doc');
    showToast('Exported Word (.doc) document.');
  };

  const handleExportPdf = (item: UnifiedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    exportUnifiedItem(item, 'pdf');
    showToast('Exported PDF document.');
  };

  // Open item - Opens the previous generation results directly without showing the menu
  const handleOpenItem = (item: UnifiedItem) => {
    setViewingItem(item);
  };

  // Badge Color Style
  const getBadgeStyle = (kind: ContentKind) => {
    switch (kind) {
      case 'study-set':
      case 'quiz':
      case 'build':
        return 'bg-[#FFF0F3] text-[#E52E5E] border-[#FFCCD4]';
      case 'search-result':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getPlatformIcon = (kind: ContentKind) => {
    switch (kind) {
      case 'study-set':
      case 'quiz':
      case 'build':
        return <GraduationCap className="w-4.5 h-4.5 text-[#E52E5E]" />;
      case 'search-result':
        return <Search className="w-4.5 h-4.5 text-[#16A34A]" />;
      default:
        return <Layers className="w-4.5 h-4.5 text-[#E52E5E]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation Bar with Back & Home */}
        <div className="flex items-center justify-between">
          <GlobalNavigationButtons
            onBack={onBack || onNavigateToStudy}
            onGoHome={onGoHome}
            backLabel="Back"
            homeLabel="Home"
          />
        </div>

        {/* Toast */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-[#161616] text-white px-4 py-2.5 rounded-full shadow-xl font-mono text-xs flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-[#E52E5E]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header Banner matching 3D soft UI */}
        <div className="clay-card-3d p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E52E5E]">
              <Zap className="w-3.5 h-3.5 fill-[#E52E5E]/20" />
              <span>UNIFIED KNOWLEDGE REPOSITORY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#161616] uppercase">
              HISTORY & SAVED RESOURCES
            </h1>
            <p className="text-stone-700 text-xs sm:text-[13px] max-w-2xl font-normal leading-relaxed">
              Your central workspace containing all created study sets, active recall flashcards, interactive quizzes, and generated educational materials across Proudly Afrikan School.
            </p>
          </div>

          {/* Quick Create Buttons styled as tactile pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onNavigateToStudy}
              className="clay-btn-dark px-5 py-2.5 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>+ STUDY SET</span>
            </button>
            <button
              onClick={onNavigateToQuiz}
              className="clay-btn-crimson px-5 py-2.5 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-md"
            >
              <span>+ QUIZ</span>
            </button>
            {onNavigateToBuild && (
              <button
                onClick={onNavigateToBuild}
                className="clay-pill-3d px-5 py-2.5 font-mono font-bold text-xs uppercase tracking-wider text-[#161616] cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>+ BUILD RESOURCE</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="clay-card-3d p-5">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider">TOTAL RESOURCES</div>
            <div className="text-3xl font-display font-black text-[#161616] mt-1">{unifiedItems.length}</div>
          </div>
          <div className="clay-card-3d p-5">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider">STUDY SETS</div>
            <div className="text-3xl font-display font-black text-[#161616] mt-1">{studySets.length}</div>
          </div>
          <div className="clay-card-3d p-5">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider">QUIZZES</div>
            <div className="text-3xl font-display font-black text-[#161616] mt-1">{quizzes.length}</div>
          </div>
          <div className="clay-card-3d p-5">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider">BUILDS</div>
            <div className="text-3xl font-display font-black text-[#161616] mt-1">{buildResources.length}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="clay-card-3d p-5 sm:p-6 space-y-4">
          {/* Top Row: Search Input on Left, Dropdowns on Right */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search all sets, quizzes, exams, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F2ECE1] border border-[#E3D9C9] rounded-2xl pl-10 pr-24 py-2.5 text-xs sm:text-[13px] font-mono font-medium text-[#161616] focus:outline-none focus:bg-white focus:border-[#E52E5E] transition-all placeholder:text-stone-400"
              />
              {searchQuery.trim() && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSaveCurrentSearch}
                    className="px-2 py-1 bg-[#E52E5E] hover:bg-[#D02550] text-white text-[10px] font-mono font-bold uppercase rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="Save this search to History"
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>SAVE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-1.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-mono font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Subject Selector Pill */}
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="appearance-none bg-[#F2ECE1] border border-[#E3D9C9] rounded-full pl-4 pr-9 py-2 text-xs font-mono font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  {subjectsList.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'ALL' ? 'ALL SUBJECTS' : sub.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector Pill */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-[#F2ECE1] border border-[#E3D9C9] rounded-full pl-4 pr-9 py-2 text-xs font-mono font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">NEWEST FIRST</option>
                  <option value="oldest">OLDEST FIRST</option>
                  <option value="title">TITLE (A-Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Kind Filter Pills with glowing magenta active capsule */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono font-bold no-scrollbar pt-1">
            {[
              { id: 'all', label: 'All Content', hasZap: true },
              { id: 'study-set', label: 'Study Sets' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'build', label: 'Build Resources' },
              { id: 'search-result', label: 'Saved Searches' },
            ].map((tab) => {
              const count = tab.id === 'all' 
                ? unifiedItems.length 
                : unifiedItems.filter(i => i.kind === tab.id).length;
              const isActive = selectedKind === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedKind(tab.id as ContentKind)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
                    isActive
                      ? 'bg-[#E52E5E] text-white border-2 border-[#E52E5E] shadow-[0_0_16px_rgba(229,46,94,0.65)]'
                      : 'bg-[#EFEBE4] text-stone-700 hover:bg-[#E5DFD6]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.hasZap && isActive && <Zap className="w-3 h-3 text-white fill-white" />}
                  {!tab.hasZap && (
                    <span className="text-[11px] text-stone-500 ml-0.5">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
            <FolderOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-display font-black uppercase text-[#161616]">No Content Found</h3>
            <p className="text-xs sm:text-sm font-mono text-stone-500 max-w-md mx-auto">
              {searchQuery.trim()
                ? `No existing items matched "${searchQuery}". You can save this query as a research note in your archive.`
                : 'No matching resources found for this filter. Create a new study set, generate an interactive quiz, or create a build resource.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {searchQuery.trim() && (
                <button
                  onClick={handleSaveCurrentSearch}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save "{searchQuery}" To History</span>
                </button>
              )}
              <button
                onClick={onNavigateToStudy}
                className="bg-[#E52E5E] text-white px-5 py.5 rounded-full text-xs font-mono font-bold uppercase shadow-md cursor-pointer hover:bg-[#D02550] transition-colors"
              >
                Open Study Builder
              </button>
              <button
                onClick={onNavigateToQuiz}
                className="bg-[#161616] text-white px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase shadow-md cursor-pointer hover:bg-stone-800 transition-colors"
              >
                Open Quiz Builder
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="clay-card-3d-interactive p-6 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category Pill & Counter */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${getBadgeStyle(item.kind)} flex items-center gap-1.5`}>
                        {getPlatformIcon(item.kind)}
                        <span>{item.kindLabel}</span>
                      </span>

                      <span className="text-sm font-mono font-bold text-stone-600">
                        {item.itemCountLabel}
                      </span>
                    </div>

                    {/* Title in Inter font */}
                    <h3 className="font-inter font-bold text-lg sm:text-xl text-[#161616] group-hover:text-[#E52E5E] transition-colors line-clamp-2 leading-snug tracking-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="font-inter text-sm sm:text-base text-stone-600 line-clamp-3 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="mt-5 pt-4 border-t border-[#EAE3D6] flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                      <span className="truncate max-w-[160px] font-bold text-stone-800 uppercase">
                        {item.categoryOrSubject}
                      </span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateItem(item, e)}
                          className="p-2 rounded-full bg-white border border-[#EAE3D6] hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors shadow-xs cursor-pointer"
                          title="Duplicate Item"
                        >
                          <Copy className="w-4.5 h-4.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportDoc(item, e)}
                          className="px-2.5 py-1.5 rounded-full bg-white border border-[#EAE3D6] hover:bg-stone-100 text-stone-700 transition-colors shadow-xs cursor-pointer font-mono text-xs font-bold uppercase flex items-center gap-1"
                          title="Download Word Document (.doc)"
                        >
                          <Download className="w-4 h-4 text-[#E52E5E]" />
                          <span>DOC</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportPdf(item, e)}
                          className="px-2.5 py-1.5 rounded-full bg-white border border-[#EAE3D6] hover:bg-stone-100 text-stone-700 transition-colors shadow-xs cursor-pointer font-mono text-xs font-bold uppercase flex items-center gap-1"
                          title="Download PDF Document (.pdf)"
                        >
                          <Download className="w-4 h-4 text-[#E52E5E]" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(item, e)}
                          className="p-2 rounded-full bg-white border border-[#EAE3D6] hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {/* Primary Open Trigger */}
                      <span className="text-sm font-mono font-bold text-[#161616] group-hover:text-[#E52E5E] flex items-center gap-1.5 uppercase tracking-wider">
                        <span>OPEN</span>
                        <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Actual Saved Result Viewer Modal */}
      {viewingItem && (
        <SavedResultViewer
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onBack={() => setViewingItem(null)}
          onGoHome={() => {
            setViewingItem(null);
            if (onGoHome) onGoHome();
          }}
          onLaunchPractice={(mode) => {
            const current = viewingItem;
            setViewingItem(null);
            if (current.originalStudySet) {
              onOpenStudySet(current.originalStudySet, mode);
            }
          }}
          onOpenInWorkbench={() => {
            const current = viewingItem;
            setViewingItem(null);
            if (current.kind === 'study-set' && current.originalStudySet) {
              onOpenStudySet(current.originalStudySet, 'study');
            } else if (current.kind === 'quiz' && current.originalQuiz) {
              onOpenQuiz(current.originalQuiz);
            } else if ((current.kind === 'build' || current.kind === 'search-result') && current.originalBuildResource) {
              if (onOpenBuildResource) {
                onOpenBuildResource(current.originalBuildResource);
              } else if (onNavigateToBuild) {
                onNavigateToBuild();
              }
            }
          }}
        />
      )}
    </div>
  );
};
