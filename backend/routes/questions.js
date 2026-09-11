const express = require("express");
const db = require("../database");

const router = express.Router();

// ==========================================
// GET ALL QUESTIONS
// ==========================================
router.get("/", (req, res) => {

    const sql = `
        SELECT
            q.*,
            e.name AS exam_name
        FROM questions q
        LEFT JOIN exams e ON q.exam_id = e.id
        ORDER BY q.id DESC
    `;

    db.all(sql, [], (err, questions) => {

        if (err) {
            console.error("Get questions error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch questions."
            });
        }

        res.json({
            success: true,
            questions: questions
        });
    });
});


// ==========================================
// GET QUESTIONS BY EXAM
// ==========================================
router.get("/exam/:examId", (req, res) => {

    const examId = req.params.examId;

    db.all(
        `
        SELECT *
        FROM questions
        WHERE exam_id = ?
        ORDER BY id ASC
        `,
        [examId],
        (err, questions) => {

            if (err) {
                console.error("Get exam questions error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch exam questions."
                });
            }

            res.json({
                success: true,
                questions: questions
            });
        }
    );
});


// ==========================================
// GET QUESTIONS BY SUBJECT
// ==========================================
router.get("/subject/:subject", (req, res) => {

    const subject = req.params.subject;

    db.all(
        `
        SELECT
            q.*,
            e.name AS exam_name
        FROM questions q
        LEFT JOIN exams e ON q.exam_id = e.id
        WHERE q.subject = ?
        ORDER BY q.id DESC
        `,
        [subject],
        (err, questions) => {

            if (err) {
                console.error("Get subject questions error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch subject questions."
                });
            }

            res.json({
                success: true,
                questions: questions
            });
        }
    );
});


// ==========================================
// GET SINGLE QUESTION
// ==========================================
router.get("/:id", (req, res) => {

    const questionId = req.params.id;

    db.get(
        "SELECT * FROM questions WHERE id = ?",
        [questionId],
        (err, question) => {

            if (err) {
                console.error("Get question error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch question."
                });
            }

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found."
                });
            }

            res.json({
                success: true,
                question: question
            });
        }
    );
});


// ==========================================
// CREATE QUESTION
// ==========================================
router.post("/", (req, res) => {

    const {
        exam_id,
        subject,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks
    } = req.body;

    // Required fields
    if (
        !exam_id ||
        !subject ||
        !question ||
        !option_a ||
        !option_b ||
        !option_c ||
        !option_d ||
        correct_answer === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "All question fields are required."
        });
    }

    // Check whether exam exists
    db.get(
        "SELECT id FROM exams WHERE id = ?",
        [exam_id],
        (examError, exam) => {

            if (examError) {
                console.error("Exam check error:", examError);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found."
                });
            }

            // Insert question
            db.run(
                `
                INSERT INTO questions
                (
                    exam_id,
                    subject,
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    marks
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    exam_id,
                    subject,
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    marks || 1
                ],
                function (insertError) {

                    if (insertError) {
                        console.error(
                            "Create question error:",
                            insertError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to create question."
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Question created successfully.",
                        question: {
                            id: this.lastID,
                            exam_id: exam_id,
                            subject: subject,
                            question: question,
                            option_a: option_a,
                            option_b: option_b,
                            option_c: option_c,
                            option_d: option_d,
                            correct_answer: correct_answer,
                            marks: marks || 1
                        }
                    });
                }
            );
        }
    );
});


// ==========================================
// UPDATE QUESTION
// ==========================================
router.put("/:id", (req, res) => {

    const questionId = req.params.id;

    const {
        exam_id,
        subject,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks
    } = req.body;

    db.run(
        `
        UPDATE questions
        SET
            exam_id = ?,
            subject = ?,
            question = ?,
            option_a = ?,
            option_b = ?,
            option_c = ?,
            option_d = ?,
            correct_answer = ?,
            marks = ?
        WHERE id = ?
        `,
        [
            exam_id,
            subject,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            marks || 1,
            questionId
        ],
        function (err) {

            if (err) {
                console.error("Update question error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update question."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found."
                });
            }

            res.json({
                success: true,
                message: "Question updated successfully."
            });
        }
    );
});


// ==========================================
// DELETE QUESTION
// ==========================================
router.delete("/:id", (req, res) => {

    const questionId = req.params.id;

    db.run(
        "DELETE FROM questions WHERE id = ?",
        [questionId],
        function (err) {

            if (err) {
                console.error("Delete question error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete question."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found."
                });
            }

            res.json({
                success: true,
                message: "Question deleted successfully."
            });
        }
    );
});


module.exports = router;