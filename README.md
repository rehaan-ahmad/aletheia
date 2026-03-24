# ⚡ Aletheia
### AI-Driven Fact-Check & Claim Verification System
*Ἀλήθεια — "the state of not being hidden; truth, disclosure, revelation"*

![Aletheia Demo](https://via.placeholder.com/800x400/0A0E1A/7C3AED?text=Aletheia+Demo)

## Features
- **Multi-agent LangGraph Pipeline:** (Extract → Retrieve → Verify) orchestrates the lifecycle of fact-checking safely.
- **Concurrent FIRE Iterative Retrieval:** Processes multiple claims completely in parallel using `asyncio` threadpools with DuckDuckGo Search.
- **Instant Demo Cache:** Pre-seeded fallback database for presentation examples allowing <1 second resolution.
- **Real-time SSE Streaming:** Provides immediate, step-by-step UI progress feedback to users alongside dynamic AnimeJS vector morphing.
- **Source Credibility Weighting:** Ranks sources intelligently (High/Medium/Low) based on domain trust algorithms.
- **Temporal Sensitivity Detection:** Detects date-sensitive keywords like "latest" and injects current-year parameters.
- **AI-generated Text Detection:** Integrates GPTZero to parse and flag synthetic sentences.
- **Deepfake/Media Detection:** Leverages Hive AI to assess deepfake confidence in image sources.
- **AthenaGuard Compliance:** Meets premium enterprise readiness standards across data-sanitization, security configurations, and rate limits.

## Tech Stack
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) 
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![LangGraph](https://img.shields.io/badge/LangGraph-grey?style=for-the-badge) ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white) ![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

## Setup
**1. Clone the repository**
```bash
git clone https://github.com/rehaan-ahmad/aletheia.git
cd aletheia
```

**2. Setup Backend Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
```
Populate `.env` with actual `GEMINI_API_KEY`, `GPTZERO_API_KEY`, and `HIVE_API_KEY`. (Note: DuckDuckGo search is completely free and requires no key).

**3. Run the Backend API**
```bash
uvicorn main:app --reload
```

**4. Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

**5. Start the frontend**
```bash
npm run dev
```

## Security (AthenaGuard)
We prioritized security and robustness from hour one:
- **Rate-Limiting:** `slowapi` enforces strict hourly/minute caps across verification streams and auth routes respectively.
- **XSS Protection:** Enforced `DOMPurify` HTML string sanitation with allowed/denied tags across evidence renderers and URL link verification blocks.
- **Dependency Guarding:** Validated dependencies using `pip-audit` & `npm audit`.
- **Secret Management:** Integrated `gitleaks` as a `pre-commit` hook to continuously check for hardcoded secrets and tokens inline.
- **CORS/CSP Policies:** Added strict header injection for API endpoints, isolating resources from unknown cross-domain invocation risks.

## Architecture
**LangGraph Orchestration Pipeline**
```mermaid
graph TD;
    User_Input-->Extractor[Claim Extraction Node];
    Extractor-->Retriever[Evidence Retrieval Node];
    Retriever-- If Confidence Insufficient -->Retriever;
    Retriever-- If Confidence Sufficient -->Verifier[Verification Node];
    Verifier-->Report_Builder;
    Report_Builder-->User_UI;
```
