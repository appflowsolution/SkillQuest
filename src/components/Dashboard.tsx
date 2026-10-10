import { useState } from 'react';
import { GAMES_CATALOG } from '../data/games';
import { GameId } from '../types';
import { soundEngine } from '../utils/audio';
import { GameCardIllustration } from './GameCardIllustration';
import { CosmicBackground } from './CosmicBackground';
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Brain, 
  Target, 
  Zap 
} from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: GameId) => void;
  rbtMode: boolean;
}

export const Dashboard = ({ onSelectGame }: DashboardProps) => {
  // Track which cards are flipped (to show the skill explanation)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (gameId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] p-4 md:p-8 select-none flex flex-col justify-between relative">
      {/* Living Cosmic Starfield Background with Twinkling Mint Dots & Clouds */}
      <CosmicBackground />

      {/* Dynamic Mission Header */}
      <div className="max-w-5xl mx-auto text-center mb-6 pt-1 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#004e63]/90 border border-[#00c9a7]/40 text-[#00f2c9] text-xs font-black uppercase tracking-widest mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>SUPERPOWER TRAINING ARCADE</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] mb-2">
          CHOOSE YOUR QUEST!
        </h1>
        <p className="text-[#a5d8d8] text-xs md:text-sm font-bold tracking-wide max-w-xl mx-auto">
          Tap any game to play, or touch the yellow <span className="text-[#ffb703] font-black underline decoration-2">SKILL</span> corner to view the superpower!
        </p>
      </div>

      {/* 6 Adventure Game Tiles with Compact, Snug 3D Flip Cards */}
      <div className="max-w-5xl mx-auto w-full mb-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {GAMES_CATALOG.map((game) => {
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
                        ? 'bg-[#004758] hover:bg-[#005a70] border-[#00d2b4] hover:border-[#48ffdf] cursor-pointer shadow-xl hover:shadow-cyan-500/20'
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
                    <div className="px-3 py-2 bg-[#003d4c] shrink-0 border-t border-[#006077]/50 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-black text-xs md:text-sm leading-tight tracking-tight truncate">
                          {game.title}
                        </h3>
                        <span className="text-[#84cece] text-[10px] md:text-[11px] font-bold block truncate">
                          {game.category}
                        </span>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-[#002732] flex items-center justify-center text-[#00e1c1] shadow-inner shrink-0">
                        <Gamepad2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: Clinical Skill Explanation (No Bottom Button, Snug and Clean) */}
                  <div
                    className={`w-full h-full absolute inset-0 backface-hidden rotate-y-180 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#ffb703] bg-[#002530] p-3.5 text-white flex flex-col justify-between shadow-2xl select-text [mask-image:radial-gradient(white,black)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] ${
                      isFlipped ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    {/* Header with Skill Code & Top-Right Flip Icon */}
                    <div className="flex items-start justify-between border-b border-[#004f61] pb-2 gap-2 shrink-0">
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
                        className="w-7 h-7 rounded-full bg-[#003d4c] hover:bg-[#005166] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow border border-[#00c9a7]/30"
                        title="Flip back to front cover"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#00f2c9]" />
                      </button>
                    </div>

                    {/* Skill Details Body */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 text-left pr-1 min-h-0">
                      <div>
                        <div className="text-[9.5px] font-black uppercase tracking-wider text-[#7dd3fc] flex items-center gap-1 mb-0.5">
                          <Target className="w-2.5 h-2.5 text-[#7dd3fc]" />
                          <span>What is this Skill?</span>
                        </div>
                        <p className="text-[10.5px] text-slate-200 leading-relaxed font-medium">
                          {game.skillDescription}
                        </p>
                      </div>

                      <div>
                        <div className="text-[9.5px] font-black uppercase tracking-wider text-[#4ade80] flex items-center gap-1 mb-0.5">
                          <Zap className="w-2.5 h-2.5 text-[#4ade80]" />
                          <span>How this Game Aligns:</span>
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
        <p className="text-[10.5px] text-[#558e99] font-bold">
          SkillQuest Arcade • Tap any quest to play or tap SKILL to inspect clinical alignment
        </p>
      </div>
    </div>
  );
};
