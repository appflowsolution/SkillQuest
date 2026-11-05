import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Gamepad2, 
  Sparkles, 
  Download, 
  RotateCcw, 
  KeyRound, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Flame,
  Calendar,
  Layers
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { GAMES_CATALOG } from '../../data/games';
import { 
  getGameStats, 
  getSessionHistory,
  aggregateStatsByTimeframe,
  normalizeStatsMap,
  exportStatsCSV, 
  exportStatsJSON, 
  resetAllStats, 
  changePin 
} from '../../services/statsService';
import type { 
  GameUsageStat, 
  SessionRecord, 
  TimeframeFilter, 
  MetricFilter, 
  GameChartData 
} from '../../types/stats';
import type { WorldSector, GameId } from '../../types';

interface StatsDashboardProps {
  onBack: () => void;
}

const SHORT_TITLES: Record<GameId, string> = {
  'break-request': 'Break Quest',
  'more-time': 'Time Warp',
  'turn-taking': 'Star Tower',
  'aac-trainer': 'Icon Quest',
  'request-help': 'Critters Lab',
  'echoic-lab': 'Echo Beats',
  'memory-vault': 'Memory Vault',
  'cosmic-fuel': 'Cosmic Fuel',
  'meteor-array': 'Meteor Array',
  'number-forge': 'Number Forge'
};

export const StatsDashboard = ({ onBack: _onBack }: StatsDashboardProps) => {
  const [stats, setStats] = useState<Record<string, GameUsageStat>>({});
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls requested by user
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('total');
  const [metric, setMetric] = useState<MetricFilter>('sessions');
  const [sectorFilter, setSectorFilter] = useState<'all' | WorldSector>('all');
  const [activeHoverGame, setActiveHoverGame] = useState<GameChartData | null>(null);

  // Modals state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    const [statsData, sessionsData] = await Promise.all([
      getGameStats(),
      getSessionHistory()
    ]);
    setStats(statsData);
    setSessions(sessionsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Aggregated data according to active timeframe
  const timeframeAggregates = useMemo(() => {
    return aggregateStatsByTimeframe(timeframe, sessions, stats);
  }, [timeframe, sessions, stats]);

  // Compute chart items
  const chartData: GameChartData[] = useMemo(() => {
    const totalTimeframeDuration = Object.values(timeframeAggregates).reduce((sum, item) => sum + item.durationSeconds, 0);
    const totalTimeframeSessions = Object.values(timeframeAggregates).reduce((sum, item) => sum + item.sessionsCount, 0);

    return GAMES_CATALOG
      .filter(game => {
        if (sectorFilter === 'all') return true;
        return game.sector === sectorFilter;
      })
      .map(game => {
        const agg = timeframeAggregates[game.id] || { sessionsCount: 0, durationSeconds: 0 };
        const durationMinutes = Math.round(agg.durationSeconds / 60);

        // Share percentage reflects the active inspection metric (sessions share vs duration share)
        const percentage = metric === 'sessions'
          ? (totalTimeframeSessions > 0 ? Math.min(100, Math.round((agg.sessionsCount / totalTimeframeSessions) * 100)) : 0)
          : (totalTimeframeDuration > 0 ? Math.min(100, Math.round((agg.durationSeconds / totalTimeframeDuration) * 100)) : 0);

        return {
          gameId: game.id,
          title: game.title,
          shortTitle: SHORT_TITLES[game.id] || game.title,
          sector: game.sector || 'behavior',
          skillCode: game.skillCode,
          skillName: game.skillName,
          sessionsCount: agg.sessionsCount,
          durationSeconds: agg.durationSeconds,
          durationMinutes,
          percentage
        };
      });
  }, [timeframeAggregates, sectorFilter, metric]);

  // Overview KPIs calculated dynamically from timeframe aggregates
  const overview = useMemo(() => {
    let totalSessions = 0;
    let totalDurationSeconds = 0;
    let mostPlayed: { title: string; count: number } | null = null;
    let activeGamesCount = 0;

    for (const item of chartData) {
      if (item.sessionsCount > 0 || item.durationSeconds > 0) {
        activeGamesCount++;
        totalSessions += item.sessionsCount;
        totalDurationSeconds += item.durationSeconds;

        if (!mostPlayed || item.sessionsCount > mostPlayed.count) {
          mostPlayed = {
            title: item.title,
            count: item.sessionsCount
          };
        }
      }
    }

    return {
      totalSessions,
      totalDurationSeconds,
      mostPlayed,
      activeGamesCount
    };
  }, [chartData]);

  // Compute Y-Axis max & ticks
  const { maxVal, yTicks, timeUnit } = useMemo(() => {
    if (metric === 'sessions') {
      const max = Math.max(...chartData.map(d => d.sessionsCount), 0);
      const roundedMax = Math.max(4, Math.ceil(max / 4) * 4);
      const step = roundedMax / 4;
      return {
        maxVal: roundedMax,
        yTicks: [roundedMax, step * 3, step * 2, step, 0],
        timeUnit: ''
      };
    } else {
      const maxSec = Math.max(...chartData.map(d => d.durationSeconds), 0);
      if (maxSec <= 120) {
        // High-resolution seconds scale for fine-grained practice sessions
        const roundedMaxSec = Math.max(20, Math.ceil(Math.max(maxSec, 20) / 20) * 20);
        const step = roundedMaxSec / 4;
        return {
          maxVal: roundedMaxSec,
          yTicks: [roundedMaxSec, step * 3, step * 2, step, 0],
          timeUnit: 's'
        };
      } else {
        // Minutes scale for longer aggregate playtimes
        const maxMin = Math.ceil(maxSec / 60);
        const roundedMaxMin = Math.max(4, Math.ceil(maxMin / 4) * 4);
        const step = roundedMaxMin / 4;
        return {
          maxVal: roundedMaxMin * 60, // in seconds for proportional calculation
          yTicks: [roundedMaxMin, step * 3, step * 2, step, 0],
          timeUnit: 'm'
        };
      }
    }
  }, [chartData, metric]);

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds < 1) return '0s';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleReset = async () => {
    soundEngine.playPairMiss();
    try {
      await resetAllStats();
      setStats(normalizeStatsMap({}));
      setSessions([]);
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error('[handleReset] Failed:', err);
      setIsResetConfirmOpen(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length >= 4) {
      const ok = await changePin(newPinInput);
      if (ok) {
        soundEngine.playSuccess();
        setPinChangeSuccess(true);
        setTimeout(() => {
          setPinChangeSuccess(false);
          setIsChangePinOpen(false);
          setNewPinInput('');
        }, 1200);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#002833] text-white overflow-hidden select-none">
      {/* Top Action Toolbar */}
      <div className="h-14 md:h-16 bg-[#001f28]/70 border-b border-white/10 px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00d2b4]" />
          <span className="text-sm md:text-base font-black tracking-tight text-white">
            RBT & Clinical Analytics Hub
          </span>
          <span className="hidden md:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00d2b4]/20 text-[#00d2b4] border border-[#00d2b4]/30">
            Cloud Sync Active
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTap();
              fetchAllData();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00d2b4]' : ''}`} />
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              exportStatsCSV(stats);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#009b84]/40 hover:bg-[#009b84]/60 text-white text-xs font-bold transition-all border border-[#00d2b4]/40"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              exportStatsJSON(stats, sessions);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10"
            title="Export JSON"
          >
            <span>JSON</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              setIsChangePinOpen(true);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Change PIN"
          >
            <KeyRound className="w-4 h-4 text-[#ffb703]" />
          </button>

          <button
            onClick={() => {
              soundEngine.playTap();
              setIsResetConfirmOpen(true);
            }}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-all border border-rose-500/30"
            title="Reset Statistics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Summary Cards (Updated per selected timeframe) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Play Time */}
          <div className="bg-[#003442] border border-white/10 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d2b4]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Play Time</span>
              <div className="w-8 h-8 rounded-xl bg-[#00d2b4]/20 flex items-center justify-center text-[#00d2b4]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {formatDuration(overview.totalDurationSeconds)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 capitalize">In {timeframe} window</p>
          </div>

          {/* Card 2: Total Sessions */}
          <div className="bg-[#003442] border border-white/10 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff477e]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-[#ff477e]/20 flex items-center justify-center text-[#ff477e]">
                <Gamepad2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {overview.totalSessions}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sessions launched</p>
          </div>

          {/* Card 3: Favorite Mission */}
          <div className="bg-[#003442] border border-white/10 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb703]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Favorite Mission</span>
              <div className="w-8 h-8 rounded-xl bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-white truncate" title={overview.mostPlayed?.title || 'No records'}>
              {overview.mostPlayed ? overview.mostPlayed.title : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {overview.mostPlayed ? `${overview.mostPlayed.count} sessions played` : 'No activity in period'}
            </p>
          </div>

          {/* Card 4: Active Missions */}
          <div className="bg-[#003442] border border-white/10 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Missions</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {overview.activeGamesCount} <span className="text-sm font-bold text-slate-400">/ {GAMES_CATALOG.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Missions with activity</p>
          </div>
        </div>

        {/* Dual Switcher Controls Panel (Timeframe & Vertical Metric) */}
        <div className="bg-[#003442] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Switcher 1: Timeframe (Diario, Semanal, Mensual, Total) */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-300 shrink-0">
              <Calendar className="w-4 h-4 text-[#00d2b4]" />
              <span className="uppercase tracking-wider">Time Scale:</span>
            </div>
            <div className="flex items-center gap-1 bg-[#001f28] p-1 rounded-xl border border-white/10 flex-1 md:flex-initial">
              {(['daily', 'weekly', 'monthly', 'total'] as TimeframeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    soundEngine.playTap();
                    setTimeframe(tf);
                  }}
                  className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all capitalize ${
                    timeframe === tf
                      ? 'bg-[#00d2b4] text-[#002f3c] shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf === 'daily' ? 'Daily' : tf === 'weekly' ? 'Weekly' : tf === 'monthly' ? 'Monthly' : 'Total'}
                </button>
              ))}
            </div>
          </div>

          {/* Switcher 2: Vertical Axis Metric (Sessions vs Time) */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-300 shrink-0">
              <Layers className="w-4 h-4 text-[#ffb703]" />
              <span className="uppercase tracking-wider">Vertical Axis:</span>
            </div>
            <div className="flex items-center gap-1 bg-[#001f28] p-1 rounded-xl border border-white/10 flex-1 md:flex-initial">
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setMetric('sessions');
                }}
                className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  metric === 'sessions'
                    ? 'bg-[#ffb703] text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                No. of Sessions
              </button>
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setMetric('time');
                }}
                className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  metric === 'time'
                    ? 'bg-[#ffb703] text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Play Time
              </button>
            </div>
          </div>
        </div>

        {/* Sector Tabs (All / Behavior / Math) */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-[#001f28] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundEngine.playTap();
                setSectorFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                sectorFilter === 'all' 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Missions ({GAMES_CATALOG.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playTap();
                setSectorFilter('behavior');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                sectorFilter === 'behavior' 
                  ? 'bg-[#ff477e] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Behavior & Superpowers
            </button>
            <button
              onClick={() => {
                soundEngine.playTap();
                setSectorFilter('math');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                sectorFilter === 'math' 
                  ? 'bg-[#00bbf9] text-[#002f3c] shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Math & Logic
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Interactive Bar Chart · Tap bars for details
          </span>
        </div>

        {/* PRIMARY BAR CHART CONTAINER */}
        <div className="bg-[#003442] border border-white/10 rounded-3xl p-5 md:p-7 shadow-2xl relative">
          {/* Active Hover / Touch Tooltip Badge */}
          <div className="min-h-[44px] mb-4 flex items-center justify-between bg-black/25 px-4 py-2 rounded-2xl border border-white/5">
            {activeHoverGame ? (
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#ffb703] uppercase">
                    {activeHoverGame.skillCode}:
                  </span>
                  <span className="text-sm font-black text-white">{activeHoverGame.title}</span>
                  <span className="text-xs text-slate-300 font-medium">({activeHoverGame.skillName})</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-[#00d2b4]">
                    {activeHoverGame.sessionsCount} {activeHoverGame.sessionsCount === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="text-[#ffb703]">
                    {formatDuration(activeHoverGame.durationSeconds)}
                  </span>
                  <span className="text-slate-400">
                    ({activeHoverGame.percentage}% share)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00d2b4]" />
                <span>Hover or tap any game bar to inspect detailed clinical metrics for this {timeframe} timeframe</span>
              </div>
            )}
          </div>

          {/* Bar Chart Area with Y-Axis and Columns */}
          <div className="relative h-72 md:h-80 w-full flex pt-4 pb-12">
            {/* Y-Axis Labels & Horizontal Grid Lines */}
            <div className="w-12 md:w-16 h-full flex flex-col justify-between items-end pr-3 pb-8 shrink-0 text-slate-400 text-[10px] md:text-xs font-mono font-bold select-none border-r border-white/10">
              {yTicks.map((tick, i) => (
                <span key={i} className="-translate-y-2">
                  {metric === 'sessions' ? tick : `${tick}${timeUnit}`}
                </span>
              ))}
            </div>

            {/* Chart Grid Lines (Background) */}
            <div className="absolute left-12 md:left-16 right-0 top-4 bottom-20 pointer-events-none flex flex-col justify-between">
              {yTicks.map((_, i) => (
                <div key={i} className="w-full border-b border-white/5" />
              ))}
            </div>

            {/* Bars Container */}
            <div className="flex-1 h-full flex items-end justify-around px-2 md:px-4 relative z-10 pb-8">
              {chartData.map((item) => {
                const numericValue = metric === 'sessions' 
                  ? item.sessionsCount 
                  : item.durationSeconds;

                const heightPercent = maxVal > 0 
                  ? Math.min(100, Math.max(0, (numericValue / maxVal) * 100))
                  : 0;

                const isHovered = activeHoverGame?.gameId === item.gameId;

                const barTopLabel = (() => {
                  if (numericValue <= 0) return '0';
                  if (metric === 'sessions') return `${numericValue}`;
                  if (numericValue < 60) return `${numericValue}s`;
                  const mins = numericValue / 60;
                  return mins % 1 === 0 ? `${mins}m` : `${mins.toFixed(1)}m`;
                })();

                return (
                  <div 
                    key={item.gameId}
                    className="flex-1 flex flex-col items-center h-full justify-end group px-1 max-w-[70px] cursor-pointer"
                    onMouseEnter={() => setActiveHoverGame(item)}
                    onMouseLeave={() => setActiveHoverGame(null)}
                    onClick={() => {
                      soundEngine.playTap();
                      setActiveHoverGame(item);
                    }}
                  >
                    {/* Value label on top of bar */}
                    <div 
                      className={`text-[11px] font-mono font-black mb-1 transition-all ${
                        numericValue > 0 
                          ? isHovered ? 'text-white scale-125' : 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {barTopLabel}
                    </div>

                    {/* Animated Bar Column */}
                    <div className="w-full h-full flex items-end justify-center">
                      <div 
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 relative ${
                          numericValue === 0
                            ? 'h-1.5 bg-white/10'
                            : item.sector === 'math'
                              ? isHovered
                                ? 'bg-gradient-to-t from-cyan-500 via-sky-400 to-indigo-300 shadow-lg shadow-cyan-500/50 scale-x-105'
                                : 'bg-gradient-to-t from-cyan-600 to-sky-400 shadow-md'
                              : isHovered
                                ? 'bg-gradient-to-t from-[#00b59b] via-[#00d2b4] to-yellow-300 shadow-lg shadow-teal-400/50 scale-x-105'
                                : 'bg-gradient-to-t from-[#009b84] to-[#00d2b4] shadow-md'
                        }`}
                        style={{ 
                          height: numericValue > 0 ? `${Math.max(8, heightPercent)}%` : '6px' 
                        }}
                      >
                        {/* Shimmer light effect on top of bar */}
                        {numericValue > 0 && (
                          <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40 rounded-t-xl" />
                        )}
                      </div>
                    </div>

                    {/* X-Axis Game Label Below Bar */}
                    <div className="absolute -bottom-8 flex flex-col items-center">
                      <span 
                        className={`text-[10px] md:text-[11px] font-black tracking-tight text-center truncate max-w-[62px] md:max-w-[70px] transition-all ${
                          isHovered ? 'text-[#ffb703] font-bold scale-105' : 'text-slate-300'
                        }`}
                        title={item.title}
                      >
                        {item.shortTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Compact Ranking & Usage Leaderboard Table */}
        <div className="bg-[#003442] border border-white/10 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ffb703]" />
              <span>Usage Breakdown ({timeframe.toUpperCase()})</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              Sorted by {metric === 'sessions' ? 'session frequency' : 'play duration'}
            </span>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {chartData
              .slice()
              .sort((a, b) => {
                if (metric === 'sessions') {
                  return b.sessionsCount - a.sessionsCount;
                }
                return b.durationSeconds - a.durationSeconds;
              })
              .map((item, idx) => (
                <div 
                  key={item.gameId} 
                  className="py-2.5 px-2 flex items-center justify-between gap-4 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                  onClick={() => {
                    soundEngine.playTap();
                    setActiveHoverGame(item);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-black text-slate-400 font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{item.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.sector === 'math' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.skillCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.skillName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-black text-[#00d2b4]">{item.sessionsCount} sessions</div>
                      <div className="text-[10px] text-slate-400">{formatDuration(item.durationSeconds)}</div>
                    </div>
                    <div className="w-16 hidden sm:block">
                      <div className="text-[10px] text-slate-400 font-bold mb-0.5">{item.percentage}% share</div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00d2b4] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal Confirm Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#002833] border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-white">Reset All Statistics?</h3>
            <p className="text-xs text-center text-slate-300 mt-2 mb-6">
              This action will permanently erase gameplay records in Firebase and local storage. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-500/30"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Change PIN */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#002833] border-2 border-[#ffb703]/50 rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center mb-3 mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-white">Change Access PIN</h3>
            <p className="text-xs text-center text-slate-300 mt-1 mb-5">
              Enter a new 4-digit numeric passcode.
            </p>

            <form onSubmit={handleChangePin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="New PIN (e.g. 5678)"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-2xl bg-black/40 border-2 border-white/20 focus:border-[#ffb703] outline-none text-white placeholder-slate-500"
              />

              {pinChangeSuccess && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>PIN successfully updated</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPinInput.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-[#ffb703] hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-black text-xs shadow-lg shadow-amber-500/20"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
