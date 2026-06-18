'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, ExternalLink, Loader2, FolderCode, GitBranch, X, Play, Tag, ChevronRight
} from 'lucide-react';
import { useProjects, VersionEntry } from '@/hooks/useProjects';

const STATUS_COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  amber:   'text-amber-400 bg-amber-500/10 border-amber-500/25',
  rose:    'text-rose-400 bg-rose-500/10 border-rose-500/25',
  blue:    'text-blue-400 bg-blue-500/10 border-blue-500/25',
  purple:  'text-purple-400 bg-purple-500/10 border-purple-500/25',
  zinc:    'text-zinc-400 bg-zinc-500/10 border-zinc-500/25',
  white:   'text-white bg-white/10 border-white/25',
};

function getYouTubeInfo(url: string): { id: string; thumbnail: string } | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return {
    id: match[1],
    thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
  };
}

// Version history popup
function VersionPopup({ versions, onClose }: { versions: VersionEntry[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const sorted = [...versions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md max-h-[80vh] flex flex-col bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <GitBranch size={15} className="text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Version History</h3>
            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{versions.length} release{versions.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable version list */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {sorted.map((v, idx) => (
            <div key={v.version} className="rounded-xl border border-white/6 bg-white/2 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/3">
                <span className="font-mono text-sm font-bold text-emerald-400">{v.version}</span>
                {idx === 0 && (
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">LATEST</span>
                )}
              </div>
              <ul className="px-4 py-2.5 space-y-1.5">
                {v.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">▸</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [versionPopupOpen, setVersionPopupOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { projects, isLoading, error } = useProjects();
  const project = projects.find((p) => p.id === slug);

  const latestVersion = project?.versions && project.versions.length > 0
    ? [...project.versions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.version
    : null;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      {/* Version popup */}
      {versionPopupOpen && project?.versions && (
        <VersionPopup versions={project.versions} onClose={() => setVersionPopupOpen(false)} />
      )}

      {/* Image lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Project image"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="relative z-10">
        <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-24 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-sm">Loading project...</span>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          {/* Not found */}
          {!isLoading && !error && !project && (
            <div className="flex flex-col items-center gap-4 py-24 text-zinc-500">
              <FolderCode size={48} className="text-zinc-700" />
              <p className="text-lg font-bold text-zinc-400">Project not found</p>
              <Link href="/projects" className="text-sm text-purple-400 hover:underline">← Back to projects</Link>
            </div>
          )}

          {/* DETAIL */}
          {!isLoading && project && (
            <div className="space-y-8">

              {/* Top nav row: back ← | version button → */}
              <div className="flex items-center justify-between">
                {/* Left: back or redirect link */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition-colors group"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Projects
                  </Link>
                  {project.redirectLink && (
                    <>
                      <span className="text-zinc-700">/</span>
                      <a
                        href={project.redirectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                      >
                        <ExternalLink size={13} />
                        Visit Project
                      </a>
                    </>
                  )}
                </div>

                {/* Right: version button */}
                {latestVersion && (
                  <button
                    onClick={() => setVersionPopupOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-bold hover:bg-emerald-500/15 transition-all cursor-pointer"
                  >
                    <GitBranch size={12} />
                    {latestVersion}
                    <ChevronRight size={12} className="text-emerald-500/60" />
                  </button>
                )}
              </div>

              {/* Hero block: title + status + tags */}
              <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-white/15 to-transparent" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    {project.title}
                  </h1>
                  {project.statusText && (
                    <span className={`text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-full border flex-shrink-0 mt-1 ${STATUS_COLOR_MAP[project.statusColor] || STATUS_COLOR_MAP.zinc}`}>
                      {project.statusText}
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 leading-relaxed mb-5">{project.description}</p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Markdown description */}
              {project.detailDescription && (
                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-4">About</h2>
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                    prose-p:text-zinc-300 prose-p:leading-relaxed
                    prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-bold
                    prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px]
                    prose-pre:bg-zinc-950/60 prose-pre:border prose-pre:border-white/8 prose-pre:rounded-xl
                    prose-blockquote:border-l-emerald-500 prose-blockquote:text-zinc-400
                    prose-ul:text-zinc-300 prose-ol:text-zinc-300
                    prose-li:marker:text-emerald-400
                    prose-hr:border-white/10
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {project.detailDescription}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Image list */}
              {project.images && project.images.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Media</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img, idx) => {
                      const ytInfo = getYouTubeInfo(img.url);
                      const displaySrc = ytInfo ? ytInfo.thumbnail : img.url;
                      const isVideo = !!ytInfo;

                      return (
                        <div
                          key={idx}
                          className="relative rounded-2xl overflow-hidden border border-white/8 bg-zinc-950/30 cursor-pointer group"
                          onClick={() => {
                            if (img.redirectLink) {
                              window.open(img.redirectLink, '_blank');
                            } else if (isVideo) {
                              window.open(`https://www.youtube.com/watch?v=${ytInfo!.id}`, '_blank');
                            } else {
                              setLightboxSrc(displaySrc);
                            }
                          }}
                        >
                          <img
                            src={displaySrc}
                            alt={img.alt || `Project image ${idx + 1}`}
                            className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105"
                          />
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <Play size={22} className="text-white ml-1" fill="white" />
                              </div>
                            </div>
                          )}
                          {!isVideo && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                                View full size
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
