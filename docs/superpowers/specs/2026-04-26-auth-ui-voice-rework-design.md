# Orision: Auth, UI/UX Rework, Voice Cloning & Document Saving

## Context

Orision helps immigrant families understand government documents by scanning, OCR-ing, translating, and reading them aloud. The current prototype works end-to-end but has:
- No real authentication (hardcoded `demo-user-1` everywhere)
- A functional but generic UI layout with no persistent navigation
- A single shared ElevenLabs voice for all users
- No real document saving tied to user accounts

This spec covers four interconnected changes: Supabase auth, UI/UX rework with bottom tab navigation, per-user voice cloning via onboarding, and document saving tied to authenticated users.

---

## 1. Supabase Auth (Scan First, Auth to Save)

### Frontend
- Install `@supabase/supabase-js` in `app/package.json`
- New `lib/supabase.ts`: Supabase client using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- New `contexts/auth-context.tsx`: `AuthProvider` + `useAuth()` hook exposing `{ user, session, loading, signIn, signUp, signOut }`
- Wrap app in `AuthProvider` in `main.tsx`
- New `components/protected-route.tsx`: redirects to `/login` if unauthenticated
- New `pages/login.tsx`: email/password sign-in form
- Rework `pages/signup.tsx`: wire to `supabase.auth.signUp()`, navigate to `/onboarding` on success

### Backend
- Implement `services/supabase_admin.py`: `verify_jwt(token)` using PyJWT + `SUPABASE_JWT_SECRET` (HS256)
- `api/documents.py`: accept optional `Authorization` header, extract user_id from JWT or use `"anonymous"`
- `api/family.py`: change routes to JWT-protected (user_id from token, not URL path)
- `api/calls.py`: accept optional auth header

### Access Rules
| Feature | Anonymous | Signed In |
|---------|-----------|-----------|
| Select language | Yes | Yes |
| Scan + translate document | Yes | Yes |
| Hear audio (default voice) | Yes | Yes |
| Save to document history | No | Yes |
| View past documents | No | Yes |
| Clone voice | No | Yes |
| Hear audio (cloned voice) | No | Yes |
| Make translated call | Yes | Yes |

### Env Vars
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
```

---

## 2. UI/UX Rework

### Bottom Tab Bar
4 tabs fixed at bottom: **Home** (house), **Scan** (camera, elevated center), **Documents** (folder), **Profile** (user)

- Scan tab: elevated 56px circle with primary background, peeks above bar
- Active: primary color icon + bold label; inactive: muted icon + label
- Bar: `fixed bottom-0`, 72px + safe-area inset, `backdrop-blur-md`
- Profile tab: navigates to `/login` if not signed in, `/account` if signed in

### App Shell Changes
- Remove current header back button (tab bar handles navigation)
- Keep minimal "Orision" wordmark header
- Add `pb-[88px]` to main content for tab bar clearance
- Tab bar hidden on: `/` (welcome), `/translating`, `/login`, `/signup`, `/onboarding`

### Page Reworks

**Welcome (`/`)**: Keep language cycling + mic detection. Add "Already have an account? Sign in" link at bottom.

**Home (`/home`)**: "Scan a letter" becomes a hero card (full width, larger). "Make a call" + "My documents" as secondary row. Personalized greeting if signed in.

**Capture (`/capture`)**: Replace hardcoded `userId` with `useAuth().user?.id ?? "anonymous"`. Pass `voice_id` + `token` through navigation state.

**Result (`/result/:id`)**: Replace "Continue" → `/save-history` with inline behavior:
- Signed in: "Saved to your documents" confirmation
- Not signed in: inline card prompting "Save this? Create account"

**Documents (`/family`)**: Auth-required. Real user data. Better card hierarchy. Search/filter by document type.

**Save History (`/save-history`)**: Deprecated. Redirect to `/home`.

### New Pages
- `pages/login.tsx`: email/password sign-in
- `pages/account.tsx`: profile, language, voice status, sign out
- `pages/onboarding.tsx`: 3-step post-signup wizard

### Design Constraints
- Keep existing colors: primary `#ADD8E6`, warm card backgrounds, current border/shadow system
- Keep Plus Jakarta Sans font family
- Keep Framer Motion for transitions
- Mobile-first: 48px+ tap targets, 18px+ body text
- No generic AI aesthetics

---

## 3. Three-Step Onboarding

Triggered after `signUp()` succeeds. Route: `/onboarding`.

### Step 1: Profile
- Name input (first name)
- Relationship: parent / child (18+) / family member (segmented control)

### Step 2: Language
- Confirm preferred language via `LanguageDropdown` (pre-filled from welcome page)
- Copy: "We'll explain all documents in this language"

### Step 3: Voice Clone (Optional)
- Show reading passage in user's language (~30 seconds, 2-3 neutral sentences)
- Record via `MediaRecorder` (`audio/webm;codecs=opus`)
- Waveform animation while recording, countdown timer
- Send to `POST /voice/clone` with auth token
- Success: "Your voice has been saved!"
- "Skip for now" always available

### Data Storage
All stored in Supabase `user_metadata` via `supabase.auth.updateUser()`:
```json
{
  "name": "Maria",
  "relationship": "parent",
  "voice_id": "elvn_abc123",
  "onboarding_complete": true
}
```

### Reading Passages (per language)
Short, neutral content about everyday life — not bureaucratic. ~30 seconds when read aloud. Stored in a frontend constants file.

---

## 4. Per-User Voice System

### Voice Resolution Order
1. User's cloned `voice_id` (from Supabase user_metadata, passed in API call)
2. Language default voice (from `ELEVENLABS_VOICE_ID_{LANG}` env vars)
3. Fallback: current `ELEVENLABS_VOICE_ID` env var

### Backend Changes

**`services/elevenlabs.py`**:
- Add `DEFAULT_VOICE_IDS` dict mapping language codes to env vars
- Modify `synthesize_speech(text, language, voice_id=None)` to accept optional voice_id
- Add `clone_voice(user_name, audio_bytes) -> voice_id` using ElevenLabs IVC API

**New `api/voice.py`**:
- `POST /voice/clone`: accepts audio file + auth token, returns `{ voice_id }`

**`api/documents.py`**:
- Accept `voice_id: str = Form(default=None)` in explain endpoint
- Pass through to `synthesize_speech()`

### Frontend Changes

**New `lib/voice-api.ts`**: `cloneVoice(audioBlob, token) -> voice_id`

**`lib/api.ts`**: `explainDocument()` accepts optional `token` and `voiceId` params

**`pages/capture.tsx`**: Pass `session.access_token` and `user.user_metadata.voice_id` through nav state

### Env Vars
```
ELEVENLABS_VOICE_ID_EN=
ELEVENLABS_VOICE_ID_ES=
ELEVENLABS_VOICE_ID_ZH=
ELEVENLABS_VOICE_ID_VI=
ELEVENLABS_VOICE_ID_RO=
```

---

## 5. Document Saving

### Flow
- Signed in: backend auto-saves document to MongoDB with real `user_id` from JWT
- Anonymous: document processes normally but saved under `"anonymous"` (not retrievable)
- Result page shows inline save prompt for anonymous users

### Backend
- `api/documents.py`: extract `user_id` from JWT when present
- `api/family.py`: `GET /family/timeline` requires JWT, extracts user_id from token
- `services/mongo.py`: no changes needed (already keyed by user_id)

### Frontend
- `pages/family.tsx`: replace hardcoded `USER_ID = "demo-user"` with `useAuth().user.id`
- `lib/family-api.ts`: remove userId param, add auth token header
- `pages/result.tsx`: inline auth-aware save prompt

---

## Menu Labels

Add to `MenuLabels` type and all 5 language entries in `menu-labels.ts`:
- Auth: login/signup headings, submit labels, switch links
- Onboarding: step titles, profile labels, voice recording prompts
- Account: section titles, sign out
- Tab bar: Home, Scan, Documents, Profile
- Save prompt: title, CTA, skip, confirmation

---

## Route Structure (Final)

```
No shell:
  /               → WelcomePage
  /translating    → TranslatingPage
  /login          → LoginPage
  /signup         → SignupPage

AppShell (with bottom tab bar):
  /home           → HomePage
  /capture        → CapturePage
  /result/:id     → ResultPage

AppShell + ProtectedRoute:
  /family         → DocumentsPage
  /account        → AccountPage
  /onboarding     → OnboardingPage
```

---

## Verification

1. **Anonymous scan flow**: Select language → scan document → see translation + audio (default voice) → prompted to save → can dismiss and go home
2. **Signup flow**: Create account → 3-step onboarding (profile, language, optional voice) → redirected to home
3. **Authenticated scan flow**: Scan document → translation uses cloned voice (if exists) → auto-saved → visible in Documents tab
4. **Documents page**: Shows only current user's documents, newest first
5. **Voice clone**: Record 30s passage → voice_id returned → stored in user_metadata → used for subsequent scans
6. **Tab navigation**: All 4 tabs work, Scan is prominent, Profile shows login for anon / account for signed in
7. **Login/logout**: Sessions persist across page refresh via Supabase
