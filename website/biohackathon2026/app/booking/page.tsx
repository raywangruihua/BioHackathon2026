'use client';

import Booking from '@/components/screens/Booking';
import useGo from '@/lib/useGo';

export default function Page() {
  const go = useGo();
  return <Booking go={go} />;
}
