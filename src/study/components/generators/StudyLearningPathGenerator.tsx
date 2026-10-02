import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Bookmark, 
  Check, 
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
import { exportLearningPath } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface StudyLearningPathGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathResult;
}

export const StudyLearningPathGenerator: React.FC<StudyLearningPathGeneratorProps> = ({
  onBack,
  onGoHome,
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
  const [path, setPath] = useState<LearningPathResult | null>(null);
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useScrollToResult(path, isGenerating);

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

  const handleExportDoc = () => {
    if (!path) return;
    exportLearningPath(path, 'doc');
  };

  const handleExportPdf = () => {
    if (!path) return;
    exportLearningPath(path, 'pdf');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 03
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            LEARNING ROADMAP BUILDER
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {path && Array.isArray(path.stages) && path.stages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
                {saved ? 'Saved' : 'Save Roadmap'}
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
      </div>

      {/* Main Layout: Menu directly ABOVE generation area */}
      <div className="space-y-8">
        {/* Form Menu Column */}
        <div className="w-full">
          <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08),_0_28px_56px_-6px_rgba(100,80,60,0.10),_0_45px_80px_-12px_rgba(100,80,60,0.08)] space-y-6">

            <div>
              <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                Domain / Goal Skill *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. West African Medieval Empires"
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Target Outcome / Benchmark
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Scholarly Fluency & Research Capstone"
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Current Level
                </label>
                <select
                  value={startingLevel}
                  onChange={(e) => setStartingLevel(e.target.value)}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value="Complete Beginner / Foundational">Complete Beginner / Foundational</option>
                  <option value="Intermediate / Reviewing Basics">Intermediate / Reviewing Basics</option>
                  <option value="Advanced / Capstone Readiness">Advanced / Capstone Readiness</option>
                </select>
              </div>
            </div>

            <div>
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
                accentColor="#E62E6B"
              />
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 sm:py-4.5 bg-[#E62E6B] hover:bg-[#d8245f] text-white font-display text-sm sm:text-base font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>{isGenerating ? 'Mapping Pathway...' : 'GENERATE LEARNING ROADMAP'}</span>
            </button>
          </div>
        </div>

        {/* Generated Result Area */}
        <div ref={resultRef} className="w-full scroll-mt-24">
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
