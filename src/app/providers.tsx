'use client';

import { useEffect, useState } from 'react';
import AirportLoader from '@/components/ui/airport-loader';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AirportLoader />;
  }

  return <>{children}</>;
}