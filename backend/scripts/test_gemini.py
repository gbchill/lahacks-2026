"""Probe script: confirm google-genai SDK API surface before writing services/gemini.py."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY", "")
if not api_key:
    print("FAIL: GEMINI_API_KEY not set in backend/.env")
    sys.exit(1)

client = genai.Client(api_key=api_key)

# Test 1: Basic text generation
print("--- Test 1: Text generation ---")
try:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello in one sentence.",
    )
    print(f"PASS: {resp.text[:200]}")
except Exception as e:
    print(f"FAIL: {e}")

# Test 2: JSON mode
print("\n--- Test 2: JSON response mode ---")
try:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Return a JSON object with keys: greeting, language",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    print(f"PASS: {resp.text[:200]}")
except Exception as e:
    print(f"FAIL: {e}")

# Test 3: Part.from_uri construction (no network call, just object creation)
print("\n--- Test 3: Part.from_uri ---")
try:
    part = types.Part.from_uri(
        file_uri="https://example.com/test.jpg",
        mime_type="image/jpeg",
    )
    print(f"PASS: Part created: {type(part)}")
except Exception as e:
    print(f"FAIL: {e}")

# Test 4: Embeddings
print("\n--- Test 4: Embeddings ---")
try:
    resp = client.models.embed_content(
        model="text-embedding-004",
        contents="Hello world",
    )
    vec = resp.embeddings[0].values
    print(f"PASS: Embedding dim={len(vec)}, first 3={vec[:3]}")
except Exception as e:
    print(f"FAIL (non-critical): {e}")

print("\nDone.")
