
// FARMSENSE MAIZE SUITABILITY PREDICTION

const maizeForm =
    document.getElementById("maizeSuitabilityForm");

const maizeResult =
    document.getElementById("maizeSuitabilityResult");

const maizeButton =
    document.getElementById("maizeSuitabilityButton");

const maizeFeatures = [
    "avg_season_gdd",
    "avg_season_ai",
    "avg_season_tavg",
    "season_prec",
    "season_prec_1",
    "season_prec_2",
    "season_prec_3",
    "elev",
    "twi",
    "soil_rzpawhc",
    "soil_clay",
    "soil_pH",
    "soil_orgC",
    "soil_ECEC",
    "N_kg_ha",
    "P_kg_ha"
];

if (maizeForm && maizeResult && maizeButton) {

    maizeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const payload = {
            zone_id: document
                .getElementById("maizeZoneId")
                .value.trim()
        };

        if (!payload.zone_id) {
            maizeResult.textContent =
                "Please enter a Farm Zone ID.";
            return;
        }

        // Read all 16 ML measurements.
        for (const feature of maizeFeatures) {
            const input = document.getElementById(feature);

            if (!input || input.value.trim() === "") {
                maizeResult.textContent =
                    "Please complete all 16 measurements.";
                return;
            }

            const value = Number(input.value);

            if (!Number.isFinite(value)) {
                maizeResult.textContent =
                    "Please enter valid numeric measurements.";
                return;
            }

            payload[feature] = value;
        }

        if (payload.soil_pH < 0 || payload.soil_pH > 14) {
            maizeResult.textContent =
                "Soil pH must be between 0 and 14.";
            return;
        }

        maizeButton.disabled = true;
        maizeButton.textContent = "Predicting...";

        maizeResult.textContent =
            "Analysing maize suitability...";

        try {
            const response = await fetch(
                "http://localhost:3000/api/ml/maize-suitability",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    
body: JSON.stringify({
    zone_id: payload.zone_id,
    measurements: Object.fromEntries(
        maizeFeatures.map(feature => [
            feature,
            payload[feature]
        ])
    )
})

                }
            );

            const result = await response.json();

            if (!response.ok) {
                console.error(
                    "Maize suitability API error:",
                    result
                );

                maizeResult.textContent =
                    "Prediction failed: " +
                    JSON.stringify(result);
                return;
            }

            console.log(
                "Maize suitability response:",
                result
            );

            // Check common prediction response structures.
            const prediction =
                result.prediction ??
                result.suitability ??
                result.predicted_class ??
                result.result?.prediction ??
                result.result?.suitability ??
                result.output?.prediction;

            const confidence =
                result.confidence ??
                result.confidence_score ??
                result.result?.confidence ??
                result.output?.confidence;

            if (
                prediction !== undefined &&
                prediction !== null &&
                typeof prediction !== "object"
            ) {
                let message =
                    "Maize suitability: " +
                    String(prediction);

                if (
                    confidence !== undefined &&
                    confidence !== null &&
                    Number.isFinite(Number(confidence))
                ) {
                    const numericConfidence =
                        Number(confidence);

                    const percentage =
                        numericConfidence <= 1
                            ? numericConfidence * 100
                            : numericConfidence;

                    message +=
                        " | Confidence: " +
                        percentage.toFixed(2) +
                        "%";
                }

                maizeResult.textContent =
                    message +
                    " | Advisory prediction only.";

            } else {
                maizeResult.textContent =
                    "The server responded successfully, " +
                    "but the prediction field needs to " +
                    "be mapped. Check the Console.";
            }

        } catch (error) {
            console.error(
                "Maize suitability connection error:",
                error
            );

            maizeResult.textContent =
                "Unable to connect to the ML service. " +
                "Check Node.js and Django.";

        } finally {
            maizeButton.disabled = false;
            maizeButton.textContent =
                "Predict Maize Suitability";
        }
    });
}
