'use strict';
const fs   = require('fs');
const path = require('path');

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) return;
    const eqIdx = line.indexOf('=');
    const key   = line.slice(0, eqIdx).trim();
    const val   = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  });
}

const express = require('express');
const session = require('express-session');
const { testConnection } = require('./utils/db');

const app  = express();
const PORT = parseInt(process.env.PORT) || 3000;

// ── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'filedrop-dev-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }   // 24 hours
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',      require('./routes/main'));
app.use('/api',   require('./routes/api'));
app.use('/admin', require('./routes/admin'));
app.use('/auth',  require('./routes/auth'));
app.use('/user',  require('./routes/user'));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       🚀  FileDrop v2.0 (PostgreSQL)   ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  🌐  http://localhost:${PORT}              ║`);
  console.log('║  👤  /auth/login   — user login        ║');
  console.log('║  🔧  /admin        — admin panel       ║');
  console.log('║  🔑  admin / password                  ║');
  console.log('╚════════════════════════════════════════╝');

  // Test DB connection
  await testConnection();

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\n⚠️  SMTP not configured — OTP emails will fail.');
    console.warn('   Add SMTP_USER and SMTP_PASS to your .env file.\n');
  }
});
