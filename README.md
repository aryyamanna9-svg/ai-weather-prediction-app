# 🌤️ AI Weather Prediction — Full Stack Web App

> A full-stack web application that predicts temperatures using **Linear Regression** built from scratch. Python Flask backend with REST API + HTML/CSS/JS frontend.

---

## 🗂️ Project Structure

```
ai-weather-prediction/
│
├── app.py                    # Flask backend — ML model + REST API
├── requirements.txt          # Python dependencies
├── README.md
│
├── templates/
│   └── index.html            # Frontend HTML (Jinja2 template)
│
└── static/
    ├── css/
    │   └── style.css         # Frontend styles
    └── js/
        └── main.js           # Frontend JS (API calls + Chart.js)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main web app |
| GET | `/api/model-info` | Model parameters & metrics |
| GET | `/api/training-data` | All 15 training records |
| POST | `/api/predict` | Predict custom day(s) |
| GET | `/api/predict-range?start=16&end=20` | Predict a range |

### Example POST /api/predict
```json
// Request
{ "days": [16, 17, 18] }

// Response
{
  "predictions": [
    { "day": 16, "predicted_temp": 30.32 },
    { "day": 17, "predicted_temp": 30.87 },
    { "day": 18, "predicted_temp": 31.42 }
  ],
  "model_equation": "y = 0.5471x + 21.5695"
}
```

---

## ⚙️ How to Run

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-weather-prediction.git
cd ai-weather-prediction

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the Flask server
python app.py

# 4. Open browser at
http://127.0.0.1:5000
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| ML Model | NumPy (Linear Regression from scratch) |
| Frontend | HTML5, CSS3, JavaScript |
| Charts | Chart.js |
| Fonts | Google Fonts (Syne + DM Mono) |

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| R² Score | 0.9185 (91.8%) |
| RMSE | 0.7040°C |
| Slope | 0.5471°C/day |
| Intercept | 21.5695°C |

---

## 🤖 AI Assistance

This project was developed with Claude AI (Anthropic) as the Subject Matter Expert.

---

## 👤 Author

**[Your Name]** — [Your College], [Your Department]
