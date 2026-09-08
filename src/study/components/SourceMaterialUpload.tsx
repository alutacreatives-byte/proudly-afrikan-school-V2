import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { AIService } from '../services/aiService';

export interface SourceMaterialUploadProps {
  currentFileName?: string;
  onTextExtracted?: (text: string, fileName: string) => void;
  onContentExtracted?: (text: string, fileName: string) => void;
  onClear: () => void;
  className?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  currentFileName,
  onTextExtracted,
  onContentExtracted,
  onClear,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtracted = (text: string, fileName: string) => {
    if (onTextExtracted) onTextExtracted(text, fileName);
    if (onContentExtracted) onContentExtracted(text, fileName);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await AIService.parseDocument(file);
      if (parsed && parsed.text) {
        handleExtracted(parsed.text, file.name);
      } else {
        // Fallback reading for simple text files
        const text = await file.text();
        if (text && text.trim().length > 0) {
          handleExtracted(text, file.name);
        } else {
          setError('Could not extract readable text from this file. Please try another file.');
        }
      }
    } catch (err: any) {
      console.warn('[SourceMaterialUpload] file parse issue:', err);
      setError('Unable to parse file. Try uploading as plain text or PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (currentFileName) {
    return (
      <div className={`p-3.5 rounded-xl bg-pink-50/60 border border-pink-200/80 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-[#D92B8A]" />
          </div>
          <div className="truncate">
            <p className="font-mono text-xs font-bold text-stone-900 truncate">
              {currentFileName}
            </p>
            <p className="font-mono text-[10px] text-stone-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Source Material Attached
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="p-1.5 rounded-lg hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer shrink-0"
          title="Remove attached file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? 'border-[#D92B8A] bg-pink-50/50'
            : 'border-stone-200 hover:border-stone-400 bg-stone-50/60 hover:bg-stone-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#D92B8A] animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-stone-400" />
          )}
          <span className="font-mono text-xs font-bold text-stone-700">
            {isLoading ? 'Extracting text...' : 'Upload Notes, PDF or Image'}
          </span>
          <span className="font-mono text-[10px] text-stone-400">
            PDF, DOCX, TXT, MD, or scanned photos (up to 20MB)
          </span>
        </div>
      </div>
      {error && (
        <p className="text-[11px] font-mono text-rose-600 px-1">{error}</p>
      )}
    </div>
  );
};
