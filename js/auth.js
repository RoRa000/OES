/* ========================================
   OES - Authentication
   Common Authentication Functions
======================================== */


/* ========================================
   LOGOUT
======================================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (event) {

        event.preventDefault();

        // Remove login session data
        localStorage.removeItem("oesToken");
        localStorage.removeItem("oesUserRole");
        localStorage.removeItem("oesUserEmail");
        localStorage.removeItem("oesCurrentStudent");
        localStorage.removeItem("oesStudent");
        localStorage.removeItem("oesLoggedIn");

        window.location.href = "login.html";

    });

}