const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
  organizerLogin,
  getProfile,
  updateProfile
} = require("../controllers/auth.controller");


/* ===============================
   LOGIN
================================ */
router.post("/organizer/login", organizerLogin);


/* ===============================
   PROFILE (PROTECTED)
================================ */

// Get profile
router.get("/profile", auth, getProfile);

// Update profile
router.put("/profile", auth, updateProfile);


module.exports = router;
