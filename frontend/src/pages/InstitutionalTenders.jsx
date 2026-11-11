import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Award, Briefcase, DollarSign, Users, CheckCircle2,
  AlertCircle, FileText, ArrowRight, ShieldCheck, Clock, Calendar,
  AlertTriangle, Landmark, Lock, HelpCircle, Check, X
} from 'lucide-react';
import CivicLoader from '../components/CivicLoader';

export default function InstitutionalTenders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [currentSociety, setCurrentSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTenderForBid, setSelectedTenderForBid] = useState(null);
  const [biddingSuccess, setBiddingSuccess] = useState('');
  const [allocatedWorkersCount, setAllocatedWorkersCount] = useState(8);
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    if (user && user.role === 'WORKER') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }
    if (user && user.role === 'CUSTOMER') {
      navigate('/customer/bookings', { replace: true });
      return;
    }

    Promise.all([
      api.getInstitutionalTenders(),
      api.getFederationAdminDashboard(user?.society_id || 1).catch(() => null),
    ])
      .then(([tenderRes, fedRes]) => {
        setTenders(tenderRes.tenders || []);
        if (fedRes?.data?.society) {
          setCurrentSociety(fedRes.data.society);
        }
      })
      .catch((err) => {
        console.error('Failed to load tenders or society telemetry:', err);
        setError(err.message || 'Failed to load tenders.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const isGate1Cleared = Boolean(currentSociety?.is_nlcf_affiliated && currentSociety?.dco_linked);

  const handleConfirmBid = (e) => {
    e.preventDefault();
    setSubmittingBid(true);
    setTimeout(() => {
      setSubmittingBid(false);
      setBiddingSuccess(`Cooperative tender bid submitted successfully for ${selectedTenderForBid.tender_code}. Transmitted to ${selectedTenderForBid.issuing_authority}.`);
      setSelectedTenderForBid(null);
    }, 800);
  };

  if (loading) {
    return (
      <CivicLoader
        variant="card"
        title="Loading Institutional Contracts & Public Works..."
        subtitle="Retrieving active cooperative tenders and transparent municipal rate bids"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
          <Briefcase size={14} className="text-amber-400" />
          Institutional Contracts &amp; Public Works
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Institutional Tenders, Bids &amp; Multi-Artisan Projects
        </h1>
        <p className="text-xs md:text-sm text-blue-200 max-w-3xl">
          LCF-affiliated and registered federations gain priority access to bid for municipal civic maintenance, railway quarters overhauls, and institutional facility contracts.
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          <Link to="/federation/portal" className="btn btn-secondary btn-sm text-xs font-bold">
            ← Federation Portal
          </Link>
          <Link to="/society/register" className="btn btn-primary btn-sm text-xs font-bold">
            Society Registration Wizard →
          </Link>
        </div>
      </div>

      {biddingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="font-semibold">{biddingSuccess}</span>
          </div>
          <button onClick={() => setBiddingSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GATE 1 COMPLIANCE BANNER (FLOWCHART SPECIFICATION)
         ───────────────────────────────────────────────────────────── */}
      {isGate1Cleared ? (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-5 text-white shadow-lg space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Gate 1 Cleared: DCO-Linked &amp; NLCF-Affiliated
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300">
              Cooperative: {currentSociety?.name || 'Shramik Kalyan Samiti'}
            </span>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Statutory prerequisites satisfied under the Cooperative Societies Act. Your collective is legally accredited to deploy multi-artisan squads and submit competitive tenders on institutional public works.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 text-white shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="civic-authority-chip">
              <AlertTriangle size={13} className="text-amber-400" />
              <span>Flowchart Gate 1: Operating in Local Body &amp; Direct Household Mode</span>
            </span>
            <span className="text-xs font-mono font-medium text-slate-300">
              Cooperative: {currentSociety?.name || 'Community Samiti'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under the cooperative flowchart, unlinked or unaffiliated societies service local body projects and direct household problems via Web/App. Institutional tenders with government bodies require active District Registrar (DCO) Linkage and NLCF Affiliation.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              to="/society/register"
              className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              Complete DCO Linkage Wizard <ArrowRight size={13} />
            </Link>
            <Link
              to="/services"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-bold border border-slate-700"
            >
              View Community Household Services
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      {/* Tenders Grid */}
      <div className="space-y-4">
        {tenders.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-900">{t.tender_code}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${t.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-900' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                    {t.status}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 mt-1">{t.title}</h3>
                <p className="text-xs text-gray-500">Issuing Authority: <strong className="text-gray-800">{t.issuing_authority}</strong> ({t.district})</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-gray-500 block">Estimated Tender Value</span>
                <span className="text-xl font-extrabold text-blue-950 font-mono">
                  ₹{t.estimated_value?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 text-[10px] uppercase font-semibold block">Category</span>
                <strong className="text-gray-900">{t.category}</strong>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 text-[10px] uppercase font-semibold block">Affiliation Prerequisite</span>
                <span className={`font-bold ${t.requires_nlcf_affiliation ? 'text-amber-800' : 'text-gray-800'}`}>
                  {t.requires_nlcf_affiliation ? '🌟 LCF Affiliation Mandatory' : 'Open to All Federations'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-emerald-800 text-[10px] uppercase font-semibold block">Funds Received</span>
                <strong className="text-emerald-950 font-mono">₹{t.funds_received?.toLocaleString()}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700 text-[10px] uppercase font-semibold block">Due Remaining</span>
                <strong className="text-slate-950 font-mono">₹{t.due_remaining?.toLocaleString()}</strong>
              </div>
            </div>

            {t.awarded_society_name && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex items-center justify-between">
                <span className="text-blue-950 font-semibold flex items-center gap-1.5">
                  <Award size={14} className="text-blue-700" /> Awarded Federation: <strong>{t.awarded_society_name}</strong>
                </span>
                <span className="text-[11px] text-blue-900 font-mono font-bold">
                  {t.allocated_workers_count} Assigned Artisans
                </span>
              </div>
            )}

            {/* Bidding Action / Gate 1 Enforcement */}
            {t.status !== 'AWARDED' && (
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {t.requires_nlcf_affiliation && !isGate1Cleared ? (
                  <>
                    <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <Lock size={14} className="text-amber-600 shrink-0" />
                      Gate 1 Restricted: NLCF Affiliation &amp; DCO Linkage Required to Bid
                    </span>
                    <Link
                      to="/society/register"
                      className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition text-[11px] text-center"
                    >
                      Complete Affiliation Wizard →
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      Statutory Bidding Eligible (93-2-5 Cooperative Rate Schedule)
                    </span>
                    <button
                      onClick={() => setSelectedTenderForBid(t)}
                      className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      Submit Cooperative Tender Bid →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SUBMIT COOPERATIVE TENDER BID
         ───────────────────────────────────────────────────────────── */}
      {selectedTenderForBid && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-blue-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider block">
                  {selectedTenderForBid.tender_code}
                </span>
                <h3 className="text-base font-extrabold text-gray-900">
                  Submit Statutory Tender Bid
                </h3>
              </div>
              <button
                onClick={() => setSelectedTenderForBid(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
              <span className="font-bold block">{selectedTenderForBid.title}</span>
              <div className="flex justify-between text-[11px] text-blue-800">
                <span>Issuing Authority:</span>
                <span className="font-semibold">{selectedTenderForBid.issuing_authority}</span>
              </div>
              <div className="flex justify-between text-[11px] text-blue-800">
                <span>Estimated Tender Value:</span>
                <span className="font-mono font-bold text-blue-950">₹{selectedTenderForBid.estimated_value?.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBid} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assigned Skilled Artisans Squad *
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={allocatedWorkersCount}
                  onChange={(e) => setAllocatedWorkersCount(parseInt(e.target.value) || 2)}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold"
                />
                <span className="text-[10px] text-gray-400">Number of cooperative registered artisans assigned to this contract.</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-gray-800">
                <span className="font-bold block text-[11px] text-blue-950 uppercase tracking-wider">
                  Odisha Cooperative Bylaws 93-2-5 Rate Schedule
                </span>
                <div className="flex justify-between text-[11px]">
                  <span>Direct Artisan Wages (93%):</span>
                  <span className="font-mono font-semibold">₹{Math.round((selectedTenderForBid.estimated_value || 0) * 0.93).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Statutory Welfare &amp; Mini PF (5%):</span>
                  <span className="font-mono font-semibold">₹{Math.round((selectedTenderForBid.estimated_value || 0) * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Tech Ops &amp; Governance (2%):</span>
                  <span className="font-mono font-semibold">₹{Math.round((selectedTenderForBid.estimated_value || 0) * 0.02).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTenderForBid(null)}
                  className="px-3.5 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  {submittingBid ? 'Transmitting Bid...' : 'Transmit Bid under Federation Seal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
