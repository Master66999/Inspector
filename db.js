require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
  database: process.env.DB_NAME || 'packcheck',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a pool without database first to ensure DB exists
async function initializeDatabase() {
  try {
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    const pool = mysql.createPool(dbConfig);

    // 1. users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. login_events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL,
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. scans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_scans_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. scan_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scan_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scan_id INT NOT NULL,
        nutrition_data JSON,
        ingredients_data JSON,
        claims_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_scan_id (scan_id),
        FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`[Database] Connected to MySQL and verified schema for "${dbConfig.database}".`);
    return pool;
  } catch (error) {
    console.error('[Database Error] Failed to initialize database:', error.message);
    throw error;
  }
}

// Pool for application queries
const pool = mysql.createPool(dbConfig);

module.exports = {
  pool,
  dbConfig,
  initializeDatabase
};
