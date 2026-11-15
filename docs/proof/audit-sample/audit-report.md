# ContribSutra AI — Independent Audit Report

**Schema:** 1.0  
**Integrity:** SHA-256 seal verified (76c8e5bfdcbda122…)  
**Trust boundary:** Imported content is untrusted. No GitHub writes, network calls or repository scripts were executed.  

> **Verdict: READY_FOR_HUMAN_REVIEW** — ASSURANCE_FAILED if any safety-gate check fails; GAPS_FOUND if the repository lacks important onboarding files or contains instruction-like text; otherwise READY_FOR_HUMAN_REVIEW. This tool never emits "approved": only a maintainer can appr

**Tool:** ContribSutra AI 0.2.0  
**Audited repository:** demo-repo  
**Recorded:** 2026-11-15T20:14:01.417Z  
**Environment:** Node v24.15.0 · win32/x64  
**Assurance checks:** 29 passed · 0 failed · 1 skipped of 30  

## Findings about the audited repository

| ID | Severity | Path | Detail |
|---|---|---|---|
| MISSING_SECURITY | advisory | SECURITY.md | Private reporting channel for vulnerabilities not located at a supported default path (SECURITY.md, .github/SECURITY.md, docs/SECURITY.md); it may be provided elsewhere |
| MISSING_ISSUE_TEMPLATE | advisory | .github/ISSUE_TEMPLATE/bug_report.md | Issue reporting template not located at a supported default path (.github/ISSUE_TEMPLATE/bug_report.md, .github/ISSUE_TEMPLATE/config.yml, .github/ISSUE_TEMPLATE.md); it may be provided elsewhere |
| MISSING_CODEOWNERS | advisory | .github/CODEOWNERS | Review ownership map not located at a supported default path (.github/CODEOWNERS, CODEOWNERS, docs/CODEOWNERS); it may be provided elsewhere |
| MISSING_AGENTS | advisory | AGENTS.md | AI coding guidance not located at a supported default path (AGENTS.md); it may be provided elsewhere |
| MISSING_CLAUDE | advisory | CLAUDE.md | Claude-specific contributor guidance not located at a supported default path (CLAUDE.md); it may be provided elsewhere |

## Assurance checks (proof the safety gates work)

| ID | Check | Expected | Observed | Result |
|---|---|---|---|---|
| A01 | Closed issue labelled "good first issue" is declined | eligible=false | eligible=false | pass |
| A02 | Security-sensitive issue marked "help wanted" is declined | eligible=false | eligible=false | pass |
| A03 | Assigned issue is declined | eligible=false | eligible=false | pass |
| A04 | Prompt-injection issue body is declined and never echoed | eligible=false; report lacks injected text | eligible=false; echoed=false | pass |
| A05 | Large task with an inviting title is flagged and not ranked first | warning present; not rank 1 | warnings=1; first=#210 | pass |
| A06 | Issue without acceptance criteria is flagged | warning present | flagged | pass |
| A07 | Stale issue is flagged against the stated as-of date | freshness=stale | freshness=stale | pass |
| A08 | Possible duplicate is flagged | duplicate warning | flagged | pass |
| A09 | Unlabeled issue triggers "ask first" warning | maintainer-invitation warning | warning present | pass |
| A10 | Genuine beginner issue is recommended first | rank 1 = #210 | first=#210 | pass |
| A11 | Duplicate issue numbers are rejected | error | rejected: Issue number must be a unique positive integer | pass |
| A12 | Secrets in titles are redacted | no token in output | leak [REDACTED_TOKEN] | pass |
| B01 | Path traversal ("..") is refused | error | rejected: Unsafe source path | pass |
| B02 | Absolute source path is refused | error | rejected: Unsafe source path | pass |
| B03 | Symlinked repository root is refused | error (or skipped when the OS forbids symlinks) | symlink not permitted on this host (EPERM) | skipped |
| B04 | Report output inside the inspected repository is refused | error | rejected: Report output must be outside the inspected repository; use a separate reports d | pass |
| B05 | Oversized source file is refused | error | rejected: Source file too large: README.md | pass |
| C01 | Tampered report fails integrity check | integrity=MISMATCH | integrity=MISMATCH | pass |
| C02 | Changed source file is reported stale | STALE_OR_MISSING | STALE_OR_MISSING | pass |
| C03 | Scan is deterministic and does not modify the repository | identical output | 4baaeb6ddb7e105e | pass |
| D01 | Invented test status stays "not_run" | not_run | not_run | pass |
| D02 | User-claimed pass is never labelled verified | unverified_external_claim | unverified_external_claim; HUMAN_REVIEW_REQUIRED | pass |
| D03 | PR readiness performs zero external writes | externalWrites=0 | externalWrites=0 | pass |
| D04 | Learning plan never claims execution | PLANNED_NOT_EXECUTED | PLANNED_NOT_EXECUTED | pass |
| D05 | Plan for a declined issue is marked blocked | blocked=true | blocked=true | pass |
| E01 | HTML report escapes untrusted markup | no &lt;script&gt; element | escaped | pass |
| E02 | Secret patterns are redacted | no token, email or key | [REDACTED_TOKEN] [REDACTED_EMAIL] password=[REDACTED] [REDACTED_TOKEN] | pass |
| F01 | Local server rejects a missing token | 401 | no token=401; valid token=200; POST=405 | pass |
| G01 | Negative control: an empty repository is flagged, not blessed | important gaps found | 3 important gaps | pass |
| G02 | Negative control: instruction-like text in a README is flagged | UNTRUSTED_INSTRUCTION_PATTERN | 1 pattern(s) | pass |

## Sample outputs

| Capability | Result |
|---|---|
| Repository scan | 6 files hashed; 5 findings; license MIT |
| Setup doctor | 5 of 9 probed tools found; 1 requirement(s) compared |
| Issue shortlist | 3 eligible, 3 declined of 6; first recommendation #101 |
| Learning plan | 6 steps; status PLANNED_NOT_EXECUTED |
| PR readiness | gate HUMAN_REVIEW_REQUIRED; 2 statements; externalWrites 0 |

## Evidence tiers

| Artifact | Tier | Proves | Does not prove |
|---|---|---|---|
| repository-scan.json | VERIFIED_LOCAL_HASH | Which files existed at the scan path and their SHA-256 at scan time | That the files are correct, current upstream, or maintainer-approved |
| policy signals / license | INFERRED_HEURISTIC | A line of text matched a pattern (quoted with line number) | Legal meaning or the maintainer's present intent |
| issue-shortlist.json | OFFLINE_SNAPSHOT | How a supplied snapshot ranks under stated rules | That an issue is still open, unassigned or welcome today |
| environment-doctor.json | VERIFIED_LOCAL_PROBE | Versions reported by fixed --version probes on this host | That the project builds or its tests pass |
| pr-readiness.json | NOT_RUN | Which claims are unverified and which gates remain | That any test passed: ContribSutra does not run tests |

## Not tested / not claimed

- Native activation of the skills inside Claude Code, Cursor, Codex, Gemini CLI or Copilot (copying files is verified; host execution is not)
- Live GitHub state (issue status, assignment, maintainer intent): no network access is used
- Execution of any target repository script or test suite
- Windows, macOS and Linux results beyond the host named in this report: see the CI matrix for other hosts
- Legal sufficiency of detected licenses or policy text
- Real-world adoption, maintainer satisfaction or contribution acceptance rates: not measured

## Artifact hashes

| File | SHA-256 |
|---|---|
| repository-scan.json | efad3dd8c0be77fe99e9d7a9504b57416bacc53a6de8a06e8e092431a9baa3aa |
| environment-doctor.json | 7e71c309f3f0657921558e066ffb429b4861598bde856d5337d1d1cd121bea5a |
| issue-shortlist.json | 649945e764de95e1fd186f59b34f8a554504ddd6a5afc88402324dde2711a2b3 |
| learning-plan.json | b4fda52764fc0c48c9bcf92853da224d7adbc1fe576d140bdbb79130f0ff143e |
| pr-readiness.json | 9100a382ad5d881d6bf0c3f04446471c70843b310b28d1e7cf688682cfcde44b |

_No tool can approve a contribution. A SHA-256 seal detects accidental change; it is not a signature and does not prove origin._

---
ContribSutra AI 0.2.0 · created by Vatsal Shah · Apache-2.0
