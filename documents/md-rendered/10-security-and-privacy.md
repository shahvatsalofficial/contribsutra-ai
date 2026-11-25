# Security and privacy

> ContribSutra reads other people's text, so the security model assumes that text is hostile. Threats, controls, evidence and residual risks.

{{svg:trust}}

## Principles

1. Repository files, issue text and tool output are **data**, never instructions.
2. Read-only by default. There is no code path that writes to GitHub or runs a repository script.
3. Fail closed on ambiguity: unknown statuses become `not_run`, unknown ranges become `cannot_determine`.
4. Least privilege: fixed probe binaries with constant arguments; a localhost server with a token.

## Threats and controls

| Threat | Control | Evidence |
|---|---|---|
| Prompt injection in issues or docs | Detected, flagged, declined or labelled; never echoed into reports | audit A04, G02 |
| Malicious README commands | Quoted as `documented_not_run`; never executed | scan tests |
| Path traversal and absolute paths | Rejected before any read | audit B01, B02 |
| Symlink escape | `lstat` + `realpath` containment; symlinked roots and destinations refused | core tests (run on Linux/macOS CI) |
| Oversized input | Hard caps on document, snapshot and report sizes | audit B05 |
| Report tampering | SHA-256 seal; `verify` and `render` refuse mismatches | audit C01 |
| Stale evidence | `verify --root` re-hashes sources | audit C02 |
| Secret leakage | Heuristic redaction of tokens, keys, emails, URL credentials | audit E02 |
| XSS in HTML reports | Escaping everywhere, no script elements, CSP on the server | audit E01 |
| Local server abuse | `127.0.0.1`, token ≥ 16 chars, constant-time compare, Host check, GET only, connection cap | audit F01 |
| Invented test success | Claims never upgraded to verified | audit D01–D03 |
| PR flooding | No write path; lifecycle stops at `planning` | audit D03, D04 |

## Privacy

No telemetry, accounts, cookies or network calls. Reports contain relative paths, hashes and redacted short excerpts. Issue bodies are scanned and discarded. The doctor report contains tool versions and the Node/OS facts shown in the report, not environment variables or home paths. Review any report before sharing it: redaction is heuristic.

## What the seal is not

A SHA-256 seal detects accidental change. It is not a digital signature, does not identify the author and does not prove a maintainer approved anything. Signing is on the roadmap.

## Residual risks

Heuristic secret detection can miss secrets. `PATH` determines which `git` or `node` runs. A snapshot can be stale or malicious. Skills cannot enforce rules inside a host IDE. Windows without symlink rights cannot run the symlink tests locally (they skip and are reported as skipped).

## Reporting vulnerabilities

Use GitHub private vulnerability reporting for the repository. Do not open public issues for vulnerabilities and never post live tokens.

## Hardening backlog

Signed reports and releases, SBOM, nested-secret redaction improvements, structured consent logs, OS-specific path tests, optional sandbox for future test execution.
