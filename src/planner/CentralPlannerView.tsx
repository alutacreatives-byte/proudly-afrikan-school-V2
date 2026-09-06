import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  RotateCcw,
  Check,
  Pause,
  AlertCircle,
  Zap,
  BarChart3,
  RefreshCw,
  Award,
  ArrowRight,
  FolderOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Clock3,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';
import { getRecentQuizzes } from '../quiz/utils/quizShare';

export type PlannerFlowStep = 'PLAN' | 'SCHEDULE' | 'STUDY' | 'TRACK' | 'REVIEW';

export type LearningGoal = 
  | 'Learn a New Topic'
  | 'Exam Preparation'
  | 'Improve Weak Areas'
  | 'Rapid Spaced Repetition';

export interface PlannedBlock {
  id: string;
  title: string;
  subject: string;
  learningGoal: LearningGoal;
  durationMinutes: number;
  scheduledDate: string; // 'Today' | 'Tomorrow' | 'Saturday' | 'Sunday' | YYYY-MM-DD
  scheduledTime: string; // '09:00 AM' | '11:30 AM' etc.
  mode: 'study' | 'flashcards' | 'quiz' | 'practice';
  isCompleted: boolean;
  completedAt?: string;
  isMissed?: boolean;
  linkedSetId?: string;
  linkedQuizId?: string;
  notes?: string;
  reviewStatus?: 'mastered' | 'reviewing' | 'needs-work';
}

const DEFAULT_SCHEDULE: PlannedBlock[] = [
  {
    id: 'block-1',
    title: 'Mansa Musa & Mali Empire Active Recall',
    subject: 'African History',
    learningGoal: 'Rapid Spaced Repetition',
    durationMinutes: 25,
    scheduledDate: 'Today',
    scheduledTime: '09:00 AM',
    mode: 'flashcards',
    isCompleted: false,
    reviewStatus: 'reviewing',
  },
  {
    id: 'block-2',
    title: 'Swahili Grammatical Structure & Pronouns',
    subject: 'African Languages',
    learningGoal: 'Learn a New Topic',
    durationMinutes: 15,
    scheduledDate: 'Today',
    scheduledTime: '11:30 AM',
    mode: 'study',
    isCompleted: false,
    reviewStatus: 'needs-work',
  },
  {
    id: 'block-3',
    title: 'Great Zimbabwe Architecture & Trade Routes',
    subject: 'African History',
    learningGoal: 'Exam Preparation',
    durationMinutes: 20,
    scheduledDate: 'Today',
    scheduledTime: '02:00 PM',
    mode: 'quiz',
    isCompleted: true,
    completedAt: 'Today at 02:22 PM',
    reviewStatus: 'mastered',
  },
  {
    id: 'block-4',
    title: 'African Geography & Major River Basins',
    subject: 'Geography',
    learningGoal: 'Improve Weak Areas',
    durationMinutes: 30,
    scheduledDate: 'Yesterday',
    scheduledTime: '04:30 PM',
    mode: 'practice',
    isCompleted: false,
    isMissed: true,
    reviewStatus: 'needs-work',
  },
  {
    id: 'block-5',
    title: 'Ancient Nubia & Kingdom of Kush Metallurgy',
    subject: 'African History',
    learningGoal: 'Learn a New Topic',
    durationMinutes: 45,
    scheduledDate: 'Tomorrow',
    scheduledTime: '10:00 AM',
    mode: 'study',
    isCompleted: false,
    reviewStatus: 'reviewing',
  },
];

const LEARNING_GOAL_CONFIGS: {
  goal: LearningGoal;
  subtitle: string;
  description: string;
  recommendedMode: 'study' | 'flashcards' | 'quiz' | 'practice';
  icon: any;
  accentColor: string;
  bgLight: string;
  borderColor: string;
}[] = [
  {
    goal: 'Learn a New Topic',
    subtitle: 'Comprehensive Conceptual Mastery',
    description: 'Build deep foundational understanding through progressive study guides, breakdowns, and structured notes.',
    recommendedMode: 'study',
    icon: BookOpen,
    accentColor: '#D92B8A',
    bgLight: 'bg-[#FAF4F8]',
    borderColor: 'border-[#F1CCE2]',
  },
  {
    goal: 'Exam Preparation',
    subtitle: 'Timed Tests & Simulator',
    description: 'Simulate high-stakes exam conditions with diagnostic multiple-choice questions, scoring, and explanations.',
    recommendedMode: 'quiz',
    icon: GraduationCap,
    accentColor: '#8B5CF6',
    bgLight: 'bg-[#F6F3FE]',
    borderColor: 'border-[#DDD4FA]',
  },
  {
    goal: 'Improve Weak Areas',
    subtitle: 'Targeted Mistake Remediation',
    description: 'Drill specifically on previously missed concepts, challenging problem sets, and tricky terminology.',
    recommendedMode: 'practice',
    icon: Target,
    accentColor: '#E63956',
    bgLight: 'bg-[#FDF2F4]',
    borderColor: 'border-[#FACDD6]',
  },
  {
    goal: 'Rapid Spaced Repetition',
    subtitle: 'High-Speed Active Recall',
    description: 'Fast-paced flashcard drills timed against the forgetting curve to cement facts into permanent memory.',
    recommendedMode: 'flashcards',
    icon: Zap,
    accentColor: '#F59E0B',
    bgLight: 'bg-[#FFFBEB]',
    borderColor: 'border-[#FDE68A]',
  },
];

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
  // Master Flow Step: PLAN -> SCHEDULE -> STUDY -> TRACK -> REVIEW
  const [currentStep, setCurrentStep] = useState<PlannerFlowStep>('PLAN');

  const [schedule, setSchedule] = useState<PlannedBlock[]>(() => {
    try {
      const raw = localStorage.getItem('proudly_afrikan_planner_schedule_v4');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_SCHEDULE;
  });

  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Step 1 PLAN Draft State
  const [planSubject, setPlanSubject] = useState<string>('African History');
  const [planTopic, setPlanTopic] = useState<string>('');
  const [planGoal, setPlanGoal] = useState<LearningGoal>('Learn a New Topic');
  const [planLinkedSetId, setPlanLinkedSetId] = useState<string>('');
  const [planLinkedQuizId, setPlanLinkedQuizId] = useState<string>('');

  // Step 2 SCHEDULE Draft State
  const [scheduleDate, setScheduleDate] = useState<string>('Today');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00 AM');
  const [scheduleDuration, setScheduleDuration] = useState<number>(25);
  const [scheduleMode, setScheduleMode] = useState<'study' | 'flashcards' | 'quiz' | 'practice'>('study');

  // Step 3 STUDY Focus Timer State
  const [activeSessionBlock, setActiveSessionBlock] = useState<PlannedBlock | null>(schedule[0] || null);
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Step 5 REVIEW Reschedule Modal/Inline State
  const [reschedulingBlock, setReschedulingBlock] = useState<PlannedBlock | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('Today');
  const [rescheduleTime, setRescheduleTime] = useState<string>('03:00 PM');
  const [rescheduleDuration, setRescheduleDuration] = useState<number>(25);

  useEffect(() => {
    try {
      setStudySets(StorageService.getAllStudySets());
      setQuizzes(getRecentQuizzes());
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('proudly_afrikan_planner_schedule_v4', JSON.stringify(schedule));
    } catch (e) {}
  }, [schedule]);

  // Sync recommended mode when learning goal changes
  useEffect(() => {
    const config = LEARNING_GOAL_CONFIGS.find(c => c.goal === planGoal);
    if (config) {
      setScheduleMode(config.recommendedMode);
    }
  }, [planGoal]);

  // Active Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            showToast('Study block time complete! Great focus session.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle complete in Track or Timetable
  const handleToggleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextCompleted = !b.isCompleted;
          return {
            ...b,
            isCompleted: nextCompleted,
            isMissed: false,
            completedAt: nextCompleted ? `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
          };
        }
        return b;
      })
    );
  };

  // Step 1 -> Step 2 Handshake
  const handleProceedToSchedule = () => {
    if (!planTopic.trim()) {
      showToast('Please enter a topic or select an existing study set.');
      return;
    }
    setCurrentStep('SCHEDULE');
    showToast(`Topic planned: "${planTopic}". Now choose date, time, and duration.`);
  };

  // Step 2 Confirm Schedule Slot
  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const topicToSave = planTopic.trim() || 'Core Curriculum Study Session';

    const newBlock: PlannedBlock = {
      id: `block-${Date.now()}`,
      title: topicToSave,
      subject: planSubject,
      learningGoal: planGoal,
      durationMinutes: scheduleDuration,
      scheduledDate: scheduleDate,
      scheduledTime: scheduleTime,
      mode: scheduleMode,
      isCompleted: false,
      linkedSetId: planLinkedSetId || undefined,
      linkedQuizId: planLinkedQuizId || undefined,
      reviewStatus: 'reviewing',
    };

    setSchedule((prev) => [newBlock, ...prev]);
    setActiveSessionBlock(newBlock);
    setTimerSecondsLeft(scheduleDuration * 60);
    setSelectedDuration(scheduleDuration);
    showToast(`Scheduled "${topicToSave}" for ${scheduleDate} at ${scheduleTime}.`);
    setCurrentStep('STUDY');
  };

  // Step 3 Launch Handlers
  const handleLaunchMode = (mode: 'study' | 'flashcards' | 'practice' | 'quiz') => {
    const block = activeSessionBlock;
    
    if (mode === 'quiz') {
      const q = quizzes.find((quiz) => quiz.id === block?.linkedQuizId) || quizzes[0];
      if (q) {
        onStartQuiz(q);
        return;
      }
    }

    const set = studySets.find((s) => s.id === block?.linkedSetId) || studySets[0];
    if (set) {
      onStartStudySet(set, mode === 'quiz' ? 'study' : mode);
    } else {
      showToast('No study set linked yet. Pick a set from the resources below.');
    }
  };

  const handleLaunchSpecificSet = (set: StudySet, mode: 'study' | 'flashcards' | 'practice') => {
    onStartStudySet(set, mode);
  };

  const handleLaunchSpecificQuiz = (quiz: Quiz) => {
    onStartQuiz(quiz);
  };

  // Step 5 Reschedule Action
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBlock) return;

    setSchedule((prev) =>
      prev.map((b) => {
        if (b.id === reschedulingBlock.id) {
          return {
            ...b,
            scheduledDate: rescheduleDate,
            scheduledTime: rescheduleTime,
            durationMinutes: rescheduleDuration,
            isCompleted: false,
            isMissed: false,
            reviewStatus: 'needs-work',
          };
        }
        return b;
      })
    );

    showToast(`Rescheduled "${reschedulingBlock.title}" for ${rescheduleDate} at ${rescheduleTime}!`);
    setReschedulingBlock(null);
  };

  // Metrics calculation
  const upcomingBlocks = schedule.filter((b) => !b.isCompleted && !b.isMissed);
  const completedBlocks = schedule.filter((b) => b.isCompleted);
  const missedOrUnfinishedBlocks = schedule.filter((b) => !b.isCompleted && (b.isMissed || b.scheduledDate === 'Yesterday'));
  const totalMinutesPlanned = schedule.reduce((sum, b) => sum + b.durationMinutes, 0);

  const stepsList: { key: PlannerFlowStep; label: string; number: string; desc: string }[] = [
    { key: 'PLAN', number: '01', label: 'PLAN', desc: 'Subject, topic & learning goal' },
    { key: 'SCHEDULE', number: '02', label: 'SCHEDULE', desc: 'Date, time & study duration' },
    { key: 'STUDY', number: '03', label: 'STUDY', desc: 'Launch sets, cards & quizzes' },
    { key: 'TRACK', number: '04', label: 'TRACK', desc: 'Upcoming sessions & completion' },
    { key: 'REVIEW', number: '05', label: 'REVIEW', desc: 'Missed sessions & reschedule' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] text-white px-5 py-3 rounded-2xl shadow-xl font-mono text-xs sm:text-sm font-bold border border-stone-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#E63956]" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Hero */}
        <section className="pt-2 pb-6 border-b border-stone-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-stone-300/80 rounded-full shadow-xs text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E63956] inline-block animate-pulse"></span>
                <span>PROUDLY AFRIKAN EDUCATION • LEARNING PLANNER</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-[#161616] leading-[0.95] break-words">
                PLAN. SCHEDULE.<br />
                <span className="text-[#E63956]">STUDY. TRACK. REVIEW.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-700 font-normal leading-relaxed max-w-2xl">
                The complete 5-stage learning flow: Plan your goals, timetable your sessions, launch active study sets and quizzes, track completions, and reschedule missed blocks.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-3 lg:pt-2">
              <div className="bg-white border border-[#EAE3D6] p-5 rounded-[24px] shadow-xs space-y-2">
                <div className="text-[11px] font-mono font-bold text-stone-500 uppercase">ACTIVE STREAK & PACE</div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-display font-black text-[#161616] flex items-center gap-2">
                    <span>7 DAYS</span>
                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {completedBlocks.length}/{schedule.length} DONE
                    </span>
                  </div>
                </div>
                <p className="text-xs font-mono text-stone-500 pt-1 border-t border-stone-100">
                  {totalMinutesPlanned} minutes planned across {schedule.length} sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive 5-Step Flow Navigator: PLAN → SCHEDULE → STUDY → TRACK → REVIEW */}
        <div className="bg-white border border-[#EAE3D6] rounded-[28px] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {stepsList.map((step, idx) => {
              const isActive = currentStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(step.key)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#161616] text-white shadow-md'
                      : 'bg-[#FAF7F0] hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isActive ? 'text-[#E63956]' : 'text-stone-400'}`}>
                      STEP {step.number}
                    </span>
                    {idx < stepsList.length - 1 && (
                      <span className="hidden sm:inline text-stone-400 text-xs font-mono">→</span>
                    )}
                  </div>
                  <div className={`font-display font-black text-base sm:text-lg uppercase tracking-tight ${isActive ? 'text-white' : 'text-[#161616]'}`}>
                    {step.label}
                  </div>
                  <div className={`text-xs sm:text-[13px] font-mono truncate mt-0.5 ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                    {step.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. STEP 1: PLAN VIEW */}
        {currentStep === 'PLAN' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>STEP 1 OF 5: PLAN</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase mt-1">
                    CHOOSE YOUR SUBJECT, TOPIC & LEARNING GOAL
                  </h2>
                  <p className="text-sm font-mono text-stone-500 mt-0.5">
                    Select one of the 4 proven learning goals to tailor your study methodology.
                  </p>
                </div>
              </div>

              {/* A. Choose Learning Goal (4 Required Goals) */}
              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                  Select Learning Goal *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {LEARNING_GOAL_CONFIGS.map((config) => {
                    const isSelected = planGoal === config.goal;
                    const Icon = config.icon;
                    return (
                      <div
                        key={config.goal}
                        onClick={() => setPlanGoal(config.goal)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#161616] bg-[#161616] text-white shadow-lg scale-[1.01]'
                            : `${config.borderColor} ${config.bgLight} text-stone-800 hover:border-stone-400`
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-white text-stone-900 border border-stone-200'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/20 text-stone-200' : 'bg-white text-stone-600'
                            }`}>
                              {config.recommendedMode.toUpperCase()} MODE
                            </span>
                          </div>

                          <h3 className="font-display font-black text-base uppercase leading-snug">
                            {config.goal}
                          </h3>
                          <p className={`text-xs font-mono leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                            {config.description}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold">
                          <span className={isSelected ? 'text-stone-300' : 'text-stone-500'}>
                            {config.subtitle}
                          </span>
                          <span className="text-sm">{isSelected ? '✓' : '→'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* B. Choose Subject & Topic */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-stone-100">
                <div className="lg:col-span-4 space-y-3">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                    Subject Field *
                  </label>
                  <select
                    value={planSubject}
                    onChange={(e) => setPlanSubject(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-stone-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-[#161616] focus:outline-none focus:border-[#D92B8A] cursor-pointer"
                  >
                    <option value="African History">African History</option>
                    <option value="African Languages">African Languages</option>
                    <option value="Geography">Continental Geography</option>
                    <option value="STEM & Sciences">STEM & Applied Sciences</option>
                    <option value="Literature & Arts">Literature & Oral Arts</option>
                    <option value="Economics & Trade">Economics & Trade</option>
                    <option value="General Studies">General Studies</option>
                  </select>

                  <div className="p-4 rounded-xl bg-[#FAF7F0] border border-stone-200 text-xs font-mono text-stone-600 space-y-1">
                    <span className="font-bold text-stone-900 block uppercase">Goal Guidance:</span>
                    <span>
                      {planGoal === 'Learn a New Topic' && 'Focus on reading core concepts, key definitions, and contextual summaries.'}
                      {planGoal === 'Exam Preparation' && 'Simulate exam conditions with time-limited questions and rigorous marking schemes.'}
                      {planGoal === 'Improve Weak Areas' && 'Isolate difficult topics and review them in short, concentrated 15-minute bursts.'}
                      {planGoal === 'Rapid Spaced Repetition' && 'Drill vocabulary and dates using active-recall flashcard flipping.'}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-3">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                    Topic Title or Specific Syllabus Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={planTopic}
                    onChange={(e) => setPlanTopic(e.target.value)}
                    placeholder="e.g. Mansa Musa Pilgrimage & Trans-Saharan Trade Routes"
                    className="w-full bg-[#FAF7F0] border-2 border-stone-300 rounded-xl px-4 py-3 text-sm font-mono text-[#161616] focus:outline-none focus:border-[#D92B8A]"
                  />

                  {/* Quick-Pick From Existing Study Sets */}
                  <div className="pt-2">
                    <span className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">
                      Or attach an existing Study Set to this Plan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {studySets.slice(0, 6).map((set) => (
                        <button
                          key={set.id}
                          type="button"
                          onClick={() => {
                            setPlanTopic(set.title);
                            setPlanSubject(set.category || 'African History');
                            setPlanLinkedSetId(set.id);
                            showToast(`Selected "${set.title}"`);
                          }}
                          className={`p-3 rounded-xl text-left border text-xs font-mono transition-all cursor-pointer truncate ${
                            planLinkedSetId === set.id
                              ? 'bg-[#3E0E27] text-white border-[#D92B8A]'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <div className="font-bold truncate">{set.title}</div>
                          <div className="text-[11px] opacity-70 truncate mt-0.5">
                            {set.concepts?.length || 0} Concepts • {set.category || 'General'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Proceed to Schedule */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-100">
                <div className="text-xs font-mono text-stone-500">
                  Selected Goal: <strong className="text-stone-900 uppercase">{planGoal}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToSchedule}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <span>Proceed to Schedule (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. STEP 2: SCHEDULE VIEW */}
        {currentStep === 'SCHEDULE' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                    <Clock3 className="w-4 h-4" />
                    <span>STEP 2 OF 5: SCHEDULE</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase mt-1">
                    CHOOSE DATE, TIME & STUDY DURATION
                  </h2>
                  <p className="text-sm font-mono text-stone-500 mt-0.5">
                    Lock in your calendar slot to ensure consistent daily active recall.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('PLAN')}
                    className="px-4 py-2 rounded-full border border-stone-300 text-xs font-mono font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    ← Edit Plan
                  </button>
                </div>
              </div>

              {/* Plan Summary Pill */}
              <div className="bg-[#FAF7F0] border border-stone-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">Current Target Topic</span>
                  <span className="font-display font-black text-base sm:text-lg text-[#161616] uppercase">
                    {planTopic || 'General Curriculum Session'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-white text-stone-800 border border-stone-200">
                    {planSubject}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#FAF4F8] text-[#D92B8A] border border-[#F1CCE2]">
                    {planGoal}
                  </span>
                </div>
              </div>

              {/* Form: Date, Time, Duration */}
              <form onSubmit={handleConfirmSchedule} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                      Choose Date *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Today', 'Tomorrow', 'Saturday', 'Sunday'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setScheduleDate(day)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer transition-all ${
                            scheduleDate === day
                              ? 'bg-[#161616] text-white border-[#161616]'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter custom date (e.g. 2026-09-10)"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-[#161616] mt-2"
                    />
                  </div>

                  {/* Time Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                      Choose Time *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setScheduleTime(t)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer transition-all ${
                            scheduleTime === t
                              ? 'bg-[#161616] text-white border-[#161616]'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter custom time (e.g. 07:00 PM)"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-[#161616] mt-2"
                    />
                  </div>

                  {/* Duration Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
                      Study Duration *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { mins: 15, label: '15 Mins' },
                        { mins: 25, label: '25 Mins (Pomodoro)' },
                        { mins: 45, label: '45 Mins (Deep Dive)' },
                        { mins: 60, label: '60 Mins (Mastery)' },
                      ].map((item) => (
                        <button
                          key={item.mins}
                          type="button"
                          onClick={() => setScheduleDuration(item.mins)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer transition-all ${
                            scheduleDuration === item.mins
                              ? 'bg-[#E63956] text-white border-[#E63956]'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
                  <div className="text-xs font-mono text-stone-500">
                    Slot configured: <strong className="text-stone-900">{scheduleDate} at {scheduleTime} ({scheduleDuration} mins)</strong>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#E63956] hover:bg-[#D92B8A] text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <span>Save Schedule Slot & Proceed to Study (Step 3)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Current Timetable Overview */}
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Current Scheduled Sessions ({schedule.length})
                </h3>
                <div className="space-y-2.5">
                  {schedule.map((block) => (
                    <div
                      key={block.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        block.isCompleted ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-[#FAF7F0] border-stone-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">
                            {block.scheduledDate} • {block.scheduledTime}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4F8] text-[#D92B8A]">
                            {block.learningGoal}
                          </span>
                          <span className="text-stone-500">{block.durationMinutes}m</span>
                        </div>
                        <h4 className="font-display font-black text-base text-[#161616] uppercase">
                          {block.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSessionBlock(block);
                            setCurrentStep('STUDY');
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#161616] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                        >
                          Select for Study →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. STEP 3: STUDY VIEW */}
        {currentStep === 'STUDY' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Active Session Launchpad */}
            <div className="bg-[#0D0D0E] border border-stone-800 rounded-[32px] p-6 sm:p-8 text-white shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-800 pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#E63956] tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>STEP 3 OF 5: STUDY • ACTIVE FOCUS ENGINE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
                    {activeSessionBlock ? activeSessionBlock.title : 'Active Focus Session'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
                    <span className="bg-[#202022] text-stone-300 px-3 py-1 rounded-full">
                      {activeSessionBlock?.subject || 'African History'}
                    </span>
                    <span className="bg-[#E63956]/20 text-[#F48FB1] px-3 py-1 rounded-full font-bold">
                      {activeSessionBlock?.learningGoal || 'Learn a New Topic'}
                    </span>
                    <span>• {selectedDuration} Minutes Time-box</span>
                  </div>
                </div>

                {/* Focus Timer Card */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#1C1C1E] border border-stone-700 px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[140px]">
                    <span className="text-[10px] font-mono uppercase text-[#E63956] font-bold">Timer</span>
                    <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white">
                      {formatTimer(timerSecondsLeft)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="w-12 h-12 rounded-full bg-[#E63956] hover:bg-[#D92B8A] text-white flex items-center justify-center shadow-lg cursor-pointer"
                      title={isTimerRunning ? 'Pause' : 'Start'}
                    >
                      {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft(selectedDuration * 60);
                      }}
                      className="w-12 h-12 rounded-full bg-[#202022] hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center justify-center cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirement: Launch the relevant existing Study Set, Flashcards, Practice or Quiz */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-stone-400 tracking-wider block">
                  LAUNCH LEARNING RESOURCE FOR THIS TOPIC:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLaunchMode('study')}
                    className="p-4 rounded-2xl bg-[#1C1C1E] hover:bg-[#28282B] border border-stone-700 text-left cursor-pointer transition-all space-y-1 group"
                  >
                    <BookOpen className="w-5 h-5 text-[#E63956] group-hover:scale-110 transition-transform" />
                    <div className="font-display font-black text-sm uppercase text-white">
                      Study Set
                    </div>
                    <div className="text-[11px] font-mono text-stone-400">
                      Full study guide & concept breakdown
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchMode('flashcards')}
                    className="p-4 rounded-2xl bg-[#1C1C1E] hover:bg-[#28282B] border border-stone-700 text-left cursor-pointer transition-all space-y-1 group"
                  >
                    <Layers className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div className="font-display font-black text-sm uppercase text-white">
                      Flashcards
                    </div>
                    <div className="text-[11px] font-mono text-stone-400">
                      Flip & active recall drill
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchMode('practice')}
                    className="p-4 rounded-2xl bg-[#1C1C1E] hover:bg-[#28282B] border border-stone-700 text-left cursor-pointer transition-all space-y-1 group"
                  >
                    <Target className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="font-display font-black text-sm uppercase text-white">
                      Practice Mode
                    </div>
                    <div className="text-[11px] font-mono text-stone-400">
                      Interactive scenario questions
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchMode('quiz')}
                    className="p-4 rounded-2xl bg-[#1C1C1E] hover:bg-[#28282B] border border-stone-700 text-left cursor-pointer transition-all space-y-1 group"
                  >
                    <GraduationCap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div className="font-display font-black text-sm uppercase text-white">
                      Quiz Simulator
                    </div>
                    <div className="text-[11px] font-mono text-stone-400">
                      Diagnostic timed test
                    </div>
                  </button>
                </div>
              </div>

              {/* Scratchpad for session notes */}
              <div className="bg-[#18181B] border border-stone-800 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-mono font-bold text-stone-300 uppercase">
                  Session Scratchpad & Key Insights
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Record summary concepts, equations, mnemonic associations, or questions to revisit during review..."
                  className="w-full bg-[#0D0D0E] border border-stone-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-white placeholder-stone-500 focus:outline-none min-h-[80px]"
                />
              </div>

              {/* Action: Mark Completed and Go to Track */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-stone-800">
                {activeSessionBlock && (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleComplete(activeSessionBlock.id);
                      showToast(`Marked "${activeSessionBlock.title}" as completed!`);
                      setCurrentStep('TRACK');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Mark Session Completed & Go to Track (Step 4)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentStep('TRACK')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer ml-auto"
                >
                  <span>Proceed to Track (Step 4)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Catalog of Existing Study Sets & Quizzes Ready to Launch */}
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#E63956]" />
                  <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                    ALL SAVED STUDY RESOURCES READY TO LAUNCH
                  </h3>
                </div>
                <button
                  onClick={onExploreSets}
                  className="text-xs font-mono font-bold text-[#E63956] hover:underline cursor-pointer"
                >
                  View in My Sets →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studySets.map((set) => (
                  <div
                    key={set.id}
                    className="p-4 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-stone-500 uppercase">
                        <span>STUDY SET</span>
                        <span>{set.concepts?.length || 0} CONCEPTS</span>
                      </div>
                      <h4 className="font-display font-black text-base text-[#161616] uppercase mt-1">
                        {set.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => handleLaunchSpecificSet(set, 'study')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-mono font-bold text-stone-800 uppercase cursor-pointer"
                      >
                        Study
                      </button>
                      <button
                        onClick={() => handleLaunchSpecificSet(set, 'flashcards')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-mono font-bold text-stone-800 uppercase cursor-pointer"
                      >
                        Cards
                      </button>
                      <button
                        onClick={() => handleLaunchSpecificSet(set, 'practice')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-mono font-bold text-stone-800 uppercase cursor-pointer"
                      >
                        Practice
                      </button>
                    </div>
                  </div>
                ))}

                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-600 uppercase">
                        <span>QUIZ</span>
                        <span>{quiz.questions?.length || 0} QUESTIONS</span>
                      </div>
                      <h4 className="font-display font-black text-base text-[#161616] uppercase mt-1">
                        {quiz.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-stone-200">
                      <button
                        onClick={() => handleLaunchSpecificQuiz(quiz)}
                        className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Launch Quiz →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. STEP 4: TRACK VIEW */}
        {currentStep === 'TRACK' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-xs font-mono font-bold text-stone-500 uppercase">TOTAL SCHEDULED</div>
                <div className="text-3xl sm:text-4xl font-display font-black text-[#161616] mt-1">{schedule.length}</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-xs font-mono font-bold text-stone-500 uppercase">COMPLETED</div>
                <div className="text-3xl sm:text-4xl font-display font-black text-emerald-600 mt-1">{completedBlocks.length}</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-xs font-mono font-bold text-stone-500 uppercase">STUDY TIME</div>
                <div className="text-3xl sm:text-4xl font-display font-black text-[#161616] mt-1">{totalMinutesPlanned}m</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-xs font-mono font-bold text-stone-500 uppercase">ACTIVE STREAK</div>
                <div className="text-3xl sm:text-4xl font-display font-black text-[#161616] mt-1 flex items-center gap-2">
                  <span>7 Days</span>
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
              </div>
            </div>

            {/* Requirement: Show upcoming sessions and allow completed sessions to be marked complete */}
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                    <CalendarCheck className="w-4 h-4" />
                    <span>STEP 4 OF 5: TRACK</span>
                  </div>
                  <h2 className="font-display font-black text-2xl text-[#161616] uppercase mt-1">
                    UPCOMING SESSIONS & PROGRESS TRACKER
                  </h2>
                  <p className="text-sm font-mono text-stone-500 mt-0.5">
                    Mark sessions complete as you finish studying to record your mastery metrics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('REVIEW')}
                  className="px-6 py-2.5 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <span>Proceed to Review (Step 5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Upcoming Sessions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                    UPCOMING SESSIONS ({upcomingBlocks.length})
                  </h3>
                  <span className="text-xs font-mono text-stone-500">
                    Click checkmark to record completion
                  </span>
                </div>

                <div className="space-y-3">
                  {upcomingBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-400 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Mark Complete Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(block.id)}
                          className="mt-0.5 w-7 h-7 rounded-xl border-2 border-stone-400 hover:border-emerald-600 bg-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title="Click to mark complete"
                        >
                          <Check className="w-4 h-4 text-stone-300 hover:text-emerald-600" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                            <span className="px-2.5 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200">
                              {block.scheduledDate} • {block.scheduledTime}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4F8] text-[#D92B8A]">
                              {block.learningGoal}
                            </span>
                            <span className="text-stone-500">{block.durationMinutes} MINS</span>
                          </div>

                          <h4 className="font-display font-black text-lg text-[#161616] uppercase">
                            {block.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSessionBlock(block);
                            setCurrentStep('STUDY');
                          }}
                          className="px-4 py-2 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-xs font-mono font-bold text-stone-800 uppercase cursor-pointer"
                        >
                          Launch Study →
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(block.id)}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Mark Complete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {upcomingBlocks.length === 0 && (
                    <div className="p-8 rounded-2xl bg-[#FAF7F0] border border-dashed border-stone-300 text-center space-y-2">
                      <p className="font-display font-black text-lg text-stone-700 uppercase">
                        All scheduled sessions completed!
                      </p>
                      <p className="text-xs font-mono text-stone-500">
                        Head back to Step 1 (PLAN) to schedule your next learning cycle.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Sessions Section */}
              {completedBlocks.length > 0 && (
                <div className="pt-6 border-t border-stone-100 space-y-3">
                  <h3 className="font-display font-black text-lg text-[#161616] uppercase text-emerald-800">
                    COMPLETED SESSIONS ({completedBlocks.length})
                  </h3>

                  <div className="space-y-2.5">
                    {completedBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div>
                            <h4 className="font-display font-black text-base text-[#161616] uppercase line-through opacity-80">
                              {block.title}
                            </h4>
                            <div className="text-xs font-mono text-emerald-700">
                              Completed {block.completedAt || 'Today'} • {block.learningGoal}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleComplete(block.id)}
                          className="text-xs font-mono text-stone-500 hover:text-stone-800 underline cursor-pointer"
                        >
                          Mark as Incomplete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. STEP 5: REVIEW VIEW */}
        {currentStep === 'REVIEW' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4" />
                    <span>STEP 5 OF 5: REVIEW</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase mt-1">
                    MISSED OR UNFINISHED SESSIONS & RESCHEDULING
                  </h2>
                  <p className="text-sm font-mono text-stone-500 mt-0.5">
                    Reschedule any missed study slots and reinforce memory with spaced repetition recall.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('PLAN')}
                  className="px-6 py-2.5 rounded-full bg-[#E63956] hover:bg-[#D92B8A] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Loop Back to Plan (Step 1)</span>
                </button>
              </div>

              {/* Requirement: Show missed or unfinished sessions and allow them to be rescheduled */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                    MISSED OR UNFINISHED SESSIONS ({missedOrUnfinishedBlocks.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {missedOrUnfinishedBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-5 rounded-2xl bg-[#FFFBF0] border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            ⚠ Missed / Unfinished
                          </span>
                          <span className="text-xs font-mono font-bold uppercase text-stone-600">
                            Scheduled: {block.scheduledDate} at {block.scheduledTime}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-lg text-[#161616] uppercase">
                          {block.title}
                        </h4>
                        <div className="text-xs font-mono text-stone-500">
                          {block.subject} • {block.learningGoal} • {block.durationMinutes} mins
                        </div>
                      </div>

                      {/* Prominent Reschedule Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingBlock(block);
                          setRescheduleDate('Today');
                          setRescheduleTime('03:00 PM');
                          setRescheduleDuration(block.durationMinutes);
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-sm transition-all shrink-0"
                      >
                        <Calendar className="w-4 h-4 text-[#D92B8A]" />
                        <span>Reschedule Session →</span>
                      </button>
                    </div>
                  ))}

                  {missedOrUnfinishedBlocks.length === 0 && (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-mono font-bold text-emerald-800">
                      ✓ No missed or unfinished sessions! All study blocks are up to date.
                    </div>
                  )}
                </div>
              </div>

              {/* Spaced Repetition Retention Queue */}
              <div className="pt-6 border-t border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                    SPACED RECALL RETENTION QUEUE ({schedule.length})
                  </h3>
                  <span className="text-xs font-mono text-stone-500">
                    Active retention status
                  </span>
                </div>

                <div className="space-y-3">
                  {schedule.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">
                            {block.subject}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full ${
                            block.reviewStatus === 'mastered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : block.reviewStatus === 'needs-work'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {block.reviewStatus === 'mastered' ? '★ Mastered' : block.reviewStatus === 'needs-work' ? '⚠ Needs Work' : '● Reviewing'}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-base text-[#161616] uppercase">
                          {block.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule((prev) =>
                              prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'needs-work' } : b))
                            );
                          }}
                          className={`px-3 py-1 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                            block.reviewStatus === 'needs-work'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-rose-50'
                          }`}
                        >
                          Needs Work
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule((prev) =>
                              prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'reviewing' } : b))
                            );
                          }}
                          className={`px-3 py-1 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                            block.reviewStatus === 'reviewing'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-amber-50'
                          }`}
                        >
                          Reviewing
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule((prev) =>
                              prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'mastered' } : b))
                            );
                          }}
                          className={`px-3 py-1 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                            block.reviewStatus === 'mastered'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-emerald-50'
                          }`}
                        >
                          Mastered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Reschedule Modal */}
      {reschedulingBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-display font-black text-xl uppercase text-[#161616]">
                  Reschedule Study Session
                </h3>
                <p className="text-xs font-mono text-stone-500">
                  Select a new date, time and duration.
                </p>
              </div>
              <button
                onClick={() => setReschedulingBlock(null)}
                className="w-8 h-8 rounded-full bg-white text-stone-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-stone-500 uppercase block">Session Title</span>
                <div className="font-display font-black text-base uppercase text-[#161616] mt-0.5">
                  {reschedulingBlock.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    New Date
                  </label>
                  <select
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-white border-2 border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    New Time
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-white border-2 border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Duration
                </label>
                <select
                  value={rescheduleDuration}
                  onChange={(e) => setRescheduleDuration(Number(e.target.value))}
                  className="w-full bg-white border-2 border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                >
                  <option value={15}>15 Minutes (Quick Sprint)</option>
                  <option value={25}>25 Minutes (Pomodoro)</option>
                  <option value={45}>45 Minutes (Deep Focus)</option>
                  <option value={60}>60 Minutes (Full Mastery)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setReschedulingBlock(null)}
                  className="px-5 py-2 rounded-full border border-stone-300 text-xs font-mono font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#161616] hover:bg-stone-800 text-white px-6 py-2 rounded-full text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
