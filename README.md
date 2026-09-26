# Talk Me to the Moon — BOLT’s Moon Run

A block-style lunar adventure about giving useful instructions to AI. Tell BOLT what to do, check the route, and press launch. A deterministic engine controls fuel, location, destruction, and quest completion.

## Run

Node 22.12+:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. For the production preview:

```sh
npm run build
npm start
```

Open http://127.0.0.1:4173. This app needs its Node server; deploying `dist/` alone does not support game sessions. Hosting can use `HOST=0.0.0.0` and the platform's `PORT`.

## Play

- **Fuel fail:** Keep at least 30 fuel for the fictional landing shield. The fast route leaves20: approving it breaks the rocket on touchdown, with an explosion and a one-click rebuild. The eco route leaves40 and wins. The warning comes before launch; there is no forced failure or secret phrase.
- **Crater trouble:** A plain travel request proposes the fastest provisional route without scanning. Both sites remain unknown. Ask to inspect safety in your own words, then review the checked route. The North route contains visible asteroid obstacles after scanning; the South route is clear. An uninspected North launch reveals the rocks on approach, collides and explodes before reaching the base; an uninspected South landing is lucky but does not earn the inspection badge. Scanning invalidates earlier approvals.
- **Fake finish:** An explicitly scripted faulty arrival report contradicts the position log. Check and correct it. The rocket stays at Ridge Station; verification is not portrayed as a landing.

The home screen explains the three controls. Missions unlock in order. Completed badges persist in this browser; they are not evidence of learning mastery. The end screen names the actual three skills exercised. The game uses original SVG robot/rocket art inspired by chunky block-game aesthetics, not Roblox assets or a Roblox integration.

Research has been removed from the player interface. The evidence and limitations remain in [the design rationale](docs/research.md).

## Bot modes and credentials

The player-facing game always starts with live DeepSeek. There is no Practice/Live choice. Optional hints provide examples without restricting player wording. The limited practice interpreter remains only as an explicit developer/test API mode. The synthetic browser harness requests that mode directly and does not spend live API credit.

Live mode uses DeepSeek (`deepseek-flash`, configurable through `DEEPSEEK_MODEL`). Copy `.env.example` to `.env.local`, set `DEEPSEEK_API_KEY`, restart, and press Play. Settings only show connection information and an access-code field if required. Messages and mission state are sent to the provider. Failures are shown explicitly; there is no silent scripted fallback.

Keys are server-side only. `.env.local` is ignored. For a publicly reachable live demo set `LIVE_ACCESS_CODE` and share it with testers; otherwise visitors can consume your API allowance. In-memory session limits are prototype protection, not production abuse controls. Sessions expire after an hour and reset on server restart. No database or account is required. Photon is not integrated.

## Verification and synthetic review

```sh
npm test
npm run build
```

The unit/API suite checks constraints, stale approvals, isolation, destruction, evidence gating, and atomic provider failures. Synthetic browser walkthroughs exercise home → all three missions → badges, including deliberate failure and recovery. These are not real participants or a learning-effectiveness study.

To reproduce the 100-persona walkthrough (requires Playwright and installed Google Chrome):

```sh
npm install --no-save playwright
npm run build
node scripts/simulate-users.cjs 100 0
```

Alternatively set `PLAYWRIGHT_PATH` to an existing Playwright package. Test servers run on port4391 and are restarted for each pair of profiles so production rate limits remain unchanged. Results go to `docs/simulation/`.

Optional synthetic critique generation uses DeepSeek and consumes API calls:

```sh
node scripts/review-personas.mjs docs/simulation/runs-1-100.json
```

The fictional identity fields represent coverage, not explanations of preferences. Behaviors come from ten independently assigned test families, crossed with device sizes and experience levels. Generated harsh reviews are hypotheses to assess, not verbatim human testimony. Read [the review report](docs/simulation/REPORT.md) for changes, failures found, and limitations.

## Structure

- `src/`: React game, home and ending, original SVG art, responsive styles and reduced-motion behavior.
- `shared/engine.js`: authoritative state; no LLM grading of prompts.
- `server/`: DeepSeek tool loop, transparent practice interpreter, session API, static hosting.
- `tests/`: meaningful game and API invariants.
- `scripts/`: reproducible synthetic walkthrough and optional review generation.

The landing-shield rule is fictional gameplay, not a claim about real spacecraft physics. A failed touchdown in mission1 can reach the base coordinates while destroying the rocket; a mission2 obstacle collision instead stops at North obstacle field (12,7); both the failure state and remaining fuel remain visible.

## Live intent regression

`node scripts/check-live-intent.mjs` runs eight real-provider scenarios and consumes API credit. It checks ordinary English and Chinese destination requests, recovery from the previously observed refusal loop, preservation of unstated fuel limits, greetings, and scan-only instructions. A plain travel request prepares an uninspected plan. Safety inspection occurs only when the player requests evidence or an assessment of landing safety; it does not require a magic keyword. Launch still requires the player's button.

The 100-persona report describes the earlier revision and practice-mode coverage; it did not validate live conversational behavior. The screenshot-reported refusal loop was found through real use and addressed separately.

## 中文 / English

The header language toggle translates the home screen, all three missions, map labels, controls, outcomes, logs, and connection feedback. Switching preserves the current mission and plan. The preference is stored locally and reflected in `?lang=zh` / `?lang=en`. New DeepSeek replies follow the selected Chinese locale; earlier free-form model messages remain in the language they were originally generated in. Player-authored messages are never translated silently.

This revision was verified with a complete Chinese mobile walkthrough (including unknown-route crash and lucky-but-uninspected landing), a mid-mission language switch, and real DeepSeek English travel / Chinese safety requests within the Chinese interface.
