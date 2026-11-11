import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShieldCheck, CheckCircle2, Star, ArrowRight, ArrowLeft,
  Clock, Zap, IndianRupee, BadgePercent, Users, Heart,
  Sparkles, Wrench, Snowflake, Wind, Check, ChevronDown, ChevronUp,
  HelpCircle, AlertCircle, Share2, Info, Droplets, Plug, Layers,
  PhoneCall, ShieldAlert, CheckSquare
} from 'lucide-react';
import { calculate9325Split } from '../data/rateCardData';
import { getProcessStepsForService } from '../utils/serviceProcessData';

// AC Service Pricing Matrix (Quantity tiers)
const SERVICE_TIERS = [
  {
    id: 1,
    qty: '1 AC',
    name: 'Foam-Jet Service (1 Split or Window AC)',
    time: '60-75 mins',
    coopPrice: 499,
    commercialPrice: 649,
    badge: 'Standard'
  },
  {
    id: 2,
    qty: '2 ACs',
    name: 'Foam-Jet Service (2 ACs Pack)',
    time: '2 hours',
    coopPrice: 899,
    commercialPrice: 1298,
    badge: 'Most Popular',
    recommended: true
  },
  {
    id: 3,
    qty: '3 ACs',
    name: 'Foam-Jet Service (3 ACs Family Pack)',
    time: '2.5 - 3 hours',
    coopPrice: 1299,
    commercialPrice: 1947,
    badge: 'Maximum Savings'
  }
];

// 5-Step Process Data matching the Urban Company reference
const PROCESS_STEPS = [
  {
    step: 1,
    title: 'Pre-service checks & diagnostic sensor audit',
    desc: 'Pre-service inspection includes a complimentary refrigerant gas pressure check via our calibrated digital manifold gauge and electrical compressor load testing.',
    image: '/services/step1-preservice.jpg',
    points: ['Operating suction & discharge pressure logged', 'Compressor amp draw & earthing check', 'Airflow CFM baseline reading']
  },
  {
    step: 2,
    title: 'Indoor unit foam-jet deep cleaning',
    desc: 'Indoor cooling unit is cleaned via non-caustic bio foam and high-pressure jet spray. A leak-proof waterproof service apron protects walls, floors, and furniture.',
    image: '/services/step2-indoor.jpg',
    points: ['Evaporator coil fin chemical foam scrub', 'Blower rotor & drain tray descaling', 'Antibacterial sanitization of air louvers']
  },
  {
    step: 3,
    title: 'Outdoor unit rotary high-pressure cleaning',
    desc: 'The outdoor unit is thoroughly pressure-washed to dislodge choked mud, lint, and street soot from aluminum heat exchanger fins for optimal heat dissipation.',
    image: '/services/step3-outdoor.jpg',
    points: ['High-pressure rotary jet spray wash', 'Condenser coil fin alignment', 'Motor blade balance check']
  },
  {
    step: 4,
    title: 'Transparent gas refilling (strictly if required)',
    desc: 'Zero unneeded gas top-ups. If the digital gauge shows pressure loss, we share a locked fixed rate card quote and only refill after customer digital approval.',
    image: '/services/step4-gas.jpg',
    points: ['Pre-approved rate card quote', 'Pure virgin R32 / R410A canister check', 'Zero hidden conveyance surcharge']
  },
  {
    step: 5,
    title: 'Final clean-up & delta-T performance test',
    desc: 'The work area is wiped dry and cleaned. The technician conducts a digital laser thermometer test confirming a 10°C–14°C temperature drop across supply and return louvers.',
    image: '/services/step5-cleanup.jpg',
    points: ['Area wiped clean with zero mess', 'Laser thermometer delta-T verification', 'Customer sign-off & digital warranty receipt']
  }
];

// Brand list
const BRANDS = [
  { name: 'Voltas', badge: 'Tata Product' },
  { name: 'Daikin', badge: 'Inverter Expert' },
  { name: 'LG', badge: 'Dual Inverter' },
  { name: 'Blue Star', badge: 'Precision Cool' },
  { name: 'Hitachi', badge: 'Japanese Tech' },
  { name: 'Panasonic', badge: 'Eco-Smart' },
  { name: 'Samsung', badge: 'WindFree' },
  { name: 'Haier', badge: 'Heavy Duty' },
  { name: 'Godrej', badge: 'Green Inverter' },
  { name: 'Mitsubishi', badge: 'Heavy Industries' },
  { name: 'Lloyd', badge: 'Havells Brand' },
  { name: 'Carrier', badge: 'Commercial / Home' }
];

// Frequently Asked Questions
const FAQS = [
  {
    q: 'Are spare parts covered under warranty?',
    a: 'Yes. All replacement capacitors, sensors, copper joints, and PCB repairs sourced through Prithvi Fix carry a 30-day to 12-month manufacturer-backed ISI warranty. You receive a digital warranty certificate directly in your citizen portal.'
  },
  {
    q: 'What if the same issue occurs again within 30 days?',
    a: 'Under our 30-Day Prithvi Suraksha Cover, if the same issue arises within 30 days of service due to the artisan\'s workmanship, a certified Master Artisan will re-inspect and re-service at ₹0 labour fee. You just need to raise the issue from your dashboard.'
  },
  {
    q: 'How can I verify the repair quote shared by the professional?',
    a: 'Every repair quote is strictly pre-validated against the official Prithvi Fix Fixed Rate Card, which is set by the State Apex Federation Head. You can cross-check all part prices and capped labour charges directly on our public Rate Card page before approving any work.'
  },
  {
    q: 'What if I am charged extra or asked for tips?',
    a: 'Prithvi Fix enforces a strict Zero Surge & Zero Unregulated Surcharge policy. Artisans receive 93% directly into their bank account plus 5% social security, so tipping is never expected or required. If any excess fee is demanded, contact our grievance desk immediately for an investigation and refund.'
  },
  {
    q: 'Will the professional bring all the necessary tools and parts?',
    a: 'Yes. Every certified artisan arrives with a trade-specific toolkit. Commonly needed ISI-approved spare parts (capacitors, gaskets, valves, etc.) are also sourced from our cooperative locked price matrix and brought for the visit. If a specialized part needs ordering, the artisan will inform you before proceeding.'
  },
  {
    q: 'What happens if anything is damaged during the service?',
    a: 'All bookings are automatically covered under Prithvi Suraksha Cover with up to ₹10,000 property damage protection. In the unlikely event of accidental damage, claims are settled with 1-click documentation through your dashboard. No lengthy paperwork or insurance calls required.'
  },
  {
    q: 'Can I watch the artisan work to understand the problem?',
    a: 'Absolutely. Our artisans are trained to explain the issue and repair steps in simple language. Transparency is a core cooperative value — you are always welcome to observe, ask questions, and approve any parts replacement before it is done.'
  },
  {
    q: 'How long does a typical service appointment take?',
    a: 'Most standard servicing appointments (AC cleaning, minor electrical work, pipe repairs) are completed within 1–2 hours. Complex repairs or multi-appliance jobs may take 3–4 hours. The artisan will estimate the time on arrival after initial inspection.'
  },
  {
    q: 'Can I book for multiple appliances in one visit?',
    a: 'Yes. You can mention multiple appliances or issues in the booking notes. For institutional or bulk work (5+ appliances, large premises), use the Institutional Booking option for a coordinated squad deployment at a negotiated cooperative rate.'
  },
  {
    q: 'What if the artisan cannot fix the problem?',
    a: 'If the artisan determines the appliance is beyond repair or needs a part that must be factory-sourced, they will provide a detailed assessment report with no labour charge for the diagnostic visit. You will not be charged for work that could not be completed.'
  },
  {
    q: 'Do I need to be present during the service?',
    a: 'Yes, an adult (18+) must be present during the service. For the first booking with a new artisan, this is especially important for identity verification. You can share a trusted family member\'s presence if you are unavailable.'
  },
  {
    q: 'How is the artisan assigned to my booking?',
    a: 'Artisans are matched based on trade skills, proximity to your location, cooperative zone, availability, and rating. Senior artisans (Master tier) are auto-assigned for complex services. You can also request a specific artisan you have worked with before.'
  },
];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(SERVICE_TIERS[1]); // Default to 2 ACs
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const sopData = getProcessStepsForService(service);

  useEffect(() => {
    const serviceId = id || '1';
    api.getServiceById(serviceId)
      .then((data) => setService(data.service))
      .catch((err) => {
        console.warn('Fallback to default AC service data:', err);
        setService({
          id: 1,
          name: 'Foam-Jet AC Deep Service & Overhaul',
          category: 'Appliance Repair',
          description: 'High-pressure chemical foam wash of indoor and outdoor coils, blower rotor, drain tray, and laser delta-T performance calibration.',
          base_price: 499,
          price_unit: 'per_ac'
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const currentSplit = calculate9325Split(selectedTier.coopPrice);
  const savingsAmount = selectedTier.commercialPrice - selectedTier.coopPrice;
  const savingsPct = Math.round((savingsAmount / selectedTier.commercialPrice) * 100);

  const handleProceedToBooking = () => {
    navigate(`/book-service?serviceId=${service?.id || 1}&qty=${selectedTier.id}&search=ac%20cooling`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* ── Breadcrumbs & Back Nav ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Link to="/services" className="hover:text-blue-900 flex items-center gap-1 font-bold text-slate-700">
              <ArrowLeft size={14} />
              <span>All Services</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span>{service?.category || 'Appliance Repair'}</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-950 font-bold truncate max-w-[200px] sm:max-w-xs">
              {service?.name || 'Foam-Jet AC Service'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/rate-card"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition"
            >
              <BadgePercent size={13} />
              <span>93-2-5 Rate Card</span>
            </Link>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 transition"
              title="Share service link"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ── 1. Hero Card: Service Title, Foam-Jet Visual & Multi-Unit Selector ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Info & Pricing */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-wide">
                    <Snowflake size={12} className="text-blue-600" />
                    Appliance Deep Care
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    30-Day Free Warranty
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                  Foam-Jet AC Service & Deep Overhaul
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  High-pressure active foam dissolves deep evaporator coil sludge and bacterial biofilm. Restores rapid 15-minute room cooling and lowers power bills by up to 25%.
                </p>

                {/* Cooperative Rating Marker */}
                <div className="flex items-center gap-3 text-xs mb-6 pb-4 border-b border-slate-100">
                  <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-md text-xs border border-slate-200">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>4.85</span>
                  </div>
                  <span className="text-slate-600 font-semibold">2.4k+ Verified Bookings</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">100% Verified Skilled Artisans</span>
                </div>

                {/* Quantity / Unit Tier Selector */}
                <div className="mb-6">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select AC Quantity / Tier
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {SERVICE_TIERS.map((tier) => {
                      const isSelected = selectedTier.id === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedTier(tier)}
                          className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${isSelected
                              ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-900/10 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          {tier.recommended && (
                            <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-black rounded uppercase tracking-wider shadow-2xs">
                              Best Value
                            </span>
                          )}
                          <div>
                            <div className={`text-xs font-bold ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                              {tier.qty}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {tier.time}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <span className="text-sm font-black text-slate-900 font-mono">
                              ₹{tier.coopPrice}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through ml-1 font-mono">
                              ₹{tier.commercialPrice}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 93-2-5 Transparent Split Box for Selected Tier */}
                <div className="bg-slate-900 text-white rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <BadgePercent size={15} />
                      <span>93-2-5 Cooperative Economic Model</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Save {savingsPct}% vs Commercial Apps
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800 text-xs">
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Artisan Direct (93%)</span>
                      <strong className="text-emerald-400 font-mono text-sm">₹{currentSplit.artisanShare}</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Platform Ops (2%)</span>
                      <strong className="text-blue-300 font-mono text-sm">₹{currentSplit.platformFee}</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">PF & ESIC Fund (5%)</span>
                      <strong className="text-white font-mono text-sm">₹{currentSplit.welfareFund}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleProceedToBooking}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>Book {selectedTier.qty} (₹{selectedTier.coopPrice})</span>
                  <ArrowRight size={16} />
                </button>
                <Link
                  to="/rate-card"
                  className="px-4 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Rate Card</span>
                </Link>
              </div>
            </div>

            {/* Right: Realistic Hero Photography */}
            <div className="lg:col-span-5 relative bg-slate-900 min-h-[260px] lg:min-h-full">
              <img
                src="/services/ac-foam-jet-hero.jpg"
                alt="HVAC technician performing foam jet cleaning on indoor AC unit"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 text-slate-900 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Deep Antimicrobial Foam-Wash</div>
                    <div className="text-[10px] text-slate-600">Zero wall splatter with leak-proof protection apron</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Highlights Strip (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-amber-600" />
            <span>Highlights</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Highly rated by citizens for optimal cooling & lower energy bills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Universal Compatibility:</strong> Applicable for both Split & Window ACs of all tonnages (0.8T – 2.5T).</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Active Foam-Jet Indoor Wash:</strong> Deep chemical foam wash dissolves embedded coil mold and grime.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Rotary Outdoor Jet-Spray:</strong> Removes stubborn road soot, dust, and mud from outdoor condenser fins.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Splatter Guarantee:</strong> Heavy-duty waterproof jacket channels waste water directly into collection bucket.</span>
            </div>
          </div>
        </div>

        {/* ── 3. Four Core Benefits of Foam-Jet Cleaning (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 inline-block mb-2">
              Why Foam-Jet Cleaning?
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Transformative Performance & Longevity
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Standard dry servicing only cleans the outer mesh. Foam-Jet penetrates deep between micro-fins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Deep cleans vents & filters',
                desc: 'Clears microscopic mold, pollen, and dust choked inside the blower rotor.',
                icon: Wind,
                color: 'text-blue-600 bg-blue-50 border-blue-100'
              },
              {
                title: '35% Better room cooling',
                desc: 'Restores uninhibited factory CFM airflow for rapid 15-minute room temperature drop.',
                icon: Snowflake,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
              },
              {
                title: 'Lower electricity bills',
                desc: 'Unchoked condenser coils decrease compressor operating current by up to 25%.',
                icon: Zap,
                color: 'text-amber-600 bg-amber-50 border-amber-100'
              },
              {
                title: 'Prolongs AC lifespan',
                desc: 'Anti-rust protective rinse prevents premature copper coil corrosion and gas pinholes.',
                icon: ShieldCheck,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-xs transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${feat.color}`}>
                    <IconComp size={20} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Transparent AC Diagnosis with Prithvi AI & Digital Sensor (From PDF) ── */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider mb-3">
                <ShieldCheck size={13} />
                Free Gas Level Check Included
              </span>
              <h2 className="text-xl sm:text-2xl font-black mb-2">
                Transparent AC Diagnosis with Digital Sensors
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Zero gas refills without certified digital pressure gauge readings. Our cooperative artisans record live suction & discharge PSI before recommending any refrigerant service.
              </p>
            </div>

            <button
              onClick={() => setShowHowItWorksModal(!showHowItWorksModal)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0"
            >
              <span>{showHowItWorksModal ? 'Hide Details' : 'How it works →'}</span>
            </button>
          </div>

          {/* Expandable "How It Works" Section */}
          {showHowItWorksModal && (
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="font-semibold text-white mb-1">1. Digital Manifold Hookup</div>
                <p className="text-slate-300 text-[11px]">
                  Technician connects a digital pressure gauge to the low-pressure service port on the outdoor condenser.
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="font-semibold text-white mb-1">2. Live PSI Logged</div>
                <p className="text-slate-300 text-[11px]">
                  Prithvi AI records the operating pressure (e.g. 120-135 PSI for R32). If levels are optimal, gas refill is strictly disallowed.
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="font-semibold text-white mb-1">3. Regulated Tariff Quote</div>
                <p className="text-slate-300 text-[11px]">
                  If a leak is confirmed, quotation is pre-locked against our statutory rate card with 0% middleman markup.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. Our 5-Step Process (The Process Roadmap with Photos - From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider px-3 py-1 bg-blue-50 rounded-full border border-blue-200 inline-block mb-2">
              Cooperative Standard Operating Procedure
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Our 5-Step Certified Work Process
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {sopData.categoryTag} • Estimated Duration: {sopData.estDuration}
            </p>
          </div>

          <div className="space-y-6">
            {(sopData.steps || PROCESS_STEPS).map((step) => (
              <div
                key={step.step}
                className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white transition shadow-2xs"
              >
                {/* Photo Thumbnail */}
                <div className="md:col-span-5 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 min-h-[180px] relative">
                  <img
                    src={step.image || `/services/step${step.step}-preservice.jpg`}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-slate-900/40 flex items-center justify-center p-4">
                    <div className="text-center text-white space-y-1">
                      <div className="text-2xl font-black font-mono">STEP {step.step}</div>
                      <div className="text-xs font-medium text-slate-200 uppercase tracking-wider">{step.title}</div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Step {step.step} of 5
                  </div>
                </div>

                {/* Description & Checkpoints */}
                <div className="md:col-span-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-950 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {step.desc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {step.points.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <Check size={13} className="text-emerald-600 shrink-0 font-bold" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 30-Day Warranty & Prithvi Suraksha Cover Card ── */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-900/50 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-300">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  Cooperative Safety Net
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  30-Day Workmanship Warranty
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  With up to ₹10,000 property damage protection cover. If the same issue arises within 30 days, we re-service at ₹0 cost with zero hassle.
                </p>
              </div>
            </div>

            <Link
              to="/rate-card"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Know More & View Cover →</span>
            </Link>
          </div>
        </div>

        {/* ── 7. What's Included & What We Will Need From You (From PDF) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What's included */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckSquare size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">What's Included</h2>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Free digital inspection & gas check</strong> followed by locked cooperative service quotation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Dual-stage foam & jet wash</strong> of both indoor evaporator coils and outdoor condenser fins.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Final system delta-T check</strong> with laser thermometer post-servicing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Complete clean-up</strong> of the indoor work area and drain tray.</span>
              </li>
            </ul>
          </div>

          {/* What we will need from you */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Info size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">What We Will Need From You</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 mx-auto mb-2 text-blue-600 flex items-center justify-center">
                  <Droplets size={20} />
                </div>
                <div className="text-xs font-bold text-slate-800">Bucket & Water</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Continuous tap supply</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 mx-auto mb-2 text-amber-600 flex items-center justify-center">
                  <Plug size={20} />
                </div>
                <div className="text-xs font-bold text-slate-800">Power Point</div>
                <div className="text-[10px] text-slate-500 mt-0.5">16A standard socket</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 mx-auto mb-2 text-emerald-600 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div className="text-xs font-bold text-slate-800">Ladder or Stool</div>
                <div className="text-[10px] text-slate-500 mt-0.5">For elevated units</div>
              </div>
            </div>

            {/* Please note notice */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>Warranty covers cooperative-procured ISI parts and certified artisan workmanship.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <AlertCircle size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>Outer condenser unit cleaned with jet spray if safely accessible (balcony, terrace, or low ledge).</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. We Service All Major Brands (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Multi-Brand Expertise
            </span>
            <h2 className="text-xl font-black text-slate-900">
              We Service All AC Brands & Models
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Equipped with OEM diagnostic protocols for rotary, dual-inverter, and scroll compressors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRANDS.map((b, i) => (
              <div
                key={i}
                className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-xl p-3 text-center transition flex flex-col items-center justify-center min-h-[72px]"
              >
                <div className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-wide">
                  {b.name}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-medium">
                  {b.badge}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-4">
            Brand trademarks and logos are used strictly for trade identification purposes.
          </div>
        </div>

        {/* ── 9. Top Professionals / Cooperative Artisans (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider px-3 py-1 bg-blue-50 rounded-full border border-blue-200 inline-block mb-3">
                Cooperative Certified Workforce
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Top Skilled Trade Professionals
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                Unlike private aggregator apps where gig workers face high commission penalties, our artisans are registered members of regional Labour Cooperative Federations with guaranteed dignity and social security.
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>100% Police Background & Aadhaar Verified</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>300+ Hours of Specialized Vocational HVAC Training</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Certified under Skill India & Trade Standards</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Direct 93% Living Wage Payout & ESIC Healthcare Backing</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="w-56 h-56 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md relative bg-slate-100">
                <img
                  src="/services/top-artisan.jpg"
                  alt="Certified Cooperative Artisan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white p-2 rounded-lg text-center">
                  <div className="text-[11px] font-bold">Dilip Barik</div>
                  <div className="text-[9px] text-emerald-300">Gold Master Artisan • 7 Yrs Exp</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 10. Frequently Asked Questions (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Clear, transparent answers with zero hidden terms.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-blue-900 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 11. Customer Reviews & Community Trust Score (From PDF) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-4 text-center sm:border-r sm:border-slate-200 sm:pr-6">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">
                4.85
              </div>
              <div className="flex items-center justify-center gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs font-bold text-slate-600">Based on 2,410+ ratings</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">98% Satisfied Citizens</div>
            </div>

            <div className="sm:col-span-8 space-y-2 text-xs">
              {[
                { star: 5, pct: 88, count: '2,120' },
                { star: 4, pct: 9, count: '216' },
                { star: 3, pct: 2, count: '48' },
                { star: 2, pct: 1, count: '16' },
                { star: 1, pct: 0, count: '10' }
              ].map((row) => (
                <div key={row.star} className="flex items-center gap-2">
                  <span className="w-8 font-bold text-slate-700 flex items-center gap-0.5 text-xs">
                    {row.star} <Star size={10} className="fill-slate-400 text-slate-400" />
                  </span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[11px] text-slate-500 font-mono">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 12. Sticky Bottom Booking Bar (Mobile & Desktop) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">
                Selected Package: <span className="text-blue-950 font-black">{selectedTier.qty}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                  ₹{selectedTier.coopPrice}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{selectedTier.commercialPrice}
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Save ₹{savingsAmount}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/rate-card"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-900 border border-slate-200 px-3 py-2 rounded-xl"
            >
              <FileText size={13} />
              <span>Full Rate Card</span>
            </Link>
            <button
              onClick={handleProceedToBooking}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold py-2.5 sm:py-3 px-5 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              <span>Book Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
