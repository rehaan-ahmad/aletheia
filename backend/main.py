from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import VerifyRequest, VerifyResponse, ClaimResult

app = FastAPI(title="Aletheia API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "Aletheia is running"}

@app.post("/verify", response_model=VerifyResponse)
async def verify_pipeline(request: VerifyRequest):
    return {"message": "pipeline not yet implemented"}

@app.get("/stream/{task_id}")
async def get_stream(task_id: str):
    return {"message": "SSE streaming not yet implemented"}
