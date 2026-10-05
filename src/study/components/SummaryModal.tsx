import React, { useState, useEffect } from 'react';
import { StudySet, StudyConcept, StudySummary, SummaryType } from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { 
  FileText, 
  X, 
  Sparkles, 
  Save, 
  Copy, 
  Check, 
  Zap, 
  BookOpen, 
  Layers, 
  AlignLeft, 
  Bookmark,
  ArrowRight
} from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studySet?: StudySet;
  concept?: StudyConcept;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  studySet,
  concept,
}) => {
  const [selectedType, setSelectedType] = useState<SummaryType>('standard');
  const [summaries, setSummaries] = useState<Partial<Record<SummaryType, StudySummary>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeTitle = concept?.title ? `${concept.title}` : (studySet?.title || 'Study Material');

  useEffect(() => {
    if (isOpen) {
      if (!summaries[selectedType]) {
        fetchSummary(selectedType);
      }
    }
  }, [isOpen, selectedType, studySet, concept]);

  if (!isOpen) return null;

  async function fetchSummary(type: SummaryType) {
    setIsLoading(true);
    setIsSaved(false);
    try {
      const summary = await AIService.generateSummary(studySet, concept, type);
      setSummaries(prev => ({
        ...prev,
        [type]: summary
      }));
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTabChange = (type: SummaryType) => {
    setSelectedType(type);
    setIsSaved(false);
    if (!summaries[type]) {
      fetchSummary(type);
    }
  };

  const currentSummary = summaries[selectedType];

  const handleSaveToNotes = () => {
    if (!currentSummary) return;

    const formattedNote = `# Summary (${selectedType.toUpperCase()}): ${activeTitle}
Category: ${studySet?.category || concept?.category || 'General Knowledge'}
Date: ${new Date(currentSummary.generatedAt).toLocaleDateString()}

## Overview
${currentSummary.overview}

## Key Bullet Points
${currentSummary.keyPoints.map(p => `• ${p}`).join('\n')}

## Narrative Summary
${currentSummary.fullSummary}

## Essential Takeaways
${currentSummary.keyTakeaways.map(t => `• ${t}`).join('\n')}
`;

    const targetId = concept?.id || studySet?.id || `summary_${Date.now()}`;
    const targetType = concept ? 'concept' : 'set';

    const res = StorageService.saveNote({
      targetId,
      targetTitle: `Summary (${selectedType.toUpperCase()}): ${activeTitle}`,
      targetType,
      category: studySet?.category || concept?.category || 'General Knowledge',
      content: formattedNote,
    });

    if (res.success) {
      setIsSaved(true);
      setSaveMessage('Saved to My Study Notes!');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage('Failed to save summary to notes');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCopy = () => {
    if (!currentSummary) return;
    const text = `${currentSummary.overview}\n\n${currentSummary.fullSummary}\n\nKey Takeaways:\n${currentSummary.keyTakeaways.join('\n')}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200/90 w-full max-w-3xl h-[85vh] max-h-[780px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 text-[#D92B8A] rounded-2xl border border-pink-200">
              <AlignLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base text-stone-900">
                  Summary Generator
                </span>
                <span className="px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] font-mono text-xs font-bold uppercase rounded-full border border-pink-200">
                  {concept ? 'Lesson' : 'Study Set'}
                </span>
              </div>
              <p className="font-mono text-xs text-stone-500 truncate max-w-md mt-0.5">
                {activeTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSummary && (
              <>
                <button
                  onClick={handleSaveToNotes}
                  className={`px-3.5 py-1.5 font-display text-xs font-bold uppercase rounded-full border flex items-center gap-1.5 transition-all shadow-xs ${
                    isSaved ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-pink-50 text-stone-800 border-stone-200'
                  }`}
                  title="Save summary to notes"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#D92B8A]" />}
                  <span className="hidden sm:inline">{isSaved ? 'Saved to Notes' : 'Save to Notes'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 flex items-center gap-1.5 shadow-xs transition-all"
                  title="Copy summary text"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                  <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Selectable Summary Level Tabs */}
        <div className="flex bg-stone-50 border-b border-stone-200 p-2 gap-2">
          <button
            onClick={() => handleTabChange('quick')}
            className={`flex-1 py-2.5 px-3 text-center font-display text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              selectedType === 'quick'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>Quick</span>
          </button>

          <button
            onClick={() => handleTabChange('standard')}
            className={`flex-1 py-2.5 px-3 text-center font-display text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              selectedType === 'standard'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>Standard</span>
          </button>

          <button
            onClick={() => handleTabChange('detailed')}
            className={`flex-1 py-2.5 px-3 text-center font-display text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              selectedType === 'detailed'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>Detailed</span>
          </button>
        </div>

        {/* Feedback alert */}
        {saveMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-mono font-bold text-emerald-800 flex items-center justify-between">
            <span>✓ {saveMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-stone-50/40">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#D92B8A] animate-spin mx-auto" />
              <p className="font-display font-black text-lg text-stone-900">
                Generating {selectedType} Summary...
              </p>
              <p className="font-mono text-xs text-stone-500">
                Distilling core concepts and key takeaways for maximum retention.
              </p>
            </div>
          ) : currentSummary ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Overview Callout */}
              <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-2">
                <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
                  {selectedType === 'quick' ? '⚡ Executive Takeaway' : selectedType === 'detailed' ? '🔬 Thematic Overview' : '📖 Balanced Summary'}
                </span>
                <p className="text-base text-stone-800 font-medium leading-relaxed">
                  {currentSummary.overview}
                </p>
              </div>

              {/* Key Bullet Points */}
              {currentSummary.keyPoints && currentSummary.keyPoints.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                    Key Points:
                  </h4>
                  <div className="space-y-2">
                    {currentSummary.keyPoints.map((point, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-stone-200 rounded-2xl text-sm text-stone-800 shadow-xs flex items-start gap-2.5">
                        <span className="font-mono font-bold text-[#D92B8A] mt-0.5">•</span>
                        <span className="leading-relaxed font-normal">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Content */}
              {selectedType !== 'quick' && (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-2">
                    Structured Revision Summary:
                  </h4>
                  <div className="text-base text-stone-700 leading-relaxed space-y-3 whitespace-pre-wrap font-normal">
                    {currentSummary.fullSummary}
                  </div>
                </div>
              )}

              {/* Essential Takeaways */}
              {currentSummary.keyTakeaways && currentSummary.keyTakeaways.length > 0 && (
                <div className="p-6 bg-pink-50/70 border border-pink-200 rounded-3xl shadow-xs space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#D92B8A]">
                    🎯 Retention Takeaways:
                  </h4>
                  <div className="space-y-2">
                    {currentSummary.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-stone-900 font-medium">
                        <span className="text-[#D92B8A] font-bold">✓</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveToNotes}
                  className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'Saved to Notes ✓' : 'Save Summary to Notes'}</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
