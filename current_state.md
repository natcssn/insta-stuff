# S.H.E.L.L.Y — MARK-VII TACTICAL COCKPIT & INSTAGRAM AUTONOMOUS PROTOCOL ENGINE
## Comprehensive System State & Living Project Memory
**Last Updated:** November 1, 2026 (Phase 15: Discord/Antigravity Taskbar Liberation, Groq Whisper Turbo <0.35s STT, Qwen 3.8 27B Instant Brain, & Leaky-Integrator VAD)  
**Operator / Creator (Boss):** NatC (1K+ Instagram followers)  
**Primary AI Assistant:** S.H.E.L.L.Y (Smart Heuristic Execution & Low-Latency Listening Yield — Mark-VII Cockpit)  
**Strict Project Directives:**  
1. **NO GIT PUSH:** Zero commits or pushes to remote GitHub without explicit verbal command from NatC.
2. **RENDER WEB KEEP-ALIVE:** Keep the cloud-hosted web auto-reply service 100% stable and operational.
3. **MANDATORY LIVING MEMORY UPDATES:** Every single agent turn must update this `current_state.md` file so context is never lost across conversation windows.

---

### 1. High-Level Vision & Two-Branch Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │           S.H.E.L.L.Y DUAL-BRANCH ARCHITECTURE         │
                               │                    OPERATOR: NatC                      │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                        ┌──────────────────────────────────┴──────────────────────────────────┐
                        ▼                                                                     ▼
     ┌─────────────────────────────────────────┐                           ┌─────────────────────────────────────────┐
     │           WEB SAAS BRANCH               │                           │     PC DESKTOP TACTICAL COCKPIT         │
     │  Location: c:\natuse_imp\               │                           │  Location: C:\temp\PROJECT-SHELLY\      │
     │            insta_auto_reply_shii        │                           │  Binary: SHELLY.exe (Native Win32 PE)   │
     │  Role: Primary Server & Webhook Node    │                           │  Engine: Webview2 (Chromium GPU/CPU)    │
     │  Hosting: Render Cloud (24/7 Live)      │◄─────── REST Bridge ──────┤  Audio: Continuous 16kHz PyAudio VAD    │
     │  URL: https://insta-stuff.onrender.com  │    (instagram_bridge.py)  │  Voice: Edge Neural Ava (Human Voice)   │
     │  Security: 2.5s-6.5s Jitter & Quotas    │                           │  Hardware: Hybrid GPU/CPU Auto-Profiler │
     └─────────────────────────────────────────┘                           └─────────────────────────────────────────┘
```

---

### 2. Branch 1: Web Auto-Reply Service (`c:\natuse_imp\insta_auto_reply_shii`)

#### Tech Stack & Core Configuration
* **Runtime:** Node.js (v18+) with Express.
* **Database:** SQLite (`bot_data.sqlite`) using `better-sqlite3` (ACID-compliant, synchronous).
* **Cloud Node:** Render (`https://insta-stuff.onrender.com`) with automated keep-alive ping cycles.
* **Security & Anti-Ban Safeguards (`src/messageQueue.js`):**
  * **Humanized Jitter:** Randomized delay between **2500ms and 6500ms** to avoid bot detection patterns.
  * **Hourly Quota Guard:** 60 DMs/hour maximum.
  * **Daily Quota Guard:** 300 DMs/day maximum.
  * **Circuit Breaker:** Auto-pauses queue dispatch upon Meta HTTP 429 / rate-limiting signals.

#### Production Updates Integrated (NatC Commits `0a4e586` & `ad46adb`):
* **Real Reel Thumbnail & Caption:** Completely purged the legacy "ID" text box; locked protocol banner and dashboard cards now display the actual reel video thumbnail image and first-line caption.
* **Single Reel Meta Fetcher (`GET /api/media/:id`):** Real-time thumbnail and caption resolution on demand.
* **Protocol Edit Mode:** Real-time editing and synchronization of active protocols.
* **Purged Legacy Test Protocols:** Render cloud, local database, and `campaigns_backup.json` cleaned of stale test protocols (`summa1`, `STARTUP_REEL_AUTONOMY`, `LATEST_REEL_PEAK_AUTONOMY`).
* **Active Meta Reel Inventory:**
  1. `17894947332683329`: `Misconceptions Pavangal 😭🥀`
  2. `18115057424129042`: `Made this reel a month ago 😭`
  3. `18144025210613418`: `Avg Male obsession 🤩`

---

### 3. Branch 2: Brand-New PC Tactical Cockpit (`C:\temp\PROJECT-SHELLY`)

#### System Characteristics & Architecture:
* **Directory:** `C:\temp\PROJECT-SHELLY` (Legacy `project-jarvis` preserved as untouched baseline reference).
* **Native Win32 Executable `SHELLY.exe` & Permanent Pinning (Phase 13):**
  * Dedicated C executable compiled with GCC & Windres. Resource ID 1 (`IDI_APPLICATION`) embeds `shelly_logo.ico`.
  * Running process is `SHELLY.exe`. Windows taskbar groups and pins `SHELLY.exe` with the cyan arc-reactor icon under all conditions.
* **Continuous 16kHz PyAudio Acoustic Sensor & Multi-Turn Session (Phase 14):**
  * **Root Cause of Prior Hearing Issues:** `speech_recognition.listen()` blocked the main thread in 3-8s chunks, never streamed real-time RMS, and dropped any sentence that did not contain "SHELLY".
  * **New PyAudio Stream:** Reads 512 samples (32ms frames) non-blocking at 16000Hz on the user's USB microphone (`Microphone (USBAudio1.0)`).
  * **18-Second Multi-Turn Conversation Session:** Saying "SHELLY" opens an active conversational window. During this active session, NatC speaks naturally without having to say "SHELLY" every single time! Each speech interaction resets the 18s timer.
  * **Auto-Dynamic Noise Floor Tracker:** Continuously profiles ambient room sound (`noise_floor = noise_floor * 0.985 + chunk_rms * 0.015`) and auto-adjusts the threshold gate (`threshold = max(26.0, noise_floor * 1.45)`).
  * **Acoustic Presets:** `AUTO-ADAPT` (recommended), `QUIET (40)`, `DESK (65)`, `STUDIO (110)`.
  * **Live Vibration Waveform Canvas (`micVibrationCanvas`):**
    * Flat motionless line with cyber grid when quiet.
    * Real-time green oscillating waveform strictly proportional to voice volume when NatC speaks!
    * Live meter bar with sliding yellow gate marker line and `● VOICE CAPTURED // HEARING BOSS` status badge.
* **Expressive Human Neural Voices — Zero Robotic Slop (Phase 14):**
  * **Root Cause of Robotic Fallback:** Gemini TTS preview endpoint has a 10 requests/day free tier quota limit. When hit, it returned HTTP 429, causing the old engine to fall back to Microsoft Hazel (SAPI5).
  * **Solution:** Upgraded to `edge-tts 7.3.1` (resolving Microsoft websocket 403 changes) and made **Microsoft Edge Neural Voice (`en-US-AvaNeural`)** the primary default.
  * **Voices Available:**
    * `Ava (Warm & Natural) [Recommended]` (`en-US-AvaNeural`) — Expressive, warm, realistic human female voice.
    * `Sonia (Sophisticated Co-Pilot)` (`en-GB-SoniaNeural`) — Crisp, sophisticated British accent.
    * `Emma (Bright & Expressive)` (`en-US-EmmaNeural`) — Clear, friendly, articulate.
    * `Jenny (Clear & Conversational)` (`en-US-JennyNeural`).
    * `Aoede (Studio Neural)` / `Kore (Crisp Neural)` on Gemini TTS with automatic fallback to Ava on 429.
  * Zero robotic SAPI5 Microsoft Hazel fallback!
* **Cool Intellectual Friend Personality (Phase 14):**
  * Completely purged cheesy 1980s spaceship checklist dialogue ("propulsion and defense systems are green across the board").
  * Conversational prompt re-engineered: SHELLY is NatC's sharp, witty, supportive intellectual partner and friend who talks in concise, natural, warm conversational prose.
  * Multi-turn conversation memory (last 16 messages).
  * Instant fast-path responses for "can you hear me", "who are you", jokes, greetings.
* **32-Bar Visualizer & Arc Reactor Pulse (Phase 14):**
  * When SHELLY speaks: 32 bars actively pulse, dance, and modulate to her speech output! Arc reactor core expands and outer rings spin faster! Status: `SHELLY SPEAKING // AUDIO EMISSION`.
  * When NatC speaks: 32 bars vibrate to his voice in bright neon green! Status: `HEARING BOSS // CAPTURING VOICE`.
  * When in active session: Status displays `ACTIVE SESSION // LISTENING TO BOSS (18s)`.
  * When in standby: Calm, gentle ambient ripple, `STANDBY // LISTENING`.
* **Hybrid Hardware Engine (`core/hardware_profiler.py`):**
  * Auto-detects NVIDIA GeForce RTX 3050 Laptop GPU (60 FPS WebGL) vs CPU Efficiency (<1% CPU, 30 FPS).
* **Instagram Mission Control Bridge (`core/instagram_bridge.py`):**
  * Live REST connector to Render (`https://insta-stuff.onrender.com`).
  * Synchronizes published reels, video thumbnails, captions, active protocols, and allows one-click pause/resume/termination.

---

### 4. Chronological Implementation Phases

| Phase | Milestone / Focus | Details |
|---|---|---|
| **Phase 1** | Two-Branch Architecture Inception | Split between Web SaaS (`insta_auto_reply_shii`) and Desktop Cockpit. |
| **Phase 2** | Full Rebranding (JARVIS -> SHELLY) | Replaced legacy references across code, UI headers, and voice prompts. |
| **Phase 3** | Wake Word & Mic Overhaul | Calibrated noise floor (65.0 RMS) and added phonetic aliases. |
| **Phase 4** | Gemini Failover Pool | Added multi-key rotation on HTTP 429. |
| **Phase 5** | Settings Deck | Built voice selection and key management. |
| **Phase 6** | Arc-Reactor Logo Pipeline | Multi-resolution ICO/PNG assets generated from 2048x2048 master. |
| **Phase 7** | Windows Taskbar Icon Fix | Registered AppUserModelID `natc.shelly.cockpit.2.0` and dispatched Win32 `WM_SETICON`. |
| **Phase 8** | ElevenLabs Voice Integration | Built ElevenLabs engine with SAPI5 fallback. |
| **Phase 9** | Living Memory System | Created `current_state.md` to permanently preserve context. |
| **Phase 10** | Voice Root Cause & Gemini TTS Discovery | Discovered Edge-TTS 403 error. Tested and verified Gemini native studio TTS producing 24kHz studio audio with NatC's existing Gemini key. |
| **Phase 11** | Tony Stark Mark-VII Tactical Modernization | Migrated to `C:\temp\PROJECT-SHELLY`. Built authentic Stark Industries HUD (zero AI slop, no emojis, obsidian carbon background, rotating vector arc reactor, 32-bar oscilloscope). Engineered hybrid GPU/CPU adaptive engine. |
| **Phase 12** | Voice Cadence Calibration & Direct GUI Launch | Resampled Gemini TTS to 44.1kHz Stereo (eliminated Donald Duck pitch shift). Repointed Desktop shortcut to eliminate terminal popup. |
| **Phase 13** | Permanent Native Binary `SHELLY.exe` & Taskbar Pinning Resolution | Compiled native Win32 `SHELLY.exe` with embedded `shelly_logo.ico`. Purged legacy `Python.lnk` and bound AUMID `natc.shelly.cockpit.2.0` to HWNDs and taskbar pins. |
| **Phase 14** | Expressive Human Neural Voices & Continuous PyAudio Engine | **Zero Robotic Slop:** Upgraded `edge-tts 7.3.1` and set `Ava (Warm & Natural)` as primary default. Continuous PyAudio stream + 18s multi-turn conversational session. Live vibration canvas + auto-dynamic noise gate. |
| **Phase 15** | Taskbar Stacking Liberation & Groq Whisper Turbo Overhaul | **Taskbar Fix:** Cleared rogue AUMID `natc.shelly.cockpit.2.0` from 188 foreign windows and 14 Discord windows; restored Discord (`com.squirrel.Discord.Discord`) and Antigravity (`electron.app.Antigravity`). Added active desktop scrubber. **Zero Sitting Quiet:** Integrated Groq Whisper Large V3 Turbo (<0.35s STT) and leaky-integrator noise floor tracker that never locks up. Upgraded LLM brain to Groq Qwen 3.8 27B (<0.3s response, eliminating reasoning token exhaustion). Fixed punctuation bug so 'Shelly,', 'Shelly.' always trigger wake word. |
| **Phase 16 (Current)** | Cross-Platform Generic Template Card & Text Alignment Overhaul | **Problem Fixed:** Instagram Web (Desktop Browser) stripped buttons from Meta `button` templates, and text bubbles were cluttered with raw URL line breaks (`Click ✅: https://... /download`). **Solution Applied:** Migrated `sendPrivateReply` to Meta's **Generic Template** (`template_type: 'generic'`). Renders perfectly aligned cards with bold titles, subtitles, and interactive buttons on BOTH Mobile and Desktop Web (identical to Image 1). Integrated `default_action` so clicking the card anywhere opens the link. Stripped raw URLs from message bodies to ensure pristine typography. Backfilled `Pixel pet` into `campaigns_backup.json` and deployed. |

---

### 5. Verification & Launch Instructions

#### Launching the S.H.E.L.L.Y Mark-VII Cockpit:
1. **Direct Launch (Recommended):** Double-click the **SHELLY** shortcut on your Windows Desktop, or run `C:\temp\PROJECT-SHELLY\SHELLY.exe`. Opens directly into the software interface with **ZERO command prompt terminal windows**.
2. **From Terminal / Web Folder:**
   ```cmd
   cd C:\temp\PROJECT-SHELLY
   .\LAUNCH_SHELLY.bat
   ```

#### Verification Checklist:
* **Microphone Live Vibrations:** Talk into your USB microphone — the **Microphone Vibration Canvas** in the right panel immediately bounces with green oscillating waveforms proportional to your voice intensity.
* **Auto-Dynamic Gate:** Watch the room noise floor (e.g. `20 RMS`) and yellow gate marker line adjust automatically. When you speak, the bar crosses the yellow line and lights up `● VOICE CAPTURED // HEARING BOSS`.
* **Multi-Turn Conversation:** Say *"SHELLY"* once. After she responds, speak again immediately (*"can you hear me"*, *"who are you"*) — she responds directly without needing to say *"SHELLY"* again!
* **Expressive Human Voice:** SHELLY speaks in `Ava (Warm & Natural)` — an ultra-realistic, warm, breathe-inflected female human voice with zero 2010 robotic SAPI5 slop.
* **Oscilloscope Sound Waves:** Above `STATUS: STANDBY // LISTENING`, the 32 frequency bars dance actively to SHELLY's voice output while the Arc Reactor core flares and pulses.
