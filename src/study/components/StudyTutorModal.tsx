import React, { useState, useRef, useEffect } from 'react';
import { 
  StudySet, 
  StudyConcept, 
  TutorMessage, 
  HomeworkActionType, 
  HomeworkAttachment,
  HomeworkEvaluation 
} from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { isTextCorruptedOrUnreadable } from '../utils/textValidation';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  RotateCcw, 
  Check, 
  Lightbulb, 
  ArrowRight,
  ChevronRight,
  Layers,
  GraduationCap,
  FileText,
  Upload,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  PenTool,
  Compass,
  Flame,
  FileQuestion,
  FileCheck,
  SplitSquareVertical,
  ChevronDown,
  ChevronUp,
  FileUp,
  Sliders,
  Award
} from 'lucide-react';

interface StudyTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  studySet?: StudySet | null;
  currentConcept?: StudyConcept;
  initialMode?: 'tutor' | 'homework';
  availableSets?: StudySet[];
}

export const StudyTutorModal: React.FC<StudyTutorModalProps> = ({
  isOpen,
  onClose,
  studySet: propStudySet,
  currentConcept,
  initialMode = 'tutor',
  availableSets = [],
}) => {
  // Active mode: 'tutor' (Concept exploration) vs 'homework' (Homework Help)
  const [activeTab, setActiveTab] = useState<'tutor' | 'homework'>(initialMode);
  
  // Selected study set (if none passed via prop, fallback to first available or selected)
  const [selectedSet, setSelectedSet] = useState<StudySet | null>(propStudySet || (availableSets.length > 0 ? availableSets[0] : null));

  // Homework flow states
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [attemptedAnswer, setAttemptedAnswer] = useState('');
  const [isAttemptExpanded, setIsAttemptExpanded] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<HomeworkAttachment | null>(null);
  
  // Chat stream states
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync propStudySet when changed
  useEffect(() => {
    if (propStudySet) {
      setSelectedSet(propStudySet);
    }
  }, [propStudySet]);

  // Sync initial mode
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  // Initialize tutor greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const topicName = currentConcept ? `"${currentConcept.title}"` : (selectedSet ? `"${selectedSet.title}"` : 'your curriculum');
      
      const initialGreeting: TutorMessage = {
        id: `msg_init_${Date.now()}`,
        role: 'model',
        text: activeTab === 'homework'
          ? `Hello! I am your Homework Helper\n\n` +
            `Need help with a tricky school question or assignment? Paste your question above, upload a worksheet, or submit an attempted answer for feedback.\n\n` +
            `I will help you understand step-by-step rather than simply giving away quick answers.`
          : `Hello! I am your **Study Tutor** for ${topicName}.\n\n` +
            `My goal is to help you truly **understand, remember, and master** this material. Ask me anything—I can break down complex ideas, provide vivid real-world examples, explain difficult concepts in different ways, or test your comprehension with guided questions.\n\n` +
            `*What would you like to explore first?*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: activeTab === 'homework'
          ? [
              `Explain what this question is asking`,
              `Give me a hint to get started`,
              `Check my attempted answer`
            ]
          : currentConcept
            ? [
                `Explain "${currentConcept.title}" in simple terms`,
                `Give me a real-world example of this concept`,
                `Why does this concept matter historically or practically?`,
                `How does this connect to other concepts in this set?`
              ]
            : [
                `What are the most important concepts to understand in ${selectedSet?.title || 'this set'}?`,
                `Give me a high-yield overview of this subject`,
                `How should I structure my revision for this set?`
              ]
      };
      setMessages([initialGreeting]);
      setSuggestedFollowUps(initialGreeting.suggestedFollowUps || []);
    }
  }, [isOpen, selectedSet, currentConcept, messages.length, activeTab]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Auto-clear toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isOpen) return null;

  // Handle Worksheet File Upload (Max 20 MB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setToastMessage('Maximum upload size is 20 MB. Please upload a smaller document.');
      return;
    }

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
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
      (async () => {
        try {
          setToastMessage(`Attaching "${file.name}"...`);
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
      })();
    }
  };

  const removeAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message / invoke specialized homework action
  const handleExecuteAction = async (
    actionType: HomeworkActionType = 'chat',
    customPromptText?: string
  ) => {
    let questionText = customPromptText || inputPrompt;
    let answerText = attemptedAnswer;

    if (activeTab === 'homework') {
      if (!questionText && homeworkQuestion) {
        questionText = homeworkQuestion;
      }
    }

    const trimmedQuestion = questionText.trim();
    if (!trimmedQuestion && !selectedAttachment && actionType !== 'hint' && actionType !== 'work_through') {
      return;
    }

    const displayText = trimmedQuestion || 
      (actionType === 'hint' ? 'Please give me a guided hint for this problem.' :
       actionType === 'explain' ? 'Can you explain what this problem is asking?' :
       actionType === 'work_through' ? 'Please walk me through this problem step-by-step.' :
       actionType === 'check_answer' ? `Please review my attempted answer:\n"${answerText}"` :
       actionType === 'practice_similar' ? 'Can you give me a similar practice problem to test my understanding?' :
       actionType === 'writing_structure' ? 'Help me brainstorm ideas and structure an outline for this assignment.' :
       'Can you help me with this?');

    const userMsg: TutorMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: displayText + (answerText && actionType === 'check_answer' && !displayText.includes(answerText) ? `\n\n*My Attempted Answer:*\n${answerText}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      homeworkAction: actionType,
      attachmentName: selectedAttachment?.name
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);
    setSuggestedFollowUps([]);

    try {
      const chatPayload = newHistory.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await AIService.askTutor({
        messages: chatPayload,
        studySet: selectedSet,
        currentConcept,
        homeworkAction: actionType,
        homeworkQuestion: trimmedQuestion || homeworkQuestion,
        attemptedAnswer: answerText || undefined,
        attachment: selectedAttachment || undefined
      });

      const tutorMsg: TutorMessage = {
        id: `msg_tutor_${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: res.suggestedFollowUps,
        homeworkAction: actionType,
        evaluation: res.evaluation
      };

      setMessages(prev => [...prev, tutorMsg]);
      setSuggestedFollowUps(res.suggestedFollowUps || []);
    } catch (err) {
      console.error('Tutor request failed:', err);
      const errorMsg: TutorMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: `I encountered a temporary connection issue. Let's try again! You can ask for a hint, an explanation of the core concept, or step-by-step guidance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Explain this simply', 'Give me a hint']
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setSuggestedFollowUps([]);
    setHomeworkQuestion('');
    setAttemptedAnswer('');
    removeAttachment();
    
    const topicName = currentConcept ? `"${currentConcept.title}"` : (selectedSet ? `"${selectedSet.title}"` : 'your curriculum');
    const initialGreeting: TutorMessage = {
      id: `msg_init_${Date.now()}`,
      role: 'model',
      text: activeTab === 'homework'
        ? `Hello! I am your Homework Helper\n\n` +
          `Need help with a tricky school question or assignment? Paste your question above, upload a worksheet, or submit an attempted answer for feedback.\n\n` +
          `I will help you understand step-by-step rather than simply giving away quick answers.`
        : `Tutor restarted! Ready to study ${topicName}. What question do you have?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: activeTab === 'homework'
        ? ['Explain what this problem is asking', 'Give me a hint to get started', 'Check my attempted answer']
        : [`Explain "${currentConcept?.title || selectedSet?.title || 'this topic'}" simply`, 'Give me a real-world example', 'Test my understanding']
    };
    setMessages([initialGreeting]);
    setSuggestedFollowUps(initialGreeting.suggestedFollowUps);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Copied explanation to clipboard!');
  };

  const handleSaveToNotes = (text: string, title?: string) => {
    const targetTitle = title || currentConcept?.title || selectedSet?.title || 'Homework Help Session';
    const res = StorageService.saveNote({
      targetId: currentConcept?.id || selectedSet?.id || `homework_${Date.now()}`,
      targetTitle: `Tutor Note: ${targetTitle}`,
      targetType: currentConcept ? 'concept' : selectedSet ? 'set' : 'general',
      category: selectedSet?.category || 'HOMEWORK & STUDY',
      content: text
    });

    if (res.success) {
      setToastMessage('Saved to My Study Notes!');
    } else {
      setToastMessage(res.error || 'Failed to save note.');
    }
  };

  return (
    <div 
      id="study-tutor-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white border border-stone-200/90 w-full max-w-4xl h-[92vh] max-h-[860px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2.5 bg-pink-50 text-[#D92B8A] rounded-2xl border border-pink-200 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-base text-stone-900">
                  Study Tutor & Homework Help
                </span>
                <span className="px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] font-mono text-xs font-bold uppercase rounded-full border border-pink-200">
                  Learning First
                </span>
              </div>
              <p className="font-mono text-xs text-stone-500 truncate mt-0.5">
                {currentConcept 
                  ? `Active Lesson: ${currentConcept.title}` 
                  : selectedSet 
                    ? `Set Context: ${selectedSet.title}` 
                    : 'Universal Curriculum Tutor & Homework Specialist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="tutor-reset-btn"
              onClick={handleResetChat}
              title="Restart tutor conversation"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="tutor-close-btn"
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher & Context Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-full border border-stone-300/60">
            <button
              id="tab-tutor-mode"
              onClick={() => setActiveTab('tutor')}
              className={`px-4 py-1.5 font-display text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'tutor'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>Concept Tutor</span>
            </button>
            <button
              id="tab-homework-mode"
              onClick={() => setActiveTab('homework')}
              className={`px-4 py-1.5 font-display text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'homework'
                  ? 'bg-[#D92B8A] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Homework Help</span>
            </button>
          </div>

          {/* Active Set / Subject Grounding Tag */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase">Context:</span>
            {availableSets.length > 0 && !currentConcept ? (
              <select
                value={selectedSet?.id || ''}
                onChange={(e) => {
                  const found = availableSets.find(s => s.id === e.target.value);
                  if (found) setSelectedSet(found);
                }}
                className="bg-white border border-stone-200 font-mono text-xs px-3 py-1 text-stone-800 rounded-full focus:outline-none focus:ring-1 focus:ring-[#D92B8A]"
              >
                {availableSets.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            ) : (
              <span className="font-mono text-xs font-bold text-stone-800 bg-white border border-stone-200 px-3 py-1 rounded-full truncate max-w-[200px] shadow-xs">
                {currentConcept ? currentConcept.title : (selectedSet?.title || 'General')}
              </span>
            )}
          </div>
        </div>

        {/* HOMEWORK HELP WORKFLOW RIBBON */}
        {activeTab === 'homework' && (
          <div className="bg-stone-50/70 border-b border-stone-200 p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-700 uppercase">
              <span className="flex items-center gap-1 text-[#D92B8A]">
                <Compass className="w-3.5 h-3.5" />
                <span>Homework Progression:</span>
              </span>
              <span className="text-stone-500">Choose a guided step:</span>
            </div>

            {/* Quick Socratic Step Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                id="btn-step-explain"
                onClick={() => handleExecuteAction('explain')}
                disabled={isLoading}
                className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl text-left transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-stone-900">
                  <HelpCircle className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>1. Explain</span>
                </div>
                <span className="text-xs text-stone-600 leading-tight mt-1">Clarify problem</span>
              </button>

              <button
                id="btn-step-hint"
                onClick={() => handleExecuteAction('hint')}
                disabled={isLoading}
                className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl text-left transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-stone-900">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>2. Hint</span>
                </div>
                <span className="text-xs text-stone-600 leading-tight mt-1">Socratic clue</span>
              </button>

              <button
                id="btn-step-work-through"
                onClick={() => handleExecuteAction('work_through')}
                disabled={isLoading}
                className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl text-left transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-stone-900">
                  <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>3. Steps</span>
                </div>
                <span className="text-xs text-stone-600 leading-tight mt-1">Work through it</span>
              </button>

              <button
                id="btn-step-check-answer"
                onClick={() => {
                  setIsAttemptExpanded(true);
                  if (attemptedAnswer.trim()) {
                    handleExecuteAction('check_answer');
                  }
                }}
                disabled={isLoading}
                className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl text-left transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-stone-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Check</span>
                </div>
                <span className="text-xs text-stone-600 leading-tight mt-1">Review attempt</span>
              </button>

              <button
                id="btn-step-writing"
                onClick={() => handleExecuteAction('writing_structure')}
                disabled={isLoading}
                className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl text-left transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-stone-900">
                  <PenTool className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>5. Writing</span>
                </div>
                <span className="text-xs text-stone-600 leading-tight mt-1">Outline & ideas</span>
              </button>

              <button
                id="btn-step-practice"
                onClick={() => handleExecuteAction('practice_similar')}
                disabled={isLoading}
                className="p-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white rounded-xl text-left transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-center gap-1 font-display font-bold text-xs text-white">
                  <Flame className="w-3.5 h-3.5" />
                  <span>6. Practise</span>
                </div>
                <span className="text-xs text-pink-100 leading-tight mt-1">Similar problem</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500 px-2">
                  <span>{isUser ? 'Learner (You)' : 'Study Tutor'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.homeworkAction && (
                    <span className="px-2 py-0.5 bg-pink-50 border border-pink-200 text-xs font-bold uppercase text-[#D92B8A] rounded-full">
                      {msg.homeworkAction.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div
                  className={`p-5 max-w-[95%] sm:max-w-[88%] text-sm leading-relaxed rounded-2xl ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs shadow-sm'
                      : 'bg-white border border-stone-200 text-stone-900 rounded-tl-xs shadow-sm'
                  }`}
                >
                  {/* Attachment tag if present */}
                  {msg.attachmentName && (
                    <div className="mb-3 p-2 bg-stone-100 border border-stone-200 text-xs font-mono text-stone-800 flex items-center gap-2 rounded-lg">
                      <Paperclip className="w-3.5 h-3.5 text-[#D92B8A]" />
                      <span>Attachment: {msg.attachmentName}</span>
                    </div>
                  )}

                  {/* Formatted Text Content */}
                  <div className={`space-y-3 ${isUser ? 'text-sm' : 'text-base'} leading-relaxed`}>
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      // Headings
                      if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
                        const headingText = trimmed.replace(/^#+\s*/, '');
                        return (
                          <h4 key={pIdx} className="font-display font-bold text-base text-[#D92B8A] pt-1">
                            {headingText}
                          </h4>
                        );
                      }
                      
                      // Bullet points
                      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
                        const items = trimmed.split('\n');
                        return (
                          <ul key={pIdx} className="space-y-1.5 pl-3 my-2 border-l-2 border-[#D92B8A]">
                            {items.map((it, itIdx) => (
                              <li key={itIdx} className="text-sm sm:text-base leading-relaxed">
                                {it.replace(/^[\s•*-]+\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Parse inline bolding **text** and *text*
                      const renderInlineFormatted = (rawText: string) => {
                        const parts = rawText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                        return parts.map((part, index) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-stone-900'}`}>
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
                          }
                          return part;
                        });
                      };

                      return (
                        <p key={pIdx} className="leading-relaxed font-normal">
                          {renderInlineFormatted(trimmed)}
                        </p>
                      );
                    })}
                  </div>

                  {/* ANSWER EVALUATION CARD */}
                  {msg.evaluation && (
                    <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-display font-bold uppercase text-stone-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#D92B8A]" />
                          <span>Evaluation Report</span>
                        </span>
                        <span className={`px-2.5 py-0.5 font-mono text-xs font-bold uppercase rounded-full border ${
                          msg.evaluation.isCorrect === true
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : msg.evaluation.isCorrect === 'partial'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {msg.evaluation.isCorrect === true ? '✓ Mastered' : msg.evaluation.isCorrect === 'partial' ? '⚡ Solid Attempt' : '🔍 Guided Step'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-stone-900 text-sm">
                          {msg.evaluation.summaryVerdict}
                        </p>
                        
                        {msg.evaluation.whatYouDidWell && (
                          <div className="p-3 bg-white border border-stone-200 rounded-lg">
                            <span className="font-mono text-xs font-bold text-emerald-700 uppercase block mb-0.5">What you did well:</span>
                            <span className="text-stone-800 text-xs sm:text-sm">{msg.evaluation.whatYouDidWell}</span>
                          </div>
                        )}

                        {msg.evaluation.howToImprove && (
                          <div className="p-3 bg-white border border-stone-200 rounded-lg">
                            <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase block mb-0.5">Next step:</span>
                            <span className="text-stone-800 text-xs sm:text-sm">{msg.evaluation.howToImprove}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions on model reply: Copy, Save to Notes */}
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400 text-xs font-mono">
                        Proudly Afrikan Study
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyText(msg.text)}
                          className="px-3 py-1 bg-stone-50 hover:bg-pink-50 text-stone-700 hover:text-[#D92B8A] border border-stone-200 rounded-full font-medium flex items-center gap-1 transition-colors"
                          title="Copy explanation"
                        >
                          <Copy className="w-3 h-3 text-[#D92B8A]" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => handleSaveToNotes(msg.text)}
                          className="px-3 py-1 bg-stone-50 hover:bg-pink-50 text-stone-700 hover:text-[#D92B8A] border border-stone-200 rounded-full font-medium flex items-center gap-1 transition-colors"
                          title="Save to My Study Notes"
                        >
                          <Save className="w-3 h-3 text-[#D92B8A]" />
                          <span>Save to Notes</span>
                        </button>
                      </div>
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

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-Ups Chips */}
        {suggestedFollowUps.length > 0 && !isLoading && (
          <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-stone-200 space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase text-stone-500 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>Suggested Next Steps:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedFollowUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteAction('chat', chip)}
                  className="px-3.5 py-1.5 bg-stone-50 hover:bg-pink-50 text-stone-800 border border-stone-200 hover:border-pink-300 rounded-full font-display text-xs font-medium text-left transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3 h-3 text-[#D92B8A] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EXPANDABLE ATTEMPTED ANSWER DRAWER */}
        {isAttemptExpanded && (
          <div className="bg-stone-50 border-t border-stone-200 p-4 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xs uppercase text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />
                <span>Submit your attempted answer for review</span>
              </span>
              <button
                onClick={() => setIsAttemptExpanded(false)}
                className="text-xs font-mono text-stone-500 hover:text-stone-900"
              >
                Close ✕
              </button>
            </div>
            <p className="text-xs text-stone-600 font-normal">
              Paste your draft, working steps, or answer. The Tutor will review your reasoning, highlight what is correct, and guide you to polish any errors.
            </p>
            <textarea
              id="attempted-answer-input"
              value={attemptedAnswer}
              onChange={(e) => setAttemptedAnswer(e.target.value)}
              placeholder="e.g. For step 1 I calculated..., then I deduced that..."
              rows={2}
              className="w-full p-3 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm font-sans text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A]/30 focus:border-[#D92B8A] resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleExecuteAction('check_answer')}
                disabled={isLoading || !attemptedAnswer.trim()}
                className="px-5 py-2 bg-[#D92B8A] hover:bg-[#c02479] disabled:opacity-50 text-white font-display text-xs font-bold uppercase rounded-full shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Evaluate My Answer</span>
              </button>
            </div>
          </div>
        )}

        {/* ATTACHMENT BADGE IF UPLOADED */}
        {selectedAttachment && (
          <div className="bg-stone-50 border-t border-stone-200 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <Paperclip className="w-3.5 h-3.5 text-[#D92B8A] shrink-0" />
              <span className="font-mono text-xs font-medium text-stone-800 truncate">
                Attached: <strong>{selectedAttachment.name}</strong> ({selectedAttachment.size >= 1024 * 1024 ? `${(selectedAttachment.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(selectedAttachment.size / 1024)} KB`})
              </span>
            </div>
            <button
              onClick={removeAttachment}
              className="text-[#D92B8A] hover:underline font-mono text-xs font-bold shrink-0 ml-2"
            >
              Remove
            </button>
          </div>
        )}

        {/* INPUT BAR */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteAction('chat');
            }}
            className="flex gap-2 items-center"
          >
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.json,.csv"
              className="hidden"
              id="homework-file-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload homework worksheet, assignment document, or diagram image (Maximum upload size is 20 MB)"
              className="p-3 bg-stone-50 hover:bg-pink-50 border border-stone-200 text-stone-800 rounded-full transition-colors shrink-0 flex items-center gap-1.5 text-xs font-display font-bold shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#D92B8A]" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* Attempted Answer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAttemptExpanded(!isAttemptExpanded)}
              className={`p-3 border rounded-full transition-all shrink-0 flex items-center gap-1.5 text-xs font-display font-bold shadow-xs ${
                isAttemptExpanded || attemptedAnswer.trim()
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 hover:bg-pink-50 text-stone-800 border-stone-200'
              }`}
              title="Submit your attempted answer for feedback"
            >
              <CheckCircle2 className={`w-4 h-4 ${isAttemptExpanded ? 'text-[#D92B8A]' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">My Attempt</span>
            </button>

            {/* Main Prompt Input */}
            <input
              type="text"
              id="tutor-prompt-input"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                activeTab === 'homework'
                  ? 'Type or paste your homework question, prompt, or ask for a hint...'
                  : currentConcept
                    ? `Ask about "${currentConcept.title}" or ask for an analogy...`
                    : `Ask any question about ${selectedSet?.title || 'the curriculum'}...`
              }
              disabled={isLoading}
              className="flex-1 px-5 py-3 bg-stone-50 border border-stone-200 rounded-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D92B8A]/30 focus:border-[#D92B8A]"
            />

            {/* Send Button */}
            <button
              type="submit"
              id="tutor-submit-btn"
              disabled={isLoading || (!inputPrompt.trim() && !selectedAttachment && !attemptedAnswer.trim())}
              className="px-6 py-3 bg-[#D92B8A] hover:bg-[#c02479] disabled:opacity-40 text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md flex items-center gap-2 shrink-0 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </button>
          </form>
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-xl text-xs font-mono font-medium animate-fadeIn z-50 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
