'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from '@/utils/downloads';

export function useDownloads() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/get-downloads');
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.error || `Failed to load downloads: ${response.statusText}`);
      }
      const data = await response.json();
      setDownloads(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch downloads.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const featuredDownloads = downloads.filter(
    (dl) => dl.featured === true
  );

  return {
    downloads,
    featuredDownloads,
    isLoading,
    error,
    refresh: fetchDownloads
  };
}

export default useDownloads;
