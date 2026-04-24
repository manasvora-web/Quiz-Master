const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ===============================
   ORGANIZER LOGIN
================================ */
exports.organizerLogin = async (req, res) => {

  const { email, password } = req.body;

  console.log("LOGIN ATTEMPT:", email);

  if (!email || !password) {
    console.log("LOGIN FAILED: Missing email or password");
    return res.status(400).json({ message: "Email and password required" });
  }

  try {

    console.log("DB: Looking up organizer...");

    // Find organizer (case-insensitive lookup)
    const [rows] = await db.query(
      "SELECT * FROM organizers WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [email.trim()]
    );

    console.log("DB: Found rows:", rows.length);

    if (rows.length === 0) {
      console.log("LOGIN FAILED: No organizer found with email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const organizer = rows[0];

    console.log("DB: Comparing password...");

    // Compare password
    const isMatch = await bcrypt.compare(password, organizer.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      console.log("LOGIN FAILED: Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: organizer.id,
        role: "organizer"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("LOGIN SUCCESS:", email);

    res.json({ token });

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    res.status(500).json({ message: "Login failed" });
  }
};



/* ===============================
   GET PROFILE
================================ */
exports.getProfile = async (req, res) => {

  try {

    const [rows] = await db.query(
      "SELECT id, name, email FROM organizers WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("GET PROFILE ERROR:", err);

    res.status(500).json({ message: "Server error" });
  }
};



/* ===============================
   UPDATE PROFILE
================================ */
exports.updateProfile = async (req, res) => {

  const { name, email, password } = req.body;

  try {

    let query = "UPDATE organizers SET name=?, email=?";
    let values = [name, email];

    // If password change requested
    if (password && password.length >= 6) {

      const hash = await bcrypt.hash(password, 10);

      query += ", password=?";
      values.push(hash);
    }

    query += " WHERE id=?";
    values.push(req.user.id);

    await db.query(query, values);

    res.json({ message: "Profile updated successfully" });

  } catch (err) {

    console.error("UPDATE PROFILE ERROR:", err);

    res.status(500).json({ message: "Update failed" });
  }
};