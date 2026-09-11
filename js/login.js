/* ========================================
   OES - Student Login System
   Backend Connected
======================================== */

const API_URL = "http://localhost:3000/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("loginPassword")
            .value;

        const message = document.getElementById("loginMessage");

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
        // BLOCK ADMIN FROM STUDENT LOGIN
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
            // SEND LOGIN REQUEST TO BACKEND
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
            // REDIRECT
            // ========================================

            showLoginMessage(
                "Login successful! Redirecting...",
                true
            );

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 500);

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            showLoginMessage(
                "Cannot connect to backend. Please make sure the OES server is running.",
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