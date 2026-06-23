'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, X, Target, Loader2, RotateCw, Gamepad2 } from 'lucide-react';

interface GameMatch {
  map: string;
  mode: string;
  agentName: string;
  agentIcon: string;
  result: 'WIN' | 'LOSS';
  score: string;
  kda: string;
  hsRate: string;
  date: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
}

interface BrawlPlayer {
  name: string;
  tag: string;
  rank?: number;
  brawlerName: string;
  brawlerIcon: string;
  power: number;
  trophies: number;
}

interface BrawlMatch {
  map: string;
  mode: string;
  agentName: string;
  agentIcon: string;
  result: 'WIN' | 'LOSS';
  score: string;
  kda: string;
  hsRate: string;
  date: string;
  teamA?: BrawlPlayer[];
  teamB?: BrawlPlayer[];
  soloPlayers?: BrawlPlayer[];
}

interface TrackerData {
  live: boolean;
  ranks: Array<{
    game: string;
    currentRank: string;
    currentRankImg: string;
    peakRank: string;
    peakRankImg: string;
    theme: string;
    bg: string;
    border: string;
    textColor?: string;
  }>;
  stats: {
    hsRate: string;
    kdRatio: string;
    winrate: string;
    kdaRatio: string;
    peakRR: string;
    peakRankName?: string;
    peakRankImg?: string;
    peakSeason?: string;
  };
  games: GameMatch[];
  bsStats?: {
    winrate: string;
    trophies: string;
    highestTrophies: string;
    victories3v3: string;
    showdownWins: string;
  };
  bsGames?: BrawlMatch[];
}

export default function StreamRanksPage() {
  const [selectedGame, setSelectedGame] = useState<GameMatch | null>(null);
  const [bsSelectedGame, setBsSelectedGame] = useState<BrawlMatch | null>(null);
  const [trackerData, setTrackerData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [valCooldown, setValCooldown] = useState(0);
  const [bsCooldown, setBsCooldown] = useState(0);
  const [activeTab, setActiveTab] = useState<'valorant' | 'brawlstars'>('valorant');

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetch('/.netlify/functions/get-game-stats');
      const data = await res.json();
      if (res.ok) {
        setTrackerData(data);
      } else {
        setError(data.error || 'Failed to fetch live stats.');
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Network error occurred while fetching stats.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, []);

  useEffect(() => {
    if (valCooldown > 0) {
      const timer = setTimeout(() => setValCooldown(valCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [valCooldown]);

  useEffect(() => {
    if (bsCooldown > 0) {
      const timer = setTimeout(() => setBsCooldown(bsCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [bsCooldown]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-zinc-500 text-sm">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <span className="font-bold uppercase tracking-widest text-xs">Syncing Live Tracker Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6">
        <div className="h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-2xl">
          <X size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">Syncing Failed</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
          className="px-6 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const ranks = trackerData?.ranks || [];
  const stats = trackerData?.stats || { hsRate: '0.0%', kdRatio: '0.00', winrate: '0.0%', kdaRatio: '0/0/0', peakRR: '0 RR' };
  const games = trackerData?.games || [];

  return (
    <div className="space-y-16">
      {/* 1. RANKS DISPLAY */}
      <section className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Trophy className="text-purple-400 h-5 w-5" />
            Gaming Ranks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ranks.map((item) => (
            <div key={item.game} className="group p-6 rounded-3xl glass-panel relative overflow-hidden shadow-2xl flex flex-col gap-6">
              <div className={`absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent ${item.theme} to-transparent`} />

              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">{item.game}</span>
                <h3 className="text-xl font-black text-white mt-0.5 tracking-wide">Rank Status</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Current Rank */}
                <div className="flex flex-col items-center justify-center text-center bg-zinc-950/45 hover:bg-zinc-950/65 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 group/box shadow-lg min-w-0">
                  <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5 p-1 flex-shrink-0 flex items-center justify-center group-hover/box:scale-105 transition-transform duration-300 mb-2">
                    <img
                      src={item.currentRankImg}
                      alt={item.currentRank}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="w-full min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Current</span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white mt-0.5 leading-tight whitespace-normal break-words">{item.currentRank}</p>
                  </div>
                </div>

                {/* Peak Rank */}
                <div className="flex flex-col items-center justify-center text-center bg-zinc-950/45 hover:bg-zinc-950/65 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 group/box shadow-lg min-w-0">
                  <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5 p-1 flex-shrink-0 flex items-center justify-center group-hover/box:scale-105 transition-transform duration-300 mb-2">
                    <img
                      src={item.peakRankImg}
                      alt={item.peakRank}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="w-full min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Peak</span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white mt-0.5 leading-tight whitespace-normal break-words">{item.peakRank}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LIVE STATS TRACKER CONTAINER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              <Gamepad2 className="text-purple-400 h-5 w-5" />
              Live Stats
            </h2>

            {/* Tab switchers */}
            <div className="flex items-center bg-zinc-950/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('valorant')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${activeTab === 'valorant'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner'
                    : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
              >
                Valorant
              </button>
              {trackerData?.bsStats && (
                <button
                  onClick={() => setActiveTab('brawlstars')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${activeTab === 'brawlstars'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                >
                  Brawl Stars
                </button>
              )}
            </div>
          </div>

          {/* Active Tab's Refresh Button */}
          {activeTab === 'valorant' ? (
            <div className="flex items-center gap-2.5">
              {valCooldown > 0 && (
                <span className="text-xs text-cyan-400/70 font-bold font-mono bg-cyan-950/30 px-2 py-1 rounded-lg border border-cyan-500/10">
                  {valCooldown}s
                </span>
              )}
              <button
                disabled={isRefreshing || valCooldown > 0}
                onClick={() => {
                  fetchStats(false);
                  setValCooldown(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all duration-300 ${valCooldown > 0
                    ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-600 cursor-not-allowed opacity-50'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 border-transparent shadow-[0_0_15px_rgba(34,211,238,0.45)] hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] cursor-pointer hover:scale-105 active:scale-95'
                  }`}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                )}
                <span>Refresh</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {bsCooldown > 0 && (
                <span className="text-xs text-purple-400/70 font-bold font-mono bg-purple-950/30 px-2 py-1 rounded-lg border border-purple-500/10">
                  {bsCooldown}s
                </span>
              )}
              <button
                disabled={isRefreshing || bsCooldown > 0}
                onClick={() => {
                  fetchStats(false);
                  setBsCooldown(15);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all duration-300 ${bsCooldown > 0
                    ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-600 cursor-not-allowed opacity-50'
                    : 'bg-purple-500 hover:bg-purple-400 text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] cursor-pointer hover:scale-105 active:scale-95'
                  }`}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                )}
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'valorant' ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Row Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">HS%</span>
                  <span className="text-xs text-zinc-500 block">Recent</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{stats.hsRate}</h4>
                <p className="text-[9px] text-zinc-500 leading-none">Average over {games.length} matches</p>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">K/D</span>
                  <span className="text-xs text-zinc-500 block">Recent</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{stats.kdRatio}</h4>
                <p className="text-[9px] text-zinc-500 leading-none">Ratio over {games.length} games</p>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-pink-500/20 to-transparent" />
                <div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">Winrate</span>
                  <span className="text-xs text-zinc-500 block">Recent</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{stats.winrate}</h4>
                <p className="text-[9px] text-zinc-500 leading-none">Ratio over {games.length} games</p>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                <div>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">K / D / A</span>
                  <span className="text-xs text-zinc-500 block">Average</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white leading-none">{stats.kdaRatio}</h4>
                <p className="text-[9px] text-zinc-500 leading-none">Avg per match over {games.length} games</p>
              </div>
            </div>

            {/* Games List Container */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">LAST 5 GAMES</h3>

              <div className="space-y-2.5">
                {games.map((game, idx) => {
                  const isWin = game.result === 'WIN';
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedGame(game)}
                      className="flex items-center justify-between p-4 bg-zinc-950/20 hover:bg-zinc-950/45 border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                      {/* Left: Avatar & Map details */}
                      <div className="flex items-center gap-3 pl-1.5">
                        <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center p-0.5">
                          <img src={game.agentIcon} alt={game.agentName} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white tracking-wide">{game.map}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase mt-0.5">{game.mode} • {game.agentName}</p>
                        </div>
                      </div>

                      {/* Right: outcome, score, kda, hs% */}
                      <div className="flex items-center gap-6 sm:gap-12">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {game.result}
                        </span>

                        <div className="hidden sm:block text-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">Score</span>
                          <span className="text-sm font-bold text-white font-mono leading-none">{game.score}</span>
                        </div>

                        <div className="text-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">K/D/A</span>
                          <span className={`text-sm font-black font-mono leading-none ${isWin ? 'text-emerald-400' : 'text-zinc-300'}`}>{game.kda}</span>
                        </div>

                        <div className="text-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">HS%</span>
                          <span className="text-sm font-bold text-white font-mono leading-none">{game.hsRate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          trackerData?.bsStats && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats Row Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Winrate</span>
                    <span className="text-xs text-zinc-500 block">Recent</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{trackerData.bsStats.winrate}</h4>
                  <p className="text-[9px] text-zinc-500 leading-none">Ratio over recent games</p>
                </div>

                <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Trophies</span>
                    <span className="text-xs text-zinc-500 block">Total</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{trackerData.bsStats.trophies}</h4>
                  <p className="text-[9px] text-zinc-500 leading-none">Current overall trophies</p>
                </div>

                <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-amber-500/20 to-transparent" />
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">3v3 Wins</span>
                    <span className="text-xs text-zinc-500 block">Total</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{trackerData.bsStats.victories3v3}</h4>
                  <p className="text-[9px] text-zinc-500 leading-none">3vs3 mode victories</p>
                </div>

                <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Showdown Wins</span>
                    <span className="text-xs text-zinc-500 block">Total</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-none">{trackerData.bsStats.showdownWins}</h4>
                  <p className="text-[9px] text-zinc-500 leading-none">Solo & Duo victories</p>
                </div>
              </div>

              {/* Games List Container */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">LAST 5 BRAWLS</h3>

                <div className="space-y-2.5">
                  {(trackerData.bsGames || []).map((game, idx) => {
                    const isWin = game.result === 'WIN';
                    return (
                      <div
                        key={idx}
                        onClick={() => setBsSelectedGame(game)}
                        className="flex items-center justify-between p-4 bg-zinc-950/20 hover:bg-zinc-950/45 border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                        {/* Left: Brawler Icon & Map details */}
                        <div className="flex items-center gap-3 pl-1.5">
                          <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center p-0.5">
                            <img src={game.agentIcon} alt={game.agentName} className="h-full w-full object-contain" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white tracking-wide">{game.map}</h4>
                            <p className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase mt-0.5">{game.mode} • {game.agentName}</p>
                          </div>
                        </div>

                        {/* Right: outcome, score, kda (power), trophies */}
                        <div className="flex items-center gap-6 sm:gap-12">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {game.result}
                          </span>

                          <div className="hidden sm:block text-center">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">Result</span>
                            <span className="text-sm font-bold text-white font-mono leading-none">{game.score}</span>
                          </div>

                          <div className="text-center">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">Power</span>
                            <span className="text-sm font-black text-white font-mono leading-none">{game.kda}</span>
                          </div>

                          <div className="text-center">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase block leading-none mb-1">Trophies</span>
                            <span className="text-sm font-bold text-white font-mono leading-none">{game.hsRate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}
      </section>

      {/* 4. BRAWL STARS MATCH DETAIL OVERLAY MODAL */}
      {bsSelectedGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-modal-backdrop">
          <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-modal-card flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

            {/* Header section */}
            <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center justify-between border border-white/5 ${bsSelectedGame.result === 'WIN' ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-white/10 p-0.5">
                  <img src={bsSelectedGame.agentIcon} alt={bsSelectedGame.agentName} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{bsSelectedGame.map}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{bsSelectedGame.mode} • {bsSelectedGame.agentName}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{bsSelectedGame.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${bsSelectedGame.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {bsSelectedGame.result}
                </span>
                <button
                  onClick={() => setBsSelectedGame(null)}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Score / Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Brawler</span>
                <span className="text-lg font-black text-white">{bsSelectedGame.agentName}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Power Level</span>
                <span className="text-lg font-black text-white">{bsSelectedGame.kda}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Trophies</span>
                <span className="text-lg font-black text-white">{bsSelectedGame.hsRate}</span>
              </div>
            </div>

            {/* Lineup / Teams */}
            {bsSelectedGame.teamA && bsSelectedGame.teamA.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Match Lineups</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Team A */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">Team A</span>
                    <div className="space-y-2">
                      {bsSelectedGame.teamA.map((p, pIdx) => {
                        const isUser = p.tag === '#8GVUVPVUV';
                        return (
                          <div key={pIdx} className={`flex items-center justify-between p-2.5 rounded-xl border ${isUser ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={p.brawlerIcon} alt={p.brawlerName} className="h-6 w-6 object-contain" />
                              <div className="min-w-0">
                                <span className={`text-xs font-bold truncate block ${isUser ? 'text-purple-300' : 'text-zinc-200'}`}>{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase block">{p.brawlerName} (Lvl {p.power})</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{p.trophies} Tr.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">Team B</span>
                    <div className="space-y-2">
                      {bsSelectedGame.teamB?.map((p, pIdx) => {
                        const isUser = p.tag === '#8GVUVPVUV';
                        return (
                          <div key={pIdx} className={`flex items-center justify-between p-2.5 rounded-xl border ${isUser ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={p.brawlerIcon} alt={p.brawlerName} className="h-6 w-6 object-contain" />
                              <div className="min-w-0">
                                <span className={`text-xs font-bold truncate block ${isUser ? 'text-purple-300' : 'text-zinc-200'}`}>{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase block">{p.brawlerName} (Lvl {p.power})</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{p.trophies} Tr.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : bsSelectedGame.soloPlayers && bsSelectedGame.soloPlayers.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showdown Rankings</h4>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {bsSelectedGame.soloPlayers.map((p, pIdx) => {
                    const isUser = p.tag === '#8GVUVPVUV';
                    return (
                      <div key={pIdx} className={`flex items-center justify-between p-2.5 rounded-xl border ${isUser ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-black text-zinc-500 w-5">#{p.rank}</span>
                          <img src={p.brawlerIcon} alt={p.brawlerName} className="h-6 w-6 object-contain" />
                          <div className="min-w-0">
                            <span className={`text-xs font-bold truncate block ${isUser ? 'text-purple-300' : 'text-zinc-200'}`}>{p.name}</span>
                            <span className="text-[9px] text-zinc-500 uppercase block">{p.brawlerName} (Lvl {p.power})</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">{p.trophies} Tr.</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 5. VALORANT MATCH DETAIL OVERLAY MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-modal-backdrop">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-modal-card flex flex-col gap-6">

            {/* Header section */}
            <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center justify-between border border-white/5 ${selectedGame.result === 'WIN' ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-white/10 p-0.5">
                  <img src={selectedGame.agentIcon} alt={selectedGame.agentName} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{selectedGame.map}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{selectedGame.mode} • {selectedGame.agentName}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{selectedGame.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${selectedGame.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {selectedGame.result}
                </span>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* KDA Cards Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Kills</span>
                <span className="text-xl font-black text-white font-mono">{selectedGame.kills}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Deaths</span>
                <span className="text-xl font-black text-white font-mono">{selectedGame.deaths}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Assists</span>
                <span className="text-xl font-black text-white font-mono">{selectedGame.assists}</span>
              </div>
            </div>

            {/* Score row */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Score</span>
              <span className="text-2xl font-black text-white font-mono">{selectedGame.score}</span>
            </div>

            {/* Hits Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Headshots</span>
                <span className="text-lg font-black text-white font-mono block">{selectedGame.headshots}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                  {((selectedGame.headshots / (selectedGame.headshots + selectedGame.bodyshots + selectedGame.legshots || 1)) * 100).toFixed(1)}%
                </span>
                <span className="text-[8px] text-zinc-500 block">{selectedGame.headshots + selectedGame.bodyshots + selectedGame.legshots} total shots</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Bodyshots</span>
                <span className="text-lg font-black text-white font-mono block">{selectedGame.bodyshots}</span>
                <span className="text-[10px] text-blue-400 font-bold block mt-1">
                  {((selectedGame.bodyshots / (selectedGame.headshots + selectedGame.bodyshots + selectedGame.legshots || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-1">Legshots</span>
                <span className="text-lg font-black text-white font-mono block">{selectedGame.legshots}</span>
                <span className="text-[10px] text-pink-400 font-bold block mt-1">
                  {((selectedGame.legshots / (selectedGame.headshots + selectedGame.bodyshots + selectedGame.legshots || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Donut Chart Visualizer */}
            {(() => {
              const totalShots = selectedGame.headshots + selectedGame.bodyshots + selectedGame.legshots;
              const hsPerc = totalShots > 0 ? (selectedGame.headshots / totalShots) * 100 : 0;
              const bsPerc = totalShots > 0 ? (selectedGame.bodyshots / totalShots) * 100 : 0;
              const lsPerc = totalShots > 0 ? (selectedGame.legshots / totalShots) * 100 : 0;

              // Radius = 40, Circumference = 2 * PI * 40 = 251.2
              const radius = 40;
              const circ = 2 * Math.PI * radius;

              const hsStroke = (hsPerc / 100) * circ;
              const bsStroke = (bsPerc / 100) * circ;
              const lsStroke = (lsPerc / 100) * circ;

              // Calculate offsets
              const hsOffset = 0;
              const bsOffset = hsStroke;
              const lsOffset = hsStroke + bsStroke;

              return (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Accuracy Breakdown</span>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
                    {/* SVG Chart */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />

                        {/* Headshots (Green) */}
                        {hsStroke > 0 && (
                          <circle
                            cx="50" cy="50" r={radius} fill="transparent"
                            stroke="#34d399" strokeWidth="10"
                            strokeDasharray={`${hsStroke} ${circ}`}
                            strokeDashoffset={-hsOffset}
                            strokeLinecap="round"
                          />
                        )}
                        {/* Bodyshots (Blue) */}
                        {bsStroke > 0 && (
                          <circle
                            cx="50" cy="50" r={radius} fill="transparent"
                            stroke="#60a5fa" strokeWidth="10"
                            strokeDasharray={`${bsStroke} ${circ}`}
                            strokeDashoffset={-bsOffset}
                            strokeLinecap="round"
                          />
                        )}
                        {/* Legshots (Pink) */}
                        {lsStroke > 0 && (
                          <circle
                            cx="50" cy="50" r={radius} fill="transparent"
                            stroke="#ec4899" strokeWidth="10"
                            strokeDasharray={`${lsStroke} ${circ}`}
                            strokeDashoffset={-lsOffset}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                        <span className="text-xl font-black text-white font-mono">{totalShots}</span>
                        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Shots</span>
                      </div>
                    </div>

                    {/* Legends */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-zinc-300 font-mono">HS: {hsPerc.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        <span className="text-xs text-zinc-300 font-mono">BS: {bsPerc.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-pink-400" />
                        <span className="text-xs text-zinc-300 font-mono">LS: {lsPerc.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
