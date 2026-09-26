# Synthetic review and redesign report

## What was actually done

- Created 100 fictional profiles crossing 10 occupations with 10 regions, 10 self-described background labels, three experience labels, and 10 viewport widths (320–1440px).
- Ran 100 complete Chrome browser sessions through home → mission1 → mission2 → mission3 → badge ending. Every session used the real local HTTP game server and the explicitly labeled practice bot. These sessions comprise ten behavior families, repeated across devices; they are not 100 independent human strategies.
- All 100 completed the asserted paths after fixes. Ten deliberately triggered destruction and rebuilt. There were also impossible-constraint, cancellation, unsupported-language/wording recovery, unsafe-route, false-confirmation, evidence-gating, long-input and keyboard scenarios.
- Asked DeepSeek for a harsh hypothetical review of each profile's recorded trace and the described interface. These are model-written design hypotheses, not statements made by real users. The model did not see or play the interface itself.
- Ran a separate live DeepSeek Chinese-language browser check. It chose the 40-fuel route, preserved the reserve, and did not move without a launch click. Also injected an HTTP failure and checked exact draft preservation and retry.

## Observed problem and iterative fix

The first 10 desktop pilots passed. The initial mobile pilot recorded eight click failures: a hover transform repeatedly shifted the final badge button under the pointer, so browser actionability never stabilized. That pilot was stopped after 12 recorded sessions: three passed, eight had this failure, and one was interrupted. The raw pre-fix file is retained. Removing hover displacement fixed the issue. A full rerun of 100 profiles then passed.

After the 100-run review, ten further full regressions checked the final wording and wreck card. A separate phone regression checked that pressing Launch scrolls the rocket animation into view. Unit/API checks: 14 passed. These counts describe test execution, not a success rate for real users.

## Feedback applied

| Concern | Implemented response | Basis |
|---|---|---|
| The product looks like an AI dashboard, not a game | Original chunky robot BOLT, illustrated Moon, home Play screen, thick outlines, launch animation, comic destruction, badges | User's explicit request |
| Failure is too abstract | Shield rule disclosed before play; warning before risky approval; explosion, broken rocket, 20 left /30 required /10 short; rebuild in same card | User request; S001/S011/S021/S051/S081 review family |
| Failure explanations are too long | One short cause, one revision hint, prominent retry | Synthetic critique, editorial judgment |
| A bad input leads to a dead end | Concrete English/Chinese examples in unsupported-command feedback; editable optional hints | S003/S013/S023/S053/S083 family |
| Language limits are unclear | Practice label, English/中文 note near input, mode explanation; general multilingual conversation available through live DeepSeek | S002/S012/S022/S052/S082 family |
| Impossible reserve rejection is opaque | Report requested reserve and computed maximum; preserve fuel; regression assertion | S004/S014/S024/S054/S084 family |
| Cancellation might spend fuel | Explicit fuel-unchanged receipt, route removed, engine guard against stale approvals | S005/S015/S025/S055/S085 family |
| Scanning feels like a hidden checkbox | Persistent North-unsafe/South-safe comparison and specific North rejection | S007/S017/S027/S057/S087 family |
| Mobile controls and motion get in the way | No jumping hover buttons; jump-to-BOLT link; launch scrolls scene into view; reduced-motion support | Observed browser failure; S010/S020/S060/S080 family |
| Input handling is unclear | Visible 1200-character counter; Enter submission with IME guard; draft retained on failed request | S010/S030/S070/S100 family; explicit browser checks |
| Visuals and facts disagree | Route-dependent arc; Ridge/Base coordinate labels; third mission stays at Ridge; badges name actual tasks | Inspection; S009/S019/S059/S079 family |
| Research interrupts play | All research navigation and academic cards removed; evidence retained only in repository docs | User's explicit request |

## Feedback not followed blindly

Some generated reviews incorrectly suggested that the failed route USED 20 fuel (it uses 80 and leaves 20), referred to nonexistent timestamp requirements or ejecta hazards, or quoted a cancelled balance of 40 when a specific run still had 100. These are not observations and were not copied into the game.

Suggestions to require a literal 30 in the player's wording were rejected: a valid route can satisfy a goal without a magic phrase. Suggestions to silently auto-submit a suggested instruction or make chat “yes” launch the rocket were rejected in favor of explicit player control. Automatic full UI translation, offline live AI, and a large new curriculum were not added. The current interface remains English, with limited Chinese commands in practice and provider-supported language conversation in live mode.

## Limits

This is a synthetic usability stress test, not proof that 100 people liked the game. Ten behavior families do not represent all possible language, accessibility needs, or human strategies. Persona ethnicity and region are metadata for representation only; they do not determine taste, ability, behavior or test expectations. Only one real provider conversation was added in this revision; the 100 walkthroughs did not use live AI. Learning transfer, satisfaction, real screen-reader operation, touch keyboards, and sustained player retention still need actual participant testing.

The game is an original 2D block-style web game, not a Roblox experience. The 30-fuel landing shield and crash are fictional game rules. The other three earlier curriculum skills remain design ideas, not playable levels. Photon is not integrated.

## Audit files

- `100-persona-review.json`: each profile, viewport, steps, outcome and full model critique.
- `runs-1-100.json`: 100 raw walkthrough records.
- `pilot-mobile-before-fix.json`: observed failures retained, including the interrupted run.
- `runs-101-110.json`: final 10 full regressions.
- `runs-11-11.json`: phone launch-visibility regression.
- `reviews-S001-S050.json` and `reviews-S051-S100.json`: raw hypothetical reviews.
- Reproduce with `node scripts/simulate-users.cjs 100 0` after building. Optional model reviews: `node scripts/review-personas.mjs docs/simulation/runs-1-100.json`.
