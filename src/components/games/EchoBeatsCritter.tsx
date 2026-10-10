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

export const EchoBeatsCritter: React.FC<EchoBeatsCritterProps> = ({
  vowel,
  isActive,
  isDancing,
  isTarget = false,
  onTap,
  className = '',
}) => {
  return (
    <div
      onClick={onTap}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
        isDancing ? 'animate-bounce' : isActive ? 'scale-105' : 'hover:scale-102'
      } ${className}`}
    >
      {/* Target Spotlight Glow */}
      {isTarget && (
        <div className="absolute -inset-4 bg-gradient-to-t from-yellow-400/30 via-cyan-400/20 to-transparent rounded-full blur-xl animate-pulse pointer-events-none"></div>
      )}

      {/* Singing Sound Waves Aura */}
      {isActive && (
        <div className="absolute -inset-2 rounded-full border-2 border-dashed border-white/50 animate-spin pointer-events-none" style={{ animationDuration: '6s' }}></div>
      )}

      {/* CRITTER VECTOR SVG */}
      {vowel === 'a' && (
        // BOP: The Golden Open-Jaw Critter (Vocal "A")
        <div className="relative w-36 h-40 md:w-44 md:h-48 flex items-center justify-center">
          <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-[0_12px_24px_rgba(245,158,11,0.4)]" fill="none">
            <defs>
              <linearGradient id="bopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <radialGradient id="bopMouthGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </radialGradient>
            </defs>

            {/* Bouncing Star Antennae */}
            <path d="M45,26 Q35,8 25,12" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
            <polygon points="25,6 28,14 36,14 30,19 32,27 25,22 18,27 20,19 14,14 22,14" fill="#fde047" stroke="#ffffff" strokeWidth="1.5" />

            <path d="M75,26 Q85,8 95,12" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
            <polygon points="95,6 98,14 106,14 100,19 102,27 95,22 88,27 90,19 84,14 92,14" fill="#fde047" stroke="#ffffff" strokeWidth="1.5" />

            {/* Cute Hands */}
            <ellipse cx="20" cy="80" rx="9" ry="7" fill="#fbbf24" stroke="#ffffff" strokeWidth="2.5" />
            <ellipse cx="100" cy="80" rx="9" ry="7" fill="#fbbf24" stroke="#ffffff" strokeWidth="2.5" />

            {/* Main Rounded Amber Body */}
            <ellipse cx="60" cy="72" rx="42" ry="46" fill="url(#bopGrad)" stroke="#ffffff" strokeWidth="3.5" />

            {/* Belly Patch */}
            <ellipse cx="60" cy="86" rx="26" ry="24" fill="#fef3c7" opacity="0.9" />

            {/* Big Expressive Eyes */}
            <circle cx="44" cy="50" r="11" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
            <circle cx="46" cy="49" r="6" fill="#451a03" />
            <circle cx="44" cy="47" r="2.5" fill="#ffffff" />

            <circle cx="76" cy="50" r="11" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
            <circle cx="74" cy="49" r="6" fill="#451a03" />
            <circle cx="72" cy="47" r="2.5" fill="#ffffff" />

            {/* Rosy Cheeks */}
            <ellipse cx="32" cy="62" rx="5" ry="3.5" fill="#f43f5e" opacity="0.6" />
            <ellipse cx="88" cy="62" rx="5" ry="3.5" fill="#f43f5e" opacity="0.6" />

            {/* VISEME "A": JAW DROP OPEN MOUTH */}
            {isActive || isDancing ? (
              <g id="bop-singing-mouth" className="animate-pulse-subtle">
                {/* Deep Open Oral Cavity */}
                <path d="M38,62 C38,55 82,55 82,62 C82,92 38,92 38,62 Z" fill="url(#bopMouthGlow)" stroke="#ffffff" strokeWidth="3" />
                {/* Cute Top Teeth */}
                <rect x="52" y="58" width="16" height="5" rx="2" fill="#ffffff" />
                {/* Bouncing Tongue */}
                <path d="M46,84 C46,74 74,74 74,84 Z" fill="#f43f5e" />
                {/* Throat Depth line */}
                <ellipse cx="60" cy="72" rx="8" ry="4" fill="#000000" opacity="0.4" />
              </g>
            ) : (
              // Relaxed Smile
              <path d="M48,68 Q60,78 72,68" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            )}
          </svg>
        </div>
      )}

      {vowel === 'e' && (
        // GIGI: The Electric Cyan Wide-Smile Critter (Vocal "E")
        <div className="relative w-36 h-40 md:w-44 md:h-48 flex items-center justify-center">
          <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,242,201,0.4)]" fill="none">
            <defs>
              <linearGradient id="gigiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
            </defs>

            {/* Speaker Ears */}
            <path d="M26,35 L12,22 L18,48 Z" fill="#0891b2" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="18" cy="34" r="5" fill="#a5f3fc" />

            <path d="M94,35 L108,22 L102,48 Z" fill="#0891b2" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="102" cy="34" r="5" fill="#a5f3fc" />

            {/* Cute Turquoise Body */}
            <rect x="22" y="30" width="76" height="74" rx="36" fill="url(#gigiGrad)" stroke="#ffffff" strokeWidth="3.5" />

            {/* Chest Waveform Decal */}
            <path d="M42,94 L48,88 L54,98 L60,86 L66,98 L72,90 L78,94" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Big Starry Eyes */}
            <circle cx="42" cy="50" r="11" fill="#ffffff" stroke="#155e75" strokeWidth="2" />
            <circle cx="44" cy="49" r="6.5" fill="#164e63" />
            <polygon points="44,46 45,49 48,49 46,51 47,54 44,52 41,54 42,51 40,49 43,49" fill="#ffffff" />

            <circle cx="78" cy="50" r="11" fill="#ffffff" stroke="#155e75" strokeWidth="2" />
            <circle cx="76" cy="49" r="6.5" fill="#164e63" />
            <polygon points="76,46 77,49 80,49 78,51 79,54 76,52 73,54 74,51 72,49 75,49" fill="#ffffff" />

            {/* Rosy Beaming Cheeks */}
            <ellipse cx="28" cy="64" rx="6" ry="4" fill="#f43f5e" opacity="0.65" />
            <ellipse cx="92" cy="64" rx="6" ry="4" fill="#f43f5e" opacity="0.65" />

            {/* VISEME "E": WIDE STRETCH SMILE SHOWING TEETH */}
            {isActive || isDancing ? (
              <g id="gigi-singing-mouth" className="animate-pulse-subtle">
                {/* Horizontal Wide Smile Cavity */}
                <path d="M22,64 Q60,54 98,64 Q98,78 60,78 Q22,78 22,64 Z" fill="#991b1b" stroke="#ffffff" strokeWidth="3" />
                {/* Big Grid of White Teeth (Vocal E) */}
                <path d="M26,63 Q60,57 94,63 L94,69 Q60,67 26,69 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M26,73 Q60,71 94,73 L94,77 Q60,78 26,77 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              </g>
            ) : (
              // Little Closed Smile
              <path d="M46,66 Q60,74 74,66" stroke="#155e75" strokeWidth="3.5" strokeLinecap="round" />
            )}
          </svg>
        </div>
      )}

      {vowel === 'o' && (
        // OZZO: The Neon Purple DJ Critter with Round Horn Lips (Vocal "O")
        <div className="relative w-36 h-40 md:w-44 md:h-48 flex items-center justify-center">
          <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-[0_12px_24px_rgba(236,72,153,0.4)]" fill="none">
            <defs>
              <linearGradient id="ozzoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>
            </defs>

            {/* DJ Headphones */}
            <path d="M22,50 C22,18 98,18 98,50" stroke="#1e1b4b" strokeWidth="6" strokeLinecap="round" />
            <rect x="12" y="44" width="12" height="24" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <rect x="96" y="44" width="12" height="24" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

            {/* Main Round Magenta Body */}
            <ellipse cx="60" cy="72" rx="42" ry="44" fill="url(#ozzoGrad)" stroke="#ffffff" strokeWidth="3.5" />

            {/* Cool Sleepy Eyes */}
            <circle cx="44" cy="48" r="9" fill="#ffffff" stroke="#831843" strokeWidth="2" />
            <circle cx="45" cy="49" r="5" fill="#500724" />
            <circle cx="43" cy="47" r="1.5" fill="#ffffff" />
            <path d="M34,44 Q44,40 54,44" stroke="#831843" strokeWidth="3" strokeLinecap="round" />

            <circle cx="76" cy="48" r="9" fill="#ffffff" stroke="#831843" strokeWidth="2" />
            <circle cx="75" cy="49" r="5" fill="#500724" />
            <circle cx="73" cy="47" r="1.5" fill="#ffffff" />
            <path d="M66,44 Q76,40 86,44" stroke="#831843" strokeWidth="3" strokeLinecap="round" />

            {/* VISEME "O": ROUND PROTRUDING HORN LIPS */}
            {isActive || isDancing ? (
              <g id="ozzo-singing-mouth" className="animate-pulse-subtle">
                {/* Outer Sound Pulse Ring */}
                <circle cx="60" cy="68" r="22" stroke="#fbcfe8" strokeWidth="2.5" strokeDasharray="4 2" />
                {/* Rounded Horn Lips */}
                <ellipse cx="60" cy="68" rx="16" ry="18" fill="#fda4af" stroke="#ffffff" strokeWidth="3.5" />
                {/* Deep Round Acoustic Cavity */}
                <ellipse cx="60" cy="68" rx="9" ry="11" fill="#450a0a" />
              </g>
            ) : (
              // Small Neutral O mouth
              <circle cx="60" cy="68" r="6" fill="#fda4af" stroke="#831843" strokeWidth="2.5" />
            )}
          </svg>
        </div>
      )}

      {/* Vowel Badge & Character Name */}
      <div className="mt-2 flex flex-col items-center">
        <div
          className={`px-5 py-1.5 rounded-full font-black text-sm md:text-base border-2 shadow-lg flex items-center gap-1.5 uppercase tracking-wider transition-all ${
            vowel === 'a'
              ? 'bg-amber-400 text-slate-950 border-white'
              : vowel === 'e'
              ? 'bg-cyan-400 text-slate-950 border-white'
              : 'bg-fuchsia-500 text-white border-white'
          }`}
        >
          <span className="text-xl md:text-2xl font-black">{vowel.toUpperCase()}</span>
          <span className="text-xs opacity-80">
            {vowel === 'a' ? 'A!' : vowel === 'e' ? 'E!' : 'O!'}
          </span>
        </div>
        <span className="text-white/80 font-bold text-xs mt-0.5">
          {vowel === 'a' ? 'Bop' : vowel === 'e' ? 'Gigi' : 'Ozzo'}
        </span>
      </div>
    </div>
  );
};
