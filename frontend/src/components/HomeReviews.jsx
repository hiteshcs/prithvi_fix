import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Star, ShieldCheck, CheckCircle2, Award, HeartHandshake,
  Volume2, VolumeX, Sparkles, User, Wrench, Zap, Droplets,
  Hammer, SprayCan, ArrowRight, Quote, Building2, MapPin,
  Calendar, IndianRupee, MessageSquare, Briefcase, Check
} from 'lucide-react';

export default function HomeReviews() {
  const { speakText, stopSpeaking, isSpeaking, activeSpeakingId } = useAccessibility();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'customer' | 'worker'
  const [selectedTrade, setSelectedTrade] = useState('all'); // 'all' | 'electrical' | 'plumbing' | 'home'
  const [loading, setLoading] = useState(true);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [workerReviews, setWorkerReviews] = useState([]);
  const [stats, setStats] = useState({
    overallAverageRating: 4.9,
    totalCustomerReviews: 4850,
    customerSatisfactionRate: '99.4%',
    workerSatisfactionRate: '98.6%',
    activeArtisans: 50,
    livingWageCompliance: '93% Direct Payout (93-2-5 Model)',
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getFeaturedReviews()
      .then((res) => {
        if (!isMounted) return;
        if (res.customerReviews) setCustomerReviews(res.customerReviews);
        if (res.workerReviews) setWorkerReviews(res.workerReviews);
        if (res.stats) setStats(res.stats);
      })
      .catch((err) => {
        console.warn('Featured reviews fetch notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleSpeakReview = (id, textToRead) => {
    if (activeSpeakingId === id && isSpeaking) {
      stopSpeaking();
    } else {
      speakText(textToRead, { id });
    }
  };

  // Build combined list
  const combinedList = [
    ...customerReviews.map(c => ({ ...c, reviewerType: 'customer' })),
    ...workerReviews.map(w => ({ ...w, reviewerType: 'worker' })),
  ];

  const filteredItems = combinedList.filter(item => {
    // 1. Perspective filter
    if (activeTab === 'customer' && item.reviewerType !== 'customer') return false;
    if (activeTab === 'worker' && item.reviewerType !== 'worker') return false;

    // 2. Trade filter
    if (selectedTrade !== 'all' && item.category !== selectedTrade) return false;

    return true;
  });

  const getTradeIcon = (cat) => {
    switch (cat) {
      case 'electrical':
        return <Zap size={14} className="text-amber-600" />;
      case 'plumbing':
        return <Droplets size={14} className="text-blue-600" />;
      case 'home':
        return <Hammer size={14} className="text-emerald-600" />;
      default:
        return <Wrench size={14} className="text-indigo-600" />;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50/60 to-white px-4 border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles size={14} className="text-amber-500" />
            <span>{t('heroTrustBadge', 'Community Voice • Dual-Perspective Trust')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t('reviewsHeading', 'Trusted by Citizens. Empowering Artisans.')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
            {t('reviewsSub', 'Real feedback from households enjoying fixed transparent tariffs and skilled trade artisans building secure, dignified livelihoods through our labour cooperative.')}
          </p>
        </div>

        {/* High-Trust Metrics Ribbon */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 text-left divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="pt-2 md:pt-0 md:px-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-2xl sm:text-3xl">
              <Star className="fill-amber-400 text-amber-400" size={24} />
              <span>4.9 / 5</span>
            </div>
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mt-1">
              {t('statCitizenSat', 'Citizen Satisfaction')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('statVerifiedBookings', 'Over 4,850+ verified bookings')}</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-black text-2xl sm:text-3xl">
              <CheckCircle2 size={24} />
              <span>98.6%</span>
            </div>
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mt-1">
              {t('statArtisanSat', 'Artisan Satisfaction')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('statZeroExploitation', 'Zero commission exploitation')}</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4">
            <div className="flex items-center gap-1.5 text-blue-400 font-mono font-black text-2xl sm:text-3xl">
              <IndianRupee size={24} />
              <span>93-2-5</span>
            </div>
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mt-1">
              {t('statLivingWage', 'Living Wage Payout')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('statDailyPayout', 'Direct daily bank/UPI transfer')}</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4">
            <div className="flex items-center gap-1.5 text-purple-400 font-mono font-black text-2xl sm:text-3xl">
              <ShieldCheck size={24} />
              <span>100%</span>
            </div>
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mt-1">
              {t('statVerifiedGuaranteed', 'Verified & Guaranteed')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('statSkillWarranty', 'Skill certified + 30-day free warranty')}</p>
          </div>
        </div>

        {/* Dual-Perspective Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">

          {/* Main Perspective Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${activeTab === 'all'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <Sparkles size={14} className={activeTab === 'all' ? 'text-amber-400' : 'text-slate-400'} />
              <span>{t('tabAllReviews', 'All Reviews')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white ml-1">
                {combinedList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${activeTab === 'customer'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <User size={14} className={activeTab === 'customer' ? 'text-blue-300' : 'text-slate-400'} />
              <span>{t('tabCitizenVoices', 'Customer Reviews')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-bold ml-1">
                {customerReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('worker')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${activeTab === 'worker'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <Wrench size={14} className={activeTab === 'worker' ? 'text-amber-400' : 'text-slate-400'} />
              <span>{t('tabArtisanVoices', 'Worker Reviews')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold ml-1">
                {workerReviews.length}
              </span>
            </button>
          </div>

          {/* Trade Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: t('filterAllTrades', 'All Trades') },
              { id: 'electrical', label: t('filterElectrical', '⚡ Electrical & AC') },
              { id: 'plumbing', label: t('filterPlumbing', '🚰 Plumbing') },
              { id: 'home', label: t('filterHome', '🔨 Carpentry & Home') },
            ].map((trade) => (
              <button
                key={trade.id}
                type="button"
                onClick={() => setSelectedTrade(trade.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${selectedTrade === trade.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
              >
                {trade.label}
              </button>
            ))}
          </div>

        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {filteredItems.map((item) => {
            const isWorker = item.reviewerType === 'worker';
            const speakTextContent = isWorker
              ? `Artisan Review by ${item.name}, ${item.trade} at ${item.cooperative}. Quote: ${item.highlight}. Experience: ${item.comment}`
              : `Customer Review by ${item.name} from ${item.location} for service ${item.serviceName}. Rating: 5 out of 5 stars. Review: ${item.comment}`;

            return (
              <div
                key={item.id}
                className={`scroll-reveal-card home-interactive-card flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 border shadow-2xs hover:shadow-md ${isWorker
                    ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200/90 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-blue-900'
                  }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs border ${isWorker
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-blue-900 text-white border-blue-800'
                          }`}
                      >
                        {item.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                            {item.name}
                          </h4>
                          {item.verified && (
                            <span
                              title="Verified by Labour Cooperative"
                              className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${isWorker
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                            >
                              <Check size={10} className="stroke-[3]" />
                              <span>{isWorker ? 'Artisan Member' : 'Verified Booking'}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          {isWorker ? (
                            <span>{item.trade} • <strong className="text-slate-700">{item.experience}</strong></span>
                          ) : (
                            <>
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span>{item.location}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Speech / Audio Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakReview(item.id, speakTextContent)}
                      title={activeSpeakingId === item.id && isSpeaking ? 'Stop voice' : 'Listen to this review'}
                      className={`p-1.5 rounded-lg border transition shrink-0 ${activeSpeakingId === item.id && isSpeaking
                          ? 'bg-amber-500 text-white border-amber-600 animate-pulse font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      {activeSpeakingId === item.id && isSpeaking ? (
                        <VolumeX size={15} />
                      ) : (
                        <Volume2 size={15} />
                      )}
                    </button>
                  </div>

                  {/* Rating Stars & Service / Cooperative Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-black text-slate-800 ml-1 font-mono">5.0</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                      {getTradeIcon(item.category)}
                      <span className="truncate max-w-[130px]">{item.categoryLabel}</span>
                    </span>
                  </div>

                  {/* Worker Highlight Quote */}
                  {isWorker && item.highlight && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-200/80 text-amber-950 font-bold text-xs leading-snug flex items-start gap-2">
                      <Quote size={16} className="text-amber-700 shrink-0 rotate-180 mt-0.5" />
                      <span>{item.highlight}</span>
                    </div>
                  )}

                  {/* Customer Service Badge */}
                  {!isWorker && item.serviceName && (
                    <div className="mb-2.5 text-xs font-extrabold text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-blue-700 shrink-0" />
                      <span className="truncate">{item.serviceName}</span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal mb-4 line-clamp-3">
                    "{item.comment}"
                  </p>

                  {/* Customer Sub-scores Pill Bar */}
                  {!isWorker && item.scores && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-0.5">
                        <Check size={11} className="text-emerald-600" /> Punctuality: <strong className="text-slate-800">5.0</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Check size={11} className="text-emerald-600" /> Workmanship: <strong className="text-slate-800">5.0</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Check size={11} className="text-emerald-600" /> Zero Surge: <strong className="text-slate-800">100%</strong>
                      </span>
                    </div>
                  )}

                  {/* Worker Impact Metrics Strip */}
                  {isWorker && item.metrics && (
                    <div className="grid grid-cols-2 gap-2 mb-4 bg-white p-2.5 rounded-xl border border-amber-200/70 shadow-2xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Avg Monthly</span>
                        <span className="text-xs font-black text-emerald-700 font-mono">{item.metrics.monthlyIncome}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Completed</span>
                        <span className="text-xs font-black text-slate-900 font-mono">{item.metrics.completedJobs}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-blue-600 shrink-0" />
                          <span>{item.metrics.welfare}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Attributions & Assurance */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  {/* Customer Card Footer */}
                  {!isWorker && (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Serviced by: <strong className="text-slate-900 font-bold">{item.servicedBy}</strong>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{item.date}</span>
                      </div>

                      {item.workerReply && (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 italic">
                          <strong className="not-italic text-slate-800 font-semibold">Artisan Reply: </strong>
                          "{item.workerReply}"
                        </div>
                      )}
                    </>
                  )}

                  {/* Worker Card Footer */}
                  {isWorker && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                        <Building2 size={13} className="text-amber-700 shrink-0" />
                        <span className="truncate">{item.cooperative}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Affiliation: LCF Certified Member</span>
                        <span>Member since {item.joinedYear}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cooperative Social Proof Footer Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
              <HeartHandshake size={12} />
              The Cooperative Difference
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Fair for Citizens. Life-Changing for Workers.
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              When you book through Prithvi Fix, 93% of the payment reaches the technician’s hands with 5% credited toward their social security fund. Zero corporate middlemen, 100% community upliftment.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/book-service"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-center"
            >
              <span>Book a Verified Artisan</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/register?role=worker"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition flex items-center justify-center gap-2 text-center"
            >
              <span>Join as Cooperative Worker</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
