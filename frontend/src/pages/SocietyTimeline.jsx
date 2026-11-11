import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Building2, ShieldCheck, Award, GraduationCap, Landmark, CheckCircle2,
  Clock, ArrowRight, ChevronRight, FileCheck, Users, Briefcase, AlertCircle
} from 'lucide-react';
import CivicLoader from '../components/CivicLoader';

export default function SocietyTimeline() {
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.getSocietiesList()
      .then((res) => {
        const list = res.societies || [];
        setSocieties(list);
        if (list.length > 0) {
          setSelectedSociety(list[0]);
        }
      })
      .catch((err) => console.error('Failed to load societies:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAdvanceStage = async (newStage, extraProps = {}) => {
    if (!selectedSociety) return;
    setUpdating(true);
    try {
      const res = await api.updateSocietyTimeline(selectedSociety.id, {
        stage: newStage,
        ...extraProps,
      });
      if (res.success) {
        setSelectedSociety(res.data);
        setSocieties(societies.map((s) => (s.id === res.data.id ? res.data : s)));
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <CivicLoader
        variant="card"
        title="Tracking Statutory Progression Records..."
        subtitle="Verifying Section 93-2-5 registrar gazette filings & audit milestones"
      />
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
          <Landmark size={14} className="text-amber-400" />
          Statutory Progression & Affiliation Portal
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Recognized Societies Dedicated Progression Timeline
        </h1>
        <p className="text-xs md:text-sm text-blue-200 max-w-3xl">
          For formed and legally recognized cooperative societies to link with the District Cooperative Office (DCO), affiliate with the Labour Cooperatives Federation (LCF), complete NCCT trainings, and gain Apex Federation recognition.
        </p>

        <div className="pt-3 flex flex-wrap gap-2">
          <Link to="/society/register" className="btn btn-secondary btn-sm text-xs font-bold">
            ← New Society 9-Step Formation
          </Link>
          <Link to="/login?role=admin" className="btn btn-primary btn-sm text-xs font-bold">
            Federation Login & Portal (Credentials Required) →
          </Link>
        </div>
      </div>

      {/* Society Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Select Active Cooperative Society
          </label>
          <select
            value={selectedSociety?.id || ''}
            onChange={(e) => {
              const soc = societies.find((s) => s.id === parseInt(e.target.value, 10));
              setSelectedSociety(soc || null);
            }}
            className="p-2 border border-gray-300 rounded-lg text-xs font-semibold text-blue-950 bg-white"
          >
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.district}) — {s.is_nlcf_affiliated ? 'LCF Affiliated (Trusted)' : 'Standard Verified'}
              </option>
            ))}
          </select>
        </div>

        {selectedSociety && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSociety.is_nlcf_affiliated ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900'
              }`}>
              {selectedSociety.is_nlcf_affiliated ? '🌟 LCF Affiliated Society' : '🛡️ Verified Society'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              Audit: {selectedSociety.audit_frequency}
            </span>
          </div>
        )}
      </div>

      {/* 4-Stage Statutory Progression Timeline (Page 1) */}
      {selectedSociety && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">
              Statutory Progression Milestones for {selectedSociety.name}
            </h2>
            <p className="text-xs text-gray-500">
              Dedicated timeline tracking for DCO Linkage, LCF Affiliation, NCCT Leadership Training, and Apex Recognition.
            </p>
          </div>

          <div className="space-y-6">
            {/* STAGE 1: Link with District Cooperative Office (DCO) */}
            <div className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedSociety.dco_linked
                ? 'bg-emerald-50/50 border-emerald-300'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedSociety.dco_linked ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                  {selectedSociety.dco_linked ? <CheckCircle2 size={20} /> : '1'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">1. Link with District Cooperative Office (DCO)</h3>
                    {selectedSociety.dco_linked && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        COMPLIANT & LINKED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                    Society reports periodic activities, accounting records, and membership roster to the District Cooperative Officer (<strong>{selectedSociety.dco_officer_name || 'Shri Debendra Nayak (DCO)'}</strong>), who monitors statutory compliance and forwards official requests.
                  </p>
                </div>
              </div>

              {!selectedSociety.dco_linked ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleAdvanceStage(selectedSociety.timeline_stage, { dco_linked: 1 })}
                  className="btn btn-primary btn-sm text-xs font-bold shrink-0"
                >
                  Link with DCO Office
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 shrink-0">✓ Active DCO Linkage</span>
              )}
            </div>

            {/* STAGE 2: Federation Affiliation (LCF) */}
            <div className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedSociety.is_nlcf_affiliated
                ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedSociety.is_nlcf_affiliated ? 'bg-amber-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                  {selectedSociety.is_nlcf_affiliated ? <Award size={20} /> : '2'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">2. Federation Affiliation (LCF)</h3>
                    {selectedSociety.is_nlcf_affiliated ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-950">
                        🌟 LCF AFFILIATED • TRUSTED FEDERATION
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">
                        Pending Affiliation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                    Society affiliates with state or regional federations like Labour Cooperatives Federation of India (LCF) for apex coordination, worker skill upgrade subsidies, accelerated Silver/Gold tier progression, and access to large institutional tender contracts.
                  </p>
                  {selectedSociety.is_nlcf_affiliated && (
                    <div className="mt-2 text-[11px] font-mono text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded inline-block">
                      Certificate: {selectedSociety.nlcf_certificate_no || 'LCF-CERT-2024-4412'} • Audit: Half-Yearly
                    </div>
                  )}
                </div>
              </div>

              {!selectedSociety.is_nlcf_affiliated ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleAdvanceStage(selectedSociety.timeline_stage, { is_nlcf_affiliated: 1 })}
                  className="btn btn-primary btn-sm text-xs font-bold shrink-0 bg-amber-600 hover:bg-amber-500 border-amber-600"
                >
                  Affiliate with LCF
                </button>
              ) : (
                <span className="text-xs font-bold text-amber-800 shrink-0">✓ LCF Certified</span>
              )}
            </div>

            {/* STAGE 3: Training through NCCT */}
            <div className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedSociety.ncct_training_completed
                ? 'bg-blue-50/60 border-blue-300'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedSociety.ncct_training_completed ? 'bg-blue-900 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                  {selectedSociety.ncct_training_completed ? <GraduationCap size={20} /> : '3'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">3. Governance & Technical Training through NCCT</h3>
                    {selectedSociety.ncct_training_completed && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900">
                        NCCT ACCREDITED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                    Leaders, directors, and artisan members attend the National Council for Cooperative Training (NCCT) or regional institutes to gain formal skills in cooperative accounting, GST Form IV compliance, digital transparency, and advanced technical trades.
                  </p>
                </div>
              </div>

              {!selectedSociety.ncct_training_completed ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleAdvanceStage(selectedSociety.timeline_stage, { ncct_training_completed: 1 })}
                  className="btn btn-primary btn-sm text-xs font-bold shrink-0"
                >
                  Complete NCCT Training
                </button>
              ) : (
                <span className="text-xs font-bold text-blue-900 shrink-0">✓ NCCT Completed</span>
              )}
            </div>

            {/* STAGE 4: Recognition by Apex Cooperative Federation */}
            <div className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedSociety.ministry_recognized
                ? 'bg-purple-50/60 border-purple-300'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedSociety.ministry_recognized ? 'bg-purple-900 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                  {selectedSociety.ministry_recognized ? <Landmark size={20} /> : '4'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">4. Recognition by Apex Cooperative Federation</h3>
                    {selectedSociety.ministry_recognized && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-900">
                        APEX RECOGNITION ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                    Through federations and NCCT accreditation, the society is fully integrated into cooperative policy, gaining direct access to apex cooperative schemes, concessional artisan tool loans, and ESIC healthcare welfare programs.
                  </p>
                </div>
              </div>

              {!selectedSociety.ministry_recognized ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleAdvanceStage(9, { ministry_recognized: 1 })}
                  className="btn btn-primary btn-sm text-xs font-bold shrink-0 bg-purple-800 hover:bg-purple-700"
                >
                  Activate Apex Federation Recognition
                </button>
              ) : (
                <span className="text-xs font-bold text-purple-900 shrink-0">✓ Apex Federation Recognized</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
