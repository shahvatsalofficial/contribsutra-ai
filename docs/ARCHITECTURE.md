# Architecture (v0.2)

## C4 context
Users are individual contributors and maintainers. The offline CLI inspects a user-selected local repository and an optional issue snapshot the user exported. It never submits changes. Network APIs, GitHub and IDE agents are outside the core trust boundary.

## Containers and modules
| Module | Responsibility |
|---|---|
| `packages/core/scan.mjs` | Bounded inventory: policies, license, manifests, CI workflows, policy signals, documented commands, injection flags, SHA-256 |
| `packages/core/doctor.mjs` | Fixed `--version` probes and declared-vs-installed requirement comparison |
| `packages/core/issues.mjs` | Snapshot loading and the transparent ranker with decline rules |
| `packages/core/plan.mjs` | Learning plan (3 modes, lifecycle) and PR readiness packet |
| `packages/core/verify.mjs` | Seal check and source freshness |
| `packages/core/audit.mjs` | Assurance checks, evidence tiers, verdict |
| `packages/core/install.mjs` | Project-local skill copying; refuses symlinks and overwrites |
| `packages/reporting/index.mjs` | One block model rendered to Markdown and HTML (escaped, no scripts) |
| `packages/server/index.mjs` | Localhost, bearer-token, read-only, single sealed report |
| `packages/cli/index.mjs` | Thin command layer, exit codes, output safety |

## Data flow
`local repo files` → bounded readers (`within`: no symlinks, no `..`, size cap) → heuristics → sealed JSON → Markdown/HTML renderers. Issue snapshot → ranker → sealed JSON. Nothing flows out except files you ask it to write, outside the inspected repository.

## Human-controlled lifecycle
`discovered → understood → shortlisted → approved_scope → planning → implementation_authorized → observed_tests → review_ready → submitted_by_human`. The tool stops at `planning`.

## Bounded behavior
No GitHub connector, model API call, code generation, autonomous execution, deployment or database. SHA-256 sealing is a checksum, not authentication. Test evidence produced by a user is never upgraded to verified.

## Future design (not implemented)
Connector SDK; policy engine; sandboxed job runner; read-only GitHub adapter; hosted API with OIDC and tenant RBAC; audit store; accessible dashboard. These must stay isolated from the offline core.
