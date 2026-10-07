import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Loader2, FileUp, Sparkles } from 'lucide-react';
import { extractTextFromFile } from '../../../quiz/utils/pdfExtractor';

export interface SourceMaterialUploadProps {
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  onTextExtracted?: (text: string, fileName: string) => void;
  onContentExtracted?: (text: string, fileName: string) => void;
  currentFileName?: string;
  onClear?: () => void;
  accentColor?: string;
  className?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceText,
  onSourceTextChange,
  onTextExtracted,
  onContentExtracted,
  currentFileName = '',
  onClear,
  accentColor = '#E05A2B',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextExtracted = (text: string, fileName: string) => {
    if (onTextExtracted) onTextExtracted(text, fileName);
    if (onContentExtracted) onContentExtracted(text, fileName);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await extractTextFromFile(file);
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No readable text could be extracted from this file.');
      }
      handleTextExtracted(result.text, file.name);
    } catch (err: any) {
      console.error('File extraction error:', err);
      setErrorMessage(err.message || 'Failed to extract text from document. Please try a TXT, Markdown, or clean PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so the same file can be re-uploaded if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyPaste = () => {
    if (!pastedText.trim()) return;
    handleTextExtracted(pastedText.trim(), 'Pasted Notes');
    setShowPasteModal(false);
    setPastedText('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.doc,.docx,text/*,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentFileName ? (
        <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="font-mono text-xs font-bold text-stone-900 truncate">
                {currentFileName}
              </p>
              <p className="font-mono text-[10px] text-emerald-600 uppercase font-semibold">
                Document text extracted & ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              setErrorMessage(null);
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            title="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#E05A2B] bg-orange-50/50'
              : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50'
          }`}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#E05A2B]" />
              <p className="font-mono text-xs font-bold text-stone-700">
                Parsing & extracting document text...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-600">
                <FileUp className="w-5 h-5 text-stone-700" />
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-xs font-bold text-stone-800">
                  Click to upload or drag & drop
                </p>
                <p className="font-mono text-[11px] text-stone-500">
                  PDF, DOCX, Markdown, Text notes, or Textbook scan
                </p>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPasteModal(true);
                  }}
                  className="font-mono text-[11px] font-bold text-[#E05A2B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  Or paste raw notes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-mono text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border border-[#E3D9C9] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                Paste Class Notes or Source Text
              </h3>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste curriculum syllabus, revision notes, book chapter excerpt, or article text here..."
              className="w-full p-3.5 bg-white border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E05A2B]/50 shadow-inner"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 font-mono text-xs font-bold uppercase rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                disabled={!pastedText.trim()}
                className="px-5 py-2 font-mono text-xs font-bold uppercase rounded-xl bg-[#E05A2B] text-white hover:opacity-90 disabled:opacity-50"
              >
                Apply Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
