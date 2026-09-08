import { Question } from '../types';

/**
 * Modern Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a balanced, naturally randomized sequence of target slots (0: A, 1: B, 2: C, 3: D)
 * - Guarantees roughly equal distribution (e.g. 2-3 per option for 10 questions)
 * - Prevents excessive clustering (no 3 identical consecutive answers)
 * - Varies from quiz to quiz
 */
export function generateBalancedTargetSequence(count: number, slotsCount = 4): number[] {
  if (count <= 0) return [];
  
  const pool: number[] = [];
  const fullSets = Math.floor(count / slotsCount);
  const remainder = count % slotsCount;

  // Add full sets of [0, 1, 2, 3]
  for (let i = 0; i < fullSets; i++) {
    const set = shuffleArray([0, 1, 2, 3].slice(0, slotsCount));
    pool.push(...set);
  }

  // Add remaining slots from a shuffled set
  if (remainder > 0) {
    const partial = shuffleArray([0, 1, 2, 3].slice(0, slotsCount)).slice(0, remainder);
    pool.push(...partial);
  }

  // Overall shuffle for natural variety
  let sequence = shuffleArray(pool);

  // De-clustering pass: avoid 3 identical slots in a row (e.g. A, A, A)
  for (let i = 2; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1] && sequence[i] === sequence[i - 2]) {
      // Find another index to swap with
      for (let j = 0; j < sequence.length; j++) {
        if (
          sequence[j] !== sequence[i] &&
          (j < 1 || sequence[j - 1] !== sequence[i]) &&
          (j > sequence.length - 2 || sequence[j + 1] !== sequence[i])
        ) {
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
          break;
        }
      }
    }
  }

  return sequence;
}

/**
 * Programmatically shuffles options for all questions in a quiz:
 * - Distributes Multiple Choice correct answers across A (0), B (1), C (2), D (3)
 * - Keeps True/False in standard order ["True", "False"]
 * - Maintains exact string identity for scoring and answer review
 */
export function randomizeQuestionOptions(questions: Question[]): Question[] {
  if (!questions || questions.length === 0) return [];

  const mcQuestionsCount = questions.filter((q) => q.type !== 'true_false').length;
  const targetSlots = generateBalancedTargetSequence(mcQuestionsCount, 4);
  let mcIndex = 0;

  return questions.map((q) => {
    if (q.type === 'true_false') {
      // Preserve clean True/False structure
      const isTrue = /true|yes/i.test(String(q.correctAnswer));
      return {
        ...q,
        options: ['True', 'False'],
        correctAnswer: isTrue ? 'True' : 'False',
      };
    }

    // Multiple Choice
    const correctVal = String(q.correctAnswer || '').trim();
    const rawOptions = Array.isArray(q.options)
      ? q.options.map((opt) => String(opt).trim())
      : [];

    // Filter distinct distractors
    let distractors = rawOptions.filter((opt) => opt !== correctVal && opt.length > 0);
    distractors = Array.from(new Set(distractors));

    // Ensure we have 3 distractors
    const fallbackDistractors = [
      'None of the above',
      'Alternative perspective',
      'Secondary factor',
      'Historical antecedent',
    ];
    let fbIdx = 0;
    while (distractors.length < 3) {
      const fallback = fallbackDistractors[fbIdx % fallbackDistractors.length];
      if (!distractors.includes(fallback) && fallback !== correctVal) {
        distractors.push(fallback);
      }
      fbIdx++;
    }

    if (distractors.length > 3) {
      distractors = distractors.slice(0, 3);
    }

    // Shuffle the 3 distractors
    const shuffledDistractors = shuffleArray(distractors);

    // Pick target slot for this question
    const targetSlot = targetSlots[mcIndex] ?? Math.floor(Math.random() * 4);
    mcIndex++;

    // Insert correct answer at the chosen targetSlot (0 = A, 1 = B, 2 = C, 3 = D)
    const finalOptions = [...shuffledDistractors];
    finalOptions.splice(targetSlot, 0, correctVal);

    return {
      ...q,
      options: finalOptions,
      correctAnswer: correctVal,
    };
  });
}
