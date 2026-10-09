import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { 
  Coffee, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Zap,
  Info
} from 'lucide-react';

interface GemItem {
  id: number;
  x: number;
  y: number;
  color: string;
  iconBg: string;
  collected: boolean;
  shape: 'diamond' | 'circle' | 'star';
}

interface BreakRequestGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

export const BreakRequestGame = ({ rbtMode, onExit }: BreakRequestGameProps) => {
  // Game state
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [promptActive, setPromptActive] = useState(false);
  const [lastActionWasPrompted, setLastActionWasPrompted] = useState(false);
  
  // Break countdown timer
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30);

  // RBT Clinical Tracking
  const [independentBreaks, setIndependentBreaks] = useState(0);
  const [promptedBreaks, setPromptedBreaks] = useState(0);

  // Inactivity tracking for automatic prompt
  const inactivityTimerRef = useRef<number | null>(null);

  // Generate gems per round
  const generateGems = (currentRound: number) => {
    const count = Math.min(3 + currentRound, 6);
    const colors = [
      { color: 'from-cyan-400 to-blue-500', iconBg: 'bg-cyan-400', shape: 'diamond' as const },
      { color: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-400', shape: 'circle' as const },
      { color: 'from-purple-400 to-pink-500', iconBg: 'bg-purple-400', shape: 'star' as const },
      { color: 'from-emerald-400 to-teal-500', iconBg: 'bg-emerald-400', shape: 'diamond' as const },
      { color: 'from-rose-400 to-red-500', iconBg: 'bg-rose-400', shape: 'circle' as const },
      { color: 'from-indigo-400 to-violet-500', iconBg: 'bg-indigo-400', shape: 'star' as const },
    ];

    const newGems: GemItem[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 50) {
        attempts++;
        x = Math.floor(Math.random() * 65) + 15; // 15% to 80% width
        y = Math.floor(Math.random() * 55) + 15; // 15% to 70% height

        // Avoid bottom-left corner where the Break Button resides
        if (x < 35 && y > 60) continue;

        const collision = usedPositions.some(
          pos => Math.abs(pos.x - x) < 16 && Math.abs(pos.y - y) < 18
        );
        if (!collision) valid = true;
      }

      usedPositions.push({ x, y });
      const palette = colors[i % colors.length];
      newGems.push({
        id: i + 1,
        x,
        y,
        color: palette.color,
        iconBg: palette.iconBg,
        collected: false,
        shape: palette.shape,
      });
    }

    setGems(newGems);
    resetInactivityTimer();
  };

  // Initialize round 1
  useEffect(() => {
    generateGems(1);
    return () => {
      if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // Break countdown
  useEffect(() => {
    let interval: number | null = null;
    if (isBreakActive && breakSecondsLeft > 0) {
      interval = window.setInterval(() => {
        setBreakSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isBreakActive, breakSecondsLeft]);

  // Inactivity timeout (automatic prompt after 14s of hesitation)
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    setPromptActive(false);

    inactivityTimerRef.current = window.setTimeout(() => {
      if (!isBreakActive) {
        setPromptActive(true);
        soundEngine.playPromptChime();
      }
    }, 14000);
  };

  // Collect gem on tap
  const handleCollectGem = (id: number) => {
    soundEngine.playGemPop();
    resetInactivityTimer();

    const updated = gems.map(g => (g.id === id ? { ...g, collected: true } : g));
    setGems(updated);
    setScore(prev => prev + 10);

    const allCollected = updated.every(g => g.collected);
    if (allCollected) {
      soundEngine.playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }

      setTimeout(() => {
        setRound(prev => prev + 1);
        generateGems(round + 1);
      }, 900);
    }
  };

  // CORE ABA TARGET: Break Request
  const handleRequestBreak = (wasPrompted: boolean) => {
    soundEngine.playBreakBell();
    setIsBreakActive(true);
    setBreakSecondsLeft(30);
    setLastActionWasPrompted(wasPrompted);

    if (wasPrompted) {
      setPromptedBreaks(prev => prev + 1);
    } else {
      setIndependentBreaks(prev => prev + 1);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#f59e0b', '#fbbf24', '#d97706'],
        origin: { x: 0.2, y: 0.8 },
      });
    } catch {
      // Ignore
    }
  };

  // Resume after break
  const handleResumeFromBreak = () => {
    soundEngine.playTap();
    setIsBreakActive(false);
    setPromptActive(false);
    resetInactivityTimer();
  };

  // Manual RBT prompt trigger
  const handleTriggerRbtPrompt = () => {
    setPromptActive(true);
    soundEngine.playPromptChime();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative select-none">
      {/* Top Game Bar: Round, Points & RBT Co-Pilot */}
      <div className="bg-white/95 border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mission:</span>
            <span className="text-sm font-black text-slate-900 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
              Round {round}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Star Points:</span>
            <span className="text-lg font-black text-amber-600">{score}</span>
          </div>
        </div>

        {/* RBT Supervisor Controls */}
        <div className="flex items-center gap-3">
          {rbtMode && (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mr-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Indep: {independentBreaks}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Prompt: {promptedBreaks}</span>
              </div>
            </div>
          )}

          {/* RBT Prompt Model Button */}
          {!isBreakActive && (
            <button
              onClick={handleTriggerRbtPrompt}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                promptActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md shadow-amber-500/30 font-black'
                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
              }`}
              title="Flash the Break button to model assistance"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{promptActive ? 'Prompt Active' : 'Suggest Break'}</span>
            </button>
          )}

          <button
            onClick={onExit}
            className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* MAIN PLAY ARENA (LIGHT MODE SKY/STARS) */}
      <div className="flex-1 relative bg-gradient-to-b from-sky-50 via-indigo-50/40 to-slate-100 overflow-hidden">
        {/* Soft floating stars & particles background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-indigo-300 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-2 h-2 bg-amber-300 rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 bg-violet-300 rounded-full"></div>
        </div>

        {/* Floating gems in the arena */}
        {!isBreakActive && gems.map((gem) => {
          if (gem.collected) return null;

          return (
            <button
              key={gem.id}
              onClick={() => handleCollectGem(gem.id)}
              style={{
                left: `${gem.x}%`,
                top: `${gem.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white border-2 border-indigo-200 shadow-xl shadow-indigo-500/15 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 z-10 animate-float-calm"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr ${gem.color} flex items-center justify-center shadow-md`}>
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
              </div>
            </button>
          );
        })}

        {/* Guided instruction pill */}
        {!isBreakActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 px-5 py-2 rounded-full pointer-events-none text-slate-700 text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Tap the star crystals to collect points</span>
          </div>
        )}

        {/* THE CORE TARGET: BIG BREAK BUTTON */}
        {!isBreakActive && (
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={() => handleRequestBreak(promptActive)}
              className={`min-w-[260px] md:min-w-[300px] h-20 md:h-24 px-6 rounded-3xl flex items-center justify-center gap-4 transition-all duration-200 shadow-xl active:scale-95 ${
                promptActive
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-slate-950 ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-100 scale-105 animate-pulse-subtle shadow-amber-500/40'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-2 border-amber-300 shadow-orange-500/20'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                promptActive ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-white'
              }`}>
                <Coffee className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="text-left">
                <div className={`text-base md:text-lg font-black tracking-tight ${
                  promptActive ? 'text-slate-950' : 'text-white'
                }`}>
                  I NEED A BREAK
                </div>
                <div className={`text-xs font-extrabold uppercase tracking-wider ${
                  promptActive ? 'text-slate-900 font-black' : 'text-amber-100'
                }`}>
                  Tap here to pause
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* CALM OVERLAY SCREEN (BREAK ACTIVE) */}
      {isBreakActive && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          {/* Praise Card for Requesting Break */}
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-md">
              <Coffee className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lastActionWasPrompted ? 'Prompted Request!' : 'Independent Request!'}</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
              Awesome job asking!
            </h3>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Asking for a break is a fantastic skill. Take a moment to relax and breathe.
            </p>

            {/* Guided Breathing Sphere */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-100 border border-indigo-300 animate-breathe"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Breathe In • Out
                </span>
                <span className="text-2xl font-black text-slate-900 flex items-center gap-1 mt-1">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  {breakSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Button to Resume When Ready */}
            <button
              onClick={handleResumeFromBreak}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all border border-emerald-400"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>I am ready to play!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
