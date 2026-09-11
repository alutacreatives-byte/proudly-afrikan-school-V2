import React, { useState, useEffect } from 'react';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';
import { BuildToolType, SavedResource, GeneratorFormData, ExamData } from './types';
import { getSavedResources, deleteResourceFromStorage, saveResourceToStorage } from './utils/storage';
import { buildService } from './services/buildService';
import { BuildHome } from './components/BuildHome';
import { BuildToolModal } from './components/menus/BuildToolModal';
import { ExamViewer } from './components/viewers/ExamViewer';
import { WorksheetViewer } from './components/viewers/WorksheetViewer';
import { CourseViewer } from './components/viewers/CourseViewer';
import { LessonPlanViewer } from './components/viewers/LessonPlanViewer';
import { MindMapViewer } from './components/viewers/MindMapViewer';
import { PresentationViewer } from './components/viewers/PresentationViewer';
import { useAuthCredit } from '../context/AuthCreditContext';

export interface BuildAppProps {
  initialTool?: BuildToolType | null;
  initialResource?: SavedResource | null;
  onNavigateToTab?: (tab: 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER') => void;
  onGoHome?: () => void;
  onBackToPreviousPage?: () => void;
}

export default function BuildApp({
  initialTool = null,
  initialResource = null,
  onNavigateToTab,
  onGoHome,
  onBackToPreviousPage,
}: BuildAppProps = {}) {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTool, setModalTool] = useState<BuildToolType>('exam');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active viewed resource
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource);

  // Saved resources list
  const [savedResources, setSavedResources] = useState<SavedResource[]>(() => getSavedResources());

  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Sync if initialResource changes
  useEffect(() => {
    if (initialResource) {
      setActiveResource(initialResource);
    }
  }, [initialResource]);

  // Sync if initialTool changes
  useEffect(() => {
    if (initialTool) {
      setModalTool(initialTool);
      setIsModalOpen(true);
    }
  }, [initialTool]);

  // Listen to storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setSavedResources(getSavedResources());
    };
    window.addEventListener('build-resources-updated', handleUpdate);
    return () => window.removeEventListener('build-resources-updated', handleUpdate);
  }, []);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeResource]);

  const handleSelectTool = (type: BuildToolType) => {
    setModalTool(type);
    setIsModalOpen(true);
  };

  const handleOpenSavedResource = (res: SavedResource) => {
    setActiveResource(res);
  };

  const handleDeleteSavedResource = (id: string) => {
    deleteResourceFromStorage(id);
    setSavedResources(getSavedResources());
    if (activeResource?.id === id) {
      setActiveResource(null);
    }
  };

  const handleGenerate = async (formData: GeneratorFormData) => {
    // Map generator type to AiActionType
    const actionMap: Record<BuildToolType, 'EXAM' | 'WORKSHEET' | 'COURSE' | 'LESSON_PLAN' | 'MIND_MAP' | 'PRESENTATION'> = {
      'exam': 'EXAM',
      'worksheet': 'WORKSHEET',
      'course': 'COURSE',
      'lesson-plan': 'LESSON_PLAN',
      'mind-map': 'MIND_MAP',
      'presentation': 'PRESENTATION',
    };
    const actionType = actionMap[formData.generatorType] || 'EXAM';

    // Check credits
    if (!canAfford(actionType)) {
      openAuthModal();
      return;
    }

    try {
      setIsGenerating(true);
      const generated = await buildService.generateResource(formData);

      // Deduct credit
      await consumeCredits(actionType, `Generated ${formData.generatorType}: ${formData.topic}`);

      // Save to storage
      saveResourceToStorage(generated);
      setSavedResources(getSavedResources());

      // Close modal and display viewer
      setIsModalOpen(false);
      setActiveResource(generated);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (activeResource) {
      setActiveResource(null);
    } else if (onBackToPreviousPage) {
      onBackToPreviousPage();
    }
  };

  const handleHome = () => {
    if (activeResource) {
      setActiveResource(null);
    }
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleStartQuizFromExam = (_examData: ExamData) => {
    if (onNavigateToTab) {
      onNavigateToTab('QUIZ');
    }
  };

  // Render resource viewer based on toolType
  const renderViewer = () => {
    if (!activeResource) return null;

    const type = activeResource.toolType;

    if (type === 'exam') {
      return (
        <ExamViewer
          resource={activeResource}
          onBack={handleBack}
          onStartQuiz={handleStartQuizFromExam}
        />
      );
    }

    if (type === 'worksheet') {
      return (
        <WorksheetViewer
          resource={activeResource}
          onBack={handleBack}
        />
      );
    }

    if (type === 'course' || type === 'course-builder') {
      return (
        <CourseViewer
          resource={activeResource}
          onBack={handleBack}
        />
      );
    }

    if (type === 'lesson-plan') {
      return (
        <LessonPlanViewer
          resource={activeResource}
          onBack={handleBack}
        />
      );
    }

    if (type === 'mind-map') {
      return (
        <MindMapViewer
          resource={activeResource}
          onBack={handleBack}
        />
      );
    }

    if (type === 'presentation') {
      return (
        <PresentationViewer
          resource={activeResource}
          onBack={handleBack}
        />
      );
    }

    // Default fallback to exam or worksheet viewer
    return (
      <ExamViewer
        resource={activeResource}
        onBack={handleBack}
      />
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F0] text-[#161616]">
      {/* Top Navigation Header in BUILD: [Back] and [Home] - displayed when viewing a generated resource */}
      {activeResource !== null && (
        <div className="w-full bg-[#FAF7F0] border-b border-stone-200/80 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <GlobalNavigationButtons
              onBack={handleBack}
              onGoHome={handleHome}
              backLabel="Back"
              homeLabel="Home"
            />

            <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider hidden sm:block">
              {`BUILD • ${String(activeResource.toolType).replace('-', ' ').toUpperCase()}`}
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Viewer OR Home Grid */}
      {activeResource ? (
        renderViewer()
      ) : (
        <BuildHome
          onSelectTool={handleSelectTool}
          savedResources={savedResources}
          onOpenResource={handleOpenSavedResource}
          onDeleteResource={handleDeleteSavedResource}
        />
      )}

      {/* The Unified Exact Tool Menu Modal matching the screenshots */}
      <BuildToolModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isGenerating) {
            setIsModalOpen(false);
          }
        }}
        activeType={modalTool}
        onSelectType={(newType) => setModalTool(newType)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
