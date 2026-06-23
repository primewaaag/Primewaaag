'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Play, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ArrowUpRight, 
  Newspaper, 
  Download as DownloadIcon, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useDownloads } from '@/hooks/useDownloads';
import { useNews } from '@/hooks/useNews';
import Link from 'next/link';

interface Supporter {
  username: string;
  avatar?: string;
  role?: string;
}

export default function Home() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [supportersLoading, setSupportersLoading] = useState(true);
  const { downloads, isLoading: downloadsLoading } = useDownloads();
  const { news, isLoading: newsLoading } = useNews();

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSupporters() {
      try {
        const res = await fetch('/.netlify/functions/get-supporters');
        if (res.ok) {
          const data = await res.json();
          setSupporters(data);
        }
      } catch (err) {
        console.error('Failed to fetch supporters:', err);
      } finally {
        setSupportersLoading(false);
      }
    }
    fetchSupporters();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const cardWidth = 320; // approximate card width
      const scrollTo = direction === 'left' 
        ? scrollLeft - cardWidth * 1.5 
        : scrollLeft + cardWidth * 1.5;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden pb-20">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      {/* Page Content wrapper */}
      <div className="relative z-10">
        <Navbar />

        <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-28">
          
          {/* ================= HERO SECTION (TOP THING WITH SOME INFOS) ================= */}
          <section className="relative py-8 md:py-16 flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Elevate Your Live Stream
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Unlock a premium collection of Streamer.bot extensions, OBS overlays, widgets, and tools built specifically for Twitch and YouTube broadcasters to boost chat interactivity.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/downloads"
                className="px-8 py-3 rounded-2xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                Explore Downloads
              </Link>
              <a
                href="https://discord.com/invite/N5T4SXfE2N"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Join Discord
              </a>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-10">
              <div className="flex flex-col items-center p-6 rounded-3xl glass-panel border border-white/5 space-y-2">
                <Zap className="text-purple-400 h-6 w-6" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">Streamer.bot Integration</span>
                <span className="text-[11px] text-zinc-400">Easy-to-use plug-and-play actions</span>
              </div>
              <div className="flex flex-col items-center p-6 rounded-3xl glass-panel border border-white/5 space-y-2">
                <Globe className="text-emerald-400 h-6 w-6" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">Multiplatform Ready</span>
                <span className="text-[11px] text-zinc-400">Designed for Twitch and YouTube</span>
              </div>
              <div className="flex flex-col items-center p-6 rounded-3xl glass-panel border border-white/5 space-y-2">
                <ShieldCheck className="text-cyan-400 h-6 w-6" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">Premium Quality</span>
                <span className="text-[11px] text-zinc-400">Highly customized and well tested</span>
              </div>
            </div>
          </section>

          {/* ================= EXPLORE DOWNLOADS: CAROUSEL SECTION ================= */}
          <section className="space-y-8 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <DownloadIcon className="text-purple-500" size={24} />
                <h2 className="text-2xl font-black tracking-tight">EXPLORE DOWNLOADS</h2>
              </div>
              
              {/* Carousel Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Scroll Container */}
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {downloadsLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex-shrink-0 w-[300px] h-80 rounded-3xl border border-white/5 bg-zinc-900/10 animate-pulse" />
                ))
              ) : downloads.length === 0 ? (
                <div className="w-full py-16 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                  <DownloadIcon size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                  <span>No downloads available at the moment.</span>
                </div>
              ) : (
                downloads.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/downloads?category=${item.category}`}
                    className="flex-shrink-0 w-[300px] snap-start group p-5 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between relative cursor-pointer overflow-hidden shadow-lg border border-white/5 hover:border-purple-500/20 transition-all duration-300"
                  >
                    {/* Image Header */}
                    <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 aspect-video relative mb-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900/30">
                          <DownloadIcon size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          {item.price === 'FREE' ? (
                            <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border text-emerald-400 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              FREE
                            </span>
                          ) : (
                            <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border text-amber-400 bg-amber-500/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                              PREMIUM
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider">{item.category}</span>
                        </div>
                        
                        <h3 className="font-black text-base text-white tracking-wide group-hover:text-purple-300 transition-colors mb-1.5 uppercase line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.description || "Elevate live engagement layouts with intuitive interactive elements."}</p>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <img src="https://cdn.simpleicons.org/youtube/ff0000" alt="YouTube" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-0.5 transition-colors">
                          Get Asset <ArrowUpRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* ================= NEWS SECTION (LATEST 6 IN A 3-GRID ONE) ================= */}
          <section className="space-y-8">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Newspaper size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">NEWS</h2>
              </div>
              <p className="text-sm text-zinc-400">Stay up to date with new releases, updates, and announcements.</p>
            </div>

            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="aspect-square bg-zinc-900/10 border border-white/5 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                <Newspaper size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                <span>No news articles posted yet. Stay tuned for updates!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.slice(0, 6).map((item) => {
                  const isYoutube = item.mediaUrl && (item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be'));
                  let ytEmbedUrl = '';
                  if (isYoutube && item.mediaUrl) {
                    const ytIdMatch = item.mediaUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\/\s]{11})/);
                    if (ytIdMatch) {
                      ytEmbedUrl = `https://www.youtube.com/embed/${ytIdMatch[1]}`;
                    }
                  }

                  let categoryColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // RELEASE - orange
                  let borderHighlight = 'border-white/5 hover:border-amber-500/25';
                  if (item.type === 'NEW VIDEO') {
                    categoryColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; // RED
                    borderHighlight = 'border-white/5 hover:border-rose-500/25';
                  } else if (item.type === 'ANNOUNCEMENT') {
                    categoryColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; // PURPLE
                    borderHighlight = 'border-white/5 hover:border-purple-500/25';
                  }

                  return (
                    <div 
                      key={item.id}
                      className={`group flex flex-col justify-between rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden transition-all duration-300 border ${borderHighlight} hover:shadow-purple-500/5`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border ${categoryColor}`}>
                            {item.type}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors uppercase leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {item.content}
                        </p>

                        {item.mediaUrl && (
                          <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 relative aspect-video mt-2">
                            {isYoutube && ytEmbedUrl ? (
                              <iframe
                                src={ytEmbedUrl}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            ) : (
                              <img
                                src={item.mediaUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {item.readMoreUrl && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <a 
                            href={item.readMoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                          >
                            Read more <ArrowUpRight size={12} className="stroke-[2.5]" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ================= SUPPORTERS SECTION (BIG CARD WITH PIC AND NAME) ================= */}
          <section className="space-y-8">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Heart size={20} className="fill-current" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">SUPPORTERS</h2>
              </div>
              <p className="text-sm text-zinc-400">Awesome people supporting the stream and website!</p>
            </div>

            {supportersLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-44 bg-zinc-900/10 border border-white/5 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : supporters.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                <Heart size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                <span>No supporters listed yet. Link your Twitch account or sub to join the list!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {supporters.map((supporter, idx) => {
                  const avatarUrl = supporter.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(supporter.username)}&background=8b5cf6&color=fff`;
                  
                  let borderClass = 'border-white/5 hover:border-purple-500/30';
                  let ringColor = 'border-purple-500/20 group-hover:border-purple-500/60';
                  
                  if (supporter.role === 'Admin') {
                    borderClass = 'border-red-500/10 hover:border-red-500/40 hover:shadow-red-500/5';
                    ringColor = 'border-red-500/20 group-hover:border-red-500/60';
                  } else if (supporter.role === 'Twitch Subscriber') {
                    borderClass = 'border-purple-500/10 hover:border-purple-500/40 hover:shadow-purple-500/5';
                    ringColor = 'border-purple-500/20 group-hover:border-purple-500/60';
                  } else if (supporter.role === 'Premium' || (supporter.role && supporter.role.includes('Tier 3'))) {
                    borderClass = 'border-amber-500/10 hover:border-amber-500/40 hover:shadow-amber-500/5';
                    ringColor = 'border-amber-500/20 group-hover:border-amber-500/60';
                  }

                  return (
                    <div 
                      key={idx}
                      className={`group flex flex-col items-center justify-center p-6 rounded-3xl glass-panel border ${borderClass} transition-all duration-300 hover:scale-[1.03] text-center`}
                    >
                      <img 
                        src={avatarUrl} 
                        alt={supporter.username} 
                        className={`h-20 w-20 rounded-full border-2 ${ringColor} object-cover shadow-lg bg-zinc-950 transition-all duration-300 mb-4`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(supporter.username)}&background=8b5cf6&color=fff`;
                        }}
                      />
                      <span className="font-bold text-sm text-white truncate uppercase tracking-wider group-hover:text-purple-300 transition-colors max-w-full">
                        {supporter.username}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ================= NEED HELP / DISCORD SECTION ================= */}
          <section className="max-w-4xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-3xl glass-panel border border-white/5 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              {/* Subtle internal glowing blob */}
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
              
              <div className="space-y-4 max-w-xl text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MessageSquare className="text-purple-400 h-5 w-5" />
                  <h3 className="font-black text-lg tracking-tight uppercase text-white">Need help or just want to chat?</h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Need help? Found a bug? Want to commission your unique idea? Or just have a feature request for an existing extension? Join the Discord and hit me up :)
                </p>
              </div>

              <a
                href="https://discord.com/invite/N5T4SXfE2N"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_10px_20px_rgba(88,101,242,0.2)] hover:shadow-[0_10px_25px_rgba(88,101,242,0.35)] cursor-pointer whitespace-nowrap"
              >
                <img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" className="h-4 w-4" />
                Join Discord
              </a>
            </div>
          </section>

          {/* ================= FAQ ACCORDION ================= */}
          <section className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 justify-center text-center pb-4">
              <HelpCircle className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-black tracking-tight">FAQ</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: "How do I install these streaming extensions?", a: "Simply sign in with your Twitch or Discord account, navigate to the active setup panel of your chosen extension, copy your dedicated asset browser source link, and drop it straight into OBS Studio." },
                { q: "Are these configurations free to use commercially?", a: "Yes, our widgets are completely free and open-source. Extensions can be added, toggled, and managed in real-time via the administration dashboard panel." }
              ].map((item, idx) => (
                <FaqItem key={idx} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

// Reusable FAQ Accordion Sub-Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-cyan-500/25 bg-cyan-500/[0.02]' : 'hover:border-white/10 hover:bg-white/[0.01]'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-sm sm:text-base tracking-wide">{question}</span>
        <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 border-t border-white/5' : 'max-h-0'}`}>
        <p className="p-5 text-sm text-zinc-400 leading-relaxed bg-zinc-950/40">{answer}</p>
      </div>
    </div>
  );
}