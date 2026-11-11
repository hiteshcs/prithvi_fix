import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import CivicLoader from '../components/CivicLoader';
import {
  Briefcase, CheckCircle2, AlertTriangle, Star, ShieldCheck,
  Calendar, Clock, MapPin, Phone, Building2, Award, Zap,
  TrendingUp, IndianRupee, HeartPulse, RefreshCw, Check, X, Play,
  Volume2, VolumeX, ShieldAlert, Camera, Plus, Wrench, Shield,
  Package, CreditCard, Truck, Info, ShoppingBag, ChevronDown, ChevronUp,
  Minimize2, Maximize2, FileText, Receipt, Calculator, Sliders, Search, Lock
} from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { isSpeaking, speakText, stopSpeaking, voiceAlertsEnabled, toggleVoiceAlerts, activeSpeakingId } = useAccessibility();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // INCOMING, ACTIVE, SPLIT_PAYOUTS, TOOLKIT, COMPLETED, REVIEWS
  const [actionBusyId, setActionBusyId] = useState(null);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);

  // 93-2-5 Split & Payouts State
  const [expandedSplitId, setExpandedSplitId] = useState(null);
  const [invoiceModalBooking, setInvoiceModalBooking] = useState(null);
  const [simulatedTariff, setSimulatedTariff] = useState(1500);
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');

  // OTP Handshake & Work Execution Modals
  const [otpTargetBooking, setOtpTargetBooking] = useState(null);
  const [otpType, setOtpType] = useState('ARRIVAL'); // ARRIVAL or COMPLETION
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Photo Proof State
  const [photoTargetBooking, setPhotoTargetBooking] = useState(null);
  const [photoType, setPhotoType] = useState('PRE'); // PRE or POST
  const [photoUrl, setPhotoUrl] = useState('');

  // Add Parts State
  const [partsTargetBooking, setPartsTargetBooking] = useState(null);
  const [partsCatalog, setPartsCatalog] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);

  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Toolkit & In-Platform Buy State
  const [toolkitData, setToolkitData] = useState(null);
  const [toolkitLoading, setToolkitLoading] = useState(false);
  const [buyModalToolkit, setBuyModalToolkit] = useState(null);
  const [buyModalIndividualTool, setBuyModalIndividualTool] = useState(null);
  const [isEquipmentMinimized, setIsEquipmentMinimized] = useState(true);
  const [paymentMode, setPaymentMode] = useState('COOP_LOAN'); // 'COOP_LOAN' or 'DIRECT_PAY'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Real-Time First-to-Accept Broadcast Dispatch Pool States
  const [dismissedJobIds, setDismissedJobIds] = useState([]);
  const [lastAlertedJobId, setLastAlertedJobId] = useState(null);
  const [isBroadcastDocked, setIsBroadcastDocked] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [error, setError] = useState(null);

  const fetchDashboard = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    api.getWorkerDashboard()
      .then((data) => {
        setDashboardData(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load worker dashboard:', err);
        if (!isSilent) setError(err.message || 'Unable to load worker dashboard.');
      })
      .finally(() => {
        if (!isSilent) setLoading(false);
      });
  };

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      navigate('/customer/bookings', { replace: true });
      return;
    }
    if (user && user.role === 'COOPERATIVE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    fetchDashboard(false);
    fetchToolkits();
    // Silent auto-poll every 3 seconds for real-time dispatch pool updates
    const pollInterval = setInterval(() => {
      fetchDashboard(true);
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [user]);

  const fetchToolkits = async () => {
    setToolkitLoading(true);
    try {
      const data = await api.getWorkerToolkits();
      setToolkitData(data);
      if (data.worker?.address && !deliveryAddress) {
        setDeliveryAddress(`${data.worker.address}, ${data.worker.city || data.worker.district || 'Bhubaneswar'}`);
      }
    } catch (err) {
      console.error('Failed to load toolkits:', err);
    } finally {
      setToolkitLoading(false);
    }
  };

  const handleOpenBuyModal = (kit) => {
    setBuyModalIndividualTool(null);
    setBuyModalToolkit(kit);
    setOrderSuccess(null);
    setPaymentMode('COOP_LOAN');
    if (dashboardData?.worker?.address && !deliveryAddress) {
      setDeliveryAddress(`${dashboardData.worker.address}, ${dashboardData.worker.city || dashboardData.worker.district || 'Bhubaneswar'}`);
    }
  };

  const handleOpenBuyIndividualModal = (tool) => {
    setBuyModalIndividualTool(tool);
    setBuyModalToolkit(toolkitData?.mandatoryToolkit || {
      id: 1,
      kit_name: tool.item,
      trade_category: dashboardData?.worker?.primary_trade || 'Trade',
      subsidized_price: tool.individual_price,
      market_price: tool.market_price,
      monthly_emi: tool.monthly_emi,
      image_url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60',
    });
    setOrderSuccess(null);
    setPaymentMode('COOP_LOAN');
    if (dashboardData?.worker?.address && !deliveryAddress) {
      setDeliveryAddress(`${dashboardData.worker.address}, ${dashboardData.worker.city || dashboardData.worker.district || 'Bhubaneswar'}`);
    }
  };

  const handleOrderToolkitSubmit = async (e) => {
    e.preventDefault();
    if (!buyModalToolkit) return;
    setOrderSubmitting(true);
    try {
      const payload = {
        toolkit_id: buyModalToolkit.id,
        payment_mode: paymentMode,
        delivery_address: deliveryAddress || 'District Labour Cooperative Federation Hub',
      };
      if (buyModalIndividualTool) {
        payload.individual_tool = buyModalIndividualTool.item;
        payload.individual_price = buyModalIndividualTool.individual_price;
      }
      const res = await api.orderWorkerToolkit(payload);
      setOrderSuccess(res);
      fetchDashboard(true);
      fetchToolkits();
    } catch (err) {
      alert(err.message || 'Failed to process toolkit order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const { worker, skills, certifications, stats, incomingJobs, activeJobs, completedJobs, reviews } = dashboardData || {};

  // All active incoming jobs that have not been declined or dismissed by this worker
  const availableIncomingJobs = (incomingJobs || []).filter((j) => !dismissedJobIds.includes(j.id));

  // Active Broadcast Job for popup: First unhandled incoming request in the pool
  const broadcastJob = availableIncomingJobs[0] || null;

  // Opt-in Voice Alert for new incoming job: ONLY triggers if worker turned on Voice Alerts
  useEffect(() => {
    if (voiceAlertsEnabled && broadcastJob && broadcastJob.id !== lastAlertedJobId) {
      setLastAlertedJobId(broadcastJob.id);
      const text = `New ${broadcastJob.is_emergency ? 'emergency' : ''} broadcast order in ${broadcastJob.location_city}. ${broadcastJob.service_name}.`;
      speakText(text, { id: `broadcast-${broadcastJob.id}` });
    }
  }, [voiceAlertsEnabled, broadcastJob?.id, lastAlertedJobId, speakText]);

  const handleAvailabilityChange = async (newStatus) => {
    const liveJobs = (activeJobs || []).filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ACCEPTED');
    if (liveJobs.length > 0 && newStatus !== 'BUSY') {
      alert('Cannot change availability while you have active jobs in progress or accepted. Complete your active jobs first.');
      return;
    }
    setAvailabilityUpdating(true);
    try {
      await api.updateWorkerAvailability(newStatus);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to update availability:', err);
      const msg = err.response?.data?.message || err.message || 'Could not update availability status.';
      alert(msg);
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  // Voice Job Alert using centralized Accessibility Context with instant toggle
  const handleVoiceAlert = (job) => {
    const jobKey = `job-${job.id}`;
    if (isSpeaking && activeSpeakingId === jobKey) {
      stopSpeaking();
      return;
    }
    const text = `Work order. Service: ${job.service_name}. Location: ${job.location_address || job.location_city}. Scheduled for ${job.scheduled_date || 'today'}. Tariff: ${job.amount || job.total_amount || 0} rupees.`;
    speakText(text, { id: jobKey });
  };

  // Trigger One-Tap SOS Emergency Beacon (Phase 4)
  const handleTriggerSos = async () => {
    if (!window.confirm('🚨 TRIGGER EMERGENCY SOS BEACON?\n\nThis will send an immediate high-priority safety alert with your live GPS location to the District Cooperative Federation Supervisor and peer response squad.')) {
      return;
    }
    setSosLoading(true);
    try {
      const res = await api.triggerSos({
        latitude: 20.2961,
        longitude: 85.8245,
        details: 'Emergency SOS button triggered from worker dashboard.',
      });
      setSosActive(true);
      alert(res.message);
    } catch (err) {
      alert(err.message || 'Failed to activate SOS beacon.');
    } finally {
      setSosLoading(false);
    }
  };

  // Verify Arrival or Completion OTP (Phase 4)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp || !otpTargetBooking) return;

    setOtpLoading(true);
    try {
      if (otpType === 'ARRIVAL') {
        const res = await api.verifyArrivalOtp(otpTargetBooking.id, enteredOtp);
        alert(res.message || 'Arrival verified! Status is now IN_PROGRESS.');
      } else {
        const res = await api.verifyCompletionOtp(otpTargetBooking.id, enteredOtp);
        alert(res.message || 'Job completed! Merit points awarded and 30-Day Guarantee armed.');
      }
      setOtpTargetBooking(null);
      setEnteredOtp('');
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Incorrect OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Upload Photo Proof (Phase 4)
  const handleSavePhotoProof = async (e) => {
    e.preventDefault();
    if (!photoTargetBooking) return;
    const url = photoUrl.trim() || (photoType === 'PRE'
      ? 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'
      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400');

    try {
      await api.uploadPhotoProof(photoTargetBooking.id, photoType, url);
      alert(`${photoType === 'PRE' ? 'Pre-job' : 'Post-job'} photo recorded.`);
      setPhotoTargetBooking(null);
      setPhotoUrl('');
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to save photo.');
    }
  };

  // Open Parts Catalog Modal
  const handleOpenPartsModal = async (booking) => {
    setPartsTargetBooking(booking);
    setPartsLoading(true);
    try {
      const res = await api.getPartsCatalog();
      setPartsCatalog(res.parts || []);
    } catch (err) {
      console.error('Failed to load parts:', err);
    } finally {
      setPartsLoading(false);
    }
  };

  // Submit Selected Parts
  const handleAddPartsSubmit = async () => {
    if (selectedParts.length === 0 || !partsTargetBooking) return;
    try {
      await api.addPartsToBooking(partsTargetBooking.id, selectedParts);
      alert('Standard parts successfully added to work order invoice.');
      setPartsTargetBooking(null);
      setSelectedParts([]);
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to add parts.');
    }
  };

  const handleAction = async (bookingId, action) => {
    setActionBusyId(bookingId);
    try {
      if (action === 'DECLINE') {
        // Optimistically dismiss the job from the local view immediately
        setDismissedJobIds((prev) => [...prev, bookingId]);
        setDashboardData((prev) => prev ? {
          ...prev,
          incomingJobs: (prev.incomingJobs || []).filter((j) => j.id !== bookingId),
          stats: {
            ...prev.stats,
            incomingJobsCount: Math.max(0, (prev.stats?.incomingJobsCount || 1) - 1)
          }
        } : prev);
        setClaimFeedback({
          type: 'info',
          message: '✓ Work order declined without penalty. Passed to other cooperative artisans.',
        });
      }

      const res = await api.handleWorkerJobAction(bookingId, action);
      if (action === 'ACCEPT') {
        setClaimFeedback({
          type: 'success',
          message: '🎉 Work Order Claimed! You won this order. It has been added to your Active Tasks.',
        });
        setActiveTab('ACTIVE');
        // Dismiss from broadcast popup
        setDismissedJobIds((prev) => [...prev, bookingId]);
      }
      fetchDashboard(true);
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      if (action === 'ACCEPT') {
        setClaimFeedback({
          type: 'error',
          message: err.message || '⚡ Order Claimed: Another nearby artisan just accepted this order first.',
        });
        // Remove from broadcast popup immediately
        setDismissedJobIds((prev) => [...prev, bookingId]);
        fetchDashboard(true);
      } else {
        alert(err.message || 'Action failed.');
        fetchDashboard(true);
      }
    } finally {
      setActionBusyId(null);
      setTimeout(() => setClaimFeedback(null), 6000);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="container py-12 max-w-7xl mx-auto">
        <CivicLoader
          title="Loading Artisan Duty Terminal..."
          subtitle="Syncing cooperative work order pool, direct 93% wage balance, and field telemetry."
          size="lg"
        />
      </div>
    );
  }

  if (error || (!loading && !worker)) {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl shadow-sm space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-gray-900">Worker Profile Not Accessible</h2>
          <p className="text-xs text-gray-600">
            {error || 'No registered worker member profile was found for your account. Please sign in with an accredited worker member account.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              onClick={() => fetchDashboard(false)}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition"
            >
              Retry Connection
            </button>
            <Link
              to="/login?role=worker"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
            >
              Sign In as Artisan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-6">
      {/* ── REAL-TIME CLAIM FEEDBACK NOTIFICATION BANNER ── */}
      {claimFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold shadow-lg border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            claimFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : claimFeedback.type === 'info'
              ? 'bg-blue-50 text-blue-950 border-blue-300'
              : 'bg-amber-50 text-amber-950 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{claimFeedback.type === 'success' ? '✅' : claimFeedback.type === 'info' ? 'ℹ️' : '⚡'}</span>
            <span>{claimFeedback.message}</span>
          </div>
          <button
            onClick={() => setClaimFeedback(null)}
            className="p-1 text-gray-500 hover:text-gray-900 rounded"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {/* ── PENDING / REJECTED VERIFICATION STATUS BANNER ── */}
      {worker?.verification_status === 'PENDING' && (() => {
        const step = worker?.verification_step || 2;
        const stepTitles = {
          1: 'Digital Dossier Submitted & Logged',
          2: 'Primary Society Document & KYC Scrutiny',
          3: 'Physical Trade Skill & Tool Inspection',
          4: 'Final Committee Resolution & Badge Issuance'
        };
        const currentTitle = stepTitles[step] || 'Primary Society Review';

        return (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                  ⏳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300">
                      Step {step} of 4: {currentTitle}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    Application Reference: <span className="font-mono text-blue-950">{worker?.application_no || 'APP-OD-2026-PENDING'}</span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    Statutory Authority: <strong>{worker?.society_name || worker?.cooperative_name || 'Primary Cooperative Society'}</strong>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-semibold text-amber-800 block">
                  Primary Trade: <strong>{worker?.primary_trade || 'Skilled Artisan'}</strong>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {step === 2 && 'Primary Society committee is auditing your submitted KYC & certificates.'}
                  {step === 3 && 'Visit your Primary Society center with your tools for physical inspection.'}
                  {step === 4 && 'Management committee resolution in progress for badge issuance.'}
                </span>
              </div>
            </div>

            {/* 4-Step Dynamic Verification Timeline */}
            <div className="pt-3 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>1. Digital Dossier</span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">Submitted &amp; Logged in State Register</p>
              </div>

              <div className={`p-3 rounded-xl border ${
                step === 2
                  ? 'bg-amber-100/90 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  : step > 2
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-white/60 border-slate-200 text-slate-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[11px]">
                  {step > 2 ? (
                    <CheckCircle2 size={14} className="text-emerald-700" />
                  ) : (
                    <Clock size={14} className="text-amber-700 animate-pulse" />
                  )}
                  <span>2. Society KYC Scrutiny</span>
                </div>
                <p className="text-[10px] mt-1 text-slate-700">
                  {step > 2 ? 'Documents & KYC Verified' : `Under audit by ${worker?.society_name || 'Primary Society'}`}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                step === 3
                  ? 'bg-amber-100/90 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  : step > 3
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-white/60 border-slate-200 text-slate-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[11px]">
                  {step > 3 ? (
                    <CheckCircle2 size={14} className="text-emerald-700" />
                  ) : step === 3 ? (
                    <Clock size={14} className="text-amber-700 animate-pulse" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block text-center text-[9px]">3</span>
                  )}
                  <span>3. Physical Tool &amp; Skill</span>
                </div>
                <p className="text-[10px] mt-1 text-slate-700">
                  {step > 3 ? 'Tools & Skill Certified' : step === 3 ? 'Physical check at Society Workshop' : 'Scheduled after document review'}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                step === 4
                  ? 'bg-amber-100/90 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  : 'bg-white/60 border-slate-200 text-slate-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[11px]">
                  {step === 4 ? (
                    <Clock size={14} className="text-amber-700 animate-pulse" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block text-center text-[9px]">4</span>
                  )}
                  <span>4. Committee Resolution</span>
                </div>
                <p className="text-[10px] mt-1 text-slate-700">
                  {step === 4 ? 'Accreditation resolution in progress' : 'Badge issuance & live dispatch activation'}
                </p>
              </div>
            </div>

            {/* Guidance Alert based on current step */}
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <span className="font-bold text-amber-800">📌 Current Action:</span>
              <span>
                {step === 2 && `Your designated Primary Cooperative Society (${worker?.society_name || 'Assigned Society'}) is currently auditing your Aadhaar, PAN, Bank Details, and Trade Qualifications. You do not need to take any action right now.`}
                {step === 3 && `Your documents have passed KYC scrutiny! Please report to your Primary Cooperative Society (${worker?.society_name || 'Assigned Society'}) office/workshop with your trade tools for physical verification and kit inspection.`}
                {step === 4 && `Your physical tool and trade verification has been approved! The society management committee is recording the formal resolution to issue your digital artisan badge and activate your live work dispatch console.`}
              </span>
            </div>
          </div>
        );
      })()}

      {worker?.verification_status === 'REJECTED' && (
        <div className="p-5 bg-red-50 rounded-2xl border-2 border-red-300 shadow-sm space-y-2 text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
            <strong className="text-sm font-bold text-red-950">
              Application Disapproved by Primary Cooperative Society
            </strong>
          </div>
          <p className="text-xs text-red-800">
            <strong>Reason for Rejection:</strong> {worker?.rejection_reason || 'Trade certificate or KYC records could not be verified by society committee.'}
          </p>
          <p className="text-[11px] text-red-700">
            Please contact your Primary Cooperative Society ({worker?.society_name || 'Assigned Society'}) or Cooperative Secretariat for re-verification.
          </p>
        </div>
      )}

      {/* Dual Compliance Prerequisite Banner: Both required to work */}
      {worker && (worker?.verification_status !== 'VERIFIED' || (toolkitData?.complianceStatus || worker?.toolkit_compliance) !== 'VERIFIED_EQUIPPED') && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-lg">
              ⚠️
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                Prerequisites to Work: Both Verification & Mandatory ISI Toolkit Required
              </h4>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Under cooperative guidelines, artisans can only go online and take work orders once both requirements are completed:
                <strong className="ml-1">
                  {worker?.verification_status === 'VERIFIED' ? '✓ Cooperative Verified' : '⏳ Verification Pending'}
                </strong>
                <span className="mx-1">•</span>
                <strong>
                  {(toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED' ? '✓ Mandatory Toolkit Verified' : '⚠️ Mandatory Toolkit Required'}
                </strong>
              </p>
            </div>
          </div>
          {(toolkitData?.complianceStatus || worker?.toolkit_compliance) !== 'VERIFIED_EQUIPPED' && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('TOOLKIT');
                fetchToolkits();
              }}
              className="btn btn-primary btn-sm text-xs font-bold shrink-0 self-start sm:self-center"
            >
              Equip Mandatory Toolkit →
            </button>
          )}
        </div>
      )}

      {/* Header & Worker ID Profile Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-950 text-white font-bold text-2xl flex flex-col items-center justify-center shrink-0 shadow-md">
              <span>{user?.name?.charAt(0) || 'W'}</span>
              <span className="text-[8px] font-mono text-amber-400">{worker?.tier || 'BRONZE'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                  {worker?.worker_code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  worker?.tier === 'MASTER'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300'
                }`}>
                  {worker?.tier || 'BRONZE'} ARTISAN ({worker?.merit_points || 100} Merit Pts)
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                  worker?.verification_status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : worker?.verification_status === 'REJECTED'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {worker?.verification_status === 'VERIFIED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {worker?.verification_status}
                </span>

                {/* Mandatory Toolkit Compliance Badge */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('TOOLKIT');
                    fetchToolkits();
                  }}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition shadow-xs ${
                    (toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 animate-pulse'
                  }`}
                  title="Click to inspect Mandatory Trade Toolkit compliance & platform procurement store"
                >
                  <Wrench size={11} className={(toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED' ? 'text-emerald-700' : 'text-amber-700'} />
                  {(toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
                    ? '✓ Mandatory ISI Toolkit Verified'
                    : '⚠️ Mandatory Toolkit Required'}
                </button>
              </div>

              <div className="text-xs text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  {worker?.is_independent || !worker?.society_id ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      Independent Freelance Artisan
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                      Primary Society: {worker?.society_name || 'Affiliated'}
                    </span>
                  )}
                  <span className="text-gray-500 text-[11px] flex items-center gap-1">
                    <Building2 size={13} className="text-blue-900" /> {worker?.cooperative_name}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-blue-900" /> {worker?.service_area || worker?.city}, {worker?.district}
                </span>
                <span>•</span>
                <span>{worker?.primary_trade || 'Artisan'} • {worker?.experience_years} Yrs Exp</span>
              </div>
            </div>
          </div>

          {/* Action buttons: SOS Beacon & Availability Switch */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* 1-Tap SOS Beacon */}
            <button
              onClick={handleTriggerSos}
              disabled={sosLoading || worker?.verification_status !== 'VERIFIED'}
              className={`btn btn-sm font-bold flex items-center gap-1.5 shadow-md ${
                sosActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white disabled:opacity-50'
              }`}
            >
              <ShieldAlert size={14} />
              {sosActive ? '🚨 SOS ACTIVE' : '1-Tap SOS Beacon'}
            </button>

            {/* Voice Job Announcements Opt-in Switch */}
            <button
              type="button"
              onClick={toggleVoiceAlerts}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                voiceAlertsEnabled
                  ? 'bg-amber-400 text-blue-950 border-amber-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200'
              }`}
              title={voiceAlertsEnabled ? "Voice Job Announcements: ON (Click to Mute)" : "Voice Job Announcements: OFF (Click to Enable)"}
            >
              {voiceAlertsEnabled ? <Volume2 size={14} className="text-blue-950" /> : <VolumeX size={14} className="text-gray-500" />}
              <span className="hidden sm:inline">Voice Alerts:</span>
              <span>{voiceAlertsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Availability Toggle (Disabled if not both VERIFIED & TOOLKIT EQUIPPED, or actively on a job) */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
              {['AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => {
                const liveJobs = (activeJobs || []).filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ACCEPTED');
                const hasLiveJob = liveJobs.length > 0;
                const effectiveStatus = hasLiveJob ? 'BUSY' : (worker?.availability || 'AVAILABLE');
                const isActive = effectiveStatus === status;
                const isBlockedByJob = hasLiveJob && (status === 'AVAILABLE' || status === 'OFFLINE');
                const isToolkitEquipped = (toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED';
                const isVerified = worker?.verification_status === 'VERIFIED';
                const canWork = isVerified && isToolkitEquipped;
                const isBlockedByCompliance = (status === 'AVAILABLE') && !canWork;
                const isDisabled = isBlockedByCompliance || !isVerified || availabilityUpdating || isBlockedByJob;
                const tooltip = !isVerified && !isToolkitEquipped
                  ? 'Duty console locked: Both Cooperative Verification and Mandatory ISI Toolkit required'
                  : !isVerified
                  ? 'Duty console locked until cooperative admin verification'
                  : !isToolkitEquipped && status === 'AVAILABLE'
                  ? 'Duty console locked: Mandatory ISI Toolkit required before taking jobs'
                  : isBlockedByJob
                  ? `Artisan is currently on an active work order (${liveJobs[0]?.booking_code || 'Job in progress'}). Complete order first.`
                  : status === 'BUSY' && hasLiveJob
                  ? 'Artisan is currently busy on an active job'
                  : '';
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleAvailabilityChange(status)}
                    title={tooltip}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isActive
                        ? status === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : status === 'BUSY'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-gray-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4-KPI Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">Total Lifetime Payouts</span>
            <div className="text-xl font-black font-mono text-blue-950 mt-0.5">
              ₹{worker?.total_earnings?.toLocaleString('en-IN') || '0'}
            </div>
            <span className="text-[11px] text-blue-800 font-bold block mt-0.5">93% Direct Wallet Payout</span>
          </div>

          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">Completed Orders</span>
            <div className="text-xl font-black font-mono text-emerald-950 mt-0.5">
              {worker?.total_jobs_completed || 0} Gigs
            </div>
            <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">100% On-Time Rate</span>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider">Artisan Rating</span>
            <div className="text-xl font-black text-amber-950 mt-0.5 flex items-center gap-1">
              <Star size={17} className="text-amber-500 fill-amber-500" />
              {worker?.rating > 0 ? worker.rating.toFixed(1) : '4.8'}
            </div>
            <span className="text-[11px] text-amber-900 font-bold block mt-0.5">({worker?.total_reviews || 0} reviews)</span>
          </div>

          <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-indigo-950 tracking-wider">Merit Points</span>
            <div className="text-xl font-black font-mono text-indigo-950 mt-0.5">
              {worker?.merit_points || 100} pts
            </div>
            <span className="text-[11px] text-indigo-800 font-bold block mt-0.5">Tier: {worker?.tier || 'MASTER'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold overflow-x-auto">
        {[
          { key: 'ACTIVE', label: `Active Tasks (${activeJobs?.length || 0})` },
          { key: 'INCOMING', label: `Dispatch Inbox (${availableIncomingJobs.length})` },
          { key: 'SPLIT_PAYOUTS', label: `💰 Payouts & 93-2-5 Split` },
          { key: 'TOOLKIT', label: `🧰 Mandatory Tool Kit (${worker?.primary_trade || 'Trade'})` },
          { key: 'COMPLETED', label: `Completed Orders (${completedJobs?.length || 0})` },
          { key: 'REVIEWS', label: `Feedback & Reviews (${reviews?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'TOOLKIT') fetchToolkits();
            }}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-950 text-blue-950 font-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE JOBS WITH FULL 5-STEP HANDSHAKE CONTROLS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {activeJobs?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
              No jobs currently in progress. Check the Dispatch Inbox for new bookings.
            </div>
          ) : (
            activeJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-900">{job.booking_code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        job.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-yellow-100 text-yellow-900'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        🔒 On Job / Busy Slot
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mt-1">{job.service_name}</h3>
                    <div className="text-xs text-blue-900 font-semibold mt-0.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-700" />
                      <span>Scheduled Slot: <strong>{job.scheduled_date}</strong> at <strong>{job.scheduled_time}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Net Labour Payout:</span>
                    <div className="text-lg font-bold font-mono text-emerald-700">₹{job.amount}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-gray-500 block">Customer:</span>
                    <strong>{job.customer_name}</strong> (Ph: {job.customer_phone || '9876543210'})
                  </div>
                  <div>
                    <span className="text-gray-500 block">Address:</span>
                    <strong>{job.location_address}, {job.location_city}</strong>
                  </div>
                </div>

                {/* 5-Step Execution Handshake Action Buttons for Worker */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                  <div className="text-xs font-bold text-blue-950 flex items-center justify-between">
                    <span>Job Execution Handshakes</span>
                    <span className="text-[10px] text-blue-800 font-normal">Protocol compliant</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* 1. Enter Arrival OTP */}
                    {job.status === 'ACCEPTED' && (
                      <button
                        onClick={() => {
                          setOtpTargetBooking(job);
                          setOtpType('ARRIVAL');
                        }}
                        className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1"
                      >
                        <ShieldCheck size={13} /> 1. Enter Customer Arrival OTP
                      </button>
                    )}

                    {/* 2. Upload Pre-Job Photo Proof */}
                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setPhotoTargetBooking(job);
                          setPhotoType('PRE');
                        }}
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                      >
                        <Camera size={13} /> 2. {job.pre_job_photo_url ? '✓ Pre-Job Photo Saved' : 'Add Pre-Job Photo'}
                      </button>
                    )}

                    {/* 3. Add Locked Parts */}
                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleOpenPartsModal(job)}
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                      >
                        <Wrench size={13} /> 3. Add Parts (Price Matrix)
                      </button>
                    )}

                    {/* 4. Upload Post-Job Photo Proof */}
                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setPhotoTargetBooking(job);
                          setPhotoType('POST');
                        }}
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                      >
                        <Camera size={13} /> 4. {job.post_job_photo_url ? '✓ Post-Job Photo Saved' : 'Add Post-Job Photo'}
                      </button>
                    )}

                    {/* 5. Enter Completion OTP */}
                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setOtpTargetBooking(job);
                          setOtpType('COMPLETION');
                        }}
                        className="btn btn-saffron btn-sm text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} /> 5. Enter Completion OTP & Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INCOMING JOBS WITH VOICE ALERT & INSTANT ACCEPT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'INCOMING' && (
        <div className="space-y-4">
          {availableIncomingJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
              No new incoming requests in dispatch inbox.
            </div>
          ) : (
            availableIncomingJobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-900">{job.booking_code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      NEW DISPATCH
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      job.is_emergency
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      ⏱️ {job.is_emergency ? '10m Emergency Window' : '30m Acceptance Window'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mt-1">{job.service_name}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    📍 {job.location_address}, {job.location_city} • 📅 {job.scheduled_date} at {job.scheduled_time}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoiceAlert(job)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    title="Play voice audio alert in your regional language"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(job.id, 'ACCEPT')}
                    disabled={actionBusyId === job.id}
                    className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
                  >
                    {actionBusyId === job.id ? (
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleAction(job.id, 'DECLINE')}
                    disabled={actionBusyId === job.id}
                    className="btn btn-secondary btn-sm text-xs text-gray-600 hover:text-red-700 hover:border-red-300 transition flex items-center gap-1.5"
                  >
                    {actionBusyId === job.id ? (
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-gray-500 border-t-transparent" />
                    ) : (
                      <X size={13} />
                    )}
                    <span>Decline (Zero Penalty)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COMPLETED JOBS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-3">
          {completedJobs?.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-blue-900">{job.booking_code}</span>
                <div className="font-bold text-gray-900 mt-0.5">{job.service_name}</div>
                <div className="text-gray-500">{job.scheduled_date} • Customer: {job.customer_name}</div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-emerald-700 text-sm">₹{job.amount}</span>
                <div className="text-[10px] text-emerald-700 font-semibold">✓ Paid & Closed</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MANDATORY TOOLKITS & COOPERATIVE STORE TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'TOOLKIT' && (
        <div className="space-y-6">
          {/* Status Hero Card */}
          <div className={`p-6 rounded-2xl border shadow-sm ${
            (toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300'
              : 'bg-gradient-to-r from-amber-50 via-orange-50 to-white border-amber-300'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    (toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-amber-600 text-white border-amber-700'
                  }`}>
                    {(toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
                      ? '✓ Verified Equipped Artisan'
                      : '⚠️ Mandatory Toolkit Required'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Trade: <strong>{worker?.primary_trade || 'General Trade'}</strong>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {(toolkitData?.complianceStatus || worker?.toolkit_compliance) === 'VERIFIED_EQUIPPED'
                    ? 'All Mandatory Trade Tools Compliant & Certified'
                    : 'Mandatory ISI Tool Kit Required for Master Dispatch'}
                </h2>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Under Federation Quality Norms, artisans must possess verified ISI-grade calibrated tools.
                  You can purchase your certified trade toolkit directly through the platform using <strong>Cooperative Bulk Subsidies (up to 45% off)</strong> or via a <strong>0% Interest Micro-Loan</strong> deductible in small ₹50/job increments.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                {toolkitData?.mandatoryToolkit && (
                  <button
                    type="button"
                    onClick={() => handleOpenBuyModal(toolkitData.mandatoryToolkit)}
                    className="btn btn-primary btn-sm font-bold flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white shadow-md py-2.5 px-4"
                  >
                    <ShoppingBag size={15} />
                    <span>Buy / Finance Through Platform</span>
                  </button>
                )}
              </div>
            </div>

            {/* Owned Tools Summary pill with Minimize / Expand and De-duplication */}
            {worker?.tools_owned && (
              <div className="mt-4 pt-4 border-t border-slate-200/80 text-xs">
                {(() => {
                  const uniqueOwnedTools = Array.from(
                    new Set(
                      worker.tools_owned
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  );

                  const displayedTools = isEquipmentMinimized
                    ? uniqueOwnedTools.slice(0, 3)
                    : uniqueOwnedTools;

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 text-[11px] uppercase tracking-wider">
                            Registered Equipment on Record
                          </strong>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                            {uniqueOwnedTools.length} {uniqueOwnedTools.length === 1 ? 'Item' : 'Items'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEquipmentMinimized(!isEquipmentMinimized)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 hover:text-blue-950 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition shadow-2xs cursor-pointer"
                        >
                          <span>{isEquipmentMinimized ? `Show All (${uniqueOwnedTools.length})` : 'Minimize List'}</span>
                          {isEquipmentMinimized ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {displayedTools.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white rounded-md border border-slate-200 text-slate-700 text-[11px] inline-flex items-center gap-1.5 shadow-2xs font-medium"
                          >
                            <Check size={12} className="text-emerald-600 shrink-0" />
                            <span>{t}</span>
                          </span>
                        ))}

                        {isEquipmentMinimized && uniqueOwnedTools.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setIsEquipmentMinimized(false)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-md border border-blue-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>+{uniqueOwnedTools.length - 3} more registered tools</span>
                            <ChevronDown size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Active Toolkit Micro-Loan Card (if active) */}
          {toolkitData?.activeLoan && (
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-900 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-900" />
                  <div>
                    <h3 className="font-bold text-sm text-blue-950">Active Cooperative Toolkit Micro-Loan</h3>
                    <span className="font-mono text-xs text-slate-500">Ref: {toolkitData.activeLoan.order_code}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    0% Interest • LCF Micro-Finance
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Kit Purchased</span>
                  <div className="font-bold text-slate-900 mt-0.5">{toolkitData.activeLoan.kit_name}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Financed</span>
                  <div className="font-mono font-bold text-blue-950 mt-0.5">₹{toolkitData.activeLoan.total_amount}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Paid Repaid</span>
                  <div className="font-mono font-bold text-emerald-800 mt-0.5">₹{toolkitData.activeLoan.paid_amount}</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-900 font-bold uppercase block">Balance Due</span>
                  <div className="font-mono font-bold text-amber-950 mt-0.5">₹{toolkitData.activeLoan.remaining_amount}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Repayment Progress</span>
                  <span className="font-bold font-mono">
                    {Math.round((toolkitData.activeLoan.paid_amount / toolkitData.activeLoan.total_amount) * 100)}% Repaid
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((toolkitData.activeLoan.paid_amount / toolkitData.activeLoan.total_amount) * 100))}%`
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                  <Info size={12} className="text-blue-900 shrink-0" />
                  <span>Repayments are auto-deducted at ₹{toolkitData.activeLoan.loan_deduction_per_job || 50} per completed work order from your 93% escrow wallet payout.</span>
                </p>
              </div>
            </div>
          )}

          {/* Mandatory Trade Toolkit Breakdown */}
          {toolkitData?.mandatoryToolkit && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={toolkitData.mandatoryToolkit.image_url}
                    alt={toolkitData.mandatoryToolkit.kit_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      Primary Trade Toolkit • {toolkitData.mandatoryToolkit.trade_category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {toolkitData.mandatoryToolkit.kit_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {toolkitData.mandatoryToolkit.description}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 line-through">Market: ₹{toolkitData.mandatoryToolkit.market_price}</div>
                  <div className="text-lg font-black font-mono text-emerald-700">
                    ₹{toolkitData.mandatoryToolkit.subsidized_price}
                  </div>
                  <div className="text-[10px] font-bold text-blue-900">
                    or ₹{toolkitData.mandatoryToolkit.monthly_emi}/mo @ 0% Loan
                  </div>
                </div>
              </div>

              {/* Itemized Inspection Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-900" />
                  <span>Mandatory Tool Specification Checklist</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {(toolkitData.checklist || []).map((tool, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition ${
                        tool.owned
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{tool.item}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Standard: {tool.standard}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          tool.owned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {tool.owned ? '✓ Equipped' : 'Missing'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-bold text-emerald-700">₹{tool.individual_price}</span>
                          <span className="text-[10px] text-slate-400 line-through">₹{tool.market_price}</span>
                          <span className="text-[10px] text-blue-900 font-semibold">
                            (or ₹{tool.monthly_emi}/mo @ 0% Loan)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenBuyIndividualModal(tool)}
                          className="text-[10px] font-bold text-blue-900 hover:text-blue-950 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs ml-auto"
                        >
                          <ShoppingBag size={11} />
                          <span>{tool.owned ? 'Buy Spare' : 'Buy Tool Individually'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standards Banner & Direct Procurement Action */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-950 flex items-center gap-2">
                <Award size={16} className="text-blue-900 shrink-0" />
                <span>
                  <strong>BIS/ISI Compliance Standards:</strong> {toolkitData.mandatoryToolkit.isi_standards}. Procuring this kit grants <strong>+50 Merit Points</strong>.
                </span>
              </div>

              {/* Direct In-Platform Buy/Finance Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                <div className="text-xs text-slate-600">
                  <span>Available via <strong>Cooperative Bulk Subsidy</strong> (₹{toolkitData.mandatoryToolkit.subsidized_price}) or <strong>0% Interest Micro-Loan</strong> (₹{toolkitData.mandatoryToolkit.monthly_emi}/mo or ₹50/gig deduction).</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal(toolkitData.mandatoryToolkit)}
                  className="btn btn-primary btn-sm font-bold flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white shadow-md py-2 px-5 whitespace-nowrap cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Buy / Finance Full Mandatory Kit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED 93-2-5 PAYOUTS & DISBURSEMENT LEDGER
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'SPLIT_PAYOUTS' && (
        <div className="space-y-6">
          {/* Top Statutory Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-400/40 text-[11px] font-bold text-blue-200">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Statutory 93-2-5 Tariff Model (Act 1962 Regulated)</span>
                </div>
                <h3 className="text-xl font-black mt-2">Dignified Living Wage Payout Console</h3>
                <p className="text-xs text-blue-200/80 max-w-xl">
                  Unlike commercial aggregator apps charging 25%–35% middleman commissions, Prithvi Fix directs <strong>93%</strong> straight to your wallet, with <strong>5%</strong> funding your social security & healthcare cover.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Total Net Disbursed</span>
                <span className="text-2xl font-black font-mono text-emerald-300">
                  ₹{(dashboardData?.splitSummary?.netDisbursed || worker?.total_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-blue-200 block mt-0.5">Instant UPI / NEFT Direct Settlement</span>
              </div>
            </div>

            {/* Visual Proportional Split Bar */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex justify-between text-[11px] font-bold text-blue-100">
                <span>Split Distribution</span>
                <span>100% Algorithmic Escrow Transparency</span>
              </div>
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-white/20 p-0.5 gap-0.5">
                <div className="bg-emerald-500 rounded-l-full h-full flex items-center justify-center text-[9px] font-black text-emerald-950" style={{ width: '93%' }} title="93% Worker Direct Living Wage">
                  93% Net Wage
                </div>
                <div className="bg-amber-400 h-full flex items-center justify-center text-[9px] font-black text-amber-950" style={{ width: '5%' }} title="5% PF & Healthcare Fund">
                  5%
                </div>
                <div className="bg-blue-400 rounded-r-full h-full flex items-center justify-center text-[9px] font-black text-blue-950" style={{ width: '2%' }} title="2% Platform Operations">
                  2%
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-blue-200 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span><strong>93% Direct Living Wage:</strong> ₹{(dashboardData?.splitSummary?.workerWage93 || ((worker?.total_earnings || 0) * 0.93)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span><strong>5% ESIC / Healthcare Reserve:</strong> ₹{(dashboardData?.splitSummary?.welfareFund5 || ((worker?.total_earnings || 0) * 0.05)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
                  <span><strong>2% Federation Upkeep:</strong> ₹{(dashboardData?.splitSummary?.platformFee2 || ((worker?.total_earnings || 0) * 0.02)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {(dashboardData?.splitSummary?.totalParts > 0) && (
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-300 inline-block"></span>
                    <span><strong>Parts Reimbursed (100%):</strong> ₹{dashboardData?.splitSummary?.totalParts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Live 93-2-5 Earnings Simulator */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                  <Calculator size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Interactive 93-2-5 Payout Calculator</h4>
                  <p className="text-xs text-slate-500">Estimate your take-home pay and social security credit on any job amount</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Test Job Tariff:</span>
                <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-300">
                  <span className="font-bold text-xs text-slate-600 mr-1">₹</span>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="50"
                    value={simulatedTariff}
                    onChange={(e) => setSimulatedTariff(Math.max(0, Number(e.target.value)))}
                    className="w-20 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
              {[299, 599, 899, 1499, 2499, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSimulatedTariff(amt)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    simulatedTariff === amt
                      ? 'bg-blue-950 text-white border-blue-950'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Computed Calculator Cards */}
            {(() => {
              const base = Number(simulatedTariff) || 0;
              const wage93 = Math.round(base * 0.93 * 100) / 100;
              const welfare5 = Math.round(base * 0.05 * 100) / 100;
              const platform2 = Math.round(base * 0.02 * 100) / 100;
              const commercialCut = Math.round(base * 0.28 * 100) / 100;
              const savedVsAggregator = Math.round((commercialCut - platform2) * 100) / 100;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-800">
                      93% Direct Wallet Credit
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-700">
                      ₹{wage93.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Instant take-home wage with zero middleman deductions.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-800">
                      5% Health & Welfare Fund
                    </span>
                    <div className="text-2xl font-black font-mono text-amber-700">
                      ₹{welfare5.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Credited directly into your ESIC healthcare & pension fund.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-800">
                      Cooperative Surplus Kept
                    </span>
                    <div className="text-2xl font-black font-mono text-blue-700">
                      +₹{savedVsAggregator.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Extra earnings vs 28% commercial aggregator cut.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Historical Orders Financial Ledger */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">All Completed Orders Payout Ledger</h4>
                <p className="text-xs text-slate-500">Every completed gig audited with full 93-2-5 escrow breakdown</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order # or service..."
                  value={completedSearchQuery}
                  onChange={(e) => setCompletedSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>

            {completedJobs?.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No completed jobs in your payout ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Work Order</th>
                      <th className="p-3">Service & Date</th>
                      <th className="p-3 text-right">Gross Tariff</th>
                      <th className="p-3 text-right text-emerald-800">93% Wage</th>
                      <th className="p-3 text-right text-amber-800">5% Welfare</th>
                      <th className="p-3 text-right text-blue-800">2% Upkeep</th>
                      <th className="p-3 text-right text-teal-800">Parts</th>
                      <th className="p-3 text-right font-black">Net Payout</th>
                      <th className="p-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedJobs
                      ?.filter((j) => {
                        if (!completedSearchQuery) return true;
                        const q = completedSearchQuery.toLowerCase();
                        return (
                          (j.booking_code || '').toLowerCase().includes(q) ||
                          (j.service_name || '').toLowerCase().includes(q) ||
                          (j.customer_name || '').toLowerCase().includes(q)
                        );
                      })
                      .map((job) => {
                        const gross = Number(job.amount || 0);
                        const parts = Number(job.parts_cost || 0);
                        const wage93 = Number(job.worker_wage_93 || (gross * 0.93).toFixed(2));
                        const welfare5 = Number(job.welfare_fund_5 || (gross * 0.05).toFixed(2));
                        const platform2 = Number(job.platform_fee_2 || (gross * 0.02).toFixed(2));
                        const totalPayout = Number(job.net_payout || (wage93 + parts).toFixed(2));

                        return (
                          <tr key={job.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono font-bold text-blue-900">
                              {job.booking_code}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{job.service_name}</div>
                              <div className="text-[10px] text-gray-400">
                                {job.completed_at ? new Date(job.completed_at).toLocaleDateString('en-IN') : job.scheduled_date}
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-600">
                              ₹{gross.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                              ₹{wage93.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono text-amber-700">
                              ₹{welfare5.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono text-blue-700">
                              ₹{platform2.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono text-teal-700">
                              {parts > 0 ? `+₹${parts.toFixed(2)}` : '—'}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-emerald-800 bg-emerald-50/40">
                              ₹{totalPayout.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => setInvoiceModalBooking(job)}
                                className="text-[10px] font-bold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition cursor-pointer"
                                title="View Form IV Tax Invoice"
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COMPLETED ORDERS WITH ORDER-SPECIFIC DETAILED SPLIT BREAKDOWN
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="font-bold text-sm text-blue-950">Completed Work Orders History</h3>
              <p className="text-xs text-gray-500">
                Audited order-by-order tariff breakdown showing your 93% wage, 5% healthcare reserve, 2% platform upkeep, and parts reimbursements.
              </p>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Total Orders: <strong>{completedJobs?.length || 0}</strong>
            </div>
          </div>

          {completedJobs?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-gray-300" />
              <p className="font-bold">No completed work orders yet.</p>
              <p className="text-gray-400">Accepted jobs completed through the 5-step OTP handshake will appear here with detailed financial split statements.</p>
            </div>
          ) : (
            completedJobs.map((job) => {
              const grossLabour = Number(job.amount || 0);
              const parts = Number(job.parts_cost || 0);
              const wage93 = Number(job.worker_wage_93 || (grossLabour * 0.93).toFixed(2));
              const welfare5 = Number(job.welfare_fund_5 || (grossLabour * 0.05).toFixed(2));
              const platform2 = Number(job.platform_fee_2 || (grossLabour * 0.02).toFixed(2));
              const totalPayout = Number(job.net_payout || (wage93 + parts).toFixed(2));
              const isExpanded = expandedSplitId === job.id;

              return (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition hover:border-blue-300">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {job.booking_code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <Check size={11} /> COMPLETED & SETTLED
                        </span>
                        <span className="text-gray-400 text-xs">
                          {job.completed_at ? new Date(job.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : job.scheduled_date}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-gray-900">{job.service_name}</h4>
                      <div className="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                        <span>Citizen: <strong>{job.customer_name}</strong></span>
                        <span>•</span>
                        <span>Location: <strong>{job.location_city || job.location_district}</strong></span>
                        {job.review_rating && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <Star size={12} className="fill-amber-500 text-amber-500" /> {job.review_rating}/5 Rating
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-1 shrink-0 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                      <span className="text-xs text-gray-500">Net Disbursed Payout:</span>
                      <div className="text-xl font-black font-mono text-emerald-700">
                        ₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedSplitId(isExpanded ? null : job.id)}
                          className="text-[11px] font-bold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        >
                          <Info size={12} />
                          <span>{isExpanded ? 'Hide Split' : 'Particular Order Split'}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceModalBooking(job)}
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Form IV Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Particular Order Split Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-gray-200 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Receipt size={14} className="text-blue-900" />
                          <span>Statutory Form IV Financial Split — Order #{job.booking_code}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Tariff Model: Regulated 93-2-5
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Gross Billed Tariff</span>
                          <span className="text-base font-black font-mono text-slate-900 mt-0.5 block">
                            ₹{grossLabour.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-gray-400">Total Customer Charge</span>
                        </div>

                        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-900 block">93% Worker Direct Wage</span>
                          <span className="text-base font-black font-mono text-emerald-800 mt-0.5 block">
                            ₹{wage93.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">Credited to Artisan Wallet</span>
                        </div>

                        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                          <span className="text-[10px] uppercase font-bold text-amber-900 block">5% Healthcare & PF</span>
                          <span className="text-base font-black font-mono text-amber-800 mt-0.5 block">
                            ₹{welfare5.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">Odisha Welfare Trust #PF-4401</span>
                        </div>

                        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                          <span className="text-[10px] uppercase font-bold text-blue-900 block">2% Tech & Governance</span>
                          <span className="text-base font-black font-mono text-blue-800 mt-0.5 block">
                            ₹{platform2.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-blue-700 font-medium">State Cooperative Server Ops</span>
                        </div>
                      </div>

                      {parts > 0 && (
                        <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs flex items-center justify-between text-teal-950">
                          <div>
                            <strong>Spare Parts Reimbursed:</strong> {job.parts_details || 'Verified Replacement Parts'}
                            <span className="text-[10px] text-teal-700 block">100% pass-through reimbursement with zero cooperative commission deduction.</span>
                          </div>
                          <span className="font-mono font-bold text-teal-900 text-sm">
                            +₹{parts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600">
                          Net Disbursed Take-Home Payout: <strong>₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Settlement ID: STL-2026-{job.id}8819 • Status: Fully Settled
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REVIEWS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-3">
          {reviews?.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} ({r.rating}/5)
                </div>
                <span className="text-gray-400 text-[10px]">{r.created_at?.split('T')[0]}</span>
              </div>
              <p className="text-gray-800 italic">"{r.comment}"</p>
              <div className="text-[11px] text-gray-500 pt-1">Citizen: {r.customer_name}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          OTP HANDSHAKE MODAL
         ───────────────────────────────────────────────────────────── */}
      {otpTargetBooking && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOtpTargetBooking(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-blue-950">
                {otpType === 'ARRIVAL' ? 'Enter Customer Arrival OTP' : 'Enter Completion OTP'}
              </h3>
              <button
                type="button"
                onClick={() => setOtpTargetBooking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {otpType === 'ARRIVAL'
                ? 'Ask the customer for the 4-digit Arrival OTP shown on their screen to unlock work.'
                : 'Ask the customer for the 4-digit Completion OTP once the task is finished.'}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="4-digit OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-2xl py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOtpTargetBooking(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel / Close
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || enteredOtp.length < 4}
                  className="btn btn-primary btn-sm font-bold"
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP Handshake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHOTO PROOF MODAL
         ───────────────────────────────────────────────────────────── */}
      {photoTargetBooking && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPhotoTargetBooking(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-blue-950">
                {photoType === 'PRE' ? 'Capture Pre-Job Fault Photo' : 'Capture Post-Job Completed Photo'}
              </h3>
              <button onClick={() => setPhotoTargetBooking(null)}><X size={16} /></button>
            </div>

            <p className="text-xs text-gray-600">
              Photos are automatically timestamped and geotagged to the work order.
            </p>

            <form onSubmit={handleSavePhotoProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Photo URL or Camera Capture</label>
                <input
                  type="text"
                  placeholder="https://... (or leave default for demo snapshot)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setPhotoTargetBooking(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1">
                  <Camera size={13} /> Save Photo Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LOCKED PARTS PRICE MATRIX MODAL
         ───────────────────────────────────────────────────────────── */}
      {partsTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-blue-900" />
                <h3 className="font-bold text-sm text-blue-950">Add Spare Parts from Locked Price Matrix</h3>
              </div>
              <button onClick={() => setPartsTargetBooking(null)}><X size={16} /></button>
            </div>

            <p className="text-xs text-gray-500">
              Select standardized cooperative-approved replacement parts. Prices are locked and billed directly to the customer invoice without markup.
            </p>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {partsCatalog.map((part) => {
                const isAdded = selectedParts.some((p) => p.partName === part.part_name);
                return (
                  <div key={part.id} className="p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{part.part_name}</div>
                      <span className="text-[10px] text-gray-500">{part.trade_category} • {part.warranty_months}m warranty</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-blue-950">₹{part.standard_price}</span>
                      {isAdded ? (
                        <button
                          onClick={() => setSelectedParts(selectedParts.filter((p) => p.partName !== part.part_name))}
                          className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedParts([...selectedParts, { partId: part.id, partName: part.part_name, price: part.standard_price, quantity: 1 }])}
                          className="px-2 py-1 rounded bg-blue-900 text-white text-[10px] font-bold"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-xs">
              <span>Selected: <strong>{selectedParts.length} parts</strong></span>
              <div className="flex gap-2">
                <button onClick={() => setPartsTargetBooking(null)} className="btn btn-secondary btn-sm">Cancel</button>
                <button onClick={handleAddPartsSubmit} disabled={selectedParts.length === 0} className="btn btn-primary btn-sm">
                  Add to Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BUY TOOLKIT / INDIVIDUAL TOOL MODAL
         ───────────────────────────────────────────────────────────── */}
      {buyModalToolkit && (() => {
        const isIndividual = Boolean(buyModalIndividualTool);
        const currentName = isIndividual ? buyModalIndividualTool.item : buyModalToolkit.kit_name;
        const currentCategory = isIndividual ? (dashboardData?.worker?.primary_trade || 'Trade Tool') : buyModalToolkit.trade_category;
        const currentPrice = isIndividual ? buyModalIndividualTool.individual_price : buyModalToolkit.subsidized_price;
        const currentMarketPrice = isIndividual ? buyModalIndividualTool.market_price : buyModalToolkit.market_price;
        const currentMonthlyEmi = isIndividual ? buyModalIndividualTool.monthly_emi : buyModalToolkit.monthly_emi;
        const currentMeritPoints = isIndividual ? 0 : 50;

        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget && !orderSubmitting) setBuyModalToolkit(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    {isIndividual ? <Wrench size={20} /> : <ShoppingBag size={20} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {isIndividual ? 'Procure Certified Individual Tool' : 'Procure Toolkit Through Platform'}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {isIndividual
                        ? 'Single Trade Tool Procurement • Subsidized / 0% Micro-Loan'
                        : 'Labour Cooperatives Federation Mandatory Tooling Procurement'}
                    </span>
                  </div>
                </div>

                {!orderSubmitting && (
                  <button
                    type="button"
                    onClick={() => {
                      setBuyModalToolkit(null);
                      setBuyModalIndividualTool(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {orderSuccess ? (
                <div className="space-y-4 py-4 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    {orderSuccess.message}
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Reference:</span>
                      <span className="font-mono font-bold text-blue-950">{orderSuccess.order?.order_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Equipment Item:</span>
                      <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                        {orderSuccess.order?.individual_tool || currentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Scheme:</span>
                      <span className="font-bold text-slate-800">
                        {orderSuccess.order?.payment_mode === 'COOP_LOAN' ? '0% Cooperative Micro-Loan' : 'Direct Full Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accreditation Status:</span>
                      <span className="font-bold text-emerald-700">✓ VERIFIED EQUIPPED</span>
                    </div>
                    {!isIndividual && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Merit Points Added:</span>
                        <span className="font-bold text-indigo-700">+50 Points</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBuyModalToolkit(null);
                      setBuyModalIndividualTool(null);
                      setOrderSuccess(null);
                    }}
                    className="btn btn-primary btn-sm font-bold w-full py-2.5 mt-2 cursor-pointer"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOrderToolkitSubmit} className="space-y-4 text-xs">
                  {/* Product Summary */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    {isIndividual ? (
                      <div className="w-16 h-16 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Wrench size={24} />
                      </div>
                    ) : (
                      <img
                        src={buyModalToolkit.image_url}
                        alt={buyModalToolkit.kit_name}
                        className="w-16 h-16 rounded-xl object-cover border shrink-0"
                      />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        {currentCategory} {isIndividual ? '• Single Instrument' : 'Category'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{currentName}</h4>
                      {isIndividual && buyModalIndividualTool.standard && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Standard: {buyModalIndividualTool.standard}
                        </span>
                      )}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-slate-400 line-through text-[11px]">₹{currentMarketPrice}</span>
                        <span className="font-mono font-black text-emerald-700 text-sm">₹{currentPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Destination */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Doorstep / Federation Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full street address or Federation Hub center"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Dispatches from State Cooperative Logistics Center within 24-48 hours.
                    </span>
                  </div>

                  {/* Payment Option Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Financing / Payment Option
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Option 1: 0% Interest Micro-Loan */}
                      <div
                        onClick={() => setPaymentMode('COOP_LOAN')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          paymentMode === 'COOP_LOAN'
                            ? 'border-blue-900 bg-blue-50/70 text-blue-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs">0% Interest Micro-Loan</span>
                            <span className="px-1.5 py-0.5 bg-amber-400 text-blue-950 font-bold text-[9px] rounded">
                              RECOMMENDED
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            <strong>₹0 down payment today.</strong> Financed via Federation Welfare Fund. Auto-deducts ₹50 per completed gig or ₹{currentMonthlyEmi}/month.
                          </p>
                        </div>
                        <div className="mt-2 font-mono font-bold text-xs text-blue-950">
                          Pay Today: ₹0
                        </div>
                      </div>

                      {/* Option 2: Direct Full Payment */}
                      <div
                        onClick={() => setPaymentMode('DIRECT_PAY')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          paymentMode === 'DIRECT_PAY'
                            ? 'border-blue-900 bg-blue-50/70 text-blue-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-extrabold text-xs">Direct Wholesale Purchase</span>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Instant one-time payment via UPI / Debit Card at full subsidized cooperative bulk rate.
                          </p>
                        </div>
                        <div className="mt-2 font-mono font-bold text-xs text-emerald-700">
                          Pay Today: ₹{currentPrice}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Retail Market Value:</span>
                      <span className="font-mono line-through">₹{currentMarketPrice}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Cooperative Bulk Subsidy:</span>
                      <span className="font-mono">-₹{currentMarketPrice - currentPrice}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                      <span>Total {isIndividual ? 'Item' : 'Toolkit'} Cost:</span>
                      <span className="font-mono text-blue-950">₹{currentPrice}</span>
                    </div>
                    {!isIndividual && (
                      <div className="flex justify-between text-indigo-700 font-bold pt-0.5">
                        <span>Accreditation Reward:</span>
                        <span>+50 Merit Points</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={orderSubmitting}
                      onClick={() => {
                        setBuyModalToolkit(null);
                        setBuyModalIndividualTool(null);
                      }}
                      className="btn btn-secondary btn-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 cursor-pointer"
                    >
                      {orderSubmitting ? (
                        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>
                        {paymentMode === 'COOP_LOAN'
                          ? (isIndividual ? 'Confirm 0% Tool Loan & Dispatch' : 'Confirm 0% Micro-Loan & Dispatch')
                          : (isIndividual ? 'Complete Tool Purchase' : 'Complete Direct Purchase')}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          REAL-TIME BROADCAST INCOMING JOB POPUP (FIRST-TO-ACCEPT)
         ───────────────────────────────────────────────────────────── */}
      {broadcastJob && !isBroadcastDocked && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBroadcastDocked(true);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border-2 border-amber-400 space-y-2.5 relative my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Ambient Pulse Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 relative z-10 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm animate-bounce">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                      🚨 Live Dispatch Broadcast
                    </span>
                    {broadcastJob.is_emergency ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                        60-Min Emergency
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 mt-0.5 leading-tight">
                    {broadcastJob.service_name}
                  </h3>
                  <p className="text-[11px] text-slate-800 font-mono font-black mt-0.5">
                    Ref: {broadcastJob.booking_code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBroadcastDocked(true)}
                  className="p-1.5 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-xs font-bold border border-slate-200"
                  title="Minimize / Dock to corner so you can see and use the dashboard"
                >
                  <Minimize2 size={15} />
                  <span className="hidden sm:inline">Dock ↘</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDismissedJobIds((prev) => [...prev, broadcastJob.id])}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Dismiss"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Broadcast Policy Banner with Acceptance Window */}
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-extrabold text-amber-950 text-xs">
                  <Zap size={14} className="text-amber-600 shrink-0" />
                  <span>First-to-Accept Rule</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-400">
                  ⏱️ {broadcastJob.is_emergency ? '10-Min Emergency Limit' : '30-Min Standard Limit'}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-amber-900 leading-snug">
                The first qualified artisan to accept claims the booking. If unaccepted within the window, the order auto-cancels.
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-300/80 space-y-0.5">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider block">📍 Customer Location</span>
                <div className="font-black text-slate-950 text-xs sm:text-sm">{broadcastJob.location_city}</div>
                <div className="text-[11px] text-slate-800 font-bold leading-snug break-words">{broadcastJob.location_address}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-300/80 space-y-0.5">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider block">📅 Scheduled Slot</span>
                <div className="font-black text-slate-950 text-xs sm:text-sm">{broadcastJob.scheduled_date}</div>
                <div className="text-[11px] text-blue-950 font-black bg-blue-100 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-blue-200">{broadcastJob.scheduled_time}</div>
              </div>
            </div>

            {/* Net Labour Payout Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white flex items-center justify-between shadow-md border border-emerald-700/60">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block">
                  Net Labour Payout (93% Direct Share)
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 drop-shadow-xs">
                  ₹{broadcastJob.amount}
                </div>
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Instant escrow release upon OTP completion</span>
                </span>
              </div>
              <div className="text-right pl-3 border-l border-emerald-800/80">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider block">Trade</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 block mt-0.5">{broadcastJob.service_category}</span>
              </div>
            </div>

            {broadcastJob.notes && (
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950">
                <strong className="font-extrabold text-blue-950 block text-[11px]">📝 Customer Note:</strong>
                <p className="font-bold text-slate-900 mt-0.5 text-xs leading-snug">{broadcastJob.notes}</p>
              </div>
            )}

            {/* Actions: 2-Tier Layout so all buttons & words are 100% visible and unclipped */}
            <div className="pt-1 space-y-2">
              {/* Primary Action Button: Full Width */}
              <button
                type="button"
                disabled={actionBusyId === broadcastJob.id}
                onClick={() => handleAction(broadcastJob.id, 'ACCEPT')}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionBusyId === broadcastJob.id ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check size={18} className="stroke-[3]" />
                    <span>⚡ ACCEPT &amp; CLAIM ORDER NOW</span>
                  </>
                )}
              </button>

              {/* Secondary Actions Row: Listen & Decline */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVoiceAlert(broadcastJob)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSpeaking && activeSpeakingId === `job-${broadcastJob.id}`
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                  title="Listen or Stop audio announcement"
                >
                  {isSpeaking && activeSpeakingId === `job-${broadcastJob.id}` ? (
                    <>
                      <VolumeX size={14} className="text-red-700" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} className="text-blue-900" />
                      <span>Listen to Dispatch</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={actionBusyId === broadcastJob.id}
                  onClick={() => handleAction(broadcastJob.id, 'DECLINE')}
                  className="py-2 px-3 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <X size={14} />
                  <span>Decline (Zero Penalty)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Dock Widget when broadcast is minimized (Keeps dashboard 100% uncovered) */}
      {broadcastJob && isBroadcastDocked && (
        <aside
          aria-label="Active Dispatch Alert"
          className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] bg-slate-950 text-white p-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs animate-bounce">
              ⚡
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                  {broadcastJob.is_emergency ? '🚨 60-Min Emergency' : 'Live Dispatch'}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold">₹{broadcastJob.amount}</span>
              </div>
              <div className="font-black text-xs text-white truncate max-w-[160px] sm:max-w-[200px]">
                {broadcastJob.service_name}
              </div>
              <div className="text-[10px] text-slate-300 font-medium truncate">
                📍 {broadcastJob.location_city}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={actionBusyId === broadcastJob.id}
              onClick={() => handleAction(broadcastJob.id, 'ACCEPT')}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-md transition cursor-pointer disabled:opacity-50"
              title="Claim this booking now"
            >
              <Check size={13} className="stroke-[3]" />
              <span>Accept</span>
            </button>

            <button
              type="button"
              onClick={() => handleVoiceAlert(broadcastJob)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="Listen to details"
            >
              <Volume2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => setIsBroadcastDocked(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 transition cursor-pointer flex items-center gap-0.5 text-xs font-bold"
              title="Expand to full details view"
            >
              <Maximize2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => setDismissedJobIds((prev) => [...prev, broadcastJob.id])}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATUTORY FORM IV INVOICE & DISBURSEMENT RECEIPT MODAL
         ───────────────────────────────────────────────────────────── */}
      {invoiceModalBooking && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setInvoiceModalBooking(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-white">
                    Official Form IV
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-900">
                    TAX INVOICE & PAYOUT SETTLEMENT
                  </span>
                </div>
                <h3 className="font-bold text-base text-gray-900 mt-1">
                  Odisha State Cooperative Services Federation Ltd.
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  Govt Regd: SOC-OD-2024-APEX-01 • GSTIN: 21AAAPL1234M1Z5
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceModalBooking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Invoice No:</span>
                <strong className="font-mono text-slate-800">INV-2026-{invoiceModalBooking.id}992</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Booking Code:</span>
                <strong className="font-mono text-blue-900">{invoiceModalBooking.booking_code}</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Completed Date:</span>
                <strong className="text-slate-800">{invoiceModalBooking.completed_at ? new Date(invoiceModalBooking.completed_at).toLocaleDateString('en-IN') : invoiceModalBooking.scheduled_date}</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Payout Status:</span>
                <strong className="text-emerald-700 font-bold">✓ DISBURSED</strong>
              </div>
            </div>

            {/* Artisan & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Accredited Artisan:</span>
                <div className="font-bold text-slate-900">{dashboardData?.worker?.name || user?.name}</div>
                <div className="text-slate-500">Worker Code: <span className="font-mono">{dashboardData?.worker?.worker_code}</span></div>
                <div className="text-slate-500">Guild Trade: {dashboardData?.worker?.primary_trade} ({dashboardData?.worker?.tier || 'MASTER'})</div>
                <div className="text-slate-500">Society: {dashboardData?.worker?.society_name || 'Khordha District Cooperative'}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Citizen / Client:</span>
                <div className="font-bold text-slate-900">{invoiceModalBooking.customer_name}</div>
                <div className="text-slate-500">Address: {invoiceModalBooking.location_address || 'Patia, Bhubaneswar'}</div>
                <div className="text-slate-500">District: {invoiceModalBooking.location_district || 'Khordha'}</div>
                <div className="text-slate-500">Contact: {invoiceModalBooking.customer_phone || '9876543210'}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Description of Service / Parts</th>
                    <th className="p-3 text-center">HSN/SAC</th>
                    <th className="p-3 text-right">Gross Tariff (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{invoiceModalBooking.service_name}</div>
                      <div className="text-[10px] text-gray-400">Cooperative Scheduled Service Tariff</div>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-500">998719</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{Number(invoiceModalBooking.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                  {invoiceModalBooking.parts_cost > 0 && (
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">ISI Certified Replacement Parts</div>
                        <div className="text-[10px] text-gray-400">{invoiceModalBooking.parts_details || 'Verified spares'}</div>
                      </td>
                      <td className="p-3 text-center font-mono text-gray-500">841590</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ₹{Number(invoiceModalBooking.parts_cost).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Statutory 93-2-5 Allocation Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                <span>Statutory Form IV Escrow Split (Odisha Act 1962)</span>
                <span className="text-[10px] font-mono text-emerald-800">100% Regulated Payout</span>
              </div>
              <div className="space-y-1 pt-1 text-slate-700">
                <div className="flex justify-between">
                  <span>├── 93% Artisan Direct Living Wage:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    ₹{(Number(invoiceModalBooking.amount || 0) * 0.93).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>├── 5% Social Security & Medical Welfare Reserve:</span>
                  <span className="font-mono font-bold text-amber-800">
                    ₹{(Number(invoiceModalBooking.amount || 0) * 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>├── 2% Cooperative Infrastructure & Upkeep:</span>
                  <span className="font-mono font-bold text-blue-800">
                    ₹{(Number(invoiceModalBooking.amount || 0) * 0.02).toFixed(2)}
                  </span>
                </div>
                {invoiceModalBooking.parts_cost > 0 && (
                  <div className="flex justify-between text-teal-800">
                    <span>└── 100% Spare Parts Reimbursement:</span>
                    <span className="font-mono font-bold">
                      +₹{Number(invoiceModalBooking.parts_cost).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-sm text-emerald-950">
                  <span>Total Net Worker Payout:</span>
                  <span className="font-mono">
                    ₹{((Number(invoiceModalBooking.amount || 0) * 0.93) + Number(invoiceModalBooking.parts_cost || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-500 italic">
                Electronically generated under Odisha Cooperative Societies Rules.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm flex items-center gap-1 font-bold"
                >
                  <Download size={13} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalBooking(null)}
                  className="btn btn-primary btn-sm font-bold bg-blue-950 text-white"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
