// backend/src/controllers/reviewController.js
const pool = require('../config/db');

// @desc    Public fetches verified top-rated post-repair reviews for Landing Page
// @route   GET /api/reviews/public
// @access  Public
const getPublicReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rv.review_id, rv.rating, rv.comment, rv.created_at,
              u.full_name AS customer_name, r.appliance_type
       FROM reviews rv
       JOIN users u ON rv.customer_id = u.user_id
       JOIN repair_requests r ON rv.request_id = r.request_id
       WHERE r.status = 'Completed'
       ORDER BY rv.rating DESC, rv.created_at DESC
       LIMIT 6`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get public reviews error:', err);
    res.status(500).json({ message: 'Failed to load reviews.' });
  }
};

// @desc    Customer submits a 1-5 star review on a Completed ticket
// @route   POST /api/reviews
// @access  Private (Customer)
const submitReview = async (req, res) => {
  try {
    const { request_id, rating, comment } = req.body;
    const customerId = req.user.user_id;
    const stars = Number(rating);

    if (!request_id || Number.isNaN(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Valid request_id and rating (1-5) are required.' });
    }

    const [[ticket]] = await pool.query(
      'SELECT customer_id, status FROM repair_requests WHERE request_id = ?',
      [request_id]
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }
    if (ticket.customer_id !== customerId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (ticket.status !== 'Completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted after repair completion.' });
    }

    await pool.query(
      `INSERT INTO reviews (request_id, customer_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [request_id, customerId, stars, (comment || '').trim() || null]
    );

    res.status(201).json({ message: 'Thank you for your verified review!' });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
};

module.exports = { getPublicReviews, submitReview };
