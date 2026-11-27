const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllPayments,
  recordPayment,
  getAllCustomers,
  getDashboardReports,
  getActivityLogs,
} = require('../controllers/adminController');
const {
  getAllTechnicians,
  createTechnician,
  assignTechnician,
} = require('../controllers/technicianController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Shared notification routes (Customer, Technician & Admin)
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, markNotificationRead);

// Admin-only routes
router.get('/payments', protect, adminOnly, getAllPayments);
router.post('/payments', protect, adminOnly, recordPayment);
router.get('/customers', protect, adminOnly, getAllCustomers);
router.get('/reports', protect, adminOnly, getDashboardReports);
router.get('/activity-logs', protect, adminOnly, getActivityLogs);

// Admin Technician Management & Dispatch
router.get('/technicians', protect, adminOnly, getAllTechnicians);
router.post('/technicians', protect, adminOnly, createTechnician);
router.put('/requests/:id/assign', protect, adminOnly, assignTechnician);

module.exports = router;