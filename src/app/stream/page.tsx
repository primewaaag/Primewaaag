'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StreamRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stream/profile');
  }, [router]);

  return null;
}
