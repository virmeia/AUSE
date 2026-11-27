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
  getQuotationItems,
  saveQuotationItems,
  downloadReceipt,
  claimWarranty,
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Customer routes
router.post('/', protect, upload.single('appliance_image'), createRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/:id/quote-response', protect, respondToQuote);
router.post('/:id/claim-warranty', protect, claimWarranty);

// Admin routes
router.get('/', protect, adminOnly, getAllRequests);
router.put('/:id/status', protect, adminOnly, updateRequestStatus);
router.put('/:id/quote', protect, adminOnly, submitDiagnosisQuote);
router.put('/:id/schedule', protect, adminOnly, scheduleVisit);
router.put('/:id/cancel', protect, cancelRequest);

// Itemized Quotation & PDF Receipt routes
router.get('/:id/quotation-items', protect, getQuotationItems);
router.put('/:id/quotation-items', protect, adminOnly, saveQuotationItems);
router.get('/:id/receipt', protect, downloadReceipt);

// Shared route (Customer owner or Admin) — keep wildcard /:id last
router.get('/:id', protect, getRequestById);

module.exports = router;