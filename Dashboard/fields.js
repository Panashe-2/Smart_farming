const API_URL = "http://localhost:3000/api";

const addFieldButton = document.getElementById("addFieldButton");
const fieldFilter = document.getElementById("fieldFilter");
const fieldGrid = document.getElementById("fieldGrid");
const totalFields = document.getElementById("totalFields");
const logoutButton = document.getElementById("logoutButton");

function updateFieldCount() {
    const fieldCards = fieldGrid.querySelectorAll(".field-card");
    totalFields.textContent = fieldCards.length;
}

function createFieldCard(field) {
    const fieldCard = document.createElement("article");
    const statusClass = field.status.toLowerCase();

    fieldCard.className = "field-card";
    fieldCard.dataset.id = field.id;
    fieldCard.dataset.status = statusClass;

    fieldCard.innerHTML = `
        <div class="field-card-header">
            <div>
                <p>Field ${String(field.id).padStart(2, "0")}</p>
                <h3>${field.name}</h3>
            </div>

            <span class="field-status ${statusClass}">
                ${field.status}
            </span>
        </div>

        <div class="field-details">
            <div>
                <span>Crop</span>
                <strong>${field.crop}</strong>
            </div>

            <div>
                <span>Area</span>
                <strong>${field.area} hectares</strong>
            </div>

            <div>
                <span>Soil moisture</span>
                <strong>${field.soilMoisture}%</strong>
            </div>

            <div>
                <span>Temperature</span>
                <strong>${field.temperature}°C</strong>
            </div>
        </div>

        <button type="button" class="view-field-button">
            View field details
        </button>
    `;

    return fieldCard;
}

async function loadFields() {
    try {
        const response = await fetch(`${API_URL}/fields`);

        if (!response.ok) {
            throw new Error("Unable to load fields");
        }

        const result = await response.json();

        fieldGrid.innerHTML = "";

        result.data.forEach(function (field) {
            fieldGrid.appendChild(createFieldCard(field));
        });

        updateFieldCount();
    } catch (error) {
        console.error(error);
        alert(
            "The fields could not be loaded. Make sure the backend server is running."
        );
    }
}

fieldFilter.addEventListener("change", function () {
    const selectedStatus = fieldFilter.value.toLowerCase();
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

addFieldButton.addEventListener("click", function () {
    alert(
        "Adding fields will be connected to the backend in the next step."
    );
});

fieldGrid.addEventListener("click", async function (event) {
    if (!event.target.classList.contains("view-field-button")) {
        return;
    }

    const fieldCard = event.target.closest(".field-card");
    const fieldId = fieldCard.dataset.id;

    try {
        const response = await fetch(`${API_URL}/fields/${fieldId}`);

        if (!response.ok) {
            throw new Error("Field not found");
        }

        const result = await response.json();
        const field = result.data;

        alert(
            `${field.name}\n` +
            `Crop: ${field.crop}\n` +
            `Area: ${field.area} hectares\n` +
            `Soil moisture: ${field.soilMoisture}%\n` +
            `Temperature: ${field.temperature}°C\n` +
            `Status: ${field.status}`
        );
    } catch (error) {
        console.error(error);
        alert("The field details could not be loaded.");
    }
});

logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});

loadFields();