import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiExternalLink, FiNavigation, FiCopy, FiCheck, FiClock, FiPhone, FiCompass } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

/**
 * BranchLocationMap — Dedicated interactive Leaflet location map for each branch
 * Displays verified coordinates, OpenStreetMap tiles, custom NIS AI School pin,
 * directions buttons (Google Maps, Yandex, OSM), and copyable full address.
 */
export default function BranchLocationMap({ branch }) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Parse and validate coordinates
  const { lat, lng, isValid } = useMemo(() => {
    let rawLat = branch?.latitude;
    let rawLng = branch?.longitude;

    // Also support string mapCoordinates "lat, lng"
    if ((!rawLat || !rawLng) && branch?.mapCoordinates) {
      const parts = String(branch.mapCoordinates).split(',').map((s) => s.trim());
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        rawLat = parseFloat(parts[0]);
        rawLng = parseFloat(parts[1]);
      }
    }

    const nLat = parseFloat(rawLat);
    const nLng = parseFloat(rawLng);

    const valid = !isNaN(nLat) && !isNaN(nLng) && Math.abs(nLat) > 0.01 && Math.abs(nLng) > 0.01;
    return {
      lat: valid ? nLat : 41.3385, // Tashkent default if unconfirmed
      lng: valid ? nLng : 69.3345,
      isValid: valid,
    };
  }, [branch]);

  const fullAddress = branch?.address || branch?.location || "Toshkent sh., Mirzo Ulug'bek tumani, Universitet ko'chasi 7-uy";

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup existing instance if already created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: isValid ? 15 : 12,
      scrollWheelZoom: false, // Prevent page scroll interception
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom NIS AI School Blue Marker Pin
    const customIcon = L.divIcon({
      className: 'nis-map-custom-marker',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 38],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    // Popup content with branch identity & direction links
    const popupContent = `
      <div style="font-family: inherit; padding: 4px; min-width: 200px;">
        <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${branch?.name || 'NIS AI School'}</h4>
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569; line-height: 1.4;">${fullAddress}</p>
        ${branch?.workingHours ? `<p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">🕒 ${branch.workingHours}</p>` : ''}
        <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 11px; font-weight: 600; color: #2563eb; text-decoration: none;">
            Google Maps'da ochish &rarr;
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Invalidate size on load to ensure proper tile rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, isValid, branch, fullAddress]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      toast.success(t('branches.addressCopied', 'Manzil nusxalandi!'));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Nusxalash imkoni bo‘lmadi.');
    }
  };

  // External Map URLs
  const googleMapsUrl = branch?.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const googleCoordsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const yandexMapsUrl = `https://yandex.com/maps/?pt=${lng},${lat}&z=16&l=map`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="card p-6 sm:p-8 bg-white border border-slate-200 shadow-elevation-1 rounded-3xl mt-8">
      {/* Location Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <FiCompass size={13} className="text-blue-600" />
            <span>{t('branches.mapBadge', 'Aniq Geolokatsiya & Marshrut')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            {t('branches.mapTitle', 'Manzil va Interaktiv Xarita')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('branches.mapSubtitle', 'Kampusimizning rasmiy joylashuvi va unga borish yo\'nalishlari')}
          </p>
        </div>

        {/* Verification Status Badge */}
        <div>
          {isValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('branches.locationVerified', 'Tasdiqlangan manzil')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {t('branches.locationPending', 'Koordinatalar tasdiqlanishda')}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

        {/* Map Float Quick Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <a
            href={googleCoordsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-blue-600 hover:bg-white text-xs font-bold shadow-md border border-slate-200/80 transition-all cursor-pointer"
            title="Google Maps marshruti"
          >
            <FiNavigation size={13} className="text-blue-600" />
            <span className="hidden xs:inline">{t('branches.getDirections', 'Yo\'nalish olish')}</span>
          </a>
        </div>
      </div>

      {/* Address & Navigation Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 pt-5 border-t border-slate-100">
        {/* Left: Verified Address Card */}
        <div className="md:col-span-7 flex flex-col justify-between p-4.5 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('branches.officialAddress', 'Rasmiy Manzil')}
              </span>
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {copied ? <FiCheck size={13} className="text-emerald-600" /> : <FiCopy size={13} />}
                <span>{copied ? t('common.copied', 'Nusxalandi') : t('common.copy', 'Nusxa olish')}</span>
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed flex items-start gap-2">
              <FiMapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <span>{fullAddress}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
            {branch?.workingHours && (
              <span className="inline-flex items-center gap-1.5">
                <FiClock size={13} className="text-slate-400" />
                <span>{branch.workingHours}</span>
              </span>
            )}
            {branch?.phone && (
              <span className="inline-flex items-center gap-1.5">
                <FiPhone size={13} className="text-slate-400" />
                <a href={`tel:${branch.phone}`} className="hover:text-blue-600 font-medium">
                  {branch.phone}
                </a>
              </span>
            )}
            {isValid && (
              <span className="font-mono text-[11px] text-slate-400">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </span>
            )}
          </div>
        </div>

        {/* Right: External Navigation Hub Links */}
        <div className="md:col-span-5 flex flex-col justify-between p-4.5 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {t('branches.openInApps', 'Xaritalarda Ochish')}
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'branches.openInAppsDesc',
                'O\'zingizga qulay xarita ilovasida oching va avtomobil yoki jamoat transportida yo\'nalish chizing.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <FiNavigation size={13} />
              <span>Google Maps</span>
              <FiExternalLink size={12} className="opacity-80" />
            </a>

            <a
              href={yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all shadow-xs"
            >
              <span>Yandex Xarita</span>
              <FiExternalLink size={12} className="opacity-70" />
            </a>

            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all shadow-xs"
            >
              <span>OpenStreetMap</span>
              <FiExternalLink size={12} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
