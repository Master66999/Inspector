require('dotenv').config();
const http = require('http');
const app = require('../server');
const { pool } = require('../db');

// Helper to make HTTP requests with cookie handling
function request(options, data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request({ ...options, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        
        // Extract set-cookie if present
        const setCookie = res.headers['set-cookie'];
        let cookieHeader = null;
        if (setCookie) {
          cookieHeader = setCookie.map(c => c.split(';')[0]).join('; ');
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookie: cookieHeader,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('      PACKCHECK BACKEND API & DATABASE TEST SUITE     ');
  console.log('======================================================\n');

  const server = app.listen(3001);
  await new Promise(r => setTimeout(r, 1000));

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const baseOpt = { host: 'localhost', port: 3001 };

    // Clean test data
    await pool.query("DELETE FROM users WHERE email IN ('test_alice@packcheck.in', 'test_bob@packcheck.in')");

    // TEST 1: Signup Alice
    console.log('[1] Testing POST /api/auth/signup (Alice)...');
    const resAliceSignup = await request(
      { ...baseOpt, path: '/api/auth/signup', method: 'POST' },
      { name: 'Alice Cooper', email: 'test_alice@packcheck.in', password: 'password123' }
    );
    assert(resAliceSignup.status === 201, 'Alice signup returns 201 Created');
    assert(resAliceSignup.data.user.email === 'test_alice@packcheck.in', 'User email returned correctly');
    assert(resAliceSignup.data.user.password_hash === undefined, 'Password hash is NOT exposed in response');
    assert(!!resAliceSignup.cookie, 'HTTP-only authentication cookie is set');
    const aliceCookie = resAliceSignup.cookie;

    // TEST 2: Duplicate Email Signup
    console.log('\n[2] Testing Duplicate Email Registration...');
    const resDup = await request(
      { ...baseOpt, path: '/api/auth/signup', method: 'POST' },
      { name: 'Alice Clone', email: 'test_alice@packcheck.in', password: 'password123' }
    );
    assert(resDup.status === 409, 'Duplicate signup rejected with 409 Conflict');

    // TEST 3: Signup Bob
    console.log('\n[3] Testing POST /api/auth/signup (Bob)...');
    const resBobSignup = await request(
      { ...baseOpt, path: '/api/auth/signup', method: 'POST' },
      { name: 'Bob Marley', email: 'test_bob@packcheck.in', password: 'password456' }
    );
    assert(resBobSignup.status === 201, 'Bob signup returns 201 Created');
    const bobCookie = resBobSignup.cookie;

    // TEST 4: Login with Invalid Password
    console.log('\n[4] Testing POST /api/auth/login (Invalid Password)...');
    const resFailLogin = await request(
      { ...baseOpt, path: '/api/auth/login', method: 'POST' },
      { email: 'test_alice@packcheck.in', password: 'wrongpassword' }
    );
    assert(resFailLogin.status === 401, 'Failed login returns 401 Unauthorized');

    // Verify failed login event in DB
    const [failEvents] = await pool.query(
      "SELECT le.* FROM login_events le JOIN users u ON le.user_id = u.id WHERE u.email = 'test_alice@packcheck.in' AND le.success = 0"
    );
    assert(failEvents.length > 0, 'Failed login attempt recorded in login_events table');

    // TEST 5: Login Alice with Valid Password
    console.log('\n[5] Testing POST /api/auth/login (Valid Password)...');
    const resAliceLogin = await request(
      { ...baseOpt, path: '/api/auth/login', method: 'POST' },
      { email: 'test_alice@packcheck.in', password: 'password123' }
    );
    assert(resAliceLogin.status === 200, 'Valid login returns 200 OK');
    assert(resAliceLogin.data.user.name === 'Alice Cooper', 'Profile returned correctly');

    // TEST 6: GET /api/auth/me (Protected Route)
    console.log('\n[6] Testing GET /api/auth/me...');
    const resMeAlice = await request(
      { ...baseOpt, path: '/api/auth/me', method: 'GET' },
      null,
      aliceCookie
    );
    assert(resMeAlice.status === 200, 'Protected /api/auth/me authenticated with cookie');
    assert(resMeAlice.data.user.email === 'test_alice@packcheck.in', 'Correct user profile returned');
    assert(resMeAlice.data.user.password_hash === undefined, 'password_hash excluded');

    const resMeUnauth = await request(
      { ...baseOpt, path: '/api/auth/me', method: 'GET' },
      null,
      null
    );
    assert(resMeUnauth.status === 401, 'Unauthenticated /api/auth/me rejected with 401');

    // TEST 7: POST /api/scans (Create Scans)
    console.log('\n[7] Testing POST /api/scans (Creating Scans)...');
    const resScan1 = await request(
      { ...baseOpt, path: '/api/scans', method: 'POST' },
      {
        product_name: 'Volt Surge Energy Drink 250ml',
        nutrition_data: { cleanScore: 38, grade: 'Grade D' },
        ingredients_data: { harmfulCount: 2, safeCount: 5 },
        claims_data: { verdict: 'High sugar warning' }
      },
      aliceCookie
    );
    assert(resScan1.status === 201, 'Alice scan 1 recorded successfully');
    const aliceScan1Id = resScan1.data.scan.id;

    const resScan2 = await request(
      { ...baseOpt, path: '/api/scans', method: 'POST' },
      {
        product_name: 'NatureSip Mango Nectar',
        nutrition_data: { cleanScore: 52, grade: 'Grade C' },
        ingredients_data: { harmfulCount: 2, safeCount: 2 },
        claims_data: { verdict: 'Moderate caution' }
      },
      aliceCookie
    );
    assert(resScan2.status === 201, 'Alice scan 2 recorded successfully');

    const resScanBob = await request(
      { ...baseOpt, path: '/api/scans', method: 'POST' },
      {
        product_name: 'Spark Zero Cola 330ml',
        nutrition_data: { cleanScore: 78, grade: 'Grade B' },
        ingredients_data: { harmfulCount: 0, safeCount: 6 },
        claims_data: { verdict: 'Zero sugar formula' }
      },
      bobCookie
    );
    assert(resScanBob.status === 201, 'Bob scan recorded successfully');

    // TEST 8: GET /api/scans (User Isolation)
    console.log('\n[8] Testing GET /api/scans (User Data Isolation)...');
    const resAliceScans = await request(
      { ...baseOpt, path: '/api/scans', method: 'GET' },
      null,
      aliceCookie
    );
    assert(resAliceScans.status === 200, 'Alice scans retrieved');
    assert(resAliceScans.data.scans.length === 2, 'Alice sees exactly her 2 scans');

    const resBobScans = await request(
      { ...baseOpt, path: '/api/scans', method: 'GET' },
      null,
      bobCookie
    );
    assert(resBobScans.status === 200, 'Bob scans retrieved');
    assert(resBobScans.data.scans.length === 1, 'Bob sees exactly his 1 scan');

    // TEST 9: Cross-User Access Security
    console.log('\n[9] Testing Cross-User Access Protection...');
    // Bob attempts to fetch Alice's scan
    const resCrossGet = await request(
      { ...baseOpt, path: `/api/scans/${aliceScan1Id}`, method: 'GET' },
      null,
      bobCookie
    );
    assert(resCrossGet.status === 403 || resCrossGet.status === 404, 'Bob cannot view Alice scan (403/404)');

    // Bob attempts to delete Alice's scan
    const resCrossDel = await request(
      { ...baseOpt, path: `/api/scans/${aliceScan1Id}`, method: 'DELETE' },
      null,
      bobCookie
    );
    assert(resCrossDel.status === 403, 'Bob cannot delete Alice scan (403 Forbidden)');

    // TEST 10: DELETE /api/scans/:id (Authorized Deletion)
    console.log('\n[10] Testing DELETE /api/scans/:id...');
    const resAliceDel = await request(
      { ...baseOpt, path: `/api/scans/${aliceScan1Id}`, method: 'DELETE' },
      null,
      aliceCookie
    );
    assert(resAliceDel.status === 200, 'Alice successfully deleted her scan');

    // Verify scan and scan_results are gone
    const [dbScanCheck] = await pool.query('SELECT id FROM scans WHERE id = ?', [aliceScan1Id]);
    const [dbResultCheck] = await pool.query('SELECT id FROM scan_results WHERE scan_id = ?', [aliceScan1Id]);
    assert(dbScanCheck.length === 0, 'Scan removed from scans table');
    assert(dbResultCheck.length === 0, 'Cascade delete removed from scan_results table');

    // TEST 11: POST /api/auth/logout
    console.log('\n[11] Testing POST /api/auth/logout...');
    const resLogout = await request(
      { ...baseOpt, path: '/api/auth/logout', method: 'POST' },
      null,
      aliceCookie
    );
    assert(resLogout.status === 200, 'Logout returns 200 OK');

    // Cleanup
    await pool.query("DELETE FROM users WHERE email IN ('test_alice@packcheck.in', 'test_bob@packcheck.in')");

    console.log('\n======================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('[Test Suite Fatal Error]:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
