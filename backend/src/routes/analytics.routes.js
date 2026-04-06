const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
  getAnalytics,
  getQuizGraph,
  getStudentGraph
} = require("../controllers/analytics.controller");


/* ===============================
   SUMMARY CARDS
================================ */
router.get("/", auth, getAnalytics);


/* ===============================
   GRAPH 1 — QUIZ ACTIVITY
   ?range=daily | monthly | yearly
================================ */
router.get("/quiz-graph", auth, getQuizGraph);


/* ===============================
   GRAPH 2 — STUDENT DETAIL
================================ */
router.get("/student-graph", auth, getStudentGraph);


module.exports = router;