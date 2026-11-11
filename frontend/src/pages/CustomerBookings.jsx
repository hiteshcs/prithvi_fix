import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar, Clock, MapPin, User, Building2, Star,
  AlertTriangle, CheckCircle2, ArrowRight, Eye, Play, Check,
  PlusCircle, RefreshCw, XCircle, FileText, ShieldCheck, Zap,
  PhoneCall, HeartHandshake, Award, Navigation, X
} from 'lucide-react';

import TaxInvoiceModal from '../components/TaxInvoiceModal';
import LiveRouteMap from '../components/LiveRouteMap';
import CivicLoader from '../components/CivicLoader';

export default function CustomerBookings() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [invoiceTargetBooking, setInvoiceTargetBooking] = useState(null);
  const [routeTargetBooking, setRouteTargetBooking] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.getBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => console.error('Failed to load bookings:', err))
      .finally(() => setLoading(false));
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
    fetchBookings();
  }, [user]);

  const handleSimulateStatus = async (bookingId, nextStatus) => {
    setActionLoadingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, nextStatus);
      fetchBookings();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t('confirmCancel'))) return;
    setActionLoadingId(bookingId);
    try {
      const res = await api.cancelBooking(bookingId, 'Customer cancelled request');
      alert(res.message || 'Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert(err.message || 'Failed to cancel.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return { label: t('statusRequested'), class: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'MATCHED':
        return { label: t('statusMatched'), class: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'ACCEPTED':
        return { label: t('statusAccepted'), class: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'IN_PROGRESS':
        return { label: t('statusInProgress'), class: 'bg-orange-100 text-orange-900 border-orange-200 animate-pulse' };
      case 'COMPLETED':
        return { label: t('statusCompleted'), class: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'CANCELLED':
        return { label: t('statusCancelled'), class: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ACTIVE') {
      return ['REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status);
    }
    if (activeTab === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Citizen Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> {t('myBookingsTitle')}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {t('myBookingsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('myBookingsSub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="btn btn-secondary btn-sm text-xs font-bold"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{t('btnRefresh', 'Refresh')}</span>
          </button>

          <Link
            to="/book-service"
            className="btn btn-saffron btn-sm font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={15} />
            <span>{t('bookNewService')}</span>
          </Link>
        </div>
      </div>

      {/* 30-Day Guarantee Assurance Box */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-bold text-sm">{t('warrantyBadge')}</div>
            <p className="text-[11px] text-amber-800">
              {t('warrantySub')}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-bold text-amber-900 shrink-0">
          {t('tollFreeLabel')}: <strong>1800-345-7788</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: t('tabAll') },
          { id: 'ACTIVE', label: t('tabActive') },
          { id: 'COMPLETED', label: t('tabCompleted') },
          { id: 'CANCELLED', label: t('tabCancelled') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === tab.id
                ? 'bg-blue-950 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <CivicLoader
          title="Retrieving Citizen Booking Records..."
          subtitle="Connecting to cooperative escrow node & checking live status updates."
          size="md"
        />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('noBookings')}</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You don't have any bookings matching this tab. Book certified electrical, plumbing, or appliance services now.
          </p>
          <Link to="/book-service" className="btn btn-primary btn-sm font-bold text-xs inline-flex items-center gap-2">
            <PlusCircle size={15} /> Book Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const statusInfo = getStatusBadge(b.status);
            const isBusy = actionLoadingId === b.id;

            return (
              <div
                key={b.id}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top: Booking Code & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-800">
                      {b.booking_code}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                    {b.is_emergency ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase animate-pulse">
                        ⚡ 24/7 Emergency
                      </span>
                    ) : null}
                    {b.status === 'REQUESTED' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        ⏱️ {b.is_emergency ? '10m Emergency Window' : '30m Acceptance Window'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{b.scheduled_date} at {b.scheduled_time}</span>
                  </div>
                </div>

                {/* Middle: Service Info, Worker Info, Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Service Detail */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{t('secServices')}</span>
                    <div className="font-bold text-sm text-gray-900">{b.service_name}</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <MapPin size={13} className="shrink-0 text-gray-400" />
                      <span className="truncate">{b.location_address}, {b.location_city}</span>
                    </div>
                  </div>

                  {/* Worker Detail */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{t('assignedArtisan', 'Assigned Artisan')}</span>
                    {b.worker_name ? (
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <User size={13} className="text-blue-900" />
                          <span>{b.worker_name}</span>
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          Coop: {b.cooperative_name || 'Labour Federation'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                          <Clock size={13} /> Awaiting artisan acceptance...
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Coop & OTP revealed upon acceptance
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1 md:text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{t('totalTariff', 'Total Tariff')}</span>
                    <div className="text-lg font-extrabold text-blue-950 font-mono">
                      ₹{b.total_amount}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Payment: <strong className={b.payment_status === 'PAID' ? 'text-green-700' : 'text-amber-700'}>{b.payment_status}</strong>
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason Notice */}
                {b.cancellation_reason && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Cancellation Notice:</span> {b.cancellation_reason}
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customer/bookings/${b.id}`}
                      className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>{t('btnViewTimeline')}</span>
                    </Link>

                    {b.worker_name && (
                      <button
                        onClick={() => setRouteTargetBooking(b)}
                        className="btn btn-secondary btn-sm text-xs font-bold text-sky-900 border-sky-300 hover:bg-sky-50 flex items-center gap-1"
                      >
                        <Navigation size={13} className="text-sky-700" />
                        <span>Track Route</span>
                      </button>
                    )}

                    {b.status === 'COMPLETED' && (
                      <button
                        onClick={() => setInvoiceTargetBooking(b)}
                        className="btn btn-secondary btn-sm text-xs font-bold text-blue-900 border-blue-300 hover:bg-blue-50 flex items-center gap-1"
                      >
                        <FileText size={14} />
                        <span>{t('btnPrintBill') || 'View Bill'}</span>
                      </button>
                    )}
                  </div>

                  {/* Demo Simulation Controls for testing */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status) && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleCancel(b.id)}
                        className="p-1.5 text-xs text-red-700 hover:bg-red-50 rounded font-semibold border border-red-200"
                      >
                        {t('btnCancel')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Route Tracking Modal */}
      {routeTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setRouteTargetBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition z-30"
            >
              <X size={18} />
            </button>

            <LiveRouteMap
              worker={{
                name: routeTargetBooking.worker_name,
                tier: routeTargetBooking.worker_tier || 'MASTER',
                worker_code: routeTargetBooking.worker_code,
                service_area: routeTargetBooking.worker_service_area || routeTargetBooking.location_city,
                distanceKm: routeTargetBooking.distance_km || routeTargetBooking.tracking?.distanceKm,
                etaMinutes: routeTargetBooking.eta_minutes || routeTargetBooking.tracking?.etaMinutes,
                workerCoords: routeTargetBooking.tracking?.workerCoords || (routeTargetBooking.worker_latitude ? {
                  lat: Number(routeTargetBooking.worker_latitude),
                  lng: Number(routeTargetBooking.worker_longitude)
                } : null),
                latitude: Number(routeTargetBooking.worker_latitude),
                longitude: Number(routeTargetBooking.worker_longitude),
              }}
              customerAddress={`${routeTargetBooking.location_address}, ${routeTargetBooking.location_city}`}
              customerCoords={
                routeTargetBooking.tracking?.customerCoords || (routeTargetBooking.latitude ? {
                  lat: Number(routeTargetBooking.latitude),
                  lng: Number(routeTargetBooking.longitude)
                } : null)
              }
              title={`Live GPS Route: ${routeTargetBooking.booking_code} (${routeTargetBooking.service_name})`}
            />

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400">{routeTargetBooking.status}</strong></span>
              <Link
                to={`/customer/bookings/${routeTargetBooking.id}`}
                className="btn btn-primary btn-sm text-xs font-bold"
              >
                Open Full Order Details →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {invoiceTargetBooking && (
        <TaxInvoiceModal
          booking={invoiceTargetBooking}
          onClose={() => setInvoiceTargetBooking(null)}
        />
      )}
    </div>
  );
}
