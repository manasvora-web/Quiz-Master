const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
  submitAttempt,
  forceEndAttempt,
  getResults,
  exportResults
} = require("../controllers/attempt.controller");


/* ===============================
   STUDENT (LOGIN REQUIRED)
================================ */

// ✅ Submit quiz (protected)
router.post("/submit", auth, submitAttempt);

// ✅ Force end (protected)
router.post("/force-end", auth, forceEndAttempt);



/* ===============================
   ORGANIZER (LOGIN REQUIRED)
================================ */

// Get results
router.get("/results", auth, getResults);

// Export CSV
router.get("/export", auth, exportResults);


module.exports = router;