# Architecture

> ContribSutra is a small, dependency-free Node.js program built around one idea: read-only evidence in, sealed reports out, a human decides.

## System at a glance

{{svg:arch}}

The CLI and the optional loopback server are thin layers. Everything of substance lives in the core modules, which never depend on the CLI. All reports share one block model, so Markdown and HTML cannot disagree.

| Module | Responsibility |
|---|---|
| `scan` | Inventory, license heuristic, policy signals, manifests, CI list, injection flags, SHA-256 |
| `doctor` | Fixed version probes, range matcher, declared-versus-installed comparison |
| `issues` | Snapshot loading, decline rules, transparent scoring, warnings |
| `plan` | Learning plan, lifecycle, PR packet |
| `verify` | Seal check and source freshness |
| `audit` | Adversarial checks, evidence tiers, verdict |
| `install` | Project-local skill copying that refuses symlinks and overwrites |
| `reporting` | One block model rendered to Markdown and HTML, escaped, no scripts |
| `server` | Loopback, bearer token, read-only, one sealed report |
| `cli` | Argument parsing, exit codes, safe output writing |

## Trust boundaries

{{svg:trust}}

Repository text, issue text and tool output are **data**. They are read within size limits, never executed and never obeyed. Output goes only to files you name, outside the inspected repository, and never overwrites without `--force`.

## The lifecycle: who may do what

{{svg:lifecycle}}

ContribSutra can place an issue at `shortlisted` or `planning`. Every later transition is a person's decision, so there is no automatic path from a recommendation to an account write.

## How an issue is judged

{{svg:decline}}

{{chart:issues}}

Scores are additive and explainable: `good first issue` +50, `help wanted` +20, documentation +8, a declared skill matching a label +12 or appearing in the title +6, large scope −25, stale −10. A declined issue scores 0 whatever its labels say.

## Evidence channels

{{svg:evidence}}

## How the audit works

{{svg:audit}}

{{chart:assurance}}

## CI gate

{{svg:ci}}

```yaml
- run: npx contribsutra-ai audit --out audit
```

Exit code 1 means a safety check failed. Gaps in the audited repository give `GAPS_FOUND` but do not fail the build: they are findings, not defects of the tool.

## Skills

{{svg:skills}}

A `SKILL.md` is a text file a host agent may follow. It cannot enforce anything. Enforcement lives in the CLI. Copying skills is tested; whether each IDE activates them is **not verified**.

## Data model

All reports share `schemaVersion` ("1.0"), `kind` (`contribsutra.*`), semantic fields and `seal {method, hash}`. The seal is the SHA-256 of the JSON serialization of every preceding field. Schemas are in `schemas/` and a test asserts every emitted report carries the fields its schema requires.

## Design decisions

| Decision | Reason |
|---|---|
| Zero dependencies | Nothing in the supply chain to audit or compromise; installs in seconds |
| Offline only | No consent problem, no rate limits, no tokens to leak |
| Heuristics are labelled | A regex match is `pattern_match_inferred`, never "verified" |
| Reports are data first | One block model feeds both renderers |
| Skills are text | Enforcement lives in code, not in prompts |
| `argv[1]` resolved with `realpath` | npm bin shims are symlinks; a naive check made the CLI silently do nothing under `npx` |
| `npm` probe on Windows via `cmd.exe` with constant arguments | Node refuses to spawn `.cmd` files directly; no user input reaches the command line |

## Deployment modes

| Mode | Status |
|---|---|
| Solo offline CLI | Supported |
| Assisted IDE mode with copied skills | Copy supported; activation not verified |
| Local-only report server | Supported, not a public service |
| Authenticated multi-tenant hosting | Future; needs OIDC, RBAC, TLS, audit logs and a new threat model |
