# Functional specification

> What each capability does, what it takes as input, what it produces and what it refuses to do. Every behaviour listed here has a test.

## Personas

| Persona | Goal | Primary commands |
|---|---|---|
| First-time contributor | Find a suitable issue and prepare a respectful PR | `scan`, `doctor`, `issues`, `plan`, `pr-check` |
| Mentor or educator | Give learners a safe, structured path | `plan --mode collaborative`, `audit` |
| Maintainer | See what newcomers see; reduce spam | `scan`, `audit` |
| Developer-relations / community lead | Run an onboarding event | `audit`, `install-skills` |

## Capabilities

### Repository scan (`scan`)
Input: a local directory you cloned. Reads README, CONTRIBUTING, LICENSE, conduct, security policy, PR and issue templates, CODEOWNERS, AGENTS.md, CLAUDE.md, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `.nvmrc`, `.python-version` and CI workflow files. Output: hashed artifacts, findings for missing items, a heuristic license name, policy signals (DCO, CLA, signed commits, AI-assistance, discuss-first, tests required, beginner-friendly) with `file:line`, documented commands (quoted, `documented_not_run`), declared runtime requirements and instruction-injection flags. A missing file is reported as "not located at a supported default path", never as "does not exist".

### Setup doctor (`doctor`)
Runs fixed `--version` probes for git, npm, gh, python, cargo, rustc, go and docker. With `--root` it compares the repository's declared requirements with installed tools and returns `satisfied`, `not_satisfied`, `tool_missing` or `cannot_determine`. It never guesses when a range is not understood.

{{svg:decline}}

### Issue shortlist (`issues`)
Input: a JSON array exported by you. The ranker adds points for maintainer labels (`good first issue`, `help wanted`, documentation) and declared skills, and **declines** closed, assigned, locked, restricted-label, security-sensitive and instruction-injected issues. It warns about large scope, missing acceptance criteria, possible duplicates, stale activity (with `--as-of`) and missing maintainer invitation. Every item carries its reasons and the note that state is not live-verified. Issue bodies are scanned but never copied into reports.

### Learning plan (`plan`)
Six steps (read guidance, understand scope, plan minimal change, change with review, validate, prepare draft PR). Modes: `guided` (hints), `collaborative` (discussion prompts), `self-directed` (acceptance checks only). Status is always `PLANNED_NOT_EXECUTED`. A declined issue yields a blocked plan with reasons. Policy reminders (DCO, CLA, AI policy, discuss-first) are quoted from the repository with line numbers.

### PR readiness (`pr-check`)
Takes the scan and an optional evidence file (test claims, changed files, AI-assistance declaration). Output: statements (`NOT_RUN`, `REVIEW`, `GAP`), a test table whose verification is always `unverified_external_claim`, four evidence channels, a checklist and a draft PR description that the author must rewrite. `externalWrites` is always 0.

### Verification and rendering (`verify`, `render`)
`verify` recomputes the SHA-256 seal and optionally re-hashes source files (`STALE_OR_MISSING` when they changed). `render` converts a sealed JSON report to Markdown or HTML and refuses a tampered one.

### Audit (`audit`)
Runs every capability on a bundled fixture or your repository, executes 30 adversarial checks against the real code, and writes HTML, Markdown and JSON with checksums. Verdicts: `READY_FOR_HUMAN_REVIEW`, `GAPS_FOUND`, `ASSURANCE_FAILED`.

### Skills (`install-skills`)
Copies 25 skill folders into the chosen host's project directory. It refuses unknown hosts, symlinked destinations and any overwrite.

### Local server (`serve`)
Optional `127.0.0.1` read-only endpoint for one sealed report, protected by a bearer token.

## Out of scope (by design)

Opening or commenting on issues and PRs, assigning work, cloning, running tests, generating patches, scoring people, storing contributor profiles.

## Acceptance criteria

| Requirement | Verified by |
|---|---|
| Declines closed, assigned, security and injected issues | audit A01–A04 |
| Never marks a user claim as verified | audit D01–D02 |
| Rejects traversal, oversize input, tampered reports | audit B01–B05, C01–C02 |
| Empty repository is not blessed | audit G01 and the negative-control test |
| Zero external writes | audit D03 |
