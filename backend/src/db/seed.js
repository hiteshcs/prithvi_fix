const bcrypt = require('bcryptjs');
const { query, closeDb } = require('./connection');
const { migrate } = require('./migrate');

async function seed() {
  console.log('🚀 Checking database schema status...');
  try {
    const check = await query("SELECT 1 FROM information_schema.tables WHERE table_name = 'cooperatives'");
    if (!check || check.rowCount === 0) {
      console.log('⚙️ Initializing tables via migrate()...');
      await migrate();
    } else {
      console.log('✅ Schema tables verified.');
    }
  } catch (_) {
    await migrate();
  }

  const salt = bcrypt.hashSync('demo123', 10);

  console.log('🧹 Clearing all existing tables...');
  await query(`
    TRUNCATE TABLE 
      worker_toolkit_orders,
      mandatory_toolkits,
      society_regulatory_inquiries,
      sos_logs,
      dispute_tickets,
      appliance_lineage,
      worker_welfare, 
      reviews, 
      invoices, 
      payments, 
      bookings, 
      parts_catalog,
      certifications, 
      worker_skills, 
      workers, 
      skills, 
      services,
      institutional_tenders,
      society_worker_welfare,
      society_treasury_ledger,
      ncct_trainings,
      society_statutory_documents,
      society_founding_members,
      societies,
      users, 
      cooperatives 
    RESTART IDENTITY CASCADE;
  `);

  console.log('🌱 Populating expanded cooperative database across 3 Districts (Khordha, Cuttack, Puri)...');

  // =============================================
  // 1. Cooperatives (12 Decentralized Regional Federations - 4 per District)
  // =============================================
  const cooperatives = [
    // ── Khordha District (Federations 1 - 4) ──
    [
      'Central Bhubaneswar Regional Labour Cooperative Federation',
      'FED-KHD-2024-001',
      'Khordha',
      'Bhubaneswar',
      'Plot 45, Master Canteen Square, Saheed Nagar, Bhubaneswar',
      '0674-2540001',
      'central.bbsr@coop.od.in',
      'Decentralized regional federation overseeing central urban municipal wards, commercial hubs, and retail clusters.',
      'Saheed Nagar / Master Canteen / Rasulgarh / Unit-8',
      'BBSR Central Urban Zone (Wards 21-45)',
      'ACTIVE',
      'Khordha District Cooperative Office',
      'Shri Debendra Nayak (DCO)',
      'APPROVED',
      '2024-02-10T10:30:00Z',
      'DCO/KHD/REG-2024/0014',
      'Statutory audit completed under Sec 62 of OCS Act 1962. Financial solvency and member quorum verified.',
      'REGIONAL_FEDERATION',
      6,
      1250000.0,
      'Apex State Cooperative Bank, Bhubaneswar Main',
      'OSCB-KHD-001290',
      'OSCB0001002'
    ],
    [
      'West Khordha Regional Artisan & Maintenance Federation',
      'FED-KHD-2026-002',
      'Khordha',
      'Bhubaneswar',
      'Khandagiri Square, Near Monument Gate, Bhubaneswar',
      '0674-2589100',
      'west.khordha@coop.od.in',
      'Regional cooperative federation coordinating residential repair, masonry, carpentry, and electrical guilds across western suburban corridors.',
      'Khandagiri / Aiginia / Baramunda / Ghatikia',
      'Khordha West Residential & Industrial Corridor (Wards 46-67)',
      'PENDING_DCO_APPROVAL',
      'Khordha District Cooperative Office',
      'Shri Debendra Nayak (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-KHD-002',
      'Initial share capital audited. Awaiting on-site inspection of tool bank facility by Assistant Registrar.',
      'REGIONAL_FEDERATION',
      4,
      450000.0,
      'Khordha Central Cooperative Bank, Khandagiri Branch',
      'KCCB-KHD-004419',
      'KCCB0001005'
    ],
    [
      'Ekamra Heritage & South Khordha Regional Cooperative Federation',
      'FED-KHD-2024-003',
      'Khordha',
      'Bhubaneswar',
      'Ratha Danda, Old Town, Near Lingaraj Temple, Bhubaneswar',
      '0674-2591210',
      'ekamra.south@coop.od.in',
      'Specialized regional federation uniting stone restoration masons, temple conservation artisans, plumbing, and domestic maintenance societies.',
      'Old Town / Sundarpada / Pokhariput / Samantarapur',
      'South Khordha Heritage & Urban Extension (Wards 50-65)',
      'ACTIVE',
      'Khordha District Cooperative Office',
      'Shri Debendra Nayak (DCO)',
      'APPROVED',
      '2024-05-18T11:00:00Z',
      'DCO/KHD/REG-2024/0088',
      'Compliance verified under Odisha Cooperative Societies Rules 1965. By-laws ratified in AGM.',
      'REGIONAL_FEDERATION',
      5,
      980000.0,
      'Apex State Cooperative Bank, Old Town Branch',
      'OSCB-KHD-009941',
      'OSCB0001002'
    ],
    [
      'North Bhubaneswar Tech-Artisan Regional Federation',
      'FED-KHD-2026-004',
      'Khordha',
      'Bhubaneswar',
      'Infocity Avenue, Near KIIT Square, Patia, Bhubaneswar',
      '0674-2742000',
      'north.patia@coop.od.in',
      'High-tech skilled artisan federation managing inverter AC, smart automation, EV charging, and precision electro-mechanical maintenance.',
      'Patia / Chandaka / Infocity / Chandrasekharpur',
      'North Khordha IT & Innovation Hub (Wards 1-20)',
      'PENDING_DCO_APPROVAL',
      'Khordha District Cooperative Office',
      'Shri Debendra Nayak (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-KHD-004',
      'Digital submission verified. DCO field scrutiny scheduled for NCCT training certification of founding members.',
      'REGIONAL_FEDERATION',
      5,
      620000.0,
      'Khordha Central Cooperative Bank, Patia',
      'KCCB-KHD-006612',
      'KCCB0001005'
    ],

    // ── Cuttack District (Federations 5 - 8) ──
    [
      'Central Cuttack Commercial Regional Cooperative Federation',
      'FED-CTC-2024-005',
      'Cuttack',
      'Cuttack',
      'Badambadi Bus Stand Road, Cuttack',
      '0671-2316700',
      'central.cuttack@coop.od.in',
      'Decentralized commercial trade federation organizing heavy domestic sanitation, electrical distribution, and commercial repairs.',
      'Badambadi / Ranihat / College Square',
      'Cuttack Central Trade & Commercial Corridor (Wards 15-35)',
      'ACTIVE',
      'Cuttack District Cooperative Office',
      'Smt. Laxmi Devi (DCO)',
      'APPROVED',
      '2024-03-25T14:15:00Z',
      'DCO/CTC/REG-2024/0022',
      'Passed Section 65 inquiry with zero discrepancies. Grade A compliance rating awarded.',
      'REGIONAL_FEDERATION',
      7,
      1450000.0,
      'Cuttack Central Cooperative Bank, Badambadi',
      'CCCB-CTC-002214',
      'CCCB0002004'
    ],
    [
      'East Cuttack Industrial & Fabrication Regional Federation',
      'FED-CTC-2026-006',
      'Cuttack',
      'Cuttack',
      'Madhupatna Square, OMP Line, Cuttack',
      '0671-2449100',
      'east.industrial@coop.od.in',
      'Industrial artisan federation representing metal fabrication, welding, masonry, and heavy warehouse infrastructure maintenance.',
      'Madhupatna / OMP / Jagatpur Industrial Estate',
      'East Cuttack Heavy Craft & Industrial Hub (Wards 36-55)',
      'PENDING_DCO_APPROVAL',
      'Cuttack District Cooperative Office',
      'Smt. Laxmi Devi (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-CTC-006',
      'Gazette notification pending for jurisdiction demarcation adjacent to Jagatpur industrial zone.',
      'REGIONAL_FEDERATION',
      3,
      510000.0,
      'Cuttack Central Cooperative Bank, Madhupatna',
      'CCCB-CTC-005519',
      'CCCB0002004'
    ],
    [
      'Barabati-CDA Riverine Regional Cooperative Federation',
      'FED-CTC-2024-007',
      'Cuttack',
      'Cuttack',
      'CDA Sector 9, Plot 108, Near Judicial Academy, Cuttack',
      '0671-2501220',
      'cda.barabati@coop.od.in',
      'Modern residential planned-zone federation servicing gated societies, judicial quarters, and multi-story apartment complexes.',
      'CDA Sectors 1-14 / Tulsipur / Cantonment',
      'North-West Cuttack Planned Urban Zone (Wards 1-14)',
      'ACTIVE',
      'Cuttack District Cooperative Office',
      'Smt. Laxmi Devi (DCO)',
      'APPROVED',
      '2024-05-02T09:45:00Z',
      'DCO/CTC/REG-2024/0067',
      'Statutory reserve balance exceeded mandated threshold. Fully verified under OCS Section 62.',
      'REGIONAL_FEDERATION',
      6,
      1100000.0,
      'Cuttack Central Cooperative Bank, CDA',
      'CCCB-CTC-003388',
      'CCCB0002004'
    ],
    [
      'Silver City Heritage Artisan Guild Regional Federation',
      'FED-CTC-2026-008',
      'Cuttack',
      'Cuttack',
      'Buxi Bazar Heritage Lane, Cuttack',
      '0671-2612330',
      'silvercity.guild@coop.od.in',
      'Heritage filigree guild federation, ornamental metal restoration, domestic rewiring, and antique timber woodworking.',
      'Buxi Bazar / Nayasarak / Choudhury Bazar',
      'Cuttack Heritage Filigree & Artisan Zone (Wards 16-28)',
      'PENDING_DCO_APPROVAL',
      'Cuttack District Cooperative Office',
      'Smt. Laxmi Devi (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-CTC-008',
      'Submitted by-laws undergoing DCO scrutiny. Public objection period ending in 14 days.',
      'REGIONAL_FEDERATION',
      4,
      480000.0,
      'Cuttack Central Cooperative Bank, Buxi Bazar',
      'CCCB-CTC-001144',
      'CCCB0002004'
    ],

    // ── Puri District (Federations 9 - 12) ──
    [
      'Srikshetra Pilgrim Corridor Regional Cooperative Federation',
      'FED-PRI-2026-009',
      'Puri',
      'Puri',
      'VIP Road, Near Bus Stand, Puri',
      '06752-224420',
      'srikshetra.pilgrim@coop.od.in',
      'Specialized pilgrim corridor federation managing high-density tourist facility plumbing, crowd barrier fabrication, and emergency electrical systems.',
      'Grand Road / Bada Danda / VIP Road / Gundicha',
      'Puri Sacred Temple & Heritage Precinct (Wards 1-12)',
      'PENDING_DCO_APPROVAL',
      'Puri District Cooperative Office',
      'Shri Alok Mohapatra (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-PRI-009',
      'Special audit mandated due to proximity to heritage monument zone. Provisional license issued for festival season.',
      'REGIONAL_FEDERATION',
      4,
      550000.0,
      'Puri Urban Cooperative Bank, VIP Road',
      'PUCB-PRI-001188',
      'PUCB0003001'
    ],
    [
      'Konark Sun Coast Regional Cooperative Federation',
      'FED-PRI-2024-010',
      'Puri',
      'Konark',
      'Marine Drive Road, Konark, Puri',
      '06752-235520',
      'konark.coast@coop.od.in',
      'Eco-tourism and heritage stonework federation coordinating solar electrification, resort water treatment, and artisan handicrafts.',
      'Marine Drive / Konark Temple Perimeter / Chandrabhaga',
      'Coastal Heritage & Eco-Tourism Belt (Konark NAC)',
      'ACTIVE',
      'Puri District Cooperative Office',
      'Shri Alok Mohapatra (DCO)',
      'APPROVED',
      '2024-04-14T12:30:00Z',
      'DCO/PRI/REG-2024/0045',
      'Approved under Special Maritime Cooperative Framework. NCCT training fully completed for executive committee.',
      'REGIONAL_FEDERATION',
      5,
      1300000.0,
      'Puri Urban Cooperative Bank, Konark',
      'PUCB-PRI-003344',
      'PUCB0003001'
    ],
    [
      'Puri Sea Beach Hospitality & Facility Regional Federation',
      'FED-PRI-2024-011',
      'Puri',
      'Puri',
      'Sea Beach Road, Blue Wave Enclave, Baliapanda, Puri',
      '06752-221155',
      'seabeach.hospitality@coop.od.in',
      'Coastal hospitality and municipal sanitation federation serving hotels, holiday homes, and beachfront infrastructure.',
      'Sea Beach Road / Baliapanda / Chakra Tirtha Road',
      'Puri South Coastal Tourism Belt (Wards 13-25)',
      'ACTIVE',
      'Puri District Cooperative Office',
      'Shri Alok Mohapatra (DCO)',
      'APPROVED',
      '2024-06-08T16:00:00Z',
      'DCO/PRI/REG-2024/0073',
      'Full statutory audit cleared. Saltwater corrosion mitigation toolkit certification verified.',
      'REGIONAL_FEDERATION',
      6,
      1050000.0,
      'Puri Urban Cooperative Bank, Sea Beach',
      'PUCB-PRI-002233',
      'PUCB0003001'
    ],
    [
      'Chilika-Brahmagiri Western Regional Cooperative Federation',
      'FED-PRI-2026-012',
      'Puri',
      'Brahmagiri',
      'Loknath Temple Road, West Enclave, Brahmagiri, Puri',
      '06752-248820',
      'chilika.brahmagiri@coop.od.in',
      'Decentralized rural & coastal federation organizing solar irrigation mechanics, boat engine maintenance, carpentry, and domestic wiring.',
      'Brahmagiri / Satapada / Loknath Perimeter',
      'South-Western Agro-Maritime Artisan Belt (Blocks Brahmagiri & Krushnaprasad)',
      'PENDING_DCO_APPROVAL',
      'Puri District Cooperative Office',
      'Shri Alok Mohapatra (DCO)',
      'DCO_REVIEW',
      null,
      'ORD-PENDING-PRI-012',
      'Verification of 12 founding members underway. DCO joint inspection with Fishery & Cooperative Inspector scheduled.',
      'REGIONAL_FEDERATION',
      3,
      420000.0,
      'Puri Urban Cooperative Bank, Loknath',
      'PUCB-PRI-008899',
      'PUCB0003001'
    ],
  ];

  for (const c of cooperatives) {
    await query(
      `INSERT INTO cooperatives (
        name, registration_number, district, city, address, contact_phone, contact_email, description,
        local_area, jurisdiction_zone, status, dco_office_name, dco_officer_name, dco_approval_status,
        dco_approved_at, dco_order_number, dco_audit_notes, federation_type, total_member_societies,
        capital_reserve, cooperative_bank_name, bank_account_no, bank_ifsc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
      c
    );
  }

  // =============================================
  // 2. Cooperative Societies (12 Societies: 4 per District)
  // =============================================
  // 2 ACTIVE (Approved) and 2 DCO_REVIEW (Pending approval) in EACH of the 3 districts!
  const societiesSeed = [
    // ── Khordha District (Societies 1 - 4) ──
    [
      'SOC-OD-2024-001',
      'Shramik Kalyan Labour Cooperative Samiti',
      'ACTIVE',
      'REG-NL-2024-8891',
      'shramik.kalyan@coop.gov.in',
      '0674-2548891',
      'Khordha',
      'Bhubaneswar',
      'Plot 45, Master Canteen Square, Saheed Nagar, Bhubaneswar',
      '751001',
      'Central Bhubaneswar multi-trade cooperative federation chapter for electrical, plumbing, and HVAC maintenance.',
      1, 'LCF-CERT-2024-4412', '2024-03-15',
      'Khordha District Cooperative Office', 'Shri Debendra Nayak (DCO)', 1, 1, 1,
      850000.0, 'COOP-9988112233', 'Apex State Cooperative Bank, Bhubaneswar Main', 'OSCB0001002',
      'HALF_YEARLY', 9, 'SS-SOC-2024-001', 28, 1
    ],
    [
      'SOC-OD-2026-004',
      'Kalinga Shramik Seva Sahakari Samiti',
      'DCO_REVIEW',
      null,
      'kalinga.shramik@coop.gov.in',
      '0674-2589001',
      'Khordha',
      'Bhubaneswar',
      'Khandagiri Square, Near Monument Gate, Bhubaneswar',
      '751030',
      'Grassroots collective of electrical, plumbing, and carpentry artisans organizing for West Bhubaneswar residential clusters.',
      0, null, null,
      'Khordha District Cooperative Office', 'Shri Debendra Nayak (DCO)', 0, 0, 0,
      35000.0, 'COOP-7788990011', 'Khordha Central Cooperative Bank', 'KCCB0001005',
      'QUARTERLY', 7, 'SS-SOC-2026-8801', 14, 2
    ],
    [
      'SOC-OD-2024-007',
      'Ekamra Multi-Trade Artisan Cooperative',
      'ACTIVE',
      'REG-OD-2024-9914',
      'ekamra.artisan@coop.gov.in',
      '0674-2591200',
      'Khordha',
      'Bhubaneswar',
      'Ratha Danda, Old Town, Near Lingaraj Temple, Bhubaneswar',
      '751002',
      'South Bhubaneswar artisan chapter specializing in masonry, heritage stone restoration, plumbing, and domestic maintenance.',
      1, 'LCF-CERT-2024-7719', '2024-06-12',
      'Khordha District Cooperative Office', 'Shri Debendra Nayak (DCO)', 1, 1, 1,
      480000.0, 'COOP-9922334411', 'Apex State Cooperative Bank, Old Town Branch', 'OSCB0001002',
      'HALF_YEARLY', 9, 'SS-SOC-2024-007', 22, 3
    ],
    [
      'SOC-OD-2026-008',
      'Chandaka-Patia Tech-Artisan Cooperative Samiti',
      'DCO_REVIEW',
      null,
      'patia.techcraft@coop.gov.in',
      '0674-2741990',
      'Khordha',
      'Bhubaneswar',
      'Infocity Avenue, Near KIIT Square, Patia, Bhubaneswar',
      '751024',
      'Modern appliance, EV charger, HVAC inverter, and smart home maintenance cooperative serving the IT corridor.',
      0, null, null,
      'Khordha District Cooperative Office', 'Shri Debendra Nayak (DCO)', 0, 0, 0,
      42000.0, 'COOP-6677889900', 'Khordha Central Cooperative Bank, Patia', 'KCCB0001005',
      'QUARTERLY', 7, 'SS-SOC-2026-9012', 16, 4
    ],

    // ── Cuttack District (Societies 5 - 8) ──
    [
      'SOC-OD-2024-002',
      'Utkal Shilpi Seva Sahakari Samiti',
      'ACTIVE',
      'REG-OD-2024-6623',
      'utkal.shilpi@coop.gov.in',
      '0671-2316623',
      'Cuttack',
      'Cuttack',
      'Badambadi Bus Stand Road, Cuttack',
      '753012',
      'Dedicated cooperative society representing plumbing, electrical, and carpentry artisans across Central Cuttack.',
      1, 'LCF-CERT-2024-5512', '2024-04-18',
      'Cuttack District Cooperative Office', 'Smt. Laxmi Devi (DCO)', 1, 1, 1,
      420000.0, 'COOP-4455667788', 'Cuttack Central Cooperative Bank, Badambadi', 'CCCB0002004',
      'QUARTERLY', 9, 'SS-SOC-2024-002', 24, 5
    ],
    [
      'SOC-OD-2026-005',
      'Mahanadi Shilpi Sahakari Samiti',
      'DCO_REVIEW',
      null,
      'mahanadi.shilpi@coop.gov.in',
      '0671-2449011',
      'Cuttack',
      'Cuttack',
      'Madhupatna Square, OMP Line, Cuttack',
      '753010',
      'Artisan cooperative society for masonry, metal fabrication, and woodwork crafts in East Cuttack industrial hub.',
      0, null, null,
      'Cuttack District Cooperative Office', 'Smt. Laxmi Devi (DCO)', 0, 0, 0,
      30000.0, 'COOP-5566778899', 'Cuttack Central Cooperative Bank, Madhupatna', 'CCCB0002004',
      'QUARTERLY', 7, 'SS-SOC-2026-7721', 14, 6
    ],
    [
      'SOC-OD-2024-009',
      'Barabati Urban Crafts & Maintenance Cooperative',
      'ACTIVE',
      'REG-OD-2024-7781',
      'barabati.crafts@coop.gov.in',
      '0671-2501199',
      'Cuttack',
      'Cuttack',
      'CDA Sector 9, Plot 108, Near Judicial Academy, Cuttack',
      '753014',
      'Specialized residential maintenance cooperative covering CDA phases, Tulsipur, and Cantonment apartments.',
      1, 'LCF-CERT-2024-9912', '2024-05-14',
      'Cuttack District Cooperative Office', 'Smt. Laxmi Devi (DCO)', 1, 1, 1,
      510000.0, 'COOP-3322119988', 'Cuttack Central Cooperative Bank, CDA', 'CCCB0002004',
      'HALF_YEARLY', 9, 'SS-SOC-2024-009', 20, 7
    ],
    [
      'SOC-OD-2026-010',
      'Silver City Artisan Guild Cooperative',
      'DCO_REVIEW',
      null,
      'silvercity.guild@coop.gov.in',
      '0671-2612200',
      'Cuttack',
      'Cuttack',
      'Buxi Bazar Heritage Lane, Cuttack',
      '753001',
      'Traditional filigree, metalwork, electrical overhaul, and domestic sanitation cooperative guild in Old Cuttack.',
      0, null, null,
      'Cuttack District Cooperative Office', 'Smt. Laxmi Devi (DCO)', 0, 0, 0,
      38000.0, 'COOP-1144778822', 'Cuttack Central Cooperative Bank, Buxi Bazar', 'CCCB0002004',
      'QUARTERLY', 7, 'SS-SOC-2026-8819', 15, 8
    ],

    // ── Puri District (Societies 9 - 12) ──
    [
      'SOC-OD-2026-003',
      'Jagannath Nirman Sahakari Federation',
      'DCO_REVIEW',
      null,
      'jagannath.nirman@coop.gov.in',
      '06752-224411',
      'Puri',
      'Puri',
      'VIP Road, Near Bus Stand, Puri',
      '752002',
      'Newly formed cooperative society for construction, electrical, and plumbing artisans in coastal pilgrimage zones.',
      0, null, null,
      'Puri District Cooperative Office', 'Shri Alok Mohapatra (DCO)', 0, 0, 0,
      25000.0, 'COOP-1122334455', 'Puri Urban Cooperative Bank, VIP Road', 'PUCB0003001',
      'QUARTERLY', 7, 'SS-SOC-2026-9812', 15, 9
    ],
    [
      'SOC-OD-2024-006',
      'Konark Karigar Sahakari Samiti',
      'ACTIVE',
      'REG-OD-2024-5519',
      'konark.karigar@coop.gov.in',
      '06752-235519',
      'Puri',
      'Konark',
      'Marine Drive Road, Konark, Puri',
      '752111',
      'Heritage stone carving, masonry, solar electrical works, and tourist facility maintenance cooperative.',
      1, 'LCF-CERT-2024-8831', '2024-05-20',
      'Puri District Cooperative Office', 'Shri Alok Mohapatra (DCO)', 1, 1, 1,
      520000.0, 'COOP-3344556677', 'Puri Urban Cooperative Bank, Konark', 'PUCB0003001',
      'HALF_YEARLY', 9, 'SS-SOC-2024-006', 22, 10
    ],
    [
      'SOC-OD-2024-011',
      'Srikshetra Coastal Facility Cooperative Samiti',
      'ACTIVE',
      'REG-OD-2024-4419',
      'srikshetra.coastal@coop.gov.in',
      '06752-221144',
      'Puri',
      'Puri',
      'Sea Beach Road, Blue Wave Enclave, Baliapanda, Puri',
      '752001',
      'Hospitality, plumbing, corrosion-resistant electrical, and deep sanitation cooperative serving hotels and beachside residences.',
      1, 'LCF-CERT-2024-3321', '2024-04-10',
      'Puri District Cooperative Office', 'Shri Alok Mohapatra (DCO)', 1, 1, 1,
      460000.0, 'COOP-2233445566', 'Puri Urban Cooperative Bank, Sea Beach', 'PUCB0003001',
      'HALF_YEARLY', 9, 'SS-SOC-2024-011', 20, 11
    ],
    [
      'SOC-OD-2026-012',
      'Brahmagiri Rural Artisan & Craft Cooperative',
      'DCO_REVIEW',
      null,
      'brahmagiri.rural@coop.gov.in',
      '06752-248810',
      'Puri',
      'Brahmagiri',
      'Loknath Temple Road, West Enclave, Puri',
      '752001',
      'Rural artisan collective for agro-maintenance, solar irrigation pump repair, carpentry, and electrical wiring.',
      0, null, null,
      'Puri District Cooperative Office', 'Shri Alok Mohapatra (DCO)', 0, 0, 0,
      28000.0, 'COOP-8899001122', 'Puri Urban Cooperative Bank, Loknath', 'PUCB0003001',
      'QUARTERLY', 7, 'SS-SOC-2026-4421', 12, 12
    ],
  ];

  for (const s of societiesSeed) {
    await query(
      `INSERT INTO societies (
        society_code, name, status, registration_number, registered_email, registered_phone,
        district, city, address, pincode, objectives, is_nlcf_affiliated, nlcf_certificate_no,
        nlcf_affiliation_date, dco_office_name, dco_officer_name, dco_linked, ncct_training_completed,
        ministry_recognized, initial_capital_balance, bank_account_no, cooperative_bank_name,
        bank_ifsc, audit_frequency, timeline_stage, tracking_id, total_workers_count, federation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)`,
      s
    );
  }

  // =============================================
  // 3. Users: Customers (60), Workers (84), Admins (16)
  // =============================================
  const users = [];

  // ── 60 Customers (User IDs 1-60) ──
  const customerData = [
    // Khordha / Bhubaneswar (25 Customers: 1 - 25)
    ['Ananya Patel', 'customer@demo.local', '9876543210', 'Khordha', 'Bhubaneswar', 'Patia, Plot 42, Near KIIT Campus', '751024', 20.3540, 85.8170, 4],
    ['Priya Mohanty', 'priya@demo.local', '9876543211', 'Khordha', 'Bhubaneswar', 'Jaydev Vihar, Flat 302', '751013', 20.2961, 85.8245, 1],
    ['Vikram Sahoo', 'vikram@demo.local', '9876543214', 'Khordha', 'Bhubaneswar', 'Nayapalli, Niladri Vihar Society', '751012', 20.2850, 85.8020, 2],
    ['Sunita Tripathy', 'sunita@demo.local', '9876543215', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Plot 110', '751007', 20.2870, 85.8450, 1],
    ['Rohit Patnaik', 'rohit@demo.local', '9876543216', 'Khordha', 'Bhubaneswar', 'Chandrasekharpur, HIG-44', '751016', 20.3350, 85.8100, 4],
    ['Sneha Mishra', 'sneha@demo.local', '9876543217', 'Khordha', 'Bhubaneswar', 'Khandagiri Enclave, Plot 18', '751030', 20.2570, 85.7750, 2],
    ['Rajesh Mohapatra', 'rajesh@demo.local', '9876543222', 'Khordha', 'Bhubaneswar', 'Infocity Avenue, Cyber City', '751024', 20.3580, 85.8150, 4],
    ['Pooja Nayak', 'pooja@demo.local', '9876543223', 'Khordha', 'Bhubaneswar', 'Rasulgarh Square, Krishna Tower', '751010', 20.3090, 85.8520, 1],
    ['Alok Sundaray', 'alok@demo.local', '9876543224', 'Khordha', 'Bhubaneswar', 'VSS Nagar, Phase-2', '751007', 20.2950, 85.8360, 1],
    ['Tanmay Rath', 'tanmay@demo.local', '9876543234', 'Khordha', 'Bhubaneswar', 'Sundarpada, Hi-Tech Plaza', '751002', 20.2450, 85.8200, 3],
    ['Smruti Rekha Jena', 'smruti@demo.local', '9876543235', 'Khordha', 'Bhubaneswar', 'Old Town, Mahatab Road', '751002', 20.2410, 85.8320, 3],
    ['Debabrata Barik', 'debabrata@demo.local', '9876543236', 'Khordha', 'Bhubaneswar', 'Master Canteen, Station Square', '751001', 20.2670, 85.8430, 1],
    ['Gitanjali Mohanty', 'gitanjali@demo.local', '9876543237', 'Khordha', 'Bhubaneswar', 'Baramunda Housing Board Colony', '751003', 20.2760, 85.8080, 2],
    ['Subrat Kumar Sahu', 'subrat@demo.local', '9876543238', 'Khordha', 'Bhubaneswar', 'Aiginia, Near NH-16 Plaza', '751019', 20.2640, 85.7890, 2],
    ['Monali Pradhan', 'monali@demo.local', '9876543239', 'Khordha', 'Bhubaneswar', 'Unit-4, MLA Colony, Bhubaneswar', '751001', 20.2720, 85.8340, 1],
    ['Bibhu Prasad Das', 'bibhu@demo.local', '9876543240', 'Khordha', 'Bhubaneswar', 'Mancheswar Industrial Estate, Sec-A', '751017', 20.3220, 85.8410, 1],
    ['Sarojini Tripathy', 'sarojini@demo.local', '9876543241', 'Khordha', 'Bhubaneswar', 'Kalinga Nagar, K-7 Complex', '751019', 20.2710, 85.7720, 2],
    ['Ashok Kumar Behera', 'ashok.c@demo.local', '9876543242', 'Khordha', 'Bhubaneswar', 'Sailashree Vihar, Phase-7', '751021', 20.3390, 85.8080, 4],
    ['Nirmala Panigrahi', 'nirmala@demo.local', '9876543243', 'Khordha', 'Bhubaneswar', 'Samantarapur, Puri Bypass', '751002', 20.2350, 85.8450, 3],
    ['Deepak Mohanty', 'deepak.c@demo.local', '9876543244', 'Khordha', 'Bhubaneswar', 'Ghatikia, Near CET Campus', '751003', 20.2810, 85.7680, 2],
    ['Archana Rout', 'archana@demo.local', '9876543245', 'Khordha', 'Bhubaneswar', 'Forest Park, Goutam Nagar', '751014', 20.2610, 85.8310, 1],
    ['Prabhat Mishra', 'prabhat@demo.local', '9876543246', 'Khordha', 'Bhubaneswar', 'Kapilaprasad, Pokhariput', '751020', 20.2480, 85.8110, 3],
    ['Rashmita Senapati', 'rashmita@demo.local', '9876543247', 'Khordha', 'Bhubaneswar', 'Dumuduma, Phase-3 Housing', '751019', 20.2520, 85.7820, 2],
    ['Siddharth Verma', 'siddharth@demo.local', '9876543248', 'Khordha', 'Bhubaneswar', 'Kalarahanga, Near KIIT Law', '751024', 20.3680, 85.8210, 4],
    ['Ipsita Pattnaik', 'ipsita@demo.local', '9876543249', 'Khordha', 'Bhubaneswar', 'Bapuji Nagar, Market Building', '751009', 20.2630, 85.8380, 1],

    // Cuttack District (20 Customers: 26 - 45)
    ['Sanjay Das', 'sanjay@demo.local', '9876543212', 'Cuttack', 'Cuttack', 'College Square, Buxi Lane', '753003', 20.4625, 85.8830, 8],
    ['Manas Ranjan Behera', 'manas@demo.local', '9876543218', 'Cuttack', 'Cuttack', 'Badambadi Colony, House 14', '753012', 20.4550, 85.8750, 5],
    ['Swati Samantaray', 'swati@demo.local', '9876543219', 'Cuttack', 'Cuttack', 'CDA Sector 9, Plot 520', '753014', 20.4890, 85.8600, 7],
    ['Kavita Jena', 'kavita@demo.local', '9876543225', 'Cuttack', 'Cuttack', 'Buxi Bazar, Muslim Sahi', '753001', 20.4610, 85.8810, 8],
    ['Subhashree Rout', 'subhashree@demo.local', '9876543226', 'Cuttack', 'Cuttack', 'Cantonment Road, Officer Colony', '753001', 20.4730, 85.8920, 7],
    ['Dillip Kumar Nanda', 'dillip@demo.local', '9876543250', 'Cuttack', 'Cuttack', 'Madhupatna, OMP Colony', '753010', 20.4670, 85.9020, 6],
    ['Jayashree Mahapatra', 'jayashree@demo.local', '9876543251', 'Cuttack', 'Cuttack', 'Tulsipur, Deer Park Enclave', '753008', 20.4780, 85.8650, 7],
    ['Bikram Keshari Swain', 'bikram@demo.local', '9876543252', 'Cuttack', 'Cuttack', 'Link Road, Madhupatna Flyover', '753012', 20.4620, 85.8860, 5],
    ['Rojalin Nayak', 'rojalin@demo.local', '9876543253', 'Cuttack', 'Cuttack', 'Chauliaganj, Railway Colony', '753004', 20.4710, 85.9120, 6],
    ['Abinash Prusty', 'abinash@demo.local', '9876543254', 'Cuttack', 'Cuttack', 'Mahanadi Vihar, MIG-22', '753004', 20.4750, 85.9080, 6],
    ['Minati Sahoo', 'minati.c@demo.local', '9876543255', 'Cuttack', 'Cuttack', 'Chhatra Bazar, Main Mandi', '753003', 20.4650, 85.8900, 8],
    ['Pravat Kumar Das', 'pravat@demo.local', '9876543256', 'Cuttack', 'Cuttack', 'CDA Sector 6, HIG-10', '753014', 20.4920, 85.8540, 7],
    ['Sonali Kar', 'sonali@demo.local', '9876543257', 'Cuttack', 'Cuttack', 'Mangalabag, SCB Medical Road', '753007', 20.4700, 85.8850, 8],
    ['Chittaranjan Jena', 'chitta@demo.local', '9876543258', 'Cuttack', 'Cuttack', 'Ranihat, Medical Road', '753001', 20.4660, 85.8890, 8],
    ['Lipsa Biswal', 'lipsa@demo.local', '9876543259', 'Cuttack', 'Cuttack', 'Jagatpur Industrial Estate, Cuttack', '754021', 20.5050, 85.9220, 6],
    ['Narayan Chandra Sahoo', 'narayan.c@demo.local', '9876543260', 'Cuttack', 'Cuttack', 'Bidanasi, Near Barabati Fort', '753014', 20.4850, 85.8710, 7],
    ['Madhumita Sethi', 'madhu@demo.local', '9876543261', 'Cuttack', 'Cuttack', 'Pithapur, High Court Lane', '753001', 20.4610, 85.8760, 8],
    ['Soumya Ranjan Pal', 'soumya@demo.local', '9876543262', 'Cuttack', 'Cuttack', 'Badambadi, LIC Colony', '753012', 20.4580, 85.8730, 5],
    ['Rita Padhi', 'rita@demo.local', '9876543263', 'Cuttack', 'Cuttack', 'CDA Sector 10, River View', '753014', 20.4950, 85.8620, 7],
    ['Kamalakanta Barik', 'kamal@demo.local', '9876543264', 'Cuttack', 'Cuttack', 'Khannagar, Ring Road', '753012', 20.4510, 85.8810, 5],

    // Puri District (15 Customers: 46 - 60)
    ['Meera Rath', 'meera@demo.local', '9876543213', 'Puri', 'Puri', 'VIP Road, Puri', '752001', 19.8135, 85.8312, 9],
    ['Arvind Panigrahi', 'arvind@demo.local', '9876543220', 'Puri', 'Puri', 'Grand Road, Near Temple Gate', '752001', 19.8050, 85.8200, 9],
    ['Deepa Acharya', 'deepa@demo.local', '9876543221', 'Puri', 'Puri', 'Sea Beach Road, Blue Wave Apt', '752002', 19.7950, 85.8250, 11],
    ['Jagannath Pradhan', 'jagannath@demo.local', '9876543265', 'Puri', 'Puri', 'Baliapanda, Golden Sands Enclave', '752001', 19.7890, 85.8120, 11],
    ['Lopamudra Mishra', 'lopa@demo.local', '9876543266', 'Puri', 'Puri', 'Loknath Road, Near Temple Pond', '752001', 19.8020, 85.8140, 12],
    ['Bhuban Mohan Sahu', 'bhuban@demo.local', '9876543267', 'Puri', 'Konark', 'Marine Drive, Surya Nagar, Konark', '752111', 19.8890, 86.0960, 10],
    ['Namita Senapati', 'namita@demo.local', '9876543268', 'Puri', 'Puri', 'Chakratirtha Road, Holiday Inn Lane', '752002', 19.8140, 85.8450, 11],
    ['Sashikanta Tripathy', 'sashi@demo.local', '9876543269', 'Puri', 'Puri', 'Brahmagiri Highway, West Ward', '752001', 19.8080, 85.8010, 12],
    ['Goutam Mohapatra', 'goutam@demo.local', '9876543270', 'Puri', 'Puri', 'Penthakata, Fishery Jetty Road', '752002', 19.8060, 85.8410, 11],
    ['Anusuya Panda', 'anusuya@demo.local', '9876543271', 'Puri', 'Puri', 'Grand Road, Badasankha Square', '752002', 19.8160, 85.8290, 9],
    ['Hemant Kumar Rath', 'hemant.c@demo.local', '9876543272', 'Puri', 'Konark', 'Konark Sun Temple Heritage Zone', '752111', 19.8860, 86.0920, 10],
    ['Bijayalaxmi Das', 'bijaya@demo.local', '9876543273', 'Puri', 'Puri', 'Sipasarubali, Lighthouse Road', '752001', 19.7910, 85.8190, 11],
    ['Ramesh Chandra Panda', 'ramesh.p@demo.local', '9876543274', 'Puri', 'Puri', 'VIP Road, Police Line Colony', '752002', 19.8190, 85.8340, 9],
    ['Kalyani Swain', 'kalyani@demo.local', '9876543275', 'Puri', 'Puri', 'Balighai, Puri-Konark Marine Road', '752002', 19.8320, 85.8620, 10],
    ['Tapas Kumar Hota', 'tapas@demo.local', '9876543276', 'Puri', 'Puri', 'Brahmagiri Main Bazar, Puri', '752011', 19.7990, 85.7890, 12],
  ];

  for (const c of customerData) {
    users.push([
      c[0], c[1], c[2], salt, 'CUSTOMER', c[3], c[4], c[5], c[6], c[7], c[8], 1, null, 'Citizen Member', c[9]
    ]);
  }

  // ── 84 Multi-Trade Workers (User IDs 61-144) ──
  // 32 in Khordha (Societies 1,2,3,4) + 26 in Cuttack (Societies 5,6,7,8) + 26 in Puri (Societies 9,10,11,12)
  const workerData = [
    // ── Khordha Workers (32 Artisans: IDs 61 - 92) ──
    // HVAC & Appliances (8)
    ['Rajendra Mohapatra (Master HVAC & Inverter Specialist)', 'rajendra.w@demo.local', '9876543301', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751007', 20.2880, 85.8420, 1],
    ['Dilip Barik (AC Installation & Ducting Tech)', 'dilip.w@demo.local', '9876543302', 'Khordha', 'Bhubaneswar', 'Khandagiri, Bhubaneswar', '751030', 20.2570, 85.7750, 2],
    ['Kailash Sahoo (Certified AC Gas Refill & Leak Expert)', 'kailash.w@demo.local', '9876543303', 'Khordha', 'Bhubaneswar', 'Patia, Bhubaneswar', '751024', 20.3540, 85.8170, 4],
    ['Satyajit Mohanty (Microwave & Kitchen Appliance Tech)', 'satyajit.w@demo.local', '9876543306', 'Khordha', 'Bhubaneswar', 'Old Town, Bhubaneswar', '751002', 20.2390, 85.8330, 3],
    ['Ashutosh Das (Inverter AC PCB Diagnostics)', 'ashutosh.w@demo.local', '9876543339', 'Khordha', 'Bhubaneswar', 'Infocity, Patia, Bhubaneswar', '751024', 20.3580, 85.8150, 4],
    ['Dhiren Nayak (Chiller & Heavy AC Specialist)', 'dhiren.w@demo.local', '9876543340', 'Khordha', 'Bhubaneswar', 'Rasulgarh, Bhubaneswar', '751010', 20.3090, 85.8520, 1],
    ['Prasant Swain (Refrigerator & Deep Freezer Tech)', 'prasant.w@demo.local', '9876543341', 'Khordha', 'Bhubaneswar', 'Baramunda, Bhubaneswar', '751003', 20.2750, 85.8090, 2],
    ['Girish Mohapatra (Front-Load Washing Machine Pro)', 'girish.w@demo.local', '9876543342', 'Khordha', 'Bhubaneswar', 'Sundarpada, Bhubaneswar', '751002', 20.2450, 85.8200, 3],

    // Electrical (8)
    ['Ramesh Kumar (Master Electrician)', 'ramesh.w@demo.local', '9876543307', 'Khordha', 'Bhubaneswar', 'Rasulgarh, Bhubaneswar', '751010', 20.3095, 85.8530, 1],
    ['Suresh Behera (Gold Electrician - Inverter & Solar)', 'suresh.w@demo.local', '9876543308', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751007', 20.2870, 85.8450, 1],
    ['Prakash Jena (Apprentice Electrician)', 'prakash.w@demo.local', '9876543309', 'Khordha', 'Bhubaneswar', 'Khandagiri, Bhubaneswar', '751030', 20.2590, 85.7780, 2],
    ['Naveen Jena (EV Charger & 3-Phase Panel Tech)', 'naveen.w@demo.local', '9876543311', 'Khordha', 'Bhubaneswar', 'Patia, Bhubaneswar', '751024', 20.3520, 85.8190, 4],
    ['Bishnu Charan Das (Senior Industrial Electrician)', 'bishnu.w@demo.local', '9876543312', 'Khordha', 'Bhubaneswar', 'Chandrasekharpur, Bhubaneswar', '751016', 20.3350, 85.8100, 4],
    ['Subhendu Nayak (Smart Lighting & Automation)', 'subhendu.w@demo.local', '9876543343', 'Khordha', 'Bhubaneswar', 'Nayapalli, Bhubaneswar', '751012', 20.2840, 85.8050, 2],
    ['Tarun Kanti Sahoo (Underground Cable Fault Specialist)', 'tarun.w@demo.local', '9876543344', 'Khordha', 'Bhubaneswar', 'Old Town, Bhubaneswar', '751002', 20.2410, 85.8320, 3],
    ['Manoj Kumar Tripathy (Earthing & Lightning Arrester Pro)', 'manoj.t@demo.local', '9876543345', 'Khordha', 'Bhubaneswar', 'Unit-4, Bhubaneswar', '751001', 20.2710, 85.8320, 1],

    // Plumbing (8)
    ['Ganesh Pradhan (Master Plumber - Pumps & Concealed)', 'ganesh.w@demo.local', '9876543313', 'Khordha', 'Bhubaneswar', 'Patia, Bhubaneswar', '751024', 20.3540, 85.8170, 4],
    ['Ajay Sahu (Water Tank & Tap Leak Specialist)', 'ajay.w@demo.local', '9876543316', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751007', 20.2880, 85.8420, 1],
    ['Purna Chandra Palei (Emergency Burst Containment)', 'purna.w@demo.local', '9876543318', 'Khordha', 'Bhubaneswar', 'Khandagiri, Bhubaneswar', '751030', 20.2570, 85.7750, 2],
    ['Bhabagrahi Barik (Bathroom Sanity Ware & Geyser Pro)', 'bhabagrahi.w@demo.local', '9876543346', 'Khordha', 'Bhubaneswar', 'Old Town, Bhubaneswar', '751002', 20.2390, 85.8330, 3],
    ['Rupesh Mohanty (Hydrostatic Pressure Testing Tech)', 'rupesh.w@demo.local', '9876543347', 'Khordha', 'Bhubaneswar', 'Infocity, Bhubaneswar', '751024', 20.3580, 85.8150, 4],
    ['Bibhuti Bhusan Pradhan (Sewerage & Trap De-clogging)', 'bibhuti.p@demo.local', '9876543348', 'Khordha', 'Bhubaneswar', 'Aiginia, Bhubaneswar', '751019', 20.2650, 85.8450, 2],
    ['Trilochan Sethi (RO Purifier & Water Softener Tech)', 'trilochan.w@demo.local', '9876543349', 'Khordha', 'Bhubaneswar', 'Master Canteen, Bhubaneswar', '751001', 20.2650, 85.8450, 1],
    ['Jayanta Rout (Solar Water Heater Line Plumber)', 'jayanta.w@demo.local', '9876543350', 'Khordha', 'Bhubaneswar', 'Sundarpada, Bhubaneswar', '751002', 20.2450, 85.8200, 3],

    // Carpentry & Furniture (4)
    ['Mohan Nayak (Silver Carpenter - Modular Kitchens)', 'mohan.w@demo.local', '9876543319', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751007', 20.2870, 85.8450, 1],
    ['Dipti Ranjan (Locksmith & Security Door Specialist)', 'dipti.w@demo.local', '9876543321', 'Khordha', 'Bhubaneswar', 'Khandagiri, Bhubaneswar', '751030', 20.2590, 85.7780, 2],
    ['Pradipta Rout (Wood Finishing & PU Polish Master)', 'pradipta.w@demo.local', '9876543322', 'Khordha', 'Bhubaneswar', 'Old Town, Bhubaneswar', '751002', 20.2410, 85.8320, 3],
    ['Jagannath Sahoo (Flatpack & Wardrobe Specialist)', 'jagannath.w@demo.local', '9876543351', 'Khordha', 'Bhubaneswar', 'Patia, Bhubaneswar', '751024', 20.3520, 85.8190, 4],

    // Painting, Cleaning & Domestic (4)
    ['Biju Sahu (Gold Painter - Interior Emulsion)', 'biju.w@demo.local', '9876543324', 'Khordha', 'Bhubaneswar', 'Khandagiri, Bhubaneswar', '751030', 20.2570, 85.7750, 2],
    ['Subash Naik (Waterproofing & Terrace Coating Expert)', 'subash.w@demo.local', '9876543325', 'Khordha', 'Bhubaneswar', 'Old Town, Bhubaneswar', '751002', 20.2390, 85.8330, 3],
    ['Laxman Biswal (Kitchen & Bathroom Descaling Pro)', 'laxman.w@demo.local', '9876543329', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751007', 20.2880, 85.8420, 1],
    ['Sanatan Behera (Terrace Garden & Drip Irrigation)', 'sanatan.w@demo.local', '9876543333', 'Khordha', 'Bhubaneswar', 'Patia, Bhubaneswar', '751024', 20.3560, 85.8190, 4],

    // ── Cuttack Workers (26 Artisans: IDs 93 - 118) ──
    ['Bhabani Shankar (Appliance & Refrigerator Repairer)', 'bhabani.w@demo.local', '9876543304', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4550, 85.8750, 5],
    ['Rabindra Nath Jena (AC Jet & Cooling Specialist)', 'rabindra.w@demo.local', '9876543352', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4680, 85.9010, 6],
    ['Sarat Chandra Das (Washing Machine Overhaul Pro)', 'sarat.w@demo.local', '9876543353', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Akshaya Muduli (Smart Home & Lighting Electrician)', 'akshaya.w@demo.local', '9876543310', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4630, 85.8820, 8],
    ['Gouranga Charan Sahu (Heavy Distribution Board Tech)', 'gouranga.w@demo.local', '9876543354', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4560, 85.8740, 5],
    ['Debendra Behera (Solar Inverter & DG Panel Tech)', 'debendra.b@demo.local', '9876543355', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4690, 85.9020, 6],
    ['Chittaranjan Sahoo (Domestic Wiring & Fan Repair)', 'chitta.w@demo.local', '9876543356', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4900, 85.8610, 7],
    ['Santosh Mishra (Master Plumber - Drainage & Sewerage)', 'santosh.w@demo.local', '9876543314', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4550, 85.8750, 5],
    ['Kishore Mahapatra (Sanitary Ware & Geyser Plumber)', 'kishore.w@demo.local', '9876543315', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Dhirendra Nath Barik (Cuttack Drain Acoustic Specialist)', 'dhirendra.w@demo.local', '9876543357', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4680, 85.9010, 6],
    ['Prashanta Kumar Jena (Overhead Tank Disinfection Pro)', 'prashanta.w@demo.local', '9876543358', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4620, 85.8830, 8],
    ['Tapan Sethi (Carpenter & Flatpack Furniture Pro)', 'tapan.w@demo.local', '9876543320', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4550, 85.8750, 5],
    ['Bulu Nayak (Teakwood Door & Frame Carpenter)', 'bulu.w@demo.local', '9876543359', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4680, 85.9010, 6],
    ['Pabitra Rout (Modular Kitchen & Sliding Cabinet Maker)', 'pabitra.w@demo.local', '9876543360', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Niranjan Khatua (Heritage Wood Carving Specialist)', 'niranjan.k@demo.local', '9876543361', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4620, 85.8830, 8],
    ['Ranjan Khatua (Exterior Weathercoat & Texture Artist)', 'ranjan.w@demo.local', '9876543326', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4580, 85.8720, 5],
    ['Bijay Kumar Das (Wall Putty & Primer Finishing Pro)', 'bijay.w@demo.local', '9876543327', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4680, 85.9010, 6],
    ['Shankar Prasad Sahoo (Epoxy Grouting & Tile Repair)', 'shankar.w@demo.local', '9876543362', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Minati Barik (Sofa & Upholstery Deep Cleaner)', 'minati.w@demo.local', '9876543330', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4660, 85.8910, 8],
    ['Sudarshan Jena (Certified Pest & Termite Controller)', 'sudarshan.w@demo.local', '9876543331', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4550, 85.8750, 5],
    ['Surendra Nath Parida (Deep Floor Buffing Specialist)', 'surendra.w@demo.local', '9876543363', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Manoranjan Sahu (Senior Landscape Gardener)', 'manoranjan.w@demo.local', '9876543364', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4620, 85.8830, 8],
    ['Basanti Samal (Post-Operative Patient Nursing)', 'basanti.w@demo.local', '9876543365', 'Cuttack', 'Cuttack', 'Badambadi, Cuttack', '753012', 20.4550, 85.8750, 5],
    ['Bhaskar Chandra Rout (Professional Chauffeur)', 'bhaskar.w@demo.local', '9876543366', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4890, 85.8600, 7],
    ['Krupasindhu Biswal (Metal Fabrication & Grille Welder)', 'krupa.w@demo.local', '9876543367', 'Cuttack', 'Cuttack', 'Madhupatna, Cuttack', '753010', 20.4680, 85.9010, 6],
    ['Dukhishyam Naik (Roof Damp Barrier & Crack Filler)', 'dukhishyam.w@demo.local', '9876543368', 'Cuttack', 'Cuttack', 'Buxi Bazar, Cuttack', '753001', 20.4620, 85.8830, 8],

    // ── Puri Workers (26 Artisans: IDs 119 - 144) ──
    ['Hemant Swain (Window & Split AC Servicing)', 'hemant.w@demo.local', '9876543305', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.8120, 85.8320, 9],
    ['Kishore Chandra Panda (Coastal Corrosion AC Tech)', 'kishore.p@demo.local', '9876543369', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Ganeshwar Pradhan (Deep Freeze & Cold Room Tech)', 'ganeshwar.w@demo.local', '9876543370', 'Puri', 'Konark', 'Marine Drive, Konark', '752111', 19.8870, 86.0940, 10],
    ['Anil Kumar Mohapatra (Hotel Kitchen Appliance Specialist)', 'anil.m@demo.local', '9876543371', 'Puri', 'Puri', 'Loknath Road, Puri', '752001', 19.8050, 85.8150, 12],
    ['Biswajit Das (High-Pressure Piping & Coastal Plumbing)', 'biswajit.w@demo.local', '9876543317', 'Puri', 'Puri', 'Grand Road, Puri', '752001', 19.8080, 85.8240, 9],
    ['Kashinath Mishra (Anti-Saline UPVC Line Plumber)', 'kashinath.w@demo.local', '9876543372', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Ramakanta Sahu (Solar Pump & Farm Pipeline Pro)', 'ramakanta.w@demo.local', '9876543373', 'Puri', 'Brahmagiri', 'Loknath Road, Puri', '752001', 19.8050, 85.8150, 12],
    ['Kartik Nayak (Window Mesh & Frame Carpenter)', 'kartik.w@demo.local', '9876543323', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.7990, 85.8150, 9],
    ['Dinabandhu Maharana (Heritage Wood Carver)', 'dinabandhu.w@demo.local', '9876543374', 'Puri', 'Puri', 'Grand Road, Puri', '752001', 19.8060, 85.8220, 9],
    ['Sudhanshu Sekhar Sahoo (Teakwood & Salwood Joiner)', 'sudhanshu.w@demo.local', '9876543375', 'Puri', 'Konark', 'Marine Drive, Konark', '752111', 19.8870, 86.0940, 10],
    ['Balaram Mohapatra (Master Stone Carver & Mason)', 'balaram.w@demo.local', '9876543376', 'Puri', 'Konark', 'Marine Drive, Konark', '752111', 19.8870, 86.0940, 10],
    ['Ghanashyam Dash (Coastal Saline Weathercoat Painter)', 'ghanashyam.w@demo.local', '9876543377', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Narayan Rout (Deep Cleaning & Sanitization Pro)', 'narayan.w@demo.local', '9876543328', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.8100, 85.8380, 11],
    ['Damodar Panda (Temple & Heritage Wash Specialist)', 'damodar.w@demo.local', '9876543378', 'Puri', 'Puri', 'Grand Road, Puri', '752001', 19.8070, 85.8230, 9],
    ['Deepak Swain (Certified Geriatric Caregiver)', 'deepak.w@demo.local', '9876543334', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.8250, 85.8450, 9],
    ['Manoj Dalai (Licensed City & Heritage Tour Chauffeur)', 'manoj.w@demo.local', '9876543336', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7980, 85.8210, 11],
    ['Bichitra Nanda Jena (Submersible Pump & Borewell Tech)', 'bichitra.w@demo.local', '9876543379', 'Puri', 'Brahmagiri', 'Loknath Road, Puri', '752001', 19.8050, 85.8150, 12],
    ['Prasanna Kumar Sahu (Electrical Rewiring & Generator Pro)', 'prasanna.w@demo.local', '9876543380', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.8120, 85.8320, 9],
    ['Nityananda Barik (Hotel Plumbing & Drain Clean Pro)', 'nitya.w@demo.local', '9876543381', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Radhashyam Maharana (Decorative Temple Wood Craftsman)', 'radha.w@demo.local', '9876543382', 'Puri', 'Konark', 'Marine Drive, Konark', '752111', 19.8870, 86.0940, 10],
    ['Kailash Chandra Nayak (Coastal Waterproofing Membrane Pro)', 'kailash.n@demo.local', '9876543383', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Bhagaban Pradhan (Beach Resort Lawn & Coconut Arborist)', 'bhagaban.w@demo.local', '9876543384', 'Puri', 'Konark', 'Marine Drive, Konark', '752111', 19.8870, 86.0940, 10],
    ['Upendra Nath Mohanty (Licensed Highway Chauffeur)', 'upendra.w@demo.local', '9876543385', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.8120, 85.8320, 9],
    ['Harish Chandra Panda (Solar Inverter & Rooftop Technician)', 'harish.w@demo.local', '9876543386', 'Puri', 'Brahmagiri', 'Loknath Road, Puri', '752001', 19.8050, 85.8150, 12],
    ['Dhaneswar Behera (Commercial Carpet & Mattress Steam Pro)', 'dhaneswar.w@demo.local', '9876543387', 'Puri', 'Puri', 'Sea Beach Road, Puri', '752001', 19.7950, 85.8250, 11],
    ['Padmanav Sahoo (Aluminium Partition & Glass Glazier)', 'padmanav.w@demo.local', '9876543388', 'Puri', 'Puri', 'VIP Road, Puri', '752002', 19.8120, 85.8320, 9],
  ];

  for (const w of workerData) {
    users.push([
      w[0], w[1], w[2], salt, 'WORKER', w[3], w[4], w[5], w[6], w[7], w[8], 1, null, 'Certified Artisan', w[9]
    ]);
  }

  // ── Dedicated Federation, DCO & Society Admins (IDs 145+) ──
  const adminUsers = [
    // 1. Apex Federation Head (Statewide jurisdiction across all districts)
    ['Shri Arun Kumar Pattnaik (State Apex Federation Head)', 'fedhead@demo.local', '9876543400', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'State Cooperative Complex, Unit-8, Bhubaneswar', '751012', 20.2900, 85.8200, 1, 'FEDERATION_HEAD', 'Odisha State Apex Federation Head & Secretary', null],

    // 2. District Cooperative Officers (DCOs / District Registrars)
    ['Shri Debendra Nayak (Khordha DCO & District Registrar)', 'dco.khordha@demo.local', '9876543401', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'District Cooperative Office, Saheed Nagar, Bhubaneswar', '751007', 20.2880, 85.8420, 1, 'DCO_REGISTRAR', 'District Cooperative Officer & Registrar, Khordha', null],
    ['Smt. Laxmi Devi (Cuttack DCO & District Registrar)', 'dco.cuttack@demo.local', '9876543402', salt, 'COOPERATIVE_ADMIN', 'Cuttack', 'Cuttack', 'District Cooperative Office, Buxi Bazar, Cuttack', '753001', 20.4620, 85.8830, 1, 'DCO_REGISTRAR', 'District Cooperative Officer & Registrar, Cuttack', null],
    ['Shri Alok Mohapatra (Puri DCO & District Registrar)', 'dco.puri@demo.local', '9876543403', salt, 'COOPERATIVE_ADMIN', 'Puri', 'Puri', 'District Cooperative Office, VIP Road, Puri', '752002', 19.8120, 85.8320, 1, 'DCO_REGISTRAR', 'District Cooperative Officer & Registrar, Puri', null],

    // 3. Society Admins / Secretaries (All 12 Primary Societies)
    ['Bikash Mohanty (Secretary - Shramik Kalyan Samiti)', 'society.khordha@demo.local', '9876543404', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'Saheed Nagar, Bhubaneswar', '751001', 20.2650, 85.8450, 1, 'SOCIETY_ADMIN', 'Secretary, Shramik Kalyan Labour Cooperative Samiti', 1],
    ['Rabindra Nath Jena (Secretary - Kalinga Shramik)', 'society.khandagiri@demo.local', '9876543407', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'Khandagiri Square, Bhubaneswar', '751030', 20.2588, 85.7865, 1, 'SOCIETY_ADMIN', 'Secretary, Kalinga Shramik Seva Sahakari Samiti', 2],
    ['Manoranjan Mishra (Secretary - Ekamra Artisan)', 'society.oldtown@demo.local', '9876543408', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'Ratha Danda, Old Town, Bhubaneswar', '751002', 20.2405, 85.8340, 1, 'SOCIETY_ADMIN', 'Secretary, Ekamra Multi-Trade Artisan Cooperative', 3],
    ['Subrat Kumar Dash (Secretary - Patia Tech-Artisan)', 'society.patia@demo.local', '9876543409', salt, 'COOPERATIVE_ADMIN', 'Khordha', 'Bhubaneswar', 'Infocity Road, Patia, Bhubaneswar', '751024', 20.3540, 85.8190, 1, 'SOCIETY_ADMIN', 'Secretary, Chandaka-Patia Tech-Artisan Cooperative Samiti', 4],
    ['Pratap Rout (Secretary - Utkal Shilpi Seva Samiti)', 'society.cuttack@demo.local', '9876543405', salt, 'COOPERATIVE_ADMIN', 'Cuttack', 'Cuttack', 'Badambadi Colony, Cuttack', '753012', 20.4550, 85.8750, 1, 'SOCIETY_ADMIN', 'Secretary, Utkal Shilpi Seva Sahakari Samiti', 5],
    ['Kishore Chandra Behera (Secretary - Mahanadi Shilpi)', 'society.madhupatna@demo.local', '9876543410', salt, 'COOPERATIVE_ADMIN', 'Cuttack', 'Cuttack', 'Madhupatna Square, Cuttack', '753010', 20.4490, 85.8920, 1, 'SOCIETY_ADMIN', 'Secretary, Mahanadi Shilpi Sahakari Samiti', 6],
    ['Ashok Kumar Samal (Secretary - Barabati Urban Crafts)', 'society.cda@demo.local', '9876543411', salt, 'COOPERATIVE_ADMIN', 'Cuttack', 'Cuttack', 'CDA Sector 9, Cuttack', '753014', 20.4850, 85.8350, 1, 'SOCIETY_ADMIN', 'Secretary, Barabati Urban Crafts & Maintenance Cooperative', 7],
    ['Purna Chandra Sahoo (Secretary - Silver City Guild)', 'society.silvercity@demo.local', '9876543412', salt, 'COOPERATIVE_ADMIN', 'Cuttack', 'Cuttack', 'Buxi Bazar Heritage Lane, Cuttack', '753001', 20.4630, 85.8840, 1, 'SOCIETY_ADMIN', 'Secretary, Silver City Artisan Guild Cooperative', 8],
    ['Bibhuti Bhusan Sahoo (President - Jagannath Nirman)', 'society.puri@demo.local', '9876543406', salt, 'COOPERATIVE_ADMIN', 'Puri', 'Puri', 'VIP Road, Near Bus Stand, Puri', '752002', 19.8050, 85.8200, 1, 'SOCIETY_ADMIN', 'President, Jagannath Nirman Sahakari Federation', 9],
    ['Gopinath Mohapatra (Secretary - Konark Karigar)', 'society.konark@demo.local', '9876543413', salt, 'COOPERATIVE_ADMIN', 'Puri', 'Konark', 'Sun Temple Commercial Plaza, Konark', '752111', 19.8876, 86.0945, 1, 'SOCIETY_ADMIN', 'Secretary, Konark Karigar Sahakari Samiti', 10],
    ['Damodar Pradhan (Secretary - Srikshetra Coastal)', 'society.seabeach@demo.local', '9876543414', salt, 'COOPERATIVE_ADMIN', 'Puri', 'Puri', 'Sea Beach Road, Baliapanda, Puri', '752001', 19.7980, 85.8250, 1, 'SOCIETY_ADMIN', 'Secretary, Srikshetra Coastal Facility Cooperative Samiti', 11],
    ['Laxmidhar Swain (Secretary - Brahmagiri Rural)', 'society.brahmagiri@demo.local', '9876543415', salt, 'COOPERATIVE_ADMIN', 'Puri', 'Brahmagiri', 'Chilika Lake Road, Brahmagiri', '752001', 19.8000, 85.6700, 1, 'SOCIETY_ADMIN', 'Secretary, Brahmagiri Rural Artisan & Craft Cooperative', 12],
  ];

  users.push(...adminUsers);

  for (const u of users) {
    await query(
      `INSERT INTO users (name, email, phone, password, role, district, city, address, pincode, latitude, longitude, is_active, admin_type, designation, society_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      u
    );
  }

  // =============================================
  // 4. Worker Profiles (84 Workers)
  // =============================================
  // Map 84 workers to their user records (user_id = 61 to 144)
  for (let i = 0; i < workerData.length; i++) {
    const w = workerData[i];
    const userId = 61 + i;
    const workerCode = `WKR-OD-${1001 + i}`;
    const societyId = w[9];
    const coopId = societyId;
    const exp = 3 + (i % 12);
    const rating = Math.round((4.6 + (i % 5) * 0.1) * 10) / 10;
    const totalReviews = 18 + (i * 3) % 55;
    const jobsDone = totalReviews - Math.floor(Math.random() * 3);
    const earnings = jobsDone * 2800;
    const tier = exp >= 10 ? 'MASTER' : exp >= 6 ? 'GOLD' : exp >= 4 ? 'SILVER' : 'BRONZE';
    const merit = 600 + (exp * 35);
    const isPending = (i > 0 && i % 7 === 0);
    const vStatus = isPending ? 'PENDING' : 'VERIFIED';
    const toolkitCompliance = vStatus === 'VERIFIED' ? 'VERIFIED_EQUIPPED' : 'PENDING';
    const avail = isPending ? 'OFFLINE' : (i % 6 === 0 ? 'BUSY' : 'AVAILABLE');

    // Extract trade from name or index
    let trade = 'Appliance Repair';
    if (w[0].includes('Electrician') || w[0].includes('Wiring') || w[0].includes('Solar') || w[0].includes('Lighting') || w[0].includes('Panel')) trade = 'Electrical';
    else if (w[0].includes('Plumb') || w[0].includes('Pipe') || w[0].includes('Leak') || w[0].includes('Geyser') || w[0].includes('Drain') || w[0].includes('Tank')) trade = 'Plumbing';
    else if (w[0].includes('Carpent') || w[0].includes('Wood') || w[0].includes('Furniture') || w[0].includes('Lock') || w[0].includes('Mesh') || w[0].includes('Cabinet')) trade = 'Carpentry';
    else if (w[0].includes('Paint') || w[0].includes('Waterproof') || w[0].includes('Coat') || w[0].includes('Putty') || w[0].includes('Grout')) trade = 'Painting';
    else if (w[0].includes('Clean') || w[0].includes('Pest') || w[0].includes('Termite') || w[0].includes('Descaling') || w[0].includes('Wash')) trade = 'Cleaning';
    else if (w[0].includes('Garden') || w[0].includes('Irrigation') || w[0].includes('Arborist')) trade = 'Gardening';
    else if (w[0].includes('Caregiver') || w[0].includes('Nursing')) trade = 'Caregiving';
    else if (w[0].includes('Chauffeur')) trade = 'Driving';

    await query(
      `INSERT INTO workers (
        user_id, worker_code, cooperative_id, experience_years, service_area,
        latitude, longitude, verification_status, toolkit_compliance, availability, rating,
        total_reviews, total_jobs_completed, total_earnings, bio, tier,
        merit_points, strike_count, sos_active, primary_trade, society_id,
        is_nlcf_affiliated, is_ncct_certified, tools_owned, federation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
      [
        userId, workerCode, coopId, exp, w[4],
        w[7], w[8], vStatus, toolkitCompliance, avail, rating,
        totalReviews, jobsDone, earnings, `${w[0]} with verified cooperative guild credentials in ${w[4]}.`,
        tier, merit, 0, 0, trade, societyId,
        1, (i % 2 === 0 ? 1 : 0),
        toolkitCompliance === 'VERIFIED_EQUIPPED' ? 'Standard ISI Certified Trade Toolkit & Safety Kit' : null,
        1
      ]
    );
  }

  // =============================================
  // 5. Skills Taxonomy (45 Granular Skills)
  // =============================================
  const skills = [
    // AC & Appliance Repair (Skills 1-10)
    ['Split AC Deep Jet Service', 'Appliance Repair', 'Indoor and outdoor unit pressure jet washing and disinfection'],
    ['Split AC Installation', 'Appliance Repair', 'Mounting, copper piping, vacuuming and commissioning of split ACs'],
    ['AC Gas Leak & Refilling', 'Appliance Repair', 'Nitrogen pressure leak detection and R32/R410A gas charging'],
    ['Inverter AC PCB Diagnostics', 'Appliance Repair', 'Circuit board troubleshooting, IPM sensor and capacitor repair'],
    ['Window AC Servicing', 'Appliance Repair', 'Chemical wash, fan motor inspection, and cooling test'],
    ['AC Uninstallation & Safe Pump-Down', 'Appliance Repair', 'Refrigerant gas lock, bracket removal, and transport packaging'],
    ['Double-Door Refrigerator Repair', 'Appliance Repair', 'Defrost timer, bi-metal thermostat, and compressor replacement'],
    ['Single-Door Refrigerator Repair', 'Appliance Repair', 'Capillary tube unclogging, thermostat and relay fixing'],
    ['Fully-Automatic Washing Machine Repair', 'Appliance Repair', 'Inlet valve, drum bearing, and electronic error clearing'],
    ['Microwave Oven Magnetron Repair', 'Appliance Repair', 'High-voltage diode, capacitor, and touchpad membrane service'],

    // Electrical (Skills 11-18)
    ['Switch & Socket Replacement', 'Electrical', 'Anchor/Havells modular switch, multi-plug socket, and gang box fitting'],
    ['Ceiling Fan Installation & Repair', 'Electrical', 'Downrod mounting, capacitor replacement, and winding overhaul'],
    ['MCB & Distribution Board Fitting', 'Electrical', 'Trip testing, single/three-phase MCB replacement, and load balancing'],
    ['Inverter & Battery Wiring Setup', 'Electrical', 'Tubular battery terminal crimping, trolley setup, and bypass switch wiring'],
    ['Concealed Copper House Wiring', 'Electrical', 'PVC conduit wall chasing, FR multi-strand copper wire pulling, and earthing'],
    ['Chandelier & Decorative Profile Light Fitting', 'Electrical', 'Ceiling anchor bolt drilling, dimmer integration, and LED driver wiring'],
    ['EV Charger Dedicated Line Installation', 'Electrical', '32A industrial socket, 6 sq.mm copper run, and independent earth pit test'],
    ['Short Circuit & Earth Leakage Diagnostics', 'Electrical', 'Megger insulation resistance testing and neutral loop fault identification'],

    // Plumbing (Skills 19-26)
    ['Tap & Spout Ceramic Valve Repair', 'Plumbing', 'Spindle disc replacement, PTFE teflon sealing, and aerator de-liming'],
    ['EWC Western Commode & Cistern Installation', 'Plumbing', 'Dual-flush syphon valve fitting, wax gasket seal, and soft-close seat setup'],
    ['Water Tank High-Pressure Cleaning', 'Plumbing', 'Sludge evacuation, rotary brush scrubbing, and UV/chlorine disinfection'],
    ['Overhead Tank Float Valve & Booster Pump', 'Plumbing', 'Brass ballcock replacement and 0.5HP/1HP automatic pressure controller hookup'],
    ['Bathroom Concealed Diverter Overhaul', 'Plumbing', 'Grohe/Jaquar cartridge replacement, faceplate alignment, and leak check'],
    ['Blocked Drain & Sewer Pipe De-clogging', 'Plumbing', 'Flexible steel snake auger rotation and enzymatic clog digestion'],
    ['Storage Geyser Plumbing Connection', 'Plumbing', '25L multi-mount heater inlet/outlet SS braided hose and non-return valve setup'],
    ['Emergency Main Pipe Burst Containment', 'Plumbing', 'Quick-compression clamp application and bypass CPVC/GI line coupling'],

    // Carpentry (Skills 27-31)
    ['Flatpack Furniture Assembly', 'Carpentry', 'Modular bed, wardrobe, computer desk, and bookshelf cam-lock assembly'],
    ['Security Door Lock & Mortise Fitting', 'Carpentry', 'Godrej multi-bolt lock mortise chiseling, cylinder keying, and latch strike adjustment'],
    ['Modular Kitchen Cabinet Hydraulic Hinge', 'Carpentry', 'Soft-close clip-on hinge alignment and drawer telescopic channel tuning'],
    ['Wooden Door Planing & Alignment', 'Carpentry', 'Jack plane edge shaving, jamb shimming, and floor clearance adjustment'],
    ['Aluminium Window Sliding & Mosquito Mesh', 'Carpentry', 'Bearing roller replacement, felt weatherstripping, and SS-304 mesh spline fitting'],

    // Painting & Waterproofing (Skills 32-36)
    ['Interior Luxury Emulsion Painting', 'Painting', 'Acrylic wall putty leveling, primer coat, and double roller finish with Asian Paints Royale'],
    ['Terrace Chemical Waterproofing Membrane', 'Painting', 'PU elastomeric membrane application, fiberglass reinforcement, and ponding flood test'],
    ['Exterior Weathercoat Anti-Fungal Coating', 'Painting', 'High-pressure wall power washing, anti-algae biocide wash, and Apex Ultima application'],
    ['Wall Putty & Surface Crack Filling', 'Painting', 'Polymer modified crack filler injection and 120/180 grit smooth machine sanding'],
    ['Wood French Spirit Polish & PU Lacquer', 'Painting', 'Shellac hand buffing, teak grain staining, and two-pack clear polyurethane spray'],

    // Cleaning & Pest Control (Skills 37-41)
    ['Full Home Deep Sanitization', 'Cleaning', 'Single-disc floor rotary scrubbing, HEPA vacuuming, and chemical surface disinfection'],
    ['Kitchen Degreasing & Chimney Chemical Wash', 'Cleaning', 'Caustic degreaser spray on baffle filters, exhaust rotor de-carbonizing, and tile steam wipe'],
    ['Bathroom Acid Descaling & Tile Scrubbing', 'Cleaning', 'Mineral limescale removal from sanitary fixtures, glass cubicle polish, and grout sanitization'],
    ['Sofa & Upholstery Injection-Extraction Foam Wash', 'Cleaning', 'Fabric shampoo spray, rotary brush agitation, and wet vacuum moisture extraction'],
    ['Herbal Gel Pest & Termite Drill-Fill Treatment', 'Cleaning', 'Fipronil odorless cockroach gel baiting and chlorpyrifos sub-slab perimeter drilling'],

    // Gardening, Caregiving, Driving & Domestic (Skills 42-45)
    ['Lawn Mowing & Landscape Horticulture', 'Gardening', 'Grass edging, rose bed pruning, organic vermicompost fertilization, and weed pulling'],
    ['Terrace Garden & Micro Drip Irrigation Setup', 'Gardening', '4mm feeder line routing, adjustable dripper emitters, and 24-hour battery timer tap hookup'],
    ['Elderly Bedside Assistance & Vital Monitoring', 'Caregiving', 'Blood pressure / SpO2 / glucometer tracking, ambulation support, and medication schedule'],
    ['City & Outstation Chauffeur Service', 'Driving', 'Manual and automatic transmission driving, defensive city routing, and pre-drive safety check'],
  ];

  for (const s of skills) {
    await query(`INSERT INTO skills (name, category, description) VALUES ($1, $2, $3)`, s);
  }

  // =============================================
  // 6. Map Skills to Workers (Batched)
  // =============================================
  const wsRows = [];
  const wsParams = [];
  let wsIdx = 1;
  for (let wId = 1; wId <= 84; wId++) {
    let skillIds = [1, 2, 3];
    if (wId >= 9 && wId <= 16) skillIds = [11, 12, 13];
    else if (wId >= 17 && wId <= 24) skillIds = [19, 20, 26];
    else if (wId >= 25 && wId <= 28) skillIds = [27, 28, 29];
    else if (wId >= 29 && wId <= 32) skillIds = [32, 33, 37];
    else if (wId >= 33 && wId <= 39) skillIds = [1, 7, 9];
    else if (wId >= 40 && wId <= 46) skillIds = [11, 14, 17];
    else if (wId >= 47 && wId <= 54) skillIds = [19, 21, 24];
    else if (wId >= 55 && wId <= 61) skillIds = [27, 30, 31];
    else if (wId >= 62 && wId <= 68) skillIds = [32, 34, 38];
    else if (wId >= 69 && wId <= 75) skillIds = [1, 3, 5];
    else if (wId >= 76 && wId <= 84) skillIds = [11, 13, 19, 26];

    for (const sid of skillIds) {
      wsRows.push(`($${wsIdx++}, $${wsIdx++}, $${wsIdx++})`);
      wsParams.push(wId, sid, 'EXPERT');
    }
  }
  await query(
    `INSERT INTO worker_skills (worker_id, skill_id, proficiency_level) VALUES ${wsRows.join(', ')} ON CONFLICT DO NOTHING`,
    wsParams
  );

  // =============================================
  // 7. Services Catalog (47 Granular Services - Batched)
  // =============================================
  const services = [
    // 1-8: AC & Appliance Repair
    ['Split AC Deep Jet Cleaning & Service', 'Appliance Repair', 'High-pressure indoor & outdoor unit coil wash, drain tray sterilization & blower fan sanitization', 449, 'per_unit', 45, 'Snowflake'],
    ['Split AC Installation (New/Relocation)', 'Appliance Repair', 'Heavy-duty iron bracket mounting, copper piping, flare connection, nitrogen leak check & vacuuming', 799, 'per_unit', 90, 'Snowflake'],
    ['AC Gas Leak Repair & Refilling', 'Appliance Repair', 'Nitrogen high-pressure leak testing, brazing, system vacuumization & R32/R410A gas top-up', 1499, 'per_visit', 120, 'Wind'],
    ['Inverter AC PCB Diagnostics & Repair', 'Appliance Repair', 'Inverter circuit board troubleshooting, IPM sensor, capacitor & microcontroller diagnosis', 899, 'per_unit', 90, 'Settings'],
    ['Double-Door Refrigerator Cooling & Gas Charge', 'Appliance Repair', 'Compressor relay, defrost thermostat replacement, capillary tube & eco refrigerant charging', 749, 'per_visit', 90, 'Wrench'],
    ['Fully-Automatic Washing Machine Repair', 'Appliance Repair', 'Drum bearing balancing, inlet water solenoid & electronic drain pump overhaul', 449, 'per_visit', 60, 'Wrench'],
    ['Kitchen Chimney & Hob Deep Degreasing', 'Appliance Repair', 'Baffle filter caustic degreasing, motor carbon cleaning, blower rotor & suction check', 599, 'per_service', 75, 'Wrench'],
    ['Microwave Oven Magnetron & Touchpad Service', 'Appliance Repair', 'Magnetron emission testing, high-voltage diode replacement & membrane touch switch repair', 349, 'per_visit', 45, 'Wrench'],

    // 9-17: Electrical
    ['Switch, Socket & Modular Plate Replacement', 'Electrical', 'Fire-resistant ISI certified modular switch/socket replacement with load verification', 129, 'per_point', 30, 'Zap'],
    ['Ceiling Fan Installation & Overhaul', 'Electrical', 'Downrod ceiling anchor fitting, heavy capacitor upgrade & noise-free dynamic blade balancing', 179, 'per_fan', 40, 'Wind'],
    ['Main MCB & Distribution Board Replacement', 'Electrical', 'Short circuit protection, 32A/63A DP isolator & modular miniature circuit breaker wiring', 499, 'per_board', 75, 'Zap'],
    ['Inverter & Battery Home Wiring Setup', 'Electrical', 'Tubular battery acid terminal conditioning, heavy copper wiring & bypass switch integration', 599, 'per_setup', 90, 'Zap'],
    ['Complete House Concealed Rewiring', 'Electrical', 'Wall chasing, PVC conduit routing, FR multi-strand copper wire pulling & earth resistance test', 1999, 'per_sqft', 480, 'Zap'],
    ['Chandelier & Designer Pendant Light Fitting', 'Electrical', 'Ceiling rawl plug anchor drilling, counterweight balancing & multi-tier chandelier assembly', 399, 'per_light', 60, 'Zap'],
    ['EV Four-Wheeler Home Charger Line (7.4kW)', 'Electrical', 'Dedicated 40A MCB, 10 sq.mm heavy cable run & dedicated copper chemical earth electrode pit', 1799, 'per_setup', 180, 'Zap'],
    ['Electric Geyser Fast Heating Diagnostic & Repair', 'Electrical', 'Incoloy heating element replacement, dual thermostat calibration & earth leakage testing', 299, 'per_visit', 45, 'Zap'],
    ['Emergency Electrical Short Circuit Diagnostics', 'Electrical', 'Megger insulation testing, burnt wire replacement & emergency circuit isolation', 399, 'per_visit', 45, 'Zap'],

    // 18-25: Plumbing
    ['Tap, Spout & Flush Valve Leak Repair', 'Plumbing', 'Brass spindle cartridge replacement, ceramic disc renewal & teflon high-pressure thread seal', 129, 'per_tap', 30, 'Droplets'],
    ['Western Commode EWC & Cistern Installation', 'Plumbing', 'Floor waste pipe wax ring seal, soft-close hydraulic seat cover & dual-flush tank assembly', 649, 'per_unit', 90, 'Droplets'],
    ['Overhead Water Tank High-Pressure Disinfection', 'Plumbing', 'Automated sludge evacuation, rotary nylon jet scrubbing & non-toxic UV/chlorine sanitization', 549, 'per_tank', 60, 'Droplets'],
    ['Automatic Water Booster Pump Installation', 'Plumbing', '0.5HP-1.0HP self-priming pressure pump hookup with flow sensor & anti-vibration rubber pads', 699, 'per_unit', 90, 'Droplets'],
    ['Bathroom Multi-Flow Concealed Diverter Overhaul', 'Plumbing', 'Jaquar/Grohe cartridge replacement, brass sleeve greasing & mixer diverter recalibration', 399, 'per_unit', 60, 'Droplets'],
    ['Blocked Drain & Sewer Pipe De-clogging', 'Plumbing', 'Heavy mechanical steel snake auger insertion & high-flow pressurized drain jetting', 349, 'per_drain', 45, 'Droplets'],
    ['Water Purifier RO + UV Complete Filter Replacement', 'Plumbing', 'Sediment filter, pre-carbon block, 75 GPD membrane replacement & TDS balancing test', 599, 'per_service', 60, 'Droplets'],
    ['Emergency 60-Min Main Pipe Burst Containment', 'Plumbing', 'Rapid on-site emergency water cutoff, compression coupling & CPVC line repair', 499, 'per_visit', 45, 'Droplets'],

    // 26-31: Carpentry
    ['Flatpack Furniture Assembly (Bed, Wardrobe, Desk)', 'Carpentry', 'IKEA/Pepperfry flatpack cam-lock joinery, drawer slide alignment & leveling', 499, 'per_item', 90, 'Hammer'],
    ['High-Security Main Door Mortise Lock Fitting', 'Carpentry', 'Godrej/Yale 6-lever mortise lock cavity mortising, cylinder keying & striker alignment', 349, 'per_lock', 60, 'Hammer'],
    ['Modular Kitchen Soft-Close Hydraulic Hinge Upgrade', 'Carpentry', 'Clip-on hydraulic soft-close hinge fitting, shutter plumb alignment & magnetic catches', 249, 'per_cabinet', 45, 'Hammer'],
    ['Wooden Door Planing, Trimming & Floor Clearance', 'Carpentry', 'Power planer edge leveling, jamb recess shimming & brass butt hinge lubrication', 229, 'per_door', 45, 'Hammer'],
    ['Aluminium Sliding Window Roller & Track Overhaul', 'Carpentry', 'Bearing wheel renewal, aluminium anodized track cleaning & nylon brush weatherstripping', 279, 'per_window', 45, 'Hammer'],
    ['Premium French Spirit & Wood PU Clear Polish', 'Carpentry', 'Shellac hand pad buffing, grain filler staining & dual-coat polyurethane protective coat', 35, 'per_sqft', 120, 'Hammer'],

    // 32-36: Painting & Waterproofing
    ['Interior Luxury Silk Emulsion Painting', 'Painting', 'Acrylic wall putty base leveling, primer seal & dual-coat Asian Paints Royale silk finish', 11, 'per_sqft', 240, 'Paintbrush'],
    ['Terrace Chemical Elastomeric Waterproofing', 'Painting', 'Fiberglass mesh reinforcement, crack sealing & 3-layer UV reflective polymer membrane coat', 28, 'per_sqft', 360, 'Paintbrush'],
    ['Exterior Anti-Fungal Weathercoat Painting', 'Painting', 'High-pressure water blaster moss removal, biocide wash & dirt-pick-resistant exterior coat', 14, 'per_sqft', 300, 'Paintbrush'],
    ['Wall Putty Application & Machine Sanding', 'Painting', 'Two coats of waterproof white cement putty followed by 180-grit vacuum sander smoothing', 7, 'per_sqft', 180, 'Paintbrush'],
    ['Seepage Damp Treatment with Injection Grouting', 'Painting', 'PU chemical foam wall crack injection & moisture barrier hydrophobic plaster treatment', 48, 'per_sqft', 240, 'Paintbrush'],

    // 37-41: Cleaning & Pest Control
    ['Full Apartment Deep Machine Cleaning', 'Cleaning', 'Single-disc rotary floor buffing, vacuuming, window track cleaning & chemical sanitization', 1499, 'per_apartment', 240, 'SprayCan'],
    ['Intensive Kitchen Oil & Grease Descaling', 'Cleaning', 'Industrial food-grade chemical degreaser on ceramic tiles, cooktop, slab & exhaust vent', 699, 'per_kitchen', 120, 'SprayCan'],
    ['Bathroom Acid Free Descaling & Grout Restoration', 'Cleaning', 'Limescale dissolution from glass partitions, chrome taps & high-pressure tile steam scrubbing', 399, 'per_bathroom', 60, 'SprayCan'],
    ['Sofa & Mattress Foam Shampoo & Extraction Wash', 'Cleaning', 'German injection-extraction deep foam wash for dust-mite elimination & stain removal', 499, 'per_sofa_set', 75, 'SprayCan'],
    ['Odorless Herbal Gel Cockroach & Pest Barrier', 'Cleaning', 'Fipronil herbal bait dots across kitchen cabinets, drain perimeters & 90-day protection warranty', 599, 'per_home', 60, 'SprayCan'],

    // 42-47: Specialized
    ['Lawn Mowing & Landscape Shrub Pruning', 'Gardening', 'Motorized lawn mower trimming, boundary hedge shaping, aerating & vermicompost feeding', 349, 'per_garden', 90, 'Flower2'],
    ['Terrace Garden Micro Drip Automation Setup', 'Gardening', 'Automated timer valve hookup, 16mm LDPE main line & individual potted plant micro drippers', 999, 'per_terrace', 120, 'Flower2'],
    ['Elderly Bedside Attendant (Daily Day Care)', 'Caregiving', 'Patient mobility assistance, vitals monitoring (BP, SpO2, Sugar), hygiene & medicine compliance', 699, 'per_day', 480, 'HeartPulse'],
    ['Post-Operative Dressing & Injection Nursing Visit', 'Caregiving', 'Sterile wound surgical dressing, IV line check, vitals documentation & nursing report', 249, 'per_visit', 45, 'HeartPulse'],
    ['Professional City Chauffeur (8-Hour Shift)', 'Driving', 'Background-verified licensed chauffeur for manual and automatic luxury / hatchback cars', 599, 'per_day', 480, 'Car'],
    ['Outstation Long-Distance Highway Chauffeur', 'Driving', 'Expert highway driver with all-India permit credentials & night-driving endurance', 899, 'per_day', 600, 'Car'],
  ];

  const sRows = [];
  const sParams = [];
  let spIdx = 1;
  for (const s of services) {
    sRows.push(`($${spIdx++}, $${spIdx++}, $${spIdx++}, $${spIdx++}, $${spIdx++}, $${spIdx++}, $${spIdx++}, 1)`);
    sParams.push(s[0], s[1], s[2], s[3], s[4], s[6], s[5] > 90 ? 1 : 0);
  }
  await query(
    `INSERT INTO services (name, category, description, base_price, price_unit, icon, is_complex, is_active) VALUES ${sRows.join(', ')}`,
    sParams
  );

  // =============================================
  // 8. Society Founding Members (12 Societies x 10 = 120 Members - Batched)
  // =============================================
  const occupations = ['Senior Electrician', 'Master Plumber', 'HVAC Technician', 'Cabinet Maker', 'Master Mason', 'Painter', 'Electronics Tech', 'Sanitation Pro', 'Gardener', 'Toolmaker'];
  const mRows = [];
  const mParams = [];
  let mpIdx = 1;
  for (let socId = 1; socId <= 12; socId++) {
    for (let m = 1; m <= 10; m++) {
      const role = m === 1 ? 'PRESIDENT' : m === 2 ? 'SECRETARY' : m === 3 ? 'TREASURER' : 'MEMBER';
      const name = `Promoter Member ${m} (Society ${socId})`;
      const occ = occupations[m - 1];
      const phone = `98765${socId.toString().padStart(2, '0')}${m.toString().padStart(3, '0')}`;
      const aadhaar = `XXXX-XXXX-${socId.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
      mRows.push(`($${mpIdx++}, $${mpIdx++}, $${mpIdx++}, $${mpIdx++}, $${mpIdx++}, $${mpIdx++}, $${mpIdx++}, 1)`);
      mParams.push(socId, name, occ, `Cooperative Ward Cluster, Society ${socId}`, phone, aadhaar, role);
    }
  }
  await query(
    `INSERT INTO society_founding_members (society_id, full_name, occupation, address, phone, aadhaar_number, role_in_society, is_signatory) VALUES ${mRows.join(', ')}`,
    mParams
  );

  // =============================================
  // 9. Society Statutory Documents (12 Societies x 6 = 72 Documents - Batched)
  // =============================================
  const docTemplates = [
    ['APPLICATION_FORM', 'Form No. 1 - Registered Society Charter Application', 'https://gov.in/docs/form1.pdf'],
    ['MEMBER_LIST', 'Official Founding Member List & Identity Verification Roster', 'https://gov.in/docs/roster.pdf'],
    ['BYLAWS', 'Model Cooperative Bylaws adopted under Odisha Cooperative Societies Act', 'https://gov.in/docs/bylaws.pdf'],
    ['RESOLUTION_OF_FORMATION', 'Minutes of First General Body Formation Resolution', 'https://gov.in/docs/resolution.pdf'],
    ['BANK_CERTIFICATE', 'Central Cooperative Bank Balance Certificate & Capital Proof', 'https://gov.in/docs/bank_cert.pdf'],
    ['AFFIDAVIT', 'Chief Promoter Non-Judicial Sworn Statutory Affidavit', 'https://gov.in/docs/affidavit.pdf'],
  ];

  const dRows = [];
  const dParams = [];
  let dpIdx = 1;
  for (let socId = 1; socId <= 12; socId++) {
    const isActive = [1, 3, 5, 7, 10, 11].includes(socId);
    const status = isActive ? 'VERIFIED' : 'PENDING';
    const officer = isActive ? (socId <= 4 ? 'Shri Debendra Nayak (DCO)' : socId <= 8 ? 'Smt. Laxmi Devi (DCO)' : 'Shri Alok Mohapatra (DCO)') : null;

    for (const dt of docTemplates) {
      dRows.push(`($${dpIdx++}, $${dpIdx++}, $${dpIdx++}, $${dpIdx++}, $${dpIdx++}, $${dpIdx++}, $${dpIdx++})`);
      dParams.push(socId, dt[0], `${dt[1]} (Soc #${socId})`, dt[2], status, officer, isActive ? new Date() : null);
    }
  }
  await query(
    `INSERT INTO society_statutory_documents (society_id, doc_type, document_name, document_url, verification_status, verified_by_officer, verified_at) VALUES ${dRows.join(', ')}`,
    dParams
  );

  // =============================================
  // 10. Society Regulatory Inquiries (Section 68 - 1 per district)
  // =============================================
  const inquiries = [
    [1, 'Khordha', 'SEC68-KHD-2026-004', 'SECTION_68', 'Territorial jurisdiction review over Saheed Nagar plumbing cluster', 'Niranjan Swain (President)', 'Local Unaffiliated Guild', 'HEARING_SCHEDULED', '2026-09-28', 'DCO Khordha issued formal summons for conciliation under Sec 68.'],
    [5, 'Cuttack', 'SEC68-CTC-2026-002', 'SECTION_68', 'Artisan tool subsidy allocation audit appeal', 'Badambadi Woodwork Chapter', 'Utkal Shilpi Seva Samiti', 'HEARING_SCHEDULED', '2026-10-05', 'DCO Cuttack scheduled conciliation hearing under Sec 68.'],
    [9, 'Puri', 'SEC68-PRI-2026-001', 'SECTION_68', 'Coastal maintenance tariff standardization inquiry', 'Sea Beach Hotel Association', 'Jagannath Nirman Sahakari Federation', 'HEARING_SCHEDULED', '2026-10-12', 'DCO Puri scheduled hearing for fair tariff review.'],
  ];

  for (const inq of inquiries) {
    await query(
      `INSERT INTO society_regulatory_inquiries (society_id, district, case_number, section, title, complainant, respondent, status, next_hearing_date, dco_remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      inq
    );
  }

  // =============================================
  // 11. Society Treasury Ledger Entries (Batched)
  // =============================================
  const lRows = [];
  const lParams = [];
  let lpIdx = 1;
  for (let socId = 1; socId <= 12; socId++) {
    lRows.push(`($${lpIdx++}, $${lpIdx++}, 'TREASURY_DEPOSIT', 50000.0, 'Initial Share Capital Contribution from Founding Artisan Members', 50000.0)`);
    lParams.push(socId, `TXN-CAP-2024-${100 + socId}`);
  }
  await query(
    `INSERT INTO society_treasury_ledger (society_id, transaction_code, transaction_type, amount, description, balance_after) VALUES ${lRows.join(', ')}`,
    lParams
  );

  // =============================================
  // 12. Mandatory Trade Toolkits & Cooperative Store
  // =============================================
  const toolkits = [
    {
      trade_category: 'Electrical',
      kit_name: 'Pradhan Mantri Kaushal ISI Electrical Safety & Diagnostic Toolkit',
      description: 'Official Federation-certified professional electrical toolkit. All insulated hand tools meet IS 13778 / IEC 60900 1000V high-voltage protection standards.',
      items_included: JSON.stringify([
        { item: '1000V VDE Insulated Plier & Screwdriver Set (7-Pc)', standard: 'IS 13778 / IEC 60900', mandatory: true },
        { item: 'Digital True-RMS Auto-Ranging Multimeter with Temp Probe', standard: 'CAT III 600V / ISI Certified', mandatory: true },
        { item: 'Heavy-Duty 800W Rotary SDS Hammer Drill + 5 Masonry Bits', standard: 'BIS Certified Industrial Class', mandatory: true },
        { item: 'Non-Contact AC Voltage Detector (90V-1000V) with Flashlight', standard: 'CAT IV 1000V Audible/Visual', mandatory: true },
        { item: 'High-Impact Fibre Safety Hardhat & 1000V Dielectric Gloves', standard: 'IS 2925 & IS 4770 Class 0', mandatory: true },
        { item: 'High-Tensile Spring Steel Conduit Wire Puller (30 Meters)', standard: 'Standard Artisan Guild Spec', mandatory: true },
        { item: '500V Insulation Resistance Megger Tester', standard: 'IS 11994 High Voltage Standard', mandatory: true },
        { item: 'Magnetic Torpedo Bubble Spirit Level (9 Inch 3-Vial)', standard: 'Precision Calibrated', mandatory: false },
      ]),
      market_price: 8500.0, subsidized_price: 4850.0, monthly_emi: 485.0, tenure_months: 10,
      isi_standards: 'IS 13778 (1000V Insulation), IS 2925 (Safety Helmet), IS 4770 (Dielectric Gloves)',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
    },
    {
      trade_category: 'Plumbing',
      kit_name: 'Cooperative Hydro-Mechanic Master Plumber Toolkit',
      description: 'Standardized municipal and domestic plumbing toolkit. Complete with high-pressure pipe leak sensors, pipe threading, and heavy joint wrenches.',
      items_included: JSON.stringify([
        { item: 'Heavy-Duty Ductile Iron Pipe Wrenches (10 Inch & 14 Inch)', standard: 'IS 4003 Heavy-Duty Certified', mandatory: true },
        { item: 'CPVC / PPR Pipe Heat Fusion Welding Die Machine (800W)', standard: 'ISI Approved 20-63mm Dies', mandatory: true },
        { item: 'High-Precision Hydrostatic Pressure Test Gauge (0-25 Bar)', standard: 'IS 3624 Hydraulic Class 1.6', mandatory: true },
        { item: 'Rotary Drain Unclogging Spring Steel Snake Cable (7.5m Drum)', standard: 'High-Carbon Anti-Kink Steel', mandatory: true },
        { item: 'Heavy Ratchet PVC/CPVC Pipe Cutter (Up to 42mm OD)', standard: 'SK-5 High Carbon Blade', mandatory: true },
        { item: 'Telescoping Basin Wrench & Multi-Angle Sink Faucet Spanner', standard: 'Forged Chrome Vanadium Steel', mandatory: true },
        { item: 'Digital Water TDS, Hardness & pH Tester Pen', standard: 'Precision 1 PPM Resolution', mandatory: true },
        { item: 'Thread Seal Teflon Tape (Pack of 10 Rolls) + O-Ring Kit', standard: 'Food-Grade Potable Water Safe', mandatory: false },
      ]),
      market_price: 7400.0, subsidized_price: 4200.0, monthly_emi: 420.0, tenure_months: 10,
      isi_standards: 'IS 4003 (Pipe Wrenches), IS 3624 (Pressure Gauges), BIS Certified Dies',
      image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
    },
    {
      trade_category: 'Appliance Repair',
      kit_name: 'National HVAC & Refrigeration Precision Servicing Toolkit',
      description: 'Complete digital refrigeration & inverter appliance servicing suite. Designed for leak detection, gas recovery, vacuum charging, and jet washing.',
      items_included: JSON.stringify([
        { item: 'High-Pressure Cordless AC Service Jet Wash Pump (120 Bar)', standard: 'BIS Certified / 360-Degree Wand', mandatory: true },
        { item: 'Waterproof Indoor AC Service Apron Catchment Jacket', standard: 'Heavy-Duty PVC Ripstop 3m Hose', mandatory: true },
        { item: '2-Stage Rotary Vane Deep Vacuum Pump (1/3 HP, 3.5 CFM)', standard: 'ISO 9001 HVAC Grade 15 Micron', mandatory: true },
        { item: 'Forged Brass 2-Way Manifold Gauge with R32/R410A Hoses', standard: 'Anti-Flutter 800 PSI Rated', mandatory: true },
        { item: 'Sensitive Electronic Halogen & Refrigerant Gas Leak Detector', standard: 'Detects all HFC/HCFC down to 3g/yr', mandatory: true },
        { item: 'Heavy-Duty Copper Tube Flaring & Swaging Tool Kit', standard: 'Eccentric Cone Type 1/4" to 3/4"', mandatory: true },
        { item: 'True-RMS Digital HVAC Multimeter with Temp Clamp', standard: 'CAT III 600V / ISI Certified', mandatory: true },
        { item: 'Infrared Non-Contact Laser Thermometer (-50C to 550C)', standard: 'Calibrated Emissivity 0.95', mandatory: true },
      ]),
      market_price: 14500.0, subsidized_price: 8900.0, monthly_emi: 890.0, tenure_months: 10,
      isi_standards: 'ISO 9001 (Vacuum Pump), CE Certified Halogen Leak Sniffer, IS 13778',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
    },
    {
      trade_category: 'Carpentry',
      kit_name: 'Master Joinery & Architectural Woodcraft Urban Toolkit',
      description: 'Standardized urban carpentry and interior modular assembly toolkit. Complete with 18V cordless impact driver, 360-degree laser level, and lock mortise chisels.',
      items_included: JSON.stringify([
        { item: '18V Brushless Cordless Impact Driver & Drill with Dual 2.0Ah Batteries', standard: 'IS 60745 / BIS Industrial Grade', mandatory: true },
        { item: 'Heavy-Duty 650W Electric Hand Wood Planer with Tungsten Blades', standard: 'IS 1987 Certified', mandatory: true },
        { item: '3-Beam 360-Degree Self-Leveling Green Laser Level with Magnetic Mount', standard: 'Precision Class II ±1mm/10m', mandatory: true },
        { item: 'Forged Chrome-Vanadium Mortise Chisel Set (6mm, 12mm, 19mm, 25mm)', standard: 'HRC 60 Hardened Steel', mandatory: true },
        { item: 'Concealed 35mm Hydraulic Cup Hinge Hole Jig & Forstner Drill Bit', standard: 'High-Speed Cobalt Steel', mandatory: true },
        { item: 'Quick-Grip Heavy-Duty Bar Clamps (300mm & 600mm Pair)', standard: 'Cast-Iron 150kg Clamping Force', mandatory: true },
        { item: 'HEPA Handheld Cordless Sawdust Suction Vacuum', standard: 'HEPA Grade 99.97% Containment', mandatory: false },
      ]),
      market_price: 11200.0, subsidized_price: 6400.0, monthly_emi: 640.0, tenure_months: 10,
      isi_standards: 'IS 60745 (Electric Tools), IS 1987 (Hand Planers), BIS Heavy Duty',
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
    },
    {
      trade_category: 'Painting',
      kit_name: 'Surface Finishing & Terrace Waterproofing Urban Toolkit',
      description: 'Certified urban painter & waterproofing contractor kit. Equipped with digital masonry moisture meter, dustless drywall sander, and PU crack injection pumps.',
      items_included: JSON.stringify([
        { item: 'Digital Pin-Type Wall & Concrete Masonry Moisture Meter', standard: 'Calibrated 0-50% Wood/Wall LCD', mandatory: true },
        { item: 'Dustless Drywall Disc Sander with Vacuum Bag (750W Variable RPM)', standard: 'BIS Certified Dust-Containment', mandatory: true },
        { item: 'High-Volume Low-Pressure (HVLP) Fine Finish Electric Spray Gun', standard: 'CE / 0.3 Bar Ultra-Fine Finish', mandatory: true },
        { item: 'Heavy-Duty Dual-Component Polyurethane Injection Grout Hand Pump', standard: '10,000 PSI High-Pressure Rated', mandatory: true },
        { item: 'Heavy-Duty Washable 10oz Canvas Floor Drop-Cloths (Set of 3)', standard: '100% Anti-Slip Spill Proof', mandatory: true },
        { item: 'Aluminium Telescopic 3.8m Extension Ladder with Rubber Stabilizer Feet', standard: 'EN 131 Load Rated 150kg', mandatory: true },
        { item: 'Self-Adhesive Non-Marking Edge Masking Tape (Pack of 12 Rolls)', standard: 'Clean Peel 14-Day Residue-Free', mandatory: false },
      ]),
      market_price: 13500.0, subsidized_price: 7800.0, monthly_emi: 780.0, tenure_months: 10,
      isi_standards: 'EN 131 (Ladders), BIS Certified Grout Systems',
      image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
    },
    {
      trade_category: 'Cleaning',
      kit_name: 'Deep Machine Hygiene & Industrial Sanitation Urban Toolkit',
      description: 'Urban Company caliber deep home cleaning & pest containment suite. Includes single-disc 175 RPM rotary floor buffer, wet/dry slurry vacuum extractor, and steam sterilizer.',
      items_included: JSON.stringify([
        { item: 'Single-Disc Heavy-Duty Rotary Floor Buffer & Scrubber (1100W, 175 RPM)', standard: 'Industrial Cast-Iron Chassis', mandatory: true },
        { item: 'Twin-Motor Commercial Wet & Dry Slurry Vacuum Extractor (30L Tank)', standard: 'ISO 9001 / 2400W Suction', mandatory: true },
        { item: 'Deep Injection-Extraction Upholstery & Sofa Shampoo Wand Machine', standard: '4-Bar Pressure Injection System', mandatory: true },
        { item: 'Continuous Dry Steam Sanitizer (4.5 Bar, 140°C Superheated Boiler)', standard: 'Hospital Grade Thermal Sterilizer', mandatory: true },
        { item: 'Precision Micro-Dose Cockroach & Termite Herbal Gel Applicator Gun', standard: 'Calibrated Drop-Measure Spec', mandatory: true },
        { item: 'Color-Coded Anti-Microbial Microfiber Towel Set (12-Piece Assortment)', standard: 'IS 16670 Lint-Free 350 GSM', mandatory: true },
        { item: 'Personal Protective Respirator Mask & Heavy Nitrile Glove Set', standard: 'IS 9473 N95 / EN 374 Chemical', mandatory: false },
      ]),
      market_price: 18500.0, subsidized_price: 10900.0, monthly_emi: 1090.0, tenure_months: 10,
      isi_standards: 'IS 9473 (Respirators), ISO 9001, EN 374 (Chemical Protection)',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    },
    {
      trade_category: 'Gardening',
      kit_name: 'Civic Horticulture & Landscape Care Urban Toolkit',
      description: 'Eco-friendly landscape, lawn mowing, and micro-drip irrigation equipment suite. Features 40V cordless lawn mower, telescopic tree lopper, and drip irrigation punch kit.',
      items_included: JSON.stringify([
        { item: 'Cordless 40V Dual-Battery Brushless Rotary Lawn Mower (16" Deck)', standard: 'Zero-Emission Electric BIS Spec', mandatory: true },
        { item: 'Telescopic High-Carbon SK-5 Tree Lopper & Pole Pruner (Extends to 3.5m)', standard: 'Hardened Shear Cut Spec', mandatory: true },
        { item: 'Micro-Drip Hole Punch, Barbed Coupler & 16mm LDPE Pipe Installation Kit', standard: 'Standard Domestic Micro-Irrigation', mandatory: true },
        { item: '16L Lithium-Ion Battery Powered Backpack Garden & Biocide Sprayer', standard: 'IS 3906 Mechanical Sprayer Spec', mandatory: true },
        { item: 'Drop-Forged Bypass Hedge Shears with Shock-Absorbing Rubber Bumpers', standard: 'High-Carbon Forged Steel', mandatory: true },
        { item: 'Digital 4-in-1 Soil pH, Moisture, Sunlight & Temperature Sensor Meter', standard: 'Precision Agronomy Probe', mandatory: false },
      ]),
      market_price: 9800.0, subsidized_price: 5600.0, monthly_emi: 560.0, tenure_months: 10,
      isi_standards: 'IS 3906 (Sprayers), BIS Garden Tool Standard',
      image_url: 'https://images.unsplash.com/photo-1558904541-efa8c4a52d31?w=600',
    },
    {
      trade_category: 'Caregiving',
      kit_name: 'Assisted Clinical Home Care & Patient Diagnostic Suite',
      description: 'Accredited elderly care, bedside patient vital monitoring, and post-operative home dressing toolkit. Equipped with digital BP monitor, pulse oximeter, and blood glucose meter.',
      items_included: JSON.stringify([
        { item: 'Digital Upper-Arm Blood Pressure Monitor with Large Cuff', standard: 'CDSCO & CE Medical Class IIa', mandatory: true },
        { item: 'Fingertip Pulse Oximeter with Perfusion Index Display (SpO2)', standard: 'ISO 80601-2-61 Clinical Standard', mandatory: true },
        { item: 'Digital Blood Glucose Monitor with 50 Test Strips & Auto-Lancet', standard: 'ISO 15197 Accuracy Standard', mandatory: true },
        { item: 'Non-Contact Infrared Forehead Clinical Thermometer', standard: 'ASTM E1965-98 Clinical Spec', mandatory: true },
        { item: 'Sterile Surgical Dressing & Wound Care Tray Kit (10 Pre-Packaged Packs)', standard: 'Gamma Irradiated Sterile IS 5405', mandatory: true },
        { item: 'Patient Mobility Transfer Belt with Heavy-Duty Padded Grip Handles', standard: 'Ergonomic Orthopedic Safe', mandatory: false },
      ]),
      market_price: 6800.0, subsidized_price: 3800.0, monthly_emi: 380.0, tenure_months: 10,
      isi_standards: 'CDSCO Approved, ISO 13485 (Medical Devices), ISO 80601',
      image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
    },
    {
      trade_category: 'Driving',
      kit_name: 'Professional Fleet Chauffeur Diagnostic & Highway Safety Toolkit',
      description: 'Urban & outstation chauffeur road-safety suite. Features semiconductor breathalyzer, digital tire pressure inflator, OBD-2 scan tool, and emergency jump-starter cables.',
      items_included: JSON.stringify([
        { item: 'Digital Semiconductor Alcohol Breathalyzer with Calibration Warning', standard: 'CE / DOT Certified Sensor', mandatory: true },
        { item: 'Heavy-Duty 12V 150 PSI Car Tire Air Inflator with Digital Presets', standard: 'Automotive ISI Spec', mandatory: true },
        { item: 'OBD-2 Bluetooth Engine Diagnostic Scanner (Reads Check-Engine Codes)', standard: 'ISO 9141 / SAE J1850 Protocol', mandatory: true },
        { item: 'Heavy-Duty 4-Meter 1000A Battery Jumper Booster Cables with Clamp Covers', standard: '100% Pure Copper Multi-Strand', mandatory: true },
        { item: 'Reflective Emergency Warning Hazard Triangle & High-Vis Safety Vest', standard: 'AIS-022 Automotive Safety Standard', mandatory: true },
        { item: 'Vehicle Emergency Window Breaker & Seatbelt Cutter Punch Tool', standard: 'Tungsten Steel Tip Automotive Tool', mandatory: true },
      ]),
      market_price: 5900.0, subsidized_price: 3400.0, monthly_emi: 340.0, tenure_months: 10,
      isi_standards: 'AIS-022 (Automotive Warning Devices), ISO 9141 OBD2',
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
    },
  ];

  for (const tk of toolkits) {
    await query(
      `INSERT INTO mandatory_toolkits (
        trade_category, kit_name, description, items_included, market_price,
        subsidized_price, monthly_emi, tenure_months, isi_standards, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        tk.trade_category, tk.kit_name, tk.description, tk.items_included,
        tk.market_price, tk.subsidized_price, tk.monthly_emi, tk.tenure_months,
        tk.isi_standards, tk.image_url,
      ]
    );
  }

  // =============================================
  // 13. Sample Bookings & 93-2-5 Ledger
  // =============================================
  const sampleBookings = [
    // Completed Bookings in Khordha (Customer 1, Worker 1)
    [
      'BKG-2026-1001', 1, 1, 3, 'Khordha', 'Bhubaneswar', 'Patia, Plot 42, Near KIIT Campus', '751024',
      20.3540, 85.8170, '2026-09-15', '10:00 AM', 0, 0, 0.0, 'COMPLETED',
      1899.0, 0.0, null, 94.95, 37.98, 2031.93, 'AC gas refilling completed with nitrogen leak test.',
      '4321', '8765', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', '2026-09-15 11:30:00'
    ],
    // Completed Booking in Cuttack (Customer 26, Worker 33)
    [
      'BKG-2026-1002', 26, 33, 5, 'Cuttack', 'Cuttack', 'College Square, Buxi Lane', '753003',
      20.4625, 85.8830, '2026-09-16', '02:00 PM', 0, 0, 0.0, 'COMPLETED',
      899.0, 0.0, null, 44.95, 17.98, 961.93, 'Double door refrigerator relay replaced and cooling verified.',
      '1234', '5678', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600', '2026-09-16 15:45:00'
    ],
    // Completed Booking in Puri (Customer 46, Worker 69)
    [
      'BKG-2026-1003', 46, 69, 1, 'Puri', 'Puri', 'VIP Road, Puri', '752001',
      19.8135, 85.8312, '2026-09-17', '11:00 AM', 0, 0, 0.0, 'COMPLETED',
      499.0, 0.0, null, 24.95, 9.98, 533.93, 'Split AC jet cleaning done with antibacterial coil wash.',
      '2345', '6789', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600', '2026-09-17 12:15:00'
    ],
    // In Progress Booking (Khordha, Customer 2, Worker 9)
    [
      'BKG-2026-1004', 2, 9, 11, 'Khordha', 'Bhubaneswar', 'Jaydev Vihar, Flat 302', '751013',
      20.2961, 85.8245, '2026-09-19', '11:00 AM', 0, 0, 0.0, 'IN_PROGRESS',
      599.0, 0.0, null, 29.95, 11.98, 640.93, 'MCB trip troubleshooting on main distribution panel.',
      '9911', '8822', null, null, null
    ],
    // Emergency Requested Booking (Cuttack, Customer 27, Unassigned)
    [
      'BKG-2026-1005', 27, null, 25, 'Cuttack', 'Cuttack', 'Badambadi Colony, House 14', '753012',
      20.4550, 85.8750, '2026-09-19', '12:30 PM', 1, 0, 0.0, 'REQUESTED',
      599.0, 0.0, null, 29.95, 11.98, 640.93, 'Emergency main pipe burst in ground floor bathroom. Need immediate containment.',
      '7711', '3344', null, null, null
    ],
  ];

  for (const b of sampleBookings) {
    await query(
      `INSERT INTO bookings (
        booking_code, customer_id, worker_id, service_id, location_district, location_city,
        location_address, location_pincode, latitude, longitude, scheduled_date, scheduled_time,
        is_emergency, is_bulk_order, bulk_discount_amount, status, amount, parts_cost,
        parts_details, cooperative_fee, platform_fee, total_amount, notes, arrival_otp,
        completion_otp, pre_job_photo_url, post_job_photo_url, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)`,
      b
    );
  }

  // =============================================
  // 14. Reviews & Citizen Trust Ledger
  // =============================================
  const reviewsSeed = [
    [1, 1, 1, 5, 'Fixed ₹1,899 tariff vs ₹3,200 private app quote. Skilled and polite technician.', 5, 5, 5],
    [2, 26, 33, 5, 'Quick response in Cuttack. Honest diagnosis without unnecessary parts replacement.', 5, 5, 5],
    [3, 46, 69, 5, 'Prompt AC jet service in Puri. 30-day warranty card and invoice provided instantly.', 5, 5, 5],
  ];

  for (const r of reviewsSeed) {
    await query(
      `INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment, punctuality_score, quality_score, safety_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      r
    );
  }

  // Reconcile worker availability with active bookings
  await query(`
    UPDATE workers
    SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
    WHERE id IN (
      SELECT worker_id FROM bookings WHERE worker_id IS NOT NULL AND status IN ('MATCHED', 'ACCEPTED', 'IN_PROGRESS')
      UNION
      SELECT paired_master_worker_id FROM bookings WHERE paired_master_worker_id IS NOT NULL AND status IN ('MATCHED', 'ACCEPTED', 'IN_PROGRESS')
    )
  `);

  console.log('\n========================================================================');
  console.log('✅ Multi-District Cooperative Database Seeded Successfully:');
  console.log('   🏛️ 3 Cooperative Federations (Khordha, Cuttack, Puri)');
  console.log('   🏢 12 Unique Cooperative Societies (4 per district, each with unique location/pincode)');
  console.log('   👥 60 Verified Customers across all 12 localities');
  console.log('   🛠️ 84 Multi-Trade Verified Workers (NSDC/NCCT certified across 45 trades)');
  console.log('   📋 120 Society Founding Members (10 promoter KYC members per society)');
  console.log('   📜 72 Statutory Regulatory Documents (6 statutory dossier files per society)');
  console.log('   ⚖️ 3 DCOs with District-Specific Authority + 1 State Federation Head');
  console.log('========================================================================\n');
}

if (require.main === module) {
  seed()
    .then(async () => {
      await closeDb();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seed failed:', err);
      await closeDb();
      process.exit(1);
    });
}

module.exports = { seed };
