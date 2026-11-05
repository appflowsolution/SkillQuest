import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { StatsAuthModal } from './components/stats/StatsAuthModal';
import { BreakRequestGame } from './components/games/BreakRequestGame';
import { TimeWarpGame } from './components/games/TimeWarpGame';
import { ChromaCrittersGame } from './components/games/ChromaCrittersGame';
import { StarTowerGame } from './components/games/StarTowerGame';
import { IconQuestGame } from './components/games/IconQuestGame';
import { EchoBeatsGame } from './components/games/EchoBeatsGame';
import { CosmicFuelGame } from './components/games/CosmicFuelGame';
import { MeteorArrayGame } from './components/games/MeteorArrayGame';
import { NumberForgeGame } from './components/games/NumberForgeGame';
import { MemoryVaultGame } from './components/games/MemoryVaultGame';
import type { GameId, WorldSector } from './types';

import { GAMES_CATALOG } from './data/games';
import { soundEngine } from './utils/audio';
import { recordHeartbeat, recordSessionExit, syncRemotePin } from './services/statsService';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'game' | 'stats'>('dashboard');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [activeSector, setActiveSector] = useState<WorldSector>('behavior');
  const [isMuted, setIsMuted] = useState(false);
  const [rbtMode, setRbtMode] = useState(true);

  // Sync PIN from cloud on initial load
  useEffect(() => {
    syncRemotePin().catch(() => {});
  }, []);

  // Stats Auth & View state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStatsUnlocked, setIsStatsUnlocked] = useState(false);

  // Session & Heartbeat tracking refs
  const activeGameIdRef = useRef<GameId | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const lastFlushTimeRef = useRef<number | null>(null);

  useEffect(() => {
    activeGameIdRef.current = activeGameId;
  }, [activeGameId]);

  // Periodic heartbeat timer (every 60s)
  useEffect(() => {
    if (currentView !== 'game' || !activeGameId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastFlushTimeRef.current && activeGameIdRef.current) {
        const deltaSeconds = (now - lastFlushTimeRef.current) / 1000;
        if (deltaSeconds >= 5) {
          recordHeartbeat(activeGameIdRef.current, deltaSeconds);
          lastFlushTimeRef.current = now;
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentView, activeGameId]);

  const flushActiveGameSession = () => {
    const currentGameId = activeGameIdRef.current || activeGameId;
    if (currentGameId && sessionStartTimeRef.current) {
      const now = Date.now();
      const unflushedSeconds = (now - (lastFlushTimeRef.current || sessionStartTimeRef.current)) / 1000;
      const totalSessionSeconds = (now - sessionStartTimeRef.current) / 1000;
      recordSessionExit(currentGameId, unflushedSeconds, totalSessionSeconds);
      sessionStartTimeRef.current = null;
      lastFlushTimeRef.current = null;
      activeGameIdRef.current = null;
      setActiveGameId(null);
    }
  };

  // Visibility change & beforeunload handler (e.g. tablet app minimized or tab closed)
  useEffect(() => {
    const handleFlushOnLeave = () => {
      if (activeGameIdRef.current && lastFlushTimeRef.current) {
        const now = Date.now();
        const deltaSeconds = (now - lastFlushTimeRef.current) / 1000;
        if (deltaSeconds >= 1) {
          recordHeartbeat(activeGameIdRef.current, deltaSeconds);
          lastFlushTimeRef.current = now;
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushOnLeave();
      }
    };

    const handleBeforeUnload = () => {
      flushActiveGameSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSelectGame = (gameId: GameId) => {
    const now = Date.now();
    sessionStartTimeRef.current = now;
    lastFlushTimeRef.current = now;

    const game = GAMES_CATALOG.find(g => g.id === gameId);
    if (game?.sector) {
      setActiveSector(game.sector);
    }
    setActiveGameId(gameId);
    setCurrentView('game');
  };

  const handleBackToDashboard = () => {
    flushActiveGameSession();
    setCurrentView('dashboard');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleRbtMode = () => {
    setRbtMode(prev => !prev);
  };

  const handleOpenStats = () => {
    if (currentView === 'game') {
      flushActiveGameSession();
    }
    if (isStatsUnlocked) {
      setCurrentView('stats');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsStatsUnlocked(true);
    setCurrentView('stats');
  };

  const activeGame = GAMES_CATALOG.find(g => g.id === activeGameId);

  return (
    <div className="w-full h-full flex flex-col bg-[#002f3c] text-white overflow-hidden font-sans">
      <Header
        currentView={currentView}
        activeGameTitle={activeGame?.title}
        onBackToDashboard={handleBackToDashboard}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        rbtMode={rbtMode}
        onToggleRbtMode={handleToggleRbtMode}
        onOpenStats={handleOpenStats}
      />

      {currentView === 'dashboard' ? (
        <Dashboard 
          onSelectGame={handleSelectGame} 
          rbtMode={rbtMode} 
          activeSector={activeSector}
          onSectorChange={setActiveSector}
        />
      ) : currentView === 'stats' ? (
        <StatsDashboard onBack={handleBackToDashboard} />
      ) : activeGameId === 'break-request' ? (
        <BreakRequestGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'more-time' ? (
        <TimeWarpGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'request-help' ? (
        <ChromaCrittersGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'turn-taking' ? (
        <StarTowerGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'aac-trainer' ? (
        <IconQuestGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'echoic-lab' ? (
        <EchoBeatsGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'cosmic-fuel' ? (
        <CosmicFuelGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'meteor-array' ? (
        <MeteorArrayGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'number-forge' ? (
        <NumberForgeGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'memory-vault' ? (
        <MemoryVaultGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Module in development</p>
        </div>
      )}

      {/* RBT / Clinical PIN Auth Modal */}
      <StatsAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
