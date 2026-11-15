# Legal and governance

*Engineering documentation, not legal advice. Have counsel review before commercial or regulated use.*

## License

Apache License 2.0 for all original code, skills, schemas, rules, workflows, fixtures and documentation. It grants copyright and patent licenses, requires preservation of notices (`NOTICE`) and disclaims warranty and liability. Contributions are accepted under the same license (Apache-2.0 section 5).

## What is and is not included

| Item | State |
|---|---|
| Third-party source code | None |
| Runtime and development dependencies | None |
| Model weights, datasets | None |
| Scraped issues, README or license text from real projects | None; fixtures are synthetic |
| External fonts, scripts, trackers in reports | None |

## Privacy and data protection

No personal data is collected, transmitted or stored by the tool. Reports may include file paths relative to the inspected repository and short excerpts of its policy text, which you may redistribute only as that repository's license allows. Issue snapshots you export may contain usernames and text from third parties; the tool does not copy issue bodies into reports, and you are responsible for how you store the snapshot file.

## Platform and service terms

The tool never calls GitHub. If you export issues with the GitHub CLI, GitHub's Terms and API rules apply to you. The tool does not scrape, bypass rate limits, defeat CAPTCHAs or use undocumented APIs.

## Trademarks and affiliation

GitHub, Claude, Anthropic, Cursor, Codex, OpenAI, GitHub Copilot, Gemini, Google, OpenCode, Node.js and npm belong to their owners. They are named only to describe compatibility targets. There is no sponsorship, endorsement or affiliation. "ContribSutra" is not trademark-cleared; the repository and npm names were unused when checked on 2026-11-16, which is not a clearance.

## Claims discipline

Public material must not claim: that a contribution will be accepted; that a test passed without captured output; that a project is secure; that an IDE runs the skills natively before that was observed; adoption, satisfaction or acceptance numbers; testimonials. The README test suite checks the most important of these.

## Responsible use

The tool must not be used to automate unsolicited pull requests or issues, to evade a project's contribution or AI policy, or to profile contributors. It scores issues, never people.

## Governance

| Topic | Rule |
|---|---|
| Creator and maintainer | Vatsal Shah |
| Decisions | Maintainer decides scope, review requirements and releases; significant decisions are recorded in the changelog and docs |
| Contributions | Welcome after discussion; small, tested, honest; AI assistance disclosed; see `CONTRIBUTING.md` |
| Conduct | `CODE_OF_CONDUCT.md` |
| Security reports | Private GitHub vulnerability reporting (`SECURITY.md`) |
| Releases | Checklist in `docs/RELEASE_CHECKLIST.md`; provenance via trusted publishing where configured |
| Funding | None configured |

## Compliance posture summary

| Area | Position |
|---|---|
| Open-source license compatibility | Apache-2.0, no dependencies, no copyleft content |
| Export, sanctions, safety-critical use | Analysis-only tool; not a substitute for professional review |
| Accessibility | Reports use semantic tables, labelled headings, light/dark and reduced-motion support; a human audit with assistive technology has not been performed |
| AI regulation | The CLI contains no model; skills are instructions for a host agent chosen by the user, who remains responsible for that host's terms |
