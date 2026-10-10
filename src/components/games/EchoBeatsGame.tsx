import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CosmicBackground } from '../CosmicBackground';
import { EchoBeatsCritter, VowelType } from './EchoBeatsCritter';
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  Mic, 
  MicOff, 
  Music, 
  Award, 
  RotateCcw, 
  Volume2,
  Settings,
  HelpCircle
} from 'lucide-react';

interface EchoBeatsGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

interface VowelModel {
  vowel: VowelType;
  name: string;
  soundLabel: string;
  articulatoryTip: string;
  bgColor: string;
  activeColor: string;
}

const VOWEL_MODELS: VowelModel[] = [
  {
    vowel: 'a',
    name: 'Bop',
    soundLabel: 'A!',
    articulatoryTip: 'Open mouth wide like a lion',
    bgColor: 'from-amber-500/20 to-orange-500/10 border-amber-400/50',
    activeColor: 'bg-gradient-to-t from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/50',
  },
  {
    vowel: 'e',
    name: 'Gigi',
    soundLabel: 'E!',
    articulatoryTip: 'Stretch a wide smiling mouth showing teeth',
    bgColor: 'from-cyan-500/20 to-teal-500/10 border-cyan-400/50',
    activeColor: 'bg-gradient-to-t from-cyan-400 to-teal-300 text-slate-950 shadow-cyan-500/50',
  },
  {
    vowel: 'o',
    name: 'Ozzo',
    soundLabel: 'O!',
    articulatoryTip: 'Round lips forward like a trumpet horn',
    bgColor: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-400/50',
    activeColor: 'bg-gradient-to-t from-fuchsia-500 to-pink-400 text-white shadow-fuchsia-500/50',
  },
];

export const EchoBeatsGame: React.FC<EchoBeatsGameProps> = ({ rbtMode, onExit }) => {
  // Game Modes: 'quest' (Model -> Imitate Challenge) vs 'jam' (Free Play)
  const [gameMode, setGameMode] = useState<'quest' | 'jam'>('quest');

  // Active Singing State per Critter
  const [activeVowel, setActiveVowel] = useState<VowelType | null>(null);
  const [allCrittersDancing, setAllCrittersDancing] = useState(false);

  // Score & Rewards
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  // Clinical Echo Quest State (Model & Imitation Window)
  const [targetIndex, setTargetIndex] = useState(0);
  const currentTarget = VOWEL_MODELS[targetIndex % VOWEL_MODELS.length];
  const [isModeling, setIsModeling] = useState(false);
  const [waitingForChild, setWaitingForChild] = useState(false);
  const [imitationLatencySeconds, setImitationLatencySeconds] = useState(6);

  // Clinical RBT Metrics Tracker
  const [independentTries, setIndependentTries] = useState(0);
  const [promptedTries, setPromptedTries] = useState(0);
  const [showRbtPanel, setShowRbtPanel] = useState(rbtMode);

  // Live Microphone Vocal Biofeedback
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Equalizer visualizer animation state
  const [equalizerBars, setEqualizerBars] = useState<number[]>([30, 60, 45, 80, 50, 70, 40]);

  // Handle Play Vowel Sound with Microsoft AvaNeural and Trigger Critter Mouth Viseme
  const triggerVowelSound = useCallback((vowel: VowelType) => {
    setActiveVowel(vowel);
    soundEngine.playVowelSound(vowel);

    // Randomize equalizer visualizer
    setEqualizerBars(prev => prev.map(() => Math.floor(Math.random() * 70) + 30));

    setTimeout(() => {
      setActiveVowel(null);
    }, 850);
  }, []);

  // CELEBRATION EFFECT (Confetti + Fanfare)
  const triggerCelebration = useCallback((message: string, isIndependent = true, praiseAudio?: 'heard_you' | 'great_job' | 'good_try') => {
    soundEngine.playCheer();
    if (praiseAudio) {
      setTimeout(() => soundEngine.playEchoPraise(praiseAudio), 400);
    }
    setFeedbackText(message);
    setAllCrittersDancing(true);
    setStreak(s => s + 1);
    setScore(s => s + (isIndependent ? 50 : 25));

    if (isIndependent) {
      setIndependentTries(t => t + 1);
    } else {
      setPromptedTries(t => t + 1);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f2c9', '#ffb703', '#f43f5e', '#a855f7'],
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setFeedbackText(null);
      setAllCrittersDancing(false);
    }, 2400);
  }, []);

  // START MODELING CURRENT TARGET IN ECHO QUEST USING AVANEURAL
  const modelCurrentVowel = useCallback(() => {
    setIsModeling(true);
    setWaitingForChild(false);
    setActiveVowel(currentTarget.vowel);
    soundEngine.playEchoModel(currentTarget.vowel);

    setTimeout(() => {
      setIsModeling(false);
      setActiveVowel(null);
      setWaitingForChild(true);
      setImitationLatencySeconds(6);
    }, 1400);
  }, [currentTarget]);

  // Advance to next target in Echo Quest
  const advanceNextTarget = useCallback(() => {
    setWaitingForChild(false);
    setTargetIndex(prev => (prev + 1) % VOWEL_MODELS.length);
  }, []);

  // Handle Child Selection or Vocal Imitation Success
  const handleVowelAttempt = useCallback((selectedVowel: VowelType, viaMic = false) => {
    triggerVowelSound(selectedVowel);

    if (gameMode === 'jam') {
      // In Jam mode, free positive reinforcement
      setScore(s => s + 15);
      return;
    }

    // In Quest mode: check match
    if (selectedVowel === currentTarget.vowel || viaMic) {
      const msg = viaMic 
        ? 'AWESOME! I HEARD YOU! 🎤⭐' 
        : `EXCELLENT! YOU ECHOED "${currentTarget.vowel.toUpperCase()}"! ⭐`;

      triggerCelebration(msg, true, viaMic ? 'heard_you' : 'great_job');

      // Advance after a brief delay
      setTimeout(() => {
        advanceNextTarget();
      }, 2200);
    } else {
      // Wrong vowel tapped during quest: gentle sound and reminder
      soundEngine.playTap();
      setFeedbackText(`Almost! Listen to ${currentTarget.name}: "${currentTarget.vowel.toUpperCase()}"`);
      setTimeout(() => setFeedbackText(null), 1800);
    }
  }, [gameMode, currentTarget, triggerVowelSound, triggerCelebration, advanceNextTarget]);

  // ECHO QUEST COUNTDOWN LATENCY TIMER
  useEffect(() => {
    if (gameMode !== 'quest' || !waitingForChild) return;

    const timer = setInterval(() => {
      setImitationLatencySeconds(prev => {
        if (prev <= 1) {
          // Window expired without pressure: gentle remodel
          setWaitingForChild(false);
          setFeedbackText(`Let's try together!`);
          setTimeout(() => {
            setFeedbackText(null);
            modelCurrentVowel();
          }, 1500);
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, waitingForChild, modelCurrentVowel]);

  // Initial Target Modeling when entering Quest or changing target
  useEffect(() => {
    if (gameMode === 'quest') {
      const delay = setTimeout(() => {
        modelCurrentVowel();
      }, 700);
      return () => clearTimeout(delay);
    }
  }, [gameMode, targetIndex, modelCurrentVowel]);

  // LIVE MICROPHONE WEB AUDIO API SETUP
  const toggleMicrophone = async () => {
    if (isMicEnabled) {
      // Stop mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsMicEnabled(false);
      setVoiceVolume(0);
      return;
    }

    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicEnabled(true);
      soundEngine.playSuccess();
    } catch {
      setMicError('Microphone is unavailable on this device. You can use the touch pads!');
      setIsMicEnabled(false);
    }
  };

  // MICROPHONE VOLUME SAMPLING LOOP
  useEffect(() => {
    if (!isMicEnabled || !analyserRef.current) return;

    let animId: number;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let debounceVoiceTrigger = false;

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedVolume = Math.min(100, Math.round(avg * 2.2));
      setVoiceVolume(normalizedVolume);

      // Randomize visualizer slightly based on real voice
      if (normalizedVolume > 15) {
        setEqualizerBars(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
      }

      // VOICE THRESHOLD DETECTION: Child vocalized!
      if (normalizedVolume > 26 && !debounceVoiceTrigger && waitingForChild) {
        debounceVoiceTrigger = true;
        handleVowelAttempt(currentTarget.vowel, true);
        setTimeout(() => {
          debounceVoiceTrigger = false;
        }, 2400);
      }

      animId = requestAnimationFrame(checkVolume);
    };

    animId = requestAnimationFrame(checkVolume);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isMicEnabled, waitingForChild, currentTarget, handleVowelAttempt]);

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#10002b] via-[#240046] to-[#0d001a] overflow-hidden relative select-none">
      {/* Background Starfield */}
      <CosmicBackground />

      {/* TOP HUD: Missions Header, Score, Mode Toggle, RBT Toggle */}
      <div className="bg-[#1f0038]/90 border-b-2 border-purple-500/40 px-3 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-lg gap-2">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTap();
              onExit();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#2d004d] hover:bg-[#3c0066] active:scale-95 text-[#00f2c9] rounded-full font-black text-xs transition-all border border-[#00c9a7]/40 shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </button>

          <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-3 py-1 rounded-full font-black text-xs md:text-sm shadow-sm">
            <Music className="w-3.5 h-3.5" />
            <span>Echo Beats Jam</span>
          </div>
        </div>

        {/* Center: Mode Selector (Echo Quest vs Free Jam) */}
        <div className="flex items-center bg-[#150029] p-1 rounded-full border border-purple-500/30">
          <button
            onClick={() => {
              soundEngine.playTap();
              setGameMode('quest');
            }}
            className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
              gameMode === 'quest'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Echo Quest
          </button>
          <button
            onClick={() => {
              soundEngine.playTap();
              setGameMode('jam');
            }}
            className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
              gameMode === 'jam'
                ? 'bg-gradient-to-r from-[#00f2c9] to-cyan-500 text-slate-950 shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Free Jam Mode
          </button>
        </div>

        {/* Right: Mic Button, Score & RBT Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mic Toggle Button */}
          <button
            onClick={toggleMicrophone}
            title={isMicEnabled ? 'Microphone Active' : 'Activate Microphone'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all active:scale-95 ${
              isMicEnabled
                ? 'bg-emerald-500 text-slate-950 border-white shadow-emerald-500/50 shadow-lg animate-pulse'
                : 'bg-[#2d004d] text-purple-200 border-purple-500/40 hover:text-white'
            }`}
          >
            {isMicEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden md:inline">{isMicEnabled ? 'Voice Mic On' : 'Voice Mic Off'}</span>
          </button>

          {/* Score Counter */}
          <div className="flex items-center gap-1 bg-[#2d004d] px-3 py-1 rounded-full border border-yellow-400/30">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-xs md:text-sm font-black text-white">{score}</span>
          </div>

          {/* RBT Panel Toggle */}
          <button
            onClick={() => setShowRbtPanel(!showRbtPanel)}
            className={`p-1.5 rounded-full border transition-all active:scale-95 ${
              showRbtPanel
                ? 'bg-cyan-500 text-slate-950 border-white shadow-md'
                : 'bg-[#2d004d] text-purple-300 border-purple-500/40 hover:text-white'
            }`}
            title="RBT Co-Pilot Panel"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RBT CO-PILOT DROPDOWN STRIP */}
      {showRbtPanel && (
        <div className="bg-[#120022]/95 border-b-2 border-cyan-500/40 px-4 py-2 z-25 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-4 text-purple-200 font-semibold">
            <span className="font-black text-cyan-300 uppercase tracking-wider text-[11px]">
              RBT Co-Pilot:
            </span>
            <span>Independent: <b className="text-emerald-400 text-sm">{independentTries}</b></span>
            <span>Prompted: <b className="text-amber-400 text-sm">{promptedTries}</b></span>
            <span>Streak: <b className="text-yellow-400 text-sm">{streak}</b></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTap();
                modelCurrentVowel();
              }}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1 border border-purple-400/40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
              <span>Repeat Model</span>
            </button>

            <button
              onClick={() => {
                triggerCelebration('GREAT VOCAL TRY! ⭐ (RBT)', false, 'good_try');
                advanceNextTarget();
              }}
              className="px-3.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 rounded-lg font-black flex items-center gap-1 border border-white shadow-md"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Good Try! ⭐ (Reinforce)</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE & PLAY ARENA */}
      <div className="flex-1 relative flex flex-col justify-between p-3 md:p-6 overflow-hidden">
        {/* Dynamic Equalizer Waves in Background */}
        <div className="absolute top-4 inset-x-0 mx-auto max-w-md flex items-end justify-center gap-2 h-16 pointer-events-none opacity-30">
          {equalizerBars.map((height, i) => (
            <div
              key={i}
              className="w-3 md:w-4 bg-gradient-to-t from-cyan-400 via-fuchsia-500 to-yellow-300 rounded-t-full transition-all duration-150"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>

        {/* PROMPT BANNER: TARGET INSTRUCTION OR FREE JAM BANNER */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          {feedbackText ? (
            <div className="bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 text-slate-950 font-black px-6 py-2.5 rounded-full border-2 border-white shadow-2xl flex items-center gap-2 text-sm md:text-base animate-bounce">
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>{feedbackText}</span>
            </div>
          ) : gameMode === 'quest' ? (
            <div className="bg-[#1b0033]/90 border-2 border-purple-400/60 rounded-3xl px-6 py-2.5 backdrop-blur-md shadow-2xl flex items-center gap-4 max-w-xl w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white">
                  {currentTarget.vowel.toUpperCase()}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-[#00f2c9] tracking-wider">
                    {isModeling ? 'LISTEN & WATCH THE MOUTH' : 'YOUR TURN! MAKE THE SOUND'}
                  </div>
                  <div className="text-white text-sm md:text-base font-black flex items-center gap-1.5">
                    <span>{currentTarget.name} models:</span>
                    <span className="text-yellow-300 font-extrabold">{currentTarget.soundLabel}</span>
                  </div>
                  <div className="text-purple-300 text-xs font-semibold">
                    {currentTarget.articulatoryTip}
                  </div>
                </div>
              </div>

              {/* Countdown Ripple Latency Window */}
              {waitingForChild && (
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full border-3 border-amber-400 flex items-center justify-center font-black text-amber-300 text-sm animate-pulse shadow-md">
                    {imitationLatencySeconds}s
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase mt-0.5">Time</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1b0033]/90 border-2 border-[#00f2c9]/60 rounded-full px-6 py-2 backdrop-blur-md shadow-xl flex items-center gap-3 text-xs md:text-sm font-black text-white">
              <Volume2 className="w-4 h-4 text-[#00f2c9]" />
              <span>Tap any musical critter to hear its sound or sing into the microphone!</span>
            </div>
          )}

          {/* Voice Volume Visualizer Gauge (When Mic is active) */}
          {isMicEnabled && (
            <div className="mt-3 flex items-center gap-2 bg-[#120022]/90 border border-emerald-400/40 px-4 py-1.5 rounded-full shadow-md">
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase">Voice Mic:</span>
              <div className="w-28 md:w-36 h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/20">
                <div
                  className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500"
                  style={{ width: `${voiceVolume}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-white/70 w-8">{voiceVolume}%</span>
            </div>
          )}

          {micError && (
            <div className="mt-2 text-rose-300 text-xs font-semibold bg-rose-950/80 px-4 py-1 rounded-full border border-rose-500/40">
              {micError}
            </div>
          )}
        </div>

        {/* 3 CRITTERS ON THE STAGE */}
        <div className="relative z-10 my-auto grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mx-auto w-full items-center justify-items-center">
          {VOWEL_MODELS.map(model => {
            const isThisTarget = gameMode === 'quest' && currentTarget.vowel === model.vowel;
            const isSinging = activeVowel === model.vowel;

            return (
              <div key={model.vowel} className="flex flex-col items-center">
                <EchoBeatsCritter
                  vowel={model.vowel}
                  isActive={isSinging}
                  isDancing={allCrittersDancing || (isMicEnabled && voiceVolume > 20)}
                  isTarget={isThisTarget}
                  onTap={() => handleVowelAttempt(model.vowel)}
                />
              </div>
            );
          })}
        </div>

        {/* BOTTOM TACTILE STAGE PADS (3 LARGE IPAD BUTTONS FOR A, E, O) */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl w-full mx-auto">
            {VOWEL_MODELS.map(model => {
              const isTargetPad = gameMode === 'quest' && currentTarget.vowel === model.vowel;

              return (
                <button
                  key={model.vowel}
                  onClick={() => {
                    soundEngine.playTap();
                    handleVowelAttempt(model.vowel);
                  }}
                  className={`h-20 md:h-24 rounded-3xl border-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 shadow-xl cursor-pointer ${
                    isTargetPad
                      ? 'bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-300 text-slate-950 border-white ring-4 ring-yellow-400/50 animate-pulse'
                      : 'bg-[#1e0038]/90 hover:bg-[#2b0050] text-white border-purple-400/40'
                  }`}
                >
                  <span className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                    {model.vowel.toUpperCase()}
                  </span>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${
                    isTargetPad ? 'text-slate-950' : 'text-purple-300'
                  }`}>
                    {model.soundLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Guidance Hint for Therapist or Child */}
          <div className="mt-3 flex items-center gap-1.5 text-purple-300/80 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tap the large pads to model or make the sound with your voice to jam!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EchoBeatsGame;
