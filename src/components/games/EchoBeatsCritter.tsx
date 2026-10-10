import React from 'react';

export type VowelType = 'a' | 'e' | 'o';

interface EchoBeatsCritterProps {
  vowel: VowelType;
  isActive: boolean;
  isDancing: boolean;
  isTarget?: boolean;
  onTap?: () => void;
  className?: string;
}

const CRITTER_METADATA: Record<
  VowelType,
  {
    name: string;
    image: string;
    label: string;
    ringGradient: string;
    glowColor: string;
    badgeBg: string;
    badgeTextColor: string;
    tip: string;
  }
> = {
  a: {
    name: 'Bop',
    image: '/characters/echo/critter_a.webp',
    label: 'A!',
    ringGradient: 'from-amber-300 via-yellow-400 to-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    badgeTextColor: 'text-slate-950',
    tip: 'Drop Jaw • Open Wide',
  },
  e: {
    name: 'Gigi',
    image: '/characters/echo/critter_e.webp',
    label: 'E!',
    ringGradient: 'from-cyan-300 via-teal-400 to-cyan-600',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    badgeBg: 'bg-gradient-to-r from-cyan-400 to-teal-500',
    badgeTextColor: 'text-slate-950',
    tip: 'Wide Smile • Show Teeth',
  },
  o: {
    name: 'Ozzo',
    image: '/characters/echo/critter_o.webp',
    label: 'O!',
    ringGradient: 'from-fuchsia-300 via-pink-500 to-purple-600',
    glowColor: 'rgba(217, 70, 239, 0.6)',
    badgeBg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    badgeTextColor: 'text-white',
    tip: 'Round Lips • Trumpet Funnel',
  },
};

export const EchoBeatsCritter: React.FC<EchoBeatsCritterProps> = ({
  vowel,
  isActive,
  isDancing,
  isTarget = false,
  onTap,
  className = '',
}) => {
  const meta = CRITTER_METADATA[vowel];

  return (
    <div
      onClick={onTap}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
        isDancing ? 'animate-bounce' : isActive ? 'scale-105' : 'hover:scale-102'
      } ${className}`}
    >
      {/* Target Spotlight Halo */}
      {isTarget && (
        <div
          className="absolute -inset-4 sm:-inset-6 rounded-full blur-2xl animate-pulse pointer-events-none"
          style={{ backgroundColor: meta.glowColor }}
        ></div>
      )}

      {/* Dynamic Soundwaves when actively singing / modeling */}
      {isActive && (
        <>
          <div
            className="absolute -inset-3 sm:-inset-4 rounded-full border-2 border-white/60 animate-ping pointer-events-none"
            style={{ animationDuration: '1.4s' }}
          ></div>
          <div
            className="absolute -inset-2 sm:-inset-3 rounded-full border-2 border-dashed border-white/40 animate-spin pointer-events-none"
            style={{ animationDuration: '6s' }}
          ></div>
        </>
      )}

      {/* 3D AVATAR CARD CONTAINER */}
      <div
        className={`relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full p-1.5 md:p-2 bg-gradient-to-b ${meta.ringGradient} shadow-2xl transition-all duration-300 ${
          isTarget
            ? 'ring-4 ring-white ring-offset-4 ring-offset-[#1b0033] shadow-[0_0_35px_rgba(255,255,255,0.4)]'
            : 'border-2 border-white/40'
        }`}
      >
        {/* Inner Dark Mask Frame */}
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border-2 border-white/30 shadow-inner">
          <img
            src={meta.image}
            alt={`${meta.name} vocalizing ${vowel.toUpperCase()}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isActive ? 'scale-110' : 'scale-100 hover:scale-105'
            }`}
            loading="eager"
            draggable={false}
          />

          {/* Glossy Glass Highlight Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-full"></div>
        </div>

        {/* Floating Musical Notes when Singing */}
        {isActive && (
          <div className="absolute -top-3 -right-2 text-xl md:text-2xl animate-bounce pointer-events-none select-none drop-shadow-md">
            🎵
          </div>
        )}
      </div>

      {/* VOWEL BADGE & CHARACTER NAME */}
      <div className="mt-3 flex flex-col items-center">
        <div
          className={`px-4 sm:px-6 py-1.5 rounded-full font-black text-sm md:text-base border-2 border-white shadow-xl flex items-center gap-2 uppercase tracking-wider transition-all ${
            meta.badgeBg
          } ${meta.badgeTextColor} ${
            isTarget ? 'ring-2 ring-yellow-300 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''
          }`}
        >
          <span className="text-xl sm:text-2xl font-black leading-none">{vowel.toUpperCase()}</span>
          <span className="text-xs sm:text-sm font-extrabold opacity-90">{meta.label}</span>
        </div>

        <span className="text-white font-black text-xs md:text-sm mt-1 drop-shadow">
          {meta.name}
        </span>

        <span className="text-purple-300/90 font-bold text-[10px] md:text-xs tracking-tight">
          {meta.tip}
        </span>
      </div>
    </div>
  );
};

