const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Simple email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// 1. SIGNUP: POST /api/auth/signup
// ============================================================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email is already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into MySQL
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [cleanName, cleanEmail, passwordHash]
    );

    const userId = result.insertId;

    // Log successful signup/login event
    await pool.query(
      'INSERT INTO login_events (user_id, success) VALUES (?, 1)',
      [userId]
    );

    // Issue JWT token
    const token = jwt.sign(
      { id: userId, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('packcheck_token', token, COOKIE_OPTIONS);

    // Return sanitized user profile (never exposing password_hash)
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error('[Signup Error]:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// ============================================================================
// 2. LOGIN: POST /api/auth/login
// ============================================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Lookup user in database
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      // Record failed attempt with null user_id
      await pool.query('INSERT INTO login_events (user_id, success) VALUES (NULL, 0)');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Record failed attempt for existing user
      await pool.query('INSERT INTO login_events (user_id, success) VALUES (?, 0)', [user.id]);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Record successful login event
    await pool.query('INSERT INTO login_events (user_id, success) VALUES (?, 1)', [user.id]);

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('packcheck_token', token, COOKIE_OPTIONS);

    // Return sanitized user profile
    res.status(200).json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ============================================================================
// 3. LOGOUT: POST /api/auth/logout
// ============================================================================
router.post('/logout', (req, res) => {
  res.clearCookie('packcheck_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'Logged out successfully.' });
});

// ============================================================================
// 4. CURRENT USER: GET /api/auth/me
// ============================================================================
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
