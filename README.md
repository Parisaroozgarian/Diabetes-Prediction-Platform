# 🎬 VidioFlow

> AI-powered video script generator and SEO content optimizer built with Flask and OpenAI.

![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=flat-square&logo=flask)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

---

## ✨ Features

- **Script Generator** — Generate full video scripts by topic, template, duration, tone, audience, and language
- **SEO Optimizer** — Optimize any content for search engines with keyword analysis and scoring
- **B-Roll Suggestions** — Get timestamped B-roll ideas for your script
- **Thumbnail Ideas** — AI-generated thumbnail concepts for maximum click-through
- **Text-to-Speech Preview** — Listen to your script before recording
- **Export Options** — Download scripts as PDF or DOCX
- **Version History** — Track and compare different script versions
- **Multi-language Support** — Generate scripts in 8+ languages

---

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/Parisaroozgarian/VidioFlow.git
cd VidioFlow

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Open .env and add your OpenAI API key
```

### Configuration

Edit `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Run Locally

```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
VidioFlow/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel deployment config
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── templates/
│   └── index.html          # Frontend UI
└── utils/
    ├── __init__.py
    ├── script_generator.py # OpenAI script generation logic
    ├── seo_optimizer.py    # SEO analysis and optimization
    ├── export.py           # PDF and DOCX export
    └── text_to_speech.py   # OpenAI TTS integration
```

---

## 🌐 Deployment (Vercel)

1. Push your code to GitHub (without `.env` file)
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add `OPENAI_API_KEY` in **Environment Variables** settings
4. Click **Deploy**

Your API key stays private — only Vercel's servers use it.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.13, Flask |
| AI | OpenAI GPT-4o, TTS |
| Export | ReportLab (PDF), python-docx |
| Frontend | Vanilla JS, CSS3 |
| Deployment | Vercel |

---

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main UI |
| GET | `/api/templates` | Get script templates |
| POST | `/generate-script` | Generate a video script |
| POST | `/optimize-seo` | Optimize content for SEO |
| POST | `/analyze-seo` | Analyze SEO score |
| POST | `/text-to-speech` | Convert script to audio |
| POST | `/export` | Export script as PDF/DOCX |

---

## 📄 License

Copyright © 2026 Parisa Roozgarian. All rights reserved.

This project is proprietary software. See [LICENSE](LICENSE) for full terms.

---

## 👤 Author

**Parisa Roozgarian**
- GitHub: [@Parisaroozgarian](https://github.com/Parisaroozgarian)

---

> ⭐ If you found this project useful, please consider giving it a star!
