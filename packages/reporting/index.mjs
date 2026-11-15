import {markdownSafe, escapeHtml as esc, checkSeal} from '../core/util.mjs';
import {VERSION} from '../core/version.mjs';

// One neutral block list feeds both renderers, so Markdown and HTML always say the same thing.
const TITLES = {
  'contribsutra.repository-scan': 'Repository Onboarding Scan', 'contribsutra.environment-doctor': 'Setup Doctor',
  'contribsutra.issue-shortlist': 'First-Win Issue Shortlist', 'contribsutra.learning-plan': 'Learning Plan',
  'contribsutra.pr-readiness': 'PR Readiness (ProofDesk)', 'contribsutra.audit-report': 'Independent Audit Report'
};
const list = a => (a && a.length ? a.join('; ') : 'none');

function blocks(r) {
  const b = [];
  const sealOk = checkSeal(r);
  b.push({t: 'meta', rows: [['Schema', r.schemaVersion ?? 'n/a'], ['Integrity', r.seal ? (sealOk ? `SHA-256 seal verified (${r.seal.hash.slice(0, 16)}…)` : 'SEAL MISMATCH') : 'no seal'], ['Trust boundary', 'Imported content is untrusted. No GitHub writes, network calls or repository scripts were executed.']]});
  switch (r.kind) {
    case 'contribsutra.repository-scan':
      b.push({t: 'meta', rows: [['Repository', r.sourceDirectory], ['License (heuristic)', r.license?.detected ?? 'unknown'], ['Ecosystems', list(r.ecosystems)], ['CI workflows', String(r.ci?.workflows?.length ?? 0)], ['Instruction-like text found', String(r.untrustedInstructionPatterns ?? 0)]]});
      b.push({t: 'h', x: 'Repository evidence'}, {t: 'table', head: ['Path', 'Source', 'SHA-256'], rows: r.artifacts.map(a => [a.path, a.source, a.sha256])});
      b.push({t: 'h', x: 'Setup and policy gaps'}, {t: 'table', head: ['Finding', 'Severity', 'Path', 'Evidence summary'], rows: r.findings.map(f => [f.id, f.severity, f.path, f.explanation])});
      if (r.policySignals?.length) b.push({t: 'h', x: 'Policy signals (inferred from text)'}, {t: 'table', head: ['Signal', 'Source', 'Excerpt'], rows: r.policySignals.map(s => [s.id, s.source, s.excerpt])});
      if (r.runtimeRequirements?.length) b.push({t: 'h', x: 'Declared runtime requirements'}, {t: 'table', head: ['Tool', 'Declared', 'Source'], rows: r.runtimeRequirements.map(x => [x.tool, x.declared, x.source])});
      b.push({t: 'p', x: `Declared scripts (not run): ${list(r.package?.declaredScripts)}`});
      if (r.documentedCommands?.length) b.push({t: 'h', x: 'Documented commands (quoted, not run)'}, {t: 'table', head: ['Command', 'Source', 'Status'], rows: r.documentedCommands.map(c => [c.command, c.source, c.status])});
      b.push({t: 'h', x: 'Limitations'}, {t: 'list', items: r.limitations});
      break;
    case 'contribsutra.environment-doctor':
      b.push({t: 'meta', rows: [['Platform', `${r.host.platform}/${r.host.arch}`], ['Node.js', r.host.node], ['CPU count', String(r.host.cpuCount)], ['Status', r.status]]});
      b.push({t: 'h', x: 'Tools found'}, {t: 'table', head: ['Tool', 'Observed version'], rows: Object.entries(r.tools)});
      if (r.requirementChecks?.length) b.push({t: 'h', x: 'Repository requirements vs installed'}, {t: 'table', head: ['Tool', 'Declared', 'Installed', 'Verdict', 'Source'], rows: r.requirementChecks.map(c => [c.tool, c.declared, c.installed ?? 'not found', c.verdict, c.source])});
      b.push({t: 'h', x: 'Recommendations'}, {t: 'list', items: r.recommendations.length ? r.recommendations : ['None: no gaps detected by the bounded probes.']});
      b.push({t: 'h', x: 'Restrictions'}, {t: 'list', items: r.restrictions});
      break;
    case 'contribsutra.issue-shortlist':
      b.push({t: 'meta', rows: [['Issues', String(r.summary?.total ?? r.ranked.length)], ['Eligible', String(r.summary?.eligible ?? 'n/a')], ['Declined', String(r.summary?.declined ?? 'n/a')], ['Declared skills', list(r.filters?.declaredSkills)], ['Snapshot SHA-256', r.issueSnapshotSha256]]});
      b.push({t: 'h', x: 'Shortlist'}, {t: 'table', head: ['#', 'Title', 'Score', 'Eligible', 'Why', 'Cautions'], rows: r.ranked.map(x => [x.number, x.title, x.score, x.eligible ? 'yes' : 'no', x.reasons.join('; '), x.warnings.join('; ')])});
      b.push({t: 'note', x: 'Issue state is from an offline snapshot, not live GitHub verification. A label is not consent: ask before starting.'});
      b.push({t: 'h', x: 'Limitations'}, {t: 'list', items: r.limitations});
      break;
    case 'contribsutra.learning-plan':
      b.push({t: 'meta', rows: [['Issue', `#${r.issue.number} ${r.issue.title}`], ['Mode', r.mode ?? 'guided'], ['Status', r.status], ['Lifecycle position', r.lifecycle?.current ?? 'n/a'], ['Maintainer approval recommended', String(r.maintainerApprovalRecommended)]]});
      if (r.blocked) b.push({t: 'note', x: `Blocked: ${r.blockedReasons.join(' | ')}`});
      if (r.policyReminders?.length) b.push({t: 'h', x: 'Policy reminders'}, {t: 'list', items: r.policyReminders});
      b.push({t: 'h', x: 'Steps'}, {t: 'table', head: ['Step', 'What to do', 'Done when', 'Evidence status'], rows: r.steps.map(s => [s.title, s.instructions + (s.hint ? ` Hint: ${s.hint}` : '') + (s.discussion ? ` ${s.discussion}` : ''), s.acceptance ?? '', s.verification])});
      b.push({t: 'h', x: 'Limitations'}, {t: 'list', items: r.limitations});
      break;
    case 'contribsutra.pr-readiness':
      b.push({t: 'verdict', v: r.reviewGate, note: 'A person must review the diff and decide to submit. Nothing was submitted.'});
      b.push({t: 'meta', rows: [['Issue', r.issueNumber ? `#${r.issueNumber}` : 'not supplied'], ['AI assistance', r.aiAssistance ?? 'undeclared'], ['External writes', String(r.externalWrites)]]});
      b.push({t: 'h', x: 'Statements'}, {t: 'table', head: ['Status', 'Message'], rows: r.statements.map(s => [s.status, s.message])});
      b.push({t: 'h', x: 'Test claims'}, {t: 'table', head: ['Test', 'Author claim', 'Independent verification'], rows: r.tests.length ? r.tests.map(t => [t.name, t.userReportedStatus, t.verification]) : [['none supplied', 'not_run', 'not_run']]});
      if (r.channels) b.push({t: 'h', x: 'Evidence channels'}, {t: 'table', head: ['Channel', 'Items'], rows: [['Verified by this tool', list(r.channels.verified)], ['User-reported', list(r.channels.userReported)], ['Inferred / recommended', list(r.channels.inferredOrRecommended)], ['Not run / unknown', list(r.channels.notRunOrUnknown)]]});
      b.push({t: 'h', x: 'Checklist'}, {t: 'checks', items: r.checklist});
      if (r.description) b.push({t: 'h', x: 'Draft PR description (edit in your own words)'}, {t: 'code', x: r.description});
      break;
    case 'contribsutra.audit-report':
      b.push({t: 'verdict', v: r.verdict, note: r.verdictRule});
      b.push({t: 'meta', rows: [['Tool', `ContribSutra AI ${r.toolVersion}`], ['Audited repository', r.subject.repository], ['Recorded', r.recordedAt], ['Environment', `Node ${r.environment.node} · ${r.environment.platform}/${r.environment.arch}`], ['Assurance checks', `${r.assurance.passed} passed · ${r.assurance.failed} failed · ${r.assurance.skipped} skipped of ${r.assurance.total}`]]});
      b.push({t: 'h', x: 'Findings about the audited repository'}, {t: 'table', head: ['ID', 'Severity', 'Path', 'Detail'], rows: r.findings.length ? r.findings.map(f => [f.id, f.severity, f.path, f.detail]) : [['none', '', '', 'No gaps at supported default paths']]});
      b.push({t: 'h', x: 'Assurance checks (proof the safety gates work)'}, {t: 'table', head: ['ID', 'Check', 'Expected', 'Observed', 'Result'], rows: r.assurance.checks.map(c => [c.id, c.title, c.expected, c.observed, c.result])});
      b.push({t: 'h', x: 'Sample outputs'}, {t: 'table', head: ['Capability', 'Result'], rows: r.samples.map(s => [s.capability, s.result])});
      b.push({t: 'h', x: 'Evidence tiers'}, {t: 'table', head: ['Artifact', 'Tier', 'Proves', 'Does not prove'], rows: r.evidence.map(e => [e.artifact, e.tier, e.proves, e.doesNotProve])});
      b.push({t: 'h', x: 'Not tested / not claimed'}, {t: 'list', items: r.notTested});
      if (r.artifacts) b.push({t: 'h', x: 'Artifact hashes'}, {t: 'table', head: ['File', 'SHA-256'], rows: Object.entries(r.artifacts)});
      b.push({t: 'note', x: 'No tool can approve a contribution. A SHA-256 seal detects accidental change; it is not a signature and does not prove origin.'});
      break;
    default:
      b.push({t: 'code', x: JSON.stringify(r, null, 2)});
  }
  return b;
}
const title = r => `ContribSutra AI — ${TITLES[r.kind] ?? r.kind ?? 'Evidence Report'}`;
const cell = v => markdownSafe(v);

export function renderMarkdown(r) {
  const out = [`# ${title(r)}`, ''];
  for (const x of blocks(r)) {
    if (x.t === 'meta') out.push(...x.rows.map(([k, v]) => `**${k}:** ${markdownSafe(v)}  `), '');
    else if (x.t === 'verdict') out.push(`> **Verdict: ${markdownSafe(x.v)}** — ${markdownSafe(x.note)}`, '');
    else if (x.t === 'h') out.push(`## ${x.x}`, '');
    else if (x.t === 'p') out.push(markdownSafe(x.x), '');
    else if (x.t === 'table') out.push(`| ${x.head.join(' | ')} |`, `|${x.head.map(() => '---').join('|')}|`, ...x.rows.map(row => `| ${row.map(cell).join(' | ')} |`), '');
    else if (x.t === 'list') out.push(...x.items.map(i => `- ${markdownSafe(i)}`), '');
    else if (x.t === 'checks') out.push(...x.items.map(i => `- [ ] ${markdownSafe(i)}`), '');
    else if (x.t === 'note') out.push(`_${markdownSafe(x.x)}_`, '');
    else out.push('```json'.replace('json', x.x.startsWith('{') ? 'json' : 'markdown'), x.x.replaceAll('```', "'''"), '```', '');
  }
  out.push('---', `ContribSutra AI ${VERSION} · created by Vatsal Shah · Apache-2.0`, '');
  return out.join('\n');
}

const CSS = `:root{--bg:#f6f8fb;--card:#fff;--ink:#14202b;--mute:#566574;--line:#d8e0e9;--brand:#0d6b7c;--ok:#13795b;--warn:#a15c00;--bad:#b3261e}@media(prefers-color-scheme:dark){:root{--bg:#0e141a;--card:#16202a;--ink:#e6edf3;--mute:#9fb0bf;--line:#2a3846;--brand:#4cc3d6;--ok:#4cd6a3;--warn:#f0b254;--bad:#ff8a80}}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:1040px;margin:0 auto;padding:2rem 1rem 4rem}h1{font-size:1.6rem;margin:.2rem 0 1rem}h2{font-size:1.15rem;margin:2rem 0 .6rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:1rem 1.25rem;margin:1rem 0}dl{display:grid;grid-template-columns:max-content 1fr;gap:.25rem 1rem;margin:0}dt{color:var(--mute)}dd{margin:0;overflow-wrap:anywhere}.scroll{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--card)}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{text-align:left;padding:.5rem .65rem;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}th{color:var(--mute);font-weight:600}tr:last-child td{border-bottom:0}.verdict{border-left:6px solid var(--warn);font-size:1.05rem}.verdict.bad{border-color:var(--bad)}.verdict.good{border-color:var(--ok)}.verdict b{font-size:1.3rem}.pill{display:inline-block;padding:.02rem .55rem;border-radius:99px;font-size:.78rem;border:1px solid currentColor;white-space:nowrap}.pill.ok{color:var(--ok)}.pill.warn{color:var(--warn)}.pill.bad{color:var(--bad)}.note{color:var(--mute);font-style:italic}pre{overflow:auto;background:var(--card);border:1px solid var(--line);padding:1rem;border-radius:8px;white-space:pre-wrap}footer{color:var(--mute);font-size:.85rem;margin-top:2rem}a{color:var(--brand)}@media print{body{background:#fff;color:#000}}`;
const OK = new Set(['pass', 'MATCH', 'satisfied', 'yes', 'READY_FOR_HUMAN_REVIEW', 'info']);
const BAD = new Set(['fail', 'MISMATCH', 'not_satisfied', 'important', 'tool_missing', 'ASSURANCE_FAILED', 'STALE_OR_MISSING']);
const WARN = new Set(['review', 'advisory', 'skipped', 'no', 'GAP', 'NOT_RUN', 'REVIEW', 'cannot_determine', 'GAPS_FOUND', 'HUMAN_REVIEW_REQUIRED', 'not_run', 'unverified_external_claim']);
const pill = v => { const s = String(v); const c = OK.has(s) ? 'ok' : BAD.has(s) ? 'bad' : WARN.has(s) ? 'warn' : null; return c ? `<span class="pill ${c}">${esc(s)}</span>` : esc(s); };

export function renderHtml(r) {
  const body = blocks(r).map(x => {
    if (x.t === 'meta') return `<section class="card"><dl>${x.rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`;
    if (x.t === 'verdict') { const cls = OK.has(x.v) ? 'good' : BAD.has(x.v) ? 'bad' : ''; return `<section class="card verdict ${cls}" role="status"><b>Verdict: ${esc(x.v)}</b><br>${esc(x.note)}</section>`; }
    if (x.t === 'h') return `<h2>${esc(x.x)}</h2>`;
    if (x.t === 'p') return `<p>${esc(x.x)}</p>`;
    if (x.t === 'table') return `<div class="scroll"><table><thead><tr>${x.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${x.rows.map(row => `<tr>${row.map(c => `<td>${pill(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (x.t === 'list') return `<ul>${x.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (x.t === 'checks') return `<ul style="list-style:none;padding-left:0">${x.items.map(i => `<li>☐ ${esc(i)}</li>`).join('')}</ul>`;
    if (x.t === 'note') return `<p class="note">${esc(x.x)}</p>`;
    return `<pre>${esc(x.x)}</pre>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${esc(title(r))}</title><style>${CSS}</style></head><body><main><h1>${esc(title(r))}</h1>\n${body}\n<footer>ContribSutra AI ${esc(VERSION)} · Understand the code. Find your first win. Contribute with confidence. · created by Vatsal Shah · Apache-2.0</footer></main></body></html>`;
}
export function asFileFormats(report) { return {json: JSON.stringify(report, null, 2) + '\n', md: renderMarkdown(report), html: renderHtml(report)}; }
