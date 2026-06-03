import { useState, useEffect } from 'react';
import { supabase, type LocationRow } from '../lib/supabase';

export function useLocation() {
  const [location, setLocation] = useState<LocationRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('location')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError('Could not reach server');
        else setLocation(data);
      });

    const channel = supabase
      .channel('location-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'location' },
        (payload) => setLocation(payload.new as LocationRow))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { location, error };
}
