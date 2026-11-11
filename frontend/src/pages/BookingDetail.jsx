import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, MapPin, User, Building2, Star, ShieldCheck,
  CheckCircle2, AlertTriangle, ArrowLeft, Phone, Mail, FileText,
  CreditCard, Sparkles, RefreshCw, XCircle, ChevronRight, Award,
  HeartHandshake, HelpCircle, Wrench, ShieldAlert, Camera, Lock
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import TaxInvoiceModal from '../components/TaxInvoiceModal';
import ReviewModal from '../components/ReviewModal';
import ApplianceLineageModal from '../components/ApplianceLineageModal';
import DisputeHelpdeskModal from '../components/DisputeHelpdeskModal';
import LiveRouteMap from '../components/LiveRouteMap';
import CivicLoader from '../components/CivicLoader';

const TIMELINE_STEPS = [
  { status: 'REQUESTED', label: 'Requested', desc: 'Order submitted' },
  { status: 'MATCHED', label: 'Matched', desc: 'Assigned to verified artisan' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Artisan confirmed' },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Arrival OTP verified on-site' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Completion OTP verified & 30-Day Guarantee armed' },
];

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLineageModal, setShowLineageModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const fetchDetail = (silent = false) => {
    if (!silent) setLoading(true);
    api.getBookingById(id)
      .then((res) => {
        setData(res);
        setError('');
      })
      .catch((err) => {
        console.error('Fetch booking detail error:', err);
        if (!silent) setError(err.message || 'Failed to load booking details.');
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    if (user && user.role === 'WORKER') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }
    if (user && user.role === 'COOPERATIVE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    fetchDetail();
    // Auto-poll every 3 seconds while order is waiting for an artisan to accept
    const interval = setInterval(() => {
      if (data?.booking?.status === 'REQUESTED') {
        fetchDetail(true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, data?.booking?.status, user]);

  const handleClaimGuarantee = async () => {
    if (!window.confirm('Would you like to claim the 30-Day Free Repair Guarantee? A Senior Master Artisan will be dispatched with ₹0 labour cost.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.claimGuarantee(id);
      alert(res.message || '30-Day Guarantee Claim Approved! Master Artisan dispatched.');
      fetchDetail();
    } catch (err) {
      alert(err.message || 'Failed to claim guarantee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Please provide reason for cancellation:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.cancelBooking(id, reason);
      fetchDetail();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert(err.message || 'Failed to cancel.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <CivicLoader
        variant="fullscreen"
        title="Synchronizing Booking Handshake..."
        subtitle="Retrieving escrow state, GIS live tracking and security OTP hash"
      />
    );
  }

  if (error || !data?.booking) {
    return (
      <div className="container py-16 text-center max-w-md mx-auto">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <AlertTriangle size={32} className="mx-auto text-red-600 mb-2" />
          <h2 className="text-lg font-bold text-red-900 mb-1">Booking Not Found</h2>
          <p className="text-xs text-red-700 mb-4">{error || 'The requested order does not exist or access is restricted.'}</p>
          <Link to="/customer/bookings" className="btn btn-primary btn-sm">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { booking, payment, invoice, review } = data;
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = booking.status === 'CANCELLED';
  const isPaid = payment?.status === 'SUCCESS' || invoice?.payment_status === 'PAID';

  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.status === booking.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Link
            to="/customer/bookings"
            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 font-mono">{booking.booking_code}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isCancelled
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-900'
                  }`}
              >
                {booking.status}
              </span>
              {Number(booking.squad_size) > 1 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                  👥 {booking.squad_size}-Artisan Squad
                </span>
              )}
              {booking.is_emergency ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                  24/7 EMERGENCY
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Service: <strong className="text-blue-900">{booking.service_name}</strong> {Number(booking.squad_size) > 1 ? `(${booking.squad_size} Artisans)` : ''} • Scheduled for {booking.scheduled_date} at {booking.scheduled_time}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isCompleted && !isCancelled && booking.status !== 'IN_PROGRESS' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="btn btn-secondary btn-sm flex items-center gap-1 text-xs text-red-700 border-red-300 hover:bg-red-50 font-bold"
            >
              <XCircle size={14} /> Cancel Booking
            </button>
          )}
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
          >
            <FileText size={14} className="text-amber-700" /> View Bill
          </button>
          <button
            onClick={() => setShowLineageModal(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
          >
            <Wrench size={13} /> Appliance History
          </button>
          <button
            onClick={() => setShowDisputeModal(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1 text-xs text-red-800 hover:bg-red-50"
          >
            <HelpCircle size={13} /> Dispute Desk
          </button>
          {!isPaid && !isCancelled && isCompleted && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-saffron btn-sm flex items-center gap-1 text-xs font-bold"
            >
              <CreditCard size={13} /> Pay ₹{booking.total_amount}
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECURITY HANDSHAKE OTP CARDS (ONLY FOR ACTIVE JOBS)
         ───────────────────────────────────────────────────────────── */}
      {!isCompleted && !isCancelled && (
        booking.status === 'REQUESTED' || !booking.arrival_otp ? (
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>Security Arrival OTP Locked</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                    Awaiting Artisan Acceptance
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  To protect security, your 4-digit Arrival OTP will be generated automatically the moment an artisan accepts your work request.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping inline-block" />
              <span>Live polling active</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border transition ${booking.status === 'IN_PROGRESS'
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-900/10'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-blue-900 flex items-center gap-1">
                  <ShieldCheck size={14} /> 1. Arrival OTP Handshake
                </span>
                {booking.status === 'IN_PROGRESS' ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Verified On-Site
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Pending Arrival
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-mono font-extrabold text-blue-950 tracking-wider">
                  {booking.arrival_otp}
                </span>
                <p className="text-[11px] text-gray-600">
                  Share this 4-digit code with the artisan upon arrival to start the work session.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition ${booking.status === 'IN_PROGRESS'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/10'
                : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-900 flex items-center gap-1">
                  <ShieldCheck size={14} /> 2. Completion OTP Handshake
                </span>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  Give Once Satisfied
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-mono font-extrabold text-emerald-950 tracking-wider">
                  {booking.completion_otp}
                </span>
                <p className="text-[11px] text-gray-600">
                  Only give this code to the artisan when work is complete to confirm satisfaction and arm your 30-Day Guarantee.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 6: 30-DAY FREE REPAIR GUARANTEE BANNER
         ───────────────────────────────────────────────────────────── */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">30-Day Free Cooperative Repair Guarantee Active</h3>
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Armed
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                If the same fault recurs within 30 days, a Senior Master Artisan will be re-dispatched with ₹0 labour cost.
              </p>
            </div>
          </div>

          {!booking.guarantee_claimed ? (
            <button
              onClick={handleClaimGuarantee}
              disabled={actionLoading}
              className="btn btn-saffron btn-sm font-bold text-xs shrink-0 whitespace-nowrap"
            >
              Claim Free Re-dispatch →
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              ✓ Guarantee Re-dispatch Dispatched
            </span>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VISUAL 5-STEP SERVICE LIFECYCLE TIMELINE
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
          Service Lifecycle & Handshake Progress
        </h2>

        <div className="relative">
          <div className="hidden sm:block absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = currentStepIdx > idx || isCompleted;
              const isCurrent = currentStepIdx === idx && !isCompleted && !isCancelled;

              return (
                <div key={step.status} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-blue-950 text-white ring-4 ring-blue-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-300'
                      }`}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <div className="sm:text-center">
                    <div
                      className={`text-xs font-bold ${isCurrent ? 'text-blue-950' : isPast ? 'text-emerald-800' : 'text-gray-400'
                        }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LIVE GPS ARTISAN ROUTE & DISPATCH TELEMETRY MAP
         ───────────────────────────────────────────────────────────── */}
      {booking.worker_name && !isCancelled && (
        <LiveRouteMap
          worker={{
            name: booking.worker_name,
            tier: booking.worker_tier || 'MASTER',
            worker_code: booking.worker_code,
            service_area: booking.worker_service_area || booking.location_city,
            distanceKm: booking.tracking?.distanceKm || booking.distance_km || 2.4,
            etaMinutes: booking.tracking?.etaMinutes || booking.eta_minutes || 10,
            workerCoords: booking.tracking?.workerCoords || (booking.worker_latitude ? {
              lat: Number(booking.worker_latitude),
              lng: Number(booking.worker_longitude)
            } : null),
            latitude: Number(booking.worker_latitude),
            longitude: Number(booking.worker_longitude),
          }}
          customerAddress={`${booking.location_address}, ${booking.location_city}`}
          customerCoords={booking.tracking?.customerCoords || (booking.latitude ? {
            lat: Number(booking.latitude),
            lng: Number(booking.longitude)
          } : null)}
          title={isCompleted ? 'Service Execution Route & Location Record' : `Live Artisan Transit to Customer Place (${booking.tracking?.dispatchStatus || 'En Route'})`}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN DETAILS GRID (ARTISAN, DESTINATION, PARTS, TARIFF)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Artisan & Destination (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Artisan Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <User size={14} className="text-blue-900" /> Assigned Cooperative Artisan
            </h3>

            {booking.worker_name ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-gray-900">{booking.worker_name}</h4>
                      <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {booking.worker_code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                        {booking.worker_tier || 'MASTER'} ARTISAN
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                      <span>🏢 {booking.cooperative_name}</span>
                      <span>⭐ {booking.worker_rating?.toFixed(1) || '4.9'} Rating</span>
                      <span>⏳ {booking.worker_experience || 8} yrs exp</span>
                    </div>
                  </div>

                  {booking.worker_phone && (
                    <a
                      href={`tel:${booking.worker_phone}`}
                      className="p-2 rounded-xl bg-blue-50 text-blue-950 hover:bg-blue-100 transition"
                      title="Call Worker"
                    >
                      <Phone size={18} />
                    </a>
                  )}
                </div>

                {/* Master-Artisan Pairing Details */}
                {booking.paired_master_name && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                    <Award size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Master-Artisan Quality Assurance:</strong> Paired with Senior Master Artisan{' '}
                      <strong>{booking.paired_master_name}</strong> ({booking.paired_master_phone}) for high-voltage and complex execution.
                    </div>
                  </div>
                )}

                {/* Squad Deployment Details */}
                {Number(booking.squad_size) > 1 && (
                  <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2">
                    <User size={16} className="text-indigo-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Multi-Worker Squad Mobilized:</strong> {booking.squad_size} certified cooperative artisans assigned with fair rotational wage parity. Lead artisan: <strong>{booking.worker_name}</strong>.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span>📡 Broadcasting to Nearby Verified Artisans</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Your work order is currently broadcasted to all nearby certified cooperative artisans in <strong>{booking.location_city || 'your area'}</strong>. The first artisan who accepts will receive this assignment immediately.
                </p>
                {Number(booking.squad_size) > 1 && (
                  <p className="text-indigo-900 font-bold text-[11px]">
                    👥 Squad Request: Synchronized allocation of {booking.squad_size} guild artisans.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Photo Proofs (Phase 4) */}
          {(booking.pre_job_photo_url || booking.post_job_photo_url) && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <Camera size={14} className="text-blue-900" /> Work Execution Photo Proofs
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {booking.pre_job_photo_url && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-600 block mb-1">Pre-Job Fault Proof</span>
                    <img
                      src={booking.pre_job_photo_url}
                      alt="Pre-job proof"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {booking.post_job_photo_url && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block mb-1">Post-Job Completed Proof</span>
                    <img
                      src={booking.post_job_photo_url}
                      alt="Post-job proof"
                      className="w-full h-32 object-cover rounded-lg border border-emerald-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Destination Details */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-900" /> Destination & Notes
            </h3>
            <div className="font-semibold text-gray-900">{booking.location_address}</div>
            <div className="text-gray-500">
              {booking.location_city}, {booking.location_district} - {booking.location_pincode}
            </div>
            {booking.notes && (
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 mt-2">
                <strong>Task Notes:</strong> {booking.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right: Transparent 93-2-5 Tariff Breakdown */}
        <div className="space-y-6">
          <div className="bg-blue-950 text-white p-5 rounded-2xl shadow-md space-y-4 text-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Transparent Cooperative Tariff Split
            </div>

            <div className="space-y-2.5 border-b border-white/15 pb-3">
              <div className="flex justify-between">
                <span className="text-blue-200">
                  Labour Base Charge ({booking.worker_wage_share_pct || 93}%):
                  {Number(booking.squad_size) > 1 ? ` (${booking.squad_size} Artisans)` : ''}
                </span>
                <span className="font-bold">₹{Number(booking.amount || 299).toFixed(2)}</span>
              </div>
              {Number(booking.parts_cost) > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Locked Parts Cost:</span>
                  <span className="font-bold">+₹{Number(booking.parts_cost || 0).toFixed(2)}</span>
                </div>
              )}
              {booking.is_bulk_order ? (
                <div className="flex justify-between text-indigo-300">
                  <span>Bulk Society Discount:</span>
                  <span className="font-bold">-₹{Number(booking.bulk_discount_amount || 0).toFixed(2)}</span>
                </div>
              ) : null}
              {Number(booking.transit_compensation_fee) > 0 && (
                <div className="flex justify-between text-orange-300">
                  <span>Transit Compensation Credit:</span>
                  <span className="font-bold">₹{Number(booking.transit_compensation_fee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-blue-200">Local Society Reserve ({booking.welfare_fund_share_pct || 5}%):</span>
                <span className="font-bold">₹{Number(booking.cooperative_fee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Welfare & Social Security ({booking.platform_upkeep_share_pct || 2}%):</span>
                <span className="font-bold">₹{Number(booking.platform_fee || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between text-sm font-bold">
              <span>Total Payable:</span>
              <span className="text-2xl text-amber-400 font-mono">₹{Number(booking.total_amount || booking.amount || 299).toFixed(2)}</span>
            </div>

            {isPaid ? (
              <div className="p-2.5 bg-emerald-500/20 text-emerald-200 rounded-lg text-center font-bold border border-emerald-400/30">
                ✓ Payment Received ({payment?.payment_method || 'UPI'})
              </div>
            ) : (
              <div className="text-[11px] text-blue-200 bg-white/10 p-2.5 rounded-lg">
                Status: <strong>Unpaid (Escrow Hold)</strong>
              </div>
            )}
          </div>

          {/* Citizen Rating or Review Button */}
          {isCompleted && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" /> Citizen Review
              </h3>
              {review ? (
                <div className="space-y-1 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} ({review.rating}/5)
                  </div>
                  <p className="text-gray-700 italic">"{review.comment}"</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full btn btn-secondary btn-sm text-xs font-semibold"
                >
                  Submit 2-Way Review & Feedback
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Only mounted and displayed on explicit user action */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={booking}
          onPaymentSuccess={fetchDetail}
        />
      )}

      {showInvoiceModal && (
        <TaxInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoice={invoice}
          booking={booking}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          booking={booking}
          onReviewSubmitted={fetchDetail}
        />
      )}

      {showLineageModal && (
        <ApplianceLineageModal
          isOpen={showLineageModal}
          onClose={() => setShowLineageModal(false)}
          customerId={booking.customer_id}
        />
      )}

      {showDisputeModal && (
        <DisputeHelpdeskModal
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          bookingId={booking.id}
          onDisputeCreated={fetchDetail}
        />
      )}
    </div>
  );
}
