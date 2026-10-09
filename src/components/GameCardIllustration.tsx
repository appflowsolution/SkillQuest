import type { FC } from 'react';
import { useState } from 'react';
import { VectorGameIllustration } from './GameCardIllustration.vector-backup';

interface GameCardIllustrationProps {
  gameId: string;
}

// Map of game IDs to their authentic ABCya-style cover illustrations
const COVER_IMAGES: Record<string, string> = {
  'break-request': '/covers/break-request.jpg',
  'more-time': '/covers/more-time.jpg',
  'turn-taking': '/covers/turn-taking.jpg',
  'aac-trainer': '/covers/aac-trainer.jpg',
  'request-help': '/covers/request-help.jpg',
  'echo-lab': '/covers/echo-lab.jpg',
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
        className="w-full h-full object-cover select-none transition-transform duration-500 group-hover/cover:scale-105"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
