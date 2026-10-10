import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BreakRequestGame } from './components/games/BreakRequestGame';
import { TimeWarpGame } from './components/games/TimeWarpGame';
import { ChromaCrittersGame } from './components/games/ChromaCrittersGame';
import { StarTowerGame } from './components/games/StarTowerGame';
import { GameId } from './types';
import { GAMES_CATALOG } from './data/games';
import { soundEngine } from './utils/audio';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'game'>('dashboard');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [rbtMode, setRbtMode] = useState(true);

  const handleSelectGame = (gameId: GameId) => {
    setActiveGameId(gameId);
    setCurrentView('game');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveGameId(null);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleRbtMode = () => {
    setRbtMode(prev => !prev);
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
      />

      {currentView === 'dashboard' ? (
        <Dashboard onSelectGame={handleSelectGame} rbtMode={rbtMode} />
      ) : activeGameId === 'break-request' ? (
        <BreakRequestGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'more-time' ? (
        <TimeWarpGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'request-help' ? (
        <ChromaCrittersGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : activeGameId === 'turn-taking' ? (
        <StarTowerGame rbtMode={rbtMode} onExit={handleBackToDashboard} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Module in development</p>
        </div>
      )}
    </div>
  );
}

export default App;
