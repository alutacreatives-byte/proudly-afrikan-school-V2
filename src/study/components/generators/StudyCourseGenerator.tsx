import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Download
} from 'lucide-react';
import { CourseResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyCourseGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: CourseResult;
}

export const StudyCourseGenerator: React.FC<StudyCourseGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Undergraduate / Professional');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Course generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseResult | null>(
    existingResource && Array.isArray(existingResource.modules) && existingResource.modules.length > 0
      ? existingResource
      : null
  );
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a course topic or upload curriculum notes.');
      return;
    }

    if (!canAfford('COURSE')) {
      setError('Insufficient credits for Course Curriculum generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveModuleIdx(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Comprehensive Curriculum',
        category,
        gradeLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('course', input)) as CourseResult;
      setCourse(result);
      await consumeCredits('COURSE', `Generated Course: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!course) return;
    saveResourceToStorage({
      id: course.id || `course-${Date.now()}`,
      toolType: 'course' as any,
      title: course.title,
      subject: course.subject || category,
      topic: course.topic || topic,
      createdAt: course.createdAt || new Date().toISOString(),
      data: course,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!course) return;
    let text = `# ${course.title}\nSubject: ${course.subject || category}\nDuration: ${course.durationWeeks || 6} Weeks\n\n`;
    text += `## Course Overview\n${course.courseOverview}\n\n`;
    if (course.learningOutcomes) {
      text += '## Learning Outcomes\n' + course.learningOutcomes.map((lo) => `- ${lo}`).join('\n') + '\n\n';
    }
    course.modules.forEach((mod) => {
      text += `### Module ${mod.moduleNumber}: ${mod.title}\n${mod.description}\n`;
      if (mod.keyTopics) text += 'Key Topics: ' + mod.keyTopics.join(', ') + '\n';
      if (mod.practicalProjectOrTask) text += `Practical Capstone: ${mod.practicalProjectOrTask}\n`;
      text += '\nLessons:\n';
      mod.lessons.forEach((l) => {
        text += `- ${l.lessonTitle} (${l.estimatedMinutes || 45} mins): ${l.summary || l.learningObjective}\n`;
      });
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!course) return;
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-course.json`;
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
                STUDY TOOL 06
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              COURSE CURRICULUM GENERATOR
            </h1>
          </div>
        </div>

        {course && Array.isArray(course.modules) && course.modules.length > 0 && (
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
              {saved ? 'Saved' : 'Save Syllabus'}
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
                Course Parameters
              </h2>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Course Title / Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. African Economic History: Pre-Colonial to Present"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Discipline / Category
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
                Target Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-sm font-medium outline-hidden"
              >
                <option value="High School Advanced">High School Advanced</option>
                <option value="Undergraduate / University">Undergraduate / University</option>
                <option value="Graduate / Professional Certificate">Graduate / Professional Certificate</option>
                <option value="Executive & Lifelong Learning">Executive & Lifelong Learning</option>
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
              {isGenerating ? 'Architecting Curriculum...' : 'Generate Course Syllabus →'}
            </button>
          </div>
        </div>

        {/* Right Active Course Syllabus Preview */}
        <div className="lg:col-span-8">
          {course && Array.isArray(course.modules) && course.modules.length > 0 ? (
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-8">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#E63956] text-[11px] font-mono font-bold uppercase rounded-full">
                    {course.subject || category}
                  </span>
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 text-[11px] font-mono font-bold uppercase rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {course.durationWeeks || 6} Weeks
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-[#161616] tracking-tight">
                  {course.title}
                </h2>
                <p className="text-stone-600 font-normal leading-relaxed text-sm sm:text-base">
                  {course.courseOverview}
                </p>
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <h4 className="font-display font-black text-xs uppercase text-stone-900 tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#E63956]" />
                    Key Learning Objectives & Competencies
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {course.learningOutcomes.map((lo, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{lo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modules Accordion / List */}
              <div className="space-y-6">
                <h3 className="font-display font-black text-lg uppercase text-[#161616] tracking-tight">
                  Course Modules & Unit Breakdown ({course.modules.length} Modules)
                </h3>

                <div className="space-y-4">
                  {course.modules.map((mod, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                            MODULE {mod.moduleNumber || mIdx + 1}
                          </span>
                          <h4 className="font-display font-black text-base sm:text-lg uppercase text-[#161616]">
                            {mod.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                        {mod.description}
                      </p>

                      {mod.keyTopics && mod.keyTopics.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          <span className="text-[11px] font-mono font-bold text-stone-400 mr-1">TOPICS:</span>
                          {mod.keyTopics.map((kt, kIdx) => (
                            <span
                              key={kIdx}
                              className="px-2.5 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 text-[11px] font-mono font-semibold"
                            >
                              {kt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Lessons Breakdown */}
                      <div className="space-y-2.5 pt-3 border-t border-stone-200/60">
                        <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
                          Lessons & Units:
                        </span>
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="p-3 bg-white border border-stone-200/90 rounded-xl space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-stone-900">
                                {lesson.lessonTitle}
                              </span>
                              <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.estimatedMinutes || 45}m
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 font-normal">
                              {lesson.summary || lesson.learningObjective}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Practical Task */}
                      {mod.practicalProjectOrTask && (
                        <div className="p-3 bg-pink-50/60 border border-pink-200/70 rounded-xl text-xs font-mono text-stone-800 space-y-0.5">
                          <span className="font-bold text-[#E63956] block">📌 Practical Task / Capstone Assignment:</span>
                          <span className="text-stone-700">{mod.practicalProjectOrTask}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center space-y-3 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-stone-900">
                Ready to Architect Course Curriculum
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md font-normal leading-relaxed">
                Enter your subject area and target learner level to generate a complete multi-week syllabus with module outcomes, individual lesson plans, and practical assignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
