const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./oes.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to OES SQLite database.");
    }
});

db.serialize(() => {

    // ==========================================
    // USERS TABLE
    // ==========================================

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);


    // ==========================================
    // EXAMS TABLE
    // ==========================================

    db.run(`
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            duration INTEGER NOT NULL,
            negative_mark REAL DEFAULT 0,
            status TEXT DEFAULT 'ACTIVE',
            is_visible INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);


    // ==========================================
    // QUESTIONS TABLE
    // ==========================================

    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            marks REAL DEFAULT 1,
            FOREIGN KEY (exam_id) REFERENCES exams(id)
        )
    `);


    // ==========================================
    // RESULTS TABLE
    // ==========================================

    db.run(`
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exam_id INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            attempted INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            wrong INTEGER NOT NULL,
            marks REAL NOT NULL,
            percentage REAL NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exam_id) REFERENCES exams(id)
        )
    `);


    // ==========================================
    // RESULT ANSWERS TABLE
    // ==========================================

    db.run(`
        CREATE TABLE IF NOT EXISTS result_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            result_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            selected_answer INTEGER,
            is_correct INTEGER NOT NULL,
            FOREIGN KEY (result_id) REFERENCES results(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    `);


    // ==========================================
    // DEFAULT ADMIN
    // ==========================================

    const adminPassword = bcrypt.hashSync("admin123", 10);

    db.get(
        `SELECT id FROM users WHERE email = ?`,
        ["admin@oes.com"],
        (err, admin) => {

            if (err) {
                console.error(
                    "Admin check failed:",
                    err.message
                );
                return;
            }


            // --------------------------------------
            // ADMIN DOES NOT EXIST → CREATE ADMIN
            // --------------------------------------

            if (!admin) {

                db.run(
                    `
                    INSERT INTO users
                    (name, email, password, role)
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        "OES Admin",
                        "admin@oes.com",
                        adminPassword,
                        "admin"
                    ],
                    (insertErr) => {

                        if (insertErr) {

                            console.error(
                                "Admin creation failed:",
                                insertErr.message
                            );

                        } else {

                            console.log(
                                "Default admin created successfully."
                            );

                        }

                    }
                );

            }


            // --------------------------------------
            // ADMIN ALREADY EXISTS → RESET PASSWORD
            // --------------------------------------

            else {

                db.run(
                    `
                    UPDATE users
                    SET password = ?, role = ?
                    WHERE email = ?
                    `,
                    [
                        adminPassword,
                        "admin",
                        "admin@oes.com"
                    ],
                    (updateErr) => {

                        if (updateErr) {

                            console.error(
                                "Admin update failed:",
                                updateErr.message
                            );

                        } else {

                            console.log(
                                "Default admin credentials updated."
                            );

                        }

                    }
                );

            }

        }
    );

});


module.exports = db;