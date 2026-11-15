# Threat model

**Assets:** local source files, tokens, private contribution plans, maintainer time and reputation, issue metadata, report integrity.

**Attackers and abuse:** malicious issue text (prompt injection), untrusted README shell commands, rogue skills or plugins, spoofed CI claims, stolen tokens, symlinks escaping the scoped repository, mass AI pull-request flooding.

| Threat | Control (implemented) | Test |
|---|---|---|
| Prompt injection in issue or README text | Text is data; instruction-like patterns are detected, flagged and never echoed | audit A04, G02; features tests |
| Malicious README commands | Commands are quoted, labelled `documented_not_run`; no repository script is executed | scan tests |
| Path traversal / absolute paths | `within()` rejects `..` and absolute paths | audit B01, B02 |
| Symlink escape | `lstat` + `realpath`; symlinked root, files and install targets refused | core tests (skip on hosts without symlinks) |
| Oversized input | 256 KiB per document, 512 KiB / 250 issues per snapshot, 8 MiB per report | audit B05 |
| Tampered report | SHA-256 seal; `verify` and `render` refuse mismatches | audit C01 |
| Stale evidence | Source hashes re-checked by `verify --root` | audit C02 |
| Secret leakage in reports | Heuristic redaction (tokens, keys, emails, credentials in URLs) | audit E02 |
| Stored XSS in HTML reports | Everything escaped; no script elements; report served with CSP | audit E01 |
| Local server abuse | `127.0.0.1` only, bearer token ≥ 16 chars, constant-time compare, Host check, GET only, connection cap | audit F01; server tests |
| Invented test success | Claims stay `unverified_external_claim`; unknown statuses become `not_run` | audit D01–D03 |
| PR spam | No write path exists; lifecycle stops at `planning`; maintainer-consent warnings | audit D03, D04 |

**Known residual risks:** secret detectors are heuristic; SHA-256 is an unauthenticated checksum (no signing yet); `PATH` resolves the probe binaries (a poisoned PATH can change what runs); time-of-check/time-of-use gaps exist between reading and installing; an issue snapshot can be stale or malicious; skills are text and cannot enforce anything inside a host IDE; a Windows host without symlink rights cannot exercise symlink tests locally.

Never use the tool to obtain privileged repository access, evade contribution policies, or run unattended bot submissions.
