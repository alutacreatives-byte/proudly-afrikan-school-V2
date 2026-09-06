import React, { useState, useEffect } from 'react';
import { 
  StudyToolType, 
  StudySet, 
  AppView, 
  StudyGuideResult,
  FlashcardsResult,
  StudyQuizResult,
  PdfQuizResult,
  PresentationResult,
  CourseResult,
  LearningPathResult
} from './types';
import { StudyHome } from './components/StudyHome';
import { StudyGuideGenerator } from './components/generators/StudyGuideGenerator';
import { FlashcardGenerator } from './components/generators/FlashcardGenerator';
import { StudyQuizGenerator } from './components/generators/StudyQuizGenerator';
import { PdfQuizGenerator } from './components/generators/PdfQuizGenerator';
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

export interface StudyAppProps {
  initialSet?: StudySet | null;
  initialView?: AppView;
  onNavigateToTab?: (tab: 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER') => void;
  onOpenGlobalTutor?: () => void;
}

export default function StudyApp({
  initialSet,
  initialView,
  onNavigateToTab,
  onOpenGlobalTutor,
}: StudyAppProps = {}) {
  const [activeTool, setActiveTool] = useState<StudyToolType | 'my-resources' | 'legacy-view' | null>(null);
  const [activeResource, setActiveResource] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(() => getSavedResources().length);

  // Legacy set state for cross-tab compatibility
  const [activeLegacySet, setActiveLegacySet] = useState<StudySet | null>(initialSet || null);
  const [legacyView, setLegacyView] = useState<AppView | null>(initialView || null);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialSet) {
      setActiveLegacySet(initialSet);
      if (initialView && initialView !== 'home') {
        setLegacyView(initialView);
        setActiveTool('legacy-view');
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
    if (initialData) {
      setActiveResource({
        id: `temp-${Date.now()}`,
        title: prefillTopic || initialData.documentName || 'Study Material',
        topic: prefillTopic || initialData.documentName || 'Study Material',
        subject: prefillCategory || 'GENERAL STUDIES',
        sourceSnippet: initialData.sourceSnippet || '',
        documentName: initialData.documentName || '',
        createdAt: new Date().toISOString(),
        toolType: toolId,
        ...initialData,
      });
    } else if (prefillTopic) {
      setActiveResource({
        id: `temp-${Date.now()}`,
        title: prefillTopic,
        topic: prefillTopic,
        subject: prefillCategory,
        createdAt: new Date().toISOString(),
        toolType: toolId,
      });
    } else {
      setActiveResource(null);
    }
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedResource = (resource: any) => {
    setActiveResource(resource.data || resource);
    setActiveTool(resource.toolType as StudyToolType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setActiveTool(null);
    setActiveResource(null);
    setLegacyView(null);
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

  // 1. My Saved Study Library
  if (activeTool === 'my-resources') {
    return (
      <StudyMyResources
        onBack={handleBackToGrid}
        onOpenResource={handleOpenSavedResource}
      />
    );
  }

  // 2. Study Guide Generator (Tool 01)
  if (activeTool === 'study-guide') {
    return (
      <StudyGuideGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as StudyGuideResult}
      />
    );
  }

  // 3. Flashcard Generator (Tool 02)
  if (activeTool === 'flashcards') {
    return (
      <FlashcardGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as FlashcardsResult}
      />
    );
  }

  // 4. Practice Quiz Generator (Tool 03)
  if (activeTool === 'quiz') {
    return (
      <StudyQuizGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as StudyQuizResult}
      />
    );
  }

  // 5. PDF & Document Quiz (Tool 04)
  if (activeTool === 'pdf-quiz') {
    return (
      <PdfQuizGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as PdfQuizResult}
      />
    );
  }

  // 6. Presentation Slide Generator (Tool 05)
  if (activeTool === 'presentation') {
    return (
      <StudyPresentationGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as PresentationResult}
      />
    );
  }

  // 7. Course Curriculum Generator (Tool 06)
  if (activeTool === 'course') {
    return (
      <StudyCourseGenerator
        onBack={handleBackToGrid}
        onSaved={refreshSavedCount}
        existingResource={activeResource as CourseResult}
      />
    );
  }

  // 8. Learning Pathway Generator (Tool 07)
  if (activeTool === 'learning-path') {
    return (
      <StudyLearningPathGenerator
        onBack={handleBackToGrid}
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
          onBack={handleBackToGrid}
          onGoHome={handleBackToGrid}
          onRecordRating={handleRecordFlashcardRating}
          onCompleteSession={() => handleBackToGrid()}
        />
      );
    }
    if (legacyView === 'practice') {
      return (
        <PracticeView
          studySet={activeLegacySet}
          onBack={handleBackToGrid}
          onGoHome={handleBackToGrid}
          onRecordAnswer={handleRecordPracticeAnswer}
          onCompletePractice={() => handleBackToGrid()}
          onNavigateToFlashcards={() => setLegacyView('flashcards')}
        />
      );
    }
    if (legacyView === 'study' || legacyView === 'learn') {
      return (
        <StudySessionView
          studySet={activeLegacySet}
          onBack={handleBackToGrid}
          onGoHome={handleBackToGrid}
          onFinishLesson={() => handleBackToGrid()}
          onNavigateToFlashcards={() => setLegacyView('flashcards')}
          onNavigateToPractice={() => setLegacyView('practice')}
        />
      );
    }
    return (
      <StudySetDetailView
        studySet={activeLegacySet}
        onBack={handleBackToGrid}
        onGoHome={handleBackToGrid}
        onLaunchMode={(mode) => setLegacyView(mode)}
        onLaunchConceptLesson={() => setLegacyView('study')}
      />
    );
  }

  // Default Main Study View (Home Grid)
  return (
    <div className="w-full">
      <StudyHome
        onSelectTool={handleSelectTool}
        onOpenMyResources={() => setActiveTool('my-resources')}
        savedCount={savedCount}
      />

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
