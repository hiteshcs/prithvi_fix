const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query } = require('./src/db/connection');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      district: user.district,
      admin_type: user.admin_type,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function testAllDcoFeatures() {
  console.log('--- STARTING COMPREHENSIVE DCO TEST ---');
  
  // 1. Get Khordha DCO
  const khUserRes = await query("SELECT * FROM users WHERE email = 'dco.khordha@demo.local'");
  const khUser = khUserRes.rows[0];
  console.log('Khordha DCO:', khUser.name, '| District:', khUser.district, '| Admin Type:', khUser.admin_type);

  const token = createToken(khUser);

  // 2. Fetch Pending & Approved societies for DCO
  const dcoPendingRes = await fetch('http://localhost:5000/api/societies/pending/dco', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dcoData = await dcoPendingRes.json();
  
  console.log('\n[1] Pending Societies for Khordha DCO:', dcoData.societies?.length);
  dcoData.societies?.forEach(s => {
    console.log(`  - ${s.name} (${s.district}) | Promoters: ${s.founding_members?.length} | Docs: ${s.statutory_documents?.length}`);
    if (s.district !== 'Khordha') throw new Error(`LEAK: Non-Khordha society found in pending: ${s.name} (${s.district})`);
  });

  console.log('\n[2] Approved Societies for Khordha DCO:', dcoData.approvedSocieties?.length);
  dcoData.approvedSocieties?.forEach(s => {
    console.log(`  - ${s.name} (${s.district}) | Audit Grade: ${s.audit_grade} | Reserve: ₹${s.reserve_fund_balance}`);
    if (s.district !== 'Khordha') throw new Error(`LEAK: Non-Khordha society found in approved: ${s.name} (${s.district})`);
  });

  console.log('\n[3] Regulatory Inquiries for Khordha DCO:', dcoData.regulatoryInquiries?.length);
  dcoData.regulatoryInquiries?.forEach(inq => {
    console.log(`  - [${inq.case_number}] ${inq.title} (${inq.district}) | Status: ${inq.status}`);
    if (inq.district !== 'Khordha') throw new Error(`LEAK: Non-Khordha inquiry found: ${inq.case_number} (${inq.district})`);
  });

  // 3. Test Federation Overview endpoint
  const fedRes = await fetch('http://localhost:5000/api/societies/federation-overview', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const fedData = await fedRes.json();
  console.log('\n[4] Federations returned for Khordha DCO:', fedData.federations?.length);
  fedData.federations?.forEach(f => {
    console.log(`  - ${f.name} (${f.district})`);
    if (f.district !== 'Khordha') throw new Error(`LEAK: Non-Khordha federation found: ${f.name} (${f.district})`);
  });

  // 4. Test Audit Update
  const approvedSoc = dcoData.approvedSocieties[0];
  if (approvedSoc) {
    console.log('\n[5] Testing Audit Update for Society ID:', approvedSoc.id);
    const auditRes = await fetch(`http://localhost:5000/api/societies/${approvedSoc.id}/audit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        audit_grade: 'A',
        annual_return_status: 'FILED_CURRENT_FY',
        reserve_fund_balance: 165000
      })
    });
    const auditJson = await auditRes.json();
    console.log('  Audit Update Response:', auditJson.success, '| Message:', auditJson.message);
    if (!auditJson.success) throw new Error('Audit update failed');
  }

  // 5. Test Governance Update
  if (approvedSoc) {
    console.log('\n[6] Testing Governance Update for Society ID:', approvedSoc.id);
    const govRes = await fetch(`http://localhost:5000/api/societies/${approvedSoc.id}/governance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        last_agm_date: '2025-09-01',
        committee_term_end: '2028-04-30'
      })
    });
    const govJson = await govRes.json();
    console.log('  Governance Update Response:', govJson.success, '| Message:', govJson.message);
    if (!govJson.success) throw new Error('Governance update failed');
  }

  // 6. Test Create Inquiry Docket
  if (approvedSoc) {
    console.log('\n[7] Testing Create Inquiry Docket');
    const inqRes = await fetch('http://localhost:5000/api/societies/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        society_id: approvedSoc.id,
        section: 'SECTION_68',
        title: 'Demarcation test conciliation proceeding',
        complainant: 'Patia Artisan Guild',
        respondent: 'Managing Committee',
        status: 'HEARING_SCHEDULED',
        next_hearing_date: '2026-10-20',
        dco_remarks: 'Formal hearing summons issued under Section 68.'
      })
    });
    const inqJson = await inqRes.json();
    console.log('  Inquiry Response:', inqJson.success, '| Case Number:', inqJson.data?.case_number);
    if (!inqJson.success) throw new Error('Inquiry creation failed');
  }

  // 7. Security test: Attempt to modify a Cuttack society as Khordha DCO
  console.log('\n[8] Security Jurisdiction Guard Test: Khordha DCO attempting to update Cuttack society');
  const cuttackSocRes = await query("SELECT * FROM societies WHERE district = 'Cuttack' LIMIT 1");
  if (cuttackSocRes.rows.length > 0) {
    const cuttackSoc = cuttackSocRes.rows[0];
    const forbiddenRes = await fetch(`http://localhost:5000/api/societies/${cuttackSoc.id}/audit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ audit_grade: 'C' })
    });
    console.log('  HTTP Status code for cross-district modification attempt:', forbiddenRes.status);
    if (forbiddenRes.status !== 403) {
      throw new Error(`SECURITY VULNERABILITY: Expected status 403, got ${forbiddenRes.status}`);
    }
    console.log('  Cross-district update correctly rejected with 403 Forbidden!');
  }

  console.log('\n✅ ALL STATUTORY DCO CHECKS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testAllDcoFeatures().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
