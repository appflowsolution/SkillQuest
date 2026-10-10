import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { TowerBlockIcon, TowerBlockType } from './TowerBlockIcon';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Bot, 
  Users, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  Layers,
  Gauge
} from 'lucide-react';

interface StarTowerGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

interface StackedBlock {
  id: number;
  type: TowerBlockType;
  widthClass: string;
  x: number; // percentage (0 - 100) inside playfield column
  placedBy: 'player' | 'partner';
  offsetFromCenter: number;
}

export interface FloorSpec {
  floorNumber: number;
  type: TowerBlockType;
  name: string;
  widthClass: string;   // Tapering width: w-44 -> w-40 -> w-36 -> w-32 -> w-28 -> w-24
  speed: number;        // Crane oscillation speed in rad/s (1.35x -> 4.2x)
  tolerance: number;    // Landing tolerance threshold in % (14% -> 7%)
  environment: string;  // Altitude & atmospheric name
  windIntensity: 'none' | 'light' | 'moderate' | 'strong' | 'vortex';
  perfectBonus: number; // Scaled points for perfect drops
  fitBonus: number;     // Scaled points for standard fits
}

export const FLOOR_SPECS: FloorSpec[] = [
  {
    floorNumber: 1,
    type: 'habitat',
    name: 'Crystal Habitat',
    widthClass: 'w-44', // 176px - Wide base for mastering initial timing
    speed: 1.35,        // Smooth period of 4.6s
    tolerance: 14.0,    // High success margin
    environment: 'Cosmic Surface · Calm Winds (1.3x)',
    windIntensity: 'none',
    perfectBonus: 50,
    fitBonus: 25,
  },
  {
    floorNumber: 2,
    type: 'reactor',
    name: 'Starlight Reactor',
    widthClass: 'w-40', // 160px
    speed: 1.85,        // +37% faster (period 3.4s)
    tolerance: 12.0,
    environment: 'Troposphere · Light Breeze (1.8x)',
    windIntensity: 'light',
    perfectBonus: 60,
    fitBonus: 30,
  },
  {
    floorNumber: 3,
    type: 'greenhouse',
    name: 'Cosmic Bio-Dome',
    widthClass: 'w-36', // 144px
    speed: 2.4,         // Medium accelerated pace (period 2.6s)
    tolerance: 10.5,
    environment: 'Stratosphere · Ionic Currents (2.4x)',
    windIntensity: 'moderate',
    perfectBonus: 75,
    fitBonus: 35,
  },
  {
    floorNumber: 4,
    type: 'observatory',
    name: 'Sky Observatory',
    widthClass: 'w-32', // 128px
    speed: 2.95,        // Coordination challenge (period 2.1s)
    tolerance: 9.0,
    environment: 'Thermosphere · Solar Gusts (3.0x)',
    windIntensity: 'moderate',
    perfectBonus: 90,
    fitBonus: 45,
  },
  {
    floorNumber: 5,
    type: 'solarsails',
    name: 'Plasma Solar Wings',
    widthClass: 'w-28', // 112px
    speed: 3.55,        // Fast and demanding (period 1.8s)
    tolerance: 8.0,
    environment: 'Exosphere · Plasma Vortex (3.6x)',
    windIntensity: 'strong',
    perfectBonus: 110,
    fitBonus: 55,
  },
  {
    floorNumber: 6,
    type: 'spire',
    name: 'Starlight Spire Crown',
    widthClass: 'w-24', // 96px - Apex crown crowning the tower
    speed: 4.2,         // Fast and thrilling climax (period 1.5s)
    tolerance: 7.0,     // Maximum precision required
    environment: 'Starlight Crown · Maximum Vortex (4.2x)',
    windIntensity: 'vortex',
    perfectBonus: 150,
    fitBonus: 75,
  },
];

export const StarTowerGame = ({ onExit }: StarTowerGameProps) => {
  // Game mode: 'bot' (AstroBot co-op) or 'pass-and-play' (2 human players sharing iPad)
  const [partnerMode, setPartnerMode] = useState<'bot' | 'pass-and-play'>('bot');
  
  // Turn Taking State: 'player' (Learner) or 'partner' (AstroBot / Peer)
  const [currentTurn, setCurrentTurn] = useState<'player' | 'partner'>('player');
  const [turnBannerText, setTurnBannerText] = useState<string>('YOUR TURN: Drop Floor 1');
  const [showTurnTransition, setShowTurnTransition] = useState(false);

  // Tower Progression (0 to 6 stacked on top of foundation base)
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [stackedBlocks, setStackedBlocks] = useState<StackedBlock[]>([
    {
      id: 0,
      type: 'foundation',
      widthClass: 'w-48',
      x: 50,
      placedBy: 'player',
      offsetFromCenter: 0,
    }
  ]);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  // Crane & Physics State
  const [craneX, setCraneX] = useState(50); // % inside playfield column (24% to 76%)
  const [isDropping, setIsDropping] = useState(false);
  const [droppedBlockY, setDroppedBlockY] = useState(16); // % from top
  const [droppedBlockX, setDroppedBlockX] = useState(50);
  const [isMissed, setIsMissed] = useState(false);
  const [missRotation, setMissRotation] = useState(0);
  const [isWobbling, setIsWobbling] = useState(false);

  // Feedback banner popup
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

  // AstroBot Co-Op Timing & State
  const [botPhase, setBotPhase] = useState<'idle' | 'waiting' | 'aiming' | 'dropping'>('idle');
  const [botCountdown, setBotCountdown] = useState(2);

  // Stats for Turn Taking Clinical Verification
  const [playerTurnsTaken, setPlayerTurnsTaken] = useState(0);
  const [partnerTurnsTaken, setPartnerTurnsTaken] = useState(0);

  // Mutable animation refs (immune to stale closures and 60 FPS re-render cycles)
  const craneXRef = useRef(50);
  const isDroppingRef = useRef(false);
  const currentTurnRef = useRef<'player' | 'partner'>('player');
  const currentFloorIndexRef = useRef(0);
  const stackedBlocksRef = useRef<StackedBlock[]>(stackedBlocks);
  const botReadyToDropRef = useRef(false);

  useEffect(() => {
    isDroppingRef.current = isDropping;
  }, [isDropping]);

  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);

  useEffect(() => {
    currentFloorIndexRef.current = currentFloorIndex;
  }, [currentFloorIndex]);

  useEffect(() => {
    stackedBlocksRef.current = stackedBlocks;
  }, [stackedBlocks]);

  // Current floor spec according to progression index (0 to 5)
  const activeFloorSpec = FLOOR_SPECS[Math.min(currentFloorIndex, FLOOR_SPECS.length - 1)];

  // 1. Crane Oscillation Loop with Progressive Dynamic Speeds
  useEffect(() => {
    if (isVictory) return;

    let startTime = performance.now();
    let animationFrameId: number;

    const loop = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;
      
      if (!isDroppingRef.current) {
        const spec = FLOOR_SPECS[Math.min(currentFloorIndexRef.current, FLOOR_SPECS.length - 1)];
        const speed = spec ? spec.speed : 1.35;

        // Smooth sine wave between 24% and 76% (amplitude: 26%, center: 50%)
        const newX = 50 + Math.sin(elapsed * speed) * 26;
        craneXRef.current = newX;
        setCraneX(newX);

        // Check if AstroBot is ready to trigger its drop near target
        if (botReadyToDropRef.current && currentTurnRef.current === 'partner') {
          const lastBlock = stackedBlocksRef.current[stackedBlocksRef.current.length - 1];
          const targetX = lastBlock ? lastBlock.x : 50;
          const snapRange = Math.max(4.0, (spec ? spec.tolerance : 10) * 0.45);
          if (Math.abs(newX - targetX) <= snapRange) {
            botReadyToDropRef.current = false;
            setBotPhase('dropping');
            handleDropBlock();
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVictory]);

  // 2. Trigger Action to Drop Block (Works for both Human and AstroBot)
  const handleDropBlock = useCallback((forcedX?: number) => {
    if (isDroppingRef.current || isVictory) return;

    const dropX = forcedX !== undefined ? forcedX : craneXRef.current;
    soundEngine.playBlockDrop();

    isDroppingRef.current = true;
    setIsDropping(true);
    setIsMissed(false);
    setDroppedBlockX(dropX);
    setDroppedBlockY(16);

    const spec = FLOOR_SPECS[Math.min(currentFloorIndexRef.current, FLOOR_SPECS.length - 1)];
    const lastBlock = stackedBlocksRef.current[stackedBlocksRef.current.length - 1];
    const targetX = lastBlock ? lastBlock.x : 50;
    const offset = dropX - targetX;
    const absOffset = Math.abs(offset);

    // Stacking tolerance threshold derived directly from floor difficulty spec
    const tolerance = spec ? spec.tolerance : 12.0;
    const isHit = absOffset <= tolerance;
    const targetLandingY = 64 - currentFloorIndexRef.current * 7.5;

    let currentY = 16;
    const dropTimer = window.setInterval(() => {
      currentY += 7.5;
      setDroppedBlockY(currentY);

      if (isHit && currentY >= targetLandingY) {
        // === SUCCESSFUL STACK ===
        window.clearInterval(dropTimer);

        // Sweet spot: inner 35% of the tolerance counts as perfect
        const isPerfect = absOffset <= (tolerance * 0.35);
        soundEngine.playBlockLand(1 + currentFloorIndexRef.current * 0.12);

        if (isPerfect) {
          const points = spec ? spec.perfectBonus : 50;
          setScore(s => s + points);
          setFeedbackMessage({ text: `PERFECT STACK! ⭐ +${points}`, type: 'perfect' });
          try {
            confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
          } catch { /* ignore */ }
        } else {
          const points = spec ? spec.fitBonus : 25;
          setScore(s => s + points);
          setFeedbackMessage({ text: `GREAT FIT! 👍 +${points}`, type: 'good' });
          setIsWobbling(true);
          setTimeout(() => setIsWobbling(false), 700);
        }

        const finalX = isPerfect ? targetX : dropX;
        const newBlock: StackedBlock = {
          id: Date.now(),
          type: spec.type,
          widthClass: spec.widthClass,
          x: finalX,
          placedBy: currentTurnRef.current,
          offsetFromCenter: finalX - 50,
        };

        const updatedBlocks = [...stackedBlocksRef.current, newBlock];
        stackedBlocksRef.current = updatedBlocks;
        setStackedBlocks(updatedBlocks);

        if (currentTurnRef.current === 'player') {
          setPlayerTurnsTaken(p => p + 1);
        } else {
          setPartnerTurnsTaken(p => p + 1);
        }

        const nextFloor = currentFloorIndexRef.current + 1;
        currentFloorIndexRef.current = nextFloor;
        setCurrentFloorIndex(nextFloor);

        if (nextFloor >= 6) {
          setIsVictory(true);
          soundEngine.playSuccess();
          try {
            confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
          } catch { /* ignore */ }
        } else {
          // Switch Turn with next floor number prompt
          const nextTurn = currentTurnRef.current === 'player' ? 'partner' : 'player';
          currentTurnRef.current = nextTurn;
          setCurrentTurn(nextTurn);
          soundEngine.playTurnChime(nextTurn === 'player');
          setShowTurnTransition(true);
          setTurnBannerText(
            nextTurn === 'player'
              ? `YOUR TURN: Drop Floor ${nextFloor + 1}`
              : partnerMode === 'bot'
              ? "ASTROBOT'S TURN 🤖"
              : "PARTNER'S TURN 👥"
          );
          setTimeout(() => setShowTurnTransition(false), 2000);
        }

        isDroppingRef.current = false;
        setIsDropping(false);
        setTimeout(() => setFeedbackMessage(null), 1500);

      } else if (!isHit && currentY >= targetLandingY) {
        // === MISSED DROP: TUMBLE & FALL OFF SCREEN ===
        if (!isMissed) {
          setIsMissed(true);
          setMissRotation(offset > 0 ? 28 : -28);
          soundEngine.playBlockMiss();
          setFeedbackMessage({ text: 'OFF TARGET! ❌ Aim for the center', type: 'miss' });
          setIsWobbling(true);
          setTimeout(() => setIsWobbling(false), 600);
        }

        // Keep falling past bottom of screen
        if (currentY >= 105) {
          window.clearInterval(dropTimer);
          isDroppingRef.current = false;
          setIsDropping(false);
          setIsMissed(false);
          setTimeout(() => setFeedbackMessage(null), 1600);
        }
      }
    }, 28);
  }, [isVictory, partnerMode]);

  // 3. Bulletproof AstroBot Turn Lifecycle (Immune to 60 FPS cancellations)
  useEffect(() => {
    if (isVictory || partnerMode !== 'bot' || currentTurn !== 'partner') {
      setBotPhase('idle');
      botReadyToDropRef.current = false;
      return;
    }

    setBotPhase('waiting');
    setBotCountdown(2);

    // Active Waiting Delay Tolerance Practice (Count down 2s -> 1s -> Aim/Drop)
    const timer1 = window.setTimeout(() => {
      setBotCountdown(1);
    }, 1000);

    const timer2 = window.setTimeout(() => {
      setBotCountdown(0);
      setBotPhase('aiming');
      botReadyToDropRef.current = true;
    }, 2000);

    // Safety Fallback: Force drop if crane didn't cross window within 3.6s
    const fallbackTimer = window.setTimeout(() => {
      if (currentTurnRef.current === 'partner' && !isDroppingRef.current && botReadyToDropRef.current) {
        botReadyToDropRef.current = false;
        setBotPhase('dropping');
        const lastBlock = stackedBlocksRef.current[stackedBlocksRef.current.length - 1];
        const targetX = lastBlock ? lastBlock.x : 50;
        handleDropBlock(targetX + (Math.random() * 3 - 1.5));
      }
    }, 3600);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(fallbackTimer);
      botReadyToDropRef.current = false;
    };
  }, [currentTurn, partnerMode, isVictory, handleDropBlock]);

  // Restart Tower
  const handleRestart = () => {
    soundEngine.playTap();
    currentFloorIndexRef.current = 0;
    setCurrentFloorIndex(0);
    currentTurnRef.current = 'player';
    setCurrentTurn('player');
    setIsVictory(false);
    isDroppingRef.current = false;
    setIsDropping(false);
    setIsMissed(false);
    setScore(0);
    setPlayerTurnsTaken(0);
    setPartnerTurnsTaken(0);
    setBotPhase('idle');
    const initialBlocks: StackedBlock[] = [
      {
        id: 0,
        type: 'foundation',
        widthClass: 'w-48',
        x: 50,
        placedBy: 'player',
        offsetFromCenter: 0,
      }
    ];
    stackedBlocksRef.current = initialBlocks;
    setStackedBlocks(initialBlocks);
    setTurnBannerText('YOUR TURN: Drop Floor 1');
  };

  const isPlayerTurn = currentTurn === 'player';
  const towerHeightCount = stackedBlocks.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#002833] via-[#003d4c] to-[#001f28] overflow-hidden relative select-none">
      {/* Dynamic ABCya-style Stardust Background */}
      <CosmicBackground />

      {/* TOP HUD: Missions, Floors, Dynamic Altitude, Mode & Score */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Exit & Tower Meter */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </button>

          {/* Tower Floor Meter */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/15">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-xs font-black text-white">
              Floors: <strong className="text-yellow-300 font-extrabold">{towerHeightCount} / 7</strong>
            </span>
          </div>

          {/* Environmental Velocity Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#00242e] px-2.5 py-1 rounded-full border border-cyan-400/20 text-[11px] font-bold text-cyan-200">
            <Gauge className="w-3 h-3 text-[#00f2c9]" />
            <span>Speed: <strong className="text-yellow-300">{activeFloorSpec.speed.toFixed(1)}x</strong></span>
          </div>
        </div>

        {/* Center: ACTIVE TURN BANNER (ABA SKILLS 7 & 8) */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 transition-all shadow-lg ${
            isPlayerTurn
              ? 'bg-emerald-950/90 border-[#00f2c9] text-[#00f2c9] ring-2 ring-[#00f2c9]/40 animate-pulse'
              : 'bg-amber-950/90 border-[#ffb703] text-yellow-300 ring-2 ring-[#ffb703]/40'
          }`}>
            {isPlayerTurn ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f2c9] animate-ping"></div>
                <span className="text-xs md:text-sm font-black tracking-wide uppercase">
                  YOUR TURN
                </span>
              </>
            ) : (
              <>
                {partnerMode === 'bot' ? (
                  <Bot className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <Users className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-xs md:text-sm font-black tracking-wide uppercase">
                  {partnerMode === 'bot' ? "ASTROBOT'S TURN" : "PARTNER'S TURN"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Partner Mode Selector & Score */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-[#00242e] rounded-full p-0.5 border border-white/10">
            <button
              onClick={() => {
                soundEngine.playTap();
                setPartnerMode('bot');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                partnerMode === 'bot' 
                  ? 'bg-cyan-500 text-slate-950 shadow' 
                  : 'text-[#84cece] hover:text-white'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>AstroBot</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTap();
                setPartnerMode('pass-and-play');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                partnerMode === 'pass-and-play' 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-[#84cece] hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>2 Players</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONSTRUCTION ARENA - Unified Coordinate Column */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
        {/* Playfield Column (Constrained width for identical physics, crane swing and tower base) */}
        <div className="w-full max-w-lg mx-auto relative flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Target Hint & Dynamic Environmental Conditions */}
          <div className="absolute top-2 inset-x-0 mx-auto max-w-md z-15 flex items-center justify-center pointer-events-none px-4">
            <div className="bg-[#002029]/90 border border-[#00c9a7]/40 rounded-full px-4 py-1 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-black text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="text-[#00f2c9]">Floor {currentFloorIndex + 1}/7:</span>
              <span className="text-yellow-200 truncate">{activeFloorSpec.environment}</span>
            </div>
          </div>

          {/* Cosmic Wind Streamers for Upper Atmospheric Floors */}
          {activeFloorSpec.windIntensity !== 'none' && (
            <div className="absolute inset-x-0 top-14 h-40 pointer-events-none z-5 overflow-hidden opacity-60">
              <div 
                className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent rounded-full absolute top-6 animate-pulse" 
                style={{ animationDuration: '1.2s', left: '10%' }}
              ></div>
              <div 
                className="w-56 h-0.5 bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent rounded-full absolute top-16 animate-pulse" 
                style={{ animationDuration: '0.9s', left: '35%' }}
              ></div>
              <div 
                className="w-44 h-0.5 bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent rounded-full absolute top-26 animate-pulse" 
                style={{ animationDuration: '1.4s', left: '20%' }}
              ></div>
            </div>
          )}

          {/* DYNAMIC FEEDBACK BANNER (+50 / +25 / MISSED) */}
          {feedbackMessage && (
            <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-40 font-black px-5 py-2 rounded-full shadow-2xl animate-bounce text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 border-2 ${
              feedbackMessage.type === 'perfect'
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300'
                : feedbackMessage.type === 'good'
                ? 'bg-amber-950/95 border-amber-400 text-yellow-300'
                : 'bg-rose-950/95 border-rose-500 text-rose-300'
            }`}>
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* TURN TRANSITION CELEBRATION BANNER */}
          {showTurnTransition && (
            <div className={`absolute top-22 left-1/2 -translate-x-1/2 z-40 px-5 py-2 rounded-2xl shadow-2xl border-2 font-black text-xs md:text-sm uppercase tracking-wider animate-fadeIn flex items-center gap-2 ${
              isPlayerTurn
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-amber-600 text-white border-amber-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{turnBannerText}</span>
            </div>
          )}

          {/* OSCILLATING COSMIC CRANE (Hanging Mechanism with Variable Floor Width) */}
          {!isVictory && (
            <div 
              className="absolute top-0 w-44 h-28 pointer-events-none z-20 flex flex-col items-center"
              style={{ 
                left: `${craneX}%`, 
                transform: 'translateX(-50%)' 
              }}
            >
              {/* Crane cable line */}
              <div className="w-1 h-9 bg-gradient-to-b from-white to-[#00f2c9] shadow-sm"></div>

              {/* Magnetic Clamp Head */}
              <div className="w-14 h-4 bg-slate-800 rounded-full border-2 border-[#00f2c9] flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
              </div>

              {/* Currently held block with tapering width */}
              {!isDropping && (
                <div className={`${activeFloorSpec.widthClass} h-16 mt-0.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-pulse-subtle`}>
                  <TowerBlockIcon 
                    type={activeFloorSpec.type} 
                    placedBy={currentTurn} 
                  />
                </div>
              )}
            </div>
          )}

          {/* FALLING BLOCK (In Motion with Floor-Specific Width & Miss Rotation) */}
          {isDropping && (
            <div 
              className={`absolute ${activeFloorSpec.widthClass} h-16 pointer-events-none z-25 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)] transition-transform duration-150`}
              style={{ 
                left: `${droppedBlockX}%`, 
                top: `${droppedBlockY}%`,
                transform: isMissed ? `translateX(-50%) rotate(${missRotation}deg)` : 'translateX(-50%)' 
              }}
            >
              <TowerBlockIcon 
                type={activeFloorSpec.type} 
                placedBy={currentTurn} 
              />
            </div>
          )}

          {/* THE BUILT STAR TOWER (Tapering Architectural Space Needle) */}
          <div className={`relative flex-1 flex flex-col justify-end items-center pb-8 z-10 transition-transform duration-500 w-full ${
            isWobbling ? 'animate-wiggle' : ''
          }`}>
            <div className="w-full h-full relative flex flex-col justify-end items-center">
              {/* Ground Launchpad Base Platform */}
              <div className="w-56 h-7 bg-gradient-to-r from-[#00171f] via-[#003442] to-[#00171f] rounded-t-2xl border-t-2 border-[#00c9a7]/60 shadow-2xl flex items-center justify-center z-10">
                <div className="w-24 h-1.5 bg-cyan-400/50 rounded-full animate-pulse"></div>
              </div>

              {/* Stacked Floors with Tapering Widths */}
              {stackedBlocks.map((block, index) => {
                const bottomPercent = index * 7.5;
                return (
                  <div 
                    key={block.id}
                    className={`${block.widthClass} h-16 absolute flex items-center justify-center transition-all duration-300`}
                    style={{
                      bottom: `calc(1.75rem + ${bottomPercent}%)`,
                      left: `${block.x}%`,
                      transform: 'translateX(-50%)',
                      zIndex: 10 + index,
                    }}
                  >
                    <TowerBlockIcon 
                      type={block.type} 
                      placedBy={block.placedBy} 
                    />

                    {/* Floor number indicator */}
                    <div className={`absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shadow border ${
                      block.placedBy === 'player'
                        ? 'bg-[#00f2c9] text-slate-950 border-white'
                        : 'bg-[#ffb703] text-slate-950 border-white'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (TOUCH DROP BUTTON / ACTIVE WAITING UI) */}
        <div className="bg-[#002833]/95 border-t-2 border-[#00576b] px-4 py-3 flex items-center justify-between z-30 shadow-2xl gap-3">
          {/* Turn taking instructions prompt */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase text-[#84cece] tracking-wider">
              {isPlayerTurn ? 'Action Required' : 'Cooperative Waiting'}
            </span>
            <span className="text-xs font-black text-white">
              {isPlayerTurn 
                ? `Drop Floor ${currentFloorIndex + 1} when centered!` 
                : partnerMode === 'bot' 
                ? 'Watch AstroBot place the next floor...' 
                : `Hand iPad to partner for Floor ${currentFloorIndex + 1}`}
            </span>
          </div>

          {/* THE GIANT TACTILE ACTION BUTTON */}
          <div className="flex-1 max-w-md mx-auto">
            {isPlayerTurn ? (
              <button
                onClick={() => handleDropBlock()}
                disabled={isDropping}
                className="w-full h-16 md:h-18 bg-gradient-to-r from-[#00f2c9] to-[#00b4d8] hover:from-[#38ef7d] hover:to-[#11998e] active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/30 border-3 border-white flex items-center justify-center gap-3 text-base md:text-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-[#00f2c9] flex items-center justify-center shadow text-xl">
                  ⬇️
                </div>
                <span>DROP FLOOR {currentFloorIndex + 1}</span>
              </button>
            ) : partnerMode === 'pass-and-play' ? (
              <button
                onClick={() => handleDropBlock()}
                disabled={isDropping}
                className="w-full h-16 md:h-18 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 border-3 border-white flex items-center justify-center gap-3 text-base md:text-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center shadow text-xl">
                  👥
                </div>
                <span>PARTNER: DROP FLOOR {currentFloorIndex + 1}</span>
              </button>
            ) : (
              /* ACTIVE WAITING STATE FOR ASTROBOT (CLINICAL SKILL 7 & 8) */
              <div className="w-full h-16 md:h-18 bg-[#001f28] rounded-2xl border-2 border-dashed border-amber-400/60 flex items-center justify-between px-5 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                    <Bot className={`w-6 h-6 text-yellow-400 ${botPhase === 'aiming' ? 'animate-pulse' : 'animate-bounce'}`} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs md:text-sm font-black text-amber-300">
                      {botPhase === 'aiming' 
                        ? '🎯 AstroBot dropping block!' 
                        : `🤖 AstroBot aiming... (${botCountdown}s)`}
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">
                      Waiting calmly for partner (Active Waiting Practice)
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-amber-400/40 flex items-center justify-center bg-slate-950 font-black text-xs text-yellow-300 shadow">
                  {botPhase === 'aiming' ? '🚀' : `${botCountdown}s`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VICTORY MODAL: TEAMWORK CHAMPIONS */}
      {isVictory && (
        <div className="absolute inset-0 bg-[#00171f]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-[#00f2c9] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            {/* Glowing Golden Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-[#00576b] border-2 border-[#00f2c9] flex items-center justify-center text-yellow-300 mb-4 shadow-lg animate-bounce">
              <Award className="w-12 h-12 text-yellow-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>TEAMWORK VICTORY!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Star Tower Completed!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              You worked as a team, mastered cosmic currents, and raised all 7 floors to the stars!
            </p>

            {/* Cooperative Turn-Taking Stats */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#002833] border border-cyan-400/30 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Your Turns</span>
                <span className="text-xl font-black text-[#00f2c9]">{playerTurnsTaken} Floors</span>
              </div>
              <div className="bg-[#002833] border border-amber-400/30 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Partner Turns</span>
                <span className="text-xl font-black text-yellow-300">{partnerTurnsTaken} Floors</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className="w-full py-4 bg-gradient-to-r from-[#00f2c9] to-[#00b4d8] hover:from-[#38ef7d] hover:to-[#11998e] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all border-2 border-white cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Build Another Tower</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="w-full py-3.5 bg-[#002732] hover:bg-[#001f28] active:scale-98 text-[#00f2c9] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border border-[#00c9a7]/40 cursor-pointer"
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
