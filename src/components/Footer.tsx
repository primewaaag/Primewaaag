'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socials = [
    { name: 'Discord', url: 'https://discord.com/invite/N5T4SXfE2N', icon: 'https://cdn.simpleicons.org/discord/ffffff' },
    { name: 'Twitch', url: 'https://twitch.tv/primewaaag', icon: 'https://cdn.simpleicons.org/twitch/ffffff' },
    { name: 'YouTube', url: 'https://youtube.com/@primewaaag', icon: 'https://cdn.simpleicons.org/youtube/ffffff' },
    { name: 'TikTok', url: 'https://tiktok.com/@primewaaag', icon: 'https://cdn.simpleicons.org/tiktok/ffffff' },
    { name: 'Steam', url: 'https://steamcommunity.com/id/primewaaag/', icon: 'https://cdn.simpleicons.org/steam/ffffff' },
    { name: 'GitHub', url: 'https://github.com/primewaaag', icon: 'https://cdn.simpleicons.org/github/ffffff' },
    { name: 'Kick', url: 'https://kick.com/primewaaag', icon: 'https://cdn.simpleicons.org/kick/ffffff' },
    { name: 'BuyMeACoffee', url: 'https://buymeacoffee.com/primewaaag', icon: 'https://cdn.simpleicons.org/buymeacoffee/ffffff' },
  ];

  return (
    <footer className="w-full border-t border-white/5 bg-zinc-950/40 backdrop-blur-md relative z-10 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Left Side: Copyright */}
        <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          &copy; {currentYear} waaag.dev
        </div>

        {/* Center: Social Icons */}
        <div className="flex items-center flex-wrap justify-center gap-3">
          {socials.map((soc) => (
            <a
              key={soc.name}
              href={soc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center group"
              title={soc.name}
            >
              <img
                src={soc.icon}
                alt={soc.name}
                className="h-3.5 w-3.5 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>

        {/* Right Side: Legal Links */}
        <div className="flex items-center gap-6 text-xs text-zinc-500 uppercase font-bold tracking-wider">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/tos" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/imprint" className="hover:text-white transition-colors">Imprint</Link>
        </div>
      </div>
    </footer>
  );
}
