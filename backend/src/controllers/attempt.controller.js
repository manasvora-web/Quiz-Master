const pool = require("../config/db");


/* ===============================
   SUBMIT QUIZ ATTEMPT
================================ */
exports.submitAttempt = async (req, res) => {

  let { attempt_id, answers, disqualified } = req.body;

  // Always make answers array
  if (!Array.isArray(answers)) {
    answers = [];
  }

  if (!attempt_id) {
    return res.status(400).json({
      message: "Invalid submission data"
    });
  }

  try {

    /* ================= GET ATTEMPT ================= */

    const [[attemptRow]] = await pool.query(
      "SELECT quiz_id FROM quiz_attempts WHERE id=?",
      [attempt_id]
    );

    if (!attemptRow) {
      return res.status(404).json({
        message: "Attempt not found"
      });
    }

    const quizId = attemptRow.quiz_id;



    /* ================= GET QUESTIONS ================= */

    const [questionRows] = await pool.query(`
      SELECT 
        id,
        correct_option,
        marks,
        negative_on,
        negative_marks
      FROM questions
      WHERE quiz_id=?
    `, [quizId]);


    if (questionRows.length === 0) {
      return res.status(400).json({
        message: "No questions found for this quiz"
      });
    }



    /* ================= MAP QUESTIONS ================= */

    const questionMap = {};

    questionRows.forEach(q => {

      questionMap[q.id] = {
        correct_option: Number(q.correct_option),
        marks: Number(q.marks) || 1,
        negative_on: Number(q.negative_on) === 1,
        negative_marks: Number(q.negative_marks) || 0
      };

    });



    /* ================= CALCULATE SCORE ================= */

    let totalScore = 0;
    let maxScore = 0;


    // Calculate total marks
    for (const q of questionRows) {

      const marks = Number(q.marks) || 1;

      if (marks > 0) {
        maxScore += marks;
      }
    }


    // Fallback
    if (maxScore <= 0) {
      maxScore = questionRows.length;
    }



    // Check answers
    for (const ans of answers) {

      if (!ans.question_id || !ans.selected_option) continue;

      const q = questionMap[Number(ans.question_id)];

      if (!q) continue;


      const selected = Number(ans.selected_option);


      // ✅ Correct
      if (q.correct_option === selected) {

        totalScore += q.marks;

      }

      // ❌ Wrong + Negative
      else if (q.negative_on && q.negative_marks > 0) {

        totalScore -= q.negative_marks;

      }
    }



    /* ================= NO NEGATIVE TOTAL ================= */

    if (totalScore < 0) totalScore = 0;



    /* ================= SAVE ANSWERS ================= */

    await pool.query(
      "DELETE FROM answers WHERE attempt_id=?",
      [attempt_id]
    );


    for (const ans of answers) {

      if (!ans.question_id || !ans.selected_option) continue;

      await pool.query(`
        INSERT INTO answers 
        (attempt_id, question_id, selected_option)
        VALUES (?, ?, ?)
      `, [
        attempt_id,
        Number(ans.question_id),
        Number(ans.selected_option)
      ]);
    }



    /* ================= CALCULATE PERCENTAGE ================= */

    const percentage =
      maxScore > 0
        ? Math.round((totalScore / maxScore) * 100)
        : 0;



    /* ================= GRADE ================= */

    let grade = "F";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";


    const result_status =
      percentage >= 40 ? "Pass" : "Fail";

    const isDisqualified = disqualified ? 1 : 0;


    /* ================= UPDATE ATTEMPT ================= */

    await pool.query(`
      UPDATE quiz_attempts
      SET 
        status='submitted',
        score=?,
        percentage=?,
        grade=?,
        result_status=?,
        disqualified=?,
        submitted_at=NOW()
      WHERE id=?
    `, [
      totalScore,
      percentage,
      grade,
      result_status,
      isDisqualified,
      attempt_id
    ]);



    /* ================= RESPONSE ================= */

    res.json({

      score: totalScore,
      total: maxScore,

      percentage,
      grade,
      result_status
    });

  } catch (err) {

    console.error("SUBMIT ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
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