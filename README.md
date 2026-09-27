# Talk Me to the Moon — Research Expedition

A bilingual, block-robot adventure: land on the Moon, deliver a research instrument, collect and sort sample containers, audit the report, and prepare the return. Players instruct a live DeepSeek copilot; a deterministic engine controls consequences and completion.

## Run

Node 22.12+:

```sh
npm ci
npm run dev
```

Development: `http://127.0.0.1:5173`. Production preview: `npm run build` then `npm start` at `http://127.0.0.1:4173`. Deploy the Node service, not `dist/` alone. Render supplies `PORT`; set `HOST=0.0.0.0` for hosted access.

Set `DEEPSEEK_API_KEY` in a server-only environment or ignored `.env.local`. The model defaults to `deepseek-flash` and can be changed with `DEEPSEEK_MODEL`. Never commit credentials. Live API failures preserve the draft and explicitly report failure; they do not silently substitute a scripted bot.

## Six connected missions

| Stage | Player skill | Observable check |
|---|---|---|
| 1. Moon landing | Communicate a goal and reserve | The brief states the shield fact but not the method. A plain "take me to the base" picks the fast route and crashes. Must share a valid reserve and arrive with at least 30 fuel; choosing B alone cannot complete the mission. |
| 2. Research cargo | Share the fact that matters | The private manifest lists five fields; only mass affects the bridge. Must communicate the 4-tonne mass and deliver intact. Choosing the strong bridge alone is insufficient. |
| 3. Field route | Inspect before approval | Both routes show unsurveyed ground; the rocks on A appear only after a scan (or a crash). A scan invalidates the old plan; the reviewed safe route reaches the sample field. An unchecked A trip crashes; an unchecked B trip is a lucky landing and must be replayed. |
| 4. Sample lab | Choose contrasting examples | Four labeled reference cards; BOLT's scanner tray holds two. If the chosen cards differ in both color and shape, BOLT guesses color and misroutes half the batch. A pair differing only in shape teaches the rule. Explicit equivalent rules are also accepted. |
| 5. Evidence desk | Compare claims with records | Player submits three evidence-backed judgments: contradicted, supported, insufficient. Retrieving position alone never completes a check. |
| 6. Return launch | Test before trusting | BOLT flies home on autopilot; default orders take the fastest route. Players test launch conditions one at a time or all together; editing orders marks earlier results RETEST. Release is always allowed: a failing untested condition becomes launch day and crashes; correct but under-tested orders get home by luck and must be replayed. Only orders passing all three current tests clear the mission. |

Fuel values are local scenario budgets, not one continuous spacecraft tank. All capacities, sample handling rules and readings are fictional game fixtures. The sample IDs and story carry forward; this MVP does not implement a scientific simulator or a versioned research-artifact database.

The home screen includes a three-scene judge demo (1, 3, 5), which uses explicit independent snapshots and earns no full-campaign badges. Two roadmap cards are visibly nonfunctional previews. Research appears only in an optional disclosure, including related work ImaginAItion.

## How the backend evaluates input

There is **no separate LLM judge** and no role-name, prompt-length or “think step by step” pass rule.

1. `server/copilot.js` supplies a common copilot contract, one mission-specific instruction and a filtered engine view. The private landing reserve and cargo mass are absent initially.
2. DeepSeek interprets the learner’s wording into a tool call. Requirement-setting and inspection calls cite the current player message. Audit conclusions and reasons may span user messages for the current report; its displayed record supplies the source identity.
3. `server/permissions.js` enforces the mission’s tool scope, checks the quote against actual player input, and checks relevant values/evidence. These are bounded provenance/semantic checks, not a proof of general language understanding.
4. `shared/engine.js`, `shared/advanced.js` and `shared/audit.js` determine actual outcomes. The model cannot set a success flag or execute a launch/approval tool.
5. A human button approves the identified current plan. Changes invalidate old plans/tests. The evidence mission uses a player-authored judgment through chat rather than a one-click correction.

The LLM can still misunderstand language or provide poor commentary. Engine checks constrain effects; observed live tests do not establish universal robustness. Concise effective instructions are accepted. Requiring an identity like “flight director” or a chain-of-thought phrase would measure compliance with a token, not the task outcome.

## Progress and scope

Completed expedition badges persist locally under a new curriculum key. Old badges remain untouched and are not upgraded to new verification records. In-progress server sessions are in memory, expire after one hour and reset on restart. No durable-resume claim is made. No consulting case, seventh level, multi-agent reviewer or Photon integration is implemented in this release.

The public UI starts in live mode. The limited practice interpreter exists only for explicitly labeled development API testing. Settings disclose DeepSeek processing. Optional `LIVE_ACCESS_CODE` can limit access; in-memory rate/session limits are prototype controls, not comprehensive abuse protection.

## Verification

```sh
npm test
npm run build
node scripts/check-expedition-browser.cjs
node scripts/check-expedition-live.mjs
node scripts/check-six-live.mjs
```

The browser harness needs Google Chrome and Playwright (`PLAYWRIGHT_PATH` may point to an existing package). It deliberately requests the practice API: both languages, six stages, three-scene demo, shortcut rejection, persistent obstacle crash/retry, evidence judgments, policy revision, badge isolation, narrow-screen overflow and runtime errors.

Live scripts make actual DeepSeek calls using the configured key and consume API credit. `check-expedition-live.mjs` covers the revised information and audit gates; `check-six-live.mjs` covers sorting and incremental policy revision. Historical scripts and the 100-persona report describe earlier revisions; they are not evidence that 100 humans evaluated this version.

See [research rationale](docs/research.md) and [release scope](docs/hackathon-final.md). All learning-effectiveness claims require a separate human study.


### Conversational playthrough fixes

A real Chrome playthrough found missing delivery plans, overly narrow Chinese checks, and audit answers rejected across turns. The copilot now receives only the current mission’s tools. Valid reserve, cargo and scan updates refresh the provisional plan. Audit reasoning is accumulated from player messages for one report and cleared on advancement; players do not need to type record IDs. Provider tool markup is rejected without committing that turn. The instruction box appears before action cards so corrections remain easy to find.

Regression examples include “看看哪条路没有石头”, “报道r1 不对” followed by “巡视车位置与基地不同”, “对啊，记录也是62”, and “别撞石头，剩下的油不能少于30，不够就先等等”. These are tested examples, not a claim of universal language understanding.
