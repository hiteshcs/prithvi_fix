import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, ShieldAlert, Zap, Navigation, Radio, ZoomIn, ZoomOut,
  User, Phone, CheckCircle2, AlertTriangle, RefreshCw,
  Search, Filter, Crosshair, Sparkles, ExternalLink, Globe, Layers
} from 'lucide-react';

// Trade Configurations with Colors and Symbols
const TRADE_CONFIG = {
  Electrical: { color: '#f59e0b', bg: 'bg-amber-500', symbol: '⚡', label: 'Electrical' },
  Plumbing: { color: '#0ea5e9', bg: 'bg-sky-500', symbol: '🔧', label: 'Plumbing' },
  Carpentry: { color: '#d97706', bg: 'bg-amber-600', symbol: '🪚', label: 'Carpentry' },
  Appliance: { color: '#6366f1', bg: 'bg-indigo-500', symbol: '❄️', label: 'Appliance & AC' },
  Painting: { color: '#ec4899', bg: 'bg-pink-500', symbol: '🎨', label: 'Painting' },
  Masonry: { color: '#8b5cf6', bg: 'bg-purple-500', symbol: '🧱', label: 'Masonry' },
  Cleaning: { color: '#10b981', bg: 'bg-emerald-500', symbol: '🧹', label: 'Deep Cleaning' },
  Gardening: { color: '#84cc16', bg: 'bg-lime-500', symbol: '🌿', label: 'Gardening' },
  Driver: { color: '#64748b', bg: 'bg-slate-500', symbol: '🚗', label: 'Driver' },
  Nursing: { color: '#ef4444', bg: 'bg-rose-500', symbol: '🩺', label: 'Nursing & Care' },
};

function getTradeInfo(tradeName = '') {
  const t = (tradeName || '').toLowerCase();
  if (t.includes('electr')) return TRADE_CONFIG.Electrical;
  if (t.includes('plumb')) return TRADE_CONFIG.Plumbing;
  if (t.includes('carpen') || t.includes('wood')) return TRADE_CONFIG.Carpentry;
  if (t.includes('ac') || t.includes('hvac') || t.includes('appliance') || t.includes('refriger')) return TRADE_CONFIG.Appliance;
  if (t.includes('paint') || t.includes('putty')) return TRADE_CONFIG.Painting;
  if (t.includes('clean') || t.includes('pest') || t.includes('descal')) return TRADE_CONFIG.Cleaning;
  if (t.includes('garden') || t.includes('horticult')) return TRADE_CONFIG.Gardening;
  if (t.includes('chauf') || t.includes('driver')) return TRADE_CONFIG.Driver;
  if (t.includes('nurs') || t.includes('care')) return TRADE_CONFIG.Nursing;
  return { color: '#3b82f6', bg: 'bg-blue-500', symbol: '🛠️', label: 'General Trade' };
}

// Territorial dispatch clusters by district
const SOCIETY_TERRITORY_CLUSTERS = {
  Khordha: [
    { id: 'patia', name: 'Patia IT & Residential Corridor', lat: 20.3540, lng: 85.8170, radius: 1400, demandIndex: 94, topTrade: 'Electrical & AC Servicing', activeArtisans: 6, color: '#f59e0b' },
    { id: 'jaydev', name: 'Jaydev Vihar & Nayapalli Urban Hub', lat: 20.2961, lng: 85.8245, radius: 1200, demandIndex: 88, topTrade: 'Plumbing & Concealed Piping', activeArtisans: 5, color: '#0ea5e9' },
    { id: 'saheed', name: 'Saheed Nagar & Master Canteen Hub', lat: 20.2870, lng: 85.8450, radius: 1100, demandIndex: 76, topTrade: 'Carpentry & Maintenance', activeArtisans: 5, color: '#d97706' },
    { id: 'rasulgarh', name: 'Rasulgarh Industrial & Trade Cluster', lat: 20.2905, lng: 85.8650, radius: 1300, demandIndex: 82, topTrade: 'Fabrication & Kitchen Appliance', activeArtisans: 4, color: '#8b5cf6' },
    { id: 'khandagiri', name: 'Khandagiri & Old Town Heritage Sector', lat: 20.2580, lng: 85.7890, radius: 1500, demandIndex: 68, topTrade: 'Masonry & Waterproofing', activeArtisans: 5, color: '#10b981' },
  ],
  Cuttack: [
    { id: 'cda', name: 'CDA Sector Hub', lat: 20.4725, lng: 85.8450, radius: 1400, demandIndex: 85, topTrade: 'Electrical & Drainage', activeArtisans: 4, color: '#0ea5e9' },
    { id: 'badambadi', name: 'Badambadi Commercial Corridor', lat: 20.4550, lng: 85.8750, radius: 1200, demandIndex: 78, topTrade: 'Plumbing & Maintenance', activeArtisans: 4, color: '#f59e0b' },
  ],
  Puri: [
    { id: 'grandroad', name: 'Grand Road & Temple Corridor', lat: 19.8135, lng: 85.8312, radius: 1300, demandIndex: 82, topTrade: 'Pilgrim Hospitality & Maintenance', activeArtisans: 4, color: '#f59e0b' },
    { id: 'seabeach', name: 'Chakratirtha Beach Hub', lat: 19.8050, lng: 85.8450, radius: 1100, demandIndex: 65, topTrade: 'Electrical & Cleaning', activeArtisans: 3, color: '#0ea5e9' },
  ],
};

export default function SocietyLiveMap({
  userDistrict = 'Khordha',
  societyName = 'Shramik Kalyan Labour Cooperative Samiti',
  workers = [],
  activeBookings = [],
  sosAlerts = [],
  onDispatchArtisan = null,
  onRebalance = null,
  rebalanceActive = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const clustersLayerRef = useRef(null);
  const emergencyLayerRef = useRef(null);

  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [artisanFilter, setArtisanFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'BUSY' | 'SOS'
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClusters, setShowClusters] = useState(true);
  const [showEmergencyZones, setShowEmergencyZones] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  // Normalize District
  const districtKey = useMemo(() => {
    const d = (userDistrict || '').toUpperCase();
    if (d.includes('CUTTACK')) return 'Cuttack';
    if (d.includes('PURI')) return 'Puri';
    return 'Khordha';
  }, [userDistrict]);

  // Territorial Dispatch Clusters strictly for this society's district
  const clusters = useMemo(() => {
    return SOCIETY_TERRITORY_CLUSTERS[districtKey] || SOCIETY_TERRITORY_CLUSTERS.Khordha;
  }, [districtKey]);

  // Filter Workers strictly to this society / district
  const societyWorkers = useMemo(() => {
    return (workers || []).filter((w) => {
      if (!w) return false;
      const workerDist = (w.district || w.city || '').toLowerCase();
      const targetDist = districtKey.toLowerCase();
      return workerDist.includes(targetDist) || (targetDist === 'khordha' && workerDist.includes('bhubaneswar'));
    });
  }, [workers, districtKey]);

  // Worksite Emergencies strictly for this society
  const societyEmergencies = useMemo(() => {
    const list = [];
    (sosAlerts || []).forEach((a) => {
      if (a.status === 'ACTIVE') {
        list.push({
          id: `alert-${a.id}`,
          title: a.description || 'Emergency SOS Raised by Artisan',
          workerName: a.worker_name || 'Artisan in Distress',
          workerCode: a.worker_code || 'WRK-SOS',
          phone: a.worker_phone || 'Emergency Line',
          lat: Number(a.latitude) || 20.2961,
          lng: Number(a.longitude) || 85.8245,
          location: a.location_address || `${userDistrict} Territory`,
          severity: 'CRITICAL',
        });
      }
    });

    societyWorkers.forEach((w) => {
      if (w.sos_active && !list.some((item) => item.workerCode === w.worker_code)) {
        list.push({
          id: `wrk-${w.id}`,
          title: 'Artisan Distress Signal: High Voltage / Worksite Hazard',
          workerName: w.name,
          workerCode: w.worker_code,
          phone: w.phone,
          lat: Number(w.latitude) || 20.3095,
          lng: Number(w.longitude) || 85.8530,
          location: `${w.city || userDistrict} Worksite`,
          severity: 'HIGH_PRIORITY',
        });
      }
    });

    if (list.length === 0 && districtKey === 'Khordha') {
      list.push({
        id: 'khd-sos-demo',
        title: 'Worksite Electrical Surge & Tripping Risk',
        workerName: 'Ramesh Kumar (Master Electrician)',
        workerCode: 'WKR-OD-1007',
        phone: '9876543307',
        lat: 20.3095,
        lng: 85.8530,
        location: 'Plot 12, VSS Nagar, Bhubaneswar',
        severity: 'ACTIVE_HAZARD',
      });
    }

    return list;
  }, [sosAlerts, societyWorkers, districtKey, userDistrict]);

  // Filtered workers
  const visibleWorkers = useMemo(() => {
    return societyWorkers.filter((w) => {
      const isSos = w.sos_active || societyEmergencies.some((e) => e.workerCode === w.worker_code);
      const isAvailable = !isSos && w.availability === 'AVAILABLE';
      const isBusy = !isSos && w.availability === 'BUSY';

      if (artisanFilter === 'AVAILABLE' && !isAvailable) return false;
      if (artisanFilter === 'BUSY' && !isBusy) return false;
      if (artisanFilter === 'SOS' && !isSos) return false;

      if (tradeFilter !== 'ALL') {
        const trade = (w.primary_trade || w.primaryTrade || w.name || '').toLowerCase();
        if (!trade.includes(tradeFilter.toLowerCase())) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (w.name || '').toLowerCase().includes(q);
        const matchesCode = (w.worker_code || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }

      return true;
    });
  }, [societyWorkers, artisanFilter, tradeFilter, searchQuery, societyEmergencies]);

  // 1. Initialize Map Instance with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = clusters[0] ? [clusters[0].lat, clusters[0].lng] : [20.2961, 85.8245];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Google Maps Streets / Roadmap TileLayer
      tileLayerRef.current = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Dedicated layer groups for seamless updates
      clustersLayerRef.current = L.layerGroup().addTo(map);
      emergencyLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Switch Google Maps Tiles: Roadmap vs Photorealistic Satellite (Hybrid with Labels)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      // Official Google Maps Hybrid Satellite (Aerial photos + Street Labels & Highway Shields)
      tileLayerRef.current = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
    } else {
      // Official Google Maps Streets / Roadmap
      tileLayerRef.current = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
    }
  }, [mapType]);

  // 3. Render Territorial Dispatch Clusters on Google Map
  useEffect(() => {
    if (!clustersLayerRef.current) return;
    clustersLayerRef.current.clearLayers();

    if (!showClusters) return;

    clusters.forEach((c) => {
      // Shaded Circle Coverage Zone
      const circle = L.circle([c.lat, c.lng], {
        radius: c.radius,
        color: c.color,
        fillColor: c.color,
        fillOpacity: 0.16,
        weight: 2,
        dashArray: '5, 8',
      });

      circle.on('click', () => {
        setSelectedCluster(c);
        setSelectedArtisan(null);
        setSelectedEmergency(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([c.lat, c.lng], 14, { duration: 0.8 });
        }
      });

      // Center Badge Marker
      const badgeIcon = L.divIcon({
        className: 'gmaps-cluster-badge',
        html: `
          <div class="px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-white border border-slate-700 shadow-xl text-[10px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 transition">
            <span class="w-2 h-2 rounded-full" style="background-color: ${c.color}"></span>
            <span>${c.name.split(' ')[0]} Hub</span>
            <span class="text-amber-300 font-mono font-extrabold">${c.demandIndex}%</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const badgeMarker = L.marker([c.lat, c.lng], { icon: badgeIcon });
      badgeMarker.on('click', () => {
        setSelectedCluster(c);
        setSelectedArtisan(null);
        setSelectedEmergency(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([c.lat, c.lng], 14, { duration: 0.8 });
        }
      });

      clustersLayerRef.current.addLayer(circle);
      clustersLayerRef.current.addLayer(badgeMarker);
    });
  }, [clusters, showClusters]);

  // 4. Render Worksite Emergency SOS Danger Zones on Google Map
  useEffect(() => {
    if (!emergencyLayerRef.current) return;
    emergencyLayerRef.current.clearLayers();

    if (!showEmergencyZones) return;

    societyEmergencies.forEach((em) => {
      // Crimson Pulsing Zone Circle
      const emergencyCircle = L.circle([em.lat, em.lng], {
        radius: 950,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.22,
        weight: 2.5,
        dashArray: '6, 6',
      });

      // Pulsing Emergency Pin Icon
      const emergencyIcon = L.divIcon({
        className: 'gmaps-emergency-sos-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-2xl border-2 border-white ring-2 ring-red-500 hover:scale-110 transition">
              ⚠️
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-red-950 text-red-200 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-md whitespace-nowrap border border-red-800">
              SOS ZONE
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const emergencyMarker = L.marker([em.lat, em.lng], { icon: emergencyIcon });
      emergencyMarker.on('click', () => {
        setSelectedEmergency(em);
        setSelectedArtisan(null);
        setSelectedCluster(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([em.lat, em.lng], 15, { duration: 0.8 });
        }
      });

      emergencyLayerRef.current.addLayer(emergencyCircle);
      emergencyLayerRef.current.addLayer(emergencyMarker);
    });
  }, [societyEmergencies, showEmergencyZones]);

  // 5. Render Active Artisans with Exact Coordinates, Trade Symbols & Status Halos
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    visibleWorkers.forEach((w) => {
      const lat = Number(w.latitude) || (clusters[0]?.lat || 20.2961);
      const lng = Number(w.longitude) || (clusters[0]?.lng || 85.8245);
      const isSos = w.sos_active || societyEmergencies.some((e) => e.workerCode === w.worker_code);
      const isBusy = !isSos && w.availability === 'BUSY';
      const isAvailable = !isSos && !isBusy;

      const trade = getTradeInfo(w.primary_trade || w.primaryTrade || w.name);

      const statusRingClass = isSos
        ? 'ring-4 ring-red-500 animate-pulse bg-red-600'
        : isBusy
        ? 'ring-2 ring-amber-400 bg-amber-500'
        : 'ring-2 ring-emerald-400 bg-emerald-600';

      const statusBadge = isSos
        ? '<span class="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>'
        : isBusy
        ? '<span class="w-2 h-2 rounded-full bg-amber-300 ring-1 ring-amber-600"></span>'
        : '<span class="w-2 h-2 rounded-full bg-emerald-300 ring-1 ring-emerald-600"></span>';

      const customIcon = L.divIcon({
        className: 'gmaps-artisan-pin',
        html: `
          <div class="relative group cursor-pointer transition hover:scale-110">
            <div class="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white ${statusRingClass}">
              <span>${trade.symbol}</span>
            </div>
            <div class="absolute -top-1 -right-1 flex items-center justify-center">
              ${statusBadge}
            </div>
            <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-950/95 text-white text-[10px] font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 z-50">
              ${w.name.split(' ')[0]} (${w.worker_code}) • ${trade.label}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedArtisan(w);
        setSelectedCluster(null);
        setSelectedEmergency(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
        }
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [visibleWorkers, societyEmergencies, clusters]);

  // Fit Bounds to Society Territory
  const handleFitSocietyBounds = () => {
    if (!mapInstanceRef.current) return;
    const points = [];
    clusters.forEach((c) => points.push([c.lat, c.lng]));
    visibleWorkers.forEach((w) => {
      if (w.latitude && w.longitude) points.push([Number(w.latitude), Number(w.longitude)]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Google Maps External Link
  const currentCenter = clusters[0] ? `${clusters[0].lat},${clusters[0].lng}` : '20.2961,85.8245';
  const googleMapsExternalUrl = `https://www.google.com/maps/@${currentCenter},14z`;

  return (
    <div className="bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-4">
      {/* ── Top Header & Telemetry Summary ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-amber-400 text-white dark:text-slate-950 flex items-center justify-center font-bold">
              <MapPin size={18} />
            </span>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span>Google Maps {userDistrict} Live Telemetry &amp; Dispatch Console</span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {societyName.split(' ')[0]} Society
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Real-time Google Maps satellite &amp; street tracking of <strong>{visibleWorkers.length} active artisans</strong>, <strong>{clusters.length} dispatch clusters</strong>, and <strong>{societyEmergencies.length} emergency SOS zones</strong> in {userDistrict} District.
              </p>
            </div>
          </div>
        </div>

        {/* Live Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setArtisanFilter(artisanFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              artisanFilter === 'AVAILABLE'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Available ({societyWorkers.filter((w) => w.availability === 'AVAILABLE' && !w.sos_active).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setArtisanFilter(artisanFilter === 'BUSY' ? 'ALL' : 'BUSY')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              artisanFilter === 'BUSY'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>On Job ({societyWorkers.filter((w) => w.availability === 'BUSY' && !w.sos_active).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setArtisanFilter(artisanFilter === 'SOS' ? 'ALL' : 'SOS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              artisanFilter === 'SOS'
                ? 'bg-red-500 text-white border-red-500 shadow-xs'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>SOS Alerts ({societyEmergencies.length})</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar & Map Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artisan or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none w-44 font-mono text-[11px]"
            />
          </div>

          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium text-[11px]"
          >
            <option value="ALL">All Trades</option>
            <option value="Electrical">⚡ Electrical</option>
            <option value="Plumbing">🔧 Plumbing</option>
            <option value="Carpentry">🪚 Carpentry</option>
            <option value="Appliance">❄️ Appliance &amp; AC</option>
            <option value="Painting">🎨 Painting</option>
            <option value="Cleaning">🧹 Deep Cleaning</option>
          </select>

          {/* Layer Toggles */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
              className="rounded text-amber-500"
            />
            <span>Demand Clusters</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={showEmergencyZones}
              onChange={(e) => setShowEmergencyZones(e.target.checked)}
              className="rounded text-red-500"
            />
            <span>Emergency Zones</span>
          </label>
        </div>

        {/* Google Roadmap vs Google Satellite Switcher & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex p-0.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-blue-950 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              Street (Roadmap)
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-blue-950 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              Satellite (Photorealistic)
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 text-gray-700 dark:text-slate-300 transition"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 text-gray-700 dark:text-slate-300 transition"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleFitSocietyBounds}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            title="Reset and fit Google Map to all society artisans and clusters"
          >
            <Crosshair size={12} />
            <span>Fit Bounds</span>
          </button>
        </div>
      </div>

      {/* ── GOOGLE MAPS INTERACTIVE CANVAS CONTAINER ── */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-300 dark:border-slate-700 shadow-inner h-[480px] bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top-Right Floating Live Telemetry Badge & Fullscreen Link */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-white flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-300 font-bold">
              Google Maps Sync: {visibleWorkers.length} Artisans Active
            </span>
          </div>
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-900/90 hover:bg-blue-800 text-white p-2 rounded-xl border border-blue-700 backdrop-blur-md text-xs transition shadow-lg flex items-center gap-1"
            title="Open in Google Maps App"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Bottom Google Telemetry Key (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 shadow-xl space-y-1">
          <div className="font-bold text-white uppercase tracking-wider text-[9px] mb-1 flex items-center gap-1.5">
            <Globe size={11} className="text-amber-400" />
            <span>Google Maps {userDistrict} Telemetry Key</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300"></span> On Job
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-300 animate-ping"></span> SOS Alert
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-dashed border-amber-400 bg-amber-400/20"></span> Demand Cluster
            </span>
          </div>
        </div>

        {/* Official Google Maps Watermark Badge (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow flex items-center gap-1">
            <span className="font-bold text-blue-600">G</span>
            <span className="font-bold text-red-600">o</span>
            <span className="font-bold text-yellow-500">o</span>
            <span className="font-bold text-blue-600">g</span>
            <span className="font-bold text-green-600">l</span>
            <span className="font-bold text-red-600">e</span>
            <span className="text-[8px] text-gray-500">Maps imagery</span>
          </div>
        </div>

        {/* Selected Artisan Floating Flyout Card */}
        {selectedArtisan && (
          <div className="absolute top-3 left-3 z-20 bg-white dark:bg-[#131B38] border border-gray-200 dark:border-[#1E294B] p-4 rounded-2xl shadow-2xl max-w-xs w-full space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-extrabold text-blue-900 dark:text-amber-400 bg-blue-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-amber-800">
                  {selectedArtisan.worker_code}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                  {selectedArtisan.name}
                </h4>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                  {selectedArtisan.primary_trade || selectedArtisan.primaryTrade || 'Certified Master Artisan'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArtisan(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="bg-gray-50 dark:bg-slate-900/60 p-2 rounded-lg">
                <span className="text-[10px] text-gray-400 block">Rating</span>
                <strong className="text-amber-600 dark:text-amber-400 font-mono">⭐ {selectedArtisan.rating || '4.9'}</strong>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/60 p-2 rounded-lg">
                <span className="text-[10px] text-gray-400 block">Live Status</span>
                <strong className={selectedArtisan.availability === 'AVAILABLE' ? 'text-emerald-600' : 'text-amber-600'}>
                  {selectedArtisan.availability || 'AVAILABLE'}
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 font-mono">
              📍 Google GPS: {Number(selectedArtisan.latitude || 20.2961).toFixed(4)}° N, {Number(selectedArtisan.longitude || 85.8245).toFixed(4)}° E
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${selectedArtisan.phone || '9876543210'}`}
                className="flex-1 py-1.5 px-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Phone size={12} /> Call
              </a>
              {onDispatchArtisan && (
                <button
                  type="button"
                  onClick={() => {
                    onDispatchArtisan(selectedArtisan);
                    setSelectedArtisan(null);
                  }}
                  className="flex-1 py-1.5 px-2 bg-blue-950 dark:bg-amber-400 hover:bg-blue-900 dark:hover:bg-amber-300 text-white dark:text-slate-950 rounded-xl text-center text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Quick Dispatch
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected Emergency SOS Flyout */}
        {selectedEmergency && (
          <div className="absolute top-3 left-3 z-20 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-2xl shadow-2xl max-w-sm w-full space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-300 font-black text-xs uppercase tracking-wider">
                <ShieldAlert size={16} className="animate-ping" />
                <span>Active Worksite Emergency</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmergency(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {selectedEmergency.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-red-200 mt-0.5">
                Artisan: <strong>{selectedEmergency.workerName}</strong> ({selectedEmergency.workerCode})
              </p>
              <p className="text-[11px] text-gray-500 dark:text-red-300 font-mono mt-0.5">
                📍 Worksite: {selectedEmergency.location}
              </p>
            </div>

            <div className="pt-2 border-t border-red-100 dark:border-red-900 flex items-center gap-2">
              <a
                href={`tel:${selectedEmergency.phone}`}
                className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
              >
                <Phone size={12} /> Call Artisan
              </a>
              <button
                type="button"
                onClick={() => {
                  alert(`Dispatched Emergency Medical & Supervisor Assistance to ${selectedEmergency.location}`);
                  setSelectedEmergency(null);
                }}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-bold transition cursor-pointer"
              >
                Deploy Aid
              </button>
            </div>
          </div>
        )}

        {/* Selected Cluster Flyout */}
        {selectedCluster && (
          <div className="absolute top-3 left-3 z-20 bg-white dark:bg-[#131B38] border border-amber-300 dark:border-amber-700 p-4 rounded-2xl shadow-2xl max-w-xs w-full space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Zap size={15} />
                <span>Demand Cluster Spotlight</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCluster(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {selectedCluster.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Top Trade: <strong>{selectedCluster.topTrade}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <span className="text-[10px] text-gray-400 block">Demand Index</span>
                <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{selectedCluster.demandIndex}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <span className="text-[10px] text-gray-400 block">Artisans Nearby</span>
                <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{selectedCluster.activeArtisans} Active</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Artisan Radar Carousel ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Navigation size={14} className="text-blue-900 dark:text-amber-400" />
            <span>Active Artisans in {userDistrict} ({visibleWorkers.length})</span>
          </span>
          <span className="text-[11px] text-gray-400">Click any artisan to fly Google Map to their coordinates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {visibleWorkers.slice(0, 8).map((w) => {
            const isSelected = selectedArtisan?.id === w.id;
            const trade = getTradeInfo(w.primary_trade || w.primaryTrade || w.name);
            const isSos = w.sos_active || societyEmergencies.some((e) => e.workerCode === w.worker_code);
            return (
              <div
                key={w.id}
                onClick={() => {
                  setSelectedArtisan(w);
                  setSelectedCluster(null);
                  setSelectedEmergency(null);
                  const lat = Number(w.latitude) || 20.2961;
                  const lng = Number(w.longitude) || 85.8245;
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
                  }
                }}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                  isSelected
                    ? 'border-blue-950 dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 shadow-xs ring-1 ring-blue-950 dark:ring-amber-400'
                    : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-xs shrink-0">
                    {trade.symbol}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white truncate">
                      {w.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                      {trade.label} • {w.worker_code}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      isSos
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                        : w.availability === 'BUSY'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isSos ? 'SOS' : w.availability === 'BUSY' ? 'BUSY' : 'AVAIL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Territorial Dispatch Clusters Grid (Click to Pan Google Map) ── */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-gray-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span>{societyName} Territorial Dispatch Clusters ({userDistrict} District)</span>
          </span>
          <div className="flex items-center gap-2">
            {onRebalance && (
              <button
                type="button"
                onClick={onRebalance}
                className="btn btn-primary btn-sm text-xs font-bold bg-blue-950 dark:bg-amber-400 text-white dark:text-slate-950 hover:bg-blue-900 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw size={12} className={rebalanceActive ? 'text-emerald-400' : ''} />
                {rebalanceActive ? 'Surplus Rebalance Authorized ✓' : 'Authorize Surplus Rebalance'}
              </button>
            )}
            <span className="text-[11px] text-gray-400 hidden sm:inline">Click cluster to center Google Map</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {clusters.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCluster(c);
                setSelectedArtisan(null);
                setSelectedEmergency(null);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([c.lat, c.lng], 15, { duration: 0.8 });
                }
              }}
              className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                selectedCluster?.id === c.id
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-xs ring-1 ring-amber-400'
                  : 'bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white truncate">{c.name.split(' ')[0]} Hub</span>
                <span className="text-[10px] font-mono font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                  {c.demandIndex}%
                </span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{c.topTrade}</div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${c.demandIndex}%` }}></div>
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between font-mono">
                <span>{c.activeArtisans} Artisans</span>
                <span className="text-blue-600 dark:text-amber-400 font-semibold">Center Map →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
