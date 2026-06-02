import { Deck, Flashcard, UserStats } from './types';

export const INITIAL_USER_STATS: UserStats = {
  cardsMastered: 0,
  currentStreak: 0,
  userName: 'Operator',
  masteredCount: 0,
  streakDays: 0,
  completionRatio: 0,
  weeklyLog: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
};

export const INITIAL_DECKS: Deck[] = [];

export const INITIAL_CARDS: Flashcard[] = [];
