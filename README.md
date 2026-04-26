# Orision

> **"Every immigrant kid has helped translate for their family. Orision gives parents the clarity to fully understand, decide, and speak for themselves."**

**Live Demo:** [https://orision.us](https://orision.us)

Built by George and Jade Yang at **LA Hacks 2026**.

---

## The Problem

25 million people in the US live in households where no adult speaks English well. Parents miss Medicaid renewal deadlines, misread USCIS notices, sign things they don't understand. Their kids translate starting at age 8 — a documented harm called "language brokering."

Every immigrant kid has stepped in as their family's translator. I did too. But when I left for college, that support disappeared — and my parents were left to figure it out on their own again. Just last year, a medical letter came in the mail. They tried to interpret it, but weren't confident. By the time I came home, I found out my insurance had lapsed — missed paperwork, missed deadline.

Orision is built to remove that uncertainty — giving families clear explanations and familiar, trusted translation at their fingertips, without long calls or language barriers.

The name "Orision" blends **Origin** and **Vision**, reflecting the strength of family roots and the shared hopes that guide every generation forward.

---

## How It Works

1. **Snap a photo** of any government document (Medicaid, USCIS, IRS, DMV, school, medical, lease, car insurance)
2. **Cloudinary enhances** the image for optimal OCR (auto-orient, sharpen, contrast, grayscale)
3. **Gemini 2.5 Flash Vision** extracts text from the enhanced photo
4. **Gemma 3** scans for PII (SSNs, account numbers) and redacts before processing
5. **Fetch.ai agents** orchestrate the pipeline: parse → find context from past documents → draft explanation → translate
6. The parent receives a **plain-language explanation in their language** with key deadlines, amounts, and required actions highlighted
7. **ElevenLabs** reads the explanation aloud in a familiar, cloned voice
8. **One tap to call** the office — Twilio connects the call with live bidirectional translation
9. Every document is stored in **MongoDB Atlas** with vector embeddings, building a family document memory that improves context over time

---

## Tech Architecture

| Service | Role |
|---------|------|
| **Cloudinary** | Photo enhancement pipeline (sharpen, auto-orient, grayscale, quality boost) + audio/media storage |
| **Gemini 2.5 Flash** | Vision OCR — extract text from document photos |
| **Gemma 3 (27B-IT)** | On-device PII redaction, document classification, fact extraction |
| **ElevenLabs** | Voice cloning + text-to-speech in the parent's language |
| **Twilio** | Phone calls with Media Streams for live bidirectional translation |
| **MongoDB Atlas** | Vector search across family document history for contextual explanations |
| **Supabase** | Auth (email + Google OAuth) and user storage |
| **Fetch.ai Agentverse** | 4-agent orchestration pipeline (parser, context, drafter, translator) |
| **Vultr** | Cloud Compute hosting for backend + agents + MCP server |
| **Cognition MCP** | Model Context Protocol server — exposes document tools to Claude Desktop |
| **GoDaddy** | Domain registration — orision.us |
| **Figma** | Design system and prototyping |

---

## Quick Start for Judges

### Option A: Live Demo (Recommended)

Visit **[https://orision.us](https://orision.us)** — the full app is deployed and running.

### Option B: Run Locally

#### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org))
- **Python** 3.11+ ([download](https://python.org))
- **Docker** (optional, for containerized backend)

#### 1. Clone the repo

```bash
git clone https://github.com/gbchill/lahacks-2026.git
cd lahacks-2026
```

#### 2. Start the frontend

```bash
cd app
npm install
```

Create `app/.env` with your keys (see [Environment Variables](#frontend-appenv) below):

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
# Frontend runs at http://localhost:5173
```

#### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example` and fill in your API keys (see [Environment Variables](#backend-backendenv) below).

```bash
uvicorn main:app --reload --port 8000
# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/docs
# Fetch.ai Agent Bureau on port 8001
# MCP server at http://localhost:8000/mcp/sse
```

#### 3b. Or use Docker

```bash
cd backend
# Create .env with your API keys first
docker-compose up -d
# Backend on :8000, Agent Bureau on :8001
```

---

## Environment Variables

### Frontend (`app/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name |
| `VITE_BACKEND_URL` | Backend API URL (default: `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

### Backend (`backend/.env`)

Copy `backend/.env.example` for a full template. Key variables:

| Group | Variables |
|-------|-----------|
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` |
| **Google AI** | `GEMINI_API_KEY` (Gemini Vision OCR), `GEMMA_API_KEY` (Gemma PII/classification) |
| **ElevenLabs** | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| **MongoDB Atlas** | `MONGODB_URI`, `MONGODB_DB_NAME` |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` |
| **Fetch.ai Agents** | `*_AGENT_SEED` (5 seeds), `*_AGENT_ADDRESS` (5 addresses), `BUREAU_PORT` |
| **Deployment** | `PUBLIC_BASE_URL` (public HTTPS URL for Twilio WebSocket behind reverse proxy) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/documents/explain` | Upload a document photo → get OCR + explanation + translation |
| `POST` | `/calls/start` | Initiate a live translated phone call via Twilio |
| `WS` | `/calls/{id}/stream` | Twilio Media Stream WebSocket for bidirectional audio |
| `WS` | `/calls/{id}/transcript` | Real-time transcript updates for the frontend |
| `GET` | `/family/{user_id}/timeline` | Fetch document history from MongoDB |
| `GET` | `/family/{user_id}/similar/{doc_id}` | Vector search for similar past documents |
| `POST` | `/language/detect` | Detect language from audio via speech recognition |
| `POST` | `/voice/clone` | Clone a user's voice via ElevenLabs |
| `POST` | `/chat/message` | Chat with AI about your documents |
| `GET` | `/mcp/sse` | MCP server (SSE transport) for Claude Desktop / Cognition |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive API documentation (Swagger UI) |

---

## Project Structure

```
lahacks-2026/
├── app/                          # React 19 + Vite 6 + TypeScript 5.9
│   ├── src/
│   │   ├── components/           # Reusable UI (shadcn/ui, bottom tab bar, wordmark)
│   │   ├── contexts/             # Auth, language providers
│   │   ├── hooks/                # Speech recognition, custom hooks
│   │   ├── lib/                  # API clients, utilities, i18n labels
│   │   ├── pages/                # Route pages (welcome, home, capture, result, family, account)
│   │   └── App.tsx               # Route definitions
│   ├── public/                   # Static assets (logo.png)
│   └── .env                      # Frontend env vars (VITE_* prefix)
│
├── backend/                      # Python FastAPI
│   ├── api/                      # Route handlers
│   │   ├── documents.py          # Photo upload → OCR → explain → translate
│   │   ├── calls.py              # Twilio live translated calls
│   │   ├── family.py             # MongoDB document timeline
│   │   ├── language.py           # Language detection
│   │   ├── voice.py              # ElevenLabs voice cloning
│   │   └── chat.py               # AI chat about documents
│   ├── services/                 # External service integrations
│   │   ├── gemini.py             # Gemini 2.5 Flash Vision OCR
│   │   ├── gemma.py              # Gemma 3 PII redaction + classification
│   │   ├── elevenlabs.py         # Text-to-speech + voice cloning
│   │   ├── twilio_voice.py       # Twilio call initiation + TwiML
│   │   ├── mongo.py              # MongoDB Atlas + vector search
│   │   ├── cloudinary_admin.py   # Image enhancement + transforms
│   │   └── supabase_admin.py     # Auth verification
│   ├── agents/                   # Fetch.ai uAgents
│   │   ├── parser.py             # OCR text parsing agent
│   │   ├── context.py            # Document context lookup agent
│   │   ├── drafter.py            # Explanation drafting agent
│   │   ├── translator.py         # Translation agent
│   │   ├── orchestrator.py       # Pipeline orchestration agent
│   │   └── bureau.py             # Agent Bureau (runs all agents)
│   ├── mcp_server/               # Model Context Protocol server
│   │   ├── server.py             # MCP tool definitions
│   │   └── run_stdio.py          # stdio transport for Claude Desktop
│   ├── scripts/                  # Utility scripts
│   │   ├── cloudinary_ab_test.py # A/B comparison: raw vs enhanced OCR
│   │   └── deploy.sh             # Vultr deployment script
│   ├── Dockerfile                # Container image
│   ├── docker-compose.yml        # Docker Compose config
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Backend env vars (API keys)
│
├── design/
│   └── figma-make/               # Figma design files + export PDF
│
├── docs/
│   └── evidence/                 # Prize evidence screenshots
│       ├── agentverse-inspector.png
│       ├── asione-drafter.png
│       ├── atlas-vector-search.png
│       ├── cloudinary-ab-results.json
│       ├── mcp-claude-desktop.png
│       ├── vultr-dashboard.png
│       └── godaddy-domain-dns.png
│
└── README.md                     # This file
```

---

## Prize Challenges

| # | Challenge | What We Built |
|---|-----------|---------------|
| 1 | **Light the Way (Aramco)** | Full app: photo → OCR → explain → translate → voice → call. Live at orision.us |
| 2 | **Fetch.ai Agentverse** | 4 uAgents (parser, context, drafter, translator) registered on Agentverse with Chat Protocol |
| 3 | **Fetch.ai OmegaClaw** | Agents discoverable via ASI:One — "immigrant family document triage" skill |
| 4 | **Cognition MCP** | MCP server at `/mcp/sse` with `explain_government_letter` tool, tested in Claude Desktop |
| 5 | **Arista Connect the Dots** | One-tap calling connects parents directly to government offices with live translation |
| 6 | **Figma Make** | Complete design system in Figma — exported in `design/figma-make/` |
| 7 | **MLH Gemma** | Gemma 3 (27B-IT) for PII redaction, document classification, and fact extraction |
| 8 | **MLH Vultr** | Backend + agents + MCP deployed on Vultr Cloud Compute (Docker) |
| 9 | **MLH MongoDB Atlas** | Vector search across family document history for contextual explanations |
| 10 | **MLH GoDaddy** | orision.us domain registered and DNS configured |
| 11 | **Cloudinary** | Image enhancement pipeline (sharpen, orient, grayscale, quality boost) with A/B OCR comparison evidence |
| 12 | **MLH ElevenLabs** | Voice cloning + TTS — explanations read aloud in a familiar voice |

---

## Team

Built by **George Badulescu** and **Jade Yang** at LA Hacks 2026.
