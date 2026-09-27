# Post-mission example review

Reviewed 2026-09-27. The examples illustrate the six skills; these checks do not measure learning gains or guarantee model compliance.

| Mission | Problem in the previous example | Revised exercise and human check |
| --- | --- | --- |
| 1: Constraints | Dinner costs required prices that were not supplied; English and Chinese used different budgets. | A 30-minute study plan: manually add durations and check reading and break requirements. |
| 2: Context | “This topic” did not identify a topic. | Explain one-half using a shared pizza, with the child's prior knowledge supplied. Check equal parts and accessible language. |
| 3: Approval | “These files” assumed access to unspecified files and an editing tool. | Supplied text with two spelling errors. Request only proposed corrections; the human approves before a rewrite. |
| 4: Examples | “These new messages” were missing. | Two labeled examples plus two actual new messages. Expected labels: ACTION, UPDATE. |
| 5: Verification | Neither the receipts nor the claims were supplied. | One fictional meeting record and three claims. Expected judgments: contradicted, supported, unknown. The human compares with the supplied record. |
| 6: Retesting | No scheduling prompt, availability, or test outcomes were given. | A flawed rule and three concrete availability cases. Revised earliest slots: 9–9:30, 9:30–10, none. Check both participants' availability. |

## Validation

- Submitted all six examples in both languages to the game's configured DeepSeek model and inspected the actual responses against the checks above.
- The first English mission 3 trial prematurely included a full rewrite. Narrowed the request to a correction list and explicitly excluded the rewrite. Retested twice in each language; all four returned only corrections.
- Other trial outputs matched the relevant arithmetic, classification, evidence, and availability checks. Model variability remains possible; each popup now tells the player what to inspect.
- Production build passed. Inspected the longest popup at a 390 × 844 browser viewport: no horizontal content overflow, internal scrolling works, and the final button reaches the badge screen.
