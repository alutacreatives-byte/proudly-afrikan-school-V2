import React, { useState, useRef, useEffect } from 'react';
import { StudySet, StudyConcept, AppView } from '../types';
import { AIService } from '../services/aiService';
import { isTextCorruptedOrUnreadable } from '../utils/textValidation';
import { 
  X, 
  Sparkles, 
  FileText, 
  Upload, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Compass, 
  CheckCircle2, 
  Bookmark, 
  Paperclip, 
  Trash2,
  Camera
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

export type GeneratorMode = 
  | 'exam' 
  | 'worksheet' 
  | 'lesson-plan' 
  | 'pdf-quiz' 
  | 'study-guide' 
  | 'slides' 
  | 'course' 
  | 'roadmap' 
  | 'standard';

export type InputMethod = 'topic' | 'paste' | 'upload' | 'capture';

export interface UploadedDocument {
  name: string;
  size: number;
  text: string;
  wordCount?: number;
}

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetCreated: (newSet: StudySet, autoLaunchMode?: AppView) => void;
  initialMethod?: InputMethod;
  initialGeneratorMode?: GeneratorMode;
  initialTopic?: string;
}

export const CreateSetModal: React.FC<CreateSetModalProps> = ({
  isOpen,
  onClose,
  onSetCreated,
  initialMethod = 'topic',
  initialGeneratorMode = 'standard',
  initialTopic = '',
}) => {
  const [method, setMethod] = useState<InputMethod>(initialMethod);
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>(initialGeneratorMode);
  const [topicInput, setTopicInput] = useState<string>(initialTopic);
  const [notesInput, setNotesInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('General Knowledge');
  const [conceptCount, setConceptCount] = useState<number>(6);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedSet, setGeneratedSet] = useState<StudySet | null>(null);

  // Camera & Photo Capture state (CAPTURE IT)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMethod) setMethod(initialMethod);
      if (initialGeneratorMode) setGeneratorMode(initialGeneratorMode);
      if (initialTopic) setTopicInput(initialTopic);
      setGeneratedSet(null);
      setGenerationError(null);
      setIsParsingFile(false);
      setIsCameraModalOpen(false);
      setCapturedImagePreview(null);
      setCapturedFileName('');
    }
  }, [isOpen, initialMethod, initialGeneratorMode, initialTopic]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setGenerationError('Maximum upload size is 20 MB. Please upload a smaller document.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsParsingFile(true);
    setGenerationError(null);

    try {
      const parsed = await AIService.parseDocument(file);
      const isCorrupted = isTextCorruptedOrUnreadable(parsed.text);

      // Keep the uploaded document attached and usable by the tool
      const docData: UploadedDocument = {
        name: file.name,
        size: file.size,
        text: isCorrupted ? '' : parsed.text,
        wordCount: isCorrupted ? 0 : parsed.wordCount,
      };
      setUploadedDocument(docData);

      // Do NOT automatically insert extracted document text into the "Paste copy here" input
      // if the extracted text is corrupted, garbled or unreadable.
      if (!isCorrupted && parsed.text && parsed.text.trim().length > 0) {
        // Only set notes input if clean and notesInput is currently empty
        if (!notesInput.trim()) {
          setNotesInput(parsed.text);
        }
      }

      if (!topicInput) {
        setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      // Keep document attached even if parsing fails
      setUploadedDocument({
        name: file.name,
        size: file.size,
        text: '',
        wordCount: 0,
      });
      if (!topicInput) {
        setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setCapturedImagePreview(null);
    setCapturedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraFileInputRef.current) {
      cameraFileInputRef.current.value = '';
    }
  };

  // Handle live camera or photo capture (CAPTURE IT)
  const handlePhotoCaptured = async (photoBlob: Blob, photoDataUrl: string, fileName: string) => {
    setIsCameraModalOpen(false);
    setCapturedImagePreview(photoDataUrl);
    setCapturedFileName(fileName);
    setIsParsingFile(true);
    setGenerationError(null);

    try {
      const file = new File([photoBlob], fileName, { type: photoBlob.type || 'image/jpeg' });
      const parsed = await AIService.parseDocument(file);
      const isCorrupted = isTextCorruptedOrUnreadable(parsed.text);

      const docData: UploadedDocument = {
        name: fileName,
        size: photoBlob.size,
        text: isCorrupted ? '' : parsed.text,
        wordCount: isCorrupted ? 0 : parsed.wordCount,
      };
      setUploadedDocument(docData);

      if (!isCorrupted && parsed.text && parsed.text.trim().length > 0) {
        setNotesInput(parsed.text.trim());
      }

      if (!topicInput) {
        const titleCandidate = parsed.text?.trim().split('\n')[0]?.slice(0, 50);
        setTopicInput(titleCandidate || `Captured Notes • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
    } catch (err: any) {
      setUploadedDocument({
        name: fileName,
        size: photoBlob.size,
        text: '',
        wordCount: 0,
      });
      if (!topicInput) {
        setTopicInput(`Captured Notes • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleCameraFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = (ev.target?.result as string) || '';
      handlePhotoCaptured(file, dataUrl, file.name || 'study-camera-photo.jpg');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    setIsGenerating(true);
    setGeneratedSet(null);

    try {
      const effectiveNotesText = notesInput.trim() || (uploadedDocument && !isTextCorruptedOrUnreadable(uploadedDocument.text) ? uploadedDocument.text.trim() : '');
      const effectiveTopic = topicInput.trim() || (uploadedDocument ? uploadedDocument.name.replace(/\.[^/.]+$/, '') : (effectiveNotesText.slice(0, 50) || 'Study Material'));

      const result = await AIService.generateStudySet({
        topic: effectiveTopic,
        notesText: effectiveNotesText || (uploadedDocument ? `Document Source: ${uploadedDocument.name}` : undefined),
        category: categoryInput,
        count: conceptCount,
      });

      setGeneratedSet(result);
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate study set. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndLaunch = (mode?: AppView) => {
    if (!generatedSet) return;
    onSetCreated(generatedSet, mode);
    onClose();
  };

  // Continue button enablement logic:
  // - If a valid document or photo is attached, Continue is ALWAYS enabled even if notesInput is empty or cleared.
  // - Deleting text from the input field does NOT disable Continue when a valid document or capture is already uploaded.
  const isContinueDisabled = isGenerating || isParsingFile || (
    !uploadedDocument && (
      (method === 'topic' && !topicInput.trim()) ||
      (method === 'paste' && !notesInput.trim()) ||
      (method === 'upload' && !notesInput.trim() && !topicInput.trim()) ||
      (method === 'capture' && !notesInput.trim() && !topicInput.trim() && !capturedImagePreview)
    )
  );

  const generatorTitles: Record<GeneratorMode, string> = {
    'standard': 'STUDY SET GENERATOR',
    'exam': 'EXAM GENERATOR',
    'worksheet': 'WORKSHEET GENERATOR',
    'lesson-plan': 'LESSON PLAN GENERATOR',
    'pdf-quiz': 'PDF TO QUIZ GENERATOR',
    'study-guide': 'STUDY GUIDE GENERATOR',
    'slides': 'PRESENTATION GENERATOR',
    'course': 'COURSE MODULE BUILDER',
    'roadmap': 'LEARNING ROADMAP BUILDER'
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#161616]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        id="create-set-modal"
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 my-auto animate-fadeIn"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-[#161616] tracking-tight leading-none">
                {generatorTitles[generatorMode] || 'STUDY TOOL'}
              </h2>
              <div className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-wider mt-1">
                STUDY TOOL
              </div>
            </div>
          </div>

          <button
            id="close-create-set-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/70 border border-stone-300 text-stone-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!generatedSet ? (
            <>
              {/* Input Method Selector - Responsive 4 options: TYPE IT, PASTE IT, UPLOAD IT, CAPTURE IT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-[#F4F1EA] rounded-2xl sm:rounded-full border border-stone-200">
                <button
                  id="tab-enter-topic"
                  type="button"
                  onClick={() => setMethod('topic')}
                  className={`py-2.5 px-3 rounded-xl sm:rounded-full font-display text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'topic'
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'text-stone-700 hover:bg-white/80'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>01. Topic</span>
                </button>

                <button
                  id="tab-paste-text"
                  type="button"
                  onClick={() => setMethod('paste')}
                  className={`py-2.5 px-3 rounded-xl sm:rounded-full font-display text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'paste'
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'text-stone-700 hover:bg-white/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>02. Paste</span>
                </button>

                <button
                  id="tab-upload-material"
                  type="button"
                  onClick={() => setMethod('upload')}
                  className={`py-2.5 px-3 rounded-xl sm:rounded-full font-display text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'upload'
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'text-stone-700 hover:bg-white/80'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>03. Upload</span>
                </button>

                <button
                  id="tab-capture-material"
                  type="button"
                  onClick={() => setMethod('capture')}
                  className={`py-2.5 px-3 rounded-xl sm:rounded-full font-display text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'capture'
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'text-stone-700 hover:bg-white/80'
                  }`}
                >
                  <Camera className={`w-3.5 h-3.5 ${method === 'capture' ? 'text-[#D92B8A]' : 'text-stone-600'}`} />
                  <span>04. Capture</span>
                </button>
              </div>

              {/* Attached Document Banner (if document is uploaded) */}
              {uploadedDocument && (
                <div className="p-3.5 sm:p-4 bg-pink-50/70 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#18181B] text-[#D92B8A] flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#161616] truncate">
                          {uploadedDocument.name}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 bg-[#D92B8A] text-white text-[10px] font-mono font-bold uppercase rounded-full">
                          Attached
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-mono mt-0.5">
                        {(uploadedDocument.size / 1024).toFixed(1)} KB &bull; Document ready for generation
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="p-1.5 rounded-full hover:bg-pink-100 text-stone-500 hover:text-red-600 transition-colors shrink-0"
                    title="Remove attached document"
                    aria-label="Remove attached document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Method 1: Enter Topic */}
              {method === 'topic' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-display font-black text-xs uppercase text-[#161616] block tracking-wider">
                      What subject, lesson or topic do you want to build?
                    </label>
                    <input
                      id="topic-input-field"
                      type="text"
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      placeholder="e.g., Kingdom of Kush, Solar Microgrids in Africa, Cell Biology..."
                      className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 text-base font-semibold text-[#161616] placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                    />
                  </div>
                </div>
              )}

              {/* Method 2: Paste Notes */}
              {method === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-display font-black text-xs uppercase text-[#161616] block tracking-wider">
                      Paste your syllabus, lesson transcript, or textbook excerpts
                    </label>
                    <textarea
                      id="notes-textarea-input"
                      rows={6}
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      placeholder="Paste your lecture notes, textbook passages, definitions, or study bullet points here..."
                      className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 text-sm font-medium text-[#161616] placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                      Optional Set / Resource Title
                    </label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      placeholder="Give this resource a title (e.g., Chapter 4: Photosynthesis)..."
                      className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3.5 text-sm font-semibold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                    />
                  </div>
                </div>
              )}

              {/* Method 3: Upload Material */}
              {method === 'upload' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.json,.csv,.doc,.docx,.pdf"
                    className="hidden"
                  />
                  <div
                    onClick={() => !isParsingFile && fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${
                      isParsingFile ? 'border-pink-400 bg-pink-50/40 cursor-wait' : 'border-stone-300 hover:border-[#D92B8A] bg-[#FAF8F5] hover:bg-pink-50/30 cursor-pointer'
                    } rounded-3xl p-8 text-center space-y-3 transition-colors shadow-sm`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-[#D92B8A]">
                      {isParsingFile ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <div className="font-display font-black text-lg uppercase text-[#161616]">
                        {isParsingFile ? 'Extracting Content from Document...' : (uploadedDocument ? 'Click to replace attached document' : 'Click to upload document or study material')}
                      </div>
                      <div className="text-sm text-stone-500 mt-1">
                        Supports PDF (.pdf), Word (.docx, .doc), Markdown (.md), & Text (.txt) &bull; Maximum upload size is 20 MB
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 4: Capture Material (Camera / Photo OCR) */}
              {method === 'capture' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={cameraFileInputRef}
                    onChange={handleCameraFileUpload}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    id="modal-camera-file-input"
                  />

                  {capturedImagePreview ? (
                    <div className="p-4 sm:p-5 bg-pink-50/50 border border-pink-200 rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-pink-200 bg-white shadow-xs shrink-0">
                            <img
                              src={capturedImagePreview}
                              alt="Captured study material"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-sm uppercase text-[#161616]">
                                Photographed Study Material
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
                                Captured
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">
                              {capturedFileName || 'study-photo.jpg'} &bull; Ready for study set generation
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="px-3.5 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#D92B8A]" />
                            <span>Retake Photo</span>
                          </button>
                        </div>
                      </div>

                      {/* Extracted Notes Area */}
                      <div className="space-y-1.5 pt-2 border-t border-pink-100">
                        <div className="flex items-center justify-between">
                          <label className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                            Extracted Content / Notes (Editable)
                          </label>
                          {isParsingFile && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-[#D92B8A]">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Transcribing photo...
                            </span>
                          )}
                        </div>
                        <textarea
                          rows={4}
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Extracted textbook, notes, equations, diagrams, or worksheet text..."
                          className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-[#161616] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                          Resource / Set Title
                        </label>
                        <input
                          type="text"
                          value={topicInput}
                          onChange={(e) => setTopicInput(e.target.value)}
                          placeholder="Give this study set a title..."
                          className="w-full bg-white border border-stone-200 rounded-2xl p-3 text-xs sm:text-sm font-semibold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-[#FAF8F5] hover:bg-pink-50/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 transition-colors shadow-sm">
                      <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 border border-pink-200 shadow-sm flex items-center justify-center text-[#D92B8A]">
                        {isParsingFile ? (
                          <Loader2 className="w-7 h-7 animate-spin" />
                        ) : (
                          <Camera className="w-7 h-7" />
                        )}
                      </div>

                      <div className="space-y-1 max-w-md mx-auto">
                        <div className="font-display font-black text-base sm:text-lg uppercase text-[#161616]">
                          {isParsingFile ? 'Analyzing & Transcribing Photo...' : 'Photograph Study Material'}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500">
                          Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets to use as study input.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          id="btn-modal-open-live-camera"
                          onClick={() => setIsCameraModalOpen(true)}
                          className="px-5 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Device Camera</span>
                        </button>

                        <button
                          type="button"
                          id="btn-modal-upload-photo"
                          onClick={() => cameraFileInputRef.current?.click()}
                          className="px-4 py-3 bg-white hover:bg-stone-100 border border-stone-300 rounded-2xl text-xs sm:text-sm font-mono font-bold text-stone-800 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                        >
                          <Upload className="w-4 h-4 text-stone-600" />
                          <span>Select Photo File</span>
                        </button>
                      </div>

                      <div className="text-[11px] font-mono text-stone-400">
                        Supports live webcam, mobile rear/front camera, and image uploads &bull; Instant AI OCR
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Concept Count Selector & Subject Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                    Subject Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3.5 text-xs sm:text-sm font-semibold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-sm"
                  >
                    <option value="African Knowledge">African Knowledge & History</option>
                    <option value="Mathematics & Science">Mathematics & Science</option>
                    <option value="Technology & Computer Science">Technology & Computer Science</option>
                    <option value="History & Geography">History & Geography</option>
                    <option value="Languages & Literature">Languages & Literature</option>
                    <option value="Business & Economics">Business & Economics</option>
                    <option value="Health & Medicine">Health & Medicine</option>
                    <option value="Law & Social Sciences">Law & Social Sciences</option>
                    <option value="Arts & Design">Arts & Design</option>
                    <option value="Religion & Philosophy">Religion & Philosophy</option>
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                    Resource Depth & Concepts
                  </label>
                  <select
                    value={conceptCount}
                    onChange={e => setConceptCount(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3.5 text-xs sm:text-sm font-semibold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-sm"
                  >
                    <option value={4}>4 Concepts (~5 mins quick study)</option>
                    <option value={6}>6 Concepts (~10 mins standard study)</option>
                    <option value={8}>8 Concepts (~15 mins comprehensive)</option>
                    <option value={12}>12 Concepts (~25 mins deep mastery)</option>
                  </select>
                </div>
              </div>

              {generationError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-900">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}
            </>
          ) : (
            /* Generated Results Preview Screen */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 sm:p-6 bg-pink-50/80 border border-pink-200 rounded-3xl flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D92B8A] text-white font-mono text-[10px] font-bold uppercase rounded-full mb-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synthesis Complete</span>
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase text-[#161616]">
                    {generatedSet.concepts.length} Concepts Identified
                  </h3>
                  <p className="text-sm text-stone-600 font-medium mt-0.5">
                    Ready for Learn & Understand, Flashcards, Formative Practice, and Spaced Review.
                  </p>
                </div>
              </div>

              {/* Concepts Preview List */}
              <div className="space-y-3">
                <span className="font-display font-black text-xs uppercase tracking-wider text-stone-600">
                  Extracted Study Concepts:
                </span>
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {generatedSet.concepts.map((c, i) => (
                    <div
                      key={c.id}
                      className="p-4 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-sm uppercase text-[#161616]">
                          {i + 1}. {c.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#D92B8A] font-bold px-2 py-0.5 bg-pink-50 rounded-full border border-pink-200">
                          {c.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {c.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
          {!generatedSet ? (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-stone-600 hover:text-[#161616] font-display text-xs font-bold uppercase rounded-full hover:bg-stone-200/60 transition-colors"
              >
                Cancel
              </button>

              <button
                id="generate-study-set-submit-btn"
                disabled={isContinueDisabled}
                onClick={handleGenerate}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] disabled:opacity-50 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_4px_16px_rgba(217,43,138,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Working on it…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Continue & Generate ↗</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setGeneratedSet(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-stone-600 font-display text-xs font-bold uppercase rounded-full hover:bg-stone-200/60"
              >
                Edit Input
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleSaveAndLaunch('flashcards')}
                  className="px-5 py-2.5 bg-white text-[#161616] font-display text-xs font-black uppercase rounded-full border border-stone-300 shadow-sm hover:bg-stone-100 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>Flashcards</span>
                </button>

                <button
                  onClick={() => handleSaveAndLaunch('study')}
                  className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-black uppercase rounded-full shadow-md flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Device Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
