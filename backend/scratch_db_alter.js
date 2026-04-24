require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  try {
    const pool = mysql.createPool({
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    await pool.query('ALTER TABLE organizers ADD COLUMN name VARCHAR(100) AFTER id');
    console.log("Column 'name' added successfully");
    
    // Also update the existing admin
    await pool.query('UPDATE organizers SET name = "Admin" WHERE email = "admin@quiz.com"');
    console.log("Admin name updated");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
