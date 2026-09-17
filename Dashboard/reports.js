
// FARMSENSE REPORTS PAGE
// Temporary report generation


// Get report page elements
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

let reportCount = Number(totalReports.textContent);


// MOVE TO THE REPORT FORM


generateReportButton.addEventListener("click", function () {
    reportForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    reportType.focus();
});


// CREATE A TEMPORARY REPORT


reportForm.addEventListener("submit", function (event) {
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

    const reportContent = createReportContent();

    downloadReport(reportContent);

    reportCount++;
    totalReports.textContent = reportCount;

    reportMessage.textContent =
        "The temporary report was created successfully.";
});


// PREPARE REPORT CONTENT


function createReportContent() {
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

Average soil moisture: 68%
Average crop health: 82%
Water usage: 185,400 litres
General condition: Good

IMPORTANT

This report currently uses temporary demonstration data.
Live information will be included when the FarmSense
backend, database and sensor services are connected.
`;
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

    downloadLink.href =
        URL.createObjectURL(reportFile);

    downloadLink.download =
        reportName + "-report.txt";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadLink.href);
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