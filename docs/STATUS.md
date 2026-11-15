# Implementation status — ContribSutra AI 0.2.0

| Capability | Source | Test | Status |
|---|---|---|---|
| Repository scan (policies, license, manifests, CI, signals, injection flags) | `packages/core/scan.mjs` | `tests/core.test.mjs`, `tests/features.test.mjs` | Implemented, tested |
| Setup doctor + requirement comparison | `packages/core/doctor.mjs` | `tests/features.test.mjs` | Implemented, tested |
| Issue shortlist with decline rules | `packages/core/issues.mjs` | adversarial fixtures | Implemented, tested |
| Learning plan (3 modes, lifecycle) | `packages/core/plan.mjs` | `tests/features.test.mjs` | Implemented, tested |
| PR readiness packet | `packages/core/plan.mjs` | `tests/features.test.mjs` | Implemented, tested |
| Report verify / render | `packages/core/verify.mjs`, `packages/reporting` | CLI tests | Implemented, tested |
| Audit pack (HTML + MD + JSON) | `packages/core/audit.mjs` | `tests/features.test.mjs` | Implemented, tested |
| Skill installer (6 hosts) | `packages/core/install.mjs` | `tests/core.test.mjs` | Copy implemented and tested; **host activation not verified** |
| Localhost report server | `packages/server/index.mjs` | `tests/core.test.mjs` | Implemented, tested |

**Instruction-only:** 20 specialist agents, 25 portable skills, 8 workflow specifications, 10 rules. They are text for a host agent; they are not independent AI processes.

**Planned, not implemented:** GitHub read-only API connector, live issue freshness, clone/fork actions, sandboxed repository test execution, patch analysis, Dev Containers support, OIDC/RBAC server, accessible web dashboard, native skill-activation proof across IDEs, draft-PR writes.

**Cross-platform:** results are whatever the GitHub Actions matrix shows for the commit. The recorded local run is in `docs/proof/`. Symlink tests skip on hosts that forbid symlinks and execute on Linux/macOS CI.

**Release claim:** published only when the npm registry and GitHub show it; see `CHANGELOG.md`.
