import React, { useState } from 'react';
import { 
  StudySet, 
  Flashcard, 
  AppTab 
} from '../types';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Upload, 
  Download, 
  Save, 
  Layers, 
  FileUp, 
  Check, 
  RotateCw,
  Lightbulb,
  FileText
} from 'lucide-react';
import { exportSetToPDF, exportSetToPPTX } from '../utils/exportUtils';

interface BuildViewProps {
  onSaveSet: (newSet: StudySet) => void;
  onNavigateTab: (tab: AppTab) => void;
}

export const BuildView: React.FC<BuildViewProps> = ({
  onSaveSet,
  onNavigateTab,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Pan-African History');
  const [gradeLevel, setGradeLevel] = useState<'Primary' | 'Secondary' | 'Undergraduate' | 'Professional'>('Secondary');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['African Studies']);
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: 'card-init-1',
      front: '',
      back: '',
      hint: '',
      africanContext: ''
    }
  ]);

  // AI Prompt generator inside build
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddCard = () => {
    setCards([
      ...cards,
      {
        id: `card-build-${Date.now()}-${cards.length + 1}`,
        front: '',
        back: '',
        hint: '',
        africanContext: ''
      }
    ]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleUpdateCard = (index: number, field: keyof Flashcard, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // AI Card generator
  const handleAiGenerateCards = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);

    try {
      const res = await fetch('/api/build/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          subject,
          count: 5,
        }),
      });
      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        const generated = data.cards.map((c: any, i: number) => ({
          ...c,
          id: `ai-card-${Date.now()}-${i}`
        }));
        setCards([...cards.filter(c => c.front.trim() !== ''), ...generated]);
        setAiPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle document file upload (PDF, DOCX, TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const res = await fetch('/api/build/parse-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64String,
            mimeType: file.type,
          }),
        });
        const data = await res.json();
        if (data.extractedText) {
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
          // Now auto-generate cards from extracted text
          const cardRes = await fetch('/api/build/generate-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.extractedText.slice(0, 4000),
              subject,
              count: 6,
            }),
          });
          const cardData = await cardRes.json();
          if (cardData.cards) {
            const gen = cardData.cards.map((c: any, idx: number) => ({
              ...c,
              id: `card-upload-${Date.now()}-${idx}`
            }));
            setCards(gen);
          }
        }
        setIsParsingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsParsingFile(false);
    }
  };

  // Save Set
  const handleSaveDeck = () => {
    if (!title.trim()) {
      alert('Please provide a title for your study set.');
      return;
    }

    const validCards = cards.filter(c => c.front.trim() !== '' && c.back.trim() !== '');
    if (validCards.length === 0) {
      alert('Please add at least one completed flashcard (question and answer).');
      return;
    }

    const newSet: StudySet = {
      id: `custom-set-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `Custom study set on ${title} with ${validCards.length} flashcards.`,
      subject,
      gradeLevel,
      tags,
      cards: validCards,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'You (Creator Studio)',
      favorite: false
    };

    onSaveSet(newSet);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onNavigateTab('mysets');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D8C6] pb-6">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E59500]/15 text-[#B26B00] uppercase tracking-widest font-mono-code">
            AUTHOR & CURRICULUM STUDIO
          </span>
          <h1 className="text-3xl font-display font-extrabold text-[#161616] mt-1">
            Build Study Set & Flashcards
          </h1>
          <p className="text-sm text-[#6F685B]">
            Craft revision sets manually or accelerate your authoring with document upload and Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-save-set-top"
            onClick={handleSaveDeck}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to My Sets!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish to My Sets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Set Metadata Details */}
      <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-[#161616] uppercase tracking-wider font-mono-code">
          1. Study Set Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#161616]">Set Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great Zimbabwe Architecture & Trade"
              className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#161616]">Subject Category</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. African History, Agritech, Economics"
              className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#161616]">Target Academic Level</label>
            <select
              value={gradeLevel}
              onChange={(e: any) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-semibold"
            >
              <option value="Primary">Primary School</option>
              <option value="Secondary">Secondary (WAEC, KCSE, Matric)</option>
              <option value="Undergraduate">Undergraduate University</option>
              <option value="Professional">Professional / Postgraduate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#161616]">Tags</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Type tag and press Add"
                className="grow px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 rounded-xl bg-[#161616] text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#DFD5C2] text-xs font-medium text-[#161616]"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#161616]">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of what this revision set covers..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm"
          />
        </div>
      </div>

      {/* AI Assistant & Document Parser Accelerators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Card Generator */}
        <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#D92B8A]">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-sm text-[#161616]">
              Auto-Generate Cards with Gemini
            </h3>
          </div>
          <p className="text-xs text-[#6F685B]">
            Describe a subtopic or question area. Gemini will generate 5 comprehensive flashcards with African context.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 5 questions on Songhai Empire administration"
              className="grow px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
            />
            <button
              onClick={handleAiGenerateCards}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="px-4 py-2 rounded-xl bg-[#D92B8A] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isAiGenerating ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Upload Document / Syllabus */}
        <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#028090]">
            <Upload className="w-5 h-5" />
            <h3 className="font-bold text-sm text-[#161616]">
              Import Document / Notes
            </h3>
          </div>
          <p className="text-xs text-[#6F685B]">
            Upload a Word document (.docx), Markdown (.md), or Text (.txt) file to auto-extract flashcards.
          </p>
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#DFD5C2] hover:border-[#028090] bg-[#FAF7F0] cursor-pointer text-xs font-bold text-[#5C5546] hover:text-[#028090] transition-colors">
            {isParsingFile ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-[#028090]" />
                <span>Extracting Knowledge from Document...</span>
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 text-[#028090]" />
                <span>Choose .docx, .md, or .txt file</span>
              </>
            )}
            <input
              type="file"
              accept=".docx,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 2. FLASHCARDS EDITOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#161616] uppercase tracking-wider font-mono-code flex items-center gap-2">
            <span>2. Flashcards Deck ({cards.length})</span>
          </h2>
          <button
            onClick={handleAddCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DFD5C2] hover:border-[#161616] text-xs font-bold text-[#161616] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#D92B8A]" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id || index}
              className="bg-white rounded-2xl border border-[#DFD5C2] p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#E7DECD] pb-2 text-xs font-bold text-[#6F685B]">
                <span className="font-mono-code text-[#161616]">CARD #{index + 1}</span>
                {cards.length > 1 && (
                  <button
                    onClick={() => handleRemoveCard(index)}
                    title="Delete card"
                    className="text-[#9E9584] hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#161616]">
                    Front (Question or Concept) *
                  </label>
                  <textarea
                    rows={3}
                    value={card.front}
                    onChange={(e) => handleUpdateCard(index, 'front', e.target.value)}
                    placeholder="e.g. What was the economic function of cowrie shells in West Africa?"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#161616]">
                    Back (Answer & Explanation) *
                  </label>
                  <textarea
                    rows={3}
                    value={card.back}
                    onChange={(e) => handleUpdateCard(index, 'back', e.target.value)}
                    placeholder="e.g. Cowries served as a durable, non-counterfeitable currency for trade across the Niger Basin..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#6F685B] flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-[#E59500]" /> Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={card.hint || ''}
                    onChange={(e) => handleUpdateCard(index, 'hint', e.target.value)}
                    placeholder="Memory prompt or clue"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DFD5C2] bg-[#FAF7F0] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#6F685B]">
                    African Historical or Modern Connection (Optional)
                  </label>
                  <input
                    type="text"
                    value={card.africanContext || ''}
                    onChange={(e) => handleUpdateCard(index, 'africanContext', e.target.value)}
                    placeholder="e.g. Used extensively in Yoruba and Kingdom of Benin commerce"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DFD5C2] bg-[#FAF7F0] text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddCard}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#DFD5C2] hover:border-[#D92B8A] text-sm font-bold text-[#5C5546] hover:text-[#D92B8A] bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Flashcard</span>
        </button>
      </div>

      {/* Save & Export Footer */}
      <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#6F685B]">
          {cards.filter(c => c.front.trim() !== '').length} completed cards ready to publish.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDeck}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish Study Set</span>
          </button>
        </div>
      </div>
    </div>
  );
};
