# Audit reports (HTML + Markdown + JSON)

```bash
contribsutra audit --out ./contribsutra-audit [--root ./repo] [--issues ./issues.json]
```

| File | Purpose |
|---|---|
| `audit-report.html` | Human-readable, self-contained (no scripts, fonts or trackers), responsive, light/dark, printable. Share this. |
| `audit-report.md` | Same content for PRs, wikis and chat. |
| `audit-report.json` | Machine-readable, SHA-256 sealed (`contribsutra verify --report`). |
| `repository-scan.json`, `environment-doctor.json`, `issue-shortlist.json`, `learning-plan.json`, `pr-readiness.json` | Underlying sealed artifacts. |
| `SHA256SUMS.txt` | Checksums of every file written. |

## Sections
1. **Verdict:** `ASSURANCE_FAILED` (a safety check failed), `GAPS_FOUND` (important onboarding files missing or instruction-like text present) or `READY_FOR_HUMAN_REVIEW`. The tool never emits "approved".
2. **Findings** about the audited repository, each with a stable ID and path.
3. **Assurance checks:** 30 adversarial checks (declined issues, injection, path traversal, tamper detection, secret redaction, server authentication, negative controls). Each shows *expected* and *observed*.
4. **Sample outputs** of every capability.
5. **Evidence tiers:** what each artifact proves and does not prove.
6. **Not tested:** native IDE activation, live GitHub state, target-repository tests, other operating systems, adoption.
7. **Artifact hashes.**

A check marked `skipped` means the host could not perform it (for example symlink creation on Windows without Developer Mode). It is never counted as passed.

Exit code `1` when the verdict is `ASSURANCE_FAILED`, which makes `audit` usable as a CI gate:

```yaml
- run: npx contribsutra-ai audit --out audit
```

A sample produced by the real tool: `docs/proof/audit-sample/`.
