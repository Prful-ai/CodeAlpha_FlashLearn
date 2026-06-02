export interface Deck {
  id: string;
  name: string;
  desc: string;
  tag: string;
  icon: string; // lucide icon name
  category: string;
  cardsCount: number;
  newCount: number;
  reviewCount: number;
  learnedCount: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  status: 'new' | 'review' | 'learned';
  lastStudiedText: string;
}

export interface UserStats {
  cardsMastered: number;
  currentStreak: number;
  userName: string;
  masteredCount: number;
  streakDays: number;
  completionRatio: number;
  weeklyLog: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
  decks?: Deck[];
  cards?: Flashcard[];
}
