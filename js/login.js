/* ========================================
   OES - Student Login System
   LIVE RENDER BACKEND
======================================== */

const API_URL = "https://oes-nx6c.onrender.com/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const message = document.getElementById("loginMessage");

        const email = emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        if (message) {
            message.style.display = "none";
        }

        // ========================================
        // VALIDATION
        // ========================================

        if (!email || !password) {
            showLoginMessage(
                "Please enter your email and password.",
                false
            );
            return;
        }

        // ========================================
        // BLOCK ADMIN ACCOUNT
        // ========================================

        if (email === "admin@oes.com") {
            showLoginMessage(
                "Admin account cannot login from Student Login. Please use Admin Login.",
                false
            );
            return;
        }

        // ========================================
        // LOGIN BUTTON
        // ========================================

        const submitButton =
            loginForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Logging in...";
        }

        try {

            // ========================================
            // LIVE BACKEND LOGIN
            // ========================================

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            // ========================================
            // LOGIN FAILED
            // ========================================

            if (!response.ok || !data.success) {

                showLoginMessage(
                    data.message || "Invalid email or password.",
                    false
                );

                return;
            }

            // ========================================
            // LOGIN SUCCESS
            // ========================================

            const user = data.user;

            // Save JWT token
            localStorage.setItem(
                "oesToken",
                data.token
            );

            // Save role
            localStorage.setItem(
                "oesUserRole",
                user.role
            );

            // Save email
            localStorage.setItem(
                "oesUserEmail",
                user.email
            );

            // Save login status
            localStorage.setItem(
                "oesLoggedIn",
                "true"
            );

            // Save student information
            localStorage.setItem(
                "oesStudent",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "oesCurrentStudent",
                JSON.stringify(user)
            );

            // ========================================
            // SUCCESS MESSAGE
            // ========================================

            showLoginMessage(
                "Login successful! Redirecting...",
                true
            );

            // ========================================
            // REDIRECT
            // ========================================

            setTimeout(function () {

                window.location.href = "dashboard.html";

            }, 700);

        } catch (error) {

            console.error(
                "Student login error:",
                error
            );

            showLoginMessage(
                "Cannot connect to backend. Please try again.",
                false
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Login";
            }
        }

    });
}


// ========================================
// LOGIN MESSAGE
// ========================================

function showLoginMessage(text, success) {

    const message =
        document.getElementById("loginMessage");

    if (!message) {
        alert(text);
        return;
    }

    message.style.display = "block";

    message.textContent = text;

    if (success) {

        message.style.background = "#e8f8f1";
        message.style.color = "#059669";

    } else {

        message.style.background = "#fff0f0";
        message.style.color = "#d93025";
    }
}