import React from 'react';

export type TowerBlockType = 
  | 'foundation'
  | 'habitat'
  | 'reactor'
  | 'greenhouse'
  | 'observatory'
  | 'solarsails'
  | 'spire';

interface TowerBlockIconProps {
  type: TowerBlockType;
  placedBy: 'player' | 'partner';
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const TowerBlockIcon: React.FC<TowerBlockIconProps> = ({
  type,
  placedBy,
  width = '100%',
  height = '100%',
  className = '',
}) => {
  // Border accent color according to who placed it
  const accentColor = placedBy === 'player' ? '#00f2c9' : '#ffb703';

  switch (type) {
    case 'foundation':
      return (
        <svg viewBox="0 0 160 70" width={width} height={height} className={className} fill="none">
          {/* Heavy Steel Base with Rivets */}
          <rect x="10" y="15" width="140" height="48" rx="10" fill="#002b36" stroke={accentColor} strokeWidth="3" />
          <rect x="25" y="24" width="110" height="30" rx="6" fill="#003d4c" />
          
          {/* Landing lights */}
          <circle cx="35" cy="39" r="6" fill="#4ade80" className="animate-pulse" />
          <circle cx="80" cy="39" r="6" fill="#38bdf8" />
          <circle cx="125" cy="39" r="6" fill="#4ade80" className="animate-pulse" />

          {/* Steampunk corner plates */}
          <rect x="16" y="20" width="8" height="8" rx="2" fill={accentColor} />
          <rect x="136" y="20" width="8" height="8" rx="2" fill={accentColor} />
          <rect x="16" y="48" width="8" height="8" rx="2" fill={accentColor} />
          <rect x="136" y="48" width="8" height="8" rx="2" fill={accentColor} />

          {/* Grip treads */}
          <line x1="50" y1="58" x2="110" y2="58" stroke={accentColor} strokeWidth="3" strokeDasharray="6 4" />
        </svg>
      );

    case 'habitat':
      return (
        <svg viewBox="0 0 150 70" width={width} height={height} className={className} fill="none">
          {/* Smooth cylindrical habitat module */}
          <rect x="15" y="12" width="120" height="50" rx="14" fill="#003442" stroke={accentColor} strokeWidth="3" />
          
          {/* Porthole Windows */}
          <circle cx="45" cy="37" r="14" fill="#001f28" stroke="#ffffff" strokeWidth="2" />
          <circle cx="45" cy="37" r="10" fill="#ffb703" opacity="0.9" />
          <circle cx="42" cy="34" r="3" fill="#ffffff" />

          <circle cx="105" cy="37" r="14" fill="#001f28" stroke="#ffffff" strokeWidth="2" />
          <circle cx="105" cy="37" r="10" fill="#ffb703" opacity="0.9" />
          <circle cx="102" cy="34" r="3" fill="#ffffff" />

          {/* Center Airlock hatch */}
          <rect x="68" y="22" width="14" height="30" rx="4" fill="#004c5e" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="75" cy="37" r="2.5" fill="#4ade80" />
        </svg>
      );

    case 'reactor':
      return (
        <svg viewBox="0 0 140 70" width={width} height={height} className={className} fill="none">
          {/* Reactor Chassis */}
          <rect x="12" y="12" width="116" height="48" rx="12" fill="#002d38" stroke={accentColor} strokeWidth="3" />
          
          {/* Power Coils */}
          <rect x="22" y="20" width="18" height="32" rx="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="100" y="20" width="18" height="32" rx="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

          {/* Glowing Plasma Sphere Core */}
          <circle cx="70" cy="36" r="18" fill="#001f28" stroke={accentColor} strokeWidth="2" />
          <circle cx="70" cy="36" r="13" fill="#38bdf8" className="animate-pulse" />
          <circle cx="70" cy="36" r="7" fill="#ffffff" />

          {/* Energy Beams */}
          <line x1="40" y1="36" x2="52" y2="36" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="88" y1="36" x2="100" y2="36" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );

    case 'greenhouse':
      return (
        <svg viewBox="0 0 130 70" width={width} height={height} className={className} fill="none">
          {/* Emerald Bio-Dome Base */}
          <rect x="12" y="32" width="106" height="28" rx="8" fill="#002f3c" stroke={accentColor} strokeWidth="3" />
          
          {/* Glass Biosphere Dome */}
          <path d="M22,32 C22,12 108,12 108,32 Z" fill="#047857" fillOpacity="0.4" stroke={accentColor} strokeWidth="2.5" />
          
          {/* Bioluminescent Plants inside */}
          <path d="M50,32 Q55,20 65,18 Q75,20 80,32 Z" fill="#10b981" />
          <circle cx="56" cy="22" r="3.5" fill="#a7f3d0" className="animate-pulse" />
          <circle cx="74" cy="22" r="3.5" fill="#a7f3d0" className="animate-pulse" />
          <circle cx="65" cy="18" r="4" fill="#fde047" />

          {/* Glass ribs */}
          <path d="M40,32 Q46,16 65,14" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <path d="M90,32 Q84,16 65,14" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );

    case 'observatory':
      return (
        <svg viewBox="0 0 120 70" width={width} height={height} className={className} fill="none">
          {/* Octagonal Observatory Base */}
          <rect x="10" y="28" width="100" height="32" rx="8" fill="#002732" stroke={accentColor} strokeWidth="3" />
          
          {/* Rotating Dome */}
          <path d="M24,28 C24,10 96,10 96,28 Z" fill="#312e81" stroke={accentColor} strokeWidth="2.5" />
          
          {/* Telescope Aperture Slot */}
          <rect x="54" y="8" width="12" height="24" rx="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
          
          {/* Telescope Brass Barrel */}
          <path d="M58,16 L74,6 L79,11 L63,21 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="76.5" cy="8.5" r="3.5" fill="#38bdf8" />

          {/* Dome details */}
          <circle cx="35" cy="44" r="5" fill="#a855f7" />
          <circle cx="85" cy="44" r="5" fill="#a855f7" />
        </svg>
      );

    case 'solarsails':
      return (
        <svg viewBox="0 0 130 70" width={width} height={height} className={className} fill="none">
          {/* Central Module */}
          <rect x="40" y="14" width="50" height="46" rx="10" fill="#003544" stroke={accentColor} strokeWidth="3" />
          
          {/* Left Wing Solar Array */}
          <path d="M40,20 L8,24 L12,50 L40,46 Z" fill="#0284c7" fillOpacity="0.8" stroke="#ffffff" strokeWidth="2" />
          <line x1="24" y1="22" x2="26" y2="48" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="8" y1="36" x2="40" y2="34" stroke="#ffffff" strokeWidth="1.5" />

          {/* Right Wing Solar Array */}
          <path d="M90,20 L122,24 L118,50 L90,46 Z" fill="#0284c7" fillOpacity="0.8" stroke="#ffffff" strokeWidth="2" />
          <line x1="106" y1="22" x2="104" y2="48" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="90" y1="34" x2="122" y2="36" stroke="#ffffff" strokeWidth="1.5" />

          {/* Center glowing transmitter */}
          <circle cx="65" cy="37" r="10" fill="#001f28" stroke={accentColor} strokeWidth="2" />
          <circle cx="65" cy="37" r="6" fill="#00f2c9" className="animate-pulse" />
        </svg>
      );

    case 'spire':
      return (
        <svg viewBox="0 0 110 80" width={width} height={height} className={className} fill="none">
          {/* Pinnacle Base */}
          <rect x="25" y="48" width="60" height="24" rx="6" fill="#002b36" stroke={accentColor} strokeWidth="3" />
          
          {/* Golden Spire Needle */}
          <path d="M50,48 L55,18 L60,48 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          
          {/* Radiant Starlight Apex Crown */}
          <polygon 
            points="55,4 58,14 68,14 60,20 63,30 55,24 47,30 50,20 42,14 52,14" 
            fill="#ffdd00" 
            stroke="#ffffff" 
            strokeWidth="2" 
            className="animate-spin"
            style={{ transformOrigin: '55px 17px', animationDuration: '12s' }}
          />

          {/* Glowing Aura Ring */}
          <circle cx="55" cy="17" r="12" stroke="#fde047" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
        </svg>
      );
  }
};
