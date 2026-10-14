import type { FC } from 'react';
import { useState } from 'react';
import { VectorGameIllustration } from './VectorGameIllustration';

interface GameCardIllustrationProps {
  gameId: string;
}

// Map of game IDs to their authentic 4:3 ABCya-style cover illustrations (with cache-buster v=2)
const COVER_IMAGES: Record<string, string> = {
  'break-request': '/covers/break-request.webp?v=4',
  'more-time': '/covers/more-time.webp?v=4',
  'turn-taking': '/covers/turn-taking.webp?v=4',
  'aac-trainer': '/covers/aac-trainer.webp?v=4',
  'request-help': '/covers/request-help.webp?v=6',
  'echoic-lab': '/covers/echoic-lab.webp?v=4',
  'echo-lab': '/covers/echoic-lab.webp?v=4',
  'cosmic-fuel': '/covers/cosmic-fuel.webp?v=1',
  'meteor-array': '/covers/meteor-array.webp?v=1',
  'number-forge': '/covers/number-forge.webp?v=1',
};

export const GameCardIllustration: FC<GameCardIllustrationProps> = ({ gameId }) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = COVER_IMAGES[gameId];

  // If image not found or fails to load, gracefully fall back to the vector illustrations
  if (!imageSrc || hasError) {
    return <VectorGameIllustration gameId={gameId} />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#001f28] flex items-center justify-center group/cover">
      <img
        src={imageSrc}
        alt={`Cover art for ${gameId}`}
        className="w-full h-full object-cover object-center select-none transition-transform duration-500 group-hover/cover:scale-105"
        loading="eager"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
