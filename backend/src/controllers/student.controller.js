const pool = require("../config/db");

exports.joinQuiz = async (req, res) => {

  const {
    quiz_code,
    full_name,
    mobile,
    email,
    address,
    roll_number,
    class_section
  } = req.body;


  if (!quiz_code || !full_name || !mobile || !email) {
    return res.status(400).json({
      message: "Required fields missing"
    });
  }



  try {

    /* ================= GET QUIZ ================= */

    const [quizRows] = await pool.query(
      "SELECT id, title, time_limit FROM quizzes WHERE quiz_code = ?",
      [quiz_code]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({
        message: "Invalid quiz code"
      });
    }

    const quiz = quizRows[0];



    /* ================= GET / CREATE STUDENT ================= */

    const [students] = await pool.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    let studentId;


    if (students.length > 0) {

      studentId = students[0].id;

    } else {

      const [studentResult] = await pool.query(
        `
        INSERT INTO students
        (full_name, mobile, email, address, roll_number, class_section)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          full_name,
          mobile,
          email,
          address || null,
          roll_number || null,
          class_section || null
        ]
      );

      studentId = studentResult.insertId;
    }



    /* ================= CHECK LAST ATTEMPT ================= */

    const [attempts] = await pool.query(
      `
      SELECT id, status
      FROM quiz_attempts
      WHERE quiz_id = ? AND student_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [quiz.id, studentId]
    );



    if (attempts.length > 0) {

      const last = attempts[0];


      /* ❌ Block only if already submitted */
      if (last.status === "SUBMITTED") {

        return res.status(403).json({
          message: "You have already completed this quiz"
        });
      }


      /* ♻️ Reuse failed attempt */
      if (
        last.status === "FORCE_ENDED" ||
        last.status === "IN_PROGRESS"
      ) {

        await pool.query(
          `
          UPDATE quiz_attempts
          SET status = 'IN_PROGRESS'
          WHERE id = ?
          `,
          [last.id]
        );


        return res.json({

          attempt_id: last.id,

          quiz: {
            id: quiz.id,
            title: quiz.title,
            time_limit: quiz.time_limit
          }
        });
      }
    }



    /* ================= CREATE NEW ================= */

    const [attemptResult] = await pool.query(
      `
      INSERT INTO quiz_attempts
      (quiz_id, student_id, status)
      VALUES (?, ?, 'IN_PROGRESS')
      `,
      [quiz.id, studentId]
    );



    res.status(201).json({

      attempt_id: attemptResult.insertId,

      quiz: {
        id: quiz.id,
        title: quiz.title,
        time_limit: quiz.time_limit
      }
    });


  } catch (err) {

    console.error("JOIN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};