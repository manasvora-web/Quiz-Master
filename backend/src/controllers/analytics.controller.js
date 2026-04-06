const pool = require("../config/db");


/* ===============================
   SUMMARY CARDS
================================ */
exports.getAnalytics = async (req, res) => {

  try {

    const organizerId = req.user.id;

    const [[quizData]] = await pool.query(
      "SELECT COUNT(*) AS total FROM quizzes WHERE organizer_id=?",
      [organizerId]
    );

    const [[studentData]] = await pool.query(`
      SELECT COUNT(DISTINCT qa.student_id) AS total
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id=?
    `, [organizerId]);

    const [[attemptData]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id=?
    `, [organizerId]);

    const [[avgData]] = await pool.query(`
      SELECT AVG(qa.score) AS avgScore
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id=?
    `, [organizerId]);

    const [[passData]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id=? AND qa.result_status='Pass'
    `, [organizerId]);

    const [[failData]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id=? AND qa.result_status='Fail'
    `, [organizerId]);

    res.json({
      totalQuizzes:  quizData.total,
      totalStudents: studentData.total,
      totalAttempts: attemptData.total,
      averageScore:  Number(avgData.avgScore || 0).toFixed(2),
      totalPass:     passData.total,
      totalFail:     failData.total
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};


/* ===============================
   GRAPH 1 — QUIZ ACTIVITY
   daily / monthly / yearly
================================ */
exports.getQuizGraph = async (req, res) => {

  try {

    const organizerId = req.user.id;
    const { range = "monthly" } = req.query;

    let groupFormat = "";
    let labelFormat = "";

    if (range === "daily") {
      groupFormat = "%Y-%m-%d";
      labelFormat = "%d %b %Y";
    } else if (range === "yearly") {
      groupFormat = "%Y";
      labelFormat = "%Y";
    } else {
      groupFormat = "%Y-%m";
      labelFormat = "%b %Y";
    }

    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(qa.submitted_at, ?) AS label,
        COUNT(*)                                                        AS total_attempts,
        SUM(CASE WHEN qa.result_status = 'Pass' THEN 1 ELSE 0 END)     AS pass_count,
        SUM(CASE WHEN qa.result_status = 'Fail' THEN 1 ELSE 0 END)     AS fail_count,
        COUNT(DISTINCT qa.quiz_id)                                      AS quizzes_active,
        COUNT(DISTINCT qa.student_id)                                   AS students_active
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.organizer_id = ?
        AND qa.submitted_at IS NOT NULL
      GROUP BY DATE_FORMAT(qa.submitted_at, ?)
      ORDER BY DATE_FORMAT(qa.submitted_at, ?) ASC
      LIMIT 30
    `, [labelFormat, organizerId, groupFormat, groupFormat]);

    res.json({ range, data: rows });

  } catch (err) {
    console.error("QUIZ GRAPH ERROR:", err);
    res.status(500).json({ message: "Graph error" });
  }
};


/* ===============================
   GRAPH 2 — STUDENT LIST
   Paginated: 10 students per page
   GET /analytics/student-graph?page=1&limit=10&search=
================================ */
exports.getStudentGraph = async (req, res) => {

  try {

    const organizerId = req.user.id;
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 10;
    const search = req.query.search?.trim()   || "";
    const offset = (page - 1) * limit;

    /* ── COUNT total matching students ── */
    let countSql = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM students s
      JOIN quiz_attempts qa ON qa.student_id = s.id
      JOIN quizzes q        ON qa.quiz_id    = q.id
      WHERE q.organizer_id = ?
    `;
    const countParams = [organizerId];

    if (search) {
      countSql += ` AND (s.full_name LIKE ? OR s.email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [[countRow]] = await pool.query(countSql, countParams);
    const totalStudents = countRow.total;
    const totalPages    = Math.ceil(totalStudents / limit) || 1;


    /* ── GET paginated student IDs ── */
    let idSql = `
      SELECT DISTINCT s.id, s.full_name, s.email
      FROM students s
      JOIN quiz_attempts qa ON qa.student_id = s.id
      JOIN quizzes q        ON qa.quiz_id    = q.id
      WHERE q.organizer_id = ?
    `;
    const idParams = [organizerId];

    if (search) {
      idSql += ` AND (s.full_name LIKE ? OR s.email LIKE ?)`;
      idParams.push(`%${search}%`, `%${search}%`);
    }

    idSql += ` ORDER BY s.full_name ASC LIMIT ? OFFSET ?`;
    idParams.push(limit, offset);

    const [studentRows] = await pool.query(idSql, idParams);

    if (studentRows.length === 0) {
      return res.json({
        students: [],
        pagination: { page, limit, totalStudents, totalPages }
      });
    }

    /* ── GET all attempts for these students in ONE query ── */
    const studentIds = studentRows.map(s => s.id);

    const placeholders = studentIds.map(() => "?").join(",");

    const [attemptRows] = await pool.query(`
      SELECT
        s.id            AS student_id,
        q.title         AS quiz_title,
        qa.score,
        qa.percentage,
        qa.grade,
        qa.result_status,
        qa.disqualified,
        qa.submitted_at,
        CASE
          WHEN qa.disqualified = 1             THEN 'Disqualified (Cheating)'
          WHEN qa.result_status = 'Fail'
           AND qa.percentage < 40              THEN 'Score below passing (40%)'
          WHEN qa.result_status = 'Fail'       THEN 'Did not meet passing criteria'
          ELSE NULL
        END AS fail_reason
      FROM quiz_attempts qa
      JOIN students s ON qa.student_id = s.id
      JOIN quizzes  q ON qa.quiz_id    = q.id
      WHERE qa.student_id IN (${placeholders})
        AND q.organizer_id = ?
      ORDER BY qa.submitted_at DESC
    `, [...studentIds, organizerId]);


    /* ── Group attempts by student ── */
    const attemptMap = {};

    for (const row of attemptRows) {
      const sid = row.student_id;
      if (!attemptMap[sid]) attemptMap[sid] = [];
      attemptMap[sid].push({
        quiz_title:    row.quiz_title,
        score:         row.score,
        percentage:    row.percentage,
        grade:         row.grade,
        result_status: row.result_status,
        disqualified:  row.disqualified,
        submitted_at:  row.submitted_at,
        fail_reason:   row.fail_reason
      });
    }


    /* ── Build final student objects ── */
    const students = studentRows.map(s => {
      const attempts     = attemptMap[s.id] || [];
      const passCount    = attempts.filter(a => a.result_status === "Pass").length;
      const failCount    = attempts.filter(a => a.result_status === "Fail").length;
      const totalPercent = attempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0);
      const avgPercent   = attempts.length > 0
        ? Math.round(totalPercent / attempts.length)
        : 0;

      return {
        student_id:    s.id,
        full_name:     s.full_name,
        email:         s.email,
        totalAttempts: attempts.length,
        passCount,
        failCount,
        avgPercent,
        attempts
      };
    });


    res.json({
      students,
      pagination: {
        page,
        limit,
        totalStudents,
        totalPages
      }
    });

  } catch (err) {
    console.error("STUDENT GRAPH ERROR:", err);
    res.status(500).json({ message: "Student graph error" });
  }
};