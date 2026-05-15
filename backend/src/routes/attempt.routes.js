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
   STUDENT (PUBLIC)
================================ */

// ✅ Submit quiz
router.post("/submit", submitAttempt);

// ✅ Force end
router.post("/force-end", forceEndAttempt);



/* ===============================
   ORGANIZER (LOGIN REQUIRED)
================================ */

// Get results
router.get("/results", auth, getResults);

// Export CSV
router.get("/export", auth, exportResults);


module.exports = router;