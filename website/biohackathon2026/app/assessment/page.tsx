'use client';

import Assessment from '@/components/screens/Assessment';
import useGo from '@/lib/useGo';

export default function Page() {
  const go = useGo();
  return <Assessment go={go} />;
}
