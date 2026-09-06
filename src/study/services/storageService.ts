import { 
  StudySet, 
  StudyConcept, 
  ConceptPerformance, 
  UserStats, 
  SessionResult, 
  FlashcardRating,
  StudyPlanDuration,
  StudyPlanRecommendation,
  UserProfile,
  UserStudyNote
} from '../types';
import { INITIAL_STUDY_SETS } from '../data/defaultCurriculum';

const STORAGE_KEYS = {
  CUSTOM_SETS: 'proudly_afrikan_custom_sets_v2',
  PERFORMANCE: 'proudly_afrikan_performance_v2',
  STATS: 'proudly_afrikan_stats_v2',
  SESSION_HISTORY: 'proudly_afrikan_sessions_v2',
  USER_NOTES: 'proudly_afrikan_notes_v2',
  STRUCTURED_NOTES: 'proudly_afrikan_structured_notes_v3',
  CURRENT_USER: 'proudly_afrikan_current_user_v3',
  ALL_USERS: 'proudly_afrikan_all_users_v3',
};

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_aluta',
    name: 'Kwame Mensah',
    email: 'alutacreatives@gmail.com',
    role: 'Lead Scholar',
    avatarInitials: 'KM',
    createdAt: '2026-01-01T00:00:00.000Z',
    isSubscribed: true,
    plan: 'Yearly',
    status: 'Registered',
  },
  {
    id: 'user_amina',
    name: 'Amina Diallo',
    email: 'amina@proudlyafrikan.com',
    role: 'Researcher',
    avatarInitials: 'AD',
    createdAt: '2026-02-01T00:00:00.000Z',
    isSubscribed: true,
    plan: 'Monthly',
    status: 'Registered',
  },
  {
    id: 'user_guest',
    name: 'Guest Scholar',
    email: 'guest@proudlyafrikan.com',
    role: 'Learner',
    avatarInitials: 'GS',
    createdAt: '2026-03-01T00:00:00.000Z',
    isSubscribed: false,
    plan: 'Free',
    status: 'Guest',
  },
];

export class StorageService {
  // --- USER AUTH & PROFILE MANAGEMENT ---

  static getAllUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const parsed: UserProfile[] = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  static getCurrentUser(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (raw) {
        const user: UserProfile = JSON.parse(raw);
        if (user && user.id && user.email) return user;
      }
      const users = this.getAllUsers();
      const defaultUser = users[0] || DEFAULT_USERS[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    } catch (e) {
      return DEFAULT_USERS[0];
    }
  }

  static loginUser(email: string, name?: string): UserProfile {
    const users = this.getAllUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const userName = name?.trim() || cleanEmail.split('@')[0] || 'Learner';
      const initials = userName
        .split(' ')
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US';

      const isGuest = cleanEmail.includes('guest');
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: userName,
        email: cleanEmail || 'user@proudlyafrikan.com',
        role: 'Active Scholar',
        avatarInitials: initials,
        createdAt: new Date().toISOString(),
        isSubscribed: !isGuest,
        plan: isGuest ? 'Free' : 'Monthly',
        status: isGuest ? 'Guest' : 'Registered',
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }

  static switchUser(userId: string): UserProfile {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId) || users[0] || DEFAULT_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }

  static logoutUser(): UserProfile {
    // When logged out, switch to Guest Scholar account
    const users = this.getAllUsers();
    const guest = users.find(u => u.id === 'user_guest') || DEFAULT_USERS[2];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guest));
    return guest;
  }

  // --- STRUCTURED USER STUDY NOTES (ISOLATED PER USER & PERSISTENT) ---

  private static getAllStructuredNotes(): UserStudyNote[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STRUCTURED_NOTES);
      let notes: UserStudyNote[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(notes)) notes = [];

      // Auto-migrate legacy unstructured notes if any exist
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.USER_NOTES);
      if (legacyRaw) {
        try {
          const legacyNotes: Record<string, string> = JSON.parse(legacyRaw);
          const currentUser = this.getCurrentUser();
          let migratedCount = 0;

          Object.entries(legacyNotes).forEach(([targetId, content]) => {
            if (content && typeof content === 'string' && content.trim()) {
              const alreadyExists = notes.some(
                n => n.userId === currentUser.id && n.targetId === targetId
              );
              if (!alreadyExists) {
                notes.push({
                  id: `note_migrated_${Date.now()}_${migratedCount++}`,
                  userId: currentUser.id,
                  targetId,
                  targetTitle: 'Study Item Note',
                  targetType: targetId.includes('-') ? 'concept' : 'general',
                  category: 'AFRICAN HISTORY',
                  content: content.trim(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            }
          });

          if (migratedCount > 0) {
            localStorage.setItem(STORAGE_KEYS.STRUCTURED_NOTES, JSON.stringify(notes));
          }
        } catch (migErr) {
          console.warn('Legacy notes migration warning:', migErr);
        }
      }

      return notes;
    } catch (e) {
      console.error('Failed to load structured notes:', e);
      return [];
    }
  }

  // Retrieve all notes for the currently logged in user (or specified userId)
  static getUserNotes(userId?: string): UserStudyNote[] {
    const activeUserId = userId || this.getCurrentUser().id;
    const allNotes = this.getAllStructuredNotes();
    return allNotes
      .filter(n => n.userId === activeUserId && Boolean(n.content && n.content.trim()))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }

  // Get note for a specific target concept or set for the current user
  static getNoteForTarget(targetId: string, userId?: string): UserStudyNote | undefined {
    const activeUserId = userId || this.getCurrentUser().id;
    const allNotes = this.getAllStructuredNotes();
    return allNotes.find(n => n.userId === activeUserId && n.targetId === targetId);
  }

  // Save or update note with validation, user scoping, and safety
  static saveNote(payload: {
    targetId: string;
    targetTitle?: string;
    targetType?: 'concept' | 'set' | 'general';
    category?: string;
    content: string;
    userId?: string;
  }): { success: boolean; note?: UserStudyNote; error?: string } {
    const cleanContent = (payload.content || '').trim();
    if (!cleanContent) {
      return { success: false, error: 'Note text cannot be empty. Please enter your note.' };
    }

    try {
      const activeUser = payload.userId ? { id: payload.userId } : this.getCurrentUser();
      const allNotes = this.getAllStructuredNotes();
      const now = new Date().toISOString();

      const existingIndex = allNotes.findIndex(
        n => n.userId === activeUser.id && n.targetId === payload.targetId
      );

      let savedNote: UserStudyNote;

      if (existingIndex >= 0) {
        // Update existing note without overwriting others
        const existing = allNotes[existingIndex];
        savedNote = {
          ...existing,
          content: cleanContent,
          targetTitle: payload.targetTitle || existing.targetTitle || 'Study Note',
          targetType: payload.targetType || existing.targetType || 'concept',
          category: payload.category || existing.category || 'General Knowledge',
          updatedAt: now,
        };
        allNotes[existingIndex] = savedNote;
      } else {
        // Create new note
        savedNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: activeUser.id,
          targetId: payload.targetId,
          targetTitle: payload.targetTitle || 'Study Note',
          targetType: payload.targetType || 'concept',
          category: payload.category || 'General Knowledge',
          content: cleanContent,
          createdAt: now,
          updatedAt: now,
        };
        allNotes.unshift(savedNote);
      }

      localStorage.setItem(STORAGE_KEYS.STRUCTURED_NOTES, JSON.stringify(allNotes));

      // Keep legacy store in sync for backwards compatibility
      try {
        const legacyMap = this.getNotes();
        legacyMap[payload.targetId] = cleanContent;
        localStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify(legacyMap));
      } catch (e) {
        // Non-critical
      }

      return { success: true, note: savedNote };
    } catch (err: any) {
      console.error('Failed to save study note:', err);
      return { success: false, error: 'Failed to persist note to local database.' };
    }
  }

  // Update existing note content by noteId
  static updateNote(noteId: string, content: string): { success: boolean; note?: UserStudyNote; error?: string } {
    const cleanContent = (content || '').trim();
    if (!cleanContent) {
      return { success: false, error: 'Note text cannot be empty.' };
    }

    try {
      const activeUser = this.getCurrentUser();
      const allNotes = this.getAllStructuredNotes();
      const noteIndex = allNotes.findIndex(n => n.id === noteId && n.userId === activeUser.id);

      if (noteIndex === -1) {
        return { success: false, error: 'Note not found or unauthorized.' };
      }

      const updatedNote: UserStudyNote = {
        ...allNotes[noteIndex],
        content: cleanContent,
        updatedAt: new Date().toISOString(),
      };

      allNotes[noteIndex] = updatedNote;
      localStorage.setItem(STORAGE_KEYS.STRUCTURED_NOTES, JSON.stringify(allNotes));
      return { success: true, note: updatedNote };
    } catch (e) {
      return { success: false, error: 'Failed to update note.' };
    }
  }

  // Delete a saved note by noteId
  static deleteNote(noteId: string): { success: boolean; error?: string } {
    try {
      const activeUser = this.getCurrentUser();
      const allNotes = this.getAllStructuredNotes();
      const noteToDelete = allNotes.find(n => n.id === noteId && n.userId === activeUser.id);
      
      const filtered = allNotes.filter(n => !(n.id === noteId && n.userId === activeUser.id));
      localStorage.setItem(STORAGE_KEYS.STRUCTURED_NOTES, JSON.stringify(filtered));

      if (noteToDelete) {
        try {
          const legacyMap = this.getNotes();
          delete legacyMap[noteToDelete.targetId];
          localStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify(legacyMap));
        } catch (e) {
          // ignore
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to delete note.' };
    }
  }

  // Quick lookup helper: gets note text string for current user
  static getNote(targetId: string): string {
    const note = this.getNoteForTarget(targetId);
    return note?.content || '';
  }

  // Legacy key-value map helper for current user
  static getNotes(): Record<string, string> {
    const userNotes = this.getUserNotes();
    const map: Record<string, string> = {};
    userNotes.forEach(n => {
      map[n.targetId] = n.content;
    });
    return map;
  }
  // Get all sets: default initial sets + user created custom sets
  static getAllSets(): StudySet[] {
    try {
      const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETS);
      const customSets: StudySet[] = customRaw ? JSON.parse(customRaw) : [];
      const sanitizedCustom: StudySet[] = Array.isArray(customSets)
        ? customSets
            .filter((s): s is StudySet => Boolean(s && typeof s === 'object' && s.id && s.title))
            .map(s => ({
              ...s,
              category: s.category || 'General Knowledge',
              concepts: Array.isArray(s.concepts)
                ? s.concepts
                    .filter((c): c is StudyConcept => Boolean(c && typeof c === 'object' && c.id && c.title))
                    .map(c => ({
                      ...c,
                      category: c.category || s.category || 'General Knowledge',
                      tags: Array.isArray(c.tags) ? c.tags : [s.category || 'General Knowledge']
                    }))
                : []
            }))
        : [];
      return [...INITIAL_STUDY_SETS, ...sanitizedCustom];
    } catch (e) {
      console.error('Failed to load study sets from localStorage', e);
      return INITIAL_STUDY_SETS;
    }
  }

  // Get a single set by ID
  static getSetById(id: string): StudySet | undefined {
    const all = this.getAllSets();
    return all.find(s => s.id === id);
  }

  // Retrieve all study sets (alias)
  static getAllStudySets(): StudySet[] {
    return this.getAllSets();
  }

  static saveStudySet(set: StudySet): void {
    this.saveCustomSet(set);
  }

  static deleteStudySet(setId: string): void {
    this.deleteCustomSet(setId);
  }

  // Save a new custom study set
  static saveCustomSet(newSet: StudySet): void {
    try {
      const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETS);
      const customSets: StudySet[] = customRaw ? JSON.parse(customRaw) : [];
      const existingIdx = customSets.findIndex(s => s.id === newSet.id);
      if (existingIdx >= 0) {
        customSets[existingIdx] = { ...newSet, updatedAt: new Date().toISOString() };
      } else {
        customSets.unshift({ ...newSet, isCustom: true, createdAt: new Date().toISOString() });
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SETS, JSON.stringify(customSets));
    } catch (e) {
      console.error('Failed to save custom set', e);
    }
  }

  // Delete a custom set
  static deleteCustomSet(setId: string): void {
    try {
      const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETS);
      if (!customRaw) return;
      const customSets: StudySet[] = JSON.parse(customRaw);
      const filtered = customSets.filter(s => s.id !== setId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SETS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete custom set', e);
    }
  }

  // Get all concept performance records
  static getPerformances(): Record<string, ConceptPerformance> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // Record a flashcard review rating
  static recordFlashcardRating(conceptId: string, rating: FlashcardRating): void {
    try {
      const performances = this.getPerformances();
      const current = performances[conceptId] || {
        conceptId,
        totalReviews: 0,
        consecutiveConfident: 0,
        needsReview: false,
        practiceCorrectCount: 0,
        practiceTotalCount: 0,
      };

      const isConfident = rating === 'knew_it' || rating === 'easy';
      const needsReview = !isConfident;

      const updated: ConceptPerformance = {
        ...current,
        totalReviews: current.totalReviews + 1,
        lastRating: rating,
        consecutiveConfident: isConfident ? current.consecutiveConfident + 1 : 0,
        needsReview: needsReview,
        lastReviewedAt: new Date().toISOString(),
      };

      performances[conceptId] = updated;
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(performances));

      // Update overall stats
      this.updateActivityMetrics(1, isConfident ? 1 : 0);
    } catch (e) {
      console.error('Failed to record flashcard rating', e);
    }
  }

  // Record formative practice response
  static recordPracticeResponse(conceptId: string, isCorrect: boolean): void {
    try {
      const performances = this.getPerformances();
      const current = performances[conceptId] || {
        conceptId,
        totalReviews: 0,
        consecutiveConfident: 0,
        needsReview: false,
        practiceCorrectCount: 0,
        practiceTotalCount: 0,
      };

      const updated: ConceptPerformance = {
        ...current,
        practiceTotalCount: current.practiceTotalCount + 1,
        practiceCorrectCount: current.practiceCorrectCount + (isCorrect ? 1 : 0),
        // If wrong in practice, flag for review
        needsReview: !isCorrect || current.needsReview,
        lastReviewedAt: new Date().toISOString(),
      };

      performances[conceptId] = updated;
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(performances));

      this.updateActivityMetrics(1, isCorrect ? 1 : 0);
    } catch (e) {
      console.error('Failed to record practice response', e);
    }
  }

  // Get list of concepts needing spaced review
  static getConceptsNeedingReview(): StudyConcept[] {
    const allSets = this.getAllSets();
    const performances = this.getPerformances();
    const allConcepts: StudyConcept[] = allSets.flatMap(s => s.concepts);

    // Prioritize concepts where needsReview === true, or rated did_not_know / almost
    const reviewConcepts = allConcepts.filter(c => {
      const perf = performances[c.id];
      if (!perf) return false;
      return perf.needsReview || perf.lastRating === 'did_not_know' || perf.lastRating === 'almost';
    });

    return reviewConcepts;
  }

  // Get interleaved review concepts across different sets/topics
  static getInterleavedReviewConcepts(limit: number = 10): StudyConcept[] {
    const allSets = this.getAllSets();
    const performances = this.getPerformances();
    const needingReview = this.getConceptsNeedingReview();

    let pool: StudyConcept[] = [];

    if (needingReview.length >= 4) {
      pool = [...needingReview];
    } else {
      // If user has few flagged review items, mix unstudied or less reviewed concepts from different sets
      const allConcepts = allSets.flatMap(s => s.concepts);
      pool = [...needingReview, ...allConcepts.filter(c => !needingReview.some(r => r.id === c.id))];
    }

    // Interleave by group/category/set so consecutive concepts are from DIFFERENT topics
    const byCategory: Record<string, StudyConcept[]> = {};
    pool.forEach(c => {
      const cat = c.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(c);
    });

    const categories = Object.keys(byCategory);
    const interleaved: StudyConcept[] = [];
    let maxLen = Math.max(...categories.map(cat => byCategory[cat].length));

    for (let i = 0; i < maxLen; i++) {
      for (const cat of categories) {
        if (byCategory[cat][i]) {
          interleaved.push(byCategory[cat][i]);
          if (interleaved.length >= limit) return interleaved;
        }
      }
    }

    return interleaved.slice(0, limit);
  }

  // Generate a tailored Study Plan recommendation based on available minutes
  static getStudyPlanRecommendation(durationMinutes: StudyPlanDuration): StudyPlanRecommendation {
    const allSets = this.getAllSets();
    const needingReview = this.getConceptsNeedingReview();
    const allConcepts = allSets.flatMap(s => s.concepts);
    const performances = this.getPerformances();

    // Target concepts count based on duration (~1 to 2 min per concept)
    const targetCount = durationMinutes === 5 
      ? 4 
      : durationMinutes === 10 
      ? 6 
      : durationMinutes === 20 
      ? 10 
      : durationMinutes === 30 
      ? 14 
      : 24; // 60 minutes
    
    // Allocate ~50% to review queue, ~50% to fresh/unstudied concepts
    const reviewPortion = Math.min(needingReview.length, Math.ceil(targetCount * 0.5));
    const selectedReview = needingReview.slice(0, reviewPortion);

    const unstudied = allConcepts.filter(c => !performances[c.id]);
    const studiedConfident = allConcepts.filter(c => performances[c.id] && !performances[c.id].needsReview);

    const remainingCount = targetCount - selectedReview.length;
    let freshPortion: StudyConcept[] = [];

    if (unstudied.length >= remainingCount) {
      freshPortion = unstudied.slice(0, remainingCount);
    } else {
      freshPortion = [...unstudied, ...studiedConfident.slice(0, remainingCount - unstudied.length)];
    }

    // Interleave them so review and new concepts alternate
    const combined: StudyConcept[] = [];
    const max = Math.max(selectedReview.length, freshPortion.length);
    for (let i = 0; i < max; i++) {
      if (selectedReview[i]) combined.push(selectedReview[i]);
      if (freshPortion[i]) combined.push(freshPortion[i]);
    }

    const title = `${durationMinutes}-Minute Micro-Study Session`;
    const rationale = selectedReview.length > 0 
      ? `Prioritizes ${selectedReview.length} concept${selectedReview.length === 1 ? '' : 's'} needing spaced reinforcement, combined with ${freshPortion.length} core learning topic${freshPortion.length === 1 ? '' : 's'}.`
      : `Covers ${freshPortion.length} foundational concepts with active recall and self-explanation feedback.`;

    return {
      durationMinutes,
      title,
      description: `Optimized study cycle with active recall, formative practice, and concept reinforcement.`,
      concepts: combined.slice(0, targetCount),
      reviewCount: selectedReview.length,
      newCount: freshPortion.length,
      rationale,
    };
  }

  // Get stats alias
  static getUserStats(): UserStats {
    return this.getStats();
  }

  // Record practice answer alias
  static recordPracticeAnswer(conceptId: string, isCorrect: boolean): void {
    this.recordPracticeResponse(conceptId, isCorrect);
  }

  // Record session result alias
  static recordSessionResult(result: SessionResult): void {
    this.saveSession(result);
  }

  // --- STATS & SESSIONS ---
  static getStats(): UserStats {
    const defaultStats: UserStats = {
      sessionsCompleted: 0,
      questionsAnswered: 0,
      conceptsStudied: 0,
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      reviewsCompleted: 0,
      subjectMastery: {},
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!raw) return defaultStats;
      const stats = JSON.parse(raw);
      return { ...defaultStats, ...stats };
    } catch (e) {
      return defaultStats;
    }
  }

  static saveSession(result: SessionResult): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      const history: SessionResult[] = raw ? JSON.parse(raw) : [];
      history.unshift(result);
      // Keep last 40 sessions
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history.slice(0, 40)));

      // Update aggregate stats
      const stats = this.getStats();
      const today = new Date().toISOString().split('T')[0];
      let newStreak = stats.streakDays;

      if (stats.lastStudyDate) {
        const last = new Date(stats.lastStudyDate);
        const curr = new Date(today);
        const diffTime = Math.abs(curr.getTime() - last.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      const updatedStats: UserStats = {
        ...stats,
        sessionsCompleted: stats.sessionsCompleted + 1,
        conceptsStudied: stats.conceptsStudied + result.totalConcepts,
        reviewsCompleted: stats.reviewsCompleted + (result.mode === 'review' ? result.totalConcepts : 0),
        streakDays: newStreak,
        lastStudyDate: today,
      };

      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
    } catch (e) {
      console.error('Failed to save session result', e);
    }
  }

  static getSessionHistory(): SessionResult[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  private static updateActivityMetrics(additionalInteractions: number, additionalConfident: number): void {
    try {
      const stats = this.getStats();
      const updated: UserStats = {
        ...stats,
        questionsAnswered: stats.questionsAnswered + additionalInteractions,
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
    } catch (e) {
      // Silent error handling
    }
  }
}
