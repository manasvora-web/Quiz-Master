const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ===============================
   ORGANIZER LOGIN
================================ */
exports.organizerLogin = async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {

    // Find organizer
    const [rows] = await db.query(
      "SELECT * FROM organizers WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const organizer = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, organizer.password);

    if (!isMatch) {
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

    res.json({ token });

  } catch (err) {

    console.error("Login error:", err);

    res.status(500).json({ message: "Login failed" });
  }
};



/* ===============================
   GET PROFILE (NEW ✅)
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
   UPDATE PROFILE (NEW ✅)
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
