'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Trophy, Terminal, Gamepad2, TrendingUp, ExternalLink } from 'lucide-react';

export default function StreamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: 'Profile', href: '/stream/profile', icon: <User size={16} /> },
    { name: 'Leaderboard', href: '/stream/leaderboard', icon: <Trophy size={16} /> },
    { name: 'Commands', href: '/stream/commands', icon: <Terminal size={16} /> },
    { name: 'Setup', href: '/stream/setup', icon: <Gamepad2 size={16} /> },
    { name: 'Ranks/Tracker', href: '/stream/ranks', icon: <TrendingUp size={16} /> }
  ];

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="glow-blob-1 z-0 animate-pulse" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-28 self-start">
            {/* Brand Card */}
            <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
              
              {/* Twitch Avatar / Website Logo */}
              <div className="relative h-16 w-16 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-lg group">
                <img 
                  src="/ProfilePicture.png" 
                  alt="Primewaaag Logo" 
                  className="h-full w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                />
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Primewaaag</h3>
                <a 
                  href="https://twitch.tv/primewaaag" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 mt-0.5 group/link"
                >
                  twitch.tv/primewaaag
                  <ExternalLink size={10} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="glass-panel border border-white/5 rounded-3xl p-4 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
              <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href} className="flex-shrink-0 lg:flex-shrink-1">
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider ${
                          isActive 
                            ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-white shadow-inner shadow-purple-500/5' 
                            : 'border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <span className={isActive ? 'text-purple-400' : 'text-zinc-500'}>{link.icon}</span>
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* RIGHT CONTENT PANEL */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
