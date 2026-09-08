import { Quiz } from '../types';

const STORAGE_KEY_RECENT_QUIZZES = 'proudly_afrikan_recent_quizzes';
const STORAGE_KEY_SAVED_ATTEMPTS = 'proudly_afrikan_quiz_attempts';

/**
 * Encode a quiz object into a safe URL hash or query string
 */
export function encodeQuizToUrl(quiz: Quiz): string {
  try {
    const compactObj = {
      t: quiz.title,
      d: quiz.description,
      s: quiz.topicOrSource,
      m: quiz.creationMethod,
      st: quiz.settings,
      q: quiz.questions.map((q) => ({
        id: q.id,
        t: q.type,
        q: q.question,
        o: q.options,
        a: q.correctAnswer,
        e: q.explanation,
      })),
    };
    const json = JSON.stringify(compactObj);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('quiz', encoded);
    return url.toString();
  } catch (err) {
    console.error('Failed to encode quiz to URL', err);
    return window.location.href;
  }
}

/**
 * Decode a quiz from URL query string if present
 */
export function decodeQuizFromUrl(): Quiz | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('quiz');
    if (!encoded) return null;

    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(json);

    if (!parsed || !parsed.q || !Array.isArray(parsed.q)) return null;

    return {
      id: `shared_${Date.now()}`,
      title: parsed.t || 'Shared Quiz',
      description: parsed.d || '',
      topicOrSource: parsed.s || 'Shared link',
      creationMethod: parsed.m || 'topic',
      settings: parsed.st || {
        questionCount: parsed.q.length,
        difficulty: 'medium',
        questionType: 'multiple_choice',
        educationLevel: 'general',
        subject: 'General',
      },
      createdAt: new Date().toISOString(),
      questions: parsed.q.map((q: any, index: number) => ({
        id: q.id || `q_${index + 1}`,
        type: q.t || 'multiple_choice',
        question: q.q,
        options: q.o,
        correctAnswer: q.a,
        explanation: q.e,
      })),
    };
  } catch (err) {
    console.warn('Could not decode quiz from URL query', err);
    return null;
  }
}

/**
 * Save quiz into local history
 */
export function saveRecentQuiz(quiz: Quiz) {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_RECENT_QUIZZES);
    const list: Quiz[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = list.filter((item) => item.id !== quiz.id);
    filtered.unshift(quiz);
    // Keep last 10
    localStorage.setItem(STORAGE_KEY_RECENT_QUIZZES, JSON.stringify(filtered.slice(0, 10)));
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
}

/**
 * Get recent quizzes from local storage
 */
export function getRecentQuizzes(): Quiz[] {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_RECENT_QUIZZES);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch {
    return [];
  }
}
