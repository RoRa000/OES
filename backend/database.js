const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// ==========================================
// SUPABASE / POSTGRESQL CONNECTION
// ==========================================

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("Connected to Supabase PostgreSQL database.");
});

pool.on("error", (err) => {
    console.error("Unexpected database error:", err.message);
});


// ==========================================
// CREATE TABLES
// ==========================================

async function initializeDatabase() {

    try {

        // ------------------------------------------
        // USERS TABLE
        // ------------------------------------------

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);


        // ------------------------------------------
        // EXAMS TABLE
        // ------------------------------------------

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                duration INTEGER NOT NULL,
                negative_mark NUMERIC(10,2) DEFAULT 0,
                status TEXT DEFAULT 'ACTIVE',
                is_visible INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);


        // ------------------------------------------
        // QUESTIONS TABLE
        // ------------------------------------------

        await pool.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id BIGSERIAL PRIMARY KEY,
                exam_id BIGINT NOT NULL,
                subject TEXT NOT NULL,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer INTEGER NOT NULL,
                marks NUMERIC(10,2) DEFAULT 1,

                CONSTRAINT questions_exam_fk
                    FOREIGN KEY (exam_id)
                    REFERENCES exams(id)
                    ON DELETE CASCADE
            )
        `);


        // ------------------------------------------
        // RESULTS TABLE
        // ------------------------------------------

        await pool.query(`
            CREATE TABLE IF NOT EXISTS results (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                exam_id BIGINT NOT NULL,
                total_questions INTEGER NOT NULL,
                attempted INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                wrong INTEGER NOT NULL,
                marks NUMERIC(10,2) NOT NULL,
                percentage NUMERIC(10,2) NOT NULL,
                submitted_at TIMESTAMPTZ DEFAULT NOW(),

                CONSTRAINT results_user_fk
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                CONSTRAINT results_exam_fk
                    FOREIGN KEY (exam_id)
                    REFERENCES exams(id)
                    ON DELETE CASCADE
            )
        `);


        // ------------------------------------------
        // RESULT ANSWERS TABLE
        // ------------------------------------------

        await pool.query(`
            CREATE TABLE IF NOT EXISTS result_answers (
                id BIGSERIAL PRIMARY KEY,
                result_id BIGINT NOT NULL,
                question_id BIGINT NOT NULL,
                selected_answer INTEGER,
                is_correct INTEGER NOT NULL,

                CONSTRAINT result_answers_result_fk
                    FOREIGN KEY (result_id)
                    REFERENCES results(id)
                    ON DELETE CASCADE,

                CONSTRAINT result_answers_question_fk
                    FOREIGN KEY (question_id)
                    REFERENCES questions(id)
                    ON DELETE CASCADE
            )
        `);


        // ==========================================
        // INDEXES
        // ==========================================

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_questions_exam_id
            ON questions(exam_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_results_user_id
            ON results(user_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_results_exam_id
            ON results(exam_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_result_answers_result_id
            ON result_answers(result_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email
            ON users(email)
        `);


        // ==========================================
        // DEFAULT ADMIN
        // ==========================================

        const adminPassword = await bcrypt.hash(
            "admin123",
            10
        );

        const adminResult = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            ["admin@oes.com"]
        );


        // ------------------------------------------
        // CREATE ADMIN
        // ------------------------------------------

        if (adminResult.rows.length === 0) {

            await pool.query(
                `
                INSERT INTO users
                (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                `,
                [
                    "OES Admin",
                    "admin@oes.com",
                    adminPassword,
                    "admin"
                ]
            );

            console.log(
                "Default admin created successfully."
            );

        }

        // ------------------------------------------
        // UPDATE ADMIN
        // ------------------------------------------

        else {

            await pool.query(
                `
                UPDATE users
                SET password = $1,
                    role = $2
                WHERE email = $3
                `,
                [
                    adminPassword,
                    "admin",
                    "admin@oes.com"
                ]
            );

            console.log(
                "Default admin credentials updated."
            );
        }


        console.log(
            "OES PostgreSQL database initialized successfully."
        );

    } catch (error) {

        console.error(
            "Database initialization failed:",
            error.message
        );

        process.exit(1);
    }
}


// Start database initialization
initializeDatabase();


// ==========================================
// EXPORT DATABASE POOL
// ==========================================

module.exports = pool;