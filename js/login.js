/* ========================================
   OES - Student Login System
======================================== */


/* ========================================
   LOGIN FORM
======================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* ========================================
               GET LOGIN VALUES
            ======================================== */

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            /* Clear previous message */

            if (message) {
                message.style.display = "none";
            }


            /* ========================================
               VALIDATION
            ======================================== */

            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password.",
                    false
                );

                return;
            }


            /* ========================================
               BLOCK ADMIN FROM STUDENT LOGIN
            ======================================== */

            const adminEmail =
                "admin@example.com";


            if (email === adminEmail) {

                showLoginMessage(
                    "Admin account cannot login from Student Login. Please use Admin Login.",
                    false
                );

                return;
            }


            /* ========================================
               LOAD STUDENTS
            ======================================== */

            let students = [];

            try {

                students = JSON.parse(
                    localStorage.getItem(
                        "oesStudents"
                    ) || "[]"
                );

            } catch (error) {

                console.error(
                    "Error loading students:",
                    error
                );

                students = [];

            }


            if (!Array.isArray(students)) {
                students = [];
            }


            /* ========================================
               FIND STUDENT
            ======================================== */

            const student =
                students.find(
                    function (item) {

                        return (
                            item &&
                            item.email &&
                            item.email
                                .toLowerCase()
                                === email &&
                            item.password
                                === password &&
                            item.role
                                === "student"
                        );

                    }
                );


            /* ========================================
               STUDENT FOUND
            ======================================== */

            if (student) {

                /* Set Student Role */

                localStorage.setItem(
                    "oesUserRole",
                    "student"
                );


                /* Set Student Email */

                localStorage.setItem(
                    "oesUserEmail",
                    student.email
                );


                /* Login Status */

                localStorage.setItem(
                    "oesLoggedIn",
                    "true"
                );


                /* Current Student */

                localStorage.setItem(
                    "oesStudent",
                    JSON.stringify(student)
                );


                localStorage.setItem(
                    "oesCurrentStudent",
                    JSON.stringify(student)
                );


                /* Redirect */

                window.location.href =
                    "dashboard.html";


                return;
            }


            /* ========================================
               INVALID LOGIN
            ======================================== */

            showLoginMessage(
                "Invalid student email or password.",
                false
            );

        }
    );

}


/* ========================================
   LOGIN MESSAGE
======================================== */

function showLoginMessage(
    text,
    success
) {

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!message) {

        alert(text);

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