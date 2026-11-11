import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import {
  HelpCircle, PhoneCall, ShieldAlert, MessageSquare, ChevronDown,
  ChevronUp, CheckCircle2, FileText, Send, Search, BookOpen,
  IndianRupee, Shield, Users, UserPlus, Zap, ArrowRight, X, Clock,
  CheckCircle, LifeBuoy
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all',                label: 'All Questions',      icon: BookOpen },
  { id: 'Booking & Services', label: 'Booking & Services', icon: Zap },
  { id: 'Pricing & Payment',  label: 'Pricing & Payment',  icon: IndianRupee },
  { id: 'Workers & Quality',  label: 'Workers & Quality',  icon: Users },
  { id: 'Safety & Trust',     label: 'Safety & Trust',     icon: Shield },
  { id: 'Registration',       label: 'Registration',       icon: UserPlus },
];

const FAQS = [
  // ── Booking & Services ──
  {
    category: 'Booking & Services',
    q: 'How do I book a service on Prithvi Fix?',
    a: 'Browse the Services page, select your service, choose your location and preferred date/time, and click "Book Service". You will be matched with a verified cooperative artisan within minutes. You can also use the AI chatbot for voice-guided booking assistance.'
  },
  {
    category: 'Booking & Services',
    q: 'How does Prithvi Fix verify worker credentials?',
    a: 'Every worker is affiliated with a licensed District Labour Cooperative. Accredited trade certificates, NSDC skill cards, and state trade licenses are physically and digitally verified by the Cooperative Administration. Workers also undergo police background checks before activation.'
  },
  {
    category: 'Booking & Services',
    q: 'Can I choose a specific artisan for my booking?',
    a: 'Yes. After selecting a service, you can browse available verified artisans in your area and their ratings, experience years, and completed jobs. You may prefer a specific artisan, but availability depends on their schedule.'
  },
  {
    category: 'Booking & Services',
    q: 'How do emergency bookings work?',
    a: 'Emergency requests (e.g., electrical short circuits, major pipe bursts, AC failures during peak summer) are instantly routed to the nearest available verified cooperative worker. Average response time is under 60 minutes in urban centers. Emergency bookings are available 24/7.'
  },
  {
    category: 'Booking & Services',
    q: 'Can I reschedule or cancel a booking?',
    a: 'Yes. You can reschedule up to 2 hours before the service start time from your Customer Dashboard. Cancellations made more than 1 hour before the appointment are free of charge. Late cancellations may attract a nominal ₹50 platform fee.'
  },
  {
    category: 'Booking & Services',
    q: 'What services does Prithvi Fix offer?',
    a: 'Prithvi Fix offers 40+ services across Appliance Repair (AC, refrigerator, washing machine, geyser), Electrical, Plumbing, Carpentry, Painting, Home Cleaning, Gardening, Caregiving, and Driving. New services are added based on cooperative workforce availability.'
  },
  {
    category: 'Booking & Services',
    q: 'Is there a minimum service charge?',
    a: "Yes. A minimum service visit charge of ₹149 applies to cover the artisan's travel to your location. This amount is adjusted against the final service bill if the work is carried out."
  },
  {
    category: 'Booking & Services',
    q: 'What areas are currently covered?',
    a: "Currently Prithvi Fix operates across Khordha, Cuttack, and Puri districts of Odisha, covering 12 primary cooperative zones including Bhubaneswar (Saheed Nagar, Khandagiri, Patia, Old Town), Cuttack (Badambadi, Madhupatna, CDA, Silver City), and Puri (Grand Road, Konark, Sea Beach Road, Brahmagiri). New districts are being added under the State Apex Federation's expansion plan."
  },

  // ── Pricing & Payment ──
  {
    category: 'Pricing & Payment',
    q: 'What is the pricing model? Are there hidden fees?',
    a: 'Prices are standardized by the Apex Federation Head under cooperative statutory rules. The 93-2-5 model applies: 93% goes to the worker, 5% to welfare & insurance, 2% for platform maintenance. There are zero surge prices, zero algorithmic inflation, and zero hidden fees.'
  },
  {
    category: 'Pricing & Payment',
    q: 'Why are prices lower than commercial apps?',
    a: 'Because there is no private middleman, no VC investor commission, and no surge pricing algorithm. Prithvi Fix is run by the cooperative federation, so savings go directly to customers and workers instead of shareholders.'
  },
  {
    category: 'Pricing & Payment',
    q: 'What payment methods are accepted?',
    a: 'Prithvi Fix accepts UPI (PhonePe, Google Pay, Paytm), Net Banking, and Cash on Completion. Card payments will be available soon. All digital payments are secured and receipts are issued instantly.'
  },
  {
    category: 'Pricing & Payment',
    q: 'When do I pay — before or after the service?',
    a: 'For standard bookings you pay after the service is satisfactorily completed. For bulk/institutional orders above ₹5,000, a 20% advance is required at booking confirmation. Emergency bookings may also require advance UPI payment.'
  },
  {
    category: 'Pricing & Payment',
    q: 'Will I receive a bill or invoice for the service?',
    a: 'Yes. A digitally signed Form-IV Tax Invoice is generated for every completed booking, issued by the Primary Cooperative Society. Your invoice shows the itemized labour fee, spare parts used, and the 93-2-5 fund allocation. You can download it from your dashboard at any time.'
  },
  {
    category: 'Pricing & Payment',
    q: 'What if I am charged extra or asked for tips?',
    a: 'Zero Surge & Zero Unregulated Surcharge is strictly enforced. If any excess fee is demanded, contact our grievance desk immediately. We will investigate within 24 hours and execute a refund. Workers face cooperative disciplinary action for unregulated charging.'
  },

  // ── Workers & Quality ──
  {
    category: 'Workers & Quality',
    q: 'How are workers compensated?',
    a: "Under the transparent 93-2-5 model, 93% of every transaction goes directly to the worker's bank account. 5% funds ESIC insurance, PF contribution, and accident coverage. 2% covers digital platform infrastructure. Workers are paid within 24 hours of job completion."
  },
  {
    category: 'Workers & Quality',
    q: 'Are workers insured?',
    a: 'Yes. All verified cooperative workers are covered under ESIC health insurance, Pradhan Mantri Shram Yogi Maandhan pension, and up to ₹5 lakh group accident insurance through the cooperative welfare fund.'
  },
  {
    category: 'Workers & Quality',
    q: 'What qualifications do the workers have?',
    a: 'Workers hold ITI certificates, NSDC skill cards, or recognized trade qualifications in their specialization. Senior artisans (Master tier) have 5+ years of verified experience. All undergo periodic skill refresher training under NCCT cooperative programs.'
  },
  {
    category: 'Workers & Quality',
    q: 'Will the professional bring all necessary tools?',
    a: 'Yes. Every artisan arrives with a certified toolkit appropriate to their trade. AC technicians carry pressure gauges, chemical foam guns, and leak detectors. Electricians bring ISI-certified testers and conduit tools. Plumbers carry pipe cutters, CPVC jointing kits, and pressure test equipment.'
  },
  {
    category: 'Workers & Quality',
    q: 'What if I am not satisfied with the work?',
    a: 'You can rate the service and raise a complaint directly from your dashboard. The District Labour Cooperative officer reviews all complaints within 24 hours. Unsatisfactory work is remedied through a free rework visit or, if applicable, a refund under the cooperative quality assurance policy.'
  },
  {
    category: 'Workers & Quality',
    q: 'What is the 30-Day Prithvi Suraksha Cover?',
    a: "Every completed booking comes with a 30-day workmanship warranty. If the same issue recurs within 30 days due to the artisan's fault, a certified artisan revisits and fixes it at ₹0 labour cost. Property damage during service is covered up to ₹10,000."
  },
  {
    category: 'Workers & Quality',
    q: 'Are spare parts covered under warranty?',
    a: 'Yes. All replacement parts sourced through Prithvi Fix (capacitors, sensors, CPVC fittings, PCB components, etc.) are ISI-approved and carry a 6-month to 24-month manufacturer-backed warranty. A digital warranty certificate is issued in your citizen portal.'
  },

  // ── Safety & Trust ──
  {
    category: 'Safety & Trust',
    q: 'Is it safe to allow a worker into my home?',
    a: "Every Prithvi Fix worker has a verified photo ID, police background check clearance, and carries a digital cooperative membership card (QR-scannable). You can verify their identity in the app before they arrive. Workers' live location is tracked during active bookings."
  },
  {
    category: 'Safety & Trust',
    q: 'Can I track the artisan in real-time?',
    a: "Yes. Once a booking is accepted, you can track the worker's live location on the map from your Customer Dashboard. You will also receive SMS/push notifications when the artisan is 10 minutes away."
  },
  {
    category: 'Safety & Trust',
    q: 'What if I feel unsafe during the service?',
    a: 'Workers have a 1-tap SOS beacon on their dashboard that instantly alerts the cooperative supervisor and nearest emergency team. As a customer, you can also call our 24/7 Emergency Dispatch Helpline: 1800-345-7788.'
  },
  {
    category: 'Safety & Trust',
    q: 'How do I raise a dispute?',
    a: 'Go to your booking history, select the booking, and click "Raise Dispute". Provide a brief description and upload any photos. Your dispute is reviewed by the District Cooperative Officer within 48 hours and resolved within 7 working days.'
  },
  {
    category: 'Safety & Trust',
    q: 'Is my personal data safe?',
    a: 'Yes. Prithvi Fix stores all user data on encrypted servers. Your phone number and address are shared with the assigned artisan only after booking confirmation. Data handling follows IT Act 2000 and cooperative society data protection guidelines.'
  },

  // ── Registration & Membership ──
  {
    category: 'Registration',
    q: 'How do I register as a customer?',
    a: 'Click "Register" on the top navigation, choose "Customer" as your role, enter your mobile number, name, and area/district. OTP verification is used for mobile authentication. Registration is free and takes under 2 minutes.'
  },
  {
    category: 'Registration',
    q: 'How can a worker join the cooperative?',
    a: 'Workers can register through the platform by selecting the "Worker" role. After submitting trade certificates, Aadhaar, and skills, the registration is reviewed and approved by the local Primary Cooperative Society. Verification typically takes 3–5 working days.'
  },
  {
    category: 'Registration',
    q: 'Can a cooperative society register on Prithvi Fix?',
    a: 'Yes. Primary Labour Cooperative Societies can register through the Society Registration portal. Applications are reviewed by the District Cooperative Officer (DCO) for charter compliance under the Odisha Cooperative Societies Act 1962. Approved societies can then onboard workers and manage bookings in their operational zone.'
  },
  {
    category: 'Registration',
    q: 'Is there a membership fee for workers?',
    a: "No platform membership fee is charged from workers. Workers contribute to their cooperative society's welfare fund (as part of the standard 5% deduction), which provides them with ESIC health insurance, pension, and accident cover — far more valuable than any subscription fee."
  },
];

export default function Help() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', category: 'Booking Issue', description: '' });

  const filtered = useMemo(() => {
    let list = FAQS;
    if (activeCat !== 'all') list = list.filter(f => f.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, search]);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">

      {/* ── 1. CLEAN HERO & SEARCH ── */}
      <div className="bg-white border-b border-slate-200/90 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle size={14} className="text-blue-700" />
              <span>Public Support &amp; Grievance Redressal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Help Center &amp; FAQs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Find transparent answers regarding standardized cooperative tariffs, artisan verification, and booking support.
            </p>

            {/* Clean Centered Search Bar */}
            <div className="pt-2 max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search questions (e.g. warranty, cancellation, payment, artisan verification)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpenFaq(null); }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. HELPLINE CARDS (3 CLEAN CARDS ACROSS FULL WIDTH) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:border-red-300 transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-200/60">
              <ShieldAlert size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                24/7 Emergency Dispatch
              </div>
              <a href="tel:18003457788" className="text-base font-extrabold text-slate-900 font-mono hover:text-red-700 block">
                1800-345-7788
              </a>
              <div className="text-xs text-slate-500 truncate">Electrical fault, pipe burst, crisis</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200/60">
              <PhoneCall size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Federation Nodal Helpdesk
              </div>
              <a href="tel:06742540001" className="text-base font-extrabold text-slate-900 font-mono hover:text-blue-800 block">
                0674-254-0001
              </a>
              <div className="text-xs text-slate-500 truncate">General booking &amp; artisan verification</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <MessageSquare size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Worker Welfare &amp; Insurance
              </div>
              <a href="tel:18001129900" className="text-base font-extrabold text-slate-900 font-mono hover:text-emerald-800 block">
                1800-112-9900
              </a>
              <div className="text-xs text-slate-500 truncate">ESIC, pension &amp; welfare board claims</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CATEGORY PILL TABS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = cat.id === 'all' ? FAQS.length : FAQS.filter(f => f.category === cat.id).length;
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setOpenFaq(null); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{filtered.length}</strong> questions
          </div>
        </div>
      </div>

      {/* ── 4. FAQS IN BALANCED 2-COLUMN RESPONSIVE GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">No matching questions found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for different keywords or clear your search to browse all categories.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCat('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {filtered.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-2xs ${
                    isOpen ? 'border-blue-900 ring-1 ring-blue-900/10' : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1.5">
                        {faq.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {faq.q}
                      </h4>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isOpen ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. GRIEVANCE TICKETING & STATUTORY ASSURANCE (2 CLEAN COLUMNS) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F294A] to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                  <LifeBuoy size={14} /> Official Redressal Desk
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2">
                  Didn't find what you were looking for?
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mb-6">
                  Submit a formal ticket. Under Section 62 of the Odisha Cooperative Societies Act 1962, all citizen disputes are investigated by the District Cooperative Officer within 24 business hours.
                </p>

                <div className="space-y-3 text-xs text-blue-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    <span>24-Hour Nodal Redressal SLA</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    <span>Zero Bureaucracy 1-Click Warranty Claims</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    <span>Free Re-service Guarantee for 30 Days</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-[11px] text-blue-200 mt-6">
                Direct Federation Escalation: <strong className="text-white">nodal.officer@lcf.odisha.gov.in</strong>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 p-6 sm:p-8">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileText size={17} className="text-blue-900" />
                Submit a Grievance or Enquiry Ticket
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Fill out the form below. An SMS and email acknowledgment with your ticket ID will be sent instantly.
              </p>

              {ticketSubmitted ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-700" />
                  <h4 className="font-extrabold text-sm text-emerald-950">Grievance Ticket Registered</h4>
                  <p className="text-xs text-emerald-800">
                    Your Ticket ID: <span className="font-mono font-bold">GRV-2026-0894</span>
                  </p>
                  <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                    The District Cooperative Officer has been notified. You will receive a call or SMS update within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTicketSubmitted(false)}
                    className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra Das"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Grievance Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Booking Issue">Booking or Scheduling Issue</option>
                      <option value="Worker Quality">Artisan Quality / Workmanship Defect</option>
                      <option value="Payment Dispute">Payment or Form-IV Invoice Discrepancy</option>
                      <option value="Worker Welfare Claim">Worker Welfare or ESIC Claim</option>
                      <option value="Other">General Inquiry or Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Describe Your Issue *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Please provide booking ID (if any) and clear details of the issue..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Send size={13} />
                    <span>Submit Grievance Ticket</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
