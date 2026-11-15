# Proof of the recorded run

Regenerate: `npm run proof`. These files are machine output, not hand-written.

| Field | Value |
|---|---|
| Tool | contribsutra-ai 0.2.0 |
| Node / platform | v24.15.0 · win32/x64 |
| Recorded | 2026-11-15T20:13:41.044Z |
| Tests | 104 |
| Passed | 100 |
| Failed | 0 |
| Skipped | 4 (symlink tests skip on hosts that forbid symlinks; they run on Linux/macOS CI) |
| Fuzz: issue snapshots | 3000 cases, 0 unexpected crashes |
| Fuzz: repository documents | 300 cases, 0 unexpected crashes |
| Audit sample exit code | 0 |

Files: `test-run.tap`, `environment.json`, `fuzz-results.json`, `cli-*.txt`, `audit-sample/` (real JSON + MD + HTML audit), `SHA256SUMS.txt`.

**Limits:** one machine, one run. It shows the software behaves as documented on that host. It does not show results on other operating systems (see the GitHub Actions matrix), native IDE execution, or real-world adoption.
