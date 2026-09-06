import React, { useState, useEffect } from 'react';
import { 
  PlannerTask, 
  StudySet, 
  AppTab 
} from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Target, 
  BookOpen, 
  Sparkles,
  Quote
} from 'lucide-react';

interface PlannerViewProps {
  tasks: PlannerTask[];
  sets: StudySet[];
  onAddTask: (task: PlannerTask) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateTab: (tab: AppTab) => void;
  onSelectSet: (set: StudySet) => void;
}

const AFRICAN_FOCUS_QUOTES = [
  {
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela (South Africa)"
  },
  {
    quote: "It's the little things citizens do. That's what will make the difference. My little thing is planting trees.",
    author: "Wangari Maathai (Kenya, Nobel Laureate)"
  },
  {
    quote: "Knowledge of our past is the light that illuminates our future.",
    author: "Cheikh Anta Diop (Senegal)"
  },
  {
    quote: "He who feeds you, controls you. We must dare to invent the future.",
    author: "Thomas Sankara (Burkina Faso)"
  },
  {
    quote: "We face neither East nor West: we face forward.",
    author: "Kwame Nkrumah (Ghana)"
  }
];

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  sets,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onNavigateTab,
  onSelectSet,
}) => {
  // Add task modal / form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Pan-African Studies');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskSetId, setTaskSetId] = useState<string>(sets[0]?.id || '');

  // Pomodoro Focus Timer
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (pomodoroMode === 'work') {
        alert('🎉 Focus session completed! Take a 5-minute break.');
        setPomodoroMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('Break ended! Ready for your next revision sprint?');
        setPomodoroMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, pomodoroMode]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // rotate quote
      setQuoteIndex((prev) => (prev + 1) % AFRICAN_FOCUS_QUOTES.length);
    }
  };

  const handleResetTimer = (minutes: number = 25) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: PlannerTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      subject: taskSubject,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: taskDuration,
      completed: false,
      priority: taskPriority,
      associatedSetId: taskSetId || undefined
    };

    onAddTask(newTask);
    setTaskTitle('');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const currentQuote = AFRICAN_FOCUS_QUOTES[quoteIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D8C6] pb-6">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D92B8A]/10 text-[#D92B8A] uppercase tracking-widest font-mono-code">
            ACADEMIC MASTERY TIMETABLE
          </span>
          <h1 className="text-3xl font-display font-extrabold text-[#161616] mt-1">
            Study Planner & African Focus Engine
          </h1>
          <p className="text-sm text-[#6F685B]">
            Structure your revision sprints, track curriculum goals, and stay centered with focused intervals.
          </p>
        </div>

        {/* Daily Goal Status */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-[#DFD5C2] shadow-xs">
          <Target className="w-5 h-5 text-[#D92B8A]" />
          <div>
            <p className="text-[11px] font-semibold text-[#8C8372]">Daily Revision Target</p>
            <p className="text-xs font-extrabold text-[#161616]">
              {completedCount} / {tasks.length} tasks ({progressPct}%)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Focus Pomodoro Timer & African Scholar Quotes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pomodoro Box */}
          <div className="bg-white rounded-3xl border border-[#DFD5C2] p-8 text-center space-y-6 shadow-xs relative overflow-hidden">
            {/* Top motif bar */}
            <div className="h-1.5 w-full absolute top-0 left-0 bg-linear-to-r from-[#D92B8A] via-[#E59500] to-[#028090]" />

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D92B8A] font-mono-code">
                {pomodoroMode === 'work' ? 'Sankofa Deep Study Interval' : 'Ubuntu Rest & Reflection'}
              </span>
              <h3 className="text-xl font-display font-extrabold text-[#161616]">
                Focus Session Timer
              </h3>
            </div>

            {/* Circular / Large Timer Display */}
            <div className="w-48 h-48 rounded-full border-4 border-[#FAF7F0] bg-[#FAF7F0] shadow-inner mx-auto flex flex-col items-center justify-center relative">
              <span className="text-5xl font-mono-code font-extrabold text-[#161616]">
                {formatTimer(timeLeft)}
              </span>
              <span className="text-[11px] font-semibold text-[#8C8372] mt-1">
                {isRunning ? 'Sprint in progress...' : 'Ready to begin'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                id="btn-pomodoro-toggle"
                onClick={handleToggleTimer}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md transition-all cursor-pointer ${
                  isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#D92B8A] hover:bg-[#BC1D73]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Sprint</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleResetTimer(25)}
                title="Reset 25 min work"
                className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#DFD5C2] hover:border-[#161616] text-[#161616] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setPomodoroMode(pomodoroMode === 'work' ? 'break' : 'work');
                  setTimeLeft(pomodoroMode === 'work' ? 5 * 60 : 25 * 60);
                  setIsRunning(false);
                }}
                className="px-3.5 py-3 rounded-2xl bg-[#FAF7F0] border border-[#DFD5C2] hover:border-[#161616] text-xs font-bold text-[#5C5546]"
              >
                Switch to {pomodoroMode === 'work' ? '5m Break' : '25m Work'}
              </button>
            </div>

            {/* Inspiring African Scholar Quote */}
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7DECD] text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E59500]">
                <Quote className="w-3.5 h-3.5" />
                <span>African Wisdom for Today</span>
              </div>
              <p className="text-xs text-[#443D32] italic leading-relaxed">
                "{currentQuote.quote}"
              </p>
              <p className="text-[11px] font-bold text-[#8C8372] text-right">
                — {currentQuote.author}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Timetable & Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Task Card */}
          <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#161616] uppercase tracking-wider font-mono-code flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D92B8A]" />
              <span>Schedule Revision Task</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Master AfCFTA PAPSS concept)"
                  className="px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-xs font-medium"
                />

                <input
                  type="text"
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  placeholder="Subject (e.g. Economics, History)"
                  className="px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>

                <select
                  value={taskPriority}
                  onChange={(e: any) => setTaskPriority(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select
                  value={taskSetId}
                  onChange={(e) => setTaskSetId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:outline-none"
                >
                  <option value="">No linked deck</option>
                  {sets.map(s => (
                    <option key={s.id} value={s.id}>
                      Link: {s.title.slice(0, 18)}...
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#161616] hover:bg-[#333] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Add to Timetable
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-3xl border border-[#DFD5C2] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E7DECD] pb-3">
              <h3 className="font-bold text-sm text-[#161616]">
                Today's Revision Agenda ({tasks.length})
              </h3>
              <span className="text-xs text-[#6F685B]">
                {completedCount} completed
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C8372]">
                No revision tasks scheduled for today. Add your first task above!
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const linkedSet = sets.find((s) => s.id === task.associatedSetId);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        task.completed
                          ? 'bg-[#FAF7F0]/60 border-[#E7DECD] opacity-70'
                          : 'bg-white border-[#DFD5C2] hover:border-[#161616]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="text-[#9E9584] hover:text-[#D92B8A] transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <p className={`text-sm font-bold ${
                            task.completed ? 'line-through text-[#8C8372]' : 'text-[#161616]'
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6F685B] mt-0.5">
                            <span className="font-semibold text-[#D92B8A]">{task.subject}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8C8372]" />
                              {task.durationMinutes}m
                            </span>
                            {task.priority === 'high' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Open linked set or delete */}
                      <div className="flex items-center gap-2">
                        {linkedSet && (
                          <button
                            onClick={() => {
                              onSelectSet(linkedSet);
                              onNavigateTab('study');
                            }}
                            title={`Open deck: ${linkedSet.title}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#D92B8A]/10 text-xs font-bold text-[#161616] hover:text-[#D92B8A] border border-[#DFD5C2]"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span className="hidden sm:inline">Study</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-[#9E9584] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
