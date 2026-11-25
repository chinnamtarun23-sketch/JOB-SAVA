# Career Builder

Career Builder is a simple AI-powered resume analyzer and job recommendation app built with a Python FastAPI backend and a static frontend.

## Project Overview

- **Backend:** FastAPI API that accepts a PDF resume, extracts text using `pdfplumber`, and sends it to Google Gemini via the `google-generativeai` SDK.
- **Frontend:** Static HTML, CSS, and JavaScript application that uploads a PDF resume and displays AI-generated career recommendations.
- **Goal:** Help users get structured resume feedback and matching job recommendations from an AI model.

## Features

- PDF resume upload and validation
- Resume text extraction from PDF files
- AI-based career profile analysis and job recommendations
- Clean UI with dark-mode toggle and results rendering
- CORS-enabled backend for local frontend integration

## Repository Structure

- `backend/`
  - `main.py` — FastAPI backend server
  - `requirements.txt` — Python dependencies
- `frontend/`
  - `index.html` — Static web app entry point
  - `style.css` — Styling for the frontend UI
  - `script.js` — Resume upload, API request, and UI logic
- `.env.example` — Example environment variable file
- `.gitignore` — Files and directories excluded from Git

## Requirements

- Python 3.11+ (or compatible Python 3.x)
- A Gemini API key for `google-generativeai`

## Setup

1. Clone the repository.
2. Create and activate a Python virtual environment.

```powershell
cd career_builder
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install backend dependencies.

```powershell
pip install -r backend/requirements.txt
```

4. Create a `.env` file from `.env.example` and provide your Gemini API key.

```powershell
copy .env.example .env
```

Then open `.env` and replace:

```text
GEMINI_API_KEY="API_KEY_HERE"
```

## Running the App

1. Start the backend server.

```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Open the frontend.

Option A: Open `frontend/index.html` directly in your browser.

Option B: Serve the frontend from a local static server (recommended):

```powershell
cd frontend
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Usage

- Upload a PDF resume.
- Click **Find Matching Jobs**.
- View the AI-generated career analysis and job recommendations.

## Notes

- The backend expects only PDF files.
- The app uses the `GEMINI_API_KEY` environment variable for AI requests.
- If the backend cannot extract text from the uploaded PDF, it returns an error.

## License

This repository does not include a license file. Add one if you want to publish the project publicly.
