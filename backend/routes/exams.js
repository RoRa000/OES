
const express = require("express");
const db = require("../database");

const router = express.Router();

// GET ALL EXAMS
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM exams ORDER BY id DESC"
        );

        res.json({ success: true, exams: result.rows });
    } catch (error) {
        console.error("Get exams error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch exams."
        });
    }
});

// GET VISIBLE EXAMS
router.get("/visible", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM exams
            WHERE is_visible = 1 AND status = 'ACTIVE'
            ORDER BY id DESC
        `);

        res.json({ success: true, exams: result.rows });
    } catch (error) {
        console.error("Get visible exams error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch visible exams."
        });
    }
});

// GET SINGLE EXAM
router.get("/:id", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM exams WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        res.json({ success: true, exam: result.rows[0] });
    } catch (error) {
        console.error("Get exam error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch exam."
        });
    }
});

// CREATE EXAM
router.post("/", async (req, res) => {
    try {
        const {
            name, category, duration,
            negative_mark, status, is_visible
        } = req.body;

        if (!name || !duration) {
            return res.status(400).json({
                success: false,
                message: "Exam name and duration are required."
            });
        }

        const result = await db.query(
            `INSERT INTO exams
             (name, category, duration, negative_mark, status, is_visible)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                name,
                category || "",
                duration,
                negative_mark ?? 0,
                status || "ACTIVE",
                is_visible ? 1 : 0
            ]
        );

        res.status(201).json({
            success: true,
            message: "Exam created successfully.",
            exam: result.rows[0]
        });
    } catch (error) {
        console.error("Create exam error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create exam."
        });
    }
});

// UPDATE EXAM
router.put("/:id", async (req, res) => {
    try {
        const {
            name, category, duration,
            negative_mark, status, is_visible
        } = req.body;

        const result = await db.query(
            `UPDATE exams SET
                name = $1,
                category = $2,
                duration = $3,
                negative_mark = $4,
                status = $5,
                is_visible = $6
             WHERE id = $7
             RETURNING id`,
            [
                name,
                category || "",
                duration,
                negative_mark ?? 0,
                status || "ACTIVE",
                is_visible ? 1 : 0,
                req.params.id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        res.json({
            success: true,
            message: "Exam updated successfully."
        });
    } catch (error) {
        console.error("Update exam error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update exam."
        });
    }
});

// TOGGLE EXAM VISIBILITY
router.patch("/:id/visibility", async (req, res) => {
    try {
        const { is_visible } = req.body;
        const visible = is_visible ? 1 : 0;

        const result = await db.query(
            `UPDATE exams SET is_visible = $1
             WHERE id = $2 RETURNING id`,
            [visible, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        res.json({
            success: true,
            message: visible
                ? "Exam is now visible to students."
                : "Exam is now hidden from students."
        });
    } catch (error) {
        console.error("Visibility update error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update exam visibility."
        });
    }
});

// DELETE EXAM AND RELATED DATA
router.delete("/:id", async (req, res) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const exam = await client.query(
            "SELECT id FROM exams WHERE id = $1",
            [req.params.id]
        );

        if (exam.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        await client.query(
            `DELETE FROM result_answers
             WHERE result_id IN (
                 SELECT id FROM results WHERE exam_id = $1
             )`,
            [req.params.id]
        );

        await client.query(
            "DELETE FROM results WHERE exam_id = $1",
            [req.params.id]
        );

        await client.query(
            "DELETE FROM questions WHERE exam_id = $1",
            [req.params.id]
        );

        await client.query(
            "DELETE FROM exams WHERE id = $1",
            [req.params.id]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Exam deleted successfully."
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Delete exam error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete exam."
        });
    } finally {
        client.release();
    }
});

module.exports = router;