import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DEFAULT_LOCATIONS = [
  {
    id: 1,
    society_id: 1,
    name: 'Saheed Nagar / Master Canteen',
    district: 'Khordha',
    city: 'Bhubaneswar',
    pincode: '751001',
    multiplier: 1.04,
    label: 'Central Urban (+4%)',
    tag: 'High Commercial Traffic'
  },
  {
    id: 2,
    society_id: 2,
    name: 'Khandagiri / Aiginia',
    district: 'Khordha',
    city: 'Bhubaneswar',
    pincode: '751030',
    multiplier: 1.00,
    label: 'Standard Base Rate (0%)',
    tag: 'Suburban Residential'
  },
  {
    id: 3,
    society_id: 3,
    name: 'Old Town / Lingaraj Heritage',
    district: 'Khordha',
    city: 'Bhubaneswar',
    pincode: '751002',
    multiplier: 1.03,
    label: 'Heritage Conservation (+3%)',
    tag: 'Narrow Lane & Heritage Restorations'
  },
  {
    id: 4,
    society_id: 4,
    name: 'Patia / Infocity IT Corridor',
    district: 'Khordha',
    city: 'Bhubaneswar',
    pincode: '751024',
    multiplier: 1.06,
    label: 'IT High-Rise Corridor (+6%)',
    tag: 'Multi-Story & Modern Gadgets'
  },
  {
    id: 5,
    society_id: 5,
    name: 'Badambadi / Ranihat',
    district: 'Cuttack',
    city: 'Cuttack',
    pincode: '753012',
    multiplier: 1.00,
    label: 'Commercial Base Rate (0%)',
    tag: 'Trade & Wholesale Zone'
  },
  {
    id: 6,
    society_id: 6,
    name: 'Madhupatna / OMP / Jagatpur',
    district: 'Cuttack',
    city: 'Cuttack',
    pincode: '753010',
    multiplier: 0.98,
    label: 'Industrial Artisan (-2%)',
    tag: 'High-Volume Fabrication Hub'
  },
  {
    id: 7,
    society_id: 7,
    name: 'CDA Sectors 1-14 / Cantonment',
    district: 'Cuttack',
    city: 'Cuttack',
    pincode: '753014',
    multiplier: 1.04,
    label: 'Planned Urban (+4%)',
    tag: 'Gated Societies & High-Rises'
  },
  {
    id: 8,
    society_id: 8,
    name: 'Silver City / Buxi Bazar',
    district: 'Cuttack',
    city: 'Cuttack',
    pincode: '753001',
    multiplier: 1.02,
    label: 'Heritage Artisan Guild (+2%)',
    tag: 'Traditional Craft Precinct'
  },
  {
    id: 9,
    society_id: 9,
    name: 'Grand Road / VIP Road',
    district: 'Puri',
    city: 'Puri',
    pincode: '752002',
    multiplier: 1.02,
    label: 'Pilgrim Corridor (+2%)',
    tag: 'High Pilgrim Density'
  },
  {
    id: 10,
    society_id: 10,
    name: 'Konark Sun Coast / Marine Drive',
    district: 'Puri',
    city: 'Konark',
    pincode: '752111',
    multiplier: 1.03,
    label: 'Eco-Tourism Coast (+3%)',
    tag: 'Resort & Solar Maintenance'
  },
  {
    id: 11,
    society_id: 11,
    name: 'Sea Beach Road / Baliapanda',
    district: 'Puri',
    city: 'Puri',
    pincode: '752001',
    multiplier: 1.05,
    label: 'Coastal Anti-Corrosive (+5%)',
    tag: 'High Saline & Rust Mitigation'
  },
  {
    id: 12,
    society_id: 12,
    name: 'Brahmagiri / Satapada / Chilika',
    district: 'Puri',
    city: 'Brahmagiri',
    pincode: '752001',
    multiplier: 0.96,
    label: 'Grassroots Subsidized (-4%)',
    tag: 'Rural Agro-Maritime Subsidy'
  }
];

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const KNOWN_EXTERNAL_CITIES = [
  { name: 'Rourkela', district: 'Sundargarh', lat: 22.249, lng: 84.882 },
  { name: 'Balasore', district: 'Balasore', lat: 21.493, lng: 86.933 },
  { name: 'Baripada', district: 'Mayurbhanj', lat: 21.934, lng: 86.736 },
  { name: 'Angul', district: 'Angul', lat: 20.840, lng: 85.100 },
  { name: 'Bhadrak', district: 'Bhadrak', lat: 21.057, lng: 86.495 },
  { name: 'Jharsuguda', district: 'Jharsuguda', lat: 21.855, lng: 84.006 },
  { name: 'Jeypore', district: 'Koraput', lat: 18.854, lng: 82.569 },
];

export const AVAILABLE_DISTRICTS = [
  { name: 'Khordha', displayName: 'Khordha (Bhubaneswar)', city: 'Bhubaneswar', primaryAreaId: 1 },
  { name: 'Cuttack', displayName: 'Cuttack District', city: 'Cuttack', primaryAreaId: 5 },
  { name: 'Puri', displayName: 'Puri District', city: 'Puri', primaryAreaId: 9 },
];

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [unsupportedLocation, setUnsupportedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('prithvifix_unsupported_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(() => {
    return localStorage.getItem('prithvifix_use_current_location') === 'true';
  });
  const [selectedAreaId, setSelectedAreaId] = useState(() => {
    const saved = localStorage.getItem('prithvifix_selected_area_id') || localStorage.getItem('shramsetu_selected_area_id');
    return saved ? Number(saved) : 1;
  });

  const showNotice = (msg) => {
    setLocationNotice(msg);
    setTimeout(() => {
      setLocationNotice((prev) => (prev === msg ? '' : prev));
    }, 5000);
  };

  // Fetch updated locations from API on mount
  useEffect(() => {
    api.getServiceLocations()
      .then((res) => {
        if (res && res.locations && res.locations.length > 0) {
          setLocations(res.locations);
        }
      })
      .catch((err) => console.warn('Could not refresh service locations from API:', err));
  }, []);

  const selectedLocation = locations.find((l) => l.id === Number(selectedAreaId)) || locations[0] || DEFAULT_LOCATIONS[0];
  const selectedDistrict = selectedLocation.district;

  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      const fallback = locations.find(l => l.id === 2) || DEFAULT_LOCATIONS[1];
      setSelectedAreaId(2);
      setIsUsingCurrentLocation(true);
      setUnsupportedLocation(null);
      localStorage.removeItem('prithvifix_unsupported_location');
      localStorage.setItem('prithvifix_use_current_location', 'true');
      localStorage.setItem('prithvifix_selected_area_id', '2');
      setIsDetectingLocation(false);
      showNotice(`📍 District set: ${fallback.district} (${fallback.city})`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsMap = {
          1: { lat: 20.2885, lng: 85.8436, name: 'Saheed Nagar' },
          2: { lat: 20.2588, lng: 85.7865, name: 'Khandagiri' },
          3: { lat: 20.2405, lng: 85.8340, name: 'Old Town' },
          4: { lat: 20.3540, lng: 85.8190, name: 'Patia' },
          5: { lat: 20.4578, lng: 85.8756, name: 'Badambadi' },
          6: { lat: 20.4490, lng: 85.8920, name: 'Madhupatna' },
          7: { lat: 20.4850, lng: 85.8350, name: 'CDA Sectors' },
          8: { lat: 20.4630, lng: 85.8840, name: 'Silver City' },
          9: { lat: 19.8120, lng: 85.8280, name: 'Grand Road' },
          10: { lat: 19.8876, lng: 86.0945, name: 'Konark' },
          11: { lat: 19.7980, lng: 85.8250, name: 'Sea Beach Road' },
          12: { lat: 19.8000, lng: 85.6700, name: 'Brahmagiri' },
        };

        // 1. Calculate distance to nearest active cooperative hub
        let closestId = 2;
        let minKm = Infinity;
        for (const [idStr, coords] of Object.entries(coordsMap)) {
          const km = calculateHaversineKm(coords.lat, coords.lng, latitude, longitude);
          if (km < minKm) {
            minKm = km;
            closestId = Number(idStr);
          }
        }

        // 2. Coverage threshold: active hubs cover a maximum radius of 35 km
        // If greater than 35 km, the user is outside active coverage
        const isOutOfCoverage = minKm > 35;

        if (!isOutOfCoverage) {
          // Within active coverage: map to the nearest cooperative hub
          const matched = locations.find(l => l.id === closestId) || DEFAULT_LOCATIONS[1];
          setSelectedAreaId(closestId);
          setIsUsingCurrentLocation(true);
          setUnsupportedLocation(null);
          localStorage.removeItem('prithvifix_unsupported_location');
          localStorage.setItem('prithvifix_use_current_location', 'true');
          localStorage.setItem('prithvifix_selected_area_id', String(closestId));
          setIsDetectingLocation(false);
          showNotice(`📍 GPS detected: ${matched.district} District (${matched.city})`);
          return;
        }

        // 3. User is in an unserved area: resolve exact city name
        let detectedCity = '';
        let detectedDistrict = '';

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { signal: controller.signal }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            detectedCity = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.state_district || '';
            detectedDistrict = addr.state_district || addr.county || '';
          }
        } catch {
          // Network timeout or offline - rely on coordinate distance lookup
        }

        // Offline / fallback lookup from known external cities
        if (!detectedCity) {
          let closestKnown = null;
          let minKnownDist = Infinity;
          for (const c of KNOWN_EXTERNAL_CITIES) {
            const km = calculateHaversineKm(c.lat, c.lng, latitude, longitude);
            if (km < minKnownDist) {
              minKnownDist = km;
              closestKnown = c;
            }
          }
          if (closestKnown && minKnownDist < 60) {
            detectedCity = closestKnown.name;
            detectedDistrict = closestKnown.district;
          } else {
            detectedCity = detectedDistrict || 'Outside Coverage Area';
          }
        }

        const unsupp = {
          name: detectedCity,
          district: detectedDistrict || 'Odisha',
          isComingSoon: true,
          distanceKm: Math.round(minKm)
        };

        setUnsupportedLocation(unsupp);
        localStorage.setItem('prithvifix_unsupported_location', JSON.stringify(unsupp));
        setIsUsingCurrentLocation(true);
        // Anchor to closest hub so background tariff engine still functions
        setSelectedAreaId(closestId);
        localStorage.setItem('prithvifix_selected_area_id', String(closestId));
        setIsDetectingLocation(false);
        showNotice(`📍 Detected: ${detectedCity}. Services are coming soon to your area! Active in Khordha, Cuttack & Puri.`);
      },
      (err) => {
        console.warn('Geolocation permission not granted or error, default to Khandagiri:', err);
        const fallback = locations.find(l => l.id === 2) || DEFAULT_LOCATIONS[1];
        setSelectedAreaId(2);
        setIsUsingCurrentLocation(true);
        setUnsupportedLocation(null);
        localStorage.removeItem('prithvifix_unsupported_location');
        localStorage.setItem('prithvifix_use_current_location', 'true');
        localStorage.setItem('prithvifix_selected_area_id', '2');
        setIsDetectingLocation(false);
        showNotice(`📍 GPS unavailable. Defaulted to ${fallback.district} District (${fallback.city})`);
      },
      { timeout: 5000, maximumAge: 30000, enableHighAccuracy: false }
    );
  };

  const changeDistrict = (districtName) => {
    if (districtName === 'current' || districtName === 'CURRENT_LOCATION' || districtName === 'detect_current') {
      detectCurrentLocation();
      return;
    }
    const matchedDist = AVAILABLE_DISTRICTS.find(
      (d) => d.name.toLowerCase() === String(districtName).toLowerCase()
    );
    const targetId = matchedDist ? matchedDist.primaryAreaId : 1;
    setSelectedAreaId(targetId);
    setIsUsingCurrentLocation(false);
    setUnsupportedLocation(null);
    localStorage.removeItem('prithvifix_unsupported_location');
    localStorage.removeItem('prithvifix_use_current_location');
    localStorage.setItem('prithvifix_selected_area_id', String(targetId));
    const dName = matchedDist ? matchedDist.displayName : `${districtName} District`;
    showNotice(`📍 Switched to ${dName}`);
  };

  const changeLocation = (areaId) => {
    if (areaId === 'current' || areaId === 'CURRENT_LOCATION' || areaId === 'detect_current') {
      detectCurrentLocation();
      return;
    }
    if (typeof areaId === 'string' && isNaN(Number(areaId))) {
      changeDistrict(areaId);
      return;
    }
    const id = Number(areaId);
    setSelectedAreaId(id);
    setIsUsingCurrentLocation(false);
    setUnsupportedLocation(null);
    localStorage.removeItem('prithvifix_unsupported_location');
    localStorage.removeItem('prithvifix_use_current_location');
    localStorage.setItem('prithvifix_selected_area_id', String(id));
    const loc = locations.find(l => l.id === id);
    if (loc) {
      showNotice(`📍 Switched to ${loc.district} District`);
    }
  };

  const calculateAreaPrice = (basePrice, priceUnit = 'per_visit') => {
    const base = Number(basePrice) || 0;
    if (priceUnit === 'per_sqft') {
      return Math.max(1, Math.round(base * selectedLocation.multiplier));
    }
    const raw = base * selectedLocation.multiplier;
    return Math.max(99, Math.round(raw / 5) * 5);
  };

  const value = {
    locations,
    availableDistricts: AVAILABLE_DISTRICTS,
    selectedLocation,
    selectedAreaId,
    selectedDistrict,
    isUsingCurrentLocation,
    isDetectingLocation,
    detectCurrentLocation,
    changeLocation,
    changeDistrict,
    calculateAreaPrice,
    multiplier: selectedLocation.multiplier,
    label: selectedLocation.label,
    locationNotice,
    unsupportedLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
