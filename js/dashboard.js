/* ========================================
   OES - Student Dashboard
======================================== */


/* ========================================
   LOGIN PROTECTION
======================================== */

const userRole =
    localStorage.getItem("oesUserRole");

const userEmail =
    localStorage.getItem("oesUserEmail");


if (
    userRole !== "student" ||
    !userEmail
) {
    window.location.href = "login.html";
}


/* ========================================
   GET ALL STUDENTS
======================================== */

const students =
    JSON.parse(
        localStorage.getItem("oesStudents") || "[]"
    );


/* ========================================
   FIND LOGGED-IN STUDENT
======================================== */

let registeredStudent =
    students.find(function (student) {

        return (
            student.email &&
            student.email.toLowerCase() ===
            userEmail.toLowerCase()
        );

    });


/* ========================================
   CURRENT STUDENT FALLBACK
======================================== */

if (!registeredStudent) {

    const currentStudent =
        JSON.parse(
            localStorage.getItem("oesCurrentStudent")
        );


    if (
        currentStudent &&
        currentStudent.email &&
        currentStudent.email.toLowerCase() ===
        userEmail.toLowerCase()
    ) {

        registeredStudent =
            currentStudent;

    }

}


/* ========================================
   GET AVAILABLE EXAMS
======================================== */

let availableExams = [];


const savedExams =
    localStorage.getItem("oesExams");


if (savedExams) {

    try {

        const parsedExams =
            JSON.parse(savedExams);


        if (Array.isArray(parsedExams)) {

            availableExams =
                parsedExams.filter(
                    function (exam) {

                        return (
                            exam &&
                            exam.status === "ACTIVE"
                        );

                    }
                );

        }

    } catch (error) {

        console.error(
            "Error loading exams:",
            error
        );

        availableExams = [];

    }

}


/* ========================================
   GET RESULT HISTORY
======================================== */

let allResults = [];


const savedResults =
    localStorage.getItem("oesResults");


if (savedResults) {

    try {

        const parsedResults =
            JSON.parse(savedResults);


        if (Array.isArray(parsedResults)) {

            allResults =
                parsedResults;

        }

    } catch (error) {

        console.error(
            "Error loading results:",
            error
        );

        allResults = [];

    }

}


/* ========================================
   FIND ONLY CURRENT STUDENT RESULTS
======================================== */

const studentResults =
    allResults.filter(
        function (result) {

            return (
                result &&
                result.studentEmail &&
                result.studentEmail.toLowerCase() ===
                userEmail.toLowerCase()
            );

        }
    );


/* ========================================
   GET HTML ELEMENTS
======================================== */

const studentName =
    document.getElementById("studentName");

const totalExams =
    document.getElementById("totalExams");

const completedExams =
    document.getElementById("completedExams");

const pendingExams =
    document.getElementById("pendingExams");

const averageScore =
    document.getElementById("averageScore");

const emptyResults =
    document.getElementById("emptyResults");

const resultCard =
    document.getElementById("resultCard");

const dashboardMarks =
    document.getElementById("dashboardMarks");

const dashboardPercentage =
    document.getElementById("dashboardPercentage");

const dashboardCorrect =
    document.getElementById("dashboardCorrect");

const dashboardWrong =
    document.getElementById("dashboardWrong");


/* ========================================
   FIND EXAM CONTAINER
======================================== */

const examGrid =
    document.querySelector(
        ".dashboard-section .exam-grid"
    );


/* ========================================
   DISPLAY STUDENT NAME
======================================== */

if (
    registeredStudent &&
    studentName
) {

    studentName.textContent =
        registeredStudent.fullName;

}


/* ========================================
   DISPLAY AVAILABLE EXAMS
======================================== */

function displayAvailableExams() {

    if (!examGrid) {
        return;
    }


    /* Remove old hard-coded exam cards */

    examGrid.innerHTML = "";


    /* No active exams */

    if (availableExams.length === 0) {

        examGrid.innerHTML = `

            <div class="empty-results">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No Active Examinations
                </h3>

                <p>
                    There are currently no active examinations available.
                </p>

            </div>

        `;

        return;

    }


    /* Create exam cards */

    availableExams.forEach(
        function (exam) {

            const examCard =
                document.createElement("div");


            examCard.className =
                "exam-card";


            examCard.innerHTML = `

                <div class="exam-card-top">

                    <div class="exam-small-icon">
                        📝
                    </div>

                    <span class="exam-status">
                        ${exam.status}
                    </span>

                </div>


                <h3>
                    ${exam.name}
                </h3>


                <p class="exam-category">
                    ${exam.category}
                </p>


                <div class="exam-details">

                    <div>

                        <span>
                            Questions
                        </span>

                        <strong>
                            ${exam.questions}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Duration
                        </span>

                        <strong>
                            ${exam.duration} Min
                        </strong>

                    </div>


                    <div>

                        <span>
                            Negative
                        </span>

                        <strong>
                            ${exam.negativeMark}
                        </strong>

                    </div>

                </div>


                <a
                    href="exam.html?examId=${exam.id}"
                    class="btn btn-primary"
                >
                    Start Exam
                </a>

            `;


            examGrid.appendChild(
                examCard
            );

        }
    );

}


/* ========================================
   TOTAL AVAILABLE EXAMS
======================================== */

if (totalExams) {

    totalExams.textContent =
        availableExams.length;

}


/* ========================================
   DISPLAY EXAMS
======================================== */

displayAvailableExams();


/* ========================================
   CURRENT STUDENT RESULT
======================================== */

const latestStudentResult =
    studentResults.length > 0
        ? studentResults[studentResults.length - 1]
        : null;


/* ========================================
   COMPLETED EXAMS
======================================== */

if (completedExams) {

    completedExams.textContent =
        studentResults.length;

}


/* ========================================
   PENDING EXAMS
======================================== */

if (pendingExams) {

    const pending =
        Math.max(
            availableExams.length -
            studentResults.length,
            0
        );


    pendingExams.textContent =
        pending;

}


/* ========================================
   STUDENT HAS COMPLETED EXAM
======================================== */

if (latestStudentResult) {


    /* ========================================
       AVERAGE SCORE
    ======================================== */

    if (averageScore) {

        const totalPercentage =
            studentResults.reduce(
                function (total, result) {

                    return (
                        total +
                        Number(
                            result.percentage || 0
                        )
                    );

                },
                0
            );


        const average =
            studentResults.length > 0
                ? totalPercentage /
                  studentResults.length
                : 0;


        averageScore.textContent =
            average.toFixed(2) + "%";

    }


    /* ========================================
       SHOW RESULT CARD
    ======================================== */

    if (emptyResults) {

        emptyResults.style.display =
            "none";

    }


    if (resultCard) {

        resultCard.style.display =
            "block";

    }


    /* Marks */

    if (dashboardMarks) {

        dashboardMarks.textContent =
            Number(
                latestStudentResult.marks || 0
            ).toFixed(2);

    }


    /* Percentage */

    if (dashboardPercentage) {

        dashboardPercentage.textContent =
            Number(
                latestStudentResult.percentage || 0
            ).toFixed(2) + "%";

    }


    /* Correct */

    if (dashboardCorrect) {

        dashboardCorrect.textContent =
            latestStudentResult.correct || 0;

    }


    /* Wrong */

    if (dashboardWrong) {

        dashboardWrong.textContent =
            latestStudentResult.wrong || 0;

    }


} else {


    /* ========================================
       NO EXAM COMPLETED
    ======================================== */

    if (averageScore) {

        averageScore.textContent =
            "0.00%";

    }


    /* Hide result card */

    if (resultCard) {

        resultCard.style.display =
            "none";

    }


    /* Show empty result */

    if (emptyResults) {

        emptyResults.style.display =
            "block";

    }

}


/* ========================================
   DEBUG
======================================== */

console.log(
    "Logged-in student:",
    registeredStudent
);

console.log(
    "Logged-in email:",
    userEmail
);

console.log(
    "Available active exams:",
    availableExams
);

console.log(
    "Current student results:",
    studentResults
);