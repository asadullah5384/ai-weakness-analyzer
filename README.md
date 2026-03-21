# AI Weakness Analyzer 🚀

A multi-user student performance analysis system using React, FastAPI, and Supabase.

## 📦 Deployment

Click the buttons below to deploy your own instance of this project.

### 1. Backend (FastAPI + Python)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/asadullah5384/ai-weakness-analyzer)

**Required Environment Variables on Render:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GROQ_API_KEY`
- `GROQ_MODEL_ID` (e.g., `llama-3.1-8b-instant`)

### 2. Frontend (HTML/CSS/JS)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fasadullah5384%2Fai-weakness-analyzer&root-directory=frontend)

---

## 🛠️ Local Setup

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend**:
   Open `frontend/index.html` in your browser.

## 📄 License
MIT
