# Architecture

ContribSutra is a small, dependency-free Node.js program organized around one idea: **read-only evidence in, sealed reports out, a human decides**.

## System context

```text
 contributor / maintainer
        |  chooses a local repo + (optionally) an exported issue snapshot
        v
 +-------------------------- contribsutra CLI --------------------------+
 |  bounded readers -> heuristics -> sealed JSON -> Markdown / HTML     |
 +----------------------------------------------------------------------+
        |  writes only files you name, outside the inspected repo
        v
 reports/  (json + md + html)       skills copied into .claude/skills etc.
```

Outside the trust boundary: GitHub, any IDE agent, the inspected repository's text, issue text.

## Modules

| Module | Responsibility |
|---|---|
| `scan.mjs` | Inventory, license heuristic, policy signals, manifests, CI list, injection flags |
| `doctor.mjs` | Fixed version probes, range matcher, requirement comparison |
| `issues.mjs` | Snapshot loading, decline rules, scoring, warnings |
| `plan.mjs` | Learning plan, lifecycle, PR packet |
| `verify.mjs` | Seal and source freshness checks |
| `audit.mjs` | 30 assurance checks, evidence tiers, verdict |
| `install.mjs` | Project-local skill copying |
| `reporting/index.mjs` | One block model, two renderers (Markdown, HTML) |
| `server/index.mjs` | Localhost sealed-report endpoint |
| `cli/index.mjs` | Argument parsing, exit codes, safe output writing |

## Bounded contexts

Repository Knowledge (scan), Contribution Policy (policy signals), Toolchain and Environment (doctor), Opportunity Discovery (issues), Learning Path (plan), Evidence and Tests (PR packet, verify), Maintainer Consent (decline rules, warnings), Integrations (future), Governance (rules, policies), Reporting (renderers).

## Human-controlled lifecycle

`discovered → understood → shortlisted → approved_scope → planning → implementation_authorized → observed_tests → review_ready → submitted_by_human`

The tool can place an issue at `shortlisted` or `planning`. Every other transition requires a person, so there is no automatic path from a recommendation to an account write.

## Data model

All reports share: `schemaVersion` ("1.0"), `kind` (`contribsutra.*`), semantic fields, `seal {method, hash}`. The seal is the SHA-256 of the JSON serialization of all preceding fields. Schemas live in `schemas/`.

## Key design decisions

| Decision | Reason |
|---|---|
| Zero dependencies | Nothing to audit or compromise in the supply chain; installs in seconds |
| Offline only | No consent problem, no rate limits, no tokens to leak |
| Heuristics are labelled | A regex match is `pattern_match_inferred`, never "verified" |
| Reports are data first | One block model feeds Markdown and HTML so they cannot disagree |
| Skills are text | A `SKILL.md` cannot enforce anything; enforcement lives in the CLI |
| `argv[1]` is resolved with `realpath` | npm bin shims are symlinks; a naive entry check made the CLI silently do nothing under `npx` |
| `npm` probe on Windows via `cmd.exe` with constant arguments | Node refuses to spawn `.cmd` files directly; no user input reaches the command line |

## Deployment modes

Solo offline CLI (supported). Assisted IDE mode with copied skills (copy supported; activation not verified). Local-only report server (supported, not a public service). Authenticated multi-tenant hosting (future; requires OIDC, RBAC, TLS, audit logs and a new threat model).
