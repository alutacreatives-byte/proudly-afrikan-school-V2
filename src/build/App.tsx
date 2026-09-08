import React, { useState } from 'react';
import { BuildHome } from './components/BuildHome';
import { BuildToolType, SavedResource } from './types';
import { generateBuildResource } from './services/buildService';
import { saveResourceToStorage, getSavedResources } from './utils/storage';
import { SourceMaterialUpload } from './components/SourceMaterialUpload';
import { ArrowLeft, Sparkles, Printer, Copy, Bookmark, Check, Loader2, Download } from 'lucide-react';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export default function BuildApp({ initialResource, onGoHome }: BuildAppProps) {
  const [selectedTool, setSelectedTool] = useState<BuildToolType | null>(initialResource ? initialResource.toolType : null);
  const [activeResource, setActiveResource] = useState<SavedResource | null>(initialResource || null);
  const [prefillTopic, setPrefillTopic] = useState<string>('');
  const [prefillCategory, setPrefillCategory] = useState<string>('');

  // Form states for workbench
  const [topic, setTopic] = useState<string>(initialResource ? initialResource.topic || '' : '');
  const [subject, setSubject] = useState<string>(initialResource ? initialResource.subject || 'African Studies' : 'African Studies');
  const [gradeLevel, setGradeLevel] = useState<string>('Senior Secondary / High School (Grades 9-12)');
  const [sourceText, setSourceText] = useState<string>('');
  const [sourceFile, setSourceFile] = useState<{ name: string; content: string; type: string } | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSelectTool = (toolId: BuildToolType, topicVal?: string, categoryVal?: string) => {
    setSelectedTool(toolId);
    setActiveResource(null);
    if (topicVal) setTopic(topicVal);
    if (categoryVal) setSubject(categoryVal);
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
        sourceText,
        sourceFile,
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

  // If viewing a generated resource or result
  if (activeResource) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <button
            onClick={() => setActiveResource(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#E63956]" />
            Back to Generators
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={handleSaveAgain}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E63956] hover:bg-[#d02e48] text-white font-mono text-xs font-bold uppercase transition-all shadow-xs"
            >
              {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save to My Sets'}
            </button>
          </div>
        </div>

        {/* Resource Display Card */}
        <div className="bg-white rounded-[2rem] border border-stone-200 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] space-y-6">
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <button
            onClick={() => setSelectedTool(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#E63956]" />
            All Generators
          </button>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956] bg-[#E63956]/10 px-3 py-1 rounded-full">
            Workbench: {selectedTool.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleGenerate} className="bg-white rounded-[2rem] border border-stone-200 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] space-y-6">
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

          <SourceMaterialUpload
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            sourceFile={sourceFile}
            onSourceFileChange={setSourceFile}
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setSelectedTool(null)}
              className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-display font-bold uppercase tracking-wider text-xs hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-8 py-3.5 rounded-xl bg-[#E63956] hover:bg-[#d02e48] text-white font-display font-bold uppercase tracking-wider text-sm shadow-[0_10px_25px_rgba(230,57,86,0.35)] transition-all flex items-center gap-2 disabled:opacity-50"
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
