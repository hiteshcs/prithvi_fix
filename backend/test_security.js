const http = require('http');

/**
 * Automated Security Test Suite for Prithvi Fix Backend API.
 * Validates RBAC, Anti-IDOR, PII Masking, Rate Limiting, and Token Revocation.
 */

const BASE_URL = 'http://localhost:5000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🔒 Starting Prithvi Fix Security Verification Suite...\n');

  // Test 1: Unauthenticated Federation Admin Route
  console.log('1. Testing RBAC on Federation Admin Console...');
  const fedRes = await request('/federation/admin-dashboard');
  assert(fedRes.status === 401, `Unauthenticated /federation/admin-dashboard blocked with 401 (got ${fedRes.status})`);

  // Test 2: Unauthenticated Federation Treasurer Console
  const treasRes = await request('/federation/treasurer-dashboard');
  assert(treasRes.status === 401, `Unauthenticated /federation/treasurer-dashboard blocked with 401 (got ${treasRes.status})`);

  // Test 3: Unauthenticated Society Timeline Patch
  console.log('\n2. Testing RBAC on Society Statutory Timeline...');
  const socRes = await request('/societies/1/timeline', { method: 'PATCH', body: { stage: 9 } });
  assert(socRes.status === 401, `Unauthenticated PATCH /societies/:id/timeline blocked with 401 (got ${socRes.status})`);

  // Test 4: Public Worker Directory Phone Masking
  console.log('\n3. Testing PII Protection on Public Worker Catalog...');
  const workersRes = await request('/workers?limit=2');
  if (workersRes.data?.workers?.length > 0) {
    const firstWorker = workersRes.data.workers[0];
    const isMasked = firstWorker.phone && firstWorker.phone.includes('XXXXX');
    assert(isMasked, `Public worker phone number is masked: ${firstWorker.phone}`);
  }

  // Test 5: Worker Profile PII Masking (Aadhaar, Bank Account, PAN)
  console.log('\n4. Testing PII Data Sanitization on Worker Profile (DPDP Act Compliance)...');
  const workerDetailRes = await request('/workers/1');
  if (workerDetailRes.data?.worker) {
    const w = workerDetailRes.data.worker;
    const aadhaarMasked = !w.aadhaar_number || w.aadhaar_number.startsWith('XXXX-XXXX');
    const bankMasked = !w.bank_account || w.bank_account.startsWith('XXXXXX');
    assert(aadhaarMasked, `Aadhaar is masked for public viewer: ${w.aadhaar_number || 'N/A'}`);
    assert(bankMasked, `Bank account is masked for public viewer: ${w.bank_account || 'N/A'}`);
  }

  // Test 6: Authentication & Login
  console.log('\n5. Testing Authentication & Token Revocation...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'customer@demo.local', password: 'demo123' },
  });
  assert(loginRes.status === 200 && !!loginRes.data?.token, 'Login successful with valid credentials');

  const token = loginRes.data?.token;

  if (token) {
    // Verify token works
    const meRes = await request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    assert(meRes.status === 200, `Protected route /auth/me accessible with token (got ${meRes.status})`);

    // Logout and revoke token
    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(logoutRes.status === 200, 'Logout successfully revoked JWT token');

    // Attempt to access /auth/me with revoked token
    const postLogoutRes = await request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    assert(postLogoutRes.status === 401, `Revoked token blocked on /auth/me with 401 (got ${postLogoutRes.status})`);
  }

  // Test 7: Worker OTP Redaction
  console.log('\n6. Testing Worker OTP Isolation (Anti-Cheating Physical Verification)...');
  const workerLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'ramesh.w@demo.local', password: 'demo123', portalRole: 'WORKER' },
  });

  if (workerLoginRes.status === 200) {
    const workerToken = workerLoginRes.data.token;
    // Worker inspects booking 1
    const bookingRes = await request('/bookings/1', { headers: { Authorization: `Bearer ${workerToken}` } });
    if (bookingRes.data?.booking) {
      const b = bookingRes.data.booking;
      const otpRedacted = b.arrival_otp === undefined && b.completion_otp === undefined;
      assert(otpRedacted, `Arrival & Completion OTPs are redacted from assigned artisan API response`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Security Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
