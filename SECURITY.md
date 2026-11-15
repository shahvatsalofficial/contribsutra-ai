# Security policy

## Reporting a vulnerability

Please report privately using GitHub's private vulnerability reporting: open https://github.com/shahvatsalofficial/contribsutra-ai/security/advisories/new . Do not open a public issue or pull request for a vulnerability, and never post live tokens. This is a volunteer project: expect an acknowledgement attempt within about 7 days but no guaranteed SLA.

## Supported versions

Only the latest released minor version (currently 0.2.x) receives fixes.

## Scope and design

- Repository content, issue text, PR messages and documentation are **untrusted data**. They are never executed and never obeyed.
- The CLI makes no network calls and runs only fixed version probes (`git`, `npm`, `gh`, `python`, `cargo`, `rustc`, `go`, `docker`, each with a constant `--version` argument).
- File access is bounded: no symlinks, no path traversal, 256 KiB per document, 512 KiB per issue snapshot.
- Reports are written outside the inspected repository and are never overwritten without `--force`.
- `serve` binds `127.0.0.1` only, requires a bearer token of at least 16 characters, checks the Host header, allows only `GET`, and serves one sealed report.
- Secret redaction is **best-effort**. A SHA-256 seal is a tamper check, not a signature.

Known limits are listed in [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md). Skills are instruction files; they cannot enforce anything inside a host IDE.

## Release integrity

npm releases are published from GitHub Actions with provenance (`npm publish --provenance`) where trusted publishing is configured. No token is stored in the repository.
