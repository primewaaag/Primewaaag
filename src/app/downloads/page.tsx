'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useDownloads } from '@/hooks/useDownloads';
import { Download } from '@/utils/downloads';
import { 
  Loader2, 
  ArrowLeft, 
  Download as DownloadIcon, 
  Link as LinkIcon, 
  Copy as CopyIcon, 
  Code as CodeIcon, 
  Terminal as TerminalIcon, 
  ExternalLink as ExternalLinkIcon, 
  X as XIcon, 
  Check as CheckIcon 
} from 'lucide-react';
import Link from 'next/link';

function renderCopyIcon(iconName?: string) {
  switch (iconName) {
    case 'copy':
      return <CopyIcon size={18} className="text-purple-400" />;
    case 'code':
      return <CodeIcon size={18} className="text-purple-400" />;
    case 'terminal':
      return <TerminalIcon size={18} className="text-purple-400" />;
    case 'external-link':
      return <ExternalLinkIcon size={18} className="text-purple-400" />;
    case 'link':
    default:
      return <LinkIcon size={18} className="text-purple-400" />;
  }
}

function CopyBox({ title, desc, text, buttonText, iconName }: { title: string, desc: string, text: string, buttonText: string, iconName?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl space-y-4">
      {/* Icon + Title/Desc Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          {renderCopyIcon(iconName)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">{title || 'Source URL'}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{desc || 'Copy this link to OBS.'}</p>
        </div>
      </div>

      {/* Copy Action Input Row */}
      <div className="flex gap-2 items-center p-1 bg-zinc-950/80 rounded-xl border border-white/5">
        <input 
          type="text" 
          readOnly 
          value={text} 
          className="bg-transparent text-zinc-300 font-mono text-xs px-3 py-2 flex-grow focus:outline-none select-all truncate" 
        />
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            copied 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon size={12} /> Copied!
            </>
          ) : (
            buttonText || 'Copy URL'
          )}
        </button>
      </div>
    </div>
  );
}

function DownloadCard({ item, onClick }: { item: Download; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group flex flex-col space-y-4 cursor-pointer">
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
        <p className="text-xs font-black tracking-widest uppercase">
          {item.price === 'FREE' ? (
            <span className="text-emerald-400">FREE</span>
          ) : (
            <span className="text-amber-400">PREMIUM</span>
          )}
        </p>
      </div>
    </div>
  );
}

function DownloadsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { downloads, isLoading } = useDownloads();
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(null);

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
                      <DownloadCard key={item.id} item={item} onClick={() => setSelectedDownload(item)} />
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
                      <DownloadCard key={item.id} item={item} onClick={() => setSelectedDownload(item)} />
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
                      <DownloadCard key={item.id} item={item} onClick={() => setSelectedDownload(item)} />
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
                <DownloadCard key={item.id} item={item} onClick={() => setSelectedDownload(item)} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedDownload && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedDownload(null)}
        >
          <div 
            className="bg-zinc-900/90 border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Image Banner */}
            <div className="w-full h-52 bg-zinc-950 relative overflow-hidden">
              <img 
                src={selectedDownload.imageUrl} 
                alt={selectedDownload.title} 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDownload(null)}
                className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full p-2 border border-white/10 transition-all cursor-pointer"
                title="Close"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 uppercase tracking-wider">
                    {selectedDownload.category}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    selectedDownload.price === 'FREE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  } uppercase tracking-wider`}>
                    {selectedDownload.price}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white uppercase">{selectedDownload.title}</h3>
                {selectedDownload.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed">{selectedDownload.description}</p>
                )}
              </div>

              {/* Action Box */}
              {selectedDownload.actions && selectedDownload.actions.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedDownload.actions.map((act) => {
                    if (act.type === 'copy') {
                      return (
                        <CopyBox 
                          key={act.id}
                          title={act.copyTitle || ''} 
                          desc={act.copyDesc || ''} 
                          text={act.copyText || ''} 
                          buttonText={act.copyBtnText || 'Copy URL'} 
                          iconName={act.copyIcon} 
                        />
                      );
                    } else {
                      return (
                        <div key={act.id} className="space-y-1">
                          <a
                            href={act.fileUrl}
                            download
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer text-center"
                          >
                            <DownloadIcon size={14} /> {act.label || 'Download Asset'}
                          </a>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                /* Legacy fallback */
                selectedDownload.downloadType === 'copy' ? (
                  <CopyBox 
                    title={selectedDownload.copyTitle || ''} 
                    desc={selectedDownload.copyDesc || ''} 
                    text={selectedDownload.copyText || ''} 
                    buttonText={selectedDownload.copyBtnText || 'Copy URL'} 
                    iconName={selectedDownload.copyIcon} 
                  />
                ) : (
                  <div className="space-y-4">
                    {selectedDownload.fileUrl ? (
                      <a
                        href={selectedDownload.fileUrl}
                        download
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer text-center"
                      >
                        <DownloadIcon size={14} /> Download Asset (Files)
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-zinc-800 text-zinc-500 cursor-not-allowed text-center"
                      >
                        <DownloadIcon size={14} /> File Coming Soon
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
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
