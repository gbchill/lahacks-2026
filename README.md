# Orision

A tool built for families facing barriers in understanding their child's learning or critical documents. This isn't just a gap in language — it's a gap in opportunity, connection, and trust. With Orision, you can take or upload a photo of a document (Medicaid, USCIS, IRS, DMV, school, medical, lease, car), get it explained in your language in a familiar voice, and place live translated calls to the office — with memory across every document your family has ever received.

The name "Orision" blends "Origin" and "Vision," reflecting the strength of family roots and the shared hopes that guide every generation forward.

> Every immigrant kid has helped translate for their family. Orision gives parents the clarity to fully understand, decide, and speak for themselves.

Built at LA Hacks 2026.

## The Problem

25 million people in the US live in households where no adult speaks English well. Parents miss Medicaid renewal deadlines, misread USCIS notices, sign things they don't understand. Their kids translate starting at age 8 — a documented harm called "language brokering."

Every immigrant kid has stepped in as their family's translator. I did too. But when I left for college, that support disappeared — and my parents were left to figure it out on their own again. Just last year, a medical letter came in the mail. They tried to interpret it, but weren't confident. By the time I came home, I found out my insurance had lapsed — missed paperwork, missed deadline. And even now, while their English has improved, that uncertainty is still there. Orision is built to remove that uncertainty — giving families clear explanations and familiar, trusted translation at their fingertips, without long calls or language barriers.

## Stack

- **Frontend:** Cloudinary React AI Starter Kit + Tailwind + shadcn/ui
- **Media pipeline:** Cloudinary (photo enhancement, audio storage)
- **OCR:** Gemini 2.5 Flash Vision
- **Translation + on-device PII:** Gemma (Google AI Edge)
- **Voice:** ElevenLabs (cloning + conversational AI)
- **Telephony:** Twilio (calls + SMS + Media Streams)
- **Document memory:** MongoDB Atlas Vector Search
- **Auth + storage:** Supabase
- **Agent orchestration:** Fetch.ai Agentverse (4 uAgents)
- **Agent host:** Vultr
- **MCP server:** Context Agent exposed via Cognition

## Setup

1. Copy `.env.example` to `.env.local` and fill in keys
2. `cd app && npm install`
3. `npm run dev`

## Team

Built by George and Partner at LA Hacks 2026.
