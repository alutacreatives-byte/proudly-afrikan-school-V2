import { Question } from '../types';

export function randomizeQuestionOptions(question: Question): Question;
export function randomizeQuestionOptions(questions: Question[]): Question[];
export function randomizeQuestionOptions(target: Question | Question[]): Question | Question[] {
  if (Array.isArray(target)) {
    return target.map((q) => randomizeQuestionOptions(q));
  }
  if (!target.options || target.options.length <= 1) {
    return target;
  }
  const shuffled = [...target.options].sort(() => Math.random() - 0.5);
  return {
    ...target,
    options: shuffled,
  };
}
