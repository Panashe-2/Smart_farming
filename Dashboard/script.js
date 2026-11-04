

// Show or hide password
const passwordInput = document.getElementById("password");
const toggleEye = document.getElementById("toggleEye");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const statusMessage = document.getElementById("statusMsg");
const submitButton = loginForm.querySelector('[type="submit"]');

toggleEye.addEventListener("click", function () {
    passwordInput.type =
        passwordInput.type === "password"
            ? "text"
            : "password";
});

// Real Supabase login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    statusMessage.textContent = "";

    if (!email || !password) {
        statusMessage.textContent =
            "Please enter your email and password.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    try {
        const { data, error } =
            await farmSenseAuth.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            statusMessage.textContent =
                "Login failed. Check your email, password, or email confirmation.";
            return;
        }

        if (!data.user) {
            statusMessage.textContent =
                "Unable to verify your account.";
            return;
        }

        statusMessage.textContent =
            "Login successful! Opening dashboard...";

        window.location.href = "http://127.0.0.1:5500/dashboard.html";

    } catch (error) {
        statusMessage.textContent =
            "Unable to connect. Please try again.";

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Sign in to FarmSense";
    }
});
