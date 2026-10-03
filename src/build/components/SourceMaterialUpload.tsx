import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export interface SourceMaterialUploadProps {
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  currentFileName?: string;
  onTextExtracted?: (text: string, filename: string) => void;
  onClear?: () => void;
  accentColor?: string;
  onChangeText?: (text: string) => void;
  onFileLoaded?: (text: string, filename: string) => void;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceText = '',
  onSourceTextChange,
  currentFileName,
  onTextExtracted,
  onClear,
  accentColor = '#E62E6B',
  onChangeText,
  onFileLoaded,
}) => {
  const [internalFileName, setInternalFileName] = useState<string | null>(null);

  const activeFileName = currentFileName !== undefined ? currentFileName : internalFileName;
  const activeText = sourceText;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInternalFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      if (onSourceTextChange) onSourceTextChange(text);
      if (onChangeText) onChangeText(text);
      if (onTextExtracted) onTextExtracted(text, file.name);
      if (onFileLoaded) onFileLoaded(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setInternalFileName(null);
    if (onSourceTextChange) onSourceTextChange('');
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (onSourceTextChange) onSourceTextChange(val);
    if (onChangeText) onChangeText(val);
  };

  return (
    <div className="space-y-3">
      <label className="block font-display font-black text-xs uppercase text-stone-700 tracking-wider">
        Source Material / Document (Optional)
      </label>
      <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50 hover:bg-stone-100/50 transition-colors">
        {activeFileName ? (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2.5 truncate">
              <FileText className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
              <span className="text-sm font-sans font-medium text-stone-800 truncate">{activeFileName}</span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer py-2">
            <Upload className="w-6 h-6 text-stone-400 mb-2" />
            <span className="text-xs font-display font-bold text-stone-700 uppercase">Upload textbook, notes, or PDF text</span>
            <span className="text-[11px] text-stone-500 font-sans mt-0.5">TXT, MD, or PDF text contents</span>
            <input
              type="file"
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
      <textarea
        value={activeText}
        onChange={handleTextChange}
        placeholder="Or paste your source text, lecture notes, or chapter excerpt here..."
        className="w-full h-28 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-sans text-stone-800 focus:outline-none focus:ring-2 transition-all resize-y"
        style={{ focusRingColor: accentColor } as any}
      />
    </div>
  );
};
