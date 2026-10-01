/* ========================================
   OES - Subject & Question Management
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

const subjectForm =
    document.getElementById("subjectForm");

const subjectName =
    document.getElementById("subjectName");

const subjectList =
    document.getElementById("subjectList");

const subjectMessage =
    document.getElementById("subjectMessage");

const emptySubjects =
    document.getElementById("emptySubjects");

const questionExamSelect =
    document.getElementById("questionExamSelect");

const examSelectionMessage =
    document.getElementById("examSelectionMessage");


/* ========================================
   DATA
======================================== */

let exams = [];

let selectedExamId = null;

let subjects = [];


/* ========================================
   LOAD LOCAL SUBJECTS
======================================== */

function loadLocalSubjects() {

    try {

        const savedSubjects =
            localStorage.getItem("oesSubjects");

        if (!savedSubjects) {

            subjects = [];

            return;
        }


        const parsedSubjects =
            JSON.parse(savedSubjects);


        if (Array.isArray(parsedSubjects)) {

            subjects = parsedSubjects;

        } else {

            subjects = [];

        }

    } catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );

        subjects = [];

    }

}


/* ========================================
   SAVE LOCAL SUBJECTS
======================================== */

function saveLocalSubjects() {

    localStorage.setItem(
        "oesSubjects",
        JSON.stringify(subjects)
    );

}


/* ========================================
   LOAD EXAMS FROM BACKEND
======================================== */

async function loadExams() {

    if (!questionExamSelect) {
        return;
    }


    questionExamSelect.innerHTML = `
        <option value="">
            Loading examinations...
        </option>
    `;


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


        displayExamOptions();


    } catch (error) {

        console.error(
            "Error loading examinations:",
            error
        );


        questionExamSelect.innerHTML = `
            <option value="">
                Unable to load examinations
            </option>
        `;


        showExamSelectionMessage(
            "Unable to load examinations. Please check the backend connection.",
            false
        );

    }

}


/* ========================================
   DISPLAY EXAM OPTIONS
======================================== */

function displayExamOptions() {

    if (!questionExamSelect) {
        return;
    }


    questionExamSelect.innerHTML = "";


    if (exams.length === 0) {

        questionExamSelect.innerHTML = `
            <option value="">
                No examinations available
            </option>
        `;


        selectedExamId = null;


        displaySubjects();


        return;
    }


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        "Select an examination";


    questionExamSelect.appendChild(
        defaultOption
    );


    exams.forEach(function (exam) {

        const option =
            document.createElement("option");


        option.value =
            exam.id;


        option.textContent =
            `${exam.name} (${exam.category || "General"})`;


        questionExamSelect.appendChild(
            option
        );

    });


    /* ========================================
       RESTORE PREVIOUS EXAM
    ======================================== */

    const savedExamId =
        localStorage.getItem(
            "oesSelectedExamId"
        );


    if (savedExamId) {

        const exists =
            exams.some(function (exam) {

                return Number(exam.id) ===
                    Number(savedExamId);

            });


        if (exists) {

            questionExamSelect.value =
                savedExamId;

            selectedExamId =
                Number(savedExamId);

        }

    }


    displaySubjects();

}


/* ========================================
   EXAM SELECTION
======================================== */

if (questionExamSelect) {

    questionExamSelect.addEventListener(
        "change",
        function () {

            const value =
                questionExamSelect.value;


            if (!value) {

                selectedExamId = null;


                localStorage.removeItem(
                    "oesSelectedExamId"
                );


                displaySubjects();

                return;
            }


            selectedExamId =
                Number(value);


            localStorage.setItem(
                "oesSelectedExamId",
                String(selectedExamId)
            );


            showExamSelectionMessage(
                "Examination selected successfully.",
                true
            );


            displaySubjects();

        }
    );

}


/* ========================================
   GET SUBJECTS FOR SELECTED EXAM
======================================== */

function getSubjectsForSelectedExam() {

    if (!selectedExamId) {

        return [];

    }


    return subjects.filter(
        function (subject) {

            return (
                subject &&
                Number(subject.examId) ===
                    Number(selectedExamId)
            );

        }
    );

}


/* ========================================
   DISPLAY SUBJECTS
======================================== */

function displaySubjects() {

    if (!subjectList) {
        return;
    }


    subjectList.innerHTML = "";


    /* ========================================
       NO EXAM SELECTED
    ======================================== */

    if (!selectedExamId) {

        if (emptySubjects) {

            emptySubjects.style.display =
                "block";


            emptySubjects.innerHTML = `

                <div class="empty-icon">
                    📝
                </div>


                <h3>
                    Select an Examination
                </h3>


                <p>
                    Please select an examination above
                    to view or create subjects.
                </p>

            `;

        }


        return;
    }


    /* ========================================
       FILTER SUBJECTS
    ======================================== */

    const examSubjects =
        getSubjectsForSelectedExam();


    /* ========================================
       NO SUBJECTS
    ======================================== */

    if (examSubjects.length === 0) {

        if (emptySubjects) {

            emptySubjects.style.display =
                "block";


            emptySubjects.innerHTML = `

                <div class="empty-icon">
                    📁
                </div>


                <h3>
                    No Subjects Created
                </h3>


                <p>
                    Create your first subject
                    for this examination.
                </p>

            `;

        }


        return;
    }


    if (emptySubjects) {

        emptySubjects.style.display =
            "none";

    }


    /* ========================================
       DISPLAY SUBJECTS
    ======================================== */

    examSubjects.forEach(
        function (subject) {

            const subjectCard =
                document.createElement("div");


            subjectCard.className =
                "exam-card";


            /* Question Count */

            const questionCount =
                Number(
                    subject.questionCount || 0
                );


            /* Subject Name */

            const safeSubjectName =
                escapeHTML(
                    subject.name ||
                    "Unnamed Subject"
                );


            subjectCard.innerHTML = `

                <div class="exam-card-top">

                    <div class="exam-small-icon">
                        📁
                    </div>


                    <span class="exam-status">
                        SUBJECT
                    </span>

                </div>


                <h3>
                    ${safeSubjectName}
                </h3>


                <p class="exam-category">
                    Question Bank
                </p>


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
                            Type
                        </span>


                        <strong>
                            MCQ
                        </strong>

                    </div>


                    <div>

                        <span>
                            Status
                        </span>


                        <strong>
                            ACTIVE
                        </strong>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                        margin-top:20px;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-primary"
                        style="flex:1;"
                        onclick="openSubject(${subject.id})"
                    >
                        Open Subject
                    </button>


                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="deleteSubject(${subject.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            subjectList.appendChild(
                subjectCard
            );

        }
    );

}


/* ========================================
   CREATE SUBJECT
======================================== */

if (subjectForm) {

    subjectForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* ========================================
               CHECK EXAM
            ======================================== */

            if (!selectedExamId) {

                showMessage(
                    "Please select an examination first.",
                    false
                );

                return;

            }


            /* ========================================
               CHECK NAME
            ======================================== */

            if (!subjectName) {
                return;
            }


            const name =
                subjectName.value.trim();


            if (!name) {

                showMessage(
                    "Please enter a subject name.",
                    false
                );

                return;

            }


            /* ========================================
               DUPLICATE CHECK
               Only inside selected exam
            ======================================== */

            const duplicate =
                subjects.some(
                    function (subject) {

                        return (
                            subject &&
                            Number(subject.examId) ===
                                Number(selectedExamId) &&
                            subject.name &&
                            subject.name
                                .toLowerCase()
                                === name.toLowerCase()
                        );

                    }
                );


            if (duplicate) {

                showMessage(
                    "This subject already exists in this examination.",
                    false
                );

                return;

            }


            /* ========================================
               CREATE SUBJECT
            ======================================== */

            const newSubject = {

                id: Date.now(),

                examId:
                    Number(selectedExamId),

                name: name,

                questionCount: 0,

                questions: []

            };


            subjects.push(
                newSubject
            );


            saveLocalSubjects();


            /* ========================================
               RESET
            ======================================== */

            subjectForm.reset();


            /* ========================================
               SUCCESS
            ======================================== */

            showMessage(
                "Subject created successfully!",
                true
            );


            displaySubjects();

        }
    );

}


/* ========================================
   OPEN SUBJECT
======================================== */

function openSubject(subjectId) {

    const subject =
        subjects.find(
            function (item) {

                return Number(item.id) ===
                    Number(subjectId);

            }
        );


    if (!subject) {

        return;

    }


    if (!selectedExamId) {

        showMessage(
            "Please select an examination first.",
            false
        );

        return;

    }


    /* ========================================
       SAVE SELECTED SUBJECT
    ======================================== */

    localStorage.setItem(
        "oesSelectedSubject",
        JSON.stringify(subject)
    );


    /* ========================================
       SAVE SELECTED EXAM
    ======================================== */

    localStorage.setItem(
        "oesSelectedExamId",
        String(selectedExamId)
    );


    /* ========================================
       OPEN QUESTION PAGE
    ======================================== */

    window.location.href =
        "subject-questions.html";

}


/* ========================================
   DELETE SUBJECT
======================================== */

function deleteSubject(subjectId) {

    const subject =
        subjects.find(
            function (item) {

                return Number(item.id) ===
                    Number(subjectId);

            }
        );


    if (!subject) {
        return;
    }


    const subjectTitle =
        subject.name ||
        "this subject";


    const confirmation =
        confirm(
            `Are you sure you want to delete "${subjectTitle}" from this examination?`
        );


    if (!confirmation) {
        return;
    }


    /* ========================================
       REMOVE SUBJECT
    ======================================== */

    subjects =
        subjects.filter(
            function (item) {

                return Number(item.id) !==
                    Number(subjectId);

            }
        );


    saveLocalSubjects();


    displaySubjects();


    showMessage(
        "Subject deleted successfully.",
        true
    );

}


/* ========================================
   SHOW SUBJECT MESSAGE
======================================== */

function showMessage(
    text,
    success
) {

    if (!subjectMessage) {
        return;
    }


    subjectMessage.style.display =
        "block";


    if (success) {

        subjectMessage.style.background =
            "#e8f8f1";

        subjectMessage.style.color =
            "#059669";

    } else {

        subjectMessage.style.background =
            "#fff0f0";

        subjectMessage.style.color =
            "#d93025";

    }


    subjectMessage.textContent =
        text;


    setTimeout(
        function () {

            subjectMessage.style.display =
                "none";

        },
        2500
    );

}


/* ========================================
   SHOW EXAM MESSAGE
======================================== */

function showExamSelectionMessage(
    text,
    success
) {

    if (!examSelectionMessage) {
        return;
    }


    examSelectionMessage.style.display =
        "block";


    if (success) {

        examSelectionMessage.style.background =
            "#e8f8f1";

        examSelectionMessage.style.color =
            "#059669";

    } else {

        examSelectionMessage.style.background =
            "#fff0f0";

        examSelectionMessage.style.color =
            "#d93025";

    }


    examSelectionMessage.textContent =
        text;


    setTimeout(
        function () {

            examSelectionMessage.style.display =
                "none";

        },
        2500
    );

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

loadLocalSubjects();

loadExams();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Question Management connected to LIVE Render Backend"
);