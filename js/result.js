/* ========================================
   OES - Dynamic Exam Result
   LIVE BACKEND RESULT SYSTEM
======================================== */


/* ========================================
   API
======================================== */

const API_URL =
    "https://oes-nx6c.onrender.com/api";


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

    window.location.href =
        "login.html";

}


/* ========================================
   CURRENT STUDENT
======================================== */

let currentStudent = null;

try {

    currentStudent =
        JSON.parse(
            localStorage.getItem(
                "oesCurrentStudent"
            ) || "null"
        );

} catch (error) {

    console.error(
        "Unable to read current student:",
        error
    );

    currentStudent = null;

}


/* ========================================
   RESULT
======================================== */

let resultData = null;


/* ========================================
   REVIEW QUESTIONS
======================================== */

let reviewQuestions = [];


/* ========================================
   GET HTML ELEMENTS
======================================== */

const resultStatus =
    document.getElementById("resultStatus");

const resultExamName =
    document.getElementById("resultExamName");

const marksObtained =
    document.getElementById("marksObtained");

const scoreTotal =
    document.getElementById("scoreTotal");

const totalQuestionsElement =
    document.getElementById("totalQuestions");

const attemptedQuestions =
    document.getElementById("attemptedQuestions");

const correctAnswers =
    document.getElementById("correctAnswers");

const wrongAnswers =
    document.getElementById("wrongAnswers");

const percentage =
    document.getElementById("percentage");

const percentageCenter =
    document.getElementById("percentageCenter");

const chartCorrect =
    document.getElementById("chartCorrect");

const chartWrong =
    document.getElementById("chartWrong");

const chartSkipped =
    document.getElementById("chartSkipped");

const tableTotal =
    document.getElementById("tableTotal");

const tableAttempted =
    document.getElementById("tableAttempted");

const tableCorrect =
    document.getElementById("tableCorrect");

const tableWrong =
    document.getElementById("tableWrong");

const tableSkipped =
    document.getElementById("tableSkipped");

const tablePercentage =
    document.getElementById("tablePercentage");

const tableStatus =
    document.getElementById("tableStatus");

const reviewBtn =
    document.getElementById("reviewBtn");

const answerReview =
    document.getElementById("answerReview");

const reviewContainer =
    document.getElementById("reviewContainer");


/* ========================================
   LOAD RESULT
======================================== */

async function loadResult() {

    try {

        console.log(
            "OES Result: Loading student result..."
        );


        /* ========================================
           CHECK STUDENT ID
        ======================================== */

        if (
            !currentStudent ||
            !currentStudent.id
        ) {

            console.error(
                "Current student ID is missing."
            );

            loadLocalResult();

            displayResult();

            return;

        }


        const studentId =
            Number(
                currentStudent.id
            );


        console.log(
            "Loading results for student ID:",
            studentId
        );


        /* ========================================
           GET STUDENT RESULTS
        ======================================== */

        const response =
            await fetch(
                `${API_URL}/results/student/${studentId}`
            );


        const data =
            await response.json();


        console.log(
            "Student result list:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load student result."
            );

        }


        const results =
            Array.isArray(data.results)
                ? data.results
                : [];


        /* ========================================
           NO RESULT
        ======================================== */

        if (
            results.length === 0
        ) {

            console.log(
                "No result found for this student."
            );

            loadLocalResult();

            displayResult();

            return;

        }


        /* ========================================
           LATEST RESULT
        ======================================== */

        results.sort(
            function (a, b) {

                return (
                    Number(b.id || 0) -
                    Number(a.id || 0)
                );

            }
        );


        const latestResult =
            results[0];


        console.log(
            "Latest result:",
            latestResult
        );


        /* ========================================
           GET COMPLETE RESULT
           INCLUDING ANSWERS
        ======================================== */

        let detailedResult = null;


        if (latestResult.id) {

            try {

                const detailResponse =
                    await fetch(
                        `${API_URL}/results/${latestResult.id}`
                    );


                const detailData =
                    await detailResponse.json();


                console.log(
                    "Detailed result:",
                    detailData
                );


                if (
                    detailResponse.ok &&
                    detailData.success &&
                    detailData.result
                ) {

                    /*
                     * FIX:
                     * Backend sends the complete result
                     * inside detailData.result.
                     */
                    detailedResult =
                        detailData.result;

                }

            } catch (detailError) {

                console.error(
                    "Detailed result error:",
                    detailError
                );

            }

        }


        /* ========================================
           CREATE FRONTEND RESULT
        ======================================== */

        resultData = {

            id:
                latestResult.id,


            studentId:
                Number(
                    latestResult.user_id ||
                    currentStudent.id
                ),


            examId:
                Number(
                    latestResult.exam_id
                ),


            examName:
                latestResult.exam_name ||
                "Examination",


            totalQuestions:
                Number(
                    latestResult.total_questions
                ) || 0,


            attempted:
                Number(
                    latestResult.attempted
                ) || 0,


            correct:
                Number(
                    latestResult.correct
                ) || 0,


            wrong:
                Number(
                    latestResult.wrong
                ) || 0,


            marks:
                Number(
                    latestResult.marks
                ) || 0,


            percentage:
                Number(
                    latestResult.percentage
                ) || 0,


            submittedAt:
                latestResult.submitted_at ||
                null,


            answers:
                [],


            questions:
                []

        };


        /* ========================================
           BUILD ANSWERS + QUESTIONS
        ======================================== */

        if (
            detailedResult &&
            Array.isArray(
                detailedResult.answers
            )
        ) {

            const answers =
                detailedResult.answers;


            resultData.answers =
                answers.map(
                    function (answer) {

                        if (
                            answer.selected_answer ===
                            null ||
                            answer.selected_answer ===
                            undefined
                        ) {

                            return null;

                        }

                        return Number(
                            answer.selected_answer
                        );

                    }
                );


            resultData.questions =
                answers.map(
                    function (answer) {

                        return {

                            id:
                                answer.question_id,


                            question:
                                answer.question ||
                                "",


                            options: [

                                answer.option_a ||
                                "",

                                answer.option_b ||
                                "",

                                answer.option_c ||
                                "",

                                answer.option_d ||
                                ""

                            ],


                            correctAnswer:
                                Number(
                                    answer.correct_answer
                                )

                        };

                    }
                );


            console.log(
                "Answer review loaded:",
                resultData.questions
            );

        }


        /* ========================================
           SAVE RESULT LOCALLY
        ======================================== */

        localStorage.setItem(
            "oesLatestResult",
            JSON.stringify(resultData)
        );


        /* ========================================
           DISPLAY
        ======================================== */

        displayResult();


        console.log(
            "OES Final Result:",
            resultData
        );


    } catch (error) {

        console.error(
            "Error loading result:",
            error
        );


        loadLocalResult();


        displayResult();

    }

}


/* ========================================
   LOCAL RESULT FALLBACK
======================================== */

function loadLocalResult() {

    try {

        const savedResult =
            localStorage.getItem(
                "oesLatestResult"
            );


        if (savedResult) {

            resultData =
                JSON.parse(
                    savedResult
                );

        } else {

            resultData = null;

        }

    } catch (error) {

        console.error(
            "Error reading local result:",
            error
        );

        resultData = null;

    }

}


/* ========================================
   BUILD REVIEW QUESTIONS
======================================== */

function buildReviewQuestions() {

    reviewQuestions = [];


    if (
        resultData &&
        Array.isArray(
            resultData.questions
        ) &&
        resultData.questions.length > 0
    ) {

        reviewQuestions =
            resultData.questions.map(
                function (question) {

                    return {

                        id:
                            question.id ||
                            null,


                        question:
                            question.question ||
                            "",


                        options:
                            Array.isArray(
                                question.options
                            )
                                ? question.options
                                : [],


                        correctAnswer:
                            Number(
                                question.correctAnswer
                            )

                    };

                }
            );


        return;

    }


    console.warn(
        "No question data available for review."
    );

}


/* ========================================
   NO RESULT
======================================== */

function showNoResult() {

    if (resultStatus) {

        resultStatus.textContent =
            "NO RESULT AVAILABLE";

    }


    if (resultExamName) {

        resultExamName.textContent =
            "No examination result is available for this student yet.";

    }


    if (marksObtained) {

        marksObtained.textContent =
            "0";

    }


    if (scoreTotal) {

        scoreTotal.textContent =
            "0";

    }


    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            "0";

    }


    if (attemptedQuestions) {

        attemptedQuestions.textContent =
            "0";

    }


    if (correctAnswers) {

        correctAnswers.textContent =
            "0";

    }


    if (wrongAnswers) {

        wrongAnswers.textContent =
            "0";

    }


    if (percentage) {

        percentage.textContent =
            "0%";

    }


    if (percentageCenter) {

        percentageCenter.textContent =
            "0%";

    }


    if (chartCorrect) {

        chartCorrect.textContent =
            "0";

    }


    if (chartWrong) {

        chartWrong.textContent =
            "0";

    }


    if (chartSkipped) {

        chartSkipped.textContent =
            "0";

    }


    if (tableTotal) {

        tableTotal.textContent =
            "0";

    }


    if (tableAttempted) {

        tableAttempted.textContent =
            "0";

    }


    if (tableCorrect) {

        tableCorrect.textContent =
            "0";

    }


    if (tableWrong) {

        tableWrong.textContent =
            "0";

    }


    if (tableSkipped) {

        tableSkipped.textContent =
            "0";

    }


    if (tablePercentage) {

        tablePercentage.textContent =
            "0%";

    }


    if (tableStatus) {

        tableStatus.textContent =
            "-";

    }

}


/* ========================================
   DISPLAY RESULT
======================================== */

function displayResult() {

    if (!resultData) {

        showNoResult();

        return;

    }


    const total =
        Number(
            resultData.totalQuestions
        ) || 0;


    const attempted =
        Number(
            resultData.attempted
        ) || 0;


    const correct =
        Number(
            resultData.correct
        ) || 0;


    const wrong =
        Number(
            resultData.wrong
        ) || 0;


    const skipped =
        Math.max(
            total - attempted,
            0
        );


    const marks =
        Number(
            resultData.marks
        ) || 0;


    const percentageValue =
        Number(
            resultData.percentage
        ) || 0;


    /* ========================================
       EXAM NAME
    ======================================== */

    if (resultExamName) {

        resultExamName.textContent =
            `Here is your complete performance analysis for ${
                resultData.examName ||
                "Examination"
            }.`;

    }


    /* ========================================
       STATUS
    ======================================== */

    const passed =
        percentageValue >= 40;


    if (resultStatus) {

        resultStatus.textContent =
            passed
                ? "PASS"
                : "FAIL";


        resultStatus.style.color =
            passed
                ? "#34d399"
                : "#f87171";

    }


    /* ========================================
       SCORE
    ======================================== */

    if (marksObtained) {

        marksObtained.textContent =
            marks.toFixed(2);

    }


    if (scoreTotal) {

        scoreTotal.textContent =
            total;

    }


    /* ========================================
       STATISTICS
======================================== */

    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            total;

    }


    if (attemptedQuestions) {

        attemptedQuestions.textContent =
            attempted;

    }


    if (correctAnswers) {

        correctAnswers.textContent =
            correct;

    }


    if (wrongAnswers) {

        wrongAnswers.textContent =
            wrong;

    }


    if (percentage) {

        percentage.textContent =
            percentageValue.toFixed(2) +
            "%";

    }


    if (percentageCenter) {

        percentageCenter.textContent =
            percentageValue.toFixed(1) +
            "%";

    }


    /* ========================================
       CHART
    ======================================== */

    if (chartCorrect) {

        chartCorrect.textContent =
            correct;

    }


    if (chartWrong) {

        chartWrong.textContent =
            wrong;

    }


    if (chartSkipped) {

        chartSkipped.textContent =
            skipped;

    }


    createPieChart(
        correct,
        wrong,
        skipped
    );


    /* ========================================
       TABLE
    ======================================== */

    if (tableTotal) {

        tableTotal.textContent =
            total;

    }


    if (tableAttempted) {

        tableAttempted.textContent =
            attempted;

    }


    if (tableCorrect) {

        tableCorrect.textContent =
            correct;

    }


    if (tableWrong) {

        tableWrong.textContent =
            wrong;

    }


    if (tableSkipped) {

        tableSkipped.textContent =
            skipped;

    }


    if (tablePercentage) {

        tablePercentage.textContent =
            percentageValue.toFixed(2) +
            "%";

    }


    if (tableStatus) {

        tableStatus.textContent =
            passed
                ? "PASS"
                : "FAIL";


        tableStatus.className =
            passed
                ? "success-text"
                : "danger-text";

    }


    /* ========================================
       ANSWER REVIEW
    ======================================== */

    buildReviewQuestions();

    createAnswerReview();

}


/* ========================================
   PIE CHART
======================================== */

let resultChart = null;


function createPieChart(
    correct,
    wrong,
    skipped
) {

    const canvas =
        document.getElementById(
            "resultPieChart"
        );


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js was not loaded."
        );

        return;

    }


    if (resultChart) {

        resultChart.destroy();

    }


    resultChart =
        new Chart(
            canvas,
            {

                type: "doughnut",


                data: {

                    labels: [
                        "Correct",
                        "Wrong",
                        "Skipped"
                    ],


                    datasets: [

                        {

                            data: [
                                correct,
                                wrong,
                                skipped
                            ],


                            backgroundColor: [
                                "#34d399",
                                "#ef4444",
                                "#475569"
                            ],


                            borderColor:
                                "#0d1210",


                            borderWidth: 4,


                            hoverOffset: 7

                        }

                    ]

                },


                options: {

                    responsive: true,


                    maintainAspectRatio:
                        false,


                    cutout: "70%",


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            context.label +
                                            ": " +
                                            context.raw
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* ========================================
   ANSWER REVIEW
======================================== */

function createAnswerReview() {

    if (!reviewContainer) {

        return;

    }


    reviewContainer.innerHTML = "";


    if (
        !Array.isArray(
            reviewQuestions
        ) ||
        reviewQuestions.length === 0
    ) {

        reviewContainer.innerHTML = `

            <div class="empty-results">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    Answer Review Not Available
                </h3>

                <p>
                    Question-wise answer data is
                    not available for this result.
                </p>

            </div>

        `;

        return;

    }


    const answers =
        Array.isArray(
            resultData.answers
        )
            ? resultData.answers
            : [];


    reviewQuestions.forEach(
        function (
            question,
            index
        ) {


            const studentAnswer =
                answers[index];


            const correctAnswer =
                Number(
                    question.correctAnswer
                );


            let answerText =
                "Not Attempted";


            if (
                studentAnswer !== null &&
                studentAnswer !== undefined &&
                question.options[
                    Number(studentAnswer)
                ] !== undefined
            ) {

                answerText =
                    question.options[
                        Number(studentAnswer)
                    ];

            }


            let correctText =
                "Not Available";


            if (
                question.options[
                    correctAnswer
                ] !== undefined
            ) {

                correctText =
                    question.options[
                        correctAnswer
                    ];

            }


            let statusText =
                "Not Attempted";


            if (
                studentAnswer === null ||
                studentAnswer === undefined
            ) {

                statusText =
                    "Not Attempted";

            } else if (
                Number(studentAnswer) ===
                correctAnswer
            ) {

                statusText =
                    "Correct";

            } else {

                statusText =
                    "Wrong";

            }


            const reviewCard =
                document.createElement(
                    "div"
                );


            reviewCard.className =
                "review-question-card";


            reviewCard.innerHTML = `

                <div class="review-question-header">

                    <strong>
                        Question ${index + 1}
                    </strong>

                    <span>
                        ${escapeHtml(
                            statusText
                        )}
                    </span>

                </div>


                <h3>
                    ${escapeHtml(
                        question.question
                    )}
                </h3>


                <p>

                    <strong>
                        Your Answer:
                    </strong>

                    ${escapeHtml(
                        answerText
                    )}

                </p>


                <p>

                    <strong>
                        Correct Answer:
                    </strong>

                    ${escapeHtml(
                        correctText
                    )}

                </p>

            `;


            reviewContainer.appendChild(
                reviewCard
            );

        }
    );

}


/* ========================================
   HTML SAFETY
======================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ========================================
   REVIEW BUTTON
======================================== */

if (reviewBtn) {

    reviewBtn.addEventListener(
        "click",
        function () {

            if (
                answerReview &&
                answerReview.style.display ===
                "none"
            ) {

                answerReview.style.display =
                    "block";


                reviewBtn.textContent =
                    "Hide Answers";


                answerReview.scrollIntoView({
                    behavior: "smooth"
                });

            } else if (answerReview) {

                answerReview.style.display =
                    "none";


                reviewBtn.textContent =
                    "Review Answers";

            }

        }
    );

}


/* ========================================
   INITIALIZE
======================================== */

loadResult();