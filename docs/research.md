# Research and design rationale

The curriculum is research-informed; the learning effectiveness of this implementation has not been evaluated. Six skills inform the design; six missions are implemented. Completing a mission is evidence of that game outcome, not a validated learning assessment.

| Skill | Evidence | Application and boundary |
|---|---|---|
| Explicit goals and constraints | Bsharat et al., Principle 25; Tankelevitch et al., goal formulation | Mission 01 uses a fictional landing-shield fuel reserve. The source models and benchmark do not establish universal effectiveness. |
| Relevant additional information | The Prompt Report, prompt components | Mission 02 uses a private cargo manifest. Taxonomic support, not a learning-effectiveness experiment. The metacognitive paper is not used as direct evidence for missing-information sharing. |
| Examples | Brown et al.; Bsharat et al., Principle 7; Zamfirescu-Pereira et al. | Mission 04 uses labeled specimen examples and tests new combinations. Correct rules would also be accepted; practice with examples and actual use of examples should be measured separately. |
| Inspectable steps | Wu et al., AI Chains, 20-person study | Mission 03 adds explicit plan approval. This authorization mechanism is a design extension. |
| External evidence | Huang et al.; metacognitive output evaluation | Mission 05 compares three scripted claims with position, energy and laboratory records. Applying reasoning self-correction findings to agent completion reports is an analogy, not direct evidence. |
| Revise and test | Zamfirescu-Pereira et al., 10-person study; metacognitive flexibility | Mission 06 tests a policy across three situations and invalidates results after revision. No independent learning-transfer study has been conducted. |

## Incorporated review feedback

- The initial three-mission MVP has been expanded to six playable missions, each with deterministic outcomes and bilingual UI.
- The revised game uses a fictional 30-fuel landing-shield threshold; failure destroys the rocket at touchdown. This consequence is a game-design decision, not a research finding.
- Research stays outside the play flow, in this document and a collapsed homepage evidence section.
- Deterministic state checks rather than an LLM assigning a prompt score.
- Practice simulation and live model mode are visibly distinguished; failures do not cause silent fallback.
- The inaccurate completion report is labeled as a scripted fault drill.
- Missing information is disclosed as commander-only. The AI is not instructed to ignore facts it has received or deliberately misinterpret users.
- The planner's baseline favors speed among routes meeting known requirements. A safe route alone does not complete a communication objective: the player must supply the required reserve or manifest fact. The engine requests the missing parameter without forcing a crash when the physical route is safe.
- Primary papers remain linked, and evidence is classified as experiments, user studies, synthesis, or theory.
- The formal ImaginAItion publication is linked with an author-manuscript fallback. Its reported results are not presented as our own or as controlled evidence for our game.

## Sources

1. Bsharat, S. M., Myrzakhan, A., & Shen, Z. *Principled Instructions Are All You Need for Questioning LLaMA-1/2, GPT-3.5/4.* 2024 revision of a 2023 preprint. https://arxiv.org/html/2312.16171v2
2. Schulhoff, S., et al. *The Prompt Report: A Systematic Survey of Prompt Engineering Techniques.* v6, 2025 revision. https://arxiv.org/html/2406.06608v6
3. Brown, T. B., et al. *Language Models are Few-Shot Learners.* NeurIPS 2020. https://papers.neurips.cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract.html
4. Zamfirescu-Pereira, J. D., Wong, R. Y., Hartmann, B., & Yang, Q. *Why Johnny Can’t Prompt: How Non-AI Experts Try (and Fail) to Design LLM Prompts.* CHI 2023. https://people.eecs.berkeley.edu/~bjoern/papers/zamfirescu-johnny-chi2023.pdf
5. Tankelevitch, L., et al. *The Metacognitive Demands and Opportunities of Generative AI.* CHI 2024. https://www.microsoft.com/en-us/research/publication/the-metacognitive-demands-and-opportunities-of-generative-ai/
6. Wu, T., Terry, M., & Cai, C. J. *AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts.* CHI 2022. https://arxiv.org/abs/2110.01691
7. Huang, J., et al. *Large Language Models Cannot Self-Correct Reasoning Yet.* ICLR 2024. https://arxiv.org/abs/2310.01798
8. Ma, Q., et al. *“GenAI Defaults to Bias!” Gamify AI Literacy Through Reflections on Prompts.* AIED 2026. https://doi.org/10.1007/978-3-032-29763-1_7 — author manuscript: https://arxiv.org/html/2509.13679v2

## Pedagogy and related work in the expedition MVP

- **Progressive support:** earlier levels expose an optional fill-in outline; the final level combines earlier requirements. Renkl, Atkinson & Große, *How Fading Worked Solution Steps Works—A Cognitive Load Perspective*, Instructional Science 32, 59–82 (2004), supports gradually reducing worked-example guidance. It does not prove that every level must contain exactly one concept or that this six-stage sequence is optimal. https://doi.org/10.1023/B:TRUC.0000021815.74806.f6
- **Task/process feedback:** show the unmet condition, observable result and next step. Hattie & Timperley, *The Power of Feedback*, Review of Educational Research 77(1), 81–112 (2007). https://doi.org/10.3102/003465430298487
- **Related game:** ImaginAItion explores multiplayer reflective play about GenAI behavior and bias. This expedition instead exercises individual instruction, tool consequences and claim/record comparison. This is a design distinction, not evidence of greater effectiveness. Author project and publication record: https://github.com/mqo00/ImaginAItion
- **Corrections to the supplied feedback:** the Renkl paper is not titled “How to Design Worked Examples”; the Tankelevitch paper is *The Metacognitive Demands and Opportunities of Generative AI*, not “The UX of AI: Using HCI to Design AI Systems.” We do not cite those incorrect titles or unverified page-specific claims.
- **No incantation scoring:** role labels and “think step by step” are not pass conditions. We do not manufacture mathematical failures or claim that requesting a reasoning trace prevents hallucinations. The game evaluates communicated requirements, actions and evidence.

The earlier seven-mission product brief is a future product specification. This release implements the smaller six-stage scope; it does not claim the full brief's assessment, persistence or reviewer architecture.
