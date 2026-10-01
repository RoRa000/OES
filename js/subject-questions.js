/* ========================================
   OES - Subject Questions Management
   LIVE BACKEND + PDF AUTO IMPORT
======================================== */


/* ========================================
   API
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
   GET SELECTED SUBJECT
======================================== */

let selectedSubject = null;

try {
    selectedSubject = JSON.parse(
        localStorage.getItem("oesSelectedSubject") || "null"
    );
} catch (error) {
    console.error(
        "Selected subject error:",
        error
    );
}

if (!selectedSubject) {

    alert("No subject selected.");

    window.location.href =
        "questions.html";
}


/* ========================================
   GET SELECTED EXAM
======================================== */

const selectedExamId =
    Number(
        localStorage.getItem("oesSelectedExamId")
    );

if (!selectedExamId) {

    alert("No examination selected.");

    window.location.href =
        "questions.html";
}


/* ========================================
   HTML ELEMENTS
======================================== */

const subjectTitle =
    document.getElementById("subjectTitle");

const subjectDescription =
    document.getElementById("subjectDescription");


/* Manual Question */

const questionForm =
    document.getElementById(
        "subjectQuestionForm"
    );

const questionText =
    document.getElementById(
        "subjectQuestionText"
    );

const option1 =
    document.getElementById(
        "subjectOption1"
    );

const option2 =
    document.getElementById(
        "subjectOption2"
    );

const option3 =
    document.getElementById(
        "subjectOption3"
    );

const option4 =
    document.getElementById(
        "subjectOption4"
    );

const correctAnswer =
    document.getElementById(
        "subjectCorrectAnswer"
    );

const questionMessage =
    document.getElementById(
        "subjectQuestionMessage"
    );


/* Question List */

const questionList =
    document.getElementById(
        "subjectQuestionList"
    );

const noQuestions =
    document.getElementById(
        "noSubjectQuestions"
    );


/* PDF */

const questionPdfFile =
    document.getElementById(
        "questionPdfFile"
    );

const readPdfBtn =
    document.getElementById(
        "readPdfBtn"
    );

const pdfMessage =
    document.getElementById(
        "pdfMessage"
    );

const pdfPreviewSection =
    document.getElementById(
        "pdfPreviewSection"
    );

const pdfQuestionCount =
    document.getElementById(
        "pdfQuestionCount"
    );

const pdfQuestionPreview =
    document.getElementById(
        "pdfQuestionPreview"
    );

const importSelectedPdfQuestionsBtn =
    document.getElementById(
        "importSelectedPdfQuestionsBtn"
    );

const pdfImportMessage =
    document.getElementById(
        "pdfImportMessage"
    );


/* ========================================
   QUESTIONS FROM BACKEND
======================================== */

let backendQuestions = [];


/* ========================================
   SUBJECT INFO
======================================== */

if (subjectTitle) {

    subjectTitle.textContent =
        selectedSubject.name;
}

if (subjectDescription) {

    subjectDescription.textContent =
        `Manage unlimited questions for ${selectedSubject.name}.`;
}


/* ========================================
   LOAD QUESTIONS FROM BACKEND
======================================== */

async function loadQuestions() {

    if (!selectedExamId) {
        return;
    }

    if (!questionList) {
        return;
    }

    questionList.innerHTML = `
        <div
            style="
                text-align:center;
                padding:30px;
            "
        >
            Loading questions...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_URL}/questions/exam/${selectedExamId}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load questions."
            );
        }

        const allQuestions =
            Array.isArray(data.questions)
                ? data.questions
                : [];

        backendQuestions =
            allQuestions.filter(
                function (question) {

                    return (
                        question.subject &&
                        question.subject
                            .toLowerCase()
                            ===
                        selectedSubject.name
                            .toLowerCase()
                    );
                }
            );

        displayQuestions();

        console.log(
            "OES Backend Questions:",
            backendQuestions
        );

    } catch (error) {

        console.error(
            "Load questions error:",
            error
        );

        questionList.innerHTML = `
            <div
                style="
                    padding:20px;
                    background:#fff0f0;
                    color:#d93025;
                    border-radius:10px;
                "
            >
                Unable to load questions from backend.
                Please check your internet connection
                and backend.
            </div>
        `;
    }
}


/* ========================================
   DISPLAY QUESTIONS
======================================== */

function displayQuestions() {

    if (!questionList) {
        return;
    }

    questionList.innerHTML = "";

    if (
        !Array.isArray(backendQuestions) ||
        backendQuestions.length === 0
    ) {

        if (noQuestions) {
            noQuestions.style.display =
                "block";
        }

        return;
    }

    if (noQuestions) {
        noQuestions.style.display =
            "none";
    }

    backendQuestions.forEach(
        function (question, index) {

            const card =
                document.createElement("div");

            card.className =
                "exam-card";

            const options = [
                question.option_a || "",
                question.option_b || "",
                question.option_c || "",
                question.option_d || ""
            ];

            const correctIndex =
                Number(
                    question.correct_answer
                );

            const correctText =
                options[correctIndex] ||
                "Not available";

            card.innerHTML = `
                <div class="exam-card-top">

                    <div class="exam-small-icon">
                        ❓
                    </div>

                    <span class="exam-status">
                        Q${index + 1}
                    </span>

                </div>

                <h3>
                    ${escapeHtml(
                        question.question
                    )}
                </h3>

                <p class="exam-category">
                    ${escapeHtml(
                        selectedSubject.name
                    )}
                </p>

                <div
                    style="
                        margin-top:15px;
                        line-height:1.8;
                    "
                >

                    <div>
                        1.
                        ${escapeHtml(
                            options[0]
                        )}
                    </div>

                    <div>
                        2.
                        ${escapeHtml(
                            options[1]
                        )}
                    </div>

                    <div>
                        3.
                        ${escapeHtml(
                            options[2]
                        )}
                    </div>

                    <div>
                        4.
                        ${escapeHtml(
                            options[3]
                        )}
                    </div>

                </div>

                <div
                    style="
                        margin-top:15px;
                        padding:10px;
                        background:#e8f8f1;
                        color:#059669;
                        border-radius:8px;
                    "
                >

                    Correct Answer:
                    ${escapeHtml(
                        correctText
                    )}

                </div>

                <button
                    type="button"
                    class="btn btn-secondary"
                    style="
                        width:100%;
                        margin-top:15px;
                    "
                    onclick="deleteQuestion(${question.id})"
                >
                    🗑️ Delete Question
                </button>
            `;

            questionList.appendChild(card);
        }
    );
}


/* ========================================
   MANUAL ADD QUESTION
======================================== */

if (questionForm) {

    questionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const question =
                questionText.value.trim();

            const options = [

                option1.value.trim(),

                option2.value.trim(),

                option3.value.trim(),

                option4.value.trim()

            ];

            const answer =
                Number(
                    correctAnswer.value
                );

            if (
                !question ||
                options.some(
                    function (option) {
                        return !option;
                    }
                ) ||
                correctAnswer.value === ""
            ) {

                showQuestionMessage(
                    "Please fill all fields.",
                    false
                );

                return;
            }


            /* Disable button */

            const submitButton =
                questionForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent =
                    "Adding Question...";
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/questions`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                exam_id:
                                    selectedExamId,

                                subject:
                                    selectedSubject.name,

                                question:
                                    question,

                                option_a:
                                    options[0],

                                option_b:
                                    options[1],

                                option_c:
                                    options[2],

                                option_d:
                                    options[3],

                                correct_answer:
                                    answer,

                                marks: 1

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
                        "Unable to add question."
                    );
                }


                questionForm.reset();

                showQuestionMessage(
                    "Question added successfully!",
                    true
                );

                await loadQuestions();

            } catch (error) {

                console.error(
                    "Add question error:",
                    error
                );

                showQuestionMessage(
                    error.message ||
                    "Unable to add question.",
                    false
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "+ Add Question";
                }
            }
        }
    );
}


/* ========================================
   TEMP PDF QUESTIONS
======================================== */

let detectedPdfQuestions = [];


/* ========================================
   READ PDF
======================================== */

if (readPdfBtn) {

    readPdfBtn.addEventListener(
        "click",
        async function () {

            if (
                !questionPdfFile ||
                !questionPdfFile.files ||
                questionPdfFile.files.length === 0
            ) {

                showPdfMessage(
                    "Please select a PDF file first.",
                    false
                );

                return;
            }


            const file =
                questionPdfFile.files[0];


            if (
                file.type !== "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                showPdfMessage(
                    "Please select a valid PDF file.",
                    false
                );

                return;
            }


            showPdfMessage(
                "Reading PDF and detecting questions, please wait...",
                true
            );


            readPdfBtn.disabled =
                true;


            try {

                const arrayBuffer =
                    await file.arrayBuffer();


                if (
                    typeof pdfjsLib ===
                    "undefined"
                ) {

                    showPdfMessage(
                        "PDF reader library is not loaded. Please refresh the page.",
                        false
                    );

                    return;
                }


                const pdf =
                    await pdfjsLib
                        .getDocument({
                            data: arrayBuffer
                        })
                        .promise;


                let fullText = "";


                /* Read all pages */

                for (
                    let pageNumber = 1;
                    pageNumber <= pdf.numPages;
                    pageNumber++
                ) {

                    const page =
                        await pdf.getPage(
                            pageNumber
                        );

                    const textContent =
                        await page.getTextContent();

                    const pageText =
                        textContent.items
                            .map(
                                function (item) {
                                    return item.str;
                                }
                            )
                            .join(" ");

                    fullText +=
                        "\n" +
                        pageText +
                        "\n";
                }


                /* Clean */

                fullText =
                    cleanPdfText(
                        fullText
                    );


                /* Parse */

                detectedPdfQuestions =
                    parsePdfQuestions(
                        fullText
                    );


                if (pdfPreviewSection) {

                    pdfPreviewSection.style.display =
                        "block";
                }


                if (
                    detectedPdfQuestions.length ===
                    0
                ) {

                    if (pdfQuestionCount) {

                        pdfQuestionCount.textContent =
                            "Questions Found: 0";
                    }

                    if (pdfQuestionPreview) {

                        pdfQuestionPreview.innerHTML = `

                            <div
                                style="
                                    padding:20px;
                                    background:#fff0f0;
                                    color:#d93025;
                                    border-radius:10px;
                                "
                            >

                                <strong>
                                    Questions could not be detected automatically.
                                </strong>

                                <p
                                    style="
                                        margin-top:8px;
                                    "
                                >
                                    Please check that your PDF follows the
                                    Question → A) → B) → C) → D) →
                                    Correct Option format.
                                </p>

                            </div>

                        `;
                    }

                } else {

                    renderPdfQuestions();
                }


                showPdfMessage(
                    `PDF read successfully! ${detectedPdfQuestions.length} question(s) detected.`,
                    true
                );


                console.log(
                    "OES Detected PDF Questions:",
                    detectedPdfQuestions
                );

            } catch (error) {

                console.error(
                    "PDF reading error:",
                    error
                );

                showPdfMessage(
                    "Unable to read this PDF. Please try another PDF.",
                    false
                );

            } finally {

                readPdfBtn.disabled =
                    false;
            }
        }
    );
}


/* ========================================
   CLEAN PDF TEXT
======================================== */

function cleanPdfText(text) {

    if (!text) {
        return "";
    }

    let cleaned =
        text.replace(
            /\u00a0/g,
            " "
        );

    cleaned =
        cleaned.replace(
            /\r/g,
            "\n"
        );

    cleaned =
        cleaned.replace(
            /\bn\s+(?=\d)/gi,
            "₹ "
        );

    cleaned =
        cleaned.replace(
            /\s*:\s*/g,
            ": "
        );

    cleaned =
        cleaned.replace(
            /---\s*PAGE\s*\d+\s*---/gi,
            "\n"
        );

    return cleaned.trim();
}


/* ========================================
   PARSE PDF QUESTIONS
======================================== */

function parsePdfQuestions(text) {

    const questions = [];

    if (!text) {
        return questions;
    }


    let normalized =
        text
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    /* Find question numbers */

    const questionRegex =
        /(?:^|\s)(\d+)\.\s+/g;

    const matches = [];

    let match;

    while (
        (match =
            questionRegex.exec(
                normalized
            )) !== null
    ) {

        matches.push({

            number:
                Number(match[1]),

            start:
                match.index +
                match[0].length
        });
    }


    /* Build question blocks */

    for (
        let i = 0;
        i < matches.length;
        i++
    ) {

        const start =
            matches[i].start;

        const end =
            i + 1 < matches.length
                ? matches[i + 1].start -
                  matches[i + 1]
                      .number
                      .toString()
                      .length -
                  2
                : normalized.length;


        let block =
            normalized
                .substring(
                    start,
                    end
                )
                .trim();


        if (
            block.length < 10
        ) {
            continue;
        }


        /* Correct answer */

        const correctMatch =
            block.match(
                /Correct\s+(?:Option|Answer)\s*:\s*([ABCD])\s*[\.\)]?/i
            );


        if (!correctMatch) {
            continue;
        }


        const correctLetter =
            correctMatch[1]
                .toUpperCase();


        /* Remove correct answer */

        block =
            block.substring(
                0,
                correctMatch.index
            ).trim();


        /* Find A-D options */

        const optionRegex =
            /(?:^|\s)([ABCD])[\.\)]\s+/g;

        const optionMatches = [];

        let optionMatch;

        while (
            (optionMatch =
                optionRegex.exec(
                    block
                )) !== null
        ) {

            optionMatches.push({

                letter:
                    optionMatch[1]
                        .toUpperCase(),

                start:
                    optionMatch.index +
                    optionMatch[0].length
            });
        }


        if (
            optionMatches.length < 4
        ) {
            continue;
        }


        /* Question text */

        const questionEnd =
            optionMatches[0].start -
            optionMatches[0]
                .letter
                .length -
            2;


        let question =
            block
                .substring(
                    0,
                    questionEnd
                )
                .trim();


        question =
            question.replace(
                /^\d+\.\s*/,
                ""
            );


        /* Extract options */

        const options = [];

        for (
            let j = 0;
            j < 4;
            j++
        ) {

            const optionStart =
                optionMatches[j].start;

            let optionEnd;

            if (
                j + 1 < 4
            ) {

                optionEnd =
                    optionMatches[j + 1]
                        .start -
                    optionMatches[j + 1]
                        .letter
                        .length -
                    2;

            } else {

                optionEnd =
                    block.length;
            }


            let optionText =
                block
                    .substring(
                        optionStart,
                        optionEnd
                    )
                    .trim();


            optionText =
                optionText.replace(
                    /\s+/g,
                    " "
                );


            options.push(
                optionText
            );
        }


        const correctAnswer =
            "ABCD".indexOf(
                correctLetter
            );


        if (
            question &&
            options.length === 4 &&
            options.every(
                function (option) {
                    return option.length > 0;
                }
            ) &&
            correctAnswer >= 0
        ) {

            questions.push({

                tempId:
                    `pdf_${Date.now()}_${i}`,

                selected:
                    true,

                question:
                    question,

                options:
                    options,

                correctAnswer:
                    correctAnswer
            });
        }
    }


    return questions;
}


/* ========================================
   RENDER PDF QUESTIONS
======================================== */

function renderPdfQuestions() {

    if (!pdfQuestionPreview) {
        return;
    }


    pdfQuestionPreview.innerHTML =
        "";


    if (pdfQuestionCount) {

        pdfQuestionCount.textContent =
            `Questions Found: ${detectedPdfQuestions.length}`;
    }


    /* Select controls */

    const controlBox =
        document.createElement(
            "div"
        );

    controlBox.style.cssText = `
        display:flex;
        gap:10px;
        margin-bottom:20px;
        flex-wrap:wrap;
    `;


    controlBox.innerHTML = `

        <button
            type="button"
            class="btn btn-secondary"
            id="selectAllPdfQuestions"
        >
            ☑️ Select All
        </button>

        <button
            type="button"
            class="btn btn-secondary"
            id="unselectAllPdfQuestions"
        >
            ⬜ Unselect All
        </button>

    `;


    pdfQuestionPreview.appendChild(
        controlBox
    );


    detectedPdfQuestions.forEach(
        function (question, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.style.cssText = `
                border:1px solid #e1e5ea;
                border-radius:12px;
                padding:18px;
                margin-bottom:15px;
                background:#ffffff;
            `;


            card.innerHTML = `

                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        gap:12px;
                    "
                >

                    <input
                        type="checkbox"
                        id="pdfQuestion_${index}"
                        ${
                            question.selected
                                ? "checked"
                                : ""
                        }
                        style="
                            margin-top:5px;
                            width:18px;
                            height:18px;
                        "
                    >

                    <div style="flex:1;">

                        <strong>
                            Q${index + 1}.
                        </strong>

                        <span>
                            ${escapeHtml(
                                question.question
                            )}
                        </span>

                    </div>

                </div>


                <div
                    style="
                        margin-top:15px;
                        padding-left:30px;
                        line-height:1.8;
                    "
                >

                    <div>
                        <strong>A)</strong>
                        ${escapeHtml(
                            question.options[0]
                        )}
                    </div>

                    <div>
                        <strong>B)</strong>
                        ${escapeHtml(
                            question.options[1]
                        )}
                    </div>

                    <div>
                        <strong>C)</strong>
                        ${escapeHtml(
                            question.options[2]
                        )}
                    </div>

                    <div>
                        <strong>D)</strong>
                        ${escapeHtml(
                            question.options[3]
                        )}
                    </div>

                </div>


                <div
                    style="
                        margin-top:12px;
                        margin-left:30px;
                        padding:10px;
                        background:#e8f8f1;
                        color:#059669;
                        border-radius:8px;
                    "
                >

                    <strong>
                        Correct Answer:
                    </strong>

                    ${"ABCD"[question.correctAnswer]})

                    ${escapeHtml(
                        question.options[
                            question.correctAnswer
                        ]
                    )}

                </div>

            `;


            pdfQuestionPreview.appendChild(
                card
            );


            const checkbox =
                document.getElementById(
                    `pdfQuestion_${index}`
                );


            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    function () {

                        question.selected =
                            checkbox.checked;
                    }
                );
            }
        }
    );


    const selectAll =
        document.getElementById(
            "selectAllPdfQuestions"
        );

    const unselectAll =
        document.getElementById(
            "unselectAllPdfQuestions"
        );


    if (selectAll) {

        selectAll.addEventListener(
            "click",
            function () {

                detectedPdfQuestions.forEach(
                    function (question) {

                        question.selected =
                            true;
                    }
                );

                renderPdfQuestions();
            }
        );
    }


    if (unselectAll) {

        unselectAll.addEventListener(
            "click",
            function () {

                detectedPdfQuestions.forEach(
                    function (question) {

                        question.selected =
                            false;
                    }
                );

                renderPdfQuestions();
            }
        );
    }
}


/* ========================================
   IMPORT PDF QUESTIONS TO BACKEND
======================================== */

if (importSelectedPdfQuestionsBtn) {

    importSelectedPdfQuestionsBtn.addEventListener(
        "click",
        async function () {

            const selectedQuestions =
                detectedPdfQuestions.filter(
                    function (question) {
                        return question.selected;
                    }
                );


            if (
                selectedQuestions.length === 0
            ) {

                showPdfImportMessage(
                    "Please select at least one question.",
                    false
                );

                return;
            }


            importSelectedPdfQuestionsBtn.disabled =
                true;

            importSelectedPdfQuestionsBtn.textContent =
                "Importing Questions...";


            let imported = 0;

            let failed = 0;


            try {

                for (
                    const question
                    of selectedQuestions
                ) {

                    try {

                        const response =
                            await fetch(
                                `${API_URL}/questions`,
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({

                                            exam_id:
                                                selectedExamId,

                                            subject:
                                                selectedSubject.name,

                                            question:
                                                question.question,

                                            option_a:
                                                question.options[0],

                                            option_b:
                                                question.options[1],

                                            option_c:
                                                question.options[2],

                                            option_d:
                                                question.options[3],

                                            correct_answer:
                                                question.correctAnswer,

                                            marks: 1

                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            failed++;

                            console.error(
                                "PDF question import failed:",
                                data
                            );

                            continue;
                        }


                        imported++;

                    } catch (error) {

                        failed++;

                        console.error(
                            "PDF question import error:",
                            error
                        );
                    }
                }


                await loadQuestions();


                detectedPdfQuestions =
                    detectedPdfQuestions.filter(
                        function (question) {
                            return !question.selected;
                        }
                    );


                renderPdfQuestions();


                if (failed === 0) {

                    showPdfImportMessage(
                        `${imported} question(s) imported successfully into ${selectedSubject.name}!`,
                        true
                    );

                } else {

                    showPdfImportMessage(
                        `${imported} question(s) imported, ${failed} question(s) failed.`,
                        imported > 0
                    );
                }


            } catch (error) {

                console.error(
                    "PDF import error:",
                    error
                );

                showPdfImportMessage(
                    "Unable to import PDF questions.",
                    false
                );

            } finally {

                importSelectedPdfQuestionsBtn.disabled =
                    false;

                importSelectedPdfQuestionsBtn.textContent =
                    "Import Selected Questions";
            }
        }
    );
}


/* ========================================
   DELETE QUESTION
======================================== */

async function deleteQuestion(
    questionId
) {

    if (!questionId) {
        return;
    }


    const confirmation =
        confirm(
            "Are you sure you want to delete this question?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/questions/${questionId}`,
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
                "Unable to delete question."
            );
        }


        showQuestionMessage(
            "Question deleted successfully!",
            true
        );


        await loadQuestions();

    } catch (error) {

        console.error(
            "Delete question error:",
            error
        );

        showQuestionMessage(
            error.message ||
            "Unable to delete question.",
            false
        );
    }
}


/* ========================================
   QUESTION MESSAGE
======================================== */

function showQuestionMessage(
    text,
    success
) {

    if (!questionMessage) {
        return;
    }


    questionMessage.style.display =
        "block";


    questionMessage.textContent =
        text;


    questionMessage.style.background =
        success
            ? "#e8f8f1"
            : "#fff0f0";


    questionMessage.style.color =
        success
            ? "#059669"
            : "#d93025";


    setTimeout(
        function () {

            questionMessage.style.display =
                "none";

        },
        2500
    );
}


/* ========================================
   PDF MESSAGE
======================================== */

function showPdfMessage(
    text,
    success
) {

    if (!pdfMessage) {
        return;
    }


    pdfMessage.style.display =
        "block";


    pdfMessage.textContent =
        text;


    pdfMessage.style.background =
        success
            ? "#e8f8f1"
            : "#fff0f0";


    pdfMessage.style.color =
        success
            ? "#059669"
            : "#d93025";
}


/* ========================================
   PDF IMPORT MESSAGE
======================================== */

function showPdfImportMessage(
    text,
    success
) {

    if (!pdfImportMessage) {
        return;
    }


    pdfImportMessage.style.display =
        "block";


    pdfImportMessage.textContent =
        text;


    pdfImportMessage.style.background =
        success
            ? "#e8f8f1"
            : "#fff0f0";


    pdfImportMessage.style.color =
        success
            ? "#059669"
            : "#d93025";
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
   INITIAL LOAD
======================================== */

loadQuestions();


/* ========================================
   DEBUG
======================================== */

console.log(
    "OES Current Subject:",
    selectedSubject.name
);

console.log(
    "OES Selected Exam ID:",
    selectedExamId
);

console.log(
    "OES Subject Questions connected to LIVE Render Backend"
);