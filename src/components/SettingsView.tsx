import React, { useState } from 'react';
import { User, Award, Flame, RotateCcw, Plus, Save, BookOpen } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsViewProps {
  userStats: UserStats;
  onUpdateName: (name: string) => void;
  onResetStats: () => void;
  onAddSampleCards: () => void;
  email: string;
  onLogout: () => void;
}

export default function SettingsView({
  userStats,
  onUpdateName,
  onResetStats,
  onAddSampleCards,
  email,
  onLogout,
}: SettingsViewProps) {
  const [tempName, setTempName] = useState(userStats.userName);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-20 max-w-lg mx-auto w-full animate-in fade-in duration-500">
      
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">
          Settings & Profile
        </h2>
        <p className="text-zinc-400 font-sans text-sm">
          Customize your learning dashboard metrics and account attributes.
        </p>
      </div>

      {/* Profile Edit Card */}
      <section className="bg-[#111111] border border-zinc-800 rounded-[28px] p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-[#E0FF00] flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-base font-black text-white uppercase tracking-tight">
              {userStats.userName} (STUDENT //)
            </h3>
            <p className="text-xs text-zinc-500 font-mono select-all truncate max-w-[250px]">
              {email || 'anonymous_operator_node'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-3 pt-2">
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">
              User Profile Nickname
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Name"
                className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl border border-zinc-800 focus:border-[#E0FF00]/50 focus:outline-none font-sans text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#E0FF00] text-black rounded-xl font-display font-black text-xs uppercase tracking-wider border-0 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-[0_0_10px_rgba(224,255,0,0.25)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
          {showSavedMsg && (
            <p className="text-emerald-400 text-xs font-sans font-semibold animate-pulse">
              Profile updated successfully!
            </p>
          )}
        </form>
      </section>

      {/* Learning Status Metrics */}
      <section className="bg-[#111111] border border-zinc-800 rounded-[28px] p-5 space-y-4 shadow-sm">
        <h3 className="font-display text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">
          Active Statistics
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <Award className="w-6 h-6 text-[#E0FF00] fill-current" />
            <div>
              <div className="text-xl font-black text-white">
                {userStats.cardsMastered.toLocaleString()}
              </div>
              <div className="text-[9px] font-display text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">
                Cards Mastered
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <Flame className="w-6 h-6 text-orange-500 fill-current" />
            <div>
              <div className="text-xl font-black text-white">{userStats.currentStreak} Days</div>
              <div className="text-[9px] font-display text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">
                Current Streak
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database control section */}
      <section className="bg-[#111111] border border-zinc-800 rounded-[28px] p-5 space-y-3 shadow-sm">
        <h3 className="font-display text-xs font-black text-zinc-500 uppercase tracking-widest">
          Control Panel Actions
        </h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Need card resources or want to recreate initial setups? Reset the local storage state.
        </p>

        <div className="flex flex-col gap-2.5 pt-2">
          {/* Add Sample Flashcards */}
          <button
            onClick={onAddSampleCards}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-[#E0FF00] text-white hover:text-black border border-zinc-800 rounded-xl font-display text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Generate Mock Flashcards Pool</span>
          </button>
          
          {/* Reset App Stats & Decks */}
          <button
            onClick={onResetStats}
            className="w-full py-3 px-4 bg-red-950/40 hover:bg-red-900/80 text-red-400 hover:text-white border border-red-900/50 rounded-xl font-display text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database to System Default</span>
          </button>

          {/* Secure Logout action */}
          <button
            onClick={onLogout}
            className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-red-500/45 text-zinc-500 hover:text-red-400 rounded-xl font-display text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 mt-2"
          >
            <User className="w-4 h-4" />
            <span>Log Out Secure Console Profile //</span>
          </button>
        </div>
      </section>

      {/* Custom credits */}
      <footer className="text-center text-[9px] text-zinc-600 uppercase tracking-[0.25em] font-display pt-2">
        FlashLearn (React 19 + Tailwind v4) · Artistic Flair Visual Theme
      </footer>

    </div>
  );
}
