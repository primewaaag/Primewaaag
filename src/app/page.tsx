'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';
import { Play, Sparkles, HelpCircle, ChevronDown, ArrowUpRight, Puzzle, Gamepad2, FolderCode, Newspaper } from 'lucide-react';
import { useExtensions } from '@/hooks/useExtensions';
import { useNews } from '@/hooks/useNews';
import { useVideos } from '@/hooks/useVideos';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [checkingLive, setCheckingLive] = useState(true);
  const { featuredExtensions, isLoading: extensionsLoading } = useExtensions();
  const { news, isLoading: newsLoading } = useNews();
  const { videos, isLoading: videosLoading } = useVideos();

  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const res = await fetch('/.netlify/functions/get-twitch-status');
        if (res.ok) {
          const data = await res.json();
          setIsLive(data.isLive);
        }
      } catch (err) {
        console.error('Failed to fetch Twitch live status:', err);
      } finally {
        setCheckingLive(false);
      }
    }
    checkLiveStatus();
  }, []);

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      {/* Page Content wrapper */}
      <div className="relative z-10">
        {/* 1. Global Navigation Bar Component Hooked to Modal Toggle */}
        <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

        <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-28">
          
          {/* ================= HERO: TWITCH LIVE STREAM ================= */}
          {!checkingLive && isLive && (
            <section className="max-w-5xl mx-auto w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/60 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              {/* Border glow effect */}
              <div className="absolute inset-0 border border-purple-500/10 rounded-3xl pointer-events-none group-hover:border-purple-500/30 transition-colors duration-500" />
              <iframe
                src="https://player.twitch.tv/?channel=primewaaag&parent=localhost&autoplay=false"
                className="w-full h-full"
                allowFullScreen
              />
            </section>
          )}

          {/* ================= NEWS SECTION ================= */}
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
              <div className="col-span-full py-16 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                <Newspaper size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                <span>No news articles posted yet. Stay tuned for updates!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => {
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

          {/* ================= EXTENSIONS SECTION ================= */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Puzzle className="text-purple-500" size={24} />
                <h2 className="text-2xl font-black tracking-tight">FEATURED EXTENSIONS</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
              >
                Browse All Extensions <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {extensionsLoading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/10 animate-pulse h-44" />
                ))
              ) : featuredExtensions.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                  <Puzzle size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                  <span>No featured extensions available at the moment.</span>
                </div>
              ) : (
                featuredExtensions.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setIsModalOpen(true)} 
                    className="group p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between relative cursor-pointer overflow-hidden shadow-lg"
                  >
                    {/* Subtle top highlighting */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:text-white group-hover:from-purple-600/20 group-hover:to-indigo-500/20 transition-all shadow-inner">
                          <Puzzle size={20} />
                        </div>
                        
                        {item.badge === 'NEW' && (
                          <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border text-emerald-400 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            NEW
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-black text-xl text-white tracking-wide group-hover:text-purple-300 transition-colors mb-2">{item.name}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3">{item.description || "Elevate live engagement layouts with intuitive interactive elements."}</p>
                    </div>
                    
                    {/* Card Footer: Platforms & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <img src="https://cdn.simpleicons.org/youtube/ff0000" alt="YouTube" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors ml-1 font-semibold uppercase tracking-wider">Multiplatform</span>
                      </div>
                      <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-0.5 transition-colors">
                        Learn More <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ================= RECENT VIDEOS HUB ================= */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <img src="https://cdn.simpleicons.org/youtube/ff0000" alt="YouTube" className="h-6 w-6" />
                <h2 className="text-2xl font-black tracking-tight">RECENT VIDEOS</h2>
              </div>
              <a 
                href="https://youtube.com/@primewaaag" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                Go To Channel <ArrowUpRight size={14} />
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videosLoading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="aspect-video w-full rounded-2xl bg-zinc-950 animate-pulse border border-white/5" />
                ))
              ) : videos.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 text-sm bg-zinc-900/10 border border-white/5 rounded-3xl backdrop-blur-md">
                  <Play size={32} className="mx-auto mb-3 text-zinc-600 stroke-[1.5]" />
                  <span>No recent videos configured.</span>
                </div>
              ) : (
                videos.map((video) => (
                  <a 
                    key={video.id} 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group cursor-pointer space-y-4 block"
                  >
                    <div className="aspect-video w-full rounded-2xl bg-zinc-950 overflow-hidden relative border border-white/5 transition-all duration-300 group-hover:border-red-500/35 group-hover:shadow-[0_10px_35px_rgba(239,68,68,0.12)]">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* Play Overlay (Exclusively shown on hover via opacity transitions) */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play size={20} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-zinc-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                        {video.title}
                      </h3>
                    </div>
                  </a>
                ))
              )}
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

        {/* 2. Floating Popup Extensions Modal Component Controlled Globally */}
        <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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