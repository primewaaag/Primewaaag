'use client';

import React from 'react';
import { Tv, Sparkles } from 'lucide-react';

export default function StreamProfilePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
          <Tv className="text-purple-400 h-5 w-5 animate-pulse" />
          Twitch Stream Player
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Watch live gaming streams and interact with the community.</p>
      </div>

      <div className="glass-panel border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
        
        {/* Responsive Aspect Ratio container for iframe */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-950">
          <iframe
            src="https://player.twitch.tv/?channel=primewaaag&parent=localhost&parent=waaag.dev&parent=primewaaag.netlify.app&autoplay=false"
            height="100%"
            width="100%"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-start gap-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200">About the Stream</h4>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Tune in to watch high-level gameplay, development discussions, coding sessions, and community events. Chat with us, redeem channel points, and participate in loyalty store activities!
          </p>
        </div>
      </div>
    </div>
  );
}
