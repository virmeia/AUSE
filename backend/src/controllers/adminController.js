const pool = require('../config/db');
const logActivity = require('../utils/activityLogger');

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

// ==========================================
// 1. IN-APP NOTIFICATIONS
// ==========================================
const getMyNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notification.' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.user_id]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notifications.' });
  }
};

// ==========================================
// 2. PAYMENTS & BILLING MANAGEMENT
// ==========================================
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, r.appliance_type, r.brand_model, r.status AS request_status,
              u.full_name AS customer_name, u.email AS customer_email, u.phone_number AS customer_phone
       FROM payments p
       JOIN repair_requests r ON p.request_id = r.request_id
       JOIN users u ON p.customer_id = u.user_id
       ORDER BY p.payment_date DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching payment records.' });
  }
};

const recordPayment = async (req, res) => {
  const { request_id, total_amount, amount_paid, payment_method, notes } = req.body;

  if (!request_id || total_amount === undefined || amount_paid === undefined) {
    return res.status(400).json({
      message: 'Request ID, total amount, and amount paid are required.',
    });
  }

  const total = Number(total_amount);
  const paid = Number(amount_paid);

  let payment_status = 'Unpaid';
  if (paid >= total && total > 0) payment_status = 'Paid';
  else if (paid > 0 && paid < total) payment_status = 'Partial';

  try {
    const [reqRows] = await pool.query(
      'SELECT request_id, customer_id, appliance_type FROM repair_requests WHERE request_id = ?',
      [request_id]
    );
    if (reqRows.length === 0) {
      return res.status(404).json({ message: 'Repair request not found.' });
    }

    const ticket = reqRows[0];
    const [existing] = await pool.query(
      'SELECT payment_id FROM payments WHERE request_id = ?',
      [request_id]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE payments 
         SET total_amount = ?, amount_paid = ?, payment_method = ?, payment_status = ?, notes = ?, payment_date = CURRENT_TIMESTAMP
         WHERE request_id = ?`,
        [total, paid, payment_method || 'Cash', payment_status, notes || null, request_id]
      );
    } else {
      await pool.query(
        `INSERT INTO payments (request_id, customer_id, total_amount, amount_paid, payment_method, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [request_id, ticket.customer_id, total, paid, payment_method || 'Cash', payment_status, notes || null]
      );
    }

    await createNotification(
      ticket.customer_id,
      ticket.request_id,
      `Payment Recorded (${payment_status})`,
      `A payment of ₱${paid.toLocaleString()} (${payment_method || 'Cash'}) has been recorded for your ${ticket.appliance_type} repair.`
    );

    await logActivity(
      req.user.user_id,
      'Payment Recorded',
      'Billing & Payments',
      `Recorded ₱${paid.toLocaleString()} (${payment_status} via ${payment_method || 'Cash'}) for Ticket #${ticket.request_id}.`
    );

    res.status(201).json({
      message: `Payment saved and marked as ${payment_status}.`,
      payment_status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving payment record.' });
  }
};

// ==========================================
// 3. CUSTOMER DIRECTORY
// ==========================================
const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone_number, u.default_address, u.created_at,
              COUNT(DISTINCT r.request_id) AS total_requests,
              COALESCE(SUM(p.amount_paid), 0) AS total_spent
       FROM users u
       LEFT JOIN repair_requests r ON u.user_id = r.customer_id
       LEFT JOIN payments p ON u.user_id = p.customer_id
       WHERE u.role = 'customer'
       GROUP BY u.user_id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching customers.' });
  }
};

// ==========================================
// 4. ACTIVITY LOGS (SQL JOIN + ALIASES)
// ==========================================
const getActivityLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.log_id AS audit_id,
              l.action AS event_action,
              l.module AS system_module,
              l.details AS event_description,
              l.created_at AS logged_at,
              COALESCE(u.full_name, 'System') AS actor_name,
              COALESCE(u.role, 'system') AS actor_role
       FROM activity_logs l
       LEFT JOIN users u ON l.user_id = u.user_id
       ORDER BY l.created_at DESC
       LIMIT 150`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get Activity Logs Error:', error);
    res.status(500).json({ message: 'Server error fetching activity logs.' });
  }
};

// ==========================================
// 5. DASHBOARD ANALYTICS & EXPORTABLE REPORTS (DATE-RANGE + SQL JOINS & ALIASES)
// ==========================================
const getDashboardReports = async (req, res) => {
  const { start_date, end_date, year } = req.query;

  try {
    // Build optional date filter for repair_requests & payments
    let reqWhere = 'WHERE 1=1';
    let payWhere = 'WHERE 1=1';
    const reqParams = [];
    const payParams = [];

    if (year && year !== 'ALL') {
      reqWhere += ' AND YEAR(r.created_at) = ?';
      payWhere += ' AND YEAR(p.payment_date) = ?';
      reqParams.push(Number(year));
      payParams.push(Number(year));
    }
    if (start_date) {
      reqWhere += ' AND DATE(r.created_at) >= ?';
      payWhere += ' AND DATE(p.payment_date) >= ?';
      reqParams.push(start_date);
      payParams.push(start_date);
    }
    if (end_date) {
      reqWhere += ' AND DATE(r.created_at) <= ?';
      payWhere += ' AND DATE(p.payment_date) <= ?';
      reqParams.push(end_date);
      payParams.push(end_date);
    }

    // 1. Summary KPIs
    const [statusCounts] = await pool.query(
      `SELECT 
        COUNT(*) AS total_requests,
        SUM(CASE WHEN r.status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests,
        SUM(CASE WHEN r.status IN ('Approved', 'Quoted', 'Quote Approved', 'Scheduled', 'In Progress') THEN 1 ELSE 0 END) AS active_requests,
        SUM(CASE WHEN r.status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduled_visits,
        SUM(CASE WHEN r.status = 'Completed' THEN 1 ELSE 0 END) AS completed_requests,
        SUM(CASE WHEN r.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_requests
       FROM repair_requests r
       ${reqWhere}`,
      reqParams
    );

    const [revenueRows] = await pool.query(
      `SELECT 
        COALESCE(SUM(p.amount_paid), 0) AS total_revenue,
        COALESCE(SUM(p.balance), 0) AS pending_balance
       FROM payments p
       ${payWhere}`,
      payParams
    );

    const [customerRows] = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'"
    );

    // 2. Appliance Demand Breakdown (for Visual Chart)
    const [applianceBreakdown] = await pool.query(
      `SELECT r.appliance_type AS category_name,
              COUNT(*) AS request_count,
              SUM(CASE WHEN r.status = 'Completed' THEN 1 ELSE 0 END) AS completed_count
       FROM repair_requests r
       ${reqWhere}
       GROUP BY r.appliance_type
       ORDER BY request_count DESC`,
      reqParams
    );

    // 3. Monthly Revenue & Job Volume Trend (for Visual Chart)
    const [monthlyTrend] = await pool.query(
      `SELECT DATE_FORMAT(p.payment_date, '%b %Y') AS month_label,
              DATE_FORMAT(p.payment_date, '%Y-%m') AS sort_key,
              COALESCE(SUM(p.amount_paid), 0) AS collected_revenue,
              COUNT(p.payment_id) AS paid_jobs
       FROM payments p
       ${payWhere}
       GROUP BY sort_key, month_label
       ORDER BY sort_key ASC
       LIMIT 12`,
      payParams
    );

    // 4. Exportable Service & Financial Report with Explicit SQL JOINs & Aliases
    const [reportRows] = await pool.query(
      `SELECT r.request_id AS ticket_reference,
              DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date_requested,
              u.full_name AS client_full_name,
              u.phone_number AS client_contact,
              r.appliance_type AS appliance_category,
              COALESCE(r.brand_model, 'Unspecified') AS unit_model,
              r.status AS repair_stage,
              COALESCE(r.estimated_cost, 0) AS quoted_fee,
              COALESCE(p.amount_paid, 0) AS settled_amount,
              COALESCE(p.balance, 0) AS remaining_balance,
              COALESCE(p.payment_method, 'N/A') AS payment_channel,
              COALESCE(p.payment_status, 'Unbilled') AS billing_status
       FROM repair_requests r
       JOIN users u ON r.customer_id = u.user_id
       LEFT JOIN payments p ON r.request_id = p.request_id
       ${reqWhere}
       ORDER BY r.created_at DESC`,
      reqParams
    );

    res.json({
      summary: {
        ...statusCounts[0],
        total_revenue: Number(revenueRows[0].total_revenue),
        pending_balance: Number(revenueRows[0].pending_balance),
        total_customers: Number(customerRows[0].total_customers),
      },
      applianceBreakdown,
      monthlyTrend,
      reportRows,
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ message: 'Server error generating dashboard reports.' });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllPayments,
  recordPayment,
  getAllCustomers,
  getActivityLogs,
  getDashboardReports,
};