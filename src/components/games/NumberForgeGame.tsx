import { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  ChevronRight,
  Info,
  CheckCircle2,
  Undo2,
  Lightbulb,
  Flame,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { soundEngine } from '../../utils/audio';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RUNE_OP = {
  ADD: '+',
  SUB: '-',
  MUL: '×',
} as const;

type RuneOp = (typeof RUNE_OP)[keyof typeof RUNE_OP];

const FEEDBACK_TYPE = {
  SUCCESS: 'success',
  WARN: 'warn',
  INFO: 'info',
} as const;

type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE];

interface NumberForgeGameProps {
  onExit: () => void;
  rbtMode?: boolean;
}

interface ElementalGem {
  id: string;
  value: number;
  elementName: string;
  colorClass: string;
  borderClass: string;
  glowClass: string;
}

interface TransmutationStep {
  id: number;
  fromValue: number;
  rune: RuneOp;
  gemId: string;
  gemValue: number;
  resultValue: number;
}

interface FeedbackMessage {
  text: string;
  type: FeedbackType;
}

interface ForgeLevelConfig {
  id: number;
  sanctum: string;
  targetCrystal: number;
  crystalName: string;
  description: string;
  owlHintText: string;
  gems: ElementalGem[];
  runes: RuneOp[];
}

const GEM_PALETTE = [
  {
    elementName: 'Solar Amber',
    colorClass: 'from-amber-400 to-orange-600 text-slate-950',
    borderClass: 'border-amber-200',
    glowClass: 'shadow-amber-500/40',
  },
  {
    elementName: 'Lunar Cyan',
    colorClass: 'from-cyan-400 to-sky-600 text-slate-950',
    borderClass: 'border-cyan-200',
    glowClass: 'shadow-cyan-500/40',
  },
  {
    elementName: 'Nebula Rose',
    colorClass: 'from-rose-400 to-pink-600 text-white',
    borderClass: 'border-rose-200',
    glowClass: 'shadow-rose-500/40',
  },
  {
    elementName: 'Verdant Aether',
    colorClass: 'from-emerald-400 to-teal-600 text-slate-950',
    borderClass: 'border-emerald-200',
    glowClass: 'shadow-emerald-500/40',
  },
  {
    elementName: 'Astral Violet',
    colorClass: 'from-violet-400 to-purple-600 text-white',
    borderClass: 'border-violet-200',
    glowClass: 'shadow-violet-500/40',
  },
] as const;

function createGems(values: number[]): ElementalGem[] {
  return values.map((val, idx) => {
    const style = GEM_PALETTE[idx % GEM_PALETTE.length];
    return {
      id: `gem-${idx}-${val}`,
      value: val,
      elementName: style.elementName,
      colorClass: style.colorClass,
      borderClass: style.borderClass,
      glowClass: style.glowClass,
    };
  });
}

const FORGE_LEVELS: ForgeLevelConfig[] = [
  {
    id: 1,
    sanctum: 'Starlight Sanctum',
    targetCrystal: 7,
    crystalName: 'Sunburst Quartz',
    description: 'Combine two elemental gems in the cauldron to brew Power 7',
    owlHintText: 'Toss Gem 3, tap the + Rune, and add Gem 4 (or 5 + 2)!',
    gems: createGems([3, 4, 5, 2]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB],
  },
  {
    id: 2,
    sanctum: 'Moonstone Crucible',
    targetCrystal: 6,
    crystalName: 'Lunar Sapphire',
    description: 'Use addition or subtraction runes to stabilize Power 6',
    owlHintText: 'Try 9 - 3 = 6, or combine 4 + 2 = 6!',
    gems: createGems([9, 3, 4, 2]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB],
  },
  {
    id: 3,
    sanctum: 'Nebula Hearth',
    targetCrystal: 12,
    crystalName: 'Aether Emerald',
    description: 'Brew a high-energy Power 12 crystal from astral gems',
    owlHintText: 'Mix 5 + 7 = 12, or 8 + 4 = 12, or chain 5 + 4 + 3!',
    gems: createGems([5, 7, 8, 4, 3]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB],
  },
  {
    id: 4,
    sanctum: 'Solar Alembic',
    targetCrystal: 15,
    crystalName: 'Ignis Ruby',
    description: 'Multiplier Rune (×) unlocked! Forge a Power 15 core',
    owlHintText: 'Multiply 3 × 5 = 15, or add 10 + 5 = 15!',
    gems: createGems([3, 5, 10, 2]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 5,
    sanctum: 'Astral Conservatory',
    targetCrystal: 18,
    crystalName: 'Celestial Topaz',
    description: 'Harness multiplication or multi-step alchemy for Power 18',
    owlHintText: 'Try 3 × 6 = 18, or 9 × 2 = 18, or 9 + 6 + 3!',
    gems: createGems([3, 6, 9, 2]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 6,
    sanctum: 'Void Smeltery',
    targetCrystal: 14,
    crystalName: 'Starlight Amethyst',
    description: 'Two-step alchemy: multiply and adjust to reach Power 14',
    owlHintText: 'First brew 3 × 4 = 12, then add + 2 = 14 (or 5 × 2 + 4)!',
    gems: createGems([3, 4, 2, 5]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 7,
    sanctum: 'Supernova Kiln',
    targetCrystal: 19,
    crystalName: 'Nova Diamond',
    description: 'Combine multiplication with subtraction or addition for 19',
    owlHintText: 'Brew 4 × 5 = 20, then subtract - 1 = 19 (or 3 × 4 + 7)!',
    gems: createGems([4, 5, 1, 3, 7]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 8,
    sanctum: 'Chronos Athenaeum',
    targetCrystal: 24,
    crystalName: 'Chronos Prism',
    description: 'Forge the 24-harmonic prism through flexible factor paths',
    owlHintText: 'Try 6 × 4 = 24, or 8 × 3 = 24, or (2 + 4) × 4!',
    gems: createGems([2, 4, 3, 6, 8]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 9,
    sanctum: 'Celestial Foundry',
    targetCrystal: 27,
    crystalName: 'Vortex Opal',
    description: 'Master Alchemist trial: transmute elemental gems to 27',
    owlHintText: 'Try 9 × 3 = 27, or brew (5 × 6) - 3 = 27!',
    gems: createGems([5, 6, 3, 9, 2]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
  {
    id: 10,
    sanctum: 'Philosopher Nexus',
    targetCrystal: 35,
    crystalName: 'Omni Philosopher Stone',
    description: 'Grand Finale: craft the legendary Power 35 Philosopher Stone',
    owlHintText: 'Multiply 5 × 7 = 35, or chain (6 × 5) + 7 - 2 = 35!',
    gems: createGems([6, 5, 7, 2, 8]),
    runes: [RUNE_OP.ADD, RUNE_OP.SUB, RUNE_OP.MUL],
  },
];

function evaluateRune(left: number, rune: RuneOp, right: number): number {
  if (rune === RUNE_OP.ADD) return left + right;
  if (rune === RUNE_OP.SUB) return left - right;
  return left * right;
}

export const NumberForgeGame = ({ onExit }: NumberForgeGameProps) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [baseGemId, setBaseGemId] = useState<string | null>(null);
  const [cauldronValue, setCauldronValue] = useState<number | null>(null);
  const [selectedRune, setSelectedRune] = useState<RuneOp | null>(null);
  const [steps, setSteps] = useState<TransmutationStep[]>([]);
  const [usedGemIds, setUsedGemIds] = useState<string[]>([]);
  const [isBubbling, setIsBubbling] = useState(false);
  const [isForged, setIsForged] = useState(false);
  const [showOwlHint, setShowOwlHint] = useState(false);
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const currentLevel = FORGE_LEVELS[levelIndex];
  const target = currentLevel.targetCrystal;
  const isTargetReached = cauldronValue === target && steps.length >= 1;

  const triggerBubblePulse = () => {
    setIsBubbling(true);
    setTimeout(() => setIsBubbling(false), 380);
  };

  const resetCauldron = () => {
    setBaseGemId(null);
    setCauldronValue(null);
    setSelectedRune(null);
    setSteps([]);
    setUsedGemIds([]);
    setIsForged(false);
    setFeedback(null);
  };

  const handleEmptyCauldron = () => {
    soundEngine.playTap();
    resetCauldron();
  };

  const handleUndoStep = () => {
    soundEngine.playTap();
    if (isForged) return;

    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const remainingSteps = steps.slice(0, -1);
      setSteps(remainingSteps);
      setCauldronValue(lastStep.fromValue);
      setUsedGemIds(prev => prev.filter(id => id !== lastStep.gemId));
      setSelectedRune(null);
      setFeedback(null);
      return;
    }

    if (baseGemId !== null) {
      resetCauldron();
    }
  };

  const handleSelectGem = (gem: ElementalGem) => {
    if (isForged || usedGemIds.includes(gem.id)) return;

    // Step 1: Cauldron is empty -> drop the initial base gem
    if (cauldronValue === null) {
      soundEngine.playCauldronBubble(gem.value);
      setBaseGemId(gem.id);
      setCauldronValue(gem.value);
      setUsedGemIds([gem.id]);
      triggerBubblePulse();
      setFeedback({
        text: `Gem ${gem.value} added! Now select a Spell Rune (+, -, ×).`,
        type: FEEDBACK_TYPE.INFO,
      });
      return;
    }

    // Step 2: Cauldron has a value, but player hasn't selected a rune yet
    if (selectedRune === null) {
      soundEngine.playTap();
      setFeedback({
        text: 'Select a Spell Rune (+, -, ×) first to combine with the cauldron!',
        type: FEEDBACK_TYPE.WARN,
      });
      return;
    }

    // Step 3: Perform live transmutation
    const nextValue = evaluateRune(cauldronValue, selectedRune, gem.value);
    const newStep: TransmutationStep = {
      id: steps.length + 1,
      fromValue: cauldronValue,
      rune: selectedRune,
      gemId: gem.id,
      gemValue: gem.value,
      resultValue: nextValue,
    };

    soundEngine.playCauldronBubble(nextValue);
    setSteps(prev => [...prev, newStep]);
    setCauldronValue(nextValue);
    setUsedGemIds(prev => [...prev, gem.id]);
    setSelectedRune(null);
    triggerBubblePulse();

    if (nextValue === target) {
      setFeedback({
        text: `Exact match (${target})! Press FORGE CRYSTAL to crystallize!`,
        type: FEEDBACK_TYPE.SUCCESS,
      });
    } else {
      const diff = target - nextValue;
      const hintDir = diff > 0 ? `Need +${diff} more` : `Over by ${Math.abs(diff)}`;
      setFeedback({
        text: `Transmuted to ${nextValue}! (${hintDir} for Target ${target})`,
        type: FEEDBACK_TYPE.INFO,
      });
    }
  };

  const handleSelectRune = (rune: RuneOp) => {
    if (isForged) return;

    if (cauldronValue === null) {
      soundEngine.playTap();
      setFeedback({
        text: 'Drop an Elemental Gem into the cauldron first!',
        type: FEEDBACK_TYPE.WARN,
      });
      return;
    }

    soundEngine.playRuneSelect(rune);
    setSelectedRune(prev => (prev === rune ? null : rune));
    setFeedback({
      text: `Rune ${rune} active! Choose the next Elemental Gem to transmute.`,
      type: FEEDBACK_TYPE.INFO,
    });
  };

  const handleForgeCrystal = () => {
    if (!isTargetReached || isForged) return;

    soundEngine.playCrystalForge();
    setIsForged(true);
    setScore(prev => prev + 150 + streak * 25);
    setStreak(prev => prev + 1);
    setFeedback({
      text: `CRYSTAL FORGED! ${currentLevel.crystalName} (${target}) created!`,
      type: FEEDBACK_TYPE.SUCCESS,
    });

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleNextLevel = () => {
    soundEngine.playTap();
    if (levelIndex + 1 < FORGE_LEVELS.length) {
      setLevelIndex(prev => prev + 1);
      resetCauldron();
      setShowOwlHint(false);
    } else {
      setShowVictory(true);
    }
  };

  const handleRestartAll = () => {
    soundEngine.playTap();
    setLevelIndex(0);
    setScore(0);
    setStreak(0);
    setShowVictory(false);
    setShowOwlHint(false);
    resetCauldron();
  };

  // Determine liquid color inside cauldron based on current state
  const liquidStopColorA = isTargetReached
    ? 'rgb(52, 211, 153)'
    : selectedRune === RUNE_OP.MUL
    ? 'rgb(244, 114, 182)'
    : selectedRune === RUNE_OP.SUB
    ? 'rgb(56, 189, 248)'
    : 'rgb(168, 85, 247)';

  const liquidStopColorB = isTargetReached
    ? 'rgb(5, 150, 105)'
    : selectedRune === RUNE_OP.MUL
    ? 'rgb(190, 24, 93)'
    : selectedRune === RUNE_OP.SUB
    ? 'rgb(3, 105, 161)'
    : 'rgb(88, 28, 135)';

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none relative">
      {/* Ambient Astral Alchemy Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-purple-950/70" />

      {/* Top HUD Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-indigo-500/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-slate-200 text-xs font-bold tracking-wide transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Mission Hub</span>
          </button>

          <div className="h-5 w-px bg-slate-700/80" />

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 text-xs font-black tracking-wider uppercase">
              SANCTUM {currentLevel.id}/{FORGE_LEVELS.length}
            </span>
            <h2 className="text-sm md:text-base font-black tracking-wide text-white uppercase">
              {currentLevel.sanctum}
            </h2>
          </div>
        </div>

        {/* Right HUD Metrics & Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTap();
              setShowOwlHint(prev => !prev);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition active:scale-95 cursor-pointer',
              showOwlHint
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg shadow-amber-500/25'
                : 'bg-indigo-950/90 hover:bg-indigo-900 text-amber-300 border-amber-400/40'
            )}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>OWL HINT</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">STREAK:</span>
            <span className="text-amber-300 font-black">{streak}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400">SCORE:</span>
            <span className="text-yellow-300 font-black">{score}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playTap();
              setShowClinicalInfo(true);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-indigo-300 transition cursor-pointer"
            title="Clinical Skill Alignment"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Owl Hint Banner (when toggled) */}
      {showOwlHint && (
        <div className="relative z-20 mx-4 mt-2 px-4 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>Alchemist Owl Tip:</strong> {currentLevel.owlHintText}
            </span>
          </div>
          <span className="text-amber-300/80 font-semibold">Any valid path works!</span>
        </div>
      )}

      {/* Main Two-Column Alchemist Arena (Fits 1024x768 without scroll) */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-3 p-3 min-h-0 overflow-hidden">
        {/* LEFT COLUMN (7 cols): Target Crystal Pedestal + Alchemist Owl & Live Golden Cauldron */}
        <div className="col-span-7 flex flex-col justify-between bg-slate-900/75 border border-indigo-500/30 rounded-2xl p-3 min-h-0 relative overflow-hidden">
          {/* Top Target Crystal Header Card */}
          <div className="flex items-center justify-between bg-indigo-950/80 border border-indigo-400/30 rounded-xl px-4 py-2.5 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>ALCHEMICAL RECIPE GOAL</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{currentLevel.description}</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/90 border-2 border-amber-400/70 rounded-xl px-4 py-1.5 shadow-lg shadow-amber-500/10">
              <div className="text-right">
                <span className="block text-[10px] font-black tracking-widest uppercase text-amber-300">
                  TARGET CRYSTAL
                </span>
                <span className="block text-xs text-slate-400 font-semibold">
                  {currentLevel.crystalName}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 flex items-center justify-center border-2 border-white shadow-md">
                <span
                  data-testid="target-crystal-value"
                  className="text-2xl font-black text-slate-950"
                >
                  {target}
                </span>
              </div>
            </div>
          </div>

          {/* Center Visual Stage: Alchemist Owl + Golden Bubbling Cauldron */}
          <div className="flex-1 flex items-center justify-center gap-4 min-h-0 my-1">
            {/* Alchemist Owl Companion — Detailed Multi-Layer Character */}
            <div className="flex flex-col items-center justify-center shrink-0 w-44 relative">
              {/* Reactive Arcane Halo behind the Owl */}
              <div
                className={cn(
                  'pointer-events-none absolute w-36 h-36 rounded-full blur-xl transition-all duration-500',
                  isTargetReached
                    ? 'bg-emerald-400/30 scale-110'
                    : selectedRune
                    ? 'bg-amber-400/25 scale-105'
                    : 'bg-indigo-500/20'
                )}
              />

              <svg
                viewBox="0 0 210 225"
                className={cn(
                  'w-40 h-44 drop-shadow-2xl transition-transform duration-500 animate-float-calm',
                  isTargetReached && 'scale-105'
                )}
              >
                <defs>
                  {/* Warm Tawny & Chestnut Owl Plumage */}
                  <radialGradient id="owlPlumageGrad" cx="45%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                    <stop offset="55%" stopColor="rgb(180, 83, 9)" />
                    <stop offset="100%" stopColor="rgb(92, 40, 12)" />
                  </radialGradient>

                  {/* Cream Heart-Shaped Facial Disc */}
                  <radialGradient id="owlFacialDiscGrad" cx="50%" cy="42%" r="58%">
                    <stop offset="0%" stopColor="rgb(255, 251, 235)" />
                    <stop offset="68%" stopColor="rgb(253, 230, 138)" />
                    <stop offset="100%" stopColor="rgb(217, 119, 6)" />
                  </radialGradient>

                  {/* Soft Buff Chest Feathers */}
                  <linearGradient id="owlChestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(254, 243, 199)" />
                    <stop offset="60%" stopColor="rgb(253, 224, 71)" />
                    <stop offset="100%" stopColor="rgb(217, 119, 6)" />
                  </linearGradient>

                  {/* Deep Luminous Astral Violet-Amber Iris */}
                  <radialGradient id="owlIrisGrad" cx="50%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="rgb(192, 132, 252)" />
                    <stop offset="45%" stopColor="rgb(99, 102, 241)" />
                    <stop offset="85%" stopColor="rgb(30, 27, 75)" />
                    <stop offset="100%" stopColor="rgb(15, 23, 42)" />
                  </radialGradient>

                  {/* Midnight Astral Velvet Hat & Cloak */}
                  <linearGradient id="wizardVelvetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(79, 70, 229)" />
                    <stop offset="50%" stopColor="rgb(49, 46, 129)" />
                    <stop offset="100%" stopColor="rgb(23, 21, 68)" />
                  </linearGradient>

                  {/* Rich Metallic Gold Trim */}
                  <linearGradient id="wizardGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(254, 240, 138)" />
                    <stop offset="50%" stopColor="rgb(251, 191, 36)" />
                    <stop offset="100%" stopColor="rgb(180, 83, 9)" />
                  </linearGradient>

                  {/* Sculpted Owl Beak */}
                  <linearGradient id="owlBeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(253, 224, 71)" />
                    <stop offset="55%" stopColor="rgb(245, 158, 11)" />
                    <stop offset="100%" stopColor="rgb(180, 83, 9)" />
                  </linearGradient>
                </defs>

                {/* Back Cloak Silhouette */}
                <path
                  d="M42 136 Q100 118 158 136 L172 204 Q100 218 28 204 Z"
                  fill="rgb(23, 21, 68)"
                />

                {/* Owl Rounded Body Base */}
                <ellipse
                  cx="100"
                  cy="156"
                  rx="48"
                  ry="46"
                  fill="url(#owlPlumageGrad)"
                  stroke="rgb(120, 53, 15)"
                  strokeWidth="2"
                />

                {/* Cream Feathered Belly Patch with Authentic Owl Chevron Markings */}
                <ellipse
                  cx="100"
                  cy="164"
                  rx="31"
                  ry="32"
                  fill="url(#owlChestGrad)"
                />
                <path
                  d="M86 152 L92 158 L98 152 M102 152 L108 158 L114 152 M82 166 L89 172 L96 166 M104 166 L111 172 L118 166 M91 180 L100 187 L109 180"
                  fill="none"
                  stroke="rgb(146, 64, 14)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />

                {/* Star-Spangled Astral Cloak Shoulders & Sleeves */}
                <path
                  d="M44 134 Q100 156 156 134 L168 194 Q138 205 118 196 L114 156 Q100 162 86 156 L82 196 Q62 205 32 194 Z"
                  fill="url(#wizardVelvetGrad)"
                  stroke="url(#wizardGoldGrad)"
                  strokeWidth="2.5"
                />

                {/* Constellation Lines & Stars on Cloak */}
                <polyline
                  points="48,162 60,154 68,168 58,180"
                  fill="none"
                  stroke="rgb(253, 224, 71)"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                <circle cx="48" cy="162" r="2.2" fill="rgb(254, 240, 138)" />
                <circle cx="60" cy="154" r="2.5" fill="rgb(254, 240, 138)" />
                <circle cx="68" cy="168" r="2" fill="rgb(254, 240, 138)" />
                <circle cx="58" cy="180" r="2.2" fill="rgb(254, 240, 138)" />

                <polyline
                  points="134,158 148,152 154,168 142,182"
                  fill="none"
                  stroke="rgb(253, 224, 71)"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                <circle cx="134" cy="158" r="2" fill="rgb(254, 240, 138)" />
                <circle cx="148" cy="152" r="2.5" fill="rgb(254, 240, 138)" />
                <circle cx="154" cy="168" r="2.2" fill="rgb(254, 240, 138)" />
                <circle cx="142" cy="182" r="2" fill="rgb(254, 240, 138)" />

                {/* Left Gesture Wing (Pointing / Casting toward the Cauldron) */}
                <g className={cn(isBubbling && 'scale-105')}>
                  <path
                    d="M44 138 C16 124, 8 146, 22 164 C12 168, 18 180, 34 176 C26 184, 36 190, 48 182 Z"
                    fill="url(#owlPlumageGrad)"
                    stroke="rgb(120, 53, 15)"
                    strokeWidth="2"
                  />
                  {/* Layered Flight Feather Tips */}
                  <path
                    d="M22 148 Q32 152 42 148 M25 162 Q35 165 44 160"
                    stroke="rgb(253, 230, 138)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Owl Head Base */}
                <ellipse
                  cx="100"
                  cy="112"
                  rx="46"
                  ry="38"
                  fill="url(#owlPlumageGrad)"
                  stroke="rgb(120, 53, 15)"
                  strokeWidth="2"
                />

                {/* Double-Heart Facial Disc (Realistic Owl Face Structure) */}
                <path
                  d="M100 94 C86 80, 56 86, 58 114 C60 136, 82 144, 100 142 C118 144, 140 136, 142 114 C144 86, 114 80, 100 94 Z"
                  fill="url(#owlFacialDiscGrad)"
                  stroke="rgb(180, 83, 9)"
                  strokeWidth="2"
                />

                {/* Expressive Horned Owl Feather Ear Tufts / Brows */}
                <path
                  d="M52 94 Q34 78 40 66 Q58 72 78 92 Z"
                  fill="url(#owlPlumageGrad)"
                  stroke="rgb(92, 40, 12)"
                  strokeWidth="2"
                />
                <path
                  d="M148 94 Q166 78 160 66 Q142 72 122 92 Z"
                  fill="url(#owlPlumageGrad)"
                  stroke="rgb(92, 40, 12)"
                  strokeWidth="2"
                />
                {/* Cream Highlight on Brow Tufts */}
                <path
                  d="M46 76 Q58 82 74 92 M154 76 Q142 82 126 92"
                  stroke="rgb(254, 243, 199)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Left & Right Large Luminous Owl Eyes */}
                {[78, 122].map((cx, i) => (
                  <g key={cx}>
                    {/* Golden Eye Socket Ring */}
                    <circle
                      cx={cx}
                      cy="114"
                      r="17"
                      fill="rgb(251, 191, 36)"
                      stroke="rgb(120, 53, 15)"
                      strokeWidth="2.2"
                    />
                    {/* Deep Astral Iris */}
                    <circle cx={cx} cy="114" r="14" fill="url(#owlIrisGrad)" />
                    {/* Dilated Obsidian Pupil */}
                    <circle cx={cx} cy="114" r="8.5" fill="rgb(10, 10, 28)" />
                    {/* Primary Glossy Catchlight */}
                    <circle cx={cx - 4.5} cy="109" r="4.2" fill="white" />
                    {/* Secondary Starlight Pinpoint */}
                    <circle cx={cx + 4.5} cy="119" r="2" fill="rgb(254, 240, 138)" />
                    {/* Subtle Rosy Cheek Glow */}
                    <ellipse
                      cx={i === 0 ? cx - 10 : cx + 10}
                      cy="129"
                      rx="6"
                      ry="3.2"
                      fill="rgb(251, 113, 133)"
                      opacity="0.45"
                    />
                  </g>
                ))}

                {/* Natural Blinking Eyelids */}
                <g className="animate-owl-blink">
                  <circle cx="78" cy="114" r="16" fill="url(#owlPlumageGrad)" />
                  <circle cx="122" cy="114" r="16" fill="url(#owlPlumageGrad)" />
                </g>

                {/* 3D Sculpted Hooked Owl Beak & Cheerful Smile */}
                <path
                  d="M93 125 Q100 139 107 125 Z"
                  fill="rgb(159, 18, 57)"
                  stroke="rgb(120, 53, 15)"
                  strokeWidth="1.5"
                />
                <path
                  d="M91 118 Q100 113 109 118 L100 133 Z"
                  fill="url(#owlBeakGrad)"
                  stroke="rgb(120, 53, 15)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Beak Highlight */}
                <path
                  d="M95 119 Q100 116 103 119"
                  stroke="rgb(254, 249, 195)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Golden Crescent Moon Clasp at Collar */}
                <circle
                  cx="100"
                  cy="148"
                  r="8"
                  fill="url(#wizardGoldGrad)"
                  stroke="rgb(254, 249, 195)"
                  strokeWidth="1.5"
                />
                <circle cx="103" cy="146" r="5" fill="rgb(49, 46, 129)" />

                {/* Curved Astral Wizard Hat (Matching Cover Art) */}
                {/* Wide Curved Hat Brim */}
                <path
                  d="M32 82 Q100 66 168 82 Q178 90 162 94 Q100 80 38 94 Q22 90 32 82 Z"
                  fill="url(#wizardVelvetGrad)"
                  stroke="url(#wizardGoldGrad)"
                  strokeWidth="2.5"
                />
                {/* Bent-Tip Conical Hat Crown */}
                <path
                  d="M52 82 C58 46, 84 18, 124 8 C138 5, 144 16, 132 26 C118 36, 134 56, 148 82 Z"
                  fill="url(#wizardVelvetGrad)"
                  stroke="url(#wizardGoldGrad)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Golden Hatband Ribbon */}
                <path
                  d="M51 80 Q100 70 149 80 L146 86 Q100 76 54 86 Z"
                  fill="url(#wizardGoldGrad)"
                />
                {/* Crescent Moon & Stars on Hat Crown */}
                <path
                  d="M96 36 A13 13 0 1 0 110 56 A10 10 0 1 1 96 36 Z"
                  fill="url(#wizardGoldGrad)"
                />
                <circle cx="76" cy="58" r="2.5" fill="rgb(254, 240, 138)" />
                <circle cx="122" cy="54" r="3" fill="rgb(254, 240, 138)" />
                <circle cx="114" cy="34" r="2" fill="rgb(254, 240, 138)" />

                {/* Right Wing + Animated Glowing Star Wand */}
                <g className="animate-wand-sway">
                  {/* Feathered Right Wing Hand */}
                  <path
                    d="M154 140 C178 134, 186 154, 168 168 C158 176, 146 168, 148 154 Z"
                    fill="url(#owlPlumageGrad)"
                    stroke="rgb(120, 53, 15)"
                    strokeWidth="2"
                  />
                  {/* Wand Shaft */}
                  <line
                    x1="158"
                    y1="164"
                    x2="184"
                    y2="92"
                    stroke="url(#wizardGoldGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Wand Star Halo */}
                  <circle
                    cx="185"
                    cy="88"
                    r="15"
                    fill="rgb(253, 224, 71)"
                    opacity="0.35"
                  />
                  {/* 5-Pointed Glowing Star Tip */}
                  <polygon
                    points="185,72 189,82 200,83 192,90 194,101 185,95 176,101 178,90 170,83 181,82"
                    fill="rgb(254, 240, 138)"
                    stroke="rgb(245, 158, 11)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Sculpted Golden Owl Talons Resting on Stone Table */}
                <g fill="url(#owlBeakGrad)" stroke="rgb(120, 53, 15)" strokeWidth="1.6">
                  <ellipse cx="76" cy="202" rx="5" ry="7" />
                  <ellipse cx="84" cy="203" rx="5" ry="7" />
                  <ellipse cx="92" cy="202" rx="5" ry="7" />
                  <ellipse cx="108" cy="202" rx="5" ry="7" />
                  <ellipse cx="116" cy="203" rx="5" ry="7" />
                  <ellipse cx="124" cy="202" rx="5" ry="7" />
                </g>
              </svg>
              <span className="text-[11px] font-extrabold text-amber-200 tracking-wide uppercase bg-indigo-950/90 px-3 py-0.5 rounded-full border border-amber-400/40 shadow-md -mt-1">
                Arch-Owl Archimedes
              </span>
            </div>

            {/* Golden Alchemist Cauldron SVG */}
            <div className="relative flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 240 210"
                className={cn(
                  'w-56 h-48 transition-transform duration-300',
                  isBubbling && 'scale-105'
                )}
              >
                <defs>
                  <linearGradient id="cauldronGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(253, 224, 71)" />
                    <stop offset="55%" stopColor="rgb(245, 158, 11)" />
                    <stop offset="100%" stopColor="rgb(180, 83, 9)" />
                  </linearGradient>
                  <linearGradient id="cauldronLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={liquidStopColorA} />
                    <stop offset="100%" stopColor={liquidStopColorB} />
                  </linearGradient>
                </defs>

                {/* Under-Cauldron Arcane Fire */}
                <path
                  d="M75 192 Q95 168 120 192 Q145 168 165 192 Z"
                  fill="rgb(249, 115, 22)"
                  opacity="0.85"
                />
                <path
                  d="M90 194 Q120 172 150 194 Z"
                  fill="rgb(253, 224, 71)"
                />

                {/* Cauldron Handles */}
                <circle cx="38" cy="110" r="14" fill="none" stroke="url(#cauldronGold)" strokeWidth="6" />
                <circle cx="202" cy="110" r="14" fill="none" stroke="url(#cauldronGold)" strokeWidth="6" />

                {/* Cauldron Main Pot */}
                <path
                  d="M45 68 C32 145, 65 182, 120 182 C175 182, 208 145, 195 68 Z"
                  fill="url(#cauldronGold)"
                  stroke="rgb(254, 243, 199)"
                  strokeWidth="3"
                />

                {/* Cauldron Rim */}
                <rect
                  x="38"
                  y="54"
                  width="164"
                  height="18"
                  rx="9"
                  fill="url(#cauldronGold)"
                  stroke="rgb(254, 243, 199)"
                  strokeWidth="2.5"
                />

                {/* Glowing Potion Liquid Surface */}
                <ellipse
                  cx="120"
                  cy="63"
                  rx="74"
                  ry="11"
                  fill="url(#cauldronLiquid)"
                />

                {/* Animated Alchemy Bubbles */}
                <circle cx="85" cy="56" r="6" fill={liquidStopColorA} opacity="0.9" />
                <circle cx="122" cy="50" r="8" fill={liquidStopColorA} opacity="0.85" />
                <circle cx="152" cy="57" r="5" fill={liquidStopColorA} opacity="0.9" />

                {/* Inner Cauldron Medallion */}
                <circle
                  cx="120"
                  cy="124"
                  r="42"
                  fill="rgb(15, 23, 42)"
                  stroke="rgb(254, 243, 199)"
                  strokeWidth="3"
                />
              </svg>

              {/* Live Cauldron Numeric Readout Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  {cauldronValue === null ? 'DROP A GEM' : 'CAULDRON CORE'}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    data-testid="cauldron-current-value"
                    className={cn(
                      'text-3xl font-black tracking-tight',
                      isTargetReached
                        ? 'text-emerald-300'
                        : cauldronValue === null
                        ? 'text-slate-500'
                        : 'text-white'
                    )}
                  >
                    {cauldronValue === null ? '—' : cauldronValue}
                  </span>
                  {selectedRune && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-sm font-black">
                      {selectedRune}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Recipe Step Scroll & Status Bar */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Step History Strip */}
            <div className="flex items-center justify-between bg-slate-950/90 border border-indigo-500/30 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 shrink-0">
                  RECIPE LOG:
                </span>
                {cauldronValue === null ? (
                  <span className="text-xs text-slate-400 italic">
                    Cauldron is empty — tap an Elemental Gem on the right to start brewing!
                  </span>
                ) : steps.length === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900/70 border border-indigo-400/40 text-xs font-bold text-indigo-100">
                    Base Gem: {cauldronValue} {selectedRune ? `${selectedRune} ?` : '(Pick a Spell Rune)'}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {steps.map(step => (
                      <span
                        key={step.id}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-900/80 border border-indigo-400/40 text-xs font-extrabold text-white"
                      >
                        {step.fromValue} {step.rune} {step.gemValue} = {step.resultValue}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <span
                className={cn(
                  'text-xs font-black px-2.5 py-1 rounded-lg shrink-0',
                  isTargetReached
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : cauldronValue === target && steps.length === 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-800 text-slate-300'
                )}
              >
                {isTargetReached
                  ? 'ELIXIR READY!'
                  : cauldronValue === null
                  ? `NEED ${target}`
                  : `CURRENT: ${cauldronValue} / TARGET: ${target}`}
              </span>
            </div>

            {/* Dynamic Feedback Banner */}
            <div
              className={cn(
                'px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between',
                feedback?.type === FEEDBACK_TYPE.SUCCESS
                  ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200'
                  : feedback?.type === FEEDBACK_TYPE.WARN
                  ? 'bg-amber-950/80 border-amber-400/50 text-amber-200'
                  : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-200'
              )}
            >
              <span>
                {feedback?.text ??
                  'Step 1: Tap an Elemental Gem -> Step 2: Tap a Spell Rune -> Step 3: Tap another Gem!'}
              </span>
              {isForged && (
                <button
                  onClick={handleNextLevel}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  <span>{levelIndex + 1 < FORGE_LEVELS.length ? 'NEXT SANCTUM' : 'FINISH QUEST'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Elemental Gems Tray + Spell Runes + Forge Controls */}
        <div className="col-span-5 flex flex-col justify-between gap-2.5 min-h-0">
          {/* Panel 1: Elemental Number Gems */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                1. ELEMENTAL NUMBER GEMS
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {cauldronValue === null
                  ? 'Tap first gem'
                  : selectedRune
                  ? `Tap gem to apply ${selectedRune}`
                  : 'Select a rune below'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {currentLevel.gems.map(gem => {
                const isUsed = usedGemIds.includes(gem.id);
                return (
                  <button
                    key={gem.id}
                    disabled={isUsed || isForged}
                    onClick={() => handleSelectGem(gem)}
                    aria-label={`Gem ${gem.value}`}
                    className={cn(
                      'relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all cursor-pointer',
                      isUsed
                        ? 'bg-slate-800/40 border-slate-700/50 text-slate-600 opacity-40 cursor-not-allowed'
                        : cn(
                            'bg-gradient-to-br shadow-lg hover:scale-105 active:scale-95',
                            gem.colorClass,
                            gem.borderClass,
                            gem.glowClass
                          )
                    )}
                  >
                    <span className="text-2xl font-black leading-none">{gem.value}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-tight mt-1 opacity-85">
                      {isUsed ? 'IN CAULDRON' : gem.elementName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel 2: Alchemical Spell Runes (+, -, ×) */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                2. SPELL RUNES (OPERATIONS)
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {selectedRune ? `Active: ${selectedRune}` : 'Choose operation'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {currentLevel.runes.map(rune => {
                const isSelected = selectedRune === rune;
                const runeLabel =
                  rune === RUNE_OP.ADD ? 'ADD' : rune === RUNE_OP.SUB ? 'SUBTRACT' : 'MULTIPLY';
                return (
                  <button
                    key={rune}
                    disabled={isForged}
                    onClick={() => handleSelectRune(rune)}
                    aria-label={`Rune ${rune}`}
                    className={cn(
                      'flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border-2 font-black transition-all cursor-pointer active:scale-95',
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg shadow-amber-400/30 scale-105'
                        : cauldronValue !== null && selectedRune === null
                        ? 'bg-indigo-900/90 hover:bg-indigo-800 text-white border-amber-300/70'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-indigo-200 border-indigo-500/40'
                    )}
                  >
                    <span className="text-2xl leading-none">{rune}</span>
                    <span className="text-[10px] tracking-wider uppercase mt-1">{runeLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Safety Net Controls (Undo / Empty) + Big FORGE CRYSTAL Button */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUndoStep}
                disabled={cauldronValue === null || isForged}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-extrabold transition',
                  cauldronValue === null || isForged
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 active:scale-95 cursor-pointer'
                )}
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                <span>UNDO STEP</span>
              </button>

              <button
                onClick={handleEmptyCauldron}
                disabled={cauldronValue === null || isForged}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-extrabold transition',
                  cauldronValue === null || isForged
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-rose-300 active:scale-95 cursor-pointer'
                )}
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>EMPTY CAULDRON</span>
              </button>
            </div>

            <button
              onClick={handleForgeCrystal}
              disabled={!isTargetReached || isForged}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 border-2 transition-all',
                isForged
                  ? 'bg-emerald-600 text-white border-emerald-300 cursor-default'
                  : isTargetReached
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 border-white shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isForged
                  ? 'CRYSTAL FORGED!'
                  : isTargetReached
                  ? 'FORGE CRYSTAL'
                  : 'BREW TARGET TO FORGE'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Info Modal */}
      {showClinicalInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-400/50 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-sm uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Math Quest 3: Flexible Arithmetic & Pre-Algebra</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong>Number Forge Alchemist</strong> develops cognitive flexibility and number
              sense by allowing learners to reach target values through multiple valid operation
              paths (+, -, ×). Live cauldron feedback removes order-of-operations anxiety while
              Undo and Owl Hints support errorless learning.
            </p>
            <button
              onClick={() => setShowClinicalInfo(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Resume Alchemy
            </button>
          </div>
        </div>
      )}

      {/* Grand Victory Modal (After all 10 Sanctums) */}
      {showVictory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center">
              <Trophy className="w-9 h-9 text-amber-300" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wide">
              GRAND ALCHEMIST!
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              You mastered all 10 Alchemical Sanctums and forged the Philosopher Stone!
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 flex justify-around">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">FINAL SCORE</span>
                <span className="text-xl font-black text-amber-300">{score}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">MAX STREAK</span>
                <span className="text-xl font-black text-emerald-300">{streak}</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleRestartAll}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase cursor-pointer"
              >
                Play Again
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Mission Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
