/* ── AI Weather Prediction — Frontend JS ──────────────────────────────────
   Fetches all data from the Flask backend API and renders the UI.
   No hardcoded data — everything comes from the server.
─────────────────────────────────────────────────────────────────────────── */

let mainChart = null;

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadModelInfo();
  loadTrainingData();
  loadForecast();
});

// ── 1. MODEL INFO ─────────────────────────────────────────────────────────────
async function loadModelInfo() {
  try {
    const res  = await fetch("/api/model-info");
    const data = await res.json();

    document.getElementById("mSlope").textContent     = data.slope;
    document.getElementById("mIntercept").textContent = data.intercept;
    document.getElementById("mR2").textContent        = (data.r2 * 100).toFixed(1) + "%";
    document.getElementById("mRmse").textContent      = data.rmse + "°C";
    document.getElementById("eqFormula").textContent  = `y = ${data.slope}x + ${data.intercept}`;

    document.getElementById("statusBadge").textContent = "● Model Ready";
    document.getElementById("statusBadge").style.color = "#00d4aa";
  } catch (e) {
    document.getElementById("statusBadge").textContent = "● Offline";
    document.getElementById("statusBadge").style.color = "#ff6b4a";
    console.error("Model info error:", e);
  }
}

// ── 2. TRAINING DATA → CHART + TABLE ─────────────────────────────────────────
async function loadTrainingData() {
  try {
    const res  = await fetch("/api/training-data");
    const data = await res.json();
    renderChart(data);
    renderTable(data);
  } catch (e) {
    document.getElementById("tableBody").innerHTML =
      `<tr><td colspan="5" class="tbl-loading" style="color:#ff6b4a">⚠ Failed to load data from backend.</td></tr>`;
    console.error("Training data error:", e);
  }
}

// ── 3. CHART ──────────────────────────────────────────────────────────────────
function renderChart(data) {
  const ctx    = document.getElementById("mainChart");
  const labels = data.map(d => `Day ${d.day}`);
  const obs    = data.map(d => d.observed);
  const pred   = data.map(d => d.predicted);

  if (mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Observed",
          data: obs,
          borderColor: "#1a8fff",
          backgroundColor: "rgba(26,143,255,0.08)",
          pointBackgroundColor: "#1a8fff",
          pointRadius: 5, pointHoverRadius: 7,
          borderWidth: 2, tension: 0.3, fill: true,
        },
        {
          label: "Predicted (Regression)",
          data: pred,
          borderColor: "#00d4aa",
          backgroundColor: "rgba(0,212,170,0.06)",
          pointBackgroundColor: "#00d4aa",
          pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2, borderDash: [6, 3],
          tension: 0, fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: {
        legend: {
          display: true, position: "top",
          labels: { color: "#7a9bc4", font: { family: "DM Mono", size: 11 }, boxWidth: 14, padding: 16 },
        },
        tooltip: {
          backgroundColor: "#0a1628",
          borderColor: "rgba(100,160,255,0.2)", borderWidth: 1,
          titleColor: "#e8f0fe", bodyColor: "#7a9bc4",
          titleFont: { family: "Syne", size: 13 },
          bodyFont: { family: "DM Mono", size: 12 },
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}°C` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#3d6080", font: { family: "DM Mono", size: 10 }, maxRotation: 45 },
          grid: { color: "rgba(100,160,255,0.05)" },
        },
        y: {
          ticks: { color: "#3d6080", font: { family: "DM Mono", size: 11 }, callback: v => v + "°C" },
          grid: { color: "rgba(100,160,255,0.07)" },
          min: 19, max: 33,
        },
      },
    },
  });
}

// ── 4. TABLE ──────────────────────────────────────────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = data.map(row => {
    const errClass = row.error >= 0 ? "err-pos" : "err-neg";
    const errSign  = row.error >= 0 ? "+" : "";
    const accuracy = Math.max(0, 100 - Math.abs(row.error) * 10);
    const accW     = accuracy.toFixed(0);

    return `
      <tr>
        <td><strong>Day ${row.day}</strong></td>
        <td>${row.observed.toFixed(1)}</td>
        <td>${row.predicted.toFixed(2)}</td>
        <td class="${errClass}">${errSign}${row.error.toFixed(2)}</td>
        <td>
          <div class="accuracy-bar">
            <div class="acc-fill" style="width:${accW}px; max-width:80px;"></div>
            <span class="acc-text">${accW}%</span>
          </div>
        </td>
      </tr>`;
  }).join("");
}

// ── 5. FORECAST (Day 16–20) ───────────────────────────────────────────────────
async function loadForecast() {
  try {
    const res  = await fetch("/api/predict-range?start=16&end=20");
    const data = await res.json();
    const preds = data.predictions;

    const minT = Math.min(...preds.map(p => p.predicted_temp));
    const maxT = Math.max(...preds.map(p => p.predicted_temp));

    const html = preds.map(p => {
      const pct = ((p.predicted_temp - minT) / (maxT - minT + 0.01) * 100).toFixed(0);
      return `
        <div class="forecast-item">
          <span class="forecast-day">Day ${p.day}</span>
          <div class="forecast-bar-wrap">
            <div class="forecast-bar" style="width:${pct}%"></div>
          </div>
          <span class="forecast-temp">${p.predicted_temp.toFixed(1)}°C</span>
        </div>`;
    }).join("");

    document.getElementById("forecastList").innerHTML = html;
  } catch (e) {
    document.getElementById("forecastList").innerHTML =
      `<div class="forecast-loading" style="color:#ff6b4a">⚠ Failed to load forecast.</div>`;
  }
}

// ── 6. SINGLE PREDICTION ──────────────────────────────────────────────────────
async function predictSingle() {
  const day = parseInt(document.getElementById("dayInput").value);
  if (!day || day < 1) return;

  const btn = document.getElementById("predictBtn");
  btn.textContent = "...";
  btn.disabled = true;

  try {
    const res  = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: [day] }),
    });
    const data = await res.json();
    const pred = data.predictions[0];

    document.getElementById("resultTemp").textContent = pred.predicted_temp.toFixed(2) + "°C";
    document.getElementById("resultMeta").textContent =
      `Day ${pred.day}  ·  ${data.model_equation}`;

    // Add predicted point to chart
    if (mainChart) {
      const existing = mainChart.data.datasets.find(d => d.label === "Your Prediction");
      if (existing) {
        existing.data = [{ x: `Day ${day}`, y: pred.predicted_temp }];
      } else {
        mainChart.data.datasets.push({
          label: "Your Prediction",
          data: [pred.predicted_temp],
          labels: [`Day ${day}`],
          borderColor: "#ff6b4a",
          backgroundColor: "#ff6b4a",
          pointRadius: 10, pointHoverRadius: 12,
          pointStyle: "star",
          type: "scatter",
          showLine: false,
        });
        // Extend x-axis labels if needed
        if (!mainChart.data.labels.includes(`Day ${day}`)) {
          mainChart.data.labels.push(`Day ${day}`);
          mainChart.data.datasets[0].data.push(null);
          mainChart.data.datasets[1].data.push(null);
        }
      }
      mainChart.update();
    }
  } catch (e) {
    document.getElementById("resultTemp").textContent = "Error";
    document.getElementById("resultMeta").textContent = "Backend not responding";
  } finally {
    btn.textContent = "Predict";
    btn.disabled = false;
  }
}

// Allow Enter key on input
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dayInput").addEventListener("keydown", e => {
    if (e.key === "Enter") predictSingle();
  });
});
