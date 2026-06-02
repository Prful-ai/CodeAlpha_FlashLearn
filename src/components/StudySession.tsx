import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowLeft, ArrowRight, Eye, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Deck, Flashcard } from '../types';

interface StudySessionProps {
  deck: Deck;
  cards: Flashcard[];
  onBack: () => void;
  onGradeCard: (cardId: string, grade: 'again' | 'good' | 'easy') => void;
}

export default function StudySession({
  deck,
  cards,
  onBack,
  onGradeCard,
}: StudySessionProps) {
  // Filter cards belonging to this deck
  const studyCards = cards.filter((c) => c.deckId === deck.id);
  
  // Active card index state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Conditional rendering state for recalling answers
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Session timer state in seconds
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeCard = studyCards[activeCardIndex];
  
  // Calculate percentage progress in study deck
  const progressPercent = studyCards.length > 0 ? ((activeCardIndex + 1) / studyCards.length) * 105 : 0;

  // Handle scoring card based on standard spaced-repetition feedback
  const handleScoreGrade = (grade: 'again' | 'good' | 'easy') => {
    if (!activeCard) return;
    onGradeCard(activeCard.id, grade);
    
    // Reset answer revealed state
    setIsAnswerRevealed(false);
    
    // Automatically advance to the next card in line
    if (activeCardIndex < studyCards.length - 1) {
      setActiveCardIndex((prev) => prev + 1);
    } else {
      // Wrap back to beginning of study session for continuous retention reinforcement
      setActiveCardIndex(0);
    }
  };

  const handlePrevious = () => {
    setIsAnswerRevealed(false);
    if (activeCardIndex > 0) {
      setActiveCardIndex((prev) => prev - 1);
    } else {
      // Loop around to end of pool
      setActiveCardIndex(studyCards.length - 1);
    }
  };

  const handleNext = () => {
    setIsAnswerRevealed(false);
    if (activeCardIndex < studyCards.length - 1) {
      setActiveCardIndex((prev) => prev + 1);
    } else {
      // Loop around to beginning of pool
      setActiveCardIndex(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsAnswerRevealed((prev) => !prev);
      } else if (isAnswerRevealed) {
        if (e.key === '1') {
          handleScoreGrade('again');
        } else if (e.key === '2') {
          handleScoreGrade('good');
        } else if (e.key === '3') {
          handleScoreGrade('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnswerRevealed, activeCardIndex, studyCards, handleScoreGrade]);

  // If there are no cards in the deck
  if (studyCards.length === 0) {
    return (
      <div className="pt-8 pb-20 max-w-md mx-auto text-center space-y-6">
        <div id="no-cards-container" className="p-8 bg-[#111111] rounded-3xl border border-zinc-800 shadow-xl">
          <p className="text-zinc-400 font-sans text-sm mb-6">
            There are no cards in the "{deck.name}" deck to study yet.
          </p>
          <button
            id="exit-empty-session"
            onClick={onBack}
            className="px-6 py-3 bg-[#E0FF00] text-black hover:bg-white rounded-xl font-display font-black text-xs tracking-wider uppercase cursor-pointer border-0 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div id="study-session-view" className="relative pb-32 pt-4 flex flex-col items-center max-w-lg mx-auto w-full gap-5 animate-in fade-in duration-500">
      
      {/* Session Progress Header */}
      <div id="session-header-progress" className="w-full space-y-3.5 mt-2">
        <div className="flex items-center justify-between w-full">
          <button
            id="btn-exit-study"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#E0FF00] hover:text-white text-xs font-display font-black uppercase tracking-widest bg-transparent border-0 cursor-pointer p-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Study Session</span>
          </button>

          {/* Session Time Counter */}
          <div id="session-time-counter" className="flex items-center gap-1.5 text-zinc-500 font-mono text-xs select-none">
            <span className="text-[9px] font-display font-black uppercase tracking-wider text-zinc-600">SESSION TIME //</span>
            <span className="text-[#E0FF00] font-bold">{formatTime(sessionSeconds)}</span>
          </div>
        </div>

        {/* Thin top horizontal progress indicator */}
        <div id="progress-track" className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800/80">
          <div
            id="progress-bar-fill"
            className="bg-[#E0FF00] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Deck metadata & card counts */}
        <div id="deck-meta-row" className="flex items-center justify-between w-full select-none">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-display">
            {deck.name}
          </span>
          <span className="text-xs text-zinc-400 font-mono bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
            {activeCardIndex + 1} / {studyCards.length}
          </span>
        </div>
      </div>

      {/* Main Flashcard Working Area */}
      <div className="w-full perspective-1000 relative min-h-[350px] md:min-h-[390px]">
        {/* Flippable Drawer Inner Wrapper */}
        <div 
          id={`flashcard-${activeCard.id}`}
          className={`absolute inset-0 w-full h-full preserve-3d transition-transform duration-500 ease-in-out ${
            isAnswerRevealed ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE (Question) */}
          <div className="absolute inset-0 w-full h-full bg-[#111111] border border-zinc-850 rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col justify-between backface-hidden hover:border-zinc-800">
            {/* Card Title Metadata Header */}
            <div id="card-metadata-front" className="flex items-center justify-between w-full select-none">
              <span className="bg-zinc-900 border border-zinc-800 text-[#E0FF00] px-3 py-1 rounded-lg text-[9px] font-display font-black uppercase tracking-widest leading-none">
                {deck.tag}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                {activeCard.status === 'new' ? 'Unstudied New' : activeCard.status === 'review' ? 'In Review' : 'Mastered'}
              </span>
            </div>

            {/* Core Question Text Box */}
            <div id="card-question-box" className="my-auto py-4 text-center flex flex-col justify-center items-center">
              <p className="text-[10px] uppercase tracking-[0.25em] font-display font-black text-zinc-500 mb-2 leading-none">
                Question
              </p>
              <h2 className="font-display text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-relaxed max-w-sm">
                {activeCard.question}
              </h2>
            </div>

            {/* Show Answer Action */}
            <div id="card-action-arena-front" className="w-full pt-4">
              <button
                id="btn-show-answer"
                onClick={() => setIsAnswerRevealed(true)}
                className="w-full py-4.5 bg-[#3B82F6] hover:bg-[#4F46E5] text-white rounded-2xl font-display text-xs font-black uppercase tracking-[0.2em] shadow-[0_4px_14px_rgba(59,130,246,0.3)] active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>Show Answer</span>
              </button>
            </div>
          </div>

          {/* BACK SIDE (Answer) */}
          <div className="absolute inset-0 w-full h-full bg-[#111111] border border-zinc-850 rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col justify-between backface-hidden rotate-y-180 hover:border-zinc-800">
            {/* Card Title Metadata Header */}
            <div id="card-metadata-back" className="flex items-center justify-between w-full select-none">
              <span className="bg-zinc-900 border border-zinc-800 text-[#E0FF00] px-3 py-1 rounded-lg text-[9px] font-display font-black uppercase tracking-widest leading-none">
                {deck.tag}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                {activeCard.status === 'new' ? 'Unstudied New' : activeCard.status === 'review' ? 'In Review' : 'Mastered'}
              </span>
            </div>

            {/* Correct Answer Text Box */}
            <div id="answer-text-container" className="my-auto py-4 text-center flex flex-col justify-center items-center">
              <p className="text-[10px] uppercase tracking-[0.25em] font-display font-black text-[#E0FF00] mb-2 leading-none">
                Correct Answer
              </p>
              <p className="text-base md:text-lg text-zinc-100 leading-relaxed font-sans font-medium max-w-sm">
                {activeCard.answer}
              </p>
            </div>

            {/* Spaced Repetition Scoring Interactive Buttons */}
            <div id="card-action-arena-back" className="w-full pt-4">
              <div id="scoring-interface" className="grid grid-cols-3 gap-2.5">
                {/* 1. AGAIN scoring button */}
                <button
                  id="grade-btn-again"
                  onClick={() => handleScoreGrade('again')}
                  className="py-3.5 px-3 bg-[#FEE2E2] text-[#991B1B] hover:bg-red-200 rounded-2xl font-display text-[11px] font-black uppercase tracking-wider cursor-pointer border-0 transition-all active:scale-95 flex flex-col sm:flex-row items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#991B1B]" />
                  <span>Again</span>
                </button>

                {/* 2. GOOD scoring button */}
                <button
                  id="grade-btn-good"
                  onClick={() => handleScoreGrade('good')}
                  className="py-3.5 px-3 bg-[#5C7CFA] text-white hover:bg-[#4C6EF5] rounded-2xl font-display text-[11px] font-black uppercase tracking-wider cursor-pointer border-0 transition-all active:scale-95 shadow-[0_4px_12px_rgba(92,124,250,0.3)] flex flex-col sm:flex-row items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  <span>Good</span>
                </button>

                {/* 3. EASY scoring button */}
                <button
                  id="grade-btn-easy"
                  onClick={() => handleScoreGrade('easy')}
                  className="py-3.5 px-3 bg-[#DCFCE7] text-[#166534] hover:bg-emerald-200 rounded-2xl font-display text-[11px] font-black uppercase tracking-wider cursor-pointer border-0 transition-all active:scale-95 flex flex-col sm:flex-row items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Easy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Static Viewport Base Navigation Controls */}
      {/* Build standalone buttons completely unlinked to the card container so navigation stays stationary at the viewport base */}
      <div id="stationary-nav-controls" className="w-full flex gap-3 mt-4">
        <button
          id="btn-previous-card"
          onClick={handlePrevious}
          className="flex-grow py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl font-display text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>
        <button
          id="btn-next-card"
          onClick={handleNext}
          className="flex-grow py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[#E0FF00] rounded-xl font-display text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <span>Next Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
