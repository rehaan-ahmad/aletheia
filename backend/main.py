from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import get_settings
from database import init_db
from routers import verify, auth, reports, detect
import logging, time

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aletheia")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Aletheia API",
    description="AI-Driven Fact-Check & Claim Verification",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
)

# ── Rate Limit Error Handler ────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Security Headers Middleware ─────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; connect-src 'self';"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ── Request Logging Middleware ──────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    # NEVER log body or query params (may contain sensitive input)
    logger.info(f"REQUEST {request.method} {request.url.path} from {get_remote_address(request)}")
    response = await call_next(request)
    duration = round(time.time() - start, 3)
    logger.info(f"RESPONSE {response.status_code} in {duration}s")
    return response

# ── Global Exception Handler ────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}")
    # NEVER expose stack trace to client
    return JSONResponse(
        status_code=500,
        content={"error": "An internal error occurred. Please try again.", "code": "INTERNAL_ERROR"}
    )

# ── Routers ─────────────────────────────────────────────────
app.include_router(verify.router, prefix="/api", tags=["verify"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(detect.router, prefix="/api", tags=["detect"])

# ── Startup ─────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("Aletheia API started. Database initialized.")

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Aletheia", "version": "1.0.0"}
