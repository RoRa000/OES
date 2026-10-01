/* ========================================
   OES - Student Registration
   Backend Connected
======================================== */

// LIVE RENDER BACKEND
const API_URL = "https://oes-nx6c.onrender.com/api";

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // ========================================
        // GET FORM VALUES
        // ========================================

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim().toLowerCase();

        const mobile =
            document.getElementById("mobile").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // ========================================
        // VALIDATION
        // ========================================

        if (
            !fullName ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {
            showRegisterMessage(
                "Please fill all required fields.",
                false
            );
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            showRegisterMessage(
                "Please enter a valid 10-digit mobile number.",
                false
            );
            return;
        }

        if (password.length < 6) {
            showRegisterMessage(
                "Password must contain at least 6 characters.",
                false
            );
            return;
        }

        if (password !== confirmPassword) {
            showRegisterMessage(
                "Passwords do not match.",
                false
            );
            return;
        }

        // ========================================
        // DISABLE BUTTON
        // ========================================

        const submitButton =
            registerForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Registering...";
        }

        try {

            // ========================================
            // SEND DATA TO LIVE BACKEND
            // ========================================

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: fullName,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            // ========================================
            // REGISTRATION FAILED
            // ========================================

            if (!response.ok || !data.success) {

                showRegisterMessage(
                    data.message || "Registration failed.",
                    false
                );

                return;
            }

            // ========================================
            // REGISTRATION SUCCESS
            // ========================================

            showRegisterMessage(
                "Registration successful! Redirecting to login...",
                true
            );

            registerForm.reset();

            setTimeout(function () {

                window.location.href = "login.html";

            }, 1000);

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            showRegisterMessage(
                "Cannot connect to backend. Please try again.",
                false
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Register";
            }
        }
    });
}


// ========================================
// REGISTRATION MESSAGE
// ========================================

function showRegisterMessage(text, success) {

    const message =
        document.getElementById("registerMessage");

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