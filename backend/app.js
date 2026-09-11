const express = require("express");
const cors = require("cors");

const db = require("./database");

const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");
const questionRoutes = require("./routes/questions");
const resultRoutes = require("./routes/results");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "OES Backend is running successfully!"
    });
});

// ===============================
// DATABASE TEST
// ===============================
app.get("/api/test", (req, res) => {
    db.get("SELECT 1 AS test", (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Backend and database are connected!",
            database: row.test === 1
        });
    });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`OES Backend running at http://localhost:${PORT}`);
});