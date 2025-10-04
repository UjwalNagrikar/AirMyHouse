const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, username, email, role, first_name, last_name FROM users WHERE id = $1',
      [decoded.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const authorizeHost = (req, res, next) => {
  if (req.user.role !== 'host' && req.user.role !== 'both') {
    return res.status(403).json({ message: 'Access denied. Host privileges required.' });
  }
  next();
};

const authorizeOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      let query;
      
      if (resourceType === 'listing') {
        query = 'SELECT host_id FROM listings WHERE id = $1';
      } else if (resourceType === 'booking') {
        query = 'SELECT guest_id FROM bookings WHERE id = $1';
      }

      const result = await pool.query(query, [resourceId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: `${resourceType} not found` });
      }

      const ownerId = result.rows[0].host_id || result.rows[0].guest_id;
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this resource.' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { 
  authenticateToken, 
  authorizeHost, 
  authorizeOwner 
};