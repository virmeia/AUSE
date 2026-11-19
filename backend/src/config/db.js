const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ause_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database (ause_db)');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
})();

module.exports = pool;