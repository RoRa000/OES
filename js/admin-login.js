/* ========================================
   OES - Admin Login
   LIVE BACKEND CONNECTED
======================================== */


// ==========================================
// LIVE RENDER BACKEND
// ==========================================

const API_URL = "https://oes-nx6c.onrender.com/api";


// ==========================================
// LOGIN FORM
// ==========================================

const adminLoginForm =
    document.getElementById("adminLoginForm");


// ==========================================
// FORM SUBMIT
// ==========================================

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // GET VALUES
            // ==========================================

            const email =
                document
                    .getElementById("adminEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("adminPassword")
                    .value;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!email || !password) {

                showAdminMessage(
                    "Please enter admin email and password.",
                    false
                );

                return;
            }


            // ==========================================
            // SHOW LOADING
            // ==========================================

            showAdminMessage(
                "Checking admin credentials...",
                true
            );


            try {

                // ==========================================
                // SEND LOGIN REQUEST TO BACKEND
                // ==========================================

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


                // ==========================================
                // GET RESPONSE
                // ==========================================

                const data = await response.json();


                // ==========================================
                // LOGIN FAILED
                // ==========================================

                if (!response.ok || !data.success) {

                    showAdminMessage(
                        data.message ||
                        "Invalid admin email or password.",
                        false
                    );

                    return;
                }


                // ==========================================
                // CHECK ADMIN ROLE
                // ==========================================

                if (
                    !data.user ||
                    data.user.role !== "admin"
                ) {

                    showAdminMessage(
                        "This account is not an admin account.",
                        false
                    );

                    return;
                }


                // ==========================================
                // SAVE LOGIN DATA
                // ==========================================

                localStorage.setItem(
                    "oesUserRole",
                    "admin"
                );

                localStorage.setItem(
                    "oesUserEmail",
                    data.user.email
                );

                localStorage.setItem(
                    "oesCurrentUser",
                    JSON.stringify(data.user)
                );

                localStorage.setItem(
                    "oesToken",
                    data.token
                );


                // ==========================================
                // SUCCESS
                // ==========================================

                showAdminMessage(
                    "Admin login successful! Redirecting...",
                    true
                );


                // ==========================================
                // REDIRECT
                // ==========================================

                setTimeout(function () {

                    window.location.href =
                        "admin.html";

                }, 800);


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                showAdminMessage(
                    "Cannot connect to backend. Please try again.",
                    false
                );

            }

        }
    );

}


// ==========================================
// ADMIN MESSAGE
// ==========================================

function showAdminMessage(
    text,
    success
) {

    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    if (!message) {
        return;
    }


    message.style.display =
        "block";


    message.textContent =
        text;


    if (success) {

        message.style.background =
            "#e8f8f1";

        message.style.color =
            "#059669";

    } else {

        message.style.background =
            "#fff0f0";

        message.style.color =
            "#d93025";

    }

}