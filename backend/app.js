const express = require("express");
const cors = require("cors");

const db = require("./database");

const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");
const questionRoutes = require("./routes/questions");
const resultRoutes = require("./routes/results");

const app = express();

// Render provides PORT automatically.
// Local computer par 3000 use hoga.
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "OES Backend is running successfully!"
    });
});

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

app.listen(PORT, () => {
    console.log(`OES Backend running on port ${PORT}`);
});