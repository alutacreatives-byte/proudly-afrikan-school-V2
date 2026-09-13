import React, { useState, useEffect } from 'react';
import { 
  StudyToolType, 
  StudySet, 
  AppView, 
  StudyGuideResult,
  FlashcardsResult,
  StudyQuizResult,
  EssayGraderResult,
  PdfQuizResult,
  TutorChatResult,
  PresentationResult,
  CourseResult,
  LearningPathResult
} from './types';
import { StudyHome } from './components/StudyHome';
import { StudyGuideGenerator } from './components/generators/StudyGuideGenerator';
import { FlashcardGenerator } from './components/generators/FlashcardGenerator';
import { EssayGraderGenerator } from './components/generators/EssayGraderGenerator';
import { TutorChatGenerator } from './components/generators/TutorChatGenerator';
import { StudyPresentationGenerator } from './components/generators/StudyPresentationGenerator';
import { StudyCourseGenerator } from './components/generators/StudyCourseGenerator';
import { StudyLearningPathGenerator } from './components/generators/StudyLearningPathGenerator';
import { StudyMyResources } from './components/StudyMyResources';
import { FlashcardsView } from './components/FlashcardsView';
import { PracticeView } from './components/PracticeView';
import { StudySessionView } from './components/StudySessionView';
import { StudySetDetailView } from './components/StudySetDetailView';
import { StudyTutorModal } from './components/StudyTutorModal';
import { StorageService } from './services/storageService';
import { getSavedResources } from '../build/utils/storage';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';

export interface StudyAppProps {
  initialSet?: StudySet | null;
  initialView?: AppView;
  onNavigateToTab?: (tab: 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER') => void;
  onOpenGlobalTutor?: () => void;
  onGoHome?: () => void;
  onBackToPreviousPage?: () => void;
}

interface StudyHistoryItem {
  tool: StudyToolType | 'my-resources' | 'legacy-view' | null;
  resource: any;
  legacySet: StudySet | null;
  legacyView: AppView | null;
}

export default function StudyApp({
  initialSet,
  initialView,
  onNavigateToTab,
  onOpenGlobalTutor,
  onGoHome,
  onBackToPreviousPage,
}: StudyAppProps = {}) {
  const [activeTool, setActiveTool] = useState<StudyToolType | 'my-resources' | 'legacy-view' | null>(
    initialView && initialView !== 'home' ? 'legacy-view' : null
  );
  const [activeResource, setActiveResource] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(() => getSavedResources().length);

  // Legacy set state for cross-tab compatibility
  const [activeLegacySet, setActiveLegacySet] = useState<StudySet | null>(initialSet || null);
  const [legacyView, setLegacyView] = useState<AppView | null>(initialView || null);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  // Navigation history stack for internal Study views
  const [historyStack, setHistoryStack] = useState<StudyHistoryItem[]>([
    {
      tool: initialView && initialView !== 'home' ? 'legacy-view' : null,
      resource: null,
      legacySet: initialSet || null,
      legacyView: initialView && initialView !== 'home' ? initialView : null,
    },
  ]);

  useEffect(() => {
    if (initialSet) {
      setActiveLegacySet(initialSet);
      if (initialView && initialView !== 'home') {
        setLegacyView(initialView);
        setActiveTool('legacy-view');
        setHistoryStack([
          { tool: null, resource: null, legacySet: null, legacyView: null },
          { tool: 'legacy-view', resource: null, legacySet: initialSet, legacyView: initialView },
        ]);
      }
    }
  }, [initialSet, initialView]);

  const refreshSavedCount = () => {
    setSavedCount(getSavedResources().length);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTool]);

  const handleSelectTool = (
    toolId: StudyToolType, 
    prefillTopic?: string, 
    prefillCategory?: string,
    initialData?: { sourceSnippet?: string; documentName?: string; capturedPhotoUrl?: string; [key: string]: any }
  ) => {
    let nextResource: any = null;
    if (initialData) {
      nextResource = {
        id: `temp-${Date.now()}`,
        title: prefillTopic || initialData.documentName || '',
        topic: prefillTopic || initialData.documentName || '',
        subject: prefillCategory || 'GENERAL STUDIES',
        sourceSnippet: initialData.sourceSnippet || '',
        documentName: initialData.documentName || '',
        createdAt: new Date().toISOString(),
        toolType: toolId,
        ...initialData,
      };
    } else if (prefillTopic) {
      nextResource = {
        id: `temp-${Date.now()}`,
        title: prefillTopic,
        topic: prefillTopic,
        subject: prefillCategory,
        createdAt: new Date().toISOString(),
        toolType: toolId,
      };
    }

    setActiveResource(nextResource);
    setActiveTool(toolId);
    setHistoryStack((prev) => [
      ...prev,
      {
        tool: toolId,
        resource: nextResource,
        legacySet: activeLegacySet,
        legacyView,
      },
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedResource = (resource: any) => {
    const res = resource.data || resource;
    const toolType = resource.toolType as StudyToolType;
    setActiveResource(res);
    setActiveTool(toolType);
    setHistoryStack((prev) => [
      ...prev,
      {
        tool: toolType,
        resource: res,
        legacySet: activeLegacySet,
        legacyView,
      },
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMyResources = () => {
    setActiveTool('my-resources');
    setHistoryStack((prev) => [
      ...prev,
      {
        tool: 'my-resources',
        resource: null,
        legacySet: activeLegacySet,
        legacyView,
      },
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLegacyMode = (mode: AppView) => {
    setLegacyView(mode);
    setActiveTool('legacy-view');
    setHistoryStack((prev) => [
      ...prev,
      {
        tool: 'legacy-view',
        resource: null,
        legacySet: activeLegacySet,
        legacyView: mode,
      },
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // [Back] returns to the previous page (internal Study history, or previous page/tab)
  const handleBack = () => {
    if (historyStack.length > 1) {
      const nextStack = [...historyStack];
      nextStack.pop();
      const prevEntry = nextStack[nextStack.length - 1];
      setHistoryStack(nextStack);
      setActiveTool(prevEntry.tool);
      setActiveResource(prevEntry.resource);
      setActiveLegacySet(prevEntry.legacySet);
      setLegacyView(prevEntry.legacyView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTool !== null || (legacyView !== null && legacyView !== 'home')) {
      handleBackToGrid();
    } else {
      if (onBackToPreviousPage) {
        onBackToPreviousPage();
      } else if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      }
    }
  };

  // [Home] returns to the main School home page
  const handleGoHome = () => {
    setActiveTool(null);
    setActiveResource(null);
    setActiveLegacySet(null);
    setLegacyView(null);
    setHistoryStack([
      { tool: null, resource: null, legacySet: null, legacyView: null },
    ]);
    if (onGoHome) {
      onGoHome();
    } else if (onNavigateToTab) {
      onNavigateToTab('STUDY');
    }
    refreshSavedCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setActiveTool(null);
    setActiveResource(null);
    setLegacyView(null);
    setHistoryStack([
      { tool: null, resource: null, legacySet: activeLegacySet, legacyView: null },
    ]);
    refreshSavedCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Legacy interactions
  const handleRecordFlashcardRating = (conceptId: string, rating: any) => {
    StorageService.recordFlashcardRating(conceptId, rating);
  };

  const handleRecordPracticeAnswer = (conceptId: string, isCorrect: boolean) => {
    StorageService.recordPracticeAnswer(conceptId, isCorrect);
  };

  const renderActiveContent = () => {
    // 1. My Saved Study Library
    if (activeTool === 'my-resources') {
      return (
        <StudyMyResources
          onBack={handleBack}
          onOpenResource={handleOpenSavedResource}
        />
      );
    }

    // 2. Study Guide Generator (Tool 01)
    if (activeTool === 'study-guide') {
      return (
        <StudyGuideGenerator
          key="gen-study-guide"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as StudyGuideResult}
        />
      );
    }

    // 3. Flashcard Generator (Tool 02)
    if (activeTool === 'flashcards') {
      return (
        <FlashcardGenerator
          key="gen-flashcards"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as FlashcardsResult}
        />
      );
    }

    // 4. Essay Grader (Tool 04 - replaced Practice Quiz Generator)
    if (activeTool === 'essay-grader' || (activeTool as any) === 'quiz') {
      return (
        <EssayGraderGenerator
          key="gen-essay-grader"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as EssayGraderResult}
        />
      );
    }

    // 5. Tutor Chat (Tool 05 - replaced PDF & Document Quiz)
    if (activeTool === 'pdf-quiz' || (activeTool as any) === 'tutor-chat') {
      return (
        <TutorChatGenerator
          key="gen-tutor-chat"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as TutorChatResult}
        />
      );
    }

    // 6. Presentation Slide Generator (Tool 05)
    if (activeTool === 'presentation') {
      return (
        <StudyPresentationGenerator
          key="gen-presentation"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as PresentationResult}
        />
      );
    }

    // 7. Course Curriculum Generator (Tool 06)
    if (activeTool === 'course') {
      return (
        <StudyCourseGenerator
          key="gen-course"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as CourseResult}
        />
      );
    }

    // 8. Learning Pathway Generator (Tool 07)
    if (activeTool === 'learning-path') {
      return (
        <StudyLearningPathGenerator
          key="gen-learning-path"
          onBack={handleBack}
          onSaved={refreshSavedCount}
          existingResource={activeResource as LearningPathResult}
        />
      );
    }

    // Legacy Views for sets launched from My Sets workspace or Planner
    if (activeTool === 'legacy-view' && activeLegacySet) {
      if (legacyView === 'flashcards') {
        return (
          <FlashcardsView
            studySet={activeLegacySet}
            onBack={handleBack}
            onGoHome={handleGoHome}
            onRecordRating={handleRecordFlashcardRating}
            onCompleteSession={() => handleBack()}
          />
        );
      }
      if (legacyView === 'practice') {
        return (
          <PracticeView
            studySet={activeLegacySet}
            onBack={handleBack}
            onGoHome={handleGoHome}
            onRecordAnswer={handleRecordPracticeAnswer}
            onCompletePractice={() => handleBack()}
            onNavigateToFlashcards={() => handleLaunchLegacyMode('flashcards')}
          />
        );
      }
      if (legacyView === 'study' || legacyView === 'learn') {
        return (
          <StudySessionView
            studySet={activeLegacySet}
            onBack={handleBack}
            onGoHome={handleGoHome}
            onFinishLesson={() => handleBack()}
            onNavigateToFlashcards={() => handleLaunchLegacyMode('flashcards')}
            onNavigateToPractice={() => handleLaunchLegacyMode('practice')}
          />
        );
      }
      return (
        <StudySetDetailView
          studySet={activeLegacySet}
          onBack={handleBack}
          onGoHome={handleGoHome}
          onLaunchMode={handleLaunchLegacyMode}
          onLaunchConceptLesson={() => handleLaunchLegacyMode('study')}
        />
      );
    }

    // Default Main Study View (Home Grid)
    return (
      <StudyHome
        onSelectTool={handleSelectTool}
        onOpenMyResources={handleOpenMyResources}
        savedCount={savedCount}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Top Navigation Header in STUDY: [Back] and [Home] - displayed ONLY when a user opens a module */}
      {activeTool !== null && (
        <div className="w-full bg-[#FAF7F0] border-b border-stone-200/80 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <GlobalNavigationButtons
              onBack={handleBack}
              onGoHome={handleGoHome}
              backLabel="Back"
              homeLabel="Home"
            />

            <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider hidden sm:block">
              {`STUDY • ${String(activeTool).replace('-', ' ').toUpperCase()}`}
            </div>
          </div>
        </div>
      )}

      {/* Active Study View */}
      {renderActiveContent()}

      {/* Global AI Tutor Modal */}
      {isTutorOpen && (
        <StudyTutorModal
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          studySet={activeLegacySet}
          availableSets={StorageService.getAllSets()}
          initialMode="tutor"
        />
      )}
    </div>
  );
}
