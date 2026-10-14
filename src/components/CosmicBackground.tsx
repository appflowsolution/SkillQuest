import type { FC } from 'react';
import type { WorldSector } from '../types';

interface CosmicBackgroundProps {
  className?: string;
  sector?: WorldSector;
}

interface StarDot {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  hasGlint?: boolean;
}

const STAR_DOTS: StarDot[] = [
  // Top quadrant
  { x: 5, y: 6, size: 3, color: '#5eead4', duration: 3.2, delay: 0.1 },
  { x: 12, y: 14, size: 5, color: '#48ffdf', duration: 4.0, delay: 1.2, hasGlint: true },
  { x: 18, y: 5, size: 2.5, color: '#99f6e4', duration: 2.8, delay: 2.1 },
  { x: 25, y: 17, size: 4, color: '#5eead4', duration: 3.5, delay: 0.6 },
  { x: 33, y: 7, size: 2, color: '#a7f3d0', duration: 4.5, delay: 1.8 },
  { x: 42, y: 13, size: 5, color: '#48ffdf', duration: 3.8, delay: 0.4, hasGlint: true },
  { x: 52, y: 6, size: 3, color: '#5eead4', duration: 4.2, delay: 2.5 },
  { x: 60, y: 16, size: 4, color: '#99f6e4', duration: 3.0, delay: 1.0 },
  { x: 68, y: 5, size: 2.5, color: '#a7f3d0', duration: 3.6, delay: 0.8 },
  { x: 76, y: 11, size: 6, color: '#48ffdf', duration: 4.4, delay: 1.5, hasGlint: true },
  { x: 84, y: 7, size: 3, color: '#5eead4', duration: 2.9, delay: 0.3 },
  { x: 92, y: 15, size: 4.5, color: '#99f6e4', duration: 3.7, delay: 2.0 },
  { x: 97, y: 5, size: 2, color: '#a7f3d0', duration: 4.1, delay: 1.1 },

  // Middle quadrant
  { x: 3, y: 34, size: 4, color: '#5eead4', duration: 3.4, delay: 1.7 },
  { x: 14, y: 41, size: 2.5, color: '#99f6e4', duration: 4.2, delay: 0.5 },
  { x: 22, y: 31, size: 5.5, color: '#48ffdf', duration: 3.9, delay: 2.2, hasGlint: true },
  { x: 30, y: 47, size: 3, color: '#a7f3d0', duration: 3.1, delay: 1.3 },
  { x: 48, y: 37, size: 3.5, color: '#5eead4', duration: 4.6, delay: 0.2 },
  { x: 58, y: 44, size: 5, color: '#48ffdf', duration: 3.3, delay: 1.9, hasGlint: true },
  { x: 70, y: 35, size: 2.5, color: '#99f6e4', duration: 4.0, delay: 0.9 },
  { x: 79, y: 45, size: 4, color: '#5eead4', duration: 3.5, delay: 2.4 },
  { x: 88, y: 37, size: 6, color: '#48ffdf', duration: 4.3, delay: 1.4, hasGlint: true },
  { x: 95, y: 43, size: 3, color: '#a7f3d0', duration: 2.8, delay: 0.7 },

  // Lower-middle quadrant
  { x: 8, y: 61, size: 3.5, color: '#99f6e4', duration: 3.6, delay: 1.1 },
  { x: 16, y: 69, size: 5, color: '#48ffdf', duration: 4.1, delay: 0.4, hasGlint: true },
  { x: 26, y: 59, size: 2, color: '#a7f3d0', duration: 3.2, delay: 2.3 },
  { x: 38, y: 67, size: 4, color: '#5eead4', duration: 3.8, delay: 1.6 },
  { x: 50, y: 61, size: 3, color: '#99f6e4', duration: 4.4, delay: 0.7 },
  { x: 64, y: 71, size: 5.5, color: '#48ffdf', duration: 3.5, delay: 2.0, hasGlint: true },
  { x: 74, y: 63, size: 2.5, color: '#a7f3d0', duration: 4.2, delay: 1.2 },
  { x: 83, y: 69, size: 4, color: '#5eead4', duration: 3.0, delay: 0.5 },
  { x: 92, y: 61, size: 3, color: '#99f6e4', duration: 4.5, delay: 1.8 },

  // Bottom quadrant
  { x: 4, y: 87, size: 4, color: '#5eead4', duration: 3.7, delay: 2.1 },
  { x: 15, y: 81, size: 2.5, color: '#a7f3d0', duration: 4.3, delay: 0.9 },
  { x: 28, y: 91, size: 6, color: '#48ffdf', duration: 3.9, delay: 1.4, hasGlint: true },
  { x: 44, y: 85, size: 3, color: '#99f6e4', duration: 3.1, delay: 0.3 },
  { x: 56, y: 93, size: 2, color: '#a7f3d0', duration: 4.0, delay: 2.2 },
  { x: 67, y: 83, size: 4.5, color: '#5eead4', duration: 3.6, delay: 1.0 },
  { x: 78, y: 89, size: 3, color: '#99f6e4', duration: 4.2, delay: 1.7 },
  { x: 87, y: 81, size: 5, color: '#48ffdf', duration: 3.4, delay: 0.6, hasGlint: true },
  { x: 94, y: 91, size: 2.5, color: '#a7f3d0', duration: 3.8, delay: 1.5 },
];

const MATH_COLOR_MAP: Record<string, string> = {
  '#5eead4': '#38bdf8', // sky-400
  '#48ffdf': '#00f2fe', // electric cyan
  '#99f6e4': '#93c5fd', // blue-300
  '#a7f3d0': '#818cf8', // indigo-400
};

export const CosmicBackground: FC<CosmicBackgroundProps> = ({ 
  className = '',
  sector = 'behavior'
}) => {
  const isMath = sector === 'math';
  const cloud1 = isMath ? 'bg-[#0c4a6e]' : 'bg-[#004e63]';
  const cloud2 = isMath ? 'bg-[#1e3a8a]' : 'bg-[#00475a]';

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}>
      {/* Subtle Horizontal ABCya Pill Clouds */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-[8%] -left-[5%] w-[38%] h-6 ${cloud1} rounded-full blur-[1px] transition-colors duration-700`}></div>
        <div className={`absolute top-[22%] left-[30%] w-[45%] h-8 ${cloud1} rounded-full blur-[1px] transition-colors duration-700`}></div>
        <div className={`absolute top-[38%] right-[-8%] w-[42%] h-7 ${cloud2} rounded-full blur-[1px] transition-colors duration-700`}></div>
        <div className={`absolute top-[54%] left-[10%] w-[50%] h-9 ${cloud1} rounded-full blur-[1px] transition-colors duration-700`}></div>
        <div className={`absolute top-[70%] -left-[10%] w-[48%] h-8 ${cloud2} rounded-full blur-[1px] transition-colors duration-700`}></div>
        <div className={`absolute top-[85%] right-[15%] w-[40%] h-7 ${cloud1} rounded-full blur-[1px] transition-colors duration-700`}></div>
      </div>

      {/* Gentle Twinkling Stardust Dots with sector tint */}
      <div className="absolute inset-0">
        {STAR_DOTS.map((star, idx) => {
          const color = isMath ? (MATH_COLOR_MAP[star.color] || star.color) : star.color;
          return (
            <div
              key={idx}
              className="absolute rounded-full transition-colors duration-700"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${star.size * 2}px ${color}`,
                animation: `twinkle-gentle ${star.duration}s infinite ease-in-out ${star.delay}s`,
              }}
            >
              {/* Subtle 4-pointed glint for larger stars */}
              {star.hasGlint && (
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    width: `${star.size * 2.8}px`,
                    height: `${star.size * 2.8}px`,
                  }}
                >
                  <div 
                    className="w-full h-[1px] absolute top-1/2 -translate-y-1/2 transition-colors duration-700" 
                    style={{ backgroundColor: color, opacity: 0.7 }}
                  />
                  <div 
                    className="h-full w-[1px] absolute left-1/2 -translate-x-1/2 transition-colors duration-700" 
                    style={{ backgroundColor: color, opacity: 0.7 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
