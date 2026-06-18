'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';
import { Gamepad2, Trophy, Medal, RefreshCw } from 'lucide-react';

export default function GamesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveStats, setLiveStats] = useState({ rank: "Loading...", peak: "Loading...", winrate: "--%" });
  const [loading, setLoading] = useState(true);

  // Simulated live API tracker call fetching tracking matrices
  const fetchRankStats = async () => {
    setLoading(true);
    try {
      // Replace this block with your actual real api endpoints downstream
      // const res = await fetch('https://api.tracker.gg/v2/mock/profile');
      // const data = await res.json();
      
      await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth loading visualization latency
      setLiveStats({
        rank: "Radiant / Grandmaster",
        peak: "Top #150 Global",
        winrate: "64.2% WR"
      });
    } catch (err) {
      console.error("API configuration fetch mismatch err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankStats();
  }, []);

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      {/* Content wrapper */}
      <div className="relative z-10">
        <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <Gamepad2 className="text-cyan-400" size={28} />
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">LIVE MATCH METRICS</h1>
              </div>
              <p className="text-zinc-400 mt-2 text-sm">Real-time profile API analytics reflecting competitive match stats and server platform logs.</p>
            </div>
            <button 
              onClick={fetchRankStats}
              className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* API TRACKER GRAPH PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner">
                <Trophy size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider">CURRENT LIVE RANK</span>
                <h3 className={`text-lg font-black mt-0.5 tracking-wide ${loading ? 'text-zinc-600 animate-pulse' : 'text-white'}`}>{liveStats.rank}</h3>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-inner">
                <Medal size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider">SEASON PEAK RATING</span>
                <h3 className={`text-lg font-black mt-0.5 tracking-wide ${loading ? 'text-zinc-600 animate-pulse' : 'text-purple-300'}`}>{liveStats.peak}</h3>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                📈
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider">COMPETITIVE WIN RATIO</span>
                <h3 className={`text-lg font-black mt-0.5 tracking-wide ${loading ? 'text-zinc-600 animate-pulse' : 'text-emerald-400'}`}>{liveStats.winrate}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}