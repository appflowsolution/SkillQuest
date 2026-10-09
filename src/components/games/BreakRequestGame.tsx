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
import { CosmicItemIcon, CosmicItemType } from './CosmicItemIcon';
import { CosmicBackground } from '../CosmicBackground';

interface GemItem {
  id: number;
  x: number;
  y: number;
  itemType: CosmicItemType;
  color: string;
  borderColor: string;
  label: string;
  collected: boolean;
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

  // Progressive difficulty:
  // Scales quickly from 5 up to 25 crystals (+4 each round!)
  // Round 1 = 5, Round 2 = 9, Round 3 = 13, Round 4 = 17, Round 5 = 21, Round 6+ = 25!
  const calculateGemCount = (r: number) => Math.min(5 + (r - 1) * 4, 25);

  // User requested: 15 seconds per round for intense arcade tempo
  const totalRoundSeconds = 15;
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  // Break countdown timer (rest time)
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30);

  // Inactivity tracking
  const inactivityTimerRef = useRef<number | null>(null);

  // Generate gems with scaling quantity up to 25
  const generateGems = (currentRound: number) => {
    const count = calculateGemCount(currentRound);
    
    setSecondsRemaining(totalRoundSeconds);
    setIsTimeExpired(false);

    const cosmicVariants: { itemType: CosmicItemType; label: string; color: string; borderColor: string }[] = [
      { itemType: 'gem', label: 'Cosmic Crystal', color: 'from-[#00f2c9]/30 to-[#00a890]/15', borderColor: 'border-[#00f2c9]' },
      { itemType: 'planet', label: 'Ringed Planet', color: 'from-[#38bdf8]/30 to-[#0284c7]/15', borderColor: 'border-[#38bdf8]' },
      { itemType: 'rocket', label: 'Cosmic Rocket', color: 'from-[#f87171]/30 to-[#ef4444]/15', borderColor: 'border-[#f87171]' },
      { itemType: 'constellation', label: 'Glowing Star', color: 'from-[#fde047]/30 to-[#f59e0b]/15', borderColor: 'border-[#fde047]' },
      { itemType: 'moon', label: 'Crescent Moon', color: 'from-[#fef08a]/30 to-[#eab308]/15', borderColor: 'border-[#fde047]' },
    ];

    const newGems: GemItem[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    // Tighter spacing grid to accommodate up to 25 items on iPad comfortably
    const minDistance = count >= 20 ? 8.5 : count >= 13 ? 10 : count >= 8 ? 12 : 15;

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 100) {
        attempts++;
        x = Math.floor(Math.random() * 74) + 12; // 12% to 86% width
        y = Math.floor(Math.random() * 62) + 13; // 13% to 75% height

        // Clear margin around the bottom-left Break button area
        if (x < 36 && y > 56) continue;

        const collision = usedPositions.some(
          pos => Math.abs(pos.x - x) < minDistance && Math.abs(pos.y - y) < minDistance
        );
        if (!collision) valid = true;
      }

      usedPositions.push({ x, y });
      const variant = cosmicVariants[i % cosmicVariants.length];
      
      // Floating animation speed
      const floatDuration = Math.max(1.8, 3.8 - Math.min(currentRound * 0.25, 2.0));
      const floatDelay = (i * 0.15) % 1.5;

      newGems.push({
        id: i + 1,
        x,
        y,
        itemType: variant.itemType,
        color: variant.color,
        borderColor: variant.borderColor,
        label: variant.label,
        collected: false,
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

  // ROUND COUNTDOWN TIMER (15 seconds)
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
    }, 8000);
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
          particleCount: 65,
          spread: 80,
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

  // Resume after break (+5 bonus seconds grace time)
  const handleResumeFromBreak = () => {
    soundEngine.playTap();
    setIsBreakActive(false);
    setPromptActive(false);
    setSecondsRemaining(prev => Math.min(totalRoundSeconds, Math.max(prev + 5, 5)));
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

  // Adaptive gem sizing: scales down for 20-25 crystals
  const gemButtonSize = totalCount >= 20
    ? 'w-12 h-12 md:w-14 md:h-14'
    : totalCount >= 13
    ? 'w-15 h-15 md:w-17 md:h-17'
    : totalCount >= 8
    ? 'w-18 h-18 md:w-20 md:h-20'
    : 'w-22 h-22 md:w-24 md:h-24';

  const gemInnerSize = totalCount >= 20
    ? 'w-8 h-8 md:w-9 md:h-9'
    : totalCount >= 13
    ? 'w-10 h-10 md:w-11 md:h-11'
    : totalCount >= 8
    ? 'w-12 h-12 md:w-13 md:h-13'
    : 'w-14 h-14 md:w-15 md:h-15';


  return (
    <div className="flex-1 flex flex-col h-full bg-[#002f3c] overflow-hidden relative select-none">
      {/* Top Game Bar: Header with prominently wide timer gauge */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Navigation and Level */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </button>

          {/* Level Badge */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-[#84cece] uppercase tracking-wider hidden sm:inline">Level:</span>
            <span className="text-xs md:text-sm font-black text-slate-900 px-2.5 py-1 bg-[#ffb703] rounded-full shadow-sm">
              Round {round}
            </span>
          </div>

          {/* Remaining Crystals Counter */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2c9]" />
            <span className="text-xs font-black text-white">
              {remainingCount} <span className="text-[#84cece] font-normal">/ {totalCount}</span>
            </span>
          </div>
        </div>

        {/* Center: WIDE AND PROMINENT ARCADE TIMER BAR */}
        <div className="flex-1 max-w-sm md:max-w-md lg:max-w-xl mx-2 flex items-center gap-2.5">
          {/* Clock Icon and Text */}
          <div className="flex items-center gap-1.5 shrink-0 bg-[#002833] px-2.5 py-1 rounded-full border border-white/15">
            <Timer className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400 animate-spin' : 'text-[#00f2c9]'}`} />
            <span className={`text-xs md:text-sm font-black w-7 text-right ${isTimeCritical ? 'text-rose-400 animate-pulse text-base' : 'text-white'}`}>
              {secondsRemaining}s
            </span>
          </div>

          {/* TALL & WIDE PROGRESS BAR GAUGE */}
          <div className="flex-1 h-6 md:h-7 bg-[#002029] rounded-full border-2 border-white/30 overflow-hidden shadow-inner p-1 relative">
            <div
              className={`h-full rounded-full transition-all duration-300 relative ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 animate-pulse shadow-lg shadow-rose-500/50'
                  : timePercentage < 50
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-md shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-400 via-[#00f2c9] to-cyan-400 shadow-md shadow-cyan-500/30'
              }`}
              style={{ width: `${timePercentage}%` }}
            >
              {/* Subtle glass reflection on the progress bar */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full"></div>
            </div>
          </div>
        </div>

        {/* Right: Stars and Hint */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>

          {!isBreakActive && !isTimeExpired && (
            <button
              onClick={() => {
                setPromptActive(true);
                soundEngine.playPromptChime();
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 border active:scale-95 ${
                promptActive
                  ? 'bg-[#ffb703] text-slate-900 border-white shadow-md'
                  : 'bg-[#002b36] text-[#84cece] border-[#004f61] hover:text-white'
              }`}
              title="Helper hint"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden md:inline">{promptActive ? 'Hint On' : 'Hint'}</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN PLAY ARENA */}
      <div className="flex-1 relative bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] overflow-hidden">
        {/* Living Cosmic Starfield Background with Twinkling Mint Dots & Clouds */}
        <CosmicBackground />

        {/* Floating cosmic collectibles in the arena (crystals, planets, rockets, stars, moons) */}
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${gemButtonSize} rounded-full bg-[#00242e]/90 backdrop-blur-sm border-2 md:border-3 ${gem.borderColor} shadow-xl shadow-cyan-500/25 flex items-center justify-center transition-transform active:scale-90 hover:scale-110 z-10 animate-float-calm group/item cursor-pointer`}
              title={gem.label}
            >
              {/* Inner ambient glow on hover */}
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
              
              {/* Authentic Cosmic Illustration matching game cover art */}
              <div className={`${gemInnerSize} flex items-center justify-center p-1 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}>
                <CosmicItemIcon type={gem.itemType} />
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
                : `Round ${round}: Collect all ${totalCount} cosmic treasures in 15s!`}
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
              Round {round} had {totalCount} crystals in 15 seconds! Want to take a calm break or try again?
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleRequestBreak}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all border-2 border-white/60"
              >
                <Coffee className="w-5 h-5" />
                <span>Take a Calm Break (+5s Bonus Time)</span>
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
              Timer is paused! You'll get +5s bonus extra time when you resume. Breathe with the bubble:
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
              <span>I am ready! (+5s Bonus Time)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
