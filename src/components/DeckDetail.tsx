import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Play, Check, MoreVertical, 
  X, Tag, Slash, Trash2, Plus 
} from 'lucide-react';
import { Deck, Flashcard } from '../types';
import AddCardModal from './AddCardModal';

interface DeckDetailProps {
  deck: Deck;
  cards: Flashcard[];
  onBack: () => void;
  onStartStudy: (deckId: string) => void;
  onAddCard: (deckId: string, question: string, answer: string) => void;
  onDeleteCards: (cardIds: string[]) => void;
  onUpdateCardStatus: (cardIds: string[], status: 'new' | 'review' | 'learned') => void;
  onUpdateDeckTag?: (deckId: string, newTag: string) => void;
  onSuspendCards?: (cardIds: string[]) => void;
}

export default function DeckDetail({
  deck,
  cards,
  onBack,
  onStartStudy,
  onAddCard,
  onDeleteCards,
  onUpdateCardStatus,
  onUpdateDeckTag,
  onSuspendCards,
}: DeckDetailProps) {
  // Filter cards belonging to this deck
  const deckCards = cards.filter((c) => c.deckId === deck.id);

  // States
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectBatchActive, setSelectBatchActive] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Batch inline tag editing
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState(deck.tag);
  
  // New card form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [addCardError, setAddCardError] = useState('');

  // Computes filtered cards belonging to this deck based on search query
  const filteredCards = deckCards.filter((card) =>
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle click on flashcard row (toggles selection or triggers collapse expansion)
  const handleCardClick = (cardId: string) => {
    if (selectBatchActive) {
      setSelectedCardIds((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      );
    } else {
      setExpandedCardIds((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      );
    }
  };

  // Submit adding new card
  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setAddCardError('Please fill in both the question and answer.');
      return;
    }
    onAddCard(deck.id, newQuestion, newAnswer);
    setNewQuestion('');
    setNewAnswer('');
    setAddCardError('');
    setIsAddCardOpen(false);
  };

  return (
    <div className="pb-40 pt-4 animate-in fade-in duration-500 relative">
      {/* Top Header Section */}
      <header className="mb-6 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#E0FF00] hover:text-white text-xs font-display font-black uppercase tracking-widest bg-transparent border-0 cursor-pointer p-0 select-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </button>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none mt-1">
              {deck.name}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-zinc-500 font-mono text-xs">
                {deckCards.length} CARDS IN THIS DECK
              </span>
              <button className="flex items-center justify-center text-zinc-500 hover:text-[#E0FF00] transition-colors bg-transparent border-0 cursor-pointer p-1">
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-[#111111] text-[#E0FF00] border border-zinc-800 px-3 py-1 rounded-md font-display text-[10px] font-black uppercase tracking-widest leading-none">
              {deck.tag}
            </span>
          </div>
        </div>

        {/* Dynamic Study Action Button */}
        <button
          onClick={() => onStartStudy(deck.id)}
          className="w-full py-4 bg-[#E0FF00] text-black rounded-xl font-display font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(224,255,0,0.35)] hover:bg-white hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border-0 text-xs"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Study this Deck</span>
        </button>

        {/* Dynamic Filter Header: 3-column Grid Display with low-opacity responsive tints */}
        <div className="grid grid-cols-3 gap-3">
          {/* NEW Category */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-[20px] py-4 px-3 flex flex-col items-center justify-center text-center backdrop-blur-sm transition-all hover:scale-[1.02]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mb-1 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <p className="font-display text-[9px] text-blue-400 uppercase tracking-widest font-black leading-none text-center">New Cards</p>
            <p className="font-display text-2xl text-blue-300 font-black mt-1">
              {deckCards.filter((c) => c.status === 'new').length}
            </p>
          </div>
          
          {/* REVIEW Category */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[20px] py-4 px-3 flex flex-col items-center justify-center text-center backdrop-blur-sm transition-all hover:scale-[1.02]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <p className="font-display text-[9px] text-amber-400 uppercase tracking-widest font-black leading-none text-center">Review Due</p>
            <p className="font-display text-2xl text-amber-300 font-black mt-1">
              {deckCards.filter((c) => c.status === 'review').length}
            </p>
          </div>
          
          {/* LEARNED Category */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] py-4 px-3 flex flex-col items-center justify-center text-center backdrop-blur-sm transition-all hover:scale-[1.02]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="font-display text-[9px] text-emerald-400 uppercase tracking-widest font-black leading-none text-center">Learned</p>
            <p className="font-display text-2xl text-emerald-300 font-black mt-1">
              {deckCards.filter((c) => c.status === 'learned').length}
            </p>
          </div>
        </div>
      </header>

      {/* Card Addition Modal Trigger Form */}
      {isAddCardOpen && (
        <AddCardModal
          decks={[deck]}
          defaultDeckId={deck.id}
          onClose={() => setIsAddCardOpen(false)}
          onAddCard={(deckId, question, answer) => {
            onAddCard(deckId, question, answer);
          }}
        />
      )}

      {/* Brutalist Search Input Component */}
      <div className="mb-5 mt-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH CARDS BY KEYWORD //"
          className="w-full bg-[#0A0A0A] border-2 border-slate-805 text-white uppercase tracking-wider font-mono text-xs px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#E0FF00] transition-colors"
        />
      </div>

      {/* Section Filter with Select Batch Toggle */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <h3 className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Decks Cards ({filteredCards.length})
        </h3>
        <button
          onClick={() => {
            setSelectBatchActive((prev) => !prev);
            if (selectBatchActive) {
              setSelectedCardIds([]);
            }
          }}
          className={`px-3 py-1.5 rounded-lg font-display text-[10px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none ${
            selectBatchActive 
              ? 'bg-[#E0FF00] text-black border-transparent shadow-[0_0_8px_rgba(224,255,0,0.35)]' 
              : 'bg-zinc-900 text-zinc-400 border-zinc-805 hover:text-white hover:border-zinc-700'
          }`}
        >
          <span>{selectBatchActive ? 'Cancel Batch' : 'Select Batch'}</span>
        </button>
      </div>

      {/* Card Items List */}
      <section className="space-y-3">
        {filteredCards.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);
          const isExpanded = expandedCardIds.includes(card.id);
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`group border rounded-2xl p-5 flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#EDF2FF] border-blue-400'
                  : 'bg-[#111111] border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Slidable checkmark indicator */}
                <div 
                  className={`transition-all duration-300 flex-shrink-0 flex items-center justify-center ${
                    selectBatchActive ? 'w-8 opacity-100 mr-1' : 'w-0 opacity-0 overflow-hidden'
                  }`}
                >
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-md border-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-[#E0FF00]" />
                  )}
                </div>

                {/* Card Question Text Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-sans text-sm md:text-base font-semibold leading-relaxed ${
                    isSelected ? 'text-[#1A202C]' : 'text-zinc-100'
                  }`}>
                    {card.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[8px] font-display uppercase tracking-widest font-black px-1.5 py-0.5 rounded-md ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-800 border border-blue-250'
                        : card.status === 'learned' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : card.status === 'review'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-[#E0FF00]/10 text-[#E0FF00] border border-[#E0FF00]/20'
                    }`}>
                      {card.status}
                    </span>
                    <span className={`font-mono text-[10px] ${
                      isSelected ? 'text-zinc-500' : 'text-zinc-500'
                    }`}>
                      {card.lastStudiedText}
                    </span>
                  </div>
                </div>

                {/* Arrow / Menu expand trigger button */}
                <div className="flex-shrink-0 ml-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCardIds(prev => 
                        prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]
                      );
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-0 bg-transparent transition-colors ${
                      isSelected 
                        ? 'text-zinc-500 hover:text-black hover:bg-zinc-200' 
                        : 'text-zinc-500 hover:text-[#E0FF00] hover:bg-zinc-800'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline collapsed answer content */}
              {isExpanded && (
                <div className={`mt-3 pt-3 border-t text-xs md:text-sm font-sans animate-in slide-in-from-top-1 duration-200 ${
                  isSelected ? 'border-blue-200 text-zinc-750' : 'border-zinc-800 text-zinc-350'
                }`}>
                  <strong className={`block text-[10px] uppercase tracking-wider mb-1 ${
                    isSelected ? 'text-zinc-500' : 'text-[#E0FF00]/90'
                  }`}>
                    Answer Solution
                  </strong>
                  <p className="leading-relaxed font-sans">{card.answer}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredCards.length === 0 && (
          <div className="text-center py-12 bg-[#111111] border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-sans text-sm">
              {deckCards.length === 0 
                ? "No flashcards found in this deck." 
                : "No cards match your search criteria."}
            </p>
            {deckCards.length === 0 && (
              <button
                onClick={() => setIsAddCardOpen(true)}
                className="mt-3 text-[#E0FF00] font-display font-extrabold text-xs bg-transparent border-0 cursor-pointer hover:underline"
              >
                Add First Card!
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. Contextual Operations Drawer (Fixed dark slate-gray (#1E293B) bottom box) */}
      {selectedCardIds.length > 0 && (
        <div className="fixed bottom-18 left-0 right-0 bg-[#1E293B] border-t border-slate-700 text-white z-50 shadow-2xl px-6 py-4 animate-in slide-in-from-bottom duration-300 ease-out pb-safe">
          <div className="max-w-xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Absolute item count highlighted on the left */}
            <div className="flex items-center justify-between md:justify-start gap-4">
              <div>
                <p className="text-sm font-sans tracking-tight font-black text-white">
                  {selectedCardIds.length} cards chosen
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E0FF00] animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                    Active category: {deck.tag}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCardIds([])}
                className="text-[10px] uppercase font-display font-black tracking-widest text-[#E0FF00] bg-transparent border-0 cursor-pointer p-1"
              >
                Clear selection
              </button>
            </div>

            {/* Batch execution buttons group */}
            <div className="flex flex-wrap items-center gap-2 justify-end">
              
              {/* Editing tag inline interface */}
              {isEditingTag ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (batchTagInput.trim()) {
                      if (onUpdateDeckTag) {
                        onUpdateDeckTag(deck.id, batchTagInput.trim());
                      }
                      setIsEditingTag(false);
                    }
                  }} 
                  className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-600"
                >
                  <input 
                    type="text"
                    value={batchTagInput}
                    onChange={(e) => setBatchTagInput(e.target.value)}
                    className="px-2 py-1 bg-slate-800 text-white font-mono text-[10px] uppercase rounded focus:outline-none focus:border-[#E0FF00] border border-slate-700 w-24"
                    placeholder="TAG NAME"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-2.5 py-1 bg-[#E0FF00] text-black rounded font-display font-black text-[9px] uppercase tracking-wider border-0 cursor-pointer"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingTag(false)}
                    className="p-1 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setBatchTagInput(deck.tag);
                    setIsEditingTag(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/60 hover:bg-slate-950 border border-slate-700/80 rounded-xl font-display text-[9px] font-black uppercase tracking-widest text-slate-200 hover:text-white transition-all cursor-pointer"
                  title="Edit Category Tag"
                >
                  <Tag className="w-3.5 h-3.5 text-[#E0FF00]" />
                  <span>Edit Tag</span>
                </button>
              )}

              {/* Suspend selected cards */}
              <button
                onClick={() => {
                  if (onSuspendCards) {
                    onSuspendCards(selectedCardIds);
                  }
                  setSelectedCardIds([]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/60 hover:bg-slate-950 border border-slate-700/80 rounded-xl font-display text-[9px] font-black uppercase tracking-widest text-slate-200 hover:text-white transition-all cursor-pointer"
                title="Suspend Cards from study list"
              >
                <Slash className="w-3.5 h-3.5 text-zinc-400" />
                <span>Suspend</span>
              </button>

              {/* Safe batch delete array */}
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete these ${selectedCardIds.length} cards permanently?`)) {
                    onDeleteCards(selectedCardIds);
                    setSelectedCardIds([]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/60 rounded-xl font-display text-[9px] font-black uppercase tracking-widest text-red-300 hover:text-white transition-all cursor-pointer"
                title="Permanently Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for adding card */}
      <button
        onClick={() => setIsAddCardOpen(prev => !prev)}
        className="fixed bottom-26 right-5 w-14 h-14 bg-[#E0FF00] text-black rounded-full shadow-[0_0_15px_rgba(224,255,0,0.3)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 z-40 cursor-pointer border-0"
      >
        <Plus className="w-6 h-6 text-black stroke-[3px]" />
      </button>
    </div>
  );
}
