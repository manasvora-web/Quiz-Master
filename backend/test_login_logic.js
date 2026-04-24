require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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
    const email = 'admin@quiz.com';
    const password = 'password';
    
    const [rows] = await pool.query('SELECT * FROM organizers WHERE email = ?', [email]);
    if (rows.length === 0) { console.log("User not found"); process.exit(0); }
    
    const user = rows[0];
    console.log("User in DB:", user.email);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatch);
    
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
