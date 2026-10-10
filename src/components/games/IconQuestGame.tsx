import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { 
  AacCardImage,
  AacSymbolId, 
  AAC_SYMBOLS_MAP 
} from './AacIconGlyph';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Volume2, 
  X, 
  Eye, 
  Hand,
  CheckCircle2,
  Compass,
  Shuffle,
  Dices
} from 'lucide-react';

interface IconQuestGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

export type GuidanceLevel = 'full' | 'partial' | 'independent';

interface QuestStage {
  id: number;
  title: string;
  location: string;
  phrase: AacSymbolId[];
  targetSentence: string;
  description: string;
  actionText: string;
}

export type QuestGameMode = 'story' | 'random';

const QUEST_STORY_STAGES: QuestStage[] = [
  {
    id: 1,
    title: 'The Sunken Temple Gate',
    location: 'Ancient Stone Pass',
    phrase: ['open'],
    targetSentence: 'Open',
    description: 'The ancient stone gate is sealed! Speak "OPEN" to unlock the entrance.',
    actionText: 'The ancient temple gate lowers into the ground!',
  },
  {
    id: 2,
    title: 'The Crystal Chasm',
    location: 'Bioluminescent Canyon',
    phrase: ['want', 'bridge'],
    targetSentence: 'Want Bridge',
    description: 'A deep ravine blocks our way. Speak "WANT" + "BRIDGE" to summon the path!',
    actionText: 'A radiant crystal bridge manifests across the chasm!',
  },
  {
    id: 3,
    title: 'The Sky Beacon Lighthouse',
    location: 'Starlight Cliffside',
    phrase: ['more', 'star'],
    targetSentence: 'More Star',
    description: 'The beacon needs celestial energy. Speak "MORE" + "STAR" to ignite the light!',
    actionText: 'The grand lighthouse ignites and pierces the cosmic fog!',
  },
  {
    id: 4,
    title: 'The Singing Coral Grove',
    location: 'Crystal Lagoon',
    phrase: ['go', 'play'],
    targetSentence: 'Go Play',
    description: 'Friendly island creatures await! Speak "GO" + "PLAY" to dance with them!',
    actionText: 'Bioluminescent flora blossom and musical fireflies dance!',
  },
  {
    id: 5,
    title: 'The Celestial Treasure Vault',
    location: 'Temple of the Starlight King',
    phrase: ['want', 'crystal', 'please'],
    targetSentence: 'Want Crystal Please',
    description: 'The final vault awaits! Speak "WANT" + "CRYSTAL" + "PLEASE" to open the chest!',
    actionText: 'The cosmic treasure vault unlocks with showers of starlight!',
  },
];

const ALL_RANDOM_QUESTS: QuestStage[] = [
  // 1-Word Functional Manding / Tacts
  {
    id: 101,
    title: 'The Sunken Temple Gate',
    location: 'Ancient Stone Pass',
    phrase: ['open'],
    targetSentence: 'Open',
    description: 'The ancient stone gate is sealed! Speak "OPEN" to unlock the entrance.',
    actionText: 'The ancient temple gate lowers into the ground!',
  },
  {
    id: 102,
    title: 'The Starlight Playground',
    location: 'Celestial Meadows',
    phrase: ['play'],
    targetSentence: 'Play',
    description: 'The cosmic toys are asleep! Speak "PLAY" to activate the playground.',
    actionText: 'Musical instruments glow and start playing happy tunes!',
  },
  {
    id: 103,
    title: 'The Lost Explorer Drone',
    location: 'Whispering Canyon',
    phrase: ['help'],
    targetSentence: 'Help',
    description: 'A friendly rover is stuck! Speak "HELP" to assist him.',
    actionText: 'The friendly drone lights up and thanks you with a happy beep!',
  },
  {
    id: 104,
    title: 'The Observatory Telescope',
    location: 'Starlight Cliffside',
    phrase: ['look'],
    targetSentence: 'Look',
    description: 'A shooting comet is passing by! Speak "LOOK" to aim the telescope.',
    actionText: 'The brass telescope focuses on a magnificent golden nebula!',
  },
  {
    id: 105,
    title: 'The Runaway Stardust Turbine',
    location: 'Windmill Plateau',
    phrase: ['stop'],
    targetSentence: 'Stop',
    description: 'The turbine is spinning too fast! Speak "STOP" to steady it.',
    actionText: 'The turbine slows down and releases a peaceful blue shimmer!',
  },
  {
    id: 106,
    title: 'The Wishing Well of Stars',
    location: 'Crystal Oasis',
    phrase: ['more'],
    targetSentence: 'More',
    description: 'The magical fountain needs extra energy! Speak "MORE" for starlight.',
    actionText: 'Glistening water fountains leap into the air with golden bubbles!',
  },
  {
    id: 107,
    title: 'The Sleeping Starlight Sprite',
    location: 'Cosmic Canopy',
    phrase: ['star'],
    targetSentence: 'Star',
    description: 'A friendly star sprite wants to say hello! Speak "STAR" to call it.',
    actionText: 'A smiling 3D star character descends and twirls with joy!',
  },
  {
    id: 108,
    title: 'The Geode Crystal Cavern',
    location: 'Prism Caves',
    phrase: ['crystal'],
    targetSentence: 'Crystal',
    description: 'The glowing cavern needs energy! Speak "CRYSTAL" to illuminate.',
    actionText: 'Giant amethyst and cyan crystals ignite with luminescence!',
  },

  // 2-Word Functional Carrier Phrases
  {
    id: 201,
    title: 'The Crystal Chasm',
    location: 'Bioluminescent Canyon',
    phrase: ['want', 'bridge'],
    targetSentence: 'Want Bridge',
    description: 'A deep ravine blocks our way. Speak "WANT" + "BRIDGE" to summon the path!',
    actionText: 'A radiant crystal bridge manifests across the chasm!',
  },
  {
    id: 202,
    title: 'The Night Sky Pavilion',
    location: 'Astral Highlands',
    phrase: ['want', 'star'],
    targetSentence: 'Want Star',
    description: 'The night sky needs a bright star. Speak "WANT" + "STAR" to place it!',
    actionText: 'A magnificent constellation ignites in the midnight sky!',
  },
  {
    id: 203,
    title: 'The Cosmic Jeweled Altar',
    location: 'Gemstone Valley',
    phrase: ['want', 'crystal'],
    targetSentence: 'Want Crystal',
    description: 'The altar asks for a crystal tribute. Speak "WANT" + "CRYSTAL"!',
    actionText: 'The gemstone altar sparkles with dazzling rainbow prisms!',
  },
  {
    id: 204,
    title: 'The Sky Beacon Lighthouse',
    location: 'Starlight Cliffside',
    phrase: ['more', 'star'],
    targetSentence: 'More Star',
    description: 'The beacon needs celestial energy. Speak "MORE" + "STAR" to ignite the light!',
    actionText: 'The grand lighthouse ignites and pierces the cosmic fog!',
  },
  {
    id: 205,
    title: 'The Power Core Chamber',
    location: 'Subterranean Vault',
    phrase: ['more', 'crystal'],
    targetSentence: 'More Crystal',
    description: 'The power core is low. Speak "MORE" + "CRYSTAL" to recharge it.',
    actionText: 'The energy crystal matrix hums with radiant turquoise power!',
  },
  {
    id: 206,
    title: 'The Singing Coral Grove',
    location: 'Crystal Lagoon',
    phrase: ['go', 'play'],
    targetSentence: 'Go Play',
    description: 'Friendly island creatures await! Speak "GO" + "PLAY" to dance with them!',
    actionText: 'Bioluminescent flora blossom and musical fireflies dance!',
  },
  {
    id: 207,
    title: 'The Heavy Island Hatch',
    location: 'Forgotten Bunker',
    phrase: ['help', 'open'],
    targetSentence: 'Help Open',
    description: 'The underground passage is heavy! Speak "HELP" + "OPEN" together.',
    actionText: 'Hydraulic gears turn and the heavy hatch swings open wide!',
  },
  {
    id: 208,
    title: 'The Celestial Skylight',
    location: 'Mount Zenith',
    phrase: ['look', 'star'],
    targetSentence: 'Look Star',
    description: 'A shooting star crosses the peak! Speak "LOOK" + "STAR" to spot it.',
    actionText: 'Shooting stardust trails trace across the starlit sky!',
  },
  {
    id: 209,
    title: 'The Shimmering Grotto',
    location: 'Mirror Cave',
    phrase: ['look', 'crystal'],
    targetSentence: 'Look Crystal',
    description: 'A prism crystal is hiding! Speak "LOOK" + "CRYSTAL" to discover it.',
    actionText: 'The hidden prism catches the light and reveals secret ruins!',
  },
  {
    id: 210,
    title: 'The Whirling Musical Carousel',
    location: 'Fairground Island',
    phrase: ['stop', 'play'],
    targetSentence: 'Stop Play',
    description: 'The magical carousel is spinning wild! Speak "STOP" + "PLAY" to pause it.',
    actionText: 'The musical carousel comes to a calm, safe resting stop!',
  },
  {
    id: 211,
    title: 'The Stranded Sailor Bot',
    location: 'Shell Beach',
    phrase: ['please', 'help'],
    targetSentence: 'Please Help',
    description: 'A robotic sailor needs assistance. Speak "PLEASE" + "HELP" nicely.',
    actionText: 'The sailor robot salutes with gratitude and fixes his boat!',
  },

  // 3-Word Expanded Phrases
  {
    id: 301,
    title: 'The Celestial Treasure Vault',
    location: 'Temple of the Starlight King',
    phrase: ['want', 'crystal', 'please'],
    targetSentence: 'Want Crystal Please',
    description: 'The final vault awaits! Speak "WANT" + "CRYSTAL" + "PLEASE" to open the chest!',
    actionText: 'The cosmic treasure vault unlocks with showers of starlight!',
  },
  {
    id: 302,
    title: 'The Wishing Tree of Eldoria',
    location: 'Enchanted Forest',
    phrase: ['want', 'star', 'please'],
    targetSentence: 'Want Star Please',
    description: 'Ask the wishing tree politely: Speak "WANT" + "STAR" + "PLEASE"!',
    actionText: 'Golden starlight fruit drops gently from the branches!',
  },
  {
    id: 303,
    title: 'The Grand Sky Bridge Gate',
    location: 'Cloudtop Fortress',
    phrase: ['want', 'bridge', 'please'],
    targetSentence: 'Want Bridge Please',
    description: 'Request access across the clouds: Speak "WANT" + "BRIDGE" + "PLEASE"!',
    actionText: 'A golden starlight bridge extends across the floating clouds!',
  },
  {
    id: 304,
    title: 'The Constellation Weaver',
    location: 'Cosmic Loom',
    phrase: ['more', 'star', 'please'],
    targetSentence: 'More Star Please',
    description: 'Add more starlight to complete the tapestry: Speak "MORE" + "STAR" + "PLEASE"!',
    actionText: 'The celestial tapestry glows with radiant starlight patterns!',
  },
  {
    id: 305,
    title: 'The Crystal Alchemist',
    location: 'Alchemy Lab',
    phrase: ['more', 'crystal', 'please'],
    targetSentence: 'More Crystal Please',
    description: 'The beaker needs crystals: Speak "MORE" + "CRYSTAL" + "PLEASE"!',
    actionText: 'The beaker bubbles with radiant luminescent starlight potion!',
  },
  {
    id: 306,
    title: 'The Ancient Golden Archive',
    location: 'Royal Library',
    phrase: ['please', 'help', 'open'],
    targetSentence: 'Please Help Open',
    description: 'Ask for assistance at the grand vault: Speak "PLEASE" + "HELP" + "OPEN"!',
    actionText: 'The golden archive doors slide back to reveal ancient scrolls!',
  },
  {
    id: 307,
    title: 'The Island Carnival Finale',
    location: 'Festival Plaza',
    phrase: ['go', 'play', 'more'],
    targetSentence: 'Go Play More',
    description: 'Keep the island party going! Speak "GO" + "PLAY" + "MORE"!',
    actionText: 'Fireworks burst in the sky and all the island friends dance!',
  },
];

// 3x4 Grid of Core AAC Vocabulary
const AAC_GRID_LAYOUT: AacSymbolId[] = [
  'want', 'go', 'open', 'play',
  'look', 'help', 'stop', 'more',
  'please', 'star', 'crystal', 'bridge'
];

export const IconQuestGame = ({ onExit }: IconQuestGameProps) => {
  // Game Mode: Sequential Story Mode vs Random Procedural Mode
  const [questMode, setQuestMode] = useState<QuestGameMode>('story');
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [randomQuestIndex, setRandomQuestIndex] = useState(0);
  const [randomRoundCount, setRandomRoundCount] = useState(1);
  
  // RBT Physical Guidance Level (Skill 10 Clinical Target)
  const [guidanceLevel, setGuidanceLevel] = useState<GuidanceLevel>('full');

  // Sentence Strip state (collected symbols)
  const [sentenceStrip, setSentenceStrip] = useState<AacSymbolId[]>([]);
  const [currentStepInPhrase, setCurrentStepInPhrase] = useState(0);

  // Gameplay score & feedback
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isQuestSolved, setIsQuestSolved] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // ABA Clinical Verification Metrics
  const [guidedTouchesCount, setGuidedTouchesCount] = useState(0);
  const [independentTouchesCount, setIndependentTouchesCount] = useState(0);
  const [wordsSpokenCount, setWordsSpokenCount] = useState(0);

  // Visual World Animation State
  const [islandState, setIslandState] = useState({
    gateOpen: false,
    bridgeActive: false,
    beaconLit: false,
    creaturesDancing: false,
    chestOpen: false,
  });

  const activeQuest = questMode === 'story' 
    ? (QUEST_STORY_STAGES[currentQuestIndex] || QUEST_STORY_STAGES[0])
    : (ALL_RANDOM_QUESTS[randomQuestIndex] || ALL_RANDOM_QUESTS[0]);

  const targetSymbolId = activeQuest?.phrase[currentStepInPhrase];

  // Pick a fresh random quest from the pool
  const pickNewRandomQuest = useCallback(() => {
    soundEngine.playTap();
    setSentenceStrip([]);
    setCurrentStepInPhrase(0);
    setIsQuestSolved(false);
    setFeedbackMessage(null);
    setRandomRoundCount(r => r + 1);
    setRandomQuestIndex((prev) => {
      let next = Math.floor(Math.random() * ALL_RANDOM_QUESTS.length);
      if (next === prev) {
        next = (next + 1) % ALL_RANDOM_QUESTS.length;
      }
      return next;
    });
  }, []);

  // Toggle between Story Mode and Random Mode
  const toggleQuestMode = useCallback(() => {
    soundEngine.playTap();
    const nextMode = questMode === 'story' ? 'random' : 'story';
    setQuestMode(nextMode);
    setSentenceStrip([]);
    setCurrentStepInPhrase(0);
    setIsQuestSolved(false);
    setFeedbackMessage(null);
    if (nextMode === 'random') {
      setRandomQuestIndex(Math.floor(Math.random() * ALL_RANDOM_QUESTS.length));
    }
  }, [questMode]);

  // Auto-play Guide Spark sound on step change
  const prevTargetRef = useRef<AacSymbolId | undefined>(targetSymbolId);
  useEffect(() => {
    if (targetSymbolId && targetSymbolId !== prevTargetRef.current && !isQuestSolved) {
      prevTargetRef.current = targetSymbolId;
      if (guidanceLevel !== 'independent') {
        soundEngine.playGuideSpark();
      }
    }
  }, [targetSymbolId, guidanceLevel, isQuestSolved]);

  // Handle Touch on an AAC Symbol Button
  const handleSymbolTap = useCallback((symbolId: AacSymbolId) => {
    if (isQuestSolved || isVictory) return;

    const symbolData = AAC_SYMBOLS_MAP[symbolId];
    if (!symbolData) return;

    // 1. Tactile click & Speech Synthesis
    soundEngine.playAacTap();
    soundEngine.speakAac(symbolData.audioSpeech);
    setWordsSpokenCount(w => w + 1);

    // 2. Track ABA prompt metrics
    if (guidanceLevel === 'full') {
      setGuidedTouchesCount(g => g + 1);
    } else {
      setIndependentTouchesCount(i => i + 1);
    }

    // 3. Evaluate Match against current quest sequence step
    if (symbolId === targetSymbolId) {
      const nextStrip = [...sentenceStrip, symbolId];
      setSentenceStrip(nextStrip);

      const nextStep = currentStepInPhrase + 1;
      setCurrentStepInPhrase(nextStep);

      // Check if full phrase completed
      if (nextStep >= activeQuest.phrase.length) {
        setIsQuestSolved(true);
        soundEngine.playAacPhraseSuccess();

        // Speak full sentence upon completion
        setTimeout(() => {
          soundEngine.speakAac(activeQuest.targetSentence);
        }, 350);

        // Update Island Diorama Animation
        setIslandState(prev => ({
          ...prev,
          gateOpen: prev.gateOpen || activeQuest.phrase.includes('open') || activeQuest.phrase.includes('help') || activeQuest.id === 1,
          bridgeActive: prev.bridgeActive || activeQuest.phrase.includes('bridge') || activeQuest.phrase.includes('go') || activeQuest.id === 2,
          beaconLit: prev.beaconLit || activeQuest.phrase.includes('star') || activeQuest.phrase.includes('look') || activeQuest.id === 3,
          creaturesDancing: prev.creaturesDancing || activeQuest.phrase.includes('play') || activeQuest.phrase.includes('more') || activeQuest.id === 4,
          chestOpen: prev.chestOpen || activeQuest.phrase.includes('crystal') || activeQuest.phrase.includes('please') || activeQuest.id === 5,
        }));

        setScore(s => s + 100);
        setFeedbackMessage(`QUEST COMPLETE! ⭐ +100`);

        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
        } catch { /* ignore */ }

        // Advance to next quest after celebration (2.8s)
        setTimeout(() => {
          if (questMode === 'story') {
            if (currentQuestIndex + 1 >= QUEST_STORY_STAGES.length) {
              setIsVictory(true);
              soundEngine.playSuccess();
              try {
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
              } catch { /* ignore */ }
            } else {
              setCurrentQuestIndex(q => q + 1);
              setSentenceStrip([]);
              setCurrentStepInPhrase(0);
              setIsQuestSolved(false);
              setFeedbackMessage(null);
            }
          } else {
            // Endless Random Mode: roll next quest seamlessly
            setSentenceStrip([]);
            setCurrentStepInPhrase(0);
            setIsQuestSolved(false);
            setFeedbackMessage(null);
            setRandomRoundCount(r => r + 1);
            setRandomQuestIndex((prev) => {
              let next = Math.floor(Math.random() * ALL_RANDOM_QUESTS.length);
              if (next === prev) {
                next = (next + 1) % ALL_RANDOM_QUESTS.length;
              }
              return next;
            });
          }
        }, 2800);
      } else {
        // Correct partial touch (e.g. "WANT" in "WANT BRIDGE")
        setScore(s => s + 25);
        setFeedbackMessage('GREAT TOUCH! 👍');
        setTimeout(() => setFeedbackMessage(null), 1200);
      }
    } else {
      // Gentle redirect without penalty
      setFeedbackMessage('Follow the guide light! 🎯');
      soundEngine.playTap();
      setTimeout(() => setFeedbackMessage(null), 1200);
    }
  }, [
    isQuestSolved, 
    isVictory, 
    targetSymbolId, 
    sentenceStrip, 
    currentStepInPhrase, 
    activeQuest, 
    guidanceLevel, 
    currentQuestIndex,
    questMode
  ]);

  // Read entire sentence strip aloud
  const handleSpeakSentenceStrip = () => {
    if (sentenceStrip.length === 0) return;
    const sentence = sentenceStrip.map(id => AAC_SYMBOLS_MAP[id].label).join(' ');
    soundEngine.speakAac(sentence);
    soundEngine.playAacTap();
  };

  // Clear sentence strip
  const handleClearStrip = () => {
    soundEngine.playTap();
    setSentenceStrip([]);
    setCurrentStepInPhrase(0);
  };

  // Restart Island Adventure
  const handleRestart = () => {
    soundEngine.playTap();
    setCurrentQuestIndex(0);
    setSentenceStrip([]);
    setCurrentStepInPhrase(0);
    setIsQuestSolved(false);
    setIsVictory(false);
    setScore(0);
    setGuidedTouchesCount(0);
    setIndependentTouchesCount(0);
    setWordsSpokenCount(0);
    setIslandState({
      gateOpen: false,
      bridgeActive: false,
      beaconLit: false,
      creaturesDancing: false,
      chestOpen: false,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#00242e] via-[#003442] to-[#00171f] overflow-hidden relative select-none">
      {/* Background Ambience */}
      <CosmicBackground />

      {/* TOP HUD: Missions, Quest Number, Score & RBT Guidance Mode */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Exit & Location */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </button>

          {/* Quest Progress Indicator */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/15">
            <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="text-xs font-black text-white">
              {questMode === 'story' ? (
                <>Quest: <strong className="text-yellow-300 font-extrabold">{currentQuestIndex + 1} / {QUEST_STORY_STAGES.length}</strong></>
              ) : (
                <>Round: <strong className="text-yellow-300 font-extrabold">#{randomRoundCount} (Random)</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Center: RBT GUIDANCE SELECTOR (SKILL 10 PROMPTING PROTOCOL) */}
        <div className="flex items-center gap-1 bg-[#00242e] rounded-full p-0.5 border border-white/15 shadow-inner">
          <span className="hidden md:inline px-2 text-[10px] font-black uppercase text-[#84cece] tracking-wider">
            Guide Mode:
          </span>

          <button
            onClick={() => {
              soundEngine.playTap();
              setGuidanceLevel('full');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              guidanceLevel === 'full'
                ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-200'
                : 'text-[#84cece] hover:text-white'
            }`}
            title="Hand-over-hand golden spark guide"
          >
            <Hand className="w-3 h-3" />
            <span>Full Guide</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              setGuidanceLevel('partial');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              guidanceLevel === 'partial'
                ? 'bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-200'
                : 'text-[#84cece] hover:text-white'
            }`}
            title="Pulsing shadow prompt"
          >
            <Eye className="w-3 h-3" />
            <span>Shadow</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              setGuidanceLevel('independent');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              guidanceLevel === 'independent'
                ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-200'
                : 'text-[#84cece] hover:text-white'
            }`}
            title="Independent selection without guide"
          >
            <Sparkles className="w-3 h-3" />
            <span>Independent</span>
          </button>
        </div>

        {/* Right: Score */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      {/* UPPER HALF: INTERACTIVE ISLAND DIORAMA */}
      <div className="h-36 md:h-44 relative overflow-hidden flex flex-col justify-start px-4 pt-2 border-b border-[#00576b]/70 bg-gradient-to-b from-[#00171f]/80 to-[#002f3c]/90">
        {/* Floating Quest Description Card */}
        <div className="z-20 flex items-center justify-between gap-2 w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-[#001f28]/90 border border-amber-400/50 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-yellow-300 font-black text-xs shrink-0">
              {questMode === 'story' ? `${currentQuestIndex + 1}/5` : `#${randomRoundCount}`}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase text-amber-300">
                {activeQuest.location} · {activeQuest.title}
              </span>
              <span className="text-xs font-bold text-white leading-tight">
                {isQuestSolved ? activeQuest.actionText : activeQuest.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Feedback Pop-Up */}
            {feedbackMessage && (
              <div className="animate-bounce bg-slate-950/95 border-2 border-yellow-400 text-yellow-300 font-black px-3 py-1 rounded-full text-xs shadow-xl tracking-wide uppercase shrink-0">
                {feedbackMessage}
              </div>
            )}

            {/* Mode Switcher */}
            <button
              onClick={toggleQuestMode}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all flex items-center gap-1 shadow-sm cursor-pointer ${
                questMode === 'random'
                  ? 'bg-purple-600/90 hover:bg-purple-500 text-white border-purple-400'
                  : 'bg-[#002833] hover:bg-[#003847] text-[#84cece] border-white/10'
              }`}
              title={questMode === 'random' ? 'Random Mode active (infinite)' : 'Switch to Random Mode'}
            >
              <Shuffle className="w-3 h-3" />
              <span>{questMode === 'random' ? 'Random' : 'Story'}</span>
            </button>

            {questMode === 'random' && (
              <button
                onClick={pickNewRandomQuest}
                className="p-1.5 bg-[#002833] hover:bg-[#003d4c] active:scale-95 text-yellow-300 rounded-xl border border-yellow-400/40 transition-all cursor-pointer"
                title="Roll a new random quest"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Animated Vector Island Environment Scene */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10 pb-1">
          <svg viewBox="0 0 800 200" width="100%" height="100%" className="max-w-4xl opacity-95" fill="none">
            {/* Distant Mystical Mountains */}
            <polygon points="50,180 180,60 300,180" fill="#002b36" opacity="0.8" />
            <polygon points="220,180 340,40 480,180" fill="#003d4c" opacity="0.9" />
            <polygon points="420,180 560,70 700,180" fill="#002b36" opacity="0.8" />

            {/* Glowing Moon / Starlight Sun */}
            <circle cx="340" cy="40" r="16" fill="#fef08a" opacity="0.9" className="animate-pulse" />

            {/* Ocean Waters Base */}
            <rect x="0" y="165" width="800" height="35" fill="#001a24" />
            <line x1="0" y1="165" x2="800" y2="165" stroke="#00f2c9" strokeWidth="2" opacity="0.4" />

            {/* Quest 1 Diorama: Temple Gate */}
            <g transform="translate(100, 75)">
              {/* Stone Pillars */}
              <rect x="0" y="10" width="16" height="80" rx="3" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
              <rect x="64" y="10" width="16" height="80" rx="3" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
              <rect x="-8" y="10" width="96" height="14" rx="2" fill="#115e59" stroke="#2dd4bf" strokeWidth="2" />
              {/* Gate Door (lowers if gateOpen is true) */}
              <rect 
                x="16" 
                y={islandState.gateOpen ? 55 : 24} 
                width="48" 
                height="65" 
                rx="2" 
                fill="#042f2e" 
                stroke="#5eead4" 
                strokeWidth="2" 
                className="transition-all duration-1000"
              />
              {islandState.gateOpen && (
                <circle cx="40" cy="50" r="12" fill="#facc15" className="animate-ping" opacity="0.75" />
              )}
            </g>

            {/* Quest 2 Diorama: Crystal Chasm Bridge */}
            <g transform="translate(260, 110)">
              {/* Chasm Ravine */}
              <polygon points="0,55 30,80 70,80 100,55" fill="#00171f" />
              {/* Rainbow Bridge (grows if bridgeActive is true) */}
              <path 
                d="M5 55 Q 50 25 95 55" 
                stroke={islandState.bridgeActive ? '#38bdf8' : '#003442'} 
                strokeWidth={islandState.bridgeActive ? '6' : '2'} 
                strokeDasharray={islandState.bridgeActive ? 'none' : '4 4'}
                className="transition-all duration-700"
              />
              {islandState.bridgeActive && (
                <circle cx="50" cy="40" r="8" fill="#a78bfa" className="animate-pulse" />
              )}
            </g>

            {/* Quest 3 Diorama: Lighthouse Beacon */}
            <g transform="translate(430, 60)">
              {/* Lighthouse Tower */}
              <polygon points="20,105 10,20 35,20 25,105" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <rect x="5" y="15" width="35" height="10" rx="2" fill="#0369a1" />
              {/* Beacon Light Dome */}
              <circle cx="22" cy="10" r="8" fill={islandState.beaconLit ? '#fde047' : '#075985'} stroke="#ffffff" strokeWidth="2" />
              {islandState.beaconLit && (
                <>
                  <line x1="22" y1="10" x2="160" y2="-20" stroke="#fef08a" strokeWidth="6" opacity="0.75" className="animate-pulse" />
                  <circle cx="22" cy="10" r="16" fill="#facc15" opacity="0.4" className="animate-ping" />
                </>
              )}
            </g>

            {/* Quest 4 Diorama: Dancing Crystal Creatures */}
            <g transform="translate(560, 105)">
              <circle cx="25" cy="50" r="12" fill={islandState.creaturesDancing ? '#ec4899' : '#831843'} stroke="#f472b6" strokeWidth="2" className={islandState.creaturesDancing ? 'animate-bounce' : ''} />
              <circle cx="55" cy="45" r="14" fill={islandState.creaturesDancing ? '#a855f7' : '#581c87'} stroke="#c084fc" strokeWidth="2" className={islandState.creaturesDancing ? 'animate-bounce' : ''} style={{ animationDelay: '0.2s' }} />
              {islandState.creaturesDancing && (
                <path d="M25 30L27 24L33 28" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
              )}
            </g>

            {/* Quest 5 Diorama: Celestial Starlight Chest */}
            <g transform="translate(680, 115)">
              <rect x="0" y="20" width="46" height="30" rx="4" fill="#854d0e" stroke="#facc15" strokeWidth="2.5" />
              <path 
                d={islandState.chestOpen ? 'M0 20L23 -5L46 20' : 'M0 20L23 10L46 20'} 
                stroke="#facc15" 
                strokeWidth="3" 
                fill="#a16207" 
                className="transition-all duration-500" 
              />
              <circle cx="23" cy="35" r="4" fill="#ffffff" />
              {islandState.chestOpen && (
                <circle cx="23" cy="5" r="12" fill="#fbbf24" className="animate-ping" opacity="0.9" />
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* DEDICATED GOAL PHRASE BANNER (NO OVERLAP WITH ISLAND SCENE) */}
      <div className="w-full bg-[#00171f]/95 border-b-2 border-[#00576b]/70 py-1.5 md:py-2 px-3 flex items-center justify-center shrink-0 z-20 shadow-lg">
        <div className="inline-flex items-center gap-2.5 md:gap-3.5 px-4 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-[#001f28] via-[#002833] to-[#001f28] border-2 border-[#00f2c9] rounded-2xl shadow-[0_0_20px_rgba(0,242,201,0.25)]">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-black text-[#00f2c9] uppercase tracking-widest shrink-0">
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-[#00f2c9]" />
            <span>Goal Phrase:</span>
          </div>
          <span className="text-base sm:text-lg md:text-2xl font-black text-yellow-300 uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]">
            "{activeQuest.targetSentence}"
          </span>
          <button
            onClick={() => soundEngine.speakAac(activeQuest.targetSentence)}
            className="p-1.5 hover:bg-[#00f2c9]/20 active:scale-95 rounded-xl border border-[#00f2c9]/30 transition-all text-[#00f2c9] hover:text-white cursor-pointer ml-1"
            title="Listen to goal phrase"
          >
            <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* LOWER HALF: THE AAC COMMUNICATOR TABLET (SGD) */}
      <div className="flex-1 flex flex-col justify-between p-2 md:p-4 max-w-3xl mx-auto w-full z-20 overflow-hidden">
        {/* SENTENCE STRIP BAR */}
        <div className="bg-[#001f28] border-2 border-[#00576b] rounded-2xl p-2 md:p-2.5 shadow-xl flex items-center justify-between gap-2 shrink-0 mb-2">
          {/* Sentence Icons Display */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto min-h-12 px-2 bg-[#001219] rounded-xl border border-white/10">
            {sentenceStrip.length === 0 ? (
              <span className="text-xs font-semibold text-slate-400 italic">
                {guidanceLevel === 'full' 
                  ? '✨ Touch the illuminated guide icon below to build your phrase...' 
                  : 'Tap icons on the grid to speak your phrase...'}
              </span>
            ) : (
              sentenceStrip.map((symbolId, idx) => {
                const sym = AAC_SYMBOLS_MAP[symbolId];
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border-2 ${sym.borderColor} bg-slate-900/90 shadow-md animate-scaleIn`}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-slate-800">
                      <AacCardImage symbolId={symbolId} />
                    </div>
                    <span className={`text-xs md:text-sm font-black tracking-wide ${sym.textColor}`}>
                      {sym.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons for Sentence Strip */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Speak Sentence Button */}
            <button
              onClick={handleSpeakSentenceStrip}
              disabled={sentenceStrip.length === 0}
              className="p-2 md:px-3 md:py-2 bg-gradient-to-r from-[#00f2c9] to-[#00b4d8] hover:from-[#38ef7d] hover:to-[#11998e] active:scale-95 disabled:opacity-30 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
              title="Speak entire phrase"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">SPEAK</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClearStrip}
              disabled={sentenceStrip.length === 0}
              className="p-2 bg-[#002833] hover:bg-[#001f28] active:scale-95 disabled:opacity-30 text-rose-300 rounded-xl border border-white/10 transition-all cursor-pointer"
              title="Clear sentence strip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* THE AAC COMMUNICATOR GRID (3 rows x 4 columns) */}
        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-2 md:gap-3 p-1">
          {AAC_GRID_LAYOUT.map((symbolId) => {
            const sym = AAC_SYMBOLS_MAP[symbolId];
            const isTarget = symbolId === targetSymbolId && !isQuestSolved;

            // Guidance Visual Styles
            const isFullGuide = isTarget && guidanceLevel === 'full';
            const isPartialGuide = isTarget && guidanceLevel === 'partial';

            return (
              <button
                key={symbolId}
                onClick={() => handleSymbolTap(symbolId)}
                className={`group relative rounded-2xl md:rounded-3xl border-3 flex flex-col items-center justify-between p-1 md:p-1.5 transition-all duration-150 active:scale-90 cursor-pointer select-none shadow-lg overflow-hidden ${
                  sym.bgColor
                } ${
                  isFullGuide
                    ? 'border-yellow-300 ring-4 ring-yellow-400/80 shadow-[0_0_30px_rgba(250,204,21,0.8)] scale-105 z-30 animate-pulse'
                    : isPartialGuide
                    ? 'border-cyan-300 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20'
                    : `${sym.borderColor} hover:border-white/80 opacity-95 hover:opacity-100`
                }`}
              >
                {/* Upper Label Banner */}
                <div className="w-full text-center py-0.5 px-1 bg-black/40 backdrop-blur-xs rounded-md border border-white/10 z-10 shrink-0">
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${sym.textColor}`}>
                    {sym.label}
                  </span>
                </div>

                {/* Center 3D Pixar Illustrated Card */}
                <div className="flex-1 w-full my-0.5 md:my-1 rounded-lg md:rounded-xl overflow-hidden border border-white/15 shadow-inner bg-slate-900/60 flex items-center justify-center relative min-h-0">
                  <AacCardImage 
                    symbolId={symbolId} 
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Category Pill Tag */}
                <div className="w-full flex items-center justify-center z-10 shrink-0">
                  <div className={`w-8 md:w-10 h-1 rounded-full ${
                    sym.category === 'verb'
                      ? 'bg-emerald-400/80'
                      : sym.category === 'social'
                      ? 'bg-rose-400/80'
                      : sym.category === 'modifier'
                      ? 'bg-blue-400/80'
                      : 'bg-amber-400/80'
                  }`} />
                </div>

                {/* FULL GUIDANCE HOLOGRAPHIC POINTER BADGE (ABA SKILL 10 TARGET) */}
                {isFullGuide && (
                  <div className="absolute -top-3.5 -right-2.5 bg-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xl flex items-center gap-1 animate-bounce border-2 border-slate-950 z-30">
                    <Hand className="w-3 h-3" />
                    <span>TOUCH</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VICTORY MODAL: ISLAND EXPLORER CHAMPION */}
      {isVictory && (
        <div className="absolute inset-0 bg-[#00171f]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-amber-400 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            {/* Golden Star Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-[#00576b] border-2 border-amber-400 flex items-center justify-center text-yellow-300 mb-4 shadow-lg animate-bounce">
              <Award className="w-12 h-12 text-yellow-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <CheckCircle2 className="w-3.5 h-3.5 fill-slate-950 text-amber-400" />
              <span>ISLAND EXPLORER CHAMPION!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              All 5 Quests Unlocked!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              You used your AAC communicator, accepted guidance prompts with ease, and restored the celestial light to the island!
            </p>

            {/* ABA Clinical Verification Stats */}
            <div className="w-full grid grid-cols-3 gap-2 mb-6">
              <div className="bg-[#002833] border border-amber-400/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-[#84cece]">Guided Touches</span>
                <span className="text-lg font-black text-yellow-300">{guidedTouchesCount}</span>
              </div>
              <div className="bg-[#002833] border border-emerald-400/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-[#84cece]">Independent</span>
                <span className="text-lg font-black text-emerald-400">{independentTouchesCount}</span>
              </div>
              <div className="bg-[#002833] border border-cyan-400/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-[#84cece]">Words Spoken</span>
                <span className="text-lg font-black text-cyan-300">{wordsSpokenCount}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setIsVictory(false);
                  setQuestMode('random');
                  setRandomRoundCount(1);
                  setRandomQuestIndex(Math.floor(Math.random() * ALL_RANDOM_QUESTS.length));
                  setSentenceStrip([]);
                  setCurrentStepInPhrase(0);
                  setIsQuestSolved(false);
                  setFeedbackMessage(null);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 active:scale-98 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transition-all border-2 border-white/80 cursor-pointer"
              >
                <Shuffle className="w-5 h-5" />
                <span>Continue in Random Mode</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-3 bg-[#002833] hover:bg-[#003847] active:scale-98 text-yellow-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Story Again</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 active:scale-98 text-slate-400 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
