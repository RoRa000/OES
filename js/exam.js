/* ========================================
   OES - ONLINE EXAMINATION SYSTEM
   LIVE BACKEND EXAM SYSTEM
======================================== */

const API_URL = "https://oes-nx6c.onrender.com/api";


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
   CURRENT STUDENT
======================================== */

const currentStudent =
    JSON.parse(
        localStorage.getItem("oesCurrentStudent") || "null"
    );


/* ========================================
   GET EXAM ID FROM URL
======================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const examId =
    urlParams.get("examId");


if (!examId) {

    alert(
        "No examination selected."
    );

    window.location.href =
        "dashboard.html";
}


/* ========================================
   EXAM VARIABLES
======================================== */

let selectedExam = null;
let questions = [];

let currentQuestionIndex = 0;

let userAnswers = [];

let timeLeft = 0;

let timerInterval = null;

let examSubmitted = false;


/* ========================================
   HTML ELEMENTS
======================================== */

const timerElement =
    document.getElementById("timer");

const currentQuestionElement =
    document.getElementById(
        "currentQuestion"
    );

const totalQuestionsElement =
    document.getElementById(
        "totalQuestions"
    );

const answeredCountElement =
    document.getElementById(
        "answeredCount"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );

const questionNumberElement =
    document.getElementById(
        "questionNumber"
    );

const questionTextElement =
    document.getElementById(
        "questionText"
    );

const optionsContainer =
    document.getElementById(
        "optionsContainer"
    );

const previousButton =
    document.getElementById(
        "previousBtn"
    );

const nextButton =
    document.getElementById(
        "nextBtn"
    );

const questionPalette =
    document.getElementById(
        "questionPalette"
    );

const submitExamButton =
    document.getElementById(
        "submitExamBtn"
    );


/* ========================================
   START EXAM
======================================== */

async function startExam() {

    try {

        console.log(
            "OES: Loading exam from LIVE backend..."
        );

        const examResponse =
            await fetch(
                `${API_URL}/exams/${examId}`
            );

        if (!examResponse.ok) {

            throw new Error(
                "Unable to load examination."
            );
        }

        const examData =
            await examResponse.json();

        selectedExam =
            examData.exam || examData.data || examData;


        if (
            !selectedExam ||
            !selectedExam.id
        ) {

            throw new Error(
                "Examination not found."
            );
        }


        console.log(
            "OES: Selected Exam:",
            selectedExam
        );


        /* ========================================
           LOAD QUESTIONS
        ======================================== */

        const questionResponse =
            await fetch(
                `${API_URL}/questions/exam/${examId}`
            );

        if (!questionResponse.ok) {

            throw new Error(
                "Unable to load questions."
            );
        }

        const questionData =
            await questionResponse.json();


        questions =
            questionData.questions ||
            questionData.data ||
            questionData ||
            [];


        if (!Array.isArray(questions)) {

            questions = [];
        }


        console.log(
            "OES: Questions from backend:",
            questions
        );


        /* ========================================
           FORMAT QUESTIONS
        ======================================== */

        questions =
            questions.map(
                function (question) {

                    return {

                        id:
                            question.id,

                        subject:
                            question.subject || "",

                        question:
                            question.question || "",

                        options: [

                            question.option_a || "",

                            question.option_b || "",

                            question.option_c || "",

                            question.option_d || ""

                        ],

                        correctAnswer:
                            Number(
                                question.correct_answer
                            ),

                        marks:
                            Number(
                                question.marks
                            ) || 1

                    };

                }
            );


        /* ========================================
           SHUFFLE QUESTIONS
        ======================================== */

        questions =
            shuffleArray(
                questions
            );


        /* ========================================
           QUESTION LIMIT
        ======================================== */

        const requestedQuestionCount =
            Number(
                selectedExam.questions
            ) || questions.length;


        if (
            questions.length >
            requestedQuestionCount
        ) {

            questions =
                questions.slice(
                    0,
                    requestedQuestionCount
                );

        }


        /* ========================================
           NO QUESTIONS
        ======================================== */

        if (
            questions.length === 0
        ) {

            alert(
                "No questions are available for this examination."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        /* ========================================
           CREATE ANSWER ARRAY
        ======================================== */

        userAnswers =
            new Array(
                questions.length
            ).fill(null);


        /* ========================================
           TIMER
        ======================================== */

        timeLeft =
            (
                Number(
                    selectedExam.duration
                ) || 10
            ) * 60;


        /* ========================================
           INITIALIZE UI
        ======================================== */

        updateExamHeader();

        totalQuestionsElement.textContent =
            questions.length;

        renderQuestion();

        renderQuestionPalette();

        updateProgress();

        startTimer();


    } catch (error) {

        console.error(
            "OES Exam Error:",
            error
        );

        alert(
            "Unable to load examination. Please try again."
        );

        window.location.href =
            "dashboard.html";
    }

}


/* ========================================
   SHUFFLE ARRAY
======================================== */

function shuffleArray(array) {

    const shuffled =
        [...array];


    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];

    }


    return shuffled;
}


/* ========================================
   UPDATE EXAM HEADER
======================================== */

function updateExamHeader() {

    const examHeading =
        document.querySelector(
            ".exam-header h1"
        );

    if (examHeading) {

        examHeading.textContent =
            selectedExam.name;

    }


    const examDescription =
        document.querySelector(
            ".exam-header p"
        );

    if (examDescription) {

        examDescription.textContent =
            `Answer all ${questions.length} questions and submit your examination before the timer ends.`;

    }

}


/* ========================================
   RENDER QUESTION
======================================== */

function renderQuestion() {

    const question =
        questions[
            currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    currentQuestionElement.textContent =
        currentQuestionIndex + 1;


    questionNumberElement.textContent =
        currentQuestionIndex + 1;


    questionTextElement.textContent =
        question.question;


    optionsContainer.innerHTML = "";


    question.options.forEach(
        function (option, index) {

            const optionLabel =
                document.createElement(
                    "label"
                );


            optionLabel.className =
                "option";


            optionLabel.innerHTML = `

                <input
                    type="radio"
                    name="answer"
                    value="${index}"
                    ${
                        userAnswers[
                            currentQuestionIndex
                        ] === index
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    ${escapeHtml(option)}
                </span>

            `;


            const radioButton =
                optionLabel.querySelector(
                    "input"
                );


            radioButton.addEventListener(
                "change",
                function () {

                    userAnswers[
                        currentQuestionIndex
                    ] = index;


                    updateProgress();

                    updateQuestionPalette();

                }
            );


            optionsContainer.appendChild(
                optionLabel
            );

        }
    );


    previousButton.disabled =
        currentQuestionIndex === 0;


    if (
        currentQuestionIndex ===
        questions.length - 1
    ) {

        nextButton.style.display =
            "none";

    } else {

        nextButton.style.display =
            "inline-block";

    }


    updateQuestionPalette();

    updateProgress();

}


/* ========================================
   NEXT QUESTION
======================================== */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentQuestionIndex <
                questions.length - 1
            ) {

                currentQuestionIndex++;

                renderQuestion();

            }

        }
    );

}


/* ========================================
   PREVIOUS QUESTION
======================================== */

if (previousButton) {

    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentQuestionIndex > 0
            ) {

                currentQuestionIndex--;

                renderQuestion();

            }

        }
    );

}


/* ========================================
   QUESTION PALETTE
======================================== */

function renderQuestionPalette() {

    if (!questionPalette) {
        return;
    }


    questionPalette.innerHTML = "";


    questions.forEach(
        function (_, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                index + 1;


            button.className =
                "palette-button";


            button.addEventListener(
                "click",
                function () {

                    currentQuestionIndex =
                        index;

                    renderQuestion();

                }
            );


            questionPalette.appendChild(
                button
            );

        }
    );


    updateQuestionPalette();

}


/* ========================================
   UPDATE QUESTION PALETTE
======================================== */

function updateQuestionPalette() {

    if (!questionPalette) {
        return;
    }


    const buttons =
        questionPalette.querySelectorAll(
            "button"
        );


    buttons.forEach(
        function (button, index) {

            button.classList.remove(
                "answered",
                "current",
                "unvisited"
            );


            if (
                index ===
                currentQuestionIndex
            ) {

                button.classList.add(
                    "current"
                );

            } else if (
                userAnswers[index] !==
                null
            ) {

                button.classList.add(
                    "answered"
                );

            } else {

                button.classList.add(
                    "unvisited"
                );

            }

        }
    );

}


/* ========================================
   UPDATE PROGRESS
======================================== */

function updateProgress() {

    const answeredQuestions =
        userAnswers.filter(
            function (answer) {

                return answer !== null;

            }
        ).length;


    if (answeredCountElement) {

        answeredCountElement.textContent =
            answeredQuestions;

    }


    const progressPercentage =
        questions.length > 0
            ? (
                answeredQuestions /
                questions.length
            ) * 100
            : 0;


    if (progressFill) {

        progressFill.style.width =
            progressPercentage + "%";

    }

}


/* ========================================
   TIMER
======================================== */

function startTimer() {

    updateTimerDisplay();


    timerInterval =
        setInterval(
            function () {

                timeLeft--;

                updateTimerDisplay();


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    alert(
                        "Time is over! Your examination will be submitted."
                    );


                    submitExam();

                }

            },
            1000
        );

}


/* ========================================
   UPDATE TIMER DISPLAY
======================================== */

function updateTimerDisplay() {

    if (!timerElement) {
        return;
    }


    const minutes =
        Math.floor(
            timeLeft / 60
        );


    const seconds =
        timeLeft % 60;


    timerElement.textContent =
        String(minutes).padStart(
            2,
            "0"
        ) +
        ":" +
        String(seconds).padStart(
            2,
            "0"
        );

}


/* ========================================
   SUBMIT BUTTON
======================================== */

if (submitExamButton) {

    submitExamButton.addEventListener(
        "click",
        function () {

            if (examSubmitted) {
                return;
            }


            const answeredQuestions =
                userAnswers.filter(
                    function (answer) {

                        return answer !== null;

                    }
                ).length;


            const confirmation =
                confirm(

                    `You have answered ${answeredQuestions} out of ${questions.length} questions.\n\nAre you sure you want to submit the examination?`

                );


            if (!confirmation) {
                return;
            }


            submitExam();

        }
    );

}


/* ========================================
   SUBMIT EXAM TO BACKEND
======================================== */

async function submitExam() {

    if (examSubmitted) {
        return;
    }


    examSubmitted = true;


    clearInterval(
        timerInterval
    );


    try {

        /* ========================================
           PREPARE ANSWERS FOR BACKEND
        ======================================== */

        const answers =
            questions.map(
                function (question, index) {

                    return {

                        question_id:
                            question.id,

                        selected_answer:
                            userAnswers[index]

                    };

                }
            );


        const payload = {

            user_id:
                currentStudent &&
                currentStudent.id
                    ? currentStudent.id
                    : null,

            exam_id:
                selectedExam.id,

            answers:
                answers

        };


        console.log(
            "OES: Sending result to backend:",
            payload
        );


        /* ========================================
           SEND RESULT
        ======================================== */

        const response =
            await fetch(
                `${API_URL}/results`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const data =
            await response.json();


        console.log(
            "OES: Backend result:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Result submission failed."
            );

        }


        /* ========================================
           SAVE LATEST RESULT LOCALLY
        ======================================== */

        const backendResult =
            data.result ||
            data.data ||
            data;


        localStorage.setItem(
            "oesLatestResult",
            JSON.stringify(
                backendResult
            )
        );


        /* ========================================
           OPEN RESULT PAGE
        ======================================== */

        window.location.href =
            "result.html";


    } catch (error) {

        console.error(
            "OES Result Error:",
            error
        );


        examSubmitted = false;


        alert(
            "Result submit nahi ho paya.\n\nPlease check your internet connection and try again."
        );

    }

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
   START
======================================== */

console.log(
    "OES Exam: Connected to LIVE Render Backend"
);


startExam();