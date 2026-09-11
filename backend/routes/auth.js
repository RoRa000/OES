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

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        // Check existing email
        db.get(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, existingUser) => {

                if (err) {
                    console.error("Database error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });
                }

                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already registered."
                    });
                }

                try {
                    // Hash password
                    const hashedPassword = await bcrypt.hash(password, 10);

                    // Insert student
                    db.run(
                        `
                        INSERT INTO users
                        (name, email, password, role)
                        VALUES (?, ?, ?, ?)
                        `,
                        [
                            name,
                            email,
                            hashedPassword,
                            "student"
                        ],
                        function (insertError) {

                            if (insertError) {
                                console.error(
                                    "Registration insert error:",
                                    insertError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Registration failed."
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: "Registration successful.",
                                user: {
                                    id: this.lastID,
                                    name: name,
                                    email: email,
                                    role: "student"
                                }
                            });
                        }
                    );

                } catch (hashError) {
                    console.error(
                        "Password hashing error:",
                        hashError
                    );

                    res.status(500).json({
                        success: false,
                        message: "Password processing failed."
                    });
                }
            }
        );

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration."
        });
    }
});


// ==========================================
// LOGIN
// ==========================================
router.post("/login", (req, res) => {

    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    // Find user
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {

            if (err) {
                console.error("Login database error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            // User not found
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            try {
                // Compare password
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

                // Create JWT token
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

                // Successful login
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

            } catch (passwordError) {
                console.error(
                    "Password comparison error:",
                    passwordError
                );

                res.status(500).json({
                    success: false,
                    message: "Login processing failed."
                });
            }
        }
    );
});


module.exports = router;