import { useState, useId } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Crosshair, 
  Zap, 
  Trophy, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

interface MeteorArrayGameProps {
  onExit: () => void;
  rbtMode?: boolean;
}

interface LevelConfig {
  id: number;
  outpost: string;
  targetCount: number;
  description: string;
  gridHint: string;
}

const LEVELS: LevelConfig[] = [
  { id: 1, outpost: 'Lunar Outpost Alpha', targetCount: 6, description: 'Calibrate a 6-meteor grid beam', gridHint: '2 rows × 3 cols' },
  { id: 2, outpost: 'Orbital Beacon Delta', targetCount: 8, description: 'Intercept 8 incoming space meteors', gridHint: '2 rows × 4 cols' },
  { id: 3, outpost: 'Phobos Array Station', targetCount: 9, description: 'Target 9 crystal asteroids', gridHint: '3 rows × 3 cols' },
  { id: 4, outpost: 'Asteroid Belt V', targetCount: 12, description: 'Vaporize 12-asteroid swarm cluster', gridHint: '3×4 or 2×6' },
  { id: 5, outpost: 'Jupiter Jovian Gate', targetCount: 16, description: 'Lock matrix beam on 16 meteors', gridHint: '4×4 or 2×8' },
  { id: 6, outpost: 'Europa Deep Ridge', targetCount: 20, description: 'Contain 20 ion debris chunks', gridHint: '4×5 or 2×10' },
  { id: 7, outpost: 'Saturn Rings Forge', targetCount: 24, description: 'Disintegrate 24 ring fragments', gridHint: '3×8 or 4×6' },
  { id: 8, outpost: 'Uranus Ion Storm', targetCount: 30, description: 'Sweep through 30 atmospheric meteors', gridHint: '5×6 or 3×10' },
  { id: 9, outpost: 'Neptune Tritan Core', targetCount: 36, description: 'Calibrate dense 36-unit matrix grid', gridHint: '6×6 or 4×9' },
  { id: 10, outpost: 'Kuiper Hyper-Matrix', targetCount: 48, description: 'Ultimate challenge: 48 deep-space asteroids', gridHint: '6×8 or 8×6' },
];

export const MeteorArrayGame = ({ onExit }: MeteorArrayGameProps) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState(2);
  const [selectedCols, setSelectedCols] = useState(3);
  const [isFiring, setIsFiring] = useState(false);
  const [isShattering, setIsShattering] = useState(false);
  const [isVaporized, setIsVaporized] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);

  const filterId = useId();

  const currentLevel = LEVELS[levelIndex];
  const target = currentLevel.targetCount;
  const currentArea = selectedRows * selectedCols;
  const isCorrect = currentArea === target;

  const handleAdjustRows = (delta: number) => {
    soundEngine.playTap();
    const next = Math.max(1, Math.min(10, selectedRows + delta));
    setSelectedRows(next);
    soundEngine.playGridStep(next * selectedCols);
    setFeedback(null);
  };

  const handleAdjustCols = (delta: number) => {
    soundEngine.playTap();
    const next = Math.max(1, Math.min(10, selectedCols + delta));
    setSelectedCols(next);
    soundEngine.playGridStep(selectedRows * next);
    setFeedback(null);
  };

  const handleFireBeam = () => {
    if (isFiring || isVaporized || isShattering) return;

    setIsFiring(true);
    soundEngine.playLaserBeamSweep();

    // Trigger lasers impact after short travel time
    setTimeout(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (isCorrect) {
        soundEngine.playAsteroidVaporize();
        soundEngine.playSuccess();
        setIsShattering(true);

        confetti({
          particleCount: 65,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#ffd000', '#f97316', '#a855f7', '#ffffff'],
        });

        setFeedback({
          text: `PERFECT BEAM LOCK! ${selectedRows} × ${selectedCols} = ${currentArea} METEORS VAPORIZED!`,
          type: 'success',
        });

        // After shatter animation, transition to vaporized state then next level
        setTimeout(() => {
          setIsVaporized(true);
          setIsShattering(false);
          setIsFiring(false);
          setScore(prev => prev + 150 + streak * 25);
          setStreak(prev => prev + 1);

          setTimeout(() => {
            if (levelIndex < LEVELS.length - 1) {
              setLevelIndex(prev => prev + 1);
              const nextLvl = LEVELS[levelIndex + 1];
              setSelectedRows(2);
              setSelectedCols(Math.min(5, Math.ceil(nextLvl.targetCount / 2)));
              setIsVaporized(false);
              setFeedback(null);
            } else {
              setShowVictory(true);
            }
          }, 1400);
        }, 700);

      } else {
        setStreak(0);
        setIsFiring(false);
        if (currentArea < target) {
          setFeedback({
            text: `Matrix beam covers ${currentArea} cells (${selectedRows} × ${selectedCols}). Swarm needs ${target}! Add more rows or columns.`,
            type: 'warn',
          });
        } else {
          setFeedback({
            text: `Matrix beam overshoots at ${currentArea} cells (${selectedRows} × ${selectedCols}). Swarm needs ${target}! Reduce rows or columns.`,
            type: 'warn',
          });
        }
      }
    }, 450);
  };

  const handleResetLevel = () => {
    soundEngine.playTap();
    setSelectedRows(2);
    setSelectedCols(2);
    setIsFiring(false);
    setIsShattering(false);
    setIsVaporized(false);
    setFeedback(null);
  };

  const handlePlayAgain = () => {
    soundEngine.playTap();
    setLevelIndex(0);
    setSelectedRows(2);
    setSelectedCols(3);
    setScore(0);
    setStreak(0);
    setIsVaporized(false);
    setIsShattering(false);
    setIsFiring(false);
    setShowVictory(false);
    setFeedback(null);
  };

  // Determine grid bounds for rendering
  const maxDisplayRows = Math.min(selectedRows, 8);
  const maxDisplayCols = Math.min(selectedCols, 10);

  return (
    <div className="relative flex flex-col h-full max-h-[100dvh] w-full bg-slate-950 text-white select-none overflow-hidden font-sans">
      
      {/* Dynamic Keyframes for Asteroid Float & Blast Juice */}
      <style>{`
        @keyframes meteorFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-8px) rotate(5deg) scale(1.05); }
        }
        @keyframes meteorShatter {
          0% { transform: scale(1); filter: brightness(1); opacity: 1; }
          25% { transform: scale(1.4) rotate(-12deg); filter: brightness(3) drop-shadow(0 0 25px #00f0ff); opacity: 1; }
          60% { transform: scale(0.7) rotate(35deg); filter: brightness(2) drop-shadow(0 0 35px #f59e0b); opacity: 0.6; }
          100% { transform: scale(0.05) rotate(90deg); filter: brightness(0); opacity: 0; }
        }
        @keyframes laserSweepBeam {
          0% { stroke-dashoffset: 600; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes arenaShake {
          0%, 100% { transform: translate(0, 0); }
          15% { transform: translate(-4px, 3px); }
          30% { transform: translate(4px, -3px); }
          45% { transform: translate(-3px, -2px); }
          60% { transform: translate(3px, 2px); }
          75% { transform: translate(-2px, 1px); }
        }
        @keyframes cannonGlow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 16px #00f0ff); }
        }
      `}</style>

      {/* Background Deep Space Starfield & Cosmic Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* TOP HUD BAR */}
      <header className="relative z-20 flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950/80 backdrop-blur-md border-b border-[#0284c7]/40 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs md:text-sm font-bold text-slate-200 hover:text-white hover:border-[#0284c7] transition active:scale-95 shadow"
          >
            <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
            <span className="hidden sm:inline">Mission Hub</span>
          </button>

          <button
            onClick={() => setShowClinicalInfo(!showClinicalInfo)}
            className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-400 hover:text-[#38bdf8] hover:border-[#0284c7] transition active:scale-95"
            title="Educational Alignment"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Center Target Swarm Hero Display */}
        <div className="text-center px-4 py-1 rounded-2xl bg-black/60 border border-[#0284c7]/50 shadow-lg">
          <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-[#7dd3fc] font-black">
            SECTOR {levelIndex + 1}/{LEVELS.length} • {currentLevel.outpost}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs md:text-sm text-slate-300 font-extrabold tracking-wider">SWARM TARGET:</span>
            <span className="text-xl md:text-3xl font-black text-[#ffd000] drop-shadow-[0_0_14px_rgba(255,208,0,0.8)] tracking-tight">
              {target} METEORS
            </span>
          </div>
        </div>

        {/* Right Stats & Reset */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
            <div className="text-sm md:text-base font-black text-[#38bdf8]">{score}</div>
          </div>
          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{streak}x STREAK</span>
            </div>
          )}
          <button
            onClick={handleResetLevel}
            className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-400 hover:text-white hover:border-[#0284c7] transition active:scale-95"
            title="Reset matrix"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CLINICAL / EDUCATIONAL MODAL */}
      {showClinicalInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="max-w-md w-full p-5 rounded-2xl bg-slate-900 border border-[#0284c7]/50 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#38bdf8]">
              <Crosshair className="w-5 h-5" />
              <h3 className="font-black text-lg">Pedagogical Alignment: Area Models</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Multiplication via Arrays:</strong> Instead of rote drill, children manipulate rows and columns to visually perceive multiplication as a rectangular area.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Commutative Property:</strong> Clearing 12 meteors with 3×4 or 4×3 demonstrates that order of factors does not alter the product.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowClinicalInfo(false)}
                className="px-4 py-2 rounded-xl bg-[#0284c7] text-white font-bold text-sm hover:bg-[#0369a1] transition"
              >
                Understood, Resume Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BATTLE RADAR / SWARM FIELD */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-2 md:p-3 overflow-hidden">
        
        {/* Holographic Arena Container with Optional Screenshake */}
        <div 
          className={`relative w-full max-w-4xl flex-1 flex flex-col items-center justify-between rounded-3xl bg-slate-900/50 border border-[#0284c7]/30 shadow-2xl p-2 md:p-4 backdrop-blur-sm overflow-hidden ${
            isShaking ? 'animate-[arenaShake_0.5s_ease-in-out]' : ''
          }`}
        >
          {/* Target Reticle Radar Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-sky-400/40 animate-pulse" />
            <div className="absolute w-44 h-44 md:w-64 md:h-64 rounded-full border border-dashed border-sky-400/30" />
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-sky-400/30 to-transparent" />
          </div>

          {/* Real-time Holographic Targeting Equation Readout */}
          <div className="relative z-10 mb-2 px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-[#0284c7]/60 shadow-lg flex items-center gap-2 md:gap-4 text-xs md:text-base font-extrabold">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span className="text-slate-400 text-xs">ROWS:</span>
              <span className="text-lg md:text-xl font-black text-cyan-400">{selectedRows}</span>
            </div>
            <span className="text-slate-500 font-black">×</span>
            <div className="flex items-center gap-1.5 text-purple-300">
              <span className="text-slate-400 text-xs">COLS:</span>
              <span className="text-lg md:text-xl font-black text-purple-400">{selectedCols}</span>
            </div>
            <span className="text-slate-500 font-black">=</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">MATRIX BEAM:</span>
              <span className={`text-xl md:text-2xl font-black tracking-tight ${
                isCorrect 
                  ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
                  : currentArea > target 
                    ? 'text-rose-400' 
                    : 'text-amber-400'
              }`}>
                {currentArea} CELLS
              </span>
            </div>
          </div>

          {/* SWARM GRID VISUALIZATION CONTAINER */}
          <div className="relative z-10 flex-1 w-full flex items-center justify-center p-1 md:p-2 min-h-[220px]">
            {!isVaporized ? (
              <div 
                className={`relative p-2 md:p-3 rounded-2xl transition-all duration-300 border-2 ${
                  isFiring
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_35px_rgba(6,182,212,0.6)]'
                    : isCorrect
                      ? 'border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.3)]'
                      : 'border-[#0284c7]/50 bg-slate-950/60 shadow-inner'
                }`}
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${maxDisplayRows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${maxDisplayCols}, minmax(0, 1fr))`,
                  gap: selectedCols > 6 ? '4px' : '8px',
                  maxHeight: '42vh',
                  aspectRatio: `${maxDisplayCols} / ${maxDisplayRows}`,
                }}
              >
                {/* SVG DYNAMIC LASER BEAMS OVERLAY (Shooting upward from bottom cannon battery) */}
                {isFiring && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
                  >
                    <defs>
                      <linearGradient id={`laser-beam-grad-${filterId}`} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
                        <stop offset="70%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffd000" stopOpacity="1" />
                      </linearGradient>
                      <filter id={`laser-glow-${filterId}`}>
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {Array.from({ length: selectedRows * selectedCols }).map((_, idx) => {
                      const rowIndex = Math.floor(idx / selectedCols);
                      const colIndex = idx % selectedCols;
                      
                      // Target coordinates in percentage
                      const targetX = ((colIndex + 0.5) / selectedCols) * 100;
                      const targetY = ((rowIndex + 0.5) / selectedRows) * 100;

                      // Source from dual cannon battery positions at bottom
                      const sourceX = colIndex < selectedCols / 2 ? 30 : 70;
                      const sourceY = 115; // Bottom emitter position

                      return (
                        <g key={`laser-ray-${idx}`}>
                          {/* Wide Plasma Aura */}
                          <line
                            x1={`${sourceX}%`}
                            y1={`${sourceY}%`}
                            x2={`${targetX}%`}
                            y2={`${targetY}%`}
                            stroke="rgba(0, 240, 255, 0.45)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            filter={`url(#laser-glow-${filterId})`}
                          />
                          {/* High Intensity Hot Core */}
                          <line
                            x1={`${sourceX}%`}
                            y1={`${sourceY}%`}
                            x2={`${targetX}%`}
                            y2={`${targetY}%`}
                            stroke={`url(#laser-beam-grad-${filterId})`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            style={{
                              strokeDasharray: '600',
                              animation: 'laserSweepBeam 0.25s ease-out forwards',
                            }}
                          />
                          {/* Impact Flash Ring at Meteor Center */}
                          <circle
                            cx={`${targetX}%`}
                            cy={`${targetY}%`}
                            r="14"
                            fill="#00f0ff"
                            opacity="0.75"
                            className="animate-ping"
                          />
                          <circle
                            cx={`${targetX}%`}
                            cy={`${targetY}%`}
                            r="6"
                            fill="#ffffff"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Render Grid Cells & Floating Volumetric Asteroids */}
                {Array.from({ length: selectedRows * selectedCols }).map((_, idx) => {
                  const rowIndex = Math.floor(idx / selectedCols);
                  const colIndex = idx % selectedCols;
                  const isCoveredByTarget = idx < target;

                  // Unique staggered float timing per asteroid
                  const floatDuration = 3.2 + (idx % 4) * 0.4;
                  const floatDelay = (idx % 6) * 0.25;

                  return (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`relative flex items-center justify-center rounded-2xl p-1 transition-all duration-300 ${
                        isShattering
                          ? 'bg-transparent'
                          : isFiring
                            ? 'bg-cyan-500/25 shadow-[0_0_20px_#22d3ee]'
                            : isCoveredByTarget
                              ? 'bg-gradient-to-br from-indigo-950/70 to-purple-950/80 border border-purple-400/40'
                              : 'bg-rose-950/20 border border-rose-500/30'
                      }`}
                    >
                      {/* Animated Floating Volumetric Asteroid */}
                      <div
                        className="relative flex items-center justify-center w-full h-full"
                        style={{
                          animation: isShattering 
                            ? `meteorShatter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards` 
                            : `meteorFloat ${floatDuration}s ease-in-out infinite`,
                          animationDelay: isShattering ? `${(idx % 6) * 0.04}s` : `${floatDelay}s`,
                        }}
                      >
                        {/* Enhanced Volumetric Meteor Graphic */}
                        <svg 
                          viewBox="0 0 60 60" 
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-200"
                        >
                          <defs>
                            {/* Volumetric magma glow gradient */}
                            <radialGradient id={`meteor-vol-${filterId}-${idx}`} cx="35%" cy="30%" r="65%">
                              <stop offset="0%" stopColor="#fef08a" />
                              <stop offset="25%" stopColor="#f97316" />
                              <stop offset="65%" stopColor="#9a3412" />
                              <stop offset="100%" stopColor="#451a03" />
                            </radialGradient>

                            {/* Asteroid glow aura */}
                            <filter id={`aura-${filterId}-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2.5" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Outer Plasma Aura */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r="22" 
                            fill={isCoveredByTarget ? "rgba(249, 115, 22, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                            className="animate-pulse"
                          />

                          {/* Detailed Irregular 3D Asteroid Silhouette */}
                          <polygon
                            points="30,5 44,10 54,22 51,38 38,52 24,53 10,42 6,26 14,11"
                            fill={`url(#meteor-vol-${filterId}-${idx})`}
                            stroke={isCoveredByTarget ? "#fde047" : "#f87171"}
                            strokeWidth="2"
                            filter={`url(#aura-${filterId}-${idx})`}
                          />

                          {/* Molten Magma Surface Fissures / Cracks */}
                          <path
                            d="M 22,14 Q 28,24 34,20 T 42,32"
                            stroke="#fef08a"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.85"
                          />
                          <path
                            d="M 18,36 Q 26,38 32,46"
                            stroke="#fb923c"
                            strokeWidth="1.2"
                            fill="none"
                            opacity="0.8"
                          />

                          {/* Volumetric Surface Craters */}
                          <circle cx="23" cy="27" r="4.5" fill="#271004" opacity="0.75" />
                          <circle cx="23" cy="27" r="3.2" fill="#1c0b02" />
                          <circle cx="39" cy="36" r="3.5" fill="#271004" opacity="0.7" />
                          <circle cx="36" cy="18" r="2.8" fill="#271004" opacity="0.65" />
                        </svg>

                        {/* Cell Coordinate Index Badge */}
                        <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded bg-black/70 border border-slate-700/60 text-[9px] font-black text-slate-300">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Stardust Vaporization Success View */
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 animate-bounce">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(52,211,153,0.8)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-emerald-300 drop-shadow">
                  SWARM VAPORIZED!
                </h3>
                <p className="text-xs md:text-sm text-slate-300 font-bold">
                  {selectedRows} Rows × {selectedCols} Columns = {currentArea} Meteors Eliminated
                </p>
              </div>
            )}
          </div>

          {/* DUAL PHOTON LASER CANNON BATTERIES (Mounted at bottom of arena) */}
          <div className="relative z-10 w-full flex items-center justify-around px-8 pt-1">
            {/* Left Cannon Battery */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-4 rounded-t-lg bg-gradient-to-t from-slate-800 to-cyan-500 border-x border-t border-cyan-400 flex items-center justify-center transition-all ${
                isFiring ? 'scale-125 shadow-[0_0_20px_#00f0ff] animate-[cannonGlow_0.3s_ease-in-out_infinite]' : 'opacity-80'
              }`}>
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
              <div className="w-14 h-2 bg-slate-900 border-b border-x border-slate-700 rounded-b" />
            </div>

            {/* Central Targeting Radar Indicator */}
            <div className="text-[10px] uppercase font-black tracking-widest text-[#38bdf8] flex items-center gap-1.5 opacity-70">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>ORBITAL LASER EMITTER ARRAY</span>
            </div>

            {/* Right Cannon Battery */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-4 rounded-t-lg bg-gradient-to-t from-slate-800 to-cyan-500 border-x border-t border-cyan-400 flex items-center justify-center transition-all ${
                isFiring ? 'scale-125 shadow-[0_0_20px_#00f0ff] animate-[cannonGlow_0.3s_ease-in-out_infinite]' : 'opacity-80'
              }`}>
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
              <div className="w-14 h-2 bg-slate-900 border-b border-x border-slate-700 rounded-b" />
            </div>
          </div>

          {/* Feedback Prompt Banner */}
          {feedback && (
            <div className={`relative z-20 mt-1 px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold border shadow-lg transition-all animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : feedback.type === 'warn'
                  ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                  : 'bg-sky-950/90 border-sky-500/60 text-sky-200'
            }`}>
              {feedback.text}
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM ARCADE COMMAND CONSOLE */}
      <footer className="relative z-20 p-2 md:p-3 bg-slate-950/90 border-t border-[#0284c7]/40 shadow-2xl backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          
          {/* MATRIX STEPPERS (ROWS & COLS) */}
          <div className="w-full md:w-auto flex items-center justify-center gap-3 sm:gap-6">
            
            {/* ROWS STEPPER */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-md">
              <div className="px-2 text-left">
                <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">ROWS</div>
                <div className="text-lg md:text-xl font-black text-white">{selectedRows}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustRows(-1)}
                  disabled={selectedRows <= 1 || isFiring}
                  aria-label="Decrease rows"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white font-black flex items-center justify-center active:scale-95 disabled:opacity-40 transition shadow"
                >
                  <Minus className="w-5 h-5 text-cyan-300" />
                </button>
                <button
                  onClick={() => handleAdjustRows(1)}
                  disabled={selectedRows >= 10 || isFiring}
                  aria-label="Increase rows"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white font-black flex items-center justify-center active:scale-95 disabled:opacity-40 transition shadow"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* COLUMNS STEPPER */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-md">
              <div className="px-2 text-left">
                <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider">COLUMNS</div>
                <div className="text-lg md:text-xl font-black text-white">{selectedCols}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustCols(-1)}
                  disabled={selectedCols <= 1 || isFiring}
                  aria-label="Decrease columns"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-400 text-white font-black flex items-center justify-center active:scale-95 disabled:opacity-40 transition shadow"
                >
                  <Minus className="w-5 h-5 text-purple-300" />
                </button>
                <button
                  onClick={() => handleAdjustCols(1)}
                  disabled={selectedCols >= 10 || isFiring}
                  aria-label="Increase columns"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-purple-600 hover:bg-purple-500 border border-purple-400 text-white font-black flex items-center justify-center active:scale-95 disabled:opacity-40 transition shadow"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* FIRE MATRIX BEAM BUTTON */}
          <div className="w-full md:w-auto flex-1 max-w-xs">
            <button
              onClick={handleFireBeam}
              disabled={isFiring || isVaporized || isShattering}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-300 active:scale-95 ${
                isFiring || isShattering
                  ? 'bg-cyan-500 text-white shadow-[0_0_35px_#06b6d4] animate-pulse cursor-wait'
                  : isCorrect
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.6)] cursor-pointer'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer'
              }`}
            >
              <Zap className={`w-5 h-5 ${isFiring || isShattering ? 'animate-bounce' : ''}`} />
              <span>{isFiring || isShattering ? 'FIRING LASERS...' : 'FIRE MATRIX BEAM'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* VICTORY OVERLAY (ALL 10 LEVELS COMPLETE) */}
      {showVictory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)] text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-12 h-12 text-[#ffd000]" />
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#7dd3fc] font-black">ACADEMY RECOGNITION</div>
              <h2 className="text-2xl md:text-3xl font-black text-white">MASTER OF ARRAYS!</h2>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                You defended every orbital sector by factoring asteroid swarms into pure geometric power!
              </p>
            </div>

            <div className="py-2 px-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-amber-300">
              FINAL SCORE: {score} PTS
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handlePlayAgain}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-1 transition shadow-lg"
              >
                <span>Return to Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
