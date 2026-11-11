import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, User, LogOut, LayoutDashboard, Briefcase,
  ShieldCheck, HeartPulse, MapPin, PhoneCall, AlertTriangle,
  Menu, X, Volume2, VolumeX, Sun, Moon, ArrowRight, ShieldAlert,
  HelpCircle, ChevronRight, Home, Wrench, Search, PlusCircle,
  FileText, CheckCircle2, UserCheck, Bell, ExternalLink,
  FileCheck, Scale, Landmark, Users, IndianRupee, Compass, Layers, GraduationCap, DollarSign,
  Globe, ChevronDown, Check, Package, Hammer, Type
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';

export default function PortalLayout() {
  const { user, logout, isCustomer, isWorker, isAdmin } = useAuth();
  const { lang, setLang, t, odiaFont, setOdiaFont, odiaFonts } = useLanguage();
  const { fontSize, setFontSize, isDarkMode, toggleDarkMode, highContrast, toggleHighContrast, isSpeaking, speakText, stopSpeaking } = useAccessibility();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portal_sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const fontDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cancel any running speech synthesis on route change
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname, stopSpeaking]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target)) {
        setFontDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('portal_sidebar_open', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Language-aware role labels and navigation items
  const getRoleConfig = () => {
    const i18n = {
      EN: {
        adminTitle: 'Federation Command Center',
        adminSub: 'Cooperative Governance & GIS Oversight',
        adminBadge: 'Cooperative Authority',
        workerTitle: 'Worker Member Terminal',
        workerSub: 'Artisan Duty & Dispatch',
        workerBadge: 'Verified Artisan',
        citizenTitle: 'Citizen Service Portal',
        citizenSub: 'Personal Bookings & Tax Invoices',
        citizenBadge: 'Verified Resident',
        
        navMyBookings: 'My Bookings',
        navBookService: 'Book a Service',
        navFindWorker: 'Find Worker',
        navHelpdesk: 'Help & Grievance',
        navGisMap: 'GIS Live Map & Dispatches',
        navWorkOrders: 'Active Work Orders',
        navWelfare: 'Social Security & Welfare',
        navWorkerHelp: 'Worker Helpline',
        navProfile: 'My Profile',
        navAddresses: 'Saved Addresses',
        
        viewPublicSite: 'View Public Website',
        helplineTitle: 'Citizen Support',
        sessionStatus: 'SSL 256-Bit Encrypted Secure Session • State Cooperative Active Node'
      },
      HI: {
        adminTitle: 'सहकारी महासंघ प्रशासन केंद्र',
        adminSub: 'सहकारी प्रबंधन एवं जीआईएस निगरानी',
        adminBadge: 'सहकारी अधिकारी',
        workerTitle: 'श्रम साथी सदस्य टर्मिनल',
        workerSub: 'कारीगर कार्य एवं आवंटन कक्ष',
        workerBadge: 'सत्यापित कारीगर',
        citizenTitle: 'नागरिक सेवा पोर्टल',
        citizenSub: 'व्यक्तिगत बुकिंग एवं टैक्स रसीद',
        citizenBadge: 'सत्यापित नागरिक',
        
        navMyBookings: 'मेरी बुकिंग्स',
        navBookService: 'सेवा बुक करें',
        navFindWorker: 'कारीगर खोजें',
        navHelpdesk: 'सहायता एवं शिकायत',
        navGisMap: 'जीआईएस लाइव मैप व आवंटन',
        navWorkOrders: 'सक्रिय कार्य आदेश',
        navWelfare: 'कल्याण कोष व सामाजिक सुरक्षा',
        navWorkerHelp: 'श्रमिक हेल्पलाइन',
        navProfile: 'मेरी प्रोफ़ाइल',
        navAddresses: 'सहेजे गए पते',
        
        viewPublicSite: 'मुख्य वेबसाइट देखें',
        helplineTitle: 'नागरिक सहायता',
        sessionStatus: 'एसएसएल 256-बिट सुरक्षित सत्र • राज्य सहकारी सक्रिय नोड'
      },
      OR: {
        adminTitle: 'ସମବାୟ ମହାସଂଘ ପ୍ରଶାସନ କେନ୍ଦ୍ର',
        adminSub: 'ସମବାୟ ପ୍ରଶାସନ ଓ ଜିଆଇଏସ୍ ନିରୀକ୍ଷଣ',
        adminBadge: 'ସମବାୟ ଅଧିକାରୀ',
        workerTitle: 'ଶ୍ରମ ସାଥୀ ସଦସ୍ୟ ଟର୍ମିନାଲ୍',
        workerSub: 'ଶ୍ରମିକ କାର୍ଯ୍ୟ ଓ ବଣ୍ଟନ କକ୍ଷ',
        workerBadge: 'ପ୍ରମାଣିତ କାରିଗର',
        citizenTitle: 'ନାଗରିକ ସେବା ପୋର୍ଟାଲ',
        citizenSub: 'ବ୍ୟକ୍ତିଗତ ବୁକିଂ ଓ ଟିକସ ବିଲ୍',
        citizenBadge: 'ପ୍ରମାଣିତ ନାଗରିକ',
        
        navMyBookings: 'ମୋ ବୁକିଂ',
        navBookService: 'ସେବା ବୁକ୍ କରନ୍ତୁ',
        navFindWorker: 'ଶ୍ରମିକ ଖୋଜନ୍ତୁ',
        navHelpdesk: 'ସହାୟତା ଓ ଅଭିଯୋଗ',
        navGisMap: 'ଜିଆଇଏସ୍ ଲାଇଭ୍ ମ୍ୟାପ୍',
        navWorkOrders: 'ସକ୍ରିୟ କାର୍ଯ୍ୟ ଅର୍ଡର',
        navWelfare: 'କଲ୍ୟାଣ ପାଣ୍ଠି ଓ ସୁରକ୍ଷା',
        navWorkerHelp: 'ଶ୍ରମିକ ହେଲ୍ପଲାଇନ୍',
        navProfile: 'ମୋ ପ୍ରୋଫାଇଲ୍',
        navAddresses: 'ସେଭ୍ ଠିକଣା',
        
        viewPublicSite: 'ମୂଳ ୱେବସାଇଟ୍ ଦେଖନ୍ତୁ',
        helplineTitle: 'ନାଗରିକ ସହାୟତା',
        sessionStatus: 'ଏସଏସଏଲ ୨୫୬-ବିଟ୍ ସୁରକ୍ଷିତ ସତ୍ର • ରାଜ୍ୟ ସମବାୟ ସକ୍ରିୟ ନୋଡ୍'
      },
      BN: {
        adminTitle: 'সমবায় ফেডারেশন প্রশাসন',
        adminSub: 'প্রশাসন ও জিআইএস পর্যবেক্ষণ',
        adminBadge: 'সমবায় কর্মকর্তা',
        workerTitle: 'শ্রমিক সদস্য টার্মিনাল',
        workerSub: 'কর্মী কার্যক্ষেত্র ও বরাদ্দ',
        workerBadge: 'যাচাইকৃত কারিগর',
        citizenTitle: 'নাগরিক সেবা পোর্টাল',
        citizenSub: 'ব্যক্তিগত বুকিং ও ট্যাক্স চালান',
        citizenBadge: 'যাচাইকৃত নাগরিক',
        
        navMyBookings: 'আমার বুকিং',
        navBookService: 'সেবা বুক করুন',
        navFindWorker: 'কর্মী খুঁজুন',
        navHelpdesk: 'সহায়তা ও অভিযোগ',
        navGisMap: 'জিআইএস লাইভ ম্যাপ',
        navWorkOrders: 'সক্রিয় কাজের আদেশ',
        navWelfare: 'কল্যাণ তহবিল ও সামাজিক সুরক্ষা',
        navWorkerHelp: 'কর্মী হেল্পলাইন',
        navProfile: 'আমার প্রোফাইল',
        navAddresses: 'সংরক্ষিত ঠিকানা',
        
        viewPublicSite: 'মূল ওয়েবসাইট দেখুন',
        helplineTitle: 'নাগরিক সহায়তা',
        sessionStatus: 'এসএসএল ২৫৬-বিট নিরাপদ সেশন • রাজ্য সমবায় সক্রিয় নোড'
      },
      TE: {
        adminTitle: 'సహకార సమాఖ్య పరిపాలన కేంద్రం',
        adminSub: 'పరిపాలన మరియు జీఐఎస్ పర్యవేక్షణ',
        adminBadge: 'సహకార అధికారి',
        workerTitle: 'కార్మిక సభ్యుల టెర్మినల్',
        workerSub: 'కార్మికుల కేటాయింపు కార్యస్థలం',
        workerBadge: 'ధృవీకరించబడిన కార్మికుడు',
        citizenTitle: 'పౌర సేవా పోర్టల్',
        citizenSub: 'వ్యక్తిగత బుకింగ్‌లు & పన్ను రసీదులు',
        citizenBadge: 'ధృవీకరించబడిన పౌరుడు',
        
        navMyBookings: 'నా బుకింగ్‌లు',
        navBookService: 'సేవను బుక్ చేయండి',
        navFindWorker: 'కార్మికుడిని కనుగొనండి',
        navHelpdesk: 'సహాయం & ఫిర్యాదులు',
        navGisMap: 'జీఐఎస్ ప్రత్యక్ష మ్యాప్',
        navWorkOrders: 'సక్రియ పని ఆర్డర్లు',
        navWelfare: 'సంక్షేమ నిధి & సామాజిక భద్రత',
        navWorkerHelp: 'కార్మిక హెల్ప్‌లైన్',
        navProfile: 'నా ప్రొఫైల్',
        navAddresses: 'సేవ్ చిరునామాలు',
        
        viewPublicSite: 'ప్రజా వెబ్‌సైట్‌ను చూడండి',
        helplineTitle: 'పౌర సహాయం',
        sessionStatus: 'SSL 256-బిట్ సురక్షిత సెషన్ • రాష్ట్ర సహకార సక్రియ నోడ్'
      }
    };

    const dict = i18n[lang] || i18n.EN;

    if (isAdmin) {
      const isDco = user?.admin_type === 'DCO_REGISTRAR';
      const isApex = user?.admin_type === 'FEDERATION_HEAD';

      if (isDco) {
        const dcoNav = [
          { to: '/admin/dashboard?tab=dco_approval', label: 'Statutory Scrutiny', icon: FileCheck },
          { to: '/admin/dashboard?tab=dco_registry', label: 'District Society Registry', icon: Landmark },
          { to: '/admin/dashboard?tab=dco_audit', label: 'Audit & Solvency (Sec 62)', icon: Scale },
          { to: '/admin/dashboard?tab=dco_elections', label: 'Elections & AGM (Sec 28)', icon: Users },
          { to: '/admin/dashboard?tab=dco_inquiries', label: 'Inquiries & Orders (Sec 68)', icon: ShieldAlert },
          { to: '/admin/dashboard?tab=dco_tribunal', label: 'Dispute Tribunal (Sec 70)', icon: FileText },
          { to: '/admin/dashboard?tab=dco_welfare', label: 'Welfare Escrow Treasury', icon: IndianRupee },
          { to: '/help', label: dict.navHelpdesk, icon: HelpCircle },
        ];
        return {
          title: 'District Cooperative Registrar',
          sub: `${user?.district || 'District'} Regulatory Authority (OCS Act 1962)`,
          badge: 'District Registrar (DCO)',
          badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
          dict,
          navItems: dcoNav,
        };
      }

      if (isApex) {
        const apexNav = [
          { to: '/apex/dashboard?tab=overview', label: '1. Statewide Hierarchy & Audit', icon: Building2 },
          { to: '/apex/dashboard?tab=mobility', label: '2. AI Demand & Mutual Aid', icon: Compass },
          { to: '/federation/tenders', label: '3. Institutional Tenders & Bids', icon: Briefcase },
          { to: '/apex/dashboard?tab=procurement', label: '4. Wholesale Bulk Procurement', icon: Package },
          { to: '/apex/dashboard?tab=treasury', label: '5. Apex Treasury & Welfare Pool', icon: DollarSign },
          { to: '/find-worker', label: dict.navFindWorker, icon: Search },
          { to: '/help', label: dict.navHelpdesk, icon: HelpCircle },
        ];
        return {
          title: 'State Apex Federation Head',
          sub: 'Odisha Apex Inter-District Coordination & Tenders',
          badge: 'Apex Federation Head',
          badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
          dict,
          navItems: apexNav,
        };
      }

      // Primary Society Admin (SOCIETY_ADMIN)
      const societyNav = [
        { to: '/society/dashboard?tab=workers', label: '1. Member Artisans & KYC', icon: Users },
        { to: '/society/dashboard?tab=operations', label: '2. Local Work Orders & Dispatches', icon: Briefcase },
        { to: '/society/dashboard?tab=tools', label: '3. Society Tool Bank Depot', icon: Hammer },
        { to: '/society/dashboard?tab=treasury', label: '4. Society Treasury & Loans', icon: DollarSign },
        { to: '/society/dashboard?tab=disputes', label: '5. 30-Day Guarantee Mediation', icon: ShieldAlert },
        { to: '/find-worker', label: dict.navFindWorker, icon: Search },
        { to: '/help', label: dict.navHelpdesk, icon: HelpCircle },
      ];
      return {
        title: 'Primary Labour Cooperative Society',
        sub: `${user?.district || 'District'} Primary Society Operations & Local Governance`,
        badge: 'Society Secretary',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        dict,
        navItems: societyNav,
      };
    }
    if (isWorker) {
      return {
        title: dict.workerTitle,
        sub: dict.workerSub,
        badge: dict.workerBadge,
        badgeClass: 'bg-green-100 text-green-900 border-green-300',
        dict,
        navItems: [
          { to: '/worker/dashboard', label: dict.navWorkOrders, icon: Briefcase, end: true },
          { to: '/worker/welfare', label: dict.navWelfare, icon: HeartPulse },
          { to: '/profile', label: dict.navProfile, icon: User },
          { to: '/help', label: dict.navWorkerHelp, icon: HelpCircle },
        ],
      };
    }
    // Citizen / Customer
    return {
      title: dict.citizenTitle,
      sub: dict.citizenSub,
      badge: dict.citizenBadge,
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      dict,
      navItems: [
        { to: '/customer/bookings', label: dict.navMyBookings, icon: FileText, end: false },
        { to: '/book-service', label: dict.navBookService, icon: PlusCircle },
        { to: '/find-worker', label: dict.navFindWorker, icon: Search },
        { to: '/profile', label: dict.navProfile, icon: User },
        { to: '/customer/addresses', label: dict.navAddresses, icon: MapPin },
        { to: '/help', label: dict.navHelpdesk, icon: HelpCircle },
      ],
    };
  };

  const roleConfig = getRoleConfig();
  const dict = roleConfig.dict;

  const LANGUAGES = SUPPORTED_LANGUAGES;

  const getFormattedRole = () => {
    if (user?.admin_type === 'DCO_REGISTRAR') return 'District Registrar (DCO)';
    if (user?.admin_type === 'FEDERATION_HEAD') return 'Apex Federation Head';
    if (user?.admin_type === 'SOCIETY_ADMIN') return 'Society Secretary';
    if (user?.role === 'COOPERATIVE_ADMIN') return 'Society Secretary';
    if (user?.role === 'FEDERATION_ADMIN') return 'Federation Director';
    if (user?.role === 'WORKER') return 'Registered Artisan';
    if (user?.role === 'CUSTOMER' || user?.role === 'CITIZEN') return 'Citizen Member';
    return roleConfig.badge || 'Verified Member';
  };

  const handleVoiceListen = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const currentLangText = {
      EN: `You are in your ${roleConfig.sub}. Welcome ${user?.name || ''}. Here you can manage your orders, track status, view invoices, or trigger emergency support.`,
      HI: `आप अपने ${roleConfig.title} में हैं। स्वागत है ${user?.name || ''}। यहाँ आप अपने ऑर्डर देख सकते हैं, स्थिति ट्रैक कर सकते हैं, या आपातकालीन सहायता प्राप्त कर सकते हैं।`,
      OR: `ଆପଣ ନିଜର ${roleConfig.title}ରେ ଅଛନ୍ତି। ସ୍ୱାଗତ ${user?.name || ''}। ଏଠାରେ ଆପଣ ଅର୍ଡର ଦେଖିପାରିବେ ଏବଂ ସହାୟତା ପାଇପାରିବେ।`,
      BN: `আপনি আপনার ${roleConfig.title}ে আছেন। স্বাগতম ${user?.name || ''}।`,
      TE: `మీరు మీ ${roleConfig.title} లో ఉన్నారు. స్వాగతం ${user?.name || ''}.`
    };
    speakText(currentLangText[lang] || currentLangText.EN);
  };

  return (
    <div className="portal-layout">
      {/* ── Top Tricolor Line ── */}
      <div className="tricolor-ribbon" />

      {/* ── Dedicated Logged-In Top Bar ── */}
      <header className="portal-topbar">
        {/* Left: Hamburger Menu & Brand Context */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-700/60"
            title={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
            aria-label="Toggle Navigation Sidebar"
          >
            {sidebarOpen ? <X size={18} className="text-slate-200" /> : <Menu size={18} className="text-slate-200" />}
          </button>

          <Link to="/" className="flex items-center gap-3 text-white group" title={t('brandName')}>
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 backdrop-blur-xs p-1 shadow-xs border border-white/20 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo-emblem.png"
                alt="Prithvi Fix Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-[15px] font-semibold text-white tracking-tight leading-none group-hover:text-blue-200 transition-colors">
                  {roleConfig.title}
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-300 bg-slate-800/90 border border-slate-700/60 shadow-2xs leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate max-w-[280px]">{roleConfig.sub}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal mt-1 leading-none">
                {t('brandName')} • {t('brandSubtitle')}
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Accessibility Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Voice Reader */}
          <button
            onClick={handleVoiceListen}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isSpeaking
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-transparent hover:border-slate-700/60'
            }`}
            title={isSpeaking ? "Stop Voice Playback" : t('listenVoice')}
            aria-label={isSpeaking ? "Stop Voice Playback" : "Listen to Page"}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={14} className="text-rose-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">{t('stopVoice')}</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-slate-300" />
                <span className="hidden sm:inline text-[11px]">{t('listenVoice')}</span>
              </>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-slate-700/60 transition flex items-center justify-center cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} className="text-slate-300" />}
          </button>

          {/* Minimalist Language Switcher Popover */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-slate-700/60 cursor-pointer"
              aria-label="Select Language"
              aria-expanded={langDropdownOpen}
            >
              <Globe size={14} className="text-slate-400" />
              <span className="font-semibold text-xs">
                {LANGUAGES.find(l => l.code === lang)?.native || 'English'}
              </span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Language
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {LANGUAGES.map((item) => {
                    const isSelected = lang === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLang(item.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition text-left cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 font-semibold'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono w-5">{item.code}</span>
                          <span>{item.native}</span>
                        </div>
                        {isSelected && <Check size={13} className="text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Odia Font Switcher Popover */}
          {lang === 'OR' && odiaFonts && (
            <div className="relative" ref={fontDropdownRef}>
              <button
                type="button"
                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-200 hover:text-amber-100 bg-amber-500/15 hover:bg-amber-500/25 transition border border-amber-500/30 hover:border-amber-500/50 cursor-pointer"
                aria-label="Select Odia Font Style"
                aria-expanded={fontDropdownOpen}
              >
                <Type size={14} className="text-amber-400" />
                <span className="font-semibold text-xs hidden sm:inline">
                  {odiaFonts.find(f => f.id === odiaFont)?.name.split(' ')[0] || 'Odia Font'}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-amber-400 transition-transform duration-200 ${fontDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {fontDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-amber-500/30 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    ଓଡ଼ିଆ ଫଣ୍ଟ ଶୈଳୀ (Odia Font Style)
                  </div>
                  <div className="py-1">
                    {odiaFonts.map((font) => {
                      const isSelected = odiaFont === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => {
                            setOdiaFont(font.id);
                            setFontDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-200 font-semibold'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{font.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{font.id}</div>
                          </div>
                          {isSelected && <Check size={13} className="text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hairline Divider */}
          <div className="h-5 w-px bg-slate-700/60 mx-1 hidden sm:block" />

          {/* User Profile Pill */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-white/10 text-white transition-all text-left border border-transparent hover:border-slate-700/60 cursor-pointer"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs border border-blue-400/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block leading-tight pr-0.5">
                <div className="text-xs font-semibold text-slate-100 max-w-[130px] truncate">
                  {user?.name || 'Authorized User'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                  {getFormattedRole()}
                </div>
              </div>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 hidden sm:block ${userDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/80 py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <div className="text-xs font-bold text-white">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'officer@cooperation.odisha.gov.in'}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{getFormattedRole()}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>{dict.viewPublicSite}</span>
                  </Link>

                  <Link
                    to="/help"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <HelpCircle size={14} className="text-slate-400" />
                    <span>{dict.navHelpdesk}</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>{t('signOutBtn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Portal Body (Sidebar + Content Workspace) ── */}
      <div className="portal-main-wrapper">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-80 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`portal-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}
          aria-label="Portal Navigation"
        >
          <div>
            {/* Minimalist Sidebar Section Header */}
            <div className="px-3 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {roleConfig.badge || 'Navigation'}
              </span>
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <X size={15} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-0.5">
              {roleConfig.navItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = (() => {
                  const [currentPath, currentSearch] = [location.pathname, location.search];
                  const [targetPath, targetSearch] = item.to.split('?');
                  if (currentPath !== targetPath) return false;
                  if (!targetSearch) {
                    return !currentSearch || currentSearch === '?tab=apex';
                  }
                  const currentParams = new URLSearchParams(currentSearch);
                  const targetParams = new URLSearchParams(targetSearch);
                  const currentTab = currentParams.get('tab') || 'apex';
                  const targetTab = targetParams.get('tab');
                  return currentTab === targetTab;
                })();

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => {
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`portal-nav-link ${isCurrent ? 'active' : ''}`}
                  >
                    <Icon size={16} className="portal-nav-icon shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Helpline */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-0.5 text-[11px]">
                <PhoneCall size={12} className="text-blue-600 dark:text-blue-400" />
                <span>{dict.helplineTitle}</span>
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 font-bold font-mono">
                1800-345-7788
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut size={13} />
              <span>{t('signOutBtn')}</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Portal Page Content */}
        <main className="portal-content">
          <Outlet />
        </main>
      </div>

      {/* ── Secure Minimal Portal Footer ── */}
      <footer className="py-3 px-6 bg-white dark:bg-[#0A0F24] border-t border-gray-200 dark:border-[#1E294B] text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          <span>{dict.sessionStatus}</span>
        </div>
        <div className="text-[11px]">
          {t('tollFreeLabel')}: <strong>1800-345-7788</strong> | Emergency: <strong>112</strong>
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
          <span className="text-xs font-medium text-slate-200">Voice Assistant Playing</span>
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
    </div>
  );
}
