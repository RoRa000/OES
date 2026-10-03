require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./database");

const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");
const questionRoutes = require("./routes/questions");
const resultRoutes = require("./routes/results");
const userRoutes = require("./routes/users");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "OES Backend is running successfully!"
    });

});


app.get("/api/test", async (req, res) => {

    try {

        const result =
            await db.query(
                "SELECT 1 AS test"
            );


        res.json({
            success: true,
            message:
                "Backend and database are connected!",
            database:
                result.rows[0].test === 1
        });


    } catch (error) {

        console.error(
            "Database test error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message:
                "Database connection failed",
            error:
                error.message
        });

    }

});


app.listen(PORT, () => {

    console.log(
        `OES Backend running on port ${PORT}`
    );

});