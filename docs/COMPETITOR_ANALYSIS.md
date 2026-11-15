# Positioning and adjacent products

*Written 2026-11-16 from general public knowledge of these product categories. External pages were **not** fetched or measured for this document; star counts, usage and feature lists are deliberately omitted. Verify any specific claim at the source before relying on it.*

| Category (examples) | What it solves | Where ContribSutra differs | Uncertainty |
|---|---|---|---|
| Issue discovery sites and curated lists ("up for grabs" style projects, GitHub's own `good first issue` search) | Finding labelled issues | Explains *why* an issue is or is not suitable, declines stale, assigned, security and injected issues, works offline on a snapshot you control | Feature sets change; labels reflect maintainers' choices |
| GitHub-native tooling (GitHub CLI, Copilot, community health files) | Live data, code assistance, hosting | ContribSutra is deliberately offline and read-only; it complements `gh` instead of replacing it | Copilot capabilities evolve quickly |
| Contribution-automation agents (tools that generate patches or PRs) | Producing PRs | Opposite stance: teaches, drafts a packet, never submits; refuses to be a PR-volume engine | Not all such tools behave alike |
| Triage assistants for maintainers | Labeling and routing issues | Contributor-side onboarding plus maintainer-side `audit` of what newcomers can see | Overlap exists on the maintainer side |
| Generic code-explainer agents | Explaining code | Adds policy extraction, evidence separation and anti-spam gates | n/a |

**Already solved elsewhere (so we integrate rather than duplicate):** live issue search, code review suggestions, CI, dependency updates, secret scanning. The roadmap lists optional read-only integrations with `gh`, Gitleaks, OSV-Scanner and actionlint; none are integrated yet.

**Independently demonstrable advantages today:** every claim carries `file:line` and a hash; test claims cannot be upgraded to "verified"; hostile issue text is flagged instead of obeyed; reports are portable HTML/MD/JSON with a negative control. You can check these by running `contribsutra audit`.

**Not claimed:** better acceptance rates, faster onboarding, adoption, or superiority in any benchmark. None were measured.
