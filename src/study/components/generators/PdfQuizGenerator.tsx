import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Bookmark, 
  Check, 
  RotateCcw,
  Award,
  Download,
  FileText
} from 'lucide-react';
import { PdfQuizResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportPdfQuiz } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PdfQuizGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: PdfQuizResult;
}

export const PdfQuizGenerator: React.FC<PdfQuizGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Uploaded Source state
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');
  const [count, setCount] = useState<number>(existingResource?.questions?.length || 5);

  // Active quiz state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<PdfQuizResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useScrollToResult(quiz, isGenerating);

  const handleGenerate = async () => {
    if (!sourceMaterial.trim()) {
      setError('Please upload a PDF or paste your study document first.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for Document Quiz generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const input: StudyToolInput = {
        topic: sourceFileName || 'Uploaded Document Notes',
        sourceMaterial: sourceMaterial.trim(),
        fileName: sourceFileName || 'Document.pdf',
        count,
      };

      const result = (await generateStudyTool('pdf-quiz', input)) as PdfQuizResult;
      setQuiz(result);
      await consumeCredits('PDF_STUDY_PACK', `Generated PDF Quiz: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate document quiz. Please try again.');
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
      id: quiz.id || `pdfquiz-${Date.now()}`,
      toolType: 'pdf-quiz' as any,
      title: quiz.title,
      subject: 'DOCUMENT MASTERY',
      topic: quiz.documentName || 'Document Assessment',
      createdAt: quiz.createdAt || new Date().toISOString(),
      data: quiz,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportDoc = () => {
    if (!quiz) return;
    exportPdfQuiz(quiz, 'doc');
  };

  const handleExportPdf = () => {
    if (!quiz) return;
    exportPdfQuiz(quiz, 'pdf');
  };

  const score = calculateScore();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 05
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            PDF & DOCUMENT QUIZ GENERATOR
          </h1>
        </div>

        {quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleExportDoc}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Word Document (.doc)"
            >
              <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
              DOC
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download PDF Document (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
              PDF
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
        <GlobalNavigationButtons
          onBack={onBack}
          onGoHome={onGoHome}
          backLabel="Back"
          homeLabel="Home"
        />
      </div>

      {/* Main Layout: Menu directly ABOVE generation area */}
      <div className="space-y-8">
        {/* Form Menu Column */}
        <div className="w-full space-y-6">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-[#E63956]" />
              <h2 className="font-display font-black text-base uppercase text-[#161616] tracking-wider">
                Document / Notes Grounded Quiz
              </h2>
            </div>

            <div>
              <SourceMaterialUpload
                sourceText={sourceMaterial}
                onSourceTextChange={(text) => setSourceMaterial(text)}
                currentFileName={sourceFileName}
                onTextExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
                accentColor="#E63956"
              />
            </div>

            <div>
              <label className="block font-mono text-[13px] sm:text-sm font-bold text-stone-900 uppercase mb-2">
                Questions Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 sm:py-3.5 rounded-2xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-xs sm:text-sm font-mono text-stone-900 outline-hidden"
              >
                <option value={5}>5 Questions (Rapid Grounded Drill)</option>
                <option value={8}>8 Questions (Standard Assessment)</option>
                <option value={12}>12 Questions (Deep Comprehensive)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating || !sourceMaterial.trim()}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Extracting & Generating...' : 'Generate PDF Quiz →'}
            </button>
          </div>
        </div>

        {/* Generated Result Area */}
        <div ref={resultRef} className="w-full scroll-mt-24">
          {quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Quiz Header & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                      DOCUMENT GROUNDED
                    </span>
                    <span className="font-mono text-xs text-stone-500 truncate max-w-xs">
                      {quiz.documentName}
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
                        Document Mastery
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
                      <h3 className="font-mono text-sm sm:text-base font-bold text-[#161616] leading-relaxed">
                        <span className="text-[#E63956] mr-2">Q{qIdx + 1}.</span>
                        {q.prompt}
                      </h3>

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

                      {/* Grounded Citation */}
                      {isSubmitted && q.explanation && (
                        <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-normal leading-relaxed space-y-1">
                          <span className="font-mono font-bold text-stone-900 block">
                            📖 Grounded Source Citation:
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
                    <FileCheck2 className="w-4 h-4" />
                    Submit & Grade Document Quiz ({Object.keys(userAnswers).length}/{quiz.questions.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake Document Quiz
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
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Upload File to Generate Grounded Quiz
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Upload any syllabus, reading material, or lecture PDF to generate a quiz with explanations cited directly from the document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
