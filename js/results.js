/* ========================================
   OES - Admin Results Management
======================================== */


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
    document.getElementById("resultsContainer");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");


/* ========================================
   Load Results
======================================== */

function loadResults() {

    let results = [];


    const savedResults =
        localStorage.getItem("oesResults");


    if (savedResults) {

        try {

            const parsedResults =
                JSON.parse(savedResults);


            if (Array.isArray(parsedResults)) {

                results = parsedResults;

            }

        } catch (error) {

            console.error(
                "Error loading results:",
                error
            );

        }

    }


    displayResults(results);

}


/* ========================================
   Display Results
======================================== */

function displayResults(results) {

    resultsContainer.innerHTML = "";


    /* ========================================
       No Results
    ======================================== */

    if (
        !results ||
        results.length === 0
    ) {

        resultCount.textContent = "0";

        noResults.style.display = "block";

        return;

    }


    /* ========================================
       Result Count
    ======================================== */

    resultCount.textContent =
        results.length;

    noResults.style.display = "none";


    /* ========================================
       Display Each Result
    ======================================== */

    results.forEach(
        function (result) {

            const resultCard =
                document.createElement("div");


            resultCard.className =
                "exam-card";


            const percentage =
                Number(result.percentage) || 0;


            const marks =
                Number(result.marks) || 0;


            const correct =
                Number(result.correct) || 0;


            const wrong =
                Number(result.wrong) || 0;


            const attempted =
                Number(result.attempted) || 0;


            const status =
                percentage >= 40
                    ? "PASS"
                    : "FAIL";


            /* ========================================
               Student Information From Result
            ======================================== */

            const studentName =
                result.studentName ||
                "Unknown Student";


            const studentEmail =
                result.studentEmail ||
                "Not Available";


            const examName =
                result.examName ||
                "General Aptitude Test";


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