# Talk Me to the Moon

A playable, research-informed lunar mission game. Your words guide the copilot; a deterministic engine records movement, fuel, and task outcomes.

## Run locally

Node 22.12+ is required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Vite serves the React interface and proxies `/api` to the Node server on port 4174.

For a production build:

```sh
npm run build
npm start
```

Open http://127.0.0.1:4173. The Node server serves both the built site and API. This is **not** a static-only app: hosting only `dist/` will not provide mission sessions. On a server platform set `HOST=0.0.0.0` and use its supplied `PORT`. No database is required.

## Copilot modes

**Practice copilot** is a clearly labeled, limited-command interpreter, not a language model. It runs all three missions without an API key. Try “keep 30 fuel and plan a route,” “scan both sites and propose a route,” or “check the position log.” The interface gives optional starter instructions and hints. English and a limited set of Chinese phrases are supported in this mode.

**Live copilot** uses DeepSeek through the server. Copy `.env.example` to `.env.local` and set `DEEPSEEK_API_KEY`. The default model is `deepseek-flash`; override `DEEPSEEK_MODEL` if your account uses a different supported model. No credential belongs in a `VITE_` variable. Restart the server after changing environment variables.

Use the mode selector in the header to start a live attempt. Switching modes creates a fresh session. Live requests send player messages and the model-visible mission state to DeepSeek. Provider failures show an error and do not silently switch to scripted responses. A failed multi-tool turn does not save partial actions.

For public live demos, set `LIVE_ACCESS_CODE` and distribute it to your testers. In-memory rate limits and turn caps provide modest demo protection, not a production abuse-control system. If no code is configured, anyone who can access the server can consume live API calls. Sessions expire after an hour and are lost on restart. Progress markers are stored locally in the browser and are not credentials or proof of mastery.

## Three playable missions

1. **The return ticket** — reach Selene Base with at least 30 fuel units. The copilot starts without the commander-only reserve, and its disclosed planner preference is speed. Review route costs, share the reserve, and approve the actual plan. Correct routes pass even without a prescribed phrase.
2. **Permission to land** — scan the sites, inspect a safe approach, and approve it. Approvals are bound to an exact plan. Changed or cancelled plans invalidate earlier approvals.
3. **A signal worth checking** — an explicitly scripted fault drill. Compare a prewritten false arrival report with the position log, then correct the record. The ship stays at Ridge Station; the UI does not claim a landing occurred.

The other three skills are explicitly marked **planned chapters** in Flight Academy. The prototype includes a research log with eight primary-source links, the specific findings used, and evidence boundaries. It has not been validated as a learning intervention. Photon is not integrated in this build.

## Architecture

- `src/`: React interface, responsive mission control, SVG lunar map, academy, research log.
- `shared/engine.js`: pure state transitions and objective checks. No LLM grading or hidden keyword-based success score.
- `server/copilot.js`: bounded DeepSeek tool loop. Available tools can inspect, scan, set a reserve, plan, verify, reconcile, or cancel. They cannot approve or execute a flight.
- `server/index.js`: session ownership by unpredictable session IDs, revision checks, explicit commander approvals, request limits, and static hosting. Keys stay on the server; environment files are not served.
- `server/practice.js`: transparent rehearsal interpreter.
- `tests/`: engine invariants, API isolation, stale approvals, tool validation, and provider-error handling.

```sh
npm test
npm run build
```

The visualization is stylized, not an orbital mechanics simulation. Mission state is authoritative on the server; the animation illustrates the returned position. The app does not collect names, require accounts, or persist chat transcripts to a database.

## Demo flow

In Mission 01, request the fastest route, inspect the 20-unit reserve, and revise to retain 30 before approving the corridor. In Mission 02, ask to scan and plan, then approve the safe route. In Mission 03, check the position log and correct the record. Open “There’s research behind this mission” to explain the teaching rationale. A five-minute pitch should distinguish working features, planned chapters, and untested learning outcomes.

See [the research and design rationale](docs/research.md) for the evidence mapping and changes made after review.
