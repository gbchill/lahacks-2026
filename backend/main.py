"""Orision backend — FastAPI app entry point."""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import documents, calls, family

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    # TODO: initialize Mongo client, Supabase client, ElevenLabs voice ID lookup
    print("[orision] backend starting up")
    yield
    print("[orision] backend shutting down")


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
