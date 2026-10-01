/* ========================================
   OES - Exam Management
   Connected to LIVE Render Backend
======================================== */


/* ========================================
   API URL
======================================== */

const API_URL =
    "https://oes-nx6c.onrender.com/api";


/* ========================================
   ADMIN SECURITY
======================================== */

const userRole =
    localStorage.getItem("oesUserRole");

const userEmail =
    localStorage.getItem("oesUserEmail");


if (
    userRole !== "admin" ||
    !userEmail
) {
    window.location.href = "login.html";
}


/* ========================================
   HTML ELEMENTS
======================================== */

const examForm =
    document.getElementById("examForm");

const examList =
    document.getElementById("examList");

const examCount =
    document.getElementById("examCount");

const examMessage =
    document.getElementById("examMessage");

const examSubjects =
    document.getElementById("examSubjects");


/* ========================================
   EXAMS
======================================== */

let exams = [];


/* ========================================
   SUBJECTS
   Kept from existing frontend system
======================================== */

let subjects = [];

try {

    const savedSubjects =
        localStorage.getItem("oesSubjects");

    if (savedSubjects) {

        const parsedSubjects =
            JSON.parse(savedSubjects);

        if (Array.isArray(parsedSubjects)) {
            subjects = parsedSubjects;
        }

    }

} catch (error) {

    console.error(
        "Error loading subjects:",
        error
    );

    subjects = [];

}


/* ========================================
   LOAD EXAMS FROM BACKEND
======================================== */

async function loadExams() {

    if (examList) {

        examList.innerHTML = `
            <div class="empty-results">
                <div class="empty-icon">
                    ⏳
                </div>

                <h3>
                    Loading Examinations...
                </h3>

                <p>
                    Please wait.
                </p>
            </div>
        `;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/exams`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load examinations."
            );

        }


        exams =
            Array.isArray(data.exams)
                ? data.exams
                : [];


        /* Load question counts */

        await loadQuestionCounts();


        displayExams();


        console.log(
            "OES Exams loaded from LIVE Backend:",
            exams
        );

    } catch (error) {

        console.error(
            "Error loading exams:",
            error
        );


        exams = [];


        if (examList) {

            examList.innerHTML = `
                <div class="empty-results">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Examinations
                    </h3>

                    <p>
                        Please check your backend connection.
                    </p>

                </div>
            `;

        }

    }

}


/* ========================================
   LOAD QUESTION COUNTS
======================================== */

async function loadQuestionCounts() {

    for (
        const exam of exams
    ) {

        try {

            const response =
                await fetch(
                    `${API_URL}/questions/exam/${exam.id}`
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.success &&
                Array.isArray(data.questions)
            ) {

                exam.questionCount =
                    data.questions.length;

            } else {

                exam.questionCount = 0;

            }

        } catch (error) {

            console.error(
                `Error loading questions for exam ${exam.id}:`,
                error
            );

            exam.questionCount = 0;

        }

    }

}


/* ========================================
   DISPLAY SUBJECT CHECKBOXES
======================================== */

function displaySubjectOptions() {

    if (!examSubjects) {
        return;
    }


    examSubjects.innerHTML = "";


    /* No Subjects */

    if (subjects.length === 0) {

        examSubjects.innerHTML = `

            <div
                style="
                    padding: 15px;
                    border-radius: 8px;
                    background: #fff7ed;
                    color: #c2410c;
                "
            >

                No subjects available.

                <br>

                You can still create an examination.

                <br>

                Subjects can be added through
                Question Management.

            </div>

        `;

        return;
    }


    /* Display Subjects */

    subjects.forEach(function (subject) {

        if (
            !subject ||
            !subject.name
        ) {
            return;
        }


        const questionCount =
            Array.isArray(subject.questions)
                ? subject.questions.length
                : 0;


        const label =
            document.createElement("label");


        label.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            cursor: pointer;
            background: #ffffff;
        `;


        label.innerHTML = `

            <input
                type="checkbox"
                class="exam-subject-checkbox"
                value="${subject.id}"
                data-name="${escapeHTML(subject.name)}"
                style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                "
            >

            <span>

                <strong>
                    ${escapeHTML(subject.name)}
                </strong>

                <small
                    style="
                        display: block;
                        color: #777;
                        margin-top: 3px;
                    "
                >
                    ${questionCount} question(s)
                </small>

            </span>

        `;


        examSubjects.appendChild(label);

    });

}


/* ========================================
   GET SELECTED SUBJECTS
======================================== */

function getSelectedSubjects() {

    const checkboxes =
        document.querySelectorAll(
            ".exam-subject-checkbox:checked"
        );


    const selectedSubjects = [];


    checkboxes.forEach(function (checkbox) {

        selectedSubjects.push({

            id: Number(
                checkbox.value
            ),

            name:
                checkbox.dataset.name

        });

    });


    return selectedSubjects;

}


/* ========================================
   DISPLAY EXAMS
======================================== */

function displayExams() {

    if (!examList) {
        return;
    }


    examList.innerHTML = "";


    if (examCount) {

        examCount.textContent =
            exams.length;

    }


    /* No Exams */

    if (exams.length === 0) {

        examList.innerHTML = `

            <div class="empty-results">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No Examinations Available
                </h3>

                <p>
                    Create a new examination
                    using the form above.
                </p>

            </div>

        `;

        return;
    }


    /* Display Exams */

    exams.forEach(function (exam) {

        const examCard =
            document.createElement("div");


        examCard.className =
            "exam-card";


        const questionCount =
            Number(
                exam.questionCount || 0
            );


        const visible =
            Number(
                exam.is_visible
            ) === 1;


        const status =
            exam.status ||
            "ACTIVE";


        let category =
            exam.category ||
            "General";


        if (
            Array.isArray(exam.subjects) &&
            exam.subjects.length > 0
        ) {

            category =
                exam.subjects
                    .map(
                        subject =>
                            subject.name
                    )
                    .join(", ");

        }


        examCard.innerHTML = `

            <div class="exam-card-top">

                <div class="exam-small-icon">
                    📝
                </div>

                <span class="exam-status">
                    ${escapeHTML(status)}
                </span>

            </div>


            <h3>
                ${escapeHTML(exam.name)}
            </h3>


            <p class="exam-category">

                Category:
                ${escapeHTML(category)}

            </p>


            <div
                style="
                    margin: 10px 0 15px;
                    padding: 10px;
                    border-radius: 8px;
                    background: ${
                        visible
                            ? "#eaf8ef"
                            : "#fff7ed"
                    };
                    color: ${
                        visible
                            ? "#16803c"
                            : "#c2410c"
                    };
                "
            >

                ${
                    visible
                        ? "🟢 Visible to Students"
                        : "🔴 Hidden from Students"
                }

            </div>


            <div class="exam-details">

                <div>

                    <span>
                        Questions
                    </span>

                    <strong>
                        ${questionCount}
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
                        ${exam.negative_mark ?? 0}
                    </strong>

                </div>

            </div>


            <div
                style="
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 20px;
                "
            >

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="toggleExamVisibility(${exam.id}, ${visible})"
                >

                    ${
                        visible
                            ? "Hide from Students"
                            : "Show to Students"
                    }

                </button>


                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="deleteExam(${exam.id})"
                >

                    Delete Examination

                </button>

            </div>

        `;


        examList.appendChild(
            examCard
        );

    });

}


/* ========================================
   CREATE EXAM
======================================== */

if (examForm) {

    examForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* Exam Name */

            const name =
                document
                    .getElementById("examName")
                    .value
                    .trim();


            /* Selected Subjects */

            const selectedSubjects =
                getSelectedSubjects();


            /* Questions */

            const questions =
                Number(
                    document
                        .getElementById(
                            "examQuestions"
                        )
                        .value
                );


            /* Duration */

            const duration =
                Number(
                    document
                        .getElementById(
                            "examDuration"
                        )
                        .value
                );


            /* Negative Marking */

            const negativeMark =
                Number(
                    document
                        .getElementById(
                            "negativeMark"
                        )
                        .value
                );


            /* ========================================
               VALIDATION
            ======================================== */

            if (!name) {

                showMessage(
                    "Please enter examination name.",
                    false
                );

                return;

            }


            if (
                questions < 1 ||
                duration < 1 ||
                negativeMark < 0
            ) {

                showMessage(
                    "Please enter valid examination values.",
                    false
                );

                return;

            }


            /* ========================================
               CATEGORY
            ======================================== */

            let category =
                "General";


            if (
                selectedSubjects.length > 0
            ) {

                category =
                    selectedSubjects
                        .map(
                            subject =>
                                subject.name
                        )
                        .join(", ");

            }


            /* ========================================
               CREATE EXAM DATA
            ======================================== */

            const examData = {

                name: name,

                category: category,

                duration: duration,

                negative_mark:
                    negativeMark,

                status: "ACTIVE",

                is_visible: 0

            };


            /* ========================================
               SEND TO BACKEND
            ======================================== */

            try {

                showMessage(
                    "Creating examination...",
                    true
                );


                const response =
                    await fetch(
                        `${API_URL}/exams`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    examData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to create examination."
                    );

                }


                /* ========================================
                   SUCCESS
                ======================================== */

                showMessage(
                    "Examination created successfully!",
                    true
                );


                /* Reset Form */

                examForm.reset();


                const questionInput =
                    document.getElementById(
                        "examQuestions"
                    );


                const durationInput =
                    document.getElementById(
                        "examDuration"
                    );


                const negativeInput =
                    document.getElementById(
                        "negativeMark"
                    );


                if (questionInput) {
                    questionInput.value = 5;
                }


                if (durationInput) {
                    durationInput.value = 10;
                }


                if (negativeInput) {
                    negativeInput.value = 0.25;
                }


                /* Reload Backend Exams */

                await loadExams();


            } catch (error) {

                console.error(
                    "Create exam error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to create examination.",
                    false
                );

            }

        }
    );

}


/* ========================================
   TOGGLE EXAM VISIBILITY
======================================== */

async function toggleExamVisibility(
    examId,
    currentlyVisible
) {

    try {

        const response =
            await fetch(
                `${API_URL}/exams/${examId}/visibility`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        is_visible:
                            currentlyVisible
                                ? 0
                                : 1

                    })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update exam visibility."
            );

        }


        showMessage(
            currentlyVisible
                ? "Examination hidden from students."
                : "Examination is now visible to students.",
            true
        );


        await loadExams();


    } catch (error) {

        console.error(
            "Visibility update error:",
            error
        );


        showMessage(
            "Unable to update examination visibility.",
            false
        );

    }

}


/* ========================================
   DELETE EXAM
======================================== */

async function deleteExam(
    examId
) {

    const exam =
        exams.find(function (item) {

            return Number(item.id) ===
                Number(examId);

        });


    if (!exam) {
        return;
    }


    const confirmation =
        confirm(
            `Are you sure you want to delete "${exam.name}"?`
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/exams/${examId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to delete examination."
            );

        }


        showMessage(
            "Examination deleted successfully.",
            true
        );


        await loadExams();


    } catch (error) {

        console.error(
            "Delete exam error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete examination.",
            false
        );

    }

}


/* ========================================
   SHOW MESSAGE
======================================== */

function showMessage(
    text,
    success
) {

    if (!examMessage) {
        return;
    }


    examMessage.style.display =
        "block";


    if (success) {

        examMessage.style.background =
            "#eaf8ef";

        examMessage.style.color =
            "#16803c";

    } else {

        examMessage.style.background =
            "#fff0f0";

        examMessage.style.color =
            "#d93025";

    }


    examMessage.textContent =
        text;


    setTimeout(function () {

        examMessage.style.display =
            "none";

    }, 2500);

}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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
   INITIALIZE
======================================== */

displaySubjectOptions();

loadExams();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Exam Management connected to LIVE Render Backend"
);