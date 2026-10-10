import React from 'react';

export type AacSymbolId = 
  | 'go'
  | 'play'
  | 'open'
  | 'look'
  | 'help'
  | 'stop'
  | 'want'
  | 'more'
  | 'please'
  | 'star'
  | 'crystal'
  | 'bridge'
  | 'gate';

export interface AacSymbolData {
  id: AacSymbolId;
  label: string;
  category: 'verb' | 'pronoun' | 'modifier' | 'noun' | 'social';
  bgColor: string;
  borderColor: string;
  textColor: string;
  audioSpeech: string;
}

export const AAC_SYMBOLS_MAP: Record<AacSymbolId, AacSymbolData> = {
  want: {
    id: 'want',
    label: 'WANT',
    category: 'verb',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    audioSpeech: 'Want',
  },
  go: {
    id: 'go',
    label: 'GO',
    category: 'verb',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    audioSpeech: 'Go',
  },
  open: {
    id: 'open',
    label: 'OPEN',
    category: 'verb',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    audioSpeech: 'Open',
  },
  play: {
    id: 'play',
    label: 'PLAY',
    category: 'verb',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    audioSpeech: 'Play',
  },
  look: {
    id: 'look',
    label: 'LOOK',
    category: 'verb',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    audioSpeech: 'Look',
  },
  help: {
    id: 'help',
    label: 'HELP',
    category: 'social',
    bgColor: 'bg-rose-950/80',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-300',
    audioSpeech: 'Help',
  },
  stop: {
    id: 'stop',
    label: 'STOP',
    category: 'social',
    bgColor: 'bg-rose-950/80',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-300',
    audioSpeech: 'Stop',
  },
  more: {
    id: 'more',
    label: 'MORE',
    category: 'modifier',
    bgColor: 'bg-blue-950/80',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
    audioSpeech: 'More',
  },
  please: {
    id: 'please',
    label: 'PLEASE',
    category: 'modifier',
    bgColor: 'bg-indigo-950/80',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-300',
    audioSpeech: 'Please',
  },
  star: {
    id: 'star',
    label: 'STAR',
    category: 'noun',
    bgColor: 'bg-amber-950/80',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-300',
    audioSpeech: 'Star',
  },
  crystal: {
    id: 'crystal',
    label: 'CRYSTAL',
    category: 'noun',
    bgColor: 'bg-cyan-950/80',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300',
    audioSpeech: 'Crystal',
  },
  bridge: {
    id: 'bridge',
    label: 'BRIDGE',
    category: 'noun',
    bgColor: 'bg-amber-950/80',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-300',
    audioSpeech: 'Bridge',
  },
  gate: {
    id: 'gate',
    label: 'GATE',
    category: 'noun',
    bgColor: 'bg-amber-950/80',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-300',
    audioSpeech: 'Gate',
  },
};

interface AacIconGlyphProps {
  symbolId: AacSymbolId;
  size?: number | string;
  className?: string;
}

export const AacIconGlyph: React.FC<AacIconGlyphProps> = ({ symbolId, size = 48, className = '' }) => {
  switch (symbolId) {
    case 'want':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Two cupped hands reaching forward in AAC want/reach gesture */}
          <path d="M12 44C16 48 24 50 32 50C40 50 48 48 52 44" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 34L26 42M48 34L38 42" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="24" r="10" fill="#22c55e" opacity="0.3" stroke="#4ade80" strokeWidth="3" />
          <path d="M28 24L32 20L36 24M32 20V28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'go':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Dynamic forward green arrow on running shoes / traffic light */}
          <circle cx="32" cy="32" r="26" fill="#15803d" opacity="0.3" stroke="#4ade80" strokeWidth="3" />
          <path d="M20 32H44M44 32L34 22M44 32L34 42" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="32" r="3" fill="#ffffff" />
        </svg>
      );

    case 'open':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Open gate / door revealing inner light */}
          <rect x="14" y="14" width="36" height="40" rx="4" stroke="#4ade80" strokeWidth="3.5" />
          <path d="M20 18L38 14V50L20 46V18Z" fill="#15803d" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="34" cy="32" r="2.5" fill="#facc15" />
          <path d="M42 28L48 26M42 32L50 32M42 36L48 38" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'play':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Play gamepad / puzzle triangle */}
          <rect x="12" y="20" width="40" height="26" rx="10" fill="#15803d" opacity="0.3" stroke="#4ade80" strokeWidth="3.5" />
          <path d="M22 28V38M17 33H27" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="43" cy="29" r="3" fill="#facc15" />
          <circle cx="37" cy="35" r="3" fill="#38bdf8" />
        </svg>
      );

    case 'look':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Sparkling eye / telescope lens */}
          <path d="M8 32C14 20 50 20 56 32C50 44 14 44 8 32Z" stroke="#4ade80" strokeWidth="3.5" fill="#14532d" opacity="0.4" />
          <circle cx="32" cy="32" r="10" stroke="#ffffff" strokeWidth="3" fill="#002b36" />
          <circle cx="32" cy="32" r="5" fill="#38bdf8" />
          <circle cx="34" cy="30" r="2" fill="#ffffff" />
        </svg>
      );

    case 'help':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Lifebuoy ring with helping reach */}
          <circle cx="32" cy="32" r="24" stroke="#fb7185" strokeWidth="4" fill="#881337" opacity="0.3" />
          <circle cx="32" cy="32" r="12" stroke="#ffffff" strokeWidth="3" />
          <path d="M32 8V20M32 44V56M8 32H20M44 32H56" stroke="#fb7185" strokeWidth="4" />
          <path d="M26 28L32 24L38 28M32 24V38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'stop':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Octagon stop sign with outstretched palm */}
          <polygon points="20,10 44,10 54,20 54,44 44,54 20,54 10,44 10,20" fill="#9f1239" stroke="#f43f5e" strokeWidth="3.5" />
          {/* Outstretched palm hand */}
          <path d="M24 34V24M29 34V20M34 34V20M39 34V23M43 34V30" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 34C24 42 43 42 43 34" fill="#ffffff" />
        </svg>
      );

    case 'more':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Plus sign with multiplying stars */}
          <circle cx="32" cy="32" r="24" fill="#1e3a8a" opacity="0.3" stroke="#60a5fa" strokeWidth="3" />
          <path d="M32 16V48M16 32H48" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="3" fill="#facc15" />
          <circle cx="44" cy="44" r="3" fill="#facc15" />
        </svg>
      );

    case 'please':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Heart star with polite gentle sparkle */}
          <circle cx="32" cy="32" r="24" fill="#312e81" opacity="0.3" stroke="#818cf8" strokeWidth="3" />
          <path d="M32 16L35 26L45 28L37 35L39 46L32 40L25 46L27 35L19 28L29 26Z" fill="#a5b4fc" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="32" cy="31" r="3" fill="#facc15" />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Radiant 5-point star */}
          <path d="M32 10L37 24H52L40 33L44 48L32 39L20 48L24 33L12 24H27Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="29" r="4" fill="#ffffff" />
        </svg>
      );

    case 'crystal':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Faceted sparkling crystal gem */}
          <polygon points="32,8 50,22 42,54 22,54 14,22" fill="#0891b2" stroke="#22d3ee" strokeWidth="3" />
          <polygon points="32,8 42,22 32,54 22,22" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
          <circle cx="38" cy="18" r="2.5" fill="#ffffff" />
        </svg>
      );

    case 'bridge':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Glowing arch stone bridge connecting islands */}
          <path d="M8 44C16 30 48 30 56 44" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <path d="M8 48H56" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 3" />
          <path d="M20 44V36M32 44V32M44 44V36" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="32" cy="22" r="3" fill="#38bdf8" />
        </svg>
      );

    case 'gate':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
          {/* Stone pillars temple archway */}
          <rect x="12" y="16" width="10" height="38" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
          <rect x="42" y="16" width="10" height="38" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M8 16H56V22H8V16Z" fill="#92400e" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="32" cy="12" r="4" fill="#38bdf8" />
          <path d="M24 30L32 26L40 30" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
};
