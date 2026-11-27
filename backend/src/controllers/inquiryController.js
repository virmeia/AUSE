// backend/src/controllers/inquiryController.js
const pool = require('../config/db');

// @desc    Public submits contact inquiry or feedback from Landing Page
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO inquiries (sender_name, sender_email, subject, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), subject || 'General Inquiry', message.trim()]
    );

    res.status(201).json({
      message: 'Inquiry submitted successfully.',
      inquiry_id: result.insertId,
    });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ message: 'Failed to submit inquiry.' });
  }
};

// @desc    Admin lists all inquiries
// @route   GET /api/inquiries
// @access  Private (Admin)
const getAllInquiries = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM inquiries ORDER BY FIELD(status, "New", "Replied", "Resolved"), created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get inquiries error:', err);
    res.status(500).json({ message: 'Failed to load inquiries.' });
  }
};

// @desc    Admin updates inquiry status or saves reply note
// @route   PUT /api/inquiries/:id
// @access  Private (Admin)
const updateInquiry = async (req, res) => {
  try {
    const { status, admin_reply } = req.body;
    const [result] = await pool.query(
      `UPDATE inquiries 
       SET status = COALESCE(?, status), 
           admin_reply = COALESCE(?, admin_reply),
           replied_at = CASE WHEN ? IS NOT NULL THEN NOW() ELSE replied_at END
       WHERE inquiry_id = ?`,
      [status || null, admin_reply || null, admin_reply || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    res.json({ message: 'Inquiry updated.' });
  } catch (err) {
    console.error('Update inquiry error:', err);
    res.status(500).json({ message: 'Failed to update inquiry.' });
  }
};

module.exports = {
  createInquiry,
  getAllInquiries,
  updateInquiry,
};