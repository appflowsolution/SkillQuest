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
      // Chroma Critters Lab: Fluffy layered critter + hovering Help Drone
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#003847] via-[#002f3c] to-[#001f28] flex items-center justify-center p-3">
          {/* Subtle background stencil grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#00f2c9_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          
          <div className="relative z-10 flex items-center justify-center gap-3">
            {/* Chroma Critter with multi-color paint layers */}
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-3 border-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                {/* 3 color layers */}
                <div className="w-full h-[33%] bg-pink-500" />
                <div className="w-full h-[34%] bg-emerald-400" />
                <div className="w-full h-[33%] bg-purple-600" />
                
                {/* Cute eyes & smile overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-white" />
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-white" />
                </div>
              </div>
              <div className="mt-1 px-2 py-0.5 bg-emerald-500/90 text-white font-black text-[9px] rounded-full border border-white/40 shadow">
                CRITTER
              </div>
            </div>

            {/* Floating Help Drone */}
            <div className="relative flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s' }}>
              <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-cyan-400 shadow-md flex items-center justify-center relative">
                {/* SOS light */}
                <div className="absolute -top-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                {/* Screen */}
                <div className="w-6 h-4 bg-slate-900 rounded-md flex items-center justify-center gap-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
              </div>
              <div className="mt-1 px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full border border-white shadow">
                HELP BOT
              </div>
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

    case 'cosmic-fuel':
      // Cosmic Fuel Lab: Rocket engine, reactor fuel tanks, +/- pressure gauges
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#0b2545] via-[#13315c] to-[#134074] flex items-center justify-center">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/25 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/25 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 border-2 border-white/80 shadow-lg shadow-sky-500/50 flex items-center justify-center relative">
              <span className="text-2xl drop-shadow">🚀</span>
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black border border-white">
                +10
              </span>
              <span className="absolute -bottom-2 -left-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black border border-white">
                -5
              </span>
            </div>
            <div className="mt-2 flex gap-1.5 items-center bg-black/40 px-2 py-0.5 rounded-full border border-sky-400/40">
              <span className="text-sky-300 font-mono text-[10px] font-black">FUEL: 45 / 45</span>
            </div>
          </div>
        </div>
      );

    case 'meteor-array':
      // Meteor Array Blaster: Grid of asteroids with geometric target box
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#2e1065] to-[#3b0764] flex items-center justify-center">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/25 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-fuchsia-500/25 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            {/* 3x4 Asteroid Grid */}
            <div className="p-2 rounded-xl bg-black/50 border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/30 flex flex-col gap-1">
              <div className="flex gap-1.5 text-xs">
                <span>☄️</span><span>☄️</span><span>☄️</span><span>☄️</span>
              </div>
              <div className="flex gap-1.5 text-xs">
                <span>☄️</span><span>☄️</span><span>☄️</span><span>☄️</span>
              </div>
              <div className="flex gap-1.5 text-xs">
                <span>☄️</span><span>☄️</span><span>☄️</span><span>☄️</span>
              </div>
            </div>
            <div className="mt-1.5 flex gap-1 items-center bg-indigo-900/80 px-2 py-0.5 rounded-md border border-cyan-300/40">
              <span className="text-cyan-200 font-mono text-[10.5px] font-black">3 × 4 = 12</span>
            </div>
          </div>
        </div>
      );

    case 'number-forge':
      // Number Forge Alchemist: Cauldron with floating operation runes
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#18002e] via-[#31005c] to-[#120024] flex items-center justify-center">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/25 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/25 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 border-2 border-white/80 shadow-lg shadow-purple-500/50 flex items-center justify-center relative animate-pulse">
              <span className="text-2xl drop-shadow">🔮</span>
            </div>
            <div className="mt-2 flex gap-1 items-center">
              <span className="w-5 h-5 rounded-md bg-violet-700/90 text-white font-mono text-[10px] font-black flex items-center justify-center border border-violet-400/50">
                4
              </span>
              <span className="text-amber-300 font-black text-xs">×</span>
              <span className="w-5 h-5 rounded-md bg-fuchsia-700/90 text-white font-mono text-[10px] font-black flex items-center justify-center border border-fuchsia-400/50">
                6
              </span>
              <span className="text-emerald-400 font-black text-xs">=</span>
              <span className="px-1.5 h-5 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center border border-white">
                24
              </span>
            </div>
          </div>
        </div>
      );

    case 'memory-vault':
      // Nebula Memory Vault: Sealed vault door with flipping capsule pairs
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#042f2e] via-[#0f3d3a] to-[#021b1b] flex items-center justify-center">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-400/25 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/25 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-black/40 border-2 border-teal-400/60 shadow-lg shadow-teal-500/30">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-teal-400 to-cyan-300 border border-white/70 flex items-center justify-center text-lg">
                ✦
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#01201f] border border-teal-400/40 flex items-center justify-center text-teal-300/50 text-base font-black">
                ?
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#01201f] border border-teal-400/40 flex items-center justify-center text-teal-300/50 text-base font-black">
                ?
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 border border-white/70 flex items-center justify-center text-lg">
                ✦
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-200/90 bg-black/50 px-2 py-0.5 rounded-full border border-teal-400/40">
                10 pairs
              </span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const VectorGameIllustration = GameCardIllustration;
