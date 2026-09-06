import { Quiz } from '../types';

const RECENT_QUIZZES_KEY = 'proudly_afrikan_recent_quizzes';

export function getRecentQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(RECENT_QUIZZES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse recent quizzes', e);
    return [];
  }
}

export function saveRecentQuiz(quiz: Quiz): void {
  try {
    const existing = getRecentQuizzes();
    const filtered = existing.filter((q) => q.id !== quiz.id);
    const updated = [quiz, ...filtered].slice(0, 30);
    localStorage.setItem(RECENT_QUIZZES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save quiz to storage', e);
  }
}

export function encodeQuizToUrl(quiz: Quiz): string {
  try {
    const str = JSON.stringify(quiz);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(str))));
  } catch (e) {
    console.error('Failed to encode quiz', e);
    return '';
  }
}

export const encodeQuizForUrl = encodeQuizToUrl;

export function decodeQuizFromUrl(encoded?: string): Quiz | null {
  try {
    const raw = encoded || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('quiz') || window.location.hash.slice(1)) : '');
    if (!raw) return null;
    const decoded = decodeURIComponent(escape(atob(decodeURIComponent(raw))));
    return JSON.parse(decoded) as Quiz;
  } catch (e) {
    console.error('Failed to decode quiz from URL', e);
    return null;
  }
}
