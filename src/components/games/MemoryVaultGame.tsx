import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Brain,
  Crown,
  Info,
  Layers,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import {
  MemorySymbolIcon,
  SYMBOL_LABELS,
  SYMBOL_POOL,
  type MemorySymbol,
} from './MemorySymbolIcon';

interface MemoryVaultGameProps {
  onExit: () => void;
  rbtMode?: boolean;
}

interface LevelConfig {
  id: number;
  vault: string;
  pairs: number;
  cols: number;
  rows: number;
}

interface Capsule {
  uid: number;
  symbol: MemorySymbol;
  matched: boolean;
}

type PlayerCount = 1 | 2;
type PlayerId = 1 | 2;

const LEVELS: LevelConfig[] = [
  { id: 1, vault: 'Docking Bay Alpha', pairs: 3, cols: 3, rows: 2 },
  { id: 2, vault: 'Comet Corridor', pairs: 6, cols: 4, rows: 3 },
  { id: 3, vault: 'Nebula Archive', pairs: 8, cols: 4, rows: 4 },
  { id: 4, vault: 'Vault Core', pairs: 10, cols: 5, rows: 4 },
];

const MATCH_COLORS = ['#00f2c9', '#38bdf8', '#ffd000', '#f472b6'];

const CLINICAL = {
  skillName: 'Visual Working Memory & Sustained Attention',
  skillCode: 'EF 1',
  skillDescription:
    'Holding symbol identity and location in mind across turns so the learner can compare a new capsule against a remembered one, while staying on task across a full deck sweep.',
  gameAlignment:
    'Every pair requires recalling a previous reveal. Mismatches resolve without penalty, teaching that a wrong guess is information. The co-pilot bar separates independent recall from prompted (peeked) recall.',
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function buildDeck(pairs: number): Capsule[] {
  const picked = shuffle(SYMBOL_POOL)
    .slice(0, pairs)
    .map((definition) => definition.id);
  const paired = [...picked, ...picked];
  return shuffle(paired).map((symbol, index) => ({
    uid: index,
    symbol,
    matched: false,
  }));
}

export const MemoryVaultGame = ({ onExit, rbtMode = false }: MemoryVaultGameProps) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  const [deck, setDeck] = useState<Capsule[]>(() => buildDeck(LEVELS[0].pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [peekActive, setPeekActive] = useState(false);
  const [peekUsed, setPeekUsed] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);
  const [independentCount, setIndependentCount] = useState(0);
  const [promptedCount, setPromptedCount] = useState(0);

  // Player modes, turn order and per-player scoring
  const [players, setPlayers] = useState<PlayerCount>(1);
  const [activePlayer, setActivePlayer] = useState<PlayerId>(1);
  const [playerScores, setPlayerScores] = useState<[number, number]>([0, 0]);

  // Match celebration state
  const [flashUids, setFlashUids] = useState<number[]>([]);
  const [scorePopup, setScorePopup] = useState<{ uid: number; points: number } | null>(null);

  const mismatchTimeout = useRef<number | null>(null);
  const peekTimeout = useRef<number | null>(null);
  const celebrationTimeout = useRef<number | null>(null);
  const fxTimeouts = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    if (mismatchTimeout.current !== null) {
      window.clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }
    if (peekTimeout.current !== null) {
      window.clearTimeout(peekTimeout.current);
      peekTimeout.current = null;
    }
    if (celebrationTimeout.current !== null) {
      window.clearTimeout(celebrationTimeout.current);
      celebrationTimeout.current = null;
    }
    fxTimeouts.current.forEach((handle) => window.clearTimeout(handle));
    fxTimeouts.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startLevel = useCallback(
    (index: number) => {
      clearTimers();
      setLevelIndex(index);
      setDeck(buildDeck(LEVELS[index].pairs));
      setFlipped([]);
      setMoves(0);
      setMatchedCount(0);
      setStreak(0);
      setIsLocked(false);
      setPeekActive(false);
      setPeekUsed(false);
      setLevelCleared(false);
      setMissionComplete(false);
      setFlashUids([]);
      setScorePopup(null);
    },
    [clearTimers],
  );

  const accuracy = moves === 0 ? '—' : `${Math.round((matchedCount / moves) * 100)}%`;
  const sessionScore = playerScores[0] + playerScores[1];
  const winner: PlayerId | 'tie' | null =
    playerScores[0] === playerScores[1] ? 'tie' : playerScores[0] > playerScores[1] ? 1 : 2;

  const fireMatchCelebration = (uidA: number, uidB: number) => {
    const rectA = document
      .querySelector<HTMLElement>(`[data-uid="${uidA}"]`)
      ?.getBoundingClientRect();
    const rectB = document
      .querySelector<HTMLElement>(`[data-uid="${uidB}"]`)
      ?.getBoundingClientRect();
    if (!rectA || !rectB) return;

    const centerX =
      (rectA.left + rectA.width / 2 + rectB.left + rectB.width / 2) / 2 / window.innerWidth;
    const centerY =
      (rectA.top + rectA.height / 2 + rectB.top + rectB.height / 2) / 2 / window.innerHeight;

    confetti({
      particleCount: 55,
      spread: 62,
      startVelocity: 32,
      scalar: 0.95,
      origin: { x: centerX, y: centerY },
      colors: MATCH_COLORS,
    });

    const secondWave = window.setTimeout(() => {
      confetti({
        particleCount: 28,
        spread: 100,
        startVelocity: 42,
        scalar: 0.8,
        origin: { x: centerX, y: centerY },
        colors: MATCH_COLORS,
      });
    }, 130);
    fxTimeouts.current.push(secondWave);
  };

  const handleCapsuleTap = (capsule: Capsule) => {
    if (isLocked || levelCleared || missionComplete) return;
    if (capsule.matched || flipped.includes(capsule.uid)) return;

    soundEngine.playCardFlip();

    if (flipped.length === 0) {
      setFlipped([capsule.uid]);
      return;
    }

    const firstUid = flipped[0];
    const first = deck.find((card) => card.uid === firstUid);
    if (!first) {
      setFlipped([capsule.uid]);
      return;
    }

    setFlipped([firstUid, capsule.uid]);
    setMoves((previous) => previous + 1);

    if (first.symbol === capsule.symbol) {
      const nextMatched = matchedCount + 1;
      const nextStreak = streak + 1;
      const points = 10 + Math.min(nextStreak, 5) * 2;

      setDeck((previous) =>
        previous.map((card) =>
          card.uid === capsule.uid || card.uid === firstUid
            ? { ...card, matched: true }
            : card,
        ),
      );
      setMatchedCount(nextMatched);
      setStreak(nextStreak);
      setPlayerScores((previous) => {
        const next: [number, number] = [...previous];
        next[activePlayer - 1] += points;
        return next;
      });
      setFlipped([]);

      if (peekUsed) {
        setPromptedCount((previous) => previous + 1);
      } else {
        setIndependentCount((previous) => previous + 1);
      }

      soundEngine.playPairMatch();
      fireMatchCelebration(firstUid, capsule.uid);

      // Attention effect: flash both capsules and pop the credited points
      setFlashUids([firstUid, capsule.uid]);
      setScorePopup({ uid: capsule.uid, points });
      const clearFlash = window.setTimeout(() => {
        setFlashUids([]);
        setScorePopup(null);
      }, 900);
      fxTimeouts.current.push(clearFlash);

      if (nextMatched === level.pairs) {
        celebrationTimeout.current = window.setTimeout(() => {
          celebrationTimeout.current = null;
          soundEngine.playCheer();
          confetti({
            particleCount: 120,
            spread: 85,
            origin: { y: 0.62 },
            colors: MATCH_COLORS,
          });
          if (levelIndex === LEVELS.length - 1) {
            setMissionComplete(true);
          } else {
            setLevelCleared(true);
          }
        }, 380);
      }
      return;
    }

    setStreak(0);
    setIsLocked(true);
    soundEngine.playPairMiss();
    mismatchTimeout.current = window.setTimeout(() => {
      mismatchTimeout.current = null;
      setFlipped([]);
      setIsLocked(false);
      // The turn passes only once the learner has seen the failed pair
      if (players === 2) {
        setActivePlayer((previous) => (previous === 1 ? 2 : 1));
      }
    }, 850);
  };

  const handlePeek = () => {
    if (peekActive || levelCleared || missionComplete) return;
    soundEngine.playPromptChime();
    setPeekUsed(true);
    setPeekActive(true);
    if (peekTimeout.current !== null) {
      window.clearTimeout(peekTimeout.current);
    }
    peekTimeout.current = window.setTimeout(() => {
      peekTimeout.current = null;
      setPeekActive(false);
    }, 1500);
  };

  const handleModeChange = (mode: PlayerCount) => {
    if (mode === players) return;
    soundEngine.playTap();
    setPlayers(mode);
    setPlayerScores([0, 0]);
    setActivePlayer(1);
    startLevel(levelIndex);
  };

  const handleLevelSelect = (index: number) => {
    soundEngine.playSectorWarp(index > levelIndex);
    startLevel(index);
  };

  const handleRestartLevel = () => {
    soundEngine.playTap();
    startLevel(levelIndex);
  };

  const handleSkipLevel = () => {
    soundEngine.playTap();
    if (levelIndex + 1 < LEVELS.length) {
      startLevel(levelIndex + 1);
    } else {
      startLevel(0);
    }
  };

  const handleNextLevel = () => {
    soundEngine.playTap();
    if (levelIndex + 1 < LEVELS.length) {
      startLevel(levelIndex + 1);
    }
  };

  const handlePlayAgain = () => {
    soundEngine.playTap();
    setPlayerScores([0, 0]);
    setActivePlayer(1);
    setIndependentCount(0);
    setPromptedCount(0);
    startLevel(0);
  };

  return (
    <div className="relative flex-1 min-h-0 w-full flex flex-col bg-[#021b1b] text-white overflow-hidden select-none font-sans">
      <style>{`
        @keyframes mv-flash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          45% { box-shadow: 0 0 28px 8px rgba(16, 185, 129, 0.9); }
        }
        .mv-flash { animation: mv-flash 0.7s ease-in-out; }
        @keyframes mv-pop {
          0% { opacity: 0; transform: translate(-50%, 8px) scale(0.7); }
          30% { opacity: 1; transform: translate(-50%, -12px) scale(1.15); }
          100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
        }
        .mv-pop { animation: mv-pop 0.9s ease-out forwards; }
        @keyframes mv-turn {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        .mv-turn { animation: mv-turn 1.6s ease-in-out infinite; }
      `}</style>

      <CosmicBackground sector="behavior" />

      {/* TOP HUD */}
      <header className="relative z-20 flex items-center justify-between gap-2 px-3 md:px-5 py-2 bg-[#002029]/85 backdrop-blur-md border-b border-[#00c9a7]/30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            aria-label="Return to Mission Hub"
            className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-[#003847] border border-[#00c9a7]/30 text-xs md:text-sm font-bold text-[#ccfbf1] hover:bg-[#004e63] active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mission Hub</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              setShowClinicalInfo((previous) => !previous);
            }}
            aria-label="Educational Alignment"
            title="Educational Alignment"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#003847] border border-[#00c9a7]/30 text-[#7dd3fc] hover:bg-[#004e63] active:scale-95 transition"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-[#00f2c9]">
            Vault {levelIndex + 1}/{LEVELS.length}
          </div>
          <div className="text-sm md:text-base font-black tracking-tight text-white leading-tight">
            {level.vault}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {players === 1 ? (
            <div className="px-2.5 py-1 rounded-xl bg-black/50 border border-[#00c9a7]/30 text-center">
              <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Score</div>
              <div className="text-base md:text-lg font-black text-[#ffd000] leading-none">
                {playerScores[0]}
              </div>
            </div>
          ) : (
            <>
              <div
                data-testid="score-p1"
                className={`px-2 py-1 rounded-xl text-center border ${
                  activePlayer === 1
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-emerald-500/30 shadow'
                    : 'bg-black/50 border-white/15'
                }`}
              >
                <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">P1</div>
                <div className="text-base md:text-lg font-black text-white leading-none">
                  {playerScores[0]}
                </div>
              </div>
              <div
                data-testid="score-p2"
                className={`px-2 py-1 rounded-xl text-center border ${
                  activePlayer === 2
                    ? 'bg-amber-500/20 border-amber-400 shadow-amber-500/30 shadow'
                    : 'bg-black/50 border-white/15'
                }`}
              >
                <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">P2</div>
                <div className="text-base md:text-lg font-black text-white leading-none">
                  {playerScores[1]}
                </div>
              </div>
            </>
          )}

          <div className="hidden md:block px-2.5 py-1 rounded-xl bg-black/50 border border-[#00c9a7]/30 text-center">
            <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Pairs</div>
            <div className="text-base md:text-lg font-black text-white leading-none">
              {matchedCount}/{level.pairs}
            </div>
          </div>
        </div>
      </header>

      {/* MISSION BAR: players + level selector + turn indicator */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#002833]/90 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-[#7dd3fc]">
            Players
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/50 border border-white/10">
            <button
              onClick={() => handleModeChange(1)}
              aria-pressed={players === 1}
              data-testid="mode-1p"
              className={`min-h-[32px] px-2.5 rounded-full text-[11px] font-black flex items-center gap-1 transition ${
                players === 1
                  ? 'bg-[#00c9a7] text-[#002029]'
                  : 'text-[#a5d8d8] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1 Player</span>
            </button>
            <button
              onClick={() => handleModeChange(2)}
              aria-pressed={players === 2}
              data-testid="mode-2p"
              className={`min-h-[32px] px-2.5 rounded-full text-[11px] font-black flex items-center gap-1 transition ${
                players === 2
                  ? 'bg-[#00c9a7] text-[#002029]'
                  : 'text-[#a5d8d8] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Players</span>
            </button>
          </div>

          {players === 2 && (
            <span
              data-testid="turn-indicator"
              className={`mv-turn ml-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                activePlayer === 1
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300'
              }`}
            >
              Player {activePlayer} turn
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-[#7dd3fc]">
            Vault
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/50 border border-white/10">
            {LEVELS.map((vault, index) => (
              <button
                key={vault.id}
                onClick={() => handleLevelSelect(index)}
                aria-pressed={index === levelIndex}
                aria-label={`Vault ${vault.id}: ${vault.pairs} pairs`}
                data-testid={`level-select-${vault.id}`}
                className={`min-h-[32px] min-w-[34px] px-2 rounded-full text-[11px] font-black transition ${
                  index === levelIndex
                    ? 'bg-[#ffd000] text-[#002029]'
                    : 'text-[#a5d8d8] hover:text-white'
                }`}
              >
                {vault.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RBT CO-PILOT BAR */}
      {rbtMode && (
        <div className="relative z-20 bg-[#002029]/95 border-b border-[#00c9a7]/25 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black text-[#ffb703] uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              <span>RBT Co-Pilot • {CLINICAL.skillCode}</span>
            </span>
            <div className="flex items-center gap-2 bg-[#00171e] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
              <span className="text-emerald-400 font-bold">Independent: {independentCount}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-bold">Prompted: {promptedCount}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#00171e] px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
              <span className="text-slate-300 font-bold">Moves: {moves}</span>
              <span className="text-slate-500">|</span>
              <span className="text-[#7dd3fc] font-bold">Accuracy: {accuracy}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePeek}
              className={`min-h-[32px] px-3 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                peekActive
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-[#003847] hover:bg-[#004e63] text-[#00f2c9] border border-[#00c9a7]/30'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{peekActive ? 'Peeking' : 'Peek'}</span>
            </button>

            <button
              onClick={handleRestartLevel}
              className="min-h-[32px] px-3 rounded-full font-bold text-xs flex items-center gap-1.5 bg-[#003847] hover:bg-[#004e63] text-white border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={handleSkipLevel}
              className="min-h-[32px] px-3 rounded-full font-bold text-xs flex items-center gap-1.5 bg-[#003847] hover:bg-[#004e63] text-white border border-white/10 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      )}

      {/* INSTRUCTION STRIP */}
      <div className="relative z-10 px-3 py-1 text-center text-[11px] md:text-xs font-bold text-[#a5d8d8] bg-[#002833]/70 border-b border-white/5 shrink-0">
        Tap two capsules to reunite a pair. A mismatch is information — the vault simply re-seals.
      </div>

      {/* VAULT ARENA */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center px-3 py-2 md:py-3">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
            gap: '0.5rem',
            maxWidth: `${Math.min(56, level.cols * 11)}rem`,
          }}
          role="grid"
          aria-label={`Vault grid with ${level.pairs} pairs`}
        >
          {deck.map((capsule) => {
            const faceUp = capsule.matched || flipped.includes(capsule.uid) || peekActive;
            const symbolLabel = SYMBOL_LABELS[capsule.symbol];
            const isFlashing = flashUids.includes(capsule.uid);

            return (
              <button
                key={capsule.uid}
                type="button"
                onClick={() => handleCapsuleTap(capsule)}
                aria-label={faceUp ? `${symbolLabel} capsule` : 'Hidden capsule'}
                aria-pressed={faceUp}
                data-testid="vault-capsule"
                data-uid={capsule.uid}
                data-symbol={capsule.symbol}
                data-face-up={faceUp ? 'true' : 'false'}
                data-matched={capsule.matched ? 'true' : 'false'}
                className={`relative w-full h-full perspective-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2c9] rounded-2xl ${
                  isFlashing ? 'mv-flash' : ''
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-300 preserve-3d ${
                    faceUp ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* BACK FACE: vault seal */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-[#013b3a] to-[#00211f] border-2 border-[#00c9a7]/40 shadow-lg flex items-center justify-center">
                    <Layers className="w-1/3 h-1/3 text-[#00f2c9]/45" />
                  </div>

                  {/* FRONT FACE: symbol */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center border-2 transition-colors ${
                      capsule.matched
                        ? 'bg-[#012f2a] border-emerald-400 shadow-lg shadow-emerald-500/30'
                        : 'bg-[#04231f] border-[#00c9a7]/50 shadow-inner'
                    }`}
                  >
                    <div className="w-3/4 h-3/4">
                      <MemorySymbolIcon symbol={capsule.symbol} />
                    </div>
                  </div>
                </div>

                {scorePopup?.uid === capsule.uid && (
                  <span
                    data-testid="score-popup"
                    className="mv-pop pointer-events-none absolute left-1/2 top-1 z-20 text-lg md:text-xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                  >
                    +{scorePopup.points}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* EDUCATIONAL ALIGNMENT PANEL */}
      {showClinicalInfo && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#002029] border-2 border-[#00c9a7]/50 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-[#00f2c9]">
                  Educational Alignment
                </div>
                <h2 className="text-lg font-black tracking-tight">{CLINICAL.skillName}</h2>
                <div className="text-xs font-bold text-[#ffd000]">{CLINICAL.skillCode}</div>
              </div>
              <button
                onClick={() => setShowClinicalInfo(false)}
                aria-label="Close educational alignment"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#003847] border border-white/10 text-[#a5d8d8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-[#a5d8d8] leading-relaxed">{CLINICAL.skillDescription}</p>
            <p className="mt-2 text-sm text-[#a5d8d8] leading-relaxed">{CLINICAL.gameAlignment}</p>
          </div>
        </div>
      )}

      {/* LEVEL CLEARED */}
      {levelCleared && !missionComplete && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#002029] border-2 border-[#00c9a7]/50 p-6 text-center shadow-2xl">
            <Trophy className="w-12 h-12 text-[#ffd000] mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Vault Restored</h2>
            <p className="text-sm text-[#a5d8d8] mt-1">
              {level.vault} • {moves} moves • {accuracy} accuracy
            </p>
            <p className="text-xs text-[#7dd3fc] mt-1 font-bold">
              {level.pairs} pairs recovered without penalty for misses
            </p>

            {players === 2 && (
              <div className="mt-3 flex items-center justify-center gap-3 text-sm font-black">
                <span className={activePlayer === 1 ? 'text-emerald-300' : 'text-slate-300'}>
                  P1: {playerScores[0]}
                </span>
                <span className="text-slate-500">•</span>
                <span className={activePlayer === 2 ? 'text-amber-300' : 'text-slate-300'}>
                  P2: {playerScores[1]}
                </span>
              </div>
            )}

            <button
              onClick={handleNextLevel}
              className="mt-4 w-full min-h-[56px] rounded-2xl bg-[#00c9a7] text-[#002029] font-black uppercase tracking-wide active:scale-95 transition"
            >
              Open Next Vault
            </button>
          </div>
        </div>
      )}

      {/* MISSION COMPLETE */}
      {missionComplete && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#002029] border-2 border-[#ffd000]/60 p-6 text-center shadow-2xl">
            <Brain className="w-12 h-12 text-[#00f2c9] mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Vault Core Recovered</h2>
            <p className="text-sm text-[#a5d8d8] mt-1">Every capsule pair reunited.</p>

            {players === 2 ? (
              <>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm font-black text-[#ffd000] uppercase tracking-wider">
                  <Crown className="w-4 h-4" />
                  <span>
                    {winner === 'tie' ? 'Tie game' : `Player ${winner} wins`}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-black/50 border border-emerald-400/50 py-2">
                    <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Player 1</div>
                    <div className="text-lg font-black text-emerald-300">{playerScores[0]}</div>
                  </div>
                  <div className="rounded-xl bg-black/50 border border-amber-400/50 py-2">
                    <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Player 2</div>
                    <div className="text-lg font-black text-amber-300">{playerScores[1]}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/50 border border-white/10 py-2">
                  <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Score</div>
                  <div className="text-lg font-black text-[#ffd000]">{sessionScore}</div>
                </div>
                <div className="rounded-xl bg-black/50 border border-white/10 py-2">
                  <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Independent</div>
                  <div className="text-lg font-black text-emerald-400">{independentCount}</div>
                </div>
                <div className="rounded-xl bg-black/50 border border-white/10 py-2">
                  <div className="text-[9px] uppercase tracking-widest text-[#7dd3fc] font-black">Prompted</div>
                  <div className="text-lg font-black text-amber-400">{promptedCount}</div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePlayAgain}
                className="flex-1 min-h-[52px] rounded-2xl bg-[#00c9a7] text-[#002029] font-black uppercase tracking-wide active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="flex-1 min-h-[52px] rounded-2xl bg-[#003847] text-white font-black uppercase tracking-wide border border-[#00c9a7]/40 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Mission Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
