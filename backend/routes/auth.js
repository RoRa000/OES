const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../database");

const router = express.Router();

const JWT_SECRET = "OES_SECRET_KEY_2026";


// ==========================================
// STUDENT REGISTRATION
// ==========================================

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // ------------------------------------------
        // CHECK REQUIRED FIELDS
        // ------------------------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });

        }


        const cleanEmail = email.trim().toLowerCase();


        // ------------------------------------------
        // CHECK EXISTING USER
        // ------------------------------------------

        const existingUser = await db.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            [cleanEmail]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }


        // ------------------------------------------
        // HASH PASSWORD
        // ------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ------------------------------------------
        // INSERT STUDENT
        // ------------------------------------------

        const result = await db.query(
            `
            INSERT INTO users
            (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
            `,
            [
                name.trim(),
                cleanEmail,
                hashedPassword,
                "student"
            ]
        );


        const user = result.rows[0];


        // ------------------------------------------
        // SUCCESS RESPONSE
        // ------------------------------------------

        res.status(201).json({

            success: true,

            message: "Registration successful.",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        // PostgreSQL duplicate email protection

        if (error.code === "23505") {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }


        res.status(500).json({

            success: false,

            message: "Server error during registration."

        });

    }

});



// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        // ------------------------------------------
        // CHECK REQUIRED FIELDS
        // ------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }


        const cleanEmail = email
            .trim()
            .toLowerCase();


        // ------------------------------------------
        // FIND USER
        // ------------------------------------------

        const result = await db.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [cleanEmail]
        );


        // ------------------------------------------
        // USER NOT FOUND
        // ------------------------------------------

        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }


        const user = result.rows[0];


        // ------------------------------------------
        // CHECK PASSWORD
        // ------------------------------------------

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }


        // ------------------------------------------
        // CREATE JWT TOKEN
        // ------------------------------------------

        const token = jwt.sign(

            {
                id: user.id,
                email: user.email,
                role: user.role
            },

            JWT_SECRET,

            {
                expiresIn: "24h"
            }

        );


        // ------------------------------------------
        // SUCCESS RESPONSE
        // ------------------------------------------

        res.json({

            success: true,

            message: "Login successful.",

            token: token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error during login."

        });

    }

});



module.exports = router;