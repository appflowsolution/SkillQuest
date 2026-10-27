import type { FC } from 'react';

export type MemorySymbol =
  | 'star'
  | 'planet'
  | 'rocket'
  | 'comet'
  | 'crystal'
  | 'moon'
  | 'galaxy'
  | 'satellite'
  | 'portal'
  | 'asteroid'
  | 'nebula'
  | 'alien';

export interface SymbolDefinition {
  id: MemorySymbol;
  label: string;
}

/**
 * Pool of vault capsules. Twelve distinct symbols so the densest level
 * (10 pairs) never repeats a symbol identity.
 */
export const SYMBOL_POOL: SymbolDefinition[] = [
  { id: 'star', label: 'Star' },
  { id: 'planet', label: 'Planet' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'comet', label: 'Comet' },
  { id: 'crystal', label: 'Crystal' },
  { id: 'moon', label: 'Moon' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'portal', label: 'Portal' },
  { id: 'asteroid', label: 'Asteroid' },
  { id: 'nebula', label: 'Nebula' },
  { id: 'alien', label: 'Alien' },
];

export const SYMBOL_LABELS: Record<MemorySymbol, string> = SYMBOL_POOL.reduce(
  (labels, definition) => {
    labels[definition.id] = definition.label;
    return labels;
  },
  {} as Record<MemorySymbol, string>,
);

interface MemorySymbolIconProps {
  symbol: MemorySymbol;
  className?: string;
}

export const MemorySymbolIcon: FC<MemorySymbolIconProps> = ({
  symbol,
  className = 'w-full h-full',
}) => {
  const common = {
    viewBox: '0 0 64 64',
    className,
    'aria-hidden': true as const,
    focusable: 'false' as const,
  };

  switch (symbol) {
    case 'star':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="mv-grad-star" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          <path
            d="M32 5l8 19.6 21.2.7-16.7 13 5.9 20.4L32 46.2 13.6 58.7l5.9-20.4-16.7-13L24 24.6z"
            fill="url(#mv-grad-star)"
            stroke="#b45309"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'planet':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="mv-grad-planet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="17" fill="url(#mv-grad-planet)" stroke="#1e3a8a" strokeWidth="2" />
          <path d="M17 26h30M15 34h34M20 42h24" stroke="#0c4a6e" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
          <ellipse
            cx="32"
            cy="32"
            rx="29"
            ry="8"
            transform="rotate(-22 32 32)"
            fill="none"
            stroke="#a5f3fc"
            strokeWidth="2.5"
            opacity="0.9"
          />
        </svg>
      );

    case 'rocket':
      return (
        <svg {...common}>
          <path
            d="M32 4c7 6 11 15 11 24l-4 9H25l-4-9c0-9 4-18 11-24z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="24" r="5.5" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
          <path d="M25 34l-9 9 9 1z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
          <path d="M39 34l9 9-9 1z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
          <path d="M28 44h8l-4 13z" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'comet':
      return (
        <svg {...common}>
          <path
            d="M33 27L7 50M30 20L5 32M38 31L15 56"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="44" cy="20" r="12" fill="#fde68a" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="40" cy="17" r="3" fill="#fffbeb" opacity="0.9" />
        </svg>
      );

    case 'crystal':
      return (
        <svg {...common}>
          <path
            d="M32 4l18 18-18 38L14 22z"
            fill="#a78bfa"
            stroke="#6d28d9"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M32 4v56M14 22h36" stroke="#ede9fe" strokeWidth="1.75" opacity="0.75" />
          <path d="M23 13l9 9-9 9z" fill="#ddd6fe" opacity="0.6" />
        </svg>
      );

    case 'moon':
      return (
        <svg {...common}>
          <defs>
            <mask id="mv-mask-moon">
              <rect width="64" height="64" fill="black" />
              <circle cx="30" cy="32" r="21" fill="white" />
              <circle cx="45" cy="25" r="18" fill="black" />
            </mask>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="22"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="2.5"
            mask="url(#mv-mask-moon)"
          />
          <circle cx="21" cy="40" r="3" fill="#cbd5e1" opacity="0.8" />
          <circle cx="26" cy="27" r="2" fill="#cbd5e1" opacity="0.8" />
        </svg>
      );

    case 'galaxy':
      return (
        <svg {...common}>
          <path
            d="M32 32c0-10 13-15 19-6 8 12-3 27-18 27-17 0-27-18-18-32"
            stroke="#e879f9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 32c0 6-8 8-11 3-5-8 3-16 11-16"
            stroke="#f0abfc"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <circle cx="32" cy="32" r="5" fill="#fdf4ff" stroke="#a21caf" strokeWidth="1.5" />
        </svg>
      );

    case 'satellite':
      return (
        <svg {...common}>
          <path d="M32 24v-9" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="10" r="3.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <rect x="22" y="23" width="20" height="18" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          <rect x="4" y="25" width="15" height="14" rx="2" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
          <rect x="45" y="25" width="15" height="14" rx="2" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
          <path d="M19 32h3M42 32h3" stroke="#475569" strokeWidth="2" />
          <path d="M32 41v9" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'portal':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" stroke="#14b8a6" strokeWidth="3" opacity="0.35" fill="none" />
          <circle cx="32" cy="32" r="18" stroke="#2dd4bf" strokeWidth="3" opacity="0.6" fill="none" />
          <circle cx="32" cy="32" r="10" stroke="#5eead4" strokeWidth="3" fill="none" />
          <circle cx="32" cy="32" r="4" fill="#ccfbf1" />
        </svg>
      );

    case 'asteroid':
      return (
        <svg {...common}>
          <path
            d="M14 30l6-14 14-6 16 8 6 14-8 16-16 6-14-8z"
            fill="#a8a29e"
            stroke="#57534e"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="25" cy="26" r="4.5" fill="#78716c" />
          <circle cx="40" cy="38" r="5.5" fill="#78716c" />
          <circle cx="34" cy="18" r="2.5" fill="#78716c" />
          <circle cx="22" cy="44" r="3" fill="#78716c" />
        </svg>
      );

    case 'nebula':
      return (
        <svg {...common}>
          <g opacity="0.9">
            <circle cx="24" cy="30" r="15" fill="#f472b6" opacity="0.5" />
            <circle cx="41" cy="26" r="12" fill="#c084fc" opacity="0.5" />
            <circle cx="36" cy="43" r="13" fill="#38bdf8" opacity="0.45" />
          </g>
          <circle cx="28" cy="20" r="2" fill="#ffffff" />
          <circle cx="47" cy="36" r="1.6" fill="#ffffff" />
          <circle cx="17" cy="43" r="1.4" fill="#ffffff" />
          <circle cx="38" cy="14" r="1.2" fill="#ffffff" />
        </svg>
      );

    case 'alien':
      return (
        <svg {...common}>
          <path d="M21 17l5 8M43 17l-5 8" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="14" r="4" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="44" cy="14" r="4" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <ellipse cx="32" cy="35" rx="18" ry="20" fill="#86efac" stroke="#15803d" strokeWidth="2.5" />
          <ellipse cx="25" cy="32" rx="4.5" ry="6.5" fill="#0f172a" />
          <ellipse cx="39" cy="32" rx="4.5" ry="6.5" fill="#0f172a" />
          <path d="M26 47c4 3 8 3 12 0" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    default:
      return null;
  }
};
