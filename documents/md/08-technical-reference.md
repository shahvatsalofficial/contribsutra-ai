# Technical reference

> Install, commands, options, input formats, scoring, limits and the local server. Everything you need to script or integrate ContribSutra.

## Requirements and install

Node.js 22 or newer. No other dependency.

```bash
npx contribsutra-ai --version
npm install --save-dev contribsutra-ai      # optional local install
```

Binaries: `contribsutra` and `contribsutra-ai` (identical).

## Commands

| Command | Required options | Optional | Output |
|---|---|---|---|
| `doctor` | none | `--root DIR` | `contribsutra.environment-doctor` |
| `scan` | `--root DIR` | `--out FILE` | `contribsutra.repository-scan` |
| `issues` | `--issues FILE` | `--skills a,b` `--as-of ISO` `--out FILE` | `contribsutra.issue-shortlist` |
| `plan` | `--root` `--issues` `--issue N` | `--mode` `--skills` `--as-of` `--out` | `contribsutra.learning-plan` |
| `pr-check` | `--root DIR` | `--issue N` `--evidence FILE` `--out FILE` | `contribsutra.pr-readiness` |
| `verify` | `--report FILE` | `--root DIR` | JSON verdict on stdout |
| `render` | `--report` `--out` | `--format md|html` | one file |
| `audit` | `--out DIR` | `--root DIR` `--issues FILE` | HTML + MD + JSON + artifacts + checksums |
| `install-skills` | `--ide` `--project DIR` | | JSON summary |
| `serve` | `--report FILE` | `--port N` | local HTTP endpoint |
| `demo` | none | | regenerates `examples/reports/` |

Global flags: `--json`, `--quiet`, `--force`, `-h`/`--help`, `-v`/`--version`.

`--out` takes a stem. `--out reports/scan.json` writes `scan.json`, `scan.md` and `scan.html`. Output must be outside the inspected repository. Existing files are not overwritten without `--force`.

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | `verify` failed, or `audit` verdict is `ASSURANCE_FAILED` |
| 2 | Usage, input or runtime error |

## Input formats

Issue snapshot: a JSON array (maximum 250 items, 512 KiB). Fields used: `number`, `title`, `state`, `labels` (strings or `{name}`), `assignee`, `assignees`, `locked`, `pull_request`, `body`, `updated_at` (or `updatedAt`).

Evidence file for `pr-check`:

```json
{"aiAssistance":"assisted","changedFiles":["README.md"],"tests":[{"name":"npm test","status":"passed","evidenceFile":"run.log"}]}
```

`aiAssistance` is `none`, `assisted` or `generated`. Any other value counts as undeclared.

## Scoring (issues)

| Signal | Effect |
|---|---|
| `good first issue` label | +50 |
| `help wanted` label | +20 |
| `documentation` or `docs` label | +8 |
| Declared skill equals a label | +12 |
| Declared skill appears in title | +6 |
| Large-scope label or title | −25 (floor 0) |
| Stale beyond 180 days (needs `--as-of`) | −10 |
| Any decline rule | score 0, `eligible: false` |

Decline rules: not open, pull request, assigned, locked, restricted label (`security`, `private`, `blocked`, `wontfix`, `invalid`, `needs-triage`, `duplicate`), security-like title, instruction-like text. Ties are broken by issue number, so output is deterministic.

## Limits

| Limit | Value |
|---|---|
| Document size | 256 KiB each |
| Issue snapshot | 512 KiB, 250 items |
| Report read | 8 MiB |
| Documented commands | 40 |
| Policy excerpt | 140 characters |
| Probe timeout | 10 s each |

## Programmatic use

The packages are ES modules: `scanRepository`, `environmentDoctor`, `rankIssues`, `createLearningPlan`, `checkPullRequest`, `verifyReport`, `runAudit`, `renderMarkdown`, `renderHtml`. Import from `contribsutra-ai/packages/...`. The public contract is the JSON in `schemas/`; internal function signatures may change between minor versions.

## Local server

```bash
CONTRIBSUTRA_SERVER_TOKEN=<at least 16 characters> contribsutra serve --report reports/scan.json
curl -H "Authorization: Bearer $CONTRIBSUTRA_SERVER_TOKEN" http://127.0.0.1:PORT/report
```

Routes: `GET /health` (no auth), `GET /report`, `GET /report.html`. Everything else is 404/405. Wrong Host header returns 421.
