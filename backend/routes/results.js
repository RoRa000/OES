
const express = require("express");
const db = require("../database");

const router = express.Router();

// SUBMIT EXAM AND CALCULATE RESULT
router.post("/", async (req, res) => {
    const { user_id, exam_id, answers } = req.body;

    if (!user_id || !exam_id || !Array.isArray(answers)) {
        return res.status(400).json({
            success: false,
            message: "user_id, exam_id and answers are required."
        });
    }

    const client = await db.connect();

    try {
        const examResult = await client.query(
            "SELECT * FROM exams WHERE id = $1",
            [exam_id]
        );

        if (examResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        const exam = examResult.rows[0];

        const questionResult = await client.query(
            `SELECT * FROM questions
             WHERE exam_id = $1 ORDER BY id ASC`,
            [exam_id]
        );

        const questions = questionResult.rows;

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This exam has no questions."
            });
        }

        let attempted = 0;
        let correct = 0;
        let wrong = 0;
        let marks = 0;
        let totalMarks = 0;

        const resultAnswers = [];

        for (const question of questions) {
            const answerData = answers.find(
                answer =>
                    Number(answer.question_id) === Number(question.id)
            );

            let selectedAnswer = null;

            if (
                answerData &&
                answerData.selected_answer !== null &&
                answerData.selected_answer !== undefined &&
                answerData.selected_answer !== ""
            ) {
                selectedAnswer = Number(answerData.selected_answer);
            }

            const questionMarks = Number(question.marks ?? 1);
            totalMarks += questionMarks;

            let isCorrect = 0;

            if (selectedAnswer !== null) {
                attempted++;

                if (selectedAnswer === Number(question.correct_answer)) {
                    correct++;
                    isCorrect = 1;
                    marks += questionMarks;
                } else {
                    wrong++;
                    marks -= Number(exam.negative_mark ?? 0);
                }
            }

            resultAnswers.push({
                question_id: question.id,
                selected_answer: selectedAnswer,
                is_correct: isCorrect
            });
        }

        if (marks < 0) marks = 0;

        marks = Number(marks.toFixed(2));

        const percentage = totalMarks > 0
            ? Number(((marks / totalMarks) * 100).toFixed(2))
            : 0;

        await client.query("BEGIN");

        const userCheck = await client.query(
            "SELECT id FROM users WHERE id = $1",
            [user_id]
        );

        if (userCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const savedResult = await client.query(
            `INSERT INTO results
             (user_id, exam_id, total_questions, attempted,
              correct, wrong, marks, percentage)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                user_id, exam_id, questions.length,
                attempted, correct, wrong, marks, percentage
            ]
        );

        const resultId = savedResult.rows[0].id;

        for (const answer of resultAnswers) {
            await client.query(
                `INSERT INTO result_answers
                 (result_id, question_id, selected_answer, is_correct)
                 VALUES ($1, $2, $3, $4)`,
                [
                    resultId,
                    answer.question_id,
                    answer.selected_answer,
                    answer.is_correct
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Result submitted successfully.",
            result: {
                id: resultId,
                exam_id: exam_id,
                total_questions: questions.length,
                attempted,
                correct,
                wrong,
                marks,
                percentage
            }
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        console.error("Submit result error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit result."
        });
    } finally {
        client.release();
    }
});

// GET ALL RESULTS
router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*,
                   u.name AS student_name,
                   u.email AS student_email,
                   e.name AS exam_name
            FROM results r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN exams e ON r.exam_id = e.id
            ORDER BY r.id DESC
        `);

        res.json({ success: true, results: result.rows });
    } catch (error) {
        console.error("Get results error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch results."
        });
    }
});

// GET RESULTS FOR ONE STUDENT
router.get("/student/:userId", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT r.*, e.name AS exam_name,
                    e.category AS category
             FROM results r
             LEFT JOIN exams e ON r.exam_id = e.id
             WHERE r.user_id = $1
             ORDER BY r.id DESC`,
            [req.params.userId]
        );

        res.json({ success: true, results: result.rows });
    } catch (error) {
        console.error("Get student results error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch student results."
        });
    }
});

// GET SINGLE RESULT WITH ANSWERS
router.get("/:id", async (req, res) => {
    try {
        const resultQuery = await db.query(
            `SELECT r.*,
                    u.name AS student_name,
                    u.email AS student_email,
                    e.name AS exam_name,
                    e.category AS category
             FROM results r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN exams e ON r.exam_id = e.id
             WHERE r.id = $1`,
            [req.params.id]
        );

        if (resultQuery.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }

        const answerQuery = await db.query(
            `SELECT ra.*,
                    q.question,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    q.correct_answer
             FROM result_answers ra
             LEFT JOIN questions q ON ra.question_id = q.id
             WHERE ra.result_id = $1
             ORDER BY ra.id ASC`,
            [req.params.id]
        );

        res.json({
            success: true,
            result: resultQuery.rows[0],
            answers: answerQuery.rows
        });
    } catch (error) {
        console.error("Get single result error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch result."
        });
    }
});

module.exports = router;