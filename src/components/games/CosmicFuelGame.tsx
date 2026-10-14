import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { 
  ArrowLeft, 
  Sparkles, 
  Rocket, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Gauge, 
  Star,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface CosmicFuelGameProps {
  rbtMode?: boolean;
  onExit: () => void;
}

interface LevelConfig {
  outpost: string;
  target: number;
  maxCapacity: number;
  addUnits: number[];
  purgeUnits: number[];
  allowBoost?: boolean;
}

const OUTPOST_LEVELS: LevelConfig[] = [
  {
    outpost: 'Moon Base Alpha',
    target: 8,
    maxCapacity: 15,
    addUnits: [1, 2, 5],
    purgeUnits: [1, 2],
  },
  {
    outpost: 'Mars Orbital Station',
    target: 15,
    maxCapacity: 25,
    addUnits: [1, 5, 10],
    purgeUnits: [1, 5],
  },
  {
    outpost: 'Europa Ice Foundry',
    target: 24,
    maxCapacity: 35,
    addUnits: [2, 5, 10],
    purgeUnits: [1, 2, 5],
  },
  {
    outpost: 'Saturn Ring Gateway',
    target: 38,
    maxCapacity: 50,
    addUnits: [5, 10],
    purgeUnits: [1, 2, 5, 10],
  },
  {
    outpost: 'Andromeda Hyper-Relay',
    target: 65,
    maxCapacity: 80,
    addUnits: [5, 10, 25],
    purgeUnits: [5, 10],
    allowBoost: true,
  },
];

export const CosmicFuelGame = ({ onExit }: CosmicFuelGameProps) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [currentFuel, setCurrentFuel] = useState(0);
  const [equationTokens, setEquationTokens] = useState<{ id: number; value: number }[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isBoostActive, setIsBoostActive] = useState(false);

  const tokenCounterRef = useRef(0);

  const currentLevel = OUTPOST_LEVELS[levelIndex] || {
    outpost: `Deep Space Outpost ${levelIndex + 1}`,
    target: Math.min(20 + levelIndex * 12, 100),
    maxCapacity: Math.min(30 + levelIndex * 15, 120),
    addUnits: [5, 10, 20],
    purgeUnits: [1, 5, 10],
    allowBoost: true,
  };

  const target = currentLevel.target;
  const difference = currentFuel - target;
  const isCalibrated = currentFuel === target;
  const isOvercharged = currentFuel > target;

  // Sound cue on state change
  useEffect(() => {
    if (isCalibrated && !isLaunching) {
      soundEngine.playSuccess();
    }
  }, [isCalibrated, isLaunching]);

  const handleAddFuel = (amount: number) => {
    if (isLaunching) return;
    const finalAmount = isBoostActive ? amount * 2 : amount;
    if (isBoostActive) setIsBoostActive(false);

    soundEngine.playFuelInject(finalAmount);

    setCurrentFuel(prev => {
      const next = prev + finalAmount;
      return next;
    });

    tokenCounterRef.current += 1;
    setEquationTokens(prev => [
      ...prev,
      { id: tokenCounterRef.current, value: finalAmount },
    ]);
  };

  const handlePurgeFuel = (amount: number) => {
    if (isLaunching || currentFuel <= 0) return;
    soundEngine.playPurgeVent();

    setCurrentFuel(prev => Math.max(0, prev - amount));

    tokenCounterRef.current += 1;
    setEquationTokens(prev => [
      ...prev,
      { id: tokenCounterRef.current, value: -amount },
    ]);
  };

  const handleFlushTank = () => {
    if (isLaunching) return;
    soundEngine.playTap();
    setCurrentFuel(0);
    setEquationTokens([]);
    setIsBoostActive(false);
  };

  const handleLaunchRocket = () => {
    if (!isCalibrated || isLaunching) return;

    soundEngine.playRocketLaunch();
    setIsLaunching(true);

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#00f2fe', '#ffd000', '#4ade80', '#ffffff'],
    });

    setTimeout(() => {
      soundEngine.playCheer();
      setScore(s => s + 150);
      setStars(st => st + 3);
      setShowVictoryModal(true);
    }, 1400);
  };

  const handleNextOutpost = () => {
    soundEngine.playTap();
    setShowVictoryModal(false);
    setIsLaunching(false);
    setCurrentFuel(0);
    setEquationTokens([]);
    setIsBoostActive(false);
    setLevelIndex(prev => prev + 1);
  };

  const liquidPercentage = Math.min(
    Math.max((currentFuel / currentLevel.maxCapacity) * 100, 0),
    100
  );
  const targetPercentage = Math.min(
    Math.max((target / currentLevel.maxCapacity) * 100, 0),
    100
  );

  return (
    <div className="flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-[#05182e] via-[#092244] to-[#040e1e] text-white flex flex-col justify-between relative select-none">
      {/* Dynamic Cosmic Background */}
      <CosmicBackground sector="math" />

      {/* Top HUD Navigation Bar */}
      <header className="relative z-20 px-3 md:px-6 py-2.5 bg-slate-950/60 backdrop-blur-md border-b border-[#0369a1]/40 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c4a6e]/80 hover:bg-[#0284c7] text-[#38bdf8] hover:text-white border border-[#38bdf8]/40 transition-all active:scale-95 text-xs font-black shadow"
            title="Return to Mission Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mission Hub</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-[#072545] border border-[#0284c7]/30 text-[11px] font-bold text-[#7dd3fc]">
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>REACTOR CALIBRATION</span>
          </div>
        </div>

        {/* Center Outpost Badge */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#7dd3fc] font-black">
            MISSION {levelIndex + 1} • {currentLevel.outpost}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-slate-300 font-bold">TARGET:</span>
            <span className="text-sm md:text-base font-black text-[#ffd000] drop-shadow-[0_0_8px_rgba(255,208,0,0.5)]">
              {target} MW
            </span>
          </div>
        </div>

        {/* Right Stars and Quick Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{score} pts</span>
          </div>

          <button
            type="button"
            onClick={handleFlushTank}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 text-xs font-black active:scale-95 transition-all shadow"
            title="Flush and reset fuel tank to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Flush</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage Area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-2.5 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center min-h-0 overflow-y-auto">
        
        {/* LEFT COLUMN: Launchpad & Spaceship (4 cols on md) */}
        <div className="md:col-span-4 h-full flex flex-col justify-between items-center p-3 md:p-4 rounded-2xl bg-[#092648]/60 backdrop-blur-md border border-[#0284c7]/30 shadow-2xl relative overflow-hidden">
          
          {/* Status Alert Banner */}
          <div className="w-full text-center mb-2">
            {isCalibrated ? (
              <div className="animate-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black tracking-wide shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CALIBRATED! READY TO LAUNCH</span>
              </div>
            ) : isOvercharged ? (
              <div className="animate-bounce inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-black tracking-wide shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>OVERCHARGE (+{difference} MW)! USE PURGE</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-200 text-xs font-black tracking-wide">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span>NEED +{target - currentFuel} MW TO CALIBRATE</span>
              </div>
            )}
          </div>

          {/* Spaceship Launch Visualization */}
          <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[160px] md:min-h-[220px]">
            {/* Stars launch stream */}
            {isLaunching && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center">
                <div className="w-1 h-20 bg-white/60 blur-xs animate-ping"></div>
              </div>
            )}

            {/* Rocket Container with dynamic transform on launch */}
            <div className={`relative transition-all duration-1000 ${
              isLaunching 
                ? '-translate-y-[200%] scale-75 opacity-20' 
                : isOvercharged 
                  ? 'animate-[shake_0.4s_infinite]' 
                  : isCalibrated 
                    ? 'scale-105' 
                    : ''
            }`}>
              <svg viewBox="0 0 160 220" className="w-32 md:w-44 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                <defs>
                  <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="rocketWing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="thrustFire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffd000" />
                    <stop offset="50%" stopColor="#ff5722" />
                    <stop offset="100%" stopColor="#00f2fe" />
                  </linearGradient>
                </defs>

                {/* Left Fin */}
                <path d="M 40 140 L 15 180 L 45 170 Z" fill="url(#rocketWing)" />
                {/* Right Fin */}
                <path d="M 120 140 L 145 180 L 115 170 Z" fill="url(#rocketWing)" />

                {/* Main Fuselage */}
                <path d="M 80 15 Q 120 70 120 165 L 40 165 Q 40 70 80 15 Z" fill="url(#rocketBody)" stroke="#0284c7" strokeWidth="2.5" />

                {/* Cabin Window with Astronaut Helmet */}
                <circle cx="80" cy="85" r="22" fill="#0369a1" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="80" cy="85" r="16" fill="#0f172a" />
                <circle cx="76" cy="80" r="4" fill="#38bdf8" opacity="0.9" />

                {/* Power Core Light on Rocket Body */}
                <circle 
                  cx="80" 
                  cy="130" 
                  r="10" 
                  fill={isCalibrated ? '#4ade80' : isOvercharged ? '#f43f5e' : '#38bdf8'} 
                  className={isCalibrated ? 'animate-pulse' : ''}
                />
                <circle cx="80" cy="130" r="5" fill="#ffffff" />

                {/* Thruster Nozzle */}
                <path d="M 60 165 L 100 165 L 108 180 L 52 180 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />

                {/* Thruster Plume Flame (Visible when calibrated or launching) */}
                {(isCalibrated || isLaunching) && (
                  <path 
                    d="M 58 180 Q 80 230 102 180 Q 80 205 58 180 Z" 
                    fill="url(#thrustFire)" 
                    className="animate-pulse"
                  />
                )}
              </svg>
            </div>

            {/* Launchpad Platform Base */}
            <div className="w-44 h-3 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-t-md shadow-md border-t border-slate-400/40"></div>
          </div>

          {/* Big Launch Throttle Button */}
          <div className="w-full mt-2">
            <button
              type="button"
              disabled={!isCalibrated || isLaunching}
              onClick={handleLaunchRocket}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
                isCalibrated && !isLaunching
                  ? 'bg-gradient-to-r from-[#00c9a7] via-[#48ffdf] to-[#ffd000] text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(72,255,223,0.6)] animate-pulse'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400 cursor-not-allowed opacity-75'
              }`}
            >
              <Rocket className="w-5 h-5" />
              <span>{isLaunching ? 'LIFTOFF IN PROGRESS...' : isCalibrated ? '🚀 IGNITION • LAUNCH!' : 'CALIBRATE TO LAUNCH'}</span>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: The Central Plasma Containment Reactor (4 cols on md) */}
        <div className="md:col-span-4 h-full flex flex-col items-center justify-between p-3 md:p-4 rounded-2xl bg-[#07203d]/80 backdrop-blur-md border border-[#0284c7]/40 shadow-2xl relative">
          
          <div className="w-full flex items-center justify-between pb-1 border-b border-[#0369a1]/40">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#7dd3fc]">
              <Zap className="w-4 h-4 text-[#ffd000]" />
              <span>PLASMA REACTOR</span>
            </div>
            <div className="text-[11px] font-black text-slate-300">
              CAPACITY: {currentLevel.maxCapacity} MW
            </div>
          </div>

          {/* Cylindrical Plasma Tank with Measurement Notches & Goal Laser */}
          <div className="w-full flex-1 flex items-center justify-center py-2 relative min-h-[180px] md:min-h-[220px]">
            <div className="relative w-36 md:w-44 h-[190px] md:h-[240px] rounded-2xl border-4 border-[#0284c7] bg-slate-950/80 overflow-hidden shadow-inner flex flex-col justify-end">
              
              {/* Measurement Rulers Tick Marks */}
              <div className="absolute inset-y-0 left-1 w-4 flex flex-col justify-between py-2 pointer-events-none z-20 text-[8.5px] font-mono text-slate-400 font-bold">
                <span>{currentLevel.maxCapacity}</span>
                <span>{Math.round(currentLevel.maxCapacity * 0.75)}</span>
                <span>{Math.round(currentLevel.maxCapacity * 0.5)}</span>
                <span>{Math.round(currentLevel.maxCapacity * 0.25)}</span>
                <span>0</span>
              </div>

              {/* TARGET HORIZONTAL LASER LINE */}
              <div 
                className="absolute w-full z-30 pointer-events-none flex items-center transition-all duration-500"
                style={{ bottom: `${targetPercentage}%` }}
              >
                <div className="w-full h-[2.5px] bg-[#ffd000] shadow-[0_0_8px_#ffd000]"></div>
                <div className="absolute right-1 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#ffd000] text-slate-950 text-[9px] font-black shadow tracking-tighter">
                  GOAL {target}
                </div>
              </div>

              {/* CURRENT LIQUID PLASMA */}
              <div
                className={`w-full transition-all duration-500 relative ${
                  isCalibrated
                    ? 'bg-gradient-to-t from-[#059669] via-[#10b981] to-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.7)]'
                    : isOvercharged
                      ? 'bg-gradient-to-t from-[#e11d48] via-[#f43f5e] to-[#fb7185] shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                      : 'bg-gradient-to-t from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                }`}
                style={{ height: `${liquidPercentage}%` }}
              >
                {/* Surface Plasma Wave Glow */}
                <div className="w-full h-2 bg-white/40 blur-[1px] absolute top-0 left-0"></div>

                {/* Bubbling plasma particles */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:12px_12px] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Current Reading HUD */}
          <div className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-[#0284c7]/30 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Output</div>
            <div className={`text-2xl font-black transition-colors ${
              isCalibrated 
                ? 'text-emerald-400' 
                : isOvercharged 
                  ? 'text-rose-400' 
                  : 'text-[#38bdf8]'
            }`}>
              {currentFuel} <span className="text-xs font-bold text-slate-400">MW</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fuel Control & Subtraction Valves (4 cols on md) */}
        <div className="md:col-span-4 h-full flex flex-col justify-between p-3 md:p-4 rounded-2xl bg-[#092648]/60 backdrop-blur-md border border-[#0284c7]/30 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#0369a1]/40 mb-2">
            <div className="text-xs font-black uppercase text-[#7dd3fc] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd000]" />
              <span>CALIBRATION CONTROLS</span>
            </div>
            {currentLevel.allowBoost && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setIsBoostActive(b => !b);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                  isBoostActive 
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_#ffd000]' 
                    : 'bg-[#0369a1]/40 text-amber-300 border-amber-400/40 hover:bg-[#0369a1]'
                }`}
              >
                2x OVERDRIVE
              </button>
            )}
          </div>

          {/* POSITIVE FUEL CELLS (Addition) */}
          <div className="mb-3">
            <div className="text-[10px] uppercase font-bold text-[#38bdf8] flex items-center gap-1 mb-1.5">
              <TrendingUp className="w-3 h-3 text-[#38bdf8]" />
              <span>Inject Fuel Cell (Add)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {currentLevel.addUnits.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isLaunching}
                  onClick={() => handleAddFuel(val)}
                  className="py-3 px-2 rounded-xl bg-gradient-to-b from-[#0284c7] to-[#0369a1] hover:from-[#0ea5e9] hover:to-[#0284c7] active:scale-95 border-2 border-[#38bdf8] text-white font-black text-base shadow-lg shadow-sky-950/50 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <span className="text-lg leading-none group-hover:scale-110 transition-transform">
                    +{val}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-sky-200 mt-1 font-bold">
                    {val === 1 ? 'Spark' : val <= 5 ? 'Cell' : 'Core'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* NEGATIVE PURGE VALVES (Subtraction) */}
          <div className="mb-3">
            <div className="text-[10px] uppercase font-bold text-rose-300 flex items-center gap-1 mb-1.5">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              <span>Safety Purge Valves (Subtract)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {currentLevel.purgeUnits.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isLaunching || currentFuel <= 0}
                  onClick={() => handlePurgeFuel(val)}
                  className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center ${
                    isOvercharged
                      ? 'bg-rose-500/30 hover:bg-rose-500/50 border-rose-400 text-rose-200 shadow-md animate-pulse cursor-pointer'
                      : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-600/40 text-rose-300 cursor-pointer active:scale-95'
                  }`}
                >
                  <span className="text-sm font-black">-{val}</span>
                  <span className="text-[8px] uppercase text-rose-300/80 font-bold">Vent</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Formula / Calculation Tape */}
          <div className="p-2 rounded-xl bg-slate-950/80 border border-[#0284c7]/30 min-h-[46px] flex flex-col justify-center">
            <div className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Formula Ledger</div>
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none text-xs font-mono font-bold">
              {equationTokens.length === 0 ? (
                <span className="text-slate-500 italic text-[11px]">Tap capsules above to inject fuel</span>
              ) : (
                <>
                  {equationTokens.map((t, idx) => (
                    <span 
                      key={t.id} 
                      className={`px-1.5 py-0.5 rounded ${
                        t.value > 0 ? 'bg-sky-500/20 text-[#38bdf8]' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {idx > 0 && t.value > 0 ? '+ ' : ''}{t.value}
                    </span>
                  ))}
                  <span className="text-slate-400">=</span>
                  <span className={`font-black ${isCalibrated ? 'text-emerald-400' : 'text-white'}`}>
                    {currentFuel} MW
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info Strip */}
      <footer className="relative z-10 px-4 py-1 text-center bg-slate-950/50 border-t border-[#0369a1]/30">
        <p className="text-[10px] text-slate-400 font-bold">
          SkillQuest Math Academy • Calibrate fuel cells to match the target quota and launch the rocket!
        </p>
      </footer>

      {/* OUTPOST COMPLETED MODAL OVERLAY */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-[#0c395a] to-[#041d33] border-2 border-[#38bdf8] shadow-[0_0_50px_rgba(56,189,248,0.5)] text-center text-white relative">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <Rocket className="w-8 h-8 animate-bounce" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-1">
              MISSION ACCOMPLISHED!
            </h2>
            <p className="text-xs text-sky-200 font-bold mb-4">
              Rocket launched successfully to {currentLevel.outpost}!
            </p>

            {/* Score & Calibration Stats */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-sky-500/30 mb-5 flex items-center justify-around">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Target</div>
                <div className="text-lg font-black text-amber-300">{target} MW</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-700"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Bonus</div>
                <div className="text-lg font-black text-emerald-400">+150 pts</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-700"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Stars</div>
                <div className="text-lg font-black text-[#ffd000]">{stars} ★</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onExit}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs uppercase transition-all"
              >
                Mission Hub
              </button>

              <button
                type="button"
                onClick={handleNextOutpost}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-900/50 flex items-center justify-center gap-1 transition-all"
              >
                <span>Next Outpost</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
