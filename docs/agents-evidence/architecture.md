# Orision Agent Architecture

## 4-Agent Chain (Fetch.ai uAgents + Chat Protocol)

```
POST /documents/explain-via-agents
│
├─ Cloudinary upload + OCR enhancement
│
▼
ORCHESTRATOR (Bureau-internal, polls FastAPI bridge queue)
│
├── send_and_receive ──▶ PARSER AGENT
│                        ├─ Gemini Vision OCR
│                        ├─ Document type classification
│                        └─ Returns ParsedDocument
│
├── send_and_receive ──▶ CONTEXT AGENT
│                        ├─ Gemini text embedding (3072-dim)
│                        ├─ Atlas Vector Search (past family docs)
│                        ├─ Build family history summary
│                        └─ Returns ContextBundle
│
├── send_and_receive ──▶ DRAFTER AGENT
│                        ├─ Gemini explain (6th-grade reading level)
│                        ├─ Key facts extraction (deadline, amount, action)
│                        └─ Returns ExplanationDraft
│
└── send_and_receive ──▶ TRANSLATOR AGENT
                         ├─ Gemini translate to Simplified Chinese
                         └─ Returns TranslatedExplanation
│
▼
ORCHESTRATOR resolves asyncio.Future
│
├─ ElevenLabs TTS (Multilingual v2)
├─ Cloudinary audio upload
├─ MongoDB document save (with embedding)
└─ Return ExplainResponse JSON

## Protocols

- AgentChatProtocol v0.3.0 — required for Agentverse + ASI:One registration
- OrisionPipeline v1.0.0 — custom protocol for inter-agent pipeline messages

## MCP Server

Mounted at /mcp (SSE transport) exposing:
- explain_government_letter — full pipeline via services
- search_family_documents — semantic vector search

## Infrastructure

- Dev: Bureau (single process, port 8001) + FastAPI (port 8000)
- Prod: agents on Vultr with Agentverse mailbox, FastAPI on separate instance
```
