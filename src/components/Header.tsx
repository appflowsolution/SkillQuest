import { Volume2, VolumeX, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentView: 'dashboard' | 'game';
  activeGameTitle?: string;
  onBackToDashboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  rbtMode: boolean;
  onToggleRbtMode: () => void;
}

export const Header = ({
  currentView,
  activeGameTitle,
  onBackToDashboard,
  isMuted,
  onToggleMute,
  rbtMode,
  onToggleRbtMode,
}: HeaderProps) => {
  return (
    <header className="h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      {/* Lado izquierdo: Logo o Volver */}
      <div className="flex items-center gap-4">
        {currentView === 'game' ? (
          <button
            onClick={() => {
              soundEngine.playTap();
              onBackToDashboard();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold text-base transition-all border border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-400" />
            <span>Menú de Juegos</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/40">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">SkillQuest</h1>
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                  RBT Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Suite Educativa y Conductual</p>
            </div>
          </div>
        )}

        {currentView === 'game' && activeGameTitle && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Juego Activo:</span>
            <span className="text-base font-extrabold text-white">{activeGameTitle}</span>
          </div>
        )}
      </div>

      {/* Lado derecho: Perfil Paciente & Controles RBT */}
      <div className="flex items-center gap-3">
        {/* Badge del Estudiante */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-200">Alexander B.</div>
            <div className="text-[10px] text-slate-400 font-medium">11 años • 5to Grado</div>
          </div>
        </div>

        {/* Toggle Co-Piloto RBT */}
        <button
          onClick={() => {
            soundEngine.playTap();
            onToggleRbtMode();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            rbtMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Alternar panel clínico de supervisión RBT"
        >
          <ShieldCheck className={`w-4 h-4 ${rbtMode ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Co-Piloto RBT</span>
        </button>

        {/* Toggle Sonido */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) soundEngine.playTap();
          }}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all"
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-rose-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};
