/* ========================================
   OES - Users Routes
   Student Management
======================================== */

const express = require("express");

const db = require("../database");

const router = express.Router();


/* ========================================
   GET TOTAL STUDENT COUNT
======================================== */

router.get("/students/count", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT COUNT(*) AS total
            FROM users
            WHERE role = 'student'
        `);


        const totalStudents =
            Number(result.rows[0].total);


        res.json({
            success: true,
            totalStudents: totalStudents
        });


    } catch (error) {

        console.error(
            "Error loading student count:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to load student count",
            error: error.message
        });

    }

});


module.exports = router;