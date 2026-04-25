# ORISION — MASTER PRIZE COMPLETION CHECKLIST

Updated: 2026-04-25

Each prize section has REQUIREMENTS (must hit all) + EVIDENCE (what to capture for Devpost).
A box is only checked when the feature works AND the evidence is saved.

---

## PRIMARY TRACK: LIGHT THE WAY (presented by Aramco)

### Requirements
- [x] App removes a real barrier for an underserved population
- [x] Working end-to-end demo: photo -> translated audio explanation -> live call (call feature implemented)
- [ ] Mobile-friendly (parents demo on a phone) — needs testing on real device
- [ ] Live demo URL accessible from outside your laptop — needs Vultr deployment
- [ ] Real document used in demo (Medicaid envelope, not lorem ipsum)

### Evidence for Devpost
- [ ] Demo video shows real envelope, real translation, real call
- [ ] Inspiration section opens with the immigrant-kid story (NOT the tech)
- [ ] "What it does" written in plain language a non-technical judge understands
- [ ] Stat cited: 25M people in US households where no adult speaks English well

---

## CASH PRIZES

### 1. Cloudinary Challenge — $500 Amazon GC x team ($1K total)

#### Requirements (ALL needed)
- [x] Used `create-cloudinary-react` as starter — screenshot saved
- [x] Unsigned upload preset created in Cloudinary console (`orision_unsigned`)
- [x] Preset added to `.env` as `VITE_CLOUDINARY_UPLOAD_PRESET` — set to `orision_unsigned`
- [x] At least 4 Cloudinary transformations used in document pipeline:
  - [x] `e_improve` — auto contrast/exposure
  - [x] `e_sharpen:100` — text legibility for OCR
  - [x] `a_auto_right` — auto-deskew rotated photos
  - [x] `q_auto:best` + `f_auto` — optimal delivery
- [x] Audio files (cloned-voice explanations) stored in Cloudinary — `upload_audio()` in cloudinary_admin.py
- [x] At least one AI-powered Cloudinary feature used:
  - [x] `e_gen_remove` (PII redaction) — `redact_pii_preview()` implemented
- [x] A/B comparison script built: `backend/scripts/cloudinary_ab_test.py`

#### Evidence for Devpost
- [x] Screenshot of `npx create-cloudinary-react` terminal output
- [x] `docs/cloudinary-scaffold-proof.txt` saved
- [ ] Side-by-side image: raw vs enhanced document photo — **run the A/B script with a real doc**
- [ ] OCR accuracy numbers from A/B script output
- [ ] Devpost section "Our experience with the React Starter Kit" written
- [ ] Each transformation named in Built With + How We Built It

---

### 2. Fetch.ai Agentverse — $2.5K / $1.5K / $1K

#### Requirements (ALL needed)
- [x] 4 specialist uAgents written in Python with `uagents` SDK:
  - [x] Parser Agent — receives OCR text, returns structured fields
  - [x] Context Agent — queries family doc history, returns related past letters
  - [x] Drafter Agent — turns facts + context into plain-language explanation
  - [x] Translator Agent — converts to target language at 6th-grade level
- [x] Mandatory Chat Protocol implemented on ALL 4 agents
- [ ] All 4 agents registered on Agentverse (not just running locally) — **MANUAL: do on agentverse.ai**
- [ ] All 4 agents discoverable via ASI:One search
- [x] Agent orchestration triggered by `/documents/explain-via-agents` endpoint
- [ ] Agents hosted on Vultr (not your laptop) for the demo — **needs Vultr deploy**

#### Evidence for Devpost
- [ ] Screenshot of all 4 agents listed in Agentverse Inspector
- [ ] Screenshot of one agent found via ASI:One search
- [x] Agent timeline visualization in demo UI (`agent-timeline.tsx`)
- [x] Agent addresses documented in `docs/agents-evidence/addresses.txt`
- [x] Architecture diagram in `docs/agents-evidence/architecture.md`

---

### 3. Fetch.ai OmegaClaw Skill Forge — $1.5K / $1K

#### Requirements
- [ ] Register a custom skill: "immigrant family document triage"
- [ ] Skill takes (photo URL, target language, user_id) -> returns ExplainResponse
- [ ] Skill uses your Agentverse agents under the hood
- [ ] Skill discoverable in OmegaClaw skill registry

#### Evidence for Devpost
- [ ] Screenshot of skill registration in OmegaClaw
- [ ] Skill ID/URL in Devpost
- [ ] Demo invocation video clip

---

### 4. Cognition Augment the Agent — $3K / $2K / $1K

#### Requirements (ALL needed)
- [x] MCP server in `/backend/mcp_server/server.py` using official `mcp` Python SDK
- [x] Exposes tool: `explain_government_letter(letter_text, target_language, user_id?) -> dict`
- [x] Exposes tool: `search_family_documents(query_text, user_id, k)`
- [ ] MCP server runs on Vultr — **needs Vultr deploy**
- [ ] Successfully tested with at least one external MCP client (Claude Desktop OR Devin) — **DO NOW**
- [x] Connection config documented in `backend/mcp_server/README.md`

#### Evidence for Devpost
- [ ] Screenshot of Claude Desktop calling `explain_government_letter` — **DO NOW**
- [ ] Sample input/output pair captured
- [ ] Section in Devpost: "How agents from outside Orision can use our context"

---

## SWAG PRIZES

### 5. Arista Connect the Dots — Claude Pro 12mo + Bose QC + MX Master 3S x person

#### Requirements
- [x] App connects an underserved group to a service or resource (parents -> government offices)
- [ ] Submission to Arista's challenge box on Devpost
- [ ] One paragraph explaining the "connection" angle

#### Evidence for Devpost
- [ ] Custom 2-3 sentence Arista paragraph
- [x] Call feature implemented (the literal "connection")

---

### 6. Figma Make Challenge — Plushies + Edu features

#### Requirements
- [x] Used Figma Make at least once during the weekend
- [x] Captured the iteration process (not just the final mock)
- [x] At least 2 distinct iterations showing thinking evolved

#### Tasks
- [x] Mock screen 1 in Figma Make: photo capture + translation + audio play button
- [x] Mock screen 2 in Figma Make: live call screen with bilingual transcript
- [x] Iterate at least once on each (v1 -> v2 with explicit reason for change)
- [x] Screenshot every Make session
- [x] Save screenshots to `/design/figma-make/` in repo

#### Evidence for Devpost
- [x] 4-6 screenshots in chronological order
- [x] Narrative paragraph with insight from using Make
- [x] One sentence on what Make let you do faster than coding

---

### 7. MLH Best Use of ElevenLabs — Wireless earbuds

#### Requirements (ALL needed)
- [x] Voice cloned (ELEVENLABS_VOICE_ID in backend/.env)
- [x] TTS used for translated explanations in the cloned voice — `synthesize_speech()` working
- [x] Twilio call backend implemented with Media Streams websocket
- [ ] Bidirectional translation fully working in live call — needs testing with real Twilio creds

#### Evidence for Devpost
- [x] Voice ID saved in `.env`
- [ ] Demo plays cloned voice in target language — needs live demo recording
- [ ] Demo shows live call with bidirectional translation
- [x] Audio file stored in Cloudinary (cross-prize stack)

---

### 8. MLH Best Use of MongoDB Atlas — M5Stack IoT kit

#### Requirements (ALL needed)
- [x] Atlas M0 free cluster created and connected (MONGODB_URI set)
- [x] Documents stored with embeddings — `save_document()` with Gemini embeddings
- [x] Vector Search index created (vector_index, 3072-dim cosine)
- [x] `/family/{user_id}/similar/{document_id}` endpoint returns vector-matched past docs — **JUST WIRED UP**
- [x] Family timeline endpoint reads from Atlas — **JUST WIRED UP**

#### Evidence for Devpost
- [ ] Screenshot of Atlas Vector Search index configuration
- [ ] Demo shows "this letter is similar to the one mom got in March" callout
- [ ] Code snippet of the vector query in Built With section

---

### 9. MLH Best Use of Gemma — Google swag kit

#### Requirements (ALL needed)
- [x] Gemma 3 used for PII detection, document classification, and fact extraction — **JUST IMPLEMENTED**
- [x] `detect_pii()` with regex fallback for SSN patterns
- [x] `classify_document()` and `extract_facts()` implemented
- [ ] Integrate Gemma PII into the document pipeline (call detect_pii before sending to cloud)
- [ ] Devpost explains the "SSNs never leave the phone" privacy story

#### Evidence for Devpost
- [x] Code snippet showing PII detection (`backend/services/gemma.py`)
- [ ] Demo callout: "We detect and mask the SSN before any data leaves your phone"
- [ ] Comparison: "Other tools send raw text to a cloud LLM. We don't."

---

### 10. MLH Best Use of Vultr — Portable screens

#### Requirements
- [ ] Vultr Cloud Compute instance provisioned with free credits — **DO NOW**
- [ ] FastAPI backend deployed and reachable via public IP/domain
- [ ] Fetch.ai uAgents running on the Vultr instance
- [ ] MCP server running on the Vultr instance
- [ ] Demo URL hits the Vultr-hosted backend (not localhost)

#### What's ready
- [x] Dockerfile exists in backend/
- [x] docker-compose.yml created
- [x] deploy.sh script created and executable

#### Evidence for Devpost
- [ ] Screenshot of Vultr dashboard with running instance
- [ ] Public backend URL in repo README
- [x] Architecture diagram in `docs/agents-evidence/architecture.md`

---

### 11. MLH Best Domain from GoDaddy — Gift card

#### Requirements
- [ ] Domain claimed (orision.tech or orision.online via hack.mlh.io)
- [ ] DNS pointed to Vercel deployment
- [ ] Live demo accessible at the custom domain (not vercel.app)

#### Evidence for Devpost
- [ ] Domain shown in demo URL field
- [ ] Working HTTPS confirmed
- [ ] Screenshot of GoDaddy registration

---

## DEVPOST SUBMISSION (Sunday morning)

### Must include
- [ ] Demo video at top, under 2:30, uploaded to YouTube (unlisted is fine)
- [ ] Live demo URL working from outside your laptop
- [ ] Public repo or judge-accessible link
- [ ] Inspiration: opens with immigrant-kid story
- [ ] What it does: photo->voice, letter->call, family memory
- [ ] How we built it: each sponsor named by SPECIFIC FEATURE used
- [ ] Challenges: 2-3 specific ones (not generic "we struggled with time")
- [ ] Built With tags: every sponsor technology

### Track + Challenge boxes (12 total — UNIQUE 2-3 sentence blurb per box)
- [ ] Track: Light the Way (primary) — barrier removal angle
- [ ] Cloudinary Challenge — name the 4+ transformations used
- [ ] Fetch.ai Agentverse — name the 4 agents and their roles
- [ ] Fetch.ai OmegaClaw — name the registered skill
- [ ] Cognition Augment the Agent — describe the MCP tool exposed
- [ ] Arista Connect the Dots — connection narrative
- [x] Figma Make Challenge — process narrative with insight
- [ ] MLH Best Use of ElevenLabs — voice clone + Conversational AI + S2S
- [ ] MLH Best Use of MongoDB Atlas — vector search for similar past letters
- [ ] MLH Best Use of Gemma — on-device PII privacy story
- [ ] MLH Best Use of Vultr — agent + MCP hosting
- [ ] MLH Best Domain from GoDaddy — domain registered

---

## DEMO DAY READINESS

- [ ] 3-min pitch rehearsed cold, 3+ times
- [ ] Backup video ready (in case live demo fails on stage)
- [ ] 3 real envelopes ready: Medicaid, school, car insurance
- [ ] Phone fully charged + hotspot ready in case venue WiFi dies
- [ ] Girlfriend confirmed for caseworker call role + her phone charged
- [ ] Opening line memorized cold
- [ ] Both teammates know who handles which part of demo if other freezes

---

## WHAT TO DO RIGHT NOW (priority order)

1. ~~**Cloudinary console** — create `orision_unsigned` upload preset~~ DONE
2. **MCP test** — add to Claude Desktop, test, screenshot (15 min)
3. **Vultr** — provision instance, run `./backend/scripts/deploy.sh <IP>` (1-2 hr)
4. **Agentverse** — register 4 agents on agentverse.ai (30-45 min)
5. **ASI:One** — verify agent discoverability, screenshot (10 min)
6. **OmegaClaw** — register skill after Agentverse done (30 min)
7. **Run A/B script** — `python backend/scripts/cloudinary_ab_test.py <image>` for Cloudinary evidence
8. **GoDaddy domain** — claim orision.tech via hack.mlh.io
9. **Integrate Gemma PII** into document pipeline
10. **Test Twilio calls** with real credentials
