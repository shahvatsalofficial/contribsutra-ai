# Quick start

> Five minutes from nothing to a sealed audit report. You need Node.js 22 or newer. No account, API key or network access is required after install.

{{flow:quickstart}}

## 1. Check the tool

```bash
npx contribsutra-ai --version
```

It prints the version (`0.2.2`). If `npx` asks to install the package, accept: it downloads one small package with zero dependencies.

## 2. See the proof first

```bash
npx contribsutra-ai audit --out ./contribsutra-audit
```

Open `contribsutra-audit/audit-report.html` in a browser. You will see a verdict, 30 adversarial checks with *expected* and *observed* columns, sample outputs for every capability, and a list of what was **not** tested. Nothing was sent anywhere.

> **Tip** `audit-report.md` has the same content for pull requests and chat. `audit-report.json` is for tooling. `SHA256SUMS.txt` lets you verify every file.

## 3. Look at a real repository

Clone a project you care about, then scan it:

```bash
npx contribsutra-ai scan --root ./the-repo --out ./reports/scan
npx contribsutra-ai doctor --root ./the-repo
```

`--out ./reports/scan` writes `scan.json`, `scan.md` and `scan.html`. The output folder must be **outside** the repository you inspect.

## 4. Shortlist issues

Export open issues with the official GitHub CLI. This uses your own account; ContribSutra never calls GitHub:

```bash
gh issue list --repo OWNER/REPO --state open --limit 100 --json number,title,state,labels,assignees,updatedAt,body > issues.json
npx contribsutra-ai issues --issues issues.json --skills docs,javascript --as-of 2026-11-16T00:00:00Z --out ./reports/issues
```

Read the reasons and cautions next to each issue. An issue marked `eligible: no` was declined for a stated reason.

## 5. Plan and prepare

```bash
npx contribsutra-ai plan --root ./the-repo --issues issues.json --issue 101 --out ./reports/plan
npx contribsutra-ai pr-check --root ./the-repo --issue 101 --evidence evidence.json --out ./reports/pr
```

## Output formats

| File | Best for |
|---|---|
| `*.html` | Reading and sharing. Light and dark, printable, no scripts |
| `*.md` | Pull requests, wikis, chat |
| `*.json` | Tools and CI. Sealed with SHA-256: `contribsutra verify --report x.json` |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | `verify` failed, or `audit` verdict is `ASSURANCE_FAILED` |
| 2 | Usage or input error |

## Common first problems

| You see | Fix |
|---|---|
| `Report output must be outside the inspected repository` | Pick an `--out` folder elsewhere |
| `Refusing to overwrite ...` | Add `--force` or pick a new name |
| `Missing value for --root` | A flag needs a value: `--root ./the-repo` |
| Node version error | Install Node.js 22 or newer (`node -v`) |

Next: the [user guide](03-user-guide.md) walks through a full first contribution, and the [scenarios](04-real-world-scenarios.md) show it in real situations.
