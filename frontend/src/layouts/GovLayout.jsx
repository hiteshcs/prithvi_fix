import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, LayoutDashboard,
  ShieldCheck, Volume2, VolumeX, Sun, Moon, MapPin, LocateFixed, Globe, Type
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLocationContext } from '../context/LocationContext';

export default function GovLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isCustomer, isWorker, isAdmin } = useAuth();
  const { lang, setLang, t, odiaFont, setOdiaFont, odiaFonts } = useLanguage();
  const { fontSize, setFontSize, isDarkMode, toggleDarkMode, highContrast, toggleHighContrast, isSpeaking, stopSpeaking } = useAccessibility();
  const {
    locations,
    availableDistricts,
    selectedLocation,
    selectedAreaId,
    selectedDistrict,
    changeLocation,
    changeDistrict,
    isUsingCurrentLocation,
    isDetectingLocation,
    detectCurrentLocation,
    locationNotice,
    unsupportedLocation
  } = useLocationContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Cancel any running speech synthesis whenever the page changes
  React.useEffect(() => {
    stopSpeaking();
  }, [location.pathname, stopSpeaking]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isWorker) return '/worker/dashboard';
    return '/customer/bookings';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      const labels = { EN: 'Admin', HI: 'प्रशासक', OR: 'ପ୍ରଶାସକ', BN: 'প্রশাসক', TE: 'అడ్మిన్' };
      return { label: labels[lang] || 'Admin', style: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (isWorker) {
      const labels = { EN: 'Artisan / Worker', HI: 'कुशल कारीगर', OR: 'କୁଶଳୀ ଶ୍ରମିକ', BN: 'দক্ষ কারিগর', TE: 'నైపుణ్యం కలిగిన కార్మికుడు' };
      return { label: labels[lang] || 'Worker', style: 'bg-green-100 text-green-900 border-green-300' };
    }
    const labels = { EN: 'Citizen', HI: 'नागरिक', OR: 'ନାଗରିକ', BN: 'নাগরিক', TE: 'పౌరుడు' };
    return { label: labels[lang] || 'Citizen', style: 'bg-blue-100 text-blue-900 border-blue-300' };
  };

  const handleVoiceListen = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const currentLangText = {
      EN: "Welcome to Prithvi Fix, the official Cooperative Labour Services Federation Portal. Verified skills, fair wages, zero surge pricing, and direct social security for all artisans. You can book an electrical, plumbing, carpentry or appliance service directly online or dial toll free 1800-345-7788.",
      HI: "पृथ्वी फिक्स में आपका स्वागत है। यह श्रम सहकारी सेवा पोर्टल है। प्रमाणित कारीगर, उचित सहकारी दरें, शून्य अतिरिक्त शुल्क और 100% सामाजिक सुरक्षा। आप ऑनलाइन सेवा बुक कर सकते हैं या टोल-फ्री 1800-345-7788 पर कॉल करें।",
      OR: "ପୃଥିବୀ ଫିକ୍ସ ପୋର୍ଟାଲକୁ ସ୍ୱାଗତ। ଏହା ଶ୍ରମ ସମବାୟ ମହାସଂଘର ଏକ ପ୍ରୟାସ। ପ୍ରମାଣିତ ଶ୍ରମିକ, ସମବାୟ ଦର ଏବଂ ସାମାଜିକ ସୁରକ୍ଷା। ସେବା ବୁକ୍ କରିବା ପାଇଁ ଟୋଲ୍ ଫ୍ରି ୧୮୦୦-୩୪୫-୭୭୮୮ ଡାଏଲ କରନ୍ତୁ।",
      BN: "পৃথ্বী ফিক্সে স্বাগতম। এটি সমবায় শ্রম সেবা পোর্টাল। যাচাইকৃত কর্মী, ন্যায্য সমবায় মূল্য এবং সামাজিক সুরক্ষা। সেবা বুক করতে ১৮০০-৩৪৫-৭৭৮৮ নম্বরে কল করুন।",
      TE: "పృథ్వీ ఫిక్స్ కు స్వాగతం. ఇది సహకార కార్మిక సేవల పోర్టల్. ధృవీకరించబడిన నైపుణ్యాలు మరియు సామాజిక భద్రత. సేవను బుక్ చేయడానికి టోల్ ఫ్రీ 1800-345-7788 కు కాల్ చేయండి."
    };
    speakText(currentLangText[lang] || currentLangText.EN);
  };

  const navLinks = [
    { to: '/', label: t('navHome'), end: true },
    { to: '/services', label: t('navServicesBooking') || 'Services & Booking', isServices: true },
    { to: '/rate-card', label: t('navRateCard', 'Rate Card') },
    { to: '/about', label: t('navAbout') },
    { to: '/help', label: t('navHelp') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* ── Single Unified Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Homepage">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-0.5 group-hover:shadow transition">
              <img
                src="/logo-emblem.png"
                alt="Prithvi Fix"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-none">
              <span className="text-[17px] font-black tracking-tight text-[#0e5c3e]">
                PRITHVI<span className="text-[#0274b3] ml-1">FIX</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Public Navigation">
            {navLinks.map(({ to, label, end, isServices }) => {
              const isActive = isServices
                ? location.pathname.startsWith('/services') || location.pathname.startsWith('/book-service')
                : end
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Global Location Selector with 1-Click GPS Button */}
            <div className={`hidden sm:flex items-center rounded-xl border transition text-xs shadow-2xs pl-1.5 pr-2 py-1 gap-1 ${
              unsupportedLocation
                ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200/70 border-slate-200/80'
            }`}>
              <button
                type="button"
                id="header-gps-detect-btn"
                onClick={() => detectCurrentLocation()}
                disabled={isDetectingLocation}
                title={
                  unsupportedLocation
                    ? `${unsupportedLocation.name} (Coming Soon) - Click to re-detect`
                    : isUsingCurrentLocation
                    ? "GPS Active - Click to re-detect location"
                    : "Auto-detect current GPS location"
                }
                className={`p-1 rounded-lg transition flex items-center justify-center cursor-pointer ${
                  unsupportedLocation
                    ? 'text-amber-800 bg-amber-200/90 hover:bg-amber-300'
                    : isUsingCurrentLocation
                    ? 'text-emerald-700 bg-emerald-100/90 hover:bg-emerald-200'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200'
                }`}
              >
                <LocateFixed
                  size={14}
                  className={isDetectingLocation ? 'animate-spin text-blue-700' : ''}
                />
              </button>
              <select
                id="header-location-select"
                value={
                  isDetectingLocation
                    ? 'detecting'
                    : unsupportedLocation
                    ? 'unsupported'
                    : isUsingCurrentLocation
                    ? 'current'
                    : selectedDistrict
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'current' || val === 'detect_current') {
                    detectCurrentLocation();
                  } else if (val !== 'detecting' && val !== 'unsupported') {
                    changeDistrict(val);
                  }
                }}
                className={`bg-transparent font-bold text-xs border-0 outline-none cursor-pointer pr-1 ${
                  unsupportedLocation ? 'text-amber-950' : 'text-slate-900'
                }`}
                title="Select district to view localized cooperative tariffs"
              >
                {isDetectingLocation ? (
                  <option value="detecting">⏳ {t('detectingLocation', 'Detecting District...')}</option>
                ) : unsupportedLocation ? (
                  <>
                    <option value="unsupported">
                      📍 {unsupportedLocation.district || unsupportedLocation.name} (Coming Soon)
                    </option>
                    <option value="detect_current">🎯 {t('redetectGps', 'Re-detect GPS Location')}</option>
                  </>
                ) : (
                  <>
                    <option value="current">
                      📍 {isUsingCurrentLocation
                        ? `${selectedDistrict} District (GPS)`
                        : t('currentLocation', 'Current District (GPS)')}
                    </option>
                    {isUsingCurrentLocation && (
                      <option value="detect_current">🎯 {t('redetectGps', 'Re-detect GPS Location')}</option>
                    )}
                  </>
                )}
                {(availableDistricts || []).map((d) => (
                  <option key={d.name} value={d.name}>
                    📍 {d.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown Bar */}
            <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs shadow-2xs">
              <Globe size={13} className="text-blue-600 dark:text-blue-400 mr-1.5 shrink-0" />
              <select
                id="header-language-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                    className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-1"
                  >
                    {item.native} ({item.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Odia Font Style Dropdown */}
            {lang === 'OR' && odiaFonts && (
              <div className="hidden md:flex items-center bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1 text-xs shadow-2xs">
                <Type size={13} className="text-amber-600 dark:text-amber-400 mr-1.5 shrink-0" />
                <select
                  id="header-odia-font-select"
                  value={odiaFont}
                  onChange={(e) => setOdiaFont(e.target.value)}
                  className="bg-transparent font-bold text-xs text-amber-900 dark:text-amber-200 outline-none cursor-pointer pr-1"
                  aria-label="Select Odia Font Style"
                >
                  {odiaFonts.map((font) => (
                    <option
                      key={font.id}
                      value={font.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-1"
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-slate-200" />

            {/* Auth Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardRoute()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard size={14} />
                    {t('dashboardBtn')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('signOutBtn')}
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
                  >
                    {t('loginBtn')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    {t('registerBtn')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-50"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map(({ to, label, end, isServices }) => {
                const isActive = isServices
                  ? location.pathname.startsWith('/services') || location.pathname.startsWith('/book-service')
                  : end
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Location Selector */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-blue-900" />
                  <span>Active Cooperative Area:</span>
                </div>
                <button
                  type="button"
                  onClick={() => detectCurrentLocation()}
                  disabled={isDetectingLocation}
                  className="text-[11px] text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LocateFixed size={11} className={isDetectingLocation ? 'animate-spin' : ''} />
                  <span>{isDetectingLocation ? 'Locating...' : 'Detect GPS'}</span>
                </button>
              </div>
              <select
                value={
                  isDetectingLocation
                    ? 'detecting'
                    : unsupportedLocation
                    ? 'unsupported'
                    : isUsingCurrentLocation
                    ? 'current'
                    : selectedDistrict
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'current' || val === 'detect_current') {
                    detectCurrentLocation();
                  } else if (val !== 'detecting' && val !== 'unsupported') {
                    changeDistrict(val);
                  }
                }}
                className={`w-full p-2 rounded-xl text-xs font-bold border ${
                  unsupportedLocation
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {isDetectingLocation ? (
                  <option value="detecting">⏳ {t('detectingLocation', 'Detecting District...')}</option>
                ) : unsupportedLocation ? (
                  <>
                    <option value="unsupported">
                      📍 {unsupportedLocation.district || unsupportedLocation.name} (Coming Soon)
                    </option>
                    <option value="detect_current">🎯 {t('redetectGps', 'Re-detect GPS Location')}</option>
                  </>
                ) : (
                  <>
                    <option value="current">
                      📍 {isUsingCurrentLocation
                        ? `${selectedDistrict} District (GPS)`
                        : t('currentLocation', 'Current District (GPS)')}
                    </option>
                    {isUsingCurrentLocation && (
                      <option value="detect_current">🎯 {t('redetectGps', 'Re-detect GPS Location')}</option>
                    )}
                  </>
                )}
                {(availableDistricts || []).map((d) => (
                  <option key={d.name} value={d.name}>
                    📍 {d.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Language Dropdown */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-blue-600" />
                <span>Select Language</span>
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full p-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900"
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.native} ({item.label} - {item.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Odia Font Dropdown */}
            {lang === 'OR' && odiaFonts && (
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} className="text-amber-600" />
                  <span>ଓଡ଼ିଆ ଫଣ୍ଟ ଶୈଳୀ (Odia Font Style)</span>
                </label>
                <select
                  value={odiaFont}
                  onChange={(e) => setOdiaFont(e.target.value)}
                  className="w-full p-2 rounded-xl text-xs font-bold bg-amber-50/80 border border-amber-200 text-amber-950"
                >
                  {odiaFonts.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mobile Auth */}
            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                    Signed in as <strong className="text-slate-900">{user?.name}</strong>
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                  >
                    <LayoutDashboard size={14} /> {t('dashboardBtn')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-lg border border-slate-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                  >
                    {t('signOutBtn')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold text-center hover:bg-slate-50 transition-colors"
                  >
                    {t('loginBtn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold text-center hover:bg-slate-800 transition-colors"
                  >
                    {t('registerBtn')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 4. Main Public Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── 5. Official Civic & Cooperative Footer ── */}
      <footer className="gov-footer" role="contentinfo">
        <div className="gov-footer-inner">
          <div className="gov-footer-grid">
            {/* Column 1: Public Cooperative Federation */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/logo-emblem.png"
                  alt="Prithvi Fix Logo"
                  className="w-12 h-12 object-contain rounded-xl bg-white p-1 shadow-sm shrink-0 border border-slate-700/50"
                />
                <div>
                  <div className="font-extrabold text-sm text-white">{t('brandName')}</div>
                  <div className="text-[10px] text-amber-300 uppercase font-semibold">{t('portalSubHeader')}</div>
                </div>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
                {t('heroSubtitle')}
              </p>
              <div className="flex items-center gap-2 text-xs text-green-300 font-bold bg-white/5 p-2 rounded-lg border border-white/10">
                <ShieldCheck size={16} className="text-green-400 shrink-0" />
                <span>100% Verified Skilled Trades</span>
              </div>
            </div>

            {/* Column 2: Citizen Public Services */}
            <div>
              <h4>{t('navServices')}</h4>
              <ul>
                <li><Link to="/services">{t('secServices')}</Link></li>
                <li><Link to="/rate-card">Regulated Rate Card</Link></li>
                <li><Link to="/book-service">{t('btnBookNow')}</Link></li>
                <li><Link to="/help">{t('callBookingTitle')}</Link></li>
              </ul>
            </div>

            {/* Column 3: Artisan & Cooperative Welfare */}
            <div>
              <h4>{t('statVerifiedWorkers')}</h4>
              <ul>
                <li><Link to="/register?role=worker">{t('workerJoinBtn')}</Link></li>
                <li><Link to="/login?role=worker">{t('loginBtn')}</Link></li>
                <li><Link to="/about">{t('welfareHeading')}</Link></li>
                <li><Link to="/help">{t('navHelp')}</Link></li>
              </ul>
            </div>

            {/* Column 4: Helplines & Grievance */}
            <div>
              <h4>{t('tollFreeLabel')}</h4>
              <div className="space-y-2 text-xs text-blue-100">
                <div className="p-3 bg-white/10 rounded-xl border border-white/15">
                  <div className="text-[11px] text-amber-300 font-bold uppercase">{t('tollFreeLabel')}</div>
                  <div className="text-base font-bold text-white font-mono">1800-345-7788</div>
                  <div className="text-[10px] text-gray-300">24x7 Support</div>
                </div>
                <div className="text-[11px] text-gray-300 pt-1">
                  National Emergency: <strong>112</strong> | Ambulance: <strong>108</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar with Statutory Disclaimers */}
          <div className="gov-footer-bottom">
            <div>
              © 2026 <strong>{t('brandName')}</strong> — {t('brandSubtitle')}. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/about" className="hover:text-white">Official GST Compliant Bill</Link>
              <span>•</span>
              <Link to="/about" className="hover:text-white">Privacy Policy</Link>
              <span>•</span>
              <Link to="/help" className="hover:text-white">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Floating Voice Assistant Bar with 1-Tap Stop */}
      {isSpeaking && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-md"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Volume2 size={16} className="text-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">Voice Playing</span>
          <button
            onClick={stopSpeaking}
            className="ml-1 px-3 py-1 text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Immediately Stop Voice Playback"
          >
            <VolumeX size={13} />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* Floating GPS Location Notification Toast */}
      {locationNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl border backdrop-blur-md text-xs font-semibold animate-bounce ${
            unsupportedLocation
              ? 'bg-amber-950/95 text-amber-100 border-amber-700 shadow-amber-500/20'
              : 'bg-slate-900/95 text-white border-slate-700 shadow-emerald-500/10'
          }`}
        >
          <LocateFixed size={15} className={unsupportedLocation ? 'text-amber-400 shrink-0' : 'text-emerald-400 shrink-0'} />
          <span>{locationNotice}</span>
        </div>
      )}
    </div>
  );
}
