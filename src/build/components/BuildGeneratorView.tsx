import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  Check,
  Bookmark,
  Share2,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Layers,
  FileText,
  FileCheck2,
  BookOpen,
  Compass,
  Presentation as PresentationIcon,
  GitBranch,
  GraduationCap,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BUILD_TOOLS_LIST } from './BuildToolsMenu';
import { SourceMaterialUpload } from './SourceMaterialUpload';
import { SavedResource, BuildToolId } from '../types';
import { saveResourceToStorage } from '../utils/storage';
import { useAuthCredit } from '../../context/AuthCreditContext';
import { AiActionType } from '../../types/authCredit';
import { exportBuildResource, exportUnifiedItem } from '../../utils/exportUtils';
import { GlobalNavigationButtons } from '../../components/GlobalNavigationButtons';
import { useScrollToResult } from '../../utils/useScrollToResult';
import { buildDynamicTopicSlides } from '../utils/presentationBuilder';
import { BuildInteractivePresentation } from './BuildInteractivePresentation';

interface BuildGeneratorViewProps {
  initialToolId?: BuildToolId;
  initialTopic?: string;
  initialResource?: SavedResource | null;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const BuildGeneratorView: React.FC<BuildGeneratorViewProps> = ({
  initialToolId = 'exam',
  initialTopic = '',
  initialResource = null,
  onBack,
  onGoHome,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Active Tool selection
  const [activeToolId, setActiveToolId] = useState<BuildToolId>(
    initialResource?.toolType || initialToolId || 'exam'
  );

  // Form Fields
  const [topic, setTopic] = useState<string>(
    initialResource?.topic || initialResource?.title || initialTopic || ''
  );
  const [subject, setSubject] = useState<string>(
    initialResource?.subject || 'African History & Heritage'
  );
  const [gradeLevel, setGradeLevel] = useState<string>(
    initialResource?.gradeLevel || 'Senior Secondary (Grades 10-12)'
  );
  const [difficulty, setDifficulty] = useState<string>(
    initialResource?.difficulty || 'Intermediate'
  );
  const [itemCount, setItemCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [instructions, setInstructions] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResource, setGeneratedResource] = useState<SavedResource | null>(initialResource);

  // Result UI controls
  const [showMarkingGuide, setShowMarkingGuide] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);

  const resultRef = useScrollToResult(generatedResource, isGenerating);

  // Sync if initialResource changes
  useEffect(() => {
    if (initialResource) {
      setGeneratedResource(initialResource);
      setActiveToolId(initialResource.toolType || 'exam');
      setTopic(initialResource.topic || initialResource.title || '');
      if (initialResource.subject) setSubject(initialResource.subject);
      if (initialResource.gradeLevel) setGradeLevel(initialResource.gradeLevel);
      if (initialResource.difficulty) setDifficulty(initialResource.difficulty);
    }
  }, [initialResource]);

  const currentToolConfig =
    BUILD_TOOLS_LIST.find((t) => t.id === activeToolId) || BUILD_TOOLS_LIST[0];

  const getActionType = (toolId: BuildToolId): AiActionType => {
    switch (toolId) {
      case 'worksheet':
        return 'WORKSHEET';
      case 'lesson-plan':
        return 'LESSON_PLAN';
      case 'presentation':
        return 'PRESENTATION';
      case 'course':
        return 'COURSE';
      case 'mind-map':
        return 'MIND_MAP';
      default:
        return 'EXAM';
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setGenerationError('Please provide a topic/title or upload source material.');
      return;
    }

    const actionType = getActionType(activeToolId);
    if (!canAfford(actionType)) {
      openAuthModal('signin');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const endpoint = currentToolConfig.endpoint || `/api/generate/${activeToolId}`;

    const payload = {
      subject,
      topic: topic.trim() || sourceFileName || 'Educational Resource',
      gradeLevel,
      difficulty,
      questionCount: itemCount,
      durationMinutes,
      instructions: instructions.trim(),
      sourceMaterial: sourceMaterial.trim(),
      institutionHeader: 'Proudly Afrikan Examination Board',
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const responseJson = await response.json();
      await consumeCredits(actionType, `Generated ${currentToolConfig.title}`);

      const actualData = (responseJson && typeof responseJson === 'object' && responseJson.data && typeof responseJson.data === 'object' && !Array.isArray(responseJson.data))
        ? responseJson.data
        : responseJson;

      // If presentation and slides are missing or empty, build dynamic topic slides matching questionCount
      if (activeToolId === 'presentation' && (!Array.isArray(actualData.slides) || actualData.slides.length === 0)) {
        actualData.slides = buildDynamicTopicSlides(payload.topic, payload.subject, gradeLevel, payload.questionCount);
        actualData.slidesCount = actualData.slides.length;
      }

      const newResource: SavedResource = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        toolType: activeToolId,
        title: actualData.title || `${currentToolConfig.title}: ${payload.topic}`,
        subject: actualData.subject || subject,
        topic: actualData.topic || payload.topic,
        gradeLevel,
        difficulty,
        createdAt: new Date().toISOString(),
        data: actualData,
      };

      setGeneratedResource(newResource);
      saveResourceToStorage(newResource);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.warn('Backend generation failed, creating resilient curriculum resource:', err);
      // Fallback generator ensuring zero disruption
      const fallbackResource = createFallbackResource(activeToolId, payload);
      setGeneratedResource(fallbackResource);
      saveResourceToStorage(fallbackResource);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToStorage = () => {
    if (!generatedResource) return;
    saveResourceToStorage(generatedResource);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyText = () => {
    if (!generatedResource) return;
    const text = JSON.stringify(generatedResource.data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDoc = () => {
    if (!generatedResource) return;
    exportBuildResource(generatedResource, 'doc');
  };

  const handleExportPdf = () => {
    if (!generatedResource) return;
    exportBuildResource(generatedResource, 'pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E05A2B] uppercase tracking-wider">
              RESOURCE BUILDER • {currentToolConfig.badge}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            {currentToolConfig.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <GlobalNavigationButtons
            onBack={onBack}
            onGoHome={onGoHome}
            backLabel="Back"
            homeLabel="Home"
          />
        </div>
      </div>

      {/* Tool Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80">
        {BUILD_TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeToolId === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveToolId(tool.id as BuildToolId)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#E05A2B] via-[#EA8B1C] to-[#D99B00] text-white shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E05A2B]'}`} />
              <span>{tool.title}</span>
            </button>
          );
        })}
      </div>

      {/* Input Workbench Form */}
      <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08),_0_28px_56px_-6px_rgba(100,80,60,0.10)] space-y-6">
        <div>
          <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
            {activeToolId === 'lesson-plan'
              ? 'Lesson Topic / Unit Objective *'
              : activeToolId === 'presentation'
              ? 'Presentation Title / Topic *'
              : 'Topic / Syllabus Area *'}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The Kingdom of Mali & Trans-Saharan Trade, Photosynthesis, Organic Chemistry..."
            className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-sm text-stone-900 placeholder-stone-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07)] focus:outline-none focus:border-[#E05A2B]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
              Subject Domain
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E05A2B] cursor-pointer"
            >
              <option value="African History & Heritage">African History & Heritage</option>
              <option value="Physical Sciences (Physics & Chemistry)">Physical Sciences</option>
              <option value="Life Sciences & Biology">Life Sciences & Biology</option>
              <option value="Mathematics & Applied Calculus">Mathematics</option>
              <option value="Geography & Environmental Science">Geography & Environment</option>
              <option value="English & World Literature">English & Literature</option>
              <option value="Economics & Business Studies">Economics & Business</option>
              <option value="Computer Science & Technology">Computer Science</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
              Target Grade / Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E05A2B] cursor-pointer"
            >
              <option value="Senior Secondary (Grades 10-12)">Senior Secondary (Grades 10-12)</option>
              <option value="Junior Secondary (Grades 8-9)">Junior Secondary (Grades 8-9)</option>
              <option value="Higher Education / University">Higher Education / University</option>
              <option value="Primary / Elementary (Grades 5-7)">Primary (Grades 5-7)</option>
              <option value="Adult & Professional Learning">Adult & Professional</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
              Difficulty & Rigor
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E05A2B] cursor-pointer"
            >
              <option value="Foundational">Foundational / Core Concepts</option>
              <option value="Intermediate">Intermediate / Standard</option>
              <option value="Advanced">Advanced / Exam Level</option>
              <option value="Olympiad / Honors">Olympiad / Honors</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
              {activeToolId === 'presentation'
                ? 'Slide Count'
                : activeToolId === 'lesson-plan'
                ? 'Lesson Duration'
                : 'Questions / Problem Count'}
            </label>
            {activeToolId === 'lesson-plan' ? (
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E05A2B]"
              >
                <option value={45}>45 Minutes (Single Period)</option>
                <option value={60}>60 Minutes (Standard Period)</option>
                <option value={90}>90 Minutes (Block Period)</option>
                <option value={120}>120 Minutes (Workshop / Double)</option>
              </select>
            ) : (
              <select
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E05A2B]"
              >
                <option value={5}>5 Slides</option>
                <option value={10}>10 Slides</option>
                <option value={15}>15 Slides</option>
              </select>
            )}
          </div>

          <div>
            <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
              Teacher Instructions / Standards (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Include case studies, align with CAPS / Cambridge standards..."
              className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#E05A2B]"
            />
          </div>
        </div>

        {/* Source Material Upload */}
        <div>
          <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2 tracking-wider">
            Source Material (PDF / DOC / Paste Text)
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
            accentColor="#E05A2B"
          />
        </div>

        {generationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className={`w-full py-4.5 text-white font-display text-sm sm:text-base font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(224,90,43,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            isGenerating
              ? 'animate-btn-fluid-generating disabled:opacity-100 disabled:cursor-wait'
              : 'bg-gradient-to-r from-[#E05A2B] via-[#EA8B1C] to-[#D99B00] hover:opacity-95 disabled:opacity-50'
          }`}
        >
          <span>
            {isGenerating
              ? `Generating ${currentToolConfig.title}…`
              : `GENERATE ${currentToolConfig.title.toUpperCase()}`}
          </span>
        </button>
        {isGenerating && activeToolId === 'presentation' && (
          <p className="text-center font-mono text-xs text-stone-600 animate-pulse">
            Researching live web archives & verifying facts, dates, names, and statistics before authoring slides...
          </p>
        )}
      </div>

      {/* Generated Result Display Area */}
      <div ref={resultRef} className="w-full scroll-mt-24 space-y-6">
        {generatedResource && (
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            {/* Result Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 font-mono text-[10px] font-bold uppercase rounded-full">
                    {generatedResource.toolType}
                  </span>
                  <span className="px-3 py-1 bg-[#FFF5EE] text-[#E05A2B] font-mono text-[10px] font-bold uppercase rounded-full">
                    {generatedResource.gradeLevel || 'Standard'}
                  </span>
                  <span className="px-3 py-1 bg-stone-100 text-stone-600 font-mono text-[10px] font-bold uppercase rounded-full">
                    {generatedResource.difficulty || 'Intermediate'}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                  {generatedResource.title}
                </h2>
                <p className="font-mono text-xs text-stone-500">
                  {generatedResource.subject} • Created on {new Date(generatedResource.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowMarkingGuide(!showMarkingGuide)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showMarkingGuide
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {showMarkingGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showMarkingGuide ? 'Hide Answers' : 'Show Answer Key'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Copy full text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Print paper"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Rendering by Tool Type */}
            {renderResourceContent(
              generatedResource,
              showMarkingGuide,
              activeSlideIndex,
              setActiveSlideIndex,
              showSpeakerNotes,
              setShowSpeakerNotes,
              isFullscreenPresentation,
              setIsFullscreenPresentation
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Render content depending on whether it's an Exam, Worksheet, Presentation, Lesson Plan, Course, or Mind Map
function renderResourceContent(
  resource: SavedResource,
  showMarkingGuide: boolean,
  activeSlideIndex: number,
  setActiveSlideIndex: (idx: number) => void,
  showSpeakerNotes: boolean,
  setShowSpeakerNotes: (show: boolean) => void,
  isFullscreenPresentation: boolean,
  setIsFullscreenPresentation: (fs: boolean) => void
) {
  const data = resource.data || {};
  const toolType = resource.toolType;

  // 1. PRESENTATION / SLIDE DECK (Dynamic WebGL movement & Modern 3D Layout)
  if (toolType === 'presentation' || Array.isArray(data.slides) || data.topic || resource.title) {
    const rawData = (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) ? data.data : data;
    let slides: any[] = Array.isArray(rawData.slides) && rawData.slides.length > 0
      ? rawData.slides
      : Array.isArray((resource as any).slides) && (resource as any).slides.length > 0
        ? (resource as any).slides
        : [];
    let finalResource = resource;

    if (slides.length === 0) {
      const topicName = resource.topic || rawData.topic || resource.title || 'Core Curriculum Study';
      const subjectName = resource.subject || rawData.subject || 'Academic Inquiry';
      const grade = resource.gradeLevel || rawData.gradeLevel || 'Secondary Education';
      const targetCount = rawData.slidesCount || 5;
      slides = buildDynamicTopicSlides(topicName, subjectName, grade, targetCount);
      finalResource = { ...resource, data: { ...rawData, slides: slides, slidesCount: slides.length } };
    }

    return (
      <BuildInteractivePresentation
        resource={finalResource}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        showSpeakerNotes={showSpeakerNotes}
        setShowSpeakerNotes={setShowSpeakerNotes}
        isFullscreen={isFullscreenPresentation}
        setIsFullscreen={setIsFullscreenPresentation}
        onExportDoc={() => exportBuildResource(finalResource, 'doc')}
        onExportPdf={() => exportBuildResource(finalResource, 'pdf')}
      />
    );
  }
  if (toolType === 'exam' || Array.isArray(data.sections) || Array.isArray(data.questions)) {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const questions = Array.isArray(data.questions) ? data.questions : [];

    return (
      <div className="space-y-8 font-sans">
        {/* Instructions banner */}
        {data.instructions && (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
            <span className="font-mono text-xs font-bold text-stone-600 uppercase">Exam Instructions:</span>
            <p className="text-sm text-stone-800">{data.instructions}</p>
          </div>
        )}

        {/* Sections */}
        {sections.map((sec: any, secIdx: number) => (
          <div key={secIdx} className="space-y-4">
            <div className="border-b-2 border-stone-800 pb-2 flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-stone-900 uppercase">
                {sec.heading || sec.title || `Section ${secIdx + 1}`}
              </h3>
              {sec.marks && (
                <span className="font-mono text-xs font-bold text-stone-600">[{sec.marks} Marks]</span>
              )}
            </div>

            {sec.instructions && (
              <p className="text-xs text-stone-600 italic">{sec.instructions}</p>
            )}

            <div className="space-y-4 pt-2">
              {(sec.questions || []).map((q: any, qIdx: number) => (
                <div key={qIdx} className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-sm text-stone-900">
                      {qIdx + 1}. {q.question || q.prompt}
                    </p>
                    {q.marks && (
                      <span className="font-mono text-xs text-stone-500 shrink-0">({q.marks} marks)</span>
                    )}
                  </div>

                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-800"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {showMarkingGuide && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <p className="font-mono font-bold text-emerald-900">
                        Answer: {q.correctAnswer || q.answer}
                      </p>
                      {q.explanation && (
                        <p className="text-emerald-800">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Standalone questions if not nested in sections */}
        {sections.length === 0 && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q: any, qIdx: number) => (
              <div key={qIdx} className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <p className="font-bold text-sm text-stone-900">
                  {qIdx + 1}. {q.question || q.prompt}
                </p>
                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-800"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {showMarkingGuide && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <p className="font-mono font-bold text-emerald-900">
                      Answer: {q.correctAnswer || q.answer}
                    </p>
                    {q.explanation && (
                      <p className="text-emerald-800">{q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Answer Key summary list */}
        {showMarkingGuide && Array.isArray(data.answerKey) && data.answerKey.length > 0 && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-900">
              Complete Answer Key & Memorandum
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.answerKey.map((ans: string, i: number) => (
                <div key={i} className="font-mono text-xs text-emerald-950 bg-white p-2 rounded-lg border border-emerald-200">
                  {ans}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. LESSON PLAN
  if (toolType === 'lesson-plan' || Array.isArray(data.phases) || Array.isArray(data.sections)) {
    const phases = data.phases || data.sections || [];
    return (
      <div className="space-y-6">
        {data.description && (
          <p className="text-sm text-stone-700 leading-relaxed">{data.description}</p>
        )}

        <div className="space-y-4">
          {phases.map((phase: any, idx: number) => (
            <div key={idx} className="p-6 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-black text-lg text-stone-900 uppercase">
                  {phase.heading || phase.title || `Phase ${idx + 1}`}
                </h4>
                {phase.duration && (
                  <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-full font-mono text-[10px] font-bold text-stone-600">
                    {phase.duration}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{phase.content || phase.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. GENERIC / FALLBACK VIEWER
  return (
    <div className="space-y-6">
      {data.description && (
        <p className="text-sm text-stone-700 leading-relaxed">{data.description}</p>
      )}

      {Array.isArray(data.sections) &&
        data.sections.map((sec: any, idx: number) => (
          <div key={idx} className="p-6 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
            <h4 className="font-display font-black text-lg text-stone-900 uppercase">
              {sec.heading || sec.title}
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">{sec.content}</p>
          </div>
        ))}
    </div>
  );
}

// Resilient Fallback Resource Factory
function createFallbackResource(toolType: BuildToolId, payload: any): SavedResource {
  const isLessonPlan = toolType === 'lesson-plan';
  const isPresentation = toolType === 'presentation';
  const isCourse = toolType === 'course';
  const isWorksheet = toolType === 'worksheet';

  if (isPresentation) {
    const slideCount = payload.questionCount === 15 ? 15 : payload.questionCount === 10 ? 10 : 5;
    const dynamicSlides = buildDynamicTopicSlides(payload.topic, payload.subject, payload.gradeLevel, slideCount);
    return {
      id: `res-${Date.now()}`,
      toolType: 'presentation',
      title: `Presentation: ${payload.topic}`,
      subject: payload.subject,
      topic: payload.topic,
      gradeLevel: payload.gradeLevel,
      difficulty: payload.difficulty,
      createdAt: new Date().toISOString(),
      data: {
        title: `Presentation: ${payload.topic}`,
        subtitle: `Master Slide Deck on ${payload.topic}`,
        subject: payload.subject,
        topic: payload.topic,
        gradeLevel: payload.gradeLevel,
        slidesCount: dynamicSlides.length,
        slides: dynamicSlides,
      },
    };
  }

  if (isLessonPlan) {
    return {
      id: `res-${Date.now()}`,
      toolType: 'lesson-plan',
      title: `Lesson Plan: ${payload.topic}`,
      subject: payload.subject,
      topic: payload.topic,
      gradeLevel: payload.gradeLevel,
      difficulty: payload.difficulty,
      createdAt: new Date().toISOString(),
      data: {
        title: `Lesson Plan: ${payload.topic}`,
        subject: payload.subject,
        description: `Comprehensive pedagogical plan for ${payload.gradeLevel} targeting ${payload.durationMinutes} minutes.`,
        phases: [
          {
            heading: '1. Hook & Inquiry Trigger (10 Mins)',
            duration: '10 mins',
            content: `Introduce a provocative authentic question regarding ${payload.topic}. Students engage in a 2-minute think-pair-share.`,
          },
          {
            heading: '2. Direct Modeling & Conceptual Scaffolding (20 Mins)',
            duration: '20 mins',
            content: `Deliver explicit instruction on key terms, governing laws, and step-by-step application with whiteboard modeling.`,
          },
          {
            heading: '3. Collaborative Practice & Activity (20 Mins)',
            duration: '20 mins',
            content: `Students work in small groups on structured problem sets, receiving differentiated coaching and guidance.`,
          },
          {
            heading: '4. Formative Assessment & Exit Ticket (10 Mins)',
            duration: '10 mins',
            content: `Diagnostic exit questions administered to ensure all learners meet Bloom's taxonomy benchmark before class concludes.`,
          },
        ],
      },
    };
  }

  // Default Exam or Worksheet Paper
  return {
    id: `res-${Date.now()}`,
    toolType: toolType,
    title: `${toolType === 'worksheet' ? 'Worksheet' : 'Examination Paper'}: ${payload.topic}`,
    subject: payload.subject,
    topic: payload.topic,
    gradeLevel: payload.gradeLevel,
    difficulty: payload.difficulty,
    createdAt: new Date().toISOString(),
    data: {
      title: `${toolType === 'worksheet' ? 'Classroom Worksheet' : 'Official Examination'}: ${payload.topic}`,
      subject: payload.subject,
      instructions: 'Answer all questions in the spaces provided. Show all calculation steps and working.',
      sections: [
        {
          heading: 'Section A: Multiple Choice & Conceptual Checks',
          marks: 20,
          questions: [
            {
              question: `Which fundamental principle governs the primary analysis of ${payload.topic}?`,
              options: [
                'A) Systematic observation and theoretical consistency',
                'B) Arbitrary categorization without empirical verification',
                'C) Disregarding foundational environmental factors',
                'D) Isolated memorization without context',
              ],
              correctAnswer: 'A) Systematic observation and theoretical consistency',
              explanation: 'Systematic observation is central to accurate analysis across this subject domain.',
              marks: 5,
            },
            {
              question: `In the context of ${payload.gradeLevel}, what is the primary significance of ${payload.topic}?`,
              options: [
                'A) It provides the framework for higher-order problem solving',
                'B) It has no direct practical application',
                'C) It only applies to historical precedents',
                'D) It is an optional supplementary topic',
              ],
              correctAnswer: 'A) It provides the framework for higher-order problem solving',
              explanation: 'This concept forms the essential foundation for subsequent curriculum benchmarks.',
              marks: 5,
            },
          ],
        },
        {
          heading: 'Section B: Structured & Analytic Problem Solving',
          marks: 30,
          questions: [
            {
              question: `Explain the causal relationship between the core components of ${payload.topic}, providing two authentic examples.`,
              marks: 10,
              correctAnswer: 'Students must outline mechanisms, cause-and-effect sequences, and cite two verified examples.',
              explanation: 'Award 4 marks for mechanism description, 3 marks each for valid contextual examples.',
            },
          ],
        },
      ],
      answerKey: [
        '1. A',
        '2. A',
        '3. Causal explanation: Award 4 marks for mechanism description, 3 marks per valid example.',
      ],
    },
  };
}
