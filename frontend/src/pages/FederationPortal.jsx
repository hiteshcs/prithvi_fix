import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, ShieldAlert, DollarSign, Award, GraduationCap,
  Landmark, AlertCircle, CheckCircle2, TrendingUp, HeartHandshake,
  FileText, Plus, Search, ChevronRight, ArrowRight, ShieldCheck,
  Briefcase, Wrench, Clock, Activity, AlertTriangle, FileSpreadsheet,
  Check, Copy, ExternalLink, Shield, Info, HelpCircle, ChevronDown,
  ChevronUp, CheckSquare, Truck, Package, Layers, Sparkles,
  PhoneCall, RefreshCw, Printer, Calendar, MapPin, Hammer,
  UserCheck, Eye, Download, ShoppingBag, FileCheck
} from 'lucide-react';
import CivicLoader from '../components/CivicLoader';

export default function FederationPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab synchronized with URL search params: 'apex' | 'mobility' | 'tools' | 'procurement' | 'insurance' | 'ncct' | 'treasurer'
  const activeTab = searchParams.get('tab') || 'apex';
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Apex Admin Desk Slide: 1 = Workforce Telemetry, 2 = Disputes & Grievances, 3 = Accreditation & KYC
  const [adminSlide, setAdminSlide] = useState(1);

  // Data States
  const [adminData, setAdminData] = useState(null);
  const [treasurerData, setTreasurerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disputeSuccessMsg, setDisputeSuccessMsg] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  // Worker Register Modal under Federation (Page 2)
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [createdWorkerReceipt, setCreatedWorkerReceipt] = useState(null);
  const [showWorkerGuide, setShowWorkerGuide] = useState(true);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'demoPassword123',
    primaryTrade: 'Electrical',
    experienceYears: 3,
    district: 'Khordha',
    city: 'Bhubaneswar',
    isNcctCertified: false,
  });
  const [registeringWorker, setRegisteringWorker] = useState(false);

  // Dispute Resolution State
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  // NCCT Course Application Modal (Page 3)
  const [showNcctModal, setShowNcctModal] = useState(false);
  const [ncctFormData, setNcctFormData] = useState({
    workerName: '',
    trade: 'Electrical',
    courseName: 'Advanced Solar Inverter & Smart Grid Architecture',
    trainingType: 'TECHNICAL',
  });
  const [applyingNcct, setApplyingNcct] = useState(false);

  // -------------------------------------------------------------
  // NEW FEDERATION UNIQUE FEATURES STATE & MOCKS
  // -------------------------------------------------------------

  // 1. Inter-Society Workforce Mobility
  const [deployments, setDeployments] = useState([
    {
      id: 'MOB-2026-04',
      trade: 'Civil Masons & Tile Artisans',
      fromSociety: 'Cuttack Shramik Union',
      toSociety: 'Khordha Smart City Civic Hub',
      artisanCount: 15,
      dailyBatta: 350,
      durationWeeks: 3,
      startDate: '2026-09-10',
      status: 'IN_FIELD',
      siteSupervisor: 'Debabrata Das (Junior Engineer, BMC)',
      notes: 'Monsoon municipal drain culvert reconstruction and footpath interlocking tile laying.'
    },
    {
      id: 'MOB-2026-07',
      trade: 'Substation & High-Tension Electricians',
      fromSociety: 'Puri Jagannath Labour Samiti',
      toSociety: 'Bhubaneswar Metro Feeder Works',
      artisanCount: 8,
      dailyBatta: 420,
      durationWeeks: 2,
      startDate: '2026-09-16',
      status: 'TRANSIT',
      siteSupervisor: 'Er. R. K. Mohanty (TPCODL Executive)',
      notes: 'Transformer commissioning and feeder panel termination under NLCF state coordination.'
    },
    {
      id: 'MOB-2026-11',
      trade: 'Certified Industrial Plumbers',
      fromSociety: 'Khordha Artisan Cooperative',
      toSociety: 'Balasore Coastal Water Treatment Facility',
      artisanCount: 6,
      dailyBatta: 380,
      durationWeeks: 4,
      startDate: '2026-08-20',
      status: 'COMPLETED',
      siteSupervisor: 'P. K. Pradhan (PHED Balasore)',
      notes: 'High-density polyethylene manifold fusion and valve overhaul successfully signed off.'
    }
  ]);
  const [showMobilityModal, setShowMobilityModal] = useState(false);
  const [viewingMobilityOrder, setViewingMobilityOrder] = useState(null);
  const [mobilityForm, setMobilityForm] = useState({
    trade: 'Civil Masons & Tile Artisans',
    fromSociety: 'Cuttack Shramik Union',
    toSociety: 'Khordha Smart City Civic Hub',
    artisanCount: 10,
    dailyBatta: 350,
    durationWeeks: 2,
    siteSupervisor: '',
    notes: ''
  });

  // 2. Collective Tool & Heavy Machinery Bank
  const [machineryList, setMachineryList] = useState([
    {
      id: 'TOOL-001',
      name: 'Hilti TE 3000-AVR Heavy Demolition Breaker',
      category: 'Concrete & Demolition',
      assetValue: 185000,
      coopRentPerDay: 350,
      marketRentPerDay: 2200,
      depotLocation: 'Khordha Central Machinery Yard',
      totalUnits: 4,
      availableUnits: 2,
      status: 'AVAILABLE',
      spec: '68J impact energy, 230V, active vibration reduction for road & trench excavation.'
    },
    {
      id: 'TOOL-002',
      name: 'Ridgid 300 Compact Electric Pipe Threading Station',
      category: 'Plumbing & Gas Fitting',
      assetValue: 142000,
      coopRentPerDay: 280,
      marketRentPerDay: 1600,
      depotLocation: 'Cuttack Labour Depot',
      totalUnits: 3,
      availableUnits: 0,
      status: 'IN_USE',
      spec: 'Heavy duty universal motor, 1/8" to 2" pipe capacity with automated oiling system.'
    },
    {
      id: 'TOOL-003',
      name: 'FLIR E8-XT Pro Thermal Imaging Camera',
      category: 'Electrical & Diagnostics',
      assetValue: 245000,
      coopRentPerDay: 200,
      marketRentPerDay: 1500,
      depotLocation: 'Bhubaneswar Apex Headquarters',
      totalUnits: 6,
      availableUnits: 5,
      status: 'AVAILABLE',
      spec: '320x240 IR resolution, MSX thermal enhancement for electrical hot-spot audits.'
    },
    {
      id: 'TOOL-004',
      name: 'Bosch GLL 3-80 3-Plane 360° Multi-Laser Station',
      category: 'Civil & Interior Alignment',
      assetValue: 48000,
      coopRentPerDay: 120,
      marketRentPerDay: 850,
      depotLocation: 'Puri District Branch',
      totalUnits: 10,
      availableUnits: 7,
      status: 'AVAILABLE',
      spec: 'Simultaneous horizontal and vertical leveling with high-visibility green laser lines.'
    },
    {
      id: 'TOOL-005',
      name: 'Milwaukee MX FUEL Diamond Core Drilling Rig',
      category: 'Civil & Coring',
      assetValue: 310000,
      coopRentPerDay: 450,
      marketRentPerDay: 3500,
      depotLocation: 'Khordha Central Machinery Yard',
      totalUnits: 2,
      availableUnits: 0,
      status: 'MAINTENANCE',
      spec: 'Heavy reinforced concrete coring up to 150mm with digital clutch & water line.'
    },
    {
      id: 'TOOL-006',
      name: 'Husqvarna K770 14" Gas Powered Concrete Cutter',
      category: 'Road & Masonry Works',
      assetValue: 98000,
      coopRentPerDay: 300,
      marketRentPerDay: 1900,
      depotLocation: 'Bhubaneswar Apex Headquarters',
      totalUnits: 5,
      availableUnits: 4,
      status: 'AVAILABLE',
      spec: '5 HP engine, digital ignition, active air filtration for dry & wet cutting.'
    }
  ]);
  const [showToolLeaseModal, setShowToolLeaseModal] = useState(false);
  const [selectedToolForLease, setSelectedToolForLease] = useState(null);
  const [toolLeaseForm, setToolLeaseForm] = useState({
    artisanName: '',
    societyName: 'Shramik Kalyan Labour Cooperative Samiti',
    daysCount: 3,
    contactNumber: '',
    intendedSite: ''
  });
  const [viewingToolRelease, setViewingToolRelease] = useState(null);

  // 3. Bulk Material & Safety Gear Group Procurement
  const [catalogItems, setCatalogItems] = useState([
    {
      id: 'MAT-101',
      name: 'Havells Lifeline Plus 2.5 sq.mm FR PVC Copper Wire (90m)',
      brand: 'Havells India',
      category: 'Electrical',
      mrp: 2450,
      coopPrice: 1720,
      discountPercent: 30,
      stockPcs: 450,
      unit: 'Coil (90m)',
      coopDepot: 'Bhubaneswar Apex Depot'
    },
    {
      id: 'MAT-102',
      name: 'Supreme Class 1 CPVC Plumbing Pipe 1" (3m bundle, 5 pcs)',
      brand: 'Supreme Industries',
      category: 'Plumbing',
      mrp: 2900,
      coopPrice: 2050,
      discountPercent: 29,
      stockPcs: 320,
      unit: 'Bundle (15m total)',
      coopDepot: 'Khordha District Depot'
    },
    {
      id: 'MAT-103',
      name: 'Karam PN-56 Full Body Fall Arrest Safety Harness + Dual Lanyard',
      brand: 'Karam Safety',
      category: 'Safety Gear (PPE)',
      mrp: 1450,
      coopPrice: 890,
      discountPercent: 38,
      stockPcs: 210,
      unit: 'Kit',
      coopDepot: 'Bhubaneswar Apex Depot'
    },
    {
      id: 'MAT-104',
      name: 'Asian Paints Apex Ultima Exterior Emulsion (20L Drum)',
      brand: 'Asian Paints',
      category: 'Painting & Finishing',
      mrp: 5600,
      coopPrice: 4150,
      discountPercent: 26,
      stockPcs: 140,
      unit: 'Drum (20L)',
      coopDepot: 'Cuttack Labour Depot'
    },
    {
      id: 'MAT-105',
      name: 'Finolex 32mm SWR Drainage Fittings Assorted Pack (50 pcs)',
      brand: 'Finolex Pipes',
      category: 'Plumbing',
      mrp: 1780,
      coopPrice: 1250,
      discountPercent: 30,
      stockPcs: 95,
      unit: 'Carton (50 pcs)',
      coopDepot: 'Khordha District Depot'
    },
    {
      id: 'MAT-106',
      name: 'Karam ISI Certified High-Impact Industrial Safety Helmet (Pack of 10)',
      brand: 'Karam Safety',
      category: 'Safety Gear (PPE)',
      mrp: 2900,
      coopPrice: 1650,
      discountPercent: 43,
      stockPcs: 180,
      unit: 'Pack (10 Helmets)',
      coopDepot: 'Puri Branch Depot'
    }
  ]);
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [selectedItemForIndent, setSelectedItemForIndent] = useState(null);
  const [indentForm, setIndentForm] = useState({
    quantity: 5,
    destSociety: 'Shramik Kalyan Labour Cooperative Samiti',
    requisitionReason: 'Upcoming Municipal Substation Maintenance Work Order',
    contactPerson: 'Balaram Rout (Society Secretary)'
  });
  const [viewingIndentReceipt, setViewingIndentReceipt] = useState(null);

  // 4. Group Insurance & Emergency Relief Desk
  const [insuranceStats, setInsuranceStats] = useState({
    masterPolicyNo: 'NLCF-OD-2026-9921',
    activeArtisansCovered: 1420,
    accidentalCoverLimit: 500000,
    cashlessFamilyCover: 200000,
    claimsSettledFY: 48,
    totalDisbursedAmount: 1420000,
    emergencySanctionsPending: 2
  });
  const [claimsList, setClaimsList] = useState([
    {
      id: 'CLM-2026-88',
      workerName: 'Bijay Kumar Swain',
      workerCode: 'WRK-1044',
      incidentType: 'Scaffolding Slip & Wrist Fracture',
      treatmentHospital: 'SCB Medical College & Hospital, Cuttack',
      claimedAmount: 22500,
      immediateReliefGranted: 15000,
      status: 'SETTLED',
      date: '2026-09-04'
    },
    {
      id: 'CLM-2026-91',
      workerName: 'Niranjan Sahoo',
      workerCode: 'WRK-2089',
      incidentType: 'High Voltage Arc Burn Injury',
      treatmentHospital: 'AIIMS Bhubaneswar Emergency Burn Unit',
      claimedAmount: 45000,
      immediateReliefGranted: 25000,
      status: 'SETTLED',
      date: '2026-09-12'
    },
    {
      id: 'CLM-2026-94',
      workerName: 'Ranjan Das',
      workerCode: 'WRK-3112',
      incidentType: 'Trench Cave-in Leg Contusion',
      treatmentHospital: 'District Headquarters Hospital, Puri',
      claimedAmount: 18000,
      immediateReliefGranted: 10000,
      status: 'PROCESSING',
      date: '2026-09-18'
    }
  ]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    workerName: '',
    workerCode: '',
    incidentType: 'Job Site Accidental Injury',
    hospitalName: 'AIIMS Bhubaneswar',
    claimedAmount: 15000,
    immediateReliefRequested: 10000,
    incidentNotes: ''
  });
  const [viewingArogyaCard, setViewingArogyaCard] = useState(null);

  const isApex = user?.admin_type === 'FEDERATION_HEAD';
  const isSocietyAdmin = user?.admin_type === 'SOCIETY_ADMIN';
  const [selectedSocietyId, setSelectedSocietyId] = useState(
    user?.admin_type === 'FEDERATION_HEAD' ? 'apex' : (user?.society_id || 1)
  );

  const fetchPortalData = async (targetSocId) => {
    const socId = targetSocId !== undefined ? targetSocId : selectedSocietyId;
    setLoading(true);
    try {
      const [adminRes, treasRes] = await Promise.all([
        api.getFederationAdminDashboard(socId),
        api.getFederationTreasurerDashboard(socId),
      ]);
      if (adminRes.success) setAdminData(adminRes.data);
      if (treasRes.success) setTreasurerData(treasRes.data);
    } catch (err) {
      console.error('Failed to load Federation Portal data:', err);
      setError(err.message || 'Failed to load federation data.');
    } finally {
      setLoading(false);
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
    const initialSoc = user?.admin_type === 'FEDERATION_HEAD' ? 'apex' : (user?.society_id || 1);
    setSelectedSocietyId(initialSoc);
    fetchPortalData(initialSoc);
  }, [user]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // -------------------------------------------------------------
  // DCO STRICT ISOLATION GUARD
  // -------------------------------------------------------------
  if (user?.admin_type === 'DCO_REGISTRAR') {
    return (
      <div className="container py-12 max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-red-500/70 rounded-3xl p-8 text-white shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-red-800/60 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-600/30 border-2 border-red-400 flex items-center justify-center text-red-300">
              <ShieldAlert size={32} />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-mono font-bold uppercase tracking-wider">
                Statutory Jurisdiction Boundary
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Apex Federation Commercial Console Restricted
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-200 leading-relaxed">
            <p>
              You are authenticated as <strong>{user?.name || 'District Cooperative Officer'}</strong> with designation{' '}
              <span className="font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                {user?.designation || 'DCO / District Registrar'}
              </span>.
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-red-700/40 space-y-2 text-xs">
              <p className="text-red-200 font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                Statutory Separation of Powers (Odisha Cooperative Societies Act, 1962):
              </p>
              <p className="text-gray-300 leading-relaxed">
                Under Section 3 and Section 68 of the Act, regulatory officers (District Cooperative Officers / Registrars) are quasi-judicial and supervisory authorities. Regulatory officers are legally prohibited from managing operational commercial assets, machinery banks, wholesale indent orders, or labor mobility dispatches of the cooperative federation.
              </p>
            </div>
            <p className="text-xs text-gray-400">
              To perform statutory scrutiny, manage district society registrations, conduct Section 62 audits, review Section 70 tribunal disputes, or sign off on 2% Welfare Escrow funds, please proceed to your District Regulatory Console.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
            >
              🏛️ Open DCO Statutory Console <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              ← Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Onboard Worker under Federation (Flowchart Gate 2)
  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    setRegisteringWorker(true);
    setError('');
    try {
      const res = await api.registerWorkerByFederation({
        ...workerFormData,
        societyId: user?.society_id || 1,
      });
      if (res.success) {
        setShowWorkerModal(false);
        setCreatedWorkerReceipt(res.data?.user || {
          name: workerFormData.name,
          email: workerFormData.email,
          uniqueId: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
          password: workerFormData.password,
          trade: workerFormData.primaryTrade,
        });
        setWorkerFormData({
          name: '',
          email: '',
          phone: '',
          password: 'demoPassword123',
          primaryTrade: 'Electrical',
          experienceYears: 3,
          district: 'Khordha',
          city: 'Bhubaneswar',
          isNcctCertified: false,
        });
        fetchPortalData();
      }
    } catch (err) {
      setError(err.message || 'Failed to register worker under federation.');
    } finally {
      setRegisteringWorker(false);
    }
  };

  // Handle Resolve Dispute Ticket (Page 4 Slide 2 & 30-Day Policy)
  const handleResolveDispute = async (ticketId) => {
    setResolvingLoading(true);
    setError('');
    try {
      const res = await api.resolveDisputeTicket(ticketId, {
        resolution_notes: resolutionNotes || 'Resolved through Cooperative Mediation Desk under 30-Day Guarantee Policy. Zero-cost re-inspection and warranty dispatch approved.',
        action: 'RESOLVED',
      });
      if (res.success) {
        setDisputeSuccessMsg(`Dispute ticket #${ticketId} marked successfully as RESOLVED under statutory warranty policy.`);
        setResolvingTicketId(null);
        setResolutionNotes('');
        fetchPortalData();
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve dispute ticket.');
    } finally {
      setResolvingLoading(false);
    }
  };

  // Handle NCCT Training Application
  const handleApplyNcct = async (e) => {
    e.preventDefault();
    setApplyingNcct(true);
    setError('');
    try {
      const res = await api.applyNcctTraining({
        ...ncctFormData,
        societyId: user?.society_id || 1,
      });
      if (res.success) {
        setShowNcctModal(false);
        fetchPortalData();
      }
    } catch (err) {
      setError(err.message || 'Failed to apply for NCCT training.');
    } finally {
      setApplyingNcct(false);
    }
  };

  // Handle Inter-Society Mobility Deployment
  const handleCreateDeployment = (e) => {
    e.preventDefault();
    const newId = `MOB-2026-${Math.floor(20 + Math.random() * 80)}`;
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
      siteSupervisor: mobilityForm.siteSupervisor || 'Apex Zonal Field Coordinator',
      notes: mobilityForm.notes || 'Inter-society dispatch order authorized under NLCF cooperative mobility protocol.'
    };
    setDeployments([newOrder, ...deployments]);
    setShowMobilityModal(false);
    setViewingMobilityOrder(newOrder);
  };

  // Handle Tool Leasing
  const handleLeaseTool = (e) => {
    e.preventDefault();
    if (!selectedToolForLease) return;
    const releaseVoucher = {
      voucherId: `REL-${Math.floor(100000 + Math.random() * 900000)}`,
      toolId: selectedToolForLease.id,
      toolName: selectedToolForLease.name,
      artisanName: toolLeaseForm.artisanName,
      societyName: toolLeaseForm.societyName,
      daysCount: toolLeaseForm.daysCount,
      ratePerDay: selectedToolForLease.coopRentPerDay,
      totalRent: selectedToolForLease.coopRentPerDay * toolLeaseForm.daysCount,
      depot: selectedToolForLease.depotLocation,
      issuedAt: new Date().toLocaleDateString('en-IN')
    };

    setMachineryList(machineryList.map(t => {
      if (t.id === selectedToolForLease.id) {
        const nextAvail = Math.max(0, t.availableUnits - 1);
        return {
          ...t,
          availableUnits: nextAvail,
          status: nextAvail === 0 ? 'IN_USE' : 'AVAILABLE'
        };
      }
      return t;
    }));

    setShowToolLeaseModal(false);
    setViewingToolRelease(releaseVoucher);
  };

  // Handle Bulk Indent Requisition
  const handleCreateIndent = (e) => {
    e.preventDefault();
    if (!selectedItemForIndent) return;
    const qty = Number(indentForm.quantity);
    const coopTotal = selectedItemForIndent.coopPrice * qty;
    const retailTotal = selectedItemForIndent.mrp * qty;
    const totalSavings = retailTotal - coopTotal;

    const indentReceipt = {
      indentNo: `IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId: selectedItemForIndent.id,
      itemName: selectedItemForIndent.name,
      brand: selectedItemForIndent.brand,
      quantity: qty,
      unit: selectedItemForIndent.unit,
      coopTotal,
      retailTotal,
      totalSavings,
      destSociety: indentForm.destSociety,
      depot: selectedItemForIndent.coopDepot,
      date: new Date().toLocaleDateString('en-IN')
    };

    setCatalogItems(catalogItems.map(item => {
      if (item.id === selectedItemForIndent.id) {
        return {
          ...item,
          stockPcs: Math.max(0, item.stockPcs - qty)
        };
      }
      return item;
    }));

    setShowIndentModal(false);
    setViewingIndentReceipt(indentReceipt);
  };

  // Handle Lodging Emergency Relief Claim
  const handleLodgeClaim = (e) => {
    e.preventDefault();
    const newClaim = {
      id: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
      workerName: claimForm.workerName,
      workerCode: claimForm.workerCode || 'WRK-9981',
      incidentType: claimForm.incidentType,
      treatmentHospital: claimForm.hospitalName,
      claimedAmount: Number(claimForm.claimedAmount),
      immediateReliefGranted: Number(claimForm.immediateReliefRequested),
      status: 'PROCESSING',
      date: new Date().toISOString().split('T')[0]
    };
    setClaimsList([newClaim, ...claimsList]);
    setInsuranceStats(prev => ({
      ...prev,
      emergencySanctionsPending: prev.emergencySanctionsPending + 1,
      totalDisbursedAmount: prev.totalDisbursedAmount + Number(claimForm.immediateReliefRequested)
    }));
    setShowClaimModal(false);
  };

  if (loading) {
    return (
      <CivicLoader
        variant="fullscreen"
        title="Accessing Federation Operational Desks..."
        subtitle="Connecting to apex cooperative federation ledger & district nodes"
      />
    );
  }

  const kpis = treasurerData?.kpis || {};
  const society = treasurerData?.society || adminData?.society || {};
  const societiesList = adminData?.societiesList || treasurerData?.societiesList || [];
  const isGate1Cleared = Boolean(society?.is_nlcf_affiliated && society?.dco_linked);

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-6 px-4">
      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST FEDERATION WORKSPACE HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isApex ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                  <Landmark size={12} className="text-amber-700" />
                  <span>State Apex Federation Head Council</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200/60">
                  <Building2 size={12} className="text-blue-700" />
                  <span>Primary Labour Cooperative Society</span>
                </span>
              )}
              {isGate1Cleared && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>NLCF Affiliated • Apex Hub</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isApex && selectedSocietyId === 'apex'
                ? 'Odisha State Labour Cooperative Federation (Apex)'
                : (society.name || (isApex ? 'Odisha State Labour Cooperative Federation (Apex)' : 'Primary Labour Cooperative Samiti'))}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isApex
                ? selectedSocietyId === 'apex'
                  ? 'Statewide Apex Federation Console • Inter-District Coordination & Tenders (Khordha, Cuttack & Puri)'
                  : `Inspecting Member Society: ${society.name} • ${society.district || 'District'} Jurisdiction`
                : `${society.district || user?.district || 'District'} Primary Society Operations & Member Administration`}
            </p>
          </div>

          {/* Clean Action & Territory Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isApex && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scope:</span>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedSocietyId(newId);
                    fetchPortalData(newId);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                >
                  <option value="apex">🏛️ Statewide Apex Overview</option>
                  {societiesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      🏢 {s.name} ({s.district})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setShowWorkerModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Onboard Worker</span>
            </button>
            <button
              onClick={() => setShowNcctModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap size={14} className="text-slate-600" />
              <span>NCCT Training</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      {disputeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="font-semibold">{disputeSuccessMsg}</span>
          </div>
          <button onClick={() => setDisputeSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST TAB NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 overflow-x-auto border border-slate-200/60 shadow-2xs">
        <button
          onClick={() => handleTabChange('apex')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'apex'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 size={14} className={activeTab === 'apex' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Apex Desk</span>
        </button>

        <button
          onClick={() => handleTabChange('mobility')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'mobility'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Truck size={14} className={activeTab === 'mobility' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Inter-Society Mobility</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700">
            {deployments.filter(d => d.status === 'IN_FIELD' || d.status === 'TRANSIT').length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('tools')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Hammer size={14} className={activeTab === 'tools' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Machinery Bank</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700">
            {machineryList.filter(m => m.status === 'AVAILABLE').length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('procurement')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Package size={14} className={activeTab === 'procurement' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Bulk Procurement</span>
        </button>

        <button
          onClick={() => handleTabChange('insurance')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'insurance'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'insurance' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Group Insurance</span>
        </button>

        <button
          onClick={() => handleTabChange('ncct')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ncct'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <GraduationCap size={14} className={activeTab === 'ncct' ? 'text-blue-600' : 'text-slate-400'} />
          <span>NCCT Academy</span>
        </button>

        <button
          onClick={() => handleTabChange('treasurer')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'treasurer'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <DollarSign size={14} className={activeTab === 'treasurer' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Treasurer & Ledger</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: APEX FEDERATION DESK (OVERVIEW, TELEMETRY, DISPUTES, WORKERS)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'apex' && adminData && (
        <div className="space-y-6">
          {/* FLOWCHART OPERATIONAL GATE 1 BANNER */}
          {isGate1Cleared ? (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-emerald-950">
                      NLCF Statutory Accreditation Active
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      Gate 1 Cleared
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 leading-relaxed max-w-2xl">
                    Legally accredited to coordinate multi-society joint bids, institutional railway quarters overhauls, and civic contracts.
                  </p>
                </div>
              </div>
              <Link
                to="/institutional-tenders"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Institutional Tenders</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">
                    Operating in Community Household & Local Civic Services Mode
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Servicing local body projects and direct citizen household bookings. Institutional tenders require state federation council affiliation.
                  </p>
                </div>
              </div>
              <Link
                to="/institutional-tenders"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>View Schedule</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Sub-Slide Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <button
              onClick={() => setAdminSlide(1)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                adminSlide === 1 ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity size={13} className={adminSlide === 1 ? 'text-blue-400' : 'text-slate-400'} />
              <span>Workforce Telemetry</span>
            </button>
            <button
              onClick={() => setAdminSlide(2)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                adminSlide === 2 ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert size={13} className={adminSlide === 2 ? 'text-amber-400' : 'text-slate-400'} />
              <span>Disputes & Guarantee Desk</span>
            </button>
            <button
              onClick={() => setAdminSlide(3)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                adminSlide === 3 ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award size={13} className={adminSlide === 3 ? 'text-emerald-400' : 'text-slate-400'} />
              <span>NCCT Accreditation Queue</span>
            </button>
          </div>

          {/* SLIDE 1: WORKFORCE LIVE TELEMETRY */}
          {adminSlide === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">1. Total Workers</span>
                  <div className="text-2xl font-extrabold text-blue-950 font-mono">
                    {adminData.slide1_workforce.totalWorkers}
                  </div>
                  <p className="text-[11px] text-blue-800 font-medium">Registered federation artisans</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    2. Active Workers on Site
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono">
                    {adminData.slide1_workforce.activeWorkersOnSite}
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium">Executing live client sessions</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">4. Free / Available Workers</span>
                  <div className="text-2xl font-extrabold text-amber-950 font-mono">
                    {adminData.slide1_workforce.freeWorkers}
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">Ready for immediate dispatch</p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">3. Offline / Leave Workers</span>
                  <div className="text-2xl font-extrabold text-gray-900 font-mono">
                    {adminData.slide1_workforce.offlineWorkers}
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">Off duty or scheduled leave</p>
                </div>
              </div>

              {/* Federation Responsibility Guarantee Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      Federation Statutory Quality & Workmanship Guarantee
                    </h4>
                    <p className="text-[11px] text-blue-200 leading-relaxed">
                      The Labour Cooperative Federation takes formal statutory responsibility that work completed by registered artisans complies with certified quality, regulated schedule of rates, and statutory 30-day warranty.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md uppercase tracking-wider self-start sm:self-center">
                  Verified Protection
                </span>
              </div>

              {/* Workers Master Roster */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Federation Registered Workers Roster &amp; Dynamic Tiers
                    </h3>
                    <p className="text-xs text-gray-500">
                      Flowchart Gate 2: Unique ID, trade verified, works done tracking, health insurance (ESIC), and mini PFs.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Federation Status: Trusted Federation Roster
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="p-3">Artisan &amp; Portal ID</th>
                        <th className="p-3">Trade</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3 text-center">Works Done</th>
                        <th className="p-3">Health Insurance</th>
                        <th className="p-3">Mini PF Fund</th>
                        <th className="p-3">NCCT Training</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {adminData.workersList.slice(0, 10).map((w) => (
                        <tr key={w.id} className="hover:bg-blue-50/40">
                          <td className="p-3">
                            <strong className="text-gray-900 block">{w.user_name || w.name}</strong>
                            <span className="text-[10px] text-blue-800 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {w.worker_code}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-blue-950">{w.primary_trade || 'Multi-Trade'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              w.computedTier === 'MASTER' ? 'bg-amber-400 text-blue-950 ring-1 ring-amber-500' :
                              w.computedTier === 'GOLD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              w.computedTier === 'SILVER' ? 'bg-slate-200 text-slate-900' : 'bg-orange-100 text-orange-900'
                            }`}>
                              {w.computedTier}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{w.experience_years} yrs exp</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              <Briefcase size={12} className="text-blue-600" />
                              {w.total_jobs_completed || 0}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 font-mono block w-max">
                              {w.healthPolicyNo || `ESIC-${w.worker_code}`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-extrabold text-teal-900 bg-teal-50 px-2 py-1 rounded border border-teal-200 inline-block">
                              ₹{Number(w.miniPfAccumulated || 1200).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3">
                            {w.isNcctCertified ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 flex items-center gap-1 w-max">
                                <GraduationCap size={12} /> NCCT Certified
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.availability === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                              w.availability === 'BUSY' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {w.availability}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Platform Guide */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowWorkerGuide(!showWorkerGuide)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        📘 Platform Guide &amp; Code of Conduct for New Workers
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          Flowchart Gate 2 Standard
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Operational guide for newly registered artisans joining the federation.
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 font-bold p-1">
                    {showWorkerGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {showWorkerGuide && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-blue-700" /> 1. Unique ID &amp; Verified Credentials
                      </span>
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        Every artisan receives an authenticated Unique Worker Code (WRK-XXXX) and direct credentials. The federation conducts physical skill accreditation before awarding trust badges.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-emerald-700" /> 2. Fair Dispatch &amp; Zero Surge Pricing
                      </span>
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        Direct algorithmic assignment eliminates middlemen cuts. Strict zero-surge pricing protects both citizen affordability and guaranteed living wages.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <DollarSign size={14} className="text-amber-700" /> 3. 93-2-5 Social Welfare Model
                      </span>
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        93% of billed service charge goes straight to the artisan. 2% sustains cooperative tech operations, and 5% is allocated to Health Insurance and individual Mini PF retirement pools.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 2: DISPUTES & 30-DAY GUARANTEE DESK */}
          {adminSlide === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">1. Total Issues Reported</span>
                  <div className="text-2xl font-extrabold text-blue-950 font-mono">
                    {adminData.slide2_disputes.totalIssues}
                  </div>
                  <p className="text-[11px] text-blue-800">Total customer service disputes</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">2. Resolved Issues</span>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono">
                    {adminData.slide2_disputes.resolvedIssues}
                  </div>
                  <p className="text-[11px] text-emerald-800">Arbitrated and closed by federation desk</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">3. Unresolved / Open Issues</span>
                  <div className="text-2xl font-extrabold text-amber-950 font-mono">
                    {adminData.slide2_disputes.unresolvedIssues}
                  </div>
                  <p className="text-[11px] text-amber-800">Under active dispute mediation</p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">4. 30-Day Guarantee Resolved Cases</span>
                  <div className="text-2xl font-extrabold text-purple-950 font-mono">
                    {adminData.slide2_disputes.sevenDayPolicyResolved}
                  </div>
                  <p className="text-[11px] text-purple-800">₹0 Master re-dispatch executed successfully</p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">5. 30-Day Policy Unresolved Cases</span>
                  <div className="text-2xl font-extrabold text-rose-950 font-mono">
                    {adminData.slide2_disputes.sevenDayPolicyUnresolved}
                  </div>
                  <p className="text-[11px] text-rose-800">Pending secondary warranty inspection</p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">6. Worker Grievances & Appeals</span>
                  <div className="text-2xl font-extrabold text-indigo-950 font-mono">
                    {adminData.slide2_disputes.workerIssues}
                  </div>
                  <p className="text-[11px] text-indigo-800">Internal welfare & payment queries</p>
                </div>
              </div>

              {/* Active Dispute Tickets & Warranty Arbitration Table */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={16} className="text-amber-600" />
                      Statutory Dispute Arbitration &amp; 30-Day Guarantee Desk
                    </h3>
                    <p className="text-xs text-gray-500">
                      Cooperative grievance mediation desk backed by statutory federation warranty re-dispatch.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Policy: Free Master Re-dispatch within 30 Days
                  </span>
                </div>

                {resolvingTicketId && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Wrench size={14} className="text-amber-700" />
                        Arbitrate Ticket #{resolvingTicketId} under 30-Day Statutory Guarantee
                      </h4>
                      <button
                        onClick={() => { setResolvingTicketId(null); setResolutionNotes(''); }}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Official Resolution Notes / Re-dispatch Order:
                      </label>
                      <textarea
                        rows={2}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="e.g. Free warranty re-dispatch assigned to Master Technician. Zero extra cost to citizen."
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setResolvingTicketId(null); setResolutionNotes(''); }}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={resolvingLoading}
                        onClick={() => handleResolveDispute(resolvingTicketId)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5"
                      >
                        {resolvingLoading ? 'Logging Resolution...' : 'Authorize Re-Dispatch & Close Dispute'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="p-3">Ticket Code</th>
                        <th className="p-3">Issue Category</th>
                        <th className="p-3">Description &amp; Claim</th>
                        <th className="p-3">Warranty Eligibility</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Arbitration Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {adminData.slide2_disputes.recentDisputes?.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50/60">
                          <td className="p-3 font-mono font-bold text-blue-900">{d.ticket_code}</td>
                          <td className="p-3 font-semibold text-gray-900">{d.issue_type}</td>
                          <td className="p-3 text-gray-600 max-w-xs">
                            <p className="line-clamp-2">{d.description}</p>
                            {d.resolution_notes && (
                              <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                                ✓ Resolution: {d.resolution_notes}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 inline-flex items-center gap-1">
                              <ShieldCheck size={11} /> 30-Day Policy
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              d.status === 'RESOLVED' || d.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-900' :
                              d.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {d.status === 'RESOLVED' || d.status === 'CLOSED' ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 justify-end">
                                <CheckCircle2 size={13} /> Arbitrated
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setResolvingTicketId(d.id);
                                  setResolutionNotes('Zero-cost master warranty re-dispatch authorized under 30-Day Policy.');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold shadow-xs transition"
                              >
                                Resolve &amp; Dispatch
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

          {/* SLIDE 3: ACCREDITATION & TRAINING QUEUE */}
          {adminSlide === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">1. NCCT Trained Workers</span>
                    <div className="text-3xl font-extrabold text-purple-950 font-mono">
                      {adminData.slide3_accreditation.ncctTrainedWorkers}
                    </div>
                    <p className="text-xs text-purple-800">Accredited by National Council for Cooperative Training</p>
                  </div>
                  <GraduationCap size={44} className="text-purple-400 shrink-0" />
                </div>

                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">2. KYC Pending Approvals</span>
                    <div className="text-3xl font-extrabold text-amber-950 font-mono">
                      {adminData.slide3_accreditation.kycPendingWorkers}
                    </div>
                    <p className="text-xs text-amber-800">Artisans awaiting Aadhaar & trade license verification</p>
                  </div>
                  <FileText size={44} className="text-amber-400 shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: INTER-SOCIETY WORKFORCE MOBILITY DESK
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'mobility' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/60">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max">
                <Truck size={13} className="text-amber-400" /> Apex Demand Balancing Network
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Inter-Society Workforce Mobility &amp; Cross-District Dispatch
              </h2>
              <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
                Coordinates temporary deployment of skilled artisan teams from surplus cooperative samitis to high-demand infrastructure works, municipal overhaul projects, and disaster mitigation corridors.
              </p>
            </div>
            <button
              onClick={() => setShowMobilityModal(true)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Issue Mobilization Order
            </button>
          </div>

          {/* Mobility Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Artisans Deployed</span>
              <div className="text-2xl font-black text-blue-950 font-mono">
                {deployments.reduce((acc, curr) => acc + (curr.status !== 'COMPLETED' ? curr.artisanCount : 0), 0)} Artisans
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Active in field across 2 zones</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Average Daily Batta</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                ₹385 / day
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Direct accommodation & food allowance</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Participating Samitis</span>
              <div className="text-2xl font-black text-purple-950 font-mono">
                4 Societies
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Khordha, Cuttack, Puri, Balasore</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Welfare Shield Compliance</span>
              <div className="text-2xl font-black text-amber-700 font-mono">
                100%
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Active ESIC & Transit Insurance verified</p>
            </div>
          </div>

          {/* Active Deployments Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck size={16} className="text-blue-900" /> Active Inter-Society Deployment Manifests
                </h3>
                <p className="text-xs text-gray-500">Official mobilization orders governed by State Apex Cooperative protocols.</p>
              </div>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Statutory Batta Protocol: Form MOB-12
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Trade &amp; Specialization</th>
                    <th className="p-3">Origin (Sending Society)</th>
                    <th className="p-3">Destination (Host Work Site)</th>
                    <th className="p-3 text-center">Team Strength</th>
                    <th className="p-3">Daily Batta</th>
                    <th className="p-3">Tenure</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {deployments.map((dep) => (
                    <tr key={dep.id} className="hover:bg-blue-50/40">
                      <td className="p-3 font-mono font-bold text-blue-900">{dep.id}</td>
                      <td className="p-3 font-semibold text-gray-900">{dep.trade}</td>
                      <td className="p-3 text-gray-700">{dep.fromSociety}</td>
                      <td className="p-3 text-gray-700 font-medium">{dep.toSociety}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold bg-blue-50 text-blue-950 px-2 py-0.5 rounded border border-blue-200">
                          <Users size={12} className="text-blue-600" /> {dep.artisanCount}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        ₹{dep.dailyBatta} / d
                      </td>
                      <td className="p-3 text-gray-600">
                        {dep.durationWeeks} Weeks
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          dep.status === 'IN_FIELD' ? 'bg-emerald-100 text-emerald-900' :
                          dep.status === 'TRANSIT' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setViewingMobilityOrder(dep)}
                          className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 ml-auto"
                        >
                          <Eye size={12} /> View Manifest
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
          TAB 3: COLLECTIVE TOOL & HEAVY MACHINERY BANK
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/80">
            <div className="space-y-1">
              <span className="civic-authority-chip mb-1">
                <Hammer size={12} className="text-slate-300" />
                <span>Capital Asset Sharing Pool</span>
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Collective Tool &amp; Heavy Machinery Equipment Bank
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Provides affiliated artisan samitis with shared access to high-value industrial power equipment, laser diagnostics, pipe threaders, and core drilling rigs at 80% below market commercial rental rates.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Pool Capital Value</span>
              <strong className="text-xl text-white font-mono font-bold">₹10,28,000</strong>
            </div>
          </div>

          {/* Machinery Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {machineryList.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {item.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-900' :
                      item.status === 'IN_USE' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-900'
                    }`}>
                      {item.status === 'AVAILABLE' ? `✓ ${item.availableUnits} Available` : item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded inline-block">
                    {item.category}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.spec}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Co-op Subsidized Rate</span>
                      <strong className="text-sm font-mono font-black text-emerald-800">₹{item.coopRentPerDay} / day</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Commercial Market</span>
                      <span className="text-xs font-mono line-through text-gray-400">₹{item.marketRentPerDay} / day</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span>Depot: {item.depotLocation}</span>
                  </div>
                </div>

                <button
                  disabled={item.status !== 'AVAILABLE'}
                  onClick={() => {
                    setSelectedToolForLease(item);
                    setShowToolLeaseModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    item.status === 'AVAILABLE'
                      ? 'bg-blue-950 hover:bg-blue-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Hammer size={14} /> Lease for Cooperative Job
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: BULK MATERIAL & SAFETY GEAR GROUP PROCUREMENT
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-800/60">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max">
                <Package size={13} className="text-emerald-400" /> Direct-From-Manufacturer Indents
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Bulk Material &amp; ISI Safety Gear Group Procurement
              </h2>
              <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
                Centralized wholesale bargaining with authorized manufacturers (Havells, Supreme, Karam, Asian Paints). Eliminates retail middleman margins and passes 25% - 43% savings directly to member artisans.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-300 block">Fiscal Year Co-op Savings</span>
              <strong className="text-xl text-emerald-400 font-mono">₹18,50,000+</strong>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} className="text-blue-900" /> Live Wholesale Cooperative Indent Catalog
                </h3>
                <p className="text-xs text-gray-500">Fixed rate contract valid through FY 2026-27 under NLCF supplier tie-ups.</p>
              </div>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Consignment Dispatch: Every Tuesday &amp; Friday
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Item Code &amp; Brand</th>
                    <th className="p-3">Specification &amp; Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Packaging Unit</th>
                    <th className="p-3">Market MRP</th>
                    <th className="p-3">Federation Co-op Rate</th>
                    <th className="p-3">Co-op Discount</th>
                    <th className="p-3">Depot Stock</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {catalogItems.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/40">
                      <td className="p-3">
                        <span className="font-mono font-bold text-blue-900 block">{item.id}</span>
                        <span className="text-[10px] text-gray-500 font-semibold">{item.brand}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-900 max-w-xs">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.category}</td>
                      <td className="p-3 text-gray-500 font-mono">{item.unit}</td>
                      <td className="p-3 font-mono line-through text-gray-400">₹{item.mrp.toLocaleString()}</td>
                      <td className="p-3 font-mono font-black text-emerald-800 text-sm">
                        ₹{item.coopPrice.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900">
                          {item.discountPercent}% OFF
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-700">
                        {item.stockPcs} in stock
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedItemForIndent(item);
                            setShowIndentModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 ml-auto"
                        >
                          <ShoppingBag size={12} /> Indent Order
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
          TAB 5: GROUP INSURANCE & EMERGENCY RELIEF DESK
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          {/* Master Policy Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-md border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max">
                <ShieldCheck size={14} className="text-emerald-400" /> NLCF Prithvi Suraksha Bima Shield
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Federation Group Health &amp; Accidental Insurance Desk
              </h2>
              <p className="text-xs text-emerald-200/90 max-w-3xl leading-relaxed">
                Comprehensive statutory social security coverage underwritten by National Labour Cooperatives Federation (NLCF). Grants instant emergency medical advance without paperwork delays.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1 font-mono">
                <span className="text-gray-300">Master Policy: <strong className="text-emerald-400">{insuranceStats.masterPolicyNo}</strong></span>
                <span className="text-gray-300">Annual Renewal: <strong className="text-white">31 March 2027</strong></span>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition flex items-center gap-2 shadow-sm justify-center"
              >
                <Plus size={16} /> Lodge Emergency Relief Claim
              </button>
              <button
                onClick={() => setViewingArogyaCard({
                  name: 'Bijay Kumar Swain',
                  code: 'WRK-1044',
                  trade: 'Master Electrician',
                  society: 'Shramik Kalyan Labour Cooperative Samiti',
                  policyNo: insuranceStats.masterPolicyNo,
                  validTill: '31-03-2027',
                  hospitalizationCover: '₹2,00,000',
                  accidentCover: '₹5,00,000'
                })}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 justify-center"
              >
                <FileCheck size={14} /> View Digital Arogya Card
              </button>
            </div>
          </div>

          {/* Insurance Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Artisans Covered</span>
              <div className="text-2xl font-black text-blue-950 font-mono">
                {insuranceStats.activeArtisansCovered.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">100% active roster inclusion</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accidental Cover</span>
              <div className="text-2xl font-black text-purple-950 font-mono">
                ₹{(insuranceStats.accidentalCoverLimit / 100000).toFixed(0)} Lakhs
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Death / Permanent Total Disability</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cashless Hospitalization</span>
              <div className="text-2xl font-black text-emerald-800 font-mono">
                ₹{(insuranceStats.cashlessFamilyCover / 100000).toFixed(0)} Lakhs
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Per family unit / year</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Claims Settled This Year</span>
              <div className="text-2xl font-black text-teal-800 font-mono">
                ₹{(insuranceStats.totalDisbursedAmount / 100000).toFixed(2)} Lakhs
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">{insuranceStats.claimsSettledFY} claims processed</p>
            </div>
          </div>

          {/* Empanelled Cashless Network in Odisha */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-blue-900" /> Odisha Empanelled Cashless Hospital Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gray-900 block font-bold">AIIMS Bhubaneswar</strong>
                <span className="text-gray-500 text-[11px] block">Sijua, Bhubaneswar</span>
                <span className="text-emerald-700 font-bold text-[10px]">✓ 24/7 Level-1 Trauma &amp; Cashless Desk</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gray-900 block font-bold">SCB Medical College</strong>
                <span className="text-gray-500 text-[11px] block">Manglabag, Cuttack</span>
                <span className="text-emerald-700 font-bold text-[10px]">✓ Super Specialty Burn &amp; Ortho Wing</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gray-900 block font-bold">Capital Hospital</strong>
                <span className="text-gray-500 text-[11px] block">Unit-6, Bhubaneswar</span>
                <span className="text-emerald-700 font-bold text-[10px]">✓ State Emergency &amp; Daycare Unit</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gray-900 block font-bold">DHH Puri (District Hospital)</strong>
                <span className="text-gray-500 text-[11px] block">Grand Road, Puri</span>
                <span className="text-emerald-700 font-bold text-[10px]">✓ Cooperative Coastal Relief Point</span>
              </div>
            </div>
          </div>

          {/* Claims History Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-600" /> Recent Emergency Relief &amp; Hospitalization Claims
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Claim Ref</th>
                    <th className="p-3">Artisan Name &amp; Code</th>
                    <th className="p-3">Incident / Diagnosis</th>
                    <th className="p-3">Treatment Facility</th>
                    <th className="p-3">Claimed Amount</th>
                    <th className="p-3">Instant Relief Sanctioned</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {claimsList.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-blue-900">{c.id}</td>
                      <td className="p-3">
                        <strong className="text-gray-900 block">{c.workerName}</strong>
                        <span className="text-[10px] font-mono text-gray-500">{c.workerCode}</span>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">{c.incidentType}</td>
                      <td className="p-3 text-gray-600">{c.treatmentHospital}</td>
                      <td className="p-3 font-mono font-bold text-gray-900">₹{c.claimedAmount.toLocaleString()}</td>
                      <td className="p-3 font-mono font-black text-emerald-800">₹{c.immediateReliefGranted.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          c.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {c.status}
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
          TAB 6: NCCT SKILLS ACADEMY & ARTISAN ACCREDITATION
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ncct' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800/60">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-purple-400/20 border border-purple-400/40 text-purple-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max">
                <GraduationCap size={13} className="text-purple-400" /> Statutory Capacity Building
              </span>
              <h2 className="text-xl font-extrabold text-white">
                National Council for Cooperative Training (NCCT) Academy
              </h2>
              <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                Skill enhancement, solar grid integration, and cooperative book-keeping certifications for affiliated artisans. Subsidized 80% by Federation Development Reserve.
              </p>
            </div>
            <button
              onClick={() => setShowNcctModal(true)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Nominate Artisan for NCCT Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                Technical Module 1
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                Advanced Solar Inverter &amp; Smart Grid Architecture
              </h3>
              <p className="text-xs text-gray-600">
                Covers PM Surya Ghar grid synchronization, micro-inverter installation, and safety earthing standards.
              </p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Duration: 40 Hours</span>
                <strong className="text-purple-900 font-mono">Net: ₹500 (80% Subsidized)</strong>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                Technical Module 2
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                High-Pressure Multi-Storey Plumbing &amp; Fire Hydrants
              </h3>
              <p className="text-xs text-gray-600">
                Pneumatic pressure systems, CPVC solvent welding certification, and backflow prevention protocols.
              </p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Duration: 30 Hours</span>
                <strong className="text-purple-900 font-mono">Net: ₹400 (80% Subsidized)</strong>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                Governance Module 3
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                Cooperative Accountancy &amp; Digital DCCB Auditing
              </h3>
              <p className="text-xs text-gray-600">
                Mandatory certification for society secretaries and managing committee members under Sec 28.
              </p>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Duration: 25 Hours</span>
                <strong className="text-purple-900 font-mono">Net: ₹350 (80% Subsidized)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: FEDERATION TREASURER DESK (10 KPIS & FINANCIAL LEDGER)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'treasurer' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Treasurer Console • Statutory Financial Ledger
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                10 Core Financial, Welfare &amp; Project Treasury KPIs
              </h2>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              Bylaws Compliance: 93-2-5 Split Audited
            </span>
          </div>

          {/* 10 Specific KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                1. Total Amount in Account
              </span>
              <div className="text-xl font-extrabold text-emerald-950 font-mono">
                ₹{kpis.totalAmountInAccount?.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-800 font-medium">Verified treasury balance</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                2. Health Insurances Registered
              </span>
              <div className="text-xl font-extrabold text-blue-950 font-mono">
                {kpis.totalHealthInsurancesRegistered}
              </div>
              <p className="text-[10px] text-blue-800 font-medium">Active ESIC worker policies</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                3. Accident Policies Active
              </span>
              <div className="text-xl font-extrabold text-purple-950 font-mono">
                {kpis.accidentPoliciesActive}
              </div>
              <p className="text-[10px] text-purple-800 font-medium">₹5,00,000 accidental cover</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">
                4. Revenues via Cancellations
              </span>
              <div className="text-xl font-extrabold text-rose-950 font-mono">
                ₹{kpis.revenuesThroughCancellations?.toLocaleString()}
              </div>
              <p className="text-[10px] text-rose-800 font-medium">Cooperative late forfeit pool</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                5. Revenues via 2% Platform Fee
              </span>
              <div className="text-xl font-extrabold text-indigo-950 font-mono">
                ₹{(kpis.revenuesThrough2PercentFees ?? kpis.revenuesThrough5PercentFees)?.toLocaleString()}
              </div>
              <p className="text-[10px] text-indigo-800 font-medium">Platform ops & infrastructure (2%)</p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-400 space-y-1">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                6. Total PF &amp; Insurance Fund
              </span>
              <div className="text-xl font-extrabold text-teal-950 font-mono">
                ₹{kpis.totalWorkersWelfareFundRaised?.toLocaleString()}
              </div>
              <p className="text-[10px] text-teal-800 font-medium">5% statutory PF & insurance</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                7. Total Loan Disbursed
              </span>
              <div className="text-xl font-extrabold text-amber-950 font-mono">
                ₹{kpis.totalLoanAmountDisbursed?.toLocaleString()}
              </div>
              <p className="text-[10px] text-amber-800 font-medium">Artisan toolkit micro-loans</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1">
              <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider">
                8. Next Loan Due Amount
              </span>
              <div className="text-xl font-extrabold text-orange-950 font-mono">
                ₹{kpis.nextLoanAmountDue?.toLocaleString()}
              </div>
              <p className="text-[10px] text-orange-800 font-medium">Due by: {kpis.nextLoanDueDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-1">
              <span className="text-[10px] font-bold text-cyan-900 uppercase tracking-wider">
                9. Project Funds Received
              </span>
              <div className="text-xl font-extrabold text-cyan-950 font-mono">
                ₹{kpis.projectFundsReceived?.toLocaleString()}
              </div>
              <p className="text-[10px] text-cyan-800 font-medium">Institutional tender advances</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-1">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                10. Due Remaining on Projects
              </span>
              <div className="text-xl font-extrabold text-slate-950 font-mono">
                ₹{kpis.dueRemainingForProjects?.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-700 font-medium">Milestone payments pending</p>
            </div>
          </div>

          {/* Treasury Ledger History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Statutory Treasury Transactions Ledger
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Txn Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Balance After</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {treasurerData?.ledger?.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-blue-900">{t.transaction_code}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.amount >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{t.description}</td>
                      <td className={`p-3 font-mono font-bold ${t.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-gray-900">
                        ₹{t.balance_after?.toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-400 text-[10px]">
                        {new Date(t.created_at).toLocaleDateString()}
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
          MODALS
         ───────────────────────────────────────────────────────────── */}

      {/* MODAL 1: ONBOARD WORKER */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Plus size={18} className="text-blue-900" /> Onboard Artisan under Federation
                </h3>
                <p className="text-xs text-gray-500">
                  Federation takes formal responsibility for verified quality and workmanship.
                </p>
              </div>
              <button
                onClick={() => setShowWorkerModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterWorker} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Artisan Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bijay Kumar Swain"
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email ID *</label>
                  <input
                    type="email"
                    required
                    placeholder="artisan@demo.local"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543000"
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Primary Trade *</label>
                  <select
                    value={workerFormData.primaryTrade}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, primaryTrade: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Painting">Painting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={workerFormData.experienceYears}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, experienceYears: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ncct-check"
                  checked={workerFormData.isNcctCertified}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, isNcctCertified: e.target.checked })}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <label htmlFor="ncct-check" className="cursor-pointer font-semibold text-purple-950">
                  Artisan holds NCCT / Trade Skill Certification (Accelerates Gold / Master tier)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeringWorker}
                  className="btn btn-primary btn-sm font-bold"
                >
                  {registeringWorker ? 'Registering...' : 'Register Worker under Federation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY FOR NCCT TRAINING */}
      {showNcctModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <GraduationCap size={18} className="text-purple-700" /> Apply for Subsidized NCCT Training
                </h3>
                <p className="text-xs text-gray-500">
                  Federation applies for NCCT training with 80% Statutory Federation subsidy.
                </p>
              </div>
              <button
                onClick={() => setShowNcctModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyNcct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Artisan Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Behera"
                  value={ncctFormData.workerName}
                  onChange={(e) => setNcctFormData({ ...ncctFormData, workerName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trade *</label>
                <select
                  value={ncctFormData.trade}
                  onChange={(e) => setNcctFormData({ ...ncctFormData, trade: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Cooperative Governance">Cooperative Accountancy &amp; Governance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NCCT Certification Course Module *</label>
                <input
                  type="text"
                  required
                  value={ncctFormData.courseName}
                  onChange={(e) => setNcctFormData({ ...ncctFormData, courseName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1 text-purple-950">
                <span className="font-bold block text-[11px] uppercase tracking-wider">Subsidized Training Fee Structure</span>
                <div className="flex justify-between text-[11px]">
                  <span>Total Course Cost:</span>
                  <span className="font-mono">₹2,500</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Statutory Federation Subsidy (80%):</span>
                  <span className="font-mono">- ₹2,000</span>
                </div>
                <div className="flex justify-between text-xs font-extrabold border-t border-purple-200 pt-1 text-purple-900">
                  <span>Net Payable by Federation:</span>
                  <span className="font-mono">₹500 / worker</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNcctModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingNcct}
                  className="btn btn-primary btn-sm font-bold bg-purple-800 hover:bg-purple-700 border-purple-800"
                >
                  {applyingNcct ? 'Submitting Application...' : 'Nominate & Enroll in NCCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WORKER ONBOARDING RECEIPT */}
      {createdWorkerReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-blue-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Artisan Registered under Federation
              </h3>
              <p className="text-xs text-gray-500">
                Flowchart Gate 2: Unique Worker ID generated, profile verified &amp; credentials issued.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-blue-900">
                <ShieldCheck size={14} className="text-blue-700" /> Federation Responsibility Guarantee Active
              </span>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                The cooperative federation formally guarantees artisan workmanship, zero surge pricing, and 30-day warranty coverage.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-gray-500">Unique Worker Code:</span>
                <span className="font-mono font-extrabold text-blue-950 text-sm bg-blue-100 px-2 py-0.5 rounded">
                  {createdWorkerReceipt.uniqueId}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-gray-500">Full Name:</span>
                <span className="font-bold text-gray-900">{createdWorkerReceipt.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-gray-500">Trade:</span>
                <span className="font-semibold text-blue-900">{createdWorkerReceipt.trade}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-gray-500">Login Email:</span>
                <span className="font-mono text-gray-800 select-all">{createdWorkerReceipt.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Default Password:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 select-all">
                  {createdWorkerReceipt.password || 'demoPassword123'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(
                  `Worker ID: ${createdWorkerReceipt.uniqueId}\nEmail: ${createdWorkerReceipt.email}\nPassword: ${createdWorkerReceipt.password || 'demoPassword123'}`,
                  'credentials'
                )}
                className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {copiedText === 'credentials' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedText === 'credentials' ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={() => setCreatedWorkerReceipt(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-extrabold shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE INTER-SOCIETY MOBILIZATION ORDER */}
      {showMobilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-blue-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Truck size={18} className="text-blue-900" /> Issue Inter-Society Mobilization Order
                </h3>
                <p className="text-xs text-gray-500">
                  Apex dispatch of artisan team across cooperative jurisdiction zones.
                </p>
              </div>
              <button
                onClick={() => setShowMobilityModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeployment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trade Specialization *</label>
                <select
                  value={mobilityForm.trade}
                  onChange={(e) => setMobilityForm({ ...mobilityForm, trade: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Civil Masons & Tile Artisans">Civil Masons &amp; Tile Artisans</option>
                  <option value="Substation & High-Tension Electricians">Substation &amp; High-Tension Electricians</option>
                  <option value="Certified Industrial Plumbers">Certified Industrial Plumbers</option>
                  <option value="Structural Carpenters & Formwork">Structural Carpenters &amp; Formwork</option>
                  <option value="Industrial Painters & Epoxy Applicators">Industrial Painters &amp; Epoxy Applicators</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Origin (Sending Samiti) *</label>
                  <input
                    type="text"
                    required
                    value={mobilityForm.fromSociety}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, fromSociety: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Destination (Host Site) *</label>
                  <input
                    type="text"
                    required
                    value={mobilityForm.toSociety}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, toSociety: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Artisans Count *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={mobilityForm.artisanCount}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, artisanCount: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Daily Batta (₹) *</label>
                  <input
                    type="number"
                    min="200"
                    step="50"
                    required
                    value={mobilityForm.dailyBatta}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, dailyBatta: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tenure (Weeks) *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={mobilityForm.durationWeeks}
                    onChange={(e) => setMobilityForm({ ...mobilityForm, durationWeeks: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Host Site Coordinator / Engineer</label>
                <input
                  type="text"
                  placeholder="e.g. Er. P. K. Mohapatra, Executive Engineer"
                  value={mobilityForm.siteSupervisor}
                  onChange={(e) => setMobilityForm({ ...mobilityForm, siteSupervisor: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Work Description &amp; Accommodation Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Housing provided at municipal guest house. Transport batta disbursed weekly."
                  value={mobilityForm.notes}
                  onChange={(e) => setMobilityForm({ ...mobilityForm, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMobilityModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-bold bg-blue-950 hover:bg-blue-900 border-blue-950"
                >
                  Dispatch Mobilization Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW MOBILITY ORDER SLIP */}
      {viewingMobilityOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-blue-300">
            <div className="border-b-2 border-blue-900 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-900 font-extrabold block">
                  Odisha State Labour Cooperative Federation (Apex)
                </span>
                <h3 className="text-base font-black text-gray-900">
                  Official Inter-Society Mobilization Manifest
                </h3>
                <span className="text-xs font-mono font-bold text-amber-700">Order #{viewingMobilityOrder.id}</span>
              </div>
              <button
                onClick={() => setViewingMobilityOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-gray-400 text-[10px] block">Sending Society (Origin):</span>
                  <strong className="text-gray-900">{viewingMobilityOrder.fromSociety}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Receiving Site (Destination):</span>
                  <strong className="text-gray-900">{viewingMobilityOrder.toSociety}</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-gray-400 text-[10px] block">Artisan Team Size:</span>
                  <strong className="text-blue-950 font-mono text-sm">{viewingMobilityOrder.artisanCount} Artisans</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Daily Batta / Head:</span>
                  <strong className="text-emerald-700 font-mono text-sm">₹{viewingMobilityOrder.dailyBatta} / day</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Deployment Tenure:</span>
                  <strong className="text-gray-900">{viewingMobilityOrder.durationWeeks} Weeks</strong>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-[10px] block">Trade Specialization:</span>
                <span className="font-bold text-blue-900">{viewingMobilityOrder.trade}</span>
              </div>

              {viewingMobilityOrder.siteSupervisor && (
                <div>
                  <span className="text-gray-400 text-[10px] block">Site Coordinator:</span>
                  <span className="text-gray-800">{viewingMobilityOrder.siteSupervisor}</span>
                </div>
              )}

              {viewingMobilityOrder.notes && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-gray-600 text-[11px]">
                  <strong>Protocol Notes:</strong> {viewingMobilityOrder.notes}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              <span>Cooperative Seal: <strong className="text-emerald-700">Verified &amp; Insured</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Manifest
                </button>
                <button
                  onClick={() => setViewingMobilityOrder(null)}
                  className="px-4 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-extrabold shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: LEASE EQUIPMENT */}
      {showToolLeaseModal && selectedToolForLease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Hammer size={18} className="text-blue-900" /> Equipment Custody Lease Agreement
                </h3>
                <p className="text-xs text-gray-500">
                  Subsidized asset checkout from Collective Machinery Bank.
                </p>
              </div>
              <button
                onClick={() => setShowToolLeaseModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaseTool} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[10px] text-blue-900 font-mono font-bold block">{selectedToolForLease.id}</span>
                <strong className="text-gray-900 text-sm block">{selectedToolForLease.name}</strong>
                <div className="flex justify-between text-xs pt-1 border-t border-blue-200">
                  <span>Co-op Rental: <strong className="font-mono text-emerald-800">₹{selectedToolForLease.coopRentPerDay} / day</strong></span>
                  <span>Pickup Depot: <strong>{selectedToolForLease.depotLocation}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Borrowing Artisan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bijay Kumar Swain (Master Electrician)"
                  value={toolLeaseForm.artisanName}
                  onChange={(e) => setToolLeaseForm({ ...toolLeaseForm, artisanName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={toolLeaseForm.daysCount}
                    onChange={(e) => setToolLeaseForm({ ...toolLeaseForm, daysCount: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={toolLeaseForm.contactNumber}
                    onChange={(e) => setToolLeaseForm({ ...toolLeaseForm, contactNumber: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Intended Work Site Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit-4 Government Colony Panel Overhaul"
                  value={toolLeaseForm.intendedSite}
                  onChange={(e) => setToolLeaseForm({ ...toolLeaseForm, intendedSite: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span>Calculated Cooperative Rent:</span>
                <strong className="text-base font-mono font-extrabold text-emerald-800">
                  ₹{(selectedToolForLease.coopRentPerDay * toolLeaseForm.daysCount).toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowToolLeaseModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-bold bg-blue-950 hover:bg-blue-900 border-blue-950"
                >
                  Confirm &amp; Generate Custody Release Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: VIEW TOOL RELEASE VOUCHER */}
      {viewingToolRelease && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-emerald-300">
            <div className="text-center space-y-1 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
                <Hammer size={24} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">
                Equipment Custody Release Pass
              </h3>
              <span className="text-xs font-mono font-bold text-blue-900">{viewingToolRelease.voucherId}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Equipment:</span>
                <strong className="text-gray-900 text-right">{viewingToolRelease.toolName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Borrower:</span>
                <strong className="text-gray-900">{viewingToolRelease.artisanName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Tenure:</span>
                <span className="font-bold">{viewingToolRelease.daysCount} Days</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Pickup Depot:</span>
                <span className="text-gray-700">{viewingToolRelease.depot}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 font-bold">Total Rental Debit:</span>
                <strong className="text-sm font-mono text-emerald-800">₹{viewingToolRelease.totalRent.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                Print Pass
              </button>
              <button
                onClick={() => setViewingToolRelease(null)}
                className="flex-1 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: GROUP INDENT REQUISITION */}
      {showIndentModal && selectedItemForIndent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Package size={18} className="text-blue-900" /> Wholesale Group Indent Order
                </h3>
                <p className="text-xs text-gray-500">
                  Consolidated co-op purchasing at bulk manufacturer prices.
                </p>
              </div>
              <button
                onClick={() => setShowIndentModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIndent} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                <span className="text-[10px] text-indigo-900 font-mono font-bold block">{selectedItemForIndent.id} • {selectedItemForIndent.brand}</span>
                <strong className="text-gray-900 text-sm block">{selectedItemForIndent.name}</strong>
                <div className="flex justify-between text-xs pt-1 border-t border-indigo-200">
                  <span>Co-op Rate: <strong className="font-mono text-emerald-800">₹{selectedItemForIndent.coopPrice} / {selectedItemForIndent.unit}</strong></span>
                  <span>Retail MRP: <span className="line-through text-gray-400 font-mono">₹{selectedItemForIndent.mrp}</span></span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Requisition Quantity ({selectedItemForIndent.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItemForIndent.stockPcs}
                  required
                  value={indentForm.quantity}
                  onChange={(e) => setIndentForm({ ...indentForm, quantity: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination Samiti / Branch Depot *</label>
                <input
                  type="text"
                  required
                  value={indentForm.destSociety}
                  onChange={(e) => setIndentForm({ ...indentForm, destSociety: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Requisition Reason / Work Order Ref</label>
                <input
                  type="text"
                  value={indentForm.requisitionReason}
                  onChange={(e) => setIndentForm({ ...indentForm, requisitionReason: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Savings Calculation */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-950">
                <div className="flex justify-between">
                  <span>Cooperative Invoice Total:</span>
                  <strong className="font-mono">₹{(selectedItemForIndent.coopPrice * Number(indentForm.quantity || 1)).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Direct Cooperative Savings:</span>
                  <strong className="font-mono">
                    ₹{((selectedItemForIndent.mrp - selectedItemForIndent.coopPrice) * Number(indentForm.quantity || 1)).toLocaleString()} ({selectedItemForIndent.discountPercent}%)
                  </strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIndentModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-bold bg-blue-950 hover:bg-blue-900 border-blue-950"
                >
                  Generate Purchase Indent (PO)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: VIEW INDENT PO RECEIPT */}
      {viewingIndentReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-emerald-300">
            <div className="text-center space-y-1 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
                <Package size={24} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">
                Wholesale Indent Requisition Order
              </h3>
              <span className="text-xs font-mono font-bold text-blue-900">{viewingIndentReceipt.indentNo}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Item:</span>
                <strong className="text-gray-900 text-right">{viewingIndentReceipt.itemName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Brand:</span>
                <span className="font-bold">{viewingIndentReceipt.brand}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Quantity Ordered:</span>
                <span className="font-mono font-bold text-blue-950">{viewingIndentReceipt.quantity} {viewingIndentReceipt.unit}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Depot Pickup:</span>
                <span className="text-gray-700">{viewingIndentReceipt.depot}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-gray-500">Cooperative Invoice:</span>
                <strong className="font-mono text-emerald-800">₹{viewingIndentReceipt.coopTotal.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-emerald-700 font-bold">Total Saved vs Retail:</span>
                <strong className="text-sm font-mono text-emerald-700">₹{viewingIndentReceipt.totalSavings.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                Print Requisition
              </button>
              <button
                onClick={() => setViewingIndentReceipt(null)}
                className="flex-1 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: LODGE EMERGENCY RELIEF CLAIM */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                  <ShieldAlert size={18} className="text-amber-600" /> Lodge Emergency Relief Claim
                </h3>
                <p className="text-xs text-gray-500">
                  Instant advance sanction under NLCF Prithvi Suraksha Bima.
                </p>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLodgeClaim} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Artisan Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bijay Kumar Swain"
                    value={claimForm.workerName}
                    onChange={(e) => setClaimForm({ ...claimForm, workerName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Worker Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WRK-1044"
                    value={claimForm.workerCode}
                    onChange={(e) => setClaimForm({ ...claimForm, workerCode: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Incident / Injury Category *</label>
                <select
                  value={claimForm.incidentType}
                  onChange={(e) => setClaimForm({ ...claimForm, incidentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Job Site Accidental Injury">Job Site Accidental Injury</option>
                  <option value="Emergency Hospitalization">Emergency Hospitalization</option>
                  <option value="Scaffolding / Height Fall Contusion">Scaffolding / Height Fall Contusion</option>
                  <option value="Electrical Flash Burn">Electrical Flash Burn</option>
                  <option value="Tool Loss / Accidental Damage">Tool Loss / Accidental Damage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Admitted Hospital / Medical Center *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIIMS Bhubaneswar or SCB Cuttack"
                  value={claimForm.hospitalName}
                  onChange={(e) => setClaimForm({ ...claimForm, hospitalName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Medical Bill (₹) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={claimForm.claimedAmount}
                    onChange={(e) => setClaimForm({ ...claimForm, claimedAmount: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Immediate Advance Sanction (₹) *</label>
                  <input
                    type="number"
                    min="1000"
                    max="25000"
                    required
                    value={claimForm.immediateReliefRequested}
                    onChange={(e) => setClaimForm({ ...claimForm, immediateReliefRequested: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Incident Notes &amp; Site Witness</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of incident and supervising technician details..."
                  value={claimForm.incidentNotes}
                  onChange={(e) => setClaimForm({ ...claimForm, incidentNotes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500"
                >
                  Sanction Immediate Emergency Relief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 11: VIEW DIGITAL AROGYA CARD */}
      {viewingArogyaCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-blue-950 text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border-2 border-emerald-400/50">
            <div className="flex items-start justify-between border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold block">
                    National Labour Cooperatives Federation
                  </span>
                  <h3 className="text-sm font-extrabold text-white">Prithvi Arogya Suraksha Card</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingArogyaCard(null)}
                className="text-gray-400 hover:text-gray-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Cardholder Artisan:</span>
                <strong className="text-white text-sm">{viewingArogyaCard.name}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Worker Code:</span>
                <span className="font-mono font-medium text-slate-200 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                  {viewingArogyaCard.code}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Trade:</span>
                <span className="text-gray-200">{viewingArogyaCard.trade}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Cashless Hospitalization:</span>
                <strong className="text-emerald-400 font-mono text-sm">{viewingArogyaCard.hospitalizationCover}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accidental Death Shield:</span>
                <strong className="text-purple-300 font-mono text-sm">{viewingArogyaCard.accidentCover}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span>Policy: <strong className="font-mono text-white">{viewingArogyaCard.policyNo}</strong></span>
              <span>Valid Thru: <strong className="text-emerald-400">{viewingArogyaCard.validTill}</strong></span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer size={13} /> Print Arogya e-Card
              </button>
              <button
                onClick={() => setViewingArogyaCard(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
