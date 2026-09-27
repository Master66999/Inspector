require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initializeDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files directly
app.use(express.static(path.join(__dirname)));

// ============================================================================
// API ROUTES
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PackCheck Backend'
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    pythonApiUrl: process.env.PYTHON_API_URL || ''
  });
});

// Fallback for SPA routing if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// ============================================================================
// SERVER STARTUP & DATABASE INITIALIZATION
// ============================================================================
async function startServer() {
  try {
    // Initialize MySQL database and tables
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`[PackCheck Server] Running on http://localhost:${PORT}`);
      console.log(`[PackCheck Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Startup Failure]:', error.message);
    // Still start server to serve frontend and allow credential configuration if DB is initially pending
    app.listen(PORT, () => {
      console.warn(`[PackCheck Server] Started with DB warning on http://localhost:${PORT}`);
    });
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
