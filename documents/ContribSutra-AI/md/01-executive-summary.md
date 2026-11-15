# Executive summary

ContribSutra AI helps a first-time open-source contributor become a respectful, capable contributor, and helps maintainers receive fewer, better, more reviewable contributions. Version {{VERSION}} is a working, offline command-line tool plus 25 portable agent skills.

## The problem

Beginners struggle to learn what a repository expects, whether their machine can run it, which issue is safe to pick and what "ready for review" means. Maintainers pay for that confusion with low-quality, duplicate and unwanted pull requests, now amplified by AI tools that generate changes at volume.

## The product

| Capability | What the user gets |
|---|---|
| Repository guide | Policies, license, toolchain, CI and contribution rules, each with `file:line` and a SHA-256 |
| Setup doctor | Which tools are installed and whether they satisfy the versions the repository declares |
| First-win radar | A ranked issue shortlist with reasons, and clear refusals for risky issues |
| Learning path | Six small steps with hints and acceptance checks, in three learning modes |
| PR ProofDesk | A review packet that separates verified, user-reported, inferred and not-run claims |
| Independent audit | An HTML, Markdown and JSON report with 30 adversarial checks and a negative control |

## Why it can be trusted

- **It cannot do harm:** no GitHub writes, no network, no execution of repository scripts. There is no code path that opens a pull request.
- **It does not exaggerate:** a test claim supplied by a person stays `unverified_external_claim`. The tool never emits "approved".
- **It shows its work:** the recorded run executed {{TESTS}} tests ({{PASS}} passed, {{FAIL}} failed, {{SKIPPED}} skipped on this host), plus {{FUZZ_ISSUES}} hostile issue snapshots and {{FUZZ_DOCS}} hostile document sets with {{CRASHED}} unexpected crashes.
- **It is honest about limits:** native activation of the skills in each IDE, live GitHub state and adoption outcomes are listed as not tested or not measured.

## Who it is for

First-time contributors, students and bootcamp graduates, engineers entering unfamiliar repositories, maintainers who want lower support burden, educators, developer-relations teams and organizations running onboarding events.

## Business and community value

Lower time to a first useful contribution without rewarding spam; less maintainer time spent on triage; reproducible onboarding material that can be reviewed by a person. No outcome metric (acceptance rate, retention, satisfaction) is claimed: none has been measured yet.

## Status at a glance

| Item | State |
|---|---|
| Version | {{VERSION}} |
| License | Apache-2.0 |
| Runtime dependencies | 0 |
| Network access | None in the CLI |
| Third-party certification | None. The audit is a reproducible self-assessment |
| Next milestone | Read-only GitHub adapter and git change summary (see roadmap) |
