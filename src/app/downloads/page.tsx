'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useDownloads } from '@/hooks/useDownloads';
import { Download } from '@/utils/downloads';
import { Loader2, ArrowLeft, Download as DownloadIcon } from 'lucide-react';
import Link from 'next/link';

function DownloadCard({ item }: { item: Download }) {
  return (
    <div className="group flex flex-col space-y-4 cursor-pointer">
      {/* Image container */}
      <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 relative transition-all duration-300 group-hover:border-purple-500/30 group-hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)]">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Text details underneath */}
      <div className="text-center space-y-1">
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors leading-snug uppercase tracking-wide">
          {item.title}
        </h3>
        <p className="text-xs font-semibold text-zinc-400">
          {item.price === '0' || item.price === '0.00' || item.price.toLowerCase() === 'free' ? '€0.00' : item.price}
        </p>
      </div>
    </div>
  );
}

function DownloadsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { downloads, isLoading } = useDownloads();

  const showAll = !categoryParam || (categoryParam !== 'free' && categoryParam !== 'premium' && categoryParam !== 'early-access');

  const activeCategory = categoryParam === 'premium' ? 'premium' : categoryParam === 'early-access' ? 'early-access' : 'free';

  const filteredDownloads = downloads.filter(
    (dl) => dl.category === activeCategory
  );

  const freeDl = downloads.filter(dl => dl.category === 'free');
  const premiumDl = downloads.filter(dl => dl.category === 'premium');
  const earlyAccessDl = downloads.filter(dl => dl.category === 'early-access');

  let mainTitle = 'ALL DOWNLOADS';
  if (!showAll) {
    if (activeCategory === 'premium') {
      mainTitle = 'PREMIUM DOWNLOADS';
    } else if (activeCategory === 'early-access') {
      mainTitle = 'EARLY ACCESS';
    } else {
      mainTitle = 'FREE STUFF';
    }
  }

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          
          {/* Title */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-md">
              {mainTitle}
            </h1>
            <div className="h-1 w-20 bg-purple-600 rounded-full mx-auto" />
          </div>

          {/* Grid view */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-zinc-500 text-sm">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <span>Loading downloads...</span>
            </div>
          ) : downloads.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-zinc-900/20 border border-white/5 p-8 rounded-3xl backdrop-blur-md">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mx-auto text-purple-400">
                <DownloadIcon size={24} />
              </div>
              <p className="font-bold tracking-wide uppercase text-zinc-200">No downloads available yet</p>
              <p className="text-zinc-400 text-xs leading-relaxed">Stay tuned! We are adding new assets to this collection soon.</p>
            </div>
          ) : showAll ? (
            <div className="space-y-16 max-w-5xl mx-auto">
              {/* Free Stuff Group */}
              {freeDl.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Free Stuff
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
                    {freeDl.map((item) => (
                      <DownloadCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Stuff Group */}
              {premiumDl.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Premium Downloads
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
                    {premiumDl.map((item) => (
                      <DownloadCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Early Access Group */}
              {earlyAccessDl.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-400" />
                      Early Access
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
                    {earlyAccessDl.map((item) => (
                      <DownloadCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-zinc-900/20 border border-white/5 p-8 rounded-3xl backdrop-blur-md">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mx-auto text-purple-400">
                <DownloadIcon size={24} />
              </div>
              <p className="font-bold tracking-wide uppercase text-zinc-200">No downloads available</p>
              <p className="text-zinc-400 text-xs leading-relaxed">There are currently no assets in this category. Stay tuned or check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
              {filteredDownloads.map((item) => (
                <DownloadCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default function DownloadsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    }>
      <DownloadsContent />
    </Suspense>
  );
}
