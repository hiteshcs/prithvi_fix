import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CivicLoader from '../components/CivicLoader';
import {
  Building2, Users, Briefcase, Wrench, DollarSign, ShieldAlert,
  CheckCircle2, Clock, Plus, RefreshCw, Hammer, AlertCircle,
  Award, ShieldCheck, HeartHandshake, PhoneCall, ExternalLink,
  ChevronRight, Calendar, MapPin, FileText, Eye, X, FileCheck
} from 'lucide-react';

export default function SocietyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'workers' | 'operations' | 'tools' | 'treasury' | 'disputes'
  const activeTab = searchParams.get('tab') || 'workers';
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const societyId = user?.society_id || 1;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data States
  const [adminData, setAdminData] = useState(null);
  const [treasurerData, setTreasurerData] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Worker Modal
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'demoPassword123',
    primaryTrade: 'Electrical',
    experienceYears: 3,
    district: user?.district || 'Khordha',
    city: user?.city || 'Bhubaneswar',
    isNcctCertified: false,
  });
  const [registeringWorker, setRegisteringWorker] = useState(false);

  // Tool Lease State
  const [machineryList, setMachineryList] = useState([
    { id: 1, name: 'Core Drill Machine (Heavy Duty SDS Max)', brand: 'Bosch Professional', totalUnits: 6, availableUnits: 4, status: 'AVAILABLE', coopRentPerDay: 150 },
    { id: 2, name: 'High-Pressure Drain Jetter & Snake Auger', brand: 'Ridgid Tools', totalUnits: 4, availableUnits: 2, status: 'AVAILABLE', coopRentPerDay: 200 },
    { id: 3, name: 'Airless Paint Spray Station (Electric)', brand: 'Graco Ultra Max', totalUnits: 5, availableUnits: 3, status: 'AVAILABLE', coopRentPerDay: 250 },
    { id: 4, name: 'Rotary Hammer Drill & Chisel Combo', brand: 'DeWalt D25133K', totalUnits: 8, availableUnits: 5, status: 'AVAILABLE', coopRentPerDay: 120 },
  ]);
  const [showToolModal, setShowToolModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [leaseForm, setLeaseForm] = useState({ artisanName: '', daysCount: 3 });

  // Dispute State
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  // Worker Verification & Document Audit State
  const [verifyingId, setVerifyingId] = useState(null);
  const [selectedWorkerForAudit, setSelectedWorkerForAudit] = useState(null);

  const handleVerifyWorker = async (workerId, status, artisanName, step = null) => {
    let rejectionReason = null;
    if (status === 'REJECTED') {
      rejectionReason = window.prompt(
        `Statutory KYC & Trade Audit:\nEnter statutory rejection reason for ${artisanName || 'this artisan'}:`,
        'Trade certificate or local residence documentation incomplete.'
      );
      if (!rejectionReason) return; // cancelled
    }
    setVerifyingId(workerId);
    setError('');
    try {
      await api.verifyWorker(workerId, status, rejectionReason, step);
      setSuccessMsg(`Statutory decision recorded: Artisan ${artisanName || `#${workerId}`} application marked as ${status === 'VERIFIED' ? 'APPROVED & CREDENTIALED' : 'REJECTED'}.`);
      setTimeout(() => setSuccessMsg(''), 6000);
      if (selectedWorkerForAudit && selectedWorkerForAudit.id === workerId) {
        setSelectedWorkerForAudit(null);
      }
      await loadSocietyData();
    } catch (err) {
      console.error('Failed to update worker status:', err);
      setError(err.message || 'Failed to update artisan verification status.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAdvanceStep = async (workerId, nextStep, artisanName) => {
    setVerifyingId(workerId);
    setError('');
    try {
      await api.verifyWorker(workerId, 'PENDING', null, nextStep);
      setSuccessMsg(`Artisan ${artisanName || `#${workerId}`} application advanced to Step ${nextStep} of 4.`);
      setTimeout(() => setSuccessMsg(''), 6000);
      if (selectedWorkerForAudit && selectedWorkerForAudit.id === workerId) {
        setSelectedWorkerForAudit((prev) => prev ? { ...prev, verification_step: nextStep } : null);
      }
      await loadSocietyData();
    } catch (err) {
      console.error('Failed to advance worker step:', err);
      setError(err.message || 'Failed to advance verification step.');
    } finally {
      setVerifyingId(null);
    }
  };

  const loadSocietyData = async () => {
    setLoading(true);
    setError('');
    try {
      const [adminRes, treasRes, bookingsRes] = await Promise.all([
        api.getFederationAdminDashboard(societyId).catch(() => null),
        api.getFederationTreasurerDashboard(societyId).catch(() => null),
        api.getAdminBookings().catch(() => ({ bookings: [] })),
      ]);

      if (adminRes?.success) setAdminData(adminRes.data);
      if (treasRes?.success) setTreasurerData(treasRes.data);
      if (bookingsRes?.bookings) setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error('Failed to load Society data:', err);
      setError(err.message || 'Failed to load primary society data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocietyData();
  }, [user]);

  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    setRegisteringWorker(true);
    setError('');
    try {
      const res = await api.registerWorkerByFederation({
        ...workerFormData,
        societyId,
      });
      if (res.success) {
        setShowWorkerModal(false);
        setSuccessMsg(`Artisan ${workerFormData.name} onboarded successfully with credentials generated.`);
        setWorkerFormData({
          name: '',
          email: '',
          phone: '',
          password: 'demoPassword123',
          primaryTrade: 'Electrical',
          experienceYears: 3,
          district: user?.district || 'Khordha',
          city: user?.city || 'Bhubaneswar',
          isNcctCertified: false,
        });
        loadSocietyData();
      }
    } catch (err) {
      setError(err.message || 'Failed to register worker under society.');
    } finally {
      setRegisteringWorker(false);
    }
  };

  const handleLeaseToolSubmit = (e) => {
    e.preventDefault();
    if (!selectedTool) return;
    setMachineryList((prev) =>
      prev.map((t) => (t.id === selectedTool.id ? { ...t, availableUnits: Math.max(0, t.availableUnits - 1) } : t))
    );
    setShowToolModal(false);
    setSuccessMsg(`Tool Lease Voucher generated for ${leaseForm.artisanName} (${selectedTool.name}) for ${leaseForm.daysCount} days.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleResolveDispute = async (ticketId) => {
    setResolvingLoading(true);
    try {
      const res = await api.resolveDisputeTicket(ticketId, {
        resolution_notes: resolutionNotes || 'Resolved through Primary Society Mediation under 30-Day Guarantee Policy.',
        action: 'RESOLVED',
      });
      if (res.success) {
        setSuccessMsg(`Dispute ticket #${ticketId} resolved successfully under cooperative warranty.`);
        setResolvingTicketId(null);
        setResolutionNotes('');
        loadSocietyData();
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve dispute ticket.');
    } finally {
      setResolvingLoading(false);
    }
  };

  if (loading) {
    return (
      <CivicLoader
        variant="fullscreen"
        title="Loading Primary Society Console..."
        subtitle="Connecting to local primary society roster, dispatches, and tool bank."
      />
    );
  }

  const society = treasurerData?.society || adminData?.society || {
    name: 'Shramik Kalyan Labour Cooperative Samiti',
    registration_number: 'REG-OD-2024-001',
    district: user?.district || 'Khordha',
    city: user?.city || 'Bhubaneswar'
  };
  const workers = adminData?.workersList || [];
  const disputes = adminData?.slide2_disputes?.recentDisputes || [];
  const kpis = treasurerData?.kpis || {};

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-6 px-4">
      {/* ─────────────────────────────────────────────────────────────
          1. PRIMARY SOCIETY HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                <Building2 size={14} className="text-blue-700 dark:text-sky-400" />
                <span>Primary Labour Cooperative Society</span>
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {society.registration_number || 'REG-OD-2024-001'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Ward Node
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {society.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Secretary / Officer: <strong className="text-slate-900 dark:text-white">{user?.name || 'Bikash Mohanty'}</strong> • {society.district || 'Khordha'} District. Grassroots member-owner administration, artisan onboarding, local tool banks, and direct citizen service orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowWorkerModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>Onboard Artisan</span>
            </button>
            <button
              onClick={loadSocietyData}
              className="p-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Refresh Society Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* 4 Society Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="text-[10px] font-bold text-blue-900 dark:text-sky-300 uppercase tracking-wider block">Member Artisans</span>
            <div className="text-2xl font-black text-blue-950 dark:text-white font-mono mt-0.5">{workers.length || 18} Workers</div>
            <span className="text-[11px] text-blue-800 dark:text-sky-200 font-medium mt-0.5 block">100% KYC Verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">Active On-Site</span>
            <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 font-mono mt-0.5">
              {workers.filter((w) => w.availability === 'BUSY').length || 6} Busy
            </div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-200 font-medium mt-0.5 block">Executing live jobs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">Society Capital Balance</span>
            <div className="text-2xl font-black text-amber-950 dark:text-amber-200 font-mono mt-0.5">
              ₹{(kpis.totalAmountInAccount || 833400).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-amber-800 dark:text-amber-200 font-medium mt-0.5 block">Cooperative Bank Escrow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block">Tool Depot Units</span>
            <div className="text-2xl font-black text-purple-950 dark:text-purple-200 font-mono mt-0.5">
              {machineryList.reduce((acc, t) => acc + t.availableUnits, 0)} Units
            </div>
            <span className="text-[11px] text-purple-800 dark:text-purple-200 font-medium mt-0.5 block">Ready for Member Lease</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SOCIETY WORKSPACE NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={() => handleTabChange('workers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'workers'
              ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Users size={15} className={activeTab === 'workers' ? 'text-blue-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          <span>1. Member Artisans &amp; KYC Audit</span>
        </button>

        <button
          onClick={() => handleTabChange('operations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'operations'
              ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase size={15} className={activeTab === 'operations' ? 'text-blue-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          <span>2. Local Work Orders &amp; Dispatches</span>
        </button>

        <button
          onClick={() => handleTabChange('tools')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Hammer size={15} className={activeTab === 'tools' ? 'text-blue-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          <span>3. Society Tool Bank Depot</span>
        </button>

        <button
          onClick={() => handleTabChange('treasury')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'treasury'
              ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign size={15} className={activeTab === 'treasury' ? 'text-blue-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          <span>4. Society Treasury &amp; Member Loans</span>
        </button>

        <button
          onClick={() => handleTabChange('disputes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'disputes'
              ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert size={15} className={activeTab === 'disputes' ? 'text-blue-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
          <span>5. Citizen Mediation Desk</span>
          {disputes.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
              {disputes.length}
            </span>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: MEMBER ARTISANS & KYC AUDIT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          {/* Statutory Authority Division Guidance Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="font-extrabold text-blue-950 dark:text-white block text-sm">
                ⚖️ Statutory Jurisdiction: Primary Cooperative Society is the Sole Worker Approval Authority
              </strong>
              <p className="text-xs text-blue-900 dark:text-blue-200 mt-1 leading-relaxed">
                Under the Odisha Cooperative Societies statutory framework, <strong>your Primary Cooperative Society management committee</strong> possesses direct statutory authority to audit, credential, approve, or reject member artisans who chose your society upon registration. (The <strong>District Cooperative Officer / DCO</strong> audits and charters Societies, not individual workers).
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Primary Society Member Artisans Roster
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Artisans registered under {society.name}. Audited for trade certifications, police verification, and toolkits.
                </p>
              </div>

              <button
                onClick={() => setShowWorkerModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Onboard New Worker</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Artisan Name</th>
                    <th className="p-3.5">Primary Trade</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Verification &amp; Process Stage</th>
                    <th className="p-3.5">Duty Availability</th>
                    <th className="p-3.5">ESIC Policy</th>
                    <th className="p-3.5 text-right">Society Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {workers.map((w) => {
                    const isPending = w.verification_status === 'PENDING';
                    const isVerified = w.verification_status === 'VERIFIED';
                    const isRejected = w.verification_status === 'REJECTED';
                    const isBusy = verifyingId === w.id;
                    const curStep = w.verification_step || 2;

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="p-3.5 font-mono font-bold text-blue-900 dark:text-sky-400">{w.worker_code}</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 dark:text-white block font-bold">{w.user_name}</strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">📞 {w.phone || '9876543210'}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{w.primary_trade || 'Master Electrician'}</td>
                        <td className="p-3.5">{w.experience_years || 4} Years</td>
                        <td className="p-3.5">
                          {isVerified && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> VERIFIED (Stage 4 Complete)
                            </span>
                          )}
                          {isPending && (
                            <div className="space-y-1">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                                <Clock size={11} className="text-amber-600 animate-pulse" />
                                <span>Stage {curStep} of 4: {curStep === 3 ? 'Physical Tool Check' : curStep === 4 ? 'Committee Resolution' : 'KYC & Document Scrutiny'}</span>
                              </span>
                              <div className="flex items-center gap-1 w-32">
                                <div className={`h-1 flex-1 rounded-full ${curStep >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${curStep >= 2 ? (curStep === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${curStep >= 3 ? (curStep === 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${curStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                              </div>
                            </div>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 inline-flex items-center gap-1">
                              ✕ REJECTED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            w.availability === 'AVAILABLE' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {w.availability}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{w.healthPolicyNo || `ESIC-${w.worker_code}`}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedWorkerForAudit(w)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 shadow-2xs transition cursor-pointer inline-flex items-center gap-1"
                              title="Audit all submitted documents, credentials, and KYC details"
                            >
                              <FileText size={12} />
                              <span>Audit Dossier</span>
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleVerifyWorker(w.id, 'VERIFIED', w.user_name)}
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                                  title="Approve worker and activate badge"
                                >
                                  <CheckCircle2 size={12} />
                                  <span>{isBusy ? '...' : 'Approve'}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleVerifyWorker(w.id, 'REJECTED', w.user_name)}
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition disabled:opacity-50 cursor-pointer"
                                  title="Reject worker application"
                                >
                                  ✕
                                </button>
                              </>
                            )}

                            {isVerified && (
                              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck size={14} className="text-emerald-600" />
                                <span>Approved</span>
                              </div>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleVerifyWorker(w.id, 'VERIFIED', w.user_name)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                              >
                                Re-Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MODAL: WORKER SUBMITTED DOCUMENTS AUDIT DOSSIER
             ───────────────────────────────────────────────────────────── */}
          {selectedWorkerForAudit && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      <FileCheck size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-sky-300 font-mono">
                          {selectedWorkerForAudit.worker_code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ref: {selectedWorkerForAudit.application_no || `APP-OD-2026-${selectedWorkerForAudit.id}`}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedWorkerForAudit.user_name} — Statutory KYC &amp; Document Audit
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWorkerForAudit(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body: Scrollable Dossier Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
                  
                  {/* 4-Step Interactive Pipeline Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Statutory Approval Pipeline Stage
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedWorkerForAudit.verification_status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {selectedWorkerForAudit.verification_status === 'VERIFIED'
                          ? '✓ Final Accreditation Approved'
                          : `Currently at Stage ${selectedWorkerForAudit.verification_step || 2} of 4`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>1. Digital Dossier</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-1">Submitted online by worker</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        (selectedWorkerForAudit.verification_step || 2) === 2 && selectedWorkerForAudit.verification_status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 ring-2 ring-amber-400/30'
                          : (selectedWorkerForAudit.verification_step || 2) > 2 || selectedWorkerForAudit.verification_status === 'VERIFIED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          {((selectedWorkerForAudit.verification_step || 2) > 2 || selectedWorkerForAudit.verification_status === 'VERIFIED') ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Clock size={13} className="text-amber-600 shrink-0" />
                          )}
                          <span>2. Society KYC Scrutiny</span>
                        </div>
                        <p className="text-[10px] mt-1 text-slate-600 dark:text-slate-300">Auditing Aadhaar, PAN &amp; certs</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        (selectedWorkerForAudit.verification_step || 2) === 3 && selectedWorkerForAudit.verification_status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 ring-2 ring-amber-400/30'
                          : (selectedWorkerForAudit.verification_step || 2) > 3 || selectedWorkerForAudit.verification_status === 'VERIFIED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          {((selectedWorkerForAudit.verification_step || 2) > 3 || selectedWorkerForAudit.verification_status === 'VERIFIED') ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Hammer size={13} className="shrink-0" />
                          )}
                          <span>3. Physical Tool &amp; Skill</span>
                        </div>
                        <p className="text-[10px] mt-1 text-slate-600 dark:text-slate-300">Tool inspection at society</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        selectedWorkerForAudit.verification_status === 'VERIFIED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                          : (selectedWorkerForAudit.verification_step || 2) === 4
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 ring-2 ring-amber-400/30'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          {selectedWorkerForAudit.verification_status === 'VERIFIED' ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Award size={13} className="shrink-0" />
                          )}
                          <span>4. Committee Resolution</span>
                        </div>
                        <p className="text-[10px] mt-1 text-slate-600 dark:text-slate-300">Badge &amp; live duty activation</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Statutory Identity & Legal Dossier */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <ShieldCheck size={16} className="text-blue-600" />
                      <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        1. Statutory Identity &amp; KYC Verification
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Card (UIDAI Masked)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                          {selectedWorkerForAudit.aadhaar_number || 'XXXX-XXXX-4819'}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={10} /> SHA-256 Deduplication Hash Valid
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">PAN Card</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                          {selectedWorkerForAudit.pan_number || 'ABCDE1234F'}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Tax Compliance Registered</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Ration / BPL Card</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                          {selectedWorkerForAudit.ration_card || 'OD-PDS-2024-8891'}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">State Welfare Link</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Police Character Clearance</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs block mt-0.5">
                          Valid until {selectedWorkerForAudit.police_verification_expiry || '2027-03-31'}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Zero Criminal Record Registered</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Residential Address</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs block mt-0.5">
                          📍 {selectedWorkerForAudit.address || 'Khandagiri Square, Ward 24'}, {selectedWorkerForAudit.city || 'Bhubaneswar'}, {selectedWorkerForAudit.district || 'Khordha'} - {selectedWorkerForAudit.pincode || '751030'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Trade Certifications & Credentials */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Award size={16} className="text-amber-600" />
                      <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        2. Trade Certifications, Technical Accreditation &amp; Submitted Docket
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Trade &amp; Experience</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                          {selectedWorkerForAudit.primary_trade || 'Master Electrician'} ({selectedWorkerForAudit.experience_years || 4} Years Practical Experience)
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
                          Specializations: <strong>{selectedWorkerForAudit.sub_skills || 'Domestic wiring, Inverter circuits, 3-Phase Panels'}</strong>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Cooperative Hierarchy Tier</span>
                        <span className="font-bold text-blue-900 dark:text-sky-300 text-xs block mt-0.5">
                          {selectedWorkerForAudit.computedTier || selectedWorkerForAudit.tier || 'GOLD'} Artisan ({selectedWorkerForAudit.isNcctCertified ? '✓ NCCT Certified' : 'NCCT Course Eligible'})
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Evaluation Base: {selectedWorkerForAudit.experience_years} yrs exp + Local Primary Society Accreditation
                        </span>
                      </div>
                    </div>

                    {/* Certifications Table / Documents */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Uploaded Certificates &amp; Technical Dockets ({selectedWorkerForAudit.certifications?.length || 1} Document on Record):
                      </span>
                      
                      {selectedWorkerForAudit.certifications && selectedWorkerForAudit.certifications.length > 0 ? (
                        <div className="space-y-2">
                          {selectedWorkerForAudit.certifications.map((c, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <strong className="text-slate-900 dark:text-white block font-bold text-xs">
                                  📄 {c.certification_name || 'Trade Competency Certificate'}
                                </strong>
                                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                                  Issued by: <strong>{c.issuing_organization || 'National Skill Development Council (NSDC) / ITI'}</strong> • No: <span className="font-mono text-blue-900 dark:text-sky-400">{c.certificate_number || 'CERT-OD-2024'}</span>
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Issue Date: {c.issue_date || '2024-05-12'} {c.expiry_date ? `• Expiry: ${c.expiry_date}` : '• Lifetime Statutory Validity'}
                                </span>
                              </div>
                              <a
                                href={c.document_url || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-900 dark:text-sky-300 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 shadow-2xs transition"
                              >
                                <Eye size={13} />
                                <span>Inspect Certificate Document ↗</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-900 dark:text-white block font-bold text-xs">
                              📄 {selectedWorkerForAudit.primary_trade || 'Trade'} Skill Qualification Certificate
                            </strong>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                              Issued by: <strong>State Council for Technical Education &amp; Vocational Training (SCTE&amp;VT)</strong> • Reg: <span className="font-mono text-blue-900 dark:text-sky-400">CERT-OD-{selectedWorkerForAudit.id}-2025</span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Logged during primary digital registration with Society #{selectedWorkerForAudit.society_id || 1}
                            </span>
                          </div>
                          <a
                            href="https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-900 dark:text-sky-300 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 shadow-2xs transition"
                          >
                            <Eye size={13} />
                            <span>Inspect Certificate Document ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Tools & Equipment Declared */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Wrench size={16} className="text-emerald-600" />
                      <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        3. Equipment Declaration &amp; Mandatory ISI Toolkit Audit
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Declared Tools Owned</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs mt-0.5 leading-relaxed">
                          {selectedWorkerForAudit.tools_owned || 'Standard ISI insulated trade kit, digital multimeter, testing screw drivers, safety goggles, insulated work shoes'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">ISI Toolkit Statutory Compliance</span>
                        <span className={`font-bold text-xs block mt-0.5 ${
                          selectedWorkerForAudit.toolkit_compliance === 'VERIFIED_EQUIPPED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {selectedWorkerForAudit.toolkit_compliance === 'VERIFIED_EQUIPPED' ? '✓ Verified Equipped (ISI Compliant)' : '⚠️ Physical Tool Verification Required'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Primary Society must verify physical toolkit during Stage 3 before live deployment.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4 & 5: Banking & Kin Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <DollarSign size={16} className="text-emerald-600" />
                        <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          4. Direct Wage Payout Escrow Account (93%)
                        </h4>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-500">Bank Name:</span> <strong>{selectedWorkerForAudit.bank_name || 'Odisha State Cooperative Bank Ltd.'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Account No:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedWorkerForAudit.bank_account || 'OSCB-9821004128'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Branch IFSC:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedWorkerForAudit.bank_ifsc || 'OSCB0001001'}</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 dark:text-emerald-300 pt-1">
                          ✓ Direct 93% customer payment settlement will be wired to this verified account upon job completion OTP.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <HeartHandshake size={16} className="text-red-500" />
                        <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          5. Emergency Contact &amp; Next of Kin
                        </h4>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-500">Emergency Contact:</span> <strong>{selectedWorkerForAudit.emergency_contact_name || 'Sunita Mohapatra'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Relationship:</span> <strong>{selectedWorkerForAudit.emergency_contact_relation || 'Spouse'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Verified Phone:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedWorkerForAudit.emergency_contact_phone || '9876543210'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1">
                          ESIC accidental death &amp; disability benefit (₹5 Lakh policy) beneficiary on record.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer: Statutory Action Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <ShieldCheck size={16} className="text-blue-700 dark:text-sky-400 shrink-0" />
                    <span>Statutory Authority: Primary Cooperative Society Managing Committee</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedWorkerForAudit(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Close Dossier
                    </button>

                    {selectedWorkerForAudit.verification_status === 'PENDING' && (
                      <>
                        {/* Step Advancement Action */}
                        {(selectedWorkerForAudit.verification_step || 2) === 2 && (
                          <button
                            type="button"
                            disabled={verifyingId === selectedWorkerForAudit.id}
                            onClick={() => handleAdvanceStep(selectedWorkerForAudit.id, 3, selectedWorkerForAudit.user_name)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            title="KYC verified; advance to schedule physical toolkit inspection"
                          >
                            <Hammer size={14} />
                            <span>Advance to Stage 3 (Tool Check) →</span>
                          </button>
                        )}

                        {(selectedWorkerForAudit.verification_step || 2) === 3 && (
                          <button
                            type="button"
                            disabled={verifyingId === selectedWorkerForAudit.id}
                            onClick={() => handleAdvanceStep(selectedWorkerForAudit.id, 4, selectedWorkerForAudit.user_name)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            title="Physical inspection passed; advance to final committee resolution"
                          >
                            <Award size={14} />
                            <span>Advance to Stage 4 (Committee Resolution) →</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={verifyingId === selectedWorkerForAudit.id}
                          onClick={() => handleVerifyWorker(selectedWorkerForAudit.id, 'REJECTED', selectedWorkerForAudit.user_name)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer disabled:opacity-50"
                        >
                          ✕ Reject Application
                        </button>

                        <button
                          type="button"
                          disabled={verifyingId === selectedWorkerForAudit.id}
                          onClick={() => handleVerifyWorker(selectedWorkerForAudit.id, 'VERIFIED', selectedWorkerForAudit.user_name)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />
                          <span>{verifyingId === selectedWorkerForAudit.id ? 'Processing...' : '✓ Approve & Issue Accreditation Badge'}</span>
                        </button>
                      </>
                    )}

                    {selectedWorkerForAudit.verification_status === 'VERIFIED' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300">
                        <CheckCircle2 size={16} />
                        <span>Worker Fully Verified &amp; Active on Society Roster</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: LOCAL WORK ORDERS & DISPATCHES
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Local Ward Work Orders &amp; Dispatches
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Citizen household bookings and emergency service calls in {society.district || 'Khordha'}.
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {bookings.length} Total Bookings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Service Requested</th>
                    <th className="p-3.5">Customer &amp; Area</th>
                    <th className="p-3.5">Tariff (93% Worker)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {bookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 font-mono font-bold text-blue-900 dark:text-sky-400">BK-OD-{b.id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{b.service_name || 'Electrical Repair'}</td>
                      <td className="p-3.5">
                        <strong className="block text-slate-900 dark:text-white font-bold">{b.customer_name || 'Citizen'}</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">📍 {b.location_address || 'Bhubaneswar'}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{b.total_amount || 450}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SOCIETY TOOL BANK DEPOT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                Primary Society Asset Bank
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Local Tool &amp; Machinery Lease Bank
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Professional-grade machinery leased to registered member artisans at nominal cooperative rental rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {machineryList.map((tool) => (
              <div key={tool.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{tool.brand}</span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{tool.name}</h4>
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-lg font-black text-blue-900 dark:text-sky-400 font-mono">₹{tool.coopRentPerDay}/day</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>Available Depot Stock:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{tool.availableUnits} / {tool.totalUnits}</strong>
                  </div>
                </div>

                <button
                  disabled={tool.availableUnits === 0}
                  onClick={() => {
                    setSelectedTool(tool);
                    setShowToolModal(true);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Wrench size={14} />
                  <span>Issue Tool Lease</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SOCIETY TREASURY & MEMBER LOANS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'treasury' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[11px] font-bold text-blue-900 dark:text-sky-300 uppercase tracking-wider">Society Treasury Balance</span>
              <div className="text-2xl font-black text-blue-950 dark:text-white font-mono">
                ₹{(kpis.totalAmountInAccount || 833400).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">Khordha Central Cooperative Bank</p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">93% Worker Take-Home Paid</span>
              <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 font-mono">
                ₹{((kpis.totalAmountInAccount || 833400) * 0.93).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Direct credit to member bank accounts</p>
            </div>

            <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Member Micro-Loans Disbursed</span>
              <div className="text-2xl font-black text-purple-950 dark:text-purple-200 font-mono">
                ₹{(kpis.totalLoanAmountDisbursed || 58000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-purple-800 dark:text-purple-300 font-medium">Zero-interest tool financing</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: CITIZEN MEDIATION DESK
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  30-Day Guarantee Policy &amp; Customer Mediation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Citizen grievances requiring primary society inspection and resolution.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 dark:text-sky-300">#{d.ticket_number || `DISP-${d.id}`}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'RESOLVED' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">{d.issue_description || 'Minor repair re-inspection requested'}</strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Customer: {d.customer_name || 'Citizen Member'} • Worker Code: {d.worker_code || 'WKR-1001'}</span>
                  </div>

                  {d.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolveDispute(d.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ONBOARD MEMBER ARTISAN
         ───────────────────────────────────────────────────────────── */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-900 dark:text-sky-400" />
                <span>Onboard Member Artisan</span>
              </h3>
              <button onClick={() => setShowWorkerModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleRegisterWorker} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    placeholder="worker@demo.local"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Trade</label>
                  <select
                    value={workerFormData.primaryTrade}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, primaryTrade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option>Electrical</option>
                    <option>Plumbing</option>
                    <option>Carpentry</option>
                    <option>Painting</option>
                    <option>Appliance Repair</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={workerFormData.experienceYears}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, experienceYears: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeringWorker}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold shadow-sm transition cursor-pointer"
                >
                  {registeringWorker ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ISSUE TOOL LEASE VOUCHER
         ───────────────────────────────────────────────────────────── */}
      {showToolModal && selectedTool && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench size={18} className="text-blue-900 dark:text-sky-400" />
                <span>Issue Tool Lease Voucher</span>
              </h3>
              <button onClick={() => setShowToolModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleLeaseToolSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white block font-bold">{selectedTool.name}</strong>
                <span className="text-slate-500 dark:text-slate-400 font-mono">Daily Rate: ₹{selectedTool.coopRentPerDay}/day</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Artisan Full Name</label>
                <input
                  type="text"
                  required
                  value={leaseForm.artisanName}
                  onChange={(e) => setLeaseForm({ ...leaseForm, artisanName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Lease Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={leaseForm.daysCount}
                  onChange={(e) => setLeaseForm({ ...leaseForm, daysCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowToolModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold shadow-sm transition cursor-pointer"
                >
                  Generate Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
