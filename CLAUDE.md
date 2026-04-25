# Orision — Claude Code Project Context

## What This Is
Orision is a bureaucratic document translator for immigrant families. Users photograph documents (Medicaid, USCIS, IRS, DMV, school, medical, lease, car), get them explained in their language in a familiar voice, and can place live translated calls to the office — with memory across every document their family has ever received.

**Tagline:** "Every immigrant kid has helped translate for their family. Orision gives parents the clarity to fully understand, decide, and speak for themselves."

Built at LA Hacks 2026.

## Repo Structure
```
orision/
├── app/              ← Cloudinary React AI Starter Kit (React 19 + Vite 6 + TypeScript 5.9)
│   ├── src/          ← Application source code
│   ├── public/       ← Static assets
│   ├── .env          ← Vite env vars (VITE_* prefix for client-exposed)
│   └── package.json  ← App dependencies and scripts
├── docs/             ← Documentation and prize evidence
├── .env.example      ← All service keys template
├── CLAUDE.md         ← This file
└── README.md         ← Project overview
```

## Target Prizes
- Cloudinary Challenge (REQUIRES create-cloudinary-react starter — already scaffolded)
- Fetch.ai Agentverse + OmegaClaw
- Cognition Augment the Agent (MCP server)
- Arista Connect the Dots
- Figma Make Challenge
- MLH Best Use of: ElevenLabs, MongoDB Atlas, Gemma, Vultr
- Best Domain from GoDaddy

## Stack & Service Roles
| Service | Role |
|---------|------|
| Cloudinary | Photo enhancement, media pipeline, audio storage |
| Gemini 2.5 Flash Vision | OCR — extract text from document photos |
| Gemma (Google AI Edge) | Translation + on-device PII redaction |
| ElevenLabs | Voice cloning + conversational AI |
| Twilio | Phone calls + SMS + Media Streams |
| MongoDB Atlas | Vector search across family document history |
| Supabase | Auth, storage |
| Fetch.ai Agentverse | 4-agent orchestration (uAgents) |
| Vultr | Agent hosting |
| Cognition | MCP server for context agent |

## Dev Commands
```bash
cd app && npm install   # Install dependencies
npm run dev             # Start Vite dev server (localhost:5173)
npm run build           # TypeScript check + production build
npm run lint            # ESLint
```

## Coding Conventions
- TypeScript strict mode
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- NEVER add `Co-Authored-By` lines to git commits
- Do NOT push without explicit approval — always review first
- Vite uses `VITE_` prefix for client-exposed env vars

## UI Quality Bar
- Mobile-first, parent-friendly: large tap targets, 18px+ body text, high contrast
- shadcn/ui as component base, customized — never raw unstyled HTML
- Real loading states, skeletons, optimistic UI — no naked spinners
- Accessibility: semantic HTML, aria labels, keyboard nav, screen reader tested
- Motion: subtle, purposeful, framer-motion for state transitions
- Empty states designed, not afterthoughts
- Error states with actionable recovery, not stack traces
- Distinctive typography — never Inter, Roboto, Arial, or system fonts
- Bold aesthetic direction — no generic AI-generated aesthetics

## Hard Rules
- Do NOT substitute create-next-app or any other starter for the Cloudinary scaffold
- Do NOT install new dependencies without asking first
- Do NOT push to remote without explicit approval
- If anything is unclear or fails unexpectedly, STOP and ask before improvising
