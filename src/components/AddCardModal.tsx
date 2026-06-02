import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Deck } from '../types';

interface AddCardModalProps {
  decks: Deck[];
  defaultDeckId: string | null;
  onClose: () => void;
  onAddCard: (deckId: string, question: string, answer: string) => void;
}

export default function AddCardModal({
  decks,
  defaultDeckId,
  onClose,
  onAddCard,
}: AddCardModalProps) {
  const [selectedDeckId, setSelectedDeckId] = useState(defaultDeckId || (decks[0]?.id || ''));
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) {
      setError('Please select or create a category deck first.');
      return;
    }
    if (!question.trim() || !answer.trim()) {
      setError('Please fill in both the question and the answer desc.');
      return;
    }
    onAddCard(selectedDeckId, question, answer);
    setQuestion('');
    setAnswer('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#111111] border border-zinc-800 rounded-[32px] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <h3 className="font-display text-xs uppercase tracking-[0.25em] font-black text-white">
            Create Flashcard
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-transparent border-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">
              Target Category Deck
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 focus:border-[#E0FF00]/50 focus:outline-none font-sans text-sm cursor-pointer"
            >
              {decks.map((dk) => (
                <option key={dk.id} value={dk.id} className="bg-zinc-950 text-white">
                  {dk.name} ({dk.tag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">
              Question Text
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is cellular apoptosis?"
              className="w-full px-4 py-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 focus:border-[#E0FF00]/50 focus:outline-none font-sans text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">
              Answer Description
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g., Programmed cell death that occurs in multicellular organisms."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 focus:border-[#E0FF00]/50 focus:outline-none font-sans text-sm resize-none"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-sans font-semibold">{error}</p>}

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent text-zinc-500 font-display font-semibold hover:text-white text-xs border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#E0FF00] text-black rounded-lg font-display font-black text-xs uppercase tracking-widest border-0 cursor-pointer"
            >
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
