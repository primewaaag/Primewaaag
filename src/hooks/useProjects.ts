'use client';

import { useState, useEffect, useCallback } from 'react';

export interface VersionEntry {
  version: string;   // e.g. "v1.2.0"
  changes: string[]; // list of what was added/fixed
  order: number;     // display order (lower = shown first/top)
}

export interface QuickViewButton {
  icon: string;   // e.g. "github" | "star" | "external-link" | "globe" | "code" | "download" | "play"
  label: string;
  link: string;
}

export interface ProjectImage {
  url: string;           // image URL or YouTube URL
  redirectLink?: string; // optional click-through link
  alt?: string;
}

export interface ProjectItem {
  id: string;              // slug, e.g. "obs-overlay-pipeline"
  title: string;
  description: string;     // short blurb shown on card
  detailDescription: string; // markdown content for detail page
  tags: string[];          // e.g. ["Open Source", "Streaming"]

  // Quick View
  statusText: string;      // user-typed status label, e.g. "Live", "WIP", "v2.3"
  statusColor: string;     // e.g. "emerald" | "cyan" | "amber" | "rose" | "blue" | "purple" | "zinc"
  quickViewButton?: QuickViewButton | null;
  quickViewImage?: {
    url: string;
    redirectLink?: string;
  } | null;

  // Detail View
  images: ProjectImage[];
  redirectLink?: string | null; // top-left external link on detail page
  versions: VersionEntry[];

  featured: boolean;
  createdAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/get-projects');
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.error || `Failed to load projects: ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refresh: fetchProjects
  };
}

export default useProjects;
