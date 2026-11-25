# Assurance and evidence

> Written from an independent reviewer's viewpoint: what can you verify yourself, and what must you take on trust?

## What you can verify in ten minutes

```bash
git clone https://github.com/shahvatsalofficial/contribsutra-ai && cd contribsutra-ai
npm test                                  # runs the suite; no dependencies to install
node packages/cli/index.mjs audit --out /tmp/audit
sha256sum -c /tmp/audit/SHA256SUMS.txt    # on Linux; use Get-FileHash on Windows
npm pack --dry-run                        # exactly what would be published
npm ls --all                              # no dependencies
git grep -nE "fetch\(|https?\.request|net\.connect" packages     # only loopback requests in the audit check and tests
```

{{svg:audit}}

{{chart:assurance}}

## Evidence index

| Claim | Where to check |
|---|---|
| {{TESTS}} tests, {{PASS}} passed, {{FAIL}} failed, {{SKIPPED}} skipped on {{PLATFORM}}, Node {{NODE}} | `test-results/test-run.tap`, `test-results/environment.json` |
| {{FUZZ_ISSUES}} + {{FUZZ_DOCS}} hostile inputs, {{CRASHED}} unexpected crashes | `test-results/fuzz-results.json` |
| 30 adversarial checks with expected vs observed | `samples/audit/audit-report.html` |
| Negative controls detect problems | audit G01, G02 and the empty-repository audit test |
| CLI behavior and exit codes | `samples/cli-*.txt` (real transcripts) |
| Checksums of every proof file | `test-results/SHA256SUMS.txt` |
| Cross-platform results | GitHub Actions history of the repository (not asserted here) |
| Published package contents | `npm view contribsutra-ai` and the package page |

## Independence and its limits

The audit and the proof are produced by the same repository they assess. That is **self-assessment with reproducible evidence**. Independence comes from reproducibility: any reviewer can rerun and compare hashes. It does not replace an external security audit, an accessibility audit with assistive technology, or a legal review.

## Evidence we deliberately do not show

| Missing evidence | Reason |
|---|---|
| Adoption numbers, stars, downloads | Not measured; would be vanity |
| Testimonials and logos | None exist; none are invented |
| Acceptance rate of contributions made with the tool | Not measured |
| Native activation in Claude Code, Cursor, Codex, Gemini CLI, Copilot | Not yet verified; copying files is verified |
| Live GitHub behavior | The tool does not use the network |
| Results on macOS and Linux from this recording | See CI |

## Known limitations

Heuristic policy and license detection can be wrong. Issue scoring is a transparent heuristic, not a prediction. Secret redaction is best-effort. The seal is not a signature. A Windows host without symlink permission cannot execute four symlink tests locally.

## How a reviewer should read an audit report

1. Check the verdict and the number of failed and skipped checks.
2. Read each skipped check's reason.
3. Read "Not tested" and decide whether it matters for your use.
4. Compare `SHA256SUMS.txt` with your own run.
5. Treat the report as a statement about this tool on this host, not about your repository's quality.
