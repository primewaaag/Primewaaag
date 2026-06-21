'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';

export default function StatsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      {/* Content wrapper */}
      <div className="relative z-10">
        <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-16">
          
          {/* RANKS SECTION */}
          <section className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Ranks</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Valorant Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
                <div className="h-14 w-14 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://static.wikia.nocookie.net/valorant/images/0/02/Gold_2_Rank.png" 
                    alt="Gold" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Valorant</span>
                  <h3 className="text-lg font-black text-white mt-0.5 tracking-wide">Gold</h3>
                </div>
              </div>

              {/* Brawl Stars Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
                <div className="h-14 w-14 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://static.wikia.nocookie.net/brawlstars/images/e/e7/Masters_Rank.png" 
                    alt="Masters" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Brawl Stars</span>
                  <h3 className="text-lg font-black text-white mt-0.5 tracking-wide">Masters</h3>
                </div>
              </div>

              {/* Fortnite Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://mmonster.co/media/78/87/d2/1715773623/fortnite-unreal.webp" 
                    alt="Unreal" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Fortnite</span>
                  <h3 className="text-lg font-black text-white mt-0.5 tracking-wide">Unreal</h3>
                </div>
              </div>
            </div>
          </section>

          {/* GAMING SETUP SECTION */}
          <section className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Gaming Setup</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mouse Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                
                {/* Rounded white icon container box */}
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0 p-1">
                  <img 
                    src="https://assets2.razerzone.com/images/da10m/carousel/razer-death-adder-gallery-29.png" 
                    alt="Mouse" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white leading-tight">Mouse</h3>
                  <p className="text-sm text-zinc-400 mt-1 truncate">Razer Deathadder V2 Pro</p>
                </div>
              </div>

              {/* Keyboard Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0 p-1.5">
                  <img 
                    src="https://mechanicalkeyboards.com/cdn/shop/files/22138-4RAS5-Wooting-60HE.png" 
                    alt="Keyboard" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white leading-tight">Keyboard</h3>
                  <p className="text-sm text-zinc-400 mt-1 truncate">Wooting 60HE</p>
                </div>
              </div>

              {/* Microphone Card */}
              <div className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0 p-1">
                  <img 
                    src="https://fifinemicrophone.com/cdn/shop/files/FIFINE-ampligame-AM8-dynamic-microphone-black-front.png" 
                    alt="Microphone" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white leading-tight">Microphone</h3>
                  <p className="text-sm text-zinc-400 mt-1 truncate">Fifine AM8</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
