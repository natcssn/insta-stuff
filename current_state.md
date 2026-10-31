# S.H.E.L.L.Y — INSTAGRAM AUTONOMOUS PROTOCOL ENGINE
## Comprehensive System State & Project Living Memory

> **CRITICAL PROTOCOL FOR AI ASSISTANTS:**
> This document is the single source of truth for the S.H.E.L.L.Y Instagram automation codebase.
> **You MUST update this file after EVERY single prompt and code modification**, documenting what was added, modified, or removed, and updating the current state so context is never lost across conversation boundaries.

---

### 1. Project Overview & Architecture

S.H.E.L.L.Y (Smart Heuristic Execution & Low-Latency Listening Yield) is an autonomous Instagram comment-to-DM automation system designed for creator content monetization, resource delivery, and community engagement.

The project currently operates across two harmonized branches:

```
                               ┌────────────────────────────────────────────────────────┐
                               │           S.H.E.L.L.Y DUAL-BRANCH ARCHITECTURE         │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                        ┌──────────────────────────────────┴──────────────────────────────────┐
                        ▼                                                                     ▼
     ┌─────────────────────────────────────────┐                           ┌─────────────────────────────────────────┐
     │           WEB SAAS BRANCH               │                           │          PC SOFTWARE BRANCH             │
     │  Location: c:\natuse_imp\               │                           │  Location: C:\temp\project-jarvis\      │
     │            insta_auto_reply_shii        │                           │  Role: Local Desktop Mission Control    │
     │  Role: Primary Server & Webhook Node    │                           │  Engine: Python + CustomTkinter + TTS   │
     │  Hosting: Render Cloud (24/7 Live)      │                           │  Control: Conversational Voice + Gemini │
     │  URL: https://insta-stuff.onrender.com  │                           │  Bridge: InstagramBridge API Connector  │
     └─────────────────────────────────────────┘                           └─────────────────────────────────────────┘
```

---

### 2. Tech Stack & Infrastructure

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v18+) & Express | High-concurrency REST API and Meta Webhook consumer |
| **Database** | SQLite via `better-sqlite3` | Zero-latency local storage with ACID compliance |
| **Persistent Backup** | `campaigns_backup.json` | JSON snapshot sync to prevent data loss across cloud restarts |
| **Frontend UI** | HTML5, Vanilla JavaScript, CSS3 | Stark/Jarvis Cyberdeck HUD with Web Audio SFX & 2D Canvas |
| **Meta Graph API** | Graph API v21.0 | Webhooks for comments, messages, and published media inventory |
| **Cloud Deployment** | Render | Automatic GitHub deployment from branch `main` |
| **PC Desktop Deck** | Python 3.13, CustomTkinter, Edge-TTS | Holographic local cockpit with live voice recognition & Gemini |

---

### 3. Database Schema (`bot_data.sqlite`)

The database consists of two primary tables with automated schema migrations on startup:

#### A. `campaigns` Table (Automation Protocols)
| Column | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | — | Unique Protocol ID |
| `title` | `TEXT NOT NULL` | — | Codename of the campaign (e.g. `PEAK_REEL_AUTONOMY`) |
| `media_id` | `TEXT` | `NULL` | Instagram Media/Reel ID. If `NULL` or `'ALL_POSTS'`, triggers globally |
| `media_caption` | `TEXT` | `NULL` | First line of the target Reel's caption for instant display |
| `post_url` | `TEXT` | `NULL` | Instagram Reel permalink |
| `trigger_keywords` | `TEXT NOT NULL` | — | Comma-separated triggers (case-insensitive, e.g. `peak, link, hi`) |
| `dm_text` | `TEXT NOT NULL` | — | Main text body of the private message |
| `public_reply` | `TEXT` | `NULL` | Optional public comment reply (e.g. `Sent to your DMs! Check inbox ✨`) |
| `dm_type` | `TEXT` | `'button'` | Protocol format: `'button'` (Image 2 style) or `'card'` (Image 1 style) |
| `card_title` | `TEXT` | `NULL` | Title for Hero Card mode (up to 80 chars) |
| `card_subtitle` | `TEXT` | `NULL` | Subtitle for Hero Card mode (up to 80 chars) |
| `card_button_text` | `TEXT` | `'Click ✅'` | Text displayed inside the clickable link button |
| `card_button_url` | `TEXT` | `NULL` | Target destination link (e.g. `https://yourlink.com`) |
| `card_image_url` | `TEXT` | `NULL` | Custom banner image for Hero Card mode |
| `is_active` | `INTEGER` | `1` | `1` = Active & Listening; `0` = Standby / Paused |
| `created_at` | `DATETIME` | `CURRENT_TIMESTAMP` | Timestamp of protocol deployment |

#### B. `processed_comments` Table (Telemetry & Deduplication)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `comment_id` | `TEXT PRIMARY KEY` | Meta comment ID (strictly guarantees 1 response per comment) |
| `user_id` | `TEXT` | Instagram scoped user ID of the commenter |
| `username` | `TEXT` | Commenter's Instagram handle |
| `comment_text` | `TEXT` | Exact text content posted by the user |
| `media_id` | `TEXT` | ID of the post or reel where the comment occurred |
| `campaign_id` | `INTEGER` | Linked protocol ID that matched the trigger |
| `public_reply_sent` | `INTEGER` | `1` if public comment reply was posted, `0` otherwise |
| `dm_sent` | `INTEGER` | `1` if private DM was successfully dispatched |
| `status` | `TEXT` | Execution state: `SUCCESS`, `SKIPPED`, `RATE_LIMITED`, `ERROR` |
| `error_message` | `TEXT` | Diagnostic error details if Meta API rejected the call |
| `processed_at` | `DATETIME` | Timestamp of telemetry logging |

---

### 4. API Endpoints Reference

| Method | Endpoint | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ping` | No | Self-ping keepalive & health check |
| `POST` | `/api/auth/login` | No | Authenticates admin credentials, issues JWT |
| `POST` | `/api/auth/logout` | No | Clears session cookie |
| `GET` | `/api/auth/check` | Yes | Verifies active session clearance |
| `GET` | `/api/stats` | Yes | Telemetry summary: active campaigns, DMs sent, safety quotas |
| `GET` | `/api/media` | Yes | Fetches recent reels/posts from Meta Graph API |
| `GET` | `/api/campaigns` | Yes | Returns all configured protocols |
| `POST` | `/api/campaigns` | Yes | Deploys a new protocol |
| `PUT` | `/api/campaigns/:id` | Yes | Updates an existing protocol without recreating |
| `PATCH` | `/api/campaigns/:id/toggle` | Yes | Toggles protocol active/paused state |
| `DELETE` | `/api/campaigns/:id` | Yes | Permanently terminates a protocol |
| `GET` | `/api/comments` | Yes | Classified telemetry buffer (last 25 signals) |
| `GET` | `/webhook` | No | Meta Webhook verification handshake |
| `POST` | `/webhook` | No | Meta Webhook ingress for Instagram comment events |
| `GET` | `/shelly_logo.png` | No | High-res brand asset |
| `GET` | `/favicon.png`, `/favicon.ico` | No | Browser tab iconography |

---

### 5. Anti-Spam Safety & Rate-Limiting Engine (`src/messageQueue.js`)

To preserve Instagram account health and avoid spam detection during viral comment surges, all outbound DMs flow through an asynchronous safety queue:

1. **Humanized Jitter:** Each message is dispatched with a randomized delay between **2,500ms and 6,500ms**.
2. **Hourly Safety Quota:** Hard cap of **60 DMs per hour**. If reached, the queue automatically enters a 5-minute cool-down.
3. **Daily Safety Quota:** Hard cap of **300 DMs per 24-hour rolling window**.
4. **Intelligent Circuit Breaker:** If Meta returns rate-limiting error codes (`(#4)`, `(#17)`, `(#32)`), the queue trips the circuit breaker and pauses all automated outbound messaging for **30 minutes**, logging the cool-down expiration time.

---

### 6. User Interface & Cyberdeck Features (`dashboard.html` / `index.html`)

- **Iron Man / Jarvis HUD Aesthetics:** Dark glassmorphism (`#04070d`), cyan energy glow (`#00f0ff`), animated particle constellation background, and synthesized Web Audio clicks.
- **Protocol State Draft Saver:** Auto-persists typed form inputs into `localStorage.natc_protocol_draft` in real-time. If the modal is accidentally closed, drafts are restored on reopen and cleared only upon successful protocol deployment.
- **Protocol Preset Defaults:** Configurable default values (`localStorage.natc_protocol_defaults`) accessible via `⚙ PROTOCOL DEFAULTS` on the dashboard and `⚡ LOAD PRESET DEFAULTS` in the modal.
- **Dual Live HUD Preview:**
  - *Public Comment Thread:* Renders the simulated follower comment and the verified bot public reply in real-time.
  - *Follower DM Inbox:* Live renders both **Button Mode (Image 2 style)** and **Hero Card Mode (Image 1 style)** with domain target extraction.
- **Reel Inventory Carousel:**
  - Fetches the creator's published reels via Meta Graph API.
  - Horizontal swipe carousel with video thumbnails and first-line captions.
  - Tap-to-lock on any reel, or 1-click `★ ALL REELS (GLOBAL)` button.
- **Locked Reel Banner (Step 2):**
  - Displays the reel cover thumbnail.
  - Displays the **first line alone** of the reel caption (clean, non-truncated multi-line text).
  - Shows the Node ID and an `[✕ UNLOCK]` button.
- **Protocol Card Management:**
  - Displays codename, target reel name (first-line caption), keywords, DM type, and status switch.
  - `[ ✏ EDIT ]` Button: Reopens the protocol modal in edit mode, pre-fills all fields, auto-loads the reel inventory, and sends `PUT /api/campaigns/:id`.
  - `[ TERMINATE ]` Button: Permanently removes the protocol from SQLite and purges browser localStorage backup to prevent resurrection.
- **Mobile HUD Quick-Scroll Elevator:** Floating right-edge cyber pill with `▲` and `▼` smooth-scroll controls and a cyan position indicator thumb.

---

### 7. Chronological Changelog & Historical Evolution

#### Phase 1: Inception & Core Automation Engine
- Established Express backend, SQLite database, and webhook verification for Instagram Graph API.
- Implemented real-time comment ingestion and matching against configured keyword protocols.
- Added public comment reply and private DM dispatch.

#### Phase 2: Cyberdeck HUD Dashboard & Security
- Built Stark Industries / Jarvis holographic UI with responsive design.
- Added JWT-based security clearance (`/login`, `/dashboard`).
- Implemented telemetry live feed buffer for processed comments.

#### Phase 3: Cloud Deployment & Render Keep-Alive
- Containerized and deployed to Render cloud (`https://insta-stuff.onrender.com`).
- Configured cron keep-alive self-ping (`/api/ping`) to prevent Render free-tier spinning down.
- Built persistent backup sync (`campaigns_backup.json`) to protect against ephemeral disk wipes.

#### Phase 4: State Preservation & Default Presets
- Added `localStorage` input draft auto-saver (`natc_protocol_draft`).
- Added Protocol Defaults Manager (`⚙ PROTOCOL DEFAULTS`) and `⚡ LOAD PRESET DEFAULTS` auto-filler.

#### Phase 5: Button DM Delivery & Dual Live Simulation
- Engineered Instagram Button Template (Image 2 style: native chat bubble with `Click ✅` button, zero bulky image card).
- Created Dual Live Simulation in protocol initialization modal (simulating both public comments and private DMs in real time).

#### Phase 6: Protocol Termination Bugfix & Edit Protocol Mode
- Resolved protocol resurrection bug where deleting all campaigns caused client backup to auto-restore terminated campaigns.
- Added `PUT /api/campaigns/:id` backend route and `updateCampaign` database function.
- Added `[ ✏ EDIT ]` button on protocol cards with full data pre-population.
- Purged inappropriate peach emojis (`🍑`) across templates, placeholders, and databases.
- Added cyan-glow page scrollbar and floating mobile Quick-Scroll HUD elevator.

#### Phase 7: S.H.E.L.L.Y Brand Identity & Safety Quotas
- Embedded official SHELLY logo inside the arc-reactor on dashboard and login screens.
- Added favicon and touch-icon endpoints (`/favicon.png`, `/favicon.ico`, `/shelly_logo.png`, `/apple-touch-icon.png`).
- Upgraded `MessageQueue` with humanized jitter (2.5s - 6.5s), 60/hr and 300/day quotas, and a 30-minute rate-limit circuit breaker.
- Integrated desktop bridge connecting `C:\temp\project-jarvis` to the live SaaS server.

#### Phase 8 (Current): Target Reel First-Line Caption & Edit Inventory Sync
- **Bug Fixed:** In Edit Protocol modal, `loadRecentMedia()` was not triggered, causing the carousel to stay on "Connecting to Meta Media Inventory..." and the locked reel banner to fall back to a raw "ID" placeholder.
- **Fix Applied:** `openEditCampaignModal()` now asynchronously ensures `recentMediaCache` is loaded, populates the carousel, highlights the selected reel, and synchronizes the locked banner.
- **First-Line Caption Alone:** Added `getFirstLine()` formatting helper so that both the locked reel banner and dashboard protocol cards display the clean **first line alone** of the reel caption rather than raw numeric IDs or multi-line caption blobs.
- **Database Enhancement:** Added `media_caption` column to `campaigns` table in `src/db.js` and updated `src/server.js` (`POST` and `PUT`) so the reel caption is persisted permanently.
- **Desktop Parity:** Updated `C:\temp\project-jarvis` protocol panel and conversational engine to also extract and use the first line of the reel caption.
- **Living Memory:** Created this `current_state.md` persistent tracking document.

---

### 8. Direct Instructions for Future Prompts
1. Whenever modifying backend routes, database columns, or frontend controls, **always verify both `src/public/dashboard.html` and `src/public/index.html`** to keep them identical.
2. Ensure `node -c` syntax validation passes before committing.
3. Update this `current_state.md` file immediately upon completing any requested modification.
