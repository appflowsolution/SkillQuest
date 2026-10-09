import type { FC } from 'react';

export type CosmicItemType = 'gem' | 'planet' | 'rocket' | 'constellation' | 'moon';

interface CosmicItemIconProps {
  type: CosmicItemType;
  colorTheme?: string;
  className?: string;
}

export const CosmicItemIcon: FC<CosmicItemIconProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'gem':
      // Sparkling Multi-Faceted Cosmic Crystal
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gemGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48ffdf" />
              <stop offset="50%" stopColor="#00c9a7" />
              <stop offset="100%" stopColor="#007765" />
            </linearGradient>
            <linearGradient id="gemGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="gemGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          {/* Main Crystal Diamond */}
          <polygon points="50,12 82,36 68,88 32,88 18,36" fill="url(#gemGrad1)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
          {/* Top Facet */}
          <polygon points="50,12 82,36 50,48 18,36" fill="url(#gemGrad2)" opacity="0.9" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Left Lower Facet */}
          <polygon points="18,36 50,48 32,88" fill="#005a4d" opacity="0.8" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Right Lower Facet */}
          <polygon points="82,36 50,48 68,88" fill="#00a890" opacity="0.8" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Center Table */}
          <polygon points="50,48 32,88 68,88" fill="url(#gemGrad1)" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Secondary crystal shard */}
          <polygon points="82,50 96,62 88,82 76,72" fill="url(#gemGrad3)" stroke="#ffffff" strokeWidth="2" />
          {/* Glint Sparkle */}
          <path d="M42,24 L46,28 L42,32 L38,28 Z" fill="#ffffff" />
          <circle cx="50" cy="18" r="3" fill="#ffffff" />
        </svg>
      );

    case 'planet':
      // Ringed Planet with Craters & Stardust Aura
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="planetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* Back half of orbital ring */}
          <ellipse cx="50" cy="52" rx="44" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="6" transform="rotate(-20 50 52)" opacity="0.5" />
          {/* Planet Body */}
          <circle cx="50" cy="50" r="30" fill="url(#planetGrad)" stroke="#ffffff" strokeWidth="3" />
          {/* Planet Surface Bands */}
          <path d="M22,46 Q50,60 78,46" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M26,56 Q50,70 74,56" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          {/* Cute Planet Face */}
          <circle cx="43" cy="48" r="3" fill="#ffffff" />
          <circle cx="57" cy="48" r="3" fill="#ffffff" />
          <path d="M47,54 Q50,58 53,54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="38" cy="52" r="2.5" fill="#f472b6" opacity="0.8" />
          <circle cx="62" cy="52" r="2.5" fill="#f472b6" opacity="0.8" />
          {/* Front half of orbital ring */}
          <path d="M10,64 C12,50 88,24 90,40" fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );

    case 'rocket':
      // Cartoon Space Rocket with Fiery Booster
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Flame Jets */}
          <path d="M43,76 Q50,96 50,98 Q50,96 57,76 Z" fill="url(#flameGrad)" />
          <path d="M46,76 Q50,88 50,90 Q50,88 54,76 Z" fill="#fef08a" />
          {/* Left Wing Fin */}
          <path d="M34,56 L18,72 L32,74 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Right Wing Fin */}
          <path d="M66,56 L82,72 L68,74 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          {/* Main Rocket Fuselage */}
          <path d="M50,14 C36,32 34,60 34,74 L66,74 C66,60 64,32 50,14 Z" fill="url(#rocketBody)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
          {/* Rocket Nose Cone */}
          <path d="M50,14 C44,24 40,32 38,36 L62,36 C60,32 56,24 50,14 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          {/* Porthole Window */}
          <circle cx="50" cy="48" r="10" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
          <circle cx="50" cy="48" r="7" fill="#0ea5e9" />
          {/* Window Glint */}
          <path d="M46,44 Q49,42 53,44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'constellation':
      // Smiling Glowing Star with Constellation Nodes
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* Constellation Link Lines */}
          <line x1="20" y1="24" x2="50" y2="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="80" y1="26" x2="50" y2="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="18" y1="78" x2="34" y2="70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="82" y1="76" x2="66" y2="70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          {/* Star Nodes */}
          <circle cx="20" cy="24" r="3" fill="#67e8f9" />
          <circle cx="80" cy="26" r="3" fill="#67e8f9" />
          <circle cx="18" cy="78" r="3" fill="#67e8f9" />
          <circle cx="82" cy="76" r="3" fill="#67e8f9" />
          {/* Big Center Golden Star */}
          <polygon 
            points="50,14 60,36 84,38 66,54 72,78 50,64 28,78 34,54 16,38 40,36" 
            fill="url(#starGrad)" 
            stroke="#ffffff" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />
          {/* Cute Face */}
          <circle cx="44" cy="46" r="3" fill="#78350f" />
          <circle cx="56" cy="46" r="3" fill="#78350f" />
          <path d="M47,52 Q50,56 53,52" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="39" cy="49" r="2" fill="#f43f5e" opacity="0.7" />
          <circle cx="61" cy="49" r="2" fill="#f43f5e" opacity="0.7" />
          {/* Glint Sparkle */}
          <circle cx="50" cy="24" r="2" fill="#ffffff" />
        </svg>
      );

    case 'moon':
      // Cozy Smiling Crescent Moon in Stardust
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Glow Halo */}
          <circle cx="50" cy="50" r="42" fill="#fef08a" opacity="0.1" />
          {/* Crescent Moon Path */}
          <path 
            d="M58,16 C76,28 78,58 64,78 C54,92 34,90 24,84 C42,84 62,68 60,46 C58,30 46,20 38,18 C44,16 52,14 58,16 Z" 
            fill="url(#moonGrad)" 
            stroke="#ffffff" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />
          {/* Sleeping / Happy Closed Eyes */}
          <path d="M52,44 Q56,40 60,44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rosy Cheek */}
          <circle cx="52" cy="52" r="3" fill="#f43f5e" opacity="0.7" />
          {/* Little Floating Star on the Tip */}
          <polygon points="32,22 35,27 40,28 36,31 37,36 32,33 27,36 28,31 24,28 29,27" fill="#ffffff" />
        </svg>
      );

    default:
      return null;
  }
};
