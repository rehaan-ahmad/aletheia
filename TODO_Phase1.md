# Aletheia — Phase 1 TODO
> Goal: Get the full folder structure, config files, and environment ready before writing any feature code.

---

## 1. Root Project Setup


- [ ] Initialize a git repository
  ```bash
  git init
  ```
- [ ] Create the root `.gitignore` file (see Section 6)
- [ ] Create the root `README.md` with project name and one-line description

---

## 2. Backend Folder Structure

- [ ] Create the backend directory and navigate into it
  ```bash
  mkdir backend && cd backend
  ```
- [ ] Create the Python virtual environment
  ```bash
  python3 -m venv venv
  ```
- [ ] Activate the virtual environment
  ```bash
  source venv/bin/activate
  ```
- [ ] Create the following folder structure inside `backend/`:
  ```
  backend/
  ├── venv/                    ← auto-created above
  ├── modules/
  │   ├── __init__.py
  │   ├── extractor.py         ← Claim extraction logic (Gemini)
  │   ├── searcher.py          ← Tavily web search integration
  │   ├── verifier.py          ← Claim verification logic (Gemini CoT)
  │   ├── text_detector.py     ← AI text detection (GPTZero + Gemini)
  │   └── media_detector.py    ← Image scraping + Gemini Vision
  ├── main.py                  ← FastAPI app entry point
  ├── config.py                ← Loads all env variables
  ├── models.py                ← Pydantic request/response models
  ├── .env                     ← API keys (never committed)
  └── requirements.txt         ← Generated after pip installs
  ```
- [ ] Create each folder and empty file:
  ```bash
  mkdir modules
  touch modules/__init__.py
  touch modules/extractor.py
  touch modules/searcher.py
  touch modules/verifier.py
  touch modules/text_detector.py
  touch modules/media_detector.py
  touch main.py config.py models.py .env
  ```

---

## 3. Backend — File Boilerplates to Write

### `main.py`
- [ ] Add FastAPI app initialization
- [ ] Add CORS middleware (allow all origins for development)
- [ ] Add a root `/` health check route that returns `{"status": "Aletheia is running"}`
- [ ] Add placeholder route `POST /verify` that returns `{"message": "pipeline not yet implemented"}`
- [ ] Add placeholder route `GET /stream/{task_id}` for SSE streaming (stub only)

### `config.py`
- [ ] Load `GEMINI_API_KEY` from `.env`
- [ ] Load `TAVILY_API_KEY` from `.env`
- [ ] Load `GPTZERO_API_KEY` from `.env`
- [ ] Export all three as constants
- [ ] Add a startup check: print a warning if any key is missing

### `models.py`
- [ ] Create `VerifyRequest` Pydantic model with fields:
  - `input_text: str | None`
  - `url: str | None`
- [ ] Create `ClaimResult` Pydantic model with fields:
  - `claim: str`
  - `verdict: str` (True / False / Partially True / Unverifiable)
  - `confidence: int` (0–100)
  - `reasoning: str`
  - `sources: list[str]`
- [ ] Create `VerifyResponse` Pydantic model with fields:
  - `claims: list[ClaimResult]`
  - `overall_accuracy: float`
  - `ai_text_score: int | None`
  - `media_results: list | None`

### `.env`
- [ ] Add the following keys (fill in your actual values):
  ```
  GEMINI_API_KEY=your_gemini_key_here
  TAVILY_API_KEY=your_tavily_key_here
  GPTZERO_API_KEY=your_gptzero_key_here
  ```

### Each `modules/*.py` file
- [ ] Add a module-level docstring describing what it will do
- [ ] Add a single empty placeholder function with a `pass` statement and a `# TODO` comment
- [ ] Example for `extractor.py`:
  ```python
  """
  extractor.py
  Handles claim extraction from input text using Google Gemini.
  """

  # TODO: Implement extract_claims(text: str) -> list[str]
  async def extract_claims(text: str) -> list[str]:
      pass
  ```

---

## 4. Frontend Folder Structure

- [ ] Navigate back to root and scaffold Next.js 14
  ```bash
  cd .. && npx create-next-app@14 frontend \
    --typescript --tailwind --app --no-git
  ```
  Answer the prompts:
  - Use App Router: **Yes**
  - Use src/ directory: **No**
  - Customize import alias: **No**

- [ ] The scaffold will create this structure — verify it exists:
  ```
  frontend/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   └── globals.css
  ├── components/           ← create this manually
  │   ├── InputPanel.tsx    ← text/URL input area
  │   ├── PipelineProgress.tsx  ← step tracker (Extract→Search→Verify)
  │   ├── ClaimCard.tsx     ← individual claim result card
  │   ├── ReportHeader.tsx  ← overall score + summary
  │   ├── AITextMeter.tsx   ← radial gauge for AI detection score
  │   └── MediaCard.tsx     ← image + AI-generated verdict
  ├── lib/
  │   └── api.ts            ← all fetch/SSE calls to backend
  ├── public/
  ├── .env.local            ← frontend env vars
  ├── tailwind.config.ts
  └── package.json
  ```
- [ ] Create the missing folders and empty component files:
  ```bash
  cd frontend
  mkdir components lib
  touch components/InputPanel.tsx
  touch components/PipelineProgress.tsx
  touch components/ClaimCard.tsx
  touch components/ReportHeader.tsx
  touch components/AITextMeter.tsx
  touch components/MediaCard.tsx
  touch lib/api.ts
  touch .env.local
  ```

- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

- [ ] In each `components/*.tsx` file, add an empty default export as a stub:
  ```tsx
  // TODO: Implement this component
  export default function ComponentName() {
    return <div>ComponentName placeholder</div>;
  }
  ```

---

## 5. Install All Libraries

### Backend (run inside `backend/` with venv activated)

- [ ] Install all packages:
  ```bash
  pip install fastapi uvicorn[standard] python-dotenv python-multipart \
    google-genai tavily-python trafilatura newspaper3k \
    Pillow httpx aiohttp aiofiles beautifulsoup4 lxml \
    requests slowapi bleach starlette pydantic
  ```
- [ ] Freeze to requirements file:
  ```bash
  pip freeze > requirements.txt
  ```
- [ ] Run the sanity check:
  ```bash
  python3 -c "import fastapi, uvicorn, google.genai, tavily, trafilatura, PIL, bs4; print('All backend imports OK')"
  ```

### Frontend (run inside `frontend/`)

- [ ] Install all packages:
  ```bash
  npm install framer-motion lucide-react eventsource-parser \
    clsx tailwind-merge react-circular-progressbar
  ```
- [ ] Verify `package.json` lists all of the above under `dependencies`

---

## 6. `.gitignore` Contents

- [ ] Create the root `.gitignore` with the following content:

  ```gitignore
  # Python
  backend/venv/
  backend/__pycache__/
  backend/**/__pycache__/
  backend/*.pyc
  backend/.env

  # Node
  frontend/node_modules/
  frontend/.next/
  frontend/.env.local
  frontend/out/

  # OS
  .DS_Store
  Thumbs.db

  # IDE
  .vscode/
  .idea/

  # Misc
  *.log
  *.tmp
  ```

---

## 7. API Keys — Registration Checklist

- [ ] **Gemini API Key** — [aistudio.google.com](https://aistudio.google.com) → Create API Key → Copy to `backend/.env`
- [ ] **Tavily API Key** — [app.tavily.com](https://app.tavily.com) → Sign up → Dashboard → Copy to `backend/.env`
- [ ] **GPTZero API Key** — [gptzero.me](https://gptzero.me) → Sign up → API Access → Copy to `backend/.env`

---

## 8. Verify Everything is Working

- [ ] Start the backend dev server:
  ```bash
  cd backend && source venv/bin/activate
  uvicorn main:app --reload --port 8000
  ```
  Open `http://localhost:8000` → should return `{"status": "Aletheia is running"}`

- [ ] Start the frontend dev server (new terminal):
  ```bash
  cd frontend && npm run dev
  ```
  Open `http://localhost:3000` → should show default Next.js page

- [ ] Do a first git commit:
  ```bash
  cd ..  # back to root aletheia/
  git add .
  git commit -m "chore: Phase 1 scaffold — folder structure, stubs, env setup"
  ```
- [ ] Create a public GitHub repo named `aletheia` and push:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/aletheia.git
  git branch -M main
  git push -u origin main
  ```

---

## Phase 1 Complete ✓
**When all boxes above are checked, you are ready to start Phase 2 — implementing the backend pipeline.**
