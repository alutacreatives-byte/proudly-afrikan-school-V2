import React, { useState, useEffect } from 'react';
import { 
  StudySet, 
  Flashcard, 
  AppTab 
} from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Volume2, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Share2, 
  Layers, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  GraduationCap,
  Play,
  Clock,
  Shuffle
} from 'lucide-react';
import { exportSetToPDF, exportSetToPPTX } from '../utils/exportUtils';

interface StudyViewProps {
  sets: StudySet[];
  activeSet: StudySet;
  onSelectSet: (set: StudySet) => void;
  onNavigateTab: (tab: AppTab) => void;
  onUpdateSet: (set: StudySet) => void;
  onAddSet: (newSet: StudySet) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  sets,
  activeSet,
  onSelectSet,
  onNavigateTab,
  onUpdateSet,
  onAddSet,
}) => {
  const [studyMode, setStudyMode] = useState<'flashcards' | 'guide' | 'ai-analyzer'>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCards, setActiveCards] = useState<Flashcard[]>(activeSet.cards || []);
  const [speaking, setSpeaking] = useState(false);

  // AI Analyzer State
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Pan-African Science & History');
  const [aiGrade, setAiGrade] = useState<'Primary' | 'Secondary' | 'Undergraduate' | 'Professional'>('Secondary');
  const [aiNotes, setAiNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Sync active cards when set changes
  useEffect(() => {
    setActiveCards(activeSet.cards || []);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [activeSet.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (studyMode !== 'flashcards') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studyMode, currentCardIndex, activeCards.length]);

  const currentCard = activeCards[currentCardIndex];

  const handleNext = () => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeCards.length);
  };

  const handlePrev = () => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...activeCards].sort(() => Math.random() - 0.5);
    setActiveCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleToggleMastery = () => {
    if (!currentCard) return;
    const updatedCards = activeCards.map((c, i) => 
      i === currentCardIndex ? { ...c, mastered: !c.mastered } : c
    );
    setActiveCards(updatedCards);
    onUpdateSet({
      ...activeSet,
      cards: updatedCards
    });
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Generate with Gemini AI
  const handleGenerateStudyKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() && !aiNotes.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          subject: aiSubject,
          gradeLevel: aiGrade,
          notesText: aiNotes,
          cardCount: 8,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate study kit');
      }

      const newSet: StudySet = {
        id: `set-gen-${Date.now()}`,
        title: data.guide.title || aiTopic,
        description: data.guide.summary || `AI-generated study kit for ${aiTopic}`,
        subject: data.guide.subject || aiSubject,
        gradeLevel: data.guide.gradeLevel || aiGrade,
        tags: [aiSubject, 'AI Generated', 'Proudly Afrikan'],
        cards: data.guide.cards || [],
        sections: data.guide.sections || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'You (Proudly Afrikan AI)',
        favorite: true,
      };

      onAddSet(newSet);
      onSelectSet(newSet);
      setStudyMode('flashcards');
      setAiTopic('');
      setAiNotes('');
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Error communicating with AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Study Kit Selector */}
      <div className="bg-white rounded-2xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D92B8A]/10 text-[#D92B8A] uppercase tracking-wider font-mono-code">
              {activeSet.subject}
            </span>
            <span className="text-xs text-[#786E5E]">• {activeSet.gradeLevel} Level</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#161616]">
            {activeSet.title}
          </h1>
          <p className="text-sm text-[#5C5546] max-w-2xl">
            {activeSet.description}
          </p>
        </div>

        {/* Quick Actions: Switch Set, Quiz, Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-study-take-quiz"
            onClick={() => onNavigateTab('quiz')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Take Quiz</span>
          </button>

          <button
            id="btn-study-export-pdf"
            onClick={() => exportSetToPDF(activeSet)}
            title="Download printable study guide PDF"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#DFD5C2] hover:border-[#D92B8A] text-[#161616] font-semibold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>PDF Kit</span>
          </button>

          <button
            id="btn-study-export-pptx"
            onClick={() => exportSetToPPTX(activeSet)}
            title="Export to PowerPoint slides"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#DFD5C2] hover:border-[#E59500] text-[#161616] font-semibold text-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#E59500]" />
            <span>PPTX Slides</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2D8C6] pb-3">
        <div className="flex items-center gap-2">
          <button
            id="mode-flashcards"
            onClick={() => setStudyMode('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              studyMode === 'flashcards'
                ? 'bg-[#161616] text-white'
                : 'text-[#6F685B] hover:text-[#161616] hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Flashcards ({activeCards.length})</span>
          </button>

          <button
            id="mode-guide"
            onClick={() => setStudyMode('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              studyMode === 'guide'
                ? 'bg-[#161616] text-white'
                : 'text-[#6F685B] hover:text-[#161616] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Deep Study Guide</span>
          </button>

          <button
            id="mode-ai-analyzer"
            onClick={() => setStudyMode('ai-analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              studyMode === 'ai-analyzer'
                ? 'bg-[#161616] text-white'
                : 'text-[#D92B8A] bg-[#D92B8A]/10 hover:bg-[#D92B8A]/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D92B8A]" />
            <span>AI Notes & Topic Generator</span>
          </button>
        </div>

        {/* Set Switcher dropdown for quick selection */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#6F685B]">
          <span>Current Deck:</span>
          <select
            value={activeSet.id}
            onChange={(e) => {
              const selected = sets.find((s) => s.id === e.target.value);
              if (selected) onSelectSet(selected);
            }}
            className="bg-white border border-[#DFD5C2] rounded-lg px-2.5 py-1 text-xs text-[#161616] font-bold focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
          >
            {sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title.length > 30 ? s.title.slice(0, 30) + '...' : s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODE 1: FLASHCARDS */}
      {studyMode === 'flashcards' && (
        <div className="space-y-6">
          {activeCards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#DFD5C2] space-y-4">
              <Layers className="w-12 h-12 text-[#9E9584] mx-auto" />
              <h3 className="text-lg font-bold text-[#161616]">No flashcards found in this set</h3>
              <p className="text-sm text-[#6F685B]">Generate flashcards with AI or add them manually in the Build studio.</p>
              <button
                onClick={() => onNavigateTab('build')}
                className="px-4 py-2 rounded-xl bg-[#D92B8A] text-white font-bold text-sm"
              >
                Create Flashcards
              </button>
            </div>
          ) : (
            <>
              {/* Progress & Card Counter */}
              <div className="flex items-center justify-between text-xs text-[#6F685B] font-bold">
                <div className="flex items-center gap-3">
                  <span className="font-mono-code text-sm text-[#161616]">
                    CARD {currentCardIndex + 1} OF {activeCards.length}
                  </span>
                  {currentCard.mastered && (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DFD5C2] hover:border-[#161616] transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                  <span className="hidden md:inline text-[11px] text-[#9E9584]">
                    Space to flip • Left/Right to navigate
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#E7DECD] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-[#D92B8A] to-[#E59500] transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / activeCards.length) * 100}%` }}
                />
              </div>

              {/* Flashcard 3D Stage */}
              <div className="perspective-1000">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`cursor-pointer min-h-[360px] sm:min-h-[400px] w-full rounded-3xl border-2 transition-all duration-500 transform-style-3d relative flex flex-col justify-between p-8 sm:p-12 ${
                    isFlipped 
                      ? 'bg-[#161616] text-[#FAF7F0] border-[#333] shadow-xl' 
                      : 'bg-white text-[#161616] border-[#D92B8A]/30 hover:border-[#D92B8A] shadow-lg shadow-[#D92B8A]/5'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs uppercase tracking-widest font-mono-code font-bold px-3 py-1 rounded-full ${
                      isFlipped ? 'bg-white/10 text-[#E59500]' : 'bg-[#D92B8A]/10 text-[#D92B8A]'
                    }`}>
                      {isFlipped ? 'ANSWER / CONTEXT' : 'QUESTION / PROMPT'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(isFlipped ? currentCard.back : currentCard.front);
                        }}
                        title="Read aloud"
                        className={`p-2 rounded-xl transition-colors ${
                          isFlipped 
                            ? 'hover:bg-white/10 text-white' 
                            : 'hover:bg-[#FAF7F0] text-[#5C5546]'
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 ${speaking ? 'animate-bounce text-[#D92B8A]' : ''}`} />
                      </button>

                      <div className="text-xs font-semibold opacity-60 flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Click to flip</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Card Content */}
                  <div className="my-auto py-6 text-center max-w-3xl mx-auto space-y-4">
                    {!isFlipped ? (
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold leading-snug tracking-tight">
                        {currentCard.front}
                      </h2>
                    ) : (
                      <div className="space-y-4 text-left">
                        <p className="text-lg sm:text-xl font-sans-body font-medium leading-relaxed text-[#F0EBE1]">
                          {currentCard.back}
                        </p>
                        {currentCard.africanContext && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                            <span className="text-xs font-bold text-[#E59500] uppercase tracking-wider font-mono-code flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4" /> African Historical & Modern Context:
                            </span>
                            <p className="text-xs text-[#DFD7C7] leading-relaxed">
                              {currentCard.africanContext}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Hint or Hint Trigger */}
                  <div className="flex items-center justify-between w-full pt-4 border-t border-current/10 text-xs">
                    <div>
                      {currentCard.hint && !isFlipped && (
                        <span className="text-xs text-[#827866] italic flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-[#E59500]" />
                          Hint: {currentCard.hint}
                        </span>
                      )}
                    </div>
                    <span className="font-mono-code text-[11px] opacity-50">
                      Card #{currentCardIndex + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  id="btn-card-prev"
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#DFD5C2] hover:border-[#161616] text-[#161616] font-bold text-sm shadow-xs transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    id="btn-card-mastered"
                    onClick={handleToggleMastery}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                      currentCard.mastered
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-[#5C5546] border-[#DFD5C2] hover:border-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentCard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#DFD5C2] hover:border-[#D92B8A] text-[#161616] transition-colors"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>

                <button
                  id="btn-card-next"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#161616] hover:bg-[#2A2A2A] text-white font-bold text-sm shadow-xs transition-all active:scale-95"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODE 2: DEEP STUDY GUIDE */}
      {studyMode === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E7DECD] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#161616]">
                  Curriculum Revision Guide
                </h2>
                <p className="text-xs text-[#6F685B]">
                  Structured syllabus breakdown, key themes, and mnemonics.
                </p>
              </div>
              <button
                onClick={() => exportSetToPDF(activeSet)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D92B8A] text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>
            </div>

            {/* Sections */}
            {activeSet.sections && activeSet.sections.length > 0 ? (
              <div className="space-y-6">
                {activeSet.sections.map((sec, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#E7DECD] space-y-3">
                    <h3 className="text-lg font-bold text-[#161616] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#E59500] text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {sec.title}
                    </h3>
                    <p className="text-sm text-[#4E4739] leading-relaxed font-medium">
                      {sec.summary}
                    </p>
                    
                    {/* Key points list */}
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                        Essential Takeaways:
                      </h4>
                      <ul className="space-y-1">
                        {sec.keyPoints.map((pt, pidx) => (
                          <li key={pidx} className="text-xs text-[#554E41] flex items-start gap-2">
                            <span className="text-[#D92B8A] font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {sec.africanConnection && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-900">
                        <span className="font-bold">African Heritage & Industry Context: </span>
                        {sec.africanConnection}
                      </div>
                    )}

                    {sec.mnemonic && (
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-mono-code">
                        <span className="font-bold">Mnemonic Memory Aid: </span>
                        {sec.mnemonic}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#6F685B]">
                No written sections available for this set yet. You can generate detailed study notes using the AI Analyzer tab.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: AI NOTES & TOPIC GENERATOR */}
      {studyMode === 'ai-analyzer' && (
        <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D92B8A]/10 text-[#D92B8A] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proudly Afrikan Gemini Intelligence</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-[#161616]">
              Instant Study Kit & Flashcard Generator
            </h2>
            <p className="text-sm text-[#6F685B] mt-1">
              Enter any African or global academic subject, or paste your lecture notes. Our AI engine builds ready-to-study flashcards, structured summaries, and mnemonics.
            </p>
          </div>

          {generationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {generationError}
            </div>
          )}

          <form onSubmit={handleGenerateStudyKit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                  Topic / Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. The Kingdom of Kush & Meroë Metallurgy"
                  className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                  Target Academic Level
                </label>
                <select
                  value={aiGrade}
                  onChange={(e: any) => setAiGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-medium"
                >
                  <option value="Primary">Primary School</option>
                  <option value="Secondary">Secondary / High School (WAEC/KCSE)</option>
                  <option value="Undergraduate">Undergraduate University</option>
                  <option value="Professional">Professional / Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code">
                Subject Area
              </label>
              <input
                type="text"
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                placeholder="e.g. African History, Renewable Energy, Economics, Agritech"
                className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#161616] uppercase tracking-wider font-mono-code flex items-center justify-between">
                <span>Paste Lecture Notes or Textbook Excerpt (Optional)</span>
                <span className="text-[11px] text-[#8C8372]">Max 15,000 characters</span>
              </label>
              <textarea
                rows={5}
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Paste course syllabus, notes, or research papers here to extract flashcards directly..."
                className="w-full px-4 py-3 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm font-mono-code text-xs"
              />
            </div>

            <button
              id="btn-submit-generate-study-kit"
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-[#D92B8A] hover:bg-[#C01F78] text-white font-bold text-base shadow-md shadow-[#D92B8A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Synthesizing African Curriculum Study Kit with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Study Kit & Flashcards</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
