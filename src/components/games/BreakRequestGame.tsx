import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { 
  Coffee, 
  Sparkles, 
  Play, 
  Clock, 
  Zap, 
  ArrowLeft, 
  Star, 
  RotateCcw,
  Timer,
  CheckCircle2
} from 'lucide-react';

interface GemItem {
  id: number;
  x: number;
  y: number;
  color: string;
  iconBg: string;
  collected: boolean;
  shape: 'diamond' | 'circle' | 'star';
  floatDuration: number;
  floatDelay: number;
}

interface BreakRequestGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

export const BreakRequestGame = ({ onExit }: BreakRequestGameProps) => {
  // Game state
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [promptActive, setPromptActive] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Progressive difficulty calculations:
  // Gem count scales smoothly from 4 up to 16 (+2 gems each round!)
  const calculateGemCount = (r: number) => Math.min(4 + (r - 1) * 2, 16);

  // Timer: Seconds allowed per gem decreases as rounds increase (higher tempo demand)
  // Round 1 (4 gems): ~14s (3.5s per gem)
  // Round 3 (8 gems): ~18s (2.2s per gem)
  // Round 5 (12 gems): ~20s (1.6s per gem)
  // Round 7+ (16 gems): ~20s (1.25s per gem)
  const calculateRoundTime = (r: number, count: number) => {
    const secondsPerGem = Math.max(1.15, 3.2 - Math.min((r - 1) * 0.35, 2.05));
    return Math.max(12, Math.round(count * secondsPerGem));
  };

  const [totalRoundSeconds, setTotalRoundSeconds] = useState(14);
  const [secondsRemaining, setSecondsRemaining] = useState(14);

  // Break countdown timer
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30);

  // Inactivity tracking
  const inactivityTimerRef = useRef<number | null>(null);

  // Generate gems with scaling quantity and adaptive sizing
  const generateGems = (currentRound: number) => {
    const count = calculateGemCount(currentRound);
    const roundTime = calculateRoundTime(currentRound, count);
    
    setTotalRoundSeconds(roundTime);
    setSecondsRemaining(roundTime);
    setIsTimeExpired(false);

    const colors = [
      { color: 'from-[#00f2c9] to-[#00a890]', iconBg: 'bg-[#00d2b4]', shape: 'diamond' as const },
      { color: 'from-[#ffb703] to-[#fb8500]', iconBg: 'bg-amber-400', shape: 'circle' as const },
      { color: 'from-[#ff477e] to-[#d90429]', iconBg: 'bg-pink-500', shape: 'star' as const },
      { color: 'from-[#8ac926] to-[#55a630]', iconBg: 'bg-emerald-400', shape: 'diamond' as const },
      { color: 'from-[#7209b7] to-[#560bad]', iconBg: 'bg-purple-500', shape: 'circle' as const },
      { color: 'from-[#4cc9f0] to-[#4361ee]', iconBg: 'bg-cyan-400', shape: 'star' as const },
      { color: 'from-[#f72585] to-[#b5179e]', iconBg: 'bg-rose-500', shape: 'diamond' as const },
      { color: 'from-[#fee440] to-[#f77f00]', iconBg: 'bg-yellow-400', shape: 'circle' as const },
    ];

    const newGems: GemItem[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    // Spacing tolerance tightens slightly as gem count increases so all 16 fit comfortably
    const minDistance = count > 10 ? 11 : count > 6 ? 13 : 15;

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 80) {
        attempts++;
        x = Math.floor(Math.random() * 70) + 14; // 14% to 84% width
        y = Math.floor(Math.random() * 58) + 14; // 14% to 72% height

        // Clear margin around the bottom-left Break button area
        if (x < 36 && y > 58) continue;

        const collision = usedPositions.some(
          pos => Math.abs(pos.x - x) < minDistance && Math.abs(pos.y - y) < minDistance
        );
        if (!collision) valid = true;
      }

      usedPositions.push({ x, y });
      const palette = colors[i % colors.length];
      
      // Floating speed speeds up as rounds progress
      const floatDuration = Math.max(1.8, 4.0 - Math.min(currentRound * 0.25, 2.2));
      const floatDelay = (i * 0.2) % 1.5;

      newGems.push({
        id: i + 1,
        x,
        y,
        color: palette.color,
        iconBg: palette.iconBg,
        collected: false,
        shape: palette.shape,
        floatDuration,
        floatDelay,
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

  // ROUND COUNTDOWN TIMER
  useEffect(() => {
    let interval: number | null = null;
    if (!isBreakActive && !isTimeExpired && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsTimeExpired(true);
            soundEngine.playPromptChime();
            return 0;
          }
          if (prev <= 5 && !promptActive) {
            setPromptActive(true);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isBreakActive, isTimeExpired, secondsRemaining, promptActive]);

  // Break countdown timer
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

  // Inactivity timeout
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = window.setTimeout(() => {
      if (!isBreakActive && !isTimeExpired) {
        setPromptActive(true);
        soundEngine.playPromptChime();
      }
    }, 10000);
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
          particleCount: 60,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }

      setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        generateGems(nextRound);
      }, 900);
    }
  };

  // Player requests break (pauses timer immediately)
  const handleRequestBreak = () => {
    soundEngine.playBreakBell();
    setIsBreakActive(true);
    setBreakSecondsLeft(30);
    setIsTimeExpired(false);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#00f2c9', '#ffb703', '#ff477e'],
        origin: { x: 0.2, y: 0.8 },
      });
    } catch {
      // Ignore
    }
  };

  // Resume after break (+8 bonus seconds grace time)
  const handleResumeFromBreak = () => {
    soundEngine.playTap();
    setIsBreakActive(false);
    setPromptActive(false);
    setSecondsRemaining(prev => Math.max(prev + 8, 10));
    resetInactivityTimer();
  };

  // Retry round
  const handleRetryRound = () => {
    soundEngine.playTap();
    generateGems(round);
  };

  // Counts & stats
  const remainingCount = gems.filter(g => !g.collected).length;
  const totalCount = gems.length;
  const timePercentage = Math.max(0, Math.min(100, (secondsRemaining / totalRoundSeconds) * 100));
  const isTimeCritical = secondsRemaining <= 5;

  // Adaptive gem sizing: scales down smoothly when there are 11-16 crystals so all fit with room to spare!
  const gemButtonSize = totalCount >= 12 
    ? 'w-16 h-16 md:w-18 md:h-18' 
    : totalCount >= 8 
    ? 'w-18 h-18 md:w-21 md:h-21' 
    : 'w-22 h-22 md:w-24 md:h-24';

  const gemInnerSize = totalCount >= 12 
    ? 'w-10 h-10 md:w-11 md:h-11' 
    : totalCount >= 8 
    ? 'w-12 h-12 md:w-13 md:h-13' 
    : 'w-14 h-14 md:w-15 md:h-15';

  const gemIconSize = totalCount >= 12 
    ? 'w-5 h-5' 
    : totalCount >= 8 
    ? 'w-6 h-6' 
    : 'w-7 h-7';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#002f3c] overflow-hidden relative select-none">
      {/* Top Game Bar: Level, Gem Counter, Stars, and Live Timer */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-4 md:px-8 py-3 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Missions</span>
          </button>

          {/* Round Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#84cece] uppercase tracking-wider">Level:</span>
            <span className="text-sm font-black text-slate-900 px-3 py-0.5 bg-[#ffb703] rounded-full shadow-sm">
              Round {round}
            </span>
          </div>

          {/* Remaining Crystals Counter */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2c9]" />
            <span className="text-xs font-black text-white">
              {remainingCount} <span className="text-[#84cece] font-normal">/ {totalCount} left</span>
            </span>
          </div>

          {/* Stars */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-base font-black text-white">{score}</span>
          </div>
        </div>

        {/* Center/Right: Live Countdown Timer */}
        <div className="flex items-center gap-3 flex-1 max-w-xs mx-3">
          <div className="flex items-center gap-1.5 text-xs font-black shrink-0 text-white">
            <Timer className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400 animate-spin' : 'text-[#00f2c9]'}`} />
            <span className={`w-8 text-right ${isTimeCritical ? 'text-rose-400 font-black text-sm' : 'text-white'}`}>
              {secondsRemaining}s
            </span>
          </div>

          <div className="flex-1 h-3.5 bg-[#00232d] rounded-full border border-white/20 overflow-hidden shadow-inner p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse'
                  : timePercentage < 50
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                  : 'bg-gradient-to-r from-emerald-400 to-[#00f2c9]'
              }`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Helper Hint Trigger */}
        {!isBreakActive && !isTimeExpired && (
          <button
            onClick={() => {
              setPromptActive(true);
              soundEngine.playPromptChime();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 border active:scale-95 ${
              promptActive
                ? 'bg-[#ffb703] text-slate-900 border-white shadow-md'
                : 'bg-[#002b36] text-[#84cece] border-[#004f61] hover:text-white'
            }`}
            title="Helper hint"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">{promptActive ? 'Hint On' : 'Hint'}</span>
          </button>
        )}
      </div>

      {/* MAIN PLAY ARENA */}
      <div className="flex-1 relative bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] overflow-hidden">
        {/* Floating Stars Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-[#00f2c9] rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-2 h-2 bg-pink-400 rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-cyan-300 rounded-full"></div>
        </div>

        {/* Floating gems in the arena with adaptive size */}
        {!isBreakActive && !isTimeExpired && gems.map((gem) => {
          if (gem.collected) return null;

          return (
            <button
              key={gem.id}
              onClick={() => handleCollectGem(gem.id)}
              style={{
                left: `${gem.x}%`,
                top: `${gem.y}%`,
                animationDuration: `${gem.floatDuration}s`,
                animationDelay: `${gem.floatDelay}s`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${gemButtonSize} rounded-2xl md:rounded-3xl bg-[#004d60]/85 border-2 md:border-3 border-[#00f2c9] shadow-lg shadow-cyan-500/20 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 z-10 animate-float-calm`}
            >
              <div className={`${gemInnerSize} rounded-xl md:rounded-2xl bg-gradient-to-tr ${gem.color} flex items-center justify-center shadow-md border-2 border-white/60`}>
                <Sparkles className={`${gemIconSize} text-white animate-pulse`} />
              </div>
            </button>
          );
        })}

        {/* Top guidance banner */}
        {!isBreakActive && !isTimeExpired && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#004e63]/90 backdrop-blur border border-[#00c9a7]/40 px-5 py-1.5 rounded-full pointer-events-none text-white text-xs md:text-sm font-black flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>
              {isTimeCritical 
                ? 'Time running low! Tap fast or hit Take a Break!' 
                : `Round ${round}: Catch all ${totalCount} crystals before time ends!`}
            </span>
          </div>
        )}

        {/* THE CRITICAL BREAK BUTTON */}
        {!isBreakActive && (
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={handleRequestBreak}
              className={`min-w-[260px] md:min-w-[300px] h-20 md:h-24 px-6 rounded-3xl flex items-center justify-center gap-4 transition-all duration-200 shadow-2xl active:scale-95 ${
                promptActive || isTimeCritical
                  ? 'bg-gradient-to-r from-[#ffb703] via-[#fb8500] to-[#ffb703] text-slate-950 ring-4 ring-yellow-300 ring-offset-4 ring-offset-[#002f3c] scale-105 animate-pulse-subtle shadow-amber-500/50'
                  : 'bg-gradient-to-r from-[#ff8800] to-[#e85d04] hover:from-[#ff9e00] hover:to-[#f48c06] text-white border-3 border-white/80 shadow-orange-950/60'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                promptActive || isTimeCritical ? 'bg-slate-950 text-yellow-400' : 'bg-white/25 text-white'
              }`}>
                <Coffee className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="text-left">
                <div className={`text-base md:text-lg font-black tracking-tight ${
                  promptActive || isTimeCritical ? 'text-slate-950' : 'text-white'
                }`}>
                  TAKE A BREAK
                </div>
                <div className={`text-xs font-black uppercase tracking-wider ${
                  promptActive || isTimeCritical ? 'text-slate-900' : 'text-orange-100'
                }`}>
                  {isTimeCritical ? 'Pause Timer & Breathe!' : 'Pause Anytime'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* TIME EXPIRED OVERLAY */}
      {isTimeExpired && !isBreakActive && (
        <div className="absolute inset-0 bg-[#001f28]/95 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-amber-400 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 shadow-lg">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Time Ran Out!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              Round {round} had {totalCount} crystals and moved super fast! Want to take a break or try again?
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleRequestBreak}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all border-2 border-white/60"
              >
                <Coffee className="w-5 h-5" />
                <span>Take a Calm Break (+Bonus Time)</span>
              </button>

              <button
                onClick={handleRetryRound}
                className="w-full py-3.5 bg-[#002732] hover:bg-[#001f28] active:scale-98 text-[#00f2c9] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border border-[#00c9a7]/40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Round {round} Again ({totalCount} crystals)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALM OVERLAY SCREEN (BREAK ACTIVE) */}
      {isBreakActive && (
        <div className="absolute inset-0 bg-[#001f28]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-[#00d2b4] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-[#00576b] border-2 border-[#00f2c9] flex items-center justify-center text-yellow-300 mb-4 shadow-lg">
              <Coffee className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>GREAT CHOICE!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Time to relax!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              Timer is paused! You'll get +8s bonus extra time when you resume. Breathe with the bubble:
            </p>

            {/* Breathing Bubble */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-[#00d2b4]/20 border-2 border-[#00f2c9] animate-breathe"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs font-black text-[#00f2c9] uppercase tracking-wider">
                  Breathe In • Out
                </span>
                <span className="text-2xl font-black text-white flex items-center gap-1 mt-1">
                  <Clock className="w-5 h-5 text-yellow-300" />
                  {breakSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Resume Button */}
            <button
              onClick={handleResumeFromBreak}
              className="w-full py-4 bg-gradient-to-r from-[#8ac926] to-[#55a630] hover:from-[#9ef01a] hover:to-[#70e000] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all border-2 border-white/60"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>I am ready! (+8s Bonus Time)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
