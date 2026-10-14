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

  // Sound cues and idle engine rumble lifecycle while waiting on the pad
  useEffect(() => {
    soundEngine.startRocketIdle();
    return () => {
      soundEngine.stopRocketIdle();
    };
  }, []);

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
    soundEngine.startRocketIdle();
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

        {/* Center Outpost Badge with Hero Target Display */}
        <div className="text-center px-4 py-1 rounded-2xl bg-black/50 border border-[#0284c7]/50 shadow-lg">
          <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-[#7dd3fc] font-black">
            MISSION {levelIndex + 1} • {currentLevel.outpost}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs md:text-sm text-slate-300 font-extrabold tracking-wider">TARGET:</span>
            <span className="text-xl md:text-3xl font-black text-[#ffd000] drop-shadow-[0_0_14px_rgba(255,208,0,0.8)] tracking-tight">
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

          {/* Spaceship Launch Visualization with Cryogenic Steam & Fire Exhaust */}
          <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[180px] md:min-h-[240px] overflow-visible">
            
            {/* Launchpad Cryogenic LOX Steam Venting (Active while idling/waiting) */}
            {!isLaunching && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center items-center pointer-events-none z-15">
                {/* Left umbilical vent wisp */}
                <div className="absolute left-1/2 -translate-x-14 bottom-12 w-6 h-6 rounded-full bg-white/40 blur-[2px] animate-cryo-vent"></div>
                <div className="absolute left-1/2 -translate-x-16 bottom-14 w-8 h-8 rounded-full bg-sky-200/30 blur-[3px] animate-cryo-vent [animation-delay:0.8s]"></div>
                
                {/* Right umbilical vent wisp */}
                <div className="absolute left-1/2 translate-x-8 bottom-12 w-6 h-6 rounded-full bg-white/40 blur-[2px] animate-cryo-vent [animation-delay:0.4s]"></div>
                <div className="absolute left-1/2 translate-x-10 bottom-14 w-8 h-8 rounded-full bg-sky-200/30 blur-[3px] animate-cryo-vent [animation-delay:1.2s]"></div>

                {/* Base pad cryogenic ground fog */}
                <div className="absolute bottom-1 w-36 h-6 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-[4px] animate-pulse"></div>
              </div>
            )}

            {/* Launch Fire and Trench Smoke Clouds (Active when launching) */}
            {isLaunching && (
              <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20 flex flex-col items-center">
                {/* Flame Trench Exhaust Smoke Billowing Outward */}
                <div className="relative w-full h-24 flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-t from-slate-200/80 via-amber-200/50 to-transparent blur-md animate-smoke-billow"></div>
                  <div className="absolute -left-4 bottom-2 w-20 h-20 rounded-full bg-slate-300/70 blur-md animate-smoke-billow [animation-delay:0.2s]"></div>
                  <div className="absolute -right-4 bottom-2 w-20 h-20 rounded-full bg-slate-300/70 blur-md animate-smoke-billow [animation-delay:0.4s]"></div>
                  <div className="absolute bottom-4 w-28 h-16 bg-amber-400/30 rounded-full blur-lg animate-pulse"></div>

                  {/* Spark Particles */}
                  <div className="absolute -top-4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute -top-6 left-1/3 w-1 h-1 bg-amber-200 rounded-full animate-ping [animation-delay:0.3s]"></div>
                  <div className="absolute -top-8 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping [animation-delay:0.15s]"></div>
                </div>
              </div>
            )}

            {/* Realistic Aerospace Rocket with Multi-layer Shading & Textures */}
            <div className={`relative z-10 transition-all duration-1000 ${
              isLaunching 
                ? '-translate-y-[220%] scale-90 opacity-20' 
                : isOvercharged 
                  ? 'animate-[shake_0.35s_infinite]' 
                  : isCalibrated 
                    ? 'scale-105' 
                    : ''
            }`}>
              <svg viewBox="0 0 180 260" className="w-36 md:w-48 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                <defs>
                  {/* Fuselage Titanium & Carbon Gradients */}
                  <linearGradient id="aeroFuselage" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="25%" stopColor="#f8fafc" />
                    <stop offset="65%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>

                  <linearGradient id="aeroNose" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="45%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  <linearGradient id="aeroWings" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="60%" stopColor="#0369a1" />
                    <stop offset="100%" stopColor="#075985" />
                  </linearGradient>

                  <linearGradient id="glassCanopy" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="85%" stopColor="#082f49" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  <linearGradient id="nozzleMetal" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="40%" stopColor="#475569" />
                    <stop offset="70%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Supersonic Flame Gradients */}
                  <linearGradient id="machFlame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#38bdf8" />
                    <stop offset="65%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>

                  <linearGradient id="thermalFlame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="15%" stopColor="#ffd000" />
                    <stop offset="50%" stopColor="#ff5722" />
                    <stop offset="85%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>

                  {/* Filter glow for engines */}
                  <filter id="engineGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Left Swept Delta Wing with Flap Seams */}
                <path d="M 46 145 L 14 195 L 48 185 Z" fill="url(#aeroWings)" stroke="#0369a1" strokeWidth="1.5" />
                <line x1="26" y1="188" x2="44" y2="183" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

                {/* Right Swept Delta Wing with Flap Seams */}
                <path d="M 134 145 L 166 195 L 132 185 Z" fill="url(#aeroWings)" stroke="#0369a1" strokeWidth="1.5" />
                <line x1="154" y1="188" x2="136" y2="183" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

                {/* Main Fuselage Body with Aerodynamic Contours */}
                <path 
                  d="M 90 22 Q 136 78 136 178 L 44 178 Q 44 78 90 22 Z" 
                  fill="url(#aeroFuselage)" 
                  stroke="#334155" 
                  strokeWidth="2" 
                />

                {/* Aerodynamic Nose Cone Heat Shield Cap & Probe */}
                <path d="M 90 8 L 90 22" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90 22 Q 110 50 114 65 L 66 65 Q 70 50 90 22 Z" fill="url(#aeroNose)" />

                {/* Fuselage Panel Seams & Rivet Rows */}
                <line x1="50" y1="108" x2="130" y2="108" stroke="#64748b" strokeWidth="1.2" opacity="0.8" />
                <line x1="46" y1="146" x2="134" y2="146" stroke="#64748b" strokeWidth="1.2" opacity="0.8" />
                
                {/* Black & White Roll Pattern Hazard Decal */}
                <rect x="45" y="156" width="90" height="6" fill="#0f172a" opacity="0.8" />
                <rect x="58" y="156" width="16" height="6" fill="#f8fafc" />
                <rect x="90" y="156" width="16" height="6" fill="#f8fafc" />
                <rect x="120" y="156" width="12" height="6" fill="#f8fafc" />

                {/* Thermal Shield Ceramic Tiles Base */}
                <path d="M 44 164 L 136 164 L 132 178 L 48 178 Z" fill="#1e293b" />
                <line x1="68" y1="164" x2="68" y2="178" stroke="#334155" strokeWidth="1" />
                <line x1="90" y1="164" x2="90" y2="178" stroke="#334155" strokeWidth="1" />
                <line x1="112" y1="164" x2="112" y2="178" stroke="#334155" strokeWidth="1" />

                {/* Side Reaction Control Thrusters (RCS Quads) */}
                <rect x="42" y="80" width="4" height="8" rx="1.5" fill="#334155" />
                <rect x="134" y="80" width="4" height="8" rx="1.5" fill="#334155" />

                {/* Panoramic Glass Canopy Cockpit */}
                <ellipse cx="90" cy="88" rx="20" ry="24" fill="url(#glassCanopy)" stroke="#0ea5e9" strokeWidth="2.5" />
                {/* Canopy Specular Glare */}
                <path d="M 76 74 Q 90 70 102 78 Q 88 82 76 74 Z" fill="#ffffff" opacity="0.6" />

                {/* Astronaut Pilot Silhouette inside Cockpit */}
                <circle cx="90" cy="88" r="11" fill="#020617" />
                {/* Gold Reflective Helmet Visor */}
                <ellipse cx="90" cy="87" rx="7" ry="5" fill="#ffd000" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="88" cy="85" r="1.5" fill="#ffffff" opacity="0.9" />

                {/* Illuminated Flight Telemetry HUD Console */}
                <rect x="76" y="99" width="28" height="6" rx="2" fill="#020617" stroke="#0284c7" strokeWidth="1" />
                <circle cx="82" cy="102" r="1.2" fill="#4ade80" />
                <circle cx="87" cy="102" r="1.2" fill="#38bdf8" />
                <circle cx="92" cy="102" r="1.2" fill="#ffd000" />
                <circle cx="97" cy="102" r="1.2" fill="#f43f5e" />

                {/* Central Reactor Power Conduit Indicator */}
                <circle 
                  cx="90" 
                  cy="130" 
                  r="9" 
                  fill={isCalibrated ? '#10b981' : isOvercharged ? '#f43f5e' : '#0284c7'} 
                  stroke={isCalibrated ? '#34d399' : isOvercharged ? '#fb7185' : '#38bdf8'}
                  strokeWidth="2"
                  className={isCalibrated ? 'animate-pulse' : ''}
                />
                <circle cx="90" cy="130" r="4.5" fill="#ffffff" />

                {/* Cryogenic Propellant Lines */}
                <line x1="64" y1="108" x2="64" y2="156" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="116" y1="108" x2="116" y2="156" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3,2" />

                {/* Dual Bell Rocket Engines with Cooling Manifolds */}
                {/* Left Engine Bell */}
                <path d="M 64 178 L 78 178 L 82 195 L 60 195 Z" fill="url(#nozzleMetal)" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="62" y1="184" x2="80" y2="184" stroke="#64748b" strokeWidth="1" />
                
                {/* Right Engine Bell */}
                <path d="M 102 178 L 116 178 L 120 195 L 98 195 Z" fill="url(#nozzleMetal)" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="100" y1="184" x2="118" y2="184" stroke="#64748b" strokeWidth="1" />

                {/* PRE-LAUNCH IGNITION GLOW (Calibrated State) */}
                {isCalibrated && !isLaunching && (
                  <g filter="url(#engineGlow)">
                    <ellipse cx="71" cy="197" rx="9" ry="7" fill="#ffd000" className="animate-pulse" />
                    <ellipse cx="109" cy="197" rx="9" ry="7" fill="#ffd000" className="animate-pulse" />
                  </g>
                )}

                {/* FULL BLAST LIFTOFF ENGINE EXHAUST (When Launching) */}
                {isLaunching && (
                  <g className="animate-flame-flicker">
                    {/* Outer Supersonic Thermal Shock Diamond Plume */}
                    <path 
                      d="M 56 195 Q 71 280 71 310 Q 71 280 86 195 Z" 
                      fill="url(#thermalFlame)" 
                      filter="url(#engineGlow)"
                    />
                    <path 
                      d="M 94 195 Q 109 280 109 310 Q 109 280 124 195 Z" 
                      fill="url(#thermalFlame)" 
                      filter="url(#engineGlow)"
                    />

                    {/* Inner Mach Diamonds Core (Electric Blue & White-Hot) */}
                    <path 
                      d="M 63 195 Q 71 250 71 270 Q 71 250 79 195 Z" 
                      fill="url(#machFlame)" 
                    />
                    <path 
                      d="M 101 195 Q 109 250 109 270 Q 109 250 117 195 Z" 
                      fill="url(#machFlame)" 
                    />
                    
                    {/* Diamond Shock Points */}
                    <polygon points="71,215 74,222 71,229 68,222" fill="#ffffff" />
                    <polygon points="71,235 73,240 71,245 69,240" fill="#ffffff" />
                    <polygon points="109,215 112,222 109,229 106,222" fill="#ffffff" />
                    <polygon points="109,235 111,240 109,245 107,240" fill="#ffffff" />
                  </g>
                )}
              </svg>
            </div>

            {/* Launchpad Platform Base with Gantry Clamps & Flame Deflector */}
            <div className="relative w-48 z-10 flex flex-col items-center">
              {/* Umbilical Gantry Hold-down Clamps */}
              <div className="w-full flex justify-between px-2 -mb-1 z-20">
                <div className="w-3.5 h-7 bg-slate-600 rounded-t border-t-2 border-amber-400 flex flex-col justify-around py-0.5">
                  <div className="w-full h-0.5 bg-amber-400"></div>
                  <div className="w-full h-0.5 bg-slate-900"></div>
                </div>
                <div className="w-3.5 h-7 bg-slate-600 rounded-t border-t-2 border-amber-400 flex flex-col justify-around py-0.5">
                  <div className="w-full h-0.5 bg-amber-400"></div>
                  <div className="w-full h-0.5 bg-slate-900"></div>
                </div>
              </div>

              {/* Steel Launch Table with Warning Hazard Stripe */}
              <div className="w-48 h-4 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 rounded-t-lg shadow-xl border-t border-slate-400/50 relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-1.5 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_8px,#1e293b_8px,#1e293b_16px)] opacity-70"></div>
              </div>

              {/* Flame Deflector Trench Base */}
              <div className="w-40 h-2 bg-slate-950/80 rounded-b border-b border-slate-700/60 shadow-inner"></div>
            </div>
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
                <div className="w-full h-[3px] bg-[#ffd000] shadow-[0_0_12px_#ffd000]"></div>
                <div className="absolute right-0 -translate-y-1/2 px-2 py-1 rounded-l-lg bg-[#ffd000] text-slate-950 text-xs md:text-sm font-black shadow-xl tracking-tight flex items-center gap-1 border-y border-l border-amber-200">
                  <span className="text-[10px] md:text-xs text-slate-800">TARGET</span>
                  <span className="text-sm md:text-base font-black underline decoration-2">{target}</span>
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

          {/* Prominent Comparative Target Goal vs Current Output HUD */}
          <div className="w-full grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-[#0284c7]/40 text-center shadow-lg">
            <div className="bg-[#ffd000]/10 border border-[#ffd000]/30 rounded-lg py-1 px-1.5 flex flex-col justify-center">
              <div className="text-[10px] md:text-[11px] uppercase font-black text-amber-300">TARGET GOAL</div>
              <div className="text-2xl md:text-3xl font-black text-[#ffd000] drop-shadow-[0_0_10px_rgba(255,208,0,0.6)]">
                {target} <span className="text-xs font-bold text-amber-200">MW</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg py-1 px-1.5 flex flex-col justify-center">
              <div className="text-[10px] md:text-[11px] uppercase font-black text-slate-300">CURRENT OUTPUT</div>
              <div className={`text-2xl md:text-3xl font-black transition-colors ${
                isCalibrated 
                  ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]' 
                  : isOvercharged 
                    ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' 
                    : 'text-[#38bdf8] drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]'
              }`}>
                {currentFuel} <span className="text-xs font-bold text-slate-400">MW</span>
              </div>
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
