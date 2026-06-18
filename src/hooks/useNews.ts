'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'RELEASE' | 'NEW VIDEO' | 'ANNOUNCEMENT';
  date: string;
  mediaUrl: string | null;
  readMoreUrl: string | null;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/get-news');
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.error || `Failed to load news: ${response.statusText}`);
      }
      const data = await response.json();
      setNews(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch news.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    refresh: fetchNews
  };
}

export default useNews;
