import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, FileText, CheckCircle2, AlertCircle, ArrowRight,
  ArrowLeft, ShieldCheck, Landmark, UploadCloud, Search, Clock, Award,
  Sparkles, ChevronRight, FileCheck, Check, Plus, Trash2, HelpCircle
} from 'lucide-react';

export default function SocietyRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const initialTab = searchParams.get('tab') === 'dco_queue' || user?.admin_type === 'DCO_REGISTRAR'
    ? 'DCO_QUEUE'
    : (searchParams.get('tab') === 'track' ? 'TRACK_STATUS' : 'NEW_FORMATION');
  const [activeTab, setActiveTab] = useState(initialTab); // 'NEW_FORMATION', 'TRACK_STATUS', or 'DCO_QUEUE'

  // Wizard Steps (1 to 7 interactive form, 8 & 9 timeline tracking)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State with Applicant Account Credentials (Flowchart: Create a new Account - Email Id, Password)
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    registered_email: '',
    password: 'demo123',
    registered_phone: '',
    district: 'Khordha',
    federation_id: '',
    city: 'Bhubaneswar',
    address: '',
    pincode: '751001',
    objectives: 'To organize and empower skilled blue-collar artisans with fair statutory wages, social security welfare, and collective institutional contract bidding.',
    initial_capital_balance: 25000,
    bank_account_no: '',
    cooperative_bank_name: 'District Central Cooperative Bank',
    bank_ifsc: '',
  });

  // Regional Federations list for the selected district
  const [districtFederations, setDistrictFederations] = useState([]);
  const [loadingFederations, setLoadingFederations] = useState(false);
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
        console.error('Failed to load registered districts in SocietyRegistration:', err);
      }
    }
    loadDistricts();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFederations() {
      setLoadingFederations(true);
      try {
        const res = await api.getPublicFederations(formData.district);
        if (isMounted && res.success) {
          setDistrictFederations(res.federations || []);
          // If a federation was selected but it does not belong to this district, reset it
          if (formData.federation_id && formData.federation_id !== 'STANDALONE') {
            const exists = (res.federations || []).some((f) => String(f.id) === String(formData.federation_id));
            if (!exists) {
              setFormData((prev) => ({ ...prev, federation_id: '' }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load federations:', err);
      } finally {
        if (isMounted) setLoadingFederations(false);
      }
    }
    loadFederations();
    return () => { isMounted = false; };
  }, [formData.district]);

  // DCO Approvals Queue State
  const [dcoQueue, setDcoQueue] = useState([]);
  const [dcoLoading, setDcoLoading] = useState(false);
  const [dcoActionLoading, setDcoActionLoading] = useState(false);
  const [dcoActionSuccess, setDcoActionSuccess] = useState('');

  // Founding Members (Minimum 10 Required - Page 1)
  const [foundingMembers, setFoundingMembers] = useState([
    { full_name: 'Bibhuti Bhusan Sahoo', occupation: 'Master Electrician', address: 'Plot 12, Main Road', phone: '9861001101', aadhaar_number: '****-****-1101', role_in_society: 'PRESIDENT' },
    { full_name: 'Subhashree Mohanty', occupation: 'Accountancy Specialist', address: 'Lane 4, High Street', phone: '9861001102', aadhaar_number: '****-****-1102', role_in_society: 'SECRETARY' },
    { full_name: 'Prafulla Kumar Jena', occupation: 'Senior Master Plumber', address: 'Station Road', phone: '9861001103', aadhaar_number: '****-****-1103', role_in_society: 'TREASURER' },
    { full_name: 'Girish Chandra Dash', occupation: 'Senior Carpenter', address: 'Market Square', phone: '9861001104', aadhaar_number: '****-****-1104', role_in_society: 'MEMBER' },
    { full_name: 'Jayanti Pradhan', occupation: 'Appliance Technician', address: 'Colony Street 2', phone: '9861001105', aadhaar_number: '****-****-1105', role_in_society: 'MEMBER' },
    { full_name: 'Manoranjan Behera', occupation: 'Industrial Mason', address: 'Industrial Area', phone: '9861001106', aadhaar_number: '****-****-1106', role_in_society: 'MEMBER' },
    { full_name: 'Sasmita Sahoo', occupation: 'Decorative Painter', address: 'Temple Road', phone: '9861001107', aadhaar_number: '****-****-1107', role_in_society: 'MEMBER' },
    { full_name: 'Tuna Barik', occupation: 'Sanitary Specialist', address: 'Bus Stand Lane', phone: '9861001108', aadhaar_number: '****-****-1108', role_in_society: 'MEMBER' },
    { full_name: 'Bikash Mohapatra', occupation: 'Solar Technician', address: 'Green Energy Park', phone: '9861001109', aadhaar_number: '****-****-1109', role_in_society: 'MEMBER' },
    { full_name: 'Hemant Kumar Swain', occupation: 'HVAC AC Mechanic', address: 'Coastal Colony', phone: '9861001110', aadhaar_number: '****-****-1110', role_in_society: 'MEMBER' },
  ]);

  const [newMember, setNewMember] = useState({
    full_name: '',
    occupation: '',
    address: '',
    phone: '',
    aadhaar_number: '',
    role_in_society: 'MEMBER',
  });

  // Track Status State
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedSociety, setTrackedSociety] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Add member to founding roster
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.full_name || !newMember.occupation) {
      setError('Member Name and Occupation are required.');
      return;
    }
    setFoundingMembers([...foundingMembers, { ...newMember }]);
    setNewMember({
      full_name: '',
      occupation: '',
      address: '',
      phone: '',
      aadhaar_number: '',
      role_in_society: 'MEMBER',
    });
    setError('');
  };

  const handleRemoveMember = (index) => {
    setFoundingMembers(foundingMembers.filter((_, i) => i !== index));
  };

  // Submit 9-Step Formation Application
  const handleSubmitApplication = async () => {
    setError('');
    if (foundingMembers.length < 10) {
      setError(`Cooperative Societies Act requires at least 10 founding members. Currently added: ${foundingMembers.length}`);
      return;
    }

    if (formData.initial_capital_balance < 10000) {
      setError('Minimum initial capital of ₹10,000 in a cooperative bank is required by statute.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        founding_members: foundingMembers,
      };

      const res = await api.registerSociety(payload);
      if (res.success) {
        setSubmittedData(res.data);
        setCurrentStep(7); // Jump to Success Receipt & Timeline Step
      }
    } catch (err) {
      setError(err.message || 'Failed to submit society application.');
    } finally {
      setLoading(false);
    }
  };

  // Lookup existing tracking ID
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;
    setTrackingLoading(true);
    setError('');
    try {
      const res = await api.getSocietyTracking(searchTrackingId.trim());
      if (res.success) {
        setTrackedSociety(res.data);
      }
    } catch (err) {
      setError(err.message || 'Tracking ID not found.');
      setTrackedSociety(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleRegistrarReviewAction = async (newStage) => {
    if (!trackedSociety?.society?.id) return;
    setUpdatingStage(true);
    try {
      const res = await api.updateSocietyTimeline(trackedSociety.society.id, {
        stage: newStage,
      });
      if (res.success) {
        setTrackedSociety({
          ...trackedSociety,
          society: {
            ...trackedSociety.society,
            timeline_stage: newStage,
            status: newStage === 9 ? 'ACTIVE' : trackedSociety.society.status,
          },
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to update review stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  const fetchDcoQueue = async () => {
    setDcoLoading(true);
    setDcoActionSuccess('');
    try {
      const res = await api.getPendingSocietiesForDco();
      if (res.success) {
        setDcoQueue(res.societies || []);
      }
    } catch (err) {
      console.error('Failed to load DCO queue:', err);
    } finally {
      setDcoLoading(false);
    }
  };

  const handleDcoApprovalAction = async (socId, action) => {
    setDcoActionLoading(true);
    setError('');
    try {
      const res = await api.dcoReviewSociety(socId, { action });
      if (res.success) {
        setDcoActionSuccess(res.message);
        fetchDcoQueue();
      }
    } catch (err) {
      setError(err.message || 'Failed to process DCO action.');
    } finally {
      setDcoActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'DCO_QUEUE') {
      fetchDcoQueue();
    }
  }, [activeTab]);

  return (
    <div className="w-full max-w-7xl mx-auto py-5 sm:py-6 px-3 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border border-blue-800/40 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Pill Badge with Pulse Indicator (National removed) */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <Building2 size={15} className="text-amber-400" />
            <span>Federation of Labour Cooperatives • Statutory Formation Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Cooperative Society Registration &amp; Formation Workflow
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 max-w-3xl leading-relaxed">
            Legal formation process under the Cooperative Societies Act for new artisan collectives, district federations, and labour associations to become certified and eligible on <strong className="text-white font-semibold">Prithvi Fix</strong>.
          </p>

          {/* Statutory Trust Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-blue-200/80">
            <span className="inline-flex items-center gap-1 bg-blue-900/40 border border-blue-800/50 px-2.5 py-0.5 rounded-md">
              <ShieldCheck size={12} className="text-emerald-400" /> Multi-State Cooperative Societies Act
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-900/40 border border-blue-800/50 px-2.5 py-0.5 rounded-md">
              <FileCheck size={12} className="text-amber-400" /> 9-Step Statutory Verification
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-900/40 border border-blue-800/50 px-2.5 py-0.5 rounded-md">
              <Landmark size={12} className="text-blue-300" /> Direct LCF Work Orders
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-900/40 border border-blue-800/50 px-2.5 py-0.5 rounded-md">
              <HelpCircle size={12} className="text-indigo-300" /> Toll-Free Helpline: 1800-345-7788
            </span>
          </div>
        </div>

        {/* Top Tab Bar & Navigation Actions */}
        <div className="mt-6 pt-5 border-t border-blue-800/50 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Main Wizard Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveTab('NEW_FORMATION'); setError(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 shadow-xs ${
                activeTab === 'NEW_FORMATION'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold ring-2 ring-amber-300/60'
                  : 'bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/80 hover:text-white'
              }`}
            >
              <Plus size={14} className={activeTab === 'NEW_FORMATION' ? 'stroke-[2.5]' : ''} />
              New Society Registration (9-Step Legal Formation)
            </button>
            <button
              onClick={() => { setActiveTab('TRACK_STATUS'); setError(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 shadow-xs ${
                activeTab === 'TRACK_STATUS'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold ring-2 ring-amber-300/60'
                  : 'bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/80 hover:text-white'
              }`}
            >
              <Search size={14} className={activeTab === 'TRACK_STATUS' ? 'stroke-[2.5]' : ''} />
              Track Application / Statutory Timeline
            </button>
            <button
              onClick={() => { setActiveTab('DCO_QUEUE'); setError(''); fetchDcoQueue(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 shadow-xs ${
                activeTab === 'DCO_QUEUE'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold ring-2 ring-amber-300/60'
                  : 'bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/80 hover:text-white'
              }`}
            >
              <FileCheck size={14} className={activeTab === 'DCO_QUEUE' ? 'stroke-[2.5]' : ''} />
              District Registrar Scrutiny Queue
            </button>
            <Link
              to="/society/timeline"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-900/60 text-blue-100 border border-blue-700/40 hover:bg-blue-800/80 hover:text-white transition-all duration-150 flex items-center gap-2 shadow-xs"
            >
              <Clock size={14} />
              Recognized Societies Progression
            </Link>
          </div>

          {/* Federation Executive Login CTA */}
          <Link
            to="/login?role=admin"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 border border-emerald-400/30 shrink-0"
          >
            <Award size={14} className="text-amber-300" />
            <span>Federation Login &amp; Portal</span>
            <span className="text-[10px] bg-emerald-700/70 text-emerald-100 px-1.5 py-0.5 rounded font-medium">Official</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: NEW SOCIETY 9-STEP FORMATION WIZARD (PAGE 1)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'NEW_FORMATION' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 space-y-6">
          {/* Step Indicator */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
              {[
                { s: 1, title: 'Application Form' },
                { s: 2, title: '10 Founding Members' },
                { s: 3, title: 'Bylaws & Resolution' },
                { s: 4, title: 'Bank Certificate (₹10k)' },
                { s: 5, title: 'Affidavit' },
                { s: 6, title: 'Review & Submit' },
                { s: 7, title: 'Unique ID & Timeline' },
              ].map((step) => (
                <div
                  key={step.s}
                  className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStep === step.s
                      ? 'bg-blue-900 text-white shadow-xs'
                      : currentStep > step.s
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                    {currentStep > step.s ? '✓' : step.s}
                  </span>
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Application Form */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-900" />
                  Step 1: Society Details & Operational Objectives
                </h2>
                <span className="text-xs text-gray-500 font-medium">Application Form</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Proposed Society Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kalinga Shramik Seva Sahakari Samiti"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                {/* Step 1A: Executive Administrator Account Credentials (Flowchart Specification: Create a new Account - Email Id, Password) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck size={16} className="text-blue-900" />
                      Step 1A: Lead Founder / Executive Administrator Account
                    </span>
                    <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                      Statutory Formation Account
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Under cooperative regulations, create your executive administrator account to receive the statutory tracking dossier, upload formation resolutions, and access the Federation Governance Portal.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Lead Administrator Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bikash Mohanty"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Administrator Account Password *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium font-mono focus:ring-2 focus:ring-blue-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Registered Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kalinga.coop@gov.in"
                    value={formData.registered_email}
                    onChange={(e) => setFormData({ ...formData, registered_email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Registered Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0674-2548800"
                    value={formData.registered_phone}
                    onChange={(e) => setFormData({ ...formData, registered_phone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Operational District *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-900"
                  >
                    {availableDistricts.length > 0 ? (
                      availableDistricts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} {d.headquarters ? `(${d.headquarters})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Khordha">Khordha (Bhubaneswar)</option>
                        <option value="Cuttack">Cuttack</option>
                        <option value="Puri">Puri</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Affiliated Regional Federation (Optional)</span>
                    {loadingFederations && <span className="text-[10px] text-blue-600 font-normal">Loading...</span>}
                  </label>
                  <select
                    value={formData.federation_id}
                    onChange={(e) => setFormData({ ...formData, federation_id: e.target.value })}
                    className="w-full p-2.5 border border-blue-300 rounded-lg text-xs bg-blue-50/40 text-blue-950 font-medium focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">-- None (Standalone Independent Primary Society) --</option>
                    {districtFederations.map((fed) => (
                      <option key={fed.id} value={fed.id}>
                        {fed.name} ({fed.registration_number})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    {formData.federation_id
                      ? `This society will affiliate under ${districtFederations.find((f) => String(f.id) === String(formData.federation_id))?.name || 'the selected federation'} to access regional tenders, pooled welfare, and tool libraries.`
                      : 'Forming as a standalone independent primary society. Can affiliate with a regional federation later after DCO registration.'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    City / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Canteen, Saheed Nagar"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Head Office Physical Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot No 88, Near District Cooperative Bank"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Primary Objectives & Trades Served *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name || !formData.registered_email) {
                      setError('Please enter society name and email.');
                      return;
                    }
                    setError('');
                    setCurrentStep(2);
                  }}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                >
                  Continue to 10 Founding Members <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Founding Members (Minimum 10 Validation - Page 1) */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Users size={18} className="text-blue-900" />
                    Step 2: Founding Member Roster (Statutory Minimum: 10 Members)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cooperative law mandates that at least 10 founding artisans with valid proof of identity and residence sign the formation charter.
                  </p>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${foundingMembers.length >= 10
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                  {foundingMembers.length >= 10 ? <CheckCircle2 size={14} className="text-emerald-700" /> : <AlertCircle size={14} className="text-amber-700" />}
                  Founding Members: {foundingMembers.length} / 10 {foundingMembers.length >= 10 ? '(Statute Satisfied)' : '(Add More)'}
                </div>
              </div>

              {/* Members Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 sticky top-0 border-b border-gray-200 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Full Name</th>
                        <th className="p-2.5">Occupation / Trade</th>
                        <th className="p-2.5">Aadhaar ID</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {foundingMembers.map((m, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40">
                          <td className="p-2.5 font-bold text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-gray-900">{m.full_name}</td>
                          <td className="p-2.5">{m.occupation}</td>
                          <td className="p-2.5 font-mono text-[11px] text-gray-500">{m.aadhaar_number}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.role_in_society === 'PRESIDENT' ? 'bg-blue-100 text-blue-900' :
                                m.role_in_society === 'SECRETARY' ? 'bg-purple-100 text-purple-900' :
                                  m.role_in_society === 'TREASURER' ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {m.role_in_society}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add New Member Mini Form */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Plus size={14} className="text-blue-900" /> Add Additional Founding Member
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Occupation / Trade"
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Aadhaar ID (****-****-1234)"
                    value={newMember.aadhaar_number}
                    onChange={(e) => setNewMember({ ...newMember, aadhaar_number: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-xs bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="btn btn-secondary btn-sm text-xs font-bold"
                  >
                    + Add to Member Roster
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  disabled={foundingMembers.length < 10}
                  onClick={() => {
                    setError('');
                    setCurrentStep(3);
                  }}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                >
                  Continue to Bylaws & Resolution <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bylaws & Resolution (Page 1) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileCheck size={18} className="text-blue-900" />
                Step 3: Society Model Bylaws & Formation Resolution
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    📜 Model Cooperative Bylaws (Act Aligned)
                  </span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Governs democratic membership voting, annual officer elections, 93-2-5 transparent accounting, and formal dispute settlement mechanisms under State / Multi-State Cooperative Societies Act.
                  </p>
                  <div className="p-2 rounded bg-white border border-blue-200 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Standard Model Bylaws Pack Attached (PDF)
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    ✍️ Minutes of General Meeting & Resolution
                  </span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Formal minutes of the inaugural general meeting where all 10 founding members resolved to create the society, signed by President and Secretary.
                  </p>
                  <div className="p-2 rounded bg-white border border-purple-200 text-[11px] text-purple-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-purple-600" /> Resolution No. 01/2026 Verified & Signed
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                >
                  Continue to Bank Certificate <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Bank Certificate (Min ₹10,000 - Page 1) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Landmark size={18} className="text-blue-900" />
                Step 4: Bank Certificate (Proof of Minimum ₹10,000 Initial Capital)
              </h2>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <strong>Statutory Bank Certificate Requirement:</strong> Proof of initial member capital contribution deposited in a recognized Cooperative Bank with a minimum opening balance of <strong>₹10,000</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Initial Capital Balance Deposited (₹) *
                  </label>
                  <input
                    type="number"
                    min="10000"
                    required
                    value={formData.initial_capital_balance}
                    onChange={(e) => setFormData({ ...formData, initial_capital_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-bold text-blue-950 font-mono focus:ring-2 focus:ring-blue-900"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Minimum ₹10,000 mandatory</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Cooperative Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cooperative_bank_name}
                    onChange={(e) => setFormData({ ...formData, cooperative_bank_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Society Bank Account Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COOP-9988112233"
                    value={formData.bank_account_no}
                    onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OSCB0001002"
                    value={formData.bank_ifsc}
                    onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (formData.initial_capital_balance < 10000) {
                      setError('Minimum initial capital balance of ₹10,000 is required.');
                      return;
                    }
                    setError('');
                    setCurrentStep(5);
                  }}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                >
                  Continue to Affidavit <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Affidavit (Page 1) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-900" />
                Step 5: Non-Profit & Cooperative Principles Affidavit
              </h2>

              <div className="p-5 rounded-xl border border-gray-300 bg-gray-50/70 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Official Statutory Declaration (Affidavit Form IV)
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We, the executive founding members of <strong>{formData.name || 'the proposed society'}</strong>, solemnly declare that the society will operate lawfully under the Cooperative Societies Act, uphold the 7 international cooperative principles, distribute 93% statutory labour earnings directly to member artisans, allocate 2% for platform fee, 5% to the PF & insurance (worker welfare) fund, and refrain from private profiteering beyond cooperative bylaws.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-950">
                  <input type="checkbox" defaultChecked id="affidavit-check" className="h-4 w-4 rounded text-blue-900" />
                  <label htmlFor="affidavit-check">I confirm this affidavit is verified and signed before a Notary Public.</label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                >
                  Review Application Dossier <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Final Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-900" />
                Step 6: Review Complete 9-Step Formation Dossier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">Society Summary</span>
                  <div className="space-y-1 text-gray-700">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>District:</strong> {formData.district} ({formData.city})</p>
                    <p><strong>Affiliated Federation:</strong> {formData.federation_id ? (districtFederations.find((f) => String(f.id) === String(formData.federation_id))?.name || 'Affiliated Regional Federation') : 'None (Standalone Independent Primary Society)'}</p>
                    <p><strong>Email:</strong> {formData.registered_email}</p>
                    <p><strong>Phone:</strong> {formData.registered_phone}</p>
                    <p><strong>Initial Capital:</strong> ₹{formData.initial_capital_balance.toLocaleString()} ({formData.cooperative_bank_name})</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">Statutory Dossier Documents</span>
                  <ul className="space-y-1.5 text-emerald-800 font-semibold">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Signed Application (Form-1)</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> 10 Verified Founding Members Roster</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Act-Aligned Cooperative Bylaws</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Meeting Resolution of Formation</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Bank Certificate (₹{formData.initial_capital_balance.toLocaleString()})</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> Non-Profit Principles Affidavit</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitApplication}
                  className="btn btn-primary btn-sm flex items-center gap-2 text-xs font-bold px-6 py-2.5 shadow-sm"
                >
                  {loading ? 'Submitting Dossier...' : 'Submit to District Registrar & Generate Unique ID'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Success Receipt & Unique ID Generated (Page 1) */}
          {currentStep === 7 && submittedData && (
            <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Dossier Submitted • Stage 7
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  Unique Tracking ID & Statutory Receipt Generated!
                </h2>
                <p className="text-xs text-gray-600">
                  Your society formation dossier has been recorded. You can track compliance audits and registrar certification using this ID.
                </p>
              </div>

              {/* Unique ID Badge */}
              <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-900 text-blue-950 inline-block font-mono text-lg font-extrabold tracking-wider shadow-xs">
                {submittedData.tracking_id}
              </div>

              {/* Applicant Administrator Account Credentials Receipt */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-left space-y-2 text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  Executive Administrator Account Ready (Login Credentials)
                </span>
                <p className="text-emerald-900">
                  Your society administrator account has been created. You can sign in anytime via the <strong>Admin Portal Tab</strong>:
                </p>
                <div className="p-3 rounded-lg bg-white border border-emerald-200 font-mono text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span>Email: <strong>{formData.registered_email}</strong></span>
                  <span>Password: <strong>{formData.password}</strong></span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Role: Cooperative Admin</span>
                </div>
              </div>

              {/* Next Steps Timeline (Page 1) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Upcoming Statutory Steps & Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">8</span>
                    <div>
                      <strong className="text-gray-900">Register with Registrar of Cooperatives:</strong>
                      <p className="text-gray-600 text-[11px]">Submit hardcopy dossier to District Registrar office for statutory legal verification.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">9</span>
                    <div>
                      <strong className="text-gray-900">Approval & Certification:</strong>
                      <p className="text-gray-600 text-[11px]">Registrar issues official Certificate of Registration. Society becomes a legal entity and is <strong>Eligible to Be in Prithvi Fix</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTrackingId(submittedData.tracking_id);
                    setActiveTab('TRACK_STATUS');
                  }}
                  className="btn btn-primary btn-sm text-xs font-bold"
                >
                  Track Live Timeline
                </button>
                <Link to="/federation/portal" className="btn btn-secondary btn-sm text-xs font-bold">
                  Go to Federation Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: TRACK APPLICATION / TIMELINE LOOKUP
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'TRACK_STATUS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Search size={18} className="text-blue-900" />
              Track Society Registration Dossier & Legal Recognition
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your Unique Tracking ID (e.g. <code>SS-SOC-2024-001</code>, <code>SS-SOC-2026-9812</code>) to check statutory status with the District Registrar.
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-lg">
            <input
              type="text"
              required
              placeholder="e.g. SS-SOC-2026-9812"
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              className="grow p-2.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-900"
            />
            <button
              type="submit"
              disabled={trackingLoading}
              className="btn btn-primary btn-sm text-xs font-bold px-5"
            >
              {trackingLoading ? 'Searching...' : 'Track Dossier'}
            </button>
          </form>

          {/* Tracked Society Details */}
          {trackedSociety && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                    Tracking ID: {trackedSociety.society.tracking_id}
                  </span>
                  <h3 className="text-base font-bold text-blue-950">{trackedSociety.society.name}</h3>
                  <p className="text-xs text-blue-800">
                    District: {trackedSociety.society.district} • Status: <strong className="uppercase">{trackedSociety.society.status}</strong>
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-extrabold shrink-0 ${trackedSociety.society.status === 'ACTIVE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                  }`}>
                  Stage {trackedSociety.society.timeline_stage || 7} of 9
                </span>
              </div>

              {/* 9-Stage Visual Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  9-Step Legal Formation Timeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { n: 1, label: 'Application Form', done: true },
                    { n: 2, label: '10 Founding Members', done: true },
                    { n: 3, label: 'Bylaws Act-Aligned', done: true },
                    { n: 4, label: 'Formation Resolution', done: true },
                    { n: 5, label: 'Bank Cert (₹10k Min)', done: true },
                    { n: 6, label: 'Affidavit Verified', done: true },
                    { n: 7, label: 'Unique ID Generated', done: true },
                    { n: 8, label: 'District Registrar Review', done: trackedSociety.society.timeline_stage >= 8 },
                    { n: 9, label: 'Eligible in Prithvi Fix', done: trackedSociety.society.timeline_stage >= 9 },
                  ].map((s) => (
                    <div
                      key={s.n}
                      className={`p-3 rounded-lg border flex items-center gap-2 ${s.done
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {s.done ? '✓' : s.n}
                      </span>
                      <span className="text-[11px]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Roster Preview */}
              {trackedSociety.founding_members && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Founding Members on Record ({trackedSociety.founding_members.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {trackedSociety.founding_members.slice(0, 6).map((m, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <strong className="text-gray-900">{m.full_name}</strong>
                          <p className="text-[11px] text-gray-500">{m.occupation}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {m.role_in_society}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official District Registrar Review & Approval Desk */}
              <div className="p-5 rounded-2xl border-2 border-blue-900/40 bg-gradient-to-br from-blue-950/5 via-white to-blue-50/50 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-blue-950">
                        Statutory Approval Authority: District Cooperative Officer (DCO) & Registrar
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Odisha Cooperative Societies Act, 1962 (Section 7 & 8) • Statutory Formation Scrutiny
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase self-start sm:self-auto ${
                    (trackedSociety.society.timeline_stage || 7) >= 9
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : (trackedSociety.society.timeline_stage || 7) >= 8
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {(trackedSociety.society.timeline_stage || 7) >= 9
                      ? '✓ Fully Approved & Certified'
                      : (trackedSociety.society.timeline_stage || 7) >= 8
                      ? 'Stage 8: Scrutiny Cleared'
                      : 'Stage 8: Under Review'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Designated Reviewing Officer
                    </span>
                    <strong className="text-slate-900 text-sm block">
                      {trackedSociety.society.district?.toLowerCase() === 'khordha'
                        ? 'Shri Debendra Nayak'
                        : trackedSociety.society.district?.toLowerCase() === 'cuttack'
                        ? 'Smt. Minati Sahu'
                        : trackedSociety.society.district?.toLowerCase() === 'puri'
                        ? 'Shri Alok Mohapatra'
                        : 'District Cooperative Officer (DCO)'}
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      Assistant Registrar of Cooperative Societies (ARCS), {trackedSociety.society.district} District Circle
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Statutory Review Scope
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Auditing Form-1 legal application, 10 founding members KYC and affidavits, model cooperative bylaws compliance, and ₹10,000+ bank capital certificate.
                    </p>
                  </div>
                </div>

                {/* Registrar Review Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-600">
                    {(trackedSociety.society.timeline_stage || 7) >= 9 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Registration Approved. Society is now an active legal entity in Prithvi Fix.</span>
                      </span>
                    ) : (trackedSociety.society.timeline_stage || 7) === 8 ? (
                      <span className="text-blue-900 font-medium flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-700 shrink-0" />
                        <span>Stage 8 scrutiny passed. Ready for final Section 8 Certificate of Registration issuance.</span>
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-700 shrink-0" />
                        <span>Dossier submitted. Awaiting District Registrar scrutiny and verification.</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(trackedSociety.society.timeline_stage || 7) < 8 && (
                      <button
                        type="button"
                        disabled={updatingStage}
                        onClick={() => handleRegistrarReviewAction(8)}
                        className="btn btn-sm btn-primary py-2 px-4 text-xs font-bold bg-blue-950 hover:bg-blue-900 text-white rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck size={14} />
                        <span>{updatingStage ? 'Updating...' : 'Approve Scrutiny (Advance to Stage 8)'}</span>
                      </button>
                    )}

                    {(trackedSociety.society.timeline_stage || 7) === 8 && (
                      <button
                        type="button"
                        disabled={updatingStage}
                        onClick={() => handleRegistrarReviewAction(9)}
                        className="btn btn-sm btn-primary py-2 px-4 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award size={14} />
                        <span>{updatingStage ? 'Activating...' : 'Grant Certificate & Activate in Prithvi Fix (Stage 9)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: DISTRICT REGISTRAR REVIEW QUEUE (DCO CONSOLE)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_QUEUE' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck size={18} className="text-blue-900" />
                  District Registrar Statutory Scrutiny &amp; Approval Queue
                </h2>
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full uppercase">
                  DCO Console
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Official statutory docket for District Cooperative Officers (DCO) to audit founding member rosters, inspect bylaws, verify cooperative bank initial capital, and issue Legal Certificates of Registration.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDcoQueue}
              disabled={dcoLoading}
              className="btn btn-secondary btn-sm text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              <Clock size={13} /> {dcoLoading ? 'Refreshing...' : 'Refresh Queue'}
            </button>
          </div>

          {dcoActionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{dcoActionSuccess}</span>
            </div>
          )}

          {dcoLoading ? (
            <div className="py-12 text-center text-xs text-gray-500 space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full mx-auto" />
              <p>Retrieving district cooperative registry applications...</p>
            </div>
          ) : dcoQueue.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 space-y-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
              <strong className="text-gray-900 block text-sm">All District Applications Clear</strong>
              <p>No new society formation applications are currently pending scrutiny in this jurisdiction.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dcoQueue.map((soc) => (
                <div
                  key={soc.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-blue-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {soc.tracking_id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                          {soc.status}
                        </span>
                        <span className="text-[11px] text-gray-500">District: <strong className="text-gray-900">{soc.district}</strong></span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{soc.name}</h3>
                      <p className="text-xs text-gray-500">
                        Applicant / Secretary: <strong className="text-gray-800">{soc.applicant_name || 'Society Founder'}</strong> • {soc.registered_email} • {soc.registered_phone}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Initial Capital Proof</span>
                      <span className="text-base font-extrabold text-emerald-950 font-mono">
                        ₹{(soc.initial_capital_balance || 10000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Statutory Checklist Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-0.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Founding Members</span>
                      <strong className="text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {soc.founding_members_count || 10} / 10 Verified
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-0.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Bylaws &amp; Resolution</span>
                      <strong className="text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Cooperative Act Format
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-0.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Bank Certificate</span>
                      <strong className="text-gray-900 flex items-center gap-1 font-mono">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {soc.cooperative_bank_name || 'Cooperative Bank'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-0.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Non-Profit Affidavit</span>
                      <strong className="text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Notarized Form IV
                      </strong>
                    </div>
                  </div>

                  {/* DCO Review Decision Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-slate-500">
                      Statutory Review Officer: <strong>{user?.name || 'District Cooperative Officer & Registrar'}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={dcoActionLoading}
                        onClick={() => handleDcoApprovalAction(soc.id, 'REQUEST_CLARIFICATION')}
                        className="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle size={14} /> Clarification / Hearing
                      </button>
                      <button
                        type="button"
                        disabled={dcoActionLoading}
                        onClick={() => handleDcoApprovalAction(soc.id, 'APPROVE')}
                        className="btn btn-primary btn-sm text-xs font-bold bg-emerald-700 hover:bg-emerald-600 border-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Award size={14} /> Verify &amp; Issue Registration Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
