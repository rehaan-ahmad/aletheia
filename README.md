# Aletheia: Fact & Claim Verification

Aletheia is an AI-powered conversational reporting dashboard that automatically extracts, searches, and verifies factual claims from any text or article URL. Using a sophisticated pipeline of Language Models, external search engines, and visual AI detection, it provides users with a transparent and animated verification report.

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | Next.js 14, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, SSE Starlette, Python 3.12+ |
| **Reasoning Engine** | Google Gemini 2.0 Flash (CoT Prompting) |
| **Evidence Retrieval** | Tavily Search API |
| **Detection Signals** | GPTZero (Text), Gemini Vision (Media) |

## Environment Variables

Create a `backend/.env` file and populate it with the following keys:

| Variable | Description | Where to get it |
|---|---|---|
| `GEMINI_API_KEY` | Powers claim extraction, reasoning, and vision. | [Google AI Studio](https://aistudio.google.com) |
| `TAVILY_API_KEY` | Powers realtime evidence retrieval for claims. | [Tavily Dashboard](https://app.tavily.com) |
| `GPTZERO_API_KEY` | Powers advanced AI text detection alongside Gemini. | [GPTZero API](https://gptzero.me) |

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/aletheia.git
   cd aletheia
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   *(Ensure you have created the `.env` file as described above).*

3. **Run the Backend Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Setup the Frontend:**
   Open a new terminal window.
   ```bash
   cd frontend
   npm install
   ```

5. **Run the Frontend Server:**
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

## Screenshots

*(Insert screenshot of Dark Mode Report UI here)*

*(Insert screenshot of Light Mode Report UI here)*

---
Developed for the GfG Hackfest.
