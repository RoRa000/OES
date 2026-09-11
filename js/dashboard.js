/* ========================================
   OES - Student Dashboard
   Backend Connected
======================================== */

const API_URL = "http://localhost:3000/api";


// ==========================================
// LOGIN PROTECTION
// ==========================================

const userRole = localStorage.getItem("oesUserRole");
const userEmail = localStorage.getItem("oesUserEmail");

if (userRole !== "student" || !userEmail) {
    window.location.href = "login.html";
}


// ==========================================
// LOAD DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    loadStudentDashboard();

});


// ==========================================
// MAIN DASHBOARD FUNCTION
// ==========================================

async function loadStudentDashboard() {

    try {

        // ------------------------------
        // GET LOGGED-IN STUDENT
        // ------------------------------

        const studentData =
            localStorage.getItem("oesStudent");

        let student = null;

        if (studentData) {

            try {
                student = JSON.parse(studentData);
            } catch (error) {
                console.error("Student data error:", error);
            }

        }

        // ------------------------------
        // DISPLAY STUDENT NAME
        // ------------------------------

        const studentName =
            student?.name || "Student";

        const nameElements = [
            document.getElementById("studentName"),
            document.getElementById("welcomeName")
        ];

        nameElements.forEach(function (element) {

            if (element) {
                element.textContent = studentName;
            }

        });


        // ------------------------------
        // LOAD EXAMS + RESULTS
        // ------------------------------

        await loadAvailableExams();

        await loadStudentResults();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// ==========================================
// LOAD AVAILABLE EXAMS
// ==========================================

async function loadAvailableExams() {

    try {

        const response = await fetch(
            `${API_URL}/exams/visible`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Failed to load exams:",
                data.message
            );

            showExamMessage(
                "Unable to load exams."
            );

            return;
        }

        const exams = data.exams || [];

        // Get question count for every exam
        const examsWithQuestions =
            await Promise.all(
                exams.map(async function (exam) {

                    try {

                        const questionResponse =
                            await fetch(
                                `${API_URL}/questions/exam/${exam.id}`
                            );

                        const questionData =
                            await questionResponse.json();

                        return {
                            ...exam,
                            questionCount:
                                questionData.success
                                    ? questionData.questions.length
                                    : 0
                        };

                    } catch (error) {

                        console.error(
                            "Question count error:",
                            error
                        );

                        return {
                            ...exam,
                            questionCount: 0
                        };

                    }

                })
            );


        displayExams(examsWithQuestions);

    } catch (error) {

        console.error(
            "Exam loading error:",
            error
        );

        showExamMessage(
            "Cannot connect to backend. Please make sure the OES server is running."
        );

    }

}


// ==========================================
// DISPLAY EXAMS
// ==========================================

function displayExams(exams) {

    const examContainer =
        document.getElementById("examContainer") ||
        document.getElementById("examList") ||
        document.querySelector(".exam-grid") ||
        document.querySelector(".exams-grid");

    if (!examContainer) {

        console.warn(
            "Exam container not found."
        );

        return;
    }

    examContainer.innerHTML = "";


    // ------------------------------
    // NO EXAMS
    // ------------------------------

    if (exams.length === 0) {

        examContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>

                <h3>No Exams Available</h3>

                <p>
                    Currently there are no exams available.
                    Please check again later.
                </p>
            </div>
        `;

        return;
    }


    // ------------------------------
    // CREATE EXAM CARDS
    // ------------------------------

    exams.forEach(function (exam) {

        const card =
            document.createElement("div");

        card.className = "exam-card";


        const questionCount =
            exam.questionCount || 0;

        const negativeMark =
            Number(exam.negative_mark || 0);


        card.innerHTML = `

            <div class="exam-card-header">

                <span class="exam-status">
                    ACTIVE
                </span>

            </div>


            <div class="exam-card-body">

                <h3>
                    ${escapeHTML(exam.name)}
                </h3>

                <p class="exam-category">
                    ${escapeHTML(exam.category || "General")}
                </p>


                <div class="exam-details">

                    <div class="exam-detail">

                        <span class="detail-icon">
                            📝
                        </span>

                        <span>
                            ${questionCount} Questions
                        </span>

                    </div>


                    <div class="exam-detail">

                        <span class="detail-icon">
                            ⏱️
                        </span>

                        <span>
                            ${exam.duration} Minutes
                        </span>

                    </div>


                    <div class="exam-detail">

                        <span class="detail-icon">
                            ❌
                        </span>

                        <span>
                            Negative:
                            ${negativeMark}
                        </span>

                    </div>

                </div>


                <a
                    href="exam.html?examId=${exam.id}"
                    class="btn btn-primary exam-start-btn"
                >
                    Start Exam
                </a>

            </div>
        `;


        examContainer.appendChild(card);

    });

}


// ==========================================
// LOAD STUDENT RESULTS
// ==========================================

async function loadStudentResults() {

    try {

        const studentData =
            localStorage.getItem("oesStudent");

        if (!studentData) {
            return;
        }

        const student =
            JSON.parse(studentData);

        if (!student.id) {

            console.warn(
                "Student ID not found."
            );

            return;
        }


        const response =
            await fetch(
                `${API_URL}/results/student/${student.id}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            console.error(
                "Result loading failed:",
                data.message
            );

            return;
        }


        const results =
            data.results || [];


        displayResults(results);

        updateStatistics(results);


    } catch (error) {

        console.error(
            "Result loading error:",
            error
        );

    }

}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayResults(results) {

    const resultContainer =
        document.getElementById("resultContainer") ||
        document.getElementById("resultList") ||
        document.querySelector(".result-list");


    if (!resultContainer) {
        return;
    }


    resultContainer.innerHTML = "";


    if (results.length === 0) {

        resultContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                <h3>
                    No Results Yet
                </h3>

                <p>
                    Complete an exam to see your result here.
                </p>

            </div>
        `;

        return;
    }


    results.forEach(function (result) {

        const resultCard =
            document.createElement("div");

        resultCard.className =
            "result-card";


        resultCard.innerHTML = `

            <div class="result-info">

                <h3>
                    ${escapeHTML(
                        result.exam_name || "Exam"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        result.category || "General"
                    )}
                </p>

            </div>


            <div class="result-score">

                <strong>
                    ${result.marks}
                </strong>

                <span>
                    Marks
                </span>

            </div>


            <div class="result-percentage">

                ${result.percentage}%

            </div>


            <div class="result-action">

                <a
                    href="result.html?resultId=${result.id}"
                    class="btn btn-secondary"
                >
                    View Result
                </a>

            </div>

        `;


        resultContainer.appendChild(
            resultCard
        );

    });

}


// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateStatistics(results) {

    const totalExams =
        results.length;


    let totalCorrect = 0;
    let totalWrong = 0;
    let totalMarks = 0;


    results.forEach(function (result) {

        totalCorrect +=
            Number(result.correct || 0);

        totalWrong +=
            Number(result.wrong || 0);

        totalMarks +=
            Number(result.marks || 0);

    });


    // ------------------------------
    // TOTAL EXAMS
    // ------------------------------

    setText(
        "totalExams",
        totalExams
    );


    setText(
        "examsCompleted",
        totalExams
    );


    // ------------------------------
    // CORRECT ANSWERS
    // ------------------------------

    setText(
        "totalCorrect",
        totalCorrect
    );


    // ------------------------------
    // WRONG ANSWERS
    // ------------------------------

    setText(
        "totalWrong",
        totalWrong
    );


    // ------------------------------
    // TOTAL MARKS
    // ------------------------------

    setText(
        "totalMarks",
        totalMarks.toFixed(2)
    );


    // ------------------------------
    // AVERAGE PERCENTAGE
    // ------------------------------

    let averagePercentage = 0;


    if (results.length > 0) {

        let percentageTotal = 0;

        results.forEach(function (result) {

            percentageTotal +=
                Number(result.percentage || 0);

        });


        averagePercentage =
            percentageTotal / results.length;

    }


    setText(
        "averagePercentage",
        averagePercentage.toFixed(2) + "%"
    );

}


// ==========================================
// HELPER: SET TEXT
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


// ==========================================
// HELPER: SHOW EXAM MESSAGE
// ==========================================

function showExamMessage(message) {

    const examContainer =
        document.getElementById("examContainer") ||
        document.getElementById("examList") ||
        document.querySelector(".exam-grid") ||
        document.querySelector(".exams-grid");

    if (!examContainer) {
        return;
    }


    examContainer.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                ${escapeHTML(message)}
            </h3>

        </div>

    `;

}


// ==========================================
// HELPER: ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// DEBUG
// ==========================================

console.log(
    "OES Dashboard Backend Connected"
);