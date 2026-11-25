# Changelog

## 0.2.2 — 2026-11-25
- **Documentation site rebuilt:** a real website at https://shahvatsalofficial.github.io/contribsutra-ai/ with a landing page, light theme by default plus a remembered dark toggle, responsive desktop and mobile layouts, search, and 15 pages.
- **Visuals:** 9 theme-aware diagrams (pipeline, lifecycle, trust boundaries, evidence channels, issue triage, audit, architecture, CI gate, skills), charts generated from real runs, and 9 step-by-step real-world scenario flowcharts.
- **New pages:** Overview, Quick start, Real-world scenarios, Architecture (diagram-led).
- **Fix:** the setup doctor could hang for minutes when a tool launcher spawned a child process (seen with the Windows Store python alias). Probe output now goes to a temporary file with a hard 10-second timeout per tool, and results are cached per run.
- **Tests:** documentation tests check link integrity, placeholders, diagram roles, light default and claim honesty.

## 0.2.1 — 2026-11-17
- **Runtime:** requires Node.js 22+ (Node 20 is end-of-life). CI matrix: Node 22, 24, 26 on Linux; 22 and 24 on Windows; 24 on macOS.
- **CI supply chain:** GitHub Actions pinned to commit SHAs of the latest majors (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2).
- **Docs site:** GitHub Pages workflow publishes the documentation set at https://shahvatsalofficial.github.io/contribsutra-ai/.
- **Fixes:** caret range (`^0.x`) matching in the setup doctor; simplified audit output writer.
- **Environment:** tests that need symlinks skip (never fail) on hosts that forbid them.

## 0.2.0 — 2026-11-16
- **Audit reports:** new `audit` command writes `audit-report.html`, `.md` and `.json` plus `SHA256SUMS.txt`: 30 adversarial safety checks with expected vs observed results, a negative control, evidence tiers and an explicit "not tested" list. All reports now render as real tables (not a `<pre>` dump) in Markdown and HTML.
- **Scanner:** alternate default locations, license detection, CODEOWNERS, CI workflow inventory, Python/Rust/Go manifests and version pins, `file:line` policy signals (DCO, CLA, AI-assistance, discuss-first), documented commands (quoted, never run), instruction-injection detection in repository docs.
- **Setup doctor:** probes git, npm, gh, python, cargo, rustc, go, docker; compares declared requirements with installed versions (`satisfied`, `not_satisfied`, `tool_missing`, `cannot_determine`).
- **Issues:** declines locked, security-sensitive, prompt-injection and closed/assigned issues; flags large scope, missing acceptance criteria, duplicates and staleness (`--as-of`).
- **Plan / PR:** learning modes, lifecycle state machine, policy reminders; PR packet with four evidence channels and a draft description; AI-assistance disclosure.
- **CLI:** `--version`, `--json`, `--quiet`, `--force`, `render`, `doctor --root`; stable exit codes; refuses to overwrite outputs.
- **Fixes:** the CLI did nothing when launched through an npm bin symlink (`npx`); the `npm` probe failed on Windows; symlink tests failed with EPERM on Windows (they now skip honestly); CI used a shell glob that `cmd.exe` does not expand (now a cross-platform runner); server hardened (Host check, security headers, connection caps).
- **Distribution:** published as `contribsutra-ai` (bins `contribsutra`, `contribsutra-ai`), `llms.txt`, `CITATION.cff`, `NOTICE`, legal/trust docs, complete `documents/` set.

## 0.1.0 — Starter
- Offline read-only repo scan, issue ranking, learning plan, PR readiness and environment doctor.
- Portable skills, Claude role definitions, docs, plugin catalog, CI configuration, security controls and tests.
