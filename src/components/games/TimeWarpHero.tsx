import React from 'react';

interface TimeWarpHeroProps {
  lane?: number;
  speedBoost?: boolean;
  className?: string;
}

export const TimeWarpHero: React.FC<TimeWarpHeroProps> = ({
  lane = 1,
  speedBoost = false,
  className = '',
}) => {
  // Dynamic tilt based on current highway lane
  const tiltDeg = lane === 0 ? -4 : lane === 2 ? 4 : 0;

  return (
    <div 
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-200 ${className}`}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
    >
      {/* Speed Boost Trail Particles */}
      {speedBoost && (
        <div className="absolute -bottom-6 inset-x-0 mx-auto w-20 h-12 bg-gradient-to-t from-transparent via-cyan-400/40 to-yellow-300/80 rounded-full blur-md animate-pulse"></div>
      )}

      {/* Main SVG Hero Vector */}
      <svg 
        viewBox="0 0 120 130" 
        className={`w-24 h-26 md:w-28 md:h-30 drop-shadow-[0_10px_16px_rgba(0,0,0,0.7)] transition-transform duration-150 ${speedBoost ? 'scale-110' : ''}`}
        fill="none"
      >
        <defs>
          {/* Jacket Teal Gradient */}
          <linearGradient id="jacketTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="50%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>

          {/* Gold Trim & Goggles Gradient */}
          <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Cyan Goggles Lens Glow */}
          <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#00f2c9" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>

          {/* Brown Hair Gradient */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="60%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Boots Leather Gradient */}
          <linearGradient id="bootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="70%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* 1. RUNNING LEGS & BOOTS */}
        <g id="legs" className="animate-pulse-subtle">
          {/* Left Leg (reaching back) */}
          <path d="M42,88 L34,106 L48,110 L52,90 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
          {/* Left Boot */}
          <path d="M30,105 L48,107 L44,118 L26,116 Z" fill="url(#bootGrad)" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="32" cy="117" rx="8" ry="3" fill="#00f2c9" opacity="0.85" />

          {/* Right Leg (driving forward) */}
          <path d="M68,88 L78,104 L92,100 L80,88 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
          {/* Right Boot */}
          <path d="M76,101 L96,98 L98,112 L78,114 Z" fill="url(#bootGrad)" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="94" cy="108" rx="8" ry="3" fill="#00f2c9" opacity="0.85" />

          {/* Boot Straps & Buckles */}
          <rect x="33" y="108" width="10" height="2" fill="url(#heroGold)" />
          <rect x="80" y="104" width="10" height="2" fill="url(#heroGold)" />
        </g>

        {/* 2. BODY & TEAL JACKET */}
        <g id="torso">
          {/* Main Teal Adventure Jacket */}
          <path d="M38,58 L82,58 L86,88 L34,88 Z" fill="url(#jacketTeal)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Inner Shirt Collar (V-neck) */}
          <polygon points="52,58 68,58 60,72" fill="#fef3c7" stroke="#ffffff" strokeWidth="1" />

          {/* Gold Jacket Lapels & Piping */}
          <path d="M48,58 L54,74 L54,88" stroke="url(#heroGold)" strokeWidth="3" strokeLinecap="round" />
          <path d="M72,58 L66,74 L66,88" stroke="url(#heroGold)" strokeWidth="3" strokeLinecap="round" />
          <path d="M38,62 L82,62" stroke="url(#heroGold)" strokeWidth="2" />

          {/* Gold Belt & Tech Buckle */}
          <rect x="34" y="84" width="52" height="6" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
          <rect x="54" y="82" width="12" height="9" rx="2" fill="url(#heroGold)" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="60" cy="86.5" r="2" fill="#00f2c9" />
        </g>

        {/* 3. ARMS & TIME-GAUNTLET */}
        <g id="arms">
          {/* Left Arm (swinging back) */}
          <path d="M38,60 L24,74 L30,82 L42,70 Z" fill="url(#jacketTeal)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="25" cy="80" r="6" fill="#fed7aa" stroke="#ffffff" strokeWidth="1.5" />

          {/* Right Arm (thrusting forward with Time-Warp Gauntlet) */}
          <path d="M82,60 L98,72 L92,82 L78,70 Z" fill="url(#jacketTeal)" stroke="#ffffff" strokeWidth="2" />
          {/* Gold Chrono-Gauntlet */}
          <rect x="88" y="72" width="12" height="12" rx="3" fill="url(#heroGold)" stroke="#ffffff" strokeWidth="1.5" />
          {/* Glowing Chrono-Dial */}
          <circle cx="94" cy="78" r="4.5" fill="url(#lensGlow)" stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
          <circle cx="98" cy="86" r="6" fill="#fed7aa" stroke="#ffffff" strokeWidth="1.5" />
        </g>

        {/* 4. HEAD & FACE */}
        <g id="head">
          {/* Neck */}
          <rect x="54" y="52" width="12" height="9" fill="#fed7aa" stroke="#ffffff" strokeWidth="1" />

          {/* Cartoon Head Shape */}
          <circle cx="60" cy="40" r="21" fill="#fed7aa" stroke="#ffffff" strokeWidth="2.5" />

          {/* Big Cheerful Eyes */}
          {/* Left Eye */}
          <ellipse cx="53" cy="38" rx="4" ry="5.5" fill="#451a03" />
          <circle cx="51.5" cy="36" r="1.8" fill="#ffffff" />
          <circle cx="54" cy="41" r="0.8" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="67" cy="38" rx="4" ry="5.5" fill="#451a03" />
          <circle cx="65.5" cy="36" r="1.8" fill="#ffffff" />
          <circle cx="68" cy="41" r="0.8" fill="#ffffff" />

          {/* Eyebrows */}
          <path d="M49,31 Q53,28 57,32" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
          <path d="M63,32 Q67,28 71,31" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

          {/* Cute Button Nose */}
          <circle cx="60" cy="43" r="1.5" fill="#ea580c" opacity="0.6" />

          {/* Big Open Happy Smile */}
          <path d="M52,47 Q60,57 68,47 Z" fill="#991b1b" stroke="#ffffff" strokeWidth="1.5" />
          {/* White Teeth */}
          <path d="M54,47 Q60,51 66,47 Z" fill="#ffffff" />
          {/* Rosy Cheeks */}
          <ellipse cx="48" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="72" cy="44" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />
        </g>

        {/* 5. SPIKY BROWN ANIME HAIR */}
        <g id="hair">
          {/* Hair Base & Fringe */}
          <path 
            d="M39,38 C36,24 45,14 60,14 C75,14 84,24 81,38 C76,28 68,26 62,30 C56,26 48,28 39,38 Z" 
            fill="url(#hairGrad)" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinejoin="round" 
          />
          {/* Dynamic Anime Hair Tufts */}
          <path d="M52,14 L50,6 L60,12" fill="url(#hairGrad)" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M62,12 L68,4 L72,14" fill="url(#hairGrad)" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M74,16 L82,10 L79,22" fill="url(#hairGrad)" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M44,18 L36,12 L41,24" fill="url(#hairGrad)" stroke="#ffffff" strokeWidth="1.5" />
        </g>

        {/* 6. BRASS STEAMPUNK GOGGLES (RESTING ON FOREHEAD) */}
        <g id="goggles">
          {/* Goggles Leather Strap */}
          <path d="M39,27 C39,22 81,22 81,27" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />

          {/* Bridge Connector */}
          <rect x="57" y="24" width="6" height="4" rx="1.5" fill="url(#heroGold)" stroke="#ffffff" strokeWidth="1" />

          {/* Left Brass Goggle Ring */}
          <circle cx="48" cy="26" r="10" fill="url(#heroGold)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="48" cy="26" r="7.5" fill="url(#lensGlow)" stroke="#0284c7" strokeWidth="1" />
          <ellipse cx="46" cy="23.5" rx="3" ry="1.8" fill="#ffffff" opacity="0.8" />

          {/* Right Brass Goggle Ring */}
          <circle cx="72" cy="26" r="10" fill="url(#heroGold)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="72" cy="26" r="7.5" fill="url(#lensGlow)" stroke="#0284c7" strokeWidth="1" />
          <ellipse cx="70" cy="23.5" rx="3" ry="1.8" fill="#ffffff" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};
