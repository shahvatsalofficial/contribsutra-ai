#!/usr/bin/env node
// Builds the documentation website into documents/html from documents/md. Dependency-free.
// Light theme by default; dark by toggle (remembered). Run `npm run proof` first so the numbers are current.
// Directives in Markdown (alone on a line): {{svg:name}} {{flow:name}} {{chart:name}} {{checks}}; plain {{VARS}} are filled from docs/proof.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DIAGRAMS, FLOWS} from './site/diagrams.mjs';
import {rankIssues} from '../packages/core/issues.mjs';
import {runAudit} from '../packages/core/audit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const MD = path.join(HERE, 'md'), OUT = path.join(HERE, 'html');
const GH = 'https://github.com/shahvatsalofficial/contribsutra-ai';
const SITE = 'https://shahvatsalofficial.github.io/contribsutra-ai';
const NPM = 'https://www.npmjs.com/package/contribsutra-ai';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const headingId = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rd = p => JSON.parse(fs.readFileSync(path.join(PROJECT, p), 'utf8'));
const env = rd('docs/proof/environment.json'), fuzz = rd('docs/proof/fuzz-results.json'), sample = rd('docs/proof/audit-sample/audit-report.json');
const V = rd('package.json').version;
const adv = rankIssues(rd('fixtures/issues-adversarial.json'), {skills: ['documentation'], asOf: '2026-11-16T00:00:00Z'});
// Negative control computed live: an empty repository must NOT get a clean verdict.
const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-docs-empty-'));
const emptyAudit = (await runAudit({root: emptyDir, now: '2026-11-16T00:00:00.000Z'})).summary;
fs.rmSync(emptyDir, {recursive: true, force: true});
const A = sample.assurance;
const vars = {VERSION: V, NODE: env.node, PLATFORM: env.platform, RECORDED: env.recordedAt, TESTS: env.tests, PASS: env.pass, FAIL: env.fail, SKIPPED: env.skipped, FUZZ_ISSUES: fuzz.issueCases, FUZZ_DOCS: fuzz.docCases, CRASHED: fuzz.issueUnexpected + fuzz.docUnexpected, CHECKS: A.total, CHECKS_PASSED: A.passed, CHECKS_SKIPPED: A.skipped, CHECKS_FAILED: A.failed, VERDICT: sample.verdict, EMPTY_VERDICT: emptyAudit.verdict};
const fill = s => s.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => { if (!(k in vars)) throw new Error('Unknown placeholder ' + k); return String(vars[k]); });

const GROUPS = [
  ['Start here', ['01-overview', '02-quick-start', '03-user-guide', '04-real-world-scenarios']],
  ['Concepts', ['05-architecture', '06-evidence-model-and-rules']],
  ['Reference', ['07-functional-specification', '08-technical-reference', '09-glossary']],
  ['Trust', ['10-security-and-privacy', '11-test-report', '12-assurance-and-evidence', '13-legal-and-governance']],
  ['Project', ['14-operations-and-release', '15-roadmap-and-faq']],
];
const ORDER = GROUPS.flatMap(g => g[1]);

const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  layers: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</defs></svg>`;
const ic = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

// ---------- Markdown ----------
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      u = u.replace(/&amp;/g, '&');
      u = u.replace(/^([\w-]+)\.md(#|$)/, '$1.html$2').replace(/^(\d\d-[\w-]+)(#|$)/, '$1.html$2');
      return `<a href="${esc(u)}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:)]|$)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}
function mdToHtml(md, ctx) {
  const lines = md.split(/\r?\n/), out = [], toc = [];
  let i = 0, firstQuote = true;
  const para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { flush(); i++; continue; }
    const fence = l.match(/^```(\w*)/);
    if (fence) { flush(); const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre class="code" data-lang="${esc(fence[1])}"><code>${esc(buf.join('\n'))}</code><button class="copy" type="button">Copy</button></pre>`); continue; }
    const dir = l.match(/^\{\{(\w+)(?::(\w+))?\}\}$/);
    if (dir) { flush(); out.push(ctx.directive(dir[1], dir[2])); i++; continue; }
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flush(); const id = headingId(h[2]); const n = h[1].length;
      if (n === 2 || n === 3) toc.push({level: n, text: h[2].replace(/`/g, ''), id});
      out.push(n === 1 ? `<h1>${inline(h[2])}</h1>` : `<h${n} id="${id}">${inline(h[2])}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${n}>`); i++; continue;
    }
    if (/^---+\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(l)) {
      flush(); const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const text = buf.join(' '); const k = text.match(/^\*\*(Warning|Important|Tip|Note)\*\*\s*/);
      if (firstQuote && !k) { firstQuote = false; out.push(`<blockquote class="lead-q">${inline(text)}</blockquote>`); }
      else out.push(`<blockquote class="callout-${k ? k[1].toLowerCase() : 'note'}">${k ? `<strong>${k[1]}.</strong> ${inline(text.slice(k[0].length))}` : inline(text)}</blockquote>`);
      firstQuote = false; continue;
    }
    if (/^\|.*\|\s*$/.test(l) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      flush(); const cells = r => r.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
      const head = cells(l), align = cells(lines[i + 1]).map(c => /^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : 'left'); i += 2; const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c, k) => `<th scope="col" style="text-align:${align[k]}">${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, k) => `<td style="text-align:${align[k]}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    const li = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      flush(); const ordered = /\d/.test(li[2]); const items = [];
      while (i < lines.length) { const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/); if (m) { items.push({depth: Math.floor(m[1].length / 2), text: m[3]}); i++; } else if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1].text += ' ' + lines[i].trim(); i++; } else break; }
      const tag = ordered ? 'ol' : 'ul'; let html = '', depth = -1;
      for (const it of items) { while (depth < it.depth) { html += `<${tag}>`; depth++; } while (depth > it.depth) { html += `</li></${tag}>`; depth--; } html += `<li>${inline(it.text)}`; }
      while (depth >= 0) { html += `</li></${tag}>`; depth--; }
      out.push(html); continue;
    }
    para.push(l.trim()); i++;
  }
  flush();
  return {html: out.join('\n'), toc};
}

// ---------- data-driven blocks (all numbers come from real runs) ----------
const bars = (rows, cls = '') => `<div class="bars">${rows.map(([l, v, max, c]) => `<div class="bar"><span class="lab">${esc(l)}</span><div class="trk"><div class="fill ${c || cls}" style="width:${max ? Math.max(3, Math.round(100 * v / max)) : 0}%"></div></div><span class="val">${v}</span></div>`).join('')}</div>`;
const chart = (title, body, note = '') => `<figure class="chart"><h4>${esc(title)}</h4>${body}${note ? `<p class="note">${esc(note)}</p>` : ''}</figure>`;
const stack = (parts, label) => `<div class="stack" role="img" aria-label="${esc(label)}">${parts.map(([v, c]) => `<i style="width:${v}%;background:var(${c})"></i>`).join('')}</div>`;
const legend = items => `<p class="legend">${items.map(([c, t]) => `<span><b style="background:var(${c})"></b>${esc(t)}</span>`).join('')}</p>`;
const groupCounts = Object.entries(A.checks.reduce((a, c) => { const g = c.id[0]; a[g] = a[g] || {pass: 0, skipped: 0, fail: 0}; a[g][c.result]++; return a; }, {}));
const GROUP_NAMES = {A: 'Issue triage', B: 'Paths and limits', C: 'Seals and freshness', D: 'Evidence honesty', E: 'Report escaping', F: 'Local server', G: 'Negative controls'};
const CHARTS = {
  tests: () => chart('Test run', stack([[100 * env.pass / env.tests, '--ok'], [100 * env.skipped / env.tests, '--warn'], [100 * env.fail / env.tests, '--bad']], `${env.pass} passed, ${env.skipped} skipped, ${env.fail} failed`) + legend([['--ok', `${env.pass} passed`], ['--warn', `${env.skipped} skipped (symlinks need OS privilege)`], ['--bad', `${env.fail} failed`]]), `Node ${env.node} on ${env.platform}, ${env.recordedAt.slice(0, 10)}. Raw log: test-results/test-run.tap. Skipped tests run on the Linux and macOS CI jobs.`),
  assurance: () => chart(`${A.total} adversarial checks by area`, bars(groupCounts.map(([g, c]) => [`${g}  ${GROUP_NAMES[g]}`, c.pass + c.skipped + c.fail, 12, c.fail ? 'bad' : c.skipped ? 'warn' : 'ok'])), `${A.passed} passed, ${A.failed} failed, ${A.skipped} skipped on the recorded host. The skipped check needs symlink permission.`),
  fuzz: () => { const rows = [['hostile issue snapshots', fuzz.issueCases], ['hostile repository documents', fuzz.docCases]]; return chart(`${fuzz.issueCases + fuzz.docCases} fuzzed inputs, ${fuzz.issueUnexpected + fuzz.docUnexpected} unexpected crashes`, bars(rows.map(([k, v]) => [k, v, Math.max(...rows.map(r => r[1])), 'ok'])), 'Fixed seed. A clean Error rejection is acceptable; TypeError, RangeError or a non-Error throw counts as a crash. Not a coverage-guided fuzzer.'); },
  issues: () => chart('One adversarial snapshot, ten issues', bars(adv.ranked.map(r => [`#${r.number}${r.eligible ? '' : '  declined'}`, r.score, 70, r.eligible ? (r.warnings.length > 1 ? 'warn' : 'ok') : 'bad'])), `Score is the bar. Red = declined (score 0): ${adv.ranked.filter(r => !r.eligible).map(r => '#' + r.number).join(', ')}. Amber = eligible with cautions. #210 ranks first.`),
  verdicts: () => chart('Same tool, two repositories, two verdicts', `<div class="cmp"><div class="g"><h4>Demo repository: ${esc(sample.verdict)}</h4><p>${A.passed} of ${A.total} checks pass (${A.skipped} skipped). Important onboarding files are present and nothing instruction-like was found.</p></div><div class="b"><h4>Empty repository: ${esc(emptyAudit.verdict)}</h4><p>${emptyAudit.findings.filter(f => f.severity === 'important').length} important gaps found. The audit refuses to bless a repository with no README, CONTRIBUTING or LICENSE.</p></div></div>`),
};
const checksTable = () => `<div class="table-wrap"><table><thead><tr><th scope="col">ID</th><th scope="col">Check</th><th scope="col">Expected</th><th scope="col">Observed</th><th scope="col">Result</th></tr></thead><tbody>${A.checks.map(c => `<tr><td><code>${c.id}</code></td><td>${esc(c.title)}</td><td>${esc(c.expected)}</td><td>${esc(c.observed)}</td><td>${c.result === 'pass' ? 'pass' : `<strong>${c.result}</strong>`}</td></tr>`).join('')}</tbody></table></div>`;
const ctx = {
  directive(name, arg) {
    if (name === 'svg') { const d = DIAGRAMS[arg]; if (!d) throw new Error('Unknown diagram ' + arg); return `<figure class="dia">${d()}</figure>`; }
    if (name === 'chart') { const c = CHARTS[arg]; if (!c) throw new Error('Unknown chart ' + arg); return c(); }
    if (name === 'checks') return checksTable();
    if (name === 'flow') { const f = FLOWS[arg]; if (!f) throw new Error('Unknown flow ' + arg); return `<ol class="flow${f.row ? ' row' : ''}" style="--n:${f.steps.length}">${f.steps.map(([t, d, c]) => `<li class="${c || ''}"><b>${inline(t)}</b>${d ? `<span>${inline(d)}</span>` : ''}</li>`).join('')}</ol>`; }
    throw new Error('Unknown directive ' + name);
  },
};

// ---------- page shell ----------
const themeInit = `try{var t=localStorage.getItem('contribsutra-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`;
const head = ({title, desc, canon}) => `<!DOCTYPE html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#4f46e5"><meta name="author" content="Vatsal Shah"><link rel="canonical" href="${canon}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:site_name" content="ContribSutra AI"><meta property="og:url" content="${canon}"><meta name="twitter:card" content="summary"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ctext x='16' y='22' font-size='16' font-family='Arial' font-weight='700' fill='white' text-anchor='middle'%3ECS%3C/text%3E%3C/svg%3E"><script>${themeInit}</script><link rel="stylesheet" href="assets/site.css">`;
const LD = JSON.stringify({'@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'ContribSutra AI', applicationCategory: 'DeveloperApplication', operatingSystem: 'Windows, macOS, Linux (Node.js 22+)', softwareVersion: V, license: 'https://www.apache.org/licenses/LICENSE-2.0', author: {'@type': 'Person', name: 'Vatsal Shah', url: 'https://github.com/shahvatsalofficial'}, url: SITE + '/', codeRepository: GH, description: 'Offline, evidence-backed open-source contributor onboarding CLI and portable agent skills. Teaches contributors, protects maintainers, never submits anything.', offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'}}).replace(/</g, '\\u003c');
const NAV = [['03-user-guide', 'Guide'], ['04-real-world-scenarios', 'Scenarios'], ['05-architecture', 'Architecture'], ['12-assurance-and-evidence', 'Proof'], ['06-evidence-model-and-rules', 'Rules']];
const topbar = (home, cur) => `<header class="topbar"><div class="topbar-in"><button class="icon-btn menu-btn" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="sidebar">${ic('menu')}</button><a class="brand" href="${home ? '#top' : 'index.html'}"><span class="logo" aria-hidden="true">CS</span><span class="brand-name">Contrib<b>Sutra</b> AI</span><span class="ver">v${V}</span></a>
<nav class="topnav" aria-label="Primary">${NAV.map(([s, t]) => `<a href="${s}.html"${cur === s ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<div class="search" role="search">${ic('search', 18)}<label class="sr" for="q">Search the documentation</label><input id="q" type="search" placeholder="Search docs" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="results"><kbd aria-hidden="true">/</kbd><ul id="results" role="listbox" hidden></ul></div>
<a class="icon-btn gh" href="${GH}" rel="noopener" aria-label="ContribSutra AI on GitHub">${ic('code')}</a>
<button class="icon-btn theme-btn" type="button" aria-pressed="false" aria-label="Switch to dark theme"><svg class="ic i-sun" width="20" height="20" aria-hidden="true"><use href="#i-sun"/></svg><svg class="ic i-moon" width="20" height="20" aria-hidden="true"><use href="#i-moon"/></svg></button></div></header>`;
const footer = () => `<footer class="site-foot"><div class="foot-in"><div class="foot-brand"><a class="brand" href="index.html"><span class="logo" aria-hidden="true">CS</span><span class="brand-name">Contrib<b>Sutra</b> AI</span></a><p>Understand the code. Find your first win. Contribute with confidence.</p><p class="fine">Created by Vatsal Shah. Apache-2.0.</p></div>
<div><p class="foot-title">Start</p><ul><li><a href="01-overview.html">Overview</a></li><li><a href="02-quick-start.html">Quick start</a></li><li><a href="04-real-world-scenarios.html">Scenarios</a></li></ul></div>
<div><p class="foot-title">Reference</p><ul><li><a href="08-technical-reference.html">Technical reference</a></li><li><a href="06-evidence-model-and-rules.html">Rules and evidence</a></li><li><a href="09-glossary.html">Glossary</a></li></ul></div>
<div><p class="foot-title">Trust</p><ul><li><a href="10-security-and-privacy.html">Security</a></li><li><a href="12-assurance-and-evidence.html">Assurance</a></li><li><a href="13-legal-and-governance.html">Legal</a></li></ul></div>
<div><p class="foot-title">Project</p><ul><li><a href="${GH}" rel="noopener">GitHub</a></li><li><a href="${NPM}" rel="noopener">npm</a></li><li><a href="${GH}/blob/main/CHANGELOG.md" rel="noopener">Changelog</a></li></ul></div></div>
<p class="legal">ContribSutra AI ${V}. A verdict of READY_FOR_HUMAN_REVIEW means no onboarding gaps were found at supported default paths: it is not an approval, a certification or legal advice. GitHub, Claude, Cursor, Codex, Copilot, Gemini and other names belong to their owners; no endorsement is implied.</p></footer>`;
const tail = idx => `<script>window.__DOCS_INDEX__=${JSON.stringify(idx).replace(/</g, '\\u003c')}</script><script src="assets/site.js" defer></script></body></html>`;

// ---------- build ----------
const pages = ORDER.map(slug => {
  const raw = fill(fs.readFileSync(path.join(MD, slug + '.md'), 'utf8'));
  return {slug, raw, title: (raw.match(/^#\s+(.+)$/m) || [, slug])[1], summary: (raw.match(/^>\s+(.+)$/m) || [, ''])[1].replace(/[*`]/g, '')};
});
const unknown = fs.readdirSync(MD).filter(f => f.endsWith('.md') && !ORDER.includes(f.slice(0, -3)));
if (unknown.length) throw new Error(`Markdown files missing from GROUPS: ${unknown.join(', ')}`);
const plain = md => md.replace(/```[\s\S]*?```/g, ' ').replace(/\{\{[^}]*\}\}/g, ' ').replace(/[`*#>|_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
const index = pages.map(p => ({t: p.title, u: `${p.slug}.html`, x: plain(p.raw).slice(0, 2500)}));
const side = cur => `<aside class="sidebar" id="sidebar" aria-label="Documentation"><a class="nav-home" href="index.html">Home</a>${GROUPS.map(([g, slugs]) => `<div class="nav-group"><p class="nav-title">${g}</p><ol>${slugs.map(s => `<li><a href="${s}.html"${s === cur ? ' aria-current="page"' : ''}>${esc(pages.find(x => x.slug === s).title)}</a></li>`).join('')}</ol></div>`).join('')}</aside><div class="scrim" hidden></div>`;

for (const sub of ['samples', 'test-results']) fs.rmSync(path.join(OUT, sub), {recursive: true, force: true});
fs.mkdirSync(OUT, {recursive: true});
for (const f of fs.readdirSync(OUT, {withFileTypes: true})) if (f.isFile() && /\.(html|xml|txt)$/.test(f.name)) fs.rmSync(path.join(OUT, f.name));
fs.rmSync(path.join(OUT, 'assets'), {recursive: true, force: true});
fs.mkdirSync(path.join(OUT, 'assets'), {recursive: true});
const cp = (from, to) => { fs.mkdirSync(path.dirname(to), {recursive: true}); fs.copyFileSync(from, to); };
const PROOF = path.join(PROJECT, 'docs/proof');
for (const f of fs.readdirSync(PROOF)) { const p = path.join(PROOF, f); if (fs.statSync(p).isFile() && f !== 'README.md') cp(p, path.join(OUT, f.startsWith('cli-') ? 'samples' : 'test-results', f)); }
fs.cpSync(path.join(PROOF, 'audit-sample'), path.join(OUT, 'samples/audit'), {recursive: true});
fs.writeFileSync(path.join(OUT, 'assets/site.css'), fs.readFileSync(path.join(HERE, 'site/site.css'), 'utf8') + fs.readFileSync(path.join(HERE, 'site/extra.css'), 'utf8') + '\n.dia-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}.dia-scroll svg.dia{min-width:600px}.table-wrap td:first-child code{white-space:nowrap;overflow-wrap:normal}\n');
fs.copyFileSync(path.join(HERE, 'site/site.js'), path.join(OUT, 'assets/site.js'));

pages.forEach((p, n) => {
  const {html, toc} = mdToHtml(p.raw, ctx);
  const prev = pages[n - 1], next = pages[n + 1];
  const tocUl = toc.length ? `<ul>${toc.map(t => `<li class="l${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ul>` : '';
  const body = html.replace(/^<h1>/, `<p class="eyebrow">${esc(GROUPS.find(g => g[1].includes(p.slug))[0])}</p><h1>`);
  fs.writeFileSync(path.join(OUT, p.slug + '.html'), `${head({title: `${p.title} · ContribSutra AI`, desc: p.summary || p.title, canon: `${SITE}/${p.slug}.html`})}</head><body><a class="skip" href="#content">Skip to content</a>${sprite}${topbar(false, p.slug)}<div class="layout">${side(p.slug)}<main class="content" id="content" tabindex="-1"><article class="prose">${body}<details class="toc-m"><summary>On this page</summary>${tocUl}</details><p class="edit"><a href="${GH}/blob/main/documents/md/${p.slug}.md" rel="noopener">Edit this page on GitHub</a></p><nav class="pager" aria-label="Pagination">${prev ? `<a class="prev" href="${prev.slug}.html"><span>Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a class="next" href="${next.slug}.html"><span>Next</span><b>${esc(next.title)}</b></a>` : '<span></span>'}</nav></article></main><nav class="toc" aria-label="On this page"><h2>On this page</h2>${tocUl}</nav></div>${footer()}${tail(index)}`);
});

// ----- home -----
const mock = `<div class="mock" role="img" aria-label="Example audit report: verdict ${esc(sample.verdict)} with checks passing"><div class="mock-bar"><i></i><i></i><i></i><span>audit-report.html</span></div><div class="mock-in"><div class="mock-head"><b>Independent audit report</b><span class="pill ok">${esc(sample.verdict)}</span></div><div class="mock-cards"><div><b>${A.passed}/${A.total}</b><span>checks pass</span></div><div><b>${adv.summary.declined}/${adv.summary.total}</b><span>risky issues declined</span></div><div><b>0</b><span>external writes</span></div></div><ul class="mock-list">${A.checks.slice(3, 6).map(c => `<li><span class="pill ok">${c.result}</span> <code>${c.id}</code> ${esc(c.title.length > 52 ? c.title.slice(0, 50) + '…' : c.title)}</li>`).join('')}</ul></div></div>`;
const feat = [['file', 'Understand the repo', 'Policies, license, toolchain, CI and contribution rules, each with a file and line number and a SHA-256.'], ['check', 'Pick the right issue', 'A transparent shortlist that declines closed, assigned, security-related and instruction-injected issues, and says why.'], ['layers', 'Learn, do not copy', 'Six small steps with hints and acceptance checks in three modes. The plan never writes your solution.'], ['eye', 'Honest PR packet', 'Verified, user-reported, inferred and not-run claims stay separate. Your "tests passed" is never promoted to verified.'], ['shield', 'Independent audit', `${A.total} adversarial checks, expected versus observed, with negative controls. HTML, Markdown and JSON, sealed with SHA-256.`], ['lock', 'Offline and read-only', 'No network, no API key, no telemetry. It never opens a PR, comments, assigns or runs repository scripts.']];
const scnDefs = [['1', 'A student finds a first issue', 'From a cloned repo to a maintainer-approved first change, step by step.', 'k-info'], ['2', 'The "good first issue" that is a trap', 'Hostile text in an issue and a README is flagged, never obeyed.', 'k-bad'], ['3', 'A maintainer drowning in pull requests', 'Make expectations visible so fewer, better contributions arrive.', 'k-warn'], ['4', 'A mentor runs a workshop', 'Twenty laptops, twenty setups. Fix them in the first ten minutes.', 'k-info']];
const scnPage = pages.find(p => p.slug === '04-real-world-scenarios');
const scnLink = n => { const m = mdToHtml(scnPage.raw, ctx).toc.find(t => t.text.startsWith(`Scenario ${n}:`)); return `04-real-world-scenarios.html#${m ? m.id : ''}`; };
const faq = [['Is this a bot or an AI that writes my pull request?', 'No. It prepares you and your reviewer. You write the change and you decide whether to submit.'], ['Does it need an API key or internet?', 'No. It uses only Node.js built-ins and makes no network calls.'], ['Why was a "good first issue" declined?', 'Labels go stale. The issue may be closed, assigned, locked, security-related, very large, or contain instruction-like text. The reason is printed next to it.'], ['Why does my passing test show as "unverified"?', 'ContribSutra did not run it. The label tells the reviewer what to trust. Attach the captured output.'], ['Does it work in my IDE?', 'The skill files are copied and tested. Whether your IDE activates them has not been verified. The CLI works wherever Node.js 22+ does.'], ['Is the audit third-party certification?', 'No. It is a reproducible self-assessment generated by the tool it audits. Every report lists what was not tested.']];
const INSTALL = 'npx contribsutra-ai audit --out audit';
const homeDesc = 'Offline, evidence-backed open-source contributor onboarding CLI and portable agent skills. Understand a repository, shortlist suitable issues, learn a small change and prepare an honest PR packet. Never submits anything.';
const home = `${head({title: 'ContribSutra AI · Your first open-source contribution, done respectfully', desc: homeDesc, canon: `${SITE}/`})}<script type="application/ld+json">${LD}</script></head><body class="home-page" id="top"><a class="skip" href="#main">Skip to content</a>${sprite}${topbar(true, '')}
<main id="main"><section class="hero"><div class="wrap hero-grid"><div><p class="badge"><span class="dot"></span>v${V} · Apache-2.0 · zero dependencies</p><h1>Find your first win. <span class="grad">Contribute with confidence.</span></h1><p class="lead">ContribSutra AI helps a first-time contributor understand a repository, pick a suitable issue, learn a small change and prepare an honest review packet, while protecting maintainers from low-quality automated pull requests. Offline. Read-only. It never submits anything.</p>
<div class="cta"><a class="btn primary" href="02-quick-start.html">Get started ${ic('arrow', 18)}</a><a class="btn" href="04-real-world-scenarios.html">See real scenarios</a></div>
<div class="install"><span class="prompt" aria-hidden="true">$</span><code>${INSTALL}</code><button class="copy-inline" type="button" aria-label="Copy install command">${ic('copy', 16)}<span>Copy</span></button></div>
<ul class="facts"><li>Node 22+</li><li>No API key</li><li>No network</li><li>HTML · MD · JSON</li></ul></div><div class="hero-art">${mock}</div></div></section>
<section class="statband" aria-label="Key facts"><div class="wrap"><ul><li><b>${env.pass}</b><span>tests passing</span></li><li><b>${A.total}</b><span>adversarial audit checks</span></li><li><b>${(fuzz.issueCases + fuzz.docCases).toLocaleString('en-US')}</b><span>fuzzed inputs, 0 crashes</span></li><li><b>25</b><span>portable skills</span></li><li><b>0</b><span>runtime dependencies</span></li></ul></div></section>
<section class="sec"><div class="wrap"><p class="kicker">The problem</p><h2>Contributing is hard. Reviewing is harder.</h2><p class="sub">Beginners cannot tell what a repository expects, which issue is safe, or what "ready" means. Maintainers pay for that confusion with unwanted, low-quality and bulk-generated pull requests. ContribSutra reduces both costs.</p><div class="feat-grid">${feat.map(([i, t, d]) => `<div class="feat"><div class="feat-ic">${ic(i, 22)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
<section class="sec alt"><div class="wrap"><p class="kicker">How it works</p><h2>From a cloned repo to a respectful pull request</h2><p class="sub">Every step is read-only and produces a sealed report. The last step belongs to you.</p><figure class="dia" style="margin:0">${DIAGRAMS.pipeline()}</figure>
<ol class="steps"><li><span class="n">1</span><h3>Understand</h3><p>Scan the repo and check your tools.</p><pre class="mini-code"><code>contribsutra scan --root ./repo</code></pre></li><li><span class="n">2</span><h3>Choose and learn</h3><p>Rank issues, then plan small steps.</p><pre class="mini-code"><code>contribsutra issues --issues issues.json</code></pre></li><li><span class="n">3</span><h3>Prepare</h3><p>Build an honest PR packet and audit it.</p><pre class="mini-code"><code>contribsutra pr-check --root ./repo</code></pre></li></ol></div></section>
<section class="sec"><div class="wrap"><p class="kicker">Who is in control</p><h2>The tool stops at planning</h2><p class="sub">Nine lifecycle states. ContribSutra can help up to planning. Authorising work, running tests, reviewing the diff and submitting are human-only.</p><figure class="dia" style="margin:0">${DIAGRAMS.lifecycle()}</figure></div></section>
<section class="sec alt"><div class="wrap"><p class="kicker">Real-world scenarios</p><h2>Situations you will recognise</h2><p class="sub">Each scenario is a step-by-step flowchart showing what happens with the tool and what usually happens without it.</p><div class="scn-grid">${scnDefs.map(([n, t, d, k]) => `<a class="scard ${k}" href="${scnLink(n)}"><span class="snum">${n}</span><h3>${t}</h3><p>${d}</p><span class="more">Read the scenario ${ic('arrow', 16)}</span></a>`).join('')}</div></div></section>
<section class="sec"><div class="wrap"><p class="kicker">Proof, with limits</p><h2>Measured, not promised</h2><p class="sub">Every number is regenerated from a real run on a stated machine. The audit is shown refusing an empty repository as well as passing a good one: an audit that never fails proves nothing.</p>${CHARTS.issues()}${CHARTS.verdicts()}${CHARTS.assurance()}${CHARTS.tests()}<p class="cta" style="margin-top:1.2rem"><a class="btn" href="12-assurance-and-evidence.html">Method and raw results ${ic('arrow', 18)}</a><a class="btn ghost" href="samples/audit/audit-report.html">Open the real sample report</a></p></div></section>
<section class="sec alt"><div class="wrap"><p class="kicker">Who uses it</p><h2>Built for people entering open source, and the people who welcome them</h2><div class="who"><div><b>First-time contributors</b><span>Know what to do next, and what not to do.</span></div><div><b>Maintainers</b><span>See what newcomers see; receive better PRs.</span></div><div><b>Mentors and educators</b><span>Run workshops without grading people.</span></div><div><b>Community leads</b><span>Audit repositories before an event.</span></div></div></div></section>
<section class="sec"><div class="wrap"><p class="kicker">Documentation</p><h2>Everything, in order</h2><div class="dgrid">${GROUPS.map(([g, slugs]) => `<div class="dgroup"><h3>${g}</h3><p>${slugs.length} pages</p><ul>${slugs.map(s => `<li><a href="${s}.html">${esc(pages.find(x => x.slug === s).title)}</a></li>`).join('')}</ul></div>`).join('')}</div></div></section>
<section class="sec alt"><div class="wrap narrow"><p class="kicker center">FAQ</p><h2 class="center">Quick answers</h2>${faq.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
<section class="cta-band"><div class="wrap"><h2>Contribute with confidence</h2><p>Free, offline and open source.</p><div class="install on-dark"><span class="prompt" aria-hidden="true">$</span><code>${INSTALL}</code><button class="copy-inline" type="button" aria-label="Copy install command">${ic('copy', 16)}<span>Copy</span></button></div><div class="cta center"><a class="btn light" href="${GH}" rel="noopener">View on GitHub</a><a class="btn outline" href="03-user-guide.html">Read the guide</a></div></div></section></main>${footer()}${tail(index)}`;
fs.writeFileSync(path.join(OUT, 'index.html'), home);
fs.writeFileSync(path.join(OUT, '404.html'), `${head({title: 'Page not found · ContribSutra AI', desc: 'Page not found', canon: `${SITE}/404.html`}).replace('href="assets/', 'href="/contribsutra-ai/assets/')}</head><body>${sprite}<main class="wrap narrow center" style="padding:5rem 0"><h1>Page not found</h1><p class="lead" style="margin-inline:auto">This page does not exist. Check the address, or start from the home page.</p><p class="cta center"><a class="btn primary" href="/contribsutra-ai/">Back to the home page</a></p></main><script src="/contribsutra-ai/assets/site.js" defer></script></body></html>`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', ...pages.map(p => p.slug + '.html'), 'samples/audit/audit-report.html'].map(u => `<url><loc>${SITE}/${u}</loc></url>`).join('')}</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.copyFileSync(path.join(PROJECT, 'llms.txt'), path.join(OUT, 'llms.txt'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.mkdirSync(path.join(HERE, 'md-rendered'), {recursive: true});
for (const f of fs.readdirSync(path.join(HERE, 'md-rendered'))) fs.rmSync(path.join(HERE, 'md-rendered', f), {force: true});
for (const p of pages) fs.writeFileSync(path.join(HERE, 'md-rendered', p.slug + '.md'), p.raw);
fs.writeFileSync(path.join(HERE, 'README.md'), `# ContribSutra AI — documents\n\nDocumentation website and Markdown set for **ContribSutra AI ${V}**.\n\n- Website source: \`md/\` (Markdown) built by \`build.mjs\` into \`html/\` (light default, dark toggle, responsive)\n- Rendered Markdown with real numbers: \`md-rendered/\`\n- Proof copied beside the pages: \`html/test-results/\`, \`html/samples/\`\n- Rebuild: \`npm run proof && npm run docs:build\`\n\nLive: ${SITE}/ · Repository: ${GH}\n`);
console.log(`built ${pages.length} pages + home + 404`);
