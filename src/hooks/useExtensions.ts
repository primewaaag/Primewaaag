'use client';

import { useState, useEffect, useCallback } from 'react';
import { Extension } from '@/utils/extensions';

export function useExtensions() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExtensions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/get-extensions');
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.error || `Failed to load extensions: ${response.statusText}`);
      }
      const data = await response.json();
      setExtensions(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch extensions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  const featuredExtensions = extensions.filter(
    (ext) => ext.featured === true || ext.feature === true
  );

  return {
    extensions,
    featuredExtensions,
    isLoading,
    error,
    refresh: fetchExtensions
  };
}
export default useExtensions;
