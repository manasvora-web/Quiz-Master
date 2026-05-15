const pool = require("../config/db");
const generateQuizCode = require("../utils/generateCode");


/* ===============================
   CREATE QUIZ
================================ */
const createQuiz = async (req, res) => {

  const {
    title,
    description,
    time_limit,
    show_result,
    custom_code
  } = req.body;


  /* BASIC VALIDATION */
  if (!title || !time_limit) {
    return res.status(400).json({
      message: "Title and time are required"
    });
  }


  try {

    const organizerId = req.user.id;

    let quizCode = "";
    let exists = true;


    /* ===============================
       CUSTOM CODE (IF PROVIDED)
    ================================ */

    if (custom_code && custom_code.trim() !== "") {

      quizCode = custom_code
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""); // remove spaces


      /* FORMAT VALIDATION */
      if (!/^[A-Z0-9_-]{4,20}$/.test(quizCode)) {
        return res.status(400).json({
          message:
            "Code must be 4-20 characters (A-Z, 0-9, _ , -)"
        });
      }


      /* CHECK DUPLICATE */
      const [check] = await pool.query(
        "SELECT id FROM quizzes WHERE quiz_code = ? LIMIT 1",
        [quizCode]
      );

      if (check.length > 0) {
        return res.status(400).json({
          message: "Code already exists. Try another."
        });
      }

      exists = false;
    }


    /* ===============================
       AUTO GENERATE CODE
    ================================ */

    let tries = 0;

    while (exists) {

      if (tries > 10) {
        return res.status(500).json({
          message: "Failed to generate unique code"
        });
      }

      quizCode = generateQuizCode();

      const [check] = await pool.query(
        "SELECT id FROM quizzes WHERE quiz_code = ? LIMIT 1",
        [quizCode]
      );

      exists = check.length > 0;

      tries++;
    }



    /* ===============================
       INSERT QUIZ
    ================================ */

    const [result] = await pool.query(
      `
      INSERT INTO quizzes
      (
        organizer_id,
        title,
        description,
        time_limit,
        quiz_code,
        show_result
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        organizerId,
        title.trim(),
        description?.trim() || "",
        Number(time_limit),
        quizCode,
        show_result ? 1 : 0
      ]
    );



    /* ===============================
       RESPONSE
    ================================ */

    res.status(201).json({

      message: "Quiz created successfully",

      quiz: {
        id: result.insertId,
        title,
        quiz_code: quizCode,
        show_result
      }
    });

  } catch (err) {

    console.error("CREATE QUIZ ERROR:", err);

    /* DUPLICATE KEY SAFETY */
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Quiz code already exists. Try again."
      });
    }


    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   GET QUIZ DETAILS
================================ */
const getQuizById = async (req, res) => {

  const { id } = req.params;

  try {

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        quiz_code,
        show_result
      FROM quizzes
      WHERE id = ?
      `,
      [id]
    );


    if (!rows.length) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }


    res.json(rows[0]);

  } catch (err) {

    console.error("GET QUIZ ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   GET QUIZ QUESTIONS + TIME
================================ */
const getQuizQuestions = async (req, res) => {

  const { attemptId } = req.params;

  try {

    /* GET ATTEMPT */
    const [attemptRows] = await pool.query(
      "SELECT quiz_id FROM quiz_attempts WHERE id = ?",
      [attemptId]
    );

    if (!attemptRows.length) {
      return res.status(404).json({
        message: "Invalid attempt"
      });
    }

    const quizId = attemptRows[0].quiz_id;



    /* GET QUIZ */
    const [quizRows] = await pool.query(
      `
      SELECT
        time_limit,
        show_result
      FROM quizzes
      WHERE id = ?
      `,
      [quizId]
    );


    if (!quizRows.length) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }


    const durationSeconds =
      Number(quizRows[0].time_limit) * 60;



    /* GET QUESTIONS — question_image INCLUDED */
    const [questions] = await pool.query(
      `
      SELECT
        id,
        question_text,
        question_image,
        option1,
        option2,
        option3,
        option4,
        option5,
        option6
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quizId]
    );


    if (!questions.length) {
      return res.status(404).json({
        message: "No questions found"
      });
    }



    res.json({

      questions,

      duration: durationSeconds,

      show_result: quizRows[0].show_result === 1
    });

  } catch (err) {

    console.error("GET QUESTIONS ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   GET ORGANIZER QUIZZES
================================ */
const getMyQuizzes = async (req, res) => {

  try {

    const organizerId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        quiz_code,
        time_limit,
        show_result
      FROM quizzes
      WHERE organizer_id = ?
      `,
      [organizerId]
    );

    res.json(rows);

  } catch (err) {

    console.error("GET MY QUIZZES ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   DELETE QUIZ
================================ */
const deleteQuiz = async (req, res) => {

  const { id } = req.params;

  try {

    const organizerId = req.user.id;

    /* 1. DELETE ASSOCIATED ATTEMPTS */
    await pool.query(
      "DELETE FROM quiz_attempts WHERE quiz_id = ?",
      [id]
    );

    /* 2. DELETE ASSOCIATED QUESTIONS */
    await pool.query(
      "DELETE FROM questions WHERE quiz_id = ?",
      [id]
    );

    /* 3. DELETE THE QUIZ */
    const [result] = await pool.query(
      "DELETE FROM quizzes WHERE id=? AND organizer_id=?",
      [id, organizerId]
    );


    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }


    res.json({
      message: "Quiz deleted successfully"
    });

  } catch (err) {

    console.error("DELETE QUIZ ERROR:", err);

    res.status(500).json({
      message: "Delete failed"
    });
  }
};



/* ===============================
   EXPORT
================================ */
module.exports = {
  createQuiz,
  getQuizById,
  getQuizQuestions,
  getMyQuizzes,
  deleteQuiz
};