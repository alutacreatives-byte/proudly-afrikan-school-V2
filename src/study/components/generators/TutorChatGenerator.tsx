import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  RotateCcw,
  Send,
  FileText,
  Upload,
  User,
  Bot,
  Download
} from 'lucide-react';
import { TutorChatResult, TutorChatMessage } from '../../types';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface TutorChatGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: TutorChatResult;
}

export const TutorChatGenerator: React.FC<TutorChatGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Source document state (file reference only, no extracted text displayed)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>(existingResource?.sourceSnippet || '');
  const [fileMimeType, setFileMimeType] = useState<string>('application/pdf');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');
  const [documentTitle, setDocumentTitle] = useState<string>(existingResource?.title || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<TutorChatMessage[]>(
    existingResource && Array.isArray(existingResource.messages) && existingResource.messages.length > 0
      ? existingResource.messages
      : []
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const latestTutorMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'tutor') {
      latestTutorMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = (reader.result as string) || '';
          resolve(res.replace(/^data:[^;]+;base64,/, '').trim());
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedFile(file);
      setFileBase64(base64);
      setFileMimeType(file.type || 'application/pdf');
      setSourceFileName(file.name);
      
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanTitle);

      if (!canAfford('PDF_STUDY_PACK')) {
        setError('Insufficient credits for Tutor Chat. Please upgrade your plan or top up.');
        openAuthModal('signup');
        setIsUploading(false);
        return;
      }

      const initialGreeting: TutorChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'tutor',
        text: 'Hi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([initialGreeting]);
      await consumeCredits('PDF_STUDY_PACK', `Started Tutor Chat: ${file.name}`);
    } catch (err: any) {
      console.error(err);
      setError('Unable to process document. Please try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetDocument = () => {
    setUploadedFile(null);
    setFileBase64('');
    setFileMimeType('application/pdf');
    setSourceFileName('');
    setDocumentTitle('');
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim() || isSending) return;

    const userMsg: TutorChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
          studySetTitle: documentTitle || sourceFileName || 'Uploaded Document',
          currentConcept: documentTitle || '',
          base64File: fileBase64,
          mimeType: fileMimeType,
          fileName: sourceFileName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.response || data.reply || 'Let us examine this further. What specific section or principle from the document would you like to dive into?';
        const tutorMsg: TutorChatMessage = {
          id: `msg_tutor_${Date.now()}`,
          sender: 'tutor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, tutorMsg]);
      } else {
        throw new Error('Failed to reach mentor service');
      }
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: TutorChatMessage = {
        id: `msg_tutor_${Date.now()}`,
        sender: 'tutor',
        text: `Based on **${sourceFileName || documentTitle || 'the uploaded document'}**, let's break this down:\n\n1. Review the core definitions and terms introduced in the text.\n2. Consider how the main argument connects supporting evidence.\n3. Try framing your question around a specific paragraph or section.\n\nHow else can I guide you through this material?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = () => {
    if (messages.length === 0) return;
    const sessionTitle = documentTitle || sourceFileName || 'Tutor Chat Session';
    const resource: TutorChatResult = {
      id: existingResource?.id || `tutorchat-${Date.now()}`,
      title: sessionTitle,
      documentName: sourceFileName,
      sourceSnippet: fileBase64 ? 'Document attached' : '',
      messages,
      toolType: 'pdf-quiz',
      createdAt: new Date().toISOString(),
    };
    saveResourceToStorage({
      id: resource.id!,
      toolType: 'pdf-quiz' as any,
      title: resource.title,
      subject: 'DOCUMENT MENTORING',
      topic: sourceFileName || 'Chat Session',
      createdAt: resource.createdAt!,
      data: resource,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    let transcript = `TUTOR CHAT TRANSCRIPT: ${documentTitle || sourceFileName || 'Document'}\n\n`;
    messages.forEach(m => {
      transcript += `[${m.timestamp}] ${m.sender === 'user' ? 'Student' : 'Mentor'}: ${m.text}\n\n`;
    });
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const data = {
      title: documentTitle || sourceFileName || 'Tutor Chat',
      documentName: sourceFileName,
      messages,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isChatActive = messages.length > 0 && !!sourceFileName;

  const renderFormattedMessage = (text: string) => {
    // Parse markdown bold (**text**) so asterisks are removed and text is rendered bold
    // Also ensure uploaded filename is rendered bold without asterisks
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2);
            return (
              <strong key={i} className="font-bold">
                {inner}
              </strong>
            );
          }
          if (sourceFileName && part.includes(sourceFileName)) {
            const subParts = part.split(sourceFileName);
            return (
              <React.Fragment key={i}>
                {subParts.map((sub, j) => (
                  <React.Fragment key={j}>
                    {sub}
                    {j < subParts.length - 1 && (
                      <strong className="font-bold">{sourceFileName}</strong>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:pb-36 mb-16 sm:mb-20 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 05
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            TUTOR CHAT
          </h1>
        </div>

        {isChatActive && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
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
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {saved ? 'Saved' : 'Save Session'}
            </button>
            <button
              type="button"
              onClick={handleResetDocument}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Document
            </button>
          </div>
        )}
      </div>

      {!isChatActive ? (
        /* Upload & Setup Screen */
        <div className="max-w-3xl mx-auto p-8 sm:p-10 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E63956] flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-xl uppercase text-[#161616]">
              Upload Material for Tutor Chat
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Upload any PDF, Word document (.doc, .docx), or text file to immediately open an interactive mentoring session based on your document.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs font-bold text-stone-700 uppercase mb-2">
                Upload PDF or Document (.pdf, .doc, .docx, .txt)
              </label>
              <label className="border-2 border-dashed border-stone-200 hover:border-[#E63956] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50 transition-colors">
                <Upload className="w-6 h-6 text-stone-400 mb-2" />
                <span className="text-xs sm:text-sm font-mono font-bold text-stone-700 text-center">
                  {sourceFileName ? sourceFileName : 'Click to browse or drag file here'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 mt-1">
                  Supports PDF, Word (.doc/.docx), Text (.txt, .md)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            {isUploading && (
              <div className="text-center font-mono text-xs text-stone-500 animate-pulse py-2">
                Loading document and initializing mentoring session...
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Chat Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Document File Reference Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <FileText className="w-4 h-4 text-[#E63956]" />
                <h3 className="font-display font-black text-xs uppercase text-[#161616] tracking-wider">
                  Active Document Source
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <FileText className="w-5 h-5 text-[#E63956] shrink-0" />
                  <span className="font-mono text-xs font-bold text-stone-900 truncate">
                    {sourceFileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetDocument}
                  className="w-full py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-700 transition-colors cursor-pointer"
                >
                  Replace Document
                </button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="p-6 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-3">
              <h4 className="font-mono text-xs font-bold text-stone-700 uppercase">
                Quick Discussion Prompts
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  "Summarize the key takeaways from this document.",
                  "Explain the main argument in simple terms.",
                  "What are the most important definitions to memorize?",
                  "Test my understanding with a challenging question."
                ].map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSendMessage(promptText)}
                    className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 font-medium transition-colors cursor-pointer"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Chat Feed */}
          <div className="lg:col-span-8 flex flex-col h-[680px] rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Chat Messages Container */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                const isLastTutor = !isUser && idx === messages.length - 1;
                return (
                  <div
                    key={m.id}
                    ref={isLastTutor ? latestTutorMsgRef : undefined}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser ? 'bg-[#18181B] text-white' : 'bg-pink-100 text-[#E63956]'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#18181B] text-white rounded-tr-none'
                        : 'bg-stone-50 border border-stone-200 text-stone-900 rounded-tl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`font-mono text-[10px] font-bold uppercase ${isUser ? 'text-stone-400' : 'text-stone-500'}`}>
                          {isUser ? 'You' : 'Mentor Tutor'}
                        </span>
                        <span className={`font-mono text-[10px] ${isUser ? 'text-stone-500' : 'text-stone-400'}`}>
                          {m.timestamp}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-normal">
                        {renderFormattedMessage(m.text)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-[#E63956] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-xs font-mono animate-pulse">
                    Analyzing document and formulating guidance...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a follow-up question about the uploaded document..."
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-white text-xs sm:text-sm outline-hidden"
              />
              <button
                type="button"
                disabled={isSending || !inputValue.trim()}
                onClick={() => handleSendMessage()}
                className="px-5 py-3 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
