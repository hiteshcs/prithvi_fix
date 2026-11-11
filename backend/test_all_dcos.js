const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query } = require('./src/db/connection');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function testAll() {
  const dcos = [
    { email: 'dco.khordha@demo.local', expectedDistrict: 'Khordha' },
    { email: 'dco.cuttack@demo.local', expectedDistrict: 'Cuttack' },
    { email: 'dco.puri@demo.local', expectedDistrict: 'Puri' },
  ];

  for (const d of dcos) {
    const uRes = await query('SELECT * FROM users WHERE email = $1', [d.email]);
    const u = uRes.rows[0];
    const token = jwt.sign({ id: u.id, email: u.email, role: u.role, district: u.district, admin_type: u.admin_type }, JWT_SECRET);

    const fRes = await fetch('http://localhost:5000/api/societies/federation-overview', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const fData = await fRes.json();
    console.log(d.expectedDistrict, 'DCO federations returned:', fData.federations.map(f => f.name + ' (' + f.district + ')'));
    const leaks = fData.federations.filter(f => f.district !== d.expectedDistrict);
    if (leaks.length > 0) throw new Error('LEAK for ' + d.expectedDistrict);

    const socRes = await fetch('http://localhost:5000/api/societies/pending/dco', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const socData = await socRes.json();
    const socPendingLeaks = socData.societies.filter(s => s.district !== d.expectedDistrict);
    const socApprovedLeaks = socData.approvedSocieties.filter(s => s.district !== d.expectedDistrict);
    const inqLeaks = socData.regulatoryInquiries.filter(i => i.district !== d.expectedDistrict);
    if (socPendingLeaks.length > 0 || socApprovedLeaks.length > 0 || inqLeaks.length > 0) {
      throw new Error('LEAK in societies/inquiries for ' + d.expectedDistrict);
    }
  }
  console.log('✅ ALL DCOS (Khordha, Cuttack, Puri) STRICTLY ISOLATED TO THEIR DISTRICT!');
  process.exit(0);
}
testAll().catch(e => { console.error(e); process.exit(1); });
