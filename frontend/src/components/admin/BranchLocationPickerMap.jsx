import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

/**
 * BranchLocationPickerMap:
 * Interactive Leaflet map in the admin panel allowing administrators to:
 * 1. View the branch marker on real OpenStreetMap tiles.
 * 2. Click anywhere on the map or drag the marker to pick coordinates.
 * 3. Quick-jump to Tashkent, Samarkand, or Bukhara.
 */
export default function BranchLocationPickerMap({ latitude, longitude, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const lat = parseFloat(latitude) || 41.3385;
  const lng = parseFloat(longitude) || 69.3345;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom Blue Admin Marker Icon
    const customIcon = L.divIcon({
      className: 'admin-map-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 30px; height: 30px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <div style="transform: rotate(45deg); width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 33],
    });

    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // When marker is dragged
    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      if (onChange) {
        onChange({
          latitude: parseFloat(position.lat.toFixed(6)),
          longitude: parseFloat(position.lng.toFixed(6)),
        });
      }
    });

    // When map is clicked
    map.on('click', (e) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      marker.setLatLng([newLat, newLng]);
      if (onChange) {
        onChange({
          latitude: parseFloat(newLat.toFixed(6)),
          longitude: parseFloat(newLng.toFixed(6)),
        });
      }
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when props change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  const jumpToCity = (cityLat, cityLng) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([cityLat, cityLng], 14);
      markerRef.current.setLatLng([cityLat, cityLng]);
      if (onChange) {
        onChange({ latitude: cityLat, longitude: cityLng });
      }
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-700 flex items-center gap-1.5">
          <FiMapPin size={13} className="text-blue-600" />
          <span>Interaktiv Nuqta Tanlash (Xaritada bosing yoki nishonni suring):</span>
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => jumpToCity(41.3385, 69.3345)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-semibold text-slate-600 border border-slate-200"
          >
            Toshkent
          </button>
          <button
            type="button"
            onClick={() => jumpToCity(39.6542, 66.9597)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-semibold text-slate-600 border border-slate-200"
          >
            Samarqand
          </button>
          <button
            type="button"
            onClick={() => jumpToCity(39.7747, 64.4286)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-semibold text-slate-600 border border-slate-200"
          >
            Buxoro
          </button>
        </div>
      </div>

      <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
      </div>

      <p className="text-[11px] text-slate-400">
        Xaritadagi joylashuv: <strong className="text-slate-600 font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</strong>.
      </p>
    </div>
  );
}
