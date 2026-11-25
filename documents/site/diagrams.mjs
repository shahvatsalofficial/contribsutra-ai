// Theme-aware inline SVG diagrams. Colours come from CSS variables in site.css, so one SVG serves light and dark.
let uid = 0;
const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (w, h, label, body) => {
  const id = `ah${++uid}`;
  return `<div class="dia-scroll"><svg class="dia" viewBox="0 0 ${w} ${h}" role="img" aria-label="${e(label)}"><defs><marker id="${id}" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="ah" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>${body.replaceAll('#AH', `url(#${id})`)}</svg></div>`;
};
const box = (x, y, w, h, t1, t2 = '', cls = '') => `<rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text class="t1" x="${x + w / 2}" y="${y + (t2 ? h / 2 - 3 : h / 2 + 5)}" text-anchor="middle">${e(t1)}</text>${t2 ? `<text class="t2" x="${x + w / 2}" y="${y + h / 2 + 15}" text-anchor="middle">${e(t2)}</text>` : ''}`;
const arrow = (d, dash = false) => `<path class="ln${dash ? ' dash' : ''}" d="${d}" marker-end="#AH"/>`;
const txt = (x, y, s, cls = 't2', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${e(s)}</text>`;
const diamond = (cx, cy, w, h, t, cls = '') => `<polygon class="bx ${cls}" points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}"/>${txt(cx, cy + 4, t, 't1')}`;

export const DIAGRAMS = {
  pipeline: () => svg(780, 210, 'Pipeline: scan the repository, run the setup doctor, shortlist issues, build a learning plan, prepare a PR packet, then a human decides whether to submit. The tool stops before any submission.',
    box(8, 62, 108, 70, 'Scan', 'repo + policies') + box(134, 62, 108, 70, 'Doctor', 'tools vs needs') + box(260, 62, 108, 70, 'Shortlist', 'issues + reasons', 'warn') + box(386, 62, 108, 70, 'Plan', 'small steps') + box(512, 62, 108, 70, 'PR packet', 'claims separated') + box(646, 62, 126, 70, 'You decide', 'a person submits', 'ok') +
    arrow('M116 97 H134') + arrow('M242 97 H260') + arrow('M368 97 H386') + arrow('M494 97 H512') + arrow('M620 97 H646') +
    `<rect class="bx zone" x="2" y="30" width="624" height="116" rx="16" fill="none"/>` + txt(314, 24, 'ContribSutra: read-only, offline, sealed reports', 'tb') +
    txt(390, 186, 'no GitHub writes, no network calls, no repository scripts, no invented test results', 't2')),

  lifecycle: () => svg(780, 330, 'Lifecycle: discovered, understood, shortlisted, approved scope, planning. ContribSutra can reach planning. Implementation authorized, observed tests, review ready and submitted by human are human-only transitions.',
    `<rect class="bx zone" x="8" y="16" width="764" height="108" rx="16"/>` + txt(390, 40, 'THE TOOL CAN HELP UP TO HERE', 'tb') +
    box(24, 56, 128, 56, 'discovered', 'repo found') + box(168, 56, 128, 56, 'understood', 'scan read') + box(312, 56, 128, 56, 'shortlisted', 'issue ranked', 'warn') + box(456, 56, 128, 56, 'approved scope', 'you + maintainer', 'br') + box(600, 56, 156, 56, 'planning', 'tool stops here', 'ok') +
    arrow('M152 84 H168') + arrow('M296 84 H312') + arrow('M440 84 H456') + arrow('M584 84 H600') +
    `<rect class="bx" x="8" y="170" width="764" height="124" rx="16" fill="none" stroke-dasharray="6 5"/>` + txt(390, 194, 'HUMAN-ONLY TRANSITIONS: NO TOOL CAN PERFORM THESE', 'tb') +
    box(24, 214, 168, 58, 'implementation', 'you authorise the work', 'br') + box(210, 214, 168, 58, 'observed tests', 'you run, you capture', 'br') + box(396, 214, 168, 58, 'review ready', 'you read the diff', 'br') + box(582, 214, 174, 58, 'submitted by human', 'you open the PR', 'ok') +
    arrow('M192 243 H210') + arrow('M378 243 H396') + arrow('M564 243 H582') + arrow('M678 112 C678 150 108 140 108 214', true) +
    txt(390, 316, '"Ready for review" is not "accepted" and not "merged".', 't1')),

  trust: () => svg(780, 240, 'Trust boundaries: untrusted repository files, issue snapshots and README commands go into the ContribSutra process, which has no network access, runs no repository scripts and enforces size and path limits, and writes only report files you choose outside the inspected repository.',
    `<rect class="bx zone" x="8" y="18" width="224" height="204" rx="16"/>${txt(120, 44, 'UNTRUSTED INPUT', 't1')}${txt(120, 80, 'README, CONTRIBUTING')}${txt(120, 104, 'issue titles and bodies')}${txt(120, 128, 'commands in code blocks')}${txt(120, 152, 'package manifests')}${txt(120, 186, 'hostile text stays data', 't2')}` +
    `<rect class="bx br" x="282" y="18" width="224" height="204" rx="16"/>${txt(394, 44, 'CONTRIBSUTRA PROCESS', 'tb')}${txt(394, 80, 'no network calls')}${txt(394, 104, 'no repository scripts')}${txt(394, 128, 'no symlinks, no ..')}${txt(394, 152, 'size caps on every read')}${txt(394, 186, 'secrets redacted', 't2')}` +
    `<rect class="bx ok" x="556" y="18" width="216" height="204" rx="16"/>${txt(664, 44, 'OUTPUT (YOU CHOOSE)', 'tg')}${txt(664, 80, 'scan.json  .md  .html')}${txt(664, 104, 'issues, plan, pr-check')}${txt(664, 128, 'audit-report .html')}${txt(664, 152, 'SHA256SUMS.txt')}${txt(664, 186, 'outside the inspected repo', 't2')}` +
    arrow('M232 120 H282') + arrow('M506 120 H556')),

  evidence: () => svg(780, 250, 'Four evidence channels: Verified (the tool hashed a file or ran a version probe), User-reported (a person says it happened), Inferred or recommended (heuristic from text or labels) and Not run or unknown. They are never merged into one score.',
    box(8, 20, 180, 150, '', '', 'ok') + txt(98, 50, 'VERIFIED', 'tg') + txt(98, 84, 'README.md SHA-256') + txt(98, 106, 'git --version output') + txt(98, 128, 'file existed at scan', 't2') + txt(98, 150, 'tool did it, kept it', 't2') +
    box(204, 20, 180, 150, '', '', 'warn') + txt(294, 50, 'USER-REPORTED', 'tb') + txt(294, 84, '"npm test passed"') + txt(294, 106, 'a status in evidence.json') + txt(294, 128, 'not checked here', 't2') + txt(294, 150, 'unverified_external_claim', 't2') +
    box(400, 20, 180, 150, '', '', 'br') + txt(490, 50, 'INFERRED', 'tb') + txt(490, 84, '"DCO may apply (line 7)"') + txt(490, 106, 'label looks beginner-friendly') + txt(490, 128, 'pattern match, can be wrong', 't2') + txt(490, 150, 'pattern_match_inferred', 't2') +
    box(596, 20, 176, 150, '', '', 'bad') + txt(684, 50, 'NOT RUN / UNKNOWN', 'tb') + txt(684, 84, 'tests were not executed') + txt(684, 106, 'maintainer intent unknown') + txt(684, 128, 'live issue state unknown', 't2') + txt(684, 150, 'said out loud, never hidden', 't2') +
    txt(390, 206, 'These channels are never blended into a single "readiness score".', 't1') + txt(390, 230, 'An unknown status is recorded as not_run, never as passed.', 't2')),

  decline: () => svg(780, 330, 'Issue triage: an issue from your snapshot is checked against decline rules. Closed, assigned, locked, restricted label, security-like or instruction-like issues are declined with a reason. Otherwise it is scored from maintainer labels and your skills, with warnings for large scope, missing detail, duplicates and staleness.',
    box(8, 120, 124, 70, 'Issue', 'from your snapshot') +
    box(170, 20, 250, 280, '', '', 'br') + txt(295, 48, 'DECLINE RULES (score 0)', 'tb') + txt(295, 80, 'closed or a pull request') + txt(295, 106, 'already assigned') + txt(295, 132, 'locked discussion') + txt(295, 158, 'security / private / blocked label') + txt(295, 184, 'security-sounding title') + txt(295, 210, 'instruction-like text inside') + txt(295, 250, 'reason printed, text never echoed', 't2') + txt(295, 274, 'a human reviews instead', 't2') +
    box(470, 20, 302, 84, 'Declined, with a reason', 'e.g. "Issue appears assigned"', 'bad') +
    box(470, 126, 302, 84, 'Eligible, with warnings', 'large scope · no detail · duplicate · stale', 'warn') +
    box(470, 232, 302, 68, 'Ranked by transparent score', 'good first issue +50 · help wanted +20 · skills +12', 'ok') +
    arrow('M132 155 H170') + arrow('M420 62 H470') + arrow('M420 168 H470') + arrow('M420 266 H470')),

  audit: () => svg(780, 300, 'Audit: thirty adversarial checks run the real code on hostile inputs: issue triage, path safety, tamper detection, evidence honesty, report escaping, local server authentication and negative controls. The result is a verdict and a sealed report in JSON, Markdown and HTML.',
    box(8, 20, 210, 40, 'A  issue triage', '12 checks') + box(8, 66, 210, 40, 'B  paths and size limits', '5 checks') + box(8, 112, 210, 40, 'C  seals and freshness', '3 checks') + box(8, 158, 210, 40, 'D  evidence honesty', '5 checks') + box(8, 204, 210, 40, 'E  report escaping', '2 checks') + box(8, 250, 210, 40, 'F  server  ·  G  negative controls', '3 checks') +
    box(290, 106, 190, 88, 'Real code, real inputs', 'expected vs observed', 'br') +
    box(560, 20, 212, 56, 'READY_FOR_HUMAN_REVIEW', 'no gaps found', 'ok') + box(560, 100, 212, 56, 'GAPS_FOUND', 'important files missing', 'warn') + box(560, 180, 212, 56, 'ASSURANCE_FAILED', 'a safety check failed', 'bad') + box(560, 252, 212, 40, 'Sealed report  ·  JSON · MD · HTML', '', 'zone') +
    arrow('M218 40 C260 40 260 130 290 130') + arrow('M218 86 C260 86 260 140 290 140') + arrow('M218 132 H290') + arrow('M218 178 C260 178 260 160 290 160') + arrow('M218 224 C260 224 260 170 290 170') + arrow('M218 270 C260 270 260 180 290 180') +
    arrow('M480 130 C520 130 520 48 560 48') + arrow('M480 150 H560') + arrow('M480 170 C520 170 520 208 560 208') + txt(666, 247, '', 't2')),

  arch: () => svg(780, 330, 'Architecture: the CLI and the loopback server call the core modules scan, doctor, issues, plan, verify and audit. Reporting renders Markdown and HTML from one block model. Skills are copied by the installer. Output goes to files you choose.',
    box(180, 10, 180, 50, 'CLI', 'packages/cli', 'br') + box(420, 10, 180, 50, 'Server', '127.0.0.1, read-only', 'br') +
    box(10, 120, 120, 56, 'scan', 'policies, license') + box(142, 120, 120, 56, 'doctor', 'versions') + box(274, 120, 120, 56, 'issues', 'rank, decline') + box(406, 120, 120, 56, 'plan', 'learn, PR packet') + box(538, 120, 112, 56, 'verify', 'seal check') + box(662, 120, 108, 56, 'audit', '30 checks', 'ok') +
    box(10, 230, 220, 50, 'reporting', 'one block model → MD + HTML') + box(250, 230, 200, 50, 'util', 'hash, paths, redaction') + box(470, 230, 140, 50, 'installer', '25 skills') + box(630, 230, 140, 50, 'report files', 'outside the repo', 'zone') +
    arrow('M270 60 V90 H70 V120') + arrow('M270 60 V90 H202 V120') + arrow('M270 60 V90 H334 V120') + arrow('M270 60 V90 H466 V120') + arrow('M270 60 V90 H594 V120') + arrow('M270 60 V90 H716 V120') + arrow('M510 60 V90') + arrow('M120 176 V230', true) + arrow('M350 176 V230', true) + arrow('M716 176 V204 H700 V230', true) +
    txt(390, 316, 'dependency direction: cli and server depend on core; core never depends on the CLI', 't2')),

  ci: () => svg(780, 250, 'CI gate: a pull request runs contribsutra audit. A failed assurance check exits with code 1 and blocks the merge; otherwise the merge is allowed. The sealed report is uploaded as a build artifact either way.',
    box(10, 95, 120, 60, 'Pull request', 'opened or updated') + box(170, 95, 160, 60, 'CI job', 'contribsutra audit', 'br') + diamond(430, 125, 140, 90, 'Assurance failed?') +
    box(560, 20, 130, 56, 'Exit 0', 'merge allowed', 'ok') + box(560, 172, 130, 56, 'Exit 1', 'merge blocked', 'bad') + box(706, 172, 66, 56, 'Fix') +
    arrow('M130 125 H170') + arrow('M330 125 H360') + arrow('M430 80 V48 H560') + arrow('M430 170 V200 H560') + arrow('M690 200 H706') +
    txt(455, 62, 'no', 't2', 'start') + txt(455, 192, 'yes', 't2', 'start') + txt(390, 244, 'audit-report.html, .md and .json attached as a CI artifact', 't2')),

  skills: () => svg(780, 280, 'Skills: a SKILL.md is a text instruction file. The installer copies 25 skill folders into a host project directory. Whether the host activates them is not verified; the CLI does the enforcement.',
    box(10, 100, 170, 80, '25 SKILL.md files', 'text instructions', 'warn') + box(240, 100, 170, 80, 'install-skills', 'copies, never overwrites', 'br') +
    box(470, 20, 300, 44, '.claude/skills', 'Claude Code') + box(470, 74, 300, 44, '.cursor/skills', 'Cursor') + box(470, 128, 300, 44, '.agents/skills', 'Codex · OpenCode') + box(470, 182, 300, 44, '.gemini/skills', 'Gemini CLI') + box(470, 236, 300, 40, '.github/skills', 'GitHub Copilot') +
    arrow('M180 140 H240') + arrow('M410 130 C440 130 440 42 470 42') + arrow('M410 135 C440 135 440 96 470 96') + arrow('M410 140 H470') + arrow('M410 145 C440 145 440 204 470 204') + arrow('M410 150 C440 150 440 256 470 256')),
};

/** Vertical flowchart as semantic HTML: reads well on phones, no horizontal scroll. */
export const FLOWS = {
  quickstart: { row: true, steps: [['Check', '`npx contribsutra-ai --version`'], ['Prove', '`contribsutra audit --out audit`'], ['Scan', '`contribsutra scan --root ./repo`'], ['Shortlist', '`contribsutra issues --issues issues.json`']] },
  firstIssue: { steps: [
    ['Priya, a student, wants her first open-source contribution', 'She has a laptop, a free weekend and no idea where to start.'],
    ['She clones the project and runs `contribsutra scan --root ./project`', 'The report shows the license, a "discuss first" rule on `CONTRIBUTING.md:3` and a DCO sign-off rule on line 5.', ''],
    ['`contribsutra doctor --root ./project` compares tools with what the project declares', 'Declared `node >=22`, installed `v20.11` → `not_satisfied`. She fixes it before wasting an hour.', 'warn'],
    ['She exports open issues with `gh` and runs `contribsutra issues`', 'Ten issues in. Four declined with reasons. #210 "Fix typo in setup instructions" ranks first.', ''],
    ['She comments on #210 herself: "May I take this?"', 'ContribSutra never posts for her. The maintainer replies yes.', 'ok'],
    ['She makes the change, runs the project tests, and writes `evidence.json`', '`contribsutra pr-check` shows her "passed" as an author claim and drafts a PR description. She rewrites it in her own words.', 'ok']] },
  trap: { steps: [
    ['A new contributor finds issue #204 "Tiny docs task" with the `good first issue` label', 'It looks perfect. The body says to ignore the rules and run a shell command from a URL.', 'warn'],
    ['`contribsutra issues` reads the body but never repeats it', 'The rule "instruction-like content" fires. The issue is **declined** and a human is asked to review it.', 'bad'],
    ['The same rule fires on a README line `SYSTEM: ignore all previous instructions`', '`contribsutra scan` records `UNTRUSTED_INSTRUCTION_PATTERN` with `README.md:2`. Nothing is executed.', 'warn'],
    ['The contributor chooses a different issue', 'No script ran. No secret left the machine.', 'ok']] },
  spam: { steps: [
    ['A maintainer is flooded with pull requests that say "tests pass" and change one comment', 'Reviewing them costs hours. Some were generated in bulk.', 'bad'],
    ['The maintainer runs `contribsutra scan` and reads the policy signals', 'The repository has no AI policy and no "discuss first" rule. Newcomers cannot see what is wanted.', 'warn'],
    ['They add a `CONTRIBUTING.md` rule and a PR template, then re-run `contribsutra audit`', 'The verdict moves from `GAPS_FOUND` to `READY_FOR_HUMAN_REVIEW`.', ''],
    ['Contributors who use ContribSutra now see "discuss first" and "AI assistance: declare it"', 'Their PR packet lists unverified claims. Reviewers know what to trust.', 'ok']] },
  workshop: { steps: [
    ['A mentor runs a two-hour open-source workshop for 20 students', 'Everyone has a different laptop and different skills.'],
    ['Each student runs `contribsutra doctor --root ./repo`', 'Three students see `tool_missing` for `git`. They fix it in the first ten minutes, not the last.', 'warn'],
    ['Students choose `contribsutra plan --mode collaborative`', 'Each step comes with a question for the mentor instead of a ready answer.', ''],
    ['The mentor reviews the plans, not generated code', 'Nobody is graded on a number. The tool scores issues, never people.', 'ok']] },
  stale: { steps: [
    ['A beginner picks issue #207 because it has the `help wanted` label', 'The snapshot is from this week. The issue was last touched in January 2024.', 'warn'],
    ['`contribsutra issues --as-of 2026-11-16` marks it `stale`', 'It loses 10 points and carries "No activity for 1046 days; confirm the issue is still wanted".', 'warn'],
    ['A duplicate #208 appears with the same title', 'Both get "Possible duplicate". The contributor asks which one to follow.', ''],
    ['She asks before starting. The maintainer says the work was done last year', 'Ten minutes of asking saved a weekend.', 'ok']] },
  prove: { steps: [
    ['A contributor writes "all tests pass" in `evidence.json`', 'ContribSutra did not run them.', ''],
    ['`contribsutra pr-check` records the claim as `reported_passed`', 'Verification is always `unverified_external_claim`.', 'warn'],
    ['The packet separates four channels', 'Verified: 9 files hashed. User-reported: `npm test`. Not run: everything else.', ''],
    ['The reviewer sees exactly what to check', 'The contributor attaches the captured log. Trust is earned, not assumed.', 'ok']] },
  tamper: { steps: [
    ['Someone shares a report and edits one finding by hand', 'The JSON still looks fine.', 'bad'],
    ['`contribsutra verify --report scan.json` recomputes the SHA-256 seal', 'Integrity: `MISMATCH`. Exit code 1.', 'bad'],
    ['`contribsutra render` refuses to turn it into HTML', 'No pretty page hides the edit.', 'warn'],
    ['The author regenerates the report from the repository', 'Honest output matches the seal again.', 'ok']] },
  assistant: { steps: [
    ['A developer installs skills: `contribsutra install-skills --ide claude --project .`', '25 folders copied. Nothing overwritten.'],
    ['Their AI assistant reads `contribsutra-prime` and calls the real CLI', 'Deterministic output, not a guess.', ''],
    ['The assistant reports gaps and drafts questions, then stops', 'It cannot open a PR, comment or claim a test passed. Those belong to the human.', 'warn'],
    ['The developer decides what to do next', 'Whether the host activates the skills is **not verified**. The CLI is what enforces the rules.', 'ok']] },
  maintainerAudit: { steps: [
    ['A community lead prepares a Hacktoberfest-style event', 'They want newcomers to succeed and maintainers to stay sane.'],
    ['They run `contribsutra audit --root ./repo --out audit` on each participating repository', 'One HTML report per repository, each with findings and a sealed record.', ''],
    ['Repositories with `MISSING_CONTRIBUTING` or no license are fixed first', 'The audit lists the important gaps, not a vanity score.', 'warn'],
    ['The event starts with repositories at `READY_FOR_HUMAN_REVIEW`', 'Fewer confused newcomers. Fewer unwanted pull requests.', 'ok']] },
};
