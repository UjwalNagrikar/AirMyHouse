const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, phone, 
              role, profile_photo, bio, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, bio, profile_photo } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        bio = COALESCE($4, bio),
        profile_photo = COALESCE($5, profile_photo)
      WHERE id = $6
      RETURNING id, username, email, first_name, last_name, phone, 
                role, profile_photo, bio, created_at`,
      [first_name, last_name, phone, bio, profile_photo, req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/listings', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT l.*,
              (SELECT photo_url FROM listing_photos WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_photo,
              (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
       FROM listings l
       WHERE l.host_id = $1 AND l.status = 'active'
       ORDER BY l.created_at DESC`,
      [id]
    );

    res.json({ listings: result.rows });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, 
              l.title as listing_title,
              u.username as reviewer_username,
              u.first_name as reviewer_first_name,
              u.last_name as reviewer_last_name,
              u.profile_photo as reviewer_photo
       FROM reviews r
       JOIN listings l ON r.listing_id = l.id
       JOIN users u ON r.guest_id = u.id
       WHERE l.host_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;