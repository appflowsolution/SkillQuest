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
  Star
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

export const BreakRequestGame = ({ onExit }: BreakRequestGameProps) => {
  // Game state
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [promptActive, setPromptActive] = useState(false);
  
  // Break countdown timer
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30);

  // Inactivity tracking for automatic friendly hint
  const inactivityTimerRef = useRef<number | null>(null);

  // Generate gems per round
  const generateGems = (currentRound: number) => {
    const count = Math.min(3 + currentRound, 6);
    const colors = [
      { color: 'from-[#00f2c9] to-[#00a890]', iconBg: 'bg-[#00d2b4]', shape: 'diamond' as const },
      { color: 'from-[#ffb703] to-[#fb8500]', iconBg: 'bg-amber-400', shape: 'circle' as const },
      { color: 'from-[#ff477e] to-[#d90429]', iconBg: 'bg-pink-500', shape: 'star' as const },
      { color: 'from-[#8ac926] to-[#55a630]', iconBg: 'bg-emerald-400', shape: 'diamond' as const },
      { color: 'from-[#7209b7] to-[#560bad]', iconBg: 'bg-purple-500', shape: 'circle' as const },
      { color: 'from-[#4cc9f0] to-[#4361ee]', iconBg: 'bg-cyan-400', shape: 'star' as const },
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
        x = Math.floor(Math.random() * 65) + 18; // 18% to 83% width
        y = Math.floor(Math.random() * 55) + 15; // 15% to 70% height

        // Avoid bottom-left area where the Pause/Break Button sits
        if (x < 38 && y > 60) continue;

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

  // Inactivity timeout
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

  // Player requests break
  const handleRequestBreak = () => {
    soundEngine.playBreakBell();
    setIsBreakActive(true);
    setBreakSecondsLeft(30);

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

  // Resume after break
  const handleResumeFromBreak = () => {
    soundEngine.playTap();
    setIsBreakActive(false);
    setPromptActive(false);
    resetInactivityTimer();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#002f3c] overflow-hidden relative select-none">
      {/* Top Game Bar: Playful Arcade Style */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-4 md:px-8 py-3 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Games</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#84cece] uppercase tracking-wider">Level:</span>
            <span className="text-sm font-black text-slate-900 px-3 py-0.5 bg-[#ffb703] rounded-full shadow-sm">
              Round {round}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-black text-[#84cece] uppercase tracking-wider">Stars:</span>
            <span className="text-lg font-black text-white">{score}</span>
          </div>
        </div>

        {/* Model prompt button for helper / therapist (discreet) */}
        {!isBreakActive && (
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
            <span className="hidden sm:inline">{promptActive ? 'Hint Active' : 'Hint'}</span>
          </button>
        )}
      </div>

      {/* MAIN PLAY ARENA */}
      <div className="flex-1 relative bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] overflow-hidden">
        {/* Playful Floating Stars Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-[#00f2c9] rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-2 h-2 bg-pink-400 rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-cyan-300 rounded-full"></div>
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
              className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-[#004d60]/80 border-3 border-[#00f2c9] shadow-xl shadow-cyan-500/25 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 z-10 animate-float-calm"
            >
              <div className={`w-13 h-13 md:w-15 md:h-15 rounded-2xl bg-gradient-to-tr ${gem.color} flex items-center justify-center shadow-lg border-2 border-white/60`}>
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
            </button>
          );
        })}

        {/* Top game hint pill */}
        {!isBreakActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#004e63]/90 backdrop-blur border border-[#00c9a7]/40 px-5 py-2 rounded-full pointer-events-none text-white text-xs md:text-sm font-black flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Tap the cosmic crystals to collect star points!</span>
          </div>
        )}

        {/* THE REAL GAME BREAK BUTTON (POWER-UP SHIELD STYLE) */}
        {!isBreakActive && (
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={handleRequestBreak}
              className={`min-w-[260px] md:min-w-[300px] h-20 md:h-24 px-6 rounded-3xl flex items-center justify-center gap-4 transition-all duration-200 shadow-2xl active:scale-95 ${
                promptActive
                  ? 'bg-gradient-to-r from-[#ffb703] via-[#fb8500] to-[#ffb703] text-slate-950 ring-4 ring-yellow-300 ring-offset-4 ring-offset-[#002f3c] scale-105 animate-pulse-subtle shadow-amber-500/50'
                  : 'bg-gradient-to-r from-[#ff8800] to-[#e85d04] hover:from-[#ff9e00] hover:to-[#f48c06] text-white border-3 border-white/80 shadow-orange-950/60'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                promptActive ? 'bg-slate-950 text-yellow-400' : 'bg-white/25 text-white'
              }`}>
                <Coffee className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="text-left">
                <div className={`text-base md:text-lg font-black tracking-tight ${
                  promptActive ? 'text-slate-950' : 'text-white'
                }`}>
                  TAKE A BREAK
                </div>
                <div className={`text-xs font-black uppercase tracking-wider ${
                  promptActive ? 'text-slate-900' : 'text-orange-100'
                }`}>
                  Pause & Relax Anytime
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* CALM OVERLAY SCREEN (COZY ARCADE PAUSE) */}
      {isBreakActive && (
        <div className="absolute inset-0 bg-[#001f28]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          {/* Pause Card */}
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
              Taking a break whenever you need it is a real superpower. Breathe with the bubble below:
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
              <span>I am ready to play!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
