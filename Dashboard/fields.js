
const addFieldButton = document.getElementById("addFieldButton");
const fieldFilter = document.getElementById("fieldFilter");
const fieldGrid = document.getElementById("fieldGrid");
const totalFields = document.getElementById("totalFields");
const logoutButton = document.getElementById("logoutButton");

function getSupabase() {
    if (typeof farmSenseAuth === "undefined") {
        throw new Error("Supabase is not connected.");
    }

    return farmSenseAuth;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function getFarmer() {
    const db = getSupabase();
    const { data, error } = await db.auth.getUser();

    if (error || !data.user) {
        window.location.href = "index.html";
        throw new Error("Please log in first.");
    }

    return data.user;
}

function updateFieldCount() {
    if (totalFields) {
        totalFields.textContent =
            fieldGrid.querySelectorAll(".field-card").length;
    }
}

function filterFields() {
    if (!fieldFilter) return;

    const selected = fieldFilter.value.toLowerCase();

    document.querySelectorAll(".field-card").forEach(card => {
        card.style.display =
            selected === "all" || card.dataset.status === selected
                ? ""
                : "none";
    });
}

function createFieldCard(field) {
    const card = document.createElement("article");

    const status = field.status || "Healthy";
    const statusClass = status.toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

    card.className = "field-card";
    card.dataset.id = field.id;
    card.dataset.status = statusClass;

    card.innerHTML = `
        <div class="field-card-header">
            <div>
                <p>Field ${String(field.id).padStart(2, "0")}</p>
                <h3>${escapeHTML(field.zone_name)}</h3>
            </div>
            <span class="field-status ${statusClass}">
                ${escapeHTML(status)}
            </span>
        </div>

        <div class="field-details">
            <div>
                <span>Crop</span>
                <strong>${escapeHTML(field.crop_type || "Not specified")}</strong>
            </div>
            <div>
                <span>Area</span>
                <strong>${escapeHTML(field.area_hectares ?? 0)} hectares</strong>
            </div>
            <div>
                <span>Soil moisture</span>
                <strong>${escapeHTML(field.soil_moisture ?? 0)}%</strong>
            </div>
            <div>
                <span>Temperature</span>
                <strong>${escapeHTML(field.temperature ?? 0)}°C</strong>
            </div>
        </div>

        <button type="button" class="view-field-button">
            View field details
        </button>
    `;

    return card;
}

async function loadFields() {
    if (!fieldGrid) return;

    try {
        const db = getSupabase();
        const farmer = await getFarmer();

        const { data, error } = await db
            .from("farm_zones")
            .select("*")
            .eq("owner_id", farmer.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        fieldGrid.innerHTML = "";

        data.forEach(field => {
            fieldGrid.appendChild(createFieldCard(field));
        });

        updateFieldCount();
        filterFields();

    } catch (error) {
        console.error("Loading fields failed:", error);
        fieldGrid.textContent = "Unable to load your fields.";
    }
}

function openAddField() {
    document.getElementById("newFieldModal")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "newFieldModal";

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        z-index: 99999;
    `;

    overlay.innerHTML = `
        <div role="dialog" aria-modal="true"
             aria-labelledby="addFieldTitle"
             style="background:white; padding:25px; border-radius:15px;
                    width:100%; max-width:550px; max-height:90vh;
                    overflow-y:auto; box-sizing:border-box; color:#173b29;">

            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h2 id="addFieldTitle">Add New Field</h2>
                <button type="button" id="closeField"
                        aria-label="Close">✕</button>
            </div>

            <form id="fieldForm">
                <label for="fieldName">Field Name</label>
                <input id="fieldName" type="text"
                       placeholder="West Maize Field" required>

                <label for="cropType">Crop Type</label>
                <select id="cropType">
                    <option value="Corn">Corn / Maize</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Soybeans">Soybeans</option>
                    <option value="Other">Other</option>
                </select>

                <label for="fieldArea">Area (Hectares)</label>
                <input id="fieldArea" type="text"
                       inputmode="decimal" placeholder="1.05" required>

                <label for="soilType">Soil Type</label>
                <select id="soilType">
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Silty">Silty</option>
                    <option value="Other">Other</option>
                </select>

                <label for="soilMoisture">Soil Moisture (%)</label>
                <input id="soilMoisture" type="number"
                       min="0" max="100" value="0" required>

                <label for="temperature">Temperature (°C)</label>
                <input id="temperature" type="number"
                       step="any" value="0" required>

                <button type="button" id="previewField">
                    Preview Field
                </button>

                <button type="submit" id="saveField"
                        style="background:#245234;color:white;">
                    Save Field
                </button>

                <div id="fieldPreview"
                     style="margin-top:15px;padding:12px;
                            background:#edf4ec;display:none;">
                </div>

                <p id="fieldMessage" role="status"
                   aria-live="polite"></p>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const modal = overlay.querySelector('[role="dialog"]');
    const inputs = modal.querySelectorAll("input, select");
    const buttons = modal.querySelectorAll("form button");

    inputs.forEach(input => {
        input.style.cssText = `
            display:block;
            width:100%;
            box-sizing:border-box;
            padding:12px;
            margin:8px 0 15px;
            border:1px solid #ccc;
            border-radius:8px;
            font:inherit;
        `;
    });

    buttons.forEach(button => {
        button.style.padding = "12px";
        button.style.margin = "6px 6px 6px 0";
        button.style.borderRadius = "8px";
        button.style.cursor = "pointer";
    });

    const closeModal = () => overlay.remove();

    overlay.querySelector("#closeField").onclick = closeModal;

    overlay.onclick = event => {
        if (event.target === overlay) closeModal();
    };

    const form = overlay.querySelector("#fieldForm");
    const preview = overlay.querySelector("#fieldPreview");
    const message = overlay.querySelector("#fieldMessage");
    const saveButton = overlay.querySelector("#saveField");

    function getFieldData() {
        const areaText = overlay.querySelector("#fieldArea")
            .value.trim().replace(",", ".");

        return {
            zone_name: overlay.querySelector("#fieldName").value.trim(),
            crop_type: overlay.querySelector("#cropType").value,
            area_hectares: areaText === "" ? NaN : Number(areaText),
            soil_type: overlay.querySelector("#soilType").value,
            soil_moisture: Number(
                overlay.querySelector("#soilMoisture").value
            ),
            temperature: Number(
                overlay.querySelector("#temperature").value
            ),
            status: "Healthy"
        };
    }

    function validateField(field) {
        if (!field.zone_name) {
            return "Please enter a field name.";
        }

        if (!Number.isFinite(field.area_hectares) ||
            field.area_hectares <= 0) {
            return "Area must be greater than zero.";
        }

        if (!Number.isFinite(field.soil_moisture) ||
            field.soil_moisture < 0 ||
            field.soil_moisture > 100) {
            return "Soil moisture must be between 0 and 100.";
        }

        if (!Number.isFinite(field.temperature)) {
            return "Please enter a valid temperature.";
        }

        return null;
    }

    overlay.querySelector("#previewField").onclick = () => {
        const field = getFieldData();
        const error = validateField(field);

        if (error) {
            message.textContent = error;
            return;
        }

        message.textContent = "";
        preview.style.display = "block";

        preview.innerHTML = `
            <strong>Field preview (not saved)</strong>
            <p>Name: ${escapeHTML(field.zone_name)}</p>
            <p>Crop: ${escapeHTML(field.crop_type)}</p>
            <p>Area: ${escapeHTML(field.area_hectares)} hectares</p>
            <p>Soil: ${escapeHTML(field.soil_type)}</p>
            <p>Moisture: ${escapeHTML(field.soil_moisture)}%</p>
            <p>Temperature: ${escapeHTML(field.temperature)}°C</p>
        `;
    };

    form.onsubmit = async event => {
        event.preventDefault();

        const field = getFieldData();
        const error = validateField(field);

        if (error) {
            message.textContent = error;
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const db = getSupabase();
            const farmer = await getFarmer();

            const { error: saveError } = await db
                .from("farm_zones")
                .insert({
                    ...field,
                    owner_id: farmer.id
                });

            if (saveError) throw saveError;

            await loadFields();
            closeModal();

        } catch (error) {
            console.error("Saving field failed:", error);
            message.textContent = error.message;
            message.style.color = "red";

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Field";
        }
    };

    overlay.querySelector("#fieldName").focus();
}

if (addFieldButton) {
    document.addEventListener("click", event => {
        if (addFieldButton.contains(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            openAddField();
        }
    }, true);
}

if (fieldFilter) {
    fieldFilter.addEventListener("change", filterFields);
}

if (fieldGrid) {
    fieldGrid.addEventListener("click", async event => {
        const button = event.target.closest(".view-field-button");

        if (!button) return;

        const card = button.closest(".field-card");
        if (!card) return;

        try {
            const db = getSupabase();
            const farmer = await getFarmer();

            const { data, error } = await db
                .from("farm_zones")
                .select("*")
                .eq("id", card.dataset.id)
                .eq("owner_id", farmer.id)
                .single();

            if (error) throw error;

            alert(
                `Name: ${data.zone_name}\n` +
                `Crop: ${data.crop_type || "Not specified"}\n` +
                `Area: ${data.area_hectares ?? 0} hectares\n` +
                `Soil: ${data.soil_type || "Not specified"}\n` +
                `Moisture: ${data.soil_moisture ?? 0}%\n` +
                `Temperature: ${data.temperature ?? 0}°C\n` +
                `Status: ${data.status || "Healthy"}`
            );

        } catch (error) {
            console.error(error);
            alert("Could not load field details.");
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to log out?")) return;

        try {
            const db = getSupabase();
            const { error } = await db.auth.signOut();

            if (error) throw error;

            window.location.href = "index.html";

        } catch (error) {
            alert("Logout failed: " + error.message);
        }
    });
}

loadFields();
