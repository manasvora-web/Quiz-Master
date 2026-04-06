const db = require("../config/db");


/* ================= HELPERS ================= */

const safeNumber = (val, def = 0) => {
  const n = Number(val);
  return isNaN(n) ? def : n;
};

const safeBoolean = (val) => {
  return val === true || val === "true" || val === 1 || val === "1";
};


/* ================= PARSE OPTIONS FROM FORMDATA ================= */
/*
  Frontend sends FormData with option1, option2 ... option6
  OR sends JSON array as options[]
  This helper handles BOTH cases safely
*/
const parseOptions = (body) => {

  // CASE 1: came as JSON array
  if (Array.isArray(body.options)) {
    return body.options;
  }

  // CASE 2: came as FormData individual fields option1...option6
  const opts = [];

  for (let i = 1; i <= 6; i++) {
    if (body[`option${i}`] !== undefined) {
      opts.push(body[`option${i}`]);
    }
  }

  if (opts.length >= 2) return opts;

  // CASE 3: came as options[0], options[1] etc (some axios FormData formats)
  const indexed = [];

  for (let i = 0; i <= 5; i++) {
    if (body[`options[${i}]`] !== undefined) {
      indexed.push(body[`options[${i}]`]);
    }
  }

  return indexed;
};



/* ================= ADD QUESTION ================= */
exports.addQuestion = async (req, res) => {

  try {

    const {
      quiz_id,
      question_text,
      correct_option,
      marks,
      negative_on,
      negative_marks
    } = req.body;

    // IMAGE PATH (IF UPLOADED)
    const imagePath = req.file
      ? `/uploads/questions/${req.file.filename}`
      : null;

    // PARSE OPTIONS (works for both JSON and FormData)
    const options = parseOptions(req.body);


    /* ================= VALIDATION ================= */

    if (!quiz_id || !question_text?.trim()) {
      return res.status(400).json({
        message: "Quiz and question required"
      });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({
        message: "Minimum 2 options required"
      });
    }

    if (!correct_option) {
      return res.status(400).json({
        message: "Correct answer required"
      });
    }


    /* ================= PREPARE OPTIONS ================= */

    const opts = [];

    for (let i = 0; i < 6; i++) {
      opts[i] = options[i]?.trim() || null;
    }


    /* ================= SAFE VALUES ================= */

    const finalMarks = safeNumber(marks, 1);

    const finalNegativeOn = safeBoolean(negative_on) ? 1 : 0;

    const finalNegativeMarks = finalNegativeOn
      ? safeNumber(negative_marks, 0)
      : 0;


    /* ================= INSERT ================= */

    const sql = `
      INSERT INTO questions
      (
        quiz_id,
        question_text,
        question_image,

        option1,
        option2,
        option3,
        option4,
        option5,
        option6,

        correct_option,

        marks,
        negative_on,
        negative_marks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [

      Number(quiz_id),
      question_text.trim(),
      imagePath,

      opts[0],
      opts[1],
      opts[2],
      opts[3],
      opts[4],
      opts[5],

      Number(correct_option),

      finalMarks,
      finalNegativeOn,
      finalNegativeMarks
    ];


    await db.query(sql, values);


    res.json({
      message: "Question added successfully ✅"
    });

  } catch (err) {

    console.error("ADD QUESTION ERROR:", err);

    res.status(500).json({
      message: "Database error"
    });
  }
};



/* ================= GET QUESTIONS ================= */
exports.getQuestionsByQuiz = async (req, res) => {

  try {

    const { quizId } = req.params;


    const sql = `
      SELECT
        id,
        question_text,
        question_image,

        option1,
        option2,
        option3,
        option4,
        option5,
        option6,

        correct_option,

        marks,
        negative_on,
        negative_marks

      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
    `;


    const [rows] = await db.query(sql, [quizId]);


    res.json(rows);

  } catch (err) {

    console.error("GET QUESTIONS ERROR:", err);

    res.status(500).json({
      message: "Database error"
    });
  }
};



/* ================= UPDATE QUESTION ================= */
exports.updateQuestion = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      question_text,
      correct_option,
      marks,
      negative_on,
      negative_marks
    } = req.body;

    // NEW IMAGE (IF UPLOADED)
    const imagePath = req.file
      ? `/uploads/questions/${req.file.filename}`
      : null;

    // PARSE OPTIONS (works for both JSON and FormData)
    const options = parseOptions(req.body);


    /* ================= VALIDATION ================= */

    if (!question_text?.trim()) {
      return res.status(400).json({
        message: "Question required"
      });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({
        message: "Minimum 2 options required"
      });
    }

    if (!correct_option) {
      return res.status(400).json({
        message: "Correct answer required"
      });
    }


    /* ================= PREPARE OPTIONS ================= */

    const opts = [];

    for (let i = 0; i < 6; i++) {
      opts[i] = options[i]?.trim() || null;
    }


    /* ================= SAFE VALUES ================= */

    const finalMarks = safeNumber(marks, 1);

    const finalNegativeOn = safeBoolean(negative_on) ? 1 : 0;

    const finalNegativeMarks = finalNegativeOn
      ? safeNumber(negative_marks, 0)
      : 0;


    /* ================= UPDATE ================= */

    let sql = `
      UPDATE questions
      SET
        question_text = ?,
        option1 = ?,
        option2 = ?,
        option3 = ?,
        option4 = ?,
        option5 = ?,
        option6 = ?,
        correct_option = ?,
        marks = ?,
        negative_on = ?,
        negative_marks = ?
    `;

    const values = [

      question_text.trim(),

      opts[0],
      opts[1],
      opts[2],
      opts[3],
      opts[4],
      opts[5],

      Number(correct_option),

      finalMarks,
      finalNegativeOn,
      finalNegativeMarks
    ];


    // UPDATE IMAGE ONLY IF NEW ONE UPLOADED
    if (imagePath) {
      sql += `, question_image = ?`;
      values.push(imagePath);
    }


    sql += ` WHERE id = ?`;
    values.push(id);


    await db.query(sql, values);


    res.json({
      message: "Question updated ✅"
    });

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Database error"
    });
  }
};



/* ================= DELETE QUESTION ================= */
exports.deleteQuestion = async (req, res) => {

  try {

    const { id } = req.params;


    await db.query(
      "DELETE FROM questions WHERE id = ?",
      [id]
    );


    res.json({
      message: "Question deleted ✅"
    });

  } catch (err) {

    console.error("DELETE ERROR:", err);

    res.status(500).json({
      message: "Database error"
    });
  }
};