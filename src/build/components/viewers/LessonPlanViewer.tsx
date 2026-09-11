import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Sparkles, 
  Users 
} from 'lucide-react';
import { LessonPlanData, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface LessonPlanViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const LessonPlanViewer: React.FC<LessonPlanViewerProps> = ({ resource, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan: LessonPlanData = resource.data;

  const handleCopy = () => {
    let text = `${plan.title}\nSubject: ${plan.subject} | Grade: ${plan.gradeLevel} | Duration: ${plan.durationMinutes} mins\n\n`;
    text += `OBJECTIVES:\n${(plan.learningObjectives || []).map((o) => `• ${o}`).join('\n')}\n\n`;
    text += `5E PEDAGOGICAL PHASES:\n`;
    (plan.phases || []).forEach((p) => {
      const kq = Array.isArray(p.keyQuestions) ? p.keyQuestions.join('; ') : '';
      text += `\n[${p.phase} - ${p.durationMinutes} Mins]\nTeacher: ${p.teacherActivity}\nStudents: ${p.studentActivity}\n${kq ? `Key Questions: ${kq}\n` : ''}`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveResourceToStorage(resource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Action Bar */}
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

      {/* Main Lesson Plan Document */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="pb-6 border-b border-stone-200 space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            5E PEDAGOGICAL LESSON PLAN • CAPS ALIGNED
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
            {plan.title || resource.title}
          </h1>
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-stone-600 font-semibold flex-wrap">
            <span>SUBJECT: {plan.subject || resource.subject}</span>
            <span>•</span>
            <span>GRADE: {plan.gradeLevel || resource.gradeLevel}</span>
            <span>•</span>
            <span className="text-[#E63956] font-bold">DURATION: {plan.durationMinutes || 60} MINS</span>
          </div>
        </div>

        {/* Objectives & Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
            <h3 className="font-bold uppercase text-stone-900 tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Specific Learning Objectives
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-stone-700">
              {(plan.learningObjectives || []).map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
            <h3 className="font-bold uppercase text-stone-900 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E63956]" />
              Required Classroom Materials
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-stone-700">
              {(plan.materialsAndResources || []).map((mat, i) => (
                <li key={i}>{mat}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5E Phases */}
        <div className="space-y-6">
          <h3 className="font-display font-black text-xl text-stone-900 uppercase">
            5E Pedagogical Phases Sequence
          </h3>

          <div className="space-y-4">
            {(plan.phases || []).map((phase, pIdx) => {
              const phaseColors: Record<string, string> = {
                Engage: 'border-l-4 border-amber-500',
                Explore: 'border-l-4 border-blue-500',
                Explain: 'border-l-4 border-purple-500',
                Elaborate: 'border-l-4 border-emerald-500',
                Evaluate: 'border-l-4 border-rose-500',
              };

              return (
                <div 
                  key={pIdx}
                  className={`p-6 rounded-2xl bg-stone-50/40 border border-stone-200/90 shadow-2xs space-y-4 ${phaseColors[phase.phase] || ''}`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-[#161616] px-2.5 py-0.5 rounded-md uppercase">
                        Phase {pIdx + 1}: {phase.phase}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-stone-600">
                      {phase.durationMinutes} Minutes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <span className="font-bold text-stone-900 uppercase text-[11px] block text-[#E63956]">
                        Teacher Facilitation:
                      </span>
                      <p className="text-stone-700 leading-relaxed">{phase.teacherActivity}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <span className="font-bold text-stone-900 uppercase text-[11px] block text-blue-600">
                        Student Inquiry Action:
                      </span>
                      <p className="text-stone-700 leading-relaxed">{phase.studentActivity}</p>
                    </div>
                  </div>

                  {phase.keyQuestions && phase.keyQuestions.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 font-mono text-xs text-amber-900 space-y-1">
                      <span className="font-bold uppercase text-[10px] text-amber-800 block">
                        Essential Inquiry Questions:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {phase.keyQuestions.map((q, qIndex) => (
                          <li key={qIndex}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Differentiation & Assessment */}
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs space-y-4">
          <h4 className="font-bold uppercase text-stone-900 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E63956]" />
            Inclusive Differentiation Strategies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-stone-700">
            <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
              <span className="font-bold text-amber-700 uppercase text-[10px] block">Support for Struggling</span>
              <p>{plan.differentiationStrategies?.supportForStruggling}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
              <span className="font-bold text-blue-700 uppercase text-[10px] block">Extension for Advanced</span>
              <p>{plan.differentiationStrategies?.extensionForAdvanced}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
              <span className="font-bold text-purple-700 uppercase text-[10px] block">Special Educational Needs</span>
              <p>{plan.differentiationStrategies?.specialEducationalNeeds}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
