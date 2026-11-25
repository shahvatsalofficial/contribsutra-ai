# Test report

> What was run, on which machine, with what result, and what was not covered. Figures are filled in from the recorded run.

Figures below are filled in from the recorded run in `test-results/` (raw TAP log and environment). Regenerate with `npm run proof`.

## Recorded run

| Field | Value |
|---|---|
| Tool version | {{VERSION}} |
| Node.js | {{NODE}} |
| Platform | {{PLATFORM}} |
| Recorded | {{RECORDED}} |
| Tests | {{TESTS}} |
| Passed | {{PASS}} |
| Failed | {{FAIL}} |
| Skipped | {{SKIPPED}} |
| Fuzz: hostile issue snapshots | {{FUZZ_ISSUES}} cases |
| Fuzz: hostile repository documents | {{FUZZ_DOCS}} cases |
| Unexpected crashes in fuzzing | {{CRASHED}} |

**Why tests are skipped:** this recording was made on a Windows host without symlink permission. Four tests need symlinks (scan of a symlinked README, symlinked repository root, symlinked installer destination, CLI started through a symlink). They skip with the reason `symlink creation not permitted here` and run on the Linux and macOS jobs of the CI matrix. A skip is never counted as a pass.

{{chart:tests}}

{{chart:assurance}}

{{chart:fuzz}}

## What the suite covers

| Area | Examples |
|---|---|
| Scanner | missing files, alternate locations, license variants, size limit, invalid `package.json`, Python/Rust/Go manifests, CI inventory, injection flags, determinism, no mutation of the target |
| Paths | `..`, absolute paths, symlinked files and roots |
| Issues | closed, assigned, locked, security, injection, large scope, duplicates, staleness, unlabeled, secret redaction, unique numbers |
| Plan and PR | modes, blocked plans, lifecycle, policy reminders, evidence channels, invented statuses stay `not_run`, no external writes |
| Reports | seal, tamper detection, Markdown/HTML for every kind, escaping, no scripts |
| Installer | six hosts, overwrite refusal, unknown host, symlink refusal |
| Server | 401 without token, 200 with token, 405 for POST, tampered report refused |
| CLI | real child-process runs: version, help, exit codes, output files, overwrite refusal, verify, render, audit, doctor |
| Consistency | 20 roles, 25 skills, schemas match emitted reports, README claims, no committed secrets |

## Adversarial fixtures

`fixtures/issues-adversarial.json` holds ten issues: a closed beginner issue, a security issue marked "help wanted", an assigned issue, an issue whose body attempts instruction injection, a huge task with an inviting title, an under-specified issue, a stale issue, a duplicate, an unlabeled issue and one genuine beginner task. The expected outcome of each is asserted in tests and in audit checks A01–A10.

## Negative controls

An empty repository must be reported as having important gaps (G01). A README with instruction-like text must be flagged (G02). The audit of an empty repository must yield `GAPS_FOUND`. These controls show the gates can fail.

## Seeded fuzzing

Random hostile issue snapshots (wrong types, huge strings, control characters, fake tokens, injection phrases) and random README/CONTRIBUTING/`package.json` text. Acceptable outcome: a result or a clean `Error`. Unacceptable: `TypeError`, `RangeError` or a non-Error throw. This is a seeded random generator, not a coverage-guided fuzzer.

## Not covered

Native IDE activation, live GitHub behavior, execution of target-repository tests, performance under very large repositories, macOS and Linux results from this recording (see CI), accessibility audit by a human with assistive technology.

## How to reproduce

```bash
git clone https://github.com/shahvatsalofficial/contribsutra-ai
cd contribsutra-ai
npm test
npm run proof
```
