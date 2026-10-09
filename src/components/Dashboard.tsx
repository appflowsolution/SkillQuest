import { GAMES_CATALOG } from '../data/games';
import { GameId } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Coffee, 
  Hourglass, 
  Users, 
  Tablet, 
  LifeBuoy, 
  Volume2, 
  Play, 
  Lock, 
  Target, 
  Sparkles,
  Award,
  type LucideIcon
} from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: GameId) => void;
  rbtMode: boolean;
}

const ICONS_MAP: Record<string, LucideIcon> = {
  Coffee,
  Hourglass,
  Users,
  Tablet,
  LifeBuoy,
  Volume2,
};

export const Dashboard = ({ onSelectGame, rbtMode }: DashboardProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Banner de Bienvenida y Misión */}
      <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-violet-950/80 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Estación de Misiones Clínicas
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
              ¡Hola, Alexander! ¿Listo para la misión de hoy?
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl font-medium">
              Elige un juego para comenzar a ganar estrellas. Cada misión te ayuda a aprender nuevas formas de comunicarte y divertirte.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plan Activo</div>
              <div className="text-lg font-black text-white">6 Módulos ABA</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Quality Behavior Therapy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Juegos */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Módulos de Adquisición</span>
            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
              {GAMES_CATALOG.length} Módulos
            </span>
          </h3>
          {rbtMode && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              Modo RBT Activo: Metas y mediciones clínicas visibles
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES_CATALOG.map((game) => {
            const Icon = ICONS_MAP[game.iconName] || Coffee;
            const isAvailable = game.isAvailable;

            return (
              <div
                key={game.id}
                onClick={() => {
                  if (isAvailable) {
                    soundEngine.playTap();
                    onSelectGame(game.id);
                  }
                }}
                className={`relative group rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                  isAvailable
                    ? 'bg-slate-900/90 hover:bg-slate-850 cursor-pointer shadow-xl hover:shadow-indigo-500/10 border-indigo-500/40 hover:border-indigo-400 hover:-translate-y-1'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                {/* Header de la tarjeta */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        isAvailable
                          ? `bg-gradient-to-tr ${game.colorTheme.accent} text-white shadow-orange-500/20`
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${game.colorTheme.badge}`}>
                        {game.skillCode}
                      </span>
                      {isAvailable ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Listo para jugar
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Próximo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Títulos */}
                  <h4 className="text-xl font-black text-white tracking-tight mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {game.number}. {game.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium mb-4">
                    {game.subtitle}
                  </p>
                </div>

                {/* Métricas Clínicas ABA (visibles siempre para contexto claro) */}
                <div className="mt-2 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Dominio actual:</span>
                    <span className="font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {game.currentMastery}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Meta de adquisición:</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      {game.targetGoal}
                    </span>
                  </div>

                  {/* Botón de Acción */}
                  <div className="pt-3">
                    {isAvailable ? (
                      <button className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98">
                        <Play className="w-4 h-4 fill-white" />
                        <span>Iniciar Misión 1</span>
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-slate-800/60 text-slate-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-850">
                        <span>Fase 2 de Desarrollo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
