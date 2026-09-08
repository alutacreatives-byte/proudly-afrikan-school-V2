import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Camera, CheckCircle2 } from 'lucide-react';
import { CameraCaptureModal } from '../../study/components/CameraCaptureModal';

export interface SourceMaterialUploadProps {
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  sourceFile?: { name: string; content: string; type: string } | null;
  onSourceFileChange?: (file: { name: string; content: string; type: string } | null) => void;
  currentFileName?: string;
  onTextExtracted?: (text: string, fileName: string) => void;
  onContentExtracted?: (text: string, fileName: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceText = '',
  onSourceTextChange,
  sourceFile = null,
  onSourceFileChange,
  currentFileName,
  onTextExtracted,
  onContentExtracted,
  onClear,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'camera'>('text');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      if (onSourceFileChange) {
        onSourceFileChange({
          name: file.name,
          content: content.slice(0, 10000),
          type: file.type || 'document',
        });
      }
      if (onTextExtracted) onTextExtracted(content, file.name);
      if (onContentExtracted) onContentExtracted(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleCameraCapture = (imageDataUrl: string, extractedText: string) => {
    if (onSourceFileChange) {
      onSourceFileChange({
        name: `Camera Capture ${new Date().toLocaleTimeString()}`,
        content: extractedText || imageDataUrl,
        type: 'image/jpeg',
      });
    }
    if (onSourceTextChange && onSourceTextChange) {
      onSourceTextChange(sourceText ? `${sourceText}\n\n${extractedText}` : extractedText);
    }
    if (onTextExtracted) onTextExtracted(extractedText, 'Camera Capture');
    if (onContentExtracted) onContentExtracted(extractedText, 'Camera Capture');
    setIsCameraOpen(false);
  };

  if (currentFileName) {
    return (
      <div className={`p-3.5 rounded-xl bg-pink-50/60 border border-pink-200/80 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-[#E63956]" />
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
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-stone-500 hover:text-stone-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <label className="font-display font-bold text-sm uppercase tracking-wider text-stone-800">
          Source Material & Context (Optional)
        </label>
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'text' ? 'bg-[#18181B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'file' ? 'bg-[#18181B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setIsCameraOpen(true);
            }}
            className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'camera' ? 'bg-[#E63956] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </button>
        </div>
      </div>

      {activeTab === 'text' && onSourceTextChange && (
        <div className="space-y-2">
          <textarea
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            placeholder="Paste syllabus paragraphs, lecture notes, textbook chapters, or key concepts here to ground the generated resource..."
            rows={4}
            className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63956]/30 focus:border-[#E63956] bg-stone-50/50"
          />
        </div>
      )}

      {activeTab === 'file' && (
        <div className="space-y-3">
          {sourceFile ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">{sourceFile.name}</p>
                  <p className="text-xs text-emerald-700 font-mono">Loaded successfully for context extraction</p>
                </div>
              </div>
              {onSourceFileChange && (
                <button
                  type="button"
                  onClick={() => onSourceFileChange(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-[#E63956] rounded-2xl p-6 text-center cursor-pointer bg-stone-50/50 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 group-hover:bg-[#E63956] group-hover:text-white flex items-center justify-center mx-auto mb-3 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-stone-800 text-sm mb-1">
                Click to upload PDF, TXT or Document
              </p>
              <p className="text-xs text-stone-500 font-mono">
                Supports syllabi, textbook chapters, and notes up to 35MB
              </p>
            </div>
          )}
        </div>
      )}

      {isCameraOpen && (
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={(_blob, dataUrl, name) => handleCameraCapture(dataUrl, name)}
        />
      )}
    </div>
  );
};
