# ContribSutra AI — Repository Onboarding Scan

**Schema:** 1.0  
**Integrity:** SHA-256 seal verified (4baaeb6ddb7e105e…)  
**Trust boundary:** Imported content is untrusted. No GitHub writes, network calls or repository scripts were executed.  

**Repository:** demo-repo  
**License (heuristic):** MIT  
**Ecosystems:** node  
**CI workflows:** 0  
**Instruction-like text found:** 0  

## Repository evidence

| Path | Source | SHA-256 |
|---|---|---|
| README.md | README.md:1 | cb22f16d705b0c52081339e8ab51daa17675a34b5a77ede6a5eda854a0005cd0 |
| CONTRIBUTING.md | CONTRIBUTING.md:1 | 5bafab86ca52f68e1560041d85b9ce80455f78b7e96123faed40728a6b05aa63 |
| LICENSE | LICENSE:1 | 1e357601e266179fb347bc5048f21c3d02df9637a778da530ea45f7224d5a304 |
| CODE_OF_CONDUCT.md | CODE_OF_CONDUCT.md:1 | 27934cf9987b91f04b9c009e1657e1c7b274c1998682906438dc89343646355a |
| .github/PULL_REQUEST_TEMPLATE.md | .github/PULL_REQUEST_TEMPLATE.md:1 | bf84cc221f2736539c3525dc6f665c3662fcf69bd8b5bb74a8279aa0ea485ad4 |
| package.json | package.json:1 | fcd73b39c532d7fccc58718efd464ba218bd8921f0428ed6f5b2609155db9fdb |

## Setup and policy gaps

| Finding | Severity | Path | Evidence summary |
|---|---|---|---|
| MISSING_SECURITY | advisory | SECURITY.md | Private reporting channel for vulnerabilities not located at a supported default path (SECURITY.md, .github/SECURITY.md, docs/SECURITY.md); it may be provided elsewhere |
| MISSING_ISSUE_TEMPLATE | advisory | .github/ISSUE_TEMPLATE/bug_report.md | Issue reporting template not located at a supported default path (.github/ISSUE_TEMPLATE/bug_report.md, .github/ISSUE_TEMPLATE/config.yml, .github/ISSUE_TEMPLATE.md); it may be provided elsewhere |
| MISSING_CODEOWNERS | advisory | .github/CODEOWNERS | Review ownership map not located at a supported default path (.github/CODEOWNERS, CODEOWNERS, docs/CODEOWNERS); it may be provided elsewhere |
| MISSING_AGENTS | advisory | AGENTS.md | AI coding guidance not located at a supported default path (AGENTS.md); it may be provided elsewhere |
| MISSING_CLAUDE | advisory | CLAUDE.md | Claude-specific contributor guidance not located at a supported default path (CLAUDE.md); it may be provided elsewhere |

## Policy signals (inferred from text)

| Signal | Source | Excerpt |
|---|---|---|
| TESTS_REQUIRED_MENTIONED | README.md:3 | A synthetic example open-source JavaScript library for ContribSutra tests. Run 'npm test' after inspecting package scripts. |
| DCO_MENTIONED | CONTRIBUTING.md:5 | Sign your commits with a 'Signed-off-by' line (DCO). Do not open a PR without review. |
| SIGNED_COMMITS_MENTIONED | CONTRIBUTING.md:5 | Sign your commits with a 'Signed-off-by' line (DCO). Do not open a PR without review. |
| DISCUSS_FIRST_MENTIONED | CONTRIBUTING.md:3 | Please read the issue and keep changes small. Open an issue first to discuss larger changes. Create a branch. Add a test for changes, run th |
| TESTS_REQUIRED_MENTIONED | CONTRIBUTING.md:3 | Please read the issue and keep changes small. Open an issue first to discuss larger changes. Create a branch. Add a test for changes, run th |

## Declared runtime requirements

| Tool | Declared | Source |
|---|---|---|
| node | &gt;=20 | package.json:1 |

Declared scripts (not run): test; lint

## Documented commands (quoted, not run)

| Command | Source | Status |
|---|---|---|
| npm test | CONTRIBUTING.md:8 | documented_not_run |
| npm run lint | CONTRIBUTING.md:9 | documented_not_run |

## Limitations

- Only documented default paths are scanned, not every nested file
- No repository scripts, fetched content, or GitHub writes were executed
- Source hashes prove local file identity, not maintainer endorsement
- Policy signals and license detection are text-pattern heuristics, not legal conclusions
- Documented commands are quoted from docs and were not run

---
ContribSutra AI 0.2.0 · created by Vatsal Shah · Apache-2.0
