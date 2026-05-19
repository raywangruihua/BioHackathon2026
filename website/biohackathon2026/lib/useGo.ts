'use client';

// lib/useGo.ts
// Hook that exposes a `go(id)` navigation function preserving the original
// prop shape used across screen components. Wraps Next.js useRouter.

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { pathForId, type GoFn, type ScreenId } from './screens';

export default function useGo(): GoFn {
  const router = useRouter();
  return useCallback(
    (id: ScreenId) => {
      router.push(pathForId(id));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [router]
  );
}
