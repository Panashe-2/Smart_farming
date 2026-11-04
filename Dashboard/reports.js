
// FARMSENSE REPORTS PAGE

const REPORTS_API_URL = "http://localhost:3000/api/reports";

const generateReportButton =
    document.getElementById("generateReportButton");

const reportForm =
    document.getElementById("reportForm");

const reportType =
    document.getElementById("reportType");

const reportField =
    document.getElementById("reportField");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const reportMessage =
    document.getElementById("reportMessage");

const totalReports =
    document.getElementById("totalReports");

const logoutButton =
    document.getElementById("logoutButton");

const farmerLabel =
    document.getElementById("farmerLabel");

let reportCount = 0;
let authenticatedUser = null;


// CHECK SUPABASE LOGIN

async function checkReportsAuthentication() {
    if (typeof farmSenseAuth === "undefined") {
        if (farmerLabel) {
            farmerLabel.textContent =
                "Unable to load authentication.";
        }

        if (reportForm) {
            reportForm.querySelector(
                'button[type="submit"]'
            ).disabled = true;
        }

        return;
    }

    try {
        const { data, error } =
            await farmSenseAuth.auth.getUser();

        if (error || !data.user) {
            window.location.replace("index.html");
            return;
        }

        authenticatedUser = data.user;

        const fullName =
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Farmer";

        if (farmerLabel) {
            farmerLabel.textContent =
                "Signed in as " + fullName;
        }

    } catch (error) {
        console.error("Authentication check failed.");

        window.location.replace("index.html");
    }
}


// OPEN REPORT FORM

if (generateReportButton && reportForm) {
    generateReportButton.addEventListener(
        "click",
        function () {
            reportForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            if (reportType) {
                reportType.focus();
            }
        }
    );
}


// GENERATE REPORT

if (reportForm) {
    reportForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (!authenticatedUser) {
                reportMessage.textContent =
                    "Please sign in to generate a report.";
                return;
            }

            const type = reportType.value.trim();
            const field = reportField.value.trim();
            const start = startDate.value;
            const end = endDate.value;

            if (!type || !field || !start || !end) {
                reportMessage.textContent =
                    "Please complete all report fields.";
                return;
            }

            if (start > end) {
                reportMessage.textContent =
                    "The start date cannot be after the end date.";
                return;
            }

            const submitButton = reportForm.querySelector(
                'button[type="submit"]'
            );

            submitButton.disabled = true;
            submitButton.textContent = "Generating...";

            reportMessage.textContent =
                "Loading report data...";

            try {
                // Parameters are supplied to the backend.
                // The backend must implement filtering.
                const url = new URL(REPORTS_API_URL);

                url.searchParams.set("type", type);
                url.searchParams.set("field", field);
                url.searchParams.set("startDate", start);
                url.searchParams.set("endDate", end);

                const response = await fetch(
                    url.toString(),
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Backend returned HTTP " +
                        response.status
                    );
                }

                const result = await response.json();

                const reportData = result.data ?? result;

                if (
                    !reportData ||
                    typeof reportData !== "object" ||
                    Array.isArray(reportData)
                ) {
                    throw new Error(
                        "Invalid report data received."
                    );
                }

                const reportContent =
                    createReportContent(reportData);

                downloadReport(reportContent, type);

                reportCount++;

                if (totalReports) {
                    totalReports.textContent = reportCount;
                }

                reportMessage.textContent =
                    "Report downloaded successfully.";

            } catch (error) {
                console.error("Report error:", error);

                reportMessage.textContent =
                    "Unable to generate the report. " +
                    "Check that the backend is running " +
                    "and that /api/reports is available.";

            } finally {
                submitButton.disabled = false;

                submitButton.textContent =
                    "Generate and Download Report";
            }
        }
    );
}


// HANDLE MISSING VALUES

function displayValue(value, unit = "") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not available";
    }

    return String(value) + unit;
}


// CREATE REPORT CONTENT

function createReportContent(reportData) {
    const generatedDate =
        new Date().toLocaleString();

    return `
FARMSENSE FARM REPORT
============================

Report type: ${reportType.value}
Requested field: ${reportField.value.trim()}
Start date: ${startDate.value}
End date: ${endDate.value}
Generated: ${generatedDate}

FARM SUMMARY
----------------------------

Total fields:
${displayValue(reportData.totalFields)}

Total farming area:
${displayValue(reportData.totalArea, " hectares")}

Healthy fields:
${displayValue(reportData.healthyFields)}

Fields needing attention:
${displayValue(reportData.fieldsNeedingAttention)}

Average soil moisture:
${displayValue(reportData.averageSoilMoisture, "%")}

Total water used:
${displayValue(reportData.totalWaterUsed, " litres")}

GENERAL CONDITION
----------------------------

${createGeneralCondition(reportData)}

IMPORTANT
----------------------------

This report contains values returned
by the FarmSense backend.

Field and date filters only apply if
supported by the backend endpoint.

Values must not be treated as live
sensor measurements unless verified.
Machine-learning results are advisory.

END OF REPORT
`;
}


// CREATE GENERAL CONDITION

function createGeneralCondition(reportData) {
    const attention =
        Number(reportData.fieldsNeedingAttention);

    if (
        reportData.fieldsNeedingAttention === null ||
        reportData.fieldsNeedingAttention === undefined ||
        !Number.isFinite(attention)
    ) {
        return "Condition data is not available.";
    }

    if (attention === 0) {
        return "No fields are currently flagged for attention.";
    }

    if (attention === 1) {
        return "One field requires monitoring and inspection.";
    }

    return (
        attention +
        " fields require monitoring and inspection."
    );
}


// DOWNLOAD TEXT REPORT

function downloadReport(reportContent, reportName) {
    const reportFile = new Blob(
        [reportContent],
        { type: "text/plain;charset=utf-8" }
    );

    const safeName = reportName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const fileUrl = URL.createObjectURL(reportFile);

    const downloadLink =
        document.createElement("a");

    downloadLink.href = fileUrl;
    downloadLink.download =
        "farmsense-" + safeName + "-report.txt";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();

    setTimeout(function () {
        URL.revokeObjectURL(fileUrl);
    }, 1000);
}


// LOG OUT USING SUPABASE AUTH

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        async function () {
            const shouldLogout = confirm(
                "Are you sure you want to log out?"
            );

            if (!shouldLogout) {
                return;
            }

            if (typeof farmSenseAuth === "undefined") {
                alert(
                    "Authentication is unavailable. " +
                    "Please refresh the page."
                );
                return;
            }

            logoutButton.disabled = true;

            try {
                const { error } =
                    await farmSenseAuth.auth.signOut();

                if (error) {
                    throw error;
                }

                localStorage.removeItem(
                    "farmSenseUserEmail"
                );

                window.location.replace("index.html");

            } catch (error) {
                console.error("Logout error:", error);

                alert(
                    "Unable to log out. Please try again."
                );

                logoutButton.disabled = false;
            }
        }
    );
}


// INITIALIZE PAGE

checkReportsAuthentication();
