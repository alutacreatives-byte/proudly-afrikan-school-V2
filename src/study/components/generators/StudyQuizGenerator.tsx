import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  AlertCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { QuizResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyQuizGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: QuizResult;
}

export const StudyQuizGenerator: React.FC<StudyQuizGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>((existingResource?.difficulty as any) || 'Medium');
  const [count, setCount] = useState<number>(existingResource?.questions?.length || 5);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Execution state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<QuizResult | null>(
    existingResource && Array.isArray(existingResource.questions) && existingResource.questions.length > 0
      ? existingResource
      : null
  );
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source notes.');
      return;
    }

    if (!canAfford('QUIZ_FLASHCARDS')) {
      setError('Insufficient credits for Quiz generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Mastery Practice Quiz',
        category,
        difficulty,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('quiz', input)) as QuizResult;
      setQuiz(result);
      await consumeCredits('QUIZ_FLASHCARDS', `Generated Practice Quiz: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleGradeQuiz = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percent: Math.round((correct / quiz.questions.length) * 100),
    };
  };

  const handleSave = () => {
    if (!quiz) return;
    saveResourceToStorage({
      id: quiz.id || `quiz-${Date.now()}`,
      toolType: 'quiz' as any,
      title: quiz.title,
      subject: quiz.subject || category,
      topic: quiz.topic || topic,
      createdAt: quiz.createdAt || new Date().toISOString(),
      data: quiz,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!quiz || !Array.isArray(quiz.questions)) return;
    let text = `# ${quiz.title}\nSubject: ${quiz.subject || category}\n\n`;
    quiz.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.prompt}\n`;
      q.options.forEach((opt, oIdx) => {
        text += `  ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
      });
      text += `Correct Answer: ${String.fromCharCode(65 + (Number(q.correctAnswer) || 0))} - ${q.options[Number(q.correctAnswer) || 0]}\n`;
      if (q.explanation) text += `Explanation: ${q.explanation}\n`;
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!quiz) return;
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const score = calculateScore();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                STUDY TOOL 04
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              PRACTICE QUIZ GENERATOR
            </h1>
          </div>
        </div>

        {quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {saved ? 'Saved' : 'Save Quiz'}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-[#E63956]" />
              <h2 className="font-display font-black text-sm uppercase text-[#161616] tracking-wider">
                Quiz Setup
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Quiz Topic / Test Area *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Swahili Coast Maritime Trade"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Subject
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value="AFRICAN HISTORY">African History</option>
                <option value="SCIENCES & STEM">Sciences & STEM</option>
                <option value="MATHEMATICS">Mathematics</option>
                <option value="LITERATURE & ARTS">Literature & Arts</option>
                <option value="GEOGRAPHY & ENVIRONMENT">Geography & Environment</option>
                <option value="CIVICS & ECONOMICS">Civics & Economics</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-mono font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                      difficulty === d
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Questions Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value={5}>5 Questions (Rapid Check)</option>
                <option value={8}>8 Questions (Standard Assessment)</option>
                <option value={10}>10 Questions (In-Depth Test)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Optional Source Material (PDF / DOC / Notes)
              </label>
              <SourceMaterialUpload
                currentFileName={sourceFileName}
                onTextExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Building Quiz...' : 'Generate Practice Quiz →'}
            </button>
          </div>
        </div>

        {/* Right Active Quiz Player */}
        <div className="lg:col-span-8">
          {quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Quiz Header & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                      {quiz.subject || category}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[11px] font-mono font-bold uppercase rounded-full">
                      {quiz.difficulty || difficulty}
                    </span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#161616] tracking-tight">
                    {quiz.title}
                  </h2>
                </div>

                {isSubmitted && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <Award className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-mono text-xs font-bold text-emerald-900 uppercase">
                        Final Score
                      </div>
                      <div className="font-display font-black text-xl text-emerald-700">
                        {score.correct} / {score.total} ({score.percent}%)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-8">
                {quiz.questions.map((q, qIdx) => {
                  const selectedOpt = userAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctAnswer;

                  return (
                    <div
                      key={qIdx}
                      className={`p-6 rounded-2xl border transition-all space-y-4 ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                          : 'bg-stone-50/70 border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-mono text-sm sm:text-base font-bold text-[#161616] leading-relaxed">
                          <span className="text-[#E63956] mr-2">Q{qIdx + 1}.</span>
                          {q.prompt}
                        </h3>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          const isRightOption = q.correctAnswer === oIdx;

                          let optionStyle = 'bg-white border-stone-200 text-stone-800 hover:border-stone-400';
                          if (isSubmitted) {
                            if (isRightOption) {
                              optionStyle = 'bg-emerald-100/90 border-emerald-500 text-emerald-950 font-bold';
                            } else if (isOptionSelected && !isRightOption) {
                              optionStyle = 'bg-rose-100/90 border-rose-500 text-rose-950 line-through';
                            } else {
                              optionStyle = 'bg-stone-50 opacity-60 border-stone-200 text-stone-500';
                            }
                          } else if (isOptionSelected) {
                            optionStyle = 'bg-[#18181B] text-white border-[#18181B] shadow-xs';
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-stone-100/80 text-stone-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSubmitted && isRightOption && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Box on submit */}
                      {isSubmitted && q.explanation && (
                        <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-normal leading-relaxed space-y-1">
                          <span className="font-mono font-bold text-stone-900 block">
                            💡 Diagnostic Explanation:
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Footer Actions */}
              <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Submit & Grade Quiz ({Object.keys(userAnswers).length}/{quiz.questions.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake Practice Quiz
                  </button>
                )}

                <span className="font-mono text-xs text-stone-400">
                  {Object.keys(userAnswers).length} of {quiz.questions.length} answered
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Build Practice Quiz
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Configure your subject, choose your difficulty and questions count, then generate an interactive graded diagnostic quiz with explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
