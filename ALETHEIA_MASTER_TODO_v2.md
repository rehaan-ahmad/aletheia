# ALETHEIA — Master Project TODO v2
> AI-powered Fact & Claim Verification System
> GfG Hackfest Final Round | Deadline: March 24, 2026
> Stack: Next.js 14 · FastAPI · Google Gemini 2.0 Flash · Tavily · GPTZero

---

## HOW TO USE THIS FILE
- Work **strictly top to bottom**, phase by phase
- Never begin a phase until every checkbox in the previous phase is ticked
- Each phase is scoped to approximately one working session (3–4 hours)
- Tasks describe exactly WHAT to build and HOW it should behave
- Code is intentionally excluded — feed each phase to an AI to generate it

---

## PHASE 0 — Prerequisites (Must be done before anything else)

### 0.1 System Packages
- [ ] Update and upgrade Ubuntu packages
- [ ] Install: `python3`, `python3-pip`, `python3-venv`, `python3-dev`
- [ ] Install Node.js 20 LTS via NodeSource (not apt default — it is outdated)
- [ ] Install system libs required by Pillow and newspaper3k: `libxml2-dev`, `libxslt1-dev`, `libjpeg-dev`, `libpng-dev`, `libffi-dev`, `libssl-dev`, `build-essential`, `zlib1g-dev`
- [ ] Verify: `python3 --version` shows 3.12+, `node --version` shows v20+

### 0.2 API Key Registration
- [ ] **Gemini** — Register at aistudio.google.com, create an API key, copy it
- [ ] **Tavily** — Register at app.tavily.com, copy the API key from dashboard
- [ ] **GPTZero** — Register at gptzero.me, request API access, copy the key

### 0.3 Root Project Scaffold
- [ ] Create root folder: `aletheia/`
- [ ] Run `git init` inside it
- [ ] Create a root `.gitignore` that excludes: `backend/venv/`, all `__pycache__/`, `*.pyc`, `backend/.env`, `frontend/node_modules/`, `frontend/.next/`, `frontend/.env.local`, `frontend/out/`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `*.log`
- [ ] Create a `README.md` with project name and one-line description

### 0.4 Backend Folder Scaffold
- [ ] Create `backend/` directory
- [ ] Create Python virtual environment inside it: `python3 -m venv venv`
- [ ] Activate venv: `source backend/venv/bin/activate`
- [ ] Create the following empty files inside `backend/`:
  - `main.py` — FastAPI entry point
  - `config.py` — environment variable loader
  - `models.py` — Pydantic data models
  - `.env` — API keys (never committed)
- [ ] Create `backend/modules/` directory with these empty files:
  - `__init__.py`
  - `extractor.py` — claim extraction
  - `searcher.py` — Tavily search
  - `verifier.py` — Gemini verification
  - `text_detector.py` — AI text detection
  - `media_detector.py` — image AI detection

### 0.5 Frontend Scaffold
- [ ] From root, scaffold Next.js 14: `npx create-next-app@14 frontend` with flags: `--typescript`, `--tailwind`, `--app`, `--no-git`, no `src/` directory, no custom import alias
- [ ] Inside `frontend/`, create:
  - `components/` directory with empty files: `InputPanel.tsx`, `PipelineProgress.tsx`, `ClaimCard.tsx`, `ReportHeader.tsx`, `AITextMeter.tsx`, `MediaCard.tsx`, `ErrorBanner.tsx`
  - `lib/` directory with empty file: `api.ts`
  - `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Each empty component file should export a default function stub returning a placeholder div

### 0.6 Environment Files
- [ ] In `backend/.env`, add three keys: `GEMINI_API_KEY`, `TAVILY_API_KEY`, `GPTZERO_API_KEY` — fill with real values
- [ ] Confirm `.env` is listed in `.gitignore` before any commits

---

## PHASE 1 — Backend: Config, Models, and Extractor

### 1.1 Install Backend Libraries
- [ ] With venv activated, install all of the following in one command:
  ```
  fastapi uvicorn[standard] python-dotenv python-multipart
  google-genai tavily-python
  trafilatura newspaper3k requests beautifulsoup4 lxml
  Pillow httpx aiohttp aiofiles
  slowapi bleach starlette pydantic sse-starlette
  ```
- [ ] Run `pip freeze > backend/requirements.txt`

### 1.2 Write `config.py`
- [ ] Use `python-dotenv` to load `.env`
- [ ] Export three constants: `GEMINI_API_KEY`, `TAVILY_API_KEY`, `GPTZERO_API_KEY`
- [ ] Export one constant: `GEMINI_MODEL = "gemini-2.0-flash"`
- [ ] On startup, check if any key is missing and print a warning listing which ones

### 1.3 Write `models.py`
Define the following Pydantic models:
- [ ] `VerifyRequest` — fields: `input_text` (optional string), `url` (optional string)
- [ ] `ClaimResult` — fields: `claim` (str), `verdict` (str, one of: True/False/Partially True/Unverifiable), `confidence` (int 0–100), `reasoning` (str), `sources` (list of URL strings), `search_query_used` (str)
- [ ] `MediaResult` — fields: `image_url` (str), `verdict` (str, one of: AI-Generated/Likely AI/Likely Real/Real/Unanalyzable), `confidence` (int 0–100), `artifacts` (list of str)
- [ ] `VerifyResponse` — fields: `claims` (list of ClaimResult), `overall_accuracy` (float), `ai_text_score` (optional int), `ai_text_reasoning` (optional str), `media_results` (optional list of MediaResult), `article_text_used` (str), `total_claims` (int), `true_count` (int), `false_count` (int), `partial_count` (int), `unverifiable_count` (int)

### 1.4 Write `modules/extractor.py`
This module has two responsibilities:

**URL-to-text extraction:**
- [ ] Write `fetch_article_text(url: str) -> str`
- [ ] Try `trafilatura` first — fetch the URL, extract text, return if result is over 200 characters
- [ ] Fall back to `newspaper3k` if trafilatura fails or returns too little text
- [ ] Raise a `ValueError` with a descriptive message if both methods fail

**Claim extraction via Gemini:**
- [ ] Initialise a `google.genai` client using `GEMINI_API_KEY` from config
- [ ] Write `extract_claims(text: str) -> list[str]` as an async function
- [ ] Cap input text at 8000 characters before sending to Gemini
- [ ] Use the following prompt behaviour:
  - Instruct Gemini to extract only verifiable, atomic, self-contained factual claims
  - Exclude opinions, predictions, and subjective statements
  - Rephrase any claim relying on pronouns to be self-contained
  - Extract a maximum of 12 claims, prioritising the most significant
  - Return a valid JSON array of strings — nothing else, no markdown, no preamble
- [ ] Strip any markdown code fences from Gemini's response before parsing JSON
- [ ] Validate that the parsed result is a list before returning
- [ ] Add a `if __name__ == "__main__"` test block at the bottom that runs extraction on a sample paragraph and prints results — run it and confirm it works before moving on

### 1.5 Write basic `main.py` (Phase 1 version)
- [ ] Initialise FastAPI app with title and version
- [ ] Add CORS middleware allowing all origins (for development)
- [ ] Add `GET /` health check returning `{"status": "Aletheia is running"}`
- [ ] Add `POST /extract-claims` endpoint that:
  - Accepts a `VerifyRequest` body
  - Raises HTTP 400 if both `input_text` and `url` are missing
  - Fetches article text if URL is provided, raises HTTP 422 on failure
  - Calls `extract_claims()` and returns the list with count and first 500 chars of text used
- [ ] Start the server with `uvicorn main:app --reload --port 8000`
- [ ] Test with a curl POST to `/extract-claims` with a sample text body
- [ ] Confirm JSON response with a `claims` array is returned

---

## PHASE 2 — Backend: Evidence Retrieval

### 2.1 Write `modules/searcher.py`
This module has two responsibilities:

**Search query generation via Gemini:**
- [ ] Write `generate_search_query(claim: str) -> str` as an async function
- [ ] Prompt Gemini to generate a single search query (4–8 keyword-style words) targeting the most specific verifiable element of the claim
- [ ] Instruct Gemini to return only the query string — no explanation, no quotes, no preamble
- [ ] Strip all quote characters from the returned string

**Evidence retrieval via Tavily:**
- [ ] Initialise a `TavilyClient` using `TAVILY_API_KEY`
- [ ] Write `search_evidence(query: str) -> list[dict]` as an async function
- [ ] Call Tavily with: `search_depth="advanced"`, `max_results=4`, `include_answer=True`
- [ ] Map each result to a dict with keys: `title`, `url`, `content` (capped at 600 chars), `relevance_score`
- [ ] Return an empty list on any exception — never crash
- [ ] Write `get_evidence_for_claim(claim: str) -> tuple[str, list[dict]]` that chains both functions and returns `(query_used, sources_list)`
- [ ] Add a `if __name__ == "__main__"` test that runs a known claim through the pipeline and prints the query and source titles — run and confirm before moving on

---

## PHASE 3 — Backend: Claim Verification

### 3.1 Write `modules/verifier.py`

**Verification via Gemini Chain-of-Thought:**
- [ ] Write `verify_claim(claim: str, sources: list[dict], query_used: str) -> ClaimResult` as an async function
- [ ] Format the evidence into a numbered block: each entry shows title, URL, and snippet
- [ ] If no sources were found, pass "No evidence retrieved" as the evidence block
- [ ] Use the following Chain-of-Thought prompt structure — instruct Gemini to reason through four explicit steps before giving a verdict:
  - Step 1: Summarise what the evidence says about the claim
  - Step 2: Identify any conflicts or contradictions across sources
  - Step 3: Classify as one of: `True`, `False`, `Partially True`, `Unverifiable` — based ONLY on the evidence, not training knowledge
  - Step 4: Assign a confidence score 0–100, where 80–100 = multiple authoritative sources agree, 50–79 = some support with gaps, 20–49 = weak or conflicting, 0–19 = essentially no evidence
- [ ] Instruct Gemini to return only valid JSON with keys: `reasoning`, `verdict`, `confidence`, `key_source`
- [ ] Strip markdown fences before parsing
- [ ] If JSON parsing fails, return a fallback `ClaimResult` with verdict `Unverifiable` and confidence 0
- [ ] Validate that the verdict is one of the four valid options — default to `Unverifiable` if not
- [ ] Clamp confidence to 0–100
- [ ] Add a test block that runs a deliberately false claim through the full searcher + verifier chain and confirms the verdict is `False`

### 3.2 Wire the full pipeline in `main.py`
- [ ] Add `POST /verify` endpoint that:
  1. Gets text (from input or URL)
  2. Calls `extract_claims()`
  3. Runs `get_evidence_for_claim()` and `verify_claim()` for all claims **concurrently** using `asyncio.gather()`
  4. Computes summary stats: counts per verdict, overall accuracy as `(true + 0.5 × partial) / total × 100`
  5. Returns a complete `VerifyResponse`
- [ ] Test end-to-end: POST to `/verify` with text containing one clearly true and one clearly false claim — confirm both verdicts are correct

---

## PHASE 4 — Backend: AI Text Detection

### 4.1 Write `modules/text_detector.py`
This module uses two independent signals and combines them.

**Signal A — GPTZero API:**
- [ ] Write `gptzero_score(text: str) -> dict` as an async function
- [ ] POST to `https://api.gptzero.me/v2/predict/text` with header `x-api-key` and body `{"document": text}` (cap at 5000 chars)
- [ ] Extract `completely_generated_prob` from `documents[0]`, multiply by 100 for the score
- [ ] Extract `predicted_class` as the label
- [ ] Return dict with keys: `score` (int), `label` (str), `source` = "gptzero"
- [ ] On any exception, return `score: -1` and `source: "gptzero"` — never crash

**Signal B — Gemini stylometric analysis:**
- [ ] Write `gemini_style_score(text: str) -> dict` as an async function
- [ ] Instruct Gemini to analyse the text for: uniform sentence length, absence of personal anecdotes, excessive hedging phrases, formulaic paragraph structure, lack of typos or colloquialisms, overly comprehensive coverage without opinionated stance
- [ ] Instruct Gemini to return JSON with keys: `ai_probability` (int 0–100), `reasoning` (2 sentences), `key_signals` (list of up to 3 strings)
- [ ] Return dict with keys: `score` (int), `reasoning` (str), `signals` (list), `source` = "gemini"
- [ ] On any exception, return `score: -1`

**Combined score:**
- [ ] Write `detect_ai_text(text: str) -> dict` as an async function
- [ ] Run both signals concurrently with `asyncio.gather()`
- [ ] Combine as weighted average: GPTZero × 0.6 + Gemini × 0.4
- [ ] If one signal failed (score = -1), use the other alone; if both failed, return -1
- [ ] Map final score to a label: ≥80 = "AI Generated", 55–79 = "Likely AI", 35–54 = "Uncertain", <35 = "Likely Human"
- [ ] Return dict with keys: `final_score`, `label`, `gptzero` (full signal dict), `gemini` (full signal dict)

**Add to `main.py`:**
- [ ] Inside `/verify`, after `asyncio.gather()` on claims, run `detect_ai_text()` on the article text
- [ ] Attach result to `VerifyResponse` fields `ai_text_score` and `ai_text_reasoning`
- [ ] Add standalone `POST /detect-text` endpoint that accepts `VerifyRequest` with `input_text` only and returns the raw `detect_ai_text()` result

---

## PHASE 5 — Backend: Media Detection

### 5.1 Write `modules/media_detector.py`
This module has three responsibilities:

**Image URL extraction:**
- [ ] Write `extract_image_urls(url: str, max_images: int = 3) -> list[str]`
- [ ] Check for `og:image` meta tag first — this is usually the article hero image
- [ ] Scrape all `<img>` tags with `src` attributes using BeautifulSoup
- [ ] Filter out any URLs containing keywords: `icon`, `logo`, `avatar`, `badge`, `button`, `sprite`, `1x1`, `pixel`
- [ ] Filter out any URLs that do not start with `http`
- [ ] Prepend og:image to the front of the list
- [ ] Deduplicate while preserving order
- [ ] Return at most `max_images` URLs

**Image download:**
- [ ] Write `download_image_as_base64(image_url: str) -> tuple[str, str]` as an async function
- [ ] Use `httpx.AsyncClient` with a 10-second timeout and `follow_redirects=True`
- [ ] Extract the MIME type from the `content-type` response header
- [ ] Accept only: `image/jpeg`, `image/png`, `image/webp`, `image/gif` — default to `image/jpeg` for anything else
- [ ] Return `(base64_encoded_string, mime_type)`
- [ ] Return `("", "")` on any failure — never crash

**Gemini Vision analysis:**
- [ ] Write `analyze_image(image_url: str) -> MediaResult` as an async function
- [ ] Download the image using the function above
- [ ] If download failed, return a `MediaResult` with verdict `Unanalyzable` and a descriptive artifact message
- [ ] Send the image bytes and a prompt to Gemini using `types.Part.from_bytes()`
- [ ] The prompt must instruct Gemini to examine for: unnatural skin textures, inconsistent lighting, distorted hands/teeth/hair edges, background warping, uncanny valley facial features, garbled in-image text, inconsistent shadows
- [ ] Instruct Gemini to return JSON with keys: `verdict` (one of: AI-Generated/Likely AI/Likely Real/Real), `confidence` (int 0–100), `artifacts` (list of strings), `regions_of_concern` (list of strings)
- [ ] Instruct Gemini to be conservative — only say "AI-Generated" when multiple strong artifacts are present
- [ ] On any exception, return a `MediaResult` with verdict `Unanalyzable`

**Batch analyzer:**
- [ ] Write `analyze_article_media(url: str) -> list[MediaResult]` as an async function
- [ ] Extract up to 3 image URLs using `extract_image_urls()`
- [ ] If no images found, return empty list
- [ ] Analyze all images concurrently using `asyncio.gather()`

**Add to `main.py`:**
- [ ] Inside `/verify`, after AI text detection, if a URL was provided, call `analyze_article_media()`
- [ ] Attach results to `VerifyResponse.media_results`

---

## PHASE 6 — Backend: SSE Streaming Endpoint

### 6.1 Add `/verify-stream` to `main.py`
- [ ] Import `EventSourceResponse` from `sse_starlette.sse`
- [ ] Add `POST /verify-stream` endpoint that returns an `EventSourceResponse`
- [ ] The internal async generator must emit these events in order:

  | Event name | When to emit | Payload keys |
  |---|---|---|
  | `status` | At each sub-step | `stage`, `message`, optionally `claim` or `query` |
  | `claims` | After extraction completes | `claims` (array), `count` (int) |
  | `claim_result` | After each individual claim is verified | Full `ClaimResult` as JSON |
  | `ai_text` | After AI text detection completes | Full detection result dict |
  | `media` | After each image is analyzed | Full `MediaResult` as JSON |
  | `complete` | After all stages finish | `total_claims`, `overall_accuracy`, all four verdict counts, `ai_text_score` |
  | `error` | On any unhandled exception | `message` (str) |

- [ ] Stage names for `status` events (used by the frontend progress tracker): `extracting`, `searching`, `verifying`, `ai_detection`, `media`
- [ ] For claim-by-claim processing, emit a `status` event before searching (mentioning which claim number) and another before verifying — process claims one at a time (not concurrently) so the stream feels live
- [ ] Wrap the entire generator in a try/except — emit an `error` event on failure instead of crashing
- [ ] Test with `curl -N` to verify events stream in real time

---

## PHASE 7 — Frontend: Design System

### 7.1 Install Frontend Libraries
- [ ] Inside `frontend/`, install:
  ```
  framer-motion
  lucide-react
  eventsource-parser
  clsx
  tailwind-merge
  react-circular-progressbar
  ```

### 7.2 Configure `tailwind.config.ts`
- [ ] Extend `fontFamily` with three entries using CSS variables:
  - `display` → `var(--font-syne)`
  - `mono` → `var(--font-dm-mono)`
  - `sans` → `var(--font-dm-sans)`
- [ ] Extend `colors` with these custom palettes:

  **Ink (dark background scale):**
  - `ink-950`: `#08111e` — page background (dark mode)
  - `ink-900`: `#0d1b2e` — elevated surface (dark mode)
  - `ink-800`: `#1a2e45` — card background (dark mode)
  - `ink-700`: `#1e3a5f` — border / separator

  **Parchment (light background scale):**
  - `parchment-50`: `#f4f1eb` — page background (light mode)
  - `parchment-100`: `#ede9e1` — elevated surface (light mode)
  - `parchment-200`: `#e0dbd0` — card background (light mode)

  **Text scale:**
  - `text-primary-dark`: `#f0ede6`
  - `text-secondary-dark`: `#8899aa`
  - `text-tertiary-dark`: `#4a5a6a`
  - `text-primary-light`: `#0d1b2e`
  - `text-secondary-light`: `#556070`
  - `text-tertiary-light`: `#9aa8b4`

  **Accent (Bloomberg amber):**
  - `accent-dark`: `#f59e0b`
  - `accent-light`: `#d97706`

  **Verdict colors (semantic, same in both themes):**
  - `verdict-true`: `#10b981`
  - `verdict-false`: `#f43f5e`
  - `verdict-partial`: `#f59e0b`
  - `verdict-unknown`: `#8899aa`
  - `verdict-ai`: `#8b5cf6`

- [ ] Extend `keyframes` with:
  - `slideUp`: from `opacity 0, translateY 16px` to `opacity 1, translateY 0`
  - `barFill`: from `width: 0%` to `width: var(--bar-width)`
  - `fadePulse`: a slow opacity oscillation between 0.4 and 1.0 for loading states
- [ ] Extend `animation` to register `slide-up`, `bar-fill`, and `fade-pulse` using the keyframes above with appropriate durations and easing (`cubic-bezier(0.16, 1, 0.3, 1)` for slide and bar)
- [ ] Extend `backdropBlur` with a `glass` value of `16px`

### 7.3 Write `app/globals.css`
- [ ] Define CSS custom properties (`:root`) for both themes using a `[data-theme="dark"]` and `[data-theme="light"]` selector approach:

  **Dark theme variables:**
  - `--bg`: `#08111e`
  - `--bg2`: `#0d1b2e`
  - `--surface`: `rgba(255,255,255,0.04)`
  - `--glass-bg`: `rgba(13,27,46,0.7)`
  - `--glass-border`: `rgba(255,255,255,0.1)`
  - `--glass-shine`: `rgba(255,255,255,0.06)`
  - `--text-1`: `#f0ede6`
  - `--text-2`: `#8899aa`
  - `--text-3`: `#4a5a6a`
  - `--accent`: `#f59e0b`
  - `--accent-dim`: `rgba(245,158,11,0.12)`
  - `--accent-border`: `rgba(245,158,11,0.3)`
  - `--grid-line`: `rgba(255,255,255,0.04)`

  **Light theme variables (same names, different values):**
  - `--bg`: `#f4f1eb`
  - `--bg2`: `#ede9e1`
  - `--surface`: `rgba(0,0,0,0.03)`
  - `--glass-bg`: `rgba(255,255,255,0.65)`
  - `--glass-border`: `rgba(0,0,0,0.1)`
  - `--glass-shine`: `rgba(255,255,255,0.8)`
  - `--text-1`: `#0d1b2e`
  - `--text-2`: `#556070`
  - `--text-3`: `#9aa8b4`
  - `--accent`: `#d97706`
  - `--accent-dim`: `rgba(217,119,6,0.1)`
  - `--accent-border`: `rgba(217,119,6,0.35)`
  - `--grid-line`: `rgba(0,0,0,0.06)`

- [ ] Apply to `body`: `background-color: var(--bg)`, `color: var(--text-1)`, `font-family: var(--font-dm-sans)`, `-webkit-font-smoothing: antialiased`, `transition: background-color 0.3s, color 0.3s`
- [ ] Style custom scrollbar: 6px width, `--bg2` track, `--glass-border` thumb at 3px radius
- [ ] Style `::selection`: background `rgba(245,158,11,0.2)`, color `var(--text-1)`

- [ ] Add a reusable `.glass` utility class:
  - `background: var(--glass-bg)`
  - `border: 1px solid var(--glass-border)`
  - `backdrop-filter: blur(16px)` + `-webkit-` prefix
  - `border-radius: 14px`
  - `position: relative`
  - `overflow: hidden`
  - After pseudo-element: absolute, top 0, full width, height 1px, `background: var(--glass-shine)` — this creates the top shine line

### 7.4 Write `app/layout.tsx`
- [ ] Import `Syne` (weights 600, 700, 800), `DM_Mono` (weights 400, 500), `DM_Sans` (weights 400, 500, 600) from `next/font/google`
- [ ] Assign each font a CSS variable: `--font-syne`, `--font-dm-mono`, `--font-dm-sans`
- [ ] Apply all three variable classnames to the `<html>` element
- [ ] Set `data-theme="dark"` on `<html>` as the default — the theme toggle will switch this attribute at runtime
- [ ] Set page metadata: title `Aletheia — Fact & Claim Verification`, appropriate description

### 7.5 Write `lib/types.ts`
Create TypeScript interfaces matching the backend Pydantic models:
- [ ] `VerifyRequest` — `input_text?: string`, `url?: string`
- [ ] `ClaimResult` — all fields from the backend model, with TypeScript types
- [ ] `MediaResult` — all fields from the backend model
- [ ] `VerifyResponse` — all fields from the backend model
- [ ] `AITextResult` — `final_score: number`, `label: string`, `gptzero: object`, `gemini: object`
- [ ] `PipelineStage` — union type: `'idle' | 'extracting' | 'searching' | 'verifying' | 'ai_detection' | 'media' | 'complete' | 'error'`
- [ ] `SSEEvent` — `type: string`, `data: any`

---

## PHASE 8 — Frontend: SSE Client

### 8.1 Write `lib/api.ts`
- [ ] Export `API_URL` reading from `process.env.NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000`
- [ ] Write `streamVerification(inputText: string | null, url: string | null)` as an async generator function
- [ ] It should POST to `${API_URL}/verify-stream` with JSON body `{ input_text, url }`
- [ ] Throw a descriptive error if the response is not OK or body is null
- [ ] Use `eventsource-parser`'s `EventSourceParserStream` to parse the SSE stream
- [ ] Pipe: `response.body` → `TextDecoderStream` → `EventSourceParserStream`
- [ ] For each parsed event, yield `{ type: event.event ?? 'message', data: JSON.parse(event.data ?? '{}') }`
- [ ] This function is consumed in `page.tsx` via a `for await` loop

---

## PHASE 9 — Frontend: Components

Build all components in this exact order — each one is simpler than the next.

### 9.1 `components/ErrorBanner.tsx`
- [ ] Props: `message: string`, `onRetry?: () => void`
- [ ] Appearance: glass card with a red-tinted border (`rgba(244,63,94,0.25)`), red accent left border (3px), message text in DM Mono, optional "Retry" button using the accent color
- [ ] Animation: slides down from above using Framer Motion `initial={{ opacity: 0, y: -10 }}`

### 9.2 `components/PipelineProgress.tsx`
- [ ] Props: `currentStage: PipelineStage`, `statusMessage: string`, `completedStages: string[]`
- [ ] Render 5 stages in a vertical list: Extracting Claims, Searching Evidence, Verifying Claims, AI Detection, Media Scan
- [ ] Each stage has a dot indicator on the left, a label in DM Sans Medium, and status text on the right
- [ ] Dot states:
  - Completed: filled `#10b981` with a subtle glow (`box-shadow: 0 0 6px #10b981`)
  - Active: filled `#f59e0b` with pulsing glow animation (`fade-pulse`)
  - Pending: `var(--text-3)` unfilled
- [ ] Active stage shows the live `statusMessage` (e.g. "Searching: 'Tim Cook Apple CEO'") in DM Mono, accent color, 10px
- [ ] Each stage row has a bottom border using `var(--grid-line)` except the last
- [ ] Wrap in a glass card
- [ ] Framer Motion: `AnimatePresence` wrapping the whole list, each stage animates in with `slide-up` with stagger delay of 80ms

### 9.3 `components/ReportHeader.tsx`
- [ ] Props: `summary` object from the `complete` SSE event, `aiTextResult` from the `ai_text` event
- [ ] Layout: glass card, two-column row — left side has big accuracy number, right side has 4 verdict count pills
- [ ] Big accuracy number: Syne 800, 52px, color based on value: ≥75% green, 50–74% amber, <50% red
- [ ] Below accuracy number: "ACCURACY" label in DM Mono uppercase, 11px, `var(--text-3)`
- [ ] Four verdict pills (right side): each shows count + label, styled with their semantic background and border colors at low opacity
- [ ] Below the two-column row: a separator line (`var(--grid-line)`) then a row showing the AI text detection badge
- [ ] AI badge: violet background `rgba(139,92,246,0.15)`, violet text `#a78bfa`, violet border `rgba(139,92,246,0.25)`, Syne Bold, shows score and label (e.g. "AI SCORE: 31% · Likely Human")
- [ ] Framer Motion: whole card `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`

### 9.4 `components/ClaimCard.tsx`
This is the most important component — the core visual unit of the report.

- [ ] Props: `result: ClaimResult`, `index: number`
- [ ] Outer wrapper: glass card
- [ ] Header row: claim number left (DM Mono, 10px, `var(--text-3)`, uppercase), verdict badge right
- [ ] Verdict badge styles (Syne Bold, 10px, letter-spacing 0.06em, rounded pill with 1px border):
  - True: `background rgba(16,185,129,0.12)`, `color #34d399`, `border rgba(16,185,129,0.25)`
  - False: `background rgba(244,63,94,0.12)`, `color #f87171`, `border rgba(244,63,94,0.25)`
  - Partially True: `background rgba(245,158,11,0.12)`, `color #fbbf24`, `border rgba(245,158,11,0.25)`
  - Unverifiable: `background var(--surface)`, `color var(--text-2)`, `border var(--glass-border)`
- [ ] Claim text: DM Mono Regular, 12px, `var(--text-1)`, line-height 1.65, 10px top margin
- [ ] Reasoning text: DM Mono Italic, 11px, `var(--text-2)`, line-height 1.6, starts with "→ ", 8px top margin
- [ ] Confidence row: "Confidence" label (DM Sans, 11px, `var(--text-3)`), bar, percentage number (DM Mono Medium, 13px, `var(--text-1)`)
- [ ] Confidence bar:
  - Track: 3px height, full width, background is the verdict color at 10% opacity
  - Fill: verdict color, animates from 0 to confidence% on mount using a CSS custom property `--bar-width` set inline
  - Use Framer Motion `useEffect` + `useState` to trigger the animation after mount so it doesn't flash
- [ ] Source links: DM Sans 11px, `var(--accent)` color, underline on hover, open in new tab via `target="_blank" rel="noopener noreferrer"`, prefixed with "↗ "
- [ ] Search query used: collapsed in a `<details>` element with summary "Query used →", DM Mono 10px, `var(--text-3)`
- [ ] Framer Motion: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, delay = `index × 0.08` seconds

### 9.5 `components/AITextMeter.tsx`
- [ ] Props: `result: AITextResult`
- [ ] Install `react-circular-progressbar` and import `CircularProgressbar` + `buildStyles` + the CSS
- [ ] Render inside a glass card
- [ ] Gauge: 120px diameter, `CircularProgressbar` with `value={result.final_score}`
- [ ] Path color based on score:
  - <35: `#10b981`
  - 35–55: `#f59e0b`
  - 55–80: `#f97316`
  - >80: `#8b5cf6`
- [ ] Center text: score `%` in Syne Bold
- [ ] Trail color: `var(--surface)`
- [ ] Below gauge: label string (e.g. "Likely Human") in DM Mono, 12px, `var(--text-2)`
- [ ] Below label: up to 3 signal tags from `result.gemini.signals` — each a small pill with `var(--surface)` background, DM Mono 10px
- [ ] Below signals: two secondary score lines: "GPTZero: X%" and "Gemini: X%" in DM Mono 10px, `var(--text-3)`
- [ ] Framer Motion: fade in on mount

### 9.6 `components/MediaCard.tsx`
- [ ] Props: `result: MediaResult`
- [ ] Render inside a glass card
- [ ] Image container: 16:9 aspect ratio, `position: relative`, `overflow: hidden`, `border-radius: 8px`
- [ ] Use Next.js `<Image>` with `fill` and `object-fit: cover`
- [ ] On image load error, show a fallback div with the URL text in DM Mono
- [ ] Verdict badge overlaid at bottom-left of image: small pill, Syne Bold 10px:
  - AI-Generated: `background rgba(139,92,246,0.85)`, white text
  - Likely AI: `background rgba(249,115,22,0.85)`, white text
  - Likely Real: `background rgba(245,158,11,0.85)`, dark text
  - Real: `background rgba(16,185,129,0.85)`, dark text
  - Unanalyzable: `background rgba(136,153,170,0.85)`, dark text
- [ ] Below image: confidence in DM Mono 11px
- [ ] Artifact tags: each in a small pill with `var(--surface)` bg, DM Mono 10px, `var(--text-2)`, wrapped in a flex-wrap row

### 9.7 `components/InputPanel.tsx`
- [ ] Props: `onSubmit: (text: string | null, url: string | null) => void`, `isLoading: boolean`
- [ ] Internal state: `mode` (either `'text'` or `'url'`), `textValue`, `urlValue`
- [ ] Render inside a glass card
- [ ] Mode switcher: two small pill buttons — "Text" and "URL" — active pill uses `var(--accent)` border and color, inactive uses `var(--glass-border)` and `var(--text-3)`
- [ ] Text mode: `<textarea>` — DM Mono font, 12px, `var(--text-1)`, `var(--glass-bg)` background, `var(--glass-border)` border, 4 rows minimum, placeholder: `"Paste article text here to verify its claims..."`
- [ ] URL mode: `<input type="url">` — same font/color styling, prefixed with a `Link` icon from lucide-react (16px, `var(--text-3)`), placeholder: `"https://example.com/article"`
- [ ] Verify button:
  - Full width, `var(--accent)` background, dark text, Syne Bold 13px, letter-spacing 0.04em
  - Disabled and reduced opacity when both inputs are empty OR `isLoading` is true
  - Loading state: show a small spinner (animated SVG or CSS border spinner) + text "Verifying..."
  - Framer Motion: `whileHover={{ scale: 1.01 }}`, `whileTap={{ scale: 0.98 }}`
- [ ] On submit: call `onSubmit(textValue || null, urlValue || null)`

### 9.8 `components/ThemeToggle.tsx`
- [ ] No props needed
- [ ] Internal state: `theme` (either `'dark'` or `'light'`), initialised from `localStorage` if available, defaulting to `'dark'`
- [ ] On theme change: set `document.documentElement.setAttribute('data-theme', theme)` and persist to `localStorage`
- [ ] Render two small pill buttons: "Dark" and "Light"
- [ ] Active: `var(--accent)` background, dark text
- [ ] Inactive: `var(--surface)` background, `var(--text-2)` text
- [ ] DM Mono font, 11px, pill border-radius
- [ ] Use `useEffect` on mount to apply the persisted theme

---

## PHASE 10 — Frontend: Main Page

### 10.1 Write `app/page.tsx`
This is the state orchestrator — it holds all app state and feeds it to components.

**State variables to define:**
- [ ] `isLoading: boolean` — true while SSE stream is active
- [ ] `currentStage: PipelineStage` — tracks which pipeline stage is active
- [ ] `statusMessage: string` — live sub-status text for the progress tracker
- [ ] `completedStages: string[]` — list of stage names that have finished
- [ ] `extractedClaims: string[]` — raw claims after extraction (shown as a count in progress)
- [ ] `claimResults: ClaimResult[]` — grows as each claim result arrives
- [ ] `summary: object | null` — from the `complete` event
- [ ] `aiTextResult: AITextResult | null` — from the `ai_text` event
- [ ] `mediaResults: MediaResult[]` — grows as each media result arrives
- [ ] `error: string | null` — from the `error` event

**`handleSubmit` function:**
- [ ] Reset all state variables to their initial values
- [ ] Set `isLoading: true`
- [ ] Call `streamVerification()` from `lib/api.ts` and iterate with `for await`
- [ ] Switch on `event.type`:
  - `status` → update `currentStage` and `statusMessage`; push previous stage to `completedStages` when stage changes
  - `claims` → update `extractedClaims`
  - `claim_result` → push to `claimResults`
  - `ai_text` → set `aiTextResult`, push `'ai_detection'` to `completedStages`
  - `media` → push to `mediaResults`
  - `complete` → set `summary`, set `currentStage: 'complete'`, set `isLoading: false`
  - `error` → set `error`, set `isLoading: false`
- [ ] Wrap in try/catch — on catch, set error and stop loading

**Page layout (top to bottom):**
- [ ] `<header>` — app name "ALETHEIA" in Syne 800, 32px, `var(--text-1)`, tracking -0.04em; tagline "FACT · CLAIM · VERIFICATION" in DM Mono 11px, `var(--accent)`, tracking 0.1em, uppercase; `<ThemeToggle>` aligned to the right
- [ ] `<InputPanel onSubmit={handleSubmit} isLoading={isLoading} />`
- [ ] Conditionally show `<PipelineProgress>` when `isLoading` is true
- [ ] Conditionally show `<ReportHeader>` when `summary` is not null
- [ ] Map over `claimResults` to render `<ClaimCard>` for each — wrap in `<AnimatePresence>` from Framer Motion so cards animate in as they stream
- [ ] Conditionally show `<AITextMeter>` when `aiTextResult` is not null
- [ ] Conditionally show a grid of `<MediaCard>` components when `mediaResults.length > 0` — use a 2-column grid on desktop, 1 column on mobile
- [ ] Conditionally show `<ErrorBanner>` when `error` is not null, with a retry button that calls `handleSubmit` again with the last inputs
- [ ] Set `max-width: 860px`, horizontally centred, with `padding: 2rem 1rem`
- [ ] Background: `var(--bg)`, full min-height

---

## PHASE 11 — Integration Testing

### 11.1 Test Case 1 — Accurate Article
- [ ] Use a reliable factual article or Wikipedia page URL
- [ ] Expected: majority True verdicts, overall accuracy above 75%, AI score below 35%
- [ ] Check: claim cards render with correct colours, confidence bars animate
- [ ] Screenshot the completed report

### 11.2 Test Case 2 — Misinformation
- [ ] Use this exact text (paste into text mode):
  `"The Great Wall of China is visible from space with the naked eye. Albert Einstein failed mathematics in school. Napoleon Bonaparte was extremely short at only 5 feet 2 inches. The human tongue has separate taste regions for sweet, sour, salty, and bitter."`
- [ ] Expected: 3–4 False verdicts, low overall accuracy
- [ ] Check: red badges rendering correctly, reasoning text is specific and cited
- [ ] Screenshot

### 11.3 Test Case 3 — Conflicting / Temporal Evidence
- [ ] Use this text (paste into text mode):
  `"The current Prime Minister of the United Kingdom is Rishi Sunak. Sam Altman is the CEO of OpenAI. India's population surpassed China's in 2023 to become the world's most populous country."`
- [ ] Expected: mix of True, Partially True, and Unverifiable — reasoning should explicitly mention conflicting or outdated sources
- [ ] Screenshot

### 11.4 Bug Fixes from Testing
- [ ] Check browser console for any JSON parse errors
- [ ] Check that SSE stream does not disconnect prematurely on articles with many claims
- [ ] Check that `MediaCard` renders correctly when an image URL 404s
- [ ] Resize browser to 375px width — confirm layout does not break
- [ ] Toggle between Dark and Light themes mid-session — confirm all components update correctly

---

## PHASE 12 — Polish, Error Handling, and Submission

### 12.1 Loading States
- [ ] While `isLoading` is true and `claimResults` is empty, show 3 skeleton `ClaimCard` placeholders — pulsing gray bars using `fade-pulse` animation, glass card wrapper, same dimensions as a real card
- [ ] If `claimResults` is empty and `isLoading` is false and no error, show nothing (idle state)
- [ ] Add a subtle grid background pattern to the page using a CSS `background-image` with tiny dots: `radial-gradient(circle, var(--grid-line) 1px, transparent 1px)` at `background-size: 24px 24px`

### 12.2 Error Handling Audit
- [ ] Backend: if Tavily returns zero results, `verify_claim()` must still run and return `Unverifiable` — never skip the step
- [ ] Backend: if GPTZero API key is invalid (401 response), fall back gracefully to Gemini-only score with a logged warning
- [ ] Backend: if Gemini returns malformed JSON on any call, every function must have a fallback — no endpoint should return a 500 error
- [ ] Backend: if a URL is paywalled or returns no extractable text (under 200 chars after both extraction methods), return HTTP 422 with the message "Could not extract readable text — the URL may be paywalled or require JavaScript."
- [ ] Frontend: if the SSE stream disconnects unexpectedly, the `try/catch` in `handleSubmit` must catch it, set the error state, and preserve any `claimResults` already received
- [ ] Frontend: all `fetch` calls should have a timeout using `AbortController` set to 120 seconds

### 12.3 Accessibility
- [ ] All interactive elements must have visible focus rings using `outline: 2px solid var(--accent)` with `outline-offset: 2px`
- [ ] All verdict badges must have `aria-label` attributes (e.g. `aria-label="Verdict: False"`)
- [ ] The theme toggle must have `aria-pressed` on the active button
- [ ] Colour alone must never be the only indicator — each verdict badge has text, not just colour

### 12.4 README
- [ ] Write a proper `README.md` at the project root containing:
  - 2-sentence project description
  - Tech stack table (Frontend / Backend / LLM / Search / Detection)
  - Environment variables table listing all 3 required keys with where to get them
  - Step-by-step setup: clone → install backend deps → install frontend deps → configure `.env` → run both servers
  - Screenshot of the completed dark-mode report UI
  - Screenshot of the light-mode report UI
  - GitHub repo link

### 12.5 GitHub Push
- [ ] Confirm `backend/.env` and `frontend/.env.local` are NOT staged: run `git status` and verify
- [ ] Stage everything else: `git add .`
- [ ] Commit: `git commit -m "feat: Aletheia v1.0 — full pipeline, bonus AI and media detection, dual-theme UI"`
- [ ] Create a public GitHub repository named `aletheia`
- [ ] Push: `git remote add origin <url>`, `git branch -M main`, `git push -u origin main`

### 12.6 Demo Script (10 Minutes)
- [ ] **0:00–0:45** Open the app in dark mode. Say one sentence about what Aletheia is. Point to the input panel and pipeline progress tracker.
- [ ] **0:45–3:00** Paste Test Case 2 (misinformation text). Run verification. Narrate the live pipeline stages as they stream. Highlight False badge colours and specific reasoning text.
- [ ] **3:00–5:30** Paste a real article URL (Test Case 1). Run. Highlight the green True verdicts and the confidence bar animations. Show a source citation link.
- [ ] **5:30–7:30** Paste Test Case 3 (temporal claims). Run. Specifically call out any Unverifiable or Partially True verdict. Read the reasoning aloud to show it mentions conflicting sources.
- [ ] **7:30–8:30** Scroll to the AI Text Detection section. Explain the two-signal approach (GPTZero + Gemini stylometric). Point to the individual scores and the combined verdict.
- [ ] **8:30–9:30** If media results are present, show a MediaCard. Point to the artifact list.
- [ ] **9:30–10:00** Toggle to Light mode. Show the UI adapts cleanly. Open GitHub repo link. Done.

---

## FINAL SUBMISSION CHECKLIST

- [ ] `GET /` returns healthy response
- [ ] `POST /verify` returns correct `VerifyResponse` JSON
- [ ] `POST /verify-stream` emits all 7 SSE event types without crashing
- [ ] `POST /detect-text` returns AI detection result
- [ ] All 7 frontend components render without console errors
- [ ] Dark and light theme both look correct
- [ ] All 3 demo test cases produce expected results
- [ ] GitHub repository is public
- [ ] README is complete with setup instructions
- [ ] No API keys are in any committed file (`git log --all -p | grep "API_KEY"` returns nothing)
- [ ] App runs cleanly from a fresh `git clone` following README instructions exactly

---

## MASTER QUICK REFERENCE

### All Backend Libraries (`pip install`)
```
fastapi uvicorn[standard] python-dotenv python-multipart
google-genai tavily-python
trafilatura newspaper3k requests beautifulsoup4 lxml
Pillow httpx aiohttp aiofiles
slowapi bleach starlette pydantic sse-starlette
```

### All Frontend Libraries (`npm install`)
```
framer-motion lucide-react eventsource-parser
clsx tailwind-merge react-circular-progressbar
```

### Google Fonts (via `next/font/google`)
```
Syne          weights: 600, 700, 800   → display / app name / scores / verdict labels
DM_Mono       weights: 400, 500        → all claim text / reasoning / data output
DM_Sans       weights: 400, 500, 600   → all UI chrome / buttons / labels / metadata
```

### All API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Health check |
| POST | `/verify` | Full pipeline, blocking JSON response |
| POST | `/verify-stream` | Full pipeline, SSE stream |
| POST | `/extract-claims` | Extraction only (debug use) |
| POST | `/detect-text` | AI text detection only (debug use) |

### All SSE Event Types
| Event | Payload | Fired when |
|-------|---------|------------|
| `status` | `stage`, `message`, `claim?`, `query?` | Each pipeline sub-step |
| `claims` | `claims[]`, `count` | Extraction complete |
| `claim_result` | Full `ClaimResult` object | Each claim verified |
| `ai_text` | Full detection result | AI text detection complete |
| `media` | Full `MediaResult` object | Each image analyzed |
| `complete` | Summary stats object | All stages done |
| `error` | `message` | Any unhandled exception |

### Verdict Colour Tokens
| Verdict | Badge BG | Badge Text | Badge Border | Bar fill |
|---------|----------|------------|--------------|----------|
| True | `rgba(16,185,129,0.12)` | `#34d399` | `rgba(16,185,129,0.25)` | `#10b981` |
| False | `rgba(244,63,94,0.12)` | `#f87171` | `rgba(244,63,94,0.25)` | `#f43f5e` |
| Partially True | `rgba(245,158,11,0.12)` | `#fbbf24` | `rgba(245,158,11,0.25)` | `#f59e0b` |
| Unverifiable | `var(--surface)` | `var(--text-2)` | `var(--glass-border)` | `#8899aa` |
| AI-Generated | `rgba(139,92,246,0.15)` | `#a78bfa` | `rgba(139,92,246,0.25)` | `#8b5cf6` |
