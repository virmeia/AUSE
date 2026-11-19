const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  submitDiagnosisQuote,
  respondToQuote,
  scheduleVisit,
  cancelRequest,
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Customer routes
router.post('/', protect, upload.single('appliance_image'), createRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/:id/quote-response', protect, respondToQuote);

// Admin routes
router.get('/', protect, adminOnly, getAllRequests);
router.put('/:id/status', protect, adminOnly, updateRequestStatus);
router.put('/:id/quote', protect, adminOnly, submitDiagnosisQuote);
router.put('/:id/schedule', protect, adminOnly, scheduleVisit);
router.put('/:id/cancel', protect, cancelRequest);

// Shared route (Customer owner or Admin)
router.get('/:id', protect, getRequestById);

module.exports = router;