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
    const [rows] = await pool.query('SHOW COLUMNS FROM organizers');
    console.log("Columns in organizers:", rows);
    const [orgs] = await pool.query('SELECT * FROM organizers');
    console.log("Organizers:", orgs);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
