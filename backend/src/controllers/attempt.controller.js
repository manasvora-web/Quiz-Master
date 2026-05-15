const pool = require("../config/db");


/* ===============================
   SUBMIT QUIZ ATTEMPT
================================ */
exports.submitAttempt = async (req, res) => {
  let { attempt_id, answers, disqualified } = req.body;

  if (!attempt_id) {
    return res.status(400).json({ message: "Invalid submission data" });
  }

  if (!Array.isArray(answers)) answers = [];

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* 1. GET ATTEMPT & LOCK IT */
    const [attempts] = await conn.query(
      "SELECT quiz_id, status FROM quiz_attempts WHERE id = ? FOR UPDATE",
      [attempt_id]
    );

    if (!attempts.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempts[0].status === "submitted") {
      await conn.rollback();
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    const quizId = attempts[0].quiz_id;

    /* 2. GET QUESTIONS */
    const [questions] = await conn.query(
      "SELECT id, correct_option, marks, negative_on, negative_marks FROM questions WHERE quiz_id = ?",
      [quizId]
    );

    const questionMap = {};
    let maxScore = 0;
    questions.forEach(q => {
      questionMap[q.id] = q;
      maxScore += Number(q.marks) || 1;
    });

    /* 3. CALCULATE SCORE */
    let totalScore = 0;
    answers.forEach(ans => {
      const q = questionMap[ans.question_id];
      if (!q) return;

      if (Number(q.correct_option) === Number(ans.selected_option)) {
        totalScore += Number(q.marks) || 1;
      } else if (q.negative_on && q.negative_marks > 0) {
        totalScore -= Number(q.negative_marks);
      }
    });

    if (totalScore < 0) totalScore = 0;

    /* 4. SAVE ANSWERS (Bulk Insert) */
    await conn.query("DELETE FROM answers WHERE attempt_id = ?", [attempt_id]);
    
    if (answers.length > 0) {
      const answerRows = answers.map(a => [attempt_id, a.question_id, a.selected_option]);
      await conn.query(
        "INSERT INTO answers (attempt_id, question_id, selected_option) VALUES ?",
        [answerRows]
      );
    }

    /* 5. CALCULATE GRADE & STATUS */
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    const result_status = (percentage >= 40 && !disqualified) ? "Pass" : "Fail";

    /* 6. UPDATE ATTEMPT */
    await conn.query(
      `UPDATE quiz_attempts SET 
        status = 'submitted', 
        score = ?, 
        percentage = ?, 
        grade = ?, 
        result_status = ?, 
        disqualified = ?, 
        submitted_at = NOW() 
      WHERE id = ?`,
      [totalScore, percentage, grade, result_status, disqualified ? 1 : 0, attempt_id]
    );

    await conn.commit();

    res.json({
      score: totalScore,
      total: maxScore,
      percentage,
      grade,
      result_status
    });

  } catch (err) {
    await conn.rollback();
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: "Submission failed" });
  } finally {
    conn.release();
  }
};




/* ===============================
   FORCE END
================================ */
exports.forceEndAttempt = async (req, res) => {

  const { attempt_id } = req.body;

  try {

    await pool.query(`
      UPDATE quiz_attempts
      SET 
        status = 'FORCE_ENDED',
        submitted_at = NOW()
      WHERE id = ?
    `, [attempt_id]);

    res.json({
      message: "Quiz force-ended"
    });

  } catch (err) {

    console.error("FORCE END ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   GET RESULTS (PAGINATION)
================================ */
exports.getResults = async (req, res) => {

  try {

    const organizerId = req.user.id;


    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;



    const [[countRow]] = await pool.query(`
      SELECT COUNT(*) as total
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id = ?
    `, [organizerId]);



    const totalResults = countRow.total;
    const totalPages = Math.ceil(totalResults / limit);



    const [rows] = await pool.query(`
      SELECT 
        s.full_name,
        s.email,
        q.title,
        qa.score,
        qa.percentage,
        qa.grade,
        qa.result_status,
        qa.disqualified,
        qa.submitted_at
      FROM quiz_attempts qa
      JOIN students s ON qa.student_id = s.id
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id = ?
      ORDER BY qa.id DESC
      LIMIT ? OFFSET ?
    `, [organizerId, limit, offset]);



    res.json({

      results: rows,

      pagination: {
        page,
        limit,
        totalResults,
        totalPages
      }
    });

  } catch (err) {

    console.error("RESULTS ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};




/* ===============================
   EXPORT CSV
================================ */
exports.exportResults = async (req, res) => {

  try {

    const organizerId = req.user.id;


    const [rows] = await pool.query(`
      SELECT 
        s.full_name,
        s.email,
        q.title,
        qa.score,
        qa.percentage,
        qa.grade,
        qa.result_status,
        qa.disqualified,
        qa.submitted_at
      FROM quiz_attempts qa
      JOIN students s ON qa.student_id = s.id
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id = ?
      ORDER BY qa.submitted_at DESC
    `, [organizerId]);



    let csv =
      "Name,Email,Quiz,Score,Percentage,Grade,Result,Disqualified,Submitted At\n";


    rows.forEach(r => {

      csv += `"${r.full_name}","${r.email}","${r.title}",${r.score},${r.percentage}%,${r.grade},${r.result_status},${r.disqualified ? "Yes" : "No"},"${r.submitted_at || ""}"\n`;

    });



    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=results.csv"
    );

    res.send(csv);

  } catch (err) {

    console.error("EXPORT ERROR:", err);

    res.status(500).json({
      message: "Export failed"
    });
  }
};