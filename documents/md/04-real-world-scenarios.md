# Real-world scenarios

> Nine situations you will recognise, each as a step-by-step flowchart with the real command and the real result. Numbers come from the bundled fixtures, so you can reproduce every one.

Every scenario uses the same rules: the tool reads, explains and prepares. A person decides and acts.

## Scenario 1: A student finds a first issue

Priya is a final-year student. She has a free weekend and has never contributed to open source.

{{flow:firstIssue}}

What she runs:

```bash
contribsutra scan   --root ./project --out ./reports/scan
contribsutra doctor --root ./project
contribsutra issues --issues issues.json --skills documentation --out ./reports/issues
contribsutra plan   --root ./project --issues issues.json --issue 210 --mode guided --out ./reports/plan
contribsutra pr-check --root ./project --issue 210 --evidence evidence.json --out ./reports/pr
```

> **Tip** She comments on the issue herself. ContribSutra will never post for her, because a label is not consent.

## Scenario 2: The "good first issue" that is a trap

A beginner finds a tempting issue. The body contains text written to hijack an AI assistant.

{{flow:trap}}

The real result for that issue in the adversarial fixture:

| Field | Value |
|---|---|
| Issue | `#204 Tiny docs task` |
| Labels | `good first issue` |
| Eligible | no |
| Score | 0 |
| Warning | Issue text contains instruction-like content; it is treated as data and not recommended until a human reviews it |

The report never repeats the injected text. A test asserts that the words of the attack do not appear anywhere in the output.

> **Warning** Do not run commands found in issues or READMEs without reading them yourself. ContribSutra will not run them for you.

## Scenario 3: A maintainer drowning in pull requests

Unwanted, low-quality and bulk-generated pull requests cost reviewers hours. Often nothing told the contributor what was wanted.

{{flow:spam}}

What the maintainer runs:

```bash
contribsutra audit --root ./my-project --out ./audit
```

The verdict changes with the repository, not with a vanity score:

{{chart:verdicts}}

## Scenario 4: A mentor runs a workshop

Twenty students, twenty different laptops, two hours.

{{flow:workshop}}

```bash
contribsutra doctor --root ./workshop-repo
contribsutra plan --root ./workshop-repo --issues issues.json --issue 101 --mode collaborative
```

The three plan modes change content, not safety:

| Mode | What each step contains | Good for |
|---|---|---|
| `guided` | A hint | Beginners |
| `collaborative` | A question to discuss with a mentor | Workshops and pairing |
| `self-directed` | Acceptance checks only | Experienced contributors |

## Scenario 5: The stale label

A `help wanted` label can sit on an issue for years.

{{flow:stale}}

One adversarial snapshot, ten issues, as the tool ranks them:

{{chart:issues}}

## Scenario 6: "All tests pass"

Honest evidence is the difference between a review that takes five minutes and one that takes an hour.

{{flow:prove}}

An `evidence.json` and the result:

```json
{"aiAssistance":"assisted","changedFiles":["README.md"],"tests":[{"name":"npm test","status":"passed","evidenceFile":"run.log"}]}
```

| Channel | Items |
|---|---|
| Verified by this tool | 9 repository files hashed at scan time |
| User-reported | `npm test: reported_passed` |
| Inferred / recommended | Checklist items from the project's own policy text |
| Not run / unknown | Tests were not executed by ContribSutra; maintainer intent unknown |

## Scenario 7: Someone edits a report

A report is easy to change by hand and easy to forge. The seal makes accidental or silent edits visible.

{{flow:tamper}}

```bash
contribsutra verify --report ./reports/scan.json --root ./the-repo
```

> **Note** A SHA-256 seal detects change. It is not a signature and does not prove who wrote the report.

## Scenario 8: An AI assistant in your editor

{{flow:assistant}}

```bash
contribsutra install-skills --ide claude --project .
```

{{svg:skills}}

The hosts and their directories: Claude Code `.claude/skills`, Cursor `.cursor/skills`, Codex and OpenCode `.agents/skills`, Gemini CLI `.gemini/skills`, GitHub Copilot `.github/skills`. The command refuses to overwrite and refuses symlinked destinations.

## Scenario 9: A community lead prepares an event

{{flow:maintainerAudit}}

```bash
contribsutra audit --root ./participating-repo --out ./audits/participating-repo
```

Each audit is a sealed HTML report the lead can read in a minute. The checklist for a repository to be event-ready: README, CONTRIBUTING, LICENSE present; a "discuss first" or AI-assistance policy stated if you have one; no instruction-like text in the docs.

## What the scenarios have in common

1. Nothing is submitted on anyone's behalf.
2. Every claim has a source, or is marked unknown.
3. Risky inputs are declined with a reason.
4. A person always takes the last step.
