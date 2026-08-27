/* ========================================
   OES - Authentication
======================================== */


/* ========================================
   LOGOUT
======================================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("oesUserRole");
        localStorage.removeItem("oesUserEmail");
        localStorage.removeItem("oesCurrentStudent");
        localStorage.removeItem("oesLoggedIn");

        window.location.href = "login.html";

    });

}


/* ========================================
   STUDENT REGISTRATION
======================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

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

        const message =
            document.getElementById("registerMessage");


        /* Required fields */

        if (
            !fullName ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {

            showRegisterMessage(
                "Please fill in all fields.",
                false
            );

            return;
        }


        /* Password */

        if (password !== confirmPassword) {

            showRegisterMessage(
                "Passwords do not match.",
                false
            );

            return;
        }


        if (password.length < 6) {

            showRegisterMessage(
                "Password must be at least 6 characters long.",
                false
            );

            return;
        }


        /* Mobile */

        if (!/^[0-9]{10}$/.test(mobile)) {

            showRegisterMessage(
                "Please enter a valid 10-digit mobile number.",
                false
            );

            return;
        }


        /* Email */

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

            showRegisterMessage(
                "Please enter a valid email address.",
                false
            );

            return;
        }


        /* Get existing students */

        let students = JSON.parse(
            localStorage.getItem("oesStudents") || "[]"
        );


        if (!Array.isArray(students)) {
            students = [];
        }


        /* Duplicate email */

        const existingStudent = students.find(function (student) {

            return (
                student.email &&
                student.email.toLowerCase() === email
            );

        });


        if (existingStudent) {

            showRegisterMessage(
                "This email is already registered. Please login.",
                false
            );

            return;
        }


        /* Create student */

        const student = {

            id: Date.now(),

            fullName: fullName,

            email: email,

            mobile: mobile,

            password: password,

            role: "student"

        };


        /* Save student */

        students.push(student);

        localStorage.setItem(
            "oesStudents",
            JSON.stringify(students)
        );

        localStorage.setItem(
            "oesStudent",
            JSON.stringify(student)
        );


        /* Success */

        showRegisterMessage(
            "Registration successful! Redirecting to login...",
            true
        );


        registerForm.reset();


        setTimeout(function () {

            window.location.href = "login.html";

        }, 1000);

    });

}


/* ========================================
   REGISTER MESSAGE
======================================== */

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