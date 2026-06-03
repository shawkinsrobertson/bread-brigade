import React, { useEffect } from 'react';

interface Props {
  latitude: number;
  longitude: number;
}

export default function BreadMap({ latitude, longitude }: Props) {
  const mapId = 'bread-map';

  useEffect(() => {
    if (latitude === 0 && longitude === 0) return;

    let map: any;

    async function init() {
      const L = (await import('leaflet')).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const container = document.getElementById(mapId);
      if (!container) return;

      if ((container as any)._leaflet_id) {
        const existing = (container as any)._map;
        if (existing) {
          existing.setView([latitude, longitude]);
          existing._marker?.setLatLng([latitude, longitude]);
        }
        return;
      }

      map = L.map(mapId, { zoomControl: false }).setView([latitude, longitude], 15);
      (container as any)._map = map;

      // Muted CartoDB Voyager — warm vintage tones, no API key required
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Vintage-style marker: green pin with cream center
      const icon = L.divIcon({
        html: `
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0Z"
                  fill="#115803" stroke="#F4EBD9" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#F4EBD9"/>
            <circle class="dot-blip" cx="16" cy="16" r="4" fill="#B5482E"/>
          </svg>`,
        className: '',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });

      const marker = L.marker([latitude, longitude], { icon })
        .addTo(map)
        .bindPopup('🍞 Bread is on the way!');
      (container as any)._map._marker = marker;
    }

    init();
    return () => { map?.remove(); };
  }, [latitude, longitude]);

  if (latitude === 0 && longitude === 0) return null;

  return (
    <>
      <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
      <div id={mapId} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
