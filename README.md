# DIA PREDICT 🏥
### Diabetes Risk Prediction · 4 ML Models · Live Hyperparameter Tuning · ROC Analysis

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-orange.svg)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.0+-red.svg)](https://scikit-learn.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)

---

## 🌐 Live Demo
> **[your-url.vercel.app](#)** ← replace after Vercel deployment

---

## 📸 Screenshots

### 🏠 Home
<img width="1280" alt="DIA PREDICT Hero" src="https://github.com/user-attachments/assets/fe85605c-7c8f-4e3a-b46a-7333d90fd17c" />

> 💡 **To add your own screenshots:** press `Cmd + Shift + 4` on Mac → drag the image into any GitHub Issue comment box → copy the auto-generated URL → paste it into the `src=""` below.

### 🎛️ Training Controls
<!--
<img width="1280" alt="Training Controls" src="YOUR_SCREENSHOT_URL" />
-->
The Train section has **3 control panels** above the Train button:
- **Train/Test Split slider** — drag between 60/40 and 90/10
- **Hyperparameter sliders** — SVM C, KNN k, Decision Tree max depth
- **Feature toggles** — switch any of the 8 input features on/off

### 📈 Model Performance & ROC Curves
<!--
<img width="1280" alt="ROC Curves" src="YOUR_SCREENSHOT_URL" />
-->
After training you get a full dashboard: model comparison bar chart, all 4 ROC curves on one chart, and per-model metric cards.

### 🎯 Patient Risk Predictor
<!--
<img width="1280" alt="Patient Predictor" src="YOUR_SCREENSHOT_URL" />
-->
Enter 8 clinical values → animated risk gauge + 4 model vote cards + auto risk summary.

---

## 📊 What This App Does

DIA PREDICT is a full-stack ML web application that trains **4 scikit-learn classifiers** on the Pima Indians Diabetes Dataset and lets you explore, compare, and tune them entirely in the browser — no terminal needed after setup.

The app has **10 sections** accessible from the navbar:

| Section | What you see |
|---------|-------------|
| **Home** | Hero with project intro and Get Started CTA |
| **Train** | Dataset stats, control panels, one-click training |
| **Results** | 4 model cards with live metrics and verdict chips |
| **ROC** | All 4 ROC curves on one chart with AUC labels |
| **Confusion Matrix** | Per-model matrix + full classification report |
| **Learning Curves** | Train vs. CV score as training data grows |
| **Feature Importance** | Ranked table with animated bars, diabetic vs. healthy averages |
| **Feature Scatter** | Interactive 2D scatter coloured by outcome |
| **Predict** | Patient form → ensemble vote → animated gauge |
| **History** | All past predictions, clickable to reload, CSV export |

---

## ✨ Features in Detail

### 🤖 Four Models, One Click

| Model | Kernel / Config | Tunable via slider |
|-------|-----------------|--------------------|
| **SVM** | RBF kernel | C (regularization strength) |
| **KNN** | Distance-weighted | k (number of neighbors, odd values) |
| **Logistic Regression** | L2 regularization | — |
| **Decision Tree** | CART algorithm | max_depth |

All 4 train simultaneously. Results update all cards, charts, and the confusion matrix instantly.

---

### 🎛️ Interactive Training Controls

**1 — Train/Test Split slider**
Drag from 60% training → 90% training. The model cards and all metrics update to reflect the new split. Shows the bias-variance tradeoff hands-on: too little training data → underfit; too little test data → unreliable evaluation.

**2 — Hyperparameter sliders**
- **SVM C** (0.1 → 10): higher C = less regularization = risk of overfitting
- **KNN k** (1 → 21, odd): lower k = more sensitive, higher k = smoother boundary
- **Tree depth** (2 → 15): deeper = more complex model = risk of memorizing training data

**3 — Feature toggles**
Switch any of the 8 clinical features on or off before training. Minimum 2 required. Removing weak features can improve generalization; removing important ones (like Glucose) shows a clear accuracy drop — a great way to understand feature importance.

---

### 📈 Evaluation Suite

**ROC Curves**
All 4 model curves on one chart. Each label shows the model's AUC score. A dashed diagonal represents a random classifier (AUC = 0.5). A perfect model hugs the top-left corner.

**Confusion Matrix**
Switch between models using tab buttons. Shows True Positive, False Positive, False Negative, True Negative counts with a full classification report table (precision, recall, F1, support per class).

**Learning Curves**
For each model: how does accuracy change as training data grows? Training score (pink) vs. 5-fold cross-validation score (blue). A large gap = overfitting. Converging lines = good generalization.

**Model Comparison Bar Chart**
Side-by-side bars for Accuracy, F1, and ROC-AUC across all 4 models. Makes it easy to spot which model performs best on each metric.

**Feature Importance Table**
Ranked by absolute Logistic Regression coefficients. Each row shows: importance score, animated bar, diabetic average, healthy average, and % difference. Glucose and BMI consistently top the rankings.

**Feature Scatter Plot**
Pick any 2 features from dropdowns — the chart plots all 768 patients coloured by outcome (pink = diabetic, grey = healthy). Great for spotting clusters and correlations.

---

### 🎯 Patient Risk Predictor

Enter values for all 8 features:

| Field | Normal Range |
|-------|-------------|
| Pregnancies | 0 – 17 |
| Glucose (mg/dL) | 50 – 200 |
| Blood Pressure (mmHg) | 40 – 130 |
| Skin Thickness (mm) | 0 – 99 |
| Insulin (μU/mL) | 0 – 846 |
| BMI | 15 – 67 |
| Diabetes Pedigree Function | 0.08 – 2.5 |
| Age | 21 – 81 |

You get back:
- An **animated semicircle gauge** showing ensemble risk probability (green → amber → pink)
- **4 vote cards** — one per model with its individual probability and Safe / Risk verdict
- A **risk summary** that auto-flags high glucose (>126), elevated BMI (>30), age risk (>40), multiple pregnancies (>5), and high pedigree function (>0.6)

---

### 🕓 Prediction History

Every prediction is saved in the session. The history panel shows glucose, BMI, age, outcome tag, and probability for each run. Click any row to reload those values into the prediction form. Export all predictions as a CSV file.

---

## 📊 Model Performance (default: 80/20 split)

| Model | Accuracy | F1 | Precision | Recall | ROC-AUC |
|-------|----------|----|-----------|--------|---------|
| SVM (RBF, C=1) | ~79% | ~0.67 | ~0.72 | ~0.63 | ~0.84 |
| Logistic Regression | ~77% | ~0.65 | ~0.70 | ~0.61 | ~0.83 |
| KNN (k=9) | ~75% | ~0.62 | ~0.68 | ~0.57 | ~0.81 |
| Decision Tree (depth=5) | ~74% | ~0.60 | ~0.66 | ~0.55 | ~0.79 |

> Numbers vary slightly each run. Use the hyperparameter sliders to push them higher.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, Flask |
| ML | scikit-learn — SVC, KNeighborsClassifier, LogisticRegression, DecisionTreeClassifier |
| Data processing | Pandas, NumPy |
| Frontend | HTML5, Bootstrap 5, Chart.js |
| Fonts | Google Fonts — Montserrat |
| Icons | Font Awesome 6 |
| Deployment | Vercel (serverless) |

---

## 📦 Run Locally

```bash
# 1. Clone
git clone https://github.com/Parisaroozgarian/Diabetes-Prediction-Platform.git
cd Diabetes-Prediction-Platform

# 2. Virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
.\venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
python diabetes.py
```

Open **http://localhost:5000** in your browser.

> **Important:** click **Train All Models** first before using the Predict section.

---

## 📁 Project Structure

```
Diabetes-Prediction-Platform/
├── diabetes.py            # Flask app + all ML logic
│                          #   /api/train  — train with custom params
│                          #   /api/predict — patient inference
│                          #   /api/results — return cached results
├── requirements.txt       # flask, scikit-learn, pandas, numpy
├── runtime.txt            # python-3.11
├── vercel.json            # Vercel serverless routing config
├── static/
│   ├── app.js             # All frontend: charts, sliders, toggles, predict, history
│   ├── style.css          # Custom styles + hero gradient fallback
│   ├── diabetes.csv       # Pima Indians dataset — 768 patients, 8 features
│   └── images/            # Model icons, hero background image
├── templates/
│   └── index.html         # Single-page app — all 10 sections
└── Jupyter/               # Exploratory notebooks (one per model)
    ├── svm-pima-indians-diabetes-database.ipynb
    ├── logisticregression.ipynb
    ├── decisiontreeclassifier.ipynb
    └── kneighborsclassifier-*.ipynb
```

---

## 🔌 API Reference

### `POST /api/train`
Train all 4 models. All parameters are optional.

```json
{
  "test_size": 0.2,
  "hyperparams": {
    "svm_C": 1.0,
    "knn_k": 9,
    "dt_depth": 5
  },
  "features": [0, 1, 2, 3, 4, 5, 6, 7]
}
```

Returns: accuracy, F1, ROC-AUC, precision, recall, confusion matrix, classification report, learning curve data, and ROC curve points for all 4 models.

---

### `POST /api/predict`
Run all trained models on one patient record.

```json
{
  "pregnancies": 3,
  "glucose": 120,
  "bloodpressure": 70,
  "skinthickness": 20,
  "insulin": 80,
  "bmi": 32.0,
  "diabetespedigreefunction": 0.47,
  "age": 33
}
```

Returns:
```json
{
  "probs":    { "svm": 0.42, "lr": 0.38, "knn": 0.45, "dt": 0.40 },
  "preds":    { "svm": 0,    "lr": 0,    "knn": 0,    "dt": 0    },
  "ensemble": 0.41
}
```

---

### `GET /api/results`
Returns the cached training results without retraining.

---

## 🚀 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Vercel reads `vercel.json` and routes all traffic through `diabetes.py`.

> ⚠️ **Serverless note:** Vercel functions are stateless — the in-memory `_cache` resets on cold starts. Always click **Train** before **Predict** in a fresh session. For persistent model storage, consider Railway.app instead.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Parisa Roozgarian**

[![GitHub](https://img.shields.io/badge/GitHub-Parisaroozgarian-black?logo=github)](https://github.com/Parisaroozgarian)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-parisa--roozgarian-blue?logo=linkedin)](https://linkedin.com/in/parisa-roozgarian)
[![Portfolio](https://img.shields.io/badge/Portfolio-parisarzg.replit.app-pink)](https://parisarzg.replit.app)

---

## 🙏 Acknowledgments

- [Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) — UCI ML Repository
- [scikit-learn](https://scikit-learn.org/) · [Flask](https://flask.palletsprojects.com/) · [Chart.js](https://www.chartjs.org/) · [Bootstrap 5](https://getbootstrap.com/)

---
*Made with ❤️ by Parisa Roozgarian*