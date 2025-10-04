// backend/src/routes/listings.js
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeHost, authorizeOwner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/listings
// @desc    Get all listings with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      location, 
      min_price, 
      max_price, 
      property_type, 
      min_guests,
      amenities, // comma-separated amenity IDs
      page = 1, 
      limit = 20 
    } = req.query;

    let query = `
      SELECT DISTINCT l.*, 
             u.username as host_username,
             u.first_name as host_first_name,
             u.last_name as host_last_name,
             (SELECT photo_url FROM listing_photos WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_photo,
             (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
      FROM listings l
      JOIN users u ON l.host_id = u.id
      WHERE l.status = 'active'
    `;

    const params = [];
    let paramCount = 1;

    if (location) {
      query += ` AND (l.location ILIKE $${paramCount} OR l.city ILIKE $${paramCount} OR l.country ILIKE $${paramCount})`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (min_price) {
      query += ` AND l.price_per_night >= $${paramCount}`;
      params.push(min_price);
      paramCount++;
    }

    if (max_price) {
      query += ` AND l.price_per_night <= $${paramCount}`;
      params.push(max_price);
      paramCount++;
    }

    if (property_type) {
      query += ` AND l.property_type = $${paramCount}`;
      params.push(property_type);
      paramCount++;
    }

    if (min_guests) {
      query += ` AND l.max_guests >= $${paramCount}`;
      params.push(min_guests);
      paramCount++;
    }

    if (amenities) {
      const amenityIds = amenities.split(',').map(id => parseInt(id));
      query += ` AND l.id IN (
        SELECT listing_id FROM listing_amenities 
        WHERE amenity_id = ANY($${paramCount})
        GROUP BY listing_id
        HAVING COUNT(DISTINCT amenity_id) = $${paramCount + 1}
      )`;
      params.push(amenityIds, amenityIds.length);
      paramCount += 2;
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT l.id) FROM listings l WHERE l.status = \'active\'';
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      listings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT l.*, 
              u.username as host_username,
              u.first_name as host_first_name,
              u.last_name as host_last_name,
              u.profile_photo as host_photo,
              u.bio as host_bio,
              u.created_at as host_member_since,
              (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
       FROM listings l
       JOIN users u ON l.host_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = result.rows[0];

    // Get photos
    const photosResult = await pool.query(
      'SELECT * FROM listing_photos WHERE listing_id = $1 ORDER BY is_primary DESC, display_order',
      [id]
    );
    listing.photos = photosResult.rows;

    // Get amenities
    const amenitiesResult = await pool.query(
      `SELECT a.* FROM amenities a
       JOIN listing_amenities la ON a.id = la.amenity_id
       WHERE la.listing_id = $1`,
      [id]
    );
    listing.amenities = amenitiesResult.rows;

    // Get recent reviews
    const reviewsResult = await pool.query(
      `SELECT r.*, u.username, u.first_name, u.last_name, u.profile_photo
       FROM reviews r
       JOIN users u ON r.guest_id = u.id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );
    listing.reviews = reviewsResult.rows;

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private (Host only)
router.post('/', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const {
      title,
      description,
      property_type,
      location,
      address,
      city,
      state,
      country,
      zipcode,
      latitude,
      longitude,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      instant_book,
      amenities,
      photos
    } = req.body;

    // Validation
    if (!title || !description || !property_type || !location || !price_per_night) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Insert listing
    const result = await pool.query(
      `INSERT INTO listings (
        host_id, title, description, property_type, location, address, 
        city, state, country, zipcode, latitude, longitude, 
        price_per_night, bedrooms, bathrooms, max_guests, instant_book
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id, title, description, property_type, location, address,
        city, state, country, zipcode, latitude, longitude,
        price_per_night, bedrooms, bathrooms, max_guests, instant_book
      ]
    );

    const listing = result.rows[0];

    // Add amenities if provided
    if (amenities && amenities.length > 0) {
      const amenityValues = amenities.map((amenityId, idx) => 
        `(${listing.id}, ${idx + 1})`
      ).join(',');
      
      await pool.query(
        `INSERT INTO listing_amenities (listing_id, amenity_id) VALUES ${amenityValues}`,
        amenities
      );
    }

    // Add photos if provided
    if (photos && photos.length > 0) {
      const photoValues = photos.map((photo, idx) => 
        `($1, ${idx + 2}, ${idx + 2 + photos.length}, ${idx + 2 + photos.length * 2})`
      ).join(',');
      
      const photoParams = [listing.id];
      photos.forEach((photo, idx) => {
        photoParams.push(photo.url, idx === 0, idx);
      });

      await pool.query(
        `INSERT INTO listing_photos (listing_id, photo_url, is_primary, display_order) 
         VALUES ${photoValues}`,
        photoParams
      );
    }

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private (Owner only)
router.put('/:id', authenticateToken, authorizeHost, authorizeOwner('listing'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      property_type,
      location,
      address,
      city,
      state,
      country,
      zipcode,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      instant_book,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE listings SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        property_type = COALESCE($3, property_type),
        location = COALESCE($4, location),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        country = COALESCE($8, country),
        zipcode = COALESCE($9, zipcode),
        price_per_night = COALESCE($10, price_per_night),
        bedrooms = COALESCE($11, bedrooms),
        bathrooms = COALESCE($12, bathrooms),
        max_guests = COALESCE($13, max_guests),
        instant_book = COALESCE($14, instant_book),
        status = COALESCE($15, status)
      WHERE id = $16
      RETURNING *`,
      [title, description, property_type, location, address, city, state, 
       country, zipcode, price_per_night, bedrooms, bathrooms, max_guests, 
       instant_book, status, id]
    );

    res.json({
      message: 'Listing updated successfully',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, authorizeHost, authorizeOwner('listing'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;