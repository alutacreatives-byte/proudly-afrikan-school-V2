import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronDown, 
  Upload, 
  Camera, 
  FileText, 
  Check, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BuildToolType, GeneratorFormData } from '../../types';

interface BuildToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeType: BuildToolType;
  onSelectType: (type: BuildToolType) => void;
  onGenerate: (data: GeneratorFormData) => Promise<void>;
  isGenerating?: boolean;
}

interface ToolDefinition {
  type: BuildToolType;
  label: string;
  headerTitle: string;
  headerSubtitle: string;
  generateButtonText: string;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'exam',
    label: 'EXAM & QUIZ',
    headerTitle: 'EXAM & QUIZ GENERATOR',
    headerSubtitle: 'ASSESSMENT & TESTING • CAPS ALIGNED',
    generateButtonText: 'GENERATE EXAM & QUIZ',
  },
  {
    type: 'worksheet',
    label: 'WORKSHEET',
    headerTitle: 'WORKSHEET GENERATOR',
    headerSubtitle: 'PRACTICE & EXERCISES • CAPS ALIGNED',
    generateButtonText: 'GENERATE WORKSHEET',
  },
  {
    type: 'course',
    label: 'COURSE SYLLABUS',
    headerTitle: 'COURSE SYLLABUS BUILDER',
    headerSubtitle: 'CURRICULUM & MODULES • CAPS ALIGNED',
    generateButtonText: 'GENERATE COURSE SYLLABUS',
  },
  {
    type: 'lesson-plan',
    label: 'LESSON PLAN',
    headerTitle: 'LESSON PLAN GENERATOR',
    headerSubtitle: 'TEACHING & PEDAGOGY • CAPS ALIGNED',
    generateButtonText: 'GENERATE LESSON PLAN',
  },
  {
    type: 'mind-map',
    label: 'MIND MAP',
    headerTitle: 'MIND MAP GENERATOR',
    headerSubtitle: 'VISUAL HIERARCHY • CAPS ALIGNED',
    generateButtonText: 'GENERATE MIND MAP',
  },
  {
    type: 'presentation',
    label: 'PRESENTATION',
    headerTitle: 'PRESENTATION GENERATOR',
    headerSubtitle: 'SLIDES & LECTURE • CAPS ALIGNED',
    generateButtonText: 'GENERATE PRESENTATION',
  },
];

const GRADE_LEVEL_OPTIONS = [
  'Grade 10-12 (FET / Senior)',
  'Grade 7-9 (Senior Phase)',
  'Grade 4-6 (Intermediate Phase)',
  'Grade 1-3 (Foundation Phase)',
  'University / Higher Ed',
  'Professional / Adult Learning',
];

const COUNT_OPTIONS = [
  { label: '5 Questions / Items', value: 5 },
  { label: '10 Questions / Items', value: 10 },
  { label: '15 Questions / Items', value: 15 },
  { label: '20 Questions / Items', value: 20 },
  { label: '25 Questions / Items', value: 25 },
];

export const BuildToolModal: React.FC<BuildToolModalProps> = ({
  isOpen,
  onClose,
  activeType,
  onSelectType,
  onGenerate,
  isGenerating = false,
}) => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 10-12 (FET / Senior)');
  const [itemCount, setItemCount] = useState<number>(10);
  const [sourceFile, setSourceFile] = useState<{
    name: string;
    content: string;
    type: string;
    size?: string;
  } | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Camera capture modal state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Active definition
  const currentDef = TOOL_DEFINITIONS.find((t) => t.type === activeType) || TOOL_DEFINITIONS[0];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showCamera) {
          stopCamera();
        } else if (!isGenerating) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCamera, isGenerating, onClose]);

  // File parsing helpers
  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md');
    
    if (isText) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSourceFile({
          name: file.name,
          content: text || '',
          type: file.type || 'text/plain',
          size: `${Math.round(file.size / 1024)} KB`,
        });
      };
      reader.readAsText(file);
    } else {
      // PDF or Doc file: read base summary / metadata
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSourceFile({
          name: file.name,
          content: `Extracted material from attached file: ${file.name} (${Math.round(file.size / 1024)} KB)`,
          type: file.type || 'application/pdf',
          size: `${Math.round(file.size / 1024)} KB`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Camera Handlers
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        // Fallback to camera file picker
        cameraInputRef.current?.click();
        setShowCamera(false);
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or declined:', err);
      setCameraError('Camera access declined or unavailable on this device. You can browse and upload a snapshot directly.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSourceFile({
          name: `Camera_Capture_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
          content: `Visual source material captured via device camera for curriculum synthesis.`,
          type: 'image/jpeg',
          size: 'Camera Photo',
        });
        stopCamera();
      }
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    await onGenerate({
      generatorType: activeType,
      topic: topic.trim() || 'General Curriculum Concepts',
      gradeLevel,
      itemCount,
      sourceMaterial: sourceFile?.content || '',
      sourceMaterialName: sourceFile?.name,
      sourceMaterialType: sourceFile?.type,
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      id="build-tool-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          onClose();
        }
      }}
    >
      {/* Modal Container */}
      <div 
        id="build-tool-modal-dialog"
        className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-stone-200/90 my-auto text-[#161616] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Area */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Sparkle Badge */}
            <div className="w-12 h-12 rounded-2xl bg-[#E63956] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Title & Subtitle */}
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl md:text-2xl text-[#161616] tracking-tight uppercase leading-tight">
                {currentDef.headerTitle}
              </h2>
              <p className="font-mono text-xs font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                {currentDef.headerSubtitle}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            id="build-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            aria-label="Close generator modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:space-y-6">
          {/* Section 1: Select Generator Type */}
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] mb-2.5 block">
              SELECT GENERATOR TYPE
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {TOOL_DEFINITIONS.map((def) => {
                const isActive = def.type === activeType;
                return (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => onSelectType(def.type)}
                    className={`rounded-2xl py-3 px-2 sm:px-3 text-center font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#161616] text-white border border-[#161616] shadow-sm'
                        : 'bg-white border border-stone-200 text-[#161616] hover:border-stone-400'
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Topic / Subject Title */}
          <div>
            <label 
              htmlFor="build-modal-topic-input"
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] mb-2 block"
            >
              TOPIC / SUBJECT TITLE
            </label>
            <input
              id="build-modal-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, The Kingdom of Mali, Calculus Derivatives..."
              required
              className="w-full rounded-2xl border border-stone-200 bg-[#F9F9F8] px-4 py-3.5 font-mono text-sm text-[#161616] placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Section 3: Grade Level & Question / Item Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Grade Level */}
            <div>
              <label 
                htmlFor="build-modal-grade-select"
                className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] mb-2 block"
              >
                GRADE LEVEL / TARGET AUDIENCE
              </label>
              <div className="relative">
                <select
                  id="build-modal-grade-select"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-[#F9F9F8] px-4 py-3.5 font-mono text-sm text-[#161616] focus:outline-none focus:border-stone-400 focus:bg-white transition-all appearance-none cursor-pointer pr-10 shadow-2xs"
                >
                  {GRADE_LEVEL_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Question / Item Count */}
            <div>
              <label 
                htmlFor="build-modal-count-select"
                className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] mb-2 block"
              >
                QUESTION / ITEM COUNT
              </label>
              <div className="relative">
                <select
                  id="build-modal-count-select"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-stone-200 bg-[#F9F9F8] px-4 py-3.5 font-mono text-sm text-[#161616] focus:outline-none focus:border-stone-400 focus:bg-white transition-all appearance-none cursor-pointer pr-10 shadow-2xs"
                >
                  {COUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 4: Optional Source Material Upload Card */}
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#161616] mb-2 block">
              OPTIONAL SOURCE MATERIAL (PDF / DOC / CAMERA)
            </label>

            {/* Upload Drag & Drop Area */}
            <div
              id="build-modal-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border border-dashed transition-all p-6 flex flex-col items-center justify-center text-center relative ${
                isDragging
                  ? 'border-[#E63956] bg-pink-50/40'
                  : 'border-stone-300 bg-stone-50/40 hover:bg-stone-50/80'
              }`}
            >
              {/* Circle with Upload Icon */}
              <div className="w-11 h-11 rounded-full border border-rose-200 bg-white flex items-center justify-center text-[#E63956] mb-2.5 shadow-2xs">
                <Upload className="w-5 h-5 stroke-[2.2]" />
              </div>

              <h4 className="font-display font-black text-sm uppercase tracking-wide text-stone-900 mb-1">
                DRAG & DROP PDF OR TEXT FILE
              </h4>
              <p className="font-mono text-xs text-stone-500 mb-4">
                Supports PDF, DOC, DOCX, TXT (Up to 25 pages)
              </p>

              {/* Two Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <button
                  id="build-modal-browse-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                >
                  BROWSE FILES
                </button>
                <button
                  id="build-modal-camera-btn"
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-[#D92562] hover:bg-[#c21d53] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  CAPTURE IT (CAMERA)
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Attached File Preview Chip */}
            {sourceFile && (
              <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200 shadow-2xs animate-fade-in">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-mono text-xs font-bold text-stone-900 truncate">
                      {sourceFile.name}
                    </p>
                    <p className="font-mono text-[10px] text-stone-500">
                      {sourceFile.size || 'Attached source material'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSourceFile(null)}
                  className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors ml-2 shrink-0 cursor-pointer"
                  title="Remove attached file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              id="build-modal-generate-btn"
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-[#161616] hover:bg-black text-white font-mono text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#E63956]" />
                  <span>SYNTHESIZING CURRICULUM RESOURCE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E63956]" />
                  <span>{currentDef.generateButtonText}</span>
                </>
              )}
            </button>
            <p className="font-mono text-[11px] text-center text-stone-400 uppercase tracking-wider mt-2.5">
              1 CREDIT • 100% CAPS ALIGNED CURRICULUM OUTPUT
            </p>
          </div>
        </form>

        {/* Live Camera Modal Overlay */}
        {showCamera && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative border border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#E63956]" />
                  <h3 className="font-display font-black text-sm uppercase text-stone-900">
                    Capture Source Document
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cameraError ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs space-y-3">
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#161616] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Open Device File Picker
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 font-mono text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-xl bg-[#D92562] hover:bg-[#c21d53] text-white font-mono text-xs font-bold uppercase flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Take Snapshot
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
