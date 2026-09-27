# Expedition MVP release scope

## Delivered behavior

Six connected stages: landing → equipment → field route → laboratory → report audit → return preparation. Existing robot graphics, visible hazards, crashes and local retries remain. The field vehicle is now a rover. Each success shows what the expedition gained and where the story goes next.

A three-stage judge demo is reachable from the homepage; its badge state is separate. Two explicitly labeled future previews remain beneath the main play entry. The consulting scenario, seventh stage and durable research-artifact system stay outside this MVP.

## Assessment changes

- Reserve and cargo shortcuts are blocked by code even if the chosen route is physically safe.
- Mission-specific copilot instructions replace the monolithic curriculum prompt.
- Tool calls changing requirements or submitting judgments cite actual player text; server checks validate source quotes, relevant values and mission scope.
- Mission 5 separates evidence retrieval from judgment. Correct, incorrect and unsupported claims require different decisions, conveyed through the chat with evidence.
- Templates leave meaningful fields for the player. No role phrase, sentence count or “step by step” password is scored.
- Policy tests still execute the current policy without silently improving it, preserve earlier fields on revision, and invalidate old release eligibility.

## Deliberate limits

The live LLM interprets meaning; it can err. Bounded input checks and deterministic outcomes constrain effects. These tests are software checks, not a learning study. Badges denote game completion. Scenario resources reset locally; no continuous physics model or permanent session database is promised. Earlier saved progress is not relabeled as completion of the new curriculum.

## Release checks

Run the current unit/API suite, production build, bilingual browser harness and bounded live-provider tests listed in the README. Review the generated screenshots. Confirm the deployed health endpoint reports `expedition-2` before presenting the new URL as released.
