/* ========================================
   OES - Admin Results Management
   Connected to LIVE Render Backend
======================================== */


/* ========================================
   API URL
======================================== */

const API_URL =
    "https://oes-nx6c.onrender.com/api";


/* ========================================
   Admin Protection
======================================== */

const userRole =
    localStorage.getItem("oesUserRole");

const userEmail =
    localStorage.getItem("oesUserEmail");


if (
    userRole !== "admin" ||
    !userEmail
) {

    window.location.href =
        "login.html";

}


/* ========================================
   Get HTML Elements
======================================== */

const resultsContainer =
    document.getElementById(
        "resultsContainer"
    );

const resultCount =
    document.getElementById(
        "resultCount"
    );

const noResults =
    document.getElementById(
        "noResults"
    );


/* ========================================
   Load Results From Backend
======================================== */

async function loadResults() {

    try {

        console.log(
            "Loading results from LIVE Render Backend..."
        );


        const response =
            await fetch(
                `${API_URL}/results`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Results API response:",
            data
        );


        /* ========================================
           Get Results Array
           
           Supports:
           data.results
           data.result
        ======================================== */

        let results = [];


        if (
            data &&
            Array.isArray(data.results)
        ) {

            results =
                data.results;

        } else if (
            data &&
            Array.isArray(data.result)
        ) {

            results =
                data.result;

        }


        displayResults(results);


    } catch (error) {

        console.error(
            "Error loading results from backend:",
            error
        );


        displayResults([]);


        if (noResults) {

            noResults.style.display =
                "block";

            noResults.textContent =
                "Unable to load results. Please refresh the page.";

        }

    }

}


/* ========================================
   Display Results
======================================== */

function displayResults(results) {

    if (!resultsContainer) {

        console.error(
            "resultsContainer not found."
        );

        return;

    }


    resultsContainer.innerHTML = "";


    /* ========================================
       No Results
    ======================================== */

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        if (resultCount) {

            resultCount.textContent =
                "0";

        }


        if (noResults) {

            noResults.style.display =
                "block";

        }


        return;

    }


    /* ========================================
       Result Count
    ======================================== */

    if (resultCount) {

        resultCount.textContent =
            results.length;

    }


    if (noResults) {

        noResults.style.display =
            "none";

    }


    /* ========================================
       Display Each Result
    ======================================== */

    results.forEach(
        function (result) {

            const resultCard =
                document.createElement(
                    "div"
                );


            resultCard.className =
                "exam-card";


            /* ========================================
               Support Backend Field Names
            ======================================== */

            const percentage =
                Number(
                    result.percentage ??
                    result.percentage_score ??
                    0
                ) || 0;


            const marks =
                Number(
                    result.marks ??
                    result.marks_obtained ??
                    result.score ??
                    0
                ) || 0;


            const correct =
                Number(
                    result.correct ??
                    result.correct_answers ??
                    0
                ) || 0;


            const wrong =
                Number(
                    result.wrong ??
                    result.wrong_answers ??
                    0
                ) || 0;


            const attempted =
                Number(
                    result.attempted ??
                    result.attempted_questions ??
                    0
                ) || 0;


            /* ========================================
               Student Information
            ======================================== */

            const studentName =
                result.studentName ??
                result.student_name ??
                result.name ??
                "Unknown Student";


            const studentEmail =
                result.studentEmail ??
                result.student_email ??
                result.email ??
                "Not Available";


            /* ========================================
               Exam Information
            ======================================== */

            const examName =
                result.examName ??
                result.exam_name ??
                result.examNameText ??
                "General Aptitude Test";


            /* ========================================
               Status
            ======================================== */

            const status =
                percentage >= 40
                    ? "PASS"
                    : "FAIL";


            /* ========================================
               Result Card
            ======================================== */

            resultCard.innerHTML = `

                <div class="exam-card-top">

                    <div class="exam-small-icon">
                        📊
                    </div>

                    <span class="exam-status">
                        ${status}
                    </span>

                </div>


                <h3>
                    ${studentName}
                </h3>


                <p class="exam-category">
                    ${studentEmail}
                </p>


                <div class="exam-details">


                    <div>

                        <span>
                            Exam
                        </span>

                        <strong>
                            ${examName}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Marks
                        </span>

                        <strong>
                            ${marks.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Percentage
                        </span>

                        <strong>
                            ${percentage.toFixed(2)}%
                        </strong>

                    </div>


                    <div>

                        <span>
                            Correct
                        </span>

                        <strong>
                            ${correct}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Wrong
                        </span>

                        <strong>
                            ${wrong}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Attempted
                        </span>

                        <strong>
                            ${attempted}
                        </strong>

                    </div>


                </div>

            `;


            resultsContainer.appendChild(
                resultCard
            );

        }
    );

}


/* ========================================
   Start
======================================== */

loadResults();