import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { TimeItemIcon, TimeItemType } from './TimeItemIcon';
import { 
  Clock, 
  ArrowLeft, 
  Star, 
  Timer, 
  Sparkles, 
  Zap, 
  Compass, 
  PlusCircle, 
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface TrackItem {
  id: number;
  lane: number; // 0: Left, 1: Center, 2: Right
  y: number; // 0% (horizon) to 100% (past player)
  type: 'collectible' | 'anomaly';
  itemType?: TimeItemType;
  label: string;
  collected?: boolean;
}

interface TimeWarpGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

interface FloatingFeedback {
  id: number;
  text: string;
  lane: number;
  type: 'collect' | 'glitch';
}

interface EraConfig {
  name: string;
  bgGradient: string;
  horizonColor: string;
  targetRelics: number;
  baseTime: number;
  baseDistance: number;
  itemSpeed: number;
  runnerSpeed: number;
  anomalyChance: number;
  spawnDistanceInterval: number;
}

const ERAS: EraConfig[] = [
  {
    name: 'Pharaoh Sands',
    bgGradient: 'from-[#002f3c] via-[#004758] to-[#001f28]',
    horizonColor: '#f59e0b',
    targetRelics: 4,
    baseTime: 18,
    baseDistance: 120,
    itemSpeed: 38,
    runnerSpeed: 6.5,
    anomalyChance: 0.20,
    spawnDistanceInterval: 8,
  },
  {
    name: 'Clockwork Realm',
    bgGradient: 'from-[#002833] via-[#003847] to-[#001d24]',
    horizonColor: '#00f2c9',
    targetRelics: 6,
    baseTime: 17,
    baseDistance: 140,
    itemSpeed: 48,
    runnerSpeed: 7.2,
    anomalyChance: 0.28,
    spawnDistanceInterval: 7,
  },
  {
    name: 'Chrono Galaxy',
    bgGradient: 'from-[#1e1b4b] via-[#002f3c] to-[#00171f]',
    horizonColor: '#38bdf8',
    targetRelics: 8,
    baseTime: 16,
    baseDistance: 160,
    itemSpeed: 58,
    runnerSpeed: 8.0,
    anomalyChance: 0.35,
    spawnDistanceInterval: 6.5,
  },
  {
    name: 'Atlantis Vortex',
    bgGradient: 'from-[#002633] via-[#004052] to-[#001a24]',
    horizonColor: '#4ade80',
    targetRelics: 10,
    baseTime: 15,
    baseDistance: 180,
    itemSpeed: 68,
    runnerSpeed: 8.8,
    anomalyChance: 0.42,
    spawnDistanceInterval: 6,
  },
];

export const TimeWarpGame = ({ onExit }: TimeWarpGameProps) => {
  // Game & Era progression
  const [eraIndex, setEraIndex] = useState(0);
  const currentEra = ERAS[eraIndex % ERAS.length];

  const [score, setScore] = useState(0);
  const [relicsCount, setRelicsCount] = useState(0);
  const [playerLane, setPlayerLane] = useState<number>(1); // 0 = Left, 1 = Center, 2 = Right
  const [distanceRemaining, setDistanceRemaining] = useState<number>(currentEra.baseDistance);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FloatingFeedback[]>([]);
  const [needMoreRelicsWarning, setNeedMoreRelicsWarning] = useState(false);

  // Mutable refs to prevent closure lag in 60fps RAF loop
  const playerLaneRef = useRef(playerLane);
  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);

  const relicsCountRef = useRef(relicsCount);
  useEffect(() => {
    relicsCountRef.current = relicsCount;
  }, [relicsCount]);

  // Floating text feedback trigger (+25 ⭐ or ⚡ GLITCH!)
  const triggerFeedback = useCallback((text: string, lane: number, type: 'collect' | 'glitch') => {
    const id = Date.now() + Math.random();
    setFeedbackList(prev => [...prev.slice(-4), { id, text, lane, type }]);
    setTimeout(() => {
      setFeedbackList(prev => prev.filter(f => f.id !== id));
    }, 900);
  }, []);

  // Clinical Skill 9 (Requesting More Time / Transition Tolerance)
  const [secondsRemaining, setSecondsRemaining] = useState(currentEra.baseTime);
  const [extensionsLeft, setExtensionsLeft] = useState(2);
  const [isTimeExtendedBanner, setIsTimeExtendedBanner] = useState(false);
  const [promptActive, setPromptActive] = useState(false);

  // End state screens
  const [isEraWon, setIsEraWon] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);

  // Track entities
  const [trackItems, setTrackItems] = useState<TrackItem[]>([]);
  const nextItemIdRef = useRef(1);
  const lastSpawnDistanceRef = useRef(currentEra.baseDistance);

  const isTimeCritical = secondsRemaining <= 7;
  const isPortalCharged = relicsCount >= currentEra.targetRelics;

  // Move player lane safely
  const moveLeft = useCallback(() => {
    soundEngine.playTap();
    setPlayerLane(prev => Math.max(0, prev - 1));
  }, []);

  const moveRight = useCallback(() => {
    soundEngine.playTap();
    setPlayerLane(prev => Math.min(2, prev + 1));
  }, []);

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEraWon || isTransitionComplete) return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, isEraWon, isTransitionComplete]);

  // Main Runner Animation Loop (60 FPS) with integrated continuous Collision Detection
  useEffect(() => {
    if (isEraWon || isTransitionComplete) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Speed in meters per second
      const speed = currentEra.runnerSpeed;
      
      setDistanceRemaining(prev => {
        const nextDist = Math.max(0, prev - speed * delta);
        if (nextDist <= 0) {
          // If child gathered enough relics, VICTORY!
          if (relicsCountRef.current >= currentEra.targetRelics && !isEraWon) {
            setIsEraWon(true);
            soundEngine.playSuccess();
            try {
              confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
            } catch { /* ignore */ }
            return 0;
          } else if (relicsCountRef.current < currentEra.targetRelics) {
            // Needs more relics to unlock portal! Extend distance loop so child keeps running
            setNeedMoreRelicsWarning(true);
            setTimeout(() => setNeedMoreRelicsWarning(false), 2200);
            return 35;
          }
        }
        return nextDist;
      });

      // Update track items downward movement at comfortable era speed & perform collision detection directly at 60 FPS
      setTrackItems(prevItems => {
        const itemSpeed = currentEra.itemSpeed;
        let scoreGain = 0;
        let relicsGained = 0;
        const currentLane = playerLaneRef.current;

        const updated = prevItems
          .map(item => {
            const nextY = item.y + itemSpeed * delta;

            // Player hitbox is around Y: 68% to 88%
            if (!item.collected && item.lane === currentLane && nextY >= 68 && nextY <= 88) {
              if (item.type === 'collectible') {
                scoreGain += 25;
                relicsGained += 1;
                soundEngine.playGemPop();
                triggerFeedback('+25 ⭐', currentLane, 'collect');
                return { ...item, y: nextY, collected: true };
              } else {
                soundEngine.playGlitch();
                triggerFeedback('⚡ GLITCH!', currentLane, 'glitch');
                return { ...item, y: nextY, collected: true };
              }
            }
            return {
              ...item,
              y: nextY,
            };
          })
          .filter(item => item.y < 110); // Remove past screen

        if (scoreGain > 0) {
          setScore(s => s + scoreGain);
          setRelicsCount(prev => {
            const nextRelics = Math.min(currentEra.targetRelics, prev + relicsGained);
            if (nextRelics >= currentEra.targetRelics && prev < currentEra.targetRelics) {
              soundEngine.playSuccess();
              try {
                confetti({ particleCount: 60, spread: 80, origin: { y: 0.4 } });
              } catch { /* ignore */ }
            }
            return nextRelics;
          });
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isEraWon, isTransitionComplete, speedBoost, triggerFeedback, currentEra]);

  // Item Spawning based on distance traveled (scaled by era)
  useEffect(() => {
    if (isEraWon || isTransitionComplete) return;

    if (lastSpawnDistanceRef.current - distanceRemaining > currentEra.spawnDistanceInterval) {
      lastSpawnDistanceRef.current = distanceRemaining;

      const randomLane = Math.floor(Math.random() * 3);
      const isAnomaly = Math.random() < currentEra.anomalyChance;

      const collectibleTypes: TimeItemType[] = ['hourglass', 'pocket-watch', 'gear', 'compass', 'chronosphere'];
      const chosenType = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];

      const newItem: TrackItem = {
        id: nextItemIdRef.current++,
        lane: randomLane,
        y: 5,
        type: isAnomaly ? 'anomaly' : 'collectible',
        itemType: isAnomaly ? undefined : chosenType,
        label: isAnomaly ? 'Time Glitch' : 'Temporal Artifact',
        collected: false,
      };

      setTrackItems(prev => [...prev, newItem]);
    }
  }, [distanceRemaining, isEraWon, isTransitionComplete, currentEra]);

  // Countdown Portal Timer (Skill 9 Establishing Operation)
  useEffect(() => {
    let interval: number | null = null;
    if (!isEraWon && !isTransitionComplete && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsTransitionComplete(true);
            soundEngine.playSuccess();
            return 0;
          }
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
  }, [isEraWon, isTransitionComplete, secondsRemaining, extensionsLeft, promptActive]);

  // THE KEY CLINICAL ACTION: Player asks for more time (+1 MORE MINUTE)
  const handleRequestMoreTime = () => {
    if (extensionsLeft <= 0) return;

    soundEngine.playTimeExtension();
    setSecondsRemaining(prev => prev + 15);
    setExtensionsLeft(prev => prev - 1);
    setPromptActive(false);
    setIsTimeExtendedBanner(true);
    setSpeedBoost(true);

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        colors: ['#fde047', '#38bdf8', '#00f2c9'],
        origin: { x: 0.25, y: 0.8 },
      });
    } catch { /* ignore */ }

    // Speed boost for 3.5 seconds
    setTimeout(() => {
      setSpeedBoost(false);
      setIsTimeExtendedBanner(false);
    }, 3500);
  };

  // Next Era progression
  const handleNextEra = () => {
    soundEngine.playTap();
    const nextEraIndex = (eraIndex + 1) % ERAS.length;
    const nextEra = ERAS[nextEraIndex];
    setEraIndex(nextEraIndex);
    setDistanceRemaining(nextEra.baseDistance);
    setSecondsRemaining(nextEra.baseTime);
    setExtensionsLeft(2);
    setRelicsCount(0);
    setIsEraWon(false);
    setIsTransitionComplete(false);
    setTrackItems([]);
    setPlayerLane(1);
    lastSpawnDistanceRef.current = nextEra.baseDistance;
  };

  // Retry same era after transition wrap-up
  const handleRetryEra = () => {
    soundEngine.playTap();
    setDistanceRemaining(currentEra.baseDistance);
    setSecondsRemaining(currentEra.baseTime);
    setExtensionsLeft(2);
    setRelicsCount(0);
    setIsTransitionComplete(false);
    setIsEraWon(false);
    setTrackItems([]);
    setPlayerLane(1);
    lastSpawnDistanceRef.current = currentEra.baseDistance;
  };

  const timePercentage = Math.max(0, Math.min(100, (secondsRemaining / currentEra.baseTime) * 100));
  const progressPercentage = Math.min(100, Math.round(((currentEra.baseDistance - distanceRemaining) / currentEra.baseDistance) * 100));

  return (
    <div className={`flex-1 flex flex-col h-full bg-gradient-to-b ${currentEra.bgGradient} overflow-hidden relative select-none`}>
      {/* Top HUD: Mission Controls & Countdown */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Exit & Era Badge */}
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

          <div className="flex items-center gap-1.5 bg-[#ffb703] text-slate-950 px-3 py-1 rounded-full font-black text-xs md:text-sm shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>{currentEra.name}</span>
          </div>

          {/* TARGET MISSION COUNTER */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            isPortalCharged 
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/30 animate-pulse'
              : 'bg-[#002833] border-amber-400/60 text-white shadow-sm'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isPortalCharged ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-xs font-black">
              Relics: <span className={isPortalCharged ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-bold'}>{relicsCount}/{currentEra.targetRelics}</span>
            </span>
          </div>

          {/* Distance Meter to Time Portal */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-xs font-black text-white">
              Gate: <span className="text-[#38bdf8] font-bold">{Math.round(distanceRemaining)}m</span>
            </span>
          </div>
        </div>

        {/* Center: WIDE PORTAL COUNTDOWN TIMER */}
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
          <div className="flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>

          {!isEraWon && !isTransitionComplete && (
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
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden md:inline">{promptActive ? 'Hint On' : 'Hint'}</span>
            </button>
          )}
        </div>
      </div>

      {/* RUNNER PLAY ARENA (3-Lane Time Vortex Highway) */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
        {/* Living Twinkling Stars Background */}
        <CosmicBackground />

        {/* Horizon glowing arch & Exit Portal */}
        <div className="absolute top-0 inset-x-0 h-28 flex items-center justify-center pointer-events-none z-10">
          <div 
            className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-dashed animate-spin flex items-center justify-center transition-all duration-700"
            style={{ 
              borderColor: currentEra.horizonColor,
              animationDuration: '24s',
              transform: `scale(${0.6 + (progressPercentage / 100) * 0.9})`,
              boxShadow: `0 0 50px ${currentEra.horizonColor}40`
            }}
          >
            <div className="w-16 h-16 rounded-full bg-cyan-400/20 blur-md"></div>
          </div>
        </div>

        {/* DYNAMIC STATUS / OBJECTIVE BANNER */}
        <div className="absolute top-2 inset-x-0 mx-auto max-w-sm md:max-w-md z-25 flex items-center justify-center pointer-events-none px-4">
          {needMoreRelicsWarning ? (
            <div className="bg-amber-500 text-slate-950 border-2 border-white rounded-full px-5 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-black animate-bounce">
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>PORTAL LOCKED: Collect {currentEra.targetRelics - relicsCount} more relics!</span>
            </div>
          ) : isPortalCharged ? (
            <div className="bg-gradient-to-r from-emerald-500 to-[#00f2c9] text-slate-950 border-2 border-white rounded-full px-5 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-black animate-pulse">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>PORTAL FULLY CHARGED! REACH THE GATE!</span>
            </div>
          ) : isTimeCritical && extensionsLeft > 0 ? (
            <div className="bg-rose-600 text-white border-2 border-yellow-300 rounded-full px-5 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-black animate-bounce">
              <Timer className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>⚠️ PORTAL CLOSING IN {secondsRemaining}s! TAP [+1 MORE MINUTE]!</span>
            </div>
          ) : (
            <div className="bg-[#002029]/95 border-2 border-[#00c9a7]/60 rounded-full px-4 py-1.5 backdrop-blur-md shadow-xl flex items-center gap-3 text-[11px] md:text-xs font-black text-white">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CATCH: {currentEra.targetRelics} Relics (+25 ⭐)</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="text-fuchsia-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>DODGE: Glitches</span>
              </span>
            </div>
          )}
        </div>

        {/* TIME CRITICAL PULSING GLOW OVERLAY */}
        {isTimeCritical && extensionsLeft > 0 && !isEraWon && !isTransitionComplete && (
          <div className="absolute inset-0 border-4 border-rose-500/70 pointer-events-none animate-pulse z-40 shadow-[inset_0_0_30px_rgba(244,63,94,0.4)]"></div>
        )}

        {/* 3-LANE PERSPECTIVE HIGHWAY */}
        <div className="relative flex-1 max-w-2xl mx-auto w-full flex perspective-1000">
          {/* Lane 0: LEFT */}
          <div 
            onClick={() => { soundEngine.playTap(); setPlayerLane(0); }}
            className={`flex-1 border-r-2 border-dashed border-[#00c9a7]/30 relative cursor-pointer transition-colors ${
              playerLane === 0 ? 'bg-cyan-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="absolute bottom-3 inset-x-0 text-center text-[10px] font-black uppercase text-[#84cece]/60 tracking-wider">
              LEFT LANE
            </div>
          </div>

          {/* Lane 1: CENTER */}
          <div 
            onClick={() => { soundEngine.playTap(); setPlayerLane(1); }}
            className={`flex-1 border-r-2 border-dashed border-[#00c9a7]/30 relative cursor-pointer transition-colors ${
              playerLane === 1 ? 'bg-cyan-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="absolute bottom-3 inset-x-0 text-center text-[10px] font-black uppercase text-[#84cece]/60 tracking-wider">
              CENTER LANE
            </div>
          </div>

          {/* Lane 2: RIGHT */}
          <div 
            onClick={() => { soundEngine.playTap(); setPlayerLane(2); }}
            className={`flex-1 relative cursor-pointer transition-colors ${
              playerLane === 2 ? 'bg-cyan-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="absolute bottom-3 inset-x-0 text-center text-[10px] font-black uppercase text-[#84cece]/60 tracking-wider">
              RIGHT LANE
            </div>
          </div>

          {/* SCROLLING ITEMS ON TRACK */}
          {trackItems.map(item => {
            if (item.collected) return null;

            // X Position percentage based on lane: Lane 0 = 16.6%, Lane 1 = 50%, Lane 2 = 83.3%
            const laneX = item.lane === 0 ? '16.6%' : item.lane === 1 ? '50%' : '83.3%';

            return (
              <div
                key={item.id}
                style={{
                  left: laneX,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-15 pointer-events-none transition-all duration-75 flex flex-col items-center"
              >
                {item.type === 'collectible' && item.itemType ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#00242e]/95 border-3 border-amber-400 p-1.5 shadow-xl shadow-amber-500/40 flex items-center justify-center animate-bounce">
                      <TimeItemIcon type={item.itemType} />
                    </div>
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md tracking-wider uppercase">
                      +25 ⭐
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-950/95 border-2 border-fuchsia-400 p-1.5 shadow-xl shadow-fuchsia-500/50 flex items-center justify-center animate-pulse">
                      <ShieldAlert className="w-8 h-8 text-fuchsia-300" />
                    </div>
                    <span className="bg-fuchsia-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md tracking-wider uppercase">
                      ⚡ GLITCH
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* FLOATING POPUP TEXT FEEDBACK (+25 ⭐ or ⚡ GLITCH!) */}
          {feedbackList.map(fb => {
            const laneX = fb.lane === 0 ? '16.6%' : fb.lane === 1 ? '50%' : '83.3%';
            return (
              <div
                key={fb.id}
                style={{
                  left: laneX,
                  bottom: '24%',
                  transform: 'translate(-50%, 0)',
                }}
                className={`absolute z-35 font-black text-xl md:text-2xl pointer-events-none animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ${
                  fb.type === 'collect' ? 'text-amber-300 scale-125' : 'text-fuchsia-400'
                }`}
              >
                {fb.text}
              </div>
            );
          })}

          {/* PLAYER SPRITE (THE TIME-TRAVELER EXPLORER) */}
          <div
            style={{
              left: playerLane === 0 ? '16.6%' : playerLane === 1 ? '50%' : '83.3%',
              bottom: '12%',
              transform: 'translate(-50%, 0)',
            }}
            className="absolute z-20 pointer-events-none transition-all duration-200 ease-out flex flex-col items-center"
          >
            {/* Speed Boost Trail */}
            {speedBoost && (
              <div className="absolute -bottom-6 w-16 h-10 bg-gradient-to-t from-transparent via-cyan-400/40 to-yellow-300/80 rounded-full blur-md animate-pulse"></div>
            )}

            {/* Explorer Vector Character */}
            <div className={`w-20 h-22 md:w-24 md:h-26 relative flex items-center justify-center ${speedBoost ? 'scale-110' : ''}`}>
              <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]" fill="none">
                {/* Wind Scarf Flutter */}
                <path d="M42,52 Q22,50 14,38 Q18,62 38,58" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <path d="M58,52 Q78,50 86,38 Q82,62 62,58" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />

                {/* Explorer Flight Jacket Body */}
                <path d="M36,54 L64,54 L68,84 L32,84 Z" fill="#854d0e" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
                <rect x="42" y="56" width="16" height="28" fill="#38bdf8" />
                <line x1="50" y1="56" x2="50" y2="84" stroke="#ffffff" strokeWidth="2" />

                {/* Animated Running Legs */}
                <rect x="34" y="84" width="10" height="18" rx="5" fill="#334155" stroke="#ffffff" strokeWidth="2" />
                <rect x="56" y="84" width="10" height="18" rx="5" fill="#334155" stroke="#ffffff" strokeWidth="2" />
                <ellipse cx="39" cy="102" rx="7" ry="4" fill="#f59e0b" />
                <ellipse cx="61" cy="102" rx="7" ry="4" fill="#f59e0b" />

                {/* Explorer Head */}
                <circle cx="50" cy="36" r="20" fill="#fed7aa" stroke="#ffffff" strokeWidth="3" />
                
                {/* Steampunk Aviator Goggles */}
                <rect x="30" y="28" width="40" height="12" rx="6" fill="#78350f" stroke="#ffffff" strokeWidth="2" />
                <circle cx="40" cy="34" r="7" fill="#38bdf8" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="60" cy="34" r="7" fill="#38bdf8" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="38" cy="32" r="2" fill="#ffffff" />
                <circle cx="58" cy="32" r="2" fill="#ffffff" />

                {/* Cheerful Smile */}
                <path d="M44,45 Q50,50 56,45" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="38" cy="42" r="2" fill="#f43f5e" opacity="0.6" />
                <circle cx="62" cy="42" r="2" fill="#f43f5e" opacity="0.6" />

                {/* Aviator Helmet Cap */}
                <path d="M30,32 C30,16 70,16 70,32 Z" fill="#b45309" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* TIME EXTENDED CONFIRMATION BANNER */}
        {isTimeExtendedBanner && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-[#00f2c9] to-teal-500 text-slate-950 font-black px-6 py-2 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce z-40">
            <PlusCircle className="w-5 h-5 fill-slate-950 text-white" />
            <span className="text-xs md:text-sm uppercase tracking-wider">
              SUCCESSFUL REQUEST! +15 SECONDS TO EXPLORE!
            </span>
          </div>
        )}

        {/* BOTTOM CONTROLS STRIP (AAC BUTTON + TOUCH ARROWS) */}
        <div className="bg-[#002833]/90 border-t-2 border-[#00576b] px-4 py-3 flex items-center justify-between z-30 shadow-2xl gap-3">
          {/* THE CLINICAL AAC BUTTON: +1 MORE MINUTE */}
          {!isEraWon && !isTransitionComplete && (
            <button
              onClick={handleRequestMoreTime}
              disabled={extensionsLeft <= 0}
              className={`min-w-[240px] md:min-w-[310px] h-18 md:h-20 px-5 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 shadow-xl active:scale-95 ${
                extensionsLeft <= 0
                  ? 'bg-slate-800 text-slate-500 border-2 border-slate-700 cursor-not-allowed opacity-60'
                  : promptActive || isTimeCritical
                  ? 'bg-gradient-to-r from-[#ffc300] via-[#ffaa00] to-[#ffb703] text-slate-950 ring-4 ring-yellow-300 ring-offset-4 ring-offset-[#002f3c] scale-105 animate-pulse-subtle shadow-amber-500/60 cursor-pointer'
                  : 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#00c4ea] hover:to-[#0088cc] text-white border-3 border-white/80 shadow-cyan-950/60 cursor-pointer'
              }`}
            >
              <div className={`w-11 h-11 md:w-13 md:h-13 rounded-xl flex items-center justify-center shrink-0 ${
                extensionsLeft <= 0
                  ? 'bg-slate-700 text-slate-500'
                  : promptActive || isTimeCritical 
                  ? 'bg-slate-950 text-yellow-400' 
                  : 'bg-white/25 text-white'
              }`}>
                <Clock className="w-6 h-6 md:w-7 md:h-7" />
              </div>

              <div className="text-left flex-1 min-w-0">
                <div className={`text-sm md:text-base font-black tracking-tight truncate ${
                  extensionsLeft <= 0
                    ? 'text-slate-400'
                    : promptActive || isTimeCritical 
                    ? 'text-slate-950' 
                    : 'text-white'
                }`}>
                  +1 MORE MINUTE
                </div>
                <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider truncate ${
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
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 font-black text-xs">
                  +{extensionsLeft}
                </div>
              )}
            </button>
          )}

          {/* TACTILE ON-SCREEN LANE SWITCH BUTTONS (LEFT / RIGHT) */}
          <div className="flex items-center gap-3">
            <button
              onClick={moveLeft}
              disabled={playerLane === 0}
              className={`w-16 h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center font-black transition-all active:scale-90 border-2 ${
                playerLane === 0 
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-40' 
                  : 'bg-[#004e63] hover:bg-[#00607a] text-[#00f2c9] border-[#00c9a7]/60 shadow-lg cursor-pointer'
              }`}
              title="Steer Left"
            >
              <ChevronLeft className="w-9 h-9 stroke-[3]" />
            </button>

            <button
              onClick={moveRight}
              disabled={playerLane === 2}
              className={`w-16 h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center font-black transition-all active:scale-90 border-2 ${
                playerLane === 2 
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-40' 
                  : 'bg-[#004e63] hover:bg-[#00607a] text-[#00f2c9] border-[#00c9a7]/60 shadow-lg cursor-pointer'
              }`}
              title="Steer Right"
            >
              <ChevronRight className="w-9 h-9 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* ERA WON / PORTAL REACHED VICTORY MODAL */}
      {isEraWon && (
        <div className="absolute inset-0 bg-[#001f28]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-[#00f2c9] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-[#00576b] border-2 border-[#00f2c9] flex items-center justify-center text-yellow-300 mb-4 shadow-lg animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>PORTAL CROSSED!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Welcome to the Next Era!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-4">
              You navigated the time vortex and arrived at the portal gate! Ready to warp forward?
            </p>

            <div className="flex items-center gap-6 bg-[#002732] px-6 py-3 rounded-2xl border border-white/10 mb-6 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Relics Found</span>
                <span className="text-xl font-black text-amber-300">{relicsCount} / {currentEra.targetRelics}</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Score</span>
                <span className="text-xl font-black text-yellow-300">{score} pts</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleNextEra}
                className="w-full py-4 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all border-2 border-white/70"
              >
                <Compass className="w-5 h-5" />
                <span>Next Era ({ERAS[(eraIndex + 1) % ERAS.length].name})</span>
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

      {/* PEACEFUL TRANSITION SUCCESS OVERLAY (Transition Tolerance) */}
      {isTransitionComplete && !isEraWon && (
        <div className="absolute inset-0 bg-[#001f28]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-amber-400 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 shadow-lg">
              <Award className="w-10 h-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>TRANSITION CHAMPION!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Time Ran Out — Great Transition!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-4">
              You negotiated your time extensions and accepted the portal wrap-up calmly!
            </p>

            <div className="flex items-center gap-6 bg-[#002732] px-6 py-3 rounded-2xl border border-white/10 mb-6 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Relics Saved</span>
                <span className="text-xl font-black text-amber-300">{relicsCount} / {currentEra.targetRelics}</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Score</span>
                <span className="text-xl font-black text-yellow-300">{score} pts</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleRetryEra}
                className="w-full py-4 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all border-2 border-white/70"
              >
                <Compass className="w-5 h-5" />
                <span>Retry Era ({currentEra.name})</span>
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
