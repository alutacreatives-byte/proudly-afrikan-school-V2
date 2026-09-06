import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  StudySet, 
  QuizQuestion, 
  QuizResult, 
  AppTab 
} from '../types';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Trophy, 
  Timer, 
  ArrowRight, 
  Layers, 
  Award,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { recordQuizResult } from '../utils/storage';

interface QuizViewProps {
  sets: StudySet[];
  activeSet: StudySet;
  onNavigateTab: (tab: AppTab) => void;
  onSelectSet: (set: StudySet) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  sets,
  activeSet,
  onNavigateTab,
  onSelectSet,
}) => {
  // Quiz Status: 'config' | 'playing' | 'results'
  const [quizStatus, setQuizStatus] = useState<'config' | 'playing' | 'results'>('config');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Setup options
  const [quizSource, setQuizSource] = useState<'active-set' | 'custom-topic'>('active-set');
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  // Timer while playing
  useEffect(() => {
    let interval: any = null;
    if (quizStatus === 'playing') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStatus]);

  // Start Quiz
  const handleStartQuiz = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (quizSource === 'active-set') {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: activeSet.title,
            subject: activeSet.subject,
            gradeLevel: activeSet.gradeLevel,
            questionCount,
            cards: activeSet.cards,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.questions || data.questions.length === 0) {
          throw new Error(data.error || 'Failed to generate quiz');
        }
        setQuestions(data.questions);
      } else {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: customTopic || 'African History & Innovations',
            subject: 'Pan-African Studies',
            gradeLevel: 'Secondary',
            questionCount,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.questions || data.questions.length === 0) {
          throw new Error(data.error || 'Failed to generate custom quiz');
        }
        setQuestions(data.questions);
      }

      setQuizStatus('playing');
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setUserAnswers([]);
      setScore(0);
      setTimerSeconds(0);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not start quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswerIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: selectedOption,
        isCorrect,
      },
    ]);

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz Finished!
      setQuizStatus('results');
      const finalScore = score + (selectedOption === questions[currentIndex].correctAnswerIndex ? 1 : 0);
      const percentage = Math.round((finalScore / questions.length) * 100);
      const xpEarned = finalScore * 25 + 50;

      // Confetti blast on good score
      if (percentage >= 60) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D92B8A', '#E59500', '#028090', '#FAF7F0']
        });
      }

      // Record result
      const result: QuizResult = {
        id: `quiz-res-${Date.now()}`,
        setId: activeSet.id,
        title: quizSource === 'active-set' ? activeSet.title : customTopic,
        score: finalScore,
        totalQuestions: questions.length,
        percentage,
        answers: userAnswers,
        date: new Date().toISOString(),
        xpEarned,
      };
      recordQuizResult(result);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. QUIZ CONFIGURATION SCREEN */}
      {quizStatus === 'config' && (
        <div className="bg-white rounded-3xl border border-[#DFD5C2] p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#D92B8A]/10 text-[#D92B8A] flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[#161616]">
              Adaptive African Quiz Arena
            </h1>
            <p className="text-sm text-[#5C5546]">
              Test your recall, comprehension, and critical reasoning with instant feedback and historical context.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            {/* Choose Quiz Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                Select Quiz Source
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuizSource('active-set')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    quizSource === 'active-set'
                      ? 'border-[#D92B8A] bg-[#D92B8A]/5 shadow-xs'
                      : 'border-[#DFD5C2] hover:border-[#161616]'
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-[#D92B8A] font-mono-code block mb-1">
                    Study Deck
                  </span>
                  <h4 className="font-bold text-sm text-[#161616] truncate">
                    {activeSet.title}
                  </h4>
                  <p className="text-xs text-[#6F685B] mt-0.5">
                    {activeSet.cards.length} cards available
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizSource('custom-topic')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    quizSource === 'custom-topic'
                      ? 'border-[#D92B8A] bg-[#D92B8A]/5 shadow-xs'
                      : 'border-[#DFD5C2] hover:border-[#161616]'
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-[#E59500] font-mono-code block mb-1">
                    AI Custom Arena
                  </span>
                  <h4 className="font-bold text-sm text-[#161616]">
                    Generate from Any Topic
                  </h4>
                  <p className="text-xs text-[#6F685B] mt-0.5">
                    Powered by Proudly Afrikan Gemini engine
                  </p>
                </button>
              </div>
            </div>

            {/* Custom topic input if chosen */}
            {quizSource === 'custom-topic' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                  Enter Custom Topic / Concept
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. African Space Programs, Great Zimbabwe Stone Walls, AfCFTA Tariffs"
                  className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-medium"
                />
              </div>
            )}

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      questionCount === num
                        ? 'bg-[#161616] text-white border-[#161616]'
                        : 'bg-[#FAF7F0] text-[#5C5546] border-[#DFD5C2] hover:border-[#161616]'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="btn-launch-quiz"
              onClick={handleStartQuiz}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-base shadow-md shadow-[#D92B8A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Curating Exam Questions with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Examination</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. LIVE QUIZ TAKING SCREEN */}
      {quizStatus === 'playing' && currentQ && (
        <div className="space-y-6">
          {/* Top Bar: Progress & Timer */}
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#DFD5C2]">
            <div className="flex items-center gap-3">
              <span className="font-mono-code text-xs font-bold text-[#D92B8A] bg-[#D92B8A]/10 px-2.5 py-1 rounded-full">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
              <span className="text-xs font-semibold text-[#6F685B] hidden sm:inline">
                Difficulty: {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold font-mono-code text-[#161616]">
              <Timer className="w-4 h-4 text-[#E59500]" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E7DECD] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D92B8A] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 sm:p-10 space-y-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#161616] leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswerIndex;

                let buttonStyle = 'border-[#DFD5C2] bg-[#FAF7F0] hover:border-[#161616] text-[#161616]';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                  } else {
                    buttonStyle = 'border-[#E7DECD] bg-white opacity-50';
                  }
                } else if (isSelected) {
                  buttonStyle = 'border-[#D92B8A] bg-[#D92B8A]/10 text-[#D92B8A] font-bold shadow-xs';
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${idx}`}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl font-mono-code text-xs font-bold flex items-center justify-center bg-white border border-current/20 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer when submitted */}
            {isAnswerSubmitted && (
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E7DECD] space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D92B8A]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#161616] font-mono-code">
                    Detailed Explanation & Cultural Context
                  </h4>
                </div>
                <p className="text-xs text-[#443D32] leading-relaxed">
                  {currentQ.explanation}
                </p>
                {currentQ.africanContext && (
                  <p className="text-xs text-[#C84B31] italic pt-1 border-t border-[#E7DECD]/70">
                    <span className="font-semibold">African Grounding: </span>
                    {currentQ.africanContext}
                  </p>
                )}
              </div>
            )}

            {/* Submit / Next Button */}
            <div className="flex items-center justify-end pt-4 border-t border-[#E7DECD]">
              {!isAnswerSubmitted ? (
                <button
                  id="btn-submit-answer"
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-3 rounded-xl bg-[#161616] hover:bg-[#333] text-white font-bold text-sm transition-all disabled:opacity-40 cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  id="btn-next-question"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS & MASTERY REPORT */}
      {quizStatus === 'results' && (
        <div className="bg-white rounded-3xl border border-[#DFD5C2] p-8 sm:p-12 space-y-8 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-[#D92B8A] to-[#E59500] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#D92B8A]/20">
              <Trophy className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-display font-extrabold text-[#161616]">
              {score / questions.length >= 0.8
                ? 'Exceptional Mastery!'
                : score / questions.length >= 0.5
                ? 'Solid Progress!'
                : 'Keep Revising!'}
            </h2>

            <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#E7DECD] space-y-2">
              <div className="text-4xl font-extrabold font-mono-code text-[#D92B8A]">
                {score} / {questions.length}
              </div>
              <p className="text-xs text-[#6F685B] font-semibold">
                Score: {Math.round((score / questions.length) * 100)}% • Duration: {formatTime(timerSeconds)}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-purple-900">
                <span>🐚 +{(score * 25 + 50).toLocaleString()} Ubuntu Cowries XP Earned</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setQuizStatus('config');
                handleStartQuiz();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#161616] text-white font-bold text-sm hover:bg-[#333] transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => onNavigateTab('study')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D92B8A] text-white font-bold text-sm hover:bg-[#BC1D73] transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Return to Study Mode</span>
            </button>

            <button
              onClick={() => onNavigateTab('planner')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FAF7F0] border border-[#DFD5C2] text-[#161616] font-bold text-sm hover:border-[#161616] transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-[#028090]" />
              <span>Schedule Next Revision in Planner</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
