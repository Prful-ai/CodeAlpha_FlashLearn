import React, { useState, useEffect } from 'react';
import { Menu, CircleUser, Play, Plus } from 'lucide-react';
import { Deck, Flashcard, UserStats } from './types';
import { INITIAL_DECKS, INITIAL_CARDS, INITIAL_USER_STATS } from './data';
import BottomNavBar from './components/BottomNavBar';
import StudyDashboard from './components/StudyDashboard';
import DeckDetail from './components/DeckDetail';
import StudySession from './components/StudySession';
import AddDeckModal from './components/AddDeckModal';
import AddCardModal from './components/AddCardModal';
import SettingsView from './components/SettingsView';
import Sidebar from './components/Sidebar';
import { 
  fetchCloudDecks, 
  saveDeckToCloud,
  initializeUserProfileInCloud,
  saveUserStatsToCloud,
  fetchUserStatsFromCloud
} from './services/firebaseService';

// Authentication and Firebase integrations
import { auth } from './utils/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import AuthModal from './components/AuthModal';

export default function App() {
  // --- 1. FIREBASE AUTH AND STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. LOCAL STORAGE PERSISTENCE ENGINE ---
  const [decks, setDecks] = useState<Deck[]>(() => {
    const savedMaster = localStorage.getItem('flashlearn_master_data');
    if (savedMaster) {
      try {
        return JSON.parse(savedMaster);
      } catch (e) {
        console.error('Failed to parse flashlearn_master_data', e);
      }
    }
    const saved = localStorage.getItem('flashlearn_decks');
    return saved ? JSON.parse(saved) : INITIAL_DECKS;
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('flashlearn_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('flashlearn_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          cardsMastered: parsed.cardsMastered ?? INITIAL_USER_STATS.cardsMastered ?? 0,
          currentStreak: parsed.currentStreak ?? INITIAL_USER_STATS.currentStreak ?? 0,
          userName: parsed.userName ?? INITIAL_USER_STATS.userName ?? 'Operator',
          masteredCount: parsed.masteredCount ?? parsed.cardsMastered ?? INITIAL_USER_STATS.masteredCount ?? 0,
          streakDays: parsed.streakDays ?? parsed.currentStreak ?? INITIAL_USER_STATS.streakDays ?? 0,
          completionRatio: parsed.completionRatio ?? INITIAL_USER_STATS.completionRatio ?? 0,
          weeklyLog: parsed.weeklyLog ?? INITIAL_USER_STATS.weeklyLog ?? { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        };
      } catch (e) {
        return INITIAL_USER_STATS;
      }
    }
    return INITIAL_USER_STATS;
  });

  const [studiedToday, setStudiedToday] = useState<number>(() => {
    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem('flashlearn_studied_date');
    if (savedDate !== todayStr) {
      localStorage.setItem('flashlearn_studied_date', todayStr);
      localStorage.setItem('flashlearn_studied_today', '15');
      return 15;
    }
    const savedCount = localStorage.getItem('flashlearn_studied_today');
    return savedCount ? parseInt(savedCount, 10) : 15;
  });

  // Sync profile nickname with authenticated credentials automatically
  useEffect(() => {
    if (user) {
      setUserStats((prev) => {
        if (prev.userName === 'Alex' || prev.userName === 'Operator' || !prev.userName) {
          return {
            ...prev,
            userName: user.email?.split('@')[0] || user.displayName || 'Operator',
          };
        }
        return prev;
      });
    }
  }, [user]);

  // Dynamic cloud data mount when user changes
  useEffect(() => {
    if (!user) return;
    async function loadDecksAndStatsFromCloud() {
      try {
        const cloudStats = await fetchUserStatsFromCloud(user.uid);
        if (cloudStats) {
          setUserStats(cloudStats);
          if (cloudStats.decks && cloudStats.decks.length > 0) {
            setDecks(cloudStats.decks);
          } else {
            // Check subcollection
            const cloudDecks = await fetchCloudDecks(user.uid);
            if (cloudDecks && cloudDecks.length > 0) {
              setDecks(cloudDecks);
            } else {
              setDecks([]);
            }
          }
          if (cloudStats.cards && cloudStats.cards.length > 0) {
            setCards(cloudStats.cards);
          } else {
            setCards([]);
          }
        } else {
          // Cold start fallback: initialize empty profile with zeroed stats in cloud
          const defaultName = user.email?.split('@')[0] || user.displayName || 'Operator';
          const freshStats = await initializeUserProfileInCloud(user.uid, defaultName);
          setUserStats(freshStats);
          setDecks([]);
          setCards([]);
        }
      } catch (err) {
        console.error("Could not fetch user stats, setting fresh fallback states:", err);
        setCloudError("Insufficient firebase permissions or local network failure. Operating in Offline Safe Mode.");
        // Clean dynamic fallback to 0 values if no existing Firestore record could be fetched or on network error
        setUserStats({
          cardsMastered: 0,
          currentStreak: 0,
          userName: user.email?.split('@')[0] || user.displayName || 'Operator',
          masteredCount: 0,
          streakDays: 0,
          completionRatio: 0,
          weeklyLog: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        });
      }
    }
    loadDecksAndStatsFromCloud();
  }, [user]);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('flashlearn_master_data', JSON.stringify(decks));
    localStorage.setItem('flashlearn_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('flashlearn_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('flashlearn_stats', JSON.stringify(userStats));
    if (user) {
      saveUserStatsToCloud(user.uid, {
        ...userStats,
        decks,
        cards
      }).catch((e) => {
        console.error("Error saving stats to cloud:", e);
        setCloudError("Insufficient firebase permissions or local network failure. Operating in Offline Safe Mode.");
      });
    }
  }, [userStats, user, decks, cards]);


  // --- 2. LAYOUT ROUTING STATES (RELOAD-PERSISTED) ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'decks' | 'study'>(() => {
    const saved = localStorage.getItem('flashlearn_current_view');
    return (saved as 'dashboard' | 'decks' | 'study') || 'dashboard';
  });

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(() => {
    return localStorage.getItem('flashlearn_selected_deck_id');
  });

  const [activeStudyDeckId, setActiveStudyDeckId] = useState<string | null>(() => {
    return localStorage.getItem('flashlearn_active_study_deck_id');
  });

  // Global Dialog & Modal States
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [addCardModalDeckId, setAddCardModalDeckId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync navigation states with localStorage for instant window reload persistence
  useEffect(() => {
    localStorage.setItem('flashlearn_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedDeckId) {
      localStorage.setItem('flashlearn_selected_deck_id', selectedDeckId);
    } else {
      localStorage.removeItem('flashlearn_selected_deck_id');
    }
  }, [selectedDeckId]);

  useEffect(() => {
    if (activeStudyDeckId) {
      localStorage.setItem('flashlearn_active_study_deck_id', activeStudyDeckId);
    } else {
      localStorage.removeItem('flashlearn_active_study_deck_id');
    }
  }, [activeStudyDeckId]);


  // --- 3. DOCK HANDLERS & CARD COUNTERS CALCULATIONS ---
  const syncDeckCardCounts = (updatedCards: Flashcard[]) => {
    setDecks((prevDecks) => {
      const next = prevDecks.map((deck) => {
        const deckCards = updatedCards.filter((c) => c.deckId === deck.id);
        const newCount = deckCards.filter((c) => c.status === 'new').length;
        const reviewCount = deckCards.filter((c) => c.status === 'review').length;
        const learnedCount = deckCards.filter((c) => c.status === 'learned').length;
        return {
          ...deck,
          cardsCount: deckCards.length,
          newCount,
          reviewCount,
          learnedCount,
        };
      });
      // Pipe updated cards completion properties directly to cloud docs database on change
      next.forEach((deck) => {
        if (user) {
          saveDeckToCloud(user.uid, deck).catch((e) => {
            console.error("Error updating deck counts in Firestore:", e);
            setCloudError("Insufficient permission or connection lost. Operating in Offline Safe Mode.");
          });
        }
      });
      return next;
    });
  };


  // --- 4. DATA MUTATION ACTIONS ---
  const handleAddCard = (deckId: string, question: string, answer: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      deckId,
      question,
      answer,
      status: 'new',
      lastStudiedText: 'New card',
    };

    const nextCards = [...cards, newCard];
    setCards(nextCards);
    syncDeckCardCounts(nextCards);
  };

  const handleDeleteCards = (cardIds: string[]) => {
    const nextCards = cards.filter((c) => !cardIds.includes(c.id));
    setCards(nextCards);
    syncDeckCardCounts(nextCards);
  };

  const handleUpdateCardStatus = (cardIds: string[], status: 'new' | 'review' | 'learned') => {
    const nextCards = cards.map((c) => {
      if (cardIds.includes(c.id)) {
        return {
          ...c,
          status,
          lastStudiedText: status === 'learned' ? 'Mastered' : status === 'review' ? 'Reviewing' : 'New card',
        };
      }
      return c;
    });
    setCards(nextCards);
    syncDeckCardCounts(nextCards);
  };

  const handleUpdateDeckTag = (deckId: string, newTag: string) => {
    setDecks((prevDecks) => {
      const next = prevDecks.map((d) => {
        if (d.id === deckId) {
          return {
            ...d,
            tag: newTag,
            category: newTag,
          };
        }
        return d;
      });
      const updated = next.find((d) => d.id === deckId);
      if (updated && user) {
        saveDeckToCloud(user.uid, updated).catch((e) => {
          console.error("Error setting tag value in Firestore:", e);
          setCloudError("Insufficient permission or connection lost. Operating in Offline Safe Mode.");
        });
      }
      return next;
    });
  };

  const handleSuspendCards = (cardIds: string[]) => {
    const nextCards = cards.map((c) => {
      if (cardIds.includes(c.id)) {
        return {
          ...c,
          lastStudiedText: 'Suspended',
        };
      }
      return c;
    });
    setCards(nextCards);
    syncDeckCardCounts(nextCards);
  };

  const handleAddDeck = (name: string, desc: string, tag: string, icon: string) => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      desc,
      tag,
      icon,
      category: tag,
      cardsCount: 0,
      newCount: 0,
      reviewCount: 0,
      learnedCount: 0,
    };

    const nextDecks = [...decks, newDeck];
    setDecks(nextDecks);
    if (user) {
      saveDeckToCloud(user.uid, newDeck).catch((e) => {
        console.error("Error saving brand new deck to Firestore:", e);
        setCloudError("Insufficient permission or connection lost. Operating in Offline Safe Mode.");
      });
    }
  };

  const handleUpdateName = (name: string) => {
    setUserStats((prev) => ({
      ...prev,
      userName: name,
    }));
  };

  const handleResetDatabase = () => {
    setDecks(INITIAL_DECKS);
    setCards(INITIAL_CARDS);
    setUserStats(INITIAL_USER_STATS);
    setSelectedDeckId(null);
    setActiveStudyDeckId(null);
    setCurrentView('dashboard');
    setStudiedToday(0);
    localStorage.setItem('flashlearn_studied_today', '0');
    localStorage.setItem('flashlearn_studied_date', new Date().toDateString());
  };

  const handleAddSampleCards = async () => {
    let targetDeckId = decks[0]?.id;
    let updatedDecks = [...decks];

    if (!targetDeckId) {
      // If there are no decks, create a sample deck first!
      const sampleDeck: Deck = {
        id: 'advanced-neuroscience',
        name: 'Advanced Neuroscience',
        desc: 'Exploring brain anatomical networks, neurotransmitters, and plasticity.',
        tag: 'Science',
        icon: 'Activity',
        category: 'Science',
        cardsCount: 2,
        newCount: 1,
        reviewCount: 1,
        learnedCount: 0
      };
      targetDeckId = sampleDeck.id;
      updatedDecks = [sampleDeck];
      setDecks(updatedDecks);
      if (user) {
        try {
          await saveDeckToCloud(user.uid, sampleDeck);
        } catch (e) {
          console.error("Error saving sample deck to cloud:", e);
          setCloudError("Insufficient permission or connection lost. Operating in Offline Safe Mode.");
        }
      }
    }

    const samples: Flashcard[] = [
      {
        id: `sample-${Date.now()}-1`,
        deckId: targetDeckId,
        question: 'Identify the role of microglia in brain immune defence.',
        answer: 'Microglia act as the dedicated macrophages of the Central Nervous System, active in clearing plaques, dead neurons, and sorting dynamic synaptic prunings.',
        status: 'new',
        lastStudiedText: 'New card',
      },
      {
        id: `sample-${Date.now()}-2`,
        deckId: targetDeckId,
        question: 'Define neurotransmitter reuptake blockers.',
        answer: 'Compounds preventing neurotransmitter resorption back through the presynaptic carrier channels, raising their local action potential coupling efficiency in synaptic clefts.',
        status: 'review',
        lastStudiedText: 'Reviewing',
      },
    ];

    const nextCards = [...cards, ...samples];
    setCards(nextCards);
    
    // Calculate and synchronize deck counts based on these active sample cards
    const cardCountsByDeck = nextCards.reduce((acc, card) => {
      if (!acc[card.deckId]) {
        acc[card.deckId] = { newCount: 0, reviewCount: 0, learnedCount: 0 };
      }
      if (card.status === 'new') acc[card.deckId].newCount++;
      else if (card.status === 'review') acc[card.deckId].reviewCount++;
      else if (card.status === 'learned') acc[card.deckId].learnedCount++;
      return acc;
    }, {} as Record<string, { newCount: number; reviewCount: number; learnedCount: number }>);

    const finalDecks = updatedDecks.map((deck) => {
      const counts = cardCountsByDeck[deck.id] || { newCount: 0, reviewCount: 0, learnedCount: 0 };
      const updated = {
        ...deck,
        ...counts,
        cardsCount: counts.newCount + counts.reviewCount + counts.learnedCount,
      };
      if (user) {
        saveDeckToCloud(user.uid, updated).catch((e) => {
          console.error("Error updating deck stats in cloud:", e);
          setCloudError("Insufficient permission or connection lost. Operating in Offline Safe Mode.");
        });
      }
      return updated;
    });

    setDecks(finalDecks);
  };

  const handleGradeCard = (cardId: string, grade: 'again' | 'good' | 'easy') => {
    let nextStatus: 'new' | 'review' | 'learned' = 'review';
    let studyLabel = 'Reviewing';

    if (grade === 'easy' || grade === 'good') {
      nextStatus = 'learned';
      studyLabel = 'Mastered';
    } else {
      nextStatus = 'review';
      studyLabel = 'Reviewing';
    }

    const nextCards = cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          status: nextStatus,
          lastStudiedText: studyLabel,
        };
      }
      return c;
    });

    setCards(nextCards);
    syncDeckCardCounts(nextCards);

    if (nextStatus === 'learned') {
      setUserStats((prev) => {
        const nextMastered = prev.cardsMastered + 1;
        return {
          ...prev,
          cardsMastered: nextMastered,
          masteredCount: nextMastered,
        };
      });
    }

    setStudiedToday((prev) => {
      const next = prev + 1;
      localStorage.setItem('flashlearn_studied_today', String(next));
      return next;
    });
  };


  // --- 5. NAVIGATION HELPERS ---
  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('decks');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Reset view & local states on logout so next user profile connects fresh
      setSelectedDeckId(null);
      setActiveStudyDeckId(null);
      setCurrentView('dashboard');
    } catch (e) {
      console.error('Error logging out from secure profile:', e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4 font-mono text-zinc-500 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-4 animate-spin">
          <div className="w-4 h-4 bg-[#E0FF00] rounded-sm" />
        </div>
        <p className="uppercase tracking-[0.2em] font-bold text-[#E0FF00] shadow-[0_0_10px_#E0FF00]/50">INITIALIZING COGNITIVE INTERFACE //</p>
        <p className="text-[10px] text-zinc-500 uppercase mt-1 animate-pulse">SECURE CONSOLE CONNECTIVITY v1.07</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen">
      
      {/* 5A. STICKY TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center w-full px-container-padding h-20">
        <div className="flex items-center gap-4">
          {/* Minimalist Hamburger Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#E0FF00] hover:bg-zinc-800/80 transition-colors p-2.5 rounded-full cursor-pointer border-0 bg-transparent flex items-center justify-center"
            title="Open Decks Navigator"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#E0FF00] shadow-[0_0_8px_#E0FF00]" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-black text-zinc-500">Live Client</span>
            </div>
            <h1 className="font-display text-lg tracking-tight font-black text-white select-none leading-none mt-1">
              FLASHLEARN.
            </h1>
          </div>
        </div>
        
        {/* Modern Profile & Sync Status Indicator Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.15em] font-mono text-zinc-400">Synced to Local</span>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`transition-all duration-200 px-3 py-2 rounded-xl border flex items-center gap-2 cursor-pointer ${
              isSettingsOpen 
                ? 'text-[#E0FF00] border-[#E0FF00]/50 bg-zinc-900' 
                : 'text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'
            }`}
            title="Profile & Settings"
          >
            <CircleUser className="w-5 h-5 text-[#E0FF00]" />
            <span className="font-mono text-xs hidden md:inline">{userStats.userName}</span>
          </button>
        </div>
      </header>

      {/* 5B. MAIN SCROLL CONTAINER */}
      <main className="px-container-padding pt-6 pb-26 max-w-2xl mx-auto">
        
        {cloudError && (
          <div className="mb-6 bg-[#160D0D] border border-red-800 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs text-red-400 select-none animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>{cloudError}</span>
            </div>
            <button 
              onClick={() => setCloudError(null)}
              className="text-red-400/70 hover:text-red-300 font-black cursor-pointer bg-transparent border-0 uppercase text-[10px] tracking-wider shrink-0"
            >
              [DISMISS //]
            </button>
          </div>
        )}

        {isSettingsOpen ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-500 hover:text-[#E0FF00] text-[10px] font-display font-black uppercase tracking-widest bg-transparent border-0 cursor-pointer p-0"
              >
                ← Back to Dashboard
              </button>
            </div>
            <SettingsView
              userStats={userStats}
              onUpdateName={handleUpdateName}
              onResetStats={handleResetDatabase}
              onAddSampleCards={handleAddSampleCards}
              email={user?.email || ''}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <>
            {/* 1. Dashboard View */}
            {currentView === 'dashboard' && (
              <StudyDashboard
                decks={decks}
                cards={cards}
                userStats={userStats}
                studiedToday={studiedToday}
                onSelectDeck={handleSelectDeck}
                onStartStudy={(deckId) => {
                  setActiveStudyDeckId(deckId);
                  setCurrentView('study');
                }}
                onOpenAddDeck={() => setIsAddDeckModalOpen(true)}
              />
            )}

            {/* 2. Decks View */}
            {currentView === 'decks' && (
              (() => {
                if (selectedDeckId) {
                  const activeDeck = decks.find((d) => d.id === selectedDeckId);
                  if (activeDeck) {
                    return (
                      <DeckDetail
                        deck={activeDeck}
                        cards={cards}
                        onBack={() => setSelectedDeckId(null)}
                        onStartStudy={(deckId) => {
                          setActiveStudyDeckId(deckId);
                          setCurrentView('study');
                        }}
                        onAddCard={handleAddCard}
                        onDeleteCards={handleDeleteCards}
                        onUpdateCardStatus={handleUpdateCardStatus}
                        onUpdateDeckTag={handleUpdateDeckTag}
                        onSuspendCards={handleSuspendCards}
                      />
                    );
                  }
                }

                return (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-500">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight mt-1">
                        My Decks
                      </h2>
                      <p className="text-zinc-400 font-sans text-sm mt-1">
                        Select a category deck to inspect cards, custom append, tag, or batch delete collections.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {decks.map((deck) => {
                        const total = cards.filter((c) => c.deckId === deck.id).length;
                        return (
                          <div
                            key={deck.id}
                            onClick={() => setSelectedDeckId(deck.id)}
                            className="p-5 bg-[#111111] hover:border-[#E0FF00]/40 border border-zinc-800 rounded-[28px] cursor-pointer hover:shadow-md transition-all flex justify-between items-center group"
                          >
                            <div className="space-y-1">
                              <span className="bg-zinc-900 border border-zinc-800 text-[#E0FF00] px-2.5 py-0.5 rounded-md text-[9px] font-display font-black uppercase tracking-widest leading-none mb-1 inline-block">
                                {deck.tag}
                              </span>
                              <h4 className="font-display font-black text-white group-hover:text-[#E0FF00] transition-colors text-base uppercase tracking-tight">
                                {deck.name}
                              </h4>
                              <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-sm line-clamp-1">
                                {deck.desc}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="text-[#E0FF00] font-display font-black text-lg">
                                {total}
                              </span>
                              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                                Cards Pool
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setIsAddDeckModalOpen(true)}
                        className="py-3 bg-zinc-900 border border-zinc-850 hover:bg-[#E0FF00] hover:text-black hover:border-transparent text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer transition-colors"
                      >
                        Create Custom Deck
                      </button>
                      <button
                        onClick={() => setAddCardModalDeckId(decks[0]?.id || null)}
                        className="py-3 bg-[#E0FF00] text-black hover:bg-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest shadow-[0_0_12px_rgba(224,255,0,0.2)] cursor-pointer transition-colors"
                      >
                        Create Flashcard
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {/* 3. Study Session View */}
            {currentView === 'study' && (
              (() => {
                const currentDeckObj = decks.find((d) => d.id === activeStudyDeckId);
                if (currentDeckObj) {
                  return (
                    <StudySession
                      deck={currentDeckObj}
                      cards={cards}
                      onBack={() => {
                        setActiveStudyDeckId(null);
                        setCurrentView('dashboard');
                      }}
                      onGradeCard={handleGradeCard}
                    />
                  );
                }

                // If activeStudyDeckId is null, render selection hub
                return (
                  <div className="space-y-6 pt-2 pb-10 animate-in fade-in duration-500">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight mt-1">
                        Active Study Hub
                      </h2>
                      <p className="text-zinc-400 font-sans text-sm mt-1">
                        Please choose a category deck below to begin your focused study session.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {decks.map((deck) => {
                        const remainingCount = cards.filter(c => c.deckId === deck.id && (c.status === 'new' || c.status === 'review')).length;
                        const total = cards.filter(c => c.deckId === deck.id).length;
                        return (
                          <div
                            key={deck.id}
                            onClick={() => {
                              setActiveStudyDeckId(deck.id);
                            }}
                            className="p-6 bg-[#111111] border border-zinc-800 hover:border-[#E0FF00]/40 rounded-[32px] cursor-pointer hover:shadow-lg transition-all flex justify-between items-center group"
                          >
                            <div className="space-y-1">
                              <span className="bg-zinc-900 border border-zinc-800 text-[#E0FF00] px-2.5 py-0.5 rounded-md text-[9px] font-display font-black uppercase tracking-widest leading-none inline-block">
                                {deck.tag}
                              </span>
                              <h4 className="font-display font-black text-white group-hover:text-[#E0FF00] transition-colors text-lg uppercase tracking-tight">
                                {deck.name}
                              </h4>
                              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                                {remainingCount} due cards left ({total} total)
                              </p>
                            </div>
                            <button className="bg-[#E0FF00] text-black w-10 h-10 rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-md hover:bg-white transition-all group-hover:scale-105">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}
          </>
        )}

      </main>

      {/* --- GLOBAL DIALOG OVERLAYS & MODALS --- */}
      
      {/* Dynamic Slide-Out Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        decks={decks}
        selectedDeckId={selectedDeckId}
        currentDeckId={selectedDeckId}
        onSelectDeck={handleSelectDeck}
      />
      
      {/* 5C. Add Custom Deck Dialog Overlay */}
      {isAddDeckModalOpen && (
        <AddDeckModal
          onClose={() => setIsAddDeckModalOpen(false)}
          onAddDeck={handleAddDeck}
        />
      )}

      {/* Absolute-positioned floating '+' action button (vibrant electric lime circle button) */}
      {((currentView === 'dashboard' || (currentView === 'decks' && !selectedDeckId)) && !isSettingsOpen) && (
        <button
          onClick={() => setIsAddDeckModalOpen(true)}
          className="fixed bottom-26 right-5 w-14 h-14 bg-[#E0FF00] text-black rounded-full shadow-[0_0_15px_rgba(224,255,0,0.3)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 z-40 cursor-pointer border-0"
          title="Add New Deck"
        >
          <Plus className="w-6 h-6 text-black stroke-[3px]" />
        </button>
      )}

      {/* Global Add Flashcard Modal */}
      {addCardModalDeckId !== null && (
        <AddCardModal
          decks={decks}
          defaultDeckId={addCardModalDeckId}
          onClose={() => setAddCardModalDeckId(null)}
          onAddCard={(deckId, question, answer) => {
            handleAddCard(deckId, question, answer);
          }}
        />
      )}

      {/* 5D. FIXED BOTTOM TAB NAVIGATION DOCK */}
      <BottomNavBar
        currentView={currentView}
        setCurrentView={(view) => {
          setIsSettingsOpen(false); // Close settings panel when tab changes
          setCurrentView(view);
        }}
        onClearDeckSelection={() => setSelectedDeckId(null)}
      />

    </div>
  );
}
