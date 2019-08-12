import { Question } from './Game';
import { QuestionForGame } from '../shared/types';

export function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sanitizeQuestion(q: Question): QuestionForGame {
  const answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

  return {
    question: q.question,
    answers,
  };
}
