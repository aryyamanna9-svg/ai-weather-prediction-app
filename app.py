"""
AI Weather Prediction — Flask Backend
======================================
Linear Regression from scratch using NumPy.
Exposes REST API endpoints consumed by the frontend.
"""

from flask import Flask, jsonify, request, render_template
import numpy as np

app = Flask(__name__)

# ── HISTORICAL TRAINING DATA (15 days) ────────────────────────────────────────
TRAINING_DATA = [
    {"day": 1,  "temp": 22.1},
    {"day": 2,  "temp": 23.4},
    {"day": 3,  "temp": 21.8},
    {"day": 4,  "temp": 24.2},
    {"day": 5,  "temp": 25.0},
    {"day": 6,  "temp": 23.7},
    {"day": 7,  "temp": 26.1},
    {"day": 8,  "temp": 25.5},
    {"day": 9,  "temp": 27.3},
    {"day": 10, "temp": 26.8},
    {"day": 11, "temp": 28.0},
    {"day": 12, "temp": 27.6},
    {"day": 13, "temp": 29.1},
    {"day": 14, "temp": 28.4},
    {"day": 15, "temp": 30.2},
]

# ── LINEAR REGRESSION (from scratch) ─────────────────────────────────────────
def train_linear_regression(data):
    X = np.array([d["day"]  for d in data], dtype=float)
    y = np.array([d["temp"] for d in data], dtype=float)
    n = len(X)
    m = (n * np.sum(X * y) - np.sum(X) * np.sum(y)) / \
        (n * np.sum(X**2) - np.sum(X)**2)
    b = (np.sum(y) - m * np.sum(X)) / n
    return float(m), float(b), X, y

def r_squared(y, y_pred):
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    return float(1 - ss_res / ss_tot)

def rmse(y, y_pred):
    return float(np.sqrt(np.mean((y - y_pred) ** 2)))

# Train once on startup
M, B, X_train, y_train = train_linear_regression(TRAINING_DATA)
y_pred_train = M * X_train + B

# ── API ROUTES ────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/model-info", methods=["GET"])
def model_info():
    """Return trained model parameters and metrics."""
    return jsonify({
        "slope":     round(M, 4),
        "intercept": round(B, 4),
        "r2":        round(r_squared(y_train, y_pred_train), 4),
        "rmse":      round(rmse(y_train, y_pred_train), 4),
        "equation":  f"y = {M:.4f}x + {B:.4f}",
        "training_points": len(TRAINING_DATA),
    })


@app.route("/api/training-data", methods=["GET"])
def training_data():
    """Return observed + predicted values for all training days."""
    result = []
    for d in TRAINING_DATA:
        predicted = round(M * d["day"] + B, 2)
        result.append({
            "day":       d["day"],
            "observed":  d["temp"],
            "predicted": predicted,
            "error":     round(d["temp"] - predicted, 2),
        })
    return jsonify(result)


@app.route("/api/predict", methods=["POST"])
def predict():
    """Predict temperature for one or more day numbers."""
    body = request.get_json(force=True)
    days = body.get("days", [])

    if not days:
        return jsonify({"error": "Provide a 'days' list in the request body."}), 400

    predictions = []
    for day in days:
        try:
            day = int(day)
            temp = round(M * day + B, 2)
            predictions.append({"day": day, "predicted_temp": temp})
        except (ValueError, TypeError):
            return jsonify({"error": f"Invalid day value: {day}"}), 400

    return jsonify({
        "predictions": predictions,
        "model_equation": f"y = {M:.4f}x + {B:.4f}",
    })


@app.route("/api/predict-range", methods=["GET"])
def predict_range():
    """Predict temperatures for a range of days (default 16-20)."""
    start = int(request.args.get("start", 16))
    end   = int(request.args.get("end",   20))
    predictions = [
        {"day": d, "predicted_temp": round(M * d + B, 2)}
        for d in range(start, end + 1)
    ]
    return jsonify({"predictions": predictions})


# ── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n✅ Model trained:  y = {M:.4f}x + {B:.4f}")
    print(f"   R² Score     :  {r_squared(y_train, y_pred_train):.4f}")
    print(f"   RMSE         :  {rmse(y_train, y_pred_train):.4f}°C")
    print(f"\n🌐 Server running at http://127.0.0.1:5000\n")
    app.run(debug=True)
