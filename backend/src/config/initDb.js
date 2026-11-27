// backend/src/config/initDb.js
const pool = require('./db');

const ensureColumn = async (table, column, definition) => {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const initPhase2Schema = async () => {
  try {
    await ensureColumn('repair_requests', 'after_photo', 'VARCHAR(255) NULL');
    await ensureColumn('repair_requests', 'customer_signature', 'LONGTEXT NULL');
    await ensureColumn('repair_requests', 'completed_at', 'DATETIME NULL');
    await ensureColumn('repair_requests', 'warranty_expires_at', 'DATETIME NULL');
    await ensureColumn('repair_requests', 'warranty_claim_of', 'INT NULL');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_appliances (
        appliance_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        appliance_type VARCHAR(100) NOT NULL,
        brand_model VARCHAR(150) NULL,
        serial_number VARCHAR(100) NULL,
        purchase_year VARCHAR(10) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Phase 2 schema verified');
  } catch (err) {
    console.error('⚠️ Phase 2 schema check skipped:', err.message);
  }
};

module.exports = { initPhase2Schema };
