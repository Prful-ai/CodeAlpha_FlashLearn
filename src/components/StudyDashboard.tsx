import React, { useEffect, useState } from 'react';
import { Brain, Globe, Activity, Dna, Play, ChevronRight, Sparkles, Flame, Plus } from 'lucide-react';
import { Deck, Flashcard, UserStats } from '../types';

interface StudyDashboardProps {
  decks: Deck[];
  cards: Flashcard[];
  userStats: UserStats;
  studiedToday: number;
  onSelectDeck: (deckId: string) => void;
  onStartStudy: (deckId: string) => void;
  onOpenAddDeck: () => void;
}

export const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Globe,
  Activity,
  Dna,
};

export default function StudyDashboard({
  decks,
  cards,
  userStats,
  studiedToday,
  onSelectDeck,
  onStartStudy,
  onOpenAddDeck,
}: StudyDashboardProps) {
  // Animating progress bar values after render
  const [animate, setAnimate] = useState(false);
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'MASTERY' | 'DUE'>('DEFAULT');

  const [dailyTarget, setDailyTarget] = useState(20);
  const [isGoalCompleted, setIsGoalCompleted] = useState(false);

  useEffect(() => {
    setIsGoalCompleted(studiedToday >= dailyTarget);
  }, [studiedToday, dailyTarget]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Compute sorted decks
  const sortedDecks = [...decks].sort((a, b) => {
    if (sortBy === 'MASTERY') {
      const totalA = a.cardsCount || 0;
      const totalB = b.cardsCount || 0;
      const ratioA = totalA ? (a.learnedCount / totalA) : 0;
      const ratioB = totalB ? (b.learnedCount / totalB) : 0;
      return ratioB - ratioA; // Sort highest mastery first
    }
    if (sortBy === 'DUE') {
      const dueA = a.newCount + a.reviewCount;
      const dueB = b.newCount + b.reviewCount;
      return dueB - dueA; // Sort most urgent reviews first
    }
    return 0; // Maintain default initial order
  });

  // Calculate dynamic left cards counts and total cards
  // The screenshot shows "You have 42 cards due today". Let's gather the sum of unstudied/review cards in our system!
  const reviewOrNewCardsCount = cards.filter(c => c.status === 'new' || c.status === 'review').length;

  // Let's get the most recently added 3 cards dynamically!
  const recentCards = cards.slice(-3).reverse();

  // Compute real-time overall deck completion ratio as a precise percentage equation: (Total Learned Cards / Total Cards across all decks) * 100
  const totalLearnedCards = cards.filter(c => c.status === 'learned').length;
  const totalCardsCount = cards.length;
  const completionRatio = totalCardsCount > 0 ? (totalLearnedCards / totalCardsCount) * 100 : 0;

  // Structured 7-day tracking array representing cards studied per day dynamically sourced from UserStats
  const weeklyActivity = [
    { day: "MON //", count: userStats?.weeklyLog?.mon ?? 0 },
    { day: "TUE //", count: userStats?.weeklyLog?.tue ?? 0 },
    { day: "WED //", count: userStats?.weeklyLog?.wed ?? 0 },
    { day: "THU //", count: userStats?.weeklyLog?.thu ?? 0 },
    { day: "FRI //", count: userStats?.weeklyLog?.fri ?? 0 },
    { day: "SAT //", count: userStats?.weeklyLog?.sat ?? 0 },
    { day: "SUN //", count: userStats?.weeklyLog?.sun ?? 0 },
  ];
  const maxVolume = Math.max(...weeklyActivity.map(w => w.count), 1);

  return (
    <div className="space-y-6 pt-4 pb-20 animate-in fade-in duration-500">
      {/* Welcome Greetings Section */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-on-background tracking-tight">
            Welcome back, {userStats.userName}.
          </h2>
          <p className="text-on-surface-variant/80 font-sans text-sm mt-0.5">
            Ready to beat yesterday's record?
          </p>
        </div>

        {/* Stats Pills / Bento Grid in row form for modern look */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#111111] border border-zinc-800 rounded-full shadow-sm hover:border-[#E0FF00]/30 transition-colors">
            <Sparkles className="w-4 h-4 text-[#E0FF00] fill-current" />
            <span className="text-sm font-bold text-white">{userStats.cardsMastered.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-[0.2em] ml-1">Mastered</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#111111] border border-zinc-800 rounded-full shadow-sm hover:border-[#E0FF00]/30 transition-colors">
            <Flame className="w-4 h-4 text-[#E0FF00] fill-current" />
            <span className="text-sm font-bold text-white">{userStats.currentStreak} Days</span>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-[0.2em] ml-1">Streak</span>
          </div>
        </div>
      </section>

      {/* Swiss Modernist Performance Metrics Graph */}
      {decks.length === 0 ? (
        <section className="bg-[#111111] border-2 border-dashed border-zinc-800 rounded-[32px] p-8 md:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[310px] animate-in fade-in zoom-in-95 duration-500">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 text-[#E0FF00] flex items-center justify-center">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-display text-lg font-black text-white uppercase tracking-wider">
              NO DECKS ENROLLED //
            </h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed uppercase tracking-normal">
              INITIALIZE CORE WORKSPACE SYSTEM TO BEGIN.
            </p>
          </div>
          <button
            onClick={onOpenAddDeck}
            className="bg-[#E0FF00] text-black px-6 py-3.5 rounded-xl font-display font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(224,255,0,0.3)] hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            <span>[ + CREATE NEW DECK ]</span>
          </button>
        </section>
      ) : (
        <>
          <section id="weekly-velocity-section" className="bg-[#111111] border border-zinc-850 rounded-[32px] p-6 md:p-8 space-y-6">
            {/* Header Context Block */}
            <div id="velocity-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-4 select-none">
              <h3 id="velocity-header-title" className="font-display text-xs font-black uppercase tracking-[0.3em] text-white">
                WEEKLY VELOCITY METER //
              </h3>
              <span id="velocity-header-ratio" className="font-mono text-xs font-bold text-[#E0FF00] uppercase tracking-wider">
                COMPLETION RATIO: {completionRatio.toFixed(1)}%
              </span>
            </div>

            {/* Brutalist Chart Layout */}
            <div id="velocity-rows-container" className="space-y-4">
              {weeklyActivity.map((item) => {
                const widthPercent = (item.count / maxVolume) * 100;
                return (
                  <div 
                    id={`velocity-row-${item.day.slice(0, 3).toLowerCase()}`}
                    key={item.day} 
                    className="flex items-center gap-4 text-xs font-mono"
                  >
                    {/* Day Label with fixed-width */}
                    <div className="w-16 text-zinc-500 font-black tracking-widest text-[11px] shrink-0 select-none">
                      {item.day}
                    </div>

                    {/* Horizontal Progress Track Wrapper */}
                    <div className="flex-1 bg-[#1E293B] h-4 rounded-sm overflow-hidden relative">
                      <div
                        className="bg-[#E0FF00] h-full rounded-sm transition-all duration-1000 ease-out"
                        style={{ width: animate ? `${widthPercent}%` : '0%' }}
                      />
                    </div>

                    {/* Monospaced indicator displaying exact volume count */}
                    <div className="w-24 text-right text-zinc-400 font-black text-[11px] shrink-0 select-none">
                      [{item.count} CARDS]
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Primary CTA Area / Beautiful Study Banner */}
          <section 
            onClick={() => {
              // Study the deck with the most unstudied cards
              if (decks.length > 0) {
                onStartStudy(decks[0].id);
              }
            }}
            className="relative group cursor-pointer overflow-hidden rounded-[32px] h-48 flex items-center justify-center transition-transform active:scale-[0.98] shadow-md border border-zinc-800"
          >
            <img
              alt="Study workspace with notebook, pen, and coffee representing focused calm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-snk9XWQn7AvKvCfdNj33LvrL4t1XEcQZIfh_3JsBKtsKKfgwvEQLdqJeqGFCmC0GS58ohb5M6OlrhiXAEHoLUsquqq-rj4EgFlF35Lv1K-eeOXZvGaQD3BbQ2QBUFAlKyMbhOrL80hS63wQ2GIOkhqbHLoVu4gtDLzLqS9UdUvRK8DszXR4RYW7hpiR4xJ8jLLSuV-6CcfZRBMMJ326PjBd3h8YKRFdZRPg7nkMLWgKSmRxvZPGnUk3oG4yRPt8lZWipf3NJTNCl"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.4]"
              referrerPolicy="no-referrer"
            />
            {/* Navy/Blue Gradient over photo for visual stability */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A]/95 via-zinc-950/70 to-transparent flex flex-col items-start justify-center p-8 text-left">
              <h3 className="font-display text-2xl md:text-3xl font-black text-white leading-tight mb-4 tracking-tighter uppercase">
                You have <span className="text-[#E0FF00]">{reviewOrNewCardsCount} cards</span><br />due today
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (decks.length > 0) {
                    onStartStudy(decks[0].id);
                  }
                }}
                className="bg-[#E0FF00] text-black px-6 py-3 rounded-xl font-display font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(224,255,0,0.4)] hover:bg-white hover:scale-105 transition-all flex items-center gap-2 text-xs active:scale-95 cursor-pointer border-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Studying</span>
              </button>
            </div>
          </section>

          {/* Quick Practice Section containing interactive progress card for each Deck */}
          <section className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <h3 className="font-display text-xs uppercase tracking-[0.3em] font-extrabold text-zinc-400">Quick Practice</h3>
              <button 
                onClick={onOpenAddDeck}
                className="text-[#E0FF00] hover:text-white font-display text-xs font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer transition-colors"
              >
                Add New Deck
              </button>
            </div>

            {/* Minimalist Sorting Control Row */}
            <div id="deck-sorting-controls" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono border-b border-zinc-900 pb-3 mb-4 px-1 select-none">
              <span className="text-zinc-500 uppercase tracking-wider">SORT BY //</span>
              <button
                id="sort-btn-default"
                onClick={() => setSortBy('DEFAULT')}
                className={`font-mono uppercase transition-colors hover:text-white bg-transparent border-0 cursor-pointer p-0 font-bold ${
                  sortBy === 'DEFAULT' ? 'text-[#E0FF00]' : 'text-slate-500'
                }`}
              >
                [DEFAULT]
              </button>
              <button
                id="sort-btn-mastery"
                onClick={() => setSortBy('MASTERY')}
                className={`font-mono uppercase transition-colors hover:text-white bg-transparent border-0 cursor-pointer p-0 font-bold ${
                  sortBy === 'MASTERY' ? 'text-[#E0FF00]' : 'text-slate-500'
                }`}
              >
                [MASTERY RATIO]
              </button>
              <button
                id="sort-btn-due"
                onClick={() => setSortBy('DUE')}
                className={`font-mono uppercase transition-colors hover:text-white bg-transparent border-0 cursor-pointer p-0 font-bold ${
                  sortBy === 'DUE' ? 'text-[#E0FF00]' : 'text-slate-500'
                }`}
              >
                [DUE REVIEWS]
              </button>
            </div>

            {/* Daily Goal Tracker checklist module */}
            <div 
              id="daily-goal-tracker" 
              className="bg-[#0A0A0A] border-2 border-slate-800 rounded-3xl p-5 mb-5 select-none text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                <h4 className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-[#E0FF00]">
                  DAILY TARGET VERIFICATION //
                </h4>
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <span className="uppercase font-bold">TARGET //</span>
                  <button 
                    onClick={() => {
                      const newTarget = prompt("ENTER NEW DAILY TARGET:", String(dailyTarget));
                      if (newTarget) {
                        const parsed = parseInt(newTarget, 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          setDailyTarget(parsed);
                        }
                      }
                    }}
                    className="text-[#E0FF00] hover:underline bg-transparent border-0 cursor-pointer p-0 font-bold"
                  >
                    [{dailyTarget} CARDS]
                  </button>
                </div>
              </div>

              <div 
                id="goal-check-row-item" 
                className={`flex items-center gap-3 font-mono text-xs transition-all duration-300 ${
                  isGoalCompleted 
                    ? 'text-[#E0FF00] drop-shadow-[0_0_8px_#E0FF00]' 
                    : 'text-zinc-300'
                }`}
              >
                <span id="goal-check-symbol" className="font-mono text-sm font-black select-none">
                  {isGoalCompleted ? '[X]' : '[ ]'}
                </span>
                <span className="uppercase tracking-wider font-bold">
                  CRITICAL CARD CAP LIMIT REACHED: {studiedToday} / {dailyTarget} CARDS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedDecks.map((deck) => {
                const CustomIcon = IconMap[deck.icon] || Brain;
                
                // Calculate dynamic percentages
                const total = deck.cardsCount;
                // Let's assume progress bar represents percentage of cards learned:
                const learnedPercent = total > 0 ? (deck.learnedCount / total) * 100 : 0;
                const remainingCount = deck.newCount + deck.reviewCount;

                return (
                  <div
                    key={deck.id}
                    onClick={() => onSelectDeck(deck.id)}
                    className="quick-practice-card group flex flex-col p-6 bg-[#111111] rounded-[32px] border border-zinc-800 hover:border-[#E0FF00]/40 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden pb-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E0FF00]">
                        <CustomIcon className="w-5 h-5" />
                      </div>
                      <span className="text-zinc-500 font-mono text-xs">
                        {remainingCount} / {total} CARDS
                      </span>
                      <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-[#E0FF00] transition-colors" />
                    </div>

                    <div className="mb-2">
                      <h4 className="font-display font-black text-white group-hover:text-[#E0FF00] transition-colors text-lg uppercase tracking-tight">
                        {deck.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans line-clamp-1 mt-0.5">
                        {deck.desc}
                      </p>
                    </div>

                    {/* Spaced-repetition tags */}
                    <div className="flex gap-1.5 mt-1.5 mb-3 flex-wrap">
                      <span className="bg-zinc-900 text-[#E0FF00] border border-zinc-800 px-2 py-0.5 rounded-md text-[9px] font-display font-black uppercase tracking-widest">
                        {deck.tag}
                      </span>
                      <span className="bg-zinc-900/50 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-md text-[9px] font-display uppercase font-bold tracking-wider">
                        {deck.learnedCount} learned
                      </span>
                    </div>

                    {/* Progress Bar Container with lazy slide effect */}
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#E0FF00] h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: animate ? `${learnedPercent}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Activity Asymmetric List Section */}
          <section className="space-y-4">
            <h3 className="font-display text-xs uppercase tracking-[0.3em] font-extrabold text-zinc-400">Recently Added Cards</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-container-padding px-container-padding snap-x no-scrollbar">
              {recentCards.map((card, idx) => {
                const associatedDeck = decks.find(d => d.id === card.deckId);
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (associatedDeck) {
                        onSelectDeck(associatedDeck.id);
                      }
                    }}
                    className="bg-[#111111] border border-zinc-800 hover:border-[#E0FF00]/40 cursor-pointer p-5 rounded-[24px] snap-start min-w-[280px] flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="text-[9px] uppercase font-display tracking-[0.2em] text-[#E0FF00] font-black mb-1">
                        {associatedDeck?.name || 'Flashcard'}
                      </div>
                      <p className="text-zinc-200 font-sans text-sm line-clamp-3 leading-relaxed italic mb-3">
                        "{card.question}"
                      </p>
                    </div>
                    <div className="font-display text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                      {card.lastStudiedText}
                    </div>
                  </div>
                );
              })}
              
              {recentCards.length === 0 && (
                <div className="text-center py-6 text-outline font-sans text-sm w-full">
                  No recent cards found. Add some in a deck to begin!
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
