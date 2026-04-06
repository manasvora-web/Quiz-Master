const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
const questionRoutes = require("./routes/question.routes");
const studentRoutes = require("./routes/student.routes");
const attemptRoutes = require("./routes/attempt.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   STATIC FILES — UPLOADS
   Serves: http://localhost:5000/uploads/questions/filename.jpg
================================ */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

/* ===============================
   ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Secure Quiz API running" });
});

module.exports = app;