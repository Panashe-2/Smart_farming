
// SHOW OR HIDE PASSWORD


const passwordInput =
    document.getElementById("password");

const toggleEye =
    document.getElementById("toggleEye");

toggleEye.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});


// TEMPORARY LOGIN


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const statusMessage =
    document.getElementById("statusMsg");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        statusMessage.textContent =
            "Please enter your email and password.";

        return;
    }

    if (password.length < 6) {
        statusMessage.textContent =
            "The password must contain at least six characters.";

        return;
    }

    // Temporarily save the user's email in the browser
    localStorage.setItem("farmSenseUserEmail", email);

    statusMessage.textContent =
        "Signed in successfully. Opening dashboard...";

    // Open the dashboard after one second
    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 1000);
});