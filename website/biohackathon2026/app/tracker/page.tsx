'use client';

import Tracker from '@/components/screens/Tracker';
import useGo from '@/lib/useGo';

export default function Page() {
  const go = useGo();
  return <Tracker go={go} />;
}
