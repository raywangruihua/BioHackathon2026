'use client';

import Results from '@/components/screens/Results';
import useGo from '@/lib/useGo';

export default function Page() {
  const go = useGo();
  return <Results go={go} />;
}
