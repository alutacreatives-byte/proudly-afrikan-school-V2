import React, { useState, useRef, useEffect } from 'react';
import { 
  StudySet, 
  TutorMessage, 
  HomeworkActionType, 
  HomeworkAttachment,
  AppView 
} from '../types';
import { AIService } from '../services/aiService';
import { isTextCorruptedOrUnreadable } from '../utils/textValidation';
import { 
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Layers,
  CheckCircle2,
  Flame,
  PenTool,
  Upload,
  Send,
  RotateCcw,
  Paperclip,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  Check,
  Edit3,
  X
} from 'lucide-react';

interface HomeworkViewProps {
  studySets: StudySet[];
  activeSet: StudySet | null;
  onSelectSet: (set: StudySet) => void;
  onNavigate: (view: AppView) => void;
  onBack?: () => void;
  onGoHome?: () => void;
  initialQuestion?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatFileType = (name: string, mimeType?: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF Document';
  if (ext === 'docx' || ext === 'doc') return 'Word Document';
  if (ext === 'txt') return 'Plain Text Document';
  if (ext === 'md') return 'Markdown Document';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return 'Image';
  if (ext === 'csv') return 'CSV Spreadsheet';
  if (ext === 'json') return 'JSON Document';
  if (mimeType?.startsWith('image/')) return 'Image';
  return 'Document';
};

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  studySets,
  activeSet,
  onSelectSet,
  onNavigate,
  onBack,
  onGoHome,
  initialQuestion = '',
}) => {
  // Homework input states
  const [homeworkQuestion, setHomeworkQuestion] = useState(initialQuestion);
  const [attemptedAnswer, setAttemptedAnswer] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<HomeworkAttachment | null>(null);
  const [gradeLevel, setGradeLevel] = useState<'General' | 'Middle School' | 'High School' | 'University'>('General');
  const [isAttemptDrawerOpen, setIsAttemptDrawerOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(initialQuestion.trim()));
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  // Chat stream states
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'Explain what this question is asking',
    'Give me a hint',
    'Check my answer'
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const latestResponseRef = useRef<HTMLDivElement>(null);

  // Smoothly transition / scroll to the beginning (top) of the newly generated response
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model') {
        const timer = setTimeout(() => {
          if (latestResponseRef.current) {
            latestResponseRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle File Upload (Worksheets, PDFs, DOCX, Text, Images) - Max 20 MB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setToastMessage('Maximum upload size is 20 MB. Please upload a smaller document.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedAttachment({
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
          mimeType: file.type
        });
        setToastMessage(`Worksheet image "${file.name}" attached.`);
      };
      reader.readAsDataURL(file);
    } else {
      try {
        setToastMessage(`Extracting content from "${file.name}"...`);
        const parsed = await AIService.parseDocument(file);
        const isCorrupted = isTextCorruptedOrUnreadable(parsed.text);
        setSelectedAttachment({
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          content: isCorrupted ? '' : parsed.text.slice(0, 4000),
        });
        setToastMessage(`Document "${file.name}" attached successfully.`);
      } catch (err: any) {
        setSelectedAttachment({
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          content: '',
        });
        setToastMessage(`Document "${file.name}" attached.`);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Primary execution handler for Homework actions & follow-ups
  const handleExecuteHomeworkAction = async (
    actionType: HomeworkActionType,
    customQuestionText?: string,
    customAttemptText?: string
  ) => {
    const currentQ = (customQuestionText !== undefined ? customQuestionText : (homeworkQuestion || followUpInput)).trim();
    const currentAttempt = (customAttemptText !== undefined ? customAttemptText : attemptedAnswer).trim();

    if (!currentQ && !selectedAttachment && actionType !== 'hint' && actionType !== 'work_through') {
      setToastMessage('Please enter your homework question or attach a worksheet first.');
      return;
    }

    // Mark as submitted to show tutor experience
    setHasSubmitted(true);
    setIsEditingQuestion(false);

    let displayPrompt = currentQ;
    if (actionType === 'explain') {
      displayPrompt = currentQ
        ? `🎯 Step 1 (Understand It): Please explain what this problem is asking and clarify the core requirements:\n"${currentQ}"`
        : `🎯 Step 1 (Understand It): Please analyze the attached document (${selectedAttachment?.name}) and explain the core requirements.`;
    } else if (actionType === 'hint') {
      displayPrompt = currentQ
        ? `💡 Step 2 (Give Me A Hint): Please give me a targeted Socratic hint to unlock this problem:\n"${currentQ}"`
        : `💡 Step 2 (Give Me A Hint): Please give me a targeted Socratic hint for the problem in the attached document.`;
    } else if (actionType === 'work_through') {
      displayPrompt = currentQ
        ? `📐 Step 3 (Work Through It): Please walk through this step-by-step with clear logic and reasoning:\n"${currentQ}"`
        : `📐 Step 3 (Work Through It): Please walk through the attached assignment step-by-step with clear logic.`;
    } else if (actionType === 'check_answer') {
      displayPrompt = `✅ Step 4 (Check Answer): Please evaluate my attempted answer:\n${currentQ ? `Problem: "${currentQ}"\n\n` : ''}*My Attempted Answer:*\n"${currentAttempt || 'Please evaluate my draft.'}"`;
    } else if (actionType === 'practice_similar') {
      displayPrompt = currentQ
        ? `🔥 Step 5 (Practise Similar): Please generate a similar practice question based on this problem to test my understanding:\n"${currentQ}"`
        : `🔥 Step 5 (Practise Similar): Please generate a similar practice question based on the attached document.`;
    } else if (actionType === 'writing_structure') {
      displayPrompt = currentQ
        ? `✍️ Step 6 (Essay Outline): Help me brainstorm arguments, thesis, and structure for this assignment:\n"${currentQ}"`
        : `✍️ Step 6 (Essay Outline): Help me brainstorm arguments and structure for the attached assignment.`;
    }

    const userMsg: TutorMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: displayPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      homeworkAction: actionType,
      attachmentName: selectedAttachment?.name
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setFollowUpInput('');
    setIsLoading(true);
    setSuggestedFollowUps([]);

    try {
      const chatPayload = newHistory.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await AIService.askTutor({
        messages: chatPayload,
        studySet: activeSet,
        homeworkAction: actionType,
        homeworkQuestion: currentQ,
        attemptedAnswer: currentAttempt || undefined,
        attachment: selectedAttachment || undefined
      });

      const tutorMsg: TutorMessage = {
        id: `msg_tutor_${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: res.suggestedFollowUps || [
          'Explain what this question is asking',
          'Give me a hint',
          'Check my answer'
        ],
        homeworkAction: actionType,
        evaluation: res.evaluation
      };

      setMessages(prev => [...prev, tutorMsg]);
      setSuggestedFollowUps(res.suggestedFollowUps || [
        'Explain what this question is asking',
        'Give me a hint',
        'Check my answer'
      ]);
    } catch (err) {
      console.error('Homework Help request failed:', err);
      const errorMsg: TutorMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: `Let's work through this together. We can break down the core concept step-by-step, review a targeted hint, or check your current draft.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Explain what this question is asking', 'Give me a hint', 'Check my answer']
      };
      setMessages(prev => [...prev, errorMsg]);
      setSuggestedFollowUps(['Explain what this question is asking', 'Give me a hint', 'Check my answer']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = () => {
    if (!homeworkQuestion.trim() && !selectedAttachment) {
      setToastMessage('Please enter your homework question or attach a worksheet first.');
      return;
    }
    setHasSubmitted(true);
    setIsEditingQuestion(false);
    // Execute explain / understand step naturally
    handleExecuteHomeworkAction('explain', homeworkQuestion);
  };

  const handleResetConversation = () => {
    setMessages([]);
    setSuggestedFollowUps([
      'Explain what this question is asking',
      'Give me a hint',
      'Check my answer'
    ]);
    setHomeworkQuestion('');
    setAttemptedAnswer('');
    setHasSubmitted(false);
    setIsEditingQuestion(false);
    handleRemoveAttachment();
    setToastMessage('Ready for a new problem!');
  };

  return (
    <div id="homework-helper-view" className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* 1. TOP SPOTLIGHT BANNER */}
      <section className="bg-[#161616] text-[#FAF7F0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D92B8A] text-white rounded-full border border-white/20 shrink-0 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white text-[#161616] font-mono text-[11px] font-bold uppercase rounded-full shadow-sm">
                <span className="w-2 h-2 bg-[#D92B8A] rounded-full inline-block animate-pulse"></span>
                <span>HOMEWORK HELP</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                STUDY TUTOR & <span className="text-[#D92B8A]">HOMEWORK HELP</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-normal max-w-xl leading-relaxed">
                Step-by-step Socratic guidance &bull; Understand core principles &bull; Check your answers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
            {hasSubmitted && (
              <button
                onClick={handleResetConversation}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase rounded-full transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Start a new problem"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D92B8A]" />
                <span>NEW PROBLEM</span>
              </button>
            )}

            <button
              id="homework-back-btn"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  onNavigate('home');
                }
              }}
              className="px-4 py-2.5 bg-white text-[#161616] hover:bg-stone-100 font-display text-xs font-black uppercase rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK</span>
            </button>

            <button
              id="homework-home-btn"
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  onNavigate('home');
                }
              }}
              className="px-4 py-2.5 bg-[#FAF7F0] text-[#161616] hover:bg-white font-display text-xs font-black uppercase rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Return to Study Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>HOME</span>
            </button>
          </div>
        </div>

        {/* Study Context & Grade Level Selector Ribbon */}
        <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-300 font-bold uppercase text-xs">STUDY SET CONTEXT:</span>
            {studySets.length > 0 ? (
              <select
                value={activeSet?.id || ''}
                onChange={(e) => {
                  const set = studySets.find(s => s.id === e.target.value);
                  if (set) onSelectSet(set);
                }}
                className="bg-[#242424] text-white border border-stone-600 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:border-[#D92B8A] transition-colors"
              >
                <option value="">-- Universal Curriculum / General --</option>
                {studySets.map(s => (
                  <option key={s.id} value={s.id}>{s.title} ({s.category})</option>
                ))}
              </select>
            ) : (
              <span className="bg-[#242424] text-stone-300 px-3 py-1 rounded-full border border-stone-700 text-xs">
                Universal Curriculum Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-300 font-bold uppercase text-xs mr-1">LEVEL:</span>
            {(['General', 'Middle School', 'High School', 'University'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setGradeLevel(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  gradeLevel === lvl 
                    ? 'bg-[#D92B8A] text-white shadow-sm' 
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STAGE 1: HOMEWORK INPUT SECTION (Clean & Simple) */}
      {(!hasSubmitted || isEditingQuestion) && (
        <section className="bg-white border border-stone-200/90 shadow-xl rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-wider block">
                HOMEWORK HELP
              </span>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase text-stone-900 tracking-tight">
                Type or paste your assignment or problem below:
              </h2>
            </div>
            {isEditingQuestion && (
              <button
                onClick={() => setIsEditingQuestion(false)}
                className="text-xs font-mono text-stone-500 hover:text-stone-800 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Main Question Textarea */}
          <div className="space-y-1.5">
            <textarea
              id="homework-question-input"
              value={homeworkQuestion}
              onChange={(e) => setHomeworkQuestion(e.target.value)}
              placeholder="Paste math problem, history essay question, science concept, or homework assignment here..."
              rows={4}
              className="w-full p-4 bg-[#FAF8F5] border border-stone-300 rounded-2xl text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#D92B8A] focus:ring-2 focus:ring-pink-100 transition-all leading-relaxed"
            />
          </div>

          {/* Document / Worksheet Upload Area */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-700 uppercase flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#D92B8A]" />
                <span>ATTACH WORKSHEET / IMAGE</span>
              </span>
              <span className="font-mono text-xs text-stone-500">PDF, TXT, MD, PNG, JPG &bull; Max 20 MB</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.json,.csv"
              className="hidden"
              id="homework-file-upload-input"
            />

            {!selectedAttachment ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach worksheet document or image (Maximum upload size is 20 MB)"
                className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-[#FAF8F5] hover:bg-pink-50/30 text-stone-700 hover:text-[#D92B8A] rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase"
              >
                <Upload className="w-4 h-4 text-[#D92B8A]" />
                <span>CLICK TO ATTACH WORKSHEET DOCUMENT</span>
              </button>
            ) : (
              <div className="p-3.5 bg-pink-50/80 border border-pink-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Paperclip className="w-4 h-4 text-[#D92B8A] shrink-0" />
                  <div className="truncate">
                    <span className="font-mono font-bold text-stone-900 truncate block">
                      {selectedAttachment.name}
                    </span>
                    <span className="font-mono text-xs text-stone-600">
                      {formatFileSize(selectedAttachment.size)} &bull; {formatFileType(selectedAttachment.name, selectedAttachment.type)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1.5 hover:bg-rose-100 rounded-full text-rose-700 transition-colors flex items-center gap-1 text-xs font-mono font-semibold"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Optional Attempted Answer Drawer */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAttemptDrawerOpen(!isAttemptDrawerOpen)}
              className="w-full flex items-center justify-between p-3 bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 rounded-2xl font-display text-xs font-bold text-stone-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${attemptedAnswer ? 'text-green-600' : 'text-[#D92B8A]'}`} />
                <span>Have an attempted answer or draft? (Optional)</span>
              </span>
              <span className="text-xs font-mono text-stone-500 font-bold">
                {isAttemptDrawerOpen ? 'Collapse ▲' : 'Expand ▼'}
              </span>
            </button>

            {isAttemptDrawerOpen && (
              <div className="mt-2.5 p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2 animate-fadeIn">
                <label className="font-mono text-xs font-bold text-stone-700 uppercase block">
                  Paste your calculations, reasoning, or draft essay paragraph:
                </label>
                <textarea
                  id="attempted-answer-box"
                  value={attemptedAnswer}
                  onChange={(e) => setAttemptedAnswer(e.target.value)}
                  placeholder="e.g. My initial calculation was x = 5 because..."
                  rows={3}
                  className="w-full p-3 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#D92B8A] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              id="btn-submit-homework"
              onClick={handleInitialSubmit}
              disabled={isLoading || (!homeworkQuestion.trim() && !selectedAttachment)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#161616] hover:bg-stone-900 disabled:opacity-50 text-white font-display text-sm font-black uppercase rounded-full shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#D92B8A]" />
              <span>GET HELP / START TUTORING</span>
            </button>
          </div>
        </section>
      )}

      {/* 3. STAGE 2: SUBMITTED HOMEWORK SUMMARY & STUDY TUTOR WORKBENCH */}
      {hasSubmitted && !isEditingQuestion && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Your Homework Card */}
          <section className="bg-white border border-stone-200/90 shadow-md rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-mono text-xs font-bold uppercase text-[#D92B8A] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>YOUR HOMEWORK</span>
              </span>
              <button
                onClick={() => setIsEditingQuestion(true)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Problem</span>
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl">
              <p className="text-stone-900 text-sm sm:text-base font-medium leading-relaxed">
                {homeworkQuestion || 'Attached worksheet document'}
              </p>
              {selectedAttachment && (
                <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center gap-2 font-mono text-xs text-stone-600">
                  <Paperclip className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>Attachment: {selectedAttachment.name} ({formatFileSize(selectedAttachment.size)})</span>
                </div>
              )}
              {attemptedAnswer && (
                <div className="mt-2.5 pt-2 border-t border-stone-200 font-mono text-xs text-stone-600">
                  <span className="font-bold text-stone-800">Your Draft / Attempt: </span>
                  <span>{attemptedAnswer}</span>
                </div>
              )}
            </div>
          </section>

          {/* Study Tutor Experience Container */}
          <section className="bg-white border border-stone-200/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col min-h-[560px]">
            
            {/* Tutor Introduction & Compact 6-Step Action Bar */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-stone-200 space-y-4">
              
              {/* Simplified Tutor Introduction */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#161616] text-[#D92B8A] flex items-center justify-center shrink-0 shadow-sm border border-stone-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg uppercase text-stone-900 tracking-tight leading-tight">
                    Hi, I’m your Study Tutor.
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-normal">
                    Let’s work through it together.
                  </p>
                </div>
              </div>

              {/* Compact 6 Learning Steps */}
              <div className="pt-2 border-t border-stone-200/80">
                <span className="font-mono text-[10px] font-bold text-stone-500 uppercase block mb-2">
                  CHOOSE A LEARNING STEP:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  
                  {/* 1. Understand It */}
                  <button
                    id="btn-action-understand"
                    onClick={() => handleExecuteHomeworkAction('explain')}
                    disabled={isLoading}
                    className="p-2.5 bg-white hover:bg-pink-50 hover:border-pink-300 border border-stone-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-stone-900 font-display font-bold text-[11px] uppercase">
                      <HelpCircle className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                      <span className="truncate">1. UNDERSTAND IT</span>
                    </div>
                  </button>

                  {/* 2. Give Me A Hint */}
                  <button
                    id="btn-action-hint"
                    onClick={() => handleExecuteHomeworkAction('hint')}
                    disabled={isLoading}
                    className="p-2.5 bg-white hover:bg-pink-50 hover:border-pink-300 border border-stone-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-stone-900 font-display font-bold text-[11px] uppercase">
                      <Lightbulb className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                      <span className="truncate">2. GIVE ME A HINT</span>
                    </div>
                  </button>

                  {/* 3. Work Through It */}
                  <button
                    id="btn-action-work-through"
                    onClick={() => handleExecuteHomeworkAction('work_through')}
                    disabled={isLoading}
                    className="p-2.5 bg-white hover:bg-pink-50 hover:border-pink-300 border border-stone-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-stone-900 font-display font-bold text-[11px] uppercase">
                      <Layers className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                      <span className="truncate">3. WORK THROUGH IT</span>
                    </div>
                  </button>

                  {/* 4. Check Answer */}
                  <button
                    id="btn-action-check-answer"
                    onClick={() => {
                      if (!attemptedAnswer) {
                        setIsEditingQuestion(true);
                        setIsAttemptDrawerOpen(true);
                      } else {
                        handleExecuteHomeworkAction('check_answer');
                      }
                    }}
                    disabled={isLoading}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-900 font-display font-bold text-[11px] uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">4. CHECK ANSWER</span>
                    </div>
                  </button>

                  {/* 5. Practise Similar */}
                  <button
                    id="btn-action-practice-similar"
                    onClick={() => handleExecuteHomeworkAction('practice_similar')}
                    disabled={isLoading}
                    className="p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-stone-900 font-display font-bold text-[11px] uppercase">
                      <Flame className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                      <span className="truncate">5. PRACTISE SIMILAR</span>
                    </div>
                  </button>

                  {/* 6. Essay Outline */}
                  <button
                    id="btn-action-essay-outline"
                    onClick={() => handleExecuteHomeworkAction('writing_structure')}
                    disabled={isLoading}
                    className="p-2.5 bg-white hover:bg-pink-50 hover:border-pink-300 border border-stone-200 rounded-xl text-left transition-all shadow-sm flex flex-col gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-stone-900 font-display font-bold text-[11px] uppercase">
                      <PenTool className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                      <span className="truncate">6. ESSAY OUTLINE</span>
                    </div>
                  </button>

                </div>
              </div>
            </div>

            {/* Tutor Conversation Stream */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#FAF8F5]/30">
              {messages.length === 0 && (
                <div className="text-center py-10 text-stone-500 font-mono text-xs">
                  Select one of the learning steps above or type below to begin.
                </div>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isLatestModelMsg = !isUser && index === messages.length - 1;
                return (
                  <div
                    key={msg.id}
                    id={`tutor-msg-${msg.id}`}
                    ref={isLatestModelMsg ? latestResponseRef : null}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 scroll-mt-24 sm:scroll-mt-28`}
                  >
                    {/* Speaker Tag */}
                    <div className={`flex items-center gap-2 font-mono text-[11px] text-stone-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className={`font-bold ${isUser ? 'text-[#D92B8A]' : 'text-stone-700'}`}>
                        {isUser ? 'You (Learner)' : 'Study Tutor'}
                      </span>
                      <span>&bull;</span>
                      <span>{msg.timestamp}</span>
                      {msg.homeworkAction && (
                        <span className="px-2.5 py-0.5 bg-pink-100 text-[#D92B8A] rounded-full text-[10px] font-bold uppercase">
                          {msg.homeworkAction.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Speech Bubble Container */}
                    <div
                      className={`p-5 sm:p-6 max-w-[95%] sm:max-w-[90%] rounded-3xl leading-relaxed transition-all ${
                        isUser
                          ? 'bg-pink-50 border border-pink-200 text-stone-900 rounded-tr-sm shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-900 rounded-tl-sm shadow-md'
                      }`}
                    >
                      {/* Attached document tag */}
                      {msg.attachmentName && (
                        <div className="mb-3 p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-mono text-stone-800 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-[#D92B8A]" />
                          <span>Attached document: <strong>{msg.attachmentName}</strong></span>
                        </div>
                      )}

                      {/* Render Structured Text */}
                      <div className="space-y-3 text-stone-800 text-sm sm:text-base leading-relaxed">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => {
                          const trimmed = paragraph.trim();
                          if (!trimmed) return null;

                          // Headings ###
                          if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
                            const headingText = trimmed.replace(/^#+\s*/, '');
                            return (
                              <h4 key={pIdx} className="font-display font-bold text-base sm:text-lg text-stone-900 pt-2 tracking-tight">
                                {headingText}
                              </h4>
                            );
                          }

                          // Bullet lists
                          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
                            const items = trimmed.split('\n');
                            return (
                              <ul key={pIdx} className="space-y-1.5 pl-3 my-2 border-l-2 border-[#D92B8A]">
                                {items.map((it, itIdx) => (
                                  <li key={itIdx} className="text-sm sm:text-base leading-relaxed text-stone-700">
                                    {it.replace(/^[\s•*-]+\s*/, '')}
                                  </li>
                                ))}
                              </ul>
                            );
                          }

                          // Inline Markdown parsing **bold** and *italic*
                          const renderInlineFormatted = (rawText: string) => {
                            const parts = rawText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                            return parts.map((part, index) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={index} className="font-semibold text-stone-900">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              if (part.startsWith('*') && part.endsWith('*')) {
                                return <em key={index} className="italic text-stone-800">{part.slice(1, -1)}</em>;
                              }
                              return part;
                            });
                          };

                          return (
                            <p key={pIdx} className="leading-relaxed text-stone-700 font-normal">
                              {renderInlineFormatted(trimmed)}
                            </p>
                          );
                        })}
                      </div>

                      {/* DIAGNOSTIC EVALUATION REPORT */}
                      {msg.evaluation && (
                        <div className="mt-4 p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                            <span className="font-display font-bold uppercase text-stone-900 flex items-center gap-1.5 text-sm">
                              <Sparkles className="w-4 h-4 text-[#D92B8A]" />
                              <span>Evaluation Feedback</span>
                            </span>
                            <span className={`px-3 py-1 font-mono text-[11px] font-bold rounded-full ${
                              msg.evaluation.isCorrect === true
                                ? 'bg-emerald-100 text-emerald-800'
                                : msg.evaluation.isCorrect === 'partial'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                            }`}>
                              {msg.evaluation.isCorrect === true ? '✅ Concept Mastered' : msg.evaluation.isCorrect === 'partial' ? '⚠️ Solid Attempt / Minor Polish' : '🔍 Guided Revision'}
                            </span>
                          </div>

                          <p className="font-semibold text-sm text-stone-900">
                            {msg.evaluation.summaryVerdict}
                          </p>

                          {msg.evaluation.whatYouDidWell && (
                            <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1">
                              <span className="font-mono text-[11px] font-bold text-emerald-700 uppercase block">What you did well:</span>
                              <span className="text-sm text-stone-800">{msg.evaluation.whatYouDidWell}</span>
                            </div>
                          )}

                          {msg.evaluation.howToImprove && (
                            <div className="p-3 bg-white border border-pink-200 rounded-xl space-y-1">
                              <span className="font-mono text-[11px] font-bold text-[#D92B8A] uppercase block">How to improve / next step:</span>
                              <span className="text-sm text-stone-800">{msg.evaluation.howToImprove}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex flex-col items-start space-y-1.5 animate-fadeIn">
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm text-xs font-mono flex items-center gap-2.5 text-stone-800">
                    <Sparkles className="w-4 h-4 text-[#D92B8A] animate-spin shrink-0" />
                    <span className="font-bold">Working on it…</span>
                  </div>
                </div>
              )}
            </div>

            {/* SUGGESTED ACTIONS / FOLLOW-UP CHIPS */}
            {suggestedFollowUps.length > 0 && !isLoading && (
              <div className="px-5 py-3 bg-[#FAF8F5] border-t border-stone-200 space-y-2">
                <span className="font-mono text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>SUGGESTED ACTIONS:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedFollowUps.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteHomeworkAction('chat', chip)}
                      className="px-3.5 py-1.5 bg-white hover:bg-pink-50 hover:border-pink-300 text-stone-800 border border-stone-200 rounded-full font-display text-xs font-semibold text-left transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>{chip}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE FOLLOW-UP / CHAT INPUT BAR WITH ASK TUTOR */}
            <div className="p-4 bg-white border-t border-stone-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (followUpInput.trim()) {
                    handleExecuteHomeworkAction('chat', followUpInput);
                  }
                }}
                className="flex gap-2 items-center"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    id="homework-followup-input"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="Ask a follow-up question (e.g. 'Explain step 2', 'Give me another hint')..."
                    disabled={isLoading}
                    className="w-full pl-5 pr-4 py-3.5 bg-[#FAF8F5] border border-stone-300 rounded-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#D92B8A] focus:ring-2 focus:ring-pink-100 transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  id="homework-send-btn"
                  disabled={isLoading || !followUpInput.trim()}
                  className="px-6 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] disabled:opacity-50 text-white font-display text-xs sm:text-sm font-black uppercase rounded-full shadow-md flex items-center gap-2 shrink-0 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>ASK TUTOR</span>
                </button>
              </form>
            </div>

          </section>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#161616] text-white px-5 py-3 rounded-full border border-white/20 shadow-2xl text-xs font-mono font-bold animate-fadeIn z-50 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D92B8A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
