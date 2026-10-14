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
  const [isVaporized, setIsVaporized] = useState(false);
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
    if (isFiring || isVaporized) return;

    setIsFiring(true);
    soundEngine.playLaserBeamSweep();

    setTimeout(() => {
      if (isCorrect) {
        soundEngine.playAsteroidVaporize();
        soundEngine.playSuccess();
        setIsVaporized(true);
        setScore(prev => prev + 150 + streak * 25);
        setStreak(prev => prev + 1);

        confetti({
          particleCount: 55,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#00e5ff', '#a855f7', '#ffd000', '#ffffff'],
        });

        setFeedback({
          text: `PERFECT BEAM LOCK! ${selectedRows} × ${selectedCols} = ${currentArea} METEORS DISINTEGRATED!`,
          type: 'success',
        });

        setTimeout(() => {
          if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1);
            // Default to starting factors for next level
            const nextLvl = LEVELS[levelIndex + 1];
            setSelectedRows(2);
            setSelectedCols(Math.min(5, Math.ceil(nextLvl.targetCount / 2)));
            setIsVaporized(false);
            setIsFiring(false);
            setFeedback(null);
          } else {
            setShowVictory(true);
            setIsFiring(false);
          }
        }, 1600);
      } else {
        setStreak(0);
        setIsFiring(false);
        if (currentArea < target) {
          setFeedback({
            text: `Matrix beam covers ${currentArea} cells (${selectedRows} × ${selectedCols}). Swarm needs ${target}! Increase rows or columns.`,
            type: 'warn',
          });
        } else {
          setFeedback({
            text: `Matrix beam overshoots at ${currentArea} cells (${selectedRows} × ${selectedCols}). Swarm needs ${target}! Decrease rows or columns.`,
            type: 'warn',
          });
        }
      }
    }, 600);
  };

  const handleResetLevel = () => {
    soundEngine.playTap();
    setSelectedRows(2);
    setSelectedCols(2);
    setIsFiring(false);
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
    setIsFiring(false);
    setShowVictory(false);
    setFeedback(null);
  };

  // Determine grid dimensions for the visual swarm display
  const maxDisplayRows = Math.min(selectedRows, 8);
  const maxDisplayCols = Math.min(selectedCols, 10);

  return (
    <div className="relative flex flex-col h-full max-h-[100dvh] w-full bg-slate-950 text-white select-none overflow-hidden font-sans">
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
      <main className="relative flex-1 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
        {/* Holographic Arena Container */}
        <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center rounded-3xl bg-slate-900/50 border border-[#0284c7]/30 shadow-2xl p-3 md:p-6 backdrop-blur-sm overflow-hidden">
          
          {/* Target Reticle Radar Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-sky-400/40 animate-pulse" />
            <div className="absolute w-44 h-44 md:w-64 md:h-64 rounded-full border border-dashed border-sky-400/30" />
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-sky-400/30 to-transparent" />
          </div>

          {/* Real-time Holographic Targeting Equation Readout */}
          <div className="relative z-10 mb-3 px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-[#0284c7]/60 shadow-lg flex items-center gap-2 md:gap-4 text-xs md:text-base font-extrabold">
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

          {/* SWARM GRID VISUALIZATION */}
          <div className="relative z-10 flex-1 w-full flex items-center justify-center p-2">
            {!isVaporized ? (
              <div 
                className={`relative p-2 md:p-3 rounded-2xl transition-all duration-300 border-2 ${
                  isFiring
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_35px_rgba(6,182,212,0.6)]'
                    : isCorrect
                      ? 'border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.3)]'
                      : 'border-[#0284c7]/50 bg-slate-950/60 shadow-inner'
                }`}
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${maxDisplayRows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${maxDisplayCols}, minmax(0, 1fr))`,
                  gap: '6px',
                  maxHeight: '44vh',
                  aspectRatio: `${maxDisplayCols} / ${maxDisplayRows}`,
                }}
              >
                {/* Render Grid Cells */}
                {Array.from({ length: selectedRows * selectedCols }).map((_, idx) => {
                  const rowIndex = Math.floor(idx / selectedCols);
                  const colIndex = idx % selectedCols;
                  const isCoveredByTarget = idx < target;

                  return (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`relative flex items-center justify-center rounded-xl p-1 transition-all duration-300 ${
                        isFiring
                          ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee] scale-95'
                          : isCoveredByTarget
                            ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/80 border border-purple-400/40'
                            : 'bg-rose-950/30 border border-rose-500/30'
                      }`}
                    >
                      {/* Meteor Graphic SVG */}
                      <svg 
                        viewBox="0 0 40 40" 
                        className={`w-6 h-6 md:w-8 md:h-8 transition-transform duration-200 ${
                          isFiring ? 'animate-spin scale-125' : 'hover:scale-110'
                        }`}
                      >
                        <defs>
                          <radialGradient id={`meteor-grad-${filterId}-${idx}`} cx="40%" cy="40%" r="60%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="60%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          <filter id={`glow-${filterId}-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        {/* Asteroid rock irregular shape */}
                        <polygon
                          points="20,4 32,8 38,20 33,32 20,38 8,32 3,20 8,8"
                          fill={`url(#meteor-grad-${filterId}-${idx})`}
                          stroke="#fbbf24"
                          strokeWidth="1.5"
                          filter={`url(#glow-${filterId}-${idx})`}
                        />
                        {/* Surface craters */}
                        <circle cx="16" cy="18" r="3" fill="#451a03" opacity="0.6" />
                        <circle cx="26" cy="24" r="2.2" fill="#451a03" opacity="0.6" />
                        <circle cx="24" cy="13" r="1.8" fill="#451a03" opacity="0.5" />
                      </svg>

                      {/* Cell Coordinate Pill Badge */}
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-slate-400/80">
                        {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Stardust Vaporization Success View */
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 animate-bounce">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.8)]">
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

          {/* Feedback Prompt Banner */}
          {feedback && (
            <div className={`relative z-20 px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold border shadow-lg transition-all animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                : feedback.type === 'warn'
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                  : 'bg-sky-950/80 border-sky-500/60 text-sky-200'
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
              disabled={isFiring || isVaporized}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-300 active:scale-95 ${
                isFiring
                  ? 'bg-cyan-500 text-white shadow-[0_0_30px_#06b6d4] animate-pulse cursor-wait'
                  : isCorrect
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.6)] cursor-pointer'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer'
              }`}
            >
              <Zap className={`w-5 h-5 ${isFiring ? 'animate-bounce' : ''}`} />
              <span>{isFiring ? 'FIRING BEAM...' : 'FIRE MATRIX BEAM'}</span>
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
