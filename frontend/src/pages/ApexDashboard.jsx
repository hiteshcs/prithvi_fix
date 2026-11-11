import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CivicLoader from '../components/CivicLoader';
import {
  Building2, Users, Landmark, Briefcase, Compass, Wrench, Layers,
  GraduationCap, DollarSign, ShieldCheck, CheckCircle2, AlertTriangle,
  Clock, ArrowRight, Plus, RefreshCw, Filter, Sparkles, MapPin,
  TrendingUp, Truck, Package, ShieldAlert, Award, FileText, Check,
  Tag, Edit3, Trash2, IndianRupee, ToggleLeft, ToggleRight, X, Settings
} from 'lucide-react';

export default function ApexDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'overview' | 'mobility' | 'procurement' | 'treasury'
  const activeTab = searchParams.get('tab') || 'overview';
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data States
  const [adminData, setAdminData] = useState(null);
  const [treasurerData, setTreasurerData] = useState(null);
  const [federationsList, setFederationsList] = useState([]);
  const [demandForecast, setDemandForecast] = useState(null);
  const [workforceAllocation, setWorkforceAllocation] = useState(null);

  // Mutual Aid State
  const [showMobilityModal, setShowMobilityModal] = useState(false);
  const [mobilityForm, setMobilityForm] = useState({
    trade: 'Electrical Guild Squad',
    fromSociety: 'West Khordha Regional Artisan & Maintenance Federation',
    toSociety: 'Cuttack Metro Municipal Central Labour Federation',
    artisanCount: 15,
    dailyBatta: 250,
    durationWeeks: 3,
    siteSupervisor: 'Shri Arun Kumar Pattnaik (State Apex Coordinator)',
    notes: 'Inter-district emergency workforce rebalancing authorized under NLCF cooperative protocol.'
  });
  const [deployments, setDeployments] = useState([
    {
      id: 'MOB-2026-088',
      trade: 'Substation Wiring & Emergency Restorations',
      fromSociety: 'Central Bhubaneswar Regional Labour Cooperative',
      toSociety: 'Cuttack Metro Municipal Central Labour Federation',
      artisanCount: 18,
      dailyBatta: 250,
      durationWeeks: 4,
      startDate: '2026-08-28',
      status: 'IN_FIELD',
      siteSupervisor: 'Shri Debasish Barik (Apex Supervisor)',
      notes: 'Urban commercial cluster power grid reinforcement across Badambadi junction.'
    },
    {
      id: 'MOB-2026-089',
      trade: 'Waterproofing & Corrosion-Resistant Masonry',
      fromSociety: 'Jagannath Coastal Construction Federation (Puri)',
      toSociety: 'Bhubaneswar Smart City Heritage Division',
      artisanCount: 12,
      dailyBatta: 200,
      durationWeeks: 2,
      startDate: '2026-09-02',
      status: 'TRANSIT',
      siteSupervisor: 'Smt. Minati Pradhan (Puri Zonal Coordinator)',
      notes: 'Monsoon protection and drainage repairs for heritage corridors.'
    }
  ]);

  // Bulk Procurement State
  const [procurementItems, setProcurementItems] = useState([
    { id: 1, name: 'Heavy-Duty Copper Wiring Rolls (90m, 2.5 sq mm)', brand: 'Finolex / Polycab', mrp: 3850, coopPrice: 2890, minOrder: 50, stock: 'AVAILABLE' },
    { id: 2, name: 'CPVC Pressure Pipe Bundles (Class 1, 1-inch)', brand: 'Astral / Ashirvad', mrp: 2400, coopPrice: 1750, minOrder: 40, stock: 'AVAILABLE' },
    { id: 3, name: 'Anti-Corrosive Exterior Weather Shield (20L Drum)', brand: 'Asian Paints Apex', mrp: 7200, coopPrice: 5350, minOrder: 20, stock: 'AVAILABLE' },
    { id: 4, name: 'Industrial Safety Helmet & Harness Combo (ISI Mark)', brand: 'Karam Safety', mrp: 1850, coopPrice: 1100, minOrder: 100, stock: 'AVAILABLE' },
  ]);
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [selectedIndentItem, setSelectedIndentItem] = useState(null);
  const [indentForm, setIndentForm] = useState({ quantity: 50, destinationDistrict: 'Khordha' });

  // Add New Cooperative Federation State (Apex Authority)
  const [showAddFedModal, setShowAddFedModal] = useState(false);
  const [addingFed, setAddingFed] = useState(false);
  const [addFedForm, setAddFedForm] = useState({
    name: '',
    district: 'Khordha',
    city: 'Bhubaneswar',
    address: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    local_area: '',
    jurisdiction_zone: '',
    capital_reserve: 500000,
    cooperative_bank_name: 'District Central Cooperative Bank',
    bank_account_no: '',
    bank_ifsc: 'OSCB0001001',
  });

  // District Registry State (Apex Operational Coverage)
  const [districtsList, setDistrictsList] = useState([]);
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [addingDistrict, setAddingDistrict] = useState(false);
  const [togglingDistrictId, setTogglingDistrictId] = useState(null);
  const [addDistrictForm, setAddDistrictForm] = useState({
    name: '',
    state: 'Odisha',
    headquarters: '',
    regional_zone: 'Central Odisha',
    dco_office_name: '',
    dco_officer_name: '',
    nodal_phone: '',
    nodal_email: '',
    is_portal_active: 1,
  });

  // ── Tariff & Catalog Administration State (Federation Head) ──
  const TRADE_CATEGORIES = ['Appliance Repair', 'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Cleaning', 'Gardening', 'Caregiving', 'Driving'];
  const PRICE_UNITS = ['per_visit', 'per_hour', 'per_sqft', 'per_day'];
  const [catalogTab, setCatalogTab] = useState('services'); // 'services' | 'parts'
  const [catalogLoading, setCatalogLoading] = useState(false);
  // Services
  const [adminServices, setAdminServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', category: 'Electrical', description: '', base_price: '', price_unit: 'per_visit', icon: '🔧', is_complex: false });
  const [savingService, setSavingService] = useState(false);
  // Parts
  const [adminParts, setAdminParts] = useState([]);
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [partForm, setPartForm] = useState({ trade_category: 'Electrical', part_name: '', standard_price: '', unit: 'piece', warranty_months: 6 });
  const [savingPart, setSavingPart] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');

  const loadCatalogData = async () => {
    setCatalogLoading(true);
    try {
      const [svcRes, partsRes] = await Promise.all([
        api.getAllServicesAdmin().catch(() => ({ services: [] })),
        api.getPartsCatalog().catch(() => ({ parts: [] })),
      ]);
      setAdminServices(svcRes.services || []);
      setAdminParts(partsRes.parts || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadApexData = async () => {
    setLoading(true);
    setError('');
    try {
      const [adminRes, treasRes, fedOverviewRes, forecastRes, allocRes, distRes] = await Promise.all([
        api.getFederationAdminDashboard('apex').catch(() => null),
        api.getFederationTreasurerDashboard('apex').catch(() => null),
        api.getFederationsOverview().catch(() => null),
        api.getDemandForecast().catch(() => null),
        api.getWorkforceAllocation().catch(() => null),
        api.getDistricts().catch(() => null),
      ]);

      if (adminRes?.success) setAdminData(adminRes.data);
      if (treasRes?.success) setTreasurerData(treasRes.data);
      if (fedOverviewRes?.federations) setFederationsList(fedOverviewRes.federations);
      if (forecastRes) setDemandForecast(forecastRes);
      if (allocRes) setWorkforceAllocation(allocRes);
      if (distRes?.success && distRes.districts) setDistrictsList(distRes.districts);
    } catch (err) {
      console.error('Failed to load Apex Dashboard data:', err);
      setError(err.message || 'Failed to connect to Apex Federation Node.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApexData();
  }, []);

  // Load catalog data when tariff tab is opened
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadCatalogData();
    }
  }, [activeTab]);

  // ── Service CRUD Handlers ──
  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', category: 'Electrical', description: '', base_price: '', price_unit: 'per_visit', icon: '🔧', is_complex: false });
    setShowServiceModal(true);
  };
  const openEditService = (svc) => {
    setEditingService(svc);
    setServiceForm({ name: svc.name, category: svc.category, description: svc.description || '', base_price: String(svc.base_price), price_unit: svc.price_unit, icon: svc.icon || '🔧', is_complex: !!svc.is_complex });
    setShowServiceModal(true);
  };
  const handleSaveService = async (e) => {
    e.preventDefault();
    setSavingService(true);
    try {
      const payload = { ...serviceForm, base_price: parseFloat(serviceForm.base_price) };
      const res = editingService ? await api.updateService(editingService.id, payload) : await api.createService(payload);
      if (res.success) {
        setShowServiceModal(false);
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 6000);
        loadCatalogData();
      }
    } catch (err) {
      setError(err.message || 'Failed to save service.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setSavingService(false);
    }
  };
  const handleToggleService = async (svc) => {
    try {
      const res = await api.updateService(svc.id, { is_active: svc.is_active ? 0 : 1 });
      if (res.success) {
        setAdminServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: svc.is_active ? 0 : 1 } : s));
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle service.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // ── Parts CRUD Handlers ──
  const openAddPart = () => {
    setEditingPart(null);
    setPartForm({ trade_category: 'Electrical', part_name: '', standard_price: '', unit: 'piece', warranty_months: 6 });
    setShowPartModal(true);
  };
  const openEditPart = (part) => {
    setEditingPart(part);
    setPartForm({ trade_category: part.trade_category, part_name: part.part_name, standard_price: String(part.standard_price), unit: part.unit, warranty_months: part.warranty_months });
    setShowPartModal(true);
  };
  const handleSavePart = async (e) => {
    e.preventDefault();
    setSavingPart(true);
    try {
      const payload = { ...partForm, standard_price: parseFloat(partForm.standard_price) };
      const res = editingPart ? await api.updatePart(editingPart.id, payload) : await api.createPart(payload);
      if (res.success) {
        setShowPartModal(false);
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 6000);
        loadCatalogData();
      }
    } catch (err) {
      setError(err.message || 'Failed to save part.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setSavingPart(false);
    }
  };
  const handleDeletePart = async (id) => {
    if (!window.confirm('Remove this part from the locked price matrix? This cannot be undone.')) return;
    try {
      const res = await api.deletePart(id);
      if (res.success) {
        setAdminParts(prev => prev.filter(p => p.id !== id));
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete part.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCreateDistrict = async (e) => {
    e.preventDefault();
    if (!addDistrictForm.name.trim()) return;
    setAddingDistrict(true);
    try {
      const res = await api.createDistrict(addDistrictForm);
      if (res.success) {
        setShowAddDistrictModal(false);
        setSuccessMsg(res.message || `District ${addDistrictForm.name} registered and activated on the platform!`);
        setAddDistrictForm({
          name: '',
          state: 'Odisha',
          headquarters: '',
          regional_zone: 'Central Odisha',
          dco_office_name: '',
          dco_officer_name: '',
          nodal_phone: '',
          nodal_email: '',
          is_portal_active: 1,
        });
        loadApexData();
        setTimeout(() => setSuccessMsg(''), 7000);
      }
    } catch (err) {
      console.error('Failed to register district:', err);
      setError(err.message || 'Failed to register operational district.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setAddingDistrict(false);
    }
  };

  const handleToggleDistrict = async (districtId, currentActiveStatus) => {
    const nextStatus = currentActiveStatus ? 0 : 1;
    setTogglingDistrictId(districtId);
    try {
      const res = await api.toggleDistrictPortal(districtId, { is_portal_active: nextStatus });
      if (res.success) {
        setDistrictsList((prev) =>
          prev.map((d) => (d.id === districtId ? { ...d, is_portal_active: nextStatus } : d))
        );
        setSuccessMsg(`Operational status for district updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to toggle district portal coverage:', err);
      setError(err.message || 'Failed to update district portal availability.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setTogglingDistrictId(null);
    }
  };

  const handleCreateMobilityOrder = (e) => {
    e.preventDefault();
    const newId = `MOB-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: newId,
      trade: mobilityForm.trade,
      fromSociety: mobilityForm.fromSociety,
      toSociety: mobilityForm.toSociety,
      artisanCount: Number(mobilityForm.artisanCount),
      dailyBatta: Number(mobilityForm.dailyBatta),
      durationWeeks: Number(mobilityForm.durationWeeks),
      startDate: new Date().toISOString().split('T')[0],
      status: 'TRANSIT',
      siteSupervisor: mobilityForm.siteSupervisor,
      notes: mobilityForm.notes
    };
    setDeployments([newOrder, ...deployments]);
    setShowMobilityModal(false);
    setSuccessMsg(`Inter-District Transfer Order ${newId} authorized successfully. 15 artisans deployed to destination federation.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleOrderIndent = (e) => {
    e.preventDefault();
    setShowIndentModal(false);
    setSuccessMsg(`Central Bulk Procurement Indent placed for ${indentForm.quantity} units of ${selectedIndentItem?.name}. Dispatched to ${indentForm.destinationDistrict} Central Depot.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleCreateFederation = async (e) => {
    e.preventDefault();
    if (!addFedForm.name.trim()) return;
    setAddingFed(true);
    try {
      const res = await api.createFederation(addFedForm);
      if (res.success) {
        setShowAddFedModal(false);
        setSuccessMsg(res.message || `Regional Cooperative Federation "${addFedForm.name}" registered and activated across the platform!`);
        // Reset form
        setAddFedForm({
          name: '',
          district: 'Khordha',
          city: 'Bhubaneswar',
          address: '',
          contact_phone: '',
          contact_email: '',
          description: '',
          local_area: '',
          jurisdiction_zone: '',
          capital_reserve: 500000,
          cooperative_bank_name: 'District Central Cooperative Bank',
          bank_account_no: '',
          bank_ifsc: 'OSCB0001001',
        });
        loadApexData();
        setTimeout(() => setSuccessMsg(''), 7000);
      }
    } catch (err) {
      console.error('Failed to register cooperative federation:', err);
      setError(err.message || 'Failed to register cooperative federation.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setAddingFed(false);
    }
  };

  if (loading) {
    return (
      <CivicLoader
        variant="fullscreen"
        title="Connecting to State Apex Federation Console..."
        subtitle="Loading statewide federation nodes, tenders, and inter-district telemetry."
      />
    );
  }

  const kpis = treasurerData?.kpis || {};
  const totalWorkers = adminData?.slide1_workforce?.totalWorkers || 84;
  const filteredFederations = federationsList.filter(
    (f) => districtFilter === 'ALL' || f.district.toLowerCase() === districtFilter.toLowerCase()
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-6 px-4">
      {/* ─────────────────────────────────────────────────────────────
          1. APEX FEDERATION HEAD STATEWIDE BANNER (EXECUTIVE GRADE)
         ───────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #07152B 0%, #0c1e3d 40%, #112952 100%)' }}
      >
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Institutional Header: Badges & Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs tracking-wide">
              <Landmark size={14} />
              <span>State Apex Federation Head Console</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>NLCF Accredited Apex Authority</span>
            </span>
            <span className="text-[11px] text-slate-300 font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              SEC-62 OCS ACT 1962
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3 Districts Operational</span>
            </span>
            <button
              onClick={loadApexData}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Refresh Statewide Telemetry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-amber-400' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Presiding Officer Details */}
        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-snug">
            Odisha State Labour Cooperative Federation <span className="text-amber-400">(Apex)</span>
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs sm:text-sm text-slate-300">
            <span>Presiding Officer: <strong className="text-white font-bold">{user?.name || 'Shri Arun Kumar Pattnaik'}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Apex Federation Head &amp; Secretary</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Statutory Governance across <strong className="text-amber-300 font-semibold">Khordha, Cuttack &amp; Puri</strong></span>
          </div>
        </div>

        {/* Cohesive Executive Action Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
            <Sparkles size={14} className="text-amber-400" />
            <span>Statewide Directives &amp; Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddDistrictModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1.5 shadow-md hover:shadow-amber-400/20 cursor-pointer active:scale-95"
            >
              <MapPin size={14} />
              <span>+ Expand to New District</span>
            </button>

            <button
              onClick={() => setShowAddFedModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>Register Regional Cooperative</span>
            </button>

            <button
              onClick={() => setShowMobilityModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Truck size={14} className="text-amber-400" />
              <span>Authorize Mutual Aid</span>
            </button>

            <Link
              to="/federation/tenders"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-sky-200 border border-blue-400/40 hover:border-blue-400 transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Briefcase size={14} className="text-sky-300" />
              <span>State Tenders &amp; Bids</span>
            </Link>
          </div>
        </div>

        {/* 4 Statewide Pillar KPI Cards (Clean Glassmorphism) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
          <div className="p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition border border-white/15 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">1. Affiliated Workforce</span>
              <Users size={15} className="text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">{totalWorkers}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
              <Check size={12} />
              <span>100% Verified Artisans</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition border border-white/15 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">2. Regional Bodies</span>
              <Building2 size={15} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">{federationsList.length || 12} Federations</div>
            <span className="text-[11px] text-sky-300 font-semibold block">Khordha, Cuttack &amp; Puri</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition border border-white/15 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">3. State Welfare Pool (5%)</span>
              <ShieldCheck size={15} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">
              ₹{(kpis.totalWorkersWelfareFundRaised || 185000).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-amber-200 font-semibold block">ESIC &amp; Social Security</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition border border-white/15 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">4. Mobility Deployments</span>
              <Truck size={15} className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
              {deployments.length} Active Squads
            </div>
            <span className="text-[11px] text-emerald-200 font-semibold block">Inter-District Balancing</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-700 text-red-950 dark:text-red-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. APEX WORKSPACE NAVIGATION BAR (HIGH CONTRAST)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Building2 size={15} className={activeTab === 'overview' ? (activeTab === 'overview' && 'dark:text-slate-950 text-amber-400') : 'text-slate-500'} />
          <span>1. Statewide Territorial Hierarchy &amp; Audit</span>
        </button>

        <button
          onClick={() => handleTabChange('mobility')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'mobility'
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Compass size={15} className={activeTab === 'mobility' ? (activeTab === 'mobility' && 'dark:text-slate-950 text-amber-400') : 'text-slate-500'} />
          <span>2. AI Demand Forecasting &amp; Mutual Aid</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
            {deployments.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('procurement')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Package size={15} className={activeTab === 'procurement' ? (activeTab === 'procurement' && 'dark:text-slate-950 text-amber-400') : 'text-slate-500'} />
          <span>3. Wholesale Bulk Procurement</span>
        </button>

        <button
          onClick={() => handleTabChange('treasury')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'treasury'
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign size={15} className={activeTab === 'treasury' ? (activeTab === 'treasury' && 'dark:text-slate-950 text-amber-400') : 'text-slate-500'} />
          <span>4. Apex Treasury &amp; Welfare Pool</span>
        </button>

        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Tag size={15} className={activeTab === 'catalog' ? 'dark:text-slate-950 text-amber-400' : 'text-slate-500'} />
          <span>5. Tariff &amp; Catalog Admin</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: STATEWIDE TERRITORIAL HIERARCHY & SOCIETY AUDIT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4-Tier Interactive Visual Hierarchy Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                  Odisha Cooperative Societies Act 1962 • Statutory Structure
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Cooperative Governance &amp; Territorial Administration
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Decentralized hierarchy connecting District Cooperative Officers (DCO), the Apex Federation, Regional Federations, and Primary Labour Societies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 1 • Regulatory</span>
                  <Landmark size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
                <strong className="text-xs text-slate-900 dark:text-white block">District Registrar (DCO)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Government regulator. Formal statutory scrutiny, charter issuance, Section 62 audits, and dispute tribunal oversight.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  <span>Tier 2 • Apex Council</span>
                  <Building2 size={14} className="text-amber-700 dark:text-amber-400" />
                </div>
                <strong className="text-xs text-slate-950 dark:text-white block font-bold">State Apex Federation (You)</strong>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Odisha statewide council overseeing institutional tenders, inter-district mutual aid, and state welfare reserves.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 3 • Regional</span>
                  <Users size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <strong className="text-xs text-slate-900 dark:text-white block">12 Regional Federations</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  District-level hubs in Khordha, Cuttack, and Puri coordinating city-level primary societies and tool machinery banks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Tier 4 • Workforce</span>
                  <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <strong className="text-xs text-slate-900 dark:text-white block">Primary Societies &amp; Artisans</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Grassroots member-owned societies directly managing worker onboarding, daily dispatches, 93% payouts, and local tool banks.
                </p>
              </div>
            </div>
          </div>

          {/* District Scope Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Filter size={14} /> District Filter:
              </span>
              {[
                { key: 'ALL', label: 'All Districts (Statewide)' },
                ...(districtsList.length > 0
                  ? districtsList
                      .filter((d) => d.is_portal_active)
                      .map((d) => ({ key: d.name, label: d.headquarters ? `${d.name} (${d.headquarters})` : d.name }))
                  : [
                      { key: 'Khordha', label: 'Khordha (Bhubaneswar)' },
                      { key: 'Cuttack', label: 'Cuttack Metro' },
                      { key: 'Puri', label: 'Puri Coastal' },
                    ]),
              ].map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDistrictFilter(d.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    districtFilter === d.key
                      ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white">{filteredFederations.length}</strong> Regional Federation Entities
            </span>
          </div>

          {/* Regional Federations & Member Societies Cards */}
          <div className="space-y-4">
            {filteredFederations.map((fed) => {
              const societies = fed.societies || [];
              return (
                <div key={fed.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {fed.district} District
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{fed.registration_number}</span>
                        {fed.dco_approval_status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={11} /> DCO Certified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Clock size={11} /> DCO Audit Pending
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 size={18} className="text-blue-700 dark:text-sky-400" />
                        <span>{fed.name}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        📍 {fed.address} • 📞 {fed.contact_phone || '0674-2540001'} • ✉️ {fed.contact_email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Capital Reserve</span>
                        <strong className="text-sm font-mono text-slate-900 dark:text-white">
                          ₹{(fed.capital_reserve || 500000).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Affiliated Societies</span>
                        <strong className="text-sm font-mono text-emerald-700 dark:text-emerald-400">{societies.length} Societies</strong>
                      </div>
                    </div>
                  </div>

                  {societies.length > 0 && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        Constituent Primary Societies under this Federation:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {societies.map((soc) => (
                          <div key={soc.id} className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                            <strong className="text-slate-900 dark:text-white font-bold block">{soc.name}</strong>
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                              <span>Workers: {soc.total_workers_count || 12}</span>
                              <span className={`font-semibold ${soc.status === 'ACTIVE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                {soc.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* District Operational Coverage & Portal Availability Registry */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Statutory Operational Territorial Registry
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-amber-600 dark:text-amber-400" />
                  <span>District Portal Availability &amp; Regulatory Jurisdiction</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Districts authorized by the Apex Body where citizen service booking, worker onboarding, and primary cooperatives can operate.
                </p>
              </div>

              <button
                onClick={() => setShowAddDistrictModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Register New District</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-3">District &amp; State</th>
                    <th className="p-3">Regional Zone</th>
                    <th className="p-3">DCO Office &amp; Officer</th>
                    <th className="p-3">Nodal Contact</th>
                    <th className="p-3">Portal Coverage</th>
                    <th className="p-3 text-right">Apex Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {districtsList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">HQ: {d.headquarters || d.name} • {d.state}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {d.regional_zone || 'Central Zone'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-white">{d.dco_office_name || `DCO Office, ${d.name}`}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{d.dco_officer_name || 'District Cooperative Officer'}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        <div>📞 {d.nodal_phone || '1800-345-7788'}</div>
                        <div>✉️ {d.nodal_email || `dco.${d.name.toLowerCase()}@coop.od.in`}</div>
                      </td>
                      <td className="p-3">
                        {d.is_portal_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 size={12} /> Active on Portal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            <Clock size={12} /> Offline / Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          disabled={togglingDistrictId === d.id}
                          onClick={() => handleToggleDistrict(d.id, d.is_portal_active)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer disabled:opacity-50 ${
                            d.is_portal_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {togglingDistrictId === d.id
                            ? 'Updating...'
                            : d.is_portal_active
                            ? 'Deactivate Portal'
                            : 'Activate Portal'}
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
          TAB 2: AI DEMAND FORECASTING & INTER-DISTRICT MUTUAL AID
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'mobility' && (
        <div className="space-y-6">
          <div
            className="text-white p-6 rounded-3xl border border-blue-900 space-y-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0A1B3A 0%, #0F2A55 50%, #152A55 100%)', color: '#ffffff' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    AI Community Demand Forecasting &amp; Labor Mobility Engine
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Statewide Inter-District Workforce Balancing
                </h2>
                <p className="text-xs text-slate-200 mt-0.5 max-w-3xl">
                  Predictive algorithms analyze seasonal construction peaks, monsoon weather repairs, and institutional surges to prevent regional labor shortages.
                </p>
              </div>

              <button
                onClick={() => setShowMobilityModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Authorize New Dispatch Order</span>
              </button>
            </div>
          </div>

          {/* Active Deployments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck size={17} className="text-blue-700 dark:text-sky-400" />
                <span>Active Inter-District Workforce Deployments</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {deployments.length} Active Dispatch Squads
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Trade / Guild</th>
                    <th className="p-3.5">From Origin</th>
                    <th className="p-3.5">To Destination</th>
                    <th className="p-3.5">Artisans</th>
                    <th className="p-3.5">Daily Batta</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {deployments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 font-mono font-bold text-blue-900 dark:text-sky-300">{d.id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{d.trade}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{d.fromSociety}</td>
                      <td className="p-3.5 text-slate-900 dark:text-white font-bold">{d.toSociety}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold font-mono">
                          {d.artisanCount} workers
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">₹{d.dailyBatta}/day</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          d.status === 'IN_FIELD' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {d.status}
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
          TAB 3: WHOLESALE BULK PROCUREMENT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                Centralized Cooperative Supply Chain
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Statewide Wholesale Materials &amp; Tools Procurement
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Bulk institutional purchasing directly from verified manufacturers at 25% to 40% discount below retail MRP, distributed to district cooperative depots.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {procurementItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.brand}</span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{item.name}</h4>
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">₹{item.coopPrice}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-mono">₹{item.mrp}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Save {Math.round(((item.mrp - item.coopPrice) / item.mrp) * 100)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Min Batch: {item.minOrder} units</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedIndentItem(item);
                    setShowIndentModal(true);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Package size={14} />
                  <span>Issue Bulk Indent</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: APEX TREASURY & WELFARE POOL
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'treasury' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[11px] font-bold text-blue-900 dark:text-sky-300 uppercase tracking-wider">Apex Treasury Balance</span>
              <div className="text-2xl font-black text-blue-950 dark:text-white font-mono">
                ₹{(kpis.totalAmountInAccount || 5000000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">Apex State Cooperative Bank, Bhubaneswar</p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">State Welfare Pool (5% Levy)</span>
              <div className="text-2xl font-black text-amber-950 dark:text-amber-200 font-mono">
                ₹{(kpis.totalWorkersWelfareFundRaised || 185000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Ring-fenced for ESIC, PF &amp; Arogya Cards</p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Platform Maintenance (2%)</span>
              <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 font-mono">
                ₹{(kpis.revenuesThrough2PercentFees || 74000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Platform server upkeep &amp; telecom costs</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={17} className="text-blue-700 dark:text-sky-400" />
                <span>Statewide Consolidated Treasury Ledger</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audited under OCS Act Section 62</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Txn ID</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {(treasurerData?.ledger || []).slice(0, 8).map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 font-mono font-bold text-blue-900 dark:text-sky-300">TXN-OD-{txn.id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{txn.description || 'Statutory Cooperative Levy Allocation'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700">
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        +₹{parseFloat(txn.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        ₹{parseFloat(txn.balance_after || 833400).toLocaleString('en-IN')}
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
          TAB 5: TARIFF & CATALOG ADMINISTRATION (FEDERATION HEAD)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-700">
                  🏛️ Statutory Tariff Authority — Sec. 62 OCS Act 1962
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Tariff &amp; Catalog Administration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exclusively managed by the <strong className="text-amber-600 dark:text-amber-400">Apex Federation Head</strong>.
                  Set and regulate statutory service base prices and the locked ISI spare parts price matrix.
                </p>
              </div>
              <button
                onClick={loadCatalogData}
                disabled={catalogLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw size={13} className={catalogLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Sub-tab switcher: Services | Parts */}
            <div className="mt-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-0">
              <button
                onClick={() => setCatalogTab('services')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px cursor-pointer ${
                  catalogTab === 'services'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Settings size={13} className="inline mr-1.5" />
                Services ({adminServices.length})
              </button>
              <button
                onClick={() => setCatalogTab('parts')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px cursor-pointer ${
                  catalogTab === 'parts'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Package size={13} className="inline mr-1.5" />
                Parts Catalog ({adminParts.length})
              </button>
            </div>
          </div>

          {/* ── SERVICES MANAGEMENT ── */}
          {catalogTab === 'services' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings size={16} className="text-amber-500" />
                    Service Tariff Matrix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Set regulated base prices. Area multipliers (±2–6%) are auto-applied per cooperative zone.
                  </p>
                </div>
                <button
                  onClick={openAddService}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  Add New Service
                </button>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name or category..."
                  value={catalogFilter}
                  onChange={e => setCatalogFilter(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {catalogLoading ? (
                <div className="text-center py-8 text-slate-400 text-xs">Loading services...</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {adminServices
                    .filter(s => !catalogFilter || s.name.toLowerCase().includes(catalogFilter.toLowerCase()) || s.category.toLowerCase().includes(catalogFilter.toLowerCase()))
                    .map(svc => (
                    <div
                      key={svc.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                        svc.is_active ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-60'
                      }`}
                    >
                      <span className="text-lg shrink-0">{svc.icon || '🔧'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{svc.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">{svc.category}</span>
                          {!svc.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 font-semibold">Inactive</span>}
                          {svc.is_complex ? <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">Complex</span> : null}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <IndianRupee size={11} className="text-emerald-500 shrink-0" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{svc.base_price?.toLocaleString('en-IN')}</span>
                          <span className="text-slate-400">/ {svc.price_unit?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleService(svc)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${svc.is_active ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          title={svc.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {svc.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEditService(svc)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {adminServices.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">No services found. Click "Add New Service" to get started.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PARTS CATALOG MANAGEMENT ── */}
          {catalogTab === 'parts' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package size={16} className="text-amber-500" />
                    Locked ISI Parts Price Matrix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Statutory locked prices for ISI-approved spare parts. Workers must use these prices when billing customers.
                  </p>
                </div>
                <button
                  onClick={openAddPart}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  Add Part to Matrix
                </button>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by part name or trade category..."
                  value={catalogFilter}
                  onChange={e => setCatalogFilter(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {catalogLoading ? (
                <div className="text-center py-8 text-slate-400 text-xs">Loading parts catalog...</div>
              ) : adminParts.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Package size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Parts catalog is empty</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Add ISI-approved spare parts to create the locked statutory price matrix for all cooperatives.</p>
                  <button
                    onClick={openAddPart}
                    className="mx-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    Add First Part
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {adminParts
                    .filter(p => !catalogFilter || p.part_name.toLowerCase().includes(catalogFilter.toLowerCase()) || p.trade_category.toLowerCase().includes(catalogFilter.toLowerCase()))
                    .map(part => (
                    <div key={part.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 transition hover:border-amber-300 dark:hover:border-amber-700">
                      <Package size={16} className="text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{part.part_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">{part.trade_category}</span>
                          {part.warranty_months > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">{part.warranty_months}m warranty</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{part.standard_price?.toLocaleString('en-IN')}</span>
                          <span className="text-slate-400">per {part.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openEditPart(part)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
                          title="Edit price"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                          title="Remove from matrix"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SERVICE FORM MODAL ── */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings size={18} className="text-amber-500" />
                {editingService ? 'Edit Service Tariff' : 'Add New Service'}
              </h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. AC Servicing & Gas Refill"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Category *</label>
                  <select
                    value={serviceForm.category}
                    onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {TRADE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={serviceForm.icon}
                    onChange={e => setServiceForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="🔧"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={serviceForm.base_price}
                    onChange={e => setServiceForm(f => ({ ...f, base_price: e.target.value }))}
                    placeholder="e.g. 499"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Price Unit</label>
                  <select
                    value={serviceForm.price_unit}
                    onChange={e => setServiceForm(f => ({ ...f, price_unit: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {PRICE_UNITS.map(u => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={serviceForm.description}
                    onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the service..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_complex"
                    checked={serviceForm.is_complex}
                    onChange={e => setServiceForm(f => ({ ...f, is_complex: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="is_complex" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    Complex Service (requires senior artisan or multi-day job)
                  </label>
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingService ? <><span className="w-3 h-3 rounded-full bg-slate-950 animate-ping"></span><span>Saving...</span></> : <><CheckCircle2 size={14} /><span>{editingService ? 'Update Service' : 'Add Service'}</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PART FORM MODAL ── */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package size={18} className="text-amber-500" />
                {editingPart ? 'Edit Part Price' : 'Add Part to Matrix'}
              </h3>
              <button onClick={() => setShowPartModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePart} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Trade Category *</label>
                  <select
                    value={partForm.trade_category}
                    onChange={e => setPartForm(f => ({ ...f, trade_category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {TRADE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={partForm.unit}
                    onChange={e => setPartForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="piece / set / metre / kg"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Part Name *</label>
                  <input
                    type="text"
                    required
                    value={partForm.part_name}
                    onChange={e => setPartForm(f => ({ ...f, part_name: e.target.value }))}
                    placeholder="e.g. Capacitor 35μF (ISI Mark)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Standard Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={partForm.standard_price}
                    onChange={e => setPartForm(f => ({ ...f, standard_price: e.target.value }))}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Warranty (months)</label>
                  <input
                    type="number"
                    min="0"
                    value={partForm.warranty_months}
                    onChange={e => setPartForm(f => ({ ...f, warranty_months: e.target.value }))}
                    placeholder="6"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowPartModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={savingPart}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingPart ? <><span className="w-3 h-3 rounded-full bg-slate-950 animate-ping"></span><span>Saving...</span></> : <><CheckCircle2 size={14} /><span>{editingPart ? 'Update Part' : 'Add to Matrix'}</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: AUTHORIZE INTER-DISTRICT MUTUAL AID
         ───────────────────────────────────────────────────────────── */}
      {showMobilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck size={18} className="text-amber-600 dark:text-amber-400" />
                <span>Authorize Inter-District Mutual Aid Transfer</span>
              </h3>
              <button onClick={() => setShowMobilityModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateMobilityOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Trade / Specialized Guild</label>
                <input
                  type="text"
                  required
                  value={mobilityForm.trade}
                  onChange={(e) => setMobilityForm({ ...mobilityForm, trade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">From Origin Federation</label>
                  <select
                    value={mobilityForm.fromSociety}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, fromSociety: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option>West Khordha Regional Artisan Federation</option>
                    <option>Jagannath Coastal Construction Federation (Puri)</option>
                    <option>Cuttack Mahanadi Repair Guild</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">To Destination Federation</label>
                  <select
                    value={mobilityForm.toSociety}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, toSociety: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option>Cuttack Metro Municipal Central Labour Federation</option>
                    <option>Central Bhubaneswar Regional Labour Federation</option>
                    <option>Puri Coastal Hospitality Samiti</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Artisans Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mobilityForm.artisanCount}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, artisanCount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Daily Transit Batta (₹)</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={mobilityForm.dailyBatta}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, dailyBatta: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMobilityModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-sm transition cursor-pointer"
                >
                  Confirm &amp; Issue Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ISSUE BULK PROCUREMENT INDENT
         ───────────────────────────────────────────────────────────── */}
      {showIndentModal && selectedIndentItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package size={18} className="text-blue-900 dark:text-sky-400" />
                <span>Issue Central Bulk Indent</span>
              </h3>
              <button onClick={() => setShowIndentModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleOrderIndent} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-slate-900 dark:text-white block font-bold">{selectedIndentItem.name}</strong>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-mono">
                  <span>Cooperative Price: ₹{selectedIndentItem.coopPrice}</span>
                  <span className="line-through text-slate-400 dark:text-slate-500">MRP: ₹{selectedIndentItem.mrp}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Batch Order Quantity (Units)</label>
                <input
                  type="number"
                  min={selectedIndentItem.minOrder}
                  required
                  value={indentForm.quantity}
                  onChange={(e) => setIndentForm({ ...indentForm, quantity: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Destination Central Depot</label>
                <select
                  value={indentForm.destinationDistrict}
                  onChange={(e) => setIndentForm({ ...indentForm, destinationDistrict: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Khordha">Khordha Central Warehouse, Saheed Nagar</option>
                  <option value="Cuttack">Cuttack Metro Depot, Badambadi</option>
                  <option value="Puri">Puri Coastal Logistics Depot, VIP Road</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex justify-between font-bold">
                <span>Total Requisition Value:</span>
                <span className="font-mono text-sm">
                  ₹{(selectedIndentItem.coopPrice * indentForm.quantity).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIndentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 font-bold shadow-sm transition cursor-pointer"
                >
                  Confirm Indent Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REGISTER NEW REGIONAL COOPERATIVE FEDERATION MODAL (APEX EXCLUSIVE) ── */}
      {showAddFedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Apex Statutory Authority
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Building2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Register New Regional Cooperative Federation</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddFedModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              As the <strong>Apex Body</strong>, registering a regional cooperative federation immediately makes it available across all 30 districts for grassroots primary societies to affiliate with during their legal formation charter.
            </p>

            <form onSubmit={handleCreateFederation} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Federation Official Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahanadi Regional Labour Cooperative Federation"
                  value={addFedForm.name}
                  onChange={(e) => setAddFedForm({ ...addFedForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    District Jurisdiction *
                  </label>
                  <select
                    value={addFedForm.district}
                    onChange={(e) => setAddFedForm({ ...addFedForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {districtsList.length > 0 ? (
                      districtsList
                        .filter((d) => d.is_portal_active)
                        .map((d) => (
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Headquarters City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cuttack"
                    value={addFedForm.city}
                    onChange={(e) => setAddFedForm({ ...addFedForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0671-2316700"
                    value={addFedForm.contact_phone}
                    onChange={(e) => setAddFedForm({ ...addFedForm, contact_phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. secretariat@cuttack.coop.od.in"
                    value={addFedForm.contact_email}
                    onChange={(e) => setAddFedForm({ ...addFedForm, contact_email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Registered Regional Headquarters Address
                </label>
                <input
                  type="text"
                  placeholder="Plot/Ward number, Main Road, Cooperative Bhavan"
                  value={addFedForm.address}
                  onChange={(e) => setAddFedForm({ ...addFedForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Local Wards / Operational Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Urban Wards 1-25 & Silk Craft Clusters"
                    value={addFedForm.local_area}
                    onChange={(e) => setAddFedForm({ ...addFedForm, local_area: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Statutory Capital Reserve (₹)
                  </label>
                  <input
                    type="number"
                    value={addFedForm.capital_reserve}
                    onChange={(e) => setAddFedForm({ ...addFedForm, capital_reserve: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-950 dark:text-blue-200 text-[11px] flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Statutory code FED-[DIST]-[YEAR] will be auto-generated and notified to the District Registrar (DCO).</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddFedModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingFed}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addingFed ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                      <span>Registering Federation...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Register &amp; Notify District</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: REGISTER OPERATIONAL DISTRICT (APEX AUTHORITY)
         ───────────────────────────────────────────────────────────── */}
      {showAddDistrictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                  Apex Statutory Authority • Territorial Expansion
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Register Operational District
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authorize a new administrative district for cooperative operations, citizen bookings, and artisan registration.
                </p>
              </div>
              <button
                onClick={() => setShowAddDistrictModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDistrict} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    District Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balasore, Mayurbhanj, Bargarh"
                    value={addDistrictForm.name}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    State / UT
                  </label>
                  <input
                    type="text"
                    required
                    value={addDistrictForm.state}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    District Headquarters City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Balasore Town"
                    value={addDistrictForm.headquarters}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, headquarters: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Regional Administrative Zone
                  </label>
                  <select
                    value={addDistrictForm.regional_zone}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, regional_zone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Central Odisha">Central Odisha</option>
                    <option value="Northern Odisha">Northern Odisha</option>
                    <option value="Southern Odisha">Southern Odisha</option>
                    <option value="Western Odisha">Western Odisha</option>
                    <option value="Coastal Odisha">Coastal Odisha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    District Cooperative Officer (DCO) Office
                  </label>
                  <input
                    type="text"
                    placeholder="Office of the Assistant Registrar of Cooperative Societies"
                    value={addDistrictForm.dco_office_name}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, dco_office_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Designated DCO Officer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smt. Gayatri Mohanty, OAS (Coop)"
                    value={addDistrictForm.dco_officer_name}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, dco_officer_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    DCO Nodal Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 06782-262201"
                    value={addDistrictForm.nodal_phone}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, nodal_phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    DCO Nodal Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. dco.balasore@coop.od.in"
                    value={addDistrictForm.nodal_email}
                    onChange={(e) => setAddDistrictForm({ ...addDistrictForm, nodal_email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-950 dark:text-amber-200 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <ShieldCheck size={15} /> Automated Cooperative Provisioning Guarantee
                </div>
                <p>
                  Upon registration, this district will immediately be provisioned with its Regional Federation and Primary Labour Society seed. Workers and citizens can select this district immediately.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDistrictModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingDistrict}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addingDistrict ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-slate-950 animate-ping"></span>
                      <span>Registering District...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Register &amp; Activate District</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
