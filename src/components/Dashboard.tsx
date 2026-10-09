import { GAMES_CATALOG } from '../data/games';
import { GameId } from '../types';
import { soundEngine } from '../utils/audio';
import { GameCardIllustration } from './GameCardIllustration';
import { Gamepad2, Sparkles, Play } from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: GameId) => void;
  rbtMode: boolean;
}

export const Dashboard = ({ onSelectGame }: DashboardProps) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] p-4 md:p-8 select-none flex flex-col justify-between">
      {/* Dynamic Mission Header */}
      <div className="max-w-5xl mx-auto text-center mb-8 pt-2">
        {/* Curved tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#004e63]/90 border border-[#00c9a7]/40 text-[#00f2c9] text-xs font-black uppercase tracking-widest mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>SUPERPOWER TRAINING ARCADE</span>
        </div>

        {/* Exciting Hero Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] mb-2">
          CHOOSE YOUR QUEST!
        </h1>
        <p className="text-[#a5d8d8] text-xs md:text-base font-bold tracking-wide max-w-xl mx-auto mb-4">
          Play fun adventures, level up your focus and calm superpowers, and collect stars!
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

      {/* 6 Adventure Game Tiles (Generous 3-column / 2-column layout) */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {GAMES_CATALOG.map((game) => {
            const isAvailable = game.isAvailable;

            return (
              <div
                key={game.id}
                onClick={() => {
                  if (isAvailable) {
                    soundEngine.playTap();
                    onSelectGame(game.id);
                  }
                }}
                className={`group relative rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-200 flex flex-col ${
                  isAvailable
                    ? 'bg-[#004758] hover:bg-[#005a70] border-[#00d2b4] hover:border-[#48ffdf] cursor-pointer shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5'
                    : 'bg-[#003847]/70 border-[#00576b]/70 opacity-80 cursor-not-allowed'
                }`}
              >
                {/* Mission Ribbon Tag */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className={`text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider ${
                    isAvailable 
                      ? 'bg-[#8ac926] text-slate-950 border border-white/80' 
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {game.ribbon}
                  </span>
                </div>

                {/* Top Illustration Cover */}
                <div className="w-full h-36 md:h-44 relative overflow-hidden bg-slate-900">
                  <GameCardIllustration gameId={game.id} />
                </div>

                {/* Bottom Title & Superpower Category Strip */}
                <div className="p-3.5 bg-[#003d4c] group-hover:bg-[#00495c] transition-colors flex flex-col justify-between flex-1 border-t border-[#006077]/50">
                  <div>
                    <h3 className="text-white font-black text-sm md:text-base leading-tight tracking-tight mb-1 group-hover:text-[#52ffde] transition-colors">
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
            );
          })}
        </div>
      </div>

      {/* Clean Footer note */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-[#558e99] font-bold">
          SkillQuest Arcade • Tap any quest to play
        </p>
      </div>
    </div>
  );
};
