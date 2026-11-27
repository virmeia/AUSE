const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getAllInquiries,
  updateInquiry,
} = require('../controllers/inquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public contact form submission
router.post('/', createInquiry);

// Admin inquiry management
router.get('/', protect, adminOnly, getAllInquiries);
router.put('/:id', protect, adminOnly, updateInquiry);

module.exports = router;