/* ========================================
   LOAD RESULT
======================================== */

async function loadResult() {

    try {

        console.log(
            "OES Result: Loading student result..."
        );


        /* ========================================
           CHECK STUDENT ID
        ======================================== */

        if (
            !currentStudent ||
            !currentStudent.id
        ) {

            console.error(
                "Current student ID is missing."
            );

            loadLocalResult();

            displayResult();

            return;

        }


        const studentId =
            Number(
                currentStudent.id
            );


        console.log(
            "Loading results for student ID:",
            studentId
        );


        /* ========================================
           GET STUDENT RESULTS
        ======================================== */

        const response =
            await fetch(
                `${API_URL}/results/student/${studentId}`
            );


        const data =
            await response.json();


        console.log(
            "Student result list:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load student result."
            );

        }


        const results =
            Array.isArray(data.results)
                ? data.results
                : [];


        /* ========================================
           NO RESULT
        ======================================== */

        if (
            results.length === 0
        ) {

            console.log(
                "No result found for this student."
            );

            loadLocalResult();

            displayResult();

            return;

        }


        /* ========================================
           LATEST RESULT
        ======================================== */

        results.sort(
            function (a, b) {

                return (
                    Number(b.id || 0) -
                    Number(a.id || 0)
                );

            }
        );


        const latestResult =
            results[0];


        console.log(
            "Latest result:",
            latestResult
        );


        /* ========================================
           GET COMPLETE RESULT
           INCLUDING ANSWERS
        ======================================== */

        let detailedResult = null;


        if (
            latestResult.id
        ) {

            try {

                const detailResponse =
                    await fetch(
                        `${API_URL}/results/${latestResult.id}`
                    );


                const detailData =
                    await detailResponse.json();


                console.log(
                    "Detailed result API response:",
                    detailData
                );


                if (
                    detailResponse.ok &&
                    detailData.success
                ) {

                    /*
                       IMPORTANT:

                       Backend returns the actual
                       detailed result inside:

                       detailData.result
                    */

                    detailedResult =
                        detailData.result ||
                        null;


                    console.log(
                        "Detailed result object:",
                        detailedResult
                    );


                    if (
                        detailedResult &&
                        Array.isArray(
                            detailedResult.answers
                        )
                    ) {

                        console.log(
                            "Answer rows received:",
                            detailedResult.answers.length
                        );

                    } else {

                        console.warn(
                            "No answer rows found in detailed result."
                        );

                    }

                }

            } catch (detailError) {

                console.error(
                    "Detailed result error:",
                    detailError
                );

            }

        }


        /* ========================================
           CREATE FRONTEND RESULT
        ======================================== */

        resultData = {

            id:
                Number(
                    latestResult.id
                ),


            studentId:
                Number(
                    latestResult.user_id ||
                    currentStudent.id
                ),


            examId:
                Number(
                    latestResult.exam_id
                ),


            examName:
                latestResult.exam_name ||
                "Examination",


            totalQuestions:
                Number(
                    latestResult.total_questions
                ) || 0,


            attempted:
                Number(
                    latestResult.attempted
                ) || 0,


            correct:
                Number(
                    latestResult.correct
                ) || 0,


            wrong:
                Number(
                    latestResult.wrong
                ) || 0,


            marks:
                Number(
                    latestResult.marks
                ) || 0,


            percentage:
                Number(
                    latestResult.percentage
                ) || 0,


            submittedAt:
                latestResult.submitted_at ||
                null,


            answers: [],


            questions: []

        };


        /* ========================================
           BUILD ANSWERS + QUESTIONS
        ======================================== */

        if (
            detailedResult &&
            Array.isArray(
                detailedResult.answers
            )
        ) {

            const answers =
                detailedResult.answers;


            /*
               Student selected answers
            */

            resultData.answers =
                answers.map(
                    function (answer) {

                        if (
                            answer.selected_answer ===
                            null ||
                            answer.selected_answer ===
                            undefined
                        ) {

                            return null;

                        }


                        return Number(
                            answer.selected_answer
                        );

                    }
                );


            /*
               Question-wise review data
            */

            resultData.questions =
                answers.map(
                    function (answer) {

                        return {

                            id:
                                Number(
                                    answer.question_id
                                ),


                            question:
                                answer.question ||
                                "",


                            options: [

                                answer.option_a ||
                                "",

                                answer.option_b ||
                                "",

                                answer.option_c ||
                                "",

                                answer.option_d ||
                                ""

                            ],


                            correctAnswer:
                                Number(
                                    answer.correct_answer
                                )

                        };

                    }
                );


            console.log(
                "ANSWER REVIEW QUESTIONS:",
                resultData.questions
            );


            console.log(
                "STUDENT ANSWERS:",
                resultData.answers
            );

        } else {

            console.warn(
                "Detailed result did not contain answer data."
            );

        }


        /* ========================================
           SAVE RESULT LOCALLY
        ======================================== */

        localStorage.setItem(
            "oesLatestResult",
            JSON.stringify(
                resultData
            )
        );


        /* ========================================
           DISPLAY
        ======================================== */

        displayResult();


        console.log(
            "OES Final Result:",
            resultData
        );


    } catch (error) {

        console.error(
            "Error loading result:",
            error
        );


        loadLocalResult();


        displayResult();

    }

}