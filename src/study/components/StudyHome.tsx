import React, { useState, useRef } from 'react';
import { StudyHero } from './StudyHero';
import { StudyThreeWaysSection, StudyCreationMethod } from './StudyThreeWaysSection';
import { StudyGeneratorsSection } from './StudyGeneratorsSection';
import { StudyFaqSection } from './StudyFaqSection';
import { CameraCaptureModal } from './CameraCaptureModal';
import { AIService } from '../services/aiService';
import { StudyToolType } from '../types';
import {
  Camera,
  Sparkles,
  Type,
  ClipboardList,
  FileUp,
  X,
  Check,
  RefreshCw,
  Loader2,
  BookOpen,
  Layers,
  FileQuestion,
  Presentation,
  Compass,
  ArrowRight,
  ShieldAlert,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface StudyHomeProps {
  onSelectTool: (
    toolId: StudyToolType,
    prefillTopic?: string,
    prefillCategory?: string,
    initialData?: { sourceSnippet?: string; documentName?: string; capturedPhotoUrl?: string; [key: string]: any }
  ) => void;
  onOpenMyResources?: () => void;
  savedCount?: number;
}

export const StudyHome: React.FC<StudyHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount = 0,
}) => {
  const [activeMethod, setActiveMethod] = useState<StudyCreationMethod>('topic');

  // Input & workbench state
  const [topicInput, setTopicInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('AFRICAN HISTORY');
  const [pastedNotes, setPastedNotes] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; size: number; text: string; wordCount: number } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Camera & Capture state (CAPTURE IT)
  // IMPORTANT: isCameraModalOpen is false by default. Camera permission is NEVER requested on mount or page load.
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{ blob: Blob; dataUrl: string; fileName: string } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  const handleStartClick = () => {
    const el = document.getElementById('study-input-workbench') || document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (topic: string, category: string, suggestedTool?: StudyToolType) => {
    const tool = suggestedTool || 'study-guide';
    setTopicInput(topic);
    setCategoryInput(category);
    onSelectTool(tool, topic, category);
  };

  const handleUploadPdfClick = () => {
    setActiveMethod('pdf');
    const el = document.getElementById('study-input-workbench');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Called when learner selects an input method card (TYPE IT, PASTE IT, UPLOAD IT, CAPTURE IT)
  const handleSelectMethod = (method: StudyCreationMethod) => {
    setActiveMethod(method);

    if (method === 'capture') {
      // If the user clicks CAPTURE IT, open the camera modal immediately to request camera permission at that moment only
      if (!capturedPhoto) {
        setIsCameraModalOpen(true);
      }
    }

    // Scroll to workbench
    const el = document.getElementById('study-input-workbench') || document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle successful photo capture from camera modal
  const handlePhotoCaptured = async (photoBlob: Blob, photoDataUrl: string, fileName: string) => {
    setCapturedPhoto({ blob: photoBlob, dataUrl: photoDataUrl, fileName });
    setActiveMethod('capture');
    setIsTranscribing(true);

    if (!topicInput) {
      setTopicInput(fileName.replace(/\.[^/.]+$/, '').replace(/study-capture-/i, 'Photographed Notes ').replace(/[-_]/g, ' '));
    }

    try {
      const file = new File([photoBlob], fileName, { type: 'image/jpeg' });
      const parsed = await AIService.parseDocument(file);
      if (parsed && parsed.text) {
        setTranscribedText(parsed.text);
      } else {
        setTranscribedText('Captured study material from camera. Ready for study revision and question generation.');
      }
    } catch (err: any) {
      console.warn('OCR transcription notice:', err);
      setTranscribedText('Captured study material. Ready for study revision and question generation.');
    } finally {
      setIsTranscribing(false);
    }

    // Scroll smoothly to the study input workbench so the learner sees their captured material
    setTimeout(() => {
      const el = document.getElementById('study-input-workbench');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Fallback photo file upload
  const handleFallbackPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      handlePhotoCaptured(file, dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Document file upload for UPLOAD IT
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const parsed = await AIService.parseDocument(file);
      setUploadedDoc({
        name: file.name,
        size: file.size,
        text: parsed.text || '',
        wordCount: parsed.wordCount || 0,
      });
      if (!topicInput) {
        setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      console.warn('Doc upload notice:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Launch a study tool with the currently active study input
  const handleLaunchTool = (toolId: StudyToolType) => {
    let activeSnippet = '';
    let docName = '';
    let photoUrl = '';

    if (activeMethod === 'capture' && capturedPhoto) {
      activeSnippet = transcribedText;
      docName = capturedPhoto.fileName;
      photoUrl = capturedPhoto.dataUrl;
    } else if (activeMethod === 'text' && pastedNotes.trim()) {
      activeSnippet = pastedNotes;
      docName = 'pasted-notes.txt';
    } else if (activeMethod === 'pdf' && uploadedDoc) {
      activeSnippet = uploadedDoc.text;
      docName = uploadedDoc.name;
    }

    const currentTopic = topicInput.trim() || (docName ? docName.replace(/\.[^/.]+$/, '') : '');

    onSelectTool(toolId, currentTopic, categoryInput, {
      sourceSnippet: activeSnippet,
      documentName: docName,
      capturedPhotoUrl: photoUrl,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-14">
      {/* 1. Study Header Section with Instant Inspiration */}
      <StudyHero
        onStartClick={handleStartClick}
        onSelectSample={handleSelectSample}
        onUploadPdfClick={handleUploadPdfClick}
      />

      {/* 2. 4 Ways to Study Section (TYPE IT · PASTE IT · UPLOAD IT · CAPTURE IT) */}
      <StudyThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 3. Study Input Workbench - Directly processes user input from TYPE, PASTE, UPLOAD, or CAPTURE */}
      <section 
        id="study-input-workbench" 
        className="bg-white rounded-[2rem] border border-stone-200/90 shadow-sm p-5 sm:p-8 space-y-6 scroll-mt-20"
      >
        {/* Method selector tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#D92B8A] block mb-1">
              STUDY INPUT WORKBENCH
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-stone-900 tracking-tight">
              {activeMethod === 'capture' && '04. CAPTURE IT • CAMERA & PHOTO OCR'}
              {activeMethod === 'topic' && '01. TYPE IT • TOPIC & CONCEPT'}
              {activeMethod === 'text' && '02. PASTE IT • NOTES & TEXT'}
              {activeMethod === 'pdf' && '03. UPLOAD IT • DOCUMENT & PDF'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl sm:rounded-full border border-stone-200/70">
            <button
              type="button"
              id="workbench-tab-type"
              onClick={() => setActiveMethod('topic')}
              className={`px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMethod === 'topic' ? 'bg-[#18181B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>TYPE IT</span>
            </button>
            <button
              type="button"
              id="workbench-tab-paste"
              onClick={() => setActiveMethod('text')}
              className={`px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMethod === 'text' ? 'bg-[#18181B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>PASTE IT</span>
            </button>
            <button
              type="button"
              id="workbench-tab-upload"
              onClick={() => setActiveMethod('pdf')}
              className={`px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMethod === 'pdf' ? 'bg-[#18181B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>UPLOAD IT</span>
            </button>
            <button
              type="button"
              id="workbench-tab-capture"
              onClick={() => {
                setActiveMethod('capture');
                if (!capturedPhoto) {
                  setIsCameraModalOpen(true);
                }
              }}
              className={`px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMethod === 'capture' ? 'bg-[#D92B8A] text-white shadow-[0_4px_12px_rgba(217,43,138,0.35)]' : 'text-stone-700 hover:text-[#D92B8A]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>CAPTURE IT</span>
            </button>
          </div>
        </div>

        {/* --- METHOD 04: CAPTURE IT (Camera & Photo) --- */}
        {activeMethod === 'capture' && (
          <div className="space-y-6 animate-fadeIn">
            {capturedPhoto ? (
              <div className="space-y-5">
                {/* Captured photo card */}
                <div className="p-4 sm:p-5 bg-pink-50/60 border border-pink-200/90 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-pink-300 bg-white shadow-xs shrink-0">
                      <img
                        src={capturedPhoto.dataUrl}
                        alt="Captured study material"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm sm:text-base uppercase text-stone-900">
                          {topicInput || 'Photographed Study Material'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
                          Captured
                        </span>
                      </div>
                      <p className="text-xs font-mono text-stone-500">
                        {capturedPhoto.fileName} &bull; Ready as Study Input
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      id="retake-camera-photo-btn"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-mono text-xs font-bold uppercase tracking-wider border border-stone-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#D92B8A]" />
                      <span>Retake Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedPhoto(null);
                        setTranscribedText('');
                      }}
                      className="p-2.5 rounded-full hover:bg-pink-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Clear photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Transcribed text area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="transcribed-text-area" className="font-display font-black text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                      <span>Extracted Study Material & Equations (Editable)</span>
                      {isTranscribing && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-normal text-[#D92B8A]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Transcribing handwriting & text...
                        </span>
                      )}
                    </label>
                    <span className="text-xs font-mono text-stone-400">
                      {transcribedText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    id="transcribed-text-area"
                    rows={4}
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    placeholder="Transcribing photographed textbook pages, equations, diagrams, notes, or worksheets..."
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
                  />
                </div>

                {/* Subject / Title Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-display font-black text-xs uppercase tracking-wider text-stone-900">
                      Study Title / Topic Name
                    </label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g., Photosynthesis Diagrams, Math Calculus Homework..."
                      className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-display font-black text-xs uppercase tracking-wider text-stone-900">
                      Subject Category
                    </label>
                    <select
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
                    >
                      <option value="AFRICAN HISTORY">African History</option>
                      <option value="SCIENCE & BIOLOGY">Science & Biology</option>
                      <option value="MATHEMATICS">Mathematics</option>
                      <option value="LITERATURE & LANGUAGE">Literature & Language</option>
                      <option value="GEOGRAPHY & ENVIRONMENT">Geography & Environment</option>
                      <option value="GENERAL KNOWLEDGE">General Knowledge</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* No photo taken yet: Shutter prompt */
              <div className="border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-[#FAF8F5] hover:bg-pink-50/20 rounded-3xl p-8 sm:p-12 text-center space-y-4 transition-colors">
                <div className="w-16 h-16 rounded-full bg-pink-100 text-[#D92B8A] border border-pink-200 flex items-center justify-center mx-auto shadow-xs">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h4 className="font-display font-black text-lg sm:text-xl uppercase text-stone-900">
                    Photograph Study Material with Device Camera
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets. We will transcribe and format it into interactive study tools.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    id="open-device-camera-cta-btn"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-7 py-4 rounded-full bg-[#D92B8A] hover:bg-[#c02479] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(217,43,138,0.35)] flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Device Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraFallbackInputRef.current?.click()}
                    className="px-5 py-4 rounded-full bg-white hover:bg-stone-100 text-stone-800 font-display font-bold text-xs uppercase tracking-wider transition-all border border-stone-300 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ImageIcon className="w-4 h-4 text-stone-600" />
                    <span>Choose Photo File</span>
                  </button>
                </div>

                <input
                  ref={cameraFallbackInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackPhotoUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* --- METHOD 01: TYPE IT --- */}
        {activeMethod === 'topic' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <label htmlFor="workbench-topic-input" className="font-display font-black text-xs uppercase tracking-wider text-stone-900 block">
                Enter Subject, Topic or Lesson Title
              </label>
              <input
                id="workbench-topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g., Kingdom of Kush, Cell Biology, African Continental Free Trade..."
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 text-base font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
              />
            </div>
          </div>
        )}

        {/* --- METHOD 02: PASTE IT --- */}
        {activeMethod === 'text' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="workbench-paste-textarea" className="font-display font-black text-xs uppercase tracking-wider text-stone-900 block">
                  Paste Study Notes, Lecture Transcript, or Syllabus Text
                </label>
                <span className="text-xs font-mono text-stone-400">
                  {pastedNotes.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                id="workbench-paste-textarea"
                rows={5}
                value={pastedNotes}
                onChange={(e) => setPastedNotes(e.target.value)}
                placeholder="Paste textbook excerpts, revision outlines, questions, or revision notes here..."
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A] shadow-xs"
              />
            </div>
          </div>
        )}

        {/* --- METHOD 03: UPLOAD IT --- */}
        {activeMethod === 'pdf' && (
          <div className="space-y-5 animate-fadeIn">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleDocUpload}
              className="hidden"
            />
            {uploadedDoc ? (
              <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#D92B8A]" />
                  </div>
                  <div>
                    <div className="font-display font-black text-sm uppercase text-stone-900">
                      {uploadedDoc.name}
                    </div>
                    <p className="text-xs font-mono text-stone-500">
                      {(uploadedDoc.size / 1024).toFixed(1)} KB &bull; {uploadedDoc.wordCount} words extracted
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedDoc(null)}
                  className="p-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Remove document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-[#FAF8F5] rounded-3xl p-8 text-center space-y-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-[#D92B8A]">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-display font-black text-base uppercase text-stone-900">
                    {isUploading ? 'Extracting Text from Document...' : 'Upload PDF or Document'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Supports PDF, Word (.docx), Markdown (.md), and Text (.txt) &bull; Up to 20 MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Bar: Create Study Materials with the current input */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
              CREATE STUDY MATERIAL USING THIS INPUT:
            </span>
            {activeMethod === 'capture' && capturedPhoto && (
              <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
                Using Captured Photo
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              type="button"
              id="action-create-study-guide"
              onClick={() => handleLaunchTool('study-guide')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <BookOpen className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Study Guide</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Summary & notes</span>
              </div>
            </button>

            <button
              type="button"
              id="action-create-flashcards"
              onClick={() => handleLaunchTool('flashcards')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <Layers className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Flashcards</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Spaced recall</span>
              </div>
            </button>

            <button
              type="button"
              id="action-create-quiz"
              onClick={() => handleLaunchTool('quiz')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <FileQuestion className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Practice Quiz</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Exam testing</span>
              </div>
            </button>

            <button
              type="button"
              id="action-create-doc-quiz"
              onClick={() => handleLaunchTool('pdf-quiz')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <FileUp className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Doc Quiz</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Grounded tests</span>
              </div>
            </button>

            <button
              type="button"
              id="action-create-presentation"
              onClick={() => handleLaunchTool('presentation')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <Presentation className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Slide Deck</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Lecture slides</span>
              </div>
            </button>

            <button
              type="button"
              id="action-create-roadmap"
              onClick={() => handleLaunchTool('learning-path')}
              className="p-3 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between min-h-[90px]"
            >
              <Compass className="w-4 h-4 text-[#D92B8A] mb-2" />
              <div>
                <span className="font-display font-black text-xs uppercase block">Roadmap</span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">Learning path</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 4. All 6 Study Tools Section */}
      <StudyGeneratorsSection
        onSelectTool={(toolId) => handleLaunchTool(toolId)}
      />

      {/* 5. Frequently Asked Questions Section */}
      <StudyFaqSection />

      {/* Camera Capture Modal - Request camera permission at this moment only */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        title="Photograph Study Material"
        subtitle="Homework, textbook pages, handwritten work, equations, diagrams, or worksheets"
      />
    </div>
  );
};
