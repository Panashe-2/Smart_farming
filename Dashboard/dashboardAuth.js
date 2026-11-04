
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const { data, error } = await farmSenseAuth.auth.getUser();

        if (error || !data.user) {
            window.location.replace("index.html");
            return;
        }

        const user = data.user;

        const fullName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Farmer";

        const firstName = fullName.split(" ")[0];

        const farmerName =
            document.getElementById("farmerName");

        if (farmerName) {
            farmerName.textContent = firstName;
        }

        const profileName =
            document.querySelector(".user-profile strong");

        if (profileName) {
            profileName.textContent = fullName;
        }

        const profileInitials =
            document.querySelector(".user-initials");

        if (profileInitials) {
            profileInitials.textContent = fullName
                .split(/\s+/)
                .slice(0, 2)
                .map(part => part.charAt(0))
                .join("")
                .toUpperCase();
        }

    } catch (error) {
        console.error("Authentication check failed.");
        window.location.replace("index.html");
    }
    
});
