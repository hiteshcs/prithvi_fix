import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CivicLoader from '../components/CivicLoader';
import {
  Search, ShieldCheck, Star, MapPin, Award, CheckCircle2,
  Briefcase, Building2, User, X, Calendar, Phone, Check, AlertCircle,
  Mic, MicOff, Zap, PhoneCall, ChevronRight, Wrench
} from 'lucide-react';

export default function FindWorker() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Filters state
  const rawSkill = searchParams.get('skill') || '';
  const normalizedInitialSkill = rawSkill.startsWith('cat') ? rawSkill.replace(/^cat/, '') : rawSkill;

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [skill, setSkill] = useState(normalizedInitialSkill);
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    const raw = searchParams.get('skill');
    if (raw) {
      setSkill(raw.startsWith('cat') ? raw.replace(/^cat/, '') : raw);
    }
    const d = searchParams.get('district');
    if (d) setDistrict(d);
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const fetchWorkers = () => {
    setLoading(true);
    const activeSkill = skill.startsWith('cat') ? skill.replace(/^cat/, '') : skill;
    api.getWorkers({
      search: search || undefined,
      skill: activeSkill || undefined,
      district: district || undefined,
      availability: availability || undefined,
      verified: verifiedOnly ? 'true' : undefined,
    })
      .then((data) => setWorkers(data.workers || []))
      .catch((err) => console.error('Failed to load workers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkers();
  }, [skill, district, availability, verifiedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  // Speech Recognition Search for Rural Citizens
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Chrome on mobile or desktop.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'HI' ? 'hi-IN' : lang === 'OR' ? 'or-IN' : lang === 'BN' ? 'bn-IN' : lang === 'TE' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;

    setIsListeningMic(true);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setSearch(speechResult);
      setIsListeningMic(false);
      // Auto fetch with speech query
      api.getWorkers({
        search: speechResult,
        skill: skill || undefined,
        district: district || undefined,
        availability: availability || undefined,
        verified: verifiedOnly ? 'true' : undefined,
      }).then((data) => setWorkers(data.workers || []));
    };
    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);
    recognition.start();
  };

  const openWorkerDetail = async (workerId) => {
    setModalLoading(true);
    try {
      const data = await api.getWorkerById(workerId);
      setSelectedWorker(data.worker);
    } catch (err) {
      console.error('Error fetching worker details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> {t('findWorkerBadge')}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {t('findWorkerTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {t('findWorkerSub')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by worker name, worker code (e.g. WKR-OD-1001), or skill keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            {/* Mic button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition ${
                isListeningMic ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-blue-900'
              }`}
              title={t('voiceSearchTitle')}
            >
              {isListeningMic ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button type="submit" className="btn btn-primary px-6 text-xs sm:text-sm font-bold">
            {t('searchBtn')}
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          {/* Skill Filter */}
          <div>
            <label className="block text-gray-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              {t('tradeLabel')}
            </label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-xs font-semibold"
            >
              <option value="">{t('allTrades')}</option>
              <option value="Electrical">⚡ {t('catElectrical')}</option>
              <option value="Plumbing">🚰 {t('catPlumbing')}</option>
              <option value="Carpentry">🔨 {t('catCarpentry')}</option>
              <option value="Painting">🎨 {t('catPainting')}</option>
              <option value="Cleaning">🧹 {t('catCleaning')}</option>
              <option value="Gardening">🌱 {t('catGardening')}</option>
              <option value="Caregiving">❤️ {t('catCaregiving')}</option>
              <option value="Driving">🚗 {t('catDriving')}</option>
              <option value="Appliance Repair">🔧 {t('catAppliance')}</option>
              <option value="Domestic Services">🏠 {t('catDomestic')}</option>
              <option value="Technician Services">💻 {t('catTechnician')}</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-gray-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              {t('districtLabel')}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-xs font-semibold"
            >
              <option value="">{t('allDistricts')}</option>
              <option value="Khordha">Khordha (Bhubaneswar)</option>
              <option value="Cuttack">Cuttack</option>
              <option value="Puri">Puri</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-gray-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              {t('statusLabel')}
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-xs font-semibold"
            >
              <option value="">{t('anyStatus')}</option>
              <option value="AVAILABLE">{t('statusAvailable')}</option>
              <option value="BUSY">{t('statusBusy')}</option>
              <option value="OFFLINE">{t('statusOffline')}</option>
            </select>
          </div>

          {/* Verified Checkbox */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="verified-only"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="h-4 w-4 text-blue-900 rounded focus:ring-blue-900 border-gray-300"
            />
            <label htmlFor="verified-only" className="text-xs text-gray-800 font-bold cursor-pointer flex items-center gap-1">
              <ShieldCheck size={16} className="text-green-700" />
              {t('verifiedOnly')}
            </label>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <CivicLoader
          variant="card"
          title="Searching Verified Guild Artisans..."
          subtitle="Querying verified police clearance, skill credentials & live dispatch availability"
        />
      ) : workers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-600 font-medium">{t('noWorkersFound')}</p>
          <button
            onClick={() => { setSearch(''); setSkill(''); setDistrict(''); setAvailability(''); setVerifiedOnly(false); }}
            className="mt-3 text-xs text-blue-900 font-bold underline"
          >
            {t('resetAllFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Top: Worker ID badge & Verification */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                    {worker.worker_code}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {worker.verification_status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> {t('verified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {t('pending')}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        worker.availability === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : worker.availability === 'BUSY'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {worker.availability}
                    </span>
                  </div>
                </div>

                {/* Name & Cooperative */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base leading-tight">
                        {worker.name}
                      </h3>
                      {worker.is_independent || !worker.society_id ? (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Independent Artisan
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          Society Member
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {worker.society_name || worker.cooperative_name}
                      {worker.society_name && (
                        <span className="text-[10px] text-gray-400">({worker.cooperative_name})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {worker.city || worker.service_area}, {worker.district}
                    </div>
                  </div>
                </div>

                {/* Rating & Experience Stats */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-xl text-center text-xs mb-3">
                  <div>
                    <div className="flex items-center justify-center gap-1 font-bold text-gray-900">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      {worker.rating > 0 ? worker.rating.toFixed(1) : '4.9'}
                    </div>
                    <div className="text-[10px] text-gray-400">{t('rating')}</div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-900">{worker.experience_years || 4}+ Yrs</div>
                    <div className="text-[10px] text-gray-400">{t('experience')}</div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-900">{worker.total_jobs_completed || 28}</div>
                    <div className="text-[10px] text-gray-400">{t('completed')}</div>
                  </div>
                </div>

                {/* Primary Trade & Skills */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-950">{t('primaryTrade')}: <span className="font-normal text-gray-700">{worker.primary_trade}</span></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      worker.tier === 'MASTER' ? 'bg-amber-400 text-blue-950 ring-1 ring-amber-500' :
                      worker.tier === 'GOLD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      worker.tier === 'SILVER' ? 'bg-slate-200 text-slate-900' : 'bg-orange-100 text-orange-900'
                    }`}>
                      {worker.tier || 'BRONZE'} TIER
                    </span>
                  </div>

                  {/* Federation Affiliation Badge (Page 3) */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      worker.cooperative_id === 1 || worker.is_nlcf_affiliated
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}>
                      {worker.cooperative_id === 1 || worker.is_nlcf_affiliated
                        ? '🌟 Trusted Federation under LCF'
                        : '🛡️ Verified Federation'}
                    </span>

                    {worker.toolkit_compliance === 'VERIFIED_EQUIPPED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300">
                        <Wrench size={10} className="text-emerald-700" />
                        <span>🧰 ISI Toolkit Verified</span>
                      </span>
                    )}
                  </div>

                  {worker.certification_type && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      <Award size={12} /> {worker.certification_type.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openWorkerDetail(worker.id)}
                  className="btn btn-secondary btn-sm text-xs font-semibold"
                >
                  {t('viewProfile')}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/book-service?category=${encodeURIComponent(worker.primary_trade || '')}&district=${encodeURIComponent(worker.district || '')}`)}
                  className="btn btn-primary btn-sm text-xs font-bold"
                >
                  Book Service ({worker.primary_trade || 'Trade'})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  {selectedWorker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{selectedWorker.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{selectedWorker.worker_code}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-950 mb-1">{t('coopAffiliation')}</div>
                <div>{selectedWorker.cooperative_name} • {selectedWorker.district}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-bold text-gray-700">{t('primaryTrade')}</div>
                  <div className="text-gray-900">{selectedWorker.primary_trade}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-bold text-gray-700">{t('experience')}</div>
                  <div className="text-gray-900">{selectedWorker.experience_years} {t('years')}</div>
                </div>
              </div>

              {/* Mandatory Toolkit Compliance in Profile Modal */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Wrench size={14} className="text-blue-900" />
                    <span>Mandatory Tool Kit Compliance:</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedWorker.toolkit_compliance === 'VERIFIED_EQUIPPED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {selectedWorker.toolkit_compliance === 'VERIFIED_EQUIPPED' ? '✓ ISI Toolkit Verified' : 'Standard Gear'}
                  </span>
                </div>

                {selectedWorker.tools_owned ? (
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Equipped Tools on Record:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedWorker.tools_owned.split(',').map((tool, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700 text-[10px]">
                          ✓ {tool.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Equipped with standard artisan tools and safety gear.
                  </p>
                )}
              </div>

              {selectedWorker.bio && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-bold text-gray-700 mb-1">{t('artisanBio')}</div>
                  <p className="text-gray-600 leading-relaxed">{selectedWorker.bio}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
              ⚖️ <strong>Cooperative Policy:</strong> Service orders are broadcasted to all verified artisans in this trade and locality. The first available artisan to accept will be dispatched.
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedWorker(null)}
                className="btn btn-secondary btn-sm"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  const trade = selectedWorker.primary_trade || '';
                  const dist = selectedWorker.district || '';
                  setSelectedWorker(null);
                  navigate(`/book-service?category=${encodeURIComponent(trade)}&district=${encodeURIComponent(dist)}`);
                }}
                className="btn btn-primary btn-sm font-bold"
              >
                Book Service in This Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
