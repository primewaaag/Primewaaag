'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Trophy, Medal, Star } from 'lucide-react';

export default function StreamLeaderboardPage() {
  const leaderData = [
    { rank: 1, name: 'SlayerX', points: 15420, watchTime: '124 hours', badge: <Trophy size={16} className="text-amber-400" /> },
    { rank: 2, name: 'NeonPulse', points: 12100, watchTime: '98 hours', badge: <Medal size={16} className="text-zinc-300" /> },
    { rank: 3, name: 'KevGamer', points: 9850, watchTime: '82 hours', badge: <Medal size={16} className="text-amber-600" /> },
    { rank: 4, name: 'WaaagFan99', points: 8760, watchTime: '75 hours', badge: <Star size={14} className="text-cyan-400" /> },
    { rank: 5, name: 'VoidWalker', points: 7420, watchTime: '62 hours', badge: <Star size={14} className="text-cyan-400" /> },
    { rank: 6, name: 'PixelPerfect', points: 6100, watchTime: '51 hours', badge: null }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Loyalty Leaderboard</h2>
        <p className="text-xs text-zinc-400 mt-1">Top viewers ranked by stream loyalty points and watch time.</p>
      </div>

      <div className="bg-white/2 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Viewer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Points</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Watch Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderData.map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black">{row.rank}</span>
                      {row.badge}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-100">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-cyan-400 font-bold">{row.points.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-zinc-400 font-medium">{row.watchTime}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
