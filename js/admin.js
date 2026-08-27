/* ========================================
   OES - Admin Dashboard
======================================== */


/* ========================================
   Admin Protection
======================================== */

const adminUserRole =
    localStorage.getItem("oesUserRole");

const adminUserEmail =
    localStorage.getItem("oesUserEmail");


if (
    adminUserRole !== "admin" ||
    !adminUserEmail
) {

    window.location.href =
        "login.html";

}


/* ========================================
   Get Dashboard Elements
======================================== */

const totalStudentsElement =
    document.getElementById(
        "totalStudents"
    );

const totalExamsElement =
    document.getElementById(
        "adminTotalExams"
    );

const totalQuestionsElement =
    document.getElementById(
        "totalQuestions"
    );

const totalResultsElement =
    document.getElementById(
        "totalResults"
    );


/* ========================================
   Load Dashboard Statistics
======================================== */

function loadDashboardStatistics() {


    /* ========================================
       TOTAL STUDENTS
       Read ALL registered students
    ======================================== */

    let totalStudents = 0;

    const studentsData =
        localStorage.getItem(
            "oesStudents"
        );


    if (studentsData) {

        try {

            const students =
                JSON.parse(
                    studentsData
                );


            if (Array.isArray(students)) {

                totalStudents =
                    students.length;

            }

        } catch (error) {

            console.error(
                "Error loading students:",
                error
            );

        }

    }


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            totalStudents;

    }



    /* ========================================
       TOTAL EXAMS
    ======================================== */

    const examsData =
        localStorage.getItem(
            "oesExams"
        );


    let totalExams = 1;


    if (examsData) {

        try {

            const exams =
                JSON.parse(
                    examsData
                );


            if (Array.isArray(exams)) {

                totalExams =
                    exams.length;

            }

        } catch (error) {

            console.error(
                "Error loading exams:",
                error
            );

        }

    }


    if (totalExamsElement) {

        totalExamsElement.textContent =
            totalExams;

    }



    /* ========================================
       TOTAL QUESTIONS
    ======================================== */

    const questionsData =
        localStorage.getItem(
            "oesQuestions"
        );


    let totalQuestions = 5;


    if (questionsData) {

        try {

            const questions =
                JSON.parse(
                    questionsData
                );


            if (Array.isArray(questions)) {

                totalQuestions =
                    questions.length;

            }

        } catch (error) {

            console.error(
                "Error loading questions:",
                error
            );

        }

    }


    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            totalQuestions;

    }



    /* ========================================
       TOTAL RESULTS
    ======================================== */

    let totalResults = 0;


    const resultsData =
        localStorage.getItem(
            "oesResults"
        );


    if (resultsData) {

        try {

            const results =
                JSON.parse(
                    resultsData
                );


            if (Array.isArray(results)) {

                totalResults =
                    results.length;

            }

        } catch (error) {

            console.error(
                "Error loading results:",
                error
            );

        }

    }



    /* ========================================
       Fallback to Latest Result
    ======================================== */

    if (
        totalResults === 0
    ) {

        const latestResult =
            localStorage.getItem(
                "oesLatestResult"
            );


        if (latestResult) {

            totalResults = 1;

        }

    }


    if (totalResultsElement) {

        totalResultsElement.textContent =
            totalResults;

    }

}


/* ========================================
   Initialize Dashboard
======================================== */

loadDashboardStatistics();