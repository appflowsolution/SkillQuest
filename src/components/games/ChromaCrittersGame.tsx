import { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { 
  ArrowLeft, 
  RotateCcw, 
  X, 
  Bot, 
  Lightbulb, 
  Award
} from 'lucide-react';
import { CosmicBackground } from '../CosmicBackground';

// Paint color options inspired by authentic factory palette
export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  dotColor: string;
}

export const PAINTS: PaintColor[] = [
  { id: 'yellow', name: 'Yellow', hex: '#ffd84d', dotColor: '#facc15' },
  { id: 'red', name: 'Red', hex: '#ea3838', dotColor: '#dc2626' },
  { id: 'cyan', name: 'Light Blue', hex: '#7ce5e8', dotColor: '#38bdf8' },
  { id: 'pink', name: 'Pink', hex: '#d9659b', dotColor: '#db2777' },
  { id: 'lime', name: 'Lime Green', hex: '#9ad93b', dotColor: '#84cc16' },
  { id: 'orange', name: 'Orange', hex: '#f27341', dotColor: '#ea580c' },
  { id: 'white', name: 'White', hex: '#ffffff', dotColor: '#e2e8f0' },
];

export interface QuadrantColors {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  target: QuadrantColors;
  // Suggested next step for the silent visual hint [shutter or paint id]
  hintAction: 'shutterLeft' | 'shutterRight' | 'shutterTop' | 'shutterBottom' | 'clear' | string;
}

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Three-Quarter Sun',
    // 3 parts orange, top-right yellow (matches ABCya screenshot Level 1)
    target: {
      topLeft: '#f27341',
      topRight: '#ffd84d',
      bottomLeft: '#f27341',
      bottomRight: '#f27341',
    },
    hintAction: 'orange',
  },
  {
    levelNumber: 2,
    name: 'Split Vertical',
    // Left half light blue, right half lime green
    target: {
      topLeft: '#7ce5e8',
      topRight: '#9ad93b',
      bottomLeft: '#7ce5e8',
      bottomRight: '#9ad93b',
    },
    hintAction: 'shutterLeft',
  },
  {
    levelNumber: 3,
    name: 'Checkerboard Dual',
    // Diagonal alternate: TL & BR Orange, TR & BL Cyan
    target: {
      topLeft: '#f27341',
      topRight: '#7ce5e8',
      bottomLeft: '#7ce5e8',
      bottomRight: '#f27341',
    },
    hintAction: 'shutterTop',
  },
  {
    levelNumber: 4,
    name: 'Tri-Color Studio',
    // Top half red, bottom-left yellow, bottom-right lime
    target: {
      topLeft: '#ea3838',
      topRight: '#ea3838',
      bottomLeft: '#ffd84d',
      bottomRight: '#9ad93b',
    },
    hintAction: 'red',
  },
  {
    levelNumber: 5,
    name: 'Quad Spectrum',
    // 4 distinct quadrants: TL Red, TR Yellow, BL Cyan, BR Lime
    target: {
      topLeft: '#ea3838',
      topRight: '#ffd84d',
      bottomLeft: '#7ce5e8',
      bottomRight: '#9ad93b',
    },
    hintAction: 'shutterBottom',
  },
];

interface ChromaCrittersGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

export const ChromaCrittersGame = ({ rbtMode, onExit }: ChromaCrittersGameProps) => {
  // Current Level
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  // 4 Quadrants of the Chroma Critter (starts solid white)
  const [critter, setCritter] = useState<QuadrantColors>({
    topLeft: '#ffffff',
    topRight: '#ffffff',
    bottomLeft: '#ffffff',
    bottomRight: '#ffffff',
  });

  // Shutters / Curtain Sliders on the Arch Frame
  // Top rail:
  const [shutterLeft, setShutterLeft] = useState(false);   // Left vertical curtain (x: 0% to 50%)
  const [shutterRight, setShutterRight] = useState(false); // Right vertical curtain (x: 50% to 100%)
  // Left rail:
  const [shutterTop, setShutterTop] = useState(false);     // Top horizontal curtain (y: 0% to 50%)
  const [shutterBottom, setShutterBottom] = useState(false); // Bottom horizontal curtain (y: 50% to 100%)

  // Visual feedback
  const [isWobbling, setIsWobbling] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Skill 3: Requesting Help Metrics & Non-intrusive Visual Hint (NO popup window)
  const [activeHintTarget, setActiveHintTarget] = useState<string | null>(null);
  const [independentCount, setIndependentCount] = useState(0);
  const [promptedCount, setPromptedCount] = useState(0);

  // Clear all active curtains (the red/orange "X" button on the frame corner)
  const handleClearAllShutters = () => {
    soundEngine.playTap();
    setShutterLeft(false);
    setShutterRight(false);
    setShutterTop(false);
    setShutterBottom(false);
  };

  // Reset Critter back to clean white base
  const handleResetCritter = () => {
    soundEngine.playTap();
    setCritter({
      topLeft: '#ffffff',
      topRight: '#ffffff',
      bottomLeft: '#ffffff',
      bottomRight: '#ffffff',
    });
    handleClearAllShutters();
  };

  // Paint application: Paints every quadrant NOT covered by active curtains
  const handleApplyPaint = (colorHex: string) => {
    soundEngine.playGemPop();
    setActiveHintTarget(null);

    setCritter(prev => {
      const next = { ...prev };
      // Top-Left quadrant covered if shutterLeft OR shutterTop is active
      if (!shutterLeft && !shutterTop) {
        next.topLeft = colorHex;
      }
      // Top-Right quadrant covered if shutterRight OR shutterTop is active
      if (!shutterRight && !shutterTop) {
        next.topRight = colorHex;
      }
      // Bottom-Left quadrant covered if shutterLeft OR shutterBottom is active
      if (!shutterLeft && !shutterBottom) {
        next.bottomLeft = colorHex;
      }
      // Bottom-Right quadrant covered if shutterRight OR shutterBottom is active
      if (!shutterRight && !shutterBottom) {
        next.bottomRight = colorHex;
      }
      return next;
    });
  };

  // Check if critter matches target
  const handleCheck = () => {
    const isTL = critter.topLeft.toLowerCase() === currentLevel.target.topLeft.toLowerCase();
    const isTR = critter.topRight.toLowerCase() === currentLevel.target.topRight.toLowerCase();
    const isBL = critter.bottomLeft.toLowerCase() === currentLevel.target.bottomLeft.toLowerCase();
    const isBR = critter.bottomRight.toLowerCase() === currentLevel.target.bottomRight.toLowerCase();

    if (isTL && isTR && isBL && isBR) {
      // Victory!
      soundEngine.playSuccess();
      confetti({
        particleCount: 65,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#ffd84d', '#f27341', '#7ce5e8', '#9ad93b'],
      });

      if (!activeHintTarget) {
        setIndependentCount(prev => prev + 1);
      }
      setIsWon(true);
    } else {
      // Mismatch
      soundEngine.playTap();
      setIsWobbling(true);
      setTimeout(() => setIsWobbling(false), 500);
    }
  };

  // Skill 3: Ask for Help (Direct visual highlight on next element — NO popup window)
  const handleRequestHelp = () => {
    soundEngine.playSuccess();
    setPromptedCount(prev => prev + 1);

    // Provide immediate visual highlight on the strategic action
    setActiveHintTarget(currentLevel.hintAction);
  };

  // Advance level
  const handleNextLevel = () => {
    soundEngine.playTap();
    setIsWon(false);
    handleClearAllShutters();
    setCritter({
      topLeft: '#ffffff',
      topRight: '#ffffff',
      bottomLeft: '#ffffff',
      bottomRight: '#ffffff',
    });
    setActiveHintTarget(null);
    setLevelIndex(prev => (prev + 1) % LEVELS.length);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#002f3c] text-white overflow-hidden relative select-none">
      {/* Background stardust */}
      <CosmicBackground />

      {/* RBT Co-Pilot Bar (when rbtMode enabled) */}
      {rbtMode && (
        <div className="bg-[#002029]/95 border-b border-[#00c9a7]/30 px-4 py-1.5 flex items-center justify-between text-xs z-30 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-black text-[#ffb703] uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#ffb703]" />
              <span>RBT CO-PILOT • SKILL 3 (HELP REQUEST)</span>
            </span>
            <div className="flex items-center gap-2 bg-[#00171e] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
              <span className="text-emerald-400 font-bold">Independent: {independentCount}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-bold">Prompted: {promptedCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestHelp}
              className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeHintTarget
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-[#003847] hover:bg-[#004e63] text-[#00f2c9] border border-[#00c9a7]/30'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{activeHintTarget ? 'Hint Active' : 'Model Help'}</span>
            </button>

            <button
              onClick={handleNextLevel}
              className="bg-[#003847] hover:bg-[#004e63] text-white px-2.5 py-1 rounded-full font-bold text-xs transition-colors border border-white/10"
            >
              Skip Level
            </button>
          </div>
        </div>
      )}

      {/* Instruction Banner at top (Matches authentic ABCya style) */}
      <div className="px-4 py-2 flex items-center justify-between z-20 shrink-0 bg-[#002833]/80 border-b border-white/10">
        <button
          onClick={() => {
            soundEngine.playTap();
            onExit();
          }}
          className="w-8 h-8 rounded-full bg-[#003847] hover:bg-[#004e63] flex items-center justify-center text-[#00f2c9] border border-white/15 active:scale-95 transition-transform"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <p className="text-center font-black tracking-wider text-xs md:text-sm text-slate-100 uppercase drop-shadow">
          CLICK ON THE ARROWS TO COVER PARTS OF THE CRITTER BEFORE YOU PAINT!
        </p>

        {/* Right balance spacer */}
        <div className="w-8" />
      </div>

      {/* Central Assembly Floor */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 gap-6 md:gap-12 relative z-10 max-w-5xl mx-auto w-full">
        
        {/* ========================================================= */}
        {/* LEFT WORKSPACE: INVERTED-U ARCH FRAME + SHUTTERS + CRITTER */}
        {/* ========================================================= */}
        <div className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] flex items-center justify-center shrink-0">
          
          {/* Outer Teal Pipe Arch Frame */}
          <div className="absolute inset-0 border-[14px] border-b-0 border-[#7bd1d5] rounded-t-[32px] pointer-events-none z-10 shadow-lg" />

          {/* Top-Left 'X' Clear All Button (on the pipe elbow) */}
          <button
            onClick={handleClearAllShutters}
            className="absolute -top-3.5 -left-3.5 w-10 h-10 rounded-full bg-gradient-to-b from-[#f27341] to-[#ea580c] border-2 border-white shadow-md flex items-center justify-center text-white font-black z-30 active:scale-90 transition-transform cursor-pointer"
            title="Clear all shutters"
          >
            <X className="w-6 h-6 stroke-[3.5]" />
          </button>

          {/* ========================================= */}
          {/* TOP RAIL SHUTTER CONTROLS (PULL DOWN)     */}
          {/* ========================================= */}
          <div className="absolute -top-[14px] left-[20px] right-[20px] h-[38px] flex z-25 pointer-events-auto">
            {/* Left Vertical Shutter Block (Covers Left Half) */}
            <button
              onClick={() => {
                soundEngine.playTap();
                setShutterLeft(prev => !prev);
              }}
              className={`flex-1 h-full rounded-tl-xl border border-white/60 flex items-center justify-center gap-1 transition-all cursor-pointer ${
                shutterLeft
                  ? 'bg-[#f59e0b] shadow-inner'
                  : 'bg-[#fbbf24] hover:bg-[#f59e0b]'
              } ${activeHintTarget === 'shutterLeft' ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
              title="Click to pull down left curtain"
            >
              <div className="flex gap-1.5 text-white drop-shadow font-black text-sm">
                <span>{shutterLeft ? '▲' : '▼'}</span>
                <span>{shutterLeft ? '▲' : '▼'}</span>
                <span>{shutterLeft ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Right Vertical Shutter Block (Covers Right Half) */}
            <button
              onClick={() => {
                soundEngine.playTap();
                setShutterRight(prev => !prev);
              }}
              className={`flex-1 h-full rounded-tr-xl border border-white/60 flex items-center justify-center gap-1 transition-all cursor-pointer ${
                shutterRight
                  ? 'bg-[#ea580c] shadow-inner'
                  : 'bg-[#f97316] hover:bg-[#ea580c]'
              } ${activeHintTarget === 'shutterRight' ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
              title="Click to pull down right curtain"
            >
              <div className="flex gap-1.5 text-white drop-shadow font-black text-sm">
                <span>{shutterRight ? '▲' : '▼'}</span>
                <span>{shutterRight ? '▲' : '▼'}</span>
                <span>{shutterRight ? '▲' : '▼'}</span>
              </div>
            </button>
          </div>

          {/* ========================================= */}
          {/* LEFT RAIL SHUTTER CONTROLS (PULL RIGHT)   */}
          {/* ========================================= */}
          <div className="absolute top-[28px] bottom-0 -left-[14px] w-[38px] flex flex-col z-25 pointer-events-auto">
            {/* Top Horizontal Shutter Block (Covers Top Half) */}
            <button
              onClick={() => {
                soundEngine.playTap();
                setShutterTop(prev => !prev);
              }}
              className={`flex-1 w-full rounded-tl-xl border border-white/60 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                shutterTop
                  ? 'bg-[#f59e0b] shadow-inner'
                  : 'bg-[#fbbf24] hover:bg-[#f59e0b]'
              } ${activeHintTarget === 'shutterTop' ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
              title="Click to slide top curtain"
            >
              <div className="flex flex-col gap-1.5 text-white drop-shadow font-black text-sm">
                <span>{shutterTop ? '◀' : '▶'}</span>
                <span>{shutterTop ? '◀' : '▶'}</span>
                <span>{shutterTop ? '◀' : '▶'}</span>
              </div>
            </button>

            {/* Bottom Horizontal Shutter Block (Covers Bottom Half) */}
            <button
              onClick={() => {
                soundEngine.playTap();
                setShutterBottom(prev => !prev);
              }}
              className={`flex-1 w-full rounded-bl-xl border border-white/60 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                shutterBottom
                  ? 'bg-[#ea580c] shadow-inner'
                  : 'bg-[#f97316] hover:bg-[#ea580c]'
              } ${activeHintTarget === 'shutterBottom' ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
              title="Click to slide bottom curtain"
            >
              <div className="flex flex-col gap-1.5 text-white drop-shadow font-black text-sm">
                <span>{shutterBottom ? '◀' : '▶'}</span>
                <span>{shutterBottom ? '◀' : '▶'}</span>
                <span>{shutterBottom ? '◀' : '▶'}</span>
              </div>
            </button>
          </div>

          {/* ========================================= */}
          {/* WORKSPACE INTERIOR: CRITTER + CURTAINS    */}
          {/* ========================================= */}
          <div className="relative w-[280px] h-[280px] md:w-[310px] md:h-[310px] overflow-hidden flex items-center justify-center">
            
            {/* 4-QUADRANT FLUFFY CHROMA CRITTER (Center) */}
            <div className="relative w-[220px] h-[220px] md:w-[240px] md:h-[240px] flex items-center justify-center">
              
              {/* SVG 4-Quadrant Pie Body + Furry Tufts */}
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                {/* 28 Fluffy Perimeter Tufts */}
                <g>
                  {[...Array(28)].map((_, i) => {
                    const angle = (i * 2 * Math.PI) / 28;
                    const r = 88;
                    const cx = 100 + r * Math.cos(angle);
                    const cy = 100 + r * Math.sin(angle);
                    // Color matches corresponding quadrant
                    let tuftColor = critter.topLeft;
                    if (cx >= 100 && cy < 100) tuftColor = critter.topRight;
                    else if (cx < 100 && cy >= 100) tuftColor = critter.bottomLeft;
                    else if (cx >= 100 && cy >= 100) tuftColor = critter.bottomRight;

                    return (
                      <circle key={i} cx={cx} cy={cy} r="12" fill={tuftColor} />
                    );
                  })}
                </g>

                {/* Main Body: 4 Slices (Quadrants) */}
                {/* Top-Left Quadrant */}
                <path
                  d="M 100 100 L 16 100 A 84 84 0 0 1 100 16 Z"
                  fill={critter.topLeft}
                  className="transition-colors duration-200"
                />
                {/* Top-Right Quadrant */}
                <path
                  d="M 100 100 L 100 16 A 84 84 0 0 1 184 100 Z"
                  fill={critter.topRight}
                  className="transition-colors duration-200"
                />
                {/* Bottom-Right Quadrant */}
                <path
                  d="M 100 100 L 184 100 A 84 84 0 0 1 100 184 Z"
                  fill={critter.bottomRight}
                  className="transition-colors duration-200"
                />
                {/* Bottom-Left Quadrant */}
                <path
                  d="M 100 100 L 100 184 A 84 84 0 0 1 16 100 Z"
                  fill={critter.bottomLeft}
                  className="transition-colors duration-200"
                />

                {/* Kawaii Eyes and Smile */}
                <g fill="#0f172a">
                  <ellipse cx="78" cy="95" rx="8" ry="10" />
                  <ellipse cx="122" cy="95" rx="8" ry="10" />
                  <circle cx="76" cy="92" r="3" fill="#ffffff" />
                  <circle cx="120" cy="92" r="3" fill="#ffffff" />
                </g>
                <path
                  d="M 90 108 Q 100 118 110 108"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Thin Stick Arms & Legs */}
                <path d="M 38 120 Q 20 135 25 155" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <path d="M 162 120 Q 180 135 175 155" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <line x1="95" y1="184" x2="95" y2="198" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="105" y1="184" x2="105" y2="198" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* ========================================================= */}
            {/* PHYSICAL DIAGONAL-STRIPED CURTAINS (MATCHING THE ORIGINAL)*/}
            {/* ========================================================= */}
            
            {/* LEFT VERTICAL SHUTTER (Drops down over left half) */}
            {shutterLeft && (
              <div 
                className="absolute top-0 bottom-0 left-0 w-1/2 border-r-4 border-yellow-200 shadow-2xl z-20 pointer-events-none animate-fadeIn"
                style={{
                  background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #ea580c 16px, #ea580c 32px)',
                }}
              />
            )}

            {/* RIGHT VERTICAL SHUTTER (Drops down over right half) */}
            {shutterRight && (
              <div 
                className="absolute top-0 bottom-0 right-0 w-1/2 border-l-4 border-yellow-200 shadow-2xl z-20 pointer-events-none animate-fadeIn"
                style={{
                  background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #ea580c 16px, #ea580c 32px)',
                }}
              />
            )}

            {/* TOP HORIZONTAL SHUTTER (Slides across top half) */}
            {shutterTop && (
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 border-b-4 border-yellow-200 shadow-2xl z-21 pointer-events-none animate-fadeIn"
                style={{
                  background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #ea580c 16px, #ea580c 32px)',
                }}
              />
            )}

            {/* BOTTOM HORIZONTAL SHUTTER (Slides across bottom half) */}
            {shutterBottom && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1/2 border-t-4 border-yellow-200 shadow-2xl z-21 pointer-events-none animate-fadeIn"
                style={{
                  background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #ea580c 16px, #ea580c 32px)',
                }}
              />
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: GOAL MODEL MONITOR + LEVEL + CHECK BUTTON   */}
        {/* ========================================================= */}
        <div className="w-[230px] md:w-[260px] bg-[#4a9ea2] border-4 border-[#2b7175] rounded-3xl p-3 shadow-2xl flex flex-col items-center shrink-0">
          
          {/* Level Header with Progress Dots */}
          <div className="w-full text-center mb-2">
            <h3 className="font-black text-2xl md:text-3xl text-[#ffe066] tracking-wider uppercase drop-shadow">
              LEVEL {currentLevel.levelNumber}
            </h3>
            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-1">
              {LEVELS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === levelIndex
                      ? 'bg-white scale-125'
                      : idx < levelIndex
                      ? 'bg-[#1e585b]'
                      : 'bg-[#2b7175]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Goal Display Screen Viewport (Square Canvas) */}
          <div className="w-full bg-[#eef7f8] rounded-2xl p-4 shadow-inner flex items-center justify-center mb-3">
            <div className="w-32 h-32 md:w-36 md:h-36">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                {/* 4 Quadrants of the Target Model */}
                <path d="M 100 100 L 16 100 A 84 84 0 0 1 100 16 Z" fill={currentLevel.target.topLeft} />
                <path d="M 100 100 L 100 16 A 84 84 0 0 1 184 100 Z" fill={currentLevel.target.topRight} />
                <path d="M 100 100 L 184 100 A 84 84 0 0 1 100 184 Z" fill={currentLevel.target.bottomRight} />
                <path d="M 100 100 L 100 184 A 84 84 0 0 1 16 100 Z" fill={currentLevel.target.bottomLeft} />
                {/* Subtle seam outline */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Actions: Circular Reset + Big CHECK Button */}
          <div className="w-full flex items-center gap-2">
            {/* Circular Reset Button */}
            <button
              onClick={handleResetCritter}
              className="w-13 h-13 rounded-full bg-gradient-to-b from-[#fcd34d] to-[#f59e0b] border-2 border-white shadow-md flex items-center justify-center text-[#78350f] active:scale-95 transition-transform cursor-pointer shrink-0"
              title="Reset critter to white base"
            >
              <RotateCcw className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Big Oblong CHECK Button */}
            <button
              onClick={handleCheck}
              className={`flex-1 h-13 rounded-full bg-gradient-to-b from-[#fcd34d] to-[#f59e0b] border-2 border-white shadow-lg flex items-center justify-center font-black text-xl md:text-2xl text-[#d94824] tracking-wider uppercase active:scale-95 transition-all cursor-pointer ${
                isWobbling ? 'animate-bounce' : ''
              }`}
            >
              CHECK
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SECTION: CONVEYOR BELT ROLLERS + PAINT POTS TRAY   */}
      {/* ========================================================= */}
      <div className="w-full shrink-0 z-20">
        {/* Conveyor Belt with Cyan Rollers */}
        <div className="w-full h-8 bg-[#2d7d82] border-t-2 border-b-2 border-[#1e585b] flex items-center justify-around px-2 overflow-hidden">
          {[...Array(26)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-[#46b3b9] border border-[#1e585b] flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
          ))}
        </div>

        {/* Paint Pot Palette Row */}
        <div className="w-full bg-[#4a9ea2] py-3 px-4 shadow-2xl">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            
            {/* Paint Spill Tub Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#2b7175]/60 flex items-center justify-center text-white/90 shrink-0">
              <svg viewBox="0 0 48 48" className="w-8 h-8 fill-current">
                <path d="M12 36 L28 12 L38 20 L22 44 Z" opacity="0.9" />
                <path d="M24 10 L38 20" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="16" cy="38" rx="10" ry="5" fill="#ffffff" />
              </svg>
            </div>

            {/* 7 Paint Pots */}
            <div className="flex-1 flex items-center justify-around gap-2">
              {PAINTS.map(paint => (
                <button
                  key={paint.id}
                  onClick={() => handleApplyPaint(paint.hex)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-white shadow-lg relative group active:scale-90 transition-transform cursor-pointer ${
                    activeHintTarget === paint.id ? 'ring-4 ring-yellow-300 animate-pulse' : ''
                  }`}
                  style={{ backgroundColor: paint.hex }}
                  title={`Paint with ${paint.name}`}
                >
                  {/* Glossy reflection bubble */}
                  <div className="absolute top-1 left-2 w-3.5 h-2 rounded-full bg-white/70" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VICTORY MODAL OVERLAY */}
      {isWon && (
        <div className="absolute inset-0 bg-[#00171e]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-sm w-full bg-[#003847] border-3 border-[#00f2c9] rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#00f2c9] flex items-center justify-center text-slate-950 mb-3 shadow-lg animate-bounce">
              <Award className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">
              PERFECT MATCH!
            </h3>
            <p className="text-sm text-[#a5d8d8] font-bold mb-4">
              Your Chroma Critter matches the factory target design!
            </p>

            <button
              onClick={handleNextLevel}
              className="w-full py-4 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] text-slate-950 rounded-2xl font-black text-base shadow-xl border-2 border-white/70 active:scale-95 transition-all cursor-pointer"
            >
              NEXT LEVEL (LEVEL {levelIndex + 2 <= LEVELS.length ? levelIndex + 2 : 1})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
