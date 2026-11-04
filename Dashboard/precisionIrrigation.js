
// FARMSENSE PRECISION IRRIGATION
// ML prediction only - does not control irrigation equipment

const precisionForm =
    document.getElementById("precisionIrrigationForm");

const precisionResult =
    document.getElementById("precisionIrrigationResult");

const precisionButton =
    document.getElementById("mlPredictButton");

if (precisionForm && precisionResult && precisionButton) {

    precisionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const soilMoisture = Number(
            document.getElementById("mlSoilMoisture").value
        );

        const humidity = Number(
            document.getElementById("mlHumidity").value
        );

        const temperature = Number(
            document.getElementById("mlTemperature").value
        );

        if (
            !Number.isFinite(soilMoisture) ||
            !Number.isFinite(humidity) ||
            !Number.isFinite(temperature) ||
            soilMoisture < 0 ||
            soilMoisture > 100 ||
            humidity < 0 ||
            humidity > 100 ||
            temperature < -20 ||
            temperature > 60
        ) {
            precisionResult.textContent =
                "Please enter valid measurements.";
            return;
        }

        precisionButton.disabled = true;
        precisionButton.textContent = "Calculating...";

        precisionResult.textContent =
            "Generating irrigation estimate...";

        try {
            const response = await fetch(
                "http://localhost:3000/api/ml/irrigation",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    
body: JSON.stringify({
    zone_id: "zone-1",
    soil_moisture: soilMoisture,
    humidity: humidity,
    temperature: temperature
})

                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    "ML endpoint returned HTTP " + response.status
                );
            }

            // Support the expected response fields.
           
const rawEstimate = data.water_required_liters;


            if (
                rawEstimate === null ||
                rawEstimate === undefined ||
                rawEstimate === "" ||
                !Number.isFinite(Number(rawEstimate))
            ) {
                console.error("Unexpected irrigation response:", data);

                precisionResult.textContent =
                    "The server responded, but the water estimate " +
                    "was missing. Check the Console.";
                return;
            }

            const estimatedLitres = Number(rawEstimate);

            precisionResult.textContent =
                "Estimated water requirement: " +
                estimatedLitres.toFixed(2) +
                " litres. Demonstration estimate only.";

        } catch (error) {
            console.error("Irrigation ML error:", error);

            precisionResult.textContent =
                "Unable to generate the estimate. " +
                "Check that Node.js and Django are running.";

        } finally {
            precisionButton.disabled = false;

            precisionButton.textContent =
                "Estimate Water Requirement";
        }
    });
}
