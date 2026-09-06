import React, { useState } from 'react';
import { StudySet, StudyGuide } from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { 
  FileText, 
  X, 
  Sparkles, 
  Save, 
  Copy, 
  Check, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Printer, 
  BookmarkCheck,
  Tag
} from 'lucide-react';

interface StudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  studySet: StudySet;
}

export const StudyGuideModal: React.FC<StudyGuideModalProps> = ({
  isOpen,
  onClose,
  studySet,
}) => {
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && !guide && !isLoading) {
      generateGuide();
    }
  }, [isOpen, studySet]);

  if (!isOpen) return null;

  async function generateGuide() {
    setIsLoading(true);
    setIsSaved(false);
    try {
      const generated = await AIService.generateStudyGuide(studySet);
      setGuide(generated);
    } catch (err) {
      console.error('Failed to generate study guide:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveToNotes = () => {
    if (!guide) return;

    const markdownContent = `# Revision Study Guide: ${guide.setTitle}
Category: ${guide.category}
Generated: ${new Date(guide.generatedAt).toLocaleDateString()}

## Executive Overview
${guide.overview}

## Key Concepts & Mechanics
${guide.keyConcepts.map((c, i) => `### ${i + 1}. ${c.title}
**Summary**: ${c.summary}
${c.explanation}`).join('\n\n')}

## Important Facts to Memorize
${guide.importantFacts.map(f => `• ${f}`).join('\n')}

## Key Definitions & Terminology
${guide.definitions.map(d => `• **${d.term}**: ${d.definition}`).join('\n')}

## Main Ideas & Conceptual Pillars
${guide.mainIdeas.map(m => `• **${m.idea}**: ${m.detail}`).join('\n')}

## Key Things to Remember
${guide.keyThingsToRemember.map(k => `• ${k}`).join('\n')}

## Revision Self-Check Questions
${guide.reviewQuestions.map((q, i) => `Q${i + 1}: ${q.question}
Answer: ${q.answer} ${q.hint ? `(Hint: ${q.hint})` : ''}`).join('\n\n')}
`;

    const res = StorageService.saveNote({
      targetId: studySet.id,
      targetTitle: `Study Guide: ${guide.setTitle}`,
      targetType: 'set',
      category: guide.category || studySet.category || 'General Knowledge',
      content: markdownContent,
    });

    if (res.success) {
      setIsSaved(true);
      setSaveMessage('Saved to My Study Notes!');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage('Failed to save to notes');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCopyMarkdown = () => {
    if (!guide) return;

    const markdownText = `# Revision Study Guide: ${guide.setTitle}
Category: ${guide.category}

## Overview
${guide.overview}

## Key Concepts
${guide.keyConcepts.map(c => `### ${c.title}\n${c.summary}\n${c.explanation}`).join('\n\n')}

## Important Facts
${guide.importantFacts.map(f => `- ${f}`).join('\n')}

## Definitions
${guide.definitions.map(d => `- **${d.term}**: ${d.definition}`).join('\n')}

## Main Ideas
${guide.mainIdeas.map(m => `- **${m.idea}**: ${m.detail}`).join('\n')}

## Key Things to Remember
${guide.keyThingsToRemember.map(k => `- ${k}`).join('\n')}

## Review Questions
${guide.reviewQuestions.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.answer}`).join('\n\n')}
`;

    navigator.clipboard.writeText(markdownText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200/90 w-full max-w-4xl h-[90vh] max-h-[850px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 text-[#D92B8A] rounded-2xl border border-pink-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base sm:text-lg text-stone-900">
                  Revision Study Guide
                </span>
                <span className="px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] font-mono text-xs font-bold uppercase rounded-full border border-pink-200">
                  Curriculum
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-stone-500 truncate max-w-md mt-0.5">
                {studySet.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {guide && (
              <>
                <button
                  onClick={handleSaveToNotes}
                  className={`px-3.5 py-1.5 font-display text-xs font-bold uppercase rounded-full border flex items-center gap-1.5 transition-all shadow-xs ${
                    isSaved ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-pink-50 text-stone-800 border-stone-200'
                  }`}
                  title="Save study guide to your persistent notes"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-[#D92B8A]" />}
                  <span className="hidden sm:inline">{isSaved ? 'Saved to Notes' : 'Save to Notes'}</span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 font-display text-xs font-bold uppercase rounded-full border border-stone-200 flex items-center gap-1.5 transition-all shadow-xs"
                  title="Copy formatted markdown text"
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

        {/* Feedback Alert if saved */}
        {saveMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-mono font-bold text-emerald-800 flex items-center justify-between animate-fadeIn">
            <span>✓ {saveMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-8 bg-stone-50/40">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[#D92B8A] animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display font-black text-xl text-stone-900">
                  Working on it…
                </h3>
                <p className="font-mono text-xs text-stone-500">
                  Preparing key concepts, definitions, main ideas, and review questions...
                </p>
              </div>
            </div>
          ) : guide ? (
            <div className="space-y-8 max-w-3xl mx-auto">
              
              {/* 1. Overview */}
              <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <span className="px-3 py-1 bg-stone-900 text-white font-mono text-xs font-bold uppercase rounded-full">
                    {guide.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
                    Executive Overview
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl text-stone-900">
                  {guide.setTitle}
                </h2>
                <p className="text-base text-stone-700 leading-relaxed font-normal">
                  {guide.overview}
                </p>
              </section>

              {/* 2. Key Concepts */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D92B8A]" />
                  <h3 className="font-display font-bold text-xl text-stone-900">
                    1. Key Concepts & Mechanisms ({guide.keyConcepts.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {guide.keyConcepts.map((concept, idx) => (
                    <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs bg-pink-50 border border-pink-200 rounded-full px-2.5 py-0.5 text-[#D92B8A]">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h4 className="font-display font-bold text-base text-stone-900">
                          {concept.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#D92B8A]">{concept.summary}</p>
                      <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-1 whitespace-pre-line font-normal">
                        {concept.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Important Facts */}
              {guide.importantFacts && guide.importantFacts.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display font-bold text-xl text-stone-900 flex items-center gap-2">
                    <span className="text-[#D92B8A]">💡</span>
                    <span>2. Important Facts & Data Points ({guide.importantFacts.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {guide.importantFacts.map((fact, idx) => (
                      <div key={idx} className="p-4 bg-white border border-stone-200 rounded-2xl text-sm text-stone-800 leading-relaxed shadow-xs flex items-start gap-2.5">
                        <span className="font-mono font-bold text-[#D92B8A] mt-0.5">•</span>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Definitions */}
              {guide.definitions && guide.definitions.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display font-bold text-xl text-stone-900 flex items-center gap-2">
                    <span className="text-[#D92B8A]">📖</span>
                    <span>3. Definitions & Key Terminology ({guide.definitions.length})</span>
                  </h3>
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs divide-y divide-stone-100">
                    {guide.definitions.map((def, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                        <span className="font-mono font-bold text-sm text-stone-900 block">
                          {def.term}
                        </span>
                        <p className="text-sm text-stone-700 leading-relaxed font-normal">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. Main Ideas */}
              {guide.mainIdeas && guide.mainIdeas.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display font-bold text-xl text-stone-900 flex items-center gap-2">
                    <span className="text-[#D92B8A]">⚡</span>
                    <span>4. Main Ideas & Conceptual Pillars</span>
                  </h3>
                  <div className="space-y-3">
                    {guide.mainIdeas.map((idea, idx) => (
                      <div key={idx} className="p-5 bg-stone-50 border border-stone-200 rounded-2xl shadow-xs space-y-1.5">
                        <span className="font-display font-bold text-sm text-stone-900 block">
                          {idea.idea}
                        </span>
                        <p className="text-sm text-stone-700 leading-relaxed font-normal">
                          {idea.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Key Things to Remember */}
              {guide.keyThingsToRemember && guide.keyThingsToRemember.length > 0 && (
                <section className="bg-pink-50/70 border border-pink-200 rounded-3xl p-6 sm:p-8 space-y-3">
                  <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#D92B8A] flex items-center gap-2">
                    <span>🎯 Key Things to Remember (Retention Anchors)</span>
                  </h3>
                  <div className="space-y-2">
                    {guide.keyThingsToRemember.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-stone-900 font-medium">
                        <span className="text-[#D92B8A] font-mono font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. Review Questions */}
              {guide.reviewQuestions && guide.reviewQuestions.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl text-stone-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#D92B8A]" />
                      <span>5. Revision Self-Check Questions ({guide.reviewQuestions.length})</span>
                    </h3>
                    <span className="font-mono text-xs text-stone-500">Click to reveal answer</span>
                  </div>

                  <div className="space-y-2.5">
                    {guide.reviewQuestions.map((q, idx) => {
                      const isExpanded = expandedQuestionIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedQuestionIdx(prev => (prev === idx ? null : idx))}
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-start gap-3 pr-2">
                              <span className="font-mono font-bold text-xs text-[#D92B8A] shrink-0 mt-0.5">
                                Q{idx + 1}.
                              </span>
                              <span className="font-display font-bold text-sm sm:text-base text-stone-900">
                                {q.question}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-600 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-600 shrink-0" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 text-sm space-y-2 animate-fadeIn">
                              <div className="space-y-1">
                                <span className="font-mono text-xs font-bold text-emerald-800 uppercase block">
                                  Model Answer:
                                </span>
                                <p className="text-stone-800 leading-relaxed font-normal text-sm sm:text-base">
                                  {q.answer}
                                </p>
                              </div>
                              {q.hint && (
                                <div className="pt-2 border-t border-stone-200 text-xs sm:text-sm text-stone-600 font-mono">
                                  💡 <strong>Hint</strong>: {q.hint}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={generateGuide}
                  className="px-5 py-2.5 bg-white border border-stone-200 rounded-full font-display text-xs font-bold uppercase hover:bg-stone-50 flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#D92B8A]" />
                  <span>Re-generate Guide</span>
                </button>

                <button
                  onClick={handleSaveToNotes}
                  className="px-7 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'Saved to Your Notes' : 'Save Guide to Notes'}</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
