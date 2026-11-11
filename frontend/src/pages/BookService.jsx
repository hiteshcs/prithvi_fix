import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Star, MapPin,
  Calendar, Clock, User, Users, ArrowRight, ArrowLeft, Zap, Check,
  Info, Sparkles, Building2, HelpCircle, Layers, ShieldAlert, Award,
  Search, X, Wrench, Droplets, Hammer, Paintbrush, SprayCan,
  LogIn, CheckSquare, Square, Navigation, Radio, Compass, Car,
  Snowflake, Wind, Flower2, HeartPulse, Settings, LocateFixed, Lock, Phone,
  Home, Briefcase
} from 'lucide-react';
import LiveRouteMap from '../components/LiveRouteMap';
import { useLocationContext } from '../context/LocationContext';

export default function BookService() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  // Wizard Step: 1 = Problem Search & Service, 2 = Location & Timing, 3 = Worker Matching & Master Pairing, 4 = Review, 5 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Data states
  const [services, setServices] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [autoAssign, setAutoAssign] = useState(true);

  // Step 1 Search & Problem Matching state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL');
  const [matchedDiagnosis, setMatchedDiagnosis] = useState(null);

  // Form states (Step 2)
  const [formData, setFormData] = useState({
    district: user?.district || 'Khordha',
    societyId: '',
    city: user?.city || 'Bhubaneswar',
    address: user?.address || 'Plot 104, Patia',
    pincode: user?.pincode || '751024',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM',
    isEmergency: false,
    isBulkOrder: false,
    squadSize: 1,
    notes: '',
  });

  const {
    selectedLocation,
    isUsingCurrentLocation,
    isDetectingLocation,
    detectCurrentLocation,
  } = useLocationContext();

  const [savedAddresses, setSavedAddresses] = useState([]);

  // Fetch saved addresses if authenticated customer
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      api.getSavedAddresses()
        .then((res) => {
          const list = res?.addresses || [];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.is_default);
          if (defaultAddr && (!user.address || formData.address === 'Plot 104, Patia')) {
            setFormData((prev) => ({
              ...prev,
              district: defaultAddr.district || prev.district,
              city: defaultAddr.city || prev.city,
              address: defaultAddr.full_address || prev.address,
              pincode: defaultAddr.pincode || prev.pincode,
            }));
          }
        })
        .catch((err) => console.warn('Failed to load saved addresses for booking:', err));
    } else {
      setSavedAddresses([]);
    }
  }, [user]);

  // Sync with GPS current location detection if user taps current location
  useEffect(() => {
    if (selectedLocation && isUsingCurrentLocation) {
      setFormData((prev) => ({
        ...prev,
        district: selectedLocation.district,
        societyId: '',
        city: selectedLocation.city,
        address: selectedLocation.name ? `${selectedLocation.name}, Central Sector` : prev.address,
        pincode: selectedLocation.pincode || prev.pincode,
      }));
    }
  }, [selectedLocation, isUsingCurrentLocation]);

  const handleDistrictChange = (dist) => {
    setFormData((prev) => ({
      ...prev,
      district: dist,
      societyId: '',
      city: dist === 'Cuttack' ? 'Cuttack' : dist === 'Puri' ? 'Puri' : 'Bhubaneswar',
      pincode: dist === 'Cuttack' ? '753001' : dist === 'Puri' ? '752001' : '751001',
    }));
  };

  // Dynamic 60-minute emergency time window from current time
  const getEmergencyTimeWindow = () => {
    const now = new Date();
    const start = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const end = new Date(now.getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${start} - ${end} (Express 60-Min Window)`;
  };

  const handleEmergencyToggle = (isEmergencyChecked) => {
    if (isEmergencyChecked) {
      const emergencyWindow = getEmergencyTimeWindow();
      setFormData((prev) => ({
        ...prev,
        isEmergency: true,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: emergencyWindow,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        isEmergency: false,
        scheduledTime: '09:00 AM',
      }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [customerCoords, setCustomerCoords] = useState({ lat: 20.3540, lng: 85.8170 });

  // Live polling in Step 4 to auto-refresh booking when worker accepts
  useEffect(() => {
    if (currentStep !== 4 || !createdBooking?.id || createdBooking?.arrival_otp) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getBookingById(createdBooking.id);
        if (res?.booking && (res.booking.arrival_otp || res.booking.worker_id)) {
          setCreatedBooking(res.booking);
        }
      } catch (err) {
        console.warn('Live polling booking update error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentStep, createdBooking?.id, createdBooking?.arrival_otp]);

  // Advanced Semantic & Synonym Dictionary for Indian Civic & Home Repair Trades
  const REPAIR_SYNONYMS = {
    tap: ['tap', 'faucet', 'spout', 'valve', 'leak', 'plumb', 'pani', 'nal', 'nalaka', 'bibcock', 'spindle', 'cartridge'],
    leaking: ['leak', 'leaking', 'leakage', 'dripping', 'pipe', 'burst', 'water', 'seepage', 'drip', 'seep', 'overflow', 'plumbing'],
    leak: ['leak', 'leaking', 'leakage', 'dripping', 'pipe', 'burst', 'water', 'seepage', 'drip', 'seep', 'overflow', 'plumbing'],
    pipe: ['pipe', 'piping', 'drain', 'drainage', 'plumb', 'plumbing', 'sewer', 'cpvc', 'pvc', 'line', 'joint', 'elbow'],
    drain: ['drain', 'drainage', 'clog', 'clogged', 'sewer', 'block', 'blocked', 'choke', 'choked', 'sink', 'basin', 'gutter'],
    toilet: ['toilet', 'commode', 'flush', 'cistern', 'sanitary', 'ewc', 'seat', 'bathroom', 'pot'],
    flush: ['flush', 'cistern', 'toilet', 'valve', 'leak', 'handle', 'siphon'],
    sink: ['sink', 'basin', 'washbasin', 'pipe', 'drain', 'trap', 'plumbing'],
    ac: ['ac', 'air conditioner', 'cooling', 'cool', 'jet', 'gas', 'freon', 'compressor', 'split', 'inverter', 'filter', 'coil', 'servicing'],
    cool: ['cool', 'cooling', 'chilling', 'ac', 'fridge', 'refrigerator'],
    cooling: ['cool', 'cooling', 'chilling', 'ac', 'fridge', 'refrigerator'],
    gas: ['gas', 'refill', 'refilling', 'leak', 'r32', 'r410a', 'charging', 'cylinder', 'nitrogen'],
    fridge: ['fridge', 'refrigerator', 'compressor', 'cooling', 'defrost', 'freezer', 'relay'],
    refrigerator: ['fridge', 'refrigerator', 'compressor', 'cooling', 'defrost', 'freezer', 'relay'],
    washing: ['washing', 'machine', 'washer', 'dryer', 'drum', 'drain pump', 'motor'],
    fan: ['fan', 'ceiling fan', 'exhaust', 'motor', 'regulator', 'blade', 'bearing', 'noise'],
    light: ['light', 'tube', 'bulb', 'lighting', 'holder', 'chandelier', 'fixture', 'led'],
    switch: ['switch', 'socket', 'plug', 'board', 'modular', 'switchboard', 'burnt'],
    mcb: ['mcb', 'fuse', 'tripping', 'trip', 'short circuit', 'power cut', 'spark', 'sparking', 'wiring', 'distribution'],
    wiring: ['wire', 'wiring', 'short', 'spark', 'current', 'shock', 'earthing', 'conduit', 'cable'],
    spark: ['spark', 'sparking', 'short', 'circuit', 'mcb', 'switch', 'fire', 'smoke'],
    door: ['door', 'darwaza', 'lock', 'handle', 'latch', 'hinge', 'stopper', 'kapat'],
    lock: ['lock', 'godrej', 'mortise', 'key', 'chabi', 'cylinder'],
    furniture: ['furniture', 'bed', 'sofa', 'table', 'chair', 'cupboard', 'almirah', 'wardrobe', 'assembly', 'wood'],
    paint: ['paint', 'painting', 'painter', 'color', 'rang', 'wall', 'putty', 'primer', 'distemper', 'emulsion'],
    waterproof: ['waterproof', 'waterproofing', 'seepage', 'damp', 'terrace', 'roof', 'leakage', 'crack', 'damp proof'],
    clean: ['clean', 'cleaning', 'deep clean', 'safai', 'wash', 'scrub', 'sanitize', 'pest', 'termite'],
    geyser: ['geyser', 'water heater', 'element', 'thermostat', 'heating', 'hot water'],
    pest: ['pest', 'termite', 'cockroach', 'ant', 'bedbug', 'insect', 'rodent', 'rat'],
    chimney: ['chimney', 'hob', 'kitchen', 'exhaust', 'degrease', 'filter']
  };

  const getLikelyPartsForTrade = (trade, serviceName = '') => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('tap') || name.includes('faucet') || name.includes('spout')) {
      return '1/2" Ceramic Disc Spindle / Teflon Washer Kit';
    }
    if (name.includes('gas') && name.includes('ac')) {
      return 'R32 / R410A Eco Refrigerant Canister (500g)';
    }
    if (name.includes('mcb') || name.includes('distribution')) {
      return '16A Havells Modular MCB';
    }
    if (name.includes('switch') || name.includes('socket')) {
      return 'Anchor 6A/16A Modular Switch & Socket Kit';
    }
    if (name.includes('pipe') || name.includes('burst')) {
      return 'Supreme CPVC 1" Elbow Joint / SS Flexible Waste Pipe';
    }
    if (name.includes('lock') || name.includes('door')) {
      return 'Godrej Stainless Steel Mortise Lock Set';
    }
    if (trade === 'Plumbing') return 'Astral 1/2" Brass Ball Valve / Spindle';
    if (trade === 'Electrical') return 'Modular MCB / Copper Wiring Set';
    if (trade === 'Appliance Repair') return '45uF Capacitor / Gas Valve Matrix';
    if (trade === 'Carpentry') return 'Hydraulic Soft-Close Hinges / Fasteners';
    if (trade === 'Painting') return 'Damp-Proof Acrylic Primer / Putty';
    return 'Standard ISI Certified Toolkit';
  };

  // Common Problem Presets
  const symptomPresets = [
    { label: '🚰 Tap leaking', query: 'tap leaking', trade: 'Plumbing', service: 'Tap, Spout & Flush Valve Leak Repair' },
    { label: '❄️ AC gas & cooling', query: 'ac cooling gas', trade: 'Appliance Repair', service: 'AC Gas Leak Repair & Refilling' },
    { label: '⚡ MCB tripping / switch', query: 'mcb tripping', trade: 'Electrical', service: 'Main MCB & Distribution Board Replacement' },
    { label: '🪑 Furniture assembly', query: 'furniture assembly', trade: 'Carpentry', service: 'Flatpack Furniture Assembly' },
    { label: '💧 Blocked drain / pipe', query: 'blocked drain', trade: 'Plumbing', service: 'Blocked Drain & Sewer Pipe De-clogging' },
    { label: '🚨 Emergency pipe burst', query: 'emergency pipe burst', trade: 'Emergency Services', service: 'Emergency 60-Min Main Pipe Burst Containment', isEmergency: true },
  ];

  // Core Search Ranking Engine
  const rankServices = (allServices, queryText, categoryTab) => {
    const rawQuery = (queryText || '').trim().toLowerCase();

    // If no search query, filter purely by category tab
    if (!rawQuery) {
      if (categoryTab && categoryTab !== 'ALL') {
        return allServices.filter((s) => (s.category || '').toLowerCase() === categoryTab.toLowerCase());
      }
      return allServices;
    }

    // Clean query words
    const cleanWords = rawQuery
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (cleanWords.length === 0) return allServices;

    // Expand search terms with repair synonyms
    const expandedTerms = new Set();
    cleanWords.forEach((word) => {
      expandedTerms.add(word);
      for (const [key, list] of Object.entries(REPAIR_SYNONYMS)) {
        if (word.includes(key) || key.includes(word)) {
          list.forEach((item) => expandedTerms.add(item.toLowerCase()));
        }
      }
    });

    const scored = allServices.map((svc) => {
      const name = (svc.name || '').toLowerCase();
      const cat = (svc.category || '').toLowerCase();
      const desc = (svc.description || '').toLowerCase();
      let score = 0;

      // Exact phrase match in name or desc
      if (name.includes(rawQuery)) score += 250;
      if (desc.includes(rawQuery)) score += 80;
      if (cat.includes(rawQuery)) score += 70;

      // Token matches
      let matchedTokens = 0;
      cleanWords.forEach((word) => {
        if (name.includes(word)) {
          score += 100;
          matchedTokens++;
        } else if (desc.includes(word)) {
          score += 40;
          matchedTokens++;
        } else if (cat.includes(word)) {
          score += 35;
          matchedTokens++;
        }
      });

      // Bonus if multiple query tokens all matched
      if (cleanWords.length > 1 && matchedTokens === cleanWords.length) {
        score += 150;
      }

      // Synonym expansion matches
      expandedTerms.forEach((term) => {
        if (name.includes(term)) score += 45;
        else if (cat.includes(term)) score += 30;
        else if (desc.includes(term)) score += 15;
      });

      // Boost if categoryTab is set and matches
      if (categoryTab && categoryTab !== 'ALL' && cat === categoryTab.toLowerCase()) {
        score += 20;
      }

      return { svc, score };
    });

    const matches = scored.filter((item) => item.score > 0);
    matches.sort((a, b) => b.score - a.score);
    return matches.map((m) => m.svc);
  };

  // Initial load & Role Redirect Guard
  useEffect(() => {
    if (user && user.role === 'WORKER') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }
    if (user && user.role === 'COOPERATIVE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    Promise.all([
      api.getServices(),
      api.getSocietiesList().catch(() => ({ societies: [] })),
    ])
      .then(async ([data, socData]) => {
        const sList = data.services || [];
        setServices(sList);
        const socList = socData?.societies || [];
        setSocieties(socList);

        const queryWorkerId = searchParams.get('workerId');
        const queryServiceId = searchParams.get('serviceId');
        const queryCategory = searchParams.get('category');
        const querySearch = searchParams.get('search') || searchParams.get('q');
        const queryDistrict = searchParams.get('district');
        const queryAreaId = searchParams.get('area_id');
        const querySocietyId = searchParams.get('society_id');

        if (queryDistrict) {
          setFormData((prev) => ({ ...prev, district: queryDistrict }));
        }

        if (querySocietyId || queryAreaId) {
          const targetSocId = querySocietyId || queryAreaId;
          const matchedSoc = socList.find((s) => String(s.id) === String(targetSocId));
          if (matchedSoc) {
            setFormData((prev) => ({
              ...prev,
              societyId: String(matchedSoc.id),
              district: matchedSoc.district,
              city: matchedSoc.city || prev.city,
              address: matchedSoc.address || prev.address,
              pincode: matchedSoc.pincode || prev.pincode,
            }));
          }
        }

        if (querySearch) {
          setSearchQuery(querySearch);
          const ranked = rankServices(sList, querySearch, 'ALL');
          if (ranked.length > 0) {
            setSelectedService(ranked[0]);
            setMatchedDiagnosis({
              serviceName: ranked[0].name,
              trade: ranked[0].category,
              likelyParts: getLikelyPartsForTrade(ranked[0].category, ranked[0].name),
              standardTariff: `Cooperative Regulated • ₹${ranked[0].price || ranked[0].base_price}`,
            });
          }
        }

        if (queryWorkerId) {
          try {
            const workerData = await api.getWorkerById(queryWorkerId);
            if (workerData?.worker) {
              const w = workerData.worker;
              const workerTrade = w.primary_trade || (w.skills && w.skills[0] ? w.skills[0].category : null);
              const match = sList.find(s => workerTrade && (s.category.toLowerCase().includes(workerTrade.toLowerCase()) || workerTrade.toLowerCase().includes(s.category.toLowerCase()))) || sList[0];
              if (match) {
                setSelectedService(match);
                setMatchedDiagnosis({
                  serviceName: match.name,
                  trade: match.category,
                  likelyParts: getLikelyPartsForTrade(match.category, match.name),
                  standardTariff: `Cooperative Regulated • ₹${match.price || match.base_price}`,
                });
              }
              setCurrentStep(2);
              return;
            }
          } catch (err) {
            console.error('Failed to load initial worker:', err);
          }
        }

        if (queryServiceId) {
          const match = sList.find((s) => s.id === parseInt(queryServiceId, 10));
          if (match) {
            setSelectedService(match);
            setMatchedDiagnosis({
              serviceName: match.name,
              trade: match.category,
              likelyParts: getLikelyPartsForTrade(match.category, match.name),
              standardTariff: `Cooperative Regulated • ₹${match.price || match.base_price}`,
            });
            if (match.category === 'Emergency Services') {
              setFormData((prev) => ({ ...prev, isEmergency: true }));
            }
            setCurrentStep(2);
          }
        } else if (queryCategory) {
          const normCat = queryCategory.toLowerCase().replace(/^cat/, '');
          const match = sList.find((s) => {
            const sc = (s.category || '').toLowerCase();
            const sn = (s.name || '').toLowerCase();
            return sc.includes(normCat) || normCat.includes(sc) || sn.includes(normCat) || normCat.includes(sn);
          });

          if (match) {
            setSelectedCategoryTab(match.category);
            setSelectedService(match);
            setMatchedDiagnosis({
              serviceName: match.name,
              trade: match.category,
              likelyParts: getLikelyPartsForTrade(match.category, match.name),
              standardTariff: `Cooperative Regulated • ₹${match.base_price}`,
            });
            if (match.category === 'Emergency Services') {
              handleEmergencyToggle(true);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load services:', err));
  }, [searchParams]);

  // Recalculate localized area pricing when district or society changes
  useEffect(() => {
    if (!selectedService) return;
    const params = {};
    if (formData.district) params.district = formData.district;
    if (formData.societyId) params.society_id = formData.societyId;

    api.getServices(params)
      .then((res) => {
        if (res?.services) {
          const updated = res.services.find((s) => s.id === selectedService.id);
          if (updated) {
            setSelectedService(updated);
          }
        }
      })
      .catch((err) => console.error('Error updating localized service price:', err));
  }, [formData.district, formData.societyId]);

  // High-performance Ranked Search Filtering
  const filteredServices = useMemo(() => {
    return rankServices(services, searchQuery, selectedCategoryTab);
  }, [services, searchQuery, selectedCategoryTab]);

  // Handle Search & Problem Match
  const handleProblemMatch = (symptomText, presetObj = null) => {
    const query = (symptomText || searchQuery || '').trim();
    if (presetObj) {
      setSearchQuery(presetObj.query || presetObj.label);
    }

    if (!query) {
      setMatchedDiagnosis(null);
      return;
    }

    const ranked = rankServices(services, query, 'ALL');
    if (ranked.length > 0) {
      const topMatch = ranked[0];
      setSelectedService(topMatch);
      setMatchedDiagnosis({
        serviceName: topMatch.name,
        trade: topMatch.category,
        likelyParts: getLikelyPartsForTrade(topMatch.category, topMatch.name),
        standardTariff: `Cooperative Regulated • ₹${topMatch.base_price}`,
      });
      if (topMatch.category === 'Emergency Services') {
        handleEmergencyToggle(true);
      }
    } else {
      setMatchedDiagnosis(null);
    }
  };

  // Trigger Smart Worker Recommendation & Master Pairing
  const fetchRecommendations = async () => {
    if (!selectedService) return;
    setMatchingLoading(true);
    setError('');
    try {
      const data = await api.recommendWorkers({
        serviceId: selectedService.id,
        category: selectedService.category,
        trade: selectedService.category,
        district: formData.district,
        city: formData.city,
        address: formData.address,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        isEmergency: formData.isEmergency,
      });

      if (data.customerCoords) {
        setCustomerCoords(data.customerCoords);
      }

      const list = data.recommendedWorkers || [];
      setRecommendedWorkers(list);

      const availableWorkers = list.filter((w) => !w.isSlotOccupied && w.availability === 'AVAILABLE');

      if (autoAssign) {
        setSelectedWorker(availableWorkers[0] || null);
      } else {
        setSelectedWorker((prev) => {
          if (prev) {
            const found = list.find((w) => w.id === prev.id);
            if (found && !found.isSlotOccupied && found.availability === 'AVAILABLE') {
              return found;
            }
          }
          return availableWorkers[0] || null;
        });
      }
    } catch (err) {
      console.error('Matching recommendation error:', err);
      setError('Unable to calculate recommendations right now.');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleStep2Next = async (e) => {
    e.preventDefault();
    if (!formData.address) {
      setError('Please provide service location address.');
      return;
    }
    setError('');
    setCurrentStep(3);
    await fetchRecommendations();
  };

  // Quick 1-Click Login as Demo Customer if not logged in
  const handleQuickCustomerLogin = async () => {
    setQuickLoginLoading(true);
    try {
      await login('customer@demo.local', 'demo123');
      setError('');
    } catch (err) {
      setError('Failed to perform quick login: ' + err.message);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      // Auto-authenticate if guest for smooth demo booking experience
      if (!isAuthenticated) {
        try {
          await login('customer@demo.local', 'demo123');
        } catch (authErr) {
          console.warn('Guest checkout auto-login fallback:', authErr);
        }
      }

      const effectiveSquadSize = formData.isBulkOrder ? Math.max(1, parseInt(formData.squadSize, 10) || 1) : 1;

      // Customer has no authority to choose worker; order broadcasts to nearby pool
      const payload = {
        service_id: selectedService.id,
        scheduled_date: formData.scheduledDate,
        scheduled_time: formData.scheduledTime,
        address: `${formData.address}, ${formData.city}, ${formData.district} - ${formData.pincode}`,
        district: formData.district,
        city: formData.city,
        pincode: formData.pincode,
        is_emergency: formData.isEmergency,
        is_bulk_order: formData.isBulkOrder,
        squad_size: effectiveSquadSize,
        notes: formData.notes || 'Standard booking',
      };

      const res = await api.createBooking(payload);
      setCreatedBooking(res.booking);
      setCurrentStep(4);
    } catch (err) {
      console.error('Booking submission failed:', err);
      setError(err.message || 'Failed to submit booking order.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Cooperative Tariff Calculation
  const selectedSoc = societies.find((s) => String(s.id) === String(formData.societyId));
  const workerWagePct = selectedSoc?.worker_wage_share_pct ? Number(selectedSoc.worker_wage_share_pct) : 93.0;
  const welfareFundPct = selectedSoc?.welfare_fund_share_pct ? Number(selectedSoc.welfare_fund_share_pct) : 2.0;
  const platformUpkeepPct = selectedSoc?.platform_upkeep_share_pct ? Number(selectedSoc.platform_upkeep_share_pct) : 5.0;

  const effectiveSquadSize = formData.isBulkOrder ? Math.max(1, parseInt(formData.squadSize, 10) || 1) : 1;
  const serviceEffectivePrice = Number(selectedService?.price || selectedService?.base_price) || 0;
  const singleUnitLabor = selectedService
    ? (formData.isEmergency ? Math.max(Math.round(serviceEffectivePrice * 1.2), 499) : serviceEffectivePrice)
    : 0;
  const rawBasePrice = singleUnitLabor * effectiveSquadSize;

  const bulkDiscount = formData.isBulkOrder ? Math.round(rawBasePrice * 0.15) : 0;
  const totalEstimated = Math.max(0, rawBasePrice - bulkDiscount);
  const workerWage = Math.round(totalEstimated * (workerWagePct / 100));
  const coopFee = Math.round(totalEstimated * (platformUpkeepPct / 100)); // Local Society Reserve
  const platformFee = Math.round(totalEstimated * (welfareFundPct / 100)); // Cooperative Welfare Fund

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Clean Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{t('policeVerifiedBadge', 'Certified & Verified Cooperative Artisans')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('btnBookNow', 'Book a Service')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('heroSubtitle', 'Guaranteed 93-2-5 fair wage cooperative dispatch with verified local artisans')}
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs self-start md:self-auto"
          >
            <Layers size={15} className="text-emerald-600" />
            <span>{t('viewServices', 'View Catalog & Tariffs')}</span>
          </Link>
        </div>
      </div>

      {/* Clean Step Progress Bar */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
          {/* Background Connecting Track */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-[#0F294A] transition-all duration-500 -z-0"
            style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
            }}
          />

          {[
            { step: 1, title: t('step1_title', 'Select Service'), subtitle: t('step1_sub', 'Choose repair issue') },
            { step: 2, title: t('step2_title', 'Location & Date'), subtitle: t('step2_sub', 'Address & schedule') },
            { step: 3, title: t('step3_title', 'Confirmation'), subtitle: t('step3_sub', 'Review & dispatch') },
          ].map(({ step, title, subtitle }) => {
            const isDone = currentStep > step;
            const isCurrent = currentStep === step;

            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (step < currentStep) setCurrentStep(step);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-emerald-200 cursor-pointer hover:bg-emerald-700'
                      : isCurrent
                      ? 'bg-[#0F294A] text-white ring-4 ring-blue-100 shadow-blue-950/20 scale-110 cursor-default'
                      : 'bg-white text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {isDone ? <Check size={16} className="stroke-[3]" /> : step}
                </button>
                <div className="text-center mt-2">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-slate-900' : isDone ? 'text-emerald-800' : 'text-slate-400'
                    }`}
                  >
                    {title}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">
                    {subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: PROBLEM SEARCH & SERVICE SELECTION (Minimal & Fast)
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {/* Clean Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Select Service & Repair Issue</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Type your problem (e.g. tap leaking, fan sparking) or choose a trade category below
              </p>
            </div>
            {selectedService && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shrink-0 shadow-2xs">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Selected: <strong>{selectedService.name}</strong> (₹{selectedService.base_price})</span>
              </div>
            )}
          </div>

          {/* Minimal Smart Search Input */}
          <div className="space-y-2.5">
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().length > 1) {
                    handleProblemMatch(val);
                  } else if (!val.trim()) {
                    setMatchedDiagnosis(null);
                  }
                }}
                placeholder="Type your repair issue (e.g. tap leaking, fan not working, AC gas, switch sparking, drain blocked)..."
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F294A] transition shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMatchedDiagnosis(null);
                  }}
                  className="absolute right-3 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-200/60 hover:bg-slate-200 rounded-lg font-medium transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick 1-Click Problem Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Common:
              </span>
              {symptomPresets.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleProblemMatch(item.query, item);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0F294A] hover:border-blue-300 border border-slate-200/80 text-xs font-semibold whitespace-nowrap transition-all shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Matched Diagnosis Banner (Only shown when issue matched) */}
          {matchedDiagnosis && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50/60 border border-emerald-300/80 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={16} className="stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Matched Issue:</span>
                    <strong className="text-slate-900 text-sm">{matchedDiagnosis.serviceName}</strong>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      {matchedDiagnosis.trade}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 font-mono">
                      • Base Tariff: ₹{selectedService?.base_price}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Recommended Standard Parts: <strong className="text-slate-800">{matchedDiagnosis.likelyParts}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-[#0F294A] hover:bg-[#153A68] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
              >
                <span>Continue with this Service</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'Appliance Repair', label: '❄️ AC & Appliances' },
              { id: 'Electrical', label: '⚡ Electrical' },
              { id: 'Plumbing', label: '🚰 Plumbing' },
              { id: 'Carpentry', label: '🔨 Carpentry' },
              { id: 'Painting', label: '🎨 Painting' },
              { id: 'Cleaning', label: '🧹 Cleaning & Pest' },
              { id: 'Emergency Services', label: '🚨 60-Min Emergency' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryTab === tab.id
                    ? 'bg-[#0F294A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Grid Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {searchQuery ? `Matching Services for "${searchQuery}" (${filteredServices.length})` : `Available Standard Services (${filteredServices.length})`}
            </h3>
            {(searchQuery || selectedCategoryTab !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryTab('ALL');
                  setMatchedDiagnosis(null);
                }}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Filtered Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredServices.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              const isEmergency = svc.category === 'Emergency Services';

              return (
                <div
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc);
                    setMatchedDiagnosis({
                      serviceName: svc.name,
                      trade: svc.category,
                      likelyParts: getLikelyPartsForTrade(svc.category, svc.name),
                      standardTariff: `Cooperative Regulated • ₹${svc.base_price}`,
                    });
                    if (isEmergency) {
                      setFormData((prev) => ({ ...prev, isEmergency: true }));
                    }
                  }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0F294A] bg-blue-50/70 ring-2 ring-[#0F294A] shadow-md scale-[1.01]'
                        : isEmergency
                        ? 'border-red-200 bg-red-50/30 hover:border-red-400 hover:shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                          {svc.category}
                        </span>
                        {svc.is_complex ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                            Master Paired
                          </span>
                        ) : null}
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 mb-1">{svc.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{svc.description}</p>
                    </div>

                    <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`text-[11px] font-medium ${(svc.available_workers ?? 0) > 0 ? 'text-slate-500' : 'text-amber-600'}`}>
                        {svc.available_workers ?? 0} {t('verifiedArtisans')}
                      </span>
                      <span className="font-black text-[#0F294A] text-sm font-mono">₹{svc.base_price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          <div className="pt-3 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {selectedService ? (
                <>Selected: <strong className="text-blue-950">{selectedService.name}</strong> (₹{selectedService.base_price})</>
              ) : 'Please select a service above'}
            </span>

            <button
              type="button"
              disabled={!selectedService}
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary flex items-center gap-2 text-xs font-bold px-6 py-2.5 shadow-sm disabled:opacity-50"
            >
              <span>{t('btnContinueQuote')}</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: QUOTE, BULK CONTRACT & SLOTTING
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Step 2: Service Configuration & Schedule</span>
              <h2 className="text-lg font-bold text-gray-900">Configure Service Order & Schedule</h2>
              <p className="text-xs text-gray-500">Service: <strong className="text-blue-950">{selectedService?.name}</strong> (₹{selectedService?.base_price})</p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-900 hover:underline font-semibold"
            >
              Change Service
            </button>
          </div>

          <form onSubmit={handleStep2Next} className="space-y-4">
            {/* Bulk / Society Contract Discount Toggle & Dynamic Worker Headcount */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="bulk-toggle"
                  checked={formData.isBulkOrder}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      isBulkOrder: isChecked,
                      squadSize: isChecked ? (Number(prev.squadSize) > 1 ? prev.squadSize : 2) : 1,
                    }));
                  }}
                  className="h-4 w-4 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="bulk-toggle" className="cursor-pointer">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-700" />
                    Institutional / Apartment Society Bulk Contract (15% Cooperative Discount)
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Check this for residential society bulk maintenance or institutional facility orders to automatically apply the state cooperative master contract discount.
                  </p>
                </label>
              </div>

              {/* Workers Needed - Activated strictly upon institutional booking selection */}
              {formData.isBulkOrder && (
                <div className="pt-3 border-t border-indigo-200/80 space-y-2">
                  <label htmlFor="workers-needed" className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-700" />
                    How many workers needed? *
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-full sm:w-44">
                      <input
                        id="workers-needed"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.squadSize}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '') {
                            setFormData((prev) => ({ ...prev, squadSize: '' }));
                          } else {
                            const val = parseInt(raw, 10);
                            setFormData((prev) => ({
                              ...prev,
                              squadSize: isNaN(val) ? '' : Math.max(1, Math.min(100, val)),
                            }));
                          }
                        }}
                        onBlur={() => {
                          if (!formData.squadSize || Number(formData.squadSize) < 1) {
                            setFormData((prev) => ({ ...prev, squadSize: 1 }));
                          }
                        }}
                        placeholder="Enter count (e.g. 5)"
                        className="w-full pl-3.5 pr-16 py-2 bg-white text-slate-900 border border-indigo-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-xs"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                        workers
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                      Enter the required artisan deployment headcount. Cooperative federation will dispatch a synchronized squad with fair rotational allocation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Priority Toggle */}
            <div
              className={`p-4 rounded-xl border transition flex items-start gap-3 ${
                formData.isEmergency
                  ? 'bg-red-50 border-red-300 ring-1 ring-red-400'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <input
                type="checkbox"
                id="emergency-toggle"
                checked={formData.isEmergency}
                onChange={(e) => handleEmergencyToggle(e.target.checked)}
                className="h-4 w-4 mt-0.5 text-red-600 rounded focus:ring-red-500 border-gray-300"
              />
              <label htmlFor="emergency-toggle" className="cursor-pointer">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Zap size={14} className="text-red-600 fill-red-600 animate-pulse" />
                  24/7 Priority Emergency (Express 60-Minute Dispatch)
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Instant priority dispatch to on-duty rapid response squad for high-risk water bursts, short-circuits, or safety hazards within the immediate 60-minute window.
                </p>
              </label>
            </div>

            {/* Quick Pick from Saved Addresses (Customer only) */}
            {savedAddresses.length > 0 && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-600" />
                    Quick Pick from Saved Addresses
                  </span>
                  <Link
                    to="/customer/addresses"
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                  >
                    Manage Address Book →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = formData.address === addr.full_address;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            district: addr.district || prev.district,
                            city: addr.city || prev.city,
                            address: addr.full_address,
                            pincode: addr.pincode || prev.pincode,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-2 cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-[#0F294A] text-white border-[#0F294A] ring-2 ring-blue-300 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        {addr.label === 'Home' ? (
                          <Home size={13} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        ) : addr.label === 'Office' ? (
                          <Building2 size={13} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        ) : addr.label === 'Work Site' ? (
                          <Briefcase size={13} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        ) : (
                          <MapPin size={13} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        )}
                        <span className="font-bold">{addr.label}</span>
                        <span className="text-[10px] opacity-75 max-w-[150px] sm:max-w-[220px] truncate">
                          {addr.full_address}
                        </span>
                        {!!addr.is_default && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            isSelected ? 'bg-blue-800 text-blue-100' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Default
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    District *
                  </label>
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition shadow-2xs cursor-pointer"
                    title="Detect GPS Current Location"
                  >
                    <LocateFixed size={12} className={isDetectingLocation ? 'animate-spin text-blue-700' : 'text-blue-700'} />
                    <span>{isDetectingLocation ? 'Detecting...' : isUsingCurrentLocation ? '📍 Current Location' : 'Current Location'}</span>
                  </button>
                </div>
                <select
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs bg-white font-medium"
                >
                  <option value="Khordha">Khordha (Bhubaneswar Metro)</option>
                  <option value="Cuttack">Cuttack District</option>
                  <option value="Puri">Puri Coastal Heritage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  City / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saheed Nagar, Patia, Badambadi, Grand Road"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Street Address / Flat / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 42, Near Cooperative Bank / DAV Public School"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 751001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Preferred Date {formData.isEmergency && <span className="text-red-600 font-bold">(Immediate Express Dispatch)</span>}
                </label>
                <input
                  type="date"
                  disabled={formData.isEmergency}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:outline-hidden text-xs ${
                    formData.isEmergency
                      ? 'bg-red-50/50 border-red-300 text-red-950 font-bold cursor-not-allowed'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-900'
                  }`}
                />
                {formData.isEmergency && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                    ⚡ Date locked to Today for 24/7 Priority Emergency Dispatch
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Preferred Time Slot {formData.isEmergency && <span className="text-red-600 font-bold">(60-Min Rapid Window)</span>}
                </label>
                {formData.isEmergency ? (
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full p-2.5 border border-red-400 bg-red-50 rounded-md focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-bold text-red-950 shadow-xs"
                  >
                    <option value={formData.scheduledTime}>
                      ⚡ {formData.scheduledTime.includes('Express') ? formData.scheduledTime : getEmergencyTimeWindow()}
                    </option>
                  </select>
                ) : (
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs bg-white"
                  >
                    <option value="09:00 AM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                    <option value="06:00 PM">Evening (06:00 PM - 08:00 PM)</option>
                  </select>
                )}
                {formData.isEmergency && (
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                    ⚡ Artisan mobilized within this exact 60-minute emergency window
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Specific Notes or Appliance Brand Details
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Daikin Inverter AC, leaking from indoor unit tray..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-xs resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2 text-xs font-bold"
              >
                Continue to Review & Broadcast <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: REVIEW ORDER & BROADCAST DISPATCH
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Step 3: Smart Broadcast Dispatch & Transparent Escrow Tariff
              </span>
              <h2 className="text-lg font-bold text-gray-900">Review Order & Confirm Broadcast Dispatch</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Service request will be broadcasted to all nearby verified artisans in {formData.district}. The first artisan who accepts claims the work order.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRouteMap(!showRouteMap)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer ${
                showRouteMap
                  ? 'bg-blue-900 text-white border border-blue-800'
                  : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Navigation size={13} className={showRouteMap ? 'rotate-45 text-white' : 'text-blue-300'} />
              <span>{showRouteMap ? 'Hide Locality Radar' : '🗺️ View Nearby Artisan Radar'}</span>
            </button>
          </div>

          {/* Policy Banner: Zero Authority to choose worker */}
          <div className="p-4 bg-blue-50/80 rounded-2xl border-2 border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 font-bold">
                ⚖️
              </div>
              <div>
                <div className="font-bold text-blue-950 text-sm">Fair Cooperative Broadcast Policy Active</div>
                <p className="text-blue-900/80 text-[11px] mt-0.5 leading-relaxed">
                  To prevent artisan monopolization and ensure rapid dispatch, customers do not choose specific workers. Your request is broadcasted simultaneously to all certified cooperative artisans in your area. The first available artisan to accept will be immediately assigned.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-extrabold uppercase shrink-0 whitespace-nowrap self-start sm:self-center">
              First-to-Accept Dispatch
            </span>
          </div>

          {/* Interactive Locality Radar Map */}
          {showRouteMap && (
            <LiveRouteMap
              worker={recommendedWorkers[0] || {
                name: 'Nearby Cooperative Artisans',
                tier: 'MASTER',
                distanceKm: 2.5,
                etaMinutes: 10,
                service_area: formData.district,
              }}
              customerAddress={`${formData.address}, ${formData.city}`}
              customerCoords={customerCoords}
              allNearbyWorkers={recommendedWorkers}
              title={`Nearby Verified Artisans Radar (${recommendedWorkers.length} ${recommendedWorkers.length === 1 ? 'Artisan' : 'Artisans'} in Local Area)`}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Order Summary */}
            <div className="space-y-3.5 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                <div className="font-bold text-sm text-gray-900 flex items-center justify-between">
                  <span>{selectedService?.name}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                    {selectedService?.category}
                  </span>
                </div>
                <div className="text-gray-600">{selectedService?.description}</div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {formData.isBulkOrder && effectiveSquadSize > 1 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                      👥 Institutional Squad: {effectiveSquadSize} Artisans
                    </span>
                  )}
                  <span className="text-[11px] text-blue-950 font-medium bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200 inline-flex items-center gap-1">
                    🏛️ Cooperative Society: Assigned automatically upon artisan acceptance
                  </span>
                </div>
                {formData.isBulkOrder && (
                  <div className="text-indigo-700 font-bold text-[11px]">
                    ✓ Bulk Society Master Contract Discount Applied (-15%)
                  </div>
                )}
                {formData.isEmergency && (
                  <div className="text-red-700 font-bold flex items-center gap-1 text-[11px]">
                    <Zap size={13} /> 24/7 Priority Emergency Active (60-Min Response)
                  </div>
                )}
              </div>

              {/* Broadcast Target Pool */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio size={14} className="text-emerald-700 animate-pulse" />
                    <span>Broadcast Target: {formData.district} Artisan Network</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Live Pool
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Broadcast notification will pop up on the screens of all active, verified {selectedService?.category || 'trade'} artisans within {formData.city} and {formData.district}.
                </p>
              </div>

              {/* Destination & Schedule */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-900" /> Destination & Schedule
                </div>
                <div className="text-gray-800 font-semibold">{formData.address}</div>
                <div className="text-gray-500">{formData.city}, {formData.district} - {formData.pincode}</div>
                <div className="text-gray-600 pt-1 font-medium">📅 {formData.scheduledDate} at {formData.scheduledTime}</div>
                {formData.notes && (
                  <div className="text-gray-500 pt-1 text-[11px] italic">Notes: "{formData.notes}"</div>
                )}
              </div>
            </div>

            {/* Right: Transparent Cooperative Tariff Split */}
            <div className="p-6 bg-blue-950 text-white rounded-2xl flex flex-col justify-between shadow-md">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Transparent Cooperative Tariff Split ({workerWagePct}-{welfareFundPct}-{platformUpkeepPct})
                </div>

                <div className="space-y-2.5 text-xs border-b border-white/15 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">
                      {formData.isBulkOrder && effectiveSquadSize > 1
                        ? `Regulated Institutional Tariff (${effectiveSquadSize} Artisans):`
                        : 'Regulated Base Tariff:'}
                    </span>
                    <span className="font-bold font-mono">₹{rawBasePrice}</span>
                  </div>
                  {formData.isBulkOrder && (
                    <div className="flex justify-between text-indigo-300">
                      <span>Society Contract Discount (15%):</span>
                      <span className="font-bold font-mono">-₹{bulkDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-300">
                    <span>{workerWagePct}% Direct Artisan Pay:</span>
                    <span className="font-bold font-mono">₹{workerWage}</span>
                  </div>
                  <div className="flex justify-between text-blue-300">
                    <span>{welfareFundPct}% Welfare & Social Security Fund:</span>
                    <span className="font-bold font-mono">₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>{platformUpkeepPct}% Local Cooperative Reserve:</span>
                    <span className="font-bold font-mono">₹{coopFee}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-base font-bold mb-3">
                  <span>Total Regulated Fee:</span>
                  <span className="text-2xl text-amber-400 font-mono">₹{totalEstimated}</span>
                </div>

                <div className="text-[10px] text-blue-200 bg-white/10 p-2.5 rounded-lg leading-relaxed space-y-1">
                  <div>• {workerWagePct}% deposited directly to artisan bank/wallet upon OTP verification.</div>
                  <div>• {welfareFundPct}% welfare fund for accident insurance & occupational cover.</div>
                  <div>• {platformUpkeepPct}% local cooperative reserve for tool subsidies & training.</div>
                  <div>• <strong>Doorstep Transit Protection:</strong> If cancelled post-dispatch, ₹50 is credited to the artisan.</div>
                  <div>• 30-Day Free Workmanship Warranty included automatically.</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {!isAuthenticated ? (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">You must be signed in to confirm your booking.</p>
                    <Link
                      to="/login"
                      className="btn btn-primary btn-sm font-bold text-xs inline-block"
                    >
                      Login to Book
                    </Link>
                  </div>
                ) : (
                  <button
                    disabled={loading}
                    onClick={handleConfirmBooking}
                    className="w-full btn btn-saffron py-3.5 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-amber-400 text-blue-950 transition"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-950 border-t-transparent" />
                        Broadcasting Request...
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> 📢 Confirm & Broadcast Service Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={14} /> Back to Schedule
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: SUCCESS WITH BROADCAST STATUS & OTPS
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 4 && createdBooking && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-sm max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                Broadcast Active
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">Service Request Broadcasted!</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Reference Code: <strong className="font-mono text-blue-950">{createdBooking.booking_code}</strong>
              </p>
            </div>
          </div>

          {/* Status & Artisan / Cooperative Details */}
          {!createdBooking.arrival_otp ? (
            <div className="p-5 bg-amber-50/90 rounded-2xl border border-amber-300 text-amber-950 space-y-3 max-w-lg mx-auto text-center shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping inline-block" />
                <span>Awaiting Artisan Acceptance</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-amber-950">
                  Cooperative Society & Security OTP Locked
                </h3>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  Your service order is currently broadcasting to nearby certified artisans in <strong>{createdBooking.location_city || formData.city}</strong>. The moment an artisan accepts, their <strong>registered Cooperative Society</strong> and your confidential <strong>Security Arrival OTP</strong> will be revealed right here.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <Radio size={13} className="text-amber-600 animate-pulse" />
                <span>Listening for artisan claim (updates automatically)...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg mx-auto">
              {/* Assigned Artisan & Cooperative Details Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-950 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Artisan Accepted & Assigned!
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    {createdBooking.worker_code || 'COOP-ARTISAN'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/70 text-[11px]">
                  <div>
                    <span className="text-emerald-700 block font-semibold">Assigned Artisan:</span>
                    <strong className="text-emerald-950 text-xs">{createdBooking.worker_name}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block font-semibold">Registered Cooperative:</span>
                    <strong className="text-emerald-950 text-xs">{createdBooking.cooperative_name || 'Labour Cooperative Society'}</strong>
                  </div>
                </div>
              </div>

              {/* OTP Cards for Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Arrival OTP</span>
                  <div className="text-2xl font-extrabold font-mono text-blue-950 mt-1 tracking-wider">
                    {createdBooking.arrival_otp}
                  </div>
                  <span className="text-[9px] text-gray-500">Give upon artisan arrival</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">Completion OTP</span>
                  <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-1 tracking-wider">
                    {createdBooking.completion_otp}
                  </div>
                  <span className="text-[9px] text-gray-500">Give after work is finished</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Dispatch & Route Map */}
          <LiveRouteMap
            worker={{
              name: 'Cooperative Artisan Broadcast',
              tier: 'MASTER',
              distanceKm: 2.5,
              etaMinutes: 10,
              service_area: formData.district,
            }}
            customerAddress={`${formData.address}, ${formData.city}`}
            customerCoords={customerCoords}
            title="Locality Proximity & Cooperative Broadcast Telemetry"
          />

          <div className="flex justify-center gap-3 pt-2">
            <Link
              to={`/customer/bookings/${createdBooking.id}`}
              className="btn btn-primary font-semibold text-xs flex items-center gap-1.5"
            >
              <Navigation size={14} />
              <span>Full Booking Timeline & Order →</span>
            </Link>
            <Link
              to="/customer/bookings"
              className="btn btn-secondary font-semibold text-xs"
            >
              My Bookings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
