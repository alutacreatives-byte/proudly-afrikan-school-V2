import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Lightbulb,
  Download
} from 'lucide-react';
import { LearningPathResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyLearningPathGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathResult;
}

export const StudyLearningPathGenerator: React.FC<StudyLearningPathGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [targetGoal, setTargetGoal] = useState<string>(existingResource?.targetGoal || 'Comprehensive Academic Fluency');
  const [startingLevel, setStartingLevel] = useState<string>('Beginner / Intermediate');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Path Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [path, setPath] = useState<LearningPathResult | null>(
    existingResource && Array.isArray(existingResource.stages) && existingResource.stages.length > 0
      ? existingResource
      : null
  );
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a learning roadmap topic or upload notes.');
      return;
    }

    if (!canAfford('LEARNING_PATH')) {
      setError('Insufficient credits for Learning Roadmap generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setCompletedStages({});

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Mastery Learning Roadmap',
        category,
        targetGoal,
        startingLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('learning-path', input)) as LearningPathResult;
      setPath(result);
      await consumeCredits('LEARNING_PATH', `Generated Learning Roadmap: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStageCompleted = (idx: number) => {
    setCompletedStages((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSave = () => {
    if (!path) return;
    saveResourceToStorage({
      id: path.id || `path-${Date.now()}`,
      toolType: 'learning-path' as any,
      title: path.title,
      subject: path.subject || category,
      topic: path.topic || topic,
      createdAt: path.createdAt || new Date().toISOString(),
      data: path,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!path) return;
    let text = `# ${path.title}\nTarget Goal: ${path.targetGoal || targetGoal}\nEstimated Duration: ${path.totalEstimatedWeeks || 8} Weeks\n\n`;
    path.stages.forEach((st) => {
      text += `## Stage ${st.stepNumber}: ${st.title} (~${st.estimatedHours || 15} hours)\n${st.description}\n`;
      if (st.skillsAcquired) text += 'Skills Acquired: ' + st.skillsAcquired.join(', ') + '\n';
      if (st.suggestedActivities) text += 'Activities:\n' + st.suggestedActivities.map((a) => `  - ${a}`).join('\n') + '\n';
      if (st.checkpointAssessment) text += `Checkpoint Assessment: ${st.checkpointAssessment}\n`;
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!path) return;
    const blob = new Blob([JSON.stringify(path, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${path.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-path.json`;
    a.click();
    URL.revokeObjectURL(url);
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
                STUDY TOOL 01
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              LEARNING ROADMAP BUILDER
            </h1>
          </div>
        </div>

        {path && Array.isArray(path.stages) && path.stages.length > 0 && (
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
              {saved ? 'Saved' : 'Save Roadmap'}
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
                Roadmap Parameters
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Domain / Goal Skill *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. West African Medieval Empires"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Target Outcome / Benchmark
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g. Scholarly Fluency & Research Capstone"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Current Level
              </label>
              <select
                value={startingLevel}
                onChange={(e) => setStartingLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value="Complete Beginner / Foundational">Complete Beginner / Foundational</option>
                <option value="Intermediate / Reviewing Basics">Intermediate / Reviewing Basics</option>
                <option value="Advanced / Capstone Readiness">Advanced / Capstone Readiness</option>
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
              {isGenerating ? 'Mapping Pathway...' : 'Generate Learning Roadmap →'}
            </button>
          </div>
        </div>

        {/* Right Active Roadmap Preview */}
        <div className="lg:col-span-8">
          {path && Array.isArray(path.stages) && path.stages.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                    {path.subject || category}
                  </span>
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 text-[11px] font-mono font-bold uppercase rounded-full">
                    Est. Duration: {path.totalEstimatedWeeks || 8} Weeks
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-[#161616] tracking-tight">
                  {path.title}
                </h2>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800">
                  <span className="font-bold text-[#E63956]">🎯 Target Goal:</span> {path.targetGoal || targetGoal}
                </div>
              </div>

              {/* Step-by-Step Stages */}
              <div className="space-y-6">
                <h3 className="font-display font-black text-lg uppercase text-[#161616] tracking-tight">
                  Milestone Stages & Competencies ({(path.stages || []).length} Stages)
                </h3>

                <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200">
                  {path.stages.map((st, idx) => {
                    const isDone = Boolean(completedStages[idx]);

                    return (
                      <div
                        key={idx}
                        className={`relative pl-12 transition-all`}
                      >
                        {/* Step Marker Button */}
                        <button
                          type="button"
                          onClick={() => toggleStageCompleted(idx)}
                          className={`absolute left-0 top-3 w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold cursor-pointer transition-all ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                              : 'bg-white border-[#E63956] text-[#E63956] hover:bg-pink-50'
                          }`}
                          title="Toggle stage completed"
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : st.stepNumber || idx + 1}
                        </button>

                        <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="font-display font-black text-base sm:text-lg uppercase text-[#161616]">
                              {st.title}
                            </h4>
                            <span className="text-[11px] font-mono font-bold text-stone-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              ~{st.estimatedHours || 15} Hours
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-stone-700 font-normal leading-relaxed">
                            {st.description}
                          </p>

                          {/* Skills Acquired */}
                          {st.skillsAcquired && st.skillsAcquired.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] font-mono font-bold text-stone-400 mr-1">SKILLS:</span>
                              {st.skillsAcquired.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2.5 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 text-[11px] font-mono font-semibold"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Suggested Activities */}
                          {st.suggestedActivities && st.suggestedActivities.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-stone-200/70">
                              <span className="font-mono text-[11px] font-bold text-stone-600 uppercase block">
                                Action Items & Drills:
                              </span>
                              <ul className="space-y-1">
                                {st.suggestedActivities.map((act, aIdx) => (
                                  <li key={aIdx} className="flex items-start gap-2 text-xs text-stone-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63956] mt-1.5 shrink-0" />
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Checkpoint Assessment */}
                          {st.checkpointAssessment && (
                            <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-800 space-y-0.5">
                              <span className="font-bold text-[#E63956] flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                Milestone Assessment:
                              </span>
                              <span className="text-stone-700">{st.checkpointAssessment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              {path.recommendations && path.recommendations.length > 0 && (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <h4 className="font-display font-black text-xs uppercase text-amber-900 tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Recommended Study Habits & Cadence
                  </h4>
                  <ul className="space-y-2">
                    {path.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-amber-950 font-medium">
                        <span className="font-mono font-bold text-amber-600">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Map Learning Pathway
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Provide your learning goal and starting level to generate an end-to-end competency roadmap with milestone checkpoints and practical drills.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
