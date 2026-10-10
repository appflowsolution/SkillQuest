import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { TowerBlockIcon, TowerBlockType } from './TowerBlockIcon';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Bot, 
  Users, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface StarTowerGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

interface StackedBlock {
  id: number;
  type: TowerBlockType;
  x: number; // percentage (0 - 100)
  placedBy: 'player' | 'partner';
  offsetFromCenter: number;
}

const TOWER_SEQUENCE: { type: TowerBlockType; name: string }[] = [
  { type: 'foundation', name: 'Obsidian Foundation' },
  { type: 'habitat', name: 'Crystal Habitat' },
  { type: 'reactor', name: 'Starlight Reactor' },
  { type: 'greenhouse', name: 'Cosmic Bio-Dome' },
  { type: 'observatory', name: 'Sky Observatory' },
  { type: 'solarsails', name: 'Plasma Solar Wings' },
  { type: 'spire', name: 'Starlight Spire Crown' },
];

export const StarTowerGame = ({ onExit }: StarTowerGameProps) => {
  // Game mode: 'bot' (AstroBot co-op) or 'pass-and-play' (2 human players sharing iPad)
  const [partnerMode, setPartnerMode] = useState<'bot' | 'pass-and-play'>('bot');
  
  // Turn Taking State: 'player' (Alex) or 'partner' (AstroBot / RBT)
  const [currentTurn, setCurrentTurn] = useState<'player' | 'partner'>('player');
  const [turnBannerText, setTurnBannerText] = useState<string>('YOUR TURN: Drop Block 1!');
  const [showTurnTransition, setShowTurnTransition] = useState(false);

  // Tower Progression (0 to 7 floors)
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [stackedBlocks, setStackedBlocks] = useState<StackedBlock[]>([
    {
      id: 0,
      type: 'foundation',
      x: 50,
      placedBy: 'player',
      offsetFromCenter: 0,
    }
  ]);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  // Crane & Physics State
  const [craneX, setCraneX] = useState(50); // % of arena width
  const [isDropping, setIsDropping] = useState(false);
  const [droppedBlockY, setDroppedBlockY] = useState(15); // % from top
  const [droppedBlockX, setDroppedBlockX] = useState(50);
  const [isWobbling, setIsWobbling] = useState(false);

  // Feedback popup
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Stats for Turn Taking Clinical Verification
  const [playerTurnsTaken, setPlayerTurnsTaken] = useState(0);
  const [partnerTurnsTaken, setPartnerTurnsTaken] = useState(0);

  // Animation Refs
  const animationFrameRef = useRef<number | null>(null);
  const isDroppingRef = useRef(false);
  const currentTurnRef = useRef<'player' | 'partner'>('player');

  useEffect(() => {
    isDroppingRef.current = isDropping;
  }, [isDropping]);

  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);

  // Current block to be placed (Floor 1 to 6, since 0 is base foundation)
  const activeBlockConfig = TOWER_SEQUENCE[Math.min(currentFloorIndex + 1, TOWER_SEQUENCE.length - 1)];

  // Crane Oscillation Loop
  useEffect(() => {
    if (isVictory) return;

    let startTime = performance.now();

    const loop = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;
      
      // Swing between 20% and 80% smoothly
      if (!isDroppingRef.current) {
        const speed = 1.3 + currentFloorIndex * 0.12;
        const newX = 50 + Math.sin(elapsed * speed) * 30;
        setCraneX(newX);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentFloorIndex, isVictory]);

  // Trigger Action to Drop Block
  const handleDropBlock = useCallback(() => {
    if (isDropping || isVictory) return;

    soundEngine.playBlockDrop();
    setIsDropping(true);
    setDroppedBlockX(craneX);
    setDroppedBlockY(18);

    // Gravity Drop Animation (approx 550ms)
    let dropProgress = 18;
    const dropInterval = window.setInterval(() => {
      dropProgress += 7;
      setDroppedBlockY(dropProgress);

      // Target landing height based on current tower height
      // Each block sits on top of the previous
      const targetLandingY = 64 - currentFloorIndex * 7;

      if (dropProgress >= targetLandingY) {
        window.clearInterval(dropInterval);
        
        // Stacking evaluation
        const lastBlock = stackedBlocks[stackedBlocks.length - 1];
        const offset = droppedBlockX - (lastBlock ? lastBlock.x : 50);
        const absOffset = Math.abs(offset);

        // Success threshold
        if (absOffset <= 24) {
          const isPerfect = absOffset <= 8;
          soundEngine.playBlockLand(1 + currentFloorIndex * 0.08);

          if (isPerfect) {
            setScore(s => s + 50);
            setFeedbackMessage('PERFECT STACK! ⭐ +50');
            try {
              confetti({ particleCount: 35, spread: 60, origin: { x: droppedBlockX / 100, y: 0.6 } });
            } catch { /* ignore */ }
          } else {
            setScore(s => s + 25);
            setFeedbackMessage('GREAT FIT! 👍 +25');
            setIsWobbling(true);
            setTimeout(() => setIsWobbling(false), 800);
          }

          // Register newly stacked block
          const newBlock: StackedBlock = {
            id: Date.now(),
            type: activeBlockConfig.type,
            x: isPerfect ? (lastBlock ? lastBlock.x : 50) : droppedBlockX,
            placedBy: currentTurnRef.current,
            offsetFromCenter: offset,
          };

          setStackedBlocks(prev => [...prev, newBlock]);

          if (currentTurnRef.current === 'player') {
            setPlayerTurnsTaken(p => p + 1);
          } else {
            setPartnerTurnsTaken(p => p + 1);
          }

          const nextFloor = currentFloorIndex + 1;
          setCurrentFloorIndex(nextFloor);

          // Check Win Condition (All 6 floors built on top of base)
          if (nextFloor >= 6) {
            setIsVictory(true);
            soundEngine.playSuccess();
            try {
              confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
            } catch { /* ignore */ }
          } else {
            // SWITCH TURN (The Core Clinical Skill!)
            const nextTurn = currentTurnRef.current === 'player' ? 'partner' : 'player';
            setCurrentTurn(nextTurn);
            soundEngine.playTurnChime(nextTurn === 'player');
            setShowTurnTransition(true);
            setTurnBannerText(
              nextTurn === 'player'
                ? 'YOUR TURN! Drop Floor ' + (nextFloor + 1)
                : partnerMode === 'bot'
                ? "ASTROBOT'S TURN: Waiting..."
                : "PARTNER'S TURN: Pass iPad!"
            );
            setTimeout(() => setShowTurnTransition(false), 2000);
          }
        } else {
          // Gentle Magnetic Catch (Low-Frustration Errorless Learning)
          soundEngine.playTap();
          setFeedbackMessage('TRACTOR BEAM REPOSITION! 🧲');
          setIsWobbling(true);
          setTimeout(() => setIsWobbling(false), 600);
        }

        setIsDropping(false);
        setTimeout(() => setFeedbackMessage(null), 1400);
      }
    }, 28);
  }, [isDropping, isVictory, craneX, currentFloorIndex, stackedBlocks, droppedBlockX, activeBlockConfig, partnerMode]);

  // AstroBot Turn Autopilot (Simulating Cooperative Partner)
  useEffect(() => {
    if (isVictory || partnerMode !== 'bot' || currentTurn !== 'partner' || isDropping) return;

    // Active Waiting: Wait 2.2 seconds before AstroBot acts
    // This gives the child a tangible, measurable window to practice Delay Tolerance (waiting without distress)
    const botTimer = window.setTimeout(() => {
      if (currentTurnRef.current === 'partner' && !isDroppingRef.current) {
        handleDropBlock();
      }
    }, 2200);

    return () => window.clearTimeout(botTimer);
  }, [currentTurn, partnerMode, isVictory, isDropping, handleDropBlock]);

  // Restart Tower
  const handleRestart = () => {
    soundEngine.playTap();
    setCurrentFloorIndex(0);
    setCurrentTurn('player');
    setIsVictory(false);
    setIsDropping(false);
    setScore(0);
    setPlayerTurnsTaken(0);
    setPartnerTurnsTaken(0);
    setStackedBlocks([
      {
        id: 0,
        type: 'foundation',
        x: 50,
        placedBy: 'player',
        offsetFromCenter: 0,
      }
    ]);
    setTurnBannerText('YOUR TURN: Drop Floor 1!');
  };

  const isPlayerTurn = currentTurn === 'player';
  const towerHeightCount = stackedBlocks.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#002833] via-[#003d4c] to-[#001f28] overflow-hidden relative select-none">
      {/* Dynamic ABCya-style Stardust Background */}
      <CosmicBackground />

      {/* TOP HUD: Missions, Mode, Score & Turn Indicator */}
      <div className="bg-[#003d4c] border-b-2 border-[#00576b] px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-md gap-3">
        {/* Left: Exit & Tower Info */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#002833] hover:bg-[#001f28] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </button>

          {/* Tower Floor Meter */}
          <div className="flex items-center gap-1.5 bg-[#002833] px-3 py-1 rounded-full border border-white/15">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-xs font-black text-white">
              Floors: <strong className="text-yellow-300 font-extrabold">{towerHeightCount} / 7</strong>
            </span>
          </div>
        </div>

        {/* Center: ACTIVE TURN BANNER (SKILLS 7 & 8) */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 transition-all shadow-lg ${
            isPlayerTurn
              ? 'bg-emerald-950/90 border-[#00f2c9] text-[#00f2c9] ring-2 ring-[#00f2c9]/40 animate-pulse'
              : 'bg-amber-950/90 border-[#ffb703] text-yellow-300 ring-2 ring-[#ffb703]/40'
          }`}>
            {isPlayerTurn ? (
              <>
                <div className="w-3 h-3 rounded-full bg-[#00f2c9] animate-ping"></div>
                <span className="text-xs md:text-sm font-black tracking-wide uppercase">
                  YOUR TURN
                </span>
              </>
            ) : (
              <>
                {partnerMode === 'bot' ? <Bot className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} /> : <Users className="w-4 h-4 text-yellow-400" />}
                <span className="text-xs md:text-sm font-black tracking-wide uppercase">
                  {partnerMode === 'bot' ? "ASTROBOT'S TURN" : "PARTNER'S TURN"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Partner Mode Selector & Score */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher Toggle */}
          <div className="hidden sm:flex items-center bg-[#00242e] rounded-full p-0.5 border border-white/10">
            <button
              onClick={() => {
                soundEngine.playTap();
                setPartnerMode('bot');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 ${
                partnerMode === 'bot' 
                  ? 'bg-cyan-500 text-slate-950 shadow' 
                  : 'text-[#84cece] hover:text-white'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>AstroBot</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTap();
                setPartnerMode('pass-and-play');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 ${
                partnerMode === 'pass-and-play' 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-[#84cece] hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>2 Players</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#002833] px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONSTRUCTION ARENA */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
        {/* Sky Clouds / Goal Spire in the stratosphere */}
        <div className="absolute top-2 inset-x-0 mx-auto max-w-md z-15 flex items-center justify-center pointer-events-none px-4">
          <div className="bg-[#002029]/85 border border-[#00c9a7]/40 rounded-full px-4 py-1 backdrop-blur-md shadow flex items-center gap-2 text-xs font-black text-white">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Target: Stack 7 Floors to reach the Starlight Crown!</span>
          </div>
        </div>

        {/* FEEDBACK POPUP (+50 / +25 / REPOSITION) */}
        {feedbackMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 border-2 border-yellow-400 text-yellow-300 font-black px-6 py-2 rounded-full shadow-2xl animate-bounce text-sm uppercase tracking-wider">
            {feedbackMessage}
          </div>
        )}

        {/* TURN TRANSITION CELEBRATION BANNER */}
        {showTurnTransition && (
          <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-40 px-6 py-2.5 rounded-2xl shadow-2xl border-2 font-black text-xs md:text-sm uppercase tracking-wider animate-fadeIn flex items-center gap-2 ${
            isPlayerTurn
              ? 'bg-emerald-600 text-white border-emerald-300'
              : 'bg-amber-600 text-white border-amber-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{turnBannerText}</span>
          </div>
        )}

        {/* OSCILLATING COSMIC CRANE (Top Hanging Mechanism) */}
        {!isVictory && (
          <div 
            className="absolute top-0 w-36 h-28 pointer-events-none z-20 flex flex-col items-center transition-all duration-75"
            style={{ 
              left: `${craneX}%`, 
              transform: 'translateX(-50%)' 
            }}
          >
            {/* Crane cable line */}
            <div className="w-1 h-10 bg-gradient-to-b from-white to-[#00f2c9] shadow-sm"></div>

            {/* Magnetic Clamp Head */}
            <div className="w-14 h-4 bg-slate-800 rounded-full border-2 border-[#00f2c9] flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
            </div>

            {/* Currently held block (only visible when not dropped) */}
            {!isDropping && (
              <div className="w-32 h-16 mt-0.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-pulse-subtle">
                <TowerBlockIcon 
                  type={activeBlockConfig.type} 
                  placedBy={currentTurn} 
                />
              </div>
            )}
          </div>
        )}

        {/* FALLING BLOCK (While Dropping) */}
        {isDropping && (
          <div 
            className="absolute w-32 h-16 pointer-events-none z-25 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
            style={{ 
              left: `${droppedBlockX}%`, 
              top: `${droppedBlockY}%`,
              transform: 'translateX(-50%)' 
            }}
          >
            <TowerBlockIcon 
              type={activeBlockConfig.type} 
              placedBy={currentTurn} 
            />
          </div>
        )}

        {/* THE BUILT STAR TOWER (Anchored at Bottom Platform) */}
        <div className={`relative flex-1 flex flex-col justify-end items-center pb-8 z-10 transition-transform duration-500 ${
          isWobbling ? 'animate-wiggle' : ''
        }`}>
          {/* Stacked Floors Container */}
          <div className="flex flex-col-reverse items-center w-full max-w-md relative">
            {stackedBlocks.map((block, index) => {
              return (
                <div 
                  key={block.id}
                  className="w-36 h-15 relative flex items-center justify-center transition-all duration-300"
                  style={{
                    marginBottom: index === 0 ? 0 : -8, // Slight interlocking overlap
                    transform: `translateX(${(block.x - 50) * 0.8}px)`,
                  }}
                >
                  <TowerBlockIcon 
                    type={block.type} 
                    placedBy={block.placedBy} 
                  />

                  {/* Floor number tag */}
                  <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shadow border ${
                    block.placedBy === 'player'
                      ? 'bg-[#00f2c9] text-slate-950 border-white'
                      : 'bg-[#ffb703] text-slate-950 border-white'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              );
            })}

            {/* Launchpad Ground Base */}
            <div className="w-56 h-6 bg-gradient-to-r from-[#00171f] via-[#003442] to-[#00171f] rounded-t-2xl border-t-2 border-[#00c9a7]/50 shadow-2xl flex items-center justify-center">
              <div className="w-24 h-1 bg-cyan-400/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (TOUCH DROP BUTTON / ACTIVE WAITING UI) */}
        <div className="bg-[#002833]/95 border-t-2 border-[#00576b] px-4 py-3 flex items-center justify-between z-30 shadow-2xl gap-3">
          {/* Turn taking instructions prompt */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase text-[#84cece] tracking-wider">
              {isPlayerTurn ? 'Action Required' : 'Cooperative Waiting'}
            </span>
            <span className="text-xs font-black text-white">
              {isPlayerTurn 
                ? 'Drop when aligned over previous floor!' 
                : partnerMode === 'bot' 
                ? 'Watch AstroBot place the next floor...' 
                : 'Hand iPad to partner for Floor ' + (currentFloorIndex + 1)}
            </span>
          </div>

          {/* THE GIANT TACTILE ACTION BUTTON */}
          <div className="flex-1 max-w-md mx-auto">
            {isPlayerTurn ? (
              <button
                onClick={handleDropBlock}
                disabled={isDropping}
                className="w-full h-16 md:h-18 bg-gradient-to-r from-[#00f2c9] to-[#00b4d8] hover:from-[#38ef7d] hover:to-[#11998e] active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/30 border-3 border-white flex items-center justify-center gap-3 text-base md:text-lg transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-[#00f2c9] flex items-center justify-center shadow">
                  ⬇️
                </div>
                <span>DROP TOWER BLOCK</span>
              </button>
            ) : partnerMode === 'pass-and-play' ? (
              <button
                onClick={handleDropBlock}
                disabled={isDropping}
                className="w-full h-16 md:h-18 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:from-[#ffc300] hover:to-[#ffa200] active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 border-3 border-white flex items-center justify-center gap-3 text-base md:text-lg transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center shadow">
                  👥
                </div>
                <span>PARTNER: DROP BLOCK</span>
              </button>
            ) : (
              /* ACTIVE WAITING STATE FOR ASTROBOT (CLINICAL SKILL 7 & 8) */
              <div className="w-full h-16 md:h-18 bg-[#001f28] rounded-2xl border-2 border-dashed border-amber-400/50 flex items-center justify-center gap-3 px-4 shadow-inner">
                <Bot className="w-7 h-7 text-yellow-400 animate-bounce" />
                <div className="flex flex-col text-left">
                  <span className="text-xs md:text-sm font-black text-amber-300">
                    AstroBot is aiming...
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Tolerating delay: waiting calmly for partner!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VICTORY MODAL: TEAMWORK CHAMPIONS */}
      {isVictory && (
        <div className="absolute inset-0 bg-[#00171f]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#003847] border-3 border-[#00f2c9] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            {/* Glowing Golden Trophy */}
            <div className="w-20 h-20 rounded-3xl bg-[#00576b] border-2 border-[#00f2c9] flex items-center justify-center text-yellow-300 mb-4 shadow-lg animate-bounce">
              <Award className="w-12 h-12 text-yellow-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#8ac926] text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>TEAMWORK VICTORY!</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Star Tower Completed!
            </h3>
            <p className="text-[#a5d8d8] text-sm font-semibold mb-6">
              You and your partner took turns and raised all 7 cosmic floors to the stars!
            </p>

            {/* Cooperative Turn-Taking Stats */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#002833] border border-cyan-400/30 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Your Turns</span>
                <span className="text-xl font-black text-[#00f2c9]">{playerTurnsTaken} Floors</span>
              </div>
              <div className="bg-[#002833] border border-amber-400/30 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#84cece]">Partner Turns</span>
                <span className="text-xl font-black text-yellow-300">{partnerTurnsTaken} Floors</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className="w-full py-4 bg-gradient-to-r from-[#00f2c9] to-[#00b4d8] hover:from-[#38ef7d] hover:to-[#11998e] active:scale-98 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all border-2 border-white"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Build Another Tower</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTap();
                  onExit();
                }}
                className="w-full py-3.5 bg-[#002732] hover:bg-[#001f28] active:scale-98 text-[#00f2c9] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border border-[#00c9a7]/40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Mission Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
