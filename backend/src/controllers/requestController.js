const pool = require('../config/db');
const logActivity = require('../utils/activityLogger');
const { sendUserEmail } = require('../utils/mailer');
const { streamReceiptPdf } = require('../utils/receiptPdf');

// Helper: Insert an in-app notification for a user
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

// @desc    Customer submits a new home appliance repair request
// @route   POST /api/requests
// @access  Private (Customer)
const createRequest = async (req, res) => {
  const {
    appliance_type,
    brand_model,
    problem_description,
    service_address,
    preferred_date,
  } = req.body;

  if (!appliance_type || !problem_description || !service_address || !preferred_date) {
    return res.status(400).json({
      message: 'Appliance type, problem description, service address, and preferred date are required.',
    });
  }

  const appliance_image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO repair_requests 
       (customer_id, appliance_type, brand_model, problem_description, appliance_image, service_address, preferred_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        req.user.user_id,
        appliance_type,
        brand_model || null,
        problem_description,
        appliance_image,
        service_address,
        preferred_date || null,
      ]
    );

    await logActivity(
      req.user.user_id,
      'Request Submitted',
      'Repair Requests',
      `Submitted ${appliance_type} repair request (#${result.insertId}).`
    );

    // Notify all Admin accounts of the new request
    const [admins] = await pool.query("SELECT user_id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        result.insertId,
        'New Repair Request',
        `A new ${appliance_type} repair request (#${result.insertId}) has been submitted.`
      );
    }

    res.status(201).json({
      message: 'Repair request submitted successfully.',
      request_id: result.insertId,
    });
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: 'Server error submitting repair request.' });
  }
};

// @desc    Get all repair requests belonging to the logged-in customer
// @route   GET /api/requests/my-requests
// @access  Private (Customer)
const getMyRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.payment_id, p.total_amount, p.amount_paid, p.balance, p.payment_status,
              t.full_name AS technician_name, t.phone_number AS technician_phone
       FROM repair_requests r
       LEFT JOIN payments p ON r.request_id = p.request_id
       LEFT JOIN users t ON r.technician_id = t.user_id
       WHERE r.customer_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get My Requests Error:', error);
    res.status(500).json({ message: 'Server error fetching your repair requests.' });
  }
};

// @desc    Get all repair requests (Admin queue with customer & technician details)
// @route   GET /api/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS customer_name, u.email AS customer_email, u.phone_number AS customer_phone,
              t.full_name AS technician_name,
              p.payment_id, p.total_amount, p.amount_paid, p.balance, p.payment_status
       FROM repair_requests r
       JOIN users u ON r.customer_id = u.user_id
       LEFT JOIN users t ON r.technician_id = t.user_id
       LEFT JOIN payments p ON r.request_id = p.request_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get All Requests Error:', error);
    res.status(500).json({ message: 'Server error fetching service requests.' });
  }
};

// @desc    Get single repair request by ID (Owner Customer or Admin)
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS customer_name, u.email AS customer_email, u.phone_number AS customer_phone,
              t.full_name AS technician_name,
              p.payment_id, p.total_amount, p.amount_paid, p.balance, p.payment_method, p.payment_status, p.notes AS payment_notes
       FROM repair_requests r
       JOIN users u ON r.customer_id = u.user_id
       LEFT JOIN users t ON r.technician_id = t.user_id
       LEFT JOIN payments p ON r.request_id = p.request_id
       WHERE r.request_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const request = rows[0];

    if (req.user.role === 'customer' && request.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [quotationItems] = await pool.query(
      'SELECT * FROM quotation_items WHERE request_id = ? ORDER BY item_id ASC',
      [req.params.id]
    );
    request.quotation_items = quotationItems;

    const [reviewRows] = await pool.query(
      'SELECT * FROM reviews WHERE request_id = ? LIMIT 1',
      [req.params.id]
    );
    request.review = reviewRows[0] || null;

    res.json(request);
  } catch (error) {
    console.error('Get Request By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching request details.' });
  }
};

// @desc    Admin approves, rejects, or updates general status (In Progress / Completed)
// @route   PUT /api/requests/:id/status
// @access  Private (Admin)
const updateRequestStatus = async (req, res) => {
  const { status, admin_remarks } = req.body;
  const allowedStatuses = ['Approved', 'Rejected', 'In Progress', 'Completed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM repair_requests WHERE request_id = ?', [
      req.params.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = existing[0];

    await pool.query(
      `UPDATE repair_requests
       SET status = ?,
           admin_remarks = COALESCE(?, admin_remarks),
           completed_at = CASE WHEN ? = 'Completed' THEN COALESCE(completed_at, NOW()) ELSE completed_at END,
           warranty_expires_at = CASE WHEN ? = 'Completed' THEN COALESCE(warranty_expires_at, DATE_ADD(NOW(), INTERVAL 30 DAY)) ELSE warranty_expires_at END
       WHERE request_id = ?`,
      [status, admin_remarks || null, status, status, req.params.id]
    );

    await createNotification(
      ticket.customer_id,
      ticket.request_id,
      `Repair Request ${status}`,
      `Your ${ticket.appliance_type} repair request (#${ticket.request_id}) is now marked as ${status}.`
    );

    res.json({ message: `Request status updated to ${status}.` });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error updating request status.' });
  }
};

// @desc    Admin submits appliance diagnosis & repair quotation
// @route   PUT /api/requests/:id/quote
// @access  Private (Admin)
const submitDiagnosisQuote = async (req, res) => {
  const { diagnosis_notes, recommended_service, estimated_cost, admin_remarks } = req.body;

  if (!diagnosis_notes || !recommended_service || estimated_cost === undefined) {
    return res.status(400).json({
      message: 'Diagnosis notes, recommended service, and estimated cost are required.',
    });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM repair_requests WHERE request_id = ?', [
      req.params.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = existing[0];

    await pool.query(
      `UPDATE repair_requests 
       SET diagnosis_notes = ?, recommended_service = ?, estimated_cost = ?, status = 'Quoted',
           admin_remarks = COALESCE(?, admin_remarks)
       WHERE request_id = ?`,
      [diagnosis_notes, recommended_service, estimated_cost, admin_remarks || null, req.params.id]
    );

    await createNotification(
      ticket.customer_id,
      ticket.request_id,
      'Repair Quotation Ready',
      `A quotation of ₱${Number(estimated_cost).toLocaleString()} is ready for your ${ticket.appliance_type} (#${ticket.request_id}). Please review and approve.`
    );
    sendUserEmail(
      pool,
      ticket.customer_id,
      `AUSE Quotation Ready — Ticket #${ticket.request_id}`,
      `Your repair quotation of ₱${Number(estimated_cost).toLocaleString()} for ${ticket.appliance_type} (#${ticket.request_id}) is ready. Log in to your AUSE Customer Portal to review and approve.`
    );

    res.json({ message: 'Diagnosis and quotation sent to customer.' });
  } catch (error) {
    console.error('Submit Quote Error:', error);
    res.status(500).json({ message: 'Server error saving diagnosis and quotation.' });
  }
};

// @desc    Customer approves or rejects a repair quotation
// @route   PUT /api/requests/:id/quote-response
// @access  Private (Customer)
const respondToQuote = async (req, res) => {
  const decision = req.body.decision || req.body.status;

  if (!['Quote Approved', 'Quote Rejected', 'Cancelled'].includes(decision)) {
    return res.status(400).json({ message: 'Decision must be Quote Approved or Quote Rejected.' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM repair_requests WHERE request_id = ?', [
      req.params.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = existing[0];
    if (ticket.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const hasDiagnosticOnly =
      decision === 'Quote Rejected' && Number(ticket.diagnostic_fee || 0) > 0;

    if (hasDiagnosticOnly) {
      await pool.query(
        'UPDATE repair_requests SET status = ?, estimated_cost = ? WHERE request_id = ?',
        [decision, Number(ticket.diagnostic_fee), req.params.id]
      );
    } else {
      await pool.query('UPDATE repair_requests SET status = ? WHERE request_id = ?', [
        decision,
        req.params.id,
      ]);
    }

    const [admins] = await pool.query("SELECT user_id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        ticket.request_id,
        `Quotation ${decision === 'Quote Approved' ? 'Approved' : 'Rejected'}`,
        hasDiagnosticOnly
          ? `Customer declined the main repair for ${ticket.appliance_type} (#${ticket.request_id}). Diagnostic fee due: ₱${Number(ticket.diagnostic_fee).toLocaleString()}.`
          : `Customer ${decision === 'Quote Approved' ? 'approved' : 'rejected'} the quotation for ${ticket.appliance_type} (#${ticket.request_id}).`
      );
    }

    res.json({ message: `Quotation marked as ${decision}.` });
  } catch (error) {
    console.error('Respond Quote Error:', error);
    res.status(500).json({ message: 'Server error responding to quotation.' });
  }
};

// @desc    Admin schedules a home-service appointment visit
// @route   PUT /api/requests/:id/schedule
// @access  Private (Admin)
const scheduleVisit = async (req, res) => {
  const { scheduled_date, scheduled_time, admin_remarks } = req.body;

  if (!scheduled_date || !scheduled_time) {
    return res.status(400).json({ message: 'Scheduled date and time slot are required.' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM repair_requests WHERE request_id = ?', [
      req.params.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const [conflicts] = await pool.query(
      `SELECT request_id FROM repair_requests 
       WHERE scheduled_date = ? AND scheduled_time = ? AND request_id != ? AND status IN ('Scheduled', 'In Progress')`,
      [scheduled_date, scheduled_time, req.params.id]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: 'Another home-service visit is already scheduled for that date and time slot.',
      });
    }

    const ticket = existing[0];

    await pool.query(
      `UPDATE repair_requests 
       SET scheduled_date = ?, scheduled_time = ?, status = 'Scheduled',
           admin_remarks = COALESCE(?, admin_remarks)
       WHERE request_id = ?`,
      [scheduled_date, scheduled_time, admin_remarks || null, req.params.id]
    );

    await createNotification(
      ticket.customer_id,
      ticket.request_id,
      'Home-Service Visit Scheduled',
      `Your ${ticket.appliance_type} repair visit (#${ticket.request_id}) is scheduled on ${scheduled_date} (${scheduled_time}).`
    );

    res.json({ message: 'Home-service appointment scheduled successfully.' });
  } catch (error) {
    console.error('Schedule Visit Error:', error);
    res.status(500).json({ message: 'Server error scheduling home-service visit.' });
  }
};

// @desc    Soft-cancel a repair request
// @route   PUT /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res) => {
  const requestId = req.params.id;
  const { reason } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM repair_requests WHERE request_id = ?',
      [requestId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = rows[0];

    if (req.user.role !== 'admin') {
      if (ticket.customer_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to cancel this request.' });
      }
      if (ticket.status !== 'Pending') {
        return res.status(400).json({
          message: 'Only Pending repair requests can be cancelled by the customer.',
        });
      }
    } else if (ticket.status === 'Completed') {
      return res.status(400).json({ message: 'Completed requests cannot be cancelled.' });
    }

    const remarkText = reason
      ? `Cancelled (${req.user.role}): ${reason}`
      : `Cancelled by ${req.user.role}`;

    await pool.query(
      `UPDATE repair_requests 
       SET status = 'Cancelled', admin_remarks = ?
       WHERE request_id = ?`,
      [remarkText, requestId]
    );

    await logActivity(
      req.user.user_id,
      'Request Cancelled',
      'Repair Requests',
      `Ticket #${requestId} (${ticket.appliance_type}) was marked as Cancelled.`
    );

    res.json({ message: 'Repair request has been cancelled.' });
  } catch (error) {
    console.error('Cancel Request Error:', error);
    res.status(500).json({ message: 'Server error cancelling repair request.' });
  }
};

// @desc    Get itemized quotation line items for a repair request
// @route   GET /api/requests/:id/quotation-items
// @access  Private
const getQuotationItems = async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT * FROM quotation_items WHERE request_id = ? ORDER BY item_id ASC',
      [req.params.id]
    );
    const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    res.json({ items, total });
  } catch (err) {
    console.error('Get quotation items error:', err);
    res.status(500).json({ message: 'Failed to fetch quotation items.' });
  }
};

// @desc    Admin saves itemized quotation & syncs estimated_cost / diagnostic_fee
// @route   PUT /api/requests/:id/quotation-items
// @access  Private (Admin)
const saveQuotationItems = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items = [], admin_remarks, admin_notes, status = 'Quoted' } = req.body;
    const requestId = req.params.id;
    const remarks = admin_remarks || admin_notes || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one quotation line item is required.' });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM quotation_items WHERE request_id = ?', [requestId]);

    let grandTotal = 0;
    let diagnosticTotal = 0;

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity || 1));
      const price = Math.max(0, Number(item.unit_price || 0));
      const lineTotal = qty * price;
      grandTotal += lineTotal;

      if (item.item_type === 'Diagnostic Fee') {
        diagnosticTotal += lineTotal;
      }

      await conn.query(
        'INSERT INTO quotation_items (request_id, item_type, description, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [requestId, item.item_type || 'Part', item.description.trim(), qty, price]
      );
    }

    await conn.query(
      `UPDATE repair_requests 
       SET estimated_cost = ?, diagnostic_fee = ?, admin_remarks = COALESCE(?, admin_remarks), status = ?
       WHERE request_id = ?`,
      [grandTotal, diagnosticTotal, remarks, status, requestId]
    );

    const [[reqRow]] = await conn.query(
      'SELECT customer_id, appliance_type FROM repair_requests WHERE request_id = ?',
      [requestId]
    );

    if (reqRow) {
      await createNotification(
        reqRow.customer_id,
        requestId,
        'Itemized Quotation Ready',
        `Itemized quotation (₱${grandTotal.toLocaleString()}) is ready for your ${reqRow.appliance_type} request #${requestId}.`
      );
      sendUserEmail(
        pool,
        reqRow.customer_id,
        `AUSE Itemized Quotation Ready — Ticket #${requestId}`,
        `An itemized quotation totaling ₱${grandTotal.toLocaleString()} is ready for your ${reqRow.appliance_type} (#${requestId}). Log in to your AUSE Customer Portal to review the breakdown.`
      );
    }

    await conn.commit();
    res.json({ message: 'Itemized quotation saved.', total: grandTotal });
  } catch (err) {
    await conn.rollback();
    console.error('Save quotation items error:', err);
    res.status(500).json({ message: 'Failed to save itemized quotation.' });
  } finally {
    conn.release();
  }
};

// @desc    Download PDF Official Receipt / Service Invoice
// @route   GET /api/requests/:id/receipt
// @access  Private (Customer owner or Admin)
const downloadReceipt = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS customer_name, u.email AS customer_email, u.phone_number AS customer_phone,
              p.payment_id, p.total_amount, p.amount_paid, p.balance, p.payment_method, p.payment_status
       FROM repair_requests r
       JOIN users u ON r.customer_id = u.user_id
       LEFT JOIN payments p ON r.request_id = p.request_id
       WHERE r.request_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = rows[0];
    if (req.user.role === 'customer' && ticket.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [items] = await pool.query(
      'SELECT * FROM quotation_items WHERE request_id = ? ORDER BY item_id ASC',
      [req.params.id]
    );

    streamReceiptPdf(res, ticket, items);
  } catch (err) {
    console.error('Download receipt error:', err);
    res.status(500).json({ message: 'Failed to generate PDF receipt.' });
  }
};

// @desc    Customer claims 30-day warranty on a Completed repair request
// @route   POST /api/requests/:id/claim-warranty
// @access  Private (Customer)
const claimWarranty = async (req, res) => {
  try {
    const { reason } = req.body;
    const [[orig]] = await pool.query(
      'SELECT * FROM repair_requests WHERE request_id = ?',
      [req.params.id]
    );

    if (!orig) {
      return res.status(404).json({ message: 'Original repair request not found.' });
    }
    if (orig.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (orig.status !== 'Completed') {
      return res.status(400).json({ message: 'Warranty can only be claimed on Completed repairs.' });
    }
    if (orig.warranty_expires_at && new Date(orig.warranty_expires_at) < new Date()) {
      return res.status(400).json({ message: 'Your 30-day service warranty has expired.' });
    }

    const description = `[WARRANTY CLAIM for Ticket #${orig.request_id}] ${
      (reason || 'Recurring issue under 30-day workmanship warranty.').trim()
    }`;

    const [result] = await pool.query(
      `INSERT INTO repair_requests
       (customer_id, appliance_type, brand_model, problem_description, service_address, status, warranty_claim_of)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        orig.customer_id,
        orig.appliance_type,
        orig.brand_model || null,
        description,
        orig.service_address,
        orig.request_id,
      ]
    );

    const [admins] = await pool.query("SELECT user_id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        result.insertId,
        'Warranty Claim Submitted',
        `Customer claimed 30-day warranty for ${orig.appliance_type} (Original Ticket #${orig.request_id} → New Ticket #${result.insertId}).`
      );
    }

    res.status(201).json({
      message: 'Warranty claim submitted! Our team will prioritize your follow-up visit.',
      request_id: result.insertId,
    });
  } catch (err) {
    console.error('Claim warranty error:', err);
    res.status(500).json({ message: 'Failed to submit warranty claim.' });
  }
};

module.exports = {
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
};