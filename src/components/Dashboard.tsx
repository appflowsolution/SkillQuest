import { useState } from 'react';
import { GAMES_CATALOG } from '../data/games';
import { GameId } from '../types';
import { soundEngine } from '../utils/audio';
import { GameCardIllustration } from './GameCardIllustration';
import { Gamepad2, Sparkles, Star } from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: GameId) => void;
  rbtMode: boolean;
}

const GRADE_PILLS = [
  { label: 'ALL GAMES', bg: 'bg-[#ffb703]', text: 'text-slate-900', isSpecial: true },
  { label: 'PRE-K', bg: 'bg-[#ff477e]', text: 'text-white' },
  { label: 'GRADE K', bg: 'bg-[#fb8500]', text: 'text-white' },
  { label: 'GRADE 1', bg: 'bg-[#e63946]', text: 'text-white' },
  { label: 'GRADE 2', bg: 'bg-[#219ebc]', text: 'text-white' },
  { label: 'GRADE 3', bg: 'bg-[#8ac926]', text: 'text-slate-900' },
  { label: 'GRADE 4', bg: 'bg-[#7209b7]', text: 'text-white' },
  { label: 'GRADE 5', bg: 'bg-[#f77f00]', text: 'text-white', active: true },
  { label: 'GRADE 6+', bg: 'bg-[#06d6a0]', text: 'text-slate-900' },
];

export const Dashboard = ({ onSelectGame }: DashboardProps) => {
  const [selectedGrade, setSelectedGrade] = useState('GRADE 5');

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#00232d] p-4 md:p-8 select-none">
      {/* ABCya Style Hero Centerpiece */}
      <div className="max-w-6xl mx-auto text-center mb-8 pt-2">
        {/* Curved banner header */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#004e63]/80 border border-[#00c9a7]/30 text-[#00f2c9] text-xs font-black uppercase tracking-widest mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>LEARNING WITH A SMILE</span>
        </div>

        {/* Big Bubbly White Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] mb-2">
          FREE GAMES THIS WEEK
        </h1>
        <p className="text-[#a5d8d8] text-xs md:text-sm font-bold tracking-wide mb-4">
          Tap any game to jump in and play with your avatar!
        </p>

        {/* Yellow Rounded Action Button */}
        <button
          onClick={() => {
            soundEngine.playTap();
            onSelectGame('break-request');
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-[#ffc300] to-[#ffaa00] hover:from-[#ffd000] hover:to-[#ffb700] active:scale-95 text-slate-950 font-black text-sm md:text-base rounded-full shadow-lg shadow-amber-500/30 border-2 border-white/60 transition-transform"
        >
          <Star className="w-4 h-4 fill-slate-950" />
          <span>Play Featured Game!</span>
        </button>
      </div>

      {/* ABCya Style Games Grid (6 Square/Card Tiles) */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
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
                {/* Ribbon Tag (ABCya style Free / New tag) */}
                <div className="absolute top-2 left-2 z-20">
                  <span className={`text-[10px] md:text-[11px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider ${
                    isAvailable ? 'bg-[#8ac926] text-slate-950 border border-white/80' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isAvailable ? 'FREE' : 'SOON'}
                  </span>
                </div>

                {/* Top Illustration Area (70% of card) */}
                <div className="w-full h-32 md:h-36 relative overflow-hidden bg-slate-900">
                  <GameCardIllustration gameId={game.id} />
                </div>

                {/* Bottom Title & Grade Strip (ABCya style) */}
                <div className="p-3 bg-[#003d4c] group-hover:bg-[#00495c] transition-colors flex flex-col justify-between flex-1 border-t border-[#006077]/50">
                  <div>
                    <h3 className="text-white font-black text-xs md:text-sm leading-tight tracking-tight mb-1 group-hover:text-[#52ffde] transition-colors">
                      {game.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#84cece] text-[10px] md:text-[11px] font-bold">
                      {game.category}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#002732] flex items-center justify-center text-[#00e1c1]">
                      <Gamepad2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ABCya Style "BROWSE OUR LIBRARY" Colorful Grade Circles */}
      <div className="max-w-6xl mx-auto pt-4 border-t border-[#004d60]/60">
        <div className="text-center mb-4">
          <h2 className="text-xs md:text-sm font-black text-[#7ed0d0] uppercase tracking-widest">
            BROWSE OUR LIBRARY
          </h2>
        </div>

        {/* Circular Grade Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
          {GRADE_PILLS.map((grade) => {
            const isSelected = selectedGrade === grade.label;
            return (
              <button
                key={grade.label}
                onClick={() => {
                  soundEngine.playTap();
                  setSelectedGrade(grade.label);
                }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center transition-transform active:scale-90 shadow-md ${grade.bg} ${grade.text} ${
                  isSelected
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-[#002f3c] scale-110 shadow-lg'
                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
              >
                <span className="text-[9px] md:text-[10px] font-black uppercase leading-tight text-center px-1">
                  {grade.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
