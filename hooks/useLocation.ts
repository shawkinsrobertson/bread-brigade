import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../constants/api';

interface LocationData {
  latitude: number;
  longitude: number;
  updated_at: string;
}

export function useLocation(pollMs = 5000) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchLocation() {
    try {
      const res = await fetch(`${API_BASE}/api/location`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLocation(await res.json());
      setError(null);
    } catch (e) {
      setError('Could not reach server');
    }
  }

  useEffect(() => {
    fetchLocation();
    timerRef.current = setInterval(fetchLocation, pollMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pollMs]);

  return { location, error };
}
