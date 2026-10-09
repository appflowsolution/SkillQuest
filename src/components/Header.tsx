import { Volume2, VolumeX, ShieldCheck, ArrowLeft, Sparkles, UserCheck } from 'lucide-react';
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
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
      {/* Left side: Logo or Back Button */}
      <div className="flex items-center gap-4">
        {currentView === 'game' ? (
          <button
            onClick={() => {
              soundEngine.playTap();
              onBackToDashboard();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl font-bold text-base transition-all border border-slate-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600" />
            <span>Games Menu</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/40">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">SkillQuest</h1>
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  RBT Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Behavioral & Educational Suite</p>
            </div>
          </div>
        )}

        {currentView === 'game' && activeGameTitle && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Mission:</span>
            <span className="text-base font-extrabold text-slate-800">{activeGameTitle}</span>
          </div>
        )}
      </div>

      {/* Right side: Generic Student Profile & RBT Controls */}
      <div className="flex items-center gap-3">
        {/* Generic Learner Profile Badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800">Learner Profile</div>
            <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Grade 5 • Active Session</div>
          </div>
        </div>

        {/* RBT Co-Pilot Toggle */}
        <button
          onClick={() => {
            soundEngine.playTap();
            onToggleRbtMode();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            rbtMode
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm shadow-amber-500/10'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
          title="Toggle RBT clinical supervisor panel"
        >
          <ShieldCheck className={`w-4 h-4 ${rbtMode ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="hidden md:inline">RBT Co-Pilot</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) soundEngine.playTap();
          }}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 flex items-center justify-center text-slate-700 transition-all shadow-sm"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-rose-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
