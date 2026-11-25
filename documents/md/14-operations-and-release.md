# Operations and release

> How ContribSutra is built, tested, packaged and released, and the cross-platform problems that were found and fixed along the way.

## Runtime operations

ContribSutra is a command-line tool, not a service. There is nothing to deploy, monitor or back up. The optional `serve` command is a local convenience, not a hosted API: no SLA, no TLS, no users.

| Question | Answer |
|---|---|
| Logs | Errors go to stderr as one line prefixed `ContribSutra:`. No telemetry. |
| Diagnostics | `contribsutra doctor` and the audit's environment section |
| Rollback | `npm install contribsutra-ai@<previous version>`; reports are plain files |
| Data retention | None. Reports are files you create and delete |
| Upgrades | Reports carry `schemaVersion`; new fields are additive |

{{svg:ci}}

## Continuous integration

Workflow `.github/workflows/ci.yml` runs on every push and pull request:

| Job | What it does |
|---|---|
| `test` | `npm test`, `doctor`, `demo`, `audit` on Ubuntu (Node 22, 24, 26), Windows (Node 22, 24) and macOS (Node 24); uploads the audit report as an artifact |
| `package` | `npm pack`, installs the tarball in an empty project, runs the CLI through the real npm bin shim, runs an audit and a skill install |
| `secrets-scan` | Fails if a token-shaped string is committed |

Results are whatever the Actions history shows. This document does not assert them.

## Cross-platform notes learned the hard way

| Issue | Cause | Fix |
|---|---|---|
| `npx contribsutra` printed nothing | The entry check compared `argv[1]` with the module path; npm bins are symlinks | Compare `realpath` of both |
| `node --test tests/*.test.mjs` failed on Windows | `cmd.exe` does not expand globs on Node 20 | `scripts/run-tests.mjs` lists files itself |
| `npm` probe failed on Windows | `.cmd` shims cannot be spawned directly | Run through `cmd.exe /c` with constant arguments |
| Symlink tests failed with `EPERM` | Windows without Developer Mode | Tests skip honestly and run on Linux/macOS |

## Release procedure

1. `npm test` green; CI green on the commit.
2. `npm run proof`, `npm run audit`, then `node documents/ContribSutra-AI/build.mjs`.
3. Update `CHANGELOG.md`, `docs/STATUS.md`, version fields.
4. `npm pack --dry-run`: check contents.
5. Tag `vX.Y.Z`. The Release workflow publishes with provenance via trusted publishing; otherwise publish locally with 2FA.
6. Verify from an empty directory: `npx contribsutra-ai --version`.

## Package contents

`packages`, `skills`, `agents`, `.claude/agents`, `fixtures`, `schemas`, `rules`, `policies`, `workflows`, `docs`, `examples`, README, LICENSE, NOTICE, CHANGELOG, SECURITY, `llms.txt`. The `documents/` set lives in the repository, not in the npm package.

## Supply chain

Zero runtime and development dependencies. Actions are referenced by major version tag; pinning to commit SHAs is on the hardening backlog. No token is stored in the repository.
