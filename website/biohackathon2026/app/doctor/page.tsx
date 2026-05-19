'use client';

import Doctor from '@/components/screens/Doctor';
import useGo from '@/lib/useGo';

export default function Page() {
  const go = useGo();
  return <Doctor go={go} />;
}
