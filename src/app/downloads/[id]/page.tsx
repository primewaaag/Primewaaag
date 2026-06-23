'use client';

import React, { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useDownloads } from '@/hooks/useDownloads';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/utils/firebase';
import { 
  Loader2, 
  ArrowLeft, 
  Download as DownloadIcon, 
  Link as LinkIcon, 
  Copy as CopyIcon, 
  Code as CodeIcon, 
  Terminal as TerminalIcon, 
  ExternalLink as ExternalLinkIcon, 
  Check as CheckIcon 
} from 'lucide-react';

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

function CopyBox({ title, desc, text, buttonText, iconName, disabled, isFirstLocked }: { title: string, desc: string, text: string, buttonText: string, iconName?: string, disabled?: boolean, isFirstLocked?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (disabled) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl space-y-4 relative overflow-hidden">
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

      {/* Copy Action Input Row wrapper */}
      <div className={`flex gap-2 items-center p-1 bg-zinc-950/80 rounded-xl border border-white/5 transition-all ${disabled ? 'pointer-events-none' : ''}`}>
        <input 
          type="text" 
          readOnly 
          value={disabled ? 'https://twitch.tv/primewaaag' : text} 
          disabled={disabled}
          className="bg-transparent text-zinc-300 font-mono text-xs px-3 py-2 flex-grow focus:outline-none select-all truncate" 
        />
        <button 
          onClick={handleCopy}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            disabled
              ? 'bg-white/10 text-white/80 cursor-not-allowed'
              : copied 
                ? 'bg-emerald-600 text-white cursor-pointer' 
                : 'bg-white/10 hover:bg-white/15 text-white cursor-pointer'
          }`}
        >
          {disabled ? 'Copy Example' : copied ? (
            <>
              <CheckIcon size={12} /> Copied!
            </>
          ) : (
            buttonText || 'Copy URL'
          )}
        </button>
      </div>

      {/* Lock Overlay styled like the mockup image - only the badge blurs behind itself */}
      {disabled && (
        <div className="absolute inset-0 bg-[#1a102f]/20 backdrop-blur-[1.5px] border border-purple-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                You're not premium yet
              </span>
              <span className="text-xs text-zinc-300 font-medium mt-0.5">
                Need Tier 2 to copy/download
              </span>
            </div>
          </div>
          <Link href="/premium" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-purple-600/20">
            Unlock
          </Link>
        </div>
      )}
    </div>
  );
}

function DownloadDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { downloads, isLoading } = useDownloads();
  const { user, activeTier, setAuthModalOpen } = useAuth();

  const item = downloads.find((dl) => dl.id === id);

  const isPremium = item ? (item.price === 'PREMIUM' || item.category === 'premium' || item.category === 'early-access') : false;
  const hasAccess = !isPremium || (!!user && activeTier >= 2);

  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const handleFileDownload = async (fileUrl: string, fileName: string, actionId: string) => {
    if (!hasAccess) return;
    setDownloadingFileId(actionId);
    try {
      if (fileUrl.startsWith('downloads/premium/')) {
        const { ref: storageRef, getBlob } = await import('firebase/storage');
        const fileRef = storageRef(storage, fileUrl);
        const blob = await getBlob(fileRef);
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || fileUrl.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        const a = document.createElement('a');
        a.href = `/.netlify/functions/download?url=${encodeURIComponent(fileUrl)}`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file. Please verify your connection/credentials and try again.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-zinc-500 text-sm">Loading asset details...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight uppercase text-zinc-300">Asset Not Found</h2>
          <p className="text-xs text-zinc-500 max-w-sm">The download you are looking for does not exist or has been removed.</p>
        </div>
        <button 
          onClick={() => router.push('/downloads')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Downloads
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
          {/* Back Navigation Row */}
          <div>
            <button 
              onClick={() => router.push('/downloads')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to downloads
            </button>
          </div>

          {/* Main Detail Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left column: Premium Asset Image Card */}
            <div className="md:col-span-5 w-full">
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right column: Info details + Action Buttons */}
            <div className="md:col-span-7 space-y-6">

              {/* Title and Description */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-none">{item.title}</h1>
                <div className="h-1 w-12 bg-purple-600 rounded-full" />
                {item.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed pt-2">{item.description}</p>
                )}
                
                {/* Price Details */}
                <div className="text-sm font-semibold text-zinc-300 pt-2">
                  Price: <span className={item.price === 'FREE' ? 'text-emerald-400' : 'text-amber-400'}>{item.price === 'FREE' ? 'Free' : 'Premium'}</span>
                </div>
              </div>

              {/* Download / Copy Actions Area */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Available Actions</h3>
                
                <div className="space-y-4">
                  {item.actions && item.actions.length > 0 ? (
                    <div className="space-y-4">
                      {item.actions.map((act, index) => {
                        const isFirstLocked = index === 0;
                        if (act.type === 'copy') {
                          return (
                            <CopyBox 
                              key={act.id}
                              title={act.copyTitle || ''} 
                              desc={act.copyDesc || ''} 
                              text={hasAccess ? (act.copyText || '') : '••••••••••••••••••••••••••••••••••••••••••••••••'} 
                              buttonText={act.copyBtnText || 'Copy URL'} 
                              iconName={act.copyIcon} 
                              disabled={!hasAccess}
                              isFirstLocked={isFirstLocked}
                            />
                          );
                        } else {
                          return (
                            <div key={act.id} className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                              {/* Title / Description */}
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                  <DownloadIcon size={18} className="text-purple-400" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white leading-tight">{act.label || 'Download File'}</h4>
                                  <p className="text-xs text-zinc-400 mt-0.5">Click to download this package.</p>
                                </div>
                              </div>

                              {/* Button */}
                              <button
                                onClick={() => handleFileDownload(act.fileUrl || '', act.label || 'Asset', act.id)}
                                disabled={downloadingFileId === act.id || !hasAccess}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all text-center border-none cursor-pointer ${
                                  !hasAccess 
                                    ? 'bg-purple-600/40 text-white/80 pointer-events-none' 
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/20'
                                }`}
                              >
                                {downloadingFileId === act.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <DownloadIcon size={14} />
                                )}
                                <span>{!hasAccess ? 'Download Example' : (act.label || 'Download Asset')}</span>
                              </button>

                              {/* File Lock Overlay covering the whole card */}
                              {!hasAccess && (
                                <div className="absolute inset-0 bg-[#1a102f]/20 backdrop-blur-[1.5px] border border-purple-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 animate-fadeIn">
                                  <div className="flex items-center gap-3.5">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                      </svg>
                                    </div>
                                    <div className="flex flex-col text-left leading-tight">
                                      <span className="text-sm font-black text-white uppercase tracking-wider">
                                        You're not premium yet
                                      </span>
                                      <span className="text-xs text-zinc-300 font-medium mt-0.5">
                                        Need Tier 2 to copy/download
                                      </span>
                                    </div>
                                  </div>
                                  <Link href="/premium" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-purple-600/20">
                                    Unlock
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    /* Legacy Fallback */
                    item.downloadType === 'copy' ? (
                      <CopyBox 
                        title={item.copyTitle || ''} 
                        desc={item.copyDesc || ''} 
                        text={hasAccess ? (item.copyText || '') : '••••••••••••••••••••••••••••••••••••••••••••••••'} 
                        buttonText={item.copyBtnText || 'Copy URL'} 
                        iconName={item.copyIcon} 
                        disabled={!hasAccess}
                        isFirstLocked={true}
                      />
                    ) : (
                      <div className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                        {/* Title / Description */}
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <DownloadIcon size={18} className="text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">{item.title || 'Download File'}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">Click to download this package.</p>
                          </div>
                        </div>

                        {/* Button Content */}
                        {item.fileUrl ? (
                          <button
                            onClick={() => handleFileDownload(item.fileUrl || '', item.title, 'legacy')}
                            disabled={downloadingFileId === 'legacy' || !hasAccess}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all text-center border-none cursor-pointer ${
                              !hasAccess 
                                ? 'bg-purple-600/40 text-white/80 pointer-events-none' 
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/20'
                            }`}
                          >
                            {downloadingFileId === 'legacy' ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <DownloadIcon size={14} />
                            )}
                            <span>{!hasAccess ? 'Download Example' : 'Download Asset (Files)'}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold bg-zinc-800 text-zinc-500 cursor-not-allowed text-center"
                          >
                            <DownloadIcon size={14} /> File Coming Soon
                          </button>
                        )}

                        {/* File lock overlay covering the whole card */}
                        {!hasAccess && (
                          <div className="absolute inset-0 bg-[#1a102f]/20 backdrop-blur-[1.5px] border border-purple-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 animate-fadeIn">
                            <div className="flex items-center gap-3.5">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                              </div>
                              <div className="flex flex-col text-left leading-tight">
                                <span className="text-sm font-black text-white uppercase tracking-wider">
                                  You're not premium yet
                                </span>
                                <span className="text-xs text-zinc-300 font-medium mt-0.5">
                                  Need Tier 2 to copy/download
                                </span>
                              </div>
                            </div>
                            <Link href="/premium" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-purple-600/20">
                              Unlock
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}

export default function DownloadDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    }>
      <DownloadDetailContent />
    </Suspense>
  );
}
