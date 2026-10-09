import type { FC } from 'react';

export type TimeItemType = 'hourglass' | 'pocket-watch' | 'gear' | 'compass' | 'chronosphere';

interface TimeItemIconProps {
  type: TimeItemType;
  className?: string;
}

export const TimeItemIcon: FC<TimeItemIconProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'hourglass':
      // Antique Brass & Crystal Hourglass with Golden Glowing Sand
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Top Brass Plate */}
          <rect x="22" y="10" width="56" height="8" rx="4" fill="url(#brassGrad)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="50" cy="14" r="2.5" fill="#ffffff" />

          {/* Bottom Brass Plate */}
          <rect x="22" y="82" width="56" height="8" rx="4" fill="url(#brassGrad)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="50" cy="86" r="2.5" fill="#ffffff" />

          {/* Brass Side Pillars */}
          <line x1="26" y1="18" x2="26" y2="82" stroke="url(#brassGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="74" y1="18" x2="74" y2="82" stroke="url(#brassGrad)" strokeWidth="4" strokeLinecap="round" />

          {/* Glass Bulbs Outline */}
          <path
            d="M30,18 C30,38 46,46 48,50 C46,54 30,62 30,82 L70,82 C70,62 54,54 52,50 C54,46 70,38 70,18 Z"
            fill="#0ea5e9"
            fillOpacity="0.25"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Top Sand Bulb */}
          <path d="M34,22 C34,34 46,42 50,46 C54,42 66,34 66,22 Z" fill="url(#sandGrad)" />

          {/* Falling Sand Stream */}
          <line x1="50" y1="46" x2="50" y2="76" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="3 2" />

          {/* Bottom Sand Mound */}
          <path d="M34,80 C36,66 64,66 66,80 Z" fill="url(#sandGrad)" />

          {/* Glass Highlights */}
          <path d="M34,24 Q36,36 46,44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M34,76 Q36,64 46,56" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Sparkle Glint */}
          <circle cx="48" cy="24" r="2" fill="#ffffff" />
          <circle cx="53" cy="74" r="2" fill="#ffffff" />
        </svg>
      );

    case 'pocket-watch':
      // Antique Gold Pocket Watch with Clock Face & Hands
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="watchGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <radialGradient id="dialFace" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </radialGradient>
          </defs>

          {/* Top Ring Loop & Winding Stem */}
          <circle cx="50" cy="11" r="7" stroke="url(#watchGold)" strokeWidth="3.5" fill="none" />
          <rect x="47" y="16" width="6" height="5" rx="2" fill="url(#watchGold)" stroke="#ffffff" strokeWidth="1" />

          {/* Outer Watch Case */}
          <circle cx="50" cy="55" r="38" fill="url(#watchGold)" stroke="#ffffff" strokeWidth="3" />
          <circle cx="50" cy="55" r="33" fill="#78350f" opacity="0.3" />

          {/* Dial Face */}
          <circle cx="50" cy="55" r="30" fill="url(#dialFace)" stroke="#d97706" strokeWidth="1.5" />

          {/* Hour Markers (12, 3, 6, 9) */}
          <line x1="50" y1="28" x2="50" y2="33" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <line x1="77" y1="55" x2="72" y2="55" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="82" x2="50" y2="77" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <line x1="23" y1="55" x2="28" y2="55" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

          {/* Minor Tick Marks */}
          <circle cx="63" cy="33" r="1.5" fill="#92400e" />
          <circle cx="73" cy="43" r="1.5" fill="#92400e" />
          <circle cx="73" cy="67" r="1.5" fill="#92400e" />
          <circle cx="63" cy="77" r="1.5" fill="#92400e" />
          <circle cx="37" cy="77" r="1.5" fill="#92400e" />
          <circle cx="27" cy="67" r="1.5" fill="#92400e" />
          <circle cx="27" cy="43" r="1.5" fill="#92400e" />
          <circle cx="37" cy="33" r="1.5" fill="#92400e" />

          {/* Clock Hands pointing to 10:10 (Classic Time Display) */}
          {/* Hour Hand */}
          <line x1="50" y1="55" x2="38" y2="42" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Minute Hand */}
          <line x1="50" y1="55" x2="68" y2="37" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Second Hand */}
          <line x1="50" y1="55" x2="50" y2="72" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />

          {/* Center Pivot Pin */}
          <circle cx="50" cy="55" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <circle cx="50" cy="55" r="2" fill="#ffffff" />

          {/* Glass Glint Arc */}
          <path d="M26,45 C28,34 38,28 52,28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </svg>
      );

    case 'gear':
      // Steampunk Mechanical Brass Cogwheel with Shiny Rivets
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <radialGradient id="gearCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="80%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
          </defs>

          {/* 8 Gear Teeth */}
          <path
            d="
              M44,12 L56,12 L58,22 C61,23 64,25 67,27 L76,21 L83,28 L77,37 C79,40 81,43 82,46 L92,48 L92,60 L82,62 C81,65 79,68 77,71 L83,80 L76,87 L67,81 C64,83 61,85 58,86 L56,96 L44,96 L42,86 C39,85 36,83 33,81 L24,87 L17,80 L23,71 C21,68 19,65 18,62 L8,60 L8,48 L18,46 C19,43 21,40 23,37 L17,28 L24,21 L33,27 C36,25 39,23 42,22 Z
            "
            fill="url(#gearGrad)"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Cog Rim */}
          <circle cx="50" cy="54" r="26" fill="#78350f" opacity="0.3" />
          <circle cx="50" cy="54" r="23" fill="url(#gearGrad)" stroke="#ffffff" strokeWidth="2" />

          {/* 4 Mechanical Spokes Holes */}
          <circle cx="50" cy="38" r="4.5" fill="#002732" />
          <circle cx="66" cy="54" r="4.5" fill="#002732" />
          <circle cx="50" cy="70" r="4.5" fill="#002732" />
          <circle cx="34" cy="54" r="4.5" fill="#002732" />

          {/* Glowing Chrono Center Core */}
          <circle cx="50" cy="54" r="12" fill="url(#gearCenter)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="50" cy="54" r="6" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    case 'compass':
      // Temporal Astrolabe / Compass with Cyan Glowing Needle
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <linearGradient id="compassRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Outer Astrolabe Ring with loop */}
          <circle cx="50" cy="11" r="7" stroke="url(#goldEdge)" strokeWidth="3.5" fill="none" />
          <circle cx="50" cy="55" r="39" fill="url(#goldEdge)" stroke="#ffffff" strokeWidth="3" />
          <circle cx="50" cy="55" r="33" fill="#00232d" stroke="#38bdf8" strokeWidth="2" />

          {/* Orbital Degree Rings */}
          <circle cx="50" cy="55" r="27" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="55" r="20" stroke="#00f2c9" strokeWidth="1" opacity="0.6" />

          {/* Cardinal Directions */}
          <text x="50" y="34" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="900">N</text>
          <text x="73" y="58" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="900">E</text>
          <text x="50" y="80" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="900">S</text>
          <text x="27" y="58" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="900">W</text>

          {/* Compass Star Diamond */}
          <polygon points="50,45 53,55 50,65 47,55" fill="#f59e0b" />
          <polygon points="40,55 50,52 60,55 50,58" fill="#f59e0b" />

          {/* Glowing Time Needle (Pointing North-East) */}
          <polygon points="50,55 45,51 68,33" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          <polygon points="50,55 55,59 32,77" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

          {/* Center Golden Pin */}
          <circle cx="50" cy="55" r="5" fill="#fef08a" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="50" cy="55" r="2" fill="#ffffff" />
        </svg>
      );

    case 'chronosphere':
      // Glowing Chrono Flux Energy Core with Rotating Time Orbits
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <defs>
            <radialGradient id="chronoCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#67e8f9" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <linearGradient id="orbitRings" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#00f2c9" />
            </linearGradient>
          </defs>

          {/* Outer Glowing Halos */}
          <circle cx="50" cy="50" r="42" fill="#06b6d4" opacity="0.15" />
          <circle cx="50" cy="50" r="34" fill="#00f2c9" opacity="0.2" />

          {/* Orbit Ring 1 (Tilted Left) */}
          <ellipse cx="50" cy="50" rx="38" ry="14" stroke="url(#orbitRings)" strokeWidth="3" transform="rotate(-30 50 50)" />
          <circle cx="78" cy="35" r="3.5" fill="#fef08a" stroke="#ffffff" strokeWidth="1.5" />

          {/* Orbit Ring 2 (Tilted Right) */}
          <ellipse cx="50" cy="50" rx="38" ry="14" stroke="url(#orbitRings)" strokeWidth="3" transform="rotate(40 50 50)" />
          <circle cx="22" cy="38" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

          {/* Center Glowing Chronosphere */}
          <circle cx="50" cy="50" r="22" fill="url(#chronoCore)" stroke="#ffffff" strokeWidth="3" />

          {/* Inner Energy Wave */}
          <path d="M34,48 Q42,40 50,50 T66,52" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38,56 Q46,62 54,54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* Glint Sparkles */}
          <circle cx="43" cy="42" r="2.5" fill="#ffffff" />
          <circle cx="57" cy="40" r="1.5" fill="#ffffff" />
        </svg>
      );

    default:
      return null;
  }
};
