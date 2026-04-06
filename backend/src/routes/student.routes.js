const express = require("express");
const router = express.Router();
const { joinQuiz } = require("../controllers/student.controller");

router.post("/join", joinQuiz);

module.exports = router;
