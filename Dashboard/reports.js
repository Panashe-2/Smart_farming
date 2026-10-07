
// FARMSENSE REPORTS PAGE

const REPORTS_API_URL =
    "http://localhost:3000/api/reports";


// GET REPORT PAGE ELEMENTS

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

let reportCount =
    Number(totalReports.textContent) || 0;


// MOVE TO THE REPORT FORM

generateReportButton.addEventListener(
    "click",
    function () {
        reportForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        reportType.focus();
    }
);


// GENERATE REPORT USING BACKEND DATA

reportForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        if (
            reportType.value === "" ||
            reportField.value === "" ||
            startDate.value === "" ||
            endDate.value === ""
        ) {
            reportMessage.textContent =
                "Please complete all report fields.";

            return;
        }

        if (
            new Date(startDate.value) >
            new Date(endDate.value)
        ) {
            reportMessage.textContent =
                "The start date cannot be after the end date.";

            return;
        }

        reportMessage.textContent =
            "Generating report...";

        try {
            const response = await fetch(
                REPORTS_API_URL
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load report data"
                );
            }

            const result = await response.json();
            const reportData = result.data;

            const reportContent =
                createReportContent(reportData);

            downloadReport(reportContent);

            reportCount++;
            totalReports.textContent =
                reportCount;

            reportMessage.textContent =
                "The report was created successfully.";
        } catch (error) {
            console.error(error);

            reportMessage.textContent =
                "The report could not be created. " +
                "Make sure the backend server is running.";
        }
    }
);


// PREPARE REPORT CONTENT

function createReportContent(reportData) {
    const generatedDate =
        new Date().toLocaleString();

    return `
FARMSENSE FARM REPORT

Report type: ${reportType.value}
Field: ${reportField.value}
Start date: ${startDate.value}
End date: ${endDate.value}
Generated: ${generatedDate}

FARM SUMMARY

Total fields: ${reportData.totalFields}
Total farming area: ${reportData.totalArea} hectares
Healthy fields: ${reportData.healthyFields}
Fields needing attention: ${reportData.fieldsNeedingAttention}
Average soil moisture: ${reportData.averageSoilMoisture}%
Total water used: ${reportData.totalWaterUsed} litres

GENERAL CONDITION

${createGeneralCondition(reportData)}

IMPORTANT

This report uses information supplied by the FarmSense
backend. Database and live sensor integration will be
added in the next development stage.
`;
}


// CREATE GENERAL CONDITION

function createGeneralCondition(reportData) {
    if (
        reportData.fieldsNeedingAttention === 0
    ) {
        return (
            "All registered fields are currently healthy."
        );
    }

    if (
        reportData.fieldsNeedingAttention === 1
    ) {
        return (
            "One field requires monitoring and inspection."
        );
    }

    return (
        reportData.fieldsNeedingAttention +
        " fields require monitoring and inspection."
    );
}


// DOWNLOAD REPORT

function downloadReport(reportContent) {
    const reportFile =
        new Blob(
            [reportContent],
            {
                type: "text/plain"
            }
        );

    const downloadLink =
        document.createElement("a");

    const reportName =
        reportType.value
            .replaceAll(" ", "-")
            .toLowerCase();

    const fileUrl =
        URL.createObjectURL(reportFile);

    downloadLink.href = fileUrl;

    downloadLink.download =
        reportName + "-report.txt";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(fileUrl);
}


// LOG OUT

logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});