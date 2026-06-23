'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function StreamRanksPage() {
  const ranks = [
    { game: 'Valorant', rank: 'Gold II', image: 'https://static.wikia.nocookie.net/valorant/images/0/02/Gold_2_Rank.png', theme: 'via-amber-500/30', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    { game: 'Brawl Stars', rank: 'Masters', image: 'https://static.wikia.nocookie.net/brawlstars/images/e/e7/Masters_Rank.png', theme: 'via-purple-500/30', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
    { game: 'Fortnite', rank: 'Unreal', image: 'https://mmonster.co/media/78/87/d2/1715773623/fortnite-unreal.webp', theme: 'via-cyan-500/30', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20' }
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Current Gaming Ranks</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {ranks.map((item) => (
            <div key={item.game} className="group p-6 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 relative overflow-hidden shadow-xl">
              <div className={`absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent ${item.theme} to-transparent`} />
              <div className={`h-16 w-16 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300`}>
                <img
                  src={item.image}
                  alt={item.rank}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">{item.game}</span>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-wide">{item.rank}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
        <h3 className="text-base font-bold uppercase tracking-wider text-zinc-300">Live Trackers</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          API integrations are coming soon to show real-time game state, Win/Loss ratios, headshot percentages, and recent match histories directly synced with tracker networks.
        </p>
      </section>
    </div>
  );
}
