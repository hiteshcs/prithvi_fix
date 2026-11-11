import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  User, UserPlus, UserCheck, Briefcase, Mail, Lock, Phone, MapPin, Building2,
  AlertCircle, ShieldCheck, Award, Wrench, FileText, CheckCircle2,
  ChevronRight, ChevronLeft, Landmark, CreditCard, Sparkles, Check, Clock
} from 'lucide-react';

const TRADES = [
  { id: 'Electrical', name: 'Electrical Engineering & Wiring', icon: '⚡' },
  { id: 'Plumbing', name: 'Plumbing & Sanitary Works', icon: '🚰' },
  { id: 'Appliance Repair', name: 'AC & Home Appliance Servicing', icon: '🔧' },
  { id: 'Painting', name: 'Painting & Waterproofing Works', icon: '🎨' },
  { id: 'Carpentry', name: 'Carpentry & Teak Furniture', icon: '🔨' },
  { id: 'Cleaning', name: 'Deep Cleaning & Sanitization', icon: '🧹' },
  { id: 'Gardening', name: 'Horticulture & Landscaping', icon: '🌱' },
  { id: 'Caregiving', name: 'Elderly & Patient Caregiving', icon: '❤️' },
  { id: 'Driving', name: 'Certified Driver Transit', icon: '🚗' },
  { id: 'Domestic Services', name: 'Domestic Housekeeping', icon: '🏠' },
  { id: 'Technician Services', name: 'IT & Hardware Technician', icon: '💻' },
  { id: 'Emergency Services', name: '24/7 Emergency Priority Trades', icon: '🚨' },
];

const SKILL_SUGGESTIONS = {
  'Electrical': ['Single-Phase Wiring', '3-Phase Industrial', 'Inverter & Solar UPS', 'MCB Short Circuit Faults', 'Concealed Conduit', 'Appliance Earthing'],
  'Plumbing': ['CPVC Concealed Piping', 'Overhead Tank Cleaning', 'Bathroom Sanitary Fixtures', 'Water Pump Motor Repair', 'Drainage Unclogging'],
  'Appliance Repair': ['Inverter AC Gas Charging', 'Refrigerator Compressor PCB', 'Washing Machine Motor', 'Microwave Magnetron', 'Water Purifier RO Membrane'],
  'Painting': ['Waterproof Acrylic Primer', 'Exterior Weathercoat', 'Interior Wall Putty', 'Texture & Stencil Design', 'Enamel Wood Polish'],
  'Carpentry': ['Modular Kitchen Hinges', 'Door Lock Fitting', 'Teakwood Framing', 'Sofa & Bed Repair', 'Plywood Partition'],
  'Cleaning': ['Kitchen Degreasing', 'Bathroom Floor Scrubbing', 'Sofa Shampooing', 'Balcony Sanitization', 'Post-Construction Cleanup'],
  'Gardening': ['Lawn Mowing & Leveling', 'Organic Pest Spray', 'Bonsai & Floral Pruning', 'Balcony Planter Setup'],
  'Caregiving': ['Geriatric Mobility Care', 'Post-Op Vital Monitoring', 'Physiotherapy Support', 'Emergency First Aid'],
  'Driving': ['Manual Gearbox', 'Automatic Transmission', 'Inter-District Highway Transit', 'Night Driving Certified'],
  'Domestic Services': ['Nutritious Meal Cooking', 'Dusting & Floor Mopping', 'Apparel Ironing', 'Dishwashing'],
  'Technician Services': ['CCTV Camera IP Setup', 'Fiber WiFi Router Splicing', 'Desktop OS & Motherboard Diagnostics', 'UPS Battery Setup'],
  'Emergency Services': ['Live Phase Short Circuit Control', 'Main Water Line Burst Clamping', 'Emergency Night Callout'],
};

export default function Register() {
  const { lang, t } = useLanguage();
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected Role: 'CUSTOMER' | 'WORKER' | 'FEDERATION'
  const urlRole = searchParams.get('role');
  const initialRole = urlRole === 'worker' ? 'WORKER' : (urlRole === 'federation' || urlRole === 'society' || urlRole === 'admin') ? 'FEDERATION' : 'CUSTOMER';
  const [role, setRole] = useState(initialRole);

  // Sync role with URL search param if it changes
  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole === 'worker') {
      setRole('WORKER');
    } else if (paramRole === 'customer') {
      setRole('CUSTOMER');
    } else if (paramRole === 'federation' || paramRole === 'society' || paramRole === 'admin') {
      setRole('FEDERATION');
    }
  }, [searchParams]);

  // Worker Wizard Step (1: Basic, 2: Skills & Work, 3: Certifications, 4: KYC & Bank, 5: Success)
  const [wizardStep, setWizardStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    district: 'Khordha',
    city: 'Bhubaneswar',
    address: '',
    pincode: '751024',

    // Federation Specifics
    societyName: '',
    isNlcfAffiliated: true,
    initialCapitalBalance: 25000,
    cooperativeBankName: 'District Central Cooperative Bank',

    // Step 2: Trade Skills & Work Profile
    primaryTrade: 'Electrical',
    subSkills: ['Single-Phase Wiring', 'MCB Short Circuit Faults'],
    experienceYears: 3,
    toolsOwned: 'Digital Multimeter, Heavy Hammer Drill, Safety Gloves, Wire Stripper, Soldering Kit',
    dailyAvailability: 'FULL_TIME',
    bio: 'Certified artisan with extensive hands-on experience in residential and commercial installations.',

    // Step 3: Certifications
    certificationType: 'SKILL_NCVT',
    certificationName: 'National Trade Certificate (NTC) — Electrician',
    issuingOrganization: 'State Skill Development Council / NCVT',
    certificateNumber: 'SKILL-OD-2022-8821',
    issueDate: '2022-07-15',
    hasUploadedCert: true,

    // Step 4: KYC & Banking Details
    aadhaarNumber: '',
    panNumber: '',
    rationCard: '',
    bankName: 'State Bank of India',
    bankAccount: '',
    confirmBankAccount: '',
    bankIfsc: 'SBIN0001234',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse',
    acceptedUndertaking: false,

    // Worker Affiliation: Primary Cooperative Society (Mandatory)
    affiliationType: 'SOCIETY',
    society_id: '',
  });

  const [societiesList, setSocietiesList] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDistricts() {
      try {
        const res = await api.getDistricts({ is_portal_active: 1 });
        if (isMounted && res.success && res.districts && res.districts.length > 0) {
          setAvailableDistricts(res.districts);
        }
      } catch (err) {
        console.error('Failed to load registered districts:', err);
      }
    }
    loadDistricts();
    return () => { isMounted = false; };
  }, []);

  const DISTRICT_FALLBACK_SOCIETIES = {
    Khordha: [
      { id: 1, name: 'Shramik Kalyan Labour Cooperative Samiti', society_code: 'SOC-OD-2024-001' },
      { id: 2, name: 'Kalinga Shramik Seva Sahakari Samiti', society_code: 'SOC-OD-2026-004' },
      { id: 3, name: 'Ekamra Multi-Trade Artisan Cooperative', society_code: 'SOC-OD-2024-007' },
      { id: 4, name: 'Chandaka-Patia Tech-Artisan Cooperative Samiti', society_code: 'SOC-OD-2026-008' },
    ],
    Cuttack: [
      { id: 5, name: 'Utkal Shilpi Seva Sahakari Samiti', society_code: 'SOC-OD-2024-002' },
      { id: 6, name: 'Mahanadi Shilpi Sahakari Samiti', society_code: 'SOC-OD-2026-005' },
      { id: 7, name: 'Barabati Urban Crafts & Maintenance Cooperative', society_code: 'SOC-OD-2024-009' },
      { id: 8, name: 'Silver City Artisan Guild Cooperative', society_code: 'SOC-OD-2026-010' },
    ],
    Puri: [
      { id: 9, name: 'Jagannath Nirman Sahakari Federation', society_code: 'SOC-OD-2026-003' },
      { id: 10, name: 'Konark Karigar Sahakari Samiti', society_code: 'SOC-OD-2024-006' },
      { id: 11, name: 'Srikshetra Coastal Facility Cooperative Samiti', society_code: 'SOC-OD-2024-011' },
      { id: 12, name: 'Brahmagiri Rural Artisan & Craft Cooperative', society_code: 'SOC-OD-2026-012' },
    ],
  };

  useEffect(() => {
    let isMounted = true;
    async function loadSocieties() {
      if (role !== 'WORKER') return;
      setLoadingSocieties(true);
      try {
        const res = await api.getSocietiesList({ district: formData.district });
        if (isMounted) {
          let list = [];
          if (res.success && res.societies && res.societies.length > 0) {
            list = res.societies;
          } else {
            list = DISTRICT_FALLBACK_SOCIETIES[formData.district] || DISTRICT_FALLBACK_SOCIETIES['Khordha'];
          }
          setSocietiesList(list);
          if (list.length > 0) {
            setFormData((prev) => ({
              ...prev,
              society_id: prev.society_id && list.some((s) => String(s.id) === String(prev.society_id))
                ? prev.society_id
                : String(list[0].id),
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load societies for worker registration:', err);
        if (isMounted) {
          const fallbackList = DISTRICT_FALLBACK_SOCIETIES[formData.district] || DISTRICT_FALLBACK_SOCIETIES['Khordha'];
          setSocietiesList(fallbackList);
          if (fallbackList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              society_id: prev.society_id && fallbackList.some((s) => String(s.id) === String(prev.society_id))
                ? prev.society_id
                : String(fallbackList[0].id),
            }));
          }
        }
      } finally {
        if (isMounted) setLoadingSocieties(false);
      }
    }
    loadSocieties();
    return () => { isMounted = false; };
  }, [formData.district, role]);

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [submittedApplicationNo, setSubmittedApplicationNo] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleSubSkill = (skill) => {
    const current = [...formData.subSkills];
    const index = current.indexOf(skill);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(skill);
    }
    setFormData((prev) => ({ ...prev, subSkills: current }));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Please enter your full legal name.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please enter a valid email address.';
    if (!formData.phone.trim() || formData.phone.length < 10) return 'Please enter a valid 10-digit mobile number.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    if (!formData.address.trim()) return 'Please provide your residential address for police & federation records.';
    if (role === 'WORKER' && !formData.society_id) {
      return 'Please select your local Primary Cooperative Society from the list.';
    }
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.primaryTrade) return 'Please select your primary trade.';
    if (formData.subSkills.length === 0) return 'Please select at least one sub-skill specialization.';
    if (!formData.toolsOwned.trim()) return 'Please list the primary tools and safety equipment you own.';
    return null;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!formData.certificateNumber.trim()) return 'Please provide your Trade Certificate or Registration Number.';
    if (!formData.issuingOrganization.trim()) return 'Please provide the name of the issuing Institute / Board.';
    return null;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.replace(/\D/g, '').length < 12) {
      return 'Please enter a valid 12-digit Aadhaar Card number for statutory verification.';
    }
    if (!formData.panNumber.trim() || formData.panNumber.length < 10) {
      return 'Please enter a valid 10-character PAN Card number.';
    }
    if (!formData.bankAccount.trim()) {
      return 'Please enter your bank account number for direct 93% instant earnings payout.';
    }
    if (formData.bankAccount !== formData.confirmBankAccount) {
      return 'Bank account numbers do not match.';
    }
    if (!formData.bankIfsc.trim()) {
      return 'Please enter the Bank Branch IFSC Code.';
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      return 'Please provide an emergency contact name and phone number.';
    }
    if (!formData.acceptedUndertaking) {
      return 'You must accept the statutory legal undertaking under the Multi-State Cooperative Societies Act.';
    }
    return null;
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setLocalError('');
    let err = null;
    if (wizardStep === 1) err = validateStep1();
    else if (wizardStep === 2) err = validateStep2();
    else if (wizardStep === 3) err = validateStep3();

    if (err) {
      setLocalError(err);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setWizardStep((prev) => prev + 1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setLocalError('');
    setWizardStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Handle Submission (Customer 1-step or Worker Final step)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');

    if (role === 'CUSTOMER') {
      const err = validateStep1();
      if (err) {
        setLocalError(err);
        return;
      }
    } else if (role === 'FEDERATION') {
      if (!formData.societyName.trim()) {
        setLocalError('Please enter the Society / Federation Name.');
        return;
      }
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setLocalError('Please fill in Federation Administrator Name, Email, and Password.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    } else {
      const err = validateStep4();
      if (err) {
        setLocalError(err);
        return;
      }
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role === 'FEDERATION' ? 'COOPERATIVE_ADMIN' : role,
        district: formData.district,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,

        // Federation specifics
        societyName: formData.societyName,
        isNlcfAffiliated: formData.isNlcfAffiliated,
        initialCapitalBalance: formData.initialCapitalBalance,
        cooperativeBankName: formData.cooperativeBankName,

        // Worker rich fields
        primaryTrade: formData.primaryTrade,
        subSkills: formData.subSkills,
        experienceYears: formData.experienceYears,
        toolsOwned: formData.toolsOwned,
        bio: formData.bio,
        certifications: [
          {
            certificationName: formData.certificationName,
            issuingOrganization: formData.issuingOrganization,
            certificateNumber: formData.certificateNumber,
            issueDate: formData.issueDate,
            documentUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400',
          },
        ],
        aadhaarNumber: formData.aadhaarNumber,
        panNumber: formData.panNumber.toUpperCase(),
        rationCard: formData.rationCard,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankIfsc: formData.bankIfsc.toUpperCase(),
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        affiliation_type: formData.affiliationType,
        society_id: formData.affiliationType === 'SOCIETY' ? formData.society_id : null,
      });

      if (role === 'WORKER') {
        const appNo = `APP-OD-2026-${String(1000 + (user?.id || 88)).padStart(4, '0')}`;
        setSubmittedApplicationNo(appNo);
        setWizardStep(5); // Success step
      } else if (role === 'FEDERATION') {
        navigate('/federation/portal');
      } else {
        navigate('/customer/bookings');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3 sm:py-5 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Top Sleek Civic Header (Minimized Margins & Wide View) ── */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 mb-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <img
            src="/logo.png"
            alt="National Cooperative Seal"
            className="w-4 h-4 object-contain"
          />
          <span className="text-[11px] font-black tracking-wider text-blue-950 uppercase">
            Labour Cooperatives Federation • Autonomous Apex Body
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Official Cooperative Portal Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl mx-auto leading-relaxed">
          Enroll under the Multi-State Cooperative Societies Act, 2002 for statutory benefits, verified citizen services, and artisan accreditation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-2.5 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-0.5 rounded-md border border-slate-200/60">
            <ShieldCheck size={13} className="text-blue-900" /> 100% Statutory Protection
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-0.5 rounded-md border border-slate-200/60">
            <Sparkles size={13} className="text-amber-600" /> Zero Surge Pricing
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-0.5 rounded-md border border-slate-200/60">
            <Award size={13} className="text-emerald-600" /> Direct 93% Instant Payout
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-0.5 rounded-md border border-slate-200/60">
            <Phone size={13} className="text-indigo-600" /> Toll-Free: 1800-345-7788
          </span>
        </div>
      </div>

      {/* ── Category Selection Cards (Wide 3-Card Grid) ── */}
      {wizardStep !== 5 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              Select Registration Category:
            </label>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Instant statutory verification & cooperative onboarding
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1: Citizen / Customer */}
            <button
              type="button"
              onClick={() => {
                setRole('CUSTOMER');
                setWizardStep(1);
                setLocalError('');
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                role === 'CUSTOMER'
                  ? 'border-blue-900 bg-blue-50/70 text-blue-950 shadow-md ring-2 ring-blue-900/15'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'CUSTOMER' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  <UserCheck size={20} />
                </div>
                {role === 'CUSTOMER' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-900 text-white shadow-2xs">
                    <Check size={11} strokeWidth={3} /> Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Select →</span>
                )}
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">{t('tabCitizen', 'Citizen')} / Customer</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">Book verified cooperative services at standard rates</div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1 text-[10px] font-bold text-slate-500">
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">Zero Surge</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">10-Day Warranty</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">Direct Support</span>
              </div>
            </button>

            {/* Card 2: Skilled Worker / Artisan */}
            <button
              type="button"
              onClick={() => {
                setRole('WORKER');
                setWizardStep(1);
                setLocalError('');
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                role === 'WORKER'
                  ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-700/15'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'WORKER' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Briefcase size={20} />
                </div>
                {role === 'WORKER' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-800 text-white shadow-2xs">
                    <Check size={11} strokeWidth={3} /> Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Select →</span>
                )}
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">{t('tabArtisan', 'Artisan')} / Skilled Worker</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">Accreditation, live dispatches, 93% daily pay & welfare</div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1 text-[10px] font-bold text-slate-500">
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">93% Instant Pay</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">₹5L Cover</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">Govt ID Badge</span>
              </div>
            </button>

            {/* Card 3: Society / Federation */}
            <button
              type="button"
              onClick={() => {
                setRole('FEDERATION');
                setWizardStep(1);
                setLocalError('');
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                role === 'FEDERATION'
                  ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-md ring-2 ring-amber-600/15'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'FEDERATION' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Building2 size={20} />
                </div>
                {role === 'FEDERATION' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-2xs">
                    <Check size={11} strokeWidth={3} /> Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Select →</span>
                )}
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">{t('tabAdmin', 'Admin')} / Cooperative Society</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">Formation charter, tenders & apex governance console</div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1 text-[10px] font-bold text-slate-500">
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">LCF Tenders</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">Charter Wizard</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">Dual Desk</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Form Canvas ── */}
      <div className="bg-white p-5 sm:p-7 md:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-950/5 space-y-5">
        {/* ── WORKER MULTI-STEP WIZARD PROGRESS BAR ── */}
        {role === 'WORKER' && wizardStep !== 5 && (
          <div className="pt-1 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-emerald-900 font-mono text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                Step {wizardStep} of 4: {
                  wizardStep === 1 ? 'Personal & Identity' :
                  wizardStep === 2 ? 'Trade Skills & Tools' :
                  wizardStep === 3 ? 'Certifications & Skill Credentials' : 'KYC & Bank Details'
                }
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                {wizardStep * 25}% Completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-400 rounded-full"
                style={{ width: `${wizardStep * 25}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs font-semibold">
              {[
                { num: 1, label: 'Identity & Contact' },
                { num: 2, label: 'Skills & Tools' },
                { num: 3, label: 'Certifications' },
                { num: 4, label: 'KYC & Bank' }
              ].map(s => (
                <div
                  key={s.num}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition ${
                    wizardStep === s.num
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs'
                      : wizardStep > s.num
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    wizardStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : wizardStep === s.num
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wizardStep > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(localError || error) && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2 shadow-2xs">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE A: SUCCESS STEP (Worker Application Submitted)
           ───────────────────────────────────────────────────────────── */}
        {role === 'WORKER' && wizardStep === 5 && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded bg-blue-100 text-blue-900 border border-blue-200">
                Application Received
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
                Worker Accreditation Dossier Submitted
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
                Your application has been forwarded to your chosen Primary Cooperative Society (<strong>{societiesList.find((s) => String(s.id) === String(formData.society_id))?.name || `${formData.district} Labour Cooperative`}</strong>) for physical & skill credential verification.
              </p>
            </div>

            {/* Official Receipt Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Application Number:</span>
                <span className="font-mono font-bold text-blue-950">{submittedApplicationNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant Name:</span>
                <span className="font-bold text-slate-800">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Trade:</span>
                <span className="font-bold text-emerald-800">{formData.primaryTrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chosen Cooperative Society:</span>
                <span className="font-semibold text-blue-900">
                  {societiesList.find((s) => String(s.id) === String(formData.society_id))?.name || `${formData.district} Labour Cooperative`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approval Authority:</span>
                <span className="font-bold text-emerald-900">
                  {societiesList.find((s) => String(s.id) === String(formData.society_id))?.name || 'Primary Cooperative Society'} (Primary Society)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 leading-snug">
                ⚖️ <strong>Statutory Division:</strong> The approval authority for artisans is the registered <strong>Primary Cooperative Society</strong> you chose. (The DCO is the approval authority for Societies, while the Society evaluates &amp; approves its member artisans).
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Current Process Stage:</span>
                <span className="gov-stamp text-amber-800 border-amber-400 bg-amber-50">
                  ⏳ STEP 2 OF 4: PRIMARY SOCIETY KYC SCRUTINY
                </span>
              </div>
            </div>

            {/* Next Steps Roadmap */}
            <div className="text-left text-xs text-slate-700 bg-blue-50/60 p-4 rounded-xl border border-blue-200 max-w-lg mx-auto space-y-2">
              <strong className="text-blue-950 block">Accreditation Verification Roadmap (4 Stages):</strong>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <Check size={14} className="text-emerald-700" />
                  <span>Stage 1. Digital Form &amp; KYC Submission: Completed ✓</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900 font-bold bg-white/70 p-1.5 rounded-lg border border-amber-300">
                  <Clock size={14} className="text-amber-600 animate-pulse" />
                  <span>Stage 2. Primary Society Document &amp; KYC Audit: In Progress</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block text-center text-[9px]">3</span>
                  <span>Stage 3. Physical Trade Skill &amp; Tool Inspection by Society Committee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block text-center text-[9px]">4</span>
                  <span>Stage 4. Final Management Committee Resolution &amp; Badge Issuance</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/worker/dashboard"
                className="btn btn-primary w-full max-w-md py-3 text-xs font-bold"
              >
                Proceed to Worker Dashboard & Track Review Status →
              </Link>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE B: CITIZEN REGISTRATION (1 STEP) OR WORKER STEP 1
           ───────────────────────────────────────────────────────────── */}
        {(role === 'CUSTOMER' || role === 'WORKER') && wizardStep === 1 && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {role === 'WORKER' ? 'Step 1: Personal & Identity Information' : 'Citizen Account Details'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {role === 'WORKER'
                    ? 'Legal name and residential details required for cooperative police & federation records.'
                    : 'Enter your details to create your verified citizen account and book cooperative services.'}
                </p>
              </div>
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            {/* Row 1: Name, Email, Phone in 3-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="name"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: District, City, Pincode in 3-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Landmark size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                  >
                    {availableDistricts.length > 0 ? (
                      availableDistricts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Khordha">Khordha</option>
                        <option value="Cuttack">Cuttack</option>
                        <option value="Puri">Puri</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City / Local Town <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Building2 size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="city"
                    placeholder="e.g. Saheed Nagar, Bhubaneswar"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="pincode"
                    placeholder="e.g. 751007"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all font-mono placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Address (Full Width) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Residential Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-start">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <textarea
                  rows={2}
                  name="address"
                  placeholder="Plot / Flat No, Building Name, Street / Landmark Area"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Row 4: Password Pair in 2-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    placeholder="Re-type password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Mandatory Worker Primary Cooperative Society Selection */}
            {role === 'WORKER' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider">
                      Designated Primary Cooperative Society <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Every skilled artisan must be registered with a local primary cooperative society in <strong>{formData.district}</strong> for accident insurance, trade accreditation & dispatch management.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    <span>Select Your Local Society ({formData.district} District)</span>
                    {loadingSocieties ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        Fetching societies...
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        {societiesList.length} Societies Available
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Building2 size={16} className="absolute left-3.5 text-blue-900 pointer-events-none" />
                    <select
                      name="society_id"
                      value={formData.society_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-blue-300 bg-white rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-xs sm:text-sm font-bold text-slate-900 transition-all outline-none shadow-xs cursor-pointer"
                    >
                      {societiesList.map((soc) => (
                        <option key={soc.id} value={soc.id}>
                          {soc.name} ({soc.society_code || `SOC-${soc.id}`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-blue-900 bg-white/80 p-2 rounded-lg border border-blue-200">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>⚖️ <strong>Statutory Approval Authority:</strong> Your artisan application will be evaluated, credentialed, and directly approved by this Primary Cooperative Society (not the DCO).</span>
                </div>
              </div>
            )}

            {localError && role === 'WORKER' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2 shadow-2xs">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span className="font-medium">{localError}</span>
              </div>
            )}

            <div className="pt-2">
              {role === 'WORKER' ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-emerald-700 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span className="text-white drop-shadow-xs">Proceed to Step 2: Trade Skills &amp; Tools</span>
                  <ChevronRight size={18} className="text-white" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-blue-900 bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-950 hover:to-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-white drop-shadow-xs">{loading ? 'Creating Citizen Account...' : 'Register as Citizen →'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE B2: COOPERATIVE SOCIETY / FEDERATION REGISTRATION
           ───────────────────────────────────────────────────────────── */}
        {role === 'FEDERATION' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 text-xs text-amber-950 flex items-start gap-3">
              <Building2 size={22} className="shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 block text-xs sm:text-sm">
                  Cooperative Society & Federation Portal Registration
                </strong>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Societies & Federations affiliate with State & regional federations (like <strong>LCF</strong>) for operational coordination, subsidized NCCT training, and access to large institutional public contracts.
                </p>
                <div className="mt-2 text-[11px] font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-300">
                  ⚖️ <strong>Statutory Approval Authority:</strong> All Primary Cooperative Society registrations and charters are subject to legal scrutiny, audit, and statutory approval by the <strong>District Cooperative Officer (DCO) & Registrar of Cooperative Societies</strong>.
                </div>
              </div>
            </div>

            {/* 2 Pathways Wide Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border-2 border-blue-900 bg-blue-50/40 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full">
                    New Unregistered Societies
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mt-2">
                    9-Step Legal Formation Charter Wizard
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Full statutory dossier with 10 founding members roster, model bylaws, ₹10k bank deposit check, affidavit, and Registrar tracking.
                  </p>
                </div>
                <Link
                  to="/society/register"
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 flex items-center justify-center gap-2 shadow-xs transition"
                >
                  Launch 9-Step Formation Wizard <ChevronRight size={15} />
                </Link>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Formed Societies / Federations
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mt-2">
                    Quick Federation Leadership Account
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Complete the form below to create your official federation administrator credentials and access the dual-console desk immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('federation-quick-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                >
                  Fill Quick Registration Below ↓
                </button>
              </div>
            </div>

            {/* Quick Federation Onboarding Form */}
            <div id="federation-quick-form" className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Federation / Society Details & Leadership Account
              </h3>

              {/* Row 1: Society Name, District */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Society / Federation Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Building2 size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      name="societyName"
                      placeholder="e.g. Kalinga Shramik Seva Sahakari Federation"
                      value={formData.societyName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    District Jurisdiction <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Landmark size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                    >
                      {availableDistricts.length > 0 ? (
                        availableDistricts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} District
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Khordha">Khordha District</option>
                          <option value="Cuttack">Cuttack District</option>
                          <option value="Puri">Puri District</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Capital, Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cooperative Bank Account / Partner Bank
                  </label>
                  <div className="relative flex items-center">
                    <Landmark size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      name="cooperativeBankName"
                      placeholder="e.g. District Central Cooperative Bank (DCCB)"
                      value={formData.cooperativeBankName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Share Capital Fund (₹)
                  </label>
                  <div className="relative flex items-center">
                    <CreditCard size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      name="initialCapitalBalance"
                      value={formData.initialCapitalBalance}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Admin Leader Name, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Federation Admin / Secretary Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      name="name"
                      placeholder="e.g. Bijoy Mohanty"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="e.g. federation@coop.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Mobile / Contact <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Password Pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Admin Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      name="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Admin Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <ShieldCheck size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      name="confirmPassword"
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* LCF Affiliation Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is-nlcf-reg"
                  name="isNlcfAffiliated"
                  checked={formData.isNlcfAffiliated}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-600 rounded cursor-pointer shrink-0"
                />
                <label htmlFor="is-nlcf-reg" className="text-xs sm:text-sm font-bold text-amber-950 cursor-pointer">
                  🌟 Affiliate with Labour Cooperatives Federation (LCF) — Unlocks "Trusted Federation" badge & institutional tender contracts.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-extrabold bg-amber-600 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-white drop-shadow-xs">{loading ? 'Registering Society / Federation...' : 'Register Society / Federation & Enter Portal →'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE C: WORKER STEP 2 (Trade Skills & Equipment)
           ───────────────────────────────────────────────────────────── */}
        {role === 'WORKER' && wizardStep === 2 && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Step 2: Trade Skills, Specializations & Tools Owned
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your primary trade category and sub-skills for smart cooperative dispatch matching.
              </p>
            </div>

            {/* Row 1: Primary Trade, Experience, Availability in 3-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Trade Category <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <select
                    name="primaryTrade"
                    value={formData.primaryTrade}
                    onChange={(e) => {
                      const newTrade = e.target.value;
                      const suggestions = SKILL_SUGGESTIONS[newTrade] || [];
                      setFormData((prev) => ({
                        ...prev,
                        primaryTrade: newTrade,
                        subSkills: suggestions.slice(0, 2),
                      }));
                    }}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                  >
                    {TRADES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Years of Trade Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Award size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                  >
                    <option value={1}>1 Year (Apprentice)</option>
                    <option value={2}>2 Years (Junior Artisan)</option>
                    <option value={3}>3 to 5 Years (Skilled Artisan)</option>
                    <option value={6}>6 to 10 Years (Senior Artisan)</option>
                    <option value={12}>10+ Years (Master Artisan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Working Availability <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Clock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <select
                    name="dailyAvailability"
                    value={formData.dailyAvailability}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="FULL_TIME">Full-Time (8:00 AM - 8:00 PM)</option>
                    <option value="MORNING_SHIFT">Morning Shift (8:00 AM - 2:00 PM)</option>
                    <option value="EVENING_SHIFT">Evening Shift (2:00 PM - 9:00 PM)</option>
                    <option value="EMERGENCY_24X7">24x7 Emergency Rapid Response Squad</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sub-Skill Badges Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Sub-Specializations & Practical Skills <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {formData.subSkills.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(SKILL_SUGGESTIONS[formData.primaryTrade] || []).map((skill) => {
                  const isSelected = formData.subSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSubSkill(skill)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Tools Owned, Bio Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Tools & Safety Gear Owned <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Wrench size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="toolsOwned"
                    required
                    placeholder="e.g. Digital Multimeter, Heavy Hammer Drill, Pipe Wrench, Safety Helmet & Gloves"
                    value={formData.toolsOwned}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brief Professional Bio / Background Summary
                </label>
                <textarea
                  rows={2}
                  name="bio"
                  placeholder="Describe your trade background, major residential or commercial projects..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="py-3 px-6 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-700 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <span className="text-white drop-shadow-xs">Step 3: Certifications &amp; Skill Credentials →</span>
                <ChevronRight size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE D: WORKER STEP 3 (Trade Certifications)
           ───────────────────────────────────────────────────────────── */}
        {role === 'WORKER' && wizardStep === 3 && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Step 3: Trade Certifications & Skill Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cooperative federation rules require state or national trade accreditation records.
              </p>
            </div>

            {/* Row 1: Certification Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Certification Category <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Award size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <select
                  name="certificationType"
                  value={formData.certificationType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                >
                  <option value="SKILL_NCVT">National Trade Certificate (NCVT / SCVT)</option>
                  <option value="NSDC_SKILL_INDIA">NSDC Skill India Pradhan Mantri Kaushal Card</option>
                  <option value="STATE_TRADE_GUILD">National Labour Welfare Board Trade License</option>
                  <option value="RPL_PRIOR_LEARNING">Recognition of Prior Learning (RPL) Level 4 Certificate</option>
                  <option value="DIPLOMA_POLYTECHNIC">State Polytechnic Technical Diploma</option>
                </select>
              </div>
            </div>

            {/* Row 2: Title, Number, Organization, Date in Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certificate / Course Title <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <FileText size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="certificationName"
                    placeholder="e.g. National Trade Certificate — Electrician"
                    value={formData.certificationName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certificate / Roll No. <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CreditCard size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="certificateNumber"
                    placeholder="e.g. SKILL-OD-2022-8821"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issuing Institute / Training Center <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  name="issuingOrganization"
                  placeholder="e.g. State Skill Council / NCVT Board"
                  value={formData.issuingOrganization}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">Trade Certificate Scan Copy (Simulated Upload)</div>
                  <div className="text-slate-500 text-[11px]">PDF / JPG format up to 5 MB • Verified by Apex Council</div>
                </div>
              </div>
              <span className="gov-seal-verified shrink-0">
                ✓ Document Attached
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="py-3 px-6 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-700 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <span className="text-white drop-shadow-xs">Step 4: Statutory KYC &amp; Bank →</span>
                <ChevronRight size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CASE E: WORKER STEP 4 (Statutory KYC & Banking)
           ───────────────────────────────────────────────────────────── */}
        {role === 'WORKER' && wizardStep === 4 && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Step 4: Statutory KYC & Bank Account Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Required for direct 93% instant pay settlement, PF & ESIC accident coverage, and police verification.
              </p>
            </div>

            {/* Row 1: Aadhaar, PAN, Ration Card in 3-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Aadhaar Card Number (12 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="aadhaarNumber"
                    placeholder="e.g. 5678 1234 9012"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PAN Card Number (10 Characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CreditCard size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="panNumber"
                    placeholder="e.g. ABCDE1234F"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono uppercase text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Prithvi Artisan / Ration Card No. (Optional)
                </label>
                <div className="relative flex items-center">
                  <FileText size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="rationCard"
                    placeholder="e.g. OD-BPL-2024-8871"
                    value={formData.rationCard}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Bank Details in 4-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Landmark size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="bankName"
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Account No. <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CreditCard size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    name="bankAccount"
                    placeholder="Account Number"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Account No. <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CreditCard size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="confirmBankAccount"
                    placeholder="Re-type Account No."
                    value={formData.confirmBankAccount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank IFSC Code <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Landmark size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="bankIfsc"
                    placeholder="e.g. SBIN0001234"
                    value={formData.bankIfsc}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold font-mono uppercase text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Emergency Contacts in 3-Column Wide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    name="emergencyContactName"
                    placeholder="e.g. Minati Kumar"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Mobile <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    name="emergencyContactPhone"
                    placeholder="e.g. 9876500000"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-3 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs cursor-pointer"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child / Dependent</option>
                </select>
              </div>
            </div>

            {/* Legal Undertaking Checkbox */}
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl text-xs space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  name="acceptedUndertaking"
                  checked={formData.acceptedUndertaking}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer shrink-0"
                />
                <span className="text-amber-950 leading-relaxed font-medium text-xs sm:text-sm">
                  <strong>Statutory Declaration:</strong> I hereby declare under the <em>Multi-State Cooperative Societies Act, 2002</em> that all trade skills, certificates, and KYC credentials submitted are authentic. I understand my application is subject to physical & police verification by District Cooperative Federation Officers before live dispatch activation.
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="py-3.5 px-6 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-700 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <span className="text-white drop-shadow-xs">{loading ? 'Submitting Application...' : 'Submit Accreditation Application →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Member Link */}
        {wizardStep !== 5 && (
          <div className="mt-5 text-center text-xs sm:text-sm text-slate-500 border-t border-slate-100 pt-4">
            Already registered on the platform?{' '}
            <Link to="/login" className="font-bold text-blue-900 hover:underline">
              Sign In via SSO Portal →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
