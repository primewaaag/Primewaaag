'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  FolderCode, Loader2, Code2, Star, ExternalLink, Globe, Code, Download, Play, ArrowUpRight
} from 'lucide-react';
import { useProjects, ProjectItem } from '@/hooks/useProjects';

// Status color map: maps statusColor -> tailwind classes
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

// Icon map for the quick view button
const BUTTON_ICONS: Record<string, React.ReactNode> = {
  github:          <Code2 size={13} />,
  star:          <Star size={13} />,
  'external-link': <ExternalLink size={13} />,
  globe:         <Globe size={13} />,
  code:          <Code size={13} />,
  download:      <Download size={13} />,
  play:          <Play size={13} />,
};

// Extract YouTube video ID from a URL
function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function ProjectCard({ proj }: { proj: ProjectItem }) {
  const statusClass = STATUS_COLOR_MAP[proj.statusColor] || STATUS_COLOR_MAP.zinc;

  // Resolve quick view image
  let imgSrc: string | null = null;
  if (proj.quickViewImage?.url) {
    const ytThumb = getYouTubeThumbnail(proj.quickViewImage.url);
    imgSrc = ytThumb || proj.quickViewImage.url;
  }

  return (
    <div className="group relative rounded-3xl glass-panel glass-panel-hover flex flex-col shadow-lg overflow-hidden">
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-white/15 to-transparent" />

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Top row: title + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            href={`/projects/${proj.id}`}
            className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight flex items-center gap-2 flex-1 min-w-0"
          >
            <span className="truncate">{proj.title}</span>
            <ArrowUpRight size={15} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </Link>
          {proj.statusText && (
            <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border flex-shrink-0 ${statusClass}`}>
              {proj.statusText}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3 flex-1">{proj.description}</p>

        {/* Tags */}
        {proj.tags && proj.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {proj.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400"
              >
                {tag}
              </span>
            ))}
            {proj.tags.length > 5 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/3 border border-white/8 text-zinc-600">
                +{proj.tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Optional button at bottom right */}
        {proj.quickViewButton && (
          <div className="flex justify-end">
            <a
              href={proj.quickViewButton.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/6 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {BUTTON_ICONS[proj.quickViewButton.icon] || <ExternalLink size={13} />}
              {proj.quickViewButton.label}
            </a>
          </div>
        )}
      </div>

      {/* Optional image at bottom */}
      {imgSrc && (
        <div className="mt-auto border-t border-white/5">
          {proj.quickViewImage?.redirectLink ? (
            <a
              href={proj.quickViewImage.redirectLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block relative overflow-hidden"
            >
              <img
                src={imgSrc}
                alt={proj.title}
                className="w-full h-40 object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
              {getYouTubeThumbnail(proj.quickViewImage.url) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
            </a>
          ) : (
            <div className="relative overflow-hidden">
              <img
                src={imgSrc}
                alt={proj.title}
                className="w-full h-40 object-cover opacity-70"
              />
              {getYouTubeThumbnail(proj.quickViewImage!.url) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects();

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <FolderCode className="text-emerald-400" size={28} />
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">PROJECT DIRECTORY</h1>
            </div>
            <p className="text-zinc-400 mt-2 text-sm max-w-xl">
              Browse all projects — click any card for the full detail view.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-20 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-sm">Loading projects...</span>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && projects.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-zinc-500">
              <FolderCode size={40} className="text-zinc-700" />
              <p className="text-sm">No projects published yet.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <ProjectCard key={proj.id} proj={proj} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}