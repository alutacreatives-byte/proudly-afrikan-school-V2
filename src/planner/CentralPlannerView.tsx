import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  RotateCcw,
  Check,
  AlertCircle,
  Zap,
  ArrowRight,
  CalendarDays,
  BookmarkCheck,
  RefreshCw
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';
import { getRecentQuizzes } from '../quiz/utils/quizShare';

export type LearningGoal = 
  | 'Learn a New Topic' 
  | 'Exam Preparation' 
  | 'Improve Weak Areas' 
  | 'Rapid Spaced Repetition';

export type StudyDurationOption = {
  label: string;
  minutes: 10 | 30 | 60;
  desc: string;
};

export const STUDY_DURATION_OPTIONS: StudyDurationOption[] = [
  { label: 'Quick Sprint', minutes: 10, desc: '10 min rapid focus' },
  { label: 'Standard Session', minutes: 30, desc: '30 min core study' },
  { label: 'Deep Mastery', minutes: 60, desc: '1 hour comprehensive review' },
];

export const LEARNING_GOALS: LearningGoal[] = [
  'Learn a New Topic',
  'Exam Preparation',
  'Improve Weak Areas',
  'Rapid Spaced Repetition',
];

export interface PlannedBlock {
  id: string;
  subject: string;
  topic: string;
  goal: LearningGoal;
  timing: string; // 'Today / Now', 'Tomorrow', or YYYY-MM-DD
  durationMinutes: 10 | 30 | 60;
  mode: 'study' | 'flashcards' | 'quiz' | 'practice';
  isCompleted: boolean;
  linkedSetId?: string;
  linkedQuizId?: string;
  createdAt: string;
}

interface CentralPlannerViewProps {
  onStartStudySet: (set: StudySet, mode?: 'study' | 'flashcards' | 'practice') => void;
  onStartQuiz: (quiz: Quiz) => void;
  onExploreSets: () => void;
}

export const CentralPlannerView: React.FC<CentralPlannerViewProps> = ({
  onStartStudySet,
  onStartQuiz,
  onExploreSets,
}) => {
  // Storage for user study sessions (no hardcoded fake sessions or fake streaks)
  const [schedule, setSchedule] = useState<PlannedBlock[]>(() => {
    try {
      const raw = localStorage.getItem('proudly_afrikan_learning_planner_v3');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Active View Tab: PLAN | STUDY | TRACK | REVIEW
  const [activeTab, setActiveTab] = useState<'plan' | 'study' | 'track' | 'review'>('plan');

  // PLAN state
  const [planSubject, setPlanSubject] = useState<string>('African History');
  const [planTopic, setPlanTopic] = useState<string>('');
  const [planGoal, setPlanGoal] = useState<LearningGoal>('Learn a New Topic');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');

  // SCHEDULE state
  const [scheduleTiming, setScheduleTiming] = useState<string>('Today / Now');
  const [customDate, setCustomDate] = useState<string>('');
  const [scheduleDuration, setScheduleDuration] = useState<10 | 30 | 60>(30);
  const [scheduleMode, setScheduleMode] = useState<'study' | 'flashcards' | 'quiz' | 'practice'>('study');

  // Reschedule Modal State
  const [rescheduleBlock, setRescheduleBlock] = useState<PlannedBlock | null>(null);
  const [newTimingInput, setNewTimingInput] = useState<string>('Tomorrow');

  useEffect(() => {
    try {
      setStudySets(StorageService.getAllStudySets());
      setQuizzes(getRecentQuizzes());
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('proudly_afrikan_learning_planner_v3', JSON.stringify(schedule));
    } catch (e) {}
  }, [schedule]);

  // Handle building and scheduling the plan
  const handleCreatePlanAndSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTopic.trim()) return;

    const newBlock: PlannedBlock = {
      id: `plan-${Date.now()}`,
      subject: planSubject,
      topic: planTopic.trim(),
      goal: planGoal,
      timing: scheduleTiming === 'Custom Date' && customDate ? customDate : scheduleTiming,
      durationMinutes: scheduleDuration,
      mode: scheduleMode,
      isCompleted: false,
      linkedSetId: selectedSetId || undefined,
      linkedQuizId: selectedQuizId || undefined,
      createdAt: new Date().toISOString(),
    };

    setSchedule((prev) => [newBlock, ...prev]);
    // Switch to TRACK view to see upcoming sessions
    setActiveTab('track');
    setPlanTopic('');
  };

  // Toggle completion status (TRACK requirement)
  const handleToggleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isCompleted: !b.isCompleted } : b))
    );
  };

  // Launch STUDY session (STUDY requirement: take learner directly to relevant existing Study Set, Flashcards, Practice or Quiz)
  const handleLaunchSession = (block: PlannedBlock) => {
    if (block.linkedQuizId || block.mode === 'quiz') {
      const q = quizzes.find((quiz) => quiz.id === block.linkedQuizId) || quizzes[0];
      if (q) {
        onStartQuiz(q);
        return;
      }
    }

    const set = studySets.find((s) => s.id === block.linkedSetId) || studySets[0];
    if (set) {
      const mode = block.mode === 'quiz' ? 'study' : block.mode;
      onStartStudySet(set, mode);
    } else {
      // If no linked set, prompt user to explore or pick set
      onExploreSets();
    }
  };

  // Reschedule missed / unfinished session (REVIEW requirement)
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBlock) return;

    setSchedule((prev) =>
      prev.map((b) => (b.id === rescheduleBlock.id ? { ...b, timing: newTimingInput } : b))
    );
    setRescheduleBlock(null);
  };

  // Computed lists for TRACK and REVIEW
  const upcomingSessions = schedule.filter((b) => !b.isCompleted);
  const completedSessions = schedule.filter((b) => b.isCompleted);
  // Unfinished / Missed (e.g. scheduled for past dates or Today/Tomorrow not completed)
  const unfinishedSessions = schedule.filter((b) => !b.isCompleted);

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Hero */}
        <div className="bg-[#FDFBF7] border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#D92B8A]">
              <Zap className="w-3.5 h-3.5 fill-[#D92B8A]/20" />
              <span>LEARNING PLANNER & WORKFLOW</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#161616] uppercase">
              PLAN → STUDY → TRACK → REVIEW
            </h1>
            <p className="text-stone-700 text-xs sm:text-[13px] max-w-2xl font-normal leading-relaxed">
              Design structured learning sessions using your existing Study Sets, Flashcards, Practice, and Quizzes. No duplicate content, just pure focused progression.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-5 py-3 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-[#161616] text-white shadow-md'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              + Create New Plan
            </button>
          </div>
        </div>

        {/* Workflow Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-[#EAE3D6] p-2 rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-[#D92B8A] text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>PLAN</span>
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'study'
                ? 'bg-[#D92B8A] text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>STUDY</span>
            {upcomingSessions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-[#D92B8A] rounded-full text-[10px] font-black">
                {upcomingSessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-[#D92B8A] text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>TRACK</span>
            {upcomingSessions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-[#D92B8A] rounded-full text-[10px] font-black">
                {upcomingSessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-[#D92B8A] text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
            <span>REVIEW</span>
            {unfinishedSessions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
                {unfinishedSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* MAIN CONTENT AREA ACCORDING TO TABS */}

        {activeTab === 'plan' && (
          <form onSubmit={handleCreatePlanAndSchedule} className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-8 animate-in fade-in">
            
            {/* STEP 1: PLAN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <span className="w-6 h-6 rounded-full bg-[#161616] text-white flex items-center justify-center font-mono text-xs font-bold">1</span>
                <h2 className="font-display font-black text-lg uppercase text-[#161616]">
                  PLAN: Subject, Topic & Learning Goal
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Subject Domain
                  </label>
                  <select
                    value={planSubject}
                    onChange={(e) => setPlanSubject(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-4 py-3 text-sm font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="African History">African History</option>
                    <option value="African Languages">African Languages</option>
                    <option value="Geography">Geography</option>
                    <option value="STEM & Sciences">STEM & Sciences</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Business & Trade">Business & Trade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Specific Topic / Focus
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swahili Noun Classes & Agreement"
                    value={planTopic}
                    onChange={(e) => setPlanTopic(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-4 py-3 text-sm font-mono text-[#161616] focus:outline-none"
                  />
                </div>
              </div>

              {/* Learning Goal Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-2">
                  Choose Learning Goal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPlanGoal(goal)}
                      className={`p-4 rounded-2xl border-2 text-left font-mono transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        planGoal === goal
                          ? 'bg-[#1A0B14] text-white border-[#D92B8A] shadow-sm'
                          : 'bg-[#FAF7F0] text-stone-800 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Target className={`w-4 h-4 ${planGoal === goal ? 'text-[#D92B8A]' : 'text-stone-500'}`} />
                        {planGoal === goal && <Check className="w-4 h-4 text-[#D92B8A]" />}
                      </div>
                      <span className="text-xs font-bold uppercase">{goal}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Existing Content (No duplicate content rule) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Link Existing Study Set / Flashcards
                  </label>
                  <select
                    value={selectedSetId}
                    onChange={(e) => {
                      setSelectedSetId(e.target.value);
                      if (e.target.value) {
                        const s = studySets.find(st => st.id === e.target.value);
                        if (s) {
                          setPlanTopic(s.title);
                          setPlanSubject(s.category || planSubject);
                        }
                      }
                    }}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- None (General Topic) --</option>
                    {studySets.map((set) => (
                      <option key={set.id} value={set.id}>
                        📚 {set.title} ({set.concepts.length} concepts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Link Existing Quiz
                  </label>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => {
                      setSelectedQuizId(e.target.value);
                      if (e.target.value) {
                        const q = quizzes.find(qz => qz.id === e.target.value);
                        if (q) {
                          setPlanTopic(q.title);
                          setScheduleMode('quiz');
                        }
                      }
                    }}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- None (Standard Study) --</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        🎯 {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2: SCHEDULE */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <span className="w-6 h-6 rounded-full bg-[#161616] text-white flex items-center justify-center font-mono text-xs font-bold">2</span>
                <h2 className="font-display font-black text-lg uppercase text-[#161616]">
                  SCHEDULE: Timing & Duration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    When to Study
                  </label>
                  <select
                    value={scheduleTiming}
                    onChange={(e) => setScheduleTiming(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="Today / Now">Today / Now</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Custom Date">Choose Custom Date...</option>
                  </select>
                  {scheduleTiming === 'Custom Date' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="mt-2 w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono text-[#161616]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Study Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STUDY_DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.minutes}
                        type="button"
                        onClick={() => setScheduleDuration(opt.minutes)}
                        className={`py-2 px-2 rounded-xl border-2 font-mono text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          scheduleDuration === opt.minutes
                            ? 'bg-[#1A0B14] text-white border-[#D92B8A]'
                            : 'bg-[#FAF7F0] text-stone-800 border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        <span className="text-xs font-black">{opt.minutes}m</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">{opt.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Learning Mode
                  </label>
                  <select
                    value={scheduleMode}
                    onChange={(e) => setScheduleMode(e.target.value as any)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="study">Deep Study Hub</option>
                    <option value="flashcards">Tactile Flashcards</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="practice">Scenario Practice</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white font-display text-sm font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(217,43,138,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save Plan & Add to Schedule</span>
                </button>
              </div>
            </div>

          </form>
        )}

        {/* STUDY VIEW (Step 2) */}
        {activeTab === 'study' && (
          <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D92B8A] uppercase">
                  <span>STEP 2: STUDY</span>
                </div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#161616]">
                  Launch Your Study Sessions
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-stone-600 uppercase bg-stone-100 px-3 py-1.5 rounded-full">
                  {upcomingSessions.length} READY TO STUDY
                </span>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="px-4 py-2 bg-[#161616] text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  + New Plan
                </button>
              </div>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-[#FCE8F3] rounded-full flex items-center justify-center mx-auto text-[#D92B8A]">
                  <Play className="w-8 h-8 fill-[#D92B8A]" />
                </div>
                <h3 className="font-display font-black text-lg text-stone-800 uppercase">No Active Sessions Scheduled</h3>
                <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
                  Create a learning plan in the PLAN tab to schedule sessions, or jump directly into any of your study resources.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="px-6 py-3 bg-[#D92B8A] text-white font-mono font-bold text-xs uppercase rounded-xl cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                  >
                    Go to Plan
                  </button>
                  <button
                    onClick={onExploreSets}
                    className="px-6 py-3 bg-white border border-stone-300 text-stone-700 font-mono font-bold text-xs uppercase rounded-xl cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    Explore Study Sets
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Next Up Hero Card */}
                {upcomingSessions[0] && (
                  <div className="bg-gradient-to-r from-[#1A0B14] to-[#2B0E20] text-white rounded-[24px] p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#D92B8A]/30">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#D92B8A] text-white">
                          NEXT UP
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300">
                          🕒 {upcomingSessions[0].timing}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase text-stone-300">
                          ⏱️ {upcomingSessions[0].durationMinutes} MINS
                        </span>
                      </div>
                      <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                        {upcomingSessions[0].topic}
                      </h3>
                      <p className="text-xs font-mono text-stone-300">
                        Subject: {upcomingSessions[0].subject} • Goal: {upcomingSessions[0].goal} • Mode: {upcomingSessions[0].mode.toUpperCase()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLaunchSession(upcomingSessions[0])}
                      className="px-8 py-4 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(217,43,138,0.6)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Studying Now</span>
                    </button>
                  </div>
                )}

                {/* All Upcoming Sessions List */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600">
                    All Scheduled Study Blocks ({upcomingSessions.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {upcomingSessions.map((block) => (
                      <div
                        key={block.id}
                        className="bg-[#FDFBF7] border border-[#EAE3D6] rounded-[20px] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#EFEBE4] text-stone-700">
                              🕒 {block.timing}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FCE8F3] text-[#D92B8A]">
                              {block.subject}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                              ⏱️ {block.durationMinutes}m
                            </span>
                          </div>
                          <h5 className="font-display font-black text-base uppercase text-[#161616] line-clamp-1">
                            {block.topic}
                          </h5>
                          <p className="text-[11px] font-mono text-stone-500 line-clamp-1">
                            {block.goal}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                            Mode: {block.mode}
                          </span>
                          <button
                            onClick={() => handleLaunchSession(block)}
                            className="px-4 py-1.5 rounded-full bg-[#161616] text-white font-mono font-bold text-xs uppercase hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Launch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Study Resources Row */}
                {(studySets.length > 0 || quizzes.length > 0) && (
                  <div className="pt-6 border-t border-stone-200 space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600">
                      Or Launch Directly from Your Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {studySets.slice(0, 3).map((set) => (
                        <div
                          key={set.id}
                          className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#D92B8A] uppercase">
                              📚 Study Set
                            </span>
                            <div className="font-display font-bold text-xs uppercase text-[#161616] line-clamp-1">
                              {set.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => onStartStudySet(set, 'study')}
                              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[10px] font-mono font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
                            >
                              Hub
                            </button>
                            <button
                              onClick={() => onStartStudySet(set, 'flashcards')}
                              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[10px] font-mono font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
                            >
                              Cards
                            </button>
                            <button
                              onClick={() => onStartStudySet(set, 'practice')}
                              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[10px] font-mono font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
                            >
                              Practice
                            </button>
                          </div>
                        </div>
                      ))}

                      {quizzes.slice(0, 3).map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#D92B8A] uppercase">
                              🎯 Quiz
                            </span>
                            <div className="font-display font-bold text-xs uppercase text-[#161616] line-clamp-1">
                              {quiz.title}
                            </div>
                          </div>
                          <div className="pt-1">
                            <button
                              onClick={() => onStartQuiz(quiz)}
                              className="w-full px-2.5 py-1 bg-[#161616] text-white rounded-lg text-[10px] font-mono font-bold uppercase hover:bg-stone-800 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Take Quiz</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRACK VIEW (Step 3) */}
        {activeTab === 'track' && (
          <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D92B8A] uppercase">
                  <span>STEP 3: TRACK PROGRESS</span>
                </div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#161616]">
                  Your Upcoming Study Sessions
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-stone-600 uppercase bg-stone-100 px-3 py-1.5 rounded-full">
                  {completedSessions.length} COMPLETED / {schedule.length} TOTAL
                </span>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="px-4 py-2 bg-[#161616] text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  + New Plan
                </button>
              </div>
            </div>

            {schedule.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <h3 className="font-display font-black text-lg text-stone-800 uppercase">No Study Sessions Planned Yet</h3>
                <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
                  Start by creating a learning plan in the PLAN tab to schedule your study blocks and track mastery.
                </p>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="px-6 py-3 bg-[#D92B8A] text-white font-mono font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  Go to Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {schedule.map((block) => (
                  <div
                    key={block.id}
                    className={`rounded-[24px] p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                      block.isCompleted
                        ? 'bg-stone-50 border-stone-200 opacity-70'
                        : 'bg-[#FDFBF7] border-[#EAE3D6] shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox to mark completed */}
                      <button
                        onClick={() => handleToggleComplete(block.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          block.isCompleted
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'border-stone-400 bg-white hover:border-stone-600'
                        }`}
                        title={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {block.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EFEBE4] text-stone-700">
                            🕒 {block.timing}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FCE8F3] text-[#D92B8A]">
                            {block.subject}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            🎯 {block.goal}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                            ⏱️ {block.durationMinutes} MINS
                          </span>
                        </div>

                        <h4 className={`font-display font-black text-lg uppercase tracking-tight ${block.isCompleted ? 'line-through text-stone-400' : 'text-[#161616]'}`}>
                          {block.topic}
                        </h4>
                      </div>
                    </div>

                    {/* STUDY ACTION BUTTON */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleLaunchSession(block)}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_18px_rgba(217,43,138,0.5)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>STUDY ({block.mode.toUpperCase()})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW VIEW (Step 4) */}
        {activeTab === 'review' && (
          <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D92B8A] uppercase">
                  <span>STEP 4: REVIEW & RESCHEDULE</span>
                </div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#161616]">
                  Missed or Unfinished Sessions
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 uppercase bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-full">
                {unfinishedSessions.length} UNFINISHED SESSIONS
              </span>
            </div>

            {unfinishedSessions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <BookmarkCheck className="w-8 h-8" />
                </div>
                <h3 className="font-display font-black text-lg text-stone-800 uppercase">All Study Sessions Completed!</h3>
                <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
                  You have no missed or unfinished study sessions. Excellent dedication!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-mono text-stone-600">
                  Review your unfinished study targets below. You can immediately launch into them or reschedule them for a future date.
                </p>

                {unfinishedSessions.map((block) => (
                  <div
                    key={block.id}
                    className="bg-[#FAF7F0] border border-stone-300 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Scheduled: {block.timing}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FCE8F3] text-[#D92B8A]">
                          {block.subject}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-lg uppercase text-[#161616]">
                        {block.topic}
                      </h4>
                      <p className="text-xs font-mono text-stone-500">
                        Goal: {block.goal} • Duration: {block.durationMinutes} mins
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setRescheduleBlock(block)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-stone-400 text-stone-800 font-mono font-bold text-xs uppercase hover:bg-stone-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => handleLaunchSession(block)}
                        className="px-5 py-2.5 rounded-full bg-[#161616] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Study Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Reschedule Modal */}
      {rescheduleBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#EAE3D6] rounded-[32px] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-display font-black text-base uppercase text-[#161616]">
                Reschedule Session
              </h3>
              <button
                onClick={() => setRescheduleBlock(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center font-mono font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Session Topic
                </label>
                <div className="font-display font-bold text-sm text-[#161616]">
                  {rescheduleBlock.topic}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  New Timing / Date
                </label>
                <select
                  value={newTimingInput}
                  onChange={(e) => setNewTimingInput(e.target.value)}
                  className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                >
                  <option value="Today / Now">Today / Now</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Next Week">Next Week</option>
                  <option value="Custom Date">Choose Custom Date</option>
                </select>
                {newTimingInput === 'Custom Date' && (
                  <input
                    type="date"
                    onChange={(e) => setNewTimingInput(e.target.value)}
                    className="mt-2 w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono text-[#161616]"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBlock(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#161616] text-white text-xs font-display font-black uppercase cursor-pointer"
                >
                  Save New Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
