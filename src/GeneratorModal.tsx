import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { BuildGeneratorView } from './BuildGeneratorView';
import { SavedResource, BuildToolId } from './BuildTypes';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialGeneratorType?: string;
  initialResource?: SavedResource | null;
  onResourceSaved?: (res: SavedResource) => void;
}

export function GeneratorModal({
  isOpen,
  onClose,
  initialTopic = '',
  initialGeneratorType = 'exam',
  initialResource = null,
  onResourceSaved,
}: GeneratorModalProps) {
  const [activeTool, setActiveTool] = useState<string>(initialGeneratorType || 'exam');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#FAF7F0] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-amber-900/20">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Proudly Afrikan AI Generator Studio</h2>
              <p className="text-xs text-stone-500">Create, customize, and export curriculum-aligned learning materials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <BuildGeneratorView
            initialToolId={activeTool as BuildToolId}
            onBack={onClose}
            onGoHome={onClose}
            initialTopic={initialTopic}
            initialResource={initialResource}
          />
        </div>
      </div>
    </div>
  );
}
