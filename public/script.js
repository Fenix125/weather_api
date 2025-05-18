const apiBase = "/api";

function capitalizeFirstLetter(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function displayResult(elemId, data, error) {
    const el = document.getElementById(elemId);
    if (error) {
        el.textContent = "Error: " + error;
        el.style.backgroundColor = "#ffebee";
        return;
    }
    if (!data || typeof data !== "object") {
        el.textContent = String(data);
        el.style.backgroundColor = "#e3f2fd";
        return;
    }
    const lines = [];
    for (const [key, val] of Object.entries(data)) {
        const upperKey = capitalizeFirstLetter(key);
        if (val !== null && typeof val === "object") {
            lines.push(`${upperKey}: ${JSON.stringify(val)}`);
        } else {
            lines.push(`${upperKey}: ${val}`);
        }
    }

    el.textContent = lines.join("\n");
    el.style.backgroundColor = "#e3f2fd";
}

async function handleFetchAndDisplay(url, options, elemId) {
    try {
        const res = await fetch(url, options);
        const payload = await res.json();
        if (!res.ok) throw payload.error || res.statusText;
        displayText(elemId, payload);
    } catch (err) {
        displayText(elemId, null, err);
    }
}
document
    .getElementById("weather-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const city = document.getElementById("weather-city").value;
        try {
            const res = await fetch(
                `${apiBase}/weather?city=${encodeURIComponent(city)}`
            );
            const json = await res.json();
            if (!res.ok) throw json.error || res.statusText;
            displayResult("weather-result", json);
        } catch (err) {
            displayResult("weather-result", null, err);
        }
    });

document
    .getElementById("subscribe-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("sub-email").value;
        const city = document.getElementById("sub-city").value;
        const frequency = document.getElementById("sub-frequency").value;
        try {
            const res = await fetch(`${apiBase}/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, city, frequency }),
            });
            const json = await res.json();
            if (!res.ok) throw json.error || res.statusText;
            displayResult("subscribe-result", json);
        } catch (err) {
            displayResult("subscribe-result", null, err);
        }
    });

document
    .getElementById("confirm-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = document.getElementById("confirm-token").value;
        try {
            const res = await fetch(
                `${apiBase}/confirm/${encodeURIComponent(token)}`
            );
            const json = await res.json();
            if (!res.ok) throw json.error || res.statusText;
            displayResult("confirm-result", json);
        } catch (err) {
            displayResult("confirm-result", null, err);
        }
    });

document
    .getElementById("unsubscribe-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = document.getElementById("unsubscribe-token").value;
        try {
            const res = await fetch(
                `${apiBase}/unsubscribe/${encodeURIComponent(token)}`
            );
            const json = await res.json();
            if (!res.ok) throw json.error || res.statusText;
            displayResult("unsubscribe-result", json);
        } catch (err) {
            displayResult("unsubscribe-result", null, err);
        }
    });
