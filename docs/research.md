# Research and design rationale

The curriculum is research-informed; the learning effectiveness of this implementation has not been evaluated. Six skills inform the design; three missions are implemented. Completing a mission is evidence of that game outcome, not a validated learning assessment.

| Skill | Evidence | Application and boundary |
|---|---|---|
| Explicit goals and constraints | Bsharat et al., Principle 25; Tankelevitch et al., goal formulation | Mission 01 uses a fictional landing-shield fuel reserve. The source models and benchmark do not establish universal effectiveness. |
| Relevant additional information | The Prompt Report, prompt components | Planned private-report mission. Taxonomic support, not a learning-effectiveness experiment. The metacognitive paper is not used as direct evidence for missing-information sharing. |
| Examples | Brown et al.; Bsharat et al., Principle 7; Zamfirescu-Pereira et al. | Planned sample classification. Correct rules would also be accepted; practice with examples and actual use of examples should be measured separately. |
| Inspectable steps | Wu et al., AI Chains, 20-person study | Mission 02 adds explicit plan approval. This authorization mechanism is a design extension. |
| External evidence | Huang et al.; metacognitive output evaluation | Mission 03 compares a scripted report and telemetry. Applying reasoning self-correction findings to agent completion reports is an analogy, not direct evidence. |
| Revise and test | Zamfirescu-Pereira et al., 10-person study; metacognitive flexibility | Planned transfer chapter. Replay is available now, but no independent transfer study has been conducted. |

## Incorporated review feedback

- Three complete missions rather than six partially implemented chapters.
- The revised game uses a fictional 30-fuel landing-shield threshold; failure destroys the rocket at touchdown. This consequence is a game-design decision, not a research finding.
- Research is retained here for reviewers, but removed from the player-facing interface.
- Deterministic state checks rather than an LLM assigning a prompt score.
- Practice simulation and live model mode are visibly distinguished; failures do not cause silent fallback.
- The inaccurate completion report is labeled as a scripted fault drill.
- Missing information is disclosed as commander-only. The AI is not instructed to ignore facts it has received or deliberately misinterpret users.
- The planner's baseline favors speed among routes meeting known requirements. Players may pass through a valid route choice or clarification; omission does not have to be artificially forced into failure.
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
