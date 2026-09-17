// Get the Fields page elements
const addFieldButton = document.getElementById("addFieldButton");
const fieldFilter = document.getElementById("fieldFilter");
const fieldGrid = document.getElementById("fieldGrid");
const totalFields = document.getElementById("totalFields");
const logoutButton = document.getElementById("logoutButton");

// Count the field cards currently displayed
function updateFieldCount() {
    const fieldCards = fieldGrid.querySelectorAll(".field-card");
    totalFields.textContent = fieldCards.length;
}

// Filter fields according to their status
fieldFilter.addEventListener("change", function () {
    const selectedStatus = fieldFilter.value;
    const fieldCards = fieldGrid.querySelectorAll(".field-card");

    fieldCards.forEach(function (fieldCard) {
        const fieldStatus = fieldCard.dataset.status;

        if (
            selectedStatus === "all" ||
            selectedStatus === fieldStatus
        ) {
            fieldCard.style.display = "block";
        } else {
            fieldCard.style.display = "none";
        }
    });
});

// Add a temporary field
addFieldButton.addEventListener("click", function () {
    const fieldName = prompt("Enter the field name:");

    if (fieldName === null || fieldName.trim() === "") {
        return;
    }

    const cropName = prompt("Enter the crop name:");

    if (cropName === null || cropName.trim() === "") {
        return;
    }

    const fieldArea = prompt("Enter the field area in hectares:");

    if (
        fieldArea === null ||
        fieldArea.trim() === "" ||
        isNaN(fieldArea) ||
        Number(fieldArea) <= 0
    ) {
        alert("Please enter a valid field area.");
        return;
    }

    const fieldNumber =
        fieldGrid.querySelectorAll(".field-card").length + 1;

    const newFieldCard = document.createElement("article");

    newFieldCard.className = "field-card";
    newFieldCard.dataset.status = "healthy";

    newFieldCard.innerHTML = `
        <div class="field-card-header">
            <div>
                <p>Field ${String(fieldNumber).padStart(2, "0")}</p>
                <h3>${fieldName}</h3>
            </div>

            <span class="field-status healthy">
                Healthy
            </span>
        </div>

        <div class="field-details">
            <div>
                <span>Crop</span>
                <strong>${cropName}</strong>
            </div>

            <div>
                <span>Area</span>
                <strong>${fieldArea} hectares</strong>
            </div>

            <div>
                <span>Soil moisture</span>
                <strong>Waiting for data</strong>
            </div>

            <div>
                <span>Temperature</span>
                <strong>Waiting for data</strong>
            </div>
        </div>

        <button type="button"
                class="view-field-button">
            View field details
        </button>
    `;

    fieldGrid.appendChild(newFieldCard);

    updateFieldCount();

    alert("The field was added temporarily.");
});

// Open field details
fieldGrid.addEventListener("click", function (event) {
    if (event.target.classList.contains("view-field-button")) {
        const fieldCard = event.target.closest(".field-card");
        const fieldName = fieldCard.querySelector("h3").textContent;

        alert(
            fieldName +
            " details will be connected to live data later."
        );
    }
});

// Log out and return to the login page
logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});

// Set the correct number when the page loads
updateFieldCount();