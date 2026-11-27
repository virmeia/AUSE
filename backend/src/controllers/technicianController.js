// backend/src/controllers/technicianController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendUserEmail } = require('../utils/mailer');

// Helper: Insert an in-app notification matching your notifications schema
const createNotification = async (userId, requestId, title, message) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, request_id, title, message) VALUES (?, ?, ?, ?)',
      [userId, requestId, title, message]
    );
  } catch (err) {
    console.error('Notification insert error:', err.message);
  }
};

// @desc    Admin lists all technicians & active job counts
// @route   GET /api/admin/technicians
// @access  Private (Admin)
const getAllTechnicians = async (req, res) => {
  try {
    const [techs] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone_number, u.specialty, u.is_available,
              COUNT(r.request_id) AS active_jobs
       FROM users u
       LEFT JOIN repair_requests r 
         ON r.technician_id = u.user_id AND r.status IN ('Quote Approved', 'Scheduled', 'In Progress')
       WHERE u.role = 'technician'
       GROUP BY u.user_id
       ORDER BY u.full_name ASC`
    );
    res.json(techs);
  } catch (err) {
    console.error('Get technicians error:', err);
    res.status(500).json({ message: 'Failed to fetch technicians.' });
  }
};

// @desc    Admin creates a new technician account
// @route   POST /api/admin/technicians
// @access  Private (Admin)
const createTechnician = async (req, res) => {
  try {
    const { full_name, email, phone_number, phone, password, specialty } = req.body;
    const contactNumber = phone_number || phone || '';

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role, specialty)
       VALUES (?, ?, ?, ?, 'technician', ?)`,
      [full_name.trim(), email.trim(), contactNumber, hashed, specialty || 'General Appliances']
    );

    res.status(201).json({
      message: 'Technician account created.',
      technician_id: result.insertId,
    });
  } catch (err) {
    console.error('Create technician error:', err);
    res.status(500).json({ message: 'Failed to create technician.' });
  }
};

// Helper: Parse a time window like "8:00 AM - 10:00 AM" into [startMinutes, endMinutes]
const parseTimeRange = (slot) => {
  if (!slot || typeof slot !== 'string') return null;
  const parts = slot.split('-').map((s) => s.trim());
  if (parts.length !== 2) return null;

  const toMinutes = (t) => {
    const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const mins = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const start = toMinutes(parts[0]);
  const end = toMinutes(parts[1]);
  if (start === null || end === null || end <= start) return null;
  return [start, end];
};

// @desc    Admin assigns technician & schedules visit (with double-booking conflict check)
// @route   PUT /api/admin/requests/:id/assign
// @access  Private (Admin)
const assignTechnician = async (req, res) => {
  try {
    const { technician_id, scheduled_date, scheduled_time, arrival_window } = req.body;
    const requestId = req.params.id;
    const timeSlot = scheduled_time || arrival_window || '8:00 AM - 10:00 AM';

    if (!technician_id || !scheduled_date) {
      return res.status(400).json({ message: 'Technician and scheduled date are required.' });
    }

    const [existingBookings] = await pool.query(
      `SELECT request_id, scheduled_time FROM repair_requests
       WHERE technician_id = ?
         AND DATE(scheduled_date) = DATE(?)
         AND status IN ('Scheduled', 'In Progress', 'Quote Approved')
         AND request_id != ?`,
      [technician_id, scheduled_date, requestId]
    );

    const requestedRange = parseTimeRange(timeSlot);
    const conflict = existingBookings.find((b) => {
      if ((b.scheduled_time || '').trim().toLowerCase() === timeSlot.trim().toLowerCase()) {
        return true;
      }
      const bookedRange = parseTimeRange(b.scheduled_time);
      if (requestedRange && bookedRange) {
        return requestedRange[0] < bookedRange[1] && bookedRange[0] < requestedRange[1];
      }
      return false;
    });

    if (conflict) {
      return res.status(409).json({
        message: `Schedule conflict: Technician is already booked on ${scheduled_date} (${conflict.scheduled_time}) for Ticket #${conflict.request_id}.`,
      });
    }

    await pool.query(
      `UPDATE repair_requests
       SET technician_id = ?, scheduled_date = ?, scheduled_time = ?, status = 'Scheduled'
       WHERE request_id = ?`,
      [technician_id, scheduled_date, timeSlot, requestId]
    );

    const [[ticket]] = await pool.query(
      'SELECT customer_id, appliance_type FROM repair_requests WHERE request_id = ?',
      [requestId]
    );

    if (ticket) {
      await createNotification(
        ticket.customer_id,
        requestId,
        'Technician Assigned & Scheduled',
        `Your ${ticket.appliance_type} repair (#${requestId}) is scheduled for ${scheduled_date} (${timeSlot}).`
      );
      sendUserEmail(
        pool,
        ticket.customer_id,
        `AUSE Visit Scheduled — Ticket #${requestId}`,
        `A technician has been assigned to your ${ticket.appliance_type} repair (#${requestId}) on ${scheduled_date} (${timeSlot}).`
      );
      await createNotification(
        technician_id,
        requestId,
        'New Repair Dispatch',
        `New job assigned: Ticket #${requestId} (${ticket.appliance_type}) on ${scheduled_date} (${timeSlot}).`
      );
    }

    res.json({ message: 'Technician assigned and visit scheduled.' });
  } catch (err) {
    console.error('Assign technician error:', err);
    res.status(500).json({ message: 'Failed to assign technician.' });
  }
};

// @desc    Technician gets assigned jobs
// @route   GET /api/technician/my-jobs
// @access  Private (Technician)
const getMyJobs = async (req, res) => {
  try {
    const techId = req.user.user_id || req.user.id;
    const [jobs] = await pool.query(
      `SELECT r.*, u.full_name AS customer_name, u.phone_number AS customer_phone
       FROM repair_requests r
       JOIN users u ON r.customer_id = u.user_id
       WHERE r.technician_id = ?
       ORDER BY FIELD(r.status, 'Scheduled', 'In Progress', 'Quote Approved', 'Completed'), r.scheduled_date ASC`,
      [techId]
    );
    res.json(jobs);
  } catch (err) {
    console.error('Get technician jobs error:', err);
    res.status(500).json({ message: 'Failed to load assigned jobs.' });
  }
};

// @desc    Technician adds field notes, after-repair photo & signature, and marks Completed (+30d warranty)
// @route   PUT /api/technician/jobs/:id/complete
// @access  Private (Technician)
const completeJob = async (req, res) => {
  try {
    const techId = req.user.user_id || req.user.id;
    const { technician_notes, customer_signature } = req.body;
    const afterPhotoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const [[ticket]] = await pool.query(
      'SELECT customer_id, appliance_type FROM repair_requests WHERE request_id = ? AND technician_id = ?',
      [req.params.id, techId]
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Assigned job not found.' });
    }

    await pool.query(
      `UPDATE repair_requests
       SET status = 'Completed',
           technician_notes = COALESCE(?, technician_notes),
           after_photo = COALESCE(?, after_photo),
           customer_signature = COALESCE(?, customer_signature),
           completed_at = NOW(),
           warranty_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
       WHERE request_id = ? AND technician_id = ?`,
      [
        technician_notes || null,
        afterPhotoPath,
        customer_signature || null,
        req.params.id,
        techId,
      ]
    );

    await createNotification(
      ticket.customer_id,
      req.params.id,
      'Repair Completed (30-Day Warranty Active)',
      `Your ${ticket.appliance_type} repair (#${req.params.id}) is Completed. Your 30-day service warranty is now active.`
    );
    sendUserEmail(
      pool,
      ticket.customer_id,
      `AUSE Repair Completed — Ticket #${req.params.id}`,
      `Your ${ticket.appliance_type} repair (#${req.params.id}) has been completed! Your 30-day workmanship warranty is now active. You can download your Official Receipt and leave a review in your AUSE Customer Portal.`
    );

    res.json({ message: 'Job marked as Completed with 30-day warranty.' });
  } catch (err) {
    console.error('Complete technician job error:', err);
    res.status(500).json({ message: 'Failed to complete job.' });
  }
};

module.exports = {
  getAllTechnicians,
  createTechnician,
  assignTechnician,
  getMyJobs,
  completeJob,
};