import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock, Mail, UserCheck, Briefcase, Building,
  AlertCircle, ArrowRight, Eye, EyeOff, Hammer,
  ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Login() {
  const { lang, t } = useLanguage();
  const { user, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const PORTALS = useMemo(() => ({
    CUSTOMER: {
      label: t('tabCitizen', 'Citizen'),
      desc: t('signInSub', 'Cooperative services at regulated base rates.'),
      icon: UserCheck,
      color: '#1A237E',
      registerLink: '/register?role=customer',
      registerText: t('newCitizenText', 'New here? Create account'),
    },
    WORKER: {
      label: t('tabArtisan', 'Artisan'),
      desc: lang === 'HI' ? 'दैनिक कार्य आवंटन, जीवनयापन योग्य मजदूरी और कारीगर कल्याण।' : lang === 'OR' ? 'ଦୈନିକ କାର୍ଯ୍ୟ ବଣ୍ଟନ, ନ୍ୟାଯ୍ୟ ମଜୁରୀ ଏବଂ ଶ୍ରମିକ କଲ୍ୟାଣ।' : lang === 'BN' ? 'দৈনিক কাজের বরাদ্দ, জীবনযাত্রার উপযোগী মজুরি ও শ্রমিক কল্যাণ।' : lang === 'TE' ? 'రోజువారీ కేటాయింపులు, గౌరవప్రదమైన వేతనాలు & సంక్షేమం.' : 'Daily dispatches, living wages & worker welfare.',
      icon: Briefcase,
      color: '#E67300',
      registerLink: '/register?role=worker',
      registerText: t('newArtisanText', 'New artisan? Register here'),
    },
    ADMIN: {
      label: t('tabAdmin', 'Admin'),
      desc: lang === 'HI' ? 'महासंघ पंजीयन एवं सहकारी शासन।' : lang === 'OR' ? 'ମହାସଂଘ ପଞ୍ଜୀକରଣ ଏବଂ ସମବାୟ ଶାସନ।' : lang === 'BN' ? 'ফেডারেশন নিবন্ধন ও সমবায় শাসন।' : lang === 'TE' ? 'సమాఖ్య నమోదు మరియు సహకార పాలన.' : 'Federation registry & society governance.',
      icon: Building,
      color: '#138808',
      registerLink: '/society/register',
      registerText: t('newSocietyText', 'New society? Register here'),
    },
  }), [lang, t]);

  const LEFT_SLIDES = useMemo(() => [
    {
      role: 'CUSTOMER',
      badge: t('slide1Badge', 'Citizen Assurance'),
      badgeIcon: ShieldCheck,
      title: t('slide1Title', 'Zero Surge Pricing. 100% Fair Tariffs.'),
      desc: t('slide1Desc', 'Government-notified base rates, transparent escrow accounting, and a 30-day warranty on every booking.'),
      stats: [
        { value: t('slide1Stat1Val', '₹0'), label: t('slide1Stat1Lbl', 'Surge pricing') },
        { value: t('slide1Stat2Val', '30-Day'), label: t('slide1Stat2Lbl', 'Warranty') },
        { value: t('slide1Stat3Val', '15-Min'), label: t('slide1Stat3Lbl', 'Response') },
      ],
      highlight: t('slide1Quote', '“Zero surge pricing even in peak hours. Reliable, certified artisans every time.”'),
      author: t('slide1Author', 'Ananya Patel • Citizen Member'),
    },
    {
      role: 'WORKER',
      badge: t('slide2Badge', 'Artisan Welfare'),
      badgeIcon: Briefcase,
      title: t('slide2Title', '93% Direct Pay. Zero Commissions.'),
      desc: t('slide2Desc', 'Direct bank payouts with healthcare coverage, pension contributions, and zero-interest tool loans.'),
      stats: [
        { value: t('slide2Stat1Val', '93%'), label: t('slide2Stat1Lbl', 'Direct wage') },
        { value: t('slide2Stat2Val', '₹5 Lakh'), label: t('slide2Stat2Lbl', 'Insurance') },
        { value: t('slide2Stat3Val', '0%'), label: t('slide2Stat3Lbl', 'Tool loans') },
      ],
      highlight: t('slide2Quote', '“No private commissions. We work with dignity as cooperative owners.”'),
      author: t('slide2Author', 'Ramesh Kumar • Master Electrician'),
    },
    {
      role: 'ADMIN',
      badge: t('slide3Badge', 'Cooperative Governance'),
      badgeIcon: Building,
      title: t('slide3Title', 'Federation Registry & Oversight'),
      desc: t('slide3Desc', 'Statutory compliance under Odisha Cooperative Societies Act with live rosters and mutual aid.'),
      stats: [
        { value: t('slide3Stat1Val', '30'), label: t('slide3Stat1Lbl', 'Districts') },
        { value: t('slide3Stat2Val', '100%'), label: t('slide3Stat2Lbl', 'Compliance') },
        { value: t('slide3Stat3Val', 'LCF'), label: t('slide3Stat3Lbl', 'Affiliated') },
      ],
      highlight: t('slide3Quote', '“Digital public infrastructure empowering grassroots labour societies.”'),
      author: t('slide3Author', 'Arun Pattnaik • Cooperative Secretary'),
    },
  ], [t]);

  const initialRole = searchParams.get('role') === 'worker' ? 'WORKER' : searchParams.get('role') === 'admin' ? 'ADMIN' : 'CUSTOMER';
  const [activePortal, setActivePortal] = useState(initialRole);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [suggestedPortal, setSuggestedPortal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';
  const portal = PORTALS[activePortal];

  const redirectUser = (u) => {
    if (!u) return;
    if (u.role === 'COOPERATIVE_ADMIN') {
      if (u.admin_type === 'DCO_REGISTRAR') {
        const ok = from.startsWith('/admin') || from.startsWith('/dco');
        navigate(ok ? from : '/admin/dashboard', { replace: true });
      } else if (u.admin_type === 'FEDERATION_HEAD') {
        const ok = from.startsWith('/apex') || from.startsWith('/federation/tenders') || from.startsWith('/institutional-tenders');
        navigate(ok ? from : '/apex/dashboard', { replace: true });
      } else {
        // Primary Society Admin (SOCIETY_ADMIN)
        const ok = from.startsWith('/society') || from.startsWith('/federation');
        navigate(ok ? from : '/society/dashboard', { replace: true });
      }
    } else if (u.role === 'WORKER') {
      navigate(from.startsWith('/worker') ? from : '/worker/dashboard', { replace: true });
    } else {
      navigate(from.startsWith('/customer') ? from : '/customer/bookings', { replace: true });
    }
  };

  useEffect(() => { if (user) redirectUser(user); }, [user]);
  useEffect(() => { setEmail(''); setPassword(''); setLocalError(''); setSuggestedPortal(null); }, [activePortal]);

  // Auto-advance sliding info ONLY on the left side smoothly every 6 seconds
  useEffect(() => {
    if (isPaused || email.length > 0 || password.length > 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % LEFT_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, email, password]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLocalError('');
    setSuggestedPortal(null);
    setLoading(true);
    try {
      const u = await login(email, password, activePortal);
      redirectUser(u);
    } catch (err) {
      const msg = err.message || 'Invalid credentials';
      setLocalError(msg);
      if (msg.includes('Citizen') || msg.includes('Customer')) setSuggestedPortal('CUSTOMER');
      else if (msg.includes('Worker')) setSuggestedPortal('WORKER');
      else if (msg.includes('Admin')) setSuggestedPortal('ADMIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>

      {/* ── LEFT BRANDING & SLIDING INFO PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative overflow-hidden flex-col justify-between"
        style={{ background: 'linear-gradient(165deg, #07152B 0%, #0F2347 45%, #152A55 100%)' }}>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />

        {/* Top tri-color civic accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%)' }} />

        <div className="relative z-10 flex flex-col justify-between flex-1 px-10 xl:px-14 py-8">
          {/* Top Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200/40">
              <img src="/logo-emblem.png" alt="Prithvi Fix" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-white text-base font-extrabold tracking-wide">PRITHVI FIX</div>
              <div className="text-slate-300 text-[11px] font-medium tracking-wider uppercase">National Cooperative Infrastructure</div>
            </div>
          </div>

          {/* Sliding Carousel Showcase */}
          <div
            className="relative w-full overflow-hidden my-auto py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {LEFT_SLIDES.map((slide, sIdx) => {
                const BadgeIcon = slide.badgeIcon;
                return (
                  <div key={sIdx} className="w-full shrink-0 pr-3">
                    <div className="civic-authority-chip mb-4">
                      <BadgeIcon size={13} className="text-slate-300" />
                      <span>{slide.badge}</span>
                    </div>

                    <h1 className="text-white text-3xl xl:text-4xl font-black leading-tight tracking-tight mb-3">
                      {slide.title}
                    </h1>

                    <p className="text-blue-100/80 text-base leading-relaxed mb-5 max-w-md">
                      {slide.desc}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm mb-5">
                      {slide.stats.map((st, i) => (
                        <div key={i} className="text-left">
                          <div className="text-white font-black text-2xl font-mono tracking-tight">{st.value}</div>
                          <div className="text-blue-200/70 text-xs font-semibold mt-0.5 leading-tight">{st.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Testimonial Quote */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border-l-2 border-white/40 border-y border-r border-white/10">
                      <p className="text-white/90 text-sm italic leading-relaxed">
                        {slide.highlight}
                      </p>
                      <div className="text-slate-300 text-xs font-medium mt-1.5">
                        — {slide.author}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-5">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {LEFT_SLIDES.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === dotIdx ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50' : 'w-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((currentSlide - 1 + LEFT_SLIDES.length) % LEFT_SLIDES.length)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/15 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((currentSlide + 1) % LEFT_SLIDES.length)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/15 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Statutory Notice */}
          <div className="text-white/30 text-xs font-medium">
            Odisha Cooperative Societies Act • Digital Public Goods Infrastructure
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 py-4 sm:py-5 sm:px-8">
        <style>{`
          @keyframes portalSlideFade {
            0% { opacity: 0; transform: translateX(8px); }
            100% { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <div className="w-full max-w-[460px]">

          {/* Mobile-only brand & sliding info ticker */}
          <div className="lg:hidden mb-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200">
                <img src="/logo-emblem.png" alt="Prithvi Fix" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-gray-900 text-base font-extrabold tracking-wide">PRITHVI FIX</div>
                <div className="text-gray-500 text-[11px] font-bold tracking-widest uppercase">Cooperative Services</div>
              </div>
            </div>

            {/* Compact Mobile Sliding Info Pill */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 font-bold text-[11px] uppercase tracking-wide">
                  {LEFT_SLIDES[currentSlide].badge}
                </span>
                <span className="truncate text-xs font-semibold text-slate-700">
                  {LEFT_SLIDES[currentSlide].title}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {LEFT_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === i ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-300'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Heading with maximized fonts & minimized margins */}
          <div className="mb-3">
            <h2 className="text-gray-900 text-3xl sm:text-4xl font-black tracking-tight mb-0.5" style={{ letterSpacing: '-0.025em' }}>
              {t('signInTitle', 'Sign in')}
            </h2>
            <div key={activePortal} style={{ animation: 'portalSlideFade 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <p className="text-slate-600 text-base sm:text-[17px] font-medium leading-snug">
                {portal.desc}
              </p>
            </div>
          </div>

          {/* ── Portal Tabs with Hardware-Accelerated Sliding Pill Animation ── */}
          <div className="relative flex rounded-2xl p-1 mb-3 bg-slate-100 border border-slate-200/80 shadow-inner">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm border border-slate-200/70 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none"
              style={{
                width: 'calc((100% - 8px) / 3)',
                transform: `translateX(calc(${['CUSTOMER', 'WORKER', 'ADMIN'].indexOf(activePortal)} * 100%))`,
              }}
            />
            {['CUSTOMER', 'WORKER', 'ADMIN'].map((key) => {
              const cfg = PORTALS[key];
              const Icon = cfg.icon;
              const active = activePortal === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivePortal(key)}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-base font-bold transition-colors duration-200 cursor-pointer ${
                    active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-blue-900 stroke-[2.5]' : 'text-slate-400'} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Error ── */}
          {(localError || error) && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{localError || error}</span>
              </div>
              {suggestedPortal && suggestedPortal !== activePortal && (
                <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                  <span className="text-red-500 text-xs">{t('wrongPortalText', 'Wrong portal?')}</span>
                  <button
                    type="button"
                    onClick={() => setActivePortal(suggestedPortal)}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    {t('switchToPortal', 'Switch to')} {PORTALS[suggestedPortal]?.label} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Form with compact margins and increased font sizes ── */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label htmlFor="login-email" className="block text-base font-bold text-slate-800 mb-0.5">
                {t('phoneOrEmailLabel', 'Phone Number or Email')}
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('phoneOrEmailPlaceholder', 'Phone Number or Email')}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-base sm:text-[17px] text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 font-semibold"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-base font-bold text-slate-800 mb-0.5">
                {t('passwordLabel', 'Password')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-base sm:text-[17px] text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 font-semibold"
                  style={{ fontFamily: 'inherit' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
              style={{ background: portal.color }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  {t('signingIn', 'Signing in...')}
                </span>
              ) : (
                <>
                  {t('btnSignIn', 'Sign In')}
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          {/* ── Register Link ── */}
          <div className="mt-4 text-center">
            <Link
              to={portal.registerLink}
              className="text-sm sm:text-base font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {portal.registerText} <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
