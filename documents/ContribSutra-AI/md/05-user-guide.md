# User guide

A walk-through for a first-time contributor. Each step produces something you can read and share.

## 1. Install check

```bash
npx contribsutra-ai --version
```

You need Node.js 20 or newer. Nothing else is installed and no account is needed.

## 2. See the tool's own proof

```bash
npx contribsutra-ai audit --out ./contribsutra-audit
```

Open `contribsutra-audit/audit-report.html`. The verdict and the table of 30 checks show how the tool behaves on hostile input. Start here if you want to decide whether to trust it.

## 3. Understand a repository

Clone the project yourself, then:

```bash
npx contribsutra-ai scan --root ./the-repo --out ./reports/scan
```

Read `reports/scan.html`. Look at: which files exist, the license, policy signals (DCO, CLA, AI policy, "discuss first"), the documented commands and any "instruction-like text" finding. Missing files may exist in a place the tool does not check: read the project yourself before concluding.

## 4. Check your machine

```bash
npx contribsutra-ai doctor --root ./the-repo
```

`not_satisfied` means the installed version does not match what the project declares. Follow the project's own instructions to fix it. `cannot_determine` means the version range was in a format the tool will not guess.

## 5. Choose an issue

Export open issues with the official GitHub CLI (this is your account, your choice):

```bash
gh issue list --repo OWNER/REPO --state open --limit 100 --json number,title,state,labels,assignees,updatedAt,body > issues.json
npx contribsutra-ai issues --issues issues.json --skills docs,javascript --as-of 2026-11-16T00:00:00Z --out ./reports/issues
```

Read the reasons and the cautions. An issue marked `eligible: no` was declined for a stated reason. An eligible issue with "Maintainer invitation is not evidenced" still needs a polite question first. A label is not consent.

## 6. Ask before you start

Comment on the issue yourself, in your own words, to say you would like to work on it and confirm it is still wanted. ContribSutra will not do this for you.

## 7. Make a learning plan

```bash
npx contribsutra-ai plan --root ./the-repo --issues issues.json --issue 101 --mode guided --out ./reports/plan
```

Modes: `guided` (hints), `collaborative` (questions to discuss with a mentor), `self-directed` (acceptance checks only). Do the steps yourself. The plan never writes the solution.

## 8. Test with the project's own checks

Run the commands the project documents, after reading them. Copy the exact command and output into a file. Failures are useful: record them.

## 9. Prepare the review packet

Create `evidence.json`:

```json
{"aiAssistance":"none","changedFiles":["README.md"],"tests":[{"name":"npm test","status":"passed","evidenceFile":"npm-test.log"}]}
```

```bash
npx contribsutra-ai pr-check --root ./the-repo --issue 101 --evidence evidence.json --out ./reports/pr
```

Your "passed" appears as an author claim, not a verified result. That is intentional: it tells the reviewer what to trust. Rewrite the draft description in your own words. Disclose AI assistance if the project asks.

## 10. Submit (you, not the tool)

Open the pull request yourself, link the issue, and answer reviewers politely. "Ready for review" is not "accepted".

## Using skills in your IDE

```bash
npx contribsutra-ai install-skills --ide claude --project .
```

Hosts: `claude`, `cursor`, `codex`, `gemini`, `copilot`, `opencode`. The command copies files and refuses to overwrite. Whether your IDE activates them is not verified: try asking your agent to "use the contribsutra-repo-onboard skill" and check what happens.

## Troubleshooting

| Message | Meaning and fix |
|---|---|
| `Report output must be outside the inspected repository` | Choose an `--out` directory elsewhere |
| `Refusing to overwrite ...` | Add `--force` or pick a new name |
| `Source file too large` | A document exceeded 256 KiB; the tool refuses rather than guess |
| `Issue snapshot must be an array` | The file must be a bare JSON array, as `gh issue list --json` produces |
| `Requested issue is not present in snapshot` | Check the number in `issues.json` |
| Exit code 1 from `verify` | The report was changed after it was written, or sources changed |
