const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database
const { query } = require('./db/connection');
const { migrate } = require('./db/migrate');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------
// Security Middleware & Rate Limiting
// ---------------------
const { generalLimiter } = require('./middleware/rateLimiter');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://*.google.com", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:", "https://*.google.com", "https://*.googleapis.com", "https://*.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "http://127.0.0.1:*", "https:", "http:", "https://*.google.com", "https://*.googleapis.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com", "https://*.google.com"],
      frameAncestors: ["'none'"], // Mitigate Clickjacking
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  noSniff: true,
}));

// CORS configured with explicit origin validation
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser agents (mobile app, curl, backend services) with null origin
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') ||
      origin.includes('ngrok') ||
      origin.includes('loca.lt') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.0.2.2:') || // Android Emulator loopback
      process.env.NODE_ENV !== 'production' ||
      process.env.CORS_ALLOW_ALL === 'true'
    ) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS Security Violation: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'x-requested-with'],
}));

// Response compression (gzip/brotli)
app.use(compression());

// General API Rate Limiting to prevent DoS
app.use('/api', generalLimiter);

// Body Parsing with expanded limit for camera photo defect diagnosis
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Input sanitization to guard against XSS and prototype pollution
const { sanitizeInputs } = require('./middleware/sanitizer');
app.use(sanitizeInputs);

// Logging - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------------------
// Routes
// ---------------------
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const workersRoutes = require('./routes/workers');
const matchingRoutes = require('./routes/matching');
const bookingsRoutes = require('./routes/bookings');
const workerPortalRoutes = require('./routes/workerPortal');
const adminRoutes = require('./routes/admin');
const smartFeaturesRoutes = require('./routes/smartFeatures');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const localizationRoutes = require('./routes/localization');
const governanceRoutes = require('./routes/governance');
const societiesRoutes = require('./routes/societies');
const federationRoutes = require('./routes/federation');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/worker-portal', workerPortalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smart-features', smartFeaturesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/societies', societiesRoutes);
app.use('/api/federation', federationRoutes);
app.use('/api/profile', profileRoutes);

// ---------------------
// Health Check
// ---------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Prithvi Fix API is running on PostgreSQL',
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ---------------------
// API Info
// ---------------------
app.get('/api', (req, res) => {
  res.json({
    name: 'Prithvi Fix API',
    description: 'Cooperative Gig Services Platform — Backend API (PostgreSQL + Live Server ready)',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/login, POST /api/auth/register',
      services: 'GET /api/services',
      workers: 'GET /api/workers',
      bookings: 'GET /api/bookings',
      admin: 'GET /api/admin/dashboard',
      stats: 'GET /api/db/stats'
    }
  });
});

// ---------------------
// Database Stats (verification endpoint)
// ---------------------
app.get('/api/db/stats', async (req, res) => {
  try {
    const tables = ['cooperatives', 'users', 'workers', 'skills', 'services', 'bookings', 'payments', 'reviews', 'certifications', 'worker_welfare'];
    const stats = {};
    for (const table of tables) {
      const countRes = await query(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = parseInt(countRes.rows[0].count, 10);
    }
    res.json({ status: 'ok', database: 'PostgreSQL connected', stats });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'PostgreSQL error', message: err.message });
  }
});

// ---------------------
// Cloud Database Seed Endpoint
// ---------------------
const { seed } = require('./db/seed');
app.get('/api/seed', async (req, res) => {
  try {
    const key = req.query.key || req.query.secret;
    if (process.env.NODE_ENV === 'production' && key !== 'seed123' && key !== process.env.JWT_SECRET) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'To seed the database, add ?key=seed123 to this URL'
      });
    }

    console.log('🌱 Cloud seed requested via API endpoint...');
    await seed();
    res.json({
      status: 'ok',
      message: '✅ Supabase database seeded successfully! All 12 Federations, 84 Verified Workers, 45 Trades, and Demo Accounts have been created.'
    });
  } catch (err) {
    console.error('❌ Cloud seed failed:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ---------------------
// Static APK Downloads Portal
// ---------------------
const apksDir = path.join(__dirname, '..', '..', 'apks');
app.use('/apks', express.static(apksDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

app.get('/download', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prithvi Fix — Android APK Downloads</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b1120; color: #f8fafc; padding: 24px 16px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; max-width: 480px; width: 100%; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 6px; text-align: center; }
    .sub { font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background: #059669; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
    .btn { display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; text-decoration: none; color: #fff; transition: all 0.2s ease; }
    .btn:hover, .btn:active { background: #1e293b; border-color: #3b82f6; transform: translateY(-1px); }
    .btn.citizen { border-left: 4px solid #16a34a; }
    .btn.worker { border-left: 4px solid #f97316; }
    .btn.admin { border-left: 4px solid #3b82f6; }
    .btn-title { font-size: 15px; font-weight: 700; }
    .btn-desc { font-size: 11px; color: #94a3b8; margin-top: 3px; }
    .btn-icon { background: #334155; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .tip { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px; text-align: center; background: #0f172a; padding: 12px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center;"><span class="badge">Prithvi Fix Cooperative Suite</span></div>
    <h1>Install Android Apps</h1>
    <p class="sub">Download directly to your Android device</p>

    <a href="/apks/PrithviFix_Citizen.apk" class="btn citizen" download="PrithviFix_Citizen.apk">
      <div>
        <div class="btn-title">1. Prithvi Fix Citizen</div>
        <div class="btn-desc">Posters, AI fault scanner & bookings (59 MB)</div>
      </div>
      <div class="btn-icon">🏠</div>
    </a>

    <a href="/apks/PrithviFix_Worker.apk" class="btn worker" download="PrithviFix_Worker.apk">
      <div>
        <div class="btn-title">2. Prithvi Fix Worker</div>
        <div class="btn-desc">Dark/Light mode, SOS radar & toolkits (54 MB)</div>
      </div>
      <div class="btn-icon">⚡</div>
    </a>

    <a href="/apks/PrithviFix_Admin.apk" class="btn admin" download="PrithviFix_Admin.apk">
      <div>
        <div class="btn-title">3. Prithvi Fix Sahakari</div>
        <div class="btn-desc">Federation registrar & live telemetry (55 MB)</div>
      </div>
      <div class="btn-icon">🏛️</div>
    </a>

    <div class="tip">
      💡 <strong>Installation Note:</strong> When prompted by Chrome, tap <em>"Download anyway"</em>, then open the downloaded file and tap <em>"Install"</em> (enable "Allow from this source" if asked).
    </div>
  </div>
</body>
</html>`);
});

// ---------------------
// Static React Hosting (Production)
// ---------------------
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// ---------------------
// Fallback & 404 Handler (Universal Express 4 & 5 Compatible)
// ---------------------
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      status: 404
    });
  }

  if (fs.existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }

  res.status(404).send('Not Found');
});

// ---------------------
// Error Handler
// ---------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
    status: err.status || 500
  });
});

// ---------------------
// Start Server
// ---------------------
const { startLifecycleCron } = require('./services/bookingLifecycle');

async function startServer() {
  try {
    await migrate();
    // Start automated booking lifecycle monitor (10m/30m acceptance timeout & next-day completion)
    startLifecycleCron(30000);
  } catch (err) {
    console.error('⚠️ Database initialization notice:', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`\n🏛️  Prithvi Fix API Server`);
    console.log(`   Database: PostgreSQL`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Database Stats: http://localhost:${PORT}/api/db/stats`);
    console.log(`   Static SPA: ${fs.existsSync(frontendDistPath) ? 'Enabled (dist found)' : 'Disabled (run npm run build in frontend)'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down Prithvi Fix API server...');
    server.close(async () => {
      try {
        const { getPool } = require('./db/connection');
        await getPool().end();
        console.log('📦 PostgreSQL connection pool drained cleanly.');
      } catch (_) {}
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

module.exports = app;
