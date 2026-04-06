const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
  createQuiz,
  getQuizById,
  getQuizQuestions,
  getMyQuizzes,
  deleteQuiz
} = require("../controllers/quiz.controller");


/* ===============================
   BASIC RATE LIMIT (ANTI SPAM)
================================ */
let createLimit = {};

const rateLimitCreate = (req, res, next) => {

  const userId = req.user.id;
  const now = Date.now();

  // Reset every 1 minute
  if (!createLimit[userId]) {
    createLimit[userId] = [];
  }

  // Keep only last 60 sec
  createLimit[userId] = createLimit[userId].filter(
    t => now - t < 60000
  );

  // Max 5 quizzes per minute
  if (createLimit[userId].length >= 5) {
    return res.status(429).json({
      message: "Too many quiz creations. Try later."
    });
  }

  createLimit[userId].push(now);

  next();
};



/* ===============================
   ASYNC ERROR HANDLER
================================ */
const asyncWrap = (fn) => {

  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};



/* ===============================
   ORGANIZER ROUTES
================================ */

// Create quiz (Protected + Rate limit)
router.post(
  "/create",
  auth,
  rateLimitCreate,
  asyncWrap(createQuiz)
);


// Get my quizzes
router.get(
  "/my-quizzes",
  auth,
  asyncWrap(getMyQuizzes)
);


// Get quiz details
router.get(
  "/details/:id",
  auth,
  asyncWrap(getQuizById)
);


// Delete quiz
router.delete(
  "/:id",
  auth,
  asyncWrap(deleteQuiz)
);



/* ===============================
   STUDENT ROUTES
================================ */

// Get questions (attempt based)
router.get(
  "/questions/:attemptId",
  asyncWrap(getQuizQuestions)
);



module.exports = router;