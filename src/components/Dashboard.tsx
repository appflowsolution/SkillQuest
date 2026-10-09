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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
      {/* Welcome Banner */}
      <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-indigo-50 via-white to-violet-50 border border-indigo-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Clinical Learning Station
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Welcome to SkillQuest! Ready for your mission?
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl font-medium">
              Choose a module to begin earning stars. Each interactive quest reinforces functional communication, executive focus, and self-regulation.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Plan</div>
              <div className="text-lg font-black text-slate-900">6 ABA Modules</div>
              <div className="text-[11px] text-emerald-700 font-bold">Quality Behavior Therapy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Catalog Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Acquisition Modules</span>
            <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold">
              {GAMES_CATALOG.length} Programs
            </span>
          </h3>
          {rbtMode && (
            <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
              RBT Mode Active: Clinical goals & trial data visible
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
                    ? 'bg-white hover:bg-slate-50 cursor-pointer shadow-sm hover:shadow-lg border-indigo-200 hover:border-indigo-400 hover:-translate-y-1'
                    : 'bg-slate-100/70 border-slate-200 opacity-80'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                        isAvailable
                          ? `bg-gradient-to-tr ${game.colorTheme.accent} text-white shadow-orange-500/20`
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${game.colorTheme.badge}`}>
                        {game.skillCode}
                      </span>
                      {isAvailable ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Ready to Play
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titles */}
                  <h4 className="text-xl font-black text-slate-900 tracking-tight mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {game.number}. {game.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium mb-4">
                    {game.subtitle}
                  </p>
                </div>

                {/* Clinical ABA Metrics */}
                <div className="mt-2 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Current Mastery:</span>
                    <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {game.currentMastery}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Target Goal:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-500" />
                      {game.targetGoal}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3">
                    {isAvailable ? (
                      <button className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-98">
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Mission 1</span>
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-slate-200 text-slate-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-300">
                        <span>Phase 2 Development</span>
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
