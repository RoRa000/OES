/* ========================================
   OES - Dynamic Exam Result
   IMPORTANT:
   Review Answers uses the EXACT shuffled
   question order saved during submission.
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

    window.location.href =
        "login.html";

}


/* ========================================
   GET RESULT
======================================== */

let resultData = null;


try {

    const savedResult =
        localStorage.getItem(
            "oesLatestResult"
        );


    if (savedResult) {

        resultData =
            JSON.parse(savedResult);

    }

} catch (error) {

    console.error(
        "Error reading result:",
        error
    );

}


/* ========================================
   GET HTML ELEMENTS
======================================== */

const resultStatus =
    document.getElementById(
        "resultStatus"
    );


const resultExamName =
    document.getElementById(
        "resultExamName"
    );


const marksObtained =
    document.getElementById(
        "marksObtained"
    );


const scoreTotal =
    document.getElementById(
        "scoreTotal"
    );


const totalQuestionsElement =
    document.getElementById(
        "totalQuestions"
    );


const attemptedQuestions =
    document.getElementById(
        "attemptedQuestions"
    );


const correctAnswers =
    document.getElementById(
        "correctAnswers"
    );


const wrongAnswers =
    document.getElementById(
        "wrongAnswers"
    );


const percentage =
    document.getElementById(
        "percentage"
    );


const percentageCenter =
    document.getElementById(
        "percentageCenter"
    );


const chartCorrect =
    document.getElementById(
        "chartCorrect"
    );


const chartWrong =
    document.getElementById(
        "chartWrong"
    );


const chartSkipped =
    document.getElementById(
        "chartSkipped"
    );


const tableTotal =
    document.getElementById(
        "tableTotal"
    );


const tableAttempted =
    document.getElementById(
        "tableAttempted"
    );


const tableCorrect =
    document.getElementById(
        "tableCorrect"
    );


const tableWrong =
    document.getElementById(
        "tableWrong"
    );


const tableSkipped =
    document.getElementById(
        "tableSkipped"
    );


const tablePercentage =
    document.getElementById(
        "tablePercentage"
    );


const tableStatus =
    document.getElementById(
        "tableStatus"
    );


const reviewBtn =
    document.getElementById(
        "reviewBtn"
    );


const answerReview =
    document.getElementById(
        "answerReview"
    );


const reviewContainer =
    document.getElementById(
        "reviewContainer"
    );


/* ========================================
   REVIEW QUESTIONS
======================================== */

let reviewQuestions = [];


/* ========================================
   IMPORTANT:
   DO NOT LOAD QUESTIONS FROM OES SUBJECTS
   FIRST.

   The exact shuffled questions that the
   student actually received are stored
   inside resultData.questions.

   That array has the SAME order as
   resultData.answers.
======================================== */

function buildReviewQuestions() {

    reviewQuestions = [];


    /* ------------------------------------
       FIRST PRIORITY:
       Exact question snapshot from exam
    ------------------------------------ */

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

                        subjectId:
                            question.subjectId ||
                            null,

                        subjectName:
                            question.subjectName ||
                            "",

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


        console.log(
            "Review questions loaded from submitted shuffled snapshot:",
            reviewQuestions
        );


        return;

    }


    /* ------------------------------------
       OLD RESULT SUPPORT

       Agar result purana hai aur usme
       questions snapshot nahi hai, to
       review unavailable rahega.

       IMPORTANT:
       Hum yaha questions ko rebuild karke
       wrong order nahi dikhayenge.
    ------------------------------------ */

    console.warn(
        "Exact shuffled question snapshot is not available for this result."
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

}


/* ========================================
   DISPLAY RESULT
======================================== */

function displayResult() {

    if (!resultData) {

        showNoResult();

        return;

    }


    /* ------------------------------------
       RESULT DATA
    ------------------------------------ */

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
       RESULT STATUS
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
       PERFORMANCE TABLE
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
       BUILD EXACT SHUFFLED QUESTIONS
    ======================================== */

    buildReviewQuestions();


    /* ========================================
       CREATE ANSWER REVIEW
    ======================================== */

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


    /* ------------------------------------
       If exact question snapshot missing
    ------------------------------------ */

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
                    This result was created before
                    the shuffled question order was
                    saved. Please take the examination
                    again to get the correct shuffled
                    question order in review.
                </p>

            </div>

        `;

        return;

    }


    /* ========================================
       IMPORTANT:

       reviewQuestions[index]
       matches
       resultData.answers[index]

       EXACT SAME ORDER.
    ======================================== */

    reviewQuestions.forEach(
        function (
            question,
            index
        ) {

            const studentAnswer =
                resultData.answers[
                    index
                ];


            const correctAnswer =
                Number(
                    question.correctAnswer
                );


            let answerText =
                "Not Attempted";


            /* --------------------------------
               STUDENT ANSWER
            -------------------------------- */

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


            /* --------------------------------
               CORRECT ANSWER
            -------------------------------- */

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


            /* --------------------------------
               STATUS
            -------------------------------- */

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


            /* =================================
               REVIEW CARD
            ================================= */

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

displayResult();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Result:",
    resultData
);


console.log(
    "OES Exact Shuffled Review Questions:",
    reviewQuestions
);