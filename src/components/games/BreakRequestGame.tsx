import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { 
  Coffee, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Zap,
  Info
} from 'lucide-react';

interface GemItem {
  id: number;
  x: number;
  y: number;
  color: string;
  iconBg: string;
  collected: boolean;
  shape: 'diamond' | 'circle' | 'star';
}

interface BreakRequestGameProps {
  rbtMode: boolean;
  onExit: () => void;
}

export const BreakRequestGame = ({ rbtMode, onExit }: BreakRequestGameProps) => {
  // Estado del juego
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [promptActive, setPromptActive] = useState(false);
  const [lastActionWasPrompted, setLastActionWasPrompted] = useState(false);
  
  // Temporizador de descanso
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30);

  // Registro clínico RBT
  const [independentBreaks, setIndependentBreaks] = useState(0);
  const [promptedBreaks, setPromptedBreaks] = useState(0);

  // Control de inactividad para prompt automático
  const inactivityTimerRef = useRef<number | null>(null);

  // Generar gemas por ronda
  const generateGems = (currentRound: number) => {
    const count = Math.min(3 + currentRound, 6);
    const colors = [
      { color: 'from-cyan-400 to-blue-500', iconBg: 'bg-cyan-400', shape: 'diamond' as const },
      { color: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-400', shape: 'circle' as const },
      { color: 'from-purple-400 to-pink-500', iconBg: 'bg-purple-400', shape: 'star' as const },
      { color: 'from-emerald-400 to-teal-500', iconBg: 'bg-emerald-400', shape: 'diamond' as const },
      { color: 'from-rose-400 to-red-500', iconBg: 'bg-rose-400', shape: 'circle' as const },
      { color: 'from-indigo-400 to-violet-500', iconBg: 'bg-indigo-400', shape: 'star' as const },
    ];

    const newGems: GemItem[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 50) {
        attempts++;
        x = Math.floor(Math.random() * 65) + 15; // 15% a 80% ancho
        y = Math.floor(Math.random() * 55) + 15; // 15% a 70% alto

        // Evitar esquina inferior izquierda (donde vive el botón de break)
        if (x < 35 && y > 60) continue;

        const collision = usedPositions.some(
          pos => Math.abs(pos.x - x) < 16 && Math.abs(pos.y - y) < 18
        );
        if (!collision) valid = true;
      }

      usedPositions.push({ x, y });
      const palette = colors[i % colors.length];
      newGems.push({
        id: i + 1,
        x,
        y,
        color: palette.color,
        iconBg: palette.iconBg,
        collected: false,
        shape: palette.shape,
      });
    }

    setGems(newGems);
    resetInactivityTimer();
  };

  // Inicializar primera ronda
  useEffect(() => {
    generateGems(1);
    return () => {
      if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // Temporizador de descanso (Break countdown)
  useEffect(() => {
    let interval: number | null = null;
    if (isBreakActive && breakSecondsLeft > 0) {
      interval = window.setInterval(() => {
        setBreakSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isBreakActive, breakSecondsLeft]);

  // Manejador de inactividad (Prompt sugerido automático tras 14s de inactividad)
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    setPromptActive(false);

    inactivityTimerRef.current = window.setTimeout(() => {
      if (!isBreakActive) {
        setPromptActive(true);
        soundEngine.playPromptChime();
      }
    }, 14000);
  };

  // Tocar una gema
  const handleCollectGem = (id: number) => {
    soundEngine.playGemPop();
    resetInactivityTimer();

    const updated = gems.map(g => (g.id === id ? { ...g, collected: true } : g));
    setGems(updated);
    setScore(prev => prev + 10);

    const allCollected = updated.every(g => g.collected);
    if (allCollected) {
      soundEngine.playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }

      setTimeout(() => {
        setRound(prev => prev + 1);
        generateGems(round + 1);
      }, 900);
    }
  };

  // ACCIÓN PRINCIPAL: Solicitar Descanso (Break Request)
  const handleRequestBreak = (wasPrompted: boolean) => {
    soundEngine.playBreakBell();
    setIsBreakActive(true);
    setBreakSecondsLeft(30);
    setLastActionWasPrompted(wasPrompted);

    if (wasPrompted) {
      setPromptedBreaks(prev => prev + 1);
    } else {
      setIndependentBreaks(prev => prev + 1);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#f59e0b', '#fbbf24', '#d97706'],
        origin: { x: 0.2, y: 0.8 },
      });
    } catch {
      // Ignorar
    }
  };

  // Reanudar tras el descanso
  const handleResumeFromBreak = () => {
    soundEngine.playTap();
    setIsBreakActive(false);
    setPromptActive(false);
    resetInactivityTimer();
  };

  // Forzar activación de prompt manual por la RBT
  const handleTriggerRbtPrompt = () => {
    setPromptActive(true);
    soundEngine.playPromptChime();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      {/* Barra Superior del Juego: Puntaje y Ronda + Barra Co-Piloto */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Misión:</span>
            <span className="text-sm font-black text-white px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
              Ronda {round}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntos Estelares:</span>
            <span className="text-lg font-black text-amber-400">{score}</span>
          </div>
        </div>

        {/* Controles de la RBT */}
        <div className="flex items-center gap-3">
          {rbtMode && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mr-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Indep: {independentBreaks}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Prompt: {promptedBreaks}</span>
              </div>
            </div>
          )}

          {/* Botón de la RBT para modelar el prompt */}
          {!isBreakActive && (
            <button
              onClick={handleTriggerRbtPrompt}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                promptActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
              }`}
              title="Hace parpadear el botón de Break para modelar la ayuda al niño"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{promptActive ? 'Prompt Activo' : 'Sugerir Break'}</span>
            </button>
          )}

          <button
            onClick={onExit}
            className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DE JUEGO */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/30 overflow-hidden">
        {/* Fondo de estrellas ambientales */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-amber-200 rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-violet-300 rounded-full"></div>
        </div>

        {/* Gemas en la pantalla */}
        {!isBreakActive && gems.map((gem) => {
          if (gem.collected) return null;

          return (
            <button
              key={gem.id}
              onClick={() => handleCollectGem(gem.id)}
              style={{
                left: `${gem.x}%`,
                top: `${gem.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-900/80 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 z-10 animate-float-calm"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr ${gem.color} flex items-center justify-center shadow-inner`}>
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
              </div>
            </button>
          );
        })}

        {/* Guía en pantalla para el niño */}
        {!isBreakActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-800 px-5 py-2 rounded-full pointer-events-none text-slate-300 text-xs md:text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Toca las gemas estelares para sumar puntos</span>
          </div>
        )}

        {/* EL BOTÓN CRÍTICO DE DESCANSO (BREAK BUTTON) */}
        {!isBreakActive && (
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={() => handleRequestBreak(promptActive)}
              className={`min-w-[260px] md:min-w-[300px] h-20 md:h-24 px-6 rounded-3xl flex items-center justify-center gap-4 transition-all duration-200 shadow-2xl active:scale-95 ${
                promptActive
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 ring-4 ring-amber-300 ring-offset-4 ring-offset-slate-950 scale-105 animate-pulse-subtle shadow-amber-500/50'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-2 border-amber-400/40 shadow-orange-950/50'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                promptActive ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-white'
              }`}>
                <Coffee className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="text-left">
                <div className={`text-base md:text-lg font-black tracking-tight ${
                  promptActive ? 'text-slate-950' : 'text-white'
                }`}>
                  NECESITO UN DESCANSO
                </div>
                <div className={`text-xs font-extrabold uppercase tracking-wider ${
                  promptActive ? 'text-slate-900 font-black' : 'text-amber-200'
                }`}>
                  Toca aquí para pausar
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* PANTALLA DE CALMA / BREAK ACTIVE OVERLAY */}
      {isBreakActive && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          {/* Tarjeta de Felicitación por Pedir Descanso */}
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <Coffee className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lastActionWasPrompted ? '¡Petición Asistida!' : '¡Petición Independiente!'}</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              ¡Muy bien por avisar!
            </h3>
            <p className="text-slate-300 text-sm font-medium mb-6">
              Pedir un descanso es una gran habilidad. Tómate un momento para respirar y relajarte.
            </p>

            {/* Esfera de respiración guiada */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-400/30 animate-breathe"></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Inhala • Exhala
                </span>
                <span className="text-2xl font-black text-white flex items-center gap-1 mt-1">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  {breakSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Botón para Reanudar Cuando el Niño Esté Listo */}
            <button
              onClick={handleResumeFromBreak}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all border border-emerald-400/30"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>¡Estoy listo para jugar!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
