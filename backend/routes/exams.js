const express = require("express");
const db = require("../database");

const router = express.Router();

// ==========================================
// GET ALL EXAMS - ADMIN
// ==========================================
router.get("/", (req, res) => {

    db.all(
        "SELECT * FROM exams ORDER BY id DESC",
        [],
        (err, exams) => {

            if (err) {
                console.error("Get exams error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch exams."
                });
            }

            res.json({
                success: true,
                exams: exams
            });
        }
    );
});


// ==========================================
// GET VISIBLE EXAMS - STUDENTS
// ==========================================
router.get("/visible", (req, res) => {

    db.all(
        `
        SELECT *
        FROM exams
        WHERE is_visible = 1
        AND status = 'ACTIVE'
        ORDER BY id DESC
        `,
        [],
        (err, exams) => {

            if (err) {
                console.error("Get visible exams error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch visible exams."
                });
            }

            res.json({
                success: true,
                exams: exams
            });
        }
    );
});


// ==========================================
// GET SINGLE EXAM
// ==========================================
router.get("/:id", (req, res) => {

    const examId = req.params.id;

    db.get(
        "SELECT * FROM exams WHERE id = ?",
        [examId],
        (err, exam) => {

            if (err) {
                console.error("Get exam error:", err);

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

            res.json({
                success: true,
                exam: exam
            });
        }
    );
});


// ==========================================
// CREATE EXAM - ADMIN
// ==========================================
router.post("/", (req, res) => {

    const {
        name,
        category,
        duration,
        negative_mark,
        status,
        is_visible
    } = req.body;

    if (!name || !duration) {
        return res.status(400).json({
            success: false,
            message: "Exam name and duration are required."
        });
    }

    db.run(
        `
        INSERT INTO exams
        (name, category, duration, negative_mark, status, is_visible)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            name,
            category || "",
            duration,
            negative_mark || 0,
            status || "ACTIVE",
            is_visible ? 1 : 0
        ],
        function (err) {

            if (err) {
                console.error("Create exam error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create exam."
                });
            }

            res.status(201).json({
                success: true,
                message: "Exam created successfully.",
                exam: {
                    id: this.lastID,
                    name: name,
                    category: category || "",
                    duration: duration,
                    negative_mark: negative_mark || 0,
                    status: status || "ACTIVE",
                    is_visible: is_visible ? 1 : 0
                }
            });
        }
    );
});


// ==========================================
// UPDATE EXAM
// ==========================================
router.put("/:id", (req, res) => {

    const examId = req.params.id;

    const {
        name,
        category,
        duration,
        negative_mark,
        status,
        is_visible
    } = req.body;

    db.run(
        `
        UPDATE exams
        SET
            name = ?,
            category = ?,
            duration = ?,
            negative_mark = ?,
            status = ?,
            is_visible = ?
        WHERE id = ?
        `,
        [
            name,
            category || "",
            duration,
            negative_mark || 0,
            status || "ACTIVE",
            is_visible ? 1 : 0,
            examId
        ],
        function (err) {

            if (err) {
                console.error("Update exam error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update exam."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found."
                });
            }

            res.json({
                success: true,
                message: "Exam updated successfully."
            });
        }
    );
});


// ==========================================
// TOGGLE EXAM VISIBILITY
// ==========================================
router.patch("/:id/visibility", (req, res) => {

    const examId = req.params.id;
    const { is_visible } = req.body;

    db.run(
        `
        UPDATE exams
        SET is_visible = ?
        WHERE id = ?
        `,
        [
            is_visible ? 1 : 0,
            examId
        ],
        function (err) {

            if (err) {
                console.error("Visibility update error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update exam visibility."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found."
                });
            }

            res.json({
                success: true,
                message: is_visible
                    ? "Exam is now visible to students."
                    : "Exam is now hidden from students."
            });
        }
    );
});


// ==========================================
// DELETE EXAM
// ==========================================
router.delete("/:id", (req, res) => {

    const examId = req.params.id;

    // Delete result answers first
    db.run(
        `
        DELETE FROM result_answers
        WHERE result_id IN (
            SELECT id FROM results WHERE exam_id = ?
        )
        `,
        [examId],
        (answerErr) => {

            if (answerErr) {
                console.error("Delete result answers error:", answerErr);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete exam data."
                });
            }

            // Delete results
            db.run(
                "DELETE FROM results WHERE exam_id = ?",
                [examId],
                (resultErr) => {

                    if (resultErr) {
                        console.error("Delete results error:", resultErr);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to delete exam results."
                        });
                    }

                    // Delete questions
                    db.run(
                        "DELETE FROM questions WHERE exam_id = ?",
                        [examId],
                        (questionErr) => {

                            if (questionErr) {
                                console.error(
                                    "Delete questions error:",
                                    questionErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to delete exam questions."
                                });
                            }

                            // Finally delete exam
                            db.run(
                                "DELETE FROM exams WHERE id = ?",
                                [examId],
                                function (examErr) {

                                    if (examErr) {
                                        console.error(
                                            "Delete exam error:",
                                            examErr
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message: "Failed to delete exam."
                                        });
                                    }

                                    if (this.changes === 0) {
                                        return res.status(404).json({
                                            success: false,
                                            message: "Exam not found."
                                        });
                                    }

                                    res.json({
                                        success: true,
                                        message: "Exam deleted successfully."
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


module.exports = router;