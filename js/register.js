/* ========================================
   OES - Student Registration
======================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        /* ========================================
           Get Form Values
        ======================================== */

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");


        /* ========================================
           Validation
        ======================================== */

        if (!fullName || !email || !mobile || !password || !confirmPassword) {

            showRegisterMessage(
                "Please fill all required fields.",
                false
            );

            return;
        }


        /* ========================================
           Mobile Validation
        ======================================== */

        if (!/^[0-9]{10}$/.test(mobile)) {

            showRegisterMessage(
                "Please enter a valid 10-digit mobile number.",
                false
            );

            return;
        }


        /* ========================================
           Password Validation
        ======================================== */

        if (password.length < 6) {

            showRegisterMessage(
                "Password must contain at least 6 characters.",
                false
            );

            return;
        }


        /* ========================================
           Confirm Password
        ======================================== */

        if (password !== confirmPassword) {

            showRegisterMessage(
                "Passwords do not match.",
                false
            );

            return;
        }


        /* ========================================
           Get Existing Students
        ======================================== */

        let students = JSON.parse(
            localStorage.getItem("oesStudents") || "[]"
        );


        if (!Array.isArray(students)) {
            students = [];
        }


        /* ========================================
           Check Duplicate Email
        ======================================== */

        const existingStudent = students.find(function (student) {

            return (
                student.email &&
                student.email.toLowerCase() === email.toLowerCase()
            );

        });


        if (existingStudent) {

            showRegisterMessage(
                "This email is already registered. Please login.",
                false
            );

            return;
        }


        /* ========================================
           Create Student
        ======================================== */

        const student = {

            id: Date.now(),

            fullName: fullName,

            email: email,

            mobile: mobile,

            password: password,

            role: "student"

        };


        /* ========================================
           Save Student
        ======================================== */

        students.push(student);

        localStorage.setItem(
            "oesStudents",
            JSON.stringify(students)
        );


        /* ========================================
           Save Latest Student
        ======================================== */

        localStorage.setItem(
            "oesStudent",
            JSON.stringify(student)
        );


        /* ========================================
           Success
        ======================================== */

        showRegisterMessage(
            "Registration successful! Redirecting to login...",
            true
        );


        /* ========================================
           Redirect
        ======================================== */

        setTimeout(function () {

            window.location.href = "login.html";

        }, 1200);

    });
}


/* ========================================
   Registration Message
======================================== */

function showRegisterMessage(text, success) {

    const message =
        document.getElementById("registerMessage");

    if (!message) {
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