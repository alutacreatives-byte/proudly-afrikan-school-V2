import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Key,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { StudyGuideResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyGuideGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: StudyGuideResult;
}

export const StudyGuideGenerator: React.FC<StudyGuideGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [guide, setGuide] = useState<StudyGuideResult | null>(
    existingResource && Array.isArray(existingResource.sections) && existingResource.sections.length > 0
      ? existingResource
      : null
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source material.');
      return;
    }

    if (!canAfford('STUDY_GUIDE')) {
      setError('Insufficient credits for Study Guide generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Comprehensive Study Material',
        category,
        gradeLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('study-guide', input)) as StudyGuideResult;
      setGuide(result);
      await consumeCredits('STUDY_GUIDE', `Generated Study Guide: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!guide) return;
    saveResourceToStorage({
      id: guide.id || `guide-${Date.now()}`,
      toolType: 'study-guide' as any,
      title: guide.title,
      subject: guide.subject || category,
      topic: guide.topic || topic,
      createdAt: guide.createdAt || new Date().toISOString(),
      data: guide,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!guide) return;
    let text = `# ${guide.title}\nSubject: ${guide.subject || category}\n\n`;
    text += `## Executive Overview\n${guide.overview}\n\n`;
    guide.sections.forEach((sec) => {
      text += `### ${sec.heading}\n${sec.content}\n`;
      if (sec.bulletPoints && sec.bulletPoints.length > 0) {
        text += sec.bulletPoints.map((b) => `- ${b}`).join('\n') + '\n';
      }
      if (sec.keyTerms && sec.keyTerms.length > 0) {
        text += '\nKey Terms:\n' + sec.keyTerms.map((kt) => `* **${kt.term}**: ${kt.definition}`).join('\n') + '\n';
      }
      text += '\n';
    });

    if (guide.importantTakeaways && guide.importantTakeaways.length > 0) {
      text += '## Key Takeaways\n' + guide.importantTakeaways.map((t) => `- ${t}`).join('\n') + '\n\n';
    }

    if (guide.reviewQuestions && guide.reviewQuestions.length > 0) {
      text += '## Review Questions\n' + guide.reviewQuestions.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.answer}`).join('\n\n');
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!guide) return;
    const blob = new Blob([JSON.stringify(guide, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

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
                STUDY TOOL 02
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              STUDY GUIDE GENERATOR
            </h1>
          </div>
        </div>

        {guide && Array.isArray(guide.sections) && guide.sections.length > 0 && (
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
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {saved ? 'Saved' : 'Save Guide'}
            </button>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-[#E63956]" />
              <h2 className="font-display font-black text-sm uppercase text-[#161616] tracking-wider">
                Guide Configuration
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Study Topic / Unit *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Kingdom of Kush & Meroë Ironworking"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Subject Category
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
                Target Grade / Audience Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value="Primary / Middle School">Primary / Middle School</option>
                <option value="Secondary / High School">Secondary / High School</option>
                <option value="Undergraduate / University">Undergraduate / University</option>
                <option value="Lifelong Scholar / Advanced">Lifelong Scholar / Advanced</option>
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
              {isGenerating ? 'Synthesizing Guide...' : 'Generate Study Guide →'}
            </button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-8">
          {guide && Array.isArray(guide.sections) && guide.sections.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                    {guide.subject || category}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-[#161616] tracking-tight">
                  {guide.title}
                </h2>
                <p className="text-stone-600 font-normal leading-relaxed text-sm sm:text-base">
                  {guide.overview}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {guide.sections.map((section, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                    <h3 className="font-display font-black text-lg uppercase text-[#161616] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#E63956]" />
                      {section.heading}
                    </h3>

                    <p className="text-stone-700 text-sm leading-relaxed font-normal">
                      {section.content}
                    </p>

                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-2 pt-2 border-t border-stone-200/70">
                        {section.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E63956] mt-2 shrink-0" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.keyTerms && section.keyTerms.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        {section.keyTerms.map((kt, kIdx) => (
                          <div key={kIdx} className="p-3 bg-white border border-stone-200 rounded-xl space-y-1">
                            <span className="font-mono text-xs font-bold text-[#161616] uppercase block">
                              {kt.term}
                            </span>
                            <span className="text-xs text-stone-600 font-normal">
                              {kt.definition}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Important Takeaways */}
              {guide.importantTakeaways && guide.importantTakeaways.length > 0 && (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <h4 className="font-display font-black text-sm uppercase text-amber-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    High-Yield Exam Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {guide.importantTakeaways.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-950">
                        <span className="font-mono font-bold text-amber-600">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Self-Test Questions */}
              {guide.reviewQuestions && guide.reviewQuestions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="font-display font-black text-lg uppercase text-[#161616] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#E63956]" />
                    Review & Self-Test Questions
                  </h4>

                  <div className="space-y-3">
                    {guide.reviewQuestions.map((q, idx) => {
                      const isRevealed = Boolean(revealedAnswers[idx]);
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-mono text-xs font-bold text-stone-900">
                              Q{idx + 1}: {q.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAnswer(idx)}
                              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[11px] font-mono font-bold text-stone-700 flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {isRevealed ? 'Hide Answer' : 'Show Answer'}
                              {isRevealed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                          {q.hint && (
                            <p className="text-[11px] font-mono text-stone-500">
                              Hint: {q.hint}
                            </p>
                          )}
                          {isRevealed && (
                            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 font-normal leading-relaxed">
                              <span className="font-mono font-bold text-emerald-800 block mb-0.5">Answer:</span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Synthesize Guide
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Configure your subject, topic, and optional source notes on the left, then click Generate Study Guide to produce formatted revision materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
