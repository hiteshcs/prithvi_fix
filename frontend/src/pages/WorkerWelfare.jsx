import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse, ShieldCheck, Award, Building2, CheckCircle2,
  AlertCircle, Sparkles, IndianRupee, ArrowLeft, ArrowRight,
  Clock, PlusCircle, Check
} from 'lucide-react';
import CivicLoader from '../components/CivicLoader';

export default function WorkerWelfare() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [welfareData, setWelfareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollingScheme, setEnrollingScheme] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWelfare = () => {
    setLoading(true);
    api.getWorkerWelfare()
      .then((data) => setWelfareData(data))
      .catch((err) => console.error('Failed to load welfare:', err))
      .finally(() => setLoading(false));
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
    fetchWelfare();
  }, [user]);

  const handleEnroll = async (scheme) => {
    setEnrollingScheme(scheme.benefit_name);
    setSuccessMsg('');
    try {
      await api.enrollWorkerWelfare(scheme);
      setSuccessMsg(`Successfully enrolled in ${scheme.benefit_name}!`);
      fetchWelfare();
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Could not process enrollment.');
    } finally {
      setEnrollingScheme(null);
    }
  };

  if (loading) {
    return (
      <CivicLoader
        variant="card"
        title="Accessing Artisan Social Security Ledger..."
        subtitle="Verifying cooperative health insurance, accident cover & pension funds"
      />
    );
  }

  const { worker, welfareRecords, availableSchemes, cooperativeLevyShare, pocNotice } = welfareData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Worker Dashboard */}
      <div className="mb-6">
        <Link
          to="/worker/dashboard"
          className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Worker Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 md:p-8 rounded-2xl shadow-md mb-8">
        <div className="civic-authority-chip mb-3">
          <HeartPulse size={13} className="text-slate-300" />
          <span>Cooperative Social Security System</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Worker Welfare & Social Protection Centre
        </h1>
        <p className="text-xs md:text-sm text-blue-200 mt-2 max-w-2xl leading-relaxed">
          As a member-owner in the <strong>{worker?.cooperative_name}</strong>, a mandatory 5% PF & insurance contribution on all completed gigs is pooled directly into your accident insurance, health cards, pension corpus, and trade upskilling.
        </p>

        <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-6 text-xs flex-wrap">
          <div>
            <span className="text-blue-300 block text-[11px]">Worker Member</span>
            <span className="font-bold text-white text-sm">{user?.name} ({worker?.worker_code})</span>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Active Welfare Schemes</span>
            <span className="font-bold text-amber-400 text-sm">{welfareRecords?.length || 0} Programs</span>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Welfare Pool Contribution</span>
            <span className="font-bold text-green-400 text-sm">5% PF & Insurance</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Differentiating Feature Notice */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-8 flex items-start gap-3">
        <Sparkles size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Differentiating Cooperative Feature: Institutional Welfare</div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            {pocNotice}
          </p>
        </div>
      </div>

      {/* ── Active Enrolled Schemes ── */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
          <ShieldCheck size={20} className="text-green-700" /> My Enrolled Welfare Schemes & Benefits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welfareRecords?.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-5 rounded-xl border border-green-200 bg-green-50/20 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-green-100 text-green-800">
                    {rec.benefit_type}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-800">
                    <CheckCircle2 size={13} /> {rec.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 mb-1">{rec.benefit_name}</h3>
                <p className="text-xs text-gray-600 mb-3">{rec.details}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Provider: {rec.provider || 'Cooperative Federation'}</span>
                <span>Enrolled: {rec.enrollment_date || 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Available Schemes (1-Click Simulation) ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
          <Award size={20} className="text-blue-900" /> Additional Federation & Cooperative Welfare Schemes Available
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSchemes?.map((sch) => {
            const isEnrolled = welfareRecords?.some((r) => r.benefit_name === sch.benefit_name);
            const isBusy = enrollingScheme === sch.benefit_name;

            return (
              <div
                key={sch.benefit_name}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-900">
                      {sch.benefit_type}
                    </span>
                    {isEnrolled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                        ✓ Enrolled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        Available
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 mb-1">{sch.benefit_name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{sch.details}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 truncate">
                    Welfare Provider: {sch.provider}
                  </span>

                  {!isEnrolled ? (
                    <button
                      disabled={isBusy}
                      onClick={() => handleEnroll(sch)}
                      className="btn btn-sm btn-primary text-xs shrink-0 flex items-center gap-1"
                    >
                      <PlusCircle size={12} /> {isBusy ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-green-700">Active Policy</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
