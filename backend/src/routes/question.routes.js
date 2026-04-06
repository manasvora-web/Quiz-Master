const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

// IMPORT BOTH upload and compressImage
const { upload, compressImage } = require("../middlewares/uploadQuestionImage");

const {
  addQuestion,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion
} = require("../controllers/question.controller");


/* ================= ADD ================= */
router.post(
  "/add",
  authMiddleware,
  upload.single("question_image"),
  compressImage,                   // ← compress after upload
  addQuestion
);


/* ================= GET BY QUIZ ================= */
router.get(
  "/:quizId",
  authMiddleware,
  getQuestionsByQuiz
);


/* ================= UPDATE ================= */
router.put(
  "/:id",
  authMiddleware,
  upload.single("question_image"),
  compressImage,                   // ← compress after upload
  updateQuestion
);


/* ================= DELETE ================= */
router.delete(
  "/:id",
  authMiddleware,
  deleteQuestion
);


module.exports = router;