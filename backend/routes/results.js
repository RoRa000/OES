const express = require("express");
const db = require("../database");

const router = express.Router();

// ==========================================
// SUBMIT EXAM & CALCULATE RESULT
// ==========================================
router.post("/", (req, res) => {

    const {
        user_id,
        exam_id,
        answers
    } = req.body;

    // Check required data
    if (!user_id || !exam_id || !Array.isArray(answers)) {
        return res.status(400).json({
            success: false,
            message: "user_id, exam_id and answers are required."
        });
    }

    // Get exam details
    db.get(
        "SELECT * FROM exams WHERE id = ?",
        [exam_id],
        (examError, exam) => {

            if (examError) {
                console.error("Exam fetch error:", examError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch exam."
                });
            }

            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found."
                });
            }

            // Get all questions of this exam
            db.all(
                `
                SELECT *
                FROM questions
                WHERE exam_id = ?
                ORDER BY id ASC
                `,
                [exam_id],
                (questionError, questions) => {

                    if (questionError) {
                        console.error(
                            "Questions fetch error:",
                            questionError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to fetch questions."
                        });
                    }

                    if (questions.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: "This exam has no questions."
                        });
                    }

                    // ======================================
                    // CALCULATE RESULT
                    // ======================================

                    let attempted = 0;
                    let correct = 0;
                    let wrong = 0;
                    let marks = 0;

                    const resultAnswers = [];

                    questions.forEach((question) => {

                        // Find student's answer
                        const answerData = answers.find(
                            (answer) =>
                                Number(answer.question_id) ===
                                Number(question.id)
                        );

                        let selectedAnswer = null;

                        if (
                            answerData &&
                            answerData.selected_answer !== null &&
                            answerData.selected_answer !== undefined &&
                            answerData.selected_answer !== ""
                        ) {
                            selectedAnswer = Number(
                                answerData.selected_answer
                            );
                        }

                        let isCorrect = 0;

                        // Answer attempted
                        if (selectedAnswer !== null) {

                            attempted++;

                            // Correct answer
                            if (
                                selectedAnswer ===
                                Number(question.correct_answer)
                            ) {

                                correct++;
                                isCorrect = 1;

                                marks += Number(question.marks || 1);

                            } else {

                                // Wrong answer
                                wrong++;

                                marks -= Number(
                                    exam.negative_mark || 0
                                );
                            }
                        }

                        resultAnswers.push({
                            question_id: question.id,
                            selected_answer: selectedAnswer,
                            is_correct: isCorrect
                        });
                    });

                    // Prevent negative total marks
                    if (marks < 0) {
                        marks = 0;
                    }

                    const totalQuestions = questions.length;

                    // Calculate maximum possible marks
                    let totalMarks = 0;

                    questions.forEach((question) => {
                        totalMarks += Number(question.marks || 1);
                    });

                    // Calculate percentage
                    const percentage =
                        totalMarks > 0
                            ? (marks / totalMarks) * 100
                            : 0;

                    // Round values
                    marks = Number(marks.toFixed(2));

                    const finalPercentage =
                        Number(percentage.toFixed(2));

                    // ======================================
                    // SAVE RESULT
                    // ======================================

                    db.run(
                        `
                        INSERT INTO results
                        (
                            user_id,
                            exam_id,
                            total_questions,
                            attempted,
                            correct,
                            wrong,
                            marks,
                            percentage
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            user_id,
                            exam_id,
                            totalQuestions,
                            attempted,
                            correct,
                            wrong,
                            marks,
                            finalPercentage
                        ],
                        function (resultError) {

                            if (resultError) {
                                console.error(
                                    "Save result error:",
                                    resultError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to save result."
                                });
                            }

                            const resultId = this.lastID;

                            // ==================================
                            // SAVE EACH ANSWER
                            // ==================================

                            let completed = 0;
                            let answerSaveError = false;

                            if (resultAnswers.length === 0) {
                                return res.status(201).json({
                                    success: true,
                                    message: "Result submitted successfully.",
                                    result: {
                                        id: resultId,
                                        exam_id: exam_id,
                                        total_questions: totalQuestions,
                                        attempted: attempted,
                                        correct: correct,
                                        wrong: wrong,
                                        marks: marks,
                                        percentage: finalPercentage
                                    }
                                });
                            }

                            resultAnswers.forEach((answer) => {

                                db.run(
                                    `
                                    INSERT INTO result_answers
                                    (
                                        result_id,
                                        question_id,
                                        selected_answer,
                                        is_correct
                                    )
                                    VALUES (?, ?, ?, ?)
                                    `,
                                    [
                                        resultId,
                                        answer.question_id,
                                        answer.selected_answer,
                                        answer.is_correct
                                    ],
                                    (answerError) => {

                                        if (answerError) {
                                            console.error(
                                                "Save answer error:",
                                                answerError
                                            );

                                            answerSaveError = true;
                                        }

                                        completed++;

                                        // All answers processed
                                        if (
                                            completed ===
                                            resultAnswers.length
                                        ) {

                                            if (answerSaveError) {
                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Result saved but some answers could not be saved."
                                                });
                                            }

                                            return res.status(201).json({
                                                success: true,
                                                message:
                                                    "Result submitted successfully.",
                                                result: {
                                                    id: resultId,
                                                    exam_id: exam_id,
                                                    total_questions:
                                                        totalQuestions,
                                                    attempted:
                                                        attempted,
                                                    correct:
                                                        correct,
                                                    wrong:
                                                        wrong,
                                                    marks:
                                                        marks,
                                                    percentage:
                                                        finalPercentage
                                                }
                                            });
                                        }
                                    }
                                );
                            });
                        }
                    );
                }
            );
        }
    );
});


// ==========================================
// GET ALL RESULTS
// ==========================================
router.get("/", (req, res) => {

    db.all(
        `
        SELECT
            r.*,
            u.name AS student_name,
            u.email AS student_email,
            e.name AS exam_name
        FROM results r
        LEFT JOIN users u
            ON r.user_id = u.id
        LEFT JOIN exams e
            ON r.exam_id = e.id
        ORDER BY r.id DESC
        `,
        [],
        (err, results) => {

            if (err) {
                console.error("Get results error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch results."
                });
            }

            res.json({
                success: true,
                results: results
            });
        }
    );
});


// ==========================================
// GET RESULTS OF ONE STUDENT
// ==========================================
router.get("/student/:userId", (req, res) => {

    const userId = req.params.userId;

    db.all(
        `
        SELECT
            r.*,
            e.name AS exam_name,
            e.category AS category
        FROM results r
        LEFT JOIN exams e
            ON r.exam_id = e.id
        WHERE r.user_id = ?
        ORDER BY r.id DESC
        `,
        [userId],
        (err, results) => {

            if (err) {
                console.error(
                    "Get student results error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch student results."
                });
            }

            res.json({
                success: true,
                results: results
            });
        }
    );
});


// ==========================================
// GET SINGLE RESULT
// ==========================================
router.get("/:id", (req, res) => {

    const resultId = req.params.id;

    db.get(
        `
        SELECT
            r.*,
            u.name AS student_name,
            u.email AS student_email,
            e.name AS exam_name,
            e.category AS category
        FROM results r
        LEFT JOIN users u
            ON r.user_id = u.id
        LEFT JOIN exams e
            ON r.exam_id = e.id
        WHERE r.id = ?
        `,
        [resultId],
        (err, result) => {

            if (err) {
                console.error(
                    "Get single result error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch result."
                });
            }

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Result not found."
                });
            }

            // Get answer details
            db.all(
                `
                SELECT
                    ra.*,
                    q.question,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    q.correct_answer
                FROM result_answers ra
                LEFT JOIN questions q
                    ON ra.question_id = q.id
                WHERE ra.result_id = ?
                ORDER BY ra.id ASC
                `,
                [resultId],
                (answerError, answers) => {

                    if (answerError) {
                        console.error(
                            "Get result answers error:",
                            answerError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to fetch result answers."
                        });
                    }

                    res.json({
                        success: true,
                        result: result,
                        answers: answers
                    });
                }
            );
        }
    );
});


module.exports = router;