import type { FC } from 'react';

interface GameCardIllustrationProps {
  gameId: string;
}

export const GameCardIllustration: FC<GameCardIllustrationProps> = ({ gameId }) => {
  switch (gameId) {
    case 'break-request':
      // Cosmic Break Quest: Space portal, glowing gems, pause energy orb
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
          {/* Cosmic nebulas */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/30 rounded-full blur-2xl"></div>
          
          {/* Space Portal Ring */}
          <div className="w-28 h-28 rounded-full border-4 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '20s' }}></div>
          
          {/* Floating Gems */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center Pause Gem */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50 flex items-center justify-center border-2 border-white/60 transform rotate-12 hover:rotate-0 transition-transform">
              <div className="flex gap-1.5">
                <div className="w-2 h-6 bg-white rounded-full shadow-sm"></div>
                <div className="w-2 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            
            {/* Orbiting small crystals */}
            <div className="absolute top-4 left-6 w-7 h-7 rounded-lg bg-cyan-400 rotate-45 shadow-md shadow-cyan-400/50 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute bottom-5 right-7 w-6 h-6 rounded-lg bg-pink-400 rotate-12 shadow-md shadow-pink-400/50 animate-pulse"></div>
            <div className="absolute top-6 right-8 w-5 h-5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"></div>
          </div>
        </div>
      );

    case 'more-time':
      // Time Warp Explorer: Golden portal, glowing hourglass, speed lines
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-teal-900 via-cyan-900 to-slate-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
          
          {/* Glowing Clock / Hourglass Graphic */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-4 border-white/80 shadow-xl shadow-cyan-500/40 flex items-center justify-center">
            <svg className="w-10 h-10 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full shadow">
              +1m
            </div>
          </div>
          
          {/* Speed warp circles */}
          <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30"></div>
          <div className="absolute w-48 h-48 rounded-full border border-cyan-300/15"></div>
        </div>
      );

    case 'turn-taking':
      // Co-Op Star Tower: 2-player colorful characters / blocks
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center">
          <div className="relative z-10 flex items-end gap-3">
            {/* Player 1 Block character */}
            <div className="w-14 h-16 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-2xl border-2 border-white shadow-lg flex flex-col items-center justify-center relative">
              <div className="flex gap-2 mb-1">
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              </div>
              <div className="w-3 h-1 bg-slate-900 rounded-full"></div>
              <span className="absolute -bottom-2 text-[9px] font-black bg-white text-emerald-700 px-1.5 rounded-full shadow">P1</span>
            </div>

            {/* Middle Trophy / Star */}
            <div className="w-8 h-8 bg-yellow-400 rotate-45 rounded-md border-2 border-white shadow-md flex items-center justify-center mb-6">
              <span className="text-white text-xs font-black">★</span>
            </div>

            {/* Player 2 Block character */}
            <div className="w-14 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl border-2 border-white shadow-lg flex flex-col items-center justify-center relative">
              <div className="flex gap-2 mb-1">
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              </div>
              <div className="w-3 h-1 bg-slate-900 rounded-full"></div>
              <span className="absolute -bottom-2 text-[9px] font-black bg-white text-blue-700 px-1.5 rounded-full shadow">P2</span>
            </div>
          </div>
        </div>
      );

    case 'aac-trainer':
      // Touch AAC Trainer: Grid runes, magic glowing tiles
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-violet-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-purple-500/80 border-2 border-purple-300 shadow-md flex items-center justify-center text-lg">
              🍎
            </div>
            <div className="w-11 h-11 rounded-xl bg-pink-500/80 border-2 border-white shadow-lg shadow-pink-500/40 flex items-center justify-center text-lg scale-105 ring-2 ring-yellow-400">
              🚀
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/80 border-2 border-indigo-300 shadow-md flex items-center justify-center text-lg">
              ⭐
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/80 border-2 border-cyan-300 shadow-md flex items-center justify-center text-lg">
              🎮
            </div>
          </div>
          {/* Glowing hand icon */}
          <div className="absolute bottom-2 right-4 text-2xl z-20 animate-bounce">
            👆
          </div>
        </div>
      );

    case 'request-help':
      // Ask the Helper: Robot assistant, lifebuoy, magic helper
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-rose-900 via-pink-900 to-slate-900 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center">
            {/* Robot Helper Head */}
            <div className="w-16 h-14 bg-gradient-to-b from-slate-100 to-slate-300 rounded-2xl border-3 border-white shadow-xl flex flex-col items-center justify-center relative">
              {/* Antenna */}
              <div className="absolute -top-3 w-1.5 h-3 bg-rose-500"></div>
              <div className="absolute -top-4 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-ping"></div>
              {/* Screen eyes */}
              <div className="w-11 h-6 bg-slate-900 rounded-lg flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></div>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></div>
              </div>
            </div>
            <div className="mt-1 px-2.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full border border-white shadow">
              SOS HELPER
            </div>
          </div>
        </div>
      );

    case 'echoic-lab':
      // Sound Lab: DJ Headphones, soundwaves, musical notes
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-amber-900 via-orange-900 to-slate-900 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border-3 border-white shadow-xl flex items-center justify-center relative">
              <span className="text-2xl">🎙️</span>
              {/* Soundwaves */}
              <div className="absolute -left-3 flex gap-0.5 items-center">
                <div className="w-1 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="w-1 h-6 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="absolute -right-3 flex gap-0.5 items-center">
                <div className="w-1 h-6 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-3 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="text-white text-xs font-black bg-amber-600/80 px-2 py-0.5 rounded-md">"A"</span>
              <span className="text-white text-xs font-black bg-orange-600/80 px-2 py-0.5 rounded-md">"O"</span>
              <span className="text-white text-xs font-black bg-yellow-600/80 px-2 py-0.5 rounded-md">"E"</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const VectorGameIllustration = GameCardIllustration;
