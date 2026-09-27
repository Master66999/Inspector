const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all scan routes
router.use(requireAuth);

// ============================================================================
// 1. CREATE SCAN: POST /api/scans
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const { product_name, nutrition_data, ingredients_data, claims_data } = req.body;

    if (!product_name || typeof product_name !== 'string' || !product_name.trim()) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const cleanProductName = product_name.trim();

    // 1. Insert into scans
    const [scanResult] = await pool.query(
      'INSERT INTO scans (user_id, product_name) VALUES (?, ?)',
      [req.user.id, cleanProductName]
    );

    const scanId = scanResult.insertId;

    // 2. Insert into scan_results with JSON stringification safe handling
    const safeNutrition = nutrition_data ? JSON.stringify(nutrition_data) : null;
    const safeIngredients = ingredients_data ? JSON.stringify(ingredients_data) : null;
    const safeClaims = claims_data ? JSON.stringify(claims_data) : null;

    const [resultData] = await pool.query(
      'INSERT INTO scan_results (scan_id, nutrition_data, ingredients_data, claims_data) VALUES (?, ?, ?, ?)',
      [scanId, safeNutrition, safeIngredients, safeClaims]
    );

    // Fetch the complete inserted record
    const [createdRows] = await pool.query(
      `SELECT s.id, s.user_id, s.product_name, s.scanned_at,
              sr.nutrition_data, sr.ingredients_data, sr.claims_data
       FROM scans s
       LEFT JOIN scan_results sr ON s.id = sr.scan_id
       WHERE s.id = ?`,
      [scanId]
    );

    res.status(201).json({
      message: 'Scan recorded successfully',
      scan: createdRows[0]
    });
  } catch (error) {
    console.error('[Create Scan Error]:', error);
    res.status(500).json({ error: 'Failed to record scan.' });
  }
});

// ============================================================================
// 2. LIST SCANS: GET /api/scans
// Only returns scans belonging to the authenticated user.
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, s.product_name, s.scanned_at,
              sr.id as result_id, sr.nutrition_data, sr.ingredients_data, sr.claims_data, sr.created_at as result_created_at
       FROM scans s
       LEFT JOIN scan_results sr ON s.id = sr.scan_id
       WHERE s.user_id = ?
       ORDER BY s.scanned_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ scans: rows });
  } catch (error) {
    console.error('[List Scans Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve scans.' });
  }
});

// ============================================================================
// 3. GET SINGLE SCAN: GET /api/scans/:id
// Strictly protected: user can only access their own scan.
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const scanId = parseInt(req.params.id, 10);
    if (isNaN(scanId)) {
      return res.status(400).json({ error: 'Invalid scan ID.' });
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, s.product_name, s.scanned_at,
              sr.id as result_id, sr.nutrition_data, sr.ingredients_data, sr.claims_data, sr.created_at as result_created_at
       FROM scans s
       LEFT JOIN scan_results sr ON s.id = sr.scan_id
       WHERE s.id = ? AND s.user_id = ?`,
      [scanId, req.user.id]
    );

    if (rows.length === 0) {
      // Check if it exists for another user to verify isolation
      const [otherUserCheck] = await pool.query('SELECT id FROM scans WHERE id = ?', [scanId]);
      if (otherUserCheck.length > 0) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this scan.' });
      }
      return res.status(404).json({ error: 'Scan not found.' });
    }

    res.status(200).json({ scan: rows[0] });
  } catch (error) {
    console.error('[Get Scan Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve scan.' });
  }
});

// ============================================================================
// 4. DELETE SCAN: DELETE /api/scans/:id
// Strictly protected: user can only delete their own scan.
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const scanId = parseInt(req.params.id, 10);
    if (isNaN(scanId)) {
      return res.status(400).json({ error: 'Invalid scan ID.' });
    }

    // Check ownership
    const [rows] = await pool.query(
      'SELECT id, user_id FROM scans WHERE id = ?',
      [scanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot delete another user\'s scan.' });
    }

    // Delete scan (cascades to scan_results)
    await pool.query('DELETE FROM scans WHERE id = ? AND user_id = ?', [scanId, req.user.id]);

    res.status(200).json({ message: 'Scan deleted successfully.', id: scanId });
  } catch (error) {
    console.error('[Delete Scan Error]:', error);
    res.status(500).json({ error: 'Failed to delete scan.' });
  }
});

module.exports = router;
