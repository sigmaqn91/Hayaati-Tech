# Hayaati Web Technology — 2026-2050 Technology Timeline & Planetary Habitats

**Hayaati Web Technology** is an independent technology foresight archive and systems visualization platform founded and led by **Aliya Khan** (Software Architect & Systems Researcher). The platform chronicles humanity's technological horizon from 2026 to 2050 across 28 pioneering technology milestones, 8 photorealistic planetary habitat postcards, personal founder research ventures, and an interactive intelligent holographic assistant.

---

## 1. Dual-Mode Architecture

The platform features an advanced dual-mode AI interface providing both real-time multimodal voice dialogue and conversational text fallback:

```
                      ┌────────────────────────────────────────┐
                      │             Visitor Client             │
                      └────┬──────────────────────────────┬────┘
                           │                              │
         [Voice Mode]      │                              │     [Text Mode]
       Gemini Live Audio   │                              │     REST / Streaming
                           ▼                              ▼
              ┌────────────────────────┐     ┌────────────────────────┐
              │ /api/assistant/voice   │     │       /api/chat        │
              │  (Ephemeral Session)   │     │  (@google/genai SDK)   │
              └────────────┬───────────┘     └────────────┬───────────┘
                           │                              │
                           ▼                              ▼
                 ┌───────────────────┐          ┌───────────────────┐
                 │ Gemini Live API   │          │ Gemini 2.5 Flash  │
                 │ (gemini-3.1-flash-live-preview) │          │  (Server Route)   │
                 └───────────────────┘          └───────────────────┘
```

1. **Multimodal Live Voice (WebSocket Protocol)**:
   - Real-time two-way audio streaming using Google's Gemini Multimodal Live API (`gemini-3.1-flash-live-preview` / `gemini-3.1-flash-live-preview`).
   - The browser requests an ephemeral session token from `/api/assistant/voice` via an authenticated, rate-governed endpoint.
   - Direct low-latency WebSocket connection handling 16kHz PCM audio input and 24kHz audio synthesis.
   - Automatic slot reservation and keepalive heartbeats with clean release mechanics upon session termination.

2. **Server-Side Text Chat Fallback (`/api/chat`)**:
   - High-performance streaming conversational agent powered by `@google/genai` and `gemini-2.5-flash`.
   - Fully grounded in Hayaati's 2026-2050 technology dossier, architectural taxonomy, and founder research ventures.
   - Provides seamless fallback whenever the visitor's microphone is unavailable, their language is text-only, or active voice concurrency is at capacity.

---

## 2. Rate Limits, Concurrency & Quotas

The application implements a defense-in-depth security model governed by `lib/rateLimit.ts` using dual-key tracking (salted SHA-256 IP hash + signed HMAC visitor cookies):

| Resource | Constraint | Window / Period | Response Code / Behavior |
| :--- | :--- | :--- | :--- |
| **Visitor Chat Messages** | 20 messages | 24-hour sliding window | HTTP 429 (`code: 'visitor_cap'`) |
| **Visitor Chat Burst** | 5 messages | 5-minute burst window | HTTP 429 (`code: 'burst_cooldown'`) |
| **Global Chat Cap** | 200 messages | 24-hour UTC window | HTTP 429 (`code: 'global_cap'`) |
| **Voice Active Sessions**| 3 concurrent slots | Real-time global pool | HTTP 429 (`code: 'server_busy'`) |
| **Voice Session Duration**| 180 seconds (3 min) | Per session maximum | Auto-terminate & slot released |
| **Project Submissions** | 5 submissions | 10-minute sliding window | HTTP 429 (`code: 'rate_limited'`) |

- **Safe Health Checks**: The endpoint `/api/assistant/voice` with `action: 'status'` executes in read-only mode and does not consume session tokens or increment user rate counters.
- **Graceful Handling**: Over-limit visitors receive exact `retryAfterSeconds` timestamps and clear localized error states.

---

## 3. Multilingual Support (25 Languages & 14 Voice Locales)

Hayaati is translated and localized across **25 world languages** with complete parity across all UI strings and content dossiers:

### Full UI & Content Coverage (25 Languages):
1. **Arabic** (`ar`)
2. **Bengali** (`bn`)
3. **German** (`de`)
4. **English** (`en`) — Baseline
5. **Spanish** (`es`)
6. **French** (`fr`)
7. **Gujarati** (`gu`)
8. **Hindi** (`hi`)
9. **Indonesian** (`id`)
10. **Italian** (`it`)
11. **Japanese** (`ja`)
12. **Kannada** (`kn`)
13. **Korean** (`ko`)
14. **Malayalam** (`ml`)
15. **Marathi** (`mr`)
16. **Nepali** (`ne`)
17. **Punjabi** (`pa`)
18. **Portuguese** (`pt`)
19. **Russian** (`ru`)
20. **Tamil** (`ta`)
21. **Telugu** (`te`)
22. **Turkish** (`tr`)
23. **Urdu** (`ur`)
24. **Vietnamese** (`vi`)
25. **Chinese** (`zh`)

### Live Voice Supported Locales (14 Languages):
The real-time Gemini Live audio pipeline supports high-fidelity native speech recognition and synthesis across 14 designated languages:
`en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `zh`, `hi`, `ar`, `ru`, `tr`, `vi`.

Visitors selecting languages outside this set are gracefully routed to the conversational text interface with localized informational notifications.

---

## 4. Project Ingestion & Contact Relay

Pioneering researchers, engineers, and ventures can submit architectural proposals directly for personal review:

- **Founder & Systems Architect**: Aliya Khan
- **Direct Contact Relay**: `Hayaati.Technology@gmail.com`
- **Submission Requirements**:
  1. `name` (Contact / Author Name)
  2. `email` (Valid Sender Email)
  3. `projectTitle` (Project or Research Venture Name)
  4. `category` (`ai`, `vehicles`, `devices`, `energy`, `health`, `space`, `homeWork`)
  5. `description` (Technical Breakthrough Synopsis)
- **Transmission Pipeline**:
  - Validates fields and verifies caller identity against rate-limiting safeguards.
  - In production with SMTP credentials configured (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`), transmissions are securely dispatched via `nodemailer`.
  - In development or preview environments lacking SMTP secrets, submissions fall back to an append-only JSONL log (`/tmp/hayaati_submissions.jsonl`) and memory cache, returning HTTP 200 confirmation without breaking the interface.

---

## 5. Development & Verification Workflow

### Prerequisites
- Node.js 20+
- `GEMINI_API_KEY` (configured in `.env.local` or environment variables)

### Scripts
```bash
# Run local development server (Port 3000)
npm run dev

# Run full i18n audit (checks all 25 locales for missing keys, leaks, and unwhitelisted text)
npm run check:i18n

# Validate syntax and linting
npm run lint

# Compile production build
npm run build

# Start production server
npm run start
```

### Development Banner (`components/DevBanner.tsx`)
In development environments, an unobtrusive diagnostic HUD appears at the top of the interface:
- **Green (`Live API Connected`)**: Live API voice token endpoint is active and operational.
- **Amber (`Offline (Rate Limited/Busy)`)**: Server is experiencing concurrency pressure or rate limiting.
- **Red (`Offline (Missing API Key)`)**: Missing `GEMINI_API_KEY` configuration.
- **Test Voice Token**: Interactive button to verify single-token acquisition and instant slot release.
- Automatically suppressed in production (`process.env.NODE_ENV === 'production'`).
