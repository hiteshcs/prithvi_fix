const http = require('http');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Testing Services API ---');
  const sAll = await get('http://localhost:5000/api/services');
  console.log('Total services returned:', sAll.services ? sAll.services.length : 0);

  const sKhordha = await get('http://localhost:5000/api/services?district=Khordha');
  console.log('Khordha available workers sample:', sKhordha.services && sKhordha.services[0] ? `${sKhordha.services[0].name} -> ${sKhordha.services[0].available_workers} workers` : 'N/A');

  const sCuttack = await get('http://localhost:5000/api/services?district=Cuttack');
  console.log('Cuttack available workers sample:', sCuttack.services && sCuttack.services[0] ? `${sCuttack.services[0].name} -> ${sCuttack.services[0].available_workers} workers` : 'N/A');

  const sPuri = await get('http://localhost:5000/api/services?district=Puri');
  console.log('Puri available workers sample:', sPuri.services && sPuri.services[0] ? `${sPuri.services[0].name} -> ${sPuri.services[0].available_workers} workers` : 'N/A');

  console.log('\n--- 2. Testing Societies API ---');
  const socs = await get('http://localhost:5000/api/societies');
  if (socs.societies) {
    socs.societies.forEach(s => {
      console.log(`- [${s.district}] ${s.society_code}: ${s.name} (${s.address}) - Status: ${s.status}`);
    });
  }

  console.log('\n--- 3. Testing DCO Approval Inbox per District ---');
  async function testDco(email, label) {
    const postData = JSON.stringify({ email, password: 'password123' });
    const authRes = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve(JSON.parse(body)));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    const token = authRes.token;
    if (!token) {
      console.log(`Failed to login as ${email}:`, authRes);
      return;
    }

    const pending = await get('http://localhost:5000/api/societies/pending/dco', {
      Authorization: `Bearer ${token}`,
    });

    console.log(`👑 ${label} (${email}):`);
    console.log(`   Pending societies in inbox (${pending.societies ? pending.societies.length : 0}):`);
    if (pending.societies) {
      pending.societies.forEach(s => console.log(`   -> [${s.district}] ID ${s.id} - ${s.name} (${s.address}) - Status: ${s.status}`));
    }
    console.log(`   Approved societies in district (${pending.approvedSocieties ? pending.approvedSocieties.length : 0})`);
  }

  await testDco('dco.khordha@demo.local', 'Khordha District Cooperative Officer (Debendra Nayak)');
  await testDco('dco.cuttack@demo.local', 'Cuttack District Cooperative Officer (Laxmi Devi)');
  await testDco('dco.puri@demo.local', 'Puri District Cooperative Officer (Alok Mohapatra)');
  await testDco('fedhead@demo.local', 'State Apex Federation Head (Arun Kumar Pattnaik - Statewide)');
}
run();
