import React from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Deck } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  selectedDeckId?: string | null;
  currentDeckId?: string | null;
  onSelectDeck: (deckId: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  decks,
  selectedDeckId,
  currentDeckId,
  onSelectDeck,
}: SidebarProps) {
  // Resolve active deck ID between the two possible prop names
  const activeDeckId = selectedDeckId !== undefined ? selectedDeckId : (currentDeckId || null);

  // Group decks by their category or tag
  const groupedDecks: { [category: string]: Deck[] } = {};
  decks.forEach((deck) => {
    const categoryName = (deck.category || deck.tag || 'General').toUpperCase();
    if (!groupedDecks[categoryName]) {
      groupedDecks[categoryName] = [];
    }
    groupedDecks[categoryName].push(deck);
  });

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40" onClick={onClose} />}

      {/* Flyout drawer */}
      <div
        id="sidebar-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-slate-800 p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col justify-between h-full text-white">
          {/* Top Header of Sidebar */}
          <div className="pb-6 border-b border-zinc-900 flex justify-between items-center bg-[#070707] -mx-6 px-6 -mt-6 pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E0FF00] shadow-[0_0_6px_#E0FF00]" />
                <span className="text-[8px] uppercase tracking-[0.25em] font-sans font-black text-zinc-500">
                  Study Navigator
                </span>
              </div>
              <h2 className="font-display text-sm tracking-tight font-black uppercase text-white selection-none leading-none mt-1">
                Decks Explorer
              </h2>
            </div>
            
            {/* Close X Button */}
            <button
              id="sidebar-close-btn"
              onClick={onClose}
              className="text-zinc-400 hover:text-[#E0FF00] p-1.5 hover:bg-zinc-950 rounded-lg cursor-pointer border-0 bg-transparent transition-all active:scale-95 flex items-center justify-center"
              title="Close Navigator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories and List of Decks */}
          <div className="flex-1 overflow-y-auto py-6 px-1 space-y-8 custom-scrollbar">
            {Object.entries(groupedDecks).map(([category, items]) => (
              <div key={category} className="space-y-3">
                {/* Category Tracked Header */}
                <h3 className="text-[9px] font-display font-black tracking-[0.3em] text-[#E0FF00]/90 px-1 line-clamp-1">
                  {category}
                </h3>
                
                <div className="space-y-1">
                  {items.map((deck) => {
                    const isSelected = activeDeckId === deck.id;
                    
                    // Dynamic Lucide Icon Mapper
                    const IconComponent = (Icons as any)[deck.icon] || Layers;

                    return (
                      <button
                        key={deck.id}
                        id={`sidebar-deck-item-${deck.id}`}
                        onClick={() => {
                          onSelectDeck(deck.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl border transition-all duration-250 group cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 border-[#E0FF00]/30 text-[#E0FF00]'
                            : 'bg-transparent border-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-1">
                          <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? 'bg-zinc-950 border-[#E0FF00]/40 text-[#E0FF00]' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-950 group-hover:border-zinc-800 transition-all'
                          }`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-black text-xs uppercase tracking-tight truncate leading-none">
                            {deck.name}
                          </span>
                        </div>

                        <ArrowRight className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 ${
                          isSelected ? 'text-[#E0FF00]' : 'text-zinc-500'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer info brand */}
          <div className="pt-4 bg-[#070707] border-t border-zinc-900 text-center select-none -mx-6 px-6 -mb-6 pb-6 mt-1">
            <p className="text-[8px] font-mono tracking-widest text-[#E0FF00]/50 uppercase">
              Swiss Modernist • v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
