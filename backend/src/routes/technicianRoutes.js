const express = require('express');
const router = express.Router();
const {
  getMyJobs,
  completeJob,
} = require('../controllers/technicianController');
const { protect, technicianOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my-jobs', protect, technicianOnly, getMyJobs);
router.put('/jobs/:id/complete', protect, technicianOnly, upload.single('after_photo'), completeJob);

module.exports = router;