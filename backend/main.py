"""Orision backend — FastAPI app entry point."""
import asyncio
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import documents, calls, family

load_dotenv()

_bureau_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _bureau_task
    print("[orision] backend starting up")

    from agents.bureau import build_bureau

    bureau = build_bureau()
    _bureau_task = asyncio.create_task(bureau.run_async())
    print(f"[orision] Bureau started on port {os.getenv('BUREAU_PORT', '8001')}")

    yield

    print("[orision] backend shutting down")
    if _bureau_task and not _bureau_task.done():
        _bureau_task.cancel()
        try:
            await _bureau_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Orision Backend",
    description="Bureaucratic translator for immigrant families.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — frontend on Vercel + local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://orision.tech",
        "https://orision.online",
        "https://orision.family",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(calls.router, prefix="/calls", tags=["calls"])
app.include_router(family.router, prefix="/family", tags=["family"])


@app.get("/")
def root():
    return {"app": "orision", "status": "running"}


@app.get("/health")
def health():
    return {"ok": True}
