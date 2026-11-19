const pool = require('../config/db');

const logActivity = async (userId, action, module, details) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, module, details) VALUES (?, ?, ?, ?)',
      [userId || null, action, module, details]
    );
  } catch (error) {
    console.error('Activity Log Error:', error.message);
  }
};

module.exports = logActivity;