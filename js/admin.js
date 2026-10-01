/* ========================================
   OES - Admin Dashboard
   Connected to LIVE Render Backend
======================================== */


/* ========================================
   API URL
======================================== */

const API_URL =
    "https://oes-nx6c.onrender.com/api";


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

async function loadDashboardStatistics() {

    console.log(
        "OES Admin Dashboard connected to LIVE Render Backend"
    );


    /* ========================================
       TOTAL EXAMS
    ======================================== */

    try {

        const examsResponse =
            await fetch(
                `${API_URL}/exams`
            );


        const examsData =
            await examsResponse.json();


        if (
            examsData.success &&
            Array.isArray(examsData.exams)
        ) {

            if (totalExamsElement) {

                totalExamsElement.textContent =
                    examsData.exams.length;

            }

        }

    } catch (error) {

        console.error(
            "Error loading exams:",
            error
        );

    }


    /* ========================================
       TOTAL QUESTIONS
    ======================================== */

    try {

        const examsResponse =
            await fetch(
                `${API_URL}/exams`
            );


        const examsData =
            await examsResponse.json();


        let totalQuestions = 0;


        if (
            examsData.success &&
            Array.isArray(examsData.exams)
        ) {

            for (
                const exam of examsData.exams
            ) {

                try {

                    const questionsResponse =
                        await fetch(
                            `${API_URL}/questions/exam/${exam.id}`
                        );


                    const questionsData =
                        await questionsResponse.json();


                    if (
                        questionsData.success &&
                        Array.isArray(
                            questionsData.questions
                        )
                    ) {

                        totalQuestions +=
                            questionsData.questions.length;

                    }

                } catch (error) {

                    console.error(
                        `Error loading questions for exam ${exam.id}:`,
                        error
                    );

                }

            }

        }


        if (totalQuestionsElement) {

            totalQuestionsElement.textContent =
                totalQuestions;

        }

    } catch (error) {

        console.error(
            "Error loading questions:",
            error
        );

    }


    /* ========================================
       TOTAL RESULTS
    ======================================== */

    try {

        const resultsResponse =
            await fetch(
                `${API_URL}/results`
            );


        const resultsData =
            await resultsResponse.json();


        if (
            resultsData.success &&
            Array.isArray(resultsData.results)
        ) {

            if (totalResultsElement) {

                totalResultsElement.textContent =
                    resultsData.results.length;

            }

        }

    } catch (error) {

        console.error(
            "Error loading results:",
            error
        );

    }


    /* ========================================
       TOTAL STUDENTS
       
       Temporary:
       Backend mein abhi users GET API
       nahi banayi hai.
       
       Isliye existing localStorage data
       fallback ke liye use kar rahe hain.
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


}


/* ========================================
   Initialize Dashboard
======================================== */

loadDashboardStatistics();