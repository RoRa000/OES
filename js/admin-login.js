/* ========================================
   OES - Admin Login
======================================== */


/* ========================================
   ADMIN CREDENTIALS
======================================== */

/*
   Public registration se admin create nahi hoga.

   Sirf ye credentials Admin Login ke liye
   use honge.
*/

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";


/* ========================================
   LOGIN FORM
======================================== */

const adminLoginForm =
    document.getElementById("adminLoginForm");


/* ========================================
   FORM SUBMIT
======================================== */

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* ========================================
               GET VALUES
            ======================================== */

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


            /* ========================================
               VALIDATION
            ======================================== */

            if (!email || !password) {

                showAdminMessage(
                    "Please enter admin email and password.",
                    false
                );

                return;
            }


            /* ========================================
               CHECK ADMIN CREDENTIALS
            ======================================== */

            if (
                email !== ADMIN_EMAIL ||
                password !== ADMIN_PASSWORD
            ) {

                showAdminMessage(
                    "Invalid admin email or password.",
                    false
                );

                return;
            }


            /* ========================================
               ADMIN LOGIN SUCCESS
            ======================================== */

            localStorage.setItem(
                "oesUserRole",
                "admin"
            );


            localStorage.setItem(
                "oesUserEmail",
                ADMIN_EMAIL
            );


            /* ========================================
               SUCCESS MESSAGE
            ======================================== */

            showAdminMessage(
                "Admin login successful! Redirecting...",
                true
            );


            /* ========================================
               REDIRECT
            ======================================== */

            setTimeout(function () {

                window.location.href =
                    "admin.html";

            }, 800);

        }
    );

}


/* ========================================
   ADMIN MESSAGE
======================================== */

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