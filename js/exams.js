/* ========================================
   OES - Exam Management
   Exam → Subjects → Questions
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
   DEFAULT EXAM
======================================== */

const defaultExam = {
    id: 1,
    name: "General Aptitude Test",

    subjects: [],

    questions: 5,
    duration: 10,
    negativeMark: 0.25,

    status: "ACTIVE"
};


/* ========================================
   LOAD EXAMS
======================================== */

let exams = [];

try {

    const savedExams =
        localStorage.getItem("oesExams");

    if (savedExams) {

        const parsedExams =
            JSON.parse(savedExams);

        if (Array.isArray(parsedExams)) {
            exams = parsedExams;
        }

    }

} catch (error) {

    console.error(
        "Error loading exams:",
        error
    );

    exams = [];

}


/* ========================================
   CREATE DEFAULT EXAM
======================================== */

if (exams.length === 0) {

    exams = [defaultExam];

    localStorage.setItem(
        "oesExams",
        JSON.stringify(exams)
    );

}


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

                Please create subjects first
                from Question Management.

            </div>

        `;

        return;
    }


    /* Display Subjects */

    subjects.forEach(function (subject) {

        if (!subject || !subject.name) {
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
                data-name="${subject.name}"
                style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                "
            >

            <span>

                <strong>
                    ${subject.name}
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

            id: Number(checkbox.value),

            name: checkbox.dataset.name

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
        examCount.textContent = exams.length;
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

    exams.forEach(function (exam, index) {

        const examCard =
            document.createElement("div");

        examCard.className =
            "exam-card";


        /* Support old exams */

        let selectedSubjects = [];


        if (Array.isArray(exam.subjects)) {

            selectedSubjects =
                exam.subjects;

        }


        let subjectHTML = "";


        if (selectedSubjects.length > 0) {

            subjectHTML =
                selectedSubjects
                    .map(function (subject) {

                        return `
                            <span
                                style="
                                    display: inline-block;
                                    padding: 5px 10px;
                                    margin: 3px;
                                    background: #eef4ff;
                                    border-radius: 20px;
                                    font-size: 13px;
                                "
                            >
                                ${subject.name}
                            </span>
                        `;

                    })
                    .join("");

        } else {

            subjectHTML = `

                <span
                    style="
                        color: #888;
                        font-size: 13px;
                    "
                >
                    No subjects selected
                </span>

            `;

        }


        examCard.innerHTML = `

            <div class="exam-card-top">

                <div class="exam-small-icon">
                    📝
                </div>

                <span class="exam-status">
                    ${exam.status || "ACTIVE"}
                </span>

            </div>


            <h3>
                ${exam.name}
            </h3>


            <p class="exam-category">
                Subjects
            </p>


            <div
                style="
                    margin: 10px 0 15px;
                "
            >

                ${subjectHTML}

            </div>


            <div class="exam-details">

                <div>

                    <span>
                        Questions
                    </span>

                    <strong>
                        ${exam.questions}
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
                        ${exam.negativeMark}
                    </strong>

                </div>

            </div>


            <button
                type="button"
                class="btn btn-primary"
                onclick="deleteExam(${index})"
                style="margin-top: 20px;"
            >
                Delete Examination
            </button>

        `;


        examList.appendChild(examCard);

    });

}


/* ========================================
   CREATE EXAM
======================================== */

if (examForm) {

    examForm.addEventListener(
        "submit",
        function (event) {

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
                        .getElementById("examQuestions")
                        .value
                );


            /* Duration */

            const duration =
                Number(
                    document
                        .getElementById("examDuration")
                        .value
                );


            /* Negative Marking */

            const negativeMark =
                Number(
                    document
                        .getElementById("negativeMark")
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


            if (selectedSubjects.length === 0) {

                showMessage(
                    "Please select at least one subject.",
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
               CHECK QUESTION AVAILABILITY
            ======================================== */

            let totalAvailableQuestions = 0;


            selectedSubjects.forEach(
                function (selectedSubject) {

                    const fullSubject =
                        subjects.find(
                            function (subject) {

                                return (
                                    Number(subject.id)
                                    ===
                                    Number(selectedSubject.id)
                                );

                            }
                        );


                    if (
                        fullSubject &&
                        Array.isArray(fullSubject.questions)
                    ) {

                        totalAvailableQuestions +=
                            fullSubject.questions.length;

                    }

                }
            );


            if (
                questions >
                totalAvailableQuestions
            ) {

                showMessage(

                    `Only ${totalAvailableQuestions} question(s) are available in the selected subjects.`,

                    false

                );

                return;
            }


            /* ========================================
               CREATE NEW EXAM
            ======================================== */

            const newExam = {

                id: Date.now(),

                name: name,

                subjects: selectedSubjects,

                questions: questions,

                duration: duration,

                negativeMark: negativeMark,

                status: "ACTIVE"

            };


            exams.push(newExam);


            /* ========================================
               SAVE EXAM
            ======================================== */

            localStorage.setItem(
                "oesExams",
                JSON.stringify(exams)
            );


            /* ========================================
               SUCCESS
            ======================================== */

            showMessage(
                "Examination created successfully!",
                true
            );


            /* Reset Form */

            examForm.reset();


            document.getElementById(
                "examQuestions"
            ).value = 5;


            document.getElementById(
                "examDuration"
            ).value = 10;


            document.getElementById(
                "negativeMark"
            ).value = 0.25;


            /* Refresh */

            displayExams();

        }
    );

}


/* ========================================
   DELETE EXAM
======================================== */

function deleteExam(index) {

    if (
        index < 0 ||
        index >= exams.length
    ) {
        return;
    }


    const exam =
        exams[index];


    const confirmation =
        confirm(
            `Are you sure you want to delete "${exam.name}"?`
        );


    if (!confirmation) {
        return;
    }


    exams.splice(index, 1);


    localStorage.setItem(
        "oesExams",
        JSON.stringify(exams)
    );


    displayExams();


    showMessage(
        "Examination deleted successfully.",
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
   INITIALIZE
======================================== */

displaySubjectOptions();

displayExams();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Exams:",
    exams
);

console.log(
    "OES Subjects:",
    subjects
);