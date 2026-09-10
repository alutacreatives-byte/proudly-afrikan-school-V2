import React, { useState } from 'react';
import { BuildHome } from './components/BuildHome';
import { BuildToolType, SavedResource } from './types';
import { generateBuildResource } from './services/buildService';
import { saveResourceToStorage, getSavedResources } from './utils/storage';

import { ExamViewer } from './components/viewers/ExamViewer';
import { WorksheetViewer } from './components/viewers/WorksheetViewer';
import { LessonPlanViewer } from './components/viewers/LessonPlanViewer';
import { CourseViewer } from './components/viewers/CourseViewer';
import { MindMapViewer } from './components/viewers/MindMapViewer';
import { PresentationViewer } from './components/viewers/PresentationViewer';

import { ArrowLeft, Sparkles, Copy, Bookmark, Check, Loader2 } from 'lucide-react';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export default function BuildApp({ initialResource, onGoHome }: BuildAppProps) {
  const [selectedTool, setSelectedTool] = useState<BuildToolType | null>(initialResource ? initialResource.toolType : null);
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource || null);
  const [topic, setTopic] = useState<string>(initialResource ? initialResource.topic || '' : '');
  const [subject, setSubject] = useState<string>(initialResource ? initialResource.subject || 'African Studies' : 'African Studies');
  const [gradeLevel, setGradeLevel] = useState<string>('Senior Secondary / High School (Grades 9-12)');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSelectTool = (toolId: BuildToolType, topicVal?: string, categoryVal?: string) => {
    setSelectedTool(toolId);
    setActiveResource(null);
    if (topicVal) setTopic(topicVal);
    if (categoryVal) setSubject(categoryVal);

    // Requirement: When selecting a tool, smooth scroll to the menu/workbench
    setTimeout(() => {
      const workbenchEl = document.getElementById('build-workbench');
      if (workbenchEl) {
        workbenchEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !selectedTool) return;

    setIsGenerating(true);
    try {
      const data = await generateBuildResource(selectedTool, {
        topic,
        subject,
        gradeLevel,
      });

      const newRes: SavedResource = {
        id: data.id || `res-${Date.now()}`,
        title: data.title || `${topic} - ${selectedTool.toUpperCase()}`,
        toolType: selectedTool,
        content: data,
        createdAt: new Date().toISOString(),
        subject,
        gradeLevel,
      };

      const savedRes = saveResourceToStorage(newRes);
      setActiveResource(savedRes);

      // Requirement: After completing the menu/generation, smooth scroll to the top of the result
      setTimeout(() => {
        const resultEl = document.getElementById('build-result-top');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeResource) return;
    navigator.clipboard.writeText(JSON.stringify(activeResource.content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAgain = () => {
    if (!activeResource) return;
    saveResourceToStorage(activeResource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // If viewing a generated resource or result, render the appropriate viewer
  if (activeResource) {
    const handleBack = () => {
      setActiveResource(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (activeResource.toolType === 'exam') {
      return <ExamViewer resource={activeResource} onBack={handleBack} />;
    }
    if (activeResource.toolType === 'worksheet') {
      return <WorksheetViewer resource={activeResource} onBack={handleBack} />;
    }
    if (activeResource.toolType === 'lesson' || activeResource.toolType === 'lesson-plan') {
      return <LessonPlanViewer resource={activeResource} onBack={handleBack} />;
    }
    if (activeResource.toolType === 'course' || activeResource.toolType === 'course-builder') {
      return <CourseViewer resource={activeResource} onBack={handleBack} />;
    }
    if (activeResource.toolType === 'mindmap' || activeResource.toolType === 'mind-map') {
      return <MindMapViewer resource={activeResource} onBack={handleBack} />;
    }
    if (activeResource.toolType === 'presentation') {
      return <PresentationViewer resource={activeResource} onBack={handleBack} />;
    }

    // Default fallback viewer if toolType is generic/other
    return (
      <div id="build-result-top" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E63956]" />
            Back to Generators
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={handleSaveAgain}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E63956] hover:bg-[#d02e48] text-white font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save to My Sets'}
            </button>
          </div>
        </div>

        <div className="card-3d-elevated p-8 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E63956]/10 text-[#E63956]">
              {activeResource.toolType.toUpperCase()} RESOURCE
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#161616] mt-2">
              {activeResource.title}
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Subject: {activeResource.subject} • Created: {new Date(activeResource.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="prose max-w-none text-stone-800 space-y-4">
            <pre className="bg-stone-50 border border-stone-200 p-6 rounded-2xl text-xs sm:text-sm font-mono overflow-x-auto text-stone-800">
              {JSON.stringify(activeResource.content, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // If a tool is selected, show the workbench form
  if (selectedTool) {
    return (
      <div id="build-workbench" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <button
            onClick={() => {
              setSelectedTool(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E63956]" />
            All Generators
          </button>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956] bg-[#E63956]/10 px-3 py-1 rounded-full">
            Workbench: {selectedTool.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleGenerate} className="card-3d-elevated p-8 space-y-6">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight mb-2">
              Configure {selectedTool.toUpperCase()} Generator
            </h2>
            <p className="text-sm text-stone-600 font-mono">
              Provide your topic and curriculum context below to generate AI-powered classroom materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-800">
                Topic or Concept *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Mansa Musa & Mali Empire Trade"
                className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63956]/30 focus:border-[#E63956] bg-stone-50/50 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-800">
                Subject Area *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. African History & Economics"
                className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63956]/30 focus:border-[#E63956] bg-stone-50/50 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-800">
              Grade Level / Educational Standard
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63956]/30 focus:border-[#E63956] bg-stone-50/50 font-medium"
            >
              <option value="Primary School / Grades 4-7">Primary School / Grades 4-7</option>
              <option value="Junior Secondary / Grades 8-9">Junior Secondary / Grades 8-9</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Undergraduate / Tertiary">Undergraduate / Tertiary</option>
            </select>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedTool(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-display font-bold uppercase tracking-wider text-xs hover:bg-stone-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="btn-3d-tactile px-8 py-3.5 font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {selectedTool.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default: Build Home
  return (
    <BuildHome
      onSelectTool={handleSelectTool}
      savedCount={getSavedResources().length}
    />
  );
}
