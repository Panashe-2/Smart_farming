
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const submitButton = registerForm.querySelector('button[type="submit"]');

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.textContent = "";

if (password.length < 12) {
    message.textContent =
        "Password must contain at least 12 characters.";
    return;
}

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    try {
        const { data, error } = await farmSenseAuth.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            message.textContent = error.message;
            return;
        }

        if (data.user) {
            message.textContent =
                "Registration submitted. Please check your email to confirm your account.";
            registerForm.reset();
        } else {
            message.textContent =
                "Could not complete registration. Please try again.";
        }

    } catch (error) {
        message.textContent =
            "Unable to connect to Supabase. Please try again.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
    }
});
