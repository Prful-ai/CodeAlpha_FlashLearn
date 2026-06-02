import React from 'react';
import { Home, Layers, Brain } from 'lucide-react';

interface BottomNavBarProps {
  currentView: 'dashboard' | 'decks' | 'study';
  setCurrentView: (view: 'dashboard' | 'decks' | 'study') => void;
  onClearDeckSelection?: () => void;
  onChangeView?: (view: 'dashboard' | 'decks' | 'study') => void;
}

export default function BottomNavBar({
  currentView,
  setCurrentView,
  onClearDeckSelection,
  onChangeView,
}: BottomNavBarProps) {
  const handleTabClick = (view: 'dashboard' | 'decks' | 'study') => {
    if (view === 'decks' && onClearDeckSelection) {
      onClearDeckSelection();
    }
    // Explicitly call the view modifier function
    setCurrentView(view);
    if (onChangeView) {
      onChangeView(view);
    }
  };

  return (
    <nav 
      id="bottom-navigation-bar" 
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-stretch h-18 bg-[#0D0D0D] border-t border-zinc-800"
    >
      {/* Dashboard Tab */}
      <button
        id="nav-tab-dashboard"
        onClick={() => handleTabClick('dashboard')}
        className="relative flex-1 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 border-0 bg-transparent"
      >
        {currentView === 'dashboard' ? (
          <>
            <div className="absolute top-0 left-6 right-6 h-[3px] bg-[#E0FF00] rounded-b shadow-[0_1px_10px_rgba(224,255,0,0.7)]" />
            <Home className="w-5 h-5 mb-1 text-[#E0FF00] transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-[#E0FF00] font-black transition-colors duration-200">
              Dashboard
            </span>
          </>
        ) : (
          <>
            <Home className="w-5 h-5 mb-1 text-slate-400 hover:text-slate-200 transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-slate-400 font-extrabold hover:text-slate-200 transition-colors duration-200">
              Dashboard
            </span>
          </>
        )}
      </button>

      {/* Decks Tab */}
      <button
        id="nav-tab-decks"
        onClick={() => handleTabClick('decks')}
        className="relative flex-1 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 border-0 bg-transparent"
      >
        {currentView === 'decks' ? (
          <>
            <div className="absolute top-0 left-6 right-6 h-[3px] bg-[#E0FF00] rounded-b shadow-[0_1px_10px_rgba(224,255,0,0.7)]" />
            <Layers className="w-5 h-5 mb-1 text-[#E0FF00] transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-[#E0FF00] font-black transition-colors duration-200">
              Decks
            </span>
          </>
        ) : (
          <>
            <Layers className="w-5 h-5 mb-1 text-slate-400 hover:text-slate-200 transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-slate-400 font-extrabold hover:text-slate-200 transition-colors duration-200">
              Decks
            </span>
          </>
        )}
      </button>

      {/* Study Tab */}
      <button
        id="nav-tab-study"
        onClick={() => handleTabClick('study')}
        className="relative flex-1 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 border-0 bg-transparent"
      >
        {currentView === 'study' ? (
          <>
            <div className="absolute top-0 left-6 right-6 h-[3px] bg-[#E0FF00] rounded-b shadow-[0_1px_10px_rgba(224,255,0,0.7)]" />
            <Brain className="w-5 h-5 mb-1 text-[#E0FF00] transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-[#E0FF00] font-black transition-colors duration-200">
              Study
            </span>
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mb-1 text-slate-400 hover:text-slate-200 transition-colors duration-200" />
            <span className="font-display text-[9px] uppercase tracking-[0.25em] text-slate-400 font-extrabold hover:text-slate-200 transition-colors duration-200">
              Study
            </span>
          </>
        )}
      </button>
    </nav>
  );
}
