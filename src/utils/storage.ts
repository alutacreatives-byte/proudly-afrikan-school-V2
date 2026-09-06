import { StudySet, PlannerTask, QuizResult, UserProfile } from '../types';
import { CURATED_SETS } from '../data/curatedSets';

const SETS_KEY = 'proudly_afrikan_sets_v1';
const PLANNER_KEY = 'proudly_afrikan_planner_v1';
const QUIZ_HISTORY_KEY = 'proudly_afrikan_quiz_history_v1';
const PROFILE_KEY = 'proudly_afrikan_profile_v1';

export function getStoredSets(): StudySet[] {
  try {
    const raw = localStorage.getItem(SETS_KEY);
    if (!raw) {
      localStorage.setItem(SETS_KEY, JSON.stringify(CURATED_SETS));
      return CURATED_SETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CURATED_SETS;
  } catch (e) {
    return CURATED_SETS;
  }
}

export function saveStoredSets(sets: StudySet[]) {
  try {
    localStorage.setItem(SETS_KEY, JSON.stringify(sets));
  } catch (e) {
    console.error('Failed to save sets to storage:', e);
  }
}

export function getStoredPlannerTasks(): PlannerTask[] {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    if (!raw) {
      const todayStr = new Date().toISOString().split('T')[0];
      const defaultTasks: PlannerTask[] = [
        {
          id: 'task-1',
          title: 'Review Mansa Musa & Mali Trade Economics',
          subject: 'African History',
          date: todayStr,
          time: '16:00',
          durationMinutes: 30,
          completed: false,
          priority: 'high',
          associatedSetId: 'mansa-musa-empire'
        },
        {
          id: 'task-2',
          title: 'AfCFTA Rules of Origin & Intra-African Supply Chains',
          subject: 'Economics',
          date: todayStr,
          time: '17:30',
          durationMinutes: 45,
          completed: false,
          priority: 'medium',
          associatedSetId: 'afcfta-economics'
        },
        {
          id: 'task-3',
          title: 'Great Rift Valley Tectonic Plates Revision',
          subject: 'Earth Science',
          date: todayStr,
          time: '19:00',
          durationMinutes: 25,
          completed: false,
          priority: 'low',
          associatedSetId: 'rift-valley-geology-ecology'
        }
      ];
      localStorage.setItem(PLANNER_KEY, JSON.stringify(defaultTasks));
      return defaultTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredPlannerTasks(tasks: PlannerTask[]) {
  try {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save planner tasks:', e);
  }
}

export function getStoredQuizHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordQuizResult(result: QuizResult) {
  try {
    const history = getStoredQuizHistory();
    const updated = [result, ...history].slice(0, 50);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));

    // Update user profile XP
    const profile = getStoredProfile();
    profile.cowriesXP += result.xpEarned;
    saveStoredProfile(profile);
  } catch (e) {
    console.error('Failed to record quiz result:', e);
  }
}

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const defaultProfile: UserProfile = {
        name: 'Amina Adebayo',
        institution: 'University of Ibadan / African Leadership Academy',
        country: 'Nigeria',
        streakDays: 14,
        cowriesXP: 2450,
        plan: 'pro',
        studyGoalDailyMinutes: 45,
        badges: [
          {
            id: 'b-1',
            name: 'Mansa Musa Scholar',
            description: 'Mastered 5 historical and economic study sets',
            icon: 'Crown',
            unlockedAt: '2026-02-14'
          },
          {
            id: 'b-2',
            name: 'Timbuktu Scribe',
            description: 'Created 3 custom flashcard decks in the Build studio',
            icon: 'BookOpen',
            unlockedAt: '2026-02-20'
          },
          {
            id: 'b-3',
            name: 'Kilimanjaro Summit',
            description: 'Achieved 100% on an advanced adaptive science quiz',
            icon: 'Mountain',
            unlockedAt: '2026-03-01'
          }
        ]
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      name: 'Scholar',
      institution: 'Proudly Afrikan School',
      country: 'Pan-Africa',
      streakDays: 1,
      cowriesXP: 100,
      plan: 'pro',
      studyGoalDailyMinutes: 30,
      badges: []
    };
  }
}

export function saveStoredProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}
