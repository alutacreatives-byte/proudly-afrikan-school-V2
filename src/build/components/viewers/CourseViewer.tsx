import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  CheckCircle 
} from 'lucide-react';
import { CourseData, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface CourseViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ resource, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const course: any = resource?.data || resource || {};

  const title = course.title || resource?.title || 'Course Syllabus';
  const subject = course.subject || resource?.subject || 'Curriculum';
  const gradeLevel = course.gradeLevel || resource?.gradeLevel || 'All Grades';
  const totalWeeks = course.totalWeeks || course.durationWeeks || 8;
  const curriculumStandard = course.curriculumStandard || 'CAPS ALIGNED';
  const description = course.description || course.courseOverview || '';
  const learningOutcomes: string[] = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
  const modules: any[] = Array.isArray(course.modules) ? course.modules : [];
  const gradingStructure: any[] = Array.isArray(course.gradingStructure) ? course.gradingStructure : [];

  const handleCopy = () => {
    let text = `${title}\nSubject: ${subject} | Grade: ${gradeLevel}\nTotal Duration: ${totalWeeks} Weeks\n\n`;
    if (description) {
      text += `DESCRIPTION:\n${description}\n\n`;
    }
    if (learningOutcomes.length > 0) {
      text += `LEARNING OUTCOMES:\n${learningOutcomes.map((o) => `• ${o}`).join('\n')}\n\n`;
    }
    modules.forEach((m: any, idx: number) => {
      const modTitle = m.title || `Module ${m.moduleNumber || idx + 1}`;
      const modDuration = m.durationWeeks ? ` (${m.durationWeeks} Weeks)` : '';
      text += `=== ${modTitle}${modDuration} ===\n${m.description || ''}\n`;
      const modTopics = Array.isArray(m.coreTopics) ? m.coreTopics : (Array.isArray(m.keyTopics) ? m.keyTopics : []);
      if (modTopics.length > 0) {
        text += `Topics: ${modTopics.join(', ')}\n`;
      }
      const modAssess = Array.isArray(m.assessments) ? m.assessments : (m.practicalProjectOrTask ? [m.practicalProjectOrTask] : []);
      if (modAssess.length > 0) {
        text += `Assessments: ${modAssess.join(', ')}\n`;
      }
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (resource) {
      saveResourceToStorage(resource);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Build
        </button>

        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#161616] hover:bg-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />
            {saved ? 'Saved!' : 'Save to My Sets'}
          </button>
        </div>
      </div>

      {/* Main Course Syllabus Sheet */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="pb-6 border-b border-stone-200 space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            COURSE SYLLABUS • {curriculumStandard}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-stone-600 font-semibold flex-wrap">
            <span>SUBJECT: {subject}</span>
            <span>•</span>
            <span>AUDIENCE: {gradeLevel}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">DURATION: {totalWeeks} WEEKS</span>
          </div>
          {description && (
            <p className="font-mono text-xs text-stone-700 pt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Learning Outcomes */}
        {learningOutcomes.length > 0 && (
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase text-stone-900 tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#E63956]" />
              Core Curriculum Learning Outcomes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {learningOutcomes.map((out, idx) => (
                <div key={idx} className="flex items-start gap-2 font-mono text-xs text-stone-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{out}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules Breakdown */}
        <div className="space-y-6">
          <h3 className="font-display font-black text-xl text-stone-900 uppercase">
            Curriculum Modules & Schedule
          </h3>

          <div className="space-y-5">
            {modules.map((mod: any, mIdx: number) => {
              const topics: string[] = Array.isArray(mod.coreTopics) 
                ? mod.coreTopics 
                : (Array.isArray(mod.keyTopics) 
                  ? mod.keyTopics 
                  : (Array.isArray(mod.topics) ? mod.topics : []));

              const assessments: string[] = Array.isArray(mod.assessments)
                ? mod.assessments
                : (mod.practicalProjectOrTask ? [mod.practicalProjectOrTask] : []);

              const lessons: any[] = Array.isArray(mod.lessons) ? mod.lessons : [];

              return (
                <div 
                  key={mod.id || mIdx}
                  className="p-6 rounded-2xl border border-stone-200/90 bg-stone-50/30 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-stone-200">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#E63956] uppercase block">
                        MODULE {mod.moduleNumber || mIdx + 1}
                      </span>
                      <h4 className="font-display font-black text-base sm:text-lg text-stone-900 uppercase">
                        {mod.title || `Module ${mIdx + 1}`}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {mod.durationWeeks && (
                        <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700">
                          {mod.durationWeeks} Weeks
                        </span>
                      )}
                      {mod.capsAlignment && (
                        <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E63956]">
                          {mod.capsAlignment}
                        </span>
                      )}
                    </div>
                  </div>

                  {mod.description && (
                    <p className="font-mono text-xs text-stone-700 leading-relaxed">
                      {mod.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-1">
                    {/* Core Topics */}
                    {topics.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1.5">
                        <span className="font-bold text-stone-900 uppercase text-[11px] block">
                          Core Lecture Topics
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-stone-600">
                          {topics.map((t: string, i: number) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Assessments */}
                    {assessments.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1.5">
                        <span className="font-bold text-stone-900 uppercase text-[11px] block">
                          Milestones & Assessments
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-stone-600">
                          {assessments.map((a: string, i: number) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lessons if available */}
                    {lessons.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2 col-span-1 md:col-span-2">
                        <span className="font-bold text-stone-900 uppercase text-[11px] block">
                          Lessons & Units
                        </span>
                        <div className="space-y-1.5">
                          {lessons.map((lesson: any, lIdx: number) => (
                            <div key={lIdx} className="flex items-center justify-between text-stone-700">
                              <span className="font-semibold">{lesson.lessonTitle || lesson.title}</span>
                              {lesson.estimatedMinutes && (
                                <span className="text-stone-500 text-[10px]">{lesson.estimatedMinutes}m</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grading Scheme */}
        {gradingStructure.length > 0 && (
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs space-y-2">
            <h4 className="font-bold uppercase text-stone-900 tracking-wider">
              Grading & Evaluation Distribution
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
              {gradingStructure.map((g: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200">
                  <span>{g.item}</span>
                  <span className="font-bold text-[#E63956]">{g.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
