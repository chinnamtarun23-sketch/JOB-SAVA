from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env vars
load_dotenv()

app = FastAPI(title="Career Builder API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Determine the API Key
    final_api_key = os.getenv("GEMINI_API_KEY")
    
    if not final_api_key:
         raise HTTPException(status_code=400, detail="No API Key provided in .env file.")
    
    try:
        # Read the PDF
        contents = await file.read()
        resume_text = ""
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\\n"
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
        
        # Configure Gemini
        genai.configure(api_key=final_api_key)
        
        # Dynamically find an available model for this specific API key
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        if not available_models:
            raise HTTPException(status_code=400, detail="Your API key does not have access to any text generation models.")
            
        # Prefer gemini-1.5-flash, then gemini-1.5-pro, else take whatever is available
        target_model = next((m for m in available_models if 'gemini-1.5-flash' in m), 
                       next((m for m in available_models if 'gemini-1.5-pro' in m), 
                       available_models[0]))
        
        print(f"DEBUG: Selected model: {target_model}")
        model = genai.GenerativeModel(target_model)
        
        prompt = f"""
        You are an expert technical recruiter and career coach. 
        Analyze the following resume text and provide a highly structured, clean, and professional assessment.

        Please format your entire response in beautiful Markdown. Follow this EXACT structure:

        ## 🧠 Candidate Profile Analysis
        *   **Core Skills:** [List top 5-7 skills]
        *   **Experience Level:** [Junior/Mid/Senior]
        *   **Primary Domains:** [e.g., Web Dev, Data Science, etc.]

        ---

        ## 💼 Top Job Recommendations
        Suggest 5-10 highly relevant job roles currently trending in the market. Format EACH job exactly like this:

        ### 1. [Job Title]
        *   **Why it's a match:** [1-2 sentences explaining why their resume fits this role]
        *   **Target Domains:** [e.g., FinTech, HealthTech]
        *   **Top Companies Hiring:** [List 2-3 real companies]
        *   **🔗 Apply Links:** Provide 2-3 clickable markdown links to job search queries (e.g., `[Search on LinkedIn](https://www.linkedin.com/jobs/search/?keywords=Job+Title)` or `[Search on Indeed](https://www.indeed.com/jobs?q=Job+Title)`)

        (Continue this structure for all recommendations...)

        Resume Text:
        {resume_text}
        """
        
        response = model.generate_content(prompt)
        
        return {"status": "success", "results": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
