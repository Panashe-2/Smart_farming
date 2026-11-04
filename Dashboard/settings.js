// Get Settings page elements
const farmProfileForm =
    document.getElementById("farmProfileForm");

const preferencesForm =
    document.getElementById("preferencesForm");

const farmName =
    document.getElementById("farmName");

const managerName =
    document.getElementById("managerName");

const farmLocation =
    document.getElementById("farmLocation");

const contactEmail =
    document.getElementById("contactEmail");

const temperatureUnit =
    document.getElementById("temperatureUnit");

const areaUnit =
    document.getElementById("areaUnit");

const refreshInterval =
    document.getElementById("refreshInterval");

const moistureNotifications =
    document.getElementById("moistureNotifications");

const cropNotifications =
    document.getElementById("cropNotifications");

const profileMessage =
    document.getElementById("profileMessage");

const preferencesMessage =
    document.getElementById("preferencesMessage");

const logoutButton =
    document.getElementById("logoutButton");

// Load settings saved in the browser
function loadSettings() {
    const savedSettings =
        localStorage.getItem("farmSenseSettings");

    if (!savedSettings) {
        return;
    }

    const settings = JSON.parse(savedSettings);

    farmName.value =
        settings.farmName || farmName.value;

    managerName.value =
        settings.managerName || managerName.value;

    farmLocation.value =
        settings.farmLocation || farmLocation.value;

    contactEmail.value =
        settings.contactEmail || contactEmail.value;

    temperatureUnit.value =
        settings.temperatureUnit || "celsius";

    areaUnit.value =
        settings.areaUnit || "hectares";

    refreshInterval.value =
        settings.refreshInterval || "5";

    moistureNotifications.checked =
        settings.moistureNotifications !== false;

    cropNotifications.checked =
        settings.cropNotifications !== false;
}

// Save all current settings
function saveSettings() {
    const settings = {
        farmName: farmName.value.trim(),
        managerName: managerName.value.trim(),
        farmLocation: farmLocation.value.trim(),
        contactEmail: contactEmail.value.trim(),
        temperatureUnit: temperatureUnit.value,
        areaUnit: areaUnit.value,
        refreshInterval: refreshInterval.value,
        moistureNotifications:
            moistureNotifications.checked,
        cropNotifications:
            cropNotifications.checked
    };

    localStorage.setItem(
        "farmSenseSettings",
        JSON.stringify(settings)
    );
}

// Save farm profile
farmProfileForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        if (
            farmName.value.trim() === "" ||
            managerName.value.trim() === "" ||
            farmLocation.value.trim() === "" ||
            contactEmail.value.trim() === ""
        ) {
            profileMessage.textContent =
                "Please complete all profile fields.";

            return;
        }

        saveSettings();

        profileMessage.textContent =
            "Farm profile saved successfully.";
    }
);

// Save dashboard preferences
preferencesForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        saveSettings();

        preferencesMessage.textContent =
            "Dashboard preferences saved successfully.";
    }
);

// Save notification switches when changed
moistureNotifications.addEventListener(
    "change",
    saveSettings
);

cropNotifications.addEventListener(
    "change",
    saveSettings
);

// Log out
logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});

// Load saved settings when the page opens
loadSettings();