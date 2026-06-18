'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CustomVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  order: number;
}

export function useVideos() {
  const [videos, setVideos] = useState<CustomVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/get-videos');
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.error || `Failed to load videos: ${response.statusText}`);
      }
      const data = await response.json();
      setVideos(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch videos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    refresh: fetchVideos
  };
}

export default useVideos;
