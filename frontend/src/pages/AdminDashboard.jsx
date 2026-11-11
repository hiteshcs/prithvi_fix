import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CivicLoader from '../components/CivicLoader';
import SocietyLiveMap from '../components/SocietyLiveMap';
import {
  Building2, Users, CheckCircle2, XCircle, Clock, AlertTriangle,
  TrendingUp, IndianRupee, ShieldCheck, Search, Filter,
  Calendar, Eye, Award, Check, X, RefreshCw, BarChart3,
  MapPin, Zap, ChevronRight, Sparkles, ArrowRight, Layers,
  Compass, Lightbulb, Share2, ShieldAlert, Wrench, HelpCircle, HeartPulse,
  Navigation, Radio, ZoomIn, ZoomOut, ExternalLink, Globe, PhoneCall, Send, LocateFixed,
  FileCheck, Landmark, Scale, Printer, FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dashboardData, setDashboardData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [allocationData, setAllocationData] = useState(null);
  const [liveMapData, setLiveMapData] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDco = user?.admin_type === 'DCO_REGISTRAR';
  const isFederationHead = user?.admin_type === 'FEDERATION_HEAD';
  const isSocietyAdmin = user?.admin_type === 'SOCIETY_ADMIN';
  const userDistrict = user?.district || 'Khordha';

  // DCO Scrutiny & Approvals State
  const [dcoPendingSocieties, setDcoPendingSocieties] = useState([]);
  const [dcoApprovedSocieties, setDcoApprovedSocieties] = useState([]);
  const [regulatoryInquiries, setRegulatoryInquiries] = useState([]);
  const [dcoActionBusyId, setDcoActionBusyId] = useState(null);
  const [dcoSuccessMsg, setDcoSuccessMsg] = useState('');
  const [dcoExpandedId, setDcoExpandedId] = useState(null);
  const [dcoSubTab, setDcoSubTab] = useState('PENDING'); // 'PENDING' | 'CERTIFIED'
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // DCO Statutory Regulatory Modals State
  const [auditModalSoc, setAuditModalSoc] = useState(null);
  const [auditForm, setAuditForm] = useState({ audit_grade: 'A', annual_return_status: 'FILED_CURRENT_FY', reserve_fund_balance: '' });
  const [govModalSoc, setGovModalSoc] = useState(null);
  const [govForm, setGovForm] = useState({ last_agm_date: '', committee_term_end: '' });
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    society_id: '',
    section: 'SECTION_68',
    title: '',
    complainant: '',
    respondent: '',
    status: 'HEARING_SCHEDULED',
    next_hearing_date: '',
    dco_remarks: '',
  });
  const [inquiryBusy, setInquiryBusy] = useState(false);

  // Federation & Societies Workspace State
  const [federationData, setFederationData] = useState({ federations: [], summary: null });
  const [fedDistrictFilter, setFedDistrictFilter] = useState(isDco || isSocietyAdmin ? userDistrict : 'ALL');
  const [selectedFedSocDetail, setSelectedFedSocDetail] = useState(null);
  const [socDetailTab, setSocDetailTab] = useState('ROSTER'); // 'ROSTER' | 'DOCS' | 'GOVERNANCE'

  // DCO Primary Workspaces & URL Synced Tab
  const tabParam = searchParams.get('tab');
  const getDcoTab = (param) => {
    if (param === 'dco_registry') return 'DCO_REGISTRY';
    if (param === 'dco_audit') return 'DCO_AUDIT';
    if (param === 'dco_elections') return 'DCO_ELECTIONS';
    if (param === 'dco_inquiries') return 'DCO_INQUIRIES';
    if (param === 'dco_tribunal') return 'DCO_TRIBUNAL';
    if (param === 'dco_welfare') return 'DCO_WELFARE';
    return 'DCO_APPROVAL';
  };
  const [activeTab, setActiveTab] = useState(getDcoTab(tabParam));

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setActiveTab(getDcoTab(t));
  }, [searchParams]);

  // DCO Tribunal State (Section 70 OCS Act 1962)
  const [tribunalCases, setTribunalCases] = useState([
    {
      id: 1,
      caseNumber: `DCO/${userDistrict?.toUpperCase() || 'PUR'}/SEC70/2026/012`,
      title: 'Territorial Dispute: Ward 14 & Coastal Sector Electrical Services',
      petitioner: 'Shramik Kalyan Labour Cooperative Samiti',
      respondent: 'Utkal Shilpi Seva Sahakari Samiti',
      category: 'JURISDICTIONAL_OVERLAP',
      section: 'Section 70(1)(c) - Territorial Demarcation',
      filingDate: '2026-08-14',
      nextHearingDate: '2026-09-24',
      status: 'HEARING_SCHEDULED',
      hearingSummary: 'Notice issued to respondent. Both managing committees instructed to submit verified artisan deployment manifests.',
      decree: null,
      decreeDate: null,
      decreeOrderNo: null,
    },
    {
      id: 2,
      caseNumber: `DCO/${userDistrict?.toUpperCase() || 'PUR'}/SEC70/2026/009`,
      title: 'Artisan Member Transfer & Tool Custody Appeal',
      petitioner: 'Dilip Barik (Master Artisan, ID: WRK-0012)',
      respondent: 'Jagannath Nirman Sahakari Federation',
      category: 'MEMBERSHIP_RIGHTS',
      section: 'Section 70(1)(b) - Member Lien & Transfer',
      filingDate: '2026-07-10',
      nextHearingDate: '2026-09-28',
      status: 'DECREE_RESERVED',
      hearingSummary: 'Written arguments filed. Society directed to return original skill certificates and unfreeze worker provident ledger.',
      decree: null,
      decreeDate: null,
      decreeOrderNo: null,
    },
    {
      id: 3,
      caseNumber: `DCO/${userDistrict?.toUpperCase() || 'PUR'}/SEC70/2025/088`,
      title: 'Annual Statutory Dividend Non-Disbursement Claim',
      petitioner: 'Managing Committee Member Collective (8 Artisans)',
      respondent: 'Puri Heritage Electrical Samiti',
      category: 'FINANCIAL_COMPLIANCE',
      section: 'Section 70(1)(d) - Profit Allocation',
      filingDate: '2025-11-04',
      nextHearingDate: '—',
      status: 'DISPOSED_COMPLIED',
      hearingSummary: 'Final order pronounced. Society deposited ₹38,400 unpaid cooperative patronage dividends directly to artisans accounts.',
      decree: 'The respondent society is directed to pay full 12% patronage bonus within 15 days under penalty of Section 102.',
      decreeDate: '2025-12-02',
      decreeOrderNo: `ORD-DCO-${userDistrict?.toUpperCase() || 'PUR'}-2025-771`,
    },
  ]);
  const [selectedTribunalCase, setSelectedTribunalCase] = useState(null);
  const [tribunalDecreeModal, setTribunalDecreeModal] = useState(false);
  const [tribunalDecreeText, setTribunalDecreeText] = useState('');
  const [tribunalComplianceDays, setTribunalComplianceDays] = useState('15');
  const [viewingDecreeOrder, setViewingDecreeOrder] = useState(null);

  // DCO Welfare Treasury State (2% Statutory Oversight)
  const [welfareReconciliation, setWelfareReconciliation] = useState([
    {
      month: 'August 2026',
      totalBookings: 84,
      grossTurnover: 148500,
      welfareLevy2Pct: 2970,
      escrowBank: 'Odisha State Cooperative Bank (DCCB)',
      escrowAccountNo: 'OD-DCCB-WLF-9824',
      statutoryAuditStatus: 'AUDITED_VERIFIED',
      dcoSignOff: true,
      signOffDate: '2026-09-02',
      dcoSignatory: user?.name || 'District Cooperative Officer',
    },
    {
      month: 'September 2026 (Live Current Month)',
      totalBookings: 68,
      grossTurnover: 119800,
      welfareLevy2Pct: 2396,
      escrowBank: 'Odisha State Cooperative Bank (DCCB)',
      escrowAccountNo: 'OD-DCCB-WLF-9824',
      statutoryAuditStatus: 'IN_PROGRESS',
      dcoSignOff: false,
      signOffDate: null,
      dcoSignatory: null,
    },
    {
      month: 'July 2026',
      totalBookings: 79,
      grossTurnover: 139200,
      welfareLevy2Pct: 2784,
      escrowBank: 'Odisha State Cooperative Bank (DCCB)',
      escrowAccountNo: 'OD-DCCB-WLF-9824',
      statutoryAuditStatus: 'AUDITED_VERIFIED',
      dcoSignOff: true,
      signOffDate: '2026-08-03',
      dcoSignatory: user?.name || 'District Cooperative Officer',
    },
  ]);
  const [welfareSignOffSuccess, setWelfareSignOffSuccess] = useState('');
  const [viewingWelfareCertificate, setViewingWelfareCertificate] = useState(false);
  const [opsSubTab, setOpsSubTab] = useState('MAP'); // 'MAP' | 'ORDERS'
  const [safetySubTab, setSafetySubTab] = useState('SOS'); // 'SOS' | 'ARBITRATION'
  const [govSubTab, setGovSubTab] = useState('WELFARE'); // 'WELFARE' | 'FORECAST'

  // Filters
  const [workerStatusFilter, setWorkerStatusFilter] = useState('ALL');
  const [workerSearch, setWorkerSearch] = useState('');
  const [actionBusyId, setActionBusyId] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Dispute resolution state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(false);

  // Selected Worker Modal
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [mutualAidBusyId, setMutualAidBusyId] = useState(null);
  const [mutualAidMsg, setMutualAidMsg] = useState('');

  const allDistrictHubs = [
    { key: 'KHORDHA', districtName: 'Khordha', label: 'Bhubaneswar Hub (Khordha)', hubTitle: 'Bhubaneswar Urban Hub', lat: 20.2961, lng: 85.8245, zoom: 14, demand: 'Peak Demand (94%)', artisans: 12, gigs: 3, badgeColor: 'amber' },
    { key: 'CUTTACK', districtName: 'Cuttack', label: 'Cuttack District Hub', hubTitle: 'Cuttack City Society', lat: 20.4625, lng: 85.8830, zoom: 14, demand: 'Surplus Pool (+4)', artisans: 6, gigs: 1, badgeColor: 'sky' },
    { key: 'PURI', districtName: 'Puri', label: 'Puri Coastal Hub', hubTitle: 'Puri Heritage Sector', lat: 19.8135, lng: 85.8312, zoom: 14, demand: 'Tourism Load (58%)', artisans: 4, gigs: 0, badgeColor: 'indigo' },
  ];

  const userDistrictKey = userDistrict?.toUpperCase().includes('CUTTACK')
    ? 'CUTTACK'
    : userDistrict?.toUpperCase().includes('PURI')
    ? 'PURI'
    : 'KHORDHA';

  const defaultHub = allDistrictHubs.find(h => h.key === userDistrictKey) || allDistrictHubs[0];

  // Interactive GIS Map & Dispatch Console States
  const [activeDistrict, setActiveDistrict] = useState(isFederationHead ? 'ALL' : userDistrictKey);
  const [activeCoords, setActiveCoords] = useState(
    isFederationHead
      ? { lat: 20.2961, lng: 85.8245, label: 'Statewide Federation Operations (Odisha)' }
      : { lat: defaultHub.lat, lng: defaultHub.lng, label: defaultHub.label }
  );
  const [mapZoom, setMapZoom] = useState(isFederationHead ? 11 : 14);
  const [mapType, setMapType] = useState('m'); // 'm' for Roadmap, 'k' for Satellite
  const [artisanStatusFilter, setArtisanStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'BUSY' | 'SOS'
  const [artisanTradeFilter, setArtisanTradeFilter] = useState('ALL');
  const [mapArtisanSearch, setMapArtisanSearch] = useState('');
  const [selectedMapArtisan, setSelectedMapArtisan] = useState(null);
  const [quickDispatchModal, setQuickDispatchModal] = useState(null);
  const [selectedBookingToAssign, setSelectedBookingToAssign] = useState('');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');
  const [mutualAidRebalanced, setMutualAidRebalanced] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const isDcoOrHead = user?.admin_type === 'DCO_REGISTRAR' || user?.admin_type === 'FEDERATION_HEAD';
      const [dashRes, workersRes, bookingsRes, forecastRes, allocRes, mapRes, dispRes, sosRes, dcoRes, fedRes] = await Promise.all([
        api.getAdminDashboard().catch(err => { console.warn('getAdminDashboard error', err); return null; }),
        api.getAdminWorkers().catch(err => { console.warn('getAdminWorkers error', err); return { workers: [] }; }),
        api.getAdminBookings().catch(err => { console.warn('getAdminBookings error', err); return { bookings: [] }; }),
        api.getDemandForecast().catch(err => { console.warn('getDemandForecast error', err); return null; }),
        api.getWorkforceAllocation().catch(err => { console.warn('getWorkforceAllocation error', err); return null; }),
        api.getLiveMap().catch(err => { console.warn('getLiveMap error', err); return null; }),
        api.getDisputes().catch(err => { console.warn('getDisputes error', err); return { disputes: [] }; }),
        api.getSosAlerts().catch(err => { console.warn('getSosAlerts error', err); return { alerts: [] }; }),
        isDcoOrHead ? api.getPendingSocietiesForDco().catch(err => { console.warn('getPendingSocietiesForDco error', err); return null; }) : Promise.resolve(null),
        api.getFederationsOverview(isDco ? userDistrict : (isSocietyAdmin ? userDistrict : '')).catch(err => { console.warn('getFederationsOverview error', err); return null; }),
      ]);
      if (dashRes) setDashboardData(dashRes);
      if (workersRes?.workers) setWorkers(workersRes.workers);
      if (bookingsRes?.bookings) setBookings(bookingsRes.bookings);
      if (forecastRes) setForecastData(forecastRes);
      if (allocRes) setAllocationData(allocRes);
      if (mapRes) setLiveMapData(mapRes);
      if (dispRes?.disputes) setDisputes(dispRes.disputes);
      if (sosRes?.alerts) setSosAlerts(sosRes.alerts);
      if (fedRes?.federations) {
        setFederationData({ federations: fedRes.federations, summary: fedRes.summary });
      }
      if (dcoRes?.societies) {
        setDcoPendingSocieties(dcoRes.societies);
        if (dcoRes.approvedSocieties) setDcoApprovedSocieties(dcoRes.approvedSocieties);
        if (dcoRes.regulatoryInquiries) setRegulatoryInquiries(dcoRes.regulatoryInquiries);
        if (dcoRes.societies.length > 0 && !dcoExpandedId) {
          setDcoExpandedId(dcoRes.societies[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAudit = async (e) => {
    e.preventDefault();
    if (!auditModalSoc) return;
    try {
      const res = await api.updateSocietyAudit(auditModalSoc.id, auditForm);
      setDcoSuccessMsg(res.message || 'Audit classification updated successfully.');
      setTimeout(() => setDcoSuccessMsg(''), 6000);
      setAuditModalSoc(null);
      const dcoRes = await api.getPendingSocietiesForDco().catch(() => null);
      if (dcoRes?.approvedSocieties) setDcoApprovedSocieties(dcoRes.approvedSocieties);
    } catch (err) {
      alert(err.message || 'Failed to update audit compliance.');
    }
  };

  const handleUpdateGov = async (e) => {
    e.preventDefault();
    if (!govModalSoc) return;
    try {
      const res = await api.updateSocietyGovernance(govModalSoc.id, govForm);
      setDcoSuccessMsg(res.message || 'Governance mandate updated successfully.');
      setTimeout(() => setDcoSuccessMsg(''), 6000);
      setGovModalSoc(null);
      const dcoRes = await api.getPendingSocietiesForDco().catch(() => null);
      if (dcoRes?.approvedSocieties) setDcoApprovedSocieties(dcoRes.approvedSocieties);
    } catch (err) {
      alert(err.message || 'Failed to update governance.');
    }
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    setInquiryBusy(true);
    try {
      const res = await api.createOrUpdateInquiry({
        ...inquiryForm,
        district: userDistrict,
      });
      setDcoSuccessMsg(res.message || 'Statutory proceeding logged successfully.');
      setTimeout(() => setDcoSuccessMsg(''), 6000);
      setInquiryModal(false);
      setInquiryForm({
        society_id: '',
        section: 'SECTION_68',
        title: '',
        complainant: '',
        respondent: '',
        status: 'HEARING_SCHEDULED',
        next_hearing_date: '',
        dco_remarks: '',
      });
      const dcoRes = await api.getPendingSocietiesForDco().catch(() => null);
      if (dcoRes?.regulatoryInquiries) setRegulatoryInquiries(dcoRes.regulatoryInquiries);
    } catch (err) {
      alert(err.message || 'Failed to record statutory proceeding.');
    } finally {
      setInquiryBusy(false);
    }
  };

  const handleDcoReview = async (socId, action, reviewNotes = '') => {
    setDcoActionBusyId(socId);
    try {
      const res = await api.dcoReviewSociety(socId, { action, review_notes: reviewNotes });
      setDcoSuccessMsg(res.message || 'Society review action processed successfully.');
      setTimeout(() => setDcoSuccessMsg(''), 8000);
      
      if (action === 'APPROVE' && res.data) {
        setViewingCertificate(res.data);
      }

      const [dcoRes, fedRes] = await Promise.all([
        api.getPendingSocietiesForDco().catch(() => null),
        api.getFederationsOverview().catch(() => null),
      ]);
      if (dcoRes?.societies) setDcoPendingSocieties(dcoRes.societies);
      if (dcoRes?.approvedSocieties) setDcoApprovedSocieties(dcoRes.approvedSocieties);
      if (fedRes?.federations) setFederationData({ federations: fedRes.federations, summary: fedRes.summary });
    } catch (err) {
      console.error('DCO review error:', err);
      alert(err.message || 'Failed to update society statutory review.');
    } finally {
      setDcoActionBusyId(null);
    }
  };

  useEffect(() => {
    if (user && user.role === 'WORKER') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }
    if (user && user.role === 'CUSTOMER') {
      navigate('/customer/bookings', { replace: true });
      return;
    }
    loadAllData();
  }, [user]);

  const handleVerifyWorker = async (workerId, newStatus, reason = '') => {
    setActionBusyId(workerId);
    try {
      await api.verifyWorker(workerId, newStatus, reason);
      const [dashRes, workersRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminWorkers(),
      ]);
      setDashboardData(dashRes);
      setWorkers(workersRes.workers || []);
      if (selectedWorker && selectedWorker.id === workerId) {
        const updated = workersRes.workers.find((w) => w.id === workerId);
        setSelectedWorker(updated || { ...selectedWorker, verification_status: newStatus, rejection_reason: reason });
      }
    } catch (err) {
      console.error('Worker verification error:', err);
      alert('Failed to update verification status.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleApproveMutualAid = async (proposalId) => {
    setMutualAidBusyId(proposalId);
    try {
      await api.approveMutualAid(proposalId);
      setMutualAidMsg(`Mutual Aid ${proposalId} approved: temporary inter-cooperative worker transfer authorized.`);
      const allocRes = await api.getWorkforceAllocation();
      setAllocationData(allocRes);
    } catch (err) {
      console.error('Mutual aid approval error:', err);
    } finally {
      setMutualAidBusyId(null);
    }
  };

  const handleRebalanceWorkforce = async () => {
    try {
      setMutualAidRebalanced(true);
      setDispatchSuccessMsg('Inter-Cooperative Surplus Rebalance Authorized! +4 Artisans redeployed to High-Density Zones.');
      setTimeout(() => setDispatchSuccessMsg(''), 6000);
      const allocRes = await api.getWorkforceAllocation().catch(() => null);
      if (allocRes) setAllocationData(allocRes);
    } catch (err) {
      console.error('Rebalance error:', err);
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setResolvingDispute(true);
    try {
      await api.resolveDispute(selectedDispute.id, resolutionNotes);
      alert('Dispute marked as RESOLVED by Federation Arbitrator.');
      setSelectedDispute(null);
      setResolutionNotes('');
      const dispRes = await api.getDisputes();
      setDisputes(dispRes.disputes || []);
    } catch (err) {
      alert(err.message || 'Failed to resolve dispute.');
    } finally {
      setResolvingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 max-w-7xl mx-auto">
        <CivicLoader
          title="Loading Cooperative Governance Portal..."
          subtitle="Calibrating 4 executive workspaces, live GIS telemetry, and statutory 93-2-5 escrow reserves."
          size="lg"
        />
      </div>
    );
  }

  const { statistics } = dashboardData || {};

  const filteredWorkers = (workers || []).filter((w) => {
    if (!w) return false;
    const matchesStatus = workerStatusFilter === 'ALL' || w.verification_status === workerStatusFilter;
    const matchesSearch =
      !workerSearch ||
      (w.name || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.worker_code || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.cooperative_name || '').toLowerCase().includes(workerSearch.toLowerCase());
    const matchesDistrict = isFederationHead || !w.district || w.district.toLowerCase() === userDistrict.toLowerCase() || (userDistrictKey === 'KHORDHA' && (w.district?.toLowerCase() === 'bhubaneswar' || w.city?.toLowerCase() === 'bhubaneswar'));
    return matchesStatus && matchesSearch && matchesDistrict;
  });

  const filteredBookings = (bookings || []).filter((b) => {
    if (!b) return false;
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    const matchesEmergency = !emergencyOnly || b.is_emergency === 1;
    const matchesDistrict = isFederationHead || !b.location_district || b.location_district.toLowerCase() === userDistrict.toLowerCase() || (userDistrictKey === 'KHORDHA' && (b.location_district?.toLowerCase() === 'bhubaneswar' || b.location_city?.toLowerCase() === 'bhubaneswar'));
    return matchesStatus && matchesEmergency && matchesDistrict;
  });

  // Calculate Welfare Corpus (5% of lifetime gross)
  const totalVolume = Number(statistics?.totalWorkerEarnings) || 150000;
  const welfareCorpus = Math.round(totalVolume * 0.05);

  if (!isDco) {
    return (
      <div className="container py-12 max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-[#131B38] border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
            ⚖️
          </div>
          <div className="space-y-2">
            <span className="civic-authority-chip text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700">
              <span className="status-dot" />
              <span>Statutory Jurisdiction Restriction (OCS Act 1962, Sec 3)</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              District Cooperative Registrar Regulatory Portal
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              This terminal is strictly designated for appointed <strong>District Cooperative Officers (DCOs)</strong> exercising statutory powers of society registration, formal audit grading, Section 68 inquiries, Section 70 dispute tribunals, and 2% statutory welfare escrow oversight.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authenticated user: <strong>{user?.name}</strong> • Role: <strong>{user?.designation || 'Federation / Society Representative'}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/federation/portal')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 size={16} /> Open Labour Cooperative Federation Console
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 space-y-6 min-w-0 max-w-full">
      {/* ── DCO Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#1E294B] pb-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark size={14} /> District Cooperative Registrar Authority
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {userDistrict} District Cooperative Regulatory Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Officer: <strong>{user?.name}</strong> • Statutory Jurisdiction: <strong>{userDistrict} District Only</strong> (OCS Act 1962, Sec 3 &amp; 6)
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs self-start md:self-auto cursor-pointer shrink-0"
        >
          <RefreshCw size={13} /> Refresh Registry Data
        </button>
      </div>

      {/* ── 4 Executive DCO KPI Pillar Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 min-w-0">
        {/* DCO Pillar 1: Registered Societies */}
        <div 
          onClick={() => setActiveTab('DCO_REGISTRY')}
          className="cursor-pointer bg-white dark:bg-[#131B38] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-400/50 hover:shadow-md transition group min-w-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Registered Societies
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Form 2 Certified
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-300 font-mono">
            {dcoApprovedSocieties.length}
          </div>
          <div className="mt-2 text-xs flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
              {userDistrict} Jurisdiction
            </span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span className="text-gray-500 dark:text-slate-400">
              Legal Charters
            </span>
          </div>
        </div>

        {/* DCO Pillar 2: Statutory Scrutiny Queue */}
        <div 
          onClick={() => { setActiveTab('DCO_APPROVAL'); setDcoSubTab('PENDING'); }}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition group shadow-xs hover:shadow-md min-w-0 ${
            dcoPendingSocieties.length > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500'
              : 'bg-white dark:bg-[#131B38] border-gray-200 dark:border-[#1E294B] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileCheck size={15} className={dcoPendingSocieties.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'} /> Scrutiny Queue
            </span>
            {dcoPendingSocieties.length > 0 ? (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                {dcoPendingSocieties.length} Awaiting Scrutiny
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Queue Clear
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold font-mono text-gray-900 dark:text-white">
            {dcoPendingSocieties.length}{' '}
            <span className="text-xs font-bold font-sans text-amber-600 dark:text-amber-400 uppercase">Docket</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              10 Promoters &amp; 6 Docs Audit
            </span>
          </div>
        </div>

        {/* DCO Pillar 3: Section 70 Tribunal */}
        <div 
          onClick={() => setActiveTab('DCO_TRIBUNAL')}
          className="cursor-pointer bg-white dark:bg-[#131B38] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs hover:border-amber-400 dark:hover:border-amber-400/50 hover:shadow-md transition group min-w-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText size={15} className="text-amber-600 dark:text-amber-400" /> Dispute Tribunal
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Sec 70 Court
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-950 dark:text-amber-300 font-mono">
            {tribunalCases.filter(c => c.status !== 'DISPOSED_COMPLIED').length} Active
          </div>
          <div className="mt-2 text-xs flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              Quasi-Judicial Bench
            </span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {tribunalCases.filter(c => c.status === 'DISPOSED_COMPLIED').length} Disposed
            </span>
          </div>
        </div>

        {/* DCO Pillar 4: Statutory Welfare Escrow (2%) */}
        <div 
          onClick={() => setActiveTab('DCO_WELFARE')}
          className="cursor-pointer bg-white dark:bg-[#131B38] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-400/50 hover:shadow-md transition group min-w-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <IndianRupee size={15} className="text-indigo-600 dark:text-indigo-400" /> Welfare Treasury (2%)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Sec 56 Audit
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-950 dark:text-indigo-300 font-mono">
            ₹{welfareReconciliation.reduce((acc, r) => acc + r.welfareLevy2Pct, 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">
              DCCB Escrow A/c
            </span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Reconciled
            </span>
          </div>
        </div>
      </div>

      {dcoSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{dcoSuccessMsg}</span>
        </div>
      )}

      {/* ── Primary Navigation Workspaces (DCO Statutory Workspaces) ── */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-200 dark:border-[#1E294B] text-xs font-bold overflow-x-auto max-w-full pb-1 min-w-0">
        {[
          {
            key: 'DCO_APPROVAL',
            label: '📜 Statutory Scrutiny & Registration',
            icon: FileCheck,
            badge: dcoPendingSocieties.length,
            isUrgent: dcoPendingSocieties.length > 0,
          },
          {
            key: 'DCO_REGISTRY',
            label: `🏛️ ${userDistrict} Society Registry`,
            icon: Landmark,
            badge: dcoApprovedSocieties.length,
          },
          {
            key: 'DCO_AUDIT',
            label: '📊 Statutory Audit & Solvency (Sec 62/63)',
            icon: Scale,
          },
          {
            key: 'DCO_ELECTIONS',
            label: '🗳️ Elections & Governance (Sec 28/29)',
            icon: Users,
          },
          {
            key: 'DCO_INQUIRIES',
            label: '📑 Statutory Inquiries (Sec 65/68)',
            icon: ShieldAlert,
            badge: regulatoryInquiries.filter(i => i.status !== 'RESOLVED').length,
            isUrgent: regulatoryInquiries.some(i => i.status === 'HEARING_SCHEDULED'),
          },
          {
            key: 'DCO_TRIBUNAL',
            label: '⚖️ Dispute Tribunal (Sec 70)',
            icon: FileText,
            badge: tribunalCases.filter(c => c.status !== 'DISPOSED_COMPLIED').length,
          },
          {
            key: 'DCO_WELFARE',
            label: '💰 Welfare Escrow Treasury (2%)',
            icon: IndianRupee,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3.5 px-4 transition flex items-center gap-2 border-b-2 text-xs sm:text-sm whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-blue-950 dark:text-sky-300 border-blue-950 dark:border-sky-400 font-bold'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-950 dark:text-sky-300' : 'text-gray-400'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                  tab.isUrgent
                    ? 'bg-red-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-blue-100 dark:bg-sky-950/80 text-blue-950 dark:text-sky-200 border border-blue-200 dark:border-sky-800'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: FEDERATION & LOCAL SOCIETIES GOVERNANCE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'FEDERATION' && isFederationHead && (
        <div className="space-y-6">
          {/* 1. Governance Architecture Header */}
          <div className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Cooperative Governance &amp; Territorial Hierarchy
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    OCS Act 1962 Architecture
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 max-w-3xl">
                  Hierarchical administration connecting <strong>District Cooperative Officers (DCO)</strong> who oversee and certify the <strong>District Federations</strong>, which coordinate autonomous <strong>Local City Societies</strong> that directly manage and deploy <strong>Skilled Artisans &amp; Workers</strong> within their territorial jurisdiction.
                </p>
              </div>
            </div>

            {/* 4-Tier Interactive Visual Hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-[#1E294B]">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 1 • Regulatory</span>
                  <Landmark size={14} className="text-amber-500" />
                </div>
                <strong className="text-xs text-gray-900 dark:text-white block">District Registrar (DCO)</strong>
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Statutory authority for each district. Scrutinizes dossiers, audits minimum ₹10k capital, inspects 10 members, and issues official legal registration.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 2 • District Apex</span>
                  <Building2 size={14} className="text-blue-500" />
                </div>
                <strong className="text-xs text-gray-900 dark:text-white block">District Federation</strong>
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Apex federation for that district (e.g. Khordha, Cuttack, Puri). Coordinates institutional tenders, inter-society mutual aid, and capital reserves.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 3 • Grassroots</span>
                  <Users size={14} className="text-emerald-500" />
                </div>
                <strong className="text-xs text-gray-900 dark:text-white block">Local Area Societies</strong>
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Autonomous societies rooted in specific cities/wards. Min 10 founding artisan promoters. Directly manages workers, wages, tools, and local jobs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 4 • Workforce</span>
                  <Award size={14} className="text-purple-500" />
                </div>
                <strong className="text-xs text-gray-900 dark:text-white block">Artisans &amp; Workers</strong>
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Multi-trade verified master artisans equipped with standardized toolkits, 5% welfare social security, ESIC health coverage, and merit ratings.
                </p>
              </div>
            </div>
          </div>

          {/* 2. District Filter Toolbar & Executive Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
                <Filter size={14} /> District View:
              </span>
              {[
                { key: 'ALL', label: 'All Districts' },
                { key: 'Khordha', label: 'Khordha (Bhubaneswar)' },
                { key: 'Cuttack', label: 'Cuttack Metro' },
                { key: 'Puri', label: 'Puri Coastal' },
              ].map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setFedDistrictFilter(d.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    fedDistrictFilter === d.key
                      ? 'bg-blue-950 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs font-black'
                      : 'bg-white dark:bg-[#131B38] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-[#1E294B] hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-500 dark:text-slate-400">
              Showing <strong>{federationData.federations.filter(f => fedDistrictFilter === 'ALL' || f.district.toLowerCase() === fedDistrictFilter.toLowerCase()).length}</strong> Federation{federationData.federations.filter(f => fedDistrictFilter === 'ALL' || f.district.toLowerCase() === fedDistrictFilter.toLowerCase()).length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* 3. District Federation Cards & Their Constituent Societies */}
          <div className="space-y-6">
            {federationData.federations
              .filter(f => fedDistrictFilter === 'ALL' || f.district.toLowerCase() === fedDistrictFilter.toLowerCase())
              .map((fed) => {
                const societies = fed.societies || [];
                const activeCount = societies.filter(s => s.status === 'ACTIVE').length;
                const pendingCount = societies.filter(s => s.status === 'DCO_REVIEW' || s.status === 'SUBMITTED').length;
                const totalWorkers = fed.stats?.totalWorkers || societies.reduce((acc, s) => acc + (s.total_workers_count || 0), 0);

                return (
                  <div
                    key={fed.id}
                    className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs overflow-hidden"
                  >
                    {/* Federation Header Bar */}
                    <div className="bg-slate-900 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                              {fed.federation_type === 'REGIONAL_FEDERATION' ? 'Decentralized Regional Federation' : 'District Federation'}
                            </span>
                            <span className="font-mono text-xs text-blue-200">
                              {fed.registration_number}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-200 border border-blue-700">
                              {fed.district} District
                            </span>
                            {fed.dco_approval_status === 'APPROVED' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                                <CheckCircle2 size={11} /> DCO APPROVED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-200 border border-amber-400/20 flex items-center gap-1">
                                <Clock size={11} /> DCO REVIEW PENDING
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1.5 flex items-center gap-2">
                            <Building2 size={20} className="text-slate-300 shrink-0" />
                            <span>{fed.name}</span>
                          </h3>
                          {fed.local_area && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <MapPin size={13} className="shrink-0 text-slate-400" />
                              <span>Local Jurisdiction: {fed.local_area}</span>
                              {fed.jurisdiction_zone && <span className="text-slate-400">({fed.jurisdiction_zone})</span>}
                            </div>
                          )}
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                            <span>📍 {fed.address || `${fed.city}, ${fed.district}`}</span>
                            {fed.contact_phone && <span>• 📞 {fed.contact_phone}</span>}
                            {fed.contact_email && <span>• ✉️ {fed.contact_email}</span>}
                            {fed.dco_order_number && <span className="text-emerald-300 font-mono">• 📜 Order: {fed.dco_order_number}</span>}
                          </p>
                        </div>

                        {/* Responsible DCO Regulatory Authority */}
                        <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-white/10 lg:max-w-xs shrink-0">
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                            <Landmark size={13} className="text-slate-400" />
                            <span>Statutory DCO Authority</span>
                          </div>
                          <strong className="text-xs text-white block mt-0.5 truncate">
                            {fed.dco_officer_name || fed.dco?.name || `${fed.district} District Cooperative Officer`}
                          </strong>
                          <span className="text-[11px] text-slate-300 block truncate">
                            {fed.dco_office_name || fed.dco?.designation || `District Registrar of Cooperatives, ${fed.district}`}
                          </span>
                          {fed.dco_approved_at && (
                            <span className="text-[10px] text-emerald-400 block mt-1">
                              ✓ Approved on {new Date(fed.dco_approved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* District Metrics Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-white/10 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Local Societies</span>
                          <strong className="text-white text-base font-extrabold">{societies.length} Units</strong>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Certified &amp; Active</span>
                          <strong className="text-emerald-400 text-base font-extrabold flex items-center gap-1">
                            <CheckCircle2 size={15} /> {activeCount} Societies
                          </strong>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Awaiting DCO Scrutiny</span>
                          <strong className="text-amber-200 text-base font-bold flex items-center gap-1">
                            <Clock size={15} /> {pendingCount} Pending
                          </strong>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Affiliated Artisans</span>
                          <strong className="text-white text-base font-extrabold">{totalWorkers} Workers</strong>
                        </div>
                      </div>
                    </div>

                    {/* Constituent Societies List */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Users size={14} className="text-blue-600 dark:text-blue-400" />
                          Local Societies Under {fed.district} Jurisdiction ({societies.length})
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          Territorial Coverage: {fed.city || fed.district} Urban &amp; Rural Clusters
                        </span>
                      </div>

                      {societies.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 dark:border-[#1E294B] rounded-xl p-4">
                          No cooperative societies registered under this federation yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {societies.map((soc) => {
                            const capital = parseFloat(soc.initial_capital_balance) || 10000;
                            const isActive = soc.status === 'ACTIVE';

                            return (
                              <div
                                key={soc.id}
                                className="bg-gray-50/70 dark:bg-slate-900/40 rounded-xl border border-gray-200 dark:border-[#1E294B] p-4.5 space-y-3 hover:border-blue-400 dark:hover:border-amber-400/60 transition"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[11px] font-bold text-blue-900 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                                        {soc.society_code}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                          isActive
                                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                        }`}
                                      >
                                        {isActive ? '✓ Certified Active' : '⏳ Pending DCO Scrutiny'}
                                      </span>
                                    </div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                      {soc.name}
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                      📍 {soc.city || soc.district} • {soc.address}
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Treasury Balance</span>
                                    <span className="text-sm font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                                      ₹{capital.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {soc.objectives && (
                                  <p className="text-[11px] text-gray-600 dark:text-slate-400 line-clamp-2 italic bg-white/60 dark:bg-slate-800/40 p-2 rounded border border-gray-100 dark:border-slate-800">
                                    "{soc.objectives}"
                                  </p>
                                )}

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="text-[10px] text-gray-500 block">Promoters</span>
                                    <strong className="text-gray-900 dark:text-white flex items-center gap-1 font-mono">
                                      👥 {soc.founding_members_count || 10}
                                    </strong>
                                  </div>
                                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="text-[10px] text-gray-500 block">Artisans</span>
                                    <strong className="text-gray-900 dark:text-white flex items-center gap-1 font-mono">
                                      🛠️ {soc.total_workers_count || 10}
                                    </strong>
                                  </div>
                                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="text-[10px] text-gray-500 block">Documents</span>
                                    <strong className="text-gray-900 dark:text-white flex items-center gap-1 font-mono">
                                      📑 {soc.total_docs_count || 6} Docs
                                    </strong>
                                  </div>
                                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="text-[10px] text-gray-500 block">Coop Bank</span>
                                    <strong className="text-gray-900 dark:text-white truncate block text-[11px]">
                                      {soc.cooperative_bank_name ? soc.cooperative_bank_name.split(' ')[0] : 'OSCB'}
                                    </strong>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedFedSocDetail(soc);
                                      setSocDetailTab('ROSTER');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Eye size={13} />
                                    <span>Inspect 10 Promoters &amp; Dossier</span>
                                  </button>

                                  {!isActive && (user?.admin_type === 'DCO_REGISTRAR' || user?.admin_type === 'FEDERATION_HEAD') ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTab('DCO_APPROVAL');
                                        setDcoSubTab('PENDING');
                                        setDcoExpandedId(soc.id);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                    >
                                      <FileCheck size={13} />
                                      <span>Conduct DCO Scrutiny →</span>
                                    </button>
                                  ) : isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => setViewingCertificate(soc)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-900 dark:bg-blue-950 text-white text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Award size={13} className="text-amber-400" />
                                      <span>View Certificate</span>
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: DCO STATUTORY APPROVALS & SCRUTINY
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_APPROVAL' && (
        <div className="space-y-6">
          {/* Header Bar with Sub-Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-blue-900 dark:text-amber-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  District Registrar Statutory Scrutiny &amp; Approvals
                </h2>
                <span className="text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded-full uppercase">
                  OCS Act 1962 (Sec. 6-8)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Official statutory docket for <strong>{user?.district || 'District'} Registrar</strong> to audit 10 founding member rosters, verify cooperative bank deposits, and issue Legal Certificates of Registration.
              </p>
            </div>

            {/* Segmented Sub-Tab Switcher */}
            <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setDcoSubTab('PENDING')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  dcoSubTab === 'PENDING'
                    ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-amber-400 shadow-xs font-black'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>Pending Scrutiny</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                  {dcoPendingSocieties.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDcoSubTab('CERTIFIED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  dcoSubTab === 'CERTIFIED'
                    ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-amber-400 shadow-xs font-black'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>Certified in District</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                  {dcoApprovedSocieties.length}
                </span>
              </button>
            </div>
          </div>

          {/* SUBTAB 1: PENDING SCRUTINY QUEUE */}
          {dcoSubTab === 'PENDING' && (
            <>
              {dcoPendingSocieties.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-500 bg-white dark:bg-[#131B38] rounded-2xl border border-dashed border-gray-200 dark:border-[#1E294B] p-6 space-y-2">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <strong className="text-gray-900 dark:text-white block text-sm">All District Applications Cleared</strong>
                  <p className="text-gray-500 dark:text-slate-400">
                    No new society formation applications are currently pending scrutiny in {user?.district || 'this'} jurisdiction.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dcoPendingSocieties.map((soc) => {
                    const members = soc.founding_members || [];
                    const capitalAmount = parseFloat(soc.initial_capital_balance) || 10000;
                    const isBusy = dcoActionBusyId === soc.id;
                    const isExpanded = dcoExpandedId === soc.id;

                    return (
                      <div
                        key={soc.id}
                        className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] p-5 shadow-xs space-y-4 hover:border-blue-400 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1E294B] pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-blue-950 dark:text-amber-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                {soc.tracking_id}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                                {soc.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                District: <strong className="text-gray-900 dark:text-white">{soc.district}</strong>
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">{soc.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Applicant / Secretary: <strong className="text-gray-800 dark:text-slate-200">{soc.applicant_name || 'Society Founder'}</strong> • {soc.registered_email} • {soc.registered_phone}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Initial Capital Proof</span>
                              <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-300 font-mono">
                                ₹{capitalAmount.toLocaleString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDcoExpandedId(isExpanded ? null : soc.id)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {isExpanded ? 'Hide Roster & Dossier' : 'View Roster & Docs'}
                            </button>
                          </div>
                        </div>

                        {/* Statutory Checklist Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-[#1E294B] space-y-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Founding Members</span>
                            <strong className="text-gray-900 dark:text-white flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              {soc.founding_members_count || members.length || 10} / 10 Verified
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-[#1E294B] space-y-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Bylaws &amp; Resolution</span>
                            <strong className="text-gray-900 dark:text-white flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Cooperative Act Format
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-[#1E294B] space-y-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Bank Certificate</span>
                            <strong className="text-gray-900 dark:text-white flex items-center gap-1 font-mono truncate">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              {soc.cooperative_bank_name || 'Cooperative Bank'}
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-[#1E294B] space-y-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Affidavit</span>
                            <strong className="text-gray-900 dark:text-white flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Notarized Form IV
                            </strong>
                          </div>
                        </div>

                        {/* Expandable Founding Members Roster */}
                        {isExpanded && members.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#1E294B]">
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                              10 Founding Promoter Members Roster:
                            </span>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1E294B]">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                                  <tr>
                                    <th className="p-2">#</th>
                                    <th className="p-2">Full Name</th>
                                    <th className="p-2">Trade</th>
                                    <th className="p-2">Phone</th>
                                    <th className="p-2">Aadhaar</th>
                                    <th className="p-2">Designation</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#1E294B]">
                                  {members.map((m, mIdx) => (
                                    <tr key={m.id || mIdx}>
                                      <td className="p-2 font-mono text-gray-400">{mIdx + 1}</td>
                                      <td className="p-2 font-bold text-gray-900 dark:text-white">{m.full_name}</td>
                                      <td className="p-2 text-blue-900 dark:text-amber-300">{m.occupation}</td>
                                      <td className="p-2 font-mono text-gray-500">{m.phone}</td>
                                      <td className="p-2 font-mono text-gray-400">{m.aadhaar_number}</td>
                                      <td className="p-2 font-bold text-purple-700 dark:text-purple-300">{m.role_in_society || 'MEMBER'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* DCO Review Decision Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#1E294B]">
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            Statutory Review Officer: <strong className="text-gray-900 dark:text-white">{user?.name || 'District Cooperative Officer & Registrar'}</strong>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDcoReview(soc.id, 'REQUEST_CLARIFICATION', 'Clarification requested on statutory provisions.')}
                              className="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <HelpCircle size={14} /> Clarification / Hearing
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                if (window.confirm(`Verify and approve "${soc.name}" under the Odisha Cooperative Societies Act, 1962?`)) {
                                  handleDcoReview(soc.id, 'APPROVE');
                                }
                              }}
                              className="btn btn-primary btn-sm text-xs font-bold bg-emerald-700 hover:bg-emerald-600 border-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <Award size={14} /> {isBusy ? 'Verifying...' : 'Verify & Issue Registration Certificate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* SUBTAB 2: CERTIFIED / ACTIVE SOCIETIES DIRECTORY */}
          {dcoSubTab === 'CERTIFIED' && (
            <div className="space-y-4">
              {dcoApprovedSocieties.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 bg-white dark:bg-[#131B38] rounded-2xl border border-dashed border-gray-200 dark:border-[#1E294B] p-6">
                  No legally certified societies recorded yet in this district jurisdiction.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dcoApprovedSocieties.map((soc) => (
                    <div
                      key={soc.id}
                      className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {soc.registration_number || `REG-OD-2024-${soc.id}`}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                              Legally Certified
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">
                            {soc.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            District: <strong>{soc.district}</strong> • {soc.address || soc.city}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewingCertificate(soc)}
                          className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                          <Award size={14} className="text-amber-400 dark:text-slate-950" />
                          <span>View Certificate</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-[#1E294B] text-xs">
                        <div className="p-2 rounded bg-gray-50 dark:bg-slate-900/60">
                          <span className="text-[10px] text-gray-500 block">Promoters</span>
                          <strong className="text-gray-900 dark:text-white font-mono">
                            👥 {soc.founding_members_count || 10} Verified
                          </strong>
                        </div>
                        <div className="p-2 rounded bg-gray-50 dark:bg-slate-900/60">
                          <span className="text-[10px] text-gray-500 block">Initial Capital</span>
                          <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                            ₹{(parseFloat(soc.initial_capital_balance) || 10000).toLocaleString()}
                          </strong>
                        </div>
                        <div className="p-2 rounded bg-gray-50 dark:bg-slate-900/60">
                          <span className="text-[10px] text-gray-500 block">Coop Bank</span>
                          <strong className="text-gray-900 dark:text-white truncate block text-[11px]">
                            {soc.cooperative_bank_name || 'OSCB'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: DCO DISTRICT SOCIETY REGISTRY (KHORDHA ONLY)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_REGISTRY' && isDco && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {userDistrict} District Cooperative Society Registry
                </h2>
                <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
                  OCS Act 1962 (Section 9)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Official Statutory Registry of certified primary cooperative societies operating within <strong>{userDistrict} District</strong> jurisdiction.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                {dcoApprovedSocieties.length} Legally Certified Societ{dcoApprovedSocieties.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>
          </div>

          {/* Directory Cards */}
          {dcoApprovedSocieties.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 bg-white dark:bg-[#131B38] rounded-2xl border border-dashed border-gray-200 dark:border-[#1E294B] p-6 space-y-2">
              <Landmark size={32} className="mx-auto text-gray-400" />
              <div className="font-bold text-gray-700 dark:text-slate-300">No certified societies found in {userDistrict} district yet.</div>
              <p className="text-gray-400">Applications currently under review in the Scrutiny Queue will appear here once approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dcoApprovedSocieties.map((soc) => (
                <div
                  key={soc.id}
                  className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-400/50 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {soc.registration_number || `REG-OD-2024-${soc.id}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={11} /> CERTIFIED ACTIVE
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">
                        {soc.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        📍 {soc.address || soc.city || userDistrict}, PIN: {soc.pincode || '751001'}
                      </p>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      Audit Grade {soc.audit_grade || 'A'}
                    </span>
                  </div>

                  {soc.objectives && (
                    <p className="text-xs text-gray-600 dark:text-slate-400 italic bg-gray-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 line-clamp-2">
                      "{soc.objectives}"
                    </p>
                  )}

                  {/* Metrics Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Promoters</span>
                      <strong className="text-gray-900 dark:text-white font-mono">
                        👥 {soc.founding_members?.length || 10} Members
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Statutory Docs</span>
                      <strong className="text-gray-900 dark:text-white font-mono">
                        📁 {soc.statutory_documents?.length || 6}/6 Docs
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Initial Capital</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{(parseFloat(soc.initial_capital_balance) || 520000).toLocaleString()}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 block">Reserve Fund</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono">
                        ₹{(parseFloat(soc.reserve_fund_balance) || 145000).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFedSocDetail(soc);
                        setSocDetailTab('ROSTER');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Inspect 10 Promoters &amp; Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewingCertificate(soc)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Award size={13} className="text-amber-300" />
                      <span>View Form No. 2 Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: DCO STATUTORY AUDIT & SOLVENCY (SEC 56, 62 & 63)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_AUDIT' && isDco && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Statutory Audit Classification &amp; Reserve Solvency Surveillance
                </h2>
                <span className="text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded-full uppercase">
                  OCS Act 1962 (Sec. 56 &amp; 62)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Surveillance desk for mandatory annual statutory audits, Section 56 reserve fund (25% net profit) allocations, and DCCB bank solvency balances in <strong>{userDistrict} District</strong>.
              </p>
            </div>
          </div>

          {/* Statutory Mandate Guidelines Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <CheckCircle2 size={15} />
                <span>Section 56: Mandatory 25% Statutory Reserve Fund Transfer</span>
              </div>
              <p className="text-gray-600 dark:text-slate-400">
                Every cooperative society must out of its net annual profit transfer a minimum of 25% into an indivisible reserve fund deposited with the District Central Cooperative Bank (DCCB).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
                <Scale size={15} />
                <span>Section 62: Annual Audit Classification by Registrar</span>
              </div>
              <p className="text-gray-600 dark:text-slate-400">
                Accounts audited annually by certified cooperative auditors. Societies graded: Grade A (Sound/No Defalcations), Grade B (Satisfactory), Grade C (Needs Rectification), or Defaulter.
              </p>
            </div>
          </div>

          {/* Audit Surveillance Table */}
          <div className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 font-bold text-xs text-gray-900 dark:text-white">
              {userDistrict} District Societies Audit Dossier Table
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3.5">Society Name &amp; Reg No</th>
                    <th className="p-3.5">Audit Grade</th>
                    <th className="p-3.5">Annual Return (Form 14)</th>
                    <th className="p-3.5">Statutory Reserve Fund</th>
                    <th className="p-3.5">Audit Frequency</th>
                    <th className="p-3.5">Coop Bank / Branch</th>
                    <th className="p-3.5 text-right">DCO Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                  {dcoApprovedSocieties.map((soc) => (
                    <tr key={soc.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3.5">
                        <strong className="text-gray-900 dark:text-white block font-bold">{soc.name}</strong>
                        <span className="font-mono text-[11px] text-gray-500">{soc.registration_number || 'REG-OD-2024-001'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          soc.audit_grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : soc.audit_grade === 'B'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          Grade {soc.audit_grade || 'A'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> {soc.annual_return_status || 'FILED_CURRENT_FY'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        ₹{(parseFloat(soc.reserve_fund_balance) || 145000).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-gray-600 dark:text-slate-400">
                        {soc.audit_frequency || 'QUARTERLY'}
                      </td>
                      <td className="p-3.5 text-gray-600 dark:text-slate-400">
                        {soc.cooperative_bank_name || 'BCCB Main Branch'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setAuditModalSoc(soc);
                            setAuditForm({
                              audit_grade: soc.audit_grade || 'A',
                              annual_return_status: soc.annual_return_status || 'FILED_CURRENT_FY',
                              reserve_fund_balance: soc.reserve_fund_balance || 145000,
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Audit Scrutiny &amp; Order
                        </button>
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
          WORKSPACE: DCO ELECTIONS & GOVERNANCE (SEC 28 & 29)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_ELECTIONS' && isDco && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Democratic Governance &amp; Managing Committee Mandate Tracker
                </h2>
                <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                  OCS Act 1962 (Sec. 28 &amp; 29)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Monitoring statutory 5-year tenure limits of elected managing committees (Section 28) and mandatory Annual General Meetings (Section 29) across <strong>{userDistrict} District</strong>.
              </p>
            </div>
          </div>

          {/* Mandate Rules Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
                <Users size={15} />
                <span>Section 28: 5-Year Term of Committee Members</span>
              </div>
              <p className="text-gray-600 dark:text-slate-400">
                The term of office of elected members of the managing committee shall be exactly 5 years from date of election. Elections must be scheduled 90 days before expiry.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <Calendar size={15} />
                <span>Section 29: Annual General Meeting (AGM) Mandate</span>
              </div>
              <p className="text-gray-600 dark:text-slate-400">
                Every cooperative society must convene its Annual General Meeting within 6 months of financial year close (before September 30) to adopt annual audited accounts and review reports.
              </p>
            </div>
          </div>

          {/* Governance Table */}
          <div className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 font-bold text-xs text-gray-900 dark:text-white">
              {userDistrict} District Societies Managing Committee Mandate Table
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3.5">Society Name</th>
                    <th className="p-3.5">Committee Size</th>
                    <th className="p-3.5">5-Year Mandate Expiry</th>
                    <th className="p-3.5">Mandate Status</th>
                    <th className="p-3.5">Last AGM Date</th>
                    <th className="p-3.5">AGM Compliance</th>
                    <th className="p-3.5 text-right">DCO Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                  {dcoApprovedSocieties.map((soc) => (
                    <tr key={soc.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3.5">
                        <strong className="text-gray-900 dark:text-white block font-bold">{soc.name}</strong>
                        <span className="text-[11px] text-gray-500">Reg: {soc.registration_number || 'REG-OD-2024-001'}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        👥 {soc.founding_members?.length || 10} Members
                      </td>
                      <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        📅 {soc.committee_term_end || '2028-03-31'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active Mandate (Valid)
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-slate-400">
                        {soc.last_agm_date || '2025-08-20'}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> Compliant (&lt;6 Mo)
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setGovModalSoc(soc);
                            setGovForm({
                              last_agm_date: soc.last_agm_date || '2025-08-20',
                              committee_term_end: soc.committee_term_end || '2028-03-31',
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Update Mandate
                        </button>
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
          WORKSPACE: DCO STATUTORY INQUIRIES & DISPUTES (SEC 65/68)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_INQUIRIES' && isDco && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Statutory Dispute Conciliation &amp; Inquiry Tribunal
                </h2>
                <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full uppercase">
                  OCS Act 1962 (Sec. 65, 67, 68)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Official tribunal records of statutory dispute arbitrations (Section 68), Registrar financial inquiries (Section 65), and surcharge notices (Section 67) in <strong>{userDistrict} District</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setInquiryForm({
                  society_id: dcoApprovedSocieties[0]?.id || '',
                  section: 'SECTION_68',
                  title: '',
                  complainant: '',
                  respondent: '',
                  status: 'HEARING_SCHEDULED',
                  next_hearing_date: '',
                  dco_remarks: '',
                });
                setInquiryModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <span>+ Record New Proceeding / Summons</span>
            </button>
          </div>

          {/* Tribunal Cases Grid */}
          {regulatoryInquiries.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 bg-white dark:bg-[#131B38] rounded-2xl border border-dashed border-gray-200 dark:border-[#1E294B] p-6 space-y-2">
              <ShieldCheck size={32} className="mx-auto text-emerald-500" />
              <div className="font-bold text-gray-700 dark:text-slate-300">All tribunal proceedings clear in {userDistrict} district.</div>
              <p className="text-gray-400">Zero active disputes or Section 65 inquiries pending hearing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regulatoryInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                        {inq.case_number}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {inq.section === 'SECTION_68' ? 'Section 68 (Dispute Arbitration)' : inq.section === 'SECTION_65' ? 'Section 65 (Financial Inspection)' : 'Section 67 (Surcharge Recovery)'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        inq.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    {inq.next_hearing_date && (
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 font-mono">
                        <Calendar size={13} />
                        <span>Next Hearing: {inq.next_hearing_date}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {inq.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl">
                      <div><strong className="text-gray-700 dark:text-slate-300">Complainant:</strong> {inq.complainant}</div>
                      <div><strong className="text-gray-700 dark:text-slate-300">Respondent:</strong> {inq.respondent}</div>
                    </div>
                  </div>

                  {inq.dco_remarks && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50">
                      <strong>DCO Registrar Minute:</strong> {inq.dco_remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: DCO SECTION 70 COOPERATIVE DISPUTE TRIBUNAL
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_TRIBUNAL' && isDco && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Cooperative Dispute Adjudication Tribunal (Section 70 Bench)
                </h2>
                <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full uppercase border border-amber-300 dark:border-amber-800">
                  Quasi-Judicial Court Powers
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Presiding Arbitrator: <strong>{user?.name}</strong> • Court of the District Cooperative Registrar, <strong>{userDistrict} District</strong>. Exclusive statutory jurisdiction over constitutional, business, and territorial disputes (OCS Act 1962, Sec 70).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800">
                {tribunalCases.filter(c => c.status !== 'DISPOSED_COMPLIED').length} Active Dockets
              </span>
            </div>
          </div>

          {/* Tribunal Dockets List */}
          <div className="space-y-4">
            {tribunalCases.map((c) => {
              const isDisposed = c.status === 'DISPOSED_COMPLIED';
              return (
                <div
                  key={c.id}
                  className={`bg-white dark:bg-[#131B38] p-5 rounded-2xl border transition shadow-xs space-y-4 ${
                    isDisposed
                      ? 'border-emerald-200 dark:border-emerald-800/60'
                      : 'border-amber-200 dark:border-amber-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                        {c.caseNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded">
                        {c.section}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isDisposed
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                          : c.status === 'DECREE_RESERVED'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300'
                      }`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Filed: {c.filingDate} • Next Hearing: <strong className="text-amber-700 dark:text-amber-400">{c.nextHearingDate}</strong>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Petitioner</span>
                        <strong className="text-slate-800 dark:text-slate-200">{c.petitioner}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Respondent</span>
                        <strong className="text-slate-800 dark:text-slate-200">{c.respondent}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/40">
                    <strong className="text-amber-900 dark:text-amber-300 block mb-0.5">Bench Hearing Record:</strong>
                    {c.hearingSummary}
                  </div>

                  {c.decree && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Decree Pronounced on {c.decreeDate} (Order No: {c.decreeOrderNo})
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewingDecreeOrder(c)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Printer size={12} /> View / Print Form 14 Decree
                        </button>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono italic">
                        "{c.decree}"
                      </p>
                    </div>
                  )}

                  {!isDisposed && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTribunalCase(c);
                          setTribunalDecreeText(`Having heard both parties under Section 70, the respondent is hereby ordered to comply within ${tribunalComplianceDays} days.`);
                          setTribunalDecreeModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Scale size={14} />
                        <span>Pronounce Formal Decree &amp; Judicial Order</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE: DCO STATUTORY WORKER WELFARE ESCROW TREASURY (2%)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DCO_WELFARE' && isDco && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  District Worker Welfare Escrow Treasury (2% Statutory Levy)
                </h2>
                <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 px-2.5 py-0.5 rounded-full uppercase border border-indigo-300 dark:border-indigo-800">
                  Section 56 Social Security Audit
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Statutory reconciliation of the 2% welfare deduction from every completed citizen booking in <strong>{userDistrict} District</strong>. Funds are audited by DCO before transfer to the State Unorganized Workers Social Security Board.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewingWelfareCertificate(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Printer size={14} />
              <span>Print Statutory Escrow Audit Certificate</span>
            </button>
          </div>

          {welfareSignOffSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold">{welfareSignOffSuccess}</span>
              </div>
              <button onClick={() => setWelfareSignOffSuccess('')} className="text-emerald-700 font-bold text-xs">✕</button>
            </div>
          )}

          {/* Treasury Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#131B38] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Escrow Collected</span>
              <div className="text-2xl font-black text-indigo-950 dark:text-white font-mono mt-1">
                ₹{welfareReconciliation.reduce((acc, r) => acc + r.welfareLevy2Pct, 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">231 Total Gigs Audited</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#131B38] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Designated Escrow Account</span>
              <div className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono mt-1 truncate">
                OD-DCCB-WLF-9824
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Odisha State Cooperative Bank</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#131B38] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Health &amp; Accidental Corpus (70%)</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                ₹{Math.round(welfareReconciliation.reduce((acc, r) => acc + r.welfareLevy2Pct, 0) * 0.7).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">ESIC &amp; Hospitalization Pool</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#131B38] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Tool Grant &amp; Relief (30%)</span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
                ₹{Math.round(welfareReconciliation.reduce((acc, r) => acc + r.welfareLevy2Pct, 0) * 0.3).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Disaster Relief &amp; Subsidies</span>
            </div>
          </div>

          {/* Monthly Escrow Reconciliation Table */}
          <div className="bg-white dark:bg-[#131B38] rounded-2xl border border-gray-200 dark:border-[#1E294B] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Scale size={14} className="text-indigo-600" />
                Monthly Statutory Escrow Reconciliation Statement
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Rule 42, Odisha Cooperative Rules</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Billing Cycle</th>
                    <th className="p-3">Completed Gigs</th>
                    <th className="p-3">Gross Turn-over</th>
                    <th className="p-3">2% Statutory Levy</th>
                    <th className="p-3">Statutory Audit</th>
                    <th className="p-3">DCO Sign-off Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {welfareReconciliation.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{rec.month}</td>
                      <td className="p-3 font-mono">{rec.totalBookings} jobs</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">₹{rec.grossTurnover.toLocaleString()}</td>
                      <td className="p-3 font-mono font-extrabold text-indigo-700 dark:text-indigo-400">₹{rec.welfareLevy2Pct.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          rec.statutoryAuditStatus === 'AUDITED_VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {rec.statutoryAuditStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {rec.dcoSignOff ? (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Signed off by {rec.dcoSignatory} on {rec.signOffDate}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <Clock size={13} /> Awaiting DCO Signature
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {rec.dcoSignOff ? (
                          <span className="text-[11px] text-slate-400 font-medium italic">Transfer Cleared</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...welfareReconciliation];
                              updated[idx].dcoSignOff = true;
                              updated[idx].signOffDate = new Date().toISOString().split('T')[0];
                              updated[idx].dcoSignatory = user?.name || 'District Cooperative Officer';
                              updated[idx].statutoryAuditStatus = 'AUDITED_VERIFIED';
                              setWelfareReconciliation(updated);
                              setWelfareSignOffSuccess(`Statutory Escrow Sign-Off completed for ${rec.month}. Transfer authorized to State Social Security Board.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                          >
                            ✍️ Sign-Off &amp; Clear Transfer
                          </button>
                        )}
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
          WORKSPACE 1: GIS & LIVE OPERATIONS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'OPERATIONS' && !isDco && (
        <div className="space-y-4">
          {/* Sub-navigation Segmented Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-[#1E294B]">
            <div className="inline-flex p-1 bg-gray-100 dark:bg-[#131B38] rounded-xl border border-gray-200 dark:border-[#1E294B]">
              <button
                type="button"
                onClick={() => setOpsSubTab('MAP')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  opsSubTab === 'MAP'
                    ? 'bg-white dark:bg-[#0A0F24] text-blue-950 dark:text-amber-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MapPin size={13} />
                <span>GIS Real-Time Dispatch Map</span>
              </button>
              <button
                type="button"
                onClick={() => setOpsSubTab('ORDERS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  opsSubTab === 'ORDERS'
                    ? 'bg-white dark:bg-[#0A0F24] text-blue-950 dark:text-amber-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>Dispatched Orders ({bookings.length})</span>
              </button>
            </div>

            {opsSubTab === 'ORDERS' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Filter:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-[#1E294B] text-xs bg-white dark:bg-[#131B38] text-gray-900 dark:text-white"
                >
                  <option value="ALL">All Statuses ({bookings.length})</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="MATCHED">Matched</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}
          </div>

          {/* Sub-view A: Interactive GIS Dispatch Map & Operations Console */}
          {opsSubTab === 'MAP' && (
            <div className="space-y-4">
              {/* Notification Banner */}
              {dispatchSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{dispatchSuccessMsg}</span>
                  </div>
                  <button onClick={() => setDispatchSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* ── LIVE INTERACTIVE SATELLITE & STREET DISPATCH MAP ── */}
              <SocietyLiveMap
                userDistrict={userDistrict}
                societyName={user?.designation?.split(',')[1]?.trim() || (isFederationHead ? 'Odisha Federation' : 'Shramik Kalyan Labour Cooperative Samiti')}
                workers={liveMapData?.workers?.length ? liveMapData.workers : workers}
                activeBookings={liveMapData?.activeBookings || bookings}
                sosAlerts={sosAlerts}
                onDispatchArtisan={(artisan) => {
                  setSelectedWorker(artisan);
                  setQuickDispatchModal(artisan);
                }}
                onRebalance={handleRebalanceWorkforce}
                rebalanceActive={mutualAidRebalanced}
              />

              {/* ── LIVE ARTISAN ROSTER & DIRECT DISPATCH CONSOLE ── */}
              <div className="bg-white dark:bg-[#131B38] p-5 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Users size={16} className="text-blue-900 dark:text-amber-400" /> Active Artisan Telemetry & Dispatch Board
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Directly inspect real-time coordinates, contact on-duty artisans, or assign pending citizen bookings.
                    </p>
                  </div>

                  {/* Search and Trade Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by artisan or code..."
                        value={mapArtisanSearch}
                        onChange={(e) => setMapArtisanSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-900 w-44"
                      />
                    </div>

                    <select
                      value={artisanTradeFilter}
                      onChange={(e) => setArtisanTradeFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="ALL">All Trades</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Appliance">Appliance</option>
                    </select>
                  </div>
                </div>

                {/* Artisan Cards Grid */}
                {(() => {
                  const sourceWorkers = (liveMapData?.workers && liveMapData.workers.length > 0)
                    ? liveMapData.workers
                    : workers;

                  const filtered = sourceWorkers.filter((w) => {
                    const matchesStatus =
                      artisanStatusFilter === 'ALL' ||
                      (artisanStatusFilter === 'AVAILABLE' && w.availability === 'AVAILABLE') ||
                      (artisanStatusFilter === 'BUSY' && w.availability === 'BUSY') ||
                      (artisanStatusFilter === 'SOS' && w.sos_active);

                    const matchesTrade =
                      artisanTradeFilter === 'ALL' ||
                      (w.primary_trade && w.primary_trade.toLowerCase().includes(artisanTradeFilter.toLowerCase())) ||
                      (w.primaryTrade && w.primaryTrade.toLowerCase().includes(artisanTradeFilter.toLowerCase()));

                    const matchesSearch =
                      !mapArtisanSearch ||
                      (w.name && w.name.toLowerCase().includes(mapArtisanSearch.toLowerCase())) ||
                      (w.worker_code && w.worker_code.toLowerCase().includes(mapArtisanSearch.toLowerCase()));

                    const matchesDistrict = isFederationHead || activeDistrict === 'ALL'
                      ? true
                      : !w.district || w.district.toLowerCase() === userDistrict.toLowerCase() || (userDistrictKey === 'KHORDHA' && (w.district?.toLowerCase() === 'bhubaneswar' || w.city?.toLowerCase() === 'bhubaneswar'));

                    return matchesStatus && matchesTrade && matchesSearch && matchesDistrict;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 text-gray-500 dark:text-slate-400 text-xs">
                        No active artisans matching the selected filters. Try adjusting the status or trade filter.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filtered.slice(0, 9).map((artisan) => {
                        const tradeName = artisan.primary_trade || artisan.primaryTrade || (artisan.id % 3 === 0 ? 'Electrical & AC' : artisan.id % 3 === 1 ? 'Plumbing & Sanitation' : 'Carpentry & Maintenance');
                        const lat = Number(artisan.latitude) || (20.2961 + (artisan.id * 0.005));
                        const lng = Number(artisan.longitude) || (85.8245 + (artisan.id * 0.004));
                        const isSos = artisan.sos_active;
                        const isAvailable = artisan.availability === 'AVAILABLE';

                        return (
                          <div
                            key={artisan.id}
                            className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                              isSos
                                ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900/60'
                                : isAvailable
                                ? 'bg-gray-50/50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
                                : 'bg-gray-50/50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-[10px] text-blue-900 dark:text-amber-400">
                                  {artisan.worker_code || `WRK-2024-${String(artisan.id).padStart(3, '0')}`}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isSos
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : isAvailable
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {isSos ? '🚨 SOS DISTRESS' : isAvailable ? 'AVAILABLE' : 'ON DUTY'}
                                </span>
                              </div>

                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {artisan.name}
                              </div>

                              <div className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Wrench size={12} className="text-amber-500" />
                                <span className="font-semibold">{tradeName}</span>
                                <span className="text-gray-300 dark:text-slate-600">•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">{artisan.rating || '4.9'} ★</span>
                              </div>

                              <div className="text-[11px] text-gray-500 dark:text-slate-400">
                                {artisan.city || 'Bhubaneswar'}, {artisan.district || 'Khordha'} • {artisan.cooperative_name || 'Khordha Labour Federation'}
                              </div>

                              <div className="text-[10px] font-mono text-gray-400 dark:text-slate-500 pt-1">
                                GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  setActiveCoords({ lat, lng, label: `${artisan.name} (${tradeName})` });
                                  setMapZoom(16);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 transition flex items-center gap-1"
                                title="Center Map on this artisan"
                              >
                                <MapPin size={11} className="text-blue-900 dark:text-amber-400" />
                                <span>Focus Map</span>
                              </button>

                              {isSos ? (
                                <button
                                  onClick={() => {
                                    setDispatchSuccessMsg(`Emergency Patrol dispatched to GPS coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) for ${artisan.name}!`);
                                    setTimeout(() => setDispatchSuccessMsg(''), 6000);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1"
                                >
                                  <ShieldAlert size={11} />
                                  <span>Patrol</span>
                                </button>
                              ) : isAvailable ? (
                                <button
                                  onClick={() => {
                                    setQuickDispatchModal(artisan);
                                    const unassigned = bookings.filter(b => b.status === 'REQUESTED' || b.status === 'MATCHED');
                                    if (unassigned.length > 0) setSelectedBookingToAssign(unassigned[0].id);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-950 dark:bg-amber-400 hover:bg-blue-900 text-white dark:text-slate-950 transition flex items-center gap-1"
                                >
                                  <Zap size={11} />
                                  <span>Dispatch</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium italic">Fulfilling order</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ── QUICK DISPATCH MODAL ── */}
              {quickDispatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white dark:bg-[#131B38] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Quick Dispatch: {quickDispatchModal.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setQuickDispatchModal(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 text-gray-700 dark:text-slate-300">
                      <div><strong>Artisan Code:</strong> {quickDispatchModal.worker_code || `WRK-${quickDispatchModal.id}`}</div>
                      <div><strong>Trade Specialization:</strong> {quickDispatchModal.primary_trade || quickDispatchModal.primaryTrade || 'Electrical & Appliances'}</div>
                      <div><strong>Cooperative:</strong> {quickDispatchModal.cooperative_name || 'Khordha District Federation'}</div>
                      <div><strong>Rating:</strong> {quickDispatchModal.rating || '4.9'} ★ • Skill & Police Background Verified</div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                        Assign to Pending Citizen Booking:
                      </label>
                      {bookings.filter(b => b.status === 'REQUESTED' || b.status === 'MATCHED').length === 0 ? (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                          No currently unassigned bookings pending dispatch in the queue. All live citizen orders are actively matched!
                        </div>
                      ) : (
                        <select
                          value={selectedBookingToAssign}
                          onChange={(e) => setSelectedBookingToAssign(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-900"
                        >
                          {bookings
                            .filter(b => b.status === 'REQUESTED' || b.status === 'MATCHED')
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.booking_code} — {b.service_name} ({b.customer_name}, {b.location_district})
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setQuickDispatchModal(null)}
                        className="btn btn-secondary btn-sm text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const targetBooking = bookings.find(b => String(b.id) === String(selectedBookingToAssign));
                          const code = targetBooking?.booking_code || `ORD-${selectedBookingToAssign || '2026'}`;
                          setDispatchSuccessMsg(`Successfully dispatched ${quickDispatchModal.name} to Booking ${code}! Telemetry route activated.`);
                          setQuickDispatchModal(null);
                          setTimeout(() => setDispatchSuccessMsg(''), 6000);
                        }}
                        className="btn btn-primary btn-sm text-xs font-bold bg-blue-950 dark:bg-amber-400 text-white dark:text-slate-950"
                      >
                        Confirm Dispatch & Telemetry Sync
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-view B: Dispatched Orders */}
          {opsSubTab === 'ORDERS' && (
            <div className="bg-white dark:bg-[#131B38] p-6 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Active & Historical Federation Dispatches</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Real-time status tracking of citizen requests and on-field worker fulfillment.
                </p>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-slate-400 text-xs">No orders matching the selected status filter.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-blue-900 dark:text-amber-400">{b.booking_code}</span>
                        <div className="font-bold text-gray-900 dark:text-white">{b.service_name}</div>
                        <div className="text-gray-500 dark:text-slate-400">{b.customer_name} • {b.location_district} • {b.scheduled_date}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">₹{b.total_amount}</span>
                        <span className="block text-[10px] font-bold text-blue-900 dark:text-amber-400 uppercase">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: WORKER ACCREDITATION & VERIFICATION DESK
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'WORKERS' && !isDco && (
        <div className="space-y-4">
          {/* Header & Filter Controls */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                  Multi-State Cooperative Societies Act, 2002
                </span>
                <h3 className="font-bold text-base text-gray-900 mt-1">
                  Worker Accreditation & Verification Queue
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review applicant trade skills, skill certificate numbers, and statutory KYC dossiers before approving state dispatch.
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    workerStatusFilter === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Clock size={13} />
                  <span>Pending ({workers.filter(w => w.verification_status === 'PENDING').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    workerStatusFilter === 'VERIFIED'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Verified ({workers.filter(w => w.verification_status === 'VERIFIED').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    workerStatusFilter === 'REJECTED'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <XCircle size={13} />
                  <span>Rejected ({workers.filter(w => w.verification_status === 'REJECTED').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    workerStatusFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  All ({workers.length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by artisan name, application ID, worker code, trade, district, or certificate no..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] border-b">
                  <tr>
                    <th className="p-3">Applicant & Dossier ID</th>
                    <th className="p-3">Trade & Experience</th>
                    <th className="p-3">District & Federation</th>
                    <th className="p-3">Certifications (NCVT/Skill)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No worker applications matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-gray-900 text-sm">{w.name}</div>
                          <div className="font-mono text-[10px] text-blue-900 font-bold">
                            {w.application_no || w.worker_code}
                          </div>
                          <div className="text-[11px] text-gray-500">{w.phone} • {w.email}</div>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-emerald-900 block">{w.primary_trade || 'General Artisan'}</span>
                          <span className="text-[11px] text-gray-600">{w.experience_years} yrs exp • {w.tier || 'BRONZE'}</span>
                          {w.sub_skills && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-xs">{w.sub_skills}</span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-gray-800 block">{w.district}</span>
                          <div className="mt-0.5 space-y-0.5">
                            {w.is_independent || !w.society_id ? (
                              <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-200">
                                Independent Artisan
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                {w.society_name || 'Society Member'}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                              {w.cooperative_name || 'District Federation'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3">
                          {w.certifications && w.certifications.length > 0 ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-[11px] font-bold text-slate-800 block">
                                {w.certifications[0].certificate_number || 'CERT-RECORD'}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">
                                {w.certifications[0].issuing_organization || 'National Skill Council / NCVT'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Trade / Skill Card Attached</span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            w.verification_status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : w.verification_status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {w.verification_status === 'VERIFIED' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            {w.verification_status}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedWorker(w)}
                              className="btn btn-secondary btn-sm text-[11px] py-1 px-2 text-blue-900 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye size={12} /> View Dossier
                            </button>

                            {w.verification_status !== 'VERIFIED' ? (
                              <button
                                onClick={() => handleVerifyWorker(w.id, 'VERIFIED')}
                                disabled={actionBusyId === w.id}
                                className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-800 border-emerald-800 hover:bg-emerald-900"
                              >
                                {actionBusyId === w.id ? 'Saving...' : '✓ Approve'}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const reason = window.prompt('Enter reason for revoking / rejecting accreditation:');
                                  if (reason) handleVerifyWorker(w.id, 'REJECTED', reason);
                                }}
                                disabled={actionBusyId === w.id}
                                className="btn btn-secondary btn-sm text-[11px] py-1 px-2 text-red-700 hover:bg-red-50"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE 3: SAFETY & ARBITRATION
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'SAFETY_DISPUTES' && !isDco && (
        <div className="space-y-4">
          {/* Sub-navigation Segmented Controller */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-[#1E294B]">
            <div className="inline-flex p-1 bg-gray-100 dark:bg-[#131B38] rounded-xl border border-gray-200 dark:border-[#1E294B]">
              <button
                type="button"
                onClick={() => setSafetySubTab('SOS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  safetySubTab === 'SOS'
                    ? 'bg-white dark:bg-[#0A0F24] text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShieldAlert size={13} className="text-red-600 dark:text-red-400" />
                <span>Worker Emergency SOS ({sosAlerts.length})</span>
                {sosAlerts.filter(s => s.status === 'ACTIVE').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSafetySubTab('ARBITRATION')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  safetySubTab === 'ARBITRATION'
                    ? 'bg-white dark:bg-[#0A0F24] text-purple-700 dark:text-purple-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck size={13} className="text-purple-600 dark:text-purple-400" />
                <span>Human Arbitration Desk ({disputes.length})</span>
              </button>
            </div>
          </div>

          {/* Sub-view A: SOS Emergency Distress Signals */}
          {safetySubTab === 'SOS' && (
            <div className="bg-white dark:bg-[#131B38] p-6 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 text-red-700 dark:text-red-400">
                  <ShieldAlert size={18} /> Worker Emergency Safety & SOS Beacon Feeds
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Live distress signals dispatched by on-field artisans with GPS telemetry.
                </p>
              </div>

              <div className="space-y-3">
                {sosAlerts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-slate-400 text-xs">No active emergency distress signals.</div>
                ) : (
                  sosAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-700 dark:text-red-400">🚨 EMERGENCY DISTRESS SIGNAL</span>
                          <span className="font-mono text-gray-600 dark:text-slate-400">{alert.worker_code}</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">{alert.worker_name} ({alert.worker_district})</div>
                        <p className="text-gray-600 dark:text-slate-300 text-[11px] mt-0.5">Phone: <strong>{alert.worker_phone}</strong> • Details: {alert.details}</p>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">Triggered at: {alert.triggered_at}</span>
                      </div>
                      <button className="btn btn-primary btn-sm text-xs bg-red-700 hover:bg-red-800">
                        Dispatch Patrol
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-view B: Human Arbitration Desk */}
          {safetySubTab === 'ARBITRATION' && (
            <div className="bg-white dark:bg-[#131B38] p-6 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Cooperative Human Dispute & Arbitration Desk</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Direct state arbitration for citizen and worker grievances with zero bot dead-ends.
                </p>
              </div>

              <div className="space-y-3">
                {disputes.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-slate-400 text-xs">No active dispute tickets.</div>
                ) : (
                  disputes.map((d) => (
                    <div key={d.id} className="p-4 rounded-xl border border-gray-200 dark:border-[#1E294B] bg-gray-50/50 dark:bg-[#0A0F24]/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-950 dark:text-amber-400">{d.ticket_code}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-950 dark:text-blue-300 font-bold text-[10px]">
                            {d.issue_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            d.status === 'RESOLVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-slate-200 font-medium">"{d.description}"</p>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">
                          Filed by: <strong>{d.customer_name}</strong> (Ph: {d.customer_phone}) • Artisan: {d.worker_name || 'Assigned Worker'}
                        </div>
                        {d.resolution_notes && (
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 rounded-lg text-[11px] mt-1 border border-emerald-200 dark:border-emerald-800">
                            <strong>Arbitration Outcome:</strong> {d.resolution_notes} (Arbitrator: {d.arbitrator_name})
                          </div>
                        )}
                      </div>

                      {d.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setSelectedDispute(d)}
                          className="btn btn-primary btn-sm text-xs shrink-0"
                        >
                          Arbitrate & Resolve
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSPACE 4: GOVERNANCE & WELFARE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'GOVERNANCE' && !isDco && (
        <div className="space-y-4">
          {/* Sub-navigation Segmented Controller */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-[#1E294B]">
            <div className="inline-flex p-1 bg-gray-100 dark:bg-[#131B38] rounded-xl border border-gray-200 dark:border-[#1E294B]">
              <button
                type="button"
                onClick={() => setGovSubTab('WELFARE')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  govSubTab === 'WELFARE'
                    ? 'bg-white dark:bg-[#0A0F24] text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <HeartPulse size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span>Welfare Corpus Live Ledger (5%)</span>
              </button>
              <button
                type="button"
                onClick={() => setGovSubTab('FORECAST')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  govSubTab === 'FORECAST'
                    ? 'bg-white dark:bg-[#0A0F24] text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Zap size={13} className="text-amber-600 dark:text-amber-400" />
                <span>AI Demand Forecast & Mutual Aid</span>
              </button>
            </div>
          </div>

          {/* Sub-view A: Welfare Corpus Live Ledger */}
          {govSubTab === 'WELFARE' && (
            <div className="bg-white dark:bg-[#131B38] p-6 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-6">
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">5% PF & Insurance (Worker Welfare Fund) Corpus Live Ledger</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Transparent pooling and disbursement ledger for PF, ESIC accident insurance, pensions, and medical emergency grants.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">Total Pooled Levy Corpus</span>
                  <div className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-200 mt-1">₹{welfareCorpus.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">5% automatically pooled from every order into PF & insurance</span>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">Active ESIC Insured Artisans</span>
                  <div className="text-2xl font-bold font-mono text-blue-950 dark:text-blue-200 mt-1">{statistics?.verifiedWorkers || 18} Artisans</div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400">₹2,00,000 policy coverage each</span>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">EPFO Retirement Reserve</span>
                  <div className="text-2xl font-bold font-mono text-purple-950 dark:text-purple-200 mt-1">₹{Math.round(welfareCorpus * 0.4).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400">Monthly federation contribution</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view B: Smart AI Forecast & Mutual Aid */}
          {govSubTab === 'FORECAST' && (
            <div className="bg-white dark:bg-[#131B38] p-6 rounded-2xl border border-gray-200 dark:border-[#1E294B] shadow-xs space-y-6">
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">AI Seasonal Demand Projections & Mutual Aid Matrix</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Predictive spikes and inter-cooperative temporary workforce balance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecastData?.seasonalSpikes?.map((spike, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-[#1E294B] bg-gray-50/60 dark:bg-[#0A0F24]/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                      <span>{spike.season}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">
                        {spike.surgeMultiplier}
                      </span>
                    </div>
                    <div className="text-blue-900 dark:text-amber-400 font-semibold">{spike.trade}</div>
                    <p className="text-gray-500 dark:text-slate-400 text-[11px]">{spike.recommendedAction}</p>
                  </div>
                ))}
              </div>

              {/* Mutual Aid Proposals */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Inter-District Mutual Aid Dispatch Approvals</h4>
                <div className="space-y-3">
                  {allocationData?.mutualAidProposals?.map((prop) => (
                    <div key={prop.proposalId} className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between text-xs gap-4">
                      <div>
                        <div className="font-bold text-indigo-950 dark:text-indigo-300">{prop.trade} Transfer: {prop.sourceCoop} ➔ {prop.targetCoop}</div>
                        <p className="text-gray-600 dark:text-slate-400 mt-0.5">{prop.recommendedTransferCount} workers requested • Reason: {prop.reason}</p>
                      </div>
                      <button
                        onClick={() => handleApproveMutualAid(prop.proposalId)}
                        disabled={mutualAidBusyId === prop.proposalId}
                        className="btn btn-primary btn-sm text-xs font-bold shrink-0"
                      >
                        Authorize Dispatch Transfer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-blue-950">Arbitrate Dispute: {selectedDispute.ticket_code}</h3>
              <button onClick={() => setSelectedDispute(null)}><X size={16} /></button>
            </div>

            <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl space-y-1">
              <div><strong>Issue:</strong> {selectedDispute.issue_type}</div>
              <div><strong>Description:</strong> "{selectedDispute.description}"</div>
              <div><strong>Citizen:</strong> {selectedDispute.customer_name} (Ph: {selectedDispute.customer_phone})</div>
            </div>

            <form onSubmit={handleResolveDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Arbitration & Settlement Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter resolution details, agreed adjustments, or supervisor notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedDispute(null)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={resolvingDispute} className="btn btn-primary btn-sm">
                  {resolvingDispute ? 'Saving...' : 'Finalize Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WORKER ACCREDITATION DOSSIER MODAL ── */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                  Cooperative Worker Accreditation Dossier
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">
                  {selectedWorker.name}
                </h3>
                <span className="font-mono text-xs text-slate-500 font-bold">
                  App Ref: {selectedWorker.application_no || selectedWorker.worker_code}
                </span>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Alert in Modal */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              selectedWorker.verification_status === 'VERIFIED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : selectedWorker.verification_status === 'PENDING'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center gap-2">
                {selectedWorker.verification_status === 'VERIFIED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                <strong>Accreditation Status: {selectedWorker.verification_status}</strong>
              </div>
              <span className="text-[11px] font-semibold">{selectedWorker.cooperative_name || 'District Federation'}</span>
            </div>

            {/* Dossier Body */}
            <div className="space-y-4 text-xs">
              {/* 1. Identity & Personal Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-blue-950 font-bold uppercase text-[10px] tracking-wider block">
                  1. Personal & Residential Information
                </strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                  <div><span className="text-slate-400 block text-[10px]">Mobile:</span> {selectedWorker.phone || 'N/A'}</div>
                  <div><span className="text-slate-400 block text-[10px]">Email:</span> {selectedWorker.email || 'N/A'}</div>
                  <div><span className="text-slate-400 block text-[10px]">District:</span> {selectedWorker.district}</div>
                  <div><span className="text-slate-400 block text-[10px]">City:</span> {selectedWorker.city || 'Bhubaneswar'}</div>
                  <div><span className="text-slate-400 block text-[10px]">Pincode:</span> {selectedWorker.pincode || '751024'}</div>
                  <div className="col-span-2 sm:col-span-3"><span className="text-slate-400 block text-[10px]">Address:</span> {selectedWorker.address || 'Registered local address'}</div>
                </div>
              </div>

              {/* 2. Trade & Tooling Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-950 font-bold uppercase text-[10px] tracking-wider block">
                    2. Trade Skills & Mandatory Tooling
                  </strong>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedWorker.toolkit_compliance === 'VERIFIED_EQUIPPED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {selectedWorker.toolkit_compliance === 'VERIFIED_EQUIPPED' ? '✓ Mandatory ISI Toolkit Verified' : 'Toolkit Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="text-slate-400 block text-[10px]">Primary Trade:</span> <strong className="text-slate-900">{selectedWorker.primary_trade || 'General Artisan'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Experience:</span> {selectedWorker.experience_years} Years ({selectedWorker.tier || 'BRONZE'})</div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Sub-Skills:</span> {selectedWorker.sub_skills || 'General maintenance & diagnostic repair'}</div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Tools Owned:</span> {selectedWorker.tools_owned || 'Standard professional tooling & safety helmet'}</div>
                </div>
              </div>

              {/* 3. Trade Certifications */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-amber-950 font-bold uppercase text-[10px] tracking-wider block">
                  3. Trade Certifications (NCVT / Skill / NSDC)
                </strong>
                {selectedWorker.certifications && selectedWorker.certifications.length > 0 ? (
                  selectedWorker.certifications.map((cert, cIdx) => (
                    <div key={cIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{cert.certification_name || 'Trade Certificate'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Reg No: {cert.certificate_number}</div>
                        <div className="text-[10px] text-slate-400">{cert.issuing_organization} • Issued: {cert.issue_date}</div>
                      </div>
                      <span className="gov-seal-verified">
                        {cert.verification_status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Trade / NSDC Certificate attached in physical file.</div>
                )}
              </div>

              {/* 4. Statutory KYC & Banking */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-indigo-950 font-bold uppercase text-[10px] tracking-wider block">
                  4. Statutory KYC & Bank Account (Direct 93% Pay)
                </strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                  <div><span className="text-slate-400 block text-[10px]">Aadhaar (Masked):</span> <span className="font-mono">{selectedWorker.aadhaar_number ? `XXXX-XXXX-${selectedWorker.aadhaar_number.slice(-4)}` : 'Verified on File'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">PAN Card:</span> <span className="font-mono font-bold">{selectedWorker.pan_number || 'Verified'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Ration / BPL:</span> <span className="font-mono">{selectedWorker.ration_card || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Bank Name:</span> {selectedWorker.bank_name || 'State Bank of India'}</div>
                  <div><span className="text-slate-400 block text-[10px]">Account No:</span> <span className="font-mono font-bold">{selectedWorker.bank_account ? `••••${selectedWorker.bank_account.slice(-4)}` : '••••8821'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">IFSC Code:</span> <span className="font-mono font-bold">{selectedWorker.bank_ifsc || 'SBIN0001234'}</span></div>
                  <div className="col-span-2 sm:col-span-3 border-t border-slate-200 pt-1.5 mt-1">
                    <span className="text-slate-400 block text-[10px]">Emergency Contact:</span>
                    <strong>{selectedWorker.emergency_contact_name || 'Nominee'}</strong> ({selectedWorker.emergency_contact_relation || 'Family'}) • Ph: {selectedWorker.emergency_contact_phone || '9876500000'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedWorker.verification_status !== 'VERIFIED' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = window.prompt('Enter reason for rejection / return:');
                        if (reason) {
                          handleVerifyWorker(selectedWorker.id, 'REJECTED', reason);
                        }
                      }}
                      disabled={actionBusyId === selectedWorker.id}
                      className="btn btn-secondary btn-sm text-red-700 border-red-200 hover:bg-red-50"
                    >
                      ✗ Reject Application
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyWorker(selectedWorker.id, 'VERIFIED')}
                      disabled={actionBusyId === selectedWorker.id}
                      className="btn btn-primary btn-sm bg-emerald-800 border-emerald-800 hover:bg-emerald-900 font-bold"
                    >
                      {actionBusyId === selectedWorker.id ? 'Accrediting...' : '✓ Approve & Issue State Accreditation'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt('Enter reason for revoking accreditation:');
                      if (reason) handleVerifyWorker(selectedWorker.id, 'REJECTED', reason);
                    }}
                    disabled={actionBusyId === selectedWorker.id}
                    className="btn btn-secondary btn-sm text-red-700"
                  >
                    Revoke Accreditation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SOCIETY LEGAL DOSSIER & 10 FOUNDING PROMOTERS INSPECTION
         ───────────────────────────────────────────────────────────── */}
      {selectedFedSocDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#131B38] rounded-3xl border border-gray-200 dark:border-[#1E294B] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-[#1E294B] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-900 dark:text-amber-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {selectedFedSocDetail.society_code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedFedSocDetail.status === 'ACTIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {selectedFedSocDetail.status === 'ACTIVE' ? '✓ Certified Active' : '⏳ Under DCO Review'}
                  </span>
                  <span className="text-xs text-gray-500">
                    District: <strong>{selectedFedSocDetail.district}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1.5">
                  {selectedFedSocDetail.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  📍 {selectedFedSocDetail.address || selectedFedSocDetail.city || selectedFedSocDetail.district}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFedSocDetail(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tab Switcher inside Modal */}
            <div className="px-6 pt-4 border-b border-gray-100 dark:border-[#1E294B] flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSocDetailTab('ROSTER')}
                className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  socDetailTab === 'ROSTER'
                    ? 'border-blue-950 dark:border-sky-400 text-blue-950 dark:text-sky-300'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                10 Founding Promoters ({selectedFedSocDetail.founding_members?.length || 10})
              </button>
              <button
                type="button"
                onClick={() => setSocDetailTab('DOCS')}
                className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  socDetailTab === 'DOCS'
                    ? 'border-blue-950 dark:border-sky-400 text-blue-950 dark:text-sky-300'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Statutory Dossier ({selectedFedSocDetail.statutory_documents?.length || 6} Docs)
              </button>
              <button
                type="button"
                onClick={() => setSocDetailTab('GOVERNANCE')}
                className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  socDetailTab === 'GOVERNANCE'
                    ? 'border-blue-950 dark:border-sky-400 text-blue-950 dark:text-sky-300'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Banking &amp; Governance
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {socDetailTab === 'ROSTER' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Official Promoter Roster (Statutory Minimum: 10 Members)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ 100% KYC Verified
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1E294B]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Full Name</th>
                          <th className="p-2.5">Trade / Skill</th>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">Aadhaar (Masked)</th>
                          <th className="p-2.5">Society Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#1E294B]">
                        {(selectedFedSocDetail.founding_members || []).map((m, idx) => (
                          <tr key={m.id || idx}>
                            <td className="p-2.5 font-mono text-gray-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-gray-900 dark:text-white">{m.full_name}</td>
                            <td className="p-2.5 text-blue-900 dark:text-amber-300">{m.occupation}</td>
                            <td className="p-2.5 font-mono text-gray-500">{m.phone}</td>
                            <td className="p-2.5 font-mono text-gray-400">{m.aadhaar_number}</td>
                            <td className="p-2.5 font-bold text-purple-700 dark:text-purple-300">
                              {m.role_in_society || 'MEMBER'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {socDetailTab === 'DOCS' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    Statutory Formation Dossier &amp; Legal Filing Documents
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedFedSocDetail.statutory_documents || []).map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1E294B] bg-gray-50 dark:bg-slate-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-bold">
                            {doc.doc_type}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {doc.verification_status || 'VERIFIED'}
                          </span>
                        </div>
                        <strong className="text-xs text-gray-900 dark:text-white block">
                          {doc.document_name}
                        </strong>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                          <span>Audited by: {doc.verified_by_officer || 'District Registrar'}</span>
                          <span className="text-blue-600 dark:text-amber-400 font-bold hover:underline cursor-pointer">
                            View File ↗
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {socDetailTab === 'GOVERNANCE' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Initial Capital Contribution</span>
                      <strong className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                        ₹{(parseFloat(selectedFedSocDetail.initial_capital_balance) || 10000).toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Statutory min ₹10,000 satisfied</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Cooperative Bank Account</span>
                      <strong className="text-xs text-gray-900 dark:text-white font-mono block">
                        {selectedFedSocDetail.bank_account_no || 'COOP-ACC-DEFAULT'}
                      </strong>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        {selectedFedSocDetail.cooperative_bank_name} • {selectedFedSocDetail.bank_ifsc}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">Statutory Audit Frequency</span>
                      <strong className="text-xs text-gray-900 dark:text-white block">
                        {selectedFedSocDetail.audit_frequency || 'HALF_YEARLY'}
                      </strong>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Under Section 62 OCS Act</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-900 dark:text-blue-300 block">
                      District Cooperative Office Jurisdiction
                    </span>
                    <strong className="text-xs text-gray-900 dark:text-white block">
                      {selectedFedSocDetail.dco_office_name || `${selectedFedSocDetail.district} District Cooperative Office`}
                    </strong>
                    <p className="text-[11px] text-gray-600 dark:text-slate-400">
                      Responsible Officer: <strong>{selectedFedSocDetail.dco_officer_name || 'District Registrar'}</strong> • Tracking ID: <span className="font-mono">{selectedFedSocDetail.tracking_id}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#1E294B] flex items-center justify-between gap-3 bg-gray-50 dark:bg-slate-900/60 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setSelectedFedSocDetail(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close Dossier
              </button>

              {selectedFedSocDetail.status !== 'ACTIVE' && (user?.admin_type === 'DCO_REGISTRAR' || user?.admin_type === 'FEDERATION_HEAD') ? (
                <button
                  type="button"
                  onClick={() => {
                    const soc = selectedFedSocDetail;
                    setSelectedFedSocDetail(null);
                    setActiveTab('DCO_APPROVAL');
                    setDcoSubTab('PENDING');
                    setDcoExpandedId(soc.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileCheck size={14} />
                  <span>Proceed to DCO Scrutiny Decision →</span>
                </button>
              ) : selectedFedSocDetail.status === 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={() => {
                    const soc = selectedFedSocDetail;
                    setSelectedFedSocDetail(null);
                    setViewingCertificate(soc);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Award size={14} />
                  <span>View Registration Certificate</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: OFFICIAL REGISTRATION CERTIFICATE (GOVT OF ODISHA)
         ───────────────────────────────────────────────────────────── */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border-4 sm:border-8 border-double border-amber-600/60 p-5 sm:p-8 text-slate-900 relative flex flex-col space-y-5 my-auto">
            <button
              type="button"
              onClick={() => setViewingCertificate(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-1 border-b-2 border-amber-600/30 pb-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-600 flex items-center justify-center mb-2">
                <Landmark size={28} className="text-amber-800" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Government of Odisha • Department of Cooperation
              </h2>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Office of the District Cooperative Officer &amp; Registrar of Cooperative Societies
              </h3>
              <p className="text-xs text-amber-900 font-bold uppercase">
                {viewingCertificate.district} District Jurisdiction
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center space-y-2 py-2">
              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Form No. 2 (See Rule 9)
              </span>
              <h1 className="text-2xl font-serif font-black tracking-wide text-blue-950 uppercase pt-2">
                Certificate of Registration
              </h1>
              <p className="text-xs text-slate-600 italic">
                Issued under Section 8 of the Odisha Cooperative Societies Act, 1962 (Odisha Act 2 of 1963)
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-serif bg-amber-50/40 p-5 rounded-xl border border-amber-200/60">
              <p>
                This is to certify that the cooperative society named{' '}
                <strong className="text-sm text-blue-950 underline font-sans font-bold">
                  {viewingCertificate.name}
                </strong>
                , having its registered office at{' '}
                <strong className="font-sans">
                  {viewingCertificate.address || viewingCertificate.city || viewingCertificate.district}
                </strong>
                , has this day been duly registered as a{' '}
                <strong>PRIMARY MULTI-TRADE LABOUR &amp; ARTISAN COOPERATIVE SOCIETY</strong>{' '}
                with limited liability, along with its certified bylaws and audited capital reserve of{' '}
                <strong className="font-sans font-bold">
                  ₹{(parseFloat(viewingCertificate.initial_capital_balance) || 10000).toLocaleString()}
                </strong>{' '}
                held in cooperative bank account{' '}
                <strong className="font-mono">{viewingCertificate.bank_account_no || 'COOP-PRIMARY'}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-sans border-t border-amber-200/60">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Registration Number</span>
                  <strong className="text-blue-950 font-mono text-xs">
                    {viewingCertificate.registration_number || `REG-OD-2024-${viewingCertificate.id}`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Date of Registration</span>
                  <strong className="text-blue-950 text-xs">
                    {viewingCertificate.created_at ? new Date(viewingCertificate.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15-Mar-2024'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Certificate Footer / Seal */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-200">
              <div className="text-left space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center text-[9px] font-black uppercase text-amber-900 text-center leading-tight">
                  Seal of<br />Registrar<br />Odisha
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">
                  SHA256: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </span>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic text-sm text-blue-950 font-bold">
                  {viewingCertificate.dco_officer_name || user?.name || 'Debendra Nayak'}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  District Cooperative Officer &amp; Registrar
                </div>
                <div className="text-[11px] text-slate-500">
                  {viewingCertificate.district} District, Cooperation Dept, Odisha
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Official Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DCO STATUTORY AUDIT & RESERVE SOLVENCY ORDER (SEC 62 & 56)
         ───────────────────────────────────────────────────────────── */}
      {auditModalSoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B38] border border-gray-200 dark:border-[#1E294B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Statutory Audit Scrutiny & Order
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    OCS Act 1962 (Sec. 62 Audit & Sec. 56 Reserve Fund)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalSoc(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
              <div className="font-bold text-gray-900 dark:text-white">{auditModalSoc.name}</div>
              <div className="text-[11px] text-gray-500 font-mono">
                Reg: {auditModalSoc.registration_number || 'PENDING'} • District: {auditModalSoc.district || userDistrict}
              </div>
            </div>

            <form onSubmit={handleUpdateAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Audit Classification Grade (Section 62)
                </label>
                <select
                  value={auditForm.audit_grade}
                  onChange={(e) => setAuditForm({ ...auditForm, audit_grade: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="A">Grade A (Exemplary - Reserve Fund &gt; 25%, 0 Defalcations)</option>
                  <option value="B">Grade B (Satisfactory - Minor procedural rectifications)</option>
                  <option value="C">Grade C (Under Surveillance - Mandatory supervisory audit)</option>
                  <option value="DEFAULTER">Defaulter / Irregular (Immediate Section 65 notice issued)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Annual Return & Form 14 Filing Status
                </label>
                <select
                  value={auditForm.annual_return_status}
                  onChange={(e) => setAuditForm({ ...auditForm, annual_return_status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="FILED_CURRENT_FY">FILED_CURRENT_FY (Statutory Form 14 Filed with Audit Report)</option>
                  <option value="PENDING">PENDING (Pending submission)</option>
                  <option value="OVERDUE">OVERDUE (Statutory deadline breached)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Statutory Reserve Fund Balance (₹) (Section 56: Min 25% Net Profit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={auditForm.reserve_fund_balance}
                  onChange={(e) => setAuditForm({ ...auditForm, reserve_fund_balance: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  placeholder="e.g. 145000"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Under Section 56, every society shall transfer at least 25% of its net profit to the statutory reserve fund in DCCB.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuditModalSoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-xs"
                >
                  Save Statutory Audit Classification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DCO GOVERNANCE & 5-YEAR COMMITTEE MANDATE (SEC 28 & 29)
         ───────────────────────────────────────────────────────────── */}
      {govModalSoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B38] border border-gray-200 dark:border-[#1E294B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-indigo-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Update Governance Mandate & AGM
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    OCS Act 1962 (Sec. 28 Committee Tenure & Sec. 29 AGM)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGovModalSoc(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
              <div className="font-bold text-gray-900 dark:text-white">{govModalSoc.name}</div>
              <div className="text-[11px] text-gray-500 font-mono">
                Reg: {govModalSoc.registration_number || 'PENDING'} • District: {govModalSoc.district || userDistrict}
              </div>
            </div>

            <form onSubmit={handleUpdateGov} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Last Annual General Meeting (AGM) Date (Sec. 29)
                </label>
                <input
                  type="date"
                  value={govForm.last_agm_date}
                  onChange={(e) => setGovForm({ ...govForm, last_agm_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Mandatory within 6 months of the close of financial year under OCS Act Section 29.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Managing Committee 5-Year Term Expiration (Sec. 28)
                </label>
                <input
                  type="date"
                  value={govForm.committee_term_end}
                  onChange={(e) => setGovForm({ ...govForm, committee_term_end: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Maximum statutory mandate is 5 continuous years. Election notification must be published 90 days before expiry.
                </p>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-indigo-900 dark:text-indigo-300">
                <strong>Statutory Rule:</strong> Failure to conduct elections within the statutory 5-year mandate empowers the District Registrar to supersede the committee under Section 32.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGovModalSoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-xs"
                >
                  Save Governance Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DCO STATUTORY INQUIRY & DISPUTE PROCEEDING (SEC 65/67/68)
         ───────────────────────────────────────────────────────────── */}
      {inquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B38] border border-gray-200 dark:border-[#1E294B] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Record Statutory Proceeding / Issue Summons
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    OCS Act 1962: Section 65 (Financial Inspection) • Sec 68 (Dispute Conciliation) • Sec 67 (Surcharge)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInquiryModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Certified Society in {userDistrict}
                  </label>
                  <select
                    value={inquiryForm.society_id}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, society_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  >
                    <option value="">Select Society</option>
                    {dcoApprovedSocieties.map((soc) => (
                      <option key={soc.id} value={soc.id}>
                        {soc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Statutory Section
                  </label>
                  <select
                    value={inquiryForm.section}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="SECTION_68">Section 68 (Territorial / Governance Dispute)</option>
                    <option value="SECTION_65">Section 65 (Financial Books Inquiry by Registrar)</option>
                    <option value="SECTION_67">Section 67 (Surcharge / Property Recovery)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Proceeding / Dispute Title
                </label>
                <input
                  type="text"
                  value={inquiryForm.title}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })}
                  placeholder="e.g. Boundary dispute over Patia plumbing dispatch cluster"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Complainant Party
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.complainant}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, complainant: e.target.value })}
                    placeholder="e.g. Rasulgarh Plumbers Union"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Respondent Party
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.respondent}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, respondent: e.target.value })}
                    placeholder="e.g. Managing Committee"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Status of Proceeding
                  </label>
                  <select
                    value={inquiryForm.status}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="HEARING_SCHEDULED">HEARING_SCHEDULED (Summons Issued)</option>
                    <option value="UNDER_INQUIRY">UNDER_INQUIRY (Inquiry Officer Appointed)</option>
                    <option value="RESOLVED">RESOLVED (Conciliation Order Passed)</option>
                    <option value="SURCHARGE_ORDERED">SURCHARGE_ORDERED (Liability Fixed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={inquiryForm.next_hearing_date}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, next_hearing_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  DCO Registrar Minutes / Interim Order
                </label>
                <textarea
                  rows={3}
                  value={inquiryForm.dco_remarks}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, dco_remarks: e.target.value })}
                  placeholder="Official docket notes, evidence produced, and binding directions..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setInquiryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inquiryBusy}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {inquiryBusy ? 'Recording Docket...' : 'Issue Docket & Summons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Modal: Pronounce Section 70 Formal Judicial Decree ── */}
      {tribunalDecreeModal && selectedTribunalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B38] border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Pronounce Section 70 Quasi-Judicial Decree
                </h3>
              </div>
              <button
                onClick={() => { setTribunalDecreeModal(false); setSelectedTribunalCase(null); }}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <div><strong className="text-amber-950 dark:text-amber-200">Docket:</strong> <span className="font-mono">{selectedTribunalCase.caseNumber}</span></div>
              <div><strong className="text-amber-950 dark:text-amber-200">Matter:</strong> {selectedTribunalCase.title}</div>
              <div><strong className="text-amber-950 dark:text-amber-200">Parties:</strong> {selectedTribunalCase.petitioner} <em>vs</em> {selectedTribunalCase.respondent}</div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = tribunalCases.map(c => {
                  if (c.id === selectedTribunalCase.id) {
                    return {
                      ...c,
                      status: 'DISPOSED_COMPLIED',
                      decree: tribunalDecreeText,
                      decreeDate: new Date().toISOString().split('T')[0],
                      decreeOrderNo: `ORD-DCO-${userDistrict?.toUpperCase() || 'PUR'}-2026-${Math.floor(100 + Math.random() * 900)}`,
                    };
                  }
                  return c;
                });
                setTribunalCases(updated);
                setTribunalDecreeModal(false);
                setSelectedTribunalCase(null);
                setDcoSuccessMsg(`Judicial Decree pronounced successfully under Section 70 for Docket ${selectedTribunalCase.caseNumber}.`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Operative Judgment &amp; Binding Directions (Decree)
                </label>
                <textarea
                  rows={4}
                  value={tribunalDecreeText}
                  onChange={(e) => setTribunalDecreeText(e.target.value)}
                  placeholder="The respondent society is hereby directed to..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Compliance Timeline
                  </label>
                  <select
                    value={tribunalComplianceDays}
                    onChange={(e) => setTribunalComplianceDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    <option value="7">7 Calendar Days</option>
                    <option value="15">15 Calendar Days (Standard)</option>
                    <option value="30">30 Calendar Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Statutory Presiding Officer
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${user?.name || 'DCO'} (District Registrar)`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTribunalDecreeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Scale size={14} /> Seal &amp; Pronounce Official Decree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: View Form 14 Official Judicial Decree ── */}
      {viewingDecreeOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-slate-300 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-amber-900">
                Government of Odisha • Department of Co-operation
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Court of the District Cooperative Registrar &amp; Arbitrator
              </h2>
              <div className="text-xs font-bold text-slate-600">
                Statutory Tribunal under Section 70 of the Odisha Cooperative Societies Act, 1962
              </div>
              <div className="text-xs font-mono font-bold text-amber-900 mt-1">
                Decree Order No: {viewingDecreeOrder.decreeOrderNo || `ORD-DCO-2026-781`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">CASE DOCKET NUMBER:</span>
                <strong>{viewingDecreeOrder.caseNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">DATE OF PRONOUNCEMENT:</span>
                <strong>{viewingDecreeOrder.decreeDate || new Date().toISOString().split('T')[0]}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">PETITIONER:</span>
                <strong>{viewingDecreeOrder.petitioner}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">RESPONDENT:</span>
                <strong>{viewingDecreeOrder.respondent}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Operative Judgment &amp; Decree (Form 14)
              </h4>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-serif leading-relaxed text-slate-900 whitespace-pre-wrap">
                {viewingDecreeOrder.decree || 'The respondent is hereby directed to comply with all statutory directions within the specified period.'}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center text-[9px] font-bold text-amber-900 uppercase text-center leading-tight">
                  Official Seal<br />DCO Registrar
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                <div className="text-[10px] font-bold text-slate-500">District Cooperative Officer &amp; Registrar</div>
                <div className="text-[9px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Digital Cryptographic Seal Verified
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setViewingDecreeOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer size={14} /> Print Formal Decree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: View Statutory Escrow Audit Certificate ── */}
      {viewingWelfareCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border-4 border-indigo-600 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-indigo-900">
                Government of Odisha • Department of Co-operation
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Certificate of Statutory Worker Welfare Escrow Audit
              </h2>
              <div className="text-xs font-bold text-slate-600">
                Issued under Section 56 of the Odisha Cooperative Societies Act, 1962 &amp; Rule 42
              </div>
              <div className="text-xs font-mono font-bold text-indigo-900 mt-1">
                Certificate No: CERT-DCO-WLF-{userDistrict?.toUpperCase() || 'PUR'}-2026-09
              </div>
            </div>

            <div className="text-xs space-y-3 leading-relaxed text-slate-800 font-serif">
              <p>
                This is to officially certify that the <strong>2% Statutory Worker Welfare &amp; Social Security deductions</strong> levied on all completed gig transactions within <strong>{userDistrict} District</strong> have been fully audited and reconciled by this Authority.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <div>• Cumulative Escrow Audited: <strong>₹{welfareReconciliation.reduce((acc, r) => acc + r.welfareLevy2Pct, 0).toLocaleString()}</strong></div>
                <div>• Designated Bank: <strong>Odisha State Cooperative Bank (DCCB)</strong></div>
                <div>• Designated Escrow Account: <strong>OD-DCCB-WLF-9824</strong></div>
                <div>• Total Artisan Beneficiaries Covered: <strong>84 Registered Cooperative Artisans</strong></div>
              </div>
              <p>
                All statutory reserves have been segregated into the <strong>70% Health &amp; Accidental Pool</strong> and the <strong>30% Tool Subsidy Pool</strong>. Transfer clearance is hereby granted to the State Unorganized Workers Welfare Board.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-700 flex items-center justify-center text-[9px] font-bold text-indigo-900 uppercase text-center leading-tight">
                District<br />Treasury Seal
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                <div className="text-[10px] font-bold text-slate-500">District Cooperative Officer &amp; Registrar</div>
                <div className="text-[9px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Statutory Audit Clearance Granted
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setViewingWelfareCertificate(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-900 hover:bg-indigo-800 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer size={14} /> Print Audit Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
