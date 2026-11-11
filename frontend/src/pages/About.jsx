import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Building2, Users, ShieldCheck, HeartPulse, Scale, CheckCircle2,
  ArrowRight, FileText, Award, Landmark
} from 'lucide-react';

export default function About() {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-3">
          <Landmark size={14} /> {t('aboutBadge', 'Cooperative Institutional Framework')}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {t('aboutTitle', 'About Prithvi Fix')}
        </h1>
        <p className="text-base text-gray-600 mt-3 leading-relaxed">
          {t('aboutSub', 'A cooperative-owned digital gig services platform connecting certified, federation-backed skilled workers with households and institutions.')}
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">The Cooperative Difference</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Unlike commercial gig intermediaries that extract high commissions without providing long-term security, Prithvi Fix is built on the cooperative ethos: <strong>workers are member-owners</strong>.
          </p>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              Transparent, capped platform fee supporting worker welfare funds
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              Democratic oversight by registered District Labour Cooperative Federations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              Collective bargaining for fair, standardized regional wage rates
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <HeartPulse size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Worker Social Security & Welfare</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Every gig completed on Prithvi Fix contributes directly to social security, accident coverage, continuous trade certification, and health support.
          </p>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              ESIC accident insurance & ESIC hospital access facilitation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              Skill upgrading with NSDC and National Vocational partner institutions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700 shrink-0" />
              Emergency financial assistance fund for member families
            </li>
          </ul>
        </div>
      </div>

      {/* 4 Pillars of Governance */}
      <div className="bg-blue-950 text-white p-8 md:p-10 rounded-2xl mb-12 shadow-md">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
          Four Pillars of Our Platform
        </h2>
        <p className="text-xs text-blue-200 text-center max-w-lg mx-auto mb-8">
          Ensuring quality, safety, transparency, and dignity for every service transaction
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center">
            <ShieldCheck size={28} className="mx-auto mb-2 text-amber-400" />
            <h3 className="font-bold text-sm mb-1">Strict Verification</h3>
            <p className="text-xs text-blue-200">
              Identity, background, and trade certificates verified by Cooperative officials before dispatch.
            </p>
          </div>

          <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center">
            <Scale size={28} className="mx-auto mb-2 text-amber-400" />
            <h3 className="font-bold text-sm mb-1">Standardized Pricing</h3>
            <p className="text-xs text-blue-200">
              Transparent cooperative-regulated base rates. No hidden surge charges or algorithmic price gouging.
            </p>
          </div>

          <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center">
            <Award size={28} className="mx-auto mb-2 text-amber-400" />
            <h3 className="font-bold text-sm mb-1">Continuous Skilling</h3>
            <p className="text-xs text-blue-200">
              Workers undergo periodic upskilling in modern appliances, safety gear, and customer service.
            </p>
          </div>

          <div className="bg-white/10 p-5 rounded-xl border border-white/10 text-center">
            <Users size={28} className="mx-auto mb-2 text-amber-400" />
            <h3 className="font-bold text-sm mb-1">Community Impact</h3>
            <p className="text-xs text-blue-200">
              Retaining economic value within the local community rather than routing it to global venture funds.
            </p>
          </div>
        </div>
      </div>

      {/* Participatory Cooperatives */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          <Landmark size={20} className="text-blue-900" /> Participating Labour Cooperatives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="font-bold text-sm text-gray-900">Bhubaneswar Labour Cooperative Federation</div>
            <div className="text-xs text-gray-500 font-mono mt-1">Reg: COOP-OD-2024-001</div>
            <p className="text-xs text-gray-600 mt-2">Serving Khordha District & Bhubaneswar Urban area with 500+ registered workers.</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="font-bold text-sm text-gray-900">Cuttack District Labour Cooperative Society</div>
            <div className="text-xs text-gray-500 font-mono mt-1">Reg: COOP-OD-2024-002</div>
            <p className="text-xs text-gray-600 mt-2">Focusing on historical silver city repairs, drainage, construction, and carpentry.</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="font-bold text-sm text-gray-900">Puri Coastal Labour Cooperative</div>
            <div className="text-xs text-gray-500 font-mono mt-1">Reg: COOP-OD-2024-003</div>
            <p className="text-xs text-gray-600 mt-2">Hospitality, domestic assistance, caregiving, and transport across coastal Puri.</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center bg-amber-50 p-8 rounded-xl border border-amber-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Be Part of the Movement</h3>
        <p className="text-xs text-gray-600 max-w-md mx-auto mb-4">
          Whether you need a trustworthy service provider or wish to join as a skilled worker member, Prithvi Fix is your platform.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/book-service" className="btn btn-primary btn-sm">
            Book a Service Now
          </Link>
          <Link to="/register" className="btn btn-secondary btn-sm">
            Register as Worker
          </Link>
        </div>
      </div>
    </div>
  );
}
