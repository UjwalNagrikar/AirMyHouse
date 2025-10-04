const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;

    let query;
    if (role === 'host') {
      query = `
        SELECT b.*, 
               l.title as listing_title,
               l.location as listing_location,
               u.username as guest_username,
               u.first_name as guest_first_name,
               u.last_name as guest_last_name,
               u.email as guest_email,
               (SELECT photo_url FROM listing_photos WHERE listing_id = l.id AND is_primary = true LIMIT 1) as listing_photo
        FROM bookings b
        JOIN listings l ON b.listing_id = l.id
        JOIN users u ON b.guest_id = u.id
        WHERE l.host_id = $1
        ORDER BY b.created_at DESC
      `;
    } else {
      query = `
        SELECT b.*, 
               l.title as listing_title,
               l.location as listing_location,
               u.username as host_username,
               u.first_name as host_first_name,
               u.last_name as host_last_name,
               (SELECT photo_url FROM listing_photos WHERE listing_id = l.id AND is_primary = true LIMIT 1) as listing_photo
        FROM bookings b
        JOIN listings l ON b.listing_id = l.id
        JOIN users u ON l.host_id = u.id
        WHERE b.guest_id = $1
        ORDER BY b.created_at DESC
      `;
    }

    const result = await pool.query(query, [req.user.id]);
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, 
              l.title as listing_title,
              l.location as listing_location,
              l.address as listing_address,
              l.host_id,
              u_guest.username as guest_username,
              u_guest.first_name as guest_first_name,
              u_guest.last_name as guest_last_name,
              u_guest.email as guest_email,
              u_guest.phone as guest_phone,
              u_host.username as host_username,
              u_host.first_name as host_first_name,
              u_host.last_name as host_last_name,
              u_host.email as host_email,
              u_host.phone as host_phone
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u_guest ON b.guest_id = u_guest.id
       JOIN users u_host ON l.host_id = u_host.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = result.rows[0];

    if (booking.guest_id !== req.user.id && booking.host_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { listing_id, start_date, end_date, num_guests } = req.body;

    if (!listing_id || !start_date || !end_date || !num_guests) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const listingResult = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND status = $2',
      [listing_id, 'active']
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or inactive' });
    }

    const listing = listingResult.rows[0];

    if (listing.host_id === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own listing' });
    }

    const conflictResult = await pool.query(
      `SELECT * FROM bookings 
       WHERE listing_id = $1 
       AND status NOT IN ('rejected', 'cancelled')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [listing_id, start_date, end_date]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'Listing is not available for selected dates' });
    }

    if (num_guests > listing.max_guests) {
      return res.status(400).json({ 
        message: `This listing can accommodate maximum ${listing.max_guests} guests` 
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total_price = nights * listing.price_per_night;

    const result = await pool.query(
      `INSERT INTO bookings (
        listing_id, guest_id, start_date, end_date, 
        num_guests, total_price, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [listing_id, req.user.id, start_date, end_date, num_guests, total_price, 
       listing.instant_book ? 'accepted' : 'pending']
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bookingResult = await pool.query(
      `SELECT b.*, l.host_id 
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.host_id !== req.user.id && booking.guest_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.host_id === req.user.id && !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status for host' });
    }

    if (booking.guest_id === req.user.id && status !== 'cancelled') {
      return res.status(400).json({ message: 'Guests can only cancel bookings' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({
      message: 'Booking updated successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND guest_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found or access denied' });
    }

    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;