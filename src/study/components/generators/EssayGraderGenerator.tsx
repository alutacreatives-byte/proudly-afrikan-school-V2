import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  Award,
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { EssayGraderResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { extractTextFromFile } from '../../../quiz/utils/pdfExtractor';

interface EssayGraderGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: EssayGraderResult;
}

export const EssayGraderGenerator: React.FC<EssayGraderGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'LITERATURE & ARTS');
  const [essayContent, setEssayContent] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>(existingResource?.essayContent || existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Execution state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<EssayGraderResult | null>(
    existingResource && typeof existingResource.score === 'number'
      ? existingResource
      : null
  );
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      const extracted = await extractTextFromFile(file);
      setUploadedText(extracted.text);
      setSourceFileName(file.name);
      setEssayContent(''); // Leave Notes field completely blank
      if (!topic.trim()) {
        setTopic(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to parse uploaded document. Please check the file format (.pdf, .doc, .docx, .txt) or paste text directly.');
    }
  };

  const handleGenerate = async () => {
    const textToGrade = uploadedText.trim() || essayContent.trim();
    if (!textToGrade) {
      setError('Please upload an essay document or paste your essay content.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for Essay grading. Please top up or upgrade.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || sourceFileName || 'Academic Essay',
        category,
        sourceMaterial: textToGrade,
        fileName: sourceFileName || undefined,
      };

      const evaluation = (await generateStudyTool('essay-grader', input)) as EssayGraderResult;
      evaluation.essayContent = textToGrade;
      evaluation.documentName = sourceFileName;
      setResult(evaluation);
      await consumeCredits('PDF_STUDY_PACK', `Graded Essay: ${evaluation.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Grading failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveResourceToStorage({
      id: result.id || `essay-${Date.now()}`,
      toolType: 'essay-grader' as any,
      title: result.title,
      subject: result.subject || category,
      topic: result.topic || topic,
      createdAt: result.createdAt || new Date().toISOString(),
      data: result,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `# ${result.title}\nScore: ${result.score}/${result.maxScore || 100} (${result.gradeLetter || 'N/A'})\n\n`;
    text += `Overview: ${result.overviewSummary}\n\n`;
    text += `Detailed Feedback:\n${result.detailedFeedback}\n\n`;
    text += `Strengths:\n${result.strengths.map(s => `- ${s}`).join('\n')}\n\n`;
    text += `Weaknesses:\n${result.weaknesses.map(w => `- ${w}`).join('\n')}\n\n`;
    text += `Specific Improvements:\n`;
    result.specificImprovements.forEach((imp, i) => {
      text += `${i + 1}. [${imp.category}] ${imp.suggestion} -> Fix: ${imp.actionableFix}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-evaluation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 04
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            ESSAY GRADER
          </h1>
        </div>

        {result && (
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
              {saved ? 'Saved' : 'Save Evaluation'}
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
              <FileCheck2 className="w-4 h-4 text-[#E63956]" />
              <h2 className="font-display font-black text-sm uppercase text-[#161616] tracking-wider">
                Essay Input & Setup
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Essay Title / Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Postcolonial Economic Structures"
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
                <option value="LITERATURE & ARTS">Literature & Arts</option>
                <option value="AFRICAN HISTORY">African History</option>
                <option value="SCIENCES & STEM">Sciences & STEM</option>
                <option value="MATHEMATICS">Mathematics</option>
                <option value="GEOGRAPHY & ENVIRONMENT">Geography & Environment</option>
                <option value="CIVICS & ECONOMICS">Civics & Economics</option>
              </select>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Upload Document (Optional)
              </label>
              <label className="border-2 border-dashed border-stone-200 hover:border-[#E63956] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-stone-50 transition-colors">
                <Upload className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-xs font-mono font-bold text-stone-700">
                  {sourceFileName ? sourceFileName : 'Upload .doc, .docx, .pdf, .txt essay'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 mt-0.5">
                  Click to browse or drag file
                </span>
                <input type="file" accept=".doc,.docx,.pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Or Paste Essay Content *
              </label>
              <textarea
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                rows={7}
                placeholder="Paste your full essay text here for comprehensive grading..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-xs sm:text-sm font-medium outline-hidden resize-y"
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
              {isGenerating ? 'Grading Essay...' : 'Grade Essay →'}
            </button>
          </div>
        </div>

        {/* Right Results Display */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Score & Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                      {result.subject || category}
                    </span>
                    {result.gradeLetter && (
                      <span className="px-3 py-1 bg-stone-100 text-stone-800 text-[11px] font-mono font-bold uppercase rounded-full">
                        Grade: {result.gradeLetter}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#161616] tracking-tight">
                    {result.title}
                  </h2>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4 shrink-0 shadow-xs">
                  <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-mono text-xs font-bold text-emerald-900 uppercase">
                      Overall Score
                    </div>
                    <div className="font-display font-black text-2xl text-emerald-700">
                      {result.score} <span className="text-sm font-normal text-emerald-600">/ {result.maxScore || 100}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Summary */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Evaluation Overview
                </span>
                <p className="text-sm text-stone-800 font-normal leading-relaxed">
                  {result.overviewSummary}
                </p>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-3">
                <h3 className="font-display font-black text-base uppercase text-[#161616] tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#E63956]" />
                  Detailed Feedback & Analysis
                </h3>
                <div className="p-6 rounded-2xl bg-white border border-stone-200 text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-line">
                  {result.detailedFeedback}
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <h4 className="font-display font-black text-sm uppercase text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(result.strengths || []).map((strength, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950 font-normal">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                  <h4 className="font-display font-black text-sm uppercase text-rose-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Areas for Growth
                  </h4>
                  <ul className="space-y-2">
                    {(result.weaknesses || []).map((weakness, wIdx) => (
                      <li key={wIdx} className="flex items-start gap-2 text-xs sm:text-sm text-rose-950 font-normal">
                        <span className="text-rose-600 font-bold mt-0.5">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specific Improvements */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-base uppercase text-[#161616] tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E63956]" />
                  Actionable Recommendations & Fixes
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {(result.specificImprovements || []).map((imp, iIdx) => (
                    <div key={iIdx} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-stone-200 text-stone-800 text-[10px] font-mono font-bold uppercase rounded-md">
                          {imp.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">
                        {imp.suggestion}
                      </p>
                      <p className="text-xs text-stone-600 font-normal">
                        <span className="font-mono font-bold text-stone-800 mr-1.5">Actionable Fix:</span>
                        {imp.actionableFix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Grade Essay
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Upload your document or paste your essay text in the left panel to receive a detailed evaluation with scores, feedback, strengths, and specific improvements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
