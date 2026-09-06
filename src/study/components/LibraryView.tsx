import React, { useState, useMemo } from 'react';
import { UserStudyNote, UserProfile, StudySet, AppView, UserStats } from '../types';
import { StorageService } from '../services/storageService';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  FileText, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  BookOpen, 
  Clock, 
  User, 
  LogOut, 
  Sparkles,
  ExternalLink,
  FolderOpen,
  ArrowRight,
  Download,
  Flame,
  CheckCircle2,
  Award,
  Layers,
  RotateCcw,
  BarChart2
} from 'lucide-react';

interface LibraryViewProps {
  currentUser: UserProfile;
  studySets: StudySet[];
  stats: UserStats;
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  onExploreSets: () => void;
  onUserChanged: (newUser: UserProfile) => void;
  onNavigate: (view: AppView) => void;
  onCreateSetClick: () => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  currentUser,
  studySets,
  stats,
  onSelectSet,
  onUserChanged,
  onNavigate,
  onCreateSetClick,
  onBack,
  onGoHome,
}) => {
  const [activeTab, setActiveTab] = useState<'sets' | 'notes' | 'progress' | 'account'>('sets');
  const [notes, setNotes] = useState<UserStudyNote[]>(() => StorageService.getUserNotes(currentUser.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // User switcher state
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const allUsers = StorageService.getAllUsers();

  const refreshNotes = (userId?: string) => {
    const updated = StorageService.getUserNotes(userId || currentUser.id);
    setNotes(updated);
  };

  const showFeedback = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Categories list derived from saved notes
  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => {
      if (n.category) set.add(n.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesTitle = n.targetTitle.toLowerCase().includes(q);
        const matchesCat = (n.category || '').toLowerCase().includes(q);
        return matchesContent || matchesTitle || matchesCat;
      }
      return true;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleStartEdit = (note: UserStudyNote) => {
    setEditingNoteId(note.id);
    setEditText(note.content);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
    setEditError(null);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editText.trim()) {
      setEditError('Note content cannot be blank.');
      return;
    }

    const res = StorageService.updateNote(noteId, editText.trim());
    if (res.success) {
      refreshNotes();
      setEditingNoteId(null);
      setEditText('');
      setEditError(null);
      showFeedback('Note updated successfully!');
    } else {
      setEditError(res.error || 'Failed to save note changes.');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this study note?')) {
      const res = StorageService.deleteNote(noteId);
      if (res.success) {
        refreshNotes();
        showFeedback('Note deleted.');
      }
    }
  };

  const handleSwitchUser = (user: UserProfile) => {
    const switched = StorageService.switchUser(user.id);
    onUserChanged(switched);
    refreshNotes(switched.id);
    setIsSwitchingUser(false);
    showFeedback(`Logged in as ${switched.name}`);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const loggedIn = StorageService.loginUser(newEmail.trim(), newName.trim());
    onUserChanged(loggedIn);
    refreshNotes(loggedIn.id);
    setNewEmail('');
    setNewName('');
    setIsSwitchingUser(false);
    showFeedback(`Welcome, ${loggedIn.name}!`);
  };

  return (
    <div id="library-view-root" className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Global Navigation: BACK + HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
      </div>

      {/* Header Banner */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[#D92B8A]">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>MY LIBRARY • KEEP WHAT YOU CREATED</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-stone-900 tracking-tight uppercase">
              MY LIBRARY
            </h1>
            <p className="text-sm text-stone-600 font-normal leading-relaxed max-w-xl">
              Access your created study sets, custom worksheets, notes, mastery progress history, and account backups in one clean place.
            </p>
          </div>

          {/* User Profile Pill */}
          <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center font-mono font-bold text-sm">
              {currentUser.avatarInitials || 'US'}
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-sm text-stone-900">{currentUser.name}</div>
              <div className="font-mono text-xs text-stone-500">{currentUser.plan || 'Free'} Plan • {currentUser.status || 'Guest'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-stone-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sets')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sets'
                ? 'bg-[#18181B] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SAVED SETS ({studySets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-[#18181B] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>STUDY NOTES ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-[#18181B] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>CURRICULUM PROGRESS</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-[#18181B] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ACCOUNT & BACKUPS</span>
          </button>
        </div>
      </section>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-mono text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: SAVED STUDY SETS */}
      {activeTab === 'sets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-xl uppercase text-stone-900">
              SAVED STUDY SETS & RESOURCES
            </h2>
            <button
              onClick={onCreateSetClick}
              className="px-4 py-2 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CREATE NEW SET</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studySets.map(set => (
              <div
                key={set.id}
                className="bg-white border border-stone-200/90 rounded-3xl p-5 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-mono text-[11px] font-bold uppercase rounded-full border border-stone-200">
                      {set.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-500">
                      {set.concepts.length} concepts
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg text-stone-900 leading-snug">
                    {set.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
                    {set.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectSet(set, 'study')}
                    className="flex-1 py-2 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs font-bold uppercase rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-[#D92B8A]" />
                    <span>LEARN</span>
                  </button>
                  <button
                    onClick={() => onSelectSet(set, 'flashcards')}
                    className="flex-1 py-2 bg-stone-100 hover:bg-pink-50 hover:text-[#D92B8A] text-stone-800 font-display text-xs font-bold uppercase rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  >
                    <Layers className="w-3 h-3" />
                    <span>CARDS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDY NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-full text-xs font-medium placeholder:text-stone-400 focus:outline-none focus:border-pink-400"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#D92B8A] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3">
              <FileText className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-display font-black text-lg uppercase text-stone-800">No notes found</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Notes you write while studying concepts or completing study sessions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] border border-pink-200 rounded-full">
                        {note.category}
                      </span>
                      <span className="font-mono text-[11px] text-stone-400">
                        {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-stone-900">
                      {note.targetTitle}
                    </h4>

                    {editingNoteId === note.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full p-3 border border-stone-300 rounded-xl text-xs font-normal focus:outline-none focus:border-pink-400 min-h-[80px]"
                        />
                        {editError && <div className="text-xs text-red-600">{editError}</div>}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs text-stone-600 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="px-3.5 py-1 bg-[#D92B8A] text-white text-xs font-bold rounded-full"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>

                  {editingNoteId !== note.id && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="text-stone-500 hover:text-[#D92B8A] font-mono text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-stone-400 hover:text-red-600 font-mono text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CURRICULUM PROGRESS & MASTERY */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-5 text-center space-y-1 shadow-sm">
              <div className="font-mono text-3xl font-black text-[#D92B8A] flex items-center justify-center gap-1.5">
                <Flame className="w-6 h-6 fill-[#D92B8A]" />
                {stats.streakDays}
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase">Day Streak</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-5 text-center space-y-1 shadow-sm">
              <div className="font-mono text-3xl font-black text-stone-900">
                {stats.conceptsStudied}
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase">Concepts Mastered</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-5 text-center space-y-1 shadow-sm">
              <div className="font-mono text-3xl font-black text-[#D92B8A]">
                {stats.sessionsCompleted}
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase">Study Sessions</div>
            </div>
          </div>

          {/* Subject Mastery Progress Bars */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="font-display font-black text-lg uppercase text-stone-900">
              SUBJECT CURRICULUM MASTERY
            </h3>
            <div className="space-y-3">
              {Object.keys(stats.subjectMastery).length === 0 ? (
                <p className="text-sm text-stone-500 font-normal">
                  Start studying sets or topics to track your real curriculum mastery over time.
                </p>
              ) : (
                Object.entries(stats.subjectMastery).map(([subject, prog]: [string, { percentage: number; mastered: number; total: number }]) => (
                  <div key={subject} className="space-y-1.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <div className="flex justify-between font-mono text-xs font-bold uppercase text-stone-800">
                      <span>{subject}</span>
                      <span className="text-[#D92B8A]">{prog.percentage}% ({prog.mastered}/{prog.total})</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D92B8A] to-[#f43f5e] rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, prog.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNT & BACKUPS */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <h3 className="font-display font-black text-xl uppercase text-stone-900">CURRENT SCHOLAR ACCOUNT</h3>
                <p className="text-sm text-stone-600 mt-0.5">Switch profiles or export your offline backup.</p>
              </div>
              <a
                href="/api/download-zip"
                download="proudly-afrikan-study-companion.zip"
                className="px-4 py-2 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs font-bold uppercase rounded-full flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                <span>DOWNLOAD PROJECT SOURCE (.ZIP)</span>
              </a>
            </div>

            {/* Profile Switcher List */}
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-stone-600 block">
                Available Scholar Profiles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allUsers.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u)}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-pink-50 border-[#D92B8A] ring-2 ring-[#D92B8A]/20'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center font-mono font-bold text-xs">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div className="font-display font-bold text-xs text-stone-900">{u.name}</div>
                          <div className="font-mono text-[10px] text-stone-500">{u.plan || 'Free'} • {u.status || 'Guest'}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#D92B8A]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom User Form */}
            <form onSubmit={handleCreateNewUser} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-stone-700 block">
                Create / Login Custom Scholar
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Kwame Mensah)"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-bold uppercase rounded-full shadow-sm cursor-pointer"
              >
                SAVE & SWITCH USER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
