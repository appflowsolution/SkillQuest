import { useState } from 'react';
import { Volume2, VolumeX, Search, Gamepad2, ArrowLeft, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentView: 'dashboard' | 'game';
  activeGameTitle?: string;
  onBackToDashboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  rbtMode: boolean;
  onToggleRbtMode: () => void;
}

export const Header = ({
  currentView,
  activeGameTitle,
  onBackToDashboard,
  isMuted,
  onToggleMute,
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="h-16 md:h-18 bg-[#00d2b4] border-b-4 border-[#00b59b] px-4 md:px-8 flex items-center justify-between shrink-0 shadow-md z-30 select-none">
      {/* Left: Logo or Back Button */}
      <div className="flex items-center gap-4">
        {currentView === 'game' ? (
          <button
            onClick={() => {
              soundEngine.playTap();
              onBackToDashboard();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 active:scale-95 text-[#006f60] rounded-full font-black text-sm md:text-base transition-all border-2 border-white/60 shadow-md"
          >
            <ArrowLeft className="w-5 h-5 text-[#00a890]" />
            <span>Mission Hub</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] flex items-center gap-1">
                <span className="bg-[#ff477e] text-white px-2 py-0.5 rounded-xl rotate-[-3deg] shadow-sm">Skill</span>
                <span className="bg-[#ffb703] text-slate-900 px-2 py-0.5 rounded-xl rotate-[3deg] shadow-sm">Quest</span>
              </span>
            </div>
          </div>
        )}

        {currentView === 'game' && activeGameTitle && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l-2 border-white/40 text-white">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-base font-black tracking-tight drop-shadow">{activeGameTitle}</span>
          </div>
        )}
      </div>

      {/* Middle: Pill Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs md:text-sm font-semibold rounded-full pl-9 pr-4 py-2 border-2 border-transparent focus:border-[#008f7a] focus:outline-none shadow-inner"
          />
          <Search className="w-4 h-4 text-[#00a890] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Right: Player Badge & Audio Toggle */}
      <div className="flex items-center gap-3">
        {/* Player 1 Badge Pill */}
        <div className="flex items-center gap-1.5 bg-[#009b84] text-white px-3.5 py-1.5 rounded-full border border-white/30 text-xs font-black shadow-inner">
          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span>HERO ZONE</span>
        </div>

        {/* Audio Mute Button */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) soundEngine.playTap();
          }}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 border-2 border-white/80 flex items-center justify-center text-[#007f6e] transition-all shadow-sm"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-rose-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#00a890]" />
          )}
        </button>
      </div>
    </header>
  );
};
