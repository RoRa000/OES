/* ========================================
   OES - Subject & Question Management
======================================== */


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

const noSubjects =
    document.getElementById("noSubjects");


/* ========================================
   LOAD SUBJECTS
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
   DISPLAY SUBJECTS
======================================== */

function displaySubjects() {

    if (!subjectList) {
        return;
    }

    subjectList.innerHTML = "";


    /* No Subjects */

    if (subjects.length === 0) {

        if (noSubjects) {
            noSubjects.style.display = "block";
        }

        return;
    }


    if (noSubjects) {
        noSubjects.style.display = "none";
    }


    /* Display Subjects */

    subjects.forEach(function (subject, index) {

        const subjectCard =
            document.createElement("div");

        subjectCard.className =
            "exam-card";


        /* Question Count */

        let questionCount = 0;

        if (
            subject &&
            Array.isArray(subject.questions)
        ) {
            questionCount =
                subject.questions.length;
        }


        /* Subject Name */

        const safeSubjectName =
            subject.name || "Unnamed Subject";


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
                    onclick="openSubject(${index})"
                >
                    Open Subject
                </button>


                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="deleteSubject(${index})"
                >
                    Delete
                </button>

            </div>

        `;


        subjectList.appendChild(subjectCard);

    });

}


/* ========================================
   CREATE SUBJECT
======================================== */

if (subjectForm) {

    subjectForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (!subjectName) {
                return;
            }


            const name =
                subjectName.value.trim();


            /* Validation */

            if (!name) {

                showMessage(
                    "Please enter a subject name.",
                    false
                );

                return;
            }


            /* Duplicate Check */

            const duplicate =
                subjects.some(
                    function (subject) {

                        return (
                            subject &&
                            subject.name &&
                            subject.name
                                .toLowerCase()
                                === name.toLowerCase()
                        );

                    }
                );


            if (duplicate) {

                showMessage(
                    "This subject already exists.",
                    false
                );

                return;
            }


            /* Create Subject */

            const newSubject = {

                id: Date.now(),

                name: name,

                questions: []

            };


            subjects.push(newSubject);


            /* Save */

            localStorage.setItem(
                "oesSubjects",
                JSON.stringify(subjects)
            );


            /* Clear Form */

            subjectForm.reset();


            /* Success Message */

            showMessage(
                "Subject created successfully!",
                true
            );


            /* Refresh */

            displaySubjects();

        }
    );

}


/* ========================================
   OPEN SUBJECT
======================================== */

function openSubject(index) {

    if (
        index < 0 ||
        index >= subjects.length
    ) {
        return;
    }


    const subject =
        subjects[index];


    if (!subject) {
        return;
    }


    /* Save selected subject */

    localStorage.setItem(
        "oesSelectedSubject",
        JSON.stringify(subject)
    );


    /* Open subject question page */

    window.location.href =
        "subject-questions.html";

}


/* ========================================
   DELETE SUBJECT
======================================== */

function deleteSubject(index) {

    if (
        index < 0 ||
        index >= subjects.length
    ) {
        return;
    }


    const subject =
        subjects[index];


    if (!subject) {
        return;
    }


    const subjectName =
        subject.name || "this subject";


    const confirmation =
        confirm(
            `Are you sure you want to delete "${subjectName}" and all its questions?`
        );


    if (!confirmation) {
        return;
    }


    /* Remove Subject */

    subjects.splice(index, 1);


    /* Save Updated List */

    localStorage.setItem(
        "oesSubjects",
        JSON.stringify(subjects)
    );


    /* Refresh */

    displaySubjects();


    showMessage(
        "Subject deleted successfully.",
        true
    );

}


/* ========================================
   SHOW MESSAGE
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
   INITIALIZE
======================================== */

displaySubjects();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Subjects:",
    subjects
);