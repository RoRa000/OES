/* ========================================
   OES - Student Management
======================================== */


/* ========================================
   Admin Protection
======================================== */

const studentPageRole =
    localStorage.getItem("oesUserRole");

const studentPageEmail =
    localStorage.getItem("oesUserEmail");


if (
    studentPageRole !== "admin" ||
    !studentPageEmail
) {
    window.location.href = "login.html";
}


/* ========================================
   Get HTML Elements
======================================== */

const studentsContainer =
    document.getElementById("studentsContainer");

const studentCount =
    document.getElementById("studentCount");

const noStudents =
    document.getElementById("noStudents");


/* ========================================
   Get Registered Students
======================================== */

let students = JSON.parse(
    localStorage.getItem("oesStudents")
);


/* ========================================
   Support Existing Student
======================================== */

const oldStudent = JSON.parse(
    localStorage.getItem("oesStudent")
);


/*
   Agar oesStudents available nahi hai
   aur oesStudent available hai,
   to student ko automatically list mein add karo.
*/

if (
    !Array.isArray(students) ||
    students.length === 0
) {

    students = [];

    if (oldStudent) {

        students.push(oldStudent);

        localStorage.setItem(
            "oesStudents",
            JSON.stringify(students)
        );

    }
}


/* ========================================
   Display Students
======================================== */

function displayStudents() {

    studentsContainer.innerHTML = "";


    /* ========================================
       No Students
    ======================================== */

    if (
        !Array.isArray(students) ||
        students.length === 0
    ) {

        studentCount.textContent = "0";

        noStudents.style.display = "block";

        return;
    }


    /* ========================================
       Student Count
    ======================================== */

    studentCount.textContent =
        students.length;

    noStudents.style.display = "none";


    /* ========================================
       Display Students
    ======================================== */

    students.forEach(function (student) {

        const studentCard =
            document.createElement("div");


        studentCard.className =
            "exam-card";


        studentCard.innerHTML = `

            <div class="exam-card-top">

                <div class="exam-small-icon">
                    👨‍🎓
                </div>

                <span class="exam-status">
                    REGISTERED
                </span>

            </div>


            <h3>
                ${student.fullName || "Student"}
            </h3>


            <p class="exam-category">
                ${student.email || "No email available"}
            </p>


            <div class="exam-details">

                <div>

                    <span>
                        Mobile
                    </span>

                    <strong>
                        ${student.mobile || "N/A"}
                    </strong>

                </div>


                <div>

                    <span>
                        Role
                    </span>

                    <strong>
                        Student
                    </strong>

                </div>

            </div>

        `;


        studentsContainer.appendChild(
            studentCard
        );

    });

}


/* ========================================
   Load Students
======================================== */

displayStudents();