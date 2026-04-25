# Orision Backend

FastAPI server for Orision. Hosts:
- REST API for document explanation, family timeline, call orchestration
- Fetch.ai uAgents (Parser, Context, Drafter, Translator) with Chat Protocol
- MCP server exposing `explain_government_letter()` for the Cognition challenge

## Local development

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in keys
uvicorn main:app --reload --port 8000
```

API docs auto-generated at http://localhost:8000/docs

## Deploy to Vultr

```bash
docker build -t orision-backend .
docker run -p 8000:8000 --env-file .env orision-backend
```

## Routes

- `GET  /health` — liveness check
- `POST /documents/explain` — photo → translated explanation + audio
- `POST /calls/start` — initiate live translated call
- `WS   /calls/{call_id}/stream` — Twilio media stream + transcript
- `GET  /family/{user_id}/timeline` — past documents
- `GET  /family/{user_id}/similar/{document_id}` — vector search
