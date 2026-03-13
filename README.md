# DIA PREDICT 🏥

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/Parisaroozgarian/Diabetes-Prediction-Models/blob/main/LICENSE)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-orange.svg)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.0+-red.svg)](https://scikit-learn.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)

## 📊 Project Overview

A machine learning web application for diabetes prediction built with Flask and scikit-learn. Train four classifiers on the Pima Indians Diabetes Dataset, explore interactive performance metrics, tune hyperparameters live, and predict individual patient risk — all in the browser.

<img width="1280" alt="dia-predict-dashboard" src="https://github.com/user-attachments/assets/fe85605c-7c8f-4e3a-b46a-7333d90fd17c" />

---

## ✨ Features

### 🤖 Four ML Models Trained Simultaneously
| Model | Key Parameter |
|-------|--------------|
| Support Vector Machine (SVM) | RBF kernel, tunable C |
| K-Nearest Neighbors (KNN) | Tunable k (odd values) |
| Logistic Regression | L2 regularization |
| Decision Tree | Tunable max depth |

### 🎛️ Interactive Training Controls
- **Train / Test Split slider** — drag from 60/40 to 90/10 and instantly see how split size affects scores. Teaches the bias-variance tradeoff hands-on.
- **Hyperparameter sliders** — adjust SVM C, KNN k, and Tree depth before each training run. No code changes needed.
- **Feature selection toggles** — enable/disable any of the 8 input features with a switch. At least 2 must be active.

### 📈 Evaluation & Visualizations
- **ROC Curves** — all 4 models on one chart with AUC in the legend and a random-classifier baseline diagonal
- **Confusion Matrix** — per-model with full classification report (precision, recall, F1, support)
- **Learning Curves** — training score vs. CV validation score as training set grows (5-fold CV)
- **Model Comparison Bar Chart** — accuracy, F1, and ROC-AUC side by side
- **Feature Importance Table** — ranked by Logistic Regression coefficients with animated bars and diabetic vs. healthy averages
- **Feature Scatter Plot** — explore any two features coloured by outcome

### 🎯 Patient Risk Predictor
- Enter 8 patient values — all 4 models vote simultaneously
- Animated gauge showing ensemble probability
- Per-model vote cards with individual probabilities
- Auto-generated risk summary with flagged clinical markers
- Prediction history with CSV export

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.9+, Flask |
| ML | scikit-learn (SVM, KNN, LogReg, Decision Tree) |
| Data | Pandas, NumPy |
| Frontend | HTML5, Bootstrap 5, Chart.js |
| Deployment | Vercel |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Parisaroozgarian/Diabetes-Prediction-Models.git
cd Diabetes-Prediction-Models

# Create virtual environment
python -m venv venv
source venv/bin/activate      # macOS / Linux
.\venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Run the app
python diabetes.py
```

Then open `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
dia-predict/
├── diabetes.py          # Flask app + all ML logic
├── requirements.txt     # Python dependencies
├── vercel.json          # Vercel deployment config
├── static/
│   ├── app.js           # All frontend logic & charts
│   ├── style.css        # Custom styles
│   ├── diabetes.csv     # Pima Indians dataset (768 samples)
│   └── images/          # Model icons, hero image
└── templates/
    └── index.html       # Single-page app
```

---

## 🔌 API Reference

### `POST /api/train`
Train all 4 models with optional parameters.

**Request body (all optional):**
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

**Response:** accuracy, F1, ROC-AUC, confusion matrix, learning curve, and ROC curve data for all 4 models.

---

### `POST /api/predict`
Run inference on all trained models for one patient.

**Request body:**
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

**Response:**
```json
{
  "probs": { "svm": 0.42, "lr": 0.38, "knn": 0.45, "dt": 0.40 },
  "preds": { "svm": 0, "lr": 0, "knn": 0, "dt": 0 },
  "ensemble": 0.41
}
```

---

### `GET /api/results`
Returns cached training results (if already trained).

---

## 📊 Model Performance (default settings, 80/20 split)

| Model | Accuracy | F1 | Precision | Recall | ROC-AUC |
|-------|----------|----|-----------|--------|---------|
| SVM (RBF, C=1) | ~79% | ~0.67 | ~0.72 | ~0.63 | ~0.84 |
| Logistic Regression | ~77% | ~0.65 | ~0.70 | ~0.61 | ~0.83 |
| KNN (k=9) | ~75% | ~0.62 | ~0.68 | ~0.57 | ~0.81 |
| Decision Tree (depth=5) | ~74% | ~0.60 | ~0.66 | ~0.55 | ~0.79 |

> Exact numbers vary slightly with each run. Use the hyperparameter sliders to improve them.

---

## 🚀 Deployment (Vercel)

This project is deployed as a serverless Flask app on Vercel.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The `vercel.json` routes all traffic through `diabetes.py`.

> **Note:** Vercel uses serverless functions, so the in-memory model cache (`_cache`) resets between requests. Always click **Train** before **Predict** in a fresh session.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Parisa Roozgarian**
- GitHub: [@Parisaroozgarian](https://github.com/Parisaroozgarian)
- LinkedIn: [Parisa Roozgarian](https://linkedin.com/in/parisa-roozgarian)
- Portfolio: [parisarzg.replit.app](https://parisarzg.replit.app)

---

## 🙏 Acknowledgments

- [Pima Indians Diabetes Dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) — UCI ML Repository
- [scikit-learn](https://scikit-learn.org/) — ML framework
- [Flask](https://flask.palletsprojects.com/) — web framework
- [Chart.js](https://www.chartjs.org/) — interactive charts

---
Made with ❤️ by Parisa Roozgarian