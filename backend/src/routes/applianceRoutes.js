// backend/src/routes/applianceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMyAppliances,
  addAppliance,
  deleteAppliance,
} = require('../controllers/applianceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyAppliances);
router.post('/', protect, addAppliance);
router.delete('/:id', protect, deleteAppliance);

module.exports = router;
