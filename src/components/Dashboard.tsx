import { useState } from 'react';
import { GAMES_CATALOG } from '../data/games';
import { GameId } from '../types';
import { soundEngine } from '../utils/audio';
import { GameCardIllustration } from './GameCardIllustration';
import { 
  Gamepad2, 
  Sparkles, 
  Play, 
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] p-4 md:p-8 select-none flex flex-col justify-between">
      {/* Dynamic Mission Header */}
      <div className="max-w-5xl mx-auto text-center mb-6 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#004e63]/90 border border-[#00c9a7]/40 text-[#00f2c9] text-xs font-black uppercase tracking-widest mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>SUPERPOWER TRAINING ARCADE</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] mb-2">
          CHOOSE YOUR QUEST!
        </h1>
        <p className="text-[#a5d8d8] text-xs md:text-base font-bold tracking-wide max-w-xl mx-auto mb-4">
          Tap any game to play, or touch the yellow <span className="text-[#ffb703] font-black underline decoration-2">SKILL</span> corner to see the superpower!
        </p>

        {/* Yellow Start Button */}
        <button
          onClick={() => {
            soundEngine.playTap();
            onSelectGame('break-request');
          }}
          className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-b from-[#ffc300] to-[#ffaa00] hover:from-[#ffd000] hover:to-[#ffb700] active:scale-95 text-slate-950 font-black text-sm md:text-base rounded-full shadow-lg shadow-amber-500/30 border-2 border-white/70 transition-transform"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Launch Mission 1: Cosmic Break Quest</span>
        </button>
      </div>

      {/* 6 Adventure Game Tiles with 3D Flip Cards */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {GAMES_CATALOG.map((game) => {
            const isAvailable = game.isAvailable;
            const isFlipped = !!flippedCards[game.id];

            return (
              <div key={game.id} className="perspective-1000 w-full h-[320px] md:h-[340px]">
                {/* 3D Flipping Card Container */}
                <div
                  className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE: Game Cover Art */}
                  <div
                    onClick={() => {
                      if (isAvailable && !isFlipped) {
                        soundEngine.playTap();
                        onSelectGame(game.id);
                      }
                    }}
                    className={`w-full h-full absolute inset-0 backface-hidden rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-[#004758] hover:bg-[#005a70] border-[#00d2b4] hover:border-[#48ffdf] cursor-pointer shadow-xl hover:shadow-cyan-500/20'
                        : 'bg-[#003847]/70 border-[#00576b]/70 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {/* Mission Tag on Top-Left */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <span
                        className={`text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-[#8ac926] text-slate-950 border border-white/80'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {game.ribbon}
                      </span>
                    </div>

                    {/* YELLOW CORNER TRIANGLE "SKILL" on Top-Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playTap();
                        toggleFlip(game.id);
                      }}
                      className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-25 cursor-pointer group/skill active:scale-95 transition-transform"
                      title="Tap to flip card and see skill breakdown"
                    >
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[54px] border-t-[#ffb703] border-l-[54px] border-l-transparent drop-shadow-md group-hover/skill:border-t-[#ffd000] transition-colors"></div>
                      <span className="absolute top-2.5 right-1.5 text-[9px] md:text-[10px] font-black text-slate-950 uppercase rotate-45 tracking-widest select-none drop-shadow-sm">
                        SKILL
                      </span>
                    </button>

                    {/* Top Illustration Cover */}
                    <div className="w-full h-44 md:h-48 relative overflow-hidden bg-slate-900">
                      <GameCardIllustration gameId={game.id} />
                    </div>

                    {/* Bottom Title & Category Strip */}
                    <div className="p-3.5 bg-[#003d4c] flex flex-col justify-between flex-1 border-t border-[#006077]/50">
                      <div>
                        <h3 className="text-white font-black text-sm md:text-base leading-tight tracking-tight mb-1">
                          {game.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#84cece] text-[11px] md:text-xs font-bold">
                          {game.category}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[#002732] flex items-center justify-center text-[#00e1c1] shadow-inner">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: Clinical Skill Explanation */}
                  <div
                    className="w-full h-full absolute inset-0 backface-hidden rotate-y-180 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#ffb703] bg-[#002833] p-4 text-white flex flex-col justify-between shadow-2xl select-text"
                  >
                    {/* Header with Skill Code & Flip-Back Button */}
                    <div className="flex items-center justify-between border-b border-[#004f61] pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-[#ffb703]" />
                        <span className="text-xs font-black uppercase text-[#ffb703] tracking-wide">
                          {game.skillCode}: {game.skillName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTap();
                          toggleFlip(game.id);
                        }}
                        className="w-7 h-7 rounded-full bg-[#003d4c] hover:bg-[#005166] text-white flex items-center justify-center active:scale-95 transition-all shadow"
                        title="Flip back to front"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#00f2c9]" />
                      </button>
                    </div>

                    {/* Skill Description */}
                    <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 text-left pr-1">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#7dd3fc] flex items-center gap-1 mb-0.5">
                          <Target className="w-3 h-3 text-[#7dd3fc]" />
                          <span>What is this Skill?</span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                          {game.skillDescription}
                        </p>
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] flex items-center gap-1 mb-0.5">
                          <Zap className="w-3 h-3 text-[#4ade80]" />
                          <span>How this Game Aligns:</span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                          {game.gameAlignment}
                        </p>
                      </div>
                    </div>

                    {/* Flip Back Button at Bottom */}
                    <div className="pt-2 border-t border-[#004f61]">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTap();
                          toggleFlip(game.id);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Flip Back to Game Cover</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Footer note */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-[#558e99] font-bold">
          SkillQuest Arcade • Tap any quest to play or tap SKILL to inspect clinical alignment
        </p>
      </div>
    </div>
  );
};
