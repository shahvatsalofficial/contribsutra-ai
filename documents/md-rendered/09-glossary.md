# Glossary

> Plain-language definitions of every term used in the reports and documentation.

| Term | Meaning |
|---|---|
| Agent skill (`SKILL.md`) | A text file with instructions an AI coding assistant may follow. It is not a program and cannot enforce anything |
| `AGENTS.md` | A convention for repository-level instructions to coding agents |
| Audit pack | The HTML, Markdown and JSON output of `contribsutra audit` plus `SHA256SUMS.txt` |
| Assurance check | One adversarial test run by the audit against the real code, with expected and observed results |
| CLA | Contributor License Agreement: a legal agreement some projects require before merging |
| DCO | Developer Certificate of Origin: a `Signed-off-by` line on commits |
| CODEOWNERS | A file mapping paths to the people who must review them |
| Decline rule | A condition that makes an issue ineligible (closed, assigned, locked, security-like, injected) |
| Documented command | A command quoted from a README or CONTRIBUTING code block. Never executed |
| Evidence channel | One of verified, user-reported, inferred/recommended, not-run/unknown |
| Evidence tier | A label in the audit saying how strong a piece of evidence is |
| Fixture | A small synthetic repository or issue file used by tests |
| Good first issue | A label some maintainers use for beginner-friendly work. A label is not consent |
| Heuristic | A rule of thumb that can be wrong. Reported as inferred |
| Instruction injection | Text that tries to give commands to an AI agent reading it |
| Lifecycle | The ordered states from `discovered` to `submitted_by_human`. The tool stops at `planning` |
| Negative control | A test input that must be flagged, proving the checks can fail |
| Policy signal | A text match about DCO, CLA, AI policy and similar, quoted with `file:line` |
| PR packet | The `pr-check` output: statements, claims, channels, checklist and draft description |
| Seal | SHA-256 over the JSON of a report. Detects accidental change. Not a signature |
| Snapshot | A JSON file of issues that you exported. It is a photograph, not live data |
| Skipped test | A test the host could not run. Not a pass |
| Trust boundary | The line between what the tool controls and untrusted content |
| Untrusted data | Everything read from a repository or issue |
| Verdict | `READY_FOR_HUMAN_REVIEW`, `GAPS_FOUND` or `ASSURANCE_FAILED`. Never "approved" |
