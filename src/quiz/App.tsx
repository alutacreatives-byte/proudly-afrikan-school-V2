import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { ThreeWaysSection } from './components/ThreeWaysSection';
import { QuizBuilder } from './components/QuizBuilder';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { ResultsScreen } from './components/ResultsScreen';
import { AnswerReview } from './components/AnswerReview';
import { EducationalContent } from './components/EducationalContent';
import {
  CreationMethod,
  Quiz,
  QuizSettings,
  SubjectCategory,
  UserAnswer,
} from './types';
import { DEMO_SAMPLE_QUIZ } from './data/sampleQuizzes';
import { randomizeQuestionOptions } from './utils/shuffleOptions';
import { decodeQuizFromUrl, getRecentQuizzes, saveRecentQuiz } from './utils/quizShare';
import { AlertTriangle, Play, Sparkles, ArrowLeft, RotateCcw } from 'lucide-react';

type AppViewState = 'builder' | 'quiz_active' | 'results' | 'review';

export interface QuizAppProps {
  key?: React.Key;
  initialQuiz?: Quiz | null;
  onNavigateToTab?: (tab: 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER') => void;
}

export default function App({
  initialQuiz,
  onNavigateToTab,
}: QuizAppProps = {}) {
  // Navigation & View State
  const [viewState, setViewState] = useState<AppViewState>(initialQuiz ? 'quiz_active' : 'builder');

  // Creation State
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('topic');
  const [topicInput, setTopicInput] = useState<string>('The Kingdom of Mali & Mansa Musa');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('History');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(initialQuiz || null);

  useEffect(() => {
    if (initialQuiz) {
      setActiveQuiz(initialQuiz);
      setViewState('quiz_active');
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(0);
      setCurrentSelectedAnswer(null);
      setHasAnsweredCurrent(false);
    }
  }, [initialQuiz]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [score, setScore] = useState<number>(0);
  const [currentSelectedAnswer, setCurrentSelectedAnswer] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);

  // Storage / History
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);

  const quizContainerRef = useRef<HTMLDivElement>(null);

  // Initialize and check for shared quiz link in URL or recent history
  useEffect(() => {
    const recents = getRecentQuizzes();
    setRecentQuizzes(recents);

    const shared = decodeQuizFromUrl();
    if (shared && shared.questions && shared.questions.length > 0) {
      setActiveQuiz(shared);
      setViewState('quiz_active');
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(0);
      setHasAnsweredCurrent(false);
      setCurrentSelectedAnswer(null);
    }
  }, []);

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    if (viewState !== 'builder') {
      setViewState('builder');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Quiz Builder & prefill sample topic
  const handleHeroSelectSample = (samplePrompt: string, category: string) => {
    setCreationMethod('topic');
    setTopicInput(samplePrompt);
    setSelectedSubject(category as SubjectCategory);
    scrollToSection('quiz-builder');
  };

  // Generate Quiz API call
  const handleGenerateQuiz = async (params: {
    creationMethod: CreationMethod;
    topic: string;
    text: string;
    fileName: string;
    fileText: string;
    settings: QuizSettings;
  }) => {
    setGlobalError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate quiz. Please try again.');
      }

      if (!data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
        throw new Error('Received an empty quiz from generator.');
      }

      const newQuiz: Quiz = data.quiz;

      // Save to recent list
      saveRecentQuiz(newQuiz);
      setRecentQuizzes(getRecentQuizzes());

      // Start quiz
      setActiveQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(0);
      setCurrentSelectedAnswer(null);
      setHasAnsweredCurrent(false);
      setViewState('quiz_active');

      // Scroll smoothly to active quiz view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setGlobalError(err?.message || 'Failed to generate quiz. Please check your internet connection or try a different source.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Answer selected in active question
  const handleAnswerSelected = (answer: string, isCorrect: boolean) => {
    if (!activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    if (!currentQ) return;

    setCurrentSelectedAnswer(answer);
    setHasAnsweredCurrent(true);

    const updatedScore = isCorrect ? score + 1 : score;
    setScore(updatedScore);

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedAnswer: answer,
        isCorrect,
      },
    }));
  };

  // Advance to next question or complete quiz
  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentSelectedAnswer(null);
      setHasAnsweredCurrent(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed quiz!
      setViewState('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Try again with fresh option positions for varied active recall
  const handleTryAgain = () => {
    if (!activeQuiz) return;
    const reshuffledQuiz: Quiz = {
      ...activeQuiz,
      questions: randomizeQuestionOptions(activeQuiz.questions),
    };
    setActiveQuiz(reshuffledQuiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setCurrentSelectedAnswer(null);
    setHasAnsweredCurrent(false);
    setViewState('quiz_active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start fresh quiz creation
  const handleCreateAnother = () => {
    setViewState('builder');
    setTimeout(() => {
      scrollToSection('quiz-builder');
    }, 100);
  };

  // Return to home / builder view
  const handleGoHome = () => {
    setViewState('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load sample demo quiz immediately with distributed option positions
  const handleLoadDemoQuiz = () => {
    const demoQuiz: Quiz = {
      ...DEMO_SAMPLE_QUIZ,
      questions: randomizeQuestionOptions(DEMO_SAMPLE_QUIZ.questions),
    };
    setActiveQuiz(demoQuiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setCurrentSelectedAnswer(null);
    setHasAnsweredCurrent(false);
    setViewState('quiz_active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecentQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setCurrentSelectedAnswer(null);
    setHasAnsweredCurrent(false);
    setViewState('quiz_active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#161616] flex flex-col justify-between selection:bg-[#E05A2B] selection:text-white">
      {/* Global Error Banner if API failed */}
      {globalError && (
        <div className="bg-[#FFEBE6] border-b-2 border-[#E05A2B] py-3 px-4 text-center font-mono-code text-xs sm:text-sm text-[#292929] flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#E05A2B] shrink-0" />
          <span>{globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            className="ml-2 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW STATE: BUILDER & LANDING PAGE */}
      {viewState === 'builder' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-14 sm:space-y-16 pb-20">
          {/* Section 1: Hero */}
          <Hero
            onStartClick={() => scrollToSection('quiz-builder')}
            onSelectSample={handleHeroSelectSample}
          />

          {/* Section 2: Three Ways To Create */}
          <ThreeWaysSection
            onSelectMethod={(method) => {
              setCreationMethod(method);
              scrollToSection('quiz-builder');
            }}
            activeMethod={creationMethod}
          />

          {/* Section 3: Quiz Builder Functional Engine */}
          <QuizBuilder
            creationMethod={creationMethod}
            onMethodChange={setCreationMethod}
            onGenerateQuiz={handleGenerateQuiz}
            isGenerating={isGenerating}
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />

          {/* Zero-Latency Instant Sample Preview Card */}
          <section className="py-4">
            <div className="bg-white rounded-[2rem] border border-[#E6E0D5] p-7 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_-10px_rgba(41,41,41,0.05)]">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#E05A2B]">
                  INSTANT TRIAL
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#292929] uppercase tracking-tight">
                  WANT TO TEST A QUIZ IMMEDIATELY?
                </h3>
                <p className="text-sm sm:text-base text-[#4D4D4D] font-normal">
                  Jump right into our pre-crafted assessment: <em className="font-semibold text-[#292929]">The Kingdom of Mali & Mansa Musa</em>.
                </p>
              </div>

              <button
                onClick={handleLoadDemoQuiz}
                className="px-7 py-4 bg-[#292929] text-[#F5F0E6] hover:bg-[#1A1A1A] font-display font-black text-base uppercase rounded-full shadow-md hover:shadow-lg hover:scale-102 transition-all flex items-center gap-2.5 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 text-[#E05A2B] fill-[#E05A2B]" />
                <span>LAUNCH DEMO QUIZ</span>
              </button>
            </div>
          </section>

          {/* Section 4: SEO & Educational Context (What is it, How it works, FAQ) */}
          <EducationalContent />
        </main>
      )}

      {/* VIEW STATE: ACTIVE QUIZ (ONE QUESTION AT A TIME) */}
      {viewState === 'quiz_active' && activeQuiz && (
        <main ref={quizContainerRef} className="flex-1 py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 w-full">
          {/* Back & Mode Navigation Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#292929]/20">
            <button
              onClick={() => setViewState('builder')}
              className="inline-flex items-center gap-2 font-mono-code text-xs font-bold text-[#292929] hover:text-[#E05A2B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>EXIT TO BUILDER</span>
            </button>

            <div className="font-mono-code text-xs font-bold text-[#736E65]">
              PROUDLY AFRIKAN QUIZ • {activeQuiz.settings.difficulty.toUpperCase()} MODE
            </div>
          </div>

          {/* Progress Bar & Header */}
          <ProgressBar
            currentIndex={currentQuestionIndex}
            totalQuestions={activeQuiz.questions.length}
            score={score}
            quizTitle={activeQuiz.title}
            topicOrSource={activeQuiz.topicOrSource}
          />

          {/* Active Question Card */}
          {activeQuiz.questions[currentQuestionIndex] && (
            <QuestionCard
              question={activeQuiz.questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={activeQuiz.questions.length}
              onAnswerSelected={handleAnswerSelected}
              onNextQuestion={handleNextQuestion}
              selectedAnswer={currentSelectedAnswer}
              hasAnswered={hasAnsweredCurrent}
            />
          )}
        </main>
      )}

      {/* VIEW STATE: RESULTS SCORECARD */}
      {viewState === 'results' && activeQuiz && (
        <main className="flex-1 py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <ResultsScreen
            quiz={activeQuiz}
            userAnswers={userAnswers}
            score={score}
            totalQuestions={activeQuiz.questions.length}
            onReviewAnswers={() => {
              setViewState('review');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTryAgain={handleTryAgain}
            onCreateAnother={handleCreateAnother}
            onHome={handleGoHome}
          />
        </main>
      )}

      {/* VIEW STATE: DETAILED ANSWER REVIEW */}
      {viewState === 'review' && activeQuiz && (
        <main className="flex-1 py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <AnswerReview
            quiz={activeQuiz}
            userAnswers={userAnswers}
            onBackToResults={() => {
              setViewState('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTryAgain={handleTryAgain}
            onCreateAnother={handleCreateAnother}
          />
        </main>
      )}
    </div>
  );
}
