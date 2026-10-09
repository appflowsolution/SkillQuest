import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { TimeItemIcon, TimeItemType } from './TimeItemIcon';
import { 
  Clock, 
  ArrowLeft, 
  Star, 
  Timer, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Compass, 
  PlusCircle, 
  Award 
} from 'lucide-react';

interface TimeArtifact {
  id: number;
  x: number;
  y: number;
  itemType: TimeItemType;
  color: string;
  borderColor: string;
  label: string;
  collected: boolean;
  floatDuration: number;
  floatDelay: number;
}

interface TimeWarpGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

const TIME_ERAS = [
  { era: 1, name: 'Pharaoh Sands', subtitle: 'Ancient Sun Dial Era' },
  { era: 2, name: 'Clockwork Citadel', subtitle: 'Steampunk Cog Realm' },
  { era: 3, name: 'Chrono Galaxy', subtitle: 'Future Spacetime Vortex' },
  { era: 4, name: 'Lost Atlantis', subtitle: 'Deep Ocean Hourglass Era' },
  { era: 5, name: 'Infinity Nexus', subtitle: 'Master Time Capsule' },
];

export const TimeWarpGame = ({ onExit }: TimeWarpGameProps) => {
  // Game & Era progression
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [artifacts, setArtifacts] = useState<TimeArtifact[]>([]);
  const [promptActive, setPromptActive] = useState(false);
  
  // Clinical Time Extension mechanics (Skill 9)
  const initialRoundSeconds = 20;
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const maxExtensionsPerRound = 2;
  const [extensionsLeft, setExtensionsLeft] = useState(2);
  const [isTimeExtendedBanner, setIsTimeExtendedBanner] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);

  // Progressive difficulty scaling (from 5 up to 22 items)
  const calculateItemCount = (r: number) => Math.min(5 + (r - 1) * 4, 22);

  // Inactivity tracking for prompts
  const promptTimerRef = useRef<number | null>(null);

  // Current Era metadata
  const currentEra = TIME_ERAS[(round - 1) % TIME_ERAS.length];

  // Generate artifacts in the time vortex
  const generateArtifacts = (currentRound: number) => {
    const count = calculateItemCount(currentRound);
    setSecondsRemaining(initialRoundSeconds);
    setExtensionsLeft(maxExtensionsPerRound);
    setIsTransitionComplete(false);
    setIsTimeExtendedBanner(false);

    const variants: { itemType: TimeItemType; label: string; color: string; borderColor: string }[] = [
      { itemType: 'hourglass', label: 'Golden Hourglass', color: 'from-amber-400/30 to-yellow-600/15', borderColor: 'border-amber-400' },
      { itemType: 'pocket-watch', label: 'Antique Watch', color: 'from-yellow-300/30 to-amber-500/15', borderColor: 'border-yellow-300' },
      { itemType: 'gear', label: 'Brass Cogwheel', color: 'from-amber-500/30 to-orange-600/15', borderColor: 'border-amber-500' },
      { itemType: 'compass', label: 'Temporal Compass', color: 'from-cyan-400/30 to-blue-600/15', borderColor: 'border-cyan-400' },
      { itemType: 'chronosphere', label: 'Chrono Core', color: 'from-sky-300/30 to-teal-500/15', borderColor: 'border-sky-300' },
    ];

    const newItems: TimeArtifact[] = [];
    const usedPositions: { x: number; y: number }[] = [];
    const minDistance = count >= 18 ? 9 : count >= 12 ? 11 : 14;

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 100) {
        attempts++;
        x = Math.floor(Math.random() * 74) + 12; // 12% to 86%
        y = Math.floor(Math.random() * 58) + 14; // 14% to 72%

        // Clear margin around the bottom-left "+1 Minute" button area
        if (x < 38 && y > 54) continue;

        const collision = usedPositions.some(
          pos => Math.abs(pos.x - x) < minDistance && Math.abs(pos.y - y) < minDistance
        );
        if (!collision) valid = true;
      }

      usedPositions.push({ x, y });
      const variant = variants[i % variants.length];
      const floatDuration = Math.max(1.8, 3.8 - Math.min(currentRound * 0.25, 2.0));
      const floatDelay = (i * 0.14) % 1.6;

      newItems.push({
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

    setArtifacts(newItems);
  };

  // Init round on mount
  useEffect(() => {
    generateArtifacts(1);
    return () => {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
    };
  }, []);

  // Countdown timer with auditory warning tick on critical time
  useEffect(() => {
    let interval: number | null = null;
    if (!isTransitionComplete && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsTransitionComplete(true);
            soundEngine.playSuccess();
            return 0;
          }
          // Auditory and visual warning when time is running low (<= 7s)
          if (prev <= 7) {
            soundEngine.playClockTick();
            if (extensionsLeft > 0 && !promptActive) {
              setPromptActive(true);
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isTransitionComplete, secondsRemaining, extensionsLeft, promptActive]);

  // Collect artifact
  const handleCollectArtifact = (id: number) => {
    soundEngine.playGemPop();

    const updated = artifacts.map(a => (a.id === id ? { ...a, collected: true } : a));
    setArtifacts(updated);
    setScore(prev => prev + 15);

    const allCollected = updated.every(a => a.collected);
    if (allCollected) {
      soundEngine.playSuccess();
      try {
        confetti({
          particleCount: 70,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }

      setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        generateArtifacts(nextRound);
      }, 1000);
    }
  };

  // THE KEY CLINICAL ACTION: Player asks for more time (+1 MORE MINUTE)
  const handleRequestMoreTime = () => {
    if (extensionsLeft <= 0) return;

    soundEngine.playTimeExtension();
    setSecondsRemaining(prev => prev + 15);
    setExtensionsLeft(prev => prev - 1);
    setPromptActive(false);
    setIsTimeExtendedBanner(true);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        colors: ['#fde047', '#38bdf8', '#00f2c9'],
        origin: { x: 0.25, y: 0.8 },
      });
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsTimeExtendedBanner(false);
    }, 2800);
  };

  // Retry or Advance after Transition
  const handleNextEra = () => {
    soundEngine.playTap();
    const nextRound = round + 1;
    setRound(nextRound);
    generateArtifacts(nextRound);
  };

  const remainingCount = artifacts.filter(a => !a.collected).length;
  const totalCount = artifacts.length;
  const isTimeCritical = secondsRemaining <= 7;
  const timePercentage = Math.max(0, Math.min(100, (secondsRemaining / initialRoundSeconds) * 100));

  // Dynamic sizes for artifacts
  const artifactButtonSize = totalCount >= 18
    ? 'w-12 h-12 md:w-14 md:h-14'
    : totalCount >= 12
    ? 'w-15 h-15 md:w-17 md:h-17'
    : 'w-18 h-18 md:w-20 md:h-20';

  const artifactInnerSize = totalCount >= 18
    ? 'w-8 h-8 md:w-9 md:h-9'
    : totalCount >= 12
    ? 'w-10 h-10 md:w-11 md:h-11'
    : 'w-12 h-12 md:w-13 md:h-13';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#002f3c] overflow-hidden relative select-none">
      {/* Top Game Navigation & Time Warp HUD */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Exit & Era Info */}
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

          {/* Era Badge */}
          <div className="flex items-center gap-1.5 bg-[#ffb703] text-slate-950 px-3 py-1 rounded-full font-black text-xs md:text-sm shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>Era {round}: {currentEra.name}</span>
          </div>

          {/* Artifact Counter */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2c9]" />
            <span className="text-xs font-black text-white">
              {remainingCount} <span className="text-[#84cece] font-normal">/ {totalCount}</span>
            </span>
          </div>
        </div>

        {/* Center: WIDE PROGRESS TIMER BAR */}
        <div className="flex-1 max-w-sm md:max-w-md lg:max-w-xl mx-2 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0 bg-[#002833] px-2.5 py-1 rounded-full border border-white/15">
            <Timer className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400 animate-spin' : 'text-[#fde047]'}`} />
            <span className={`text-xs md:text-sm font-black w-8 text-right ${isTimeCritical ? 'text-rose-400 animate-pulse text-base font-extrabold' : 'text-white'}`}>
              {secondsRemaining}s
            </span>
          </div>

          <div className="flex-1 h-6 md:h-7 bg-[#002029] rounded-full border-2 border-white/30 overflow-hidden shadow-inner p-1 relative">
            <div
              className={`h-full rounded-full transition-all duration-300 relative ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 animate-pulse shadow-lg shadow-rose-500/50'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-[#00f2c9] shadow-md shadow-amber-500/30'
              }`}
              style={{ width: `${timePercentage}%` }}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full"></div>
            </div>
          </div>
        </div>

        {/* Right: Score & Hint */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>

          {!isTransitionComplete && (
            <button
              onClick={() => {
                setPromptActive(true);
                soundEngine.playPromptChime();
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 border active:scale-95 ${
                promptActive
                  ? 'bg-[#ffb703] text-slate-950 border-white shadow-md'
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

      {/* MAIN PLAY ARENA: Time Vortex Environment */}
      <div className="flex-1 relative bg-gradient-to-b from-[#003847] via-[#002a36] to-[#001f28] overflow-hidden">
        {/* Living Cosmic Starfield Background with Twinkling Mint Dots & Clouds */}
        <CosmicBackground />

        {/* Concentric Time Vortex Spirals in Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className={`w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full border-4 border-dashed border-[#00f2c9] ${isTimeCritical ? 'animate-spin' : ''}`} style={{ animationDuration: '30s' }}></div>
          <div className="absolute w-[240px] h-[240px] md:w-[340px] md:h-[340px] rounded-full border-2 border-dotted border-[#fde047]"></div>
          <div className="absolute w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full bg-cyan-500/10 blur-xl"></div>
        </div>

        {/* Floating Time Artifacts (Hourglasses, Watches, Gears, Compasses, Chronospheres) */}
        {!isTransitionComplete && artifacts.map((item) => {
          if (item.collected) return null;

          return (
            <button
              key={item.id}
              onClick={() => handleCollectArtifact(item.id)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                animationDuration: `${item.floatDuration}s`,
                animationDelay: `${item.floatDelay}s`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${artifactButtonSize} rounded-full bg-[#00242e]/90 backdrop-blur-sm border-2 md:border-3 ${item.borderColor} shadow-xl shadow-amber-500/20 flex items-center justify-center transition-transform active:scale-90 hover:scale-110 z-10 animate-float-calm group/item cursor-pointer`}
              title={item.label}
            >
              {/* Inner ambient glow on hover */}
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
              
              {/* Authentic Time Artifact Illustration */}
              <div className={`${artifactInnerSize} flex items-center justify-center p-1 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}>
                <TimeItemIcon type={item.itemType} />
              </div>
            </button>
          );
        })}

        {/* Top Guidance / Warning Banner */}
        {!isTransitionComplete && (
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 backdrop-blur px-5 py-1.5 rounded-full pointer-events-none text-white text-xs md:text-sm font-black flex items-center gap-2 shadow-lg transition-all ${
            isTimeCritical 
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 border-2 border-yellow-300 animate-pulse text-yellow-100 scale-105'
              : 'bg-[#004e63]/90 border border-[#00c9a7]/40'
          }`}>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>
              {isTimeCritical 
                ? (extensionsLeft > 0 ? 'Portal closing! Tap +1 MORE MINUTE to extend!' : 'Time ending! Prepare to transition!') 
                : `Era ${round}: Gather all ${totalCount} temporal artifacts!`}
            </span>
          </div>
        )}

        {/* TIME EXTENDED CONFIRMATION BANNER */}
        {isTimeExtendedBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-[#00f2c9] to-teal-500 text-slate-950 font-black px-6 py-2 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce z-40">
            <PlusCircle className="w-5 h-5 fill-slate-950 text-white" />
            <span className="text-xs md:text-sm uppercase tracking-wider">
              SUCCESSFUL REQUEST! +15 SECONDS ADDED!
            </span>
          </div>
        )}

        {/* THE CRITICAL CLINICAL BUTTON: +1 MORE MINUTE (Skill 9) */}
        {!isTransitionComplete && (
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={handleRequestMoreTime}
              disabled={extensionsLeft <= 0}
              className={`min-w-[270px] md:min-w-[320px] h-20 md:h-24 px-6 rounded-3xl flex items-center justify-between gap-4 transition-all duration-200 shadow-2xl active:scale-95 ${
                extensionsLeft <= 0
                  ? 'bg-slate-800 text-slate-500 border-2 border-slate-700 cursor-not-allowed opacity-60'
                  : promptActive || isTimeCritical
                  ? 'bg-gradient-to-r from-[#ffc300] via-[#ffaa00] to-[#ffb703] text-slate-950 ring-4 ring-yellow-300 ring-offset-4 ring-offset-[#002f3c] scale-105 animate-pulse-subtle shadow-amber-500/60 cursor-pointer'
                  : 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#00c4ea] hover:to-[#0088cc] text-white border-3 border-white/80 shadow-cyan-950/60 cursor-pointer'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                extensionsLeft <= 0
                  ? 'bg-slate-700 text-slate-500'
                  : promptActive || isTimeCritical 
                  ? 'bg-slate-950 text-yellow-400' 
                  : 'bg-white/25 text-white'
              }`}>
                <Clock className="w-7 h-7 md:w-8 md:h-8" />
              </div>

              <div className="text-left flex-1 min-w-0">
                <div className={`text-base md:text-lg font-black tracking-tight truncate ${
                  extensionsLeft <= 0
                    ? 'text-slate-400'
                    : promptActive || isTimeCritical 
                    ? 'text-slate-950' 
                    : 'text-white'
                }`}>
                  +1 MORE MINUTE
                </div>
                <div className={`text-xs font-black uppercase tracking-wider truncate ${
                  extensionsLeft <= 0
                    ? 'text-slate-500'
                    : promptActive || isTimeCritical 
                    ? 'text-slate-900' 
                    : 'text-cyan-100'
                }`}>
                  {extensionsLeft > 0 
                    ? `Request Extra Time (${extensionsLeft} left)` 
                    : 'Max Extensions Reached'}
                </div>
              </div>

              {extensionsLeft > 0 && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 font-black text-xs">
                  +{extensionsLeft}
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* TRANSITION TOLERANCE SUCCESS OVERLAY (When time wraps up) */}
      {isTransitionComplete && (
        <div className="absolute inset-0 bg-[#001f28]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-amber-400 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            {/* Friendly Explorer Avatar / Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 shadow-lg">
              <Award className="w-10 h-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>TRANSITION CHAMPION!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Great Job Tolerating the End of Time!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              You explored {currentEra.name} and negotiated your time peacefully. Ready for the next era or mission?
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleNextEra}
                className="w-full py-4 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all border-2 border-white/70"
              >
                <Compass className="w-5 h-5" />
                <span>Travel to Next Era (Era {round + 1})</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="w-full py-3.5 bg-[#002732] hover:bg-[#001f28] active:scale-98 text-[#00f2c9] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border border-[#00c9a7]/40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Mission Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
