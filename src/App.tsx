import React, { Component, useState, useEffect } from 'react';
import { MasterHeader, MainNavTab } from './components/MasterHeader';
import { MasterFooter } from './components/MasterFooter';
import StudyApp from './study/App';
import QuizApp from './quiz/App';
import BuildApp from './build/App';
import { MySetsWorkspace } from './mysets/MySetsWorkspace';
import { CentralPlannerView } from './planner/CentralPlannerView';
import { PricingView } from './pricing/PricingView';
import { AuthCreditProvider } from './context/AuthCreditContext';
import { AuthModal } from './components/auth/AuthModal';
import { AccountModal } from './components/auth/AccountModal';
import { StudySet, AppView as StudyAppView } from './study/types';
import { Quiz } from './quiz/types';
import { SavedResource } from './build/types';
import { StorageService } from './study/services/storageService';
import { getRecentQuizzes } from './quiz/utils/quizShare';
import { getSavedResources } from './build/utils/storage';
import { StudyTutorModal } from './study/components/StudyTutorModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('STUDY');

  // Cross-Platform Active Content State
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [studyInitialView, setStudyInitialView] = useState<StudyAppView>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedBuildResource, setSelectedBuildResource] = useState<SavedResource | null>(null);

  // Global AI Tutor Modal
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorMode, setTutorMode] = useState<'tutor' | 'homework'>('tutor');

  // Total saved items count for badge
  const [totalSavedCount, setTotalSavedCount] = useState<number>(0);

  const calculateSavedCount = () => {
    try {
      const sets = StorageService.getAllStudySets().length;
      const quizzes = getRecentQuizzes().length;
      const builds = getSavedResources().length;
      setTotalSavedCount(sets + quizzes + builds);
    } catch (e) {
      setTotalSavedCount(0);
    }
  };

  useEffect(() => {
    calculateSavedCount();
  }, [activeTab]);

  // Check URL parameters for direct shared links (e.g. ?quiz=... or ?tab=quiz or ?tab=build or ?tab=pricing)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quiz')) {
        setActiveTab('QUIZ');
      } else if (params.get('tab')) {
        const tab = params.get('tab')?.toUpperCase();
        if (tab === 'STUDY' || tab === 'QUIZ' || tab === 'BUILD' || tab === 'MY SETS' || tab === 'PLANNER' || tab === 'PRICING') {
          setActiveTab(tab as MainNavTab);
        }
      }
    } catch (e) {}
  }, []);

  const [tabHistory, setTabHistory] = useState<MainNavTab[]>(['STUDY']);

  const handleSelectTab = (tab: MainNavTab) => {
    setTabHistory((prev) => {
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setSelectedStudySet(null);
    setStudyInitialView('home');
    setSelectedQuiz(null);
    setSelectedBuildResource(null);
    setActiveTab('STUDY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromStudy = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop();
      const prevTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setActiveTab(prevTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  // Launch handlers from My Sets or Planner
  const handleOpenStudySetFromAnywhere = (set: StudySet, view: 'study' | 'flashcards' | 'practice' = 'study') => {
    setSelectedStudySet(set);
    if (view === 'flashcards') {
      setStudyInitialView('flashcards');
    } else if (view === 'practice') {
      setStudyInitialView('practice');
    } else {
      setStudyInitialView('set-detail');
    }
    setActiveTab('STUDY');
  };

  const handleOpenQuizFromAnywhere = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('QUIZ');
  };

  const handleOpenBuildResourceFromAnywhere = (res: SavedResource) => {
    setSelectedBuildResource(res);
    setActiveTab('BUILD');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FAF7F0] text-[#161616]">
      {/* Universal Top Navigation Header: STUDY · QUIZ · BUILD · MY SETS · PLANNER · PRICING */}
      <MasterHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        savedItemCount={totalSavedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'STUDY' && (
          <StudyApp
            key={selectedStudySet ? `study-${selectedStudySet.id}-${studyInitialView}` : 'study-default'}
            initialSet={selectedStudySet}
            initialView={studyInitialView}
            onNavigateToTab={handleSelectTab}
            onGoHome={handleGoHome}
            onBackToPreviousPage={handleBackFromStudy}
            onOpenGlobalTutor={() => {
              setTutorMode('tutor');
              setIsTutorOpen(true);
            }}
          />
        )}

        {activeTab === 'QUIZ' && (
          <QuizApp
            key={selectedQuiz ? `quiz-${selectedQuiz.id}` : 'quiz-default'}
            initialQuiz={selectedQuiz}
            onNavigateToTab={handleSelectTab}
          />
        )}

        {activeTab === 'BUILD' && (
          <BuildApp
            key={selectedBuildResource ? `build-${selectedBuildResource.id}` : 'build-main'}
            initialResource={selectedBuildResource}
            onGoHome={() => handleSelectTab('STUDY')}
          />
        )}

        {activeTab === 'MY SETS' && (
          <MySetsWorkspace
            onOpenStudySet={handleOpenStudySetFromAnywhere}
            onOpenQuiz={handleOpenQuizFromAnywhere}
            onOpenBuildResource={handleOpenBuildResourceFromAnywhere}
            onNavigateToStudy={() => setActiveTab('STUDY')}
            onNavigateToQuiz={() => setActiveTab('QUIZ')}
            onNavigateToBuild={() => setActiveTab('BUILD')}
          />
        )}

        {activeTab === 'PLANNER' && (
          <CentralPlannerView
            onStartStudySet={handleOpenStudySetFromAnywhere}
            onStartQuiz={handleOpenQuizFromAnywhere}
            onExploreSets={() => setActiveTab('STUDY')}
          />
        )}

        {activeTab === 'PRICING' && (
          <PricingView
            onNavigateToTab={handleSelectTab}
          />
        )}
      </main>

      {/* Unified Platform Footer */}
      <MasterFooter onSelectTab={handleSelectTab} />

      {/* Global AI Tutor Modal */}
      {isTutorOpen && (
        <StudyTutorModal
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          initialMode={tutorMode}
          studySet={selectedStudySet}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Global Account Modal */}
      <AccountModal
        onNavigateToPricing={() => handleSelectTab('PRICING')}
      />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Application runtime error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border-2 border-[#161616] p-8 rounded-2xl shadow-[4px_4px_0px_#161616]">
            <div className="w-12 h-12 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center font-display font-black text-xl mx-auto mb-4 border-2 border-[#161616] shadow-[2px_2px_0px_#161616]">
              !
            </div>
            <h2 className="font-display font-black text-xl uppercase text-[#161616] mb-2">
              Something went wrong
            </h2>
            <p className="font-sans text-stone-600 text-sm mb-6 leading-relaxed">
              An unexpected issue occurred while rendering the page. Click below to reload and restore the application.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="tactile-btn px-5 py-2.5 bg-[#161616] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="tactile-btn px-5 py-2.5 bg-white text-[#161616] font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#161616] cursor-pointer"
              >
                Reset App State
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthCreditProvider>
        <AppContent />
      </AuthCreditProvider>
    </ErrorBoundary>
  );
}
