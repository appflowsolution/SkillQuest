import { useState, useRef, useEffect } from 'react';
import { GAMES_CATALOG } from '../data/games';
import { GameId, WorldSector } from '../types';
import { soundEngine } from '../utils/audio';
import { GameCardIllustration } from './GameCardIllustration';
import { CosmicBackground } from './CosmicBackground';
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Brain, 
  Target, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calculator
} from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: GameId) => void;
  rbtMode: boolean;
}

export const Dashboard = ({ onSelectGame }: DashboardProps) => {
  const [activeSector, setActiveSector] = useState<WorldSector>('behavior');
  // Track which cards are flipped (to show the skill explanation)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const toggleFlip = (gameId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  const switchSector = (sector: WorldSector) => {
    if (sector !== activeSector) {
      soundEngine.playTap();
      setActiveSector(sector);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect predominantly horizontal swipe (minimum 45px)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0 && activeSector === 'behavior') {
        // Swiped left: go to math sector
        switchSector('math');
      } else if (deltaX > 0 && activeSector === 'math') {
        // Swiped right: go to behavior sector
        switchSector('behavior');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && activeSector === 'behavior') {
        switchSector('math');
      } else if (e.key === 'ArrowLeft' && activeSector === 'math') {
        switchSector('behavior');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSector]);

  const isMath = activeSector === 'math';
  const visibleGames = GAMES_CATALOG.filter(
    g => (g.sector ?? 'behavior') === activeSector
  );

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex-1 overflow-y-auto overflow-x-hidden ${
        isMath 
          ? 'bg-gradient-to-b from-[#072448] via-[#0c2447] to-[#041226]' 
          : 'bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d]'
      } p-4 md:p-8 select-none flex flex-col justify-between relative transition-colors duration-700 ease-in-out`}
    >
      {/* Living Cosmic Starfield Background with Sector-responsive palette */}
      <CosmicBackground sector={activeSector} />

      {/* Floating Lateral Navigation Arrows */}
      {isMath ? (
        <button
          type="button"
          onClick={() => switchSector('behavior')}
          className="fixed left-2 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3.5 rounded-full bg-[#004e63]/80 hover:bg-[#00647e] text-[#00f2c9] border border-[#00c9a7]/40 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
          title="Switch to Sector 1: Focus & Behavior"
          aria-label="Previous Sector: Behavior & Focus"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => switchSector('math')}
          className="fixed right-2 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3.5 rounded-full bg-[#093563]/80 hover:bg-[#0e4884] text-[#38bdf8] border border-[#38bdf8]/40 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
          title="Switch to Sector 2: Math & Logic"
          aria-label="Next Sector: Math & Logic"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Sector Switcher Segmented Pills & Dynamic Mission Header */}
      <div className="max-w-5xl mx-auto text-center mb-6 pt-1 relative z-10 w-full">
        {/* Sector Tabs Switcher */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg mb-3">
          <button
            type="button"
            onClick={() => switchSector('behavior')}
            className={`flex items-center gap-2 px-3.5 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-black tracking-wide transition-all ${
              !isMath
                ? 'bg-[#004e63] text-[#00f2c9] shadow-md border border-[#00c9a7]/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#00f2c9]" />
            <span>SECTOR 1: FOCUS & BEHAVIOR</span>
          </button>

          <button
            type="button"
            onClick={() => switchSector('math')}
            className={`flex items-center gap-2 px-3.5 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-black tracking-wide transition-all ${
              isMath
                ? 'bg-[#0c4a6e] text-[#38bdf8] shadow-md border border-[#38bdf8]/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>SECTOR 2: MATH ACADEMY</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-[#0284c7]/40 text-[#bae6fd] border border-[#38bdf8]/30 font-bold ml-1 hidden sm:inline-block">
              Grades 1–5
            </span>
          </button>
        </div>

        {/* Dynamic Mission Header */}
        <div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
            isMath 
              ? 'bg-[#0c4a6e]/90 border border-[#38bdf8]/50 text-[#38bdf8]' 
              : 'bg-[#004e63]/90 border border-[#00c9a7]/40 text-[#00f2c9]'
          } text-xs font-black uppercase tracking-widest mb-2 shadow-inner transition-colors duration-500`}>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isMath ? 'COSMIC MATH ACADEMY • GRADES 1–5' : 'SUPERPOWER TRAINING ARCADE'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] mb-2 transition-all duration-300">
            {isMath ? 'COSMIC MATH QUESTS!' : 'CHOOSE YOUR QUEST!'}
          </h1>
          <p className="text-[#a5d8d8] text-xs md:text-sm font-bold tracking-wide max-w-xl mx-auto">
            {isMath 
              ? 'Master addition, subtraction, & multiplication through interactive space mechanics!'
              : 'Tap any game to play, or touch the yellow SKILL corner to view the superpower!'}
          </p>
        </div>
      </div>

      {/* Adventure Game Tiles with Compact, Snug 3D Flip Cards */}
      <div className="max-w-5xl mx-auto w-full mb-4 relative z-10">
        <div key={activeSector} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 animate-fadeIn">
          {visibleGames.map((game) => {
            const isAvailable = game.isAvailable;
            const isFlipped = !!flippedCards[game.id];

            return (
              <div key={game.id} className="perspective-1000 w-full h-[275px] md:h-[295px]">
                {/* 3D Flipping Card Container */}
                <div
                  className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE: Game Cover Art (Snug, No Wasted Space) */}
                  <div
                    onClick={() => {
                      if (isAvailable && !isFlipped) {
                        soundEngine.playTap();
                        onSelectGame(game.id);
                      }
                    }}
                    className={`w-full h-full absolute inset-0 backface-hidden rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between [mask-image:radial-gradient(white,black)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] ${
                      isFlipped ? 'opacity-0 pointer-events-none z-0' : 'opacity-100 z-10'
                    } ${
                      isAvailable
                        ? isMath
                          ? 'bg-[#092947] hover:bg-[#0d3b66] border-[#0284c7] hover:border-[#38bdf8] cursor-pointer shadow-xl hover:shadow-sky-500/20'
                          : 'bg-[#004758] hover:bg-[#005a70] border-[#00d2b4] hover:border-[#48ffdf] cursor-pointer shadow-xl hover:shadow-cyan-500/20'
                        : 'bg-[#003847]/70 border-[#00576b]/70 opacity-80 cursor-not-allowed'
                    }`}
                  >

                    {/* YELLOW CORNER BADGE "SKILL" on Top-Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playTap();
                        toggleFlip(game.id);
                      }}
                      className="absolute top-0 right-0 w-14 h-14 rounded-tr-2xl md:rounded-tr-3xl overflow-hidden z-25 cursor-pointer group/skill active:scale-95 transition-transform"
                      title="Tap to flip card and see skill breakdown"
                    >
                      <svg
                        viewBox="0 0 56 56"
                        className="w-full h-full drop-shadow-md"
                        aria-hidden="true"
                      >
                        <path
                          d="M 0 0 L 36 0 A 20 20 0 0 1 56 20 L 56 56 Z"
                          className="fill-[#ffb703] group-hover/skill:fill-[#ffd000] transition-colors"
                        />
                      </svg>
                      <span className="absolute top-2 right-1 text-[8.5px] md:text-[9.5px] font-black text-slate-950 uppercase rotate-45 tracking-widest select-none drop-shadow-sm pointer-events-none">
                        SKILL
                      </span>
                    </button>

                    {/* Top Illustration Cover (Fills the majority of the card) */}
                    <div className="w-full flex-1 relative overflow-hidden bg-slate-900 min-h-0">
                      <GameCardIllustration gameId={game.id} />
                    </div>

                    {/* Bottom Title & Category Strip (Snug and Compact) */}
                    <div className={`px-3 py-2 ${
                      isMath 
                        ? 'bg-[#062038] border-[#0284c7]/40' 
                        : 'bg-[#003d4c] border-[#006077]/50'
                    } shrink-0 border-t flex items-center justify-between gap-2`}>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-black text-xs md:text-sm leading-tight tracking-tight truncate">
                          {game.title}
                        </h3>
                        <span className={`${isMath ? 'text-[#7dd3fc]' : 'text-[#84cece]'} text-[10px] md:text-[11px] font-bold block truncate`}>
                          {game.category}
                        </span>
                      </div>

                      <div className={`w-6 h-6 rounded-full ${
                        isMath 
                          ? 'bg-[#031526] text-[#38bdf8]' 
                          : 'bg-[#002732] text-[#00e1c1]'
                      } flex items-center justify-center shadow-inner shrink-0`}>
                        <Gamepad2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: Clinical/Pedagogical Skill Explanation */}
                  <div
                    className={`w-full h-full absolute inset-0 backface-hidden rotate-y-180 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#ffb703] ${
                      isMath ? 'bg-[#041b30]' : 'bg-[#002530]'
                    } p-3.5 text-white flex flex-col justify-between shadow-2xl select-text [mask-image:radial-gradient(white,black)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] ${
                      isFlipped ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    {/* Header with Skill Code & Top-Right Flip Icon */}
                    <div className={`flex items-start justify-between border-b ${
                      isMath ? 'border-[#0c3d66]' : 'border-[#004f61]'
                    } pb-2 gap-2 shrink-0`}>
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <Brain className="w-4 h-4 text-[#ffb703] shrink-0 mt-0.5" />
                        <h4 className="text-xs font-black uppercase text-[#ffb703] leading-tight break-words flex-1 min-w-0">
                          {game.skillName}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTap();
                          toggleFlip(game.id);
                        }}
                        className={`w-7 h-7 rounded-full ${
                          isMath ? 'bg-[#0a3152] hover:bg-[#0f4575] border-[#38bdf8]/40' : 'bg-[#003d4c] hover:bg-[#005166] border-[#00c9a7]/30'
                        } text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow border`}
                        title="Flip back to front cover"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isMath ? 'text-[#38bdf8]' : 'text-[#00f2c9]'}`} />
                      </button>
                    </div>

                    {/* Skill Details Body */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 text-left pr-1 min-h-0">
                      <div>
                        <div className="text-[9.5px] font-black uppercase tracking-wider text-[#7dd3fc] flex items-center gap-1 mb-0.5">
                          <Target className="w-2.5 h-2.5 text-[#7dd3fc]" />
                          <span>{isMath ? 'Learning Goal:' : 'What is this Skill?'}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-200 leading-relaxed font-medium">
                          {game.skillDescription}
                        </p>
                      </div>

                      <div>
                        <div className="text-[9.5px] font-black uppercase tracking-wider text-[#4ade80] flex items-center gap-1 mb-0.5">
                          <Zap className="w-2.5 h-2.5 text-[#4ade80]" />
                          <span>{isMath ? 'Interactive Mechanics:' : 'How this Game Aligns:'}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-200 leading-relaxed font-medium">
                          {game.gameAlignment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Footer note */}
      <div className="text-center pb-1 relative z-10">
        <p className={`text-[10.5px] ${isMath ? 'text-[#38bdf8]/70' : 'text-[#558e99]'} font-bold transition-colors duration-500`}>
          {isMath 
            ? 'SkillQuest Math Academy • Tap any quest to launch or inspect pedagogical mechanics' 
            : 'SkillQuest Arcade • Tap any quest to play or tap SKILL to inspect clinical alignment'}
        </p>
      </div>
    </div>
  );
};
