import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Target, 
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Zap,
  CalendarDays,
  FileText,
  AlertCircle
} from 'lucide-react';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';

export type ActivityType = 'class' | 'study' | 'assignment' | 'exam';

export interface PlannerActivity {
  id: string;
  type: ActivityType;
  title: string;
  subject: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // e.g., "09:00 AM - 10:30 AM"
  isCompleted?: boolean;
  notes?: string;
}

interface CentralPlannerViewProps {
  onStartStudySet: (set: StudySet, mode?: 'study' | 'flashcards' | 'practice') => void;
  onStartQuiz: (quiz: Quiz) => void;
  onExploreSets: () => void;
}

const DAYS_OF_WEEK: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const DEFAULT_ACTIVITIES: PlannerActivity[] = [
  {
    id: 'act-1',
    type: 'class',
    title: 'African History & Orature Lecture',
    subject: 'African History',
    dayOfWeek: 'Monday',
    time: '09:00 AM - 10:30 AM',
    isCompleted: false,
    notes: 'Lecture Hall 4B'
  },
  {
    id: 'act-2',
    type: 'study',
    title: 'Revise Proverbs & Metaphorical Richness',
    subject: 'African Knowledge',
    dayOfWeek: 'Monday',
    time: '02:00 PM - 03:30 PM',
    isCompleted: false,
    notes: 'Deep Study Hub session'
  },
  {
    id: 'act-3',
    type: 'assignment',
    title: 'Post-Colonial Literature Essay Draft',
    subject: 'Literature',
    dayOfWeek: 'Tuesday',
    time: 'Due 05:00 PM',
    isCompleted: false,
    notes: 'Submit via LMS portal'
  },
  {
    id: 'act-4',
    type: 'class',
    title: 'Data Structures & Computational Logic',
    subject: 'Technology',
    dayOfWeek: 'Wednesday',
    time: '10:00 AM - 11:30 AM',
    isCompleted: false,
    notes: 'Lab 2'
  },
  {
    id: 'act-5',
    type: 'exam',
    title: 'Calculus Midterm Examination',
    subject: 'Mathematics',
    dayOfWeek: 'Wednesday',
    time: '02:00 PM - 04:00 PM',
    isCompleted: false,
    notes: 'Auditorium A'
  },
  {
    id: 'act-6',
    type: 'study',
    title: 'Geography Biomes & Rift Valley Review',
    subject: 'Geography',
    dayOfWeek: 'Thursday',
    time: '11:00 AM - 12:30 PM',
    isCompleted: false,
    notes: 'Flashcards & Quizzes'
  },
  {
    id: 'act-7',
    type: 'assignment',
    title: 'Great African Kingdoms Map Project',
    subject: 'African History',
    dayOfWeek: 'Friday',
    time: 'Due 04:00 PM',
    isCompleted: false,
    notes: 'Final presentation slides'
  }
];

export const CentralPlannerView: React.FC<CentralPlannerViewProps> = ({
  onStartStudySet,
  onStartQuiz,
  onExploreSets,
}) => {
  const [activities, setActivities] = useState<PlannerActivity[]>(() => {
    try {
      const raw = localStorage.getItem('proudly_afrikan_student_planner_msl_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_ACTIVITIES;
  });

  // Week navigation offset (0 = current week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Add Activity Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newType, setNewType] = useState<ActivityType>('class');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('African History');
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Monday');
  const [newTime, setNewTime] = useState<string>('09:00 AM');
  const [newNotes, setNewNotes] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('proudly_afrikan_student_planner_msl_v1', JSON.stringify(activities));
    } catch (e) {}
  }, [activities]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const activity: PlannerActivity = {
      id: `act-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      dayOfWeek: newDay,
      time: newTime.trim() || '09:00 AM',
      isCompleted: false,
      notes: newNotes.trim() || undefined
    };

    setActivities((prev) => [activity, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const handleToggleComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((item) => item.id !== id));
  };

  // Determine Today's Day of Week for highlight
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Compute dates for week view based on weekOffset
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek + (offset * 7));

    const weekDays = DAYS_OF_WEEK.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        name: dayName,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: offset === 0 && dayName === todayName
      };
    });

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const rangeLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` ;

    return { weekDays, rangeLabel };
  };

  const { weekDays, rangeLabel } = getWeekDates(weekOffset);

  // Stats for top summary
  const totalClasses = activities.filter(a => a.type === 'class').length;
  const totalStudy = activities.filter(a => a.type === 'study').length;
  const totalAssignments = activities.filter(a => a.type === 'assignment').length;
  const totalExams = activities.filter(a => a.type === 'exam').length;

  const getTypeBadge = (type: ActivityType) => {
    switch (type) {
      case 'class':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono text-[10px] font-bold uppercase tracking-wider">CLASS</span>;
      case 'study':
        return <span className="px-2.5 py-0.5 rounded-full bg-[#FCE8F3] text-[#D92B8A] font-mono text-[10px] font-bold uppercase tracking-wider">STUDY</span>;
      case 'assignment':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold uppercase tracking-wider">ASSIGNMENT</span>;
      case 'exam':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#E63956] font-mono text-[10px] font-bold uppercase tracking-wider">TEST / EXAM</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">

        {/* Header Hero */}
        <div className="clay-card-3d p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#D92B8A]">
              <CalendarDays className="w-4 h-4 text-[#D92B8A]" />
              <span>MY STUDY LIFE • STUDENT PLANNER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#161616] uppercase">
              WEEKLY SCHEDULE & TIMETABLE
            </h1>
            <p className="text-stone-700 text-xs sm:text-[13px] max-w-2xl font-normal leading-relaxed">
              Manage your classes, study sessions, assignments, and exams in one clear weekly schedule. Stay organised and never miss a deadline.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="clay-btn-dark px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD ACTIVITY</span>
            </button>
          </div>
        </div>

        {/* Week Navigator & Quick Overview Bar */}
        <div className="clay-card-3d p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 cursor-pointer transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center sm:text-left">
              <span className="font-mono text-[10px] font-bold uppercase text-stone-500 block">ACTIVE WEEK</span>
              <span className="font-display font-black text-base sm:text-lg text-[#161616]">{rangeLabel}</span>
            </div>

            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 cursor-pointer transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-lg bg-[#D92B8A] text-white font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-700">
              🏫 {totalClasses} Classes
            </span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-700">
              💡 {totalStudy} Study
            </span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-700">
              📝 {totalAssignments} Assignments
            </span>
            <span className="px-3 py-1 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-700">
              🎯 {totalExams} Exams
            </span>
          </div>
        </div>

        {/* Monday to Sunday Weekly View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
          {weekDays.map((day) => {
            const dayActivities = activities.filter(a => a.dayOfWeek === day.name);

            return (
              <div 
                key={day.name}
                className={`clay-card-3d p-4 flex flex-col justify-between min-h-[380px] transition-all ${
                  day.isToday ? 'border-2 border-[#D92B8A] shadow-[0_8px_24px_rgba(217,43,138,0.2)] bg-gradient-to-b from-white to-[#FFF5F9]' : ''
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                    <div>
                      <span className="font-display font-black text-sm uppercase text-[#161616] block">{day.name}</span>
                      <span className="font-mono text-[11px] text-stone-500">{day.dateStr}</span>
                    </div>

                    {day.isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D92B8A] text-white font-mono text-[9px] font-black uppercase animate-pulse">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Activities List for this day */}
                  <div className="space-y-2.5">
                    {dayActivities.length === 0 ? (
                      <div className="text-center py-10 text-stone-400 font-mono text-xs italic">
                        No activities scheduled
                      </div>
                    ) : (
                      dayActivities.map((act) => (
                        <div
                          key={act.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            act.isCompleted 
                              ? 'bg-stone-100/80 border-stone-200 opacity-60' 
                              : 'bg-white border-stone-200 shadow-xs hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {getTypeBadge(act.type)}
                                <span className="font-mono text-[10px] text-stone-500">{act.time}</span>
                              </div>
                              <h4 className={`font-display font-bold text-xs uppercase text-[#161616] leading-tight ${act.isCompleted ? 'line-through text-stone-500' : ''}`}>
                                {act.title}
                              </h4>
                              <p className="font-sans text-[11px] text-stone-600 font-medium">
                                {act.subject} {act.notes ? `• ${act.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[10px] font-mono">
                            <button
                              onClick={() => handleToggleComplete(act.id)}
                              className={`flex items-center gap-1 font-bold cursor-pointer ${act.isCompleted ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-800'}`}
                            >
                              <Check className={`w-3 h-3 ${act.isCompleted ? 'stroke-[3]' : ''}`} />
                              <span>{act.isCompleted ? 'Done' : 'Complete'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Add Button on Day Column */}
                <div className="pt-3 mt-3 border-t border-stone-200 text-center">
                  <button
                    onClick={() => {
                      setNewDay(day.name);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-mono text-xs font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {day.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D92B8A]"></span>
                <h3 className="font-display font-black text-lg uppercase text-[#161616]">
                  Add New Activity
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center font-mono font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['class', 'study', 'assignment', 'exam'] as ActivityType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`py-2 px-2 rounded-xl border font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap overflow-hidden text-ellipsis ${
                        newType === t
                          ? 'bg-[#161616] text-white border-[#161616]'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                  Title / Topic Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. African Literature Lecture, Midterm Review..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-[#161616] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. African History, Mathematics..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-[#161616] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Day of the Week
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Time / Due Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 10:30 AM or Due 5pm"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-[#161616] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1.5">
                    Location / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 4B, LMS Upload"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-3 text-xs font-mono text-[#161616] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-dark px-6 py-3 font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
