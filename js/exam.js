/* ========================================
   OES - Online Examination
   Dynamic Exam → Subjects → Questions
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
   GET CURRENT STUDENT
======================================== */

const currentStudent =
    JSON.parse(
        localStorage.getItem("oesCurrentStudent") || "null"
    );


/* ========================================
   GET SELECTED EXAM
======================================== */

let selectedExam = null;

try {

    const savedSelectedExam =
        localStorage.getItem("oesSelectedExam");

    if (savedSelectedExam) {

        selectedExam =
            JSON.parse(savedSelectedExam);

    }

} catch (error) {

    console.error(
        "Error loading selected exam:",
        error
    );

}


/* ========================================
   LOAD ALL EXAMS
======================================== */

let allExams = [];

try {

    const savedExams =
        localStorage.getItem("oesExams");

    if (savedExams) {

        const parsedExams =
            JSON.parse(savedExams);

        if (Array.isArray(parsedExams)) {

            allExams =
                parsedExams;

        }

    }

} catch (error) {

    console.error(
        "Error loading exams:",
        error
    );

}


/* ========================================
   FIND SELECTED EXAM
======================================== */

if (selectedExam && selectedExam.id) {

    const foundExam =
        allExams.find(function (exam) {

            return String(exam.id) ===
                String(selectedExam.id);

        });


    if (foundExam) {

        selectedExam =
            foundExam;

    }

}


/* ========================================
   URL FALLBACK
======================================== */

if (!selectedExam) {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const examId =
        urlParams.get("examId");


    if (examId) {

        selectedExam =
            allExams.find(function (exam) {

                return String(exam.id) ===
                    String(examId);

            }) || null;

    }

}


/* ========================================
   EXAM NOT FOUND
======================================== */

if (!selectedExam) {

    alert(
        "No examination selected. Please select an examination from the dashboard."
    );


    window.location.href =
        "dashboard.html";

}


/* ========================================
   LOAD SUBJECTS
======================================== */

let allSubjects = [];

try {

    const savedSubjects =
        localStorage.getItem("oesSubjects");

    if (savedSubjects) {

        const parsedSubjects =
            JSON.parse(savedSubjects);

        if (Array.isArray(parsedSubjects)) {

            allSubjects =
                parsedSubjects;

        }

    }

} catch (error) {

    console.error(
        "Error loading subjects:",
        error
    );

}


/* ========================================
   BUILD EXAM QUESTIONS
======================================== */

let questions = [];


/*
   Selected exam ke subjects ke andar
   stored questions collect karenge.
*/

if (
    selectedExam &&
    Array.isArray(selectedExam.subjects)
) {

    selectedExam.subjects.forEach(
        function (selectedSubject) {

            const subject =
                allSubjects.find(
                    function (item) {

                        return String(item.id) ===
                            String(selectedSubject.id);

                    }
                );


            if (
                subject &&
                Array.isArray(subject.questions)
            ) {

                subject.questions.forEach(
                    function (question) {

                        if (
                            question &&
                            question.question &&
                            Array.isArray(question.options) &&
                            question.options.length >= 4
                        ) {

                            questions.push({

                                id:
                                    question.id ||
                                    Date.now() +
                                    Math.random(),

                                subjectId:
                                    subject.id,

                                subjectName:
                                    subject.name,

                                question:
                                    question.question,

                                options:
                                    question.options,

                                correctAnswer:
                                    Number(
                                        question.correctAnswer
                                    )

                            });

                        }

                    }
                );

            }

        }
    );

}


/* ========================================
   REMOVE DUPLICATE QUESTIONS
======================================== */

const uniqueQuestions = [];

const questionKeys = new Set();


questions.forEach(
    function (question) {

        const key =
            String(question.question)
                .trim()
                .toLowerCase();


        if (!questionKeys.has(key)) {

            questionKeys.add(key);

            uniqueQuestions.push(
                question
            );

        }

    }
);


questions =
    uniqueQuestions;


/* ========================================
   SHUFFLE QUESTIONS
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
                Math.random() * (i + 1)
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


/*
   IMPORTANT:
   Yahi shuffled array test ke
   poore session mein use hoga.
*/

questions =
    shuffleArray(questions);


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
   NO QUESTIONS AVAILABLE
======================================== */

if (questions.length === 0) {

    alert(
        "No questions are available for this examination. Please ask the admin to add questions to the selected subject."
    );


    window.location.href =
        "dashboard.html";

}


/* ========================================
   EXAM VARIABLES
======================================== */

let currentQuestionIndex = 0;


let userAnswers =
    new Array(
        questions.length
    ).fill(null);


let timeLeft =
    (
        Number(
            selectedExam.duration
        ) || 10
    ) * 60;


let timerInterval;


let examSubmitted =
    false;


/* ========================================
   GET HTML ELEMENTS
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
   INITIALIZE EXAM
======================================== */

if (questionTextElement) {

    updateExamHeader();


    totalQuestionsElement.textContent =
        questions.length;


    renderQuestion();


    renderQuestionPalette();


    updateProgress();


    startTimer();

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
                    ] =
                        index;


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
   CALCULATE & SAVE RESULT
======================================== */

function submitExam() {

    if (examSubmitted) {
        return;
    }


    examSubmitted =
        true;


    clearInterval(
        timerInterval
    );


    let correctAnswers =
        0;


    let wrongAnswers =
        0;


    /* ========================================
       CHECK ANSWERS
    ======================================== */

    userAnswers.forEach(
        function (answer, index) {

            if (answer === null) {
                return;
            }


            if (
                answer ===
                questions[index].correctAnswer
            ) {

                correctAnswers++;

            } else {

                wrongAnswers++;

            }

        }
    );


    const attempted =
        correctAnswers +
        wrongAnswers;


    /* ========================================
       NEGATIVE MARKING
    ======================================== */

    const negativeMark =
        Number(
            selectedExam.negativeMark
        ) || 0;


    const marks =
        correctAnswers -
        (
            wrongAnswers *
            negativeMark
        );


    const percentage =
        Math.max(
            0,
            (
                marks /
                questions.length
            ) * 100
        );


    /* ========================================
       STUDENT INFORMATION
    ======================================== */

    const studentName =
        currentStudent &&
        currentStudent.fullName
            ? currentStudent.fullName
            : "Unknown Student";


    const studentEmail =
        currentStudent &&
        currentStudent.email
            ? currentStudent.email
            : userEmail;


    /* ========================================
       IMPORTANT:
       SAVE EXACT SHUFFLED QUESTION ORDER
    ======================================== */

    const questionSnapshot =
        questions.map(
            function (question) {

                return {

                    id:
                        question.id,

                    subjectId:
                        question.subjectId,

                    subjectName:
                        question.subjectName,

                    question:
                        question.question,

                    options:
                        Array.isArray(
                            question.options
                        )
                            ? [
                                ...question.options
                            ]
                            : [],

                    correctAnswer:
                        Number(
                            question.correctAnswer
                        )

                };

            }
        );


    /*
       IMPORTANT:
       userAnswers aur questionSnapshot
       dono same index/order mein hain.

       Example:

       questions[0] → userAnswers[0]
       questions[1] → userAnswers[1]
       questions[2] → userAnswers[2]

       Isliye review mein exact same
       shuffled sequence milega.
    */


/* ========================================
   CREATE RESULT
======================================== */

    const result = {

        studentId:
            currentStudent &&
            currentStudent.id
                ? currentStudent.id
                : null,


        studentName:
            studentName,


        studentEmail:
            studentEmail,


        examId:
            selectedExam.id,


        examName:
            selectedExam.name,


        totalQuestions:
            questions.length,


        attempted:
            attempted,


        correct:
            correctAnswers,


        wrong:
            wrongAnswers,


        marks:
            marks,


        percentage:
            percentage,


        negativeMark:
            negativeMark,


        /*
           Student ke answers
           shuffled question order ke according
        */

        answers:
            [
                ...userAnswers
            ],


        /*
           VERY IMPORTANT:
           Test mein jo shuffled questions
           actually aaye the unka snapshot.
        */

        questions:
            questionSnapshot,


        submittedAt:
            new Date().toISOString()

    };


    /* ========================================
       SAVE LATEST RESULT
    ======================================== */

    localStorage.setItem(
        "oesLatestResult",
        JSON.stringify(result)
    );


    /* ========================================
       GET RESULT HISTORY
    ======================================== */

    let allResults = [];


    const savedResults =
        localStorage.getItem(
            "oesResults"
        );


    if (savedResults) {

        try {

            const parsedResults =
                JSON.parse(
                    savedResults
                );


            if (
                Array.isArray(
                    parsedResults
                )
            ) {

                allResults =
                    parsedResults;

            }

        } catch (error) {

            console.error(
                "Could not read result history:",
                error
            );


            allResults = [];

        }

    }


    /* ========================================
       ADD RESULT
    ======================================== */

    allResults.push(
        result
    );


    /* ========================================
       SAVE RESULT HISTORY
    ======================================== */

    localStorage.setItem(
        "oesResults",
        JSON.stringify(
            allResults
        )
    );


    /* ========================================
       DEBUG
    ======================================== */

    console.log(
        "OES EXACT SHUFFLED QUESTIONS:",
        questionSnapshot
    );


    console.log(
        "OES EXACT USER ANSWERS:",
        userAnswers
    );


    console.log(
        "OES FINAL RESULT:",
        result
    );


    /* ========================================
       OPEN RESULT PAGE
    ======================================== */

    window.location.href =
        "result.html";

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
   DEBUG INFORMATION
======================================== */

console.log(
    "OES Selected Exam:",
    selectedExam
);


console.log(
    "OES Available Subjects:",
    allSubjects
);


console.log(
    "OES FINAL SHUFFLED EXAM QUESTIONS:",
    questions
);