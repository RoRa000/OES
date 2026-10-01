
const express = require("express");
const db = require("../database");

const router = express.Router();

// GET ALL QUESTIONS
router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT q.*, e.name AS exam_name
            FROM questions q
            LEFT JOIN exams e ON q.exam_id = e.id
            ORDER BY q.id DESC
        `);

        res.json({ success: true, questions: result.rows });
    } catch (error) {
        console.error("Get questions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions."
        });
    }
});

// GET QUESTIONS BY EXAM
router.get("/exam/:examId", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM questions
             WHERE exam_id = $1 ORDER BY id ASC`,
            [req.params.examId]
        );

        res.json({ success: true, questions: result.rows });
    } catch (error) {
        console.error("Get exam questions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch exam questions."
        });
    }
});

// GET QUESTIONS BY SUBJECT
router.get("/subject/:subject", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.*, e.name AS exam_name
             FROM questions q
             LEFT JOIN exams e ON q.exam_id = e.id
             WHERE q.subject = $1
             ORDER BY q.id DESC`,
            [req.params.subject]
        );

        res.json({ success: true, questions: result.rows });
    } catch (error) {
        console.error("Get subject questions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subject questions."
        });
    }
});

// GET SINGLE QUESTION
router.get("/:id", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM questions WHERE id = $1",
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        res.json({
            success: true,
            question: result.rows[0]
        });
    } catch (error) {
        console.error("Get question error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch question."
        });
    }
});

// CREATE QUESTION
router.post("/", async (req, res) => {
    try {
        const {
            exam_id, subject, question,
            option_a, option_b, option_c, option_d,
            correct_answer, marks
        } = req.body;

        if (
            !exam_id || !subject || !question ||
            !option_a || !option_b || !option_c || !option_d ||
            correct_answer === undefined || correct_answer === null
        ) {
            return res.status(400).json({
                success: false,
                message: "All question fields are required."
            });
        }

        const exam = await db.query(
            "SELECT id FROM exams WHERE id = $1",
            [exam_id]
        );

        if (exam.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        const result = await db.query(
            `INSERT INTO questions
             (exam_id, subject, question, option_a, option_b,
              option_c, option_d, correct_answer, marks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                exam_id, subject, question,
                option_a, option_b, option_c, option_d,
                correct_answer, marks ?? 1
            ]
        );

        res.status(201).json({
            success: true,
            message: "Question created successfully.",
            question: result.rows[0]
        });
    } catch (error) {
        console.error("Create question error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create question."
        });
    }
});

// UPDATE QUESTION
router.put("/:id", async (req, res) => {
    try {
        const {
            exam_id, subject, question,
            option_a, option_b, option_c, option_d,
            correct_answer, marks
        } = req.body;

        const result = await db.query(
            `UPDATE questions SET
                exam_id = $1,
                subject = $2,
                question = $3,
                option_a = $4,
                option_b = $5,
                option_c = $6,
                option_d = $7,
                correct_answer = $8,
                marks = $9
             WHERE id = $10
             RETURNING id`,
            [
                exam_id, subject, question,
                option_a, option_b, option_c, option_d,
                correct_answer, marks ?? 1, req.params.id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        res.json({
            success: true,
            message: "Question updated successfully."
        });
    } catch (error) {
        console.error("Update question error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update question."
        });
    }
});

// DELETE QUESTION
router.delete("/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM questions WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        res.json({
            success: true,
            message: "Question deleted successfully."
        });
    } catch (error) {
        console.error("Delete question error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete question."
        });
    }
});

module.exports = router;