import React, { useState } from 'react';
import { X, Brain, Globe, Activity, Dna } from 'lucide-react';

interface AddDeckModalProps {
  onClose: () => void;
  onAddDeck: (name: string, desc: string, tag: string, icon: string) => void;
}

export default function AddDeckModal({ onClose, onAddDeck }: AddDeckModalProps) {
  // Managed local states following instructions
  const [deckTitle, setDeckTitle] = useState('');
  const [deckCategory, setDeckCategory] = useState('PSYCHOLOGY');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Brain');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckTitle.trim()) {
      setError('PLEASE PROVIDE A VALID DECK TITLE.');
      return;
    }
    
    // Generates a valid new deck object structure, piping it to master state function
    onAddDeck(
      deckTitle.trim(),
      description.trim() || `CORE ${deckCategory} RECALL SYSTEM`,
      deckCategory,
      selectedIcon
    );
    onClose();
  };

  const icons = [
    { name: 'Brain', IconComponent: Brain, label: 'MIND' },
    { name: 'Globe', IconComponent: Globe, label: 'LANGUAGE' },
    { name: 'Activity', IconComponent: Activity, label: 'SCIENCE' },
    { name: 'Dna', IconComponent: Dna, label: 'BIOLOGY' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop mask overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      {/* High-contrast structural modal form overlay locked in center */}
      <div className="relative z-50 bg-[#111111] border-2 border-slate-700 rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <h3 className="font-display text-xs uppercase tracking-[0.25em] font-black text-white">
            Create Custom Deck
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Deck Title Input */}
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-2 font-bold select-none">
              Deck Title
            </label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="E.G. MOLECULAR BIOLOGY"
              className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-xl border-2 border-slate-700 placeholder:font-mono placeholder:uppercase placeholder:text-zinc-600 focus:border-[#E0FF00] focus:ring-1 focus:ring-[#E0FF00] focus:outline-none font-sans text-sm transition-all"
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-[#6c6c72] mb-2 font-bold select-none">
              Brief Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.G. CORE LIFE SCIENCE, EVOLUTIONARY DNA STRUCTURES, AND GENETICS."
              rows={2}
              className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-xl border-2 border-slate-700 placeholder:font-mono placeholder:uppercase placeholder:text-zinc-600 focus:border-[#E0FF00] focus:ring-1 focus:ring-[#E0FF00] focus:outline-none font-sans text-sm resize-none transition-all"
              required
            />
          </div>

          {/* Deck Category Selector */}
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-2 font-bold select-none">
              Deck Category
            </label>
            <select
              value={deckCategory}
              onChange={(e) => setDeckCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-xl border-2 border-slate-700 focus:border-[#E0FF00] focus:ring-1 focus:ring-[#E0FF00] focus:outline-none font-mono text-xs uppercase cursor-pointer transition-all"
            >
              <option value="PSYCHOLOGY" className="bg-[#0A0A0A] text-white">PSYCHOLOGY</option>
              <option value="LANGUAGE" className="bg-[#0A0A0A] text-white">LANGUAGE</option>
              <option value="SCIENCE" className="bg-[#0A0A0A] text-white">SCIENCE</option>
              <option value="BIOLOGY" className="bg-[#0A0A0A] text-white">BIOLOGY</option>
            </select>
          </div>

          {/* Icon Choice Row */}
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-2 font-bold select-none">
              Choose Icon Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {icons.map(({ name, IconComponent, label }) => {
                const isSelected = selectedIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0A0A0A] border-[#E0FF00] text-[#E0FF00]'
                        : 'bg-[#0A0A0A]/50 border-slate-700 text-zinc-500 hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 animate-none" />
                    <span className="text-[7.5px] font-display font-black uppercase tracking-wider">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-red-500 text-xxs font-mono font-black tracking-widest uppercase">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent text-zinc-500 font-display font-bold uppercase tracking-wider hover:text-white text-xs border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E0FF00] hover:bg-white text-black rounded-xl font-display font-black text-xs uppercase tracking-[0.15em] border-0 cursor-pointer transition-colors"
            >
              CREATE DECK //
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
