import React from 'react';
import { UserStats } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  FileText, 
  ExternalLink, 
  Award, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ProgressViewProps {
  stats: UserStats;
  onExploreSets: () => void;
  onStartReview: () => void;
  onNavigateToArchive?: () => void;
  onBack?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats,
  onExploreSets,
  onStartReview,
  onNavigateToArchive,
  onBack,
}) => {
  const sessionHistory = StorageService.getSessionHistory();
  const userNotes = StorageService.getUserNotes();
  const notesCount = userNotes.length;
  const needingReviewCount = StorageService.getConceptsNeedingReview().length;

  return (
    <div id="progress-view-root" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      {onBack && (
        <button
          id="progress-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-stone-600 hover:text-[#D92B8A] uppercase tracking-wider transition-colors px-3.5 py-1.5 bg-white border border-stone-200 rounded-full shadow-xs hover:border-pink-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}

      {/* Top Header */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-[#D92B8A] rounded-full border border-pink-200 font-mono text-xs font-bold uppercase">
          <Award className="w-3.5 h-3.5" />
          <span>Learning Mastery Record</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
          Your Study Progress
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-2xl">
          Tracking your active recall sessions, lessons completed, and concepts solidified into long-term memory.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Streak */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-2 shadow-sm hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-stone-500">
              Daily Streak
            </span>
            <div className="p-2 bg-pink-50 rounded-full text-[#D92B8A]">
              <Flame className="w-4 h-4 fill-[#D92B8A]" />
            </div>
          </div>
          <div className="font-display text-3xl sm:text-4xl font-black text-[#D92B8A]">
            {stats.streakDays} <span className="font-mono text-xs font-bold text-stone-600 uppercase">Days</span>
          </div>
          <p className="text-xs text-stone-500 font-normal">
            Consecutive study days
          </p>
        </div>

        {/* Sessions Completed */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-2 shadow-sm hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-stone-500">
              Sessions
            </span>
            <div className="p-2 bg-stone-100 rounded-full text-stone-800">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl sm:text-4xl font-black text-stone-900">
            {stats.sessionsCompleted}
          </div>
          <p className="text-xs text-stone-500 font-normal">
            Lessons, cards & practice
          </p>
        </div>

        {/* Concepts Learned */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-2 shadow-sm hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-stone-500">
              Concepts
            </span>
            <div className="p-2 bg-pink-50 rounded-full text-[#D92B8A]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl sm:text-4xl font-black text-[#D92B8A]">
            {stats.conceptsStudied}
          </div>
          <p className="text-xs text-stone-500 font-normal">
            Active concepts explored
          </p>
        </div>

        {/* Queued For Review */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-2 shadow-sm hover:border-pink-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-stone-500">
              Review Queue
            </span>
            <div className="p-2 bg-stone-100 rounded-full text-stone-800">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl sm:text-4xl font-black text-stone-900">
            {needingReviewCount}
          </div>
          <p className="text-xs text-stone-500 font-normal">
            Spaced repetition items
          </p>
        </div>
      </div>

      {/* Recent Study Activity */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
              Study Log
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-stone-900">
              Recent Study Sessions
            </h2>
          </div>

          <button
            onClick={onExploreSets}
            className="font-mono text-xs font-bold uppercase text-[#D92B8A] hover:underline flex items-center gap-1.5"
          >
            <span>Study More</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {sessionHistory.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/70 border border-stone-200 rounded-2xl space-y-3">
            <p className="text-xs sm:text-sm text-stone-600 font-normal">
              No sessions completed yet. Start your first lesson to see your learning activity recorded here.
            </p>
            <button
              onClick={onExploreSets}
              className="px-6 py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase rounded-full shadow-xs transition-all active:scale-95"
            >
              Start Studying Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessionHistory.slice(0, 8).map((session, idx) => (
              <div 
                key={`${session.timestamp}-${idx}`} 
                className="p-4 bg-stone-50/60 border border-stone-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:bg-white hover:border-pink-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-stone-900 text-white font-mono text-xs font-bold uppercase rounded-full">
                    {session.mode}
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-900">
                      {session.setTitle}
                    </h4>
                    <span className="font-mono text-xs text-stone-500">
                      {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs font-bold text-stone-700 bg-white px-3 py-1 rounded-full border border-stone-200">
                  {session.totalConcepts} Concepts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Notes Archive Preview */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
              Knowledge Vault
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-stone-900">
              Saved Study Notes ({notesCount})
            </h2>
          </div>

          {onNavigateToArchive && (
            <button
              onClick={onNavigateToArchive}
              className="font-mono text-xs font-bold uppercase text-[#D92B8A] hover:underline flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View All Notes Archive</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {userNotes.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/70 border border-stone-200 rounded-2xl space-y-2">
            <p className="text-xs sm:text-sm text-stone-600 font-normal">
              No personal notes saved yet. Take notes in your lessons and they will be archived here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {userNotes.slice(0, 4).map((note) => (
              <div 
                key={note.id} 
                className="p-4 bg-stone-50/60 border border-stone-200/90 rounded-2xl space-y-2 shadow-xs hover:bg-white hover:border-pink-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 bg-white border border-stone-200 text-stone-800 rounded-full truncate max-w-[200px]">
                    {note.targetTitle}
                  </span>
                  <span className="font-mono text-xs text-stone-500">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-stone-700 line-clamp-3 leading-relaxed font-normal">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUIZ PLATFORM COMPANION CALLOUT */}
      <div className="bg-stone-50/80 border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-stone-200 text-stone-700 font-mono text-xs font-bold uppercase rounded-full">
            <span>External Platform</span>
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900">
            Ready to Test Your Knowledge?
          </h3>
          <p className="text-sm text-stone-600 font-normal max-w-xl">
            Take timed quizzes and global challenges on the Proudly Afrikan Quiz platform.
          </p>
        </div>

        <a
          href="https://proudlyafrikan.com/quiz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-pink-50 border border-stone-200 text-stone-900 hover:text-[#D92B8A] hover:border-pink-300 font-display text-xs font-bold uppercase rounded-full shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
        >
          <span>Take the Quiz</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
