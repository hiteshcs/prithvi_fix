import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Droplets, Hammer, Paintbrush, SprayCan, Flower2,
  HeartPulse, Car, Wrench, Home as HomeIcon, Settings, AlertTriangle,
  Search, ArrowRight, ShieldCheck, CheckCircle2, Clock,
  Mic, MicOff, IndianRupee, X, Snowflake, Wind, Layers,
  MapPin, Building2, ChevronDown, Check, Sparkles, PhoneCall, Calendar,
  BarChart3, Info, SlidersHorizontal, CheckSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';
import CivicLoader from '../components/CivicLoader';
import { getProcessStepsForService } from '../utils/serviceProcessData';

const ICON_MAP = {
  Zap, Droplets, Hammer, Paintbrush, SprayCan, Flower2,
  HeartPulse, Car, Wrench, Home: HomeIcon, Settings, AlertTriangle,
  Snowflake, Wind
};

const CATEGORY_ICON_MAP = {
  'Electrical': Zap,
  'Plumbing': Droplets,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Cleaning': SprayCan,
  'Appliance Repair': Wind,
  'AC & Appliance Repair': Snowflake,
  'Gardening': Flower2,
  'Caregiving': HeartPulse,
  'Driving & Transport': Car,
  'Emergency Services': AlertTriangle,
};

const DISTRICT_CONFIG = {
  ALL: { name: 'All Odisha Districts', tag: 'Statewide Cooperative Federation', dco: 'Odisha State Apex Federation' },
  Khordha: { name: 'Khordha (Bhubaneswar Metro)', tag: '4 Active Municipal Clusters', dco: 'Shri Debendra Nayak (DCO Khordha)' },
  Cuttack: { name: 'Cuttack District', tag: '4 Active Municipal Clusters', dco: 'Smt. Laxmi Devi (DCO Cuttack)' },
  Puri: { name: 'Puri Coastal Heritage', tag: '4 Active Coastal Clusters', dco: 'Shri Alok Mohapatra (DCO Puri)' },
};

export default function Services() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  // Global Location Context
  const {
    locations,
    selectedLocation,
    selectedAreaId,
    changeLocation,
    isUsingCurrentLocation,
    detectCurrentLocation,
    unsupportedLocation,
  } = useLocationContext();

  const activeLocation = selectedLocation;

  // Primary Data
  const [services, setServices] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Location Selection
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [complexityFilter, setComplexityFilter] = useState('ALL'); // 'ALL' | 'STANDARD' | 'COMPLEX'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Modals
  const [tariffModalService, setTariffModalService] = useState(null);
  const [processModalService, setProcessModalService] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Synchronize URL query params with state and global LocationContext
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search') || searchParams.get('q');
    const dist = searchParams.get('district');
    const area = searchParams.get('area_id');
    if (cat) setSelectedCategory(cat);
    if (q) setSearchQuery(q);
    if (dist) setSelectedDistrict(dist);
    if (area && Number(area) !== selectedAreaId) {
      changeLocation(Number(area));
    }
  }, [searchParams]);

  // Fetch Services whenever district or selectedAreaId changes
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedDistrict && selectedDistrict !== 'ALL') {
      params.district = selectedDistrict;
    }
    if (selectedAreaId) {
      params.area_id = selectedAreaId;
    }

    Promise.all([
      api.getServices(params).catch((err) => {
        console.error('Failed to load services:', err);
        return { services: [] };
      }),
      api.getSocietiesList().catch((err) => {
        console.error('Failed to load societies:', err);
        return { societies: [] };
      }),
    ])
      .then(([servicesRes, societiesRes]) => {
        setServices(servicesRes.services || []);
        setSocieties(societiesRes.societies || []);
      })
      .finally(() => setLoading(false));
  }, [selectedDistrict, selectedAreaId]);

  // Switch location handler
  const handleAreaSelect = (loc) => {
    changeLocation(loc.id);
    if (selectedDistrict !== 'ALL' && selectedDistrict.toLowerCase() !== loc.district.toLowerCase()) {
      setSelectedDistrict(loc.district);
    }
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('area_id', String(loc.id));
      p.set('district', loc.district);
      return p;
    });
  };

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (districtName === 'ALL') p.delete('district');
      else p.set('district', districtName);
      return p;
    });
    if (districtName !== 'ALL') {
      const match = locations.find((l) => l.district.toLowerCase() === districtName.toLowerCase());
      if (match) {
        changeLocation(match.id);
      }
    }
  };

  // Distinct categories with count
  const categoryStats = useMemo(() => {
    const map = {};
    services.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + 1;
    });
    return map;
  }, [services]);

  const categories = useMemo(() => {
    return ['ALL', ...Object.keys(categoryStats).sort()];
  }, [categoryStats]);

  const availableDistricts = useMemo(() => {
    const list = Array.from(new Set(locations.map((l) => l.district).filter(Boolean)));
    return list.length > 0 ? list : ['Khordha', 'Cuttack', 'Puri'];
  }, [locations]);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'HI' ? 'hi-IN' : lang === 'OR' ? 'or-IN' : lang === 'BN' ? 'bn-IN' : lang === 'TE' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;

    setIsListeningMic(true);
    recognition.onresult = (event) => {
      setSearchQuery(event.results[0][0].transcript);
      setIsListeningMic(false);
    };
    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);
    recognition.start();
  };

  // Filter & Sort Logic
  const filteredAndSortedServices = useMemo(() => {
    let result = services.filter((s) => {
      // Category filter
      const matchesCategory = selectedCategory === 'ALL' || s.category.toLowerCase() === selectedCategory.toLowerCase();

      // Complexity filter
      let matchesComplexity = true;
      if (complexityFilter === 'STANDARD') {
        matchesComplexity = !s.is_complex;
      } else if (complexityFilter === 'COMPLEX') {
        matchesComplexity = Boolean(s.is_complex);
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory && matchesComplexity;

      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);

      return matchesCategory && matchesComplexity && matchesSearch;
    });

    // Sorting
    if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => (Number(a.price || a.base_price) || 0) - (Number(b.price || b.base_price) || 0));
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => (Number(b.price || b.base_price) || 0) - (Number(a.price || a.base_price) || 0));
    } else if (sortBy === 'WORKERS') {
      result.sort((a, b) => (b.available_workers ?? 0) - (a.available_workers ?? 0));
    } else if (sortBy === 'EMERGENCY') {
      result.sort((a, b) => (b.category === 'Emergency Services' ? 1 : 0) - (a.category === 'Emergency Services' ? 1 : 0));
    } else if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [services, selectedCategory, complexityFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & MODE SWITCHER
         ───────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Institutional Cooperative Directory • Regulated Rates</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Service Catalog & Area-Wise Tariffs
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
              Fair, transparent cooperative pricing with modest area adjustments for local logistics. Backed by 93% direct artisan wage guarantee and 30-day workmanship warranty.
            </p>
          </div>

          {/* Unified Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start md:self-auto shadow-inner">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-900 shadow-sm font-bold border border-slate-200/60">
              <Layers size={15} className="text-emerald-600" />
              <span>Catalog & Area Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unsupported Location (Coming Soon) Notification Banner */}
      {unsupportedLocation && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
              <MapPin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-sm text-slate-900">
                  Cooperative Services Not Yet Operational in {unsupportedLocation.name}
                </h4>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  Expansion Coming Soon
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Prithvi Fix currently operates in Khordha (Bhubaneswar), Cuttack, and Puri districts. Artisans in {unsupportedLocation.name} ({unsupportedLocation.district}) are undergoing federation onboarding. Displaying standardized base rates from our active hubs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => changeLocation(1)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-2xs text-center shrink-0 cursor-pointer"
          >
            Switch to Bhubaneswar Hub
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORY ARRANGEMENT & SEARCH BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 mb-8">
        {/* Search & Sort Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('searchServicesPlaceholder') || 'Search 47 services by trade, symptom (e.g. ac jet cleaning, switchboard, geyser, pipe leak)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition ${
                isListeningMic ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-blue-900'
              }`}
              title={t('voiceSearchTitle') || 'Search by voice'}
            >
              {isListeningMic ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Complexity Filter */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setComplexityFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                complexityFilter === 'ALL' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Jobs
            </button>
            <button
              type="button"
              onClick={() => setComplexityFilter('STANDARD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                complexityFilter === 'STANDARD' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Routine
            </button>
            <button
              type="button"
              onClick={() => setComplexityFilter('COMPLEX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                complexityFilter === 'COMPLEX' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Specialist
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            >
              <option value="RECOMMENDED">✨ Recommended</option>
              <option value="PRICE_LOW">₹ Price: Low to High</option>
              <option value="PRICE_HIGH">₹ Price: High to Low</option>
              <option value="WORKERS">👷 Artisan Availability</option>
              <option value="NAME">🔤 Name (A-Z)</option>
              <option value="EMERGENCY">⚡ Emergency Priority</option>
            </select>
          </div>
        </div>

        {/* Organized Category Tabs with Icons & Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'ALL' ? services.length : (categoryStats[cat] || 0);
            const CatIcon = cat === 'ALL' ? Layers : (CATEGORY_ICON_MAP[cat] || Settings);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-2xl whitespace-nowrap font-bold transition flex items-center gap-2 text-xs shrink-0 border ${
                  isSelected
                    ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <CatIcon size={14} className={isSelected ? 'text-amber-400' : 'text-slate-500'} />
                <span>{cat === 'ALL' ? 'All Services' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SERVICES CATALOG GRID WITH AREA PRICES
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <CivicLoader
          variant="card"
          title="Updating Cooperative Rates..."
          subtitle={`Applying ${activeLocation ? activeLocation.name : 'Selected Area'} regulated multipliers`}
        />
      ) : filteredAndSortedServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Services Found Matching Filters</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, clearing category filters, or switching complexity levels.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setComplexityFilter('ALL');
              setSearchQuery('');
              setSelectedDistrict('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredAndSortedServices.length}</strong> services for{' '}
              <strong className="text-blue-950">{activeLocation?.name}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Prices rounded to clean ₹5 increments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedServices.map((service) => {
              const IconComponent = ICON_MAP[service.icon] || Settings;
              const isEmergency = service.category === 'Emergency Services';
              const effectivePrice = Number(service.base_price) || Number(service.price) || 299;
              const basePrice = effectivePrice;
              const priceDiff = Number(service.price_diff) || 0;
              const workerWage = Number(service.worker_wage) || Math.round(effectivePrice * 0.93);

              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isEmergency
                      ? 'border-red-300 ring-1 ring-red-200'
                      : 'border-slate-200/90 hover:border-blue-700'
                  }`}
                >
                  {isEmergency && (
                    <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 flex items-center justify-between uppercase tracking-wider">
                      <span>⚡ Priority Emergency Dispatch</span>
                      <span className="bg-white/20 px-1.5 rounded">&lt; 60 Mins</span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Top Row: Icon + Category Badge + 93-2-5 Trigger */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          isEmergency ? 'bg-red-100 text-red-700' : 'bg-blue-950 text-amber-300'
                        }`}
                      >
                        <IconComponent size={24} />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                          {service.category}
                        </span>
                        {service.is_complex ? (
                          <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800">
                            Specialist Task
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                            Routine Task
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service Name & Scope */}
                    <h3 className="font-extrabold text-gray-900 text-base mb-1 leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Price Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Base Price:
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-blue-950 font-mono tracking-tight">
                              ₹{effectivePrice}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              /{service.price_unit?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                          Fixed Rate
                        </span>
                      </div>

                      {/* 93% Artisan Wage Micro-Bar */}
                      <div className="border-t border-slate-200/70 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={11} /> 93% Worker Take-Home:
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          ₹{workerWage}
                        </span>
                      </div>
                    </div>

                    {/* Split Details */}
                    <div className="flex items-center justify-end text-xs text-gray-500 pt-1">
                      <button
                        type="button"
                        onClick={() => setTariffModalService(service)}
                        className="text-[10px] text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Info size={11} /> Split Details
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setProcessModalService(service)}
                      className="text-xs text-blue-950 hover:text-blue-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                      title="View step-by-step certified work process"
                    >
                      <span>Process</span>
                      <ArrowRight size={13} className="text-amber-500 stroke-[2.5]" />
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/book-service?serviceId=${service.id}&district=${encodeURIComponent(
                            activeLocation?.district || selectedDistrict
                          )}&area_id=${activeLocation?.id || selectedAreaId}`
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer ${
                        isEmergency
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-950 hover:bg-blue-900 text-white'
                      }`}
                    >
                      {isEmergency ? 'Emergency SOS' : 'Book Service'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. AREA TARIFF COMPARISON MODAL (TRANSPARENCY GUARANTEE)
         ───────────────────────────────────────────────────────────── */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                  Institutional Transparency Standard
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Compare Regulated Tariffs Across All 12 Cooperative Areas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  See how modest variations (-4% to +6%) apply across Khordha, Cuttack, and Puri districts.
                </p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Cooperative tariffs are indexed by the District Cooperative Office (DCO) to ensure artisans are fairly compensated for local travel overhead, multistory access, and coastal anti-rusting equipment without burdening citizens.
              </p>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">District</th>
                      <th className="p-3">Area / Ward Cluster</th>
                      <th className="p-3">PIN</th>
                      <th className="p-3">Tariff Index</th>
                      <th className="p-3">Economic Driver / Justification</th>
                      <th className="p-3">Sample Rate (AC Gas Base ₹1,499)</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {locations.map((loc) => {
                      const diff = Math.round((loc.multiplier - 1) * 100);
                      const samplePrice = Math.round((1499 * loc.multiplier) / 5) * 5;
                      const isCurrent = loc.id === selectedAreaId;

                      return (
                        <tr
                          key={loc.id}
                          className={`hover:bg-slate-50 transition ${
                            isCurrent ? 'bg-amber-50/70 font-semibold' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-900">{loc.district}</td>
                          <td className="p-3 text-slate-800">
                            {loc.name}
                            {isCurrent && (
                              <span className="ml-1.5 text-[9px] bg-amber-200 text-slate-900 px-1.5 py-0.2 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-500">{loc.pincode}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                diff > 0
                                  ? 'bg-amber-100 text-amber-900'
                                  : diff < 0
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-blue-100 text-blue-900'
                              }`}
                            >
                              {loc.multiplier}x ({diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : 'Base'})
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{loc.tag}</td>
                          <td className="p-3 font-mono font-bold text-blue-950">
                            ₹{samplePrice}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({samplePrice - 1499 > 0 ? `+₹${samplePrice - 1499}` : samplePrice - 1499 < 0 ? `-₹${Math.abs(samplePrice - 1499)}` : 'Base'})
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                handleAreaSelect(loc);
                                setShowComparisonModal(false);
                              }}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-950 text-white hover:bg-blue-900 transition"
                            >
                              Select Area
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. 93-2-5 TARIFF EXPLAINER MODAL
         ───────────────────────────────────────────────────────────── */}
      {tariffModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Cooperative 93-2-5 Standard</h3>
                  <div className="text-[11px] text-slate-500 font-medium">{tariffModalService.name}</div>
                </div>
              </div>
              <button
                onClick={() => setTariffModalService(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                Unlike commercial gig aggregators that deduct 25%–35% in hidden cuts, our Odisha cooperative federation ensures 93% of every rupee reaches the artisan's family:
              </p>

              {(() => {
                const currentPrice = tariffModalService.price || tariffModalService.base_price;
                const worker = tariffModalService.worker_wage || Math.round(currentPrice * 0.93);
                const welfare = tariffModalService.welfare_fund || Math.round(currentPrice * 0.02);
                const society = tariffModalService.society_fund || Math.round(currentPrice * 0.05);

                return (
                  <div className="space-y-2 font-mono">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                      <div>
                        <strong className="text-emerald-900 font-sans block">93% Direct Artisan Pay</strong>
                        <span className="text-[10px] text-emerald-700">Bank transfer upon customer OTP confirmation</span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-900">
                        ₹{worker}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
                      <div>
                        <strong className="text-blue-900 font-sans block">2% Social Security & Welfare</strong>
                        <span className="text-[10px] text-blue-700">Accident insurance & occupational safety cover</span>
                      </div>
                      <span className="text-sm font-extrabold text-blue-900">
                        ₹{welfare}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-between">
                      <div>
                        <strong className="text-purple-900 font-sans block">5% Local Cooperative Reserve</strong>
                        <span className="text-[10px] text-purple-700">Tool upgrades & training in {activeLocation?.name?.split('/')[0]}</span>
                      </div>
                      <span className="text-sm font-extrabold text-purple-900">
                        ₹{society}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Statutory Citizen Guarantees:</span>
                </div>
                <div className="text-slate-600">✓ Zero surge pricing during rains, rush hours, or holidays.</div>
                <div className="text-slate-600">✓ 30-Day Free Workmanship Warranty on all completed jobs.</div>
                <div className="text-slate-600">✓ Biometrically verified Aadhaar & police background checked artisans.</div>
              </div>
            </div>

            <button
              onClick={() => setTariffModalService(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. COOPERATIVE STANDARD OPERATING PROCESS (SOP) MODAL
         ───────────────────────────────────────────────────────────── */}
      {processModalService && (() => {
        const sop = getProcessStepsForService(processModalService);
        const effectivePrice = Number(processModalService.base_price) || Number(processModalService.price) || 299;
        const workerWage = Number(processModalService.worker_wage) || Math.round(effectivePrice * 0.93);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Cooperative Certified SOP
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {sop.categoryTag}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={11} /> {sop.estDuration}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                    {processModalService.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Step-by-step diagnostic, repair, and quality certification workflow.
                  </div>
                </div>
                <button
                  onClick={() => setProcessModalService(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 space-y-5 text-xs">
                {/* Active Area Price Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-300 block">
                      Base Price:
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold font-mono text-white">₹{effectivePrice}</span>
                      <span className="text-[11px] text-blue-200">/{processModalService.price_unit?.replace('_', ' ')}</span>
                      <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 font-medium">
                        93% Worker Pay: ₹{workerWage}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const svc = processModalService;
                      setProcessModalService(null);
                      navigate(
                        `/book-service?serviceId=${svc.id}&district=${encodeURIComponent(
                          activeLocation?.district || selectedDistrict
                        )}&area_id=${activeLocation?.id || selectedAreaId}`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Zap size={14} className="fill-white" />
                    <span>Book Service</span>
                  </button>
                </div>

                {/* Required Tools & Gear */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench size={13} className="text-blue-900" />
                    <span>Mandatory Artisan Equipment & Calibration Tools:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sop.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium border border-slate-200/80"
                      >
                        🔧 {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5-Step SOP Process Timeline */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Layers size={13} className="text-blue-900" />
                    <span>5-Step Standard Operating Procedure (SOP):</span>
                  </div>

                  <div className="space-y-3">
                    {sop.steps.map((st) => (
                      <div
                        key={st.step}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 transition-all space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {st.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-extrabold text-slate-900 text-sm">{st.title}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{st.desc}</p>
                          </div>
                        </div>

                        <div className="pl-10 grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60 text-[10.5px]">
                          {st.points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1 text-slate-700 font-medium">
                              <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality & Safety Guarantees */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 text-[11px]">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-700" />
                    <span>Statutory Citizen Guarantees Backing This Service:</span>
                  </div>
                  <div className="text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                    <div>✓ <strong>30-Day Free Warranty:</strong> Free re-inspection and rework.</div>
                    <div>✓ <strong>Zero Surge Guarantee:</strong> Transparent regulated tariffs.</div>
                    <div>✓ <strong>Biometric Verification:</strong> Police cleared cooperative guild.</div>
                    <div>✓ <strong>Arrival OTP Security:</strong> Work begins only after PIN match.</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                <Link
                  to={`/services/${processModalService.id}`}
                  className="text-xs text-blue-950 font-bold hover:underline flex items-center gap-1"
                >
                  <span>View Full Technical Specification Page</span>
                  <ArrowRight size={13} />
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setProcessModalService(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer flex-1 sm:flex-initial"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => {
                      const svc = processModalService;
                      setProcessModalService(null);
                      navigate(
                        `/book-service?serviceId=${svc.id}&district=${encodeURIComponent(
                          activeLocation?.district || selectedDistrict
                        )}&area_id=${activeLocation?.id || selectedAreaId}`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm flex-1 sm:flex-initial"
                  >
                    <span>Book Service (₹{effectivePrice})</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
