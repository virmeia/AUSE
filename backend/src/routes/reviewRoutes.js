// backend/src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicReviews, submitReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicReviews);
router.post('/', protect, submitReview);

module.exports = router;
