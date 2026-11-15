#!/usr/bin/env node
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scanRepository} from '../core/scan.mjs';
import {environmentDoctor} from '../core/doctor.mjs';
import {loadIssueSnapshot, rankIssues} from '../core/issues.mjs';
import {createLearningPlan, checkPullRequest} from '../core/plan.mjs';
import {readReport, verifyReport} from '../core/verify.mjs';
import {enforceOutputOutside, existingRoot, parsedJSON, sha256, checkSeal} from '../core/util.mjs';
import {asFileFormats, renderMarkdown, renderHtml} from '../reporting/index.mjs';
import {installSkills} from '../core/install.mjs';
import {runAudit} from '../core/audit.mjs';
import {startServer} from '../server/index.mjs';
import {VERSION} from '../core/version.mjs';

const SELF = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BOOLEAN = new Set(['json', 'quiet', 'force', 'help', 'version']);
export function parse(args) {
  const opts = {}, pos = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h') { opts.help = true; continue; }
    if (arg === '-v') { opts.version = true; continue; }
    if (!arg.startsWith('--')) { pos.push(arg); continue; }
    const key = arg.slice(2);
    if (!key) throw new Error('Unexpected option: --');
    if (BOOLEAN.has(key)) { opts[key] = true; continue; }
    if (args[i + 1] === undefined || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
    opts[key] = args[++i];
  }
  return {opts, pos};
}
const needed = (opts, k) => { if (!opts[k]) throw new Error(`Missing --${k}`); return opts[k]; };
const skillsOf = opts => (opts.skills || '').split(',').map(s => s.trim()).filter(Boolean);
const num = (v, name) => { const n = Number(v); if (!Number.isSafeInteger(n) || n < 1) throw new Error(`--${name} must be a positive integer`); return n; };

async function writeAll(dir, name, report, {force = false} = {}) {
  const files = asFileFormats(report);
  await mkdir(dir, {recursive: true});
  const flag = force ? 'w' : 'wx';
  const written = [];
  for (const [ext, data] of Object.entries(files)) {
    const f = path.join(dir, `${name}.${ext}`);
    try { await writeFile(f, data, {flag}); } catch (e) { if (e.code === 'EEXIST') throw new Error(`Refusing to overwrite ${f}; pass --force or choose another --out`); throw e; }
    written.push(f);
  }
  return written;
}
async function persist(out, report, force) {
  const p = path.resolve(out);
  const stem = p.replace(/\.(json|md|html)$/i, '');
  return writeAll(path.dirname(stem), path.basename(stem), report, {force});
}

export const HELP = `ContribSutra AI ${VERSION} — Understand the Code. Find Your First Win. Contribute with Confidence.
Created by Vatsal Shah · Apache-2.0 · offline, no API keys, read-only by default

Usage: contribsutra <command> [options]

Commands
  doctor [--root DIR]                         check installed tools (and compare with a repo's declared needs)
  scan --root DIR [--out FILE]                map a local repository: policies, license, toolchain, source hashes
  issues --issues FILE [--skills a,b] [--as-of ISO] [--out FILE]
                                              rank a local issue snapshot with reasons and warnings
  plan --root DIR --issues FILE --issue N [--mode guided|collaborative|self-directed] [--out FILE]
  pr-check --root DIR --issue N [--evidence FILE] [--out FILE]
                                              draft a PR packet; test claims stay unverified
  verify --report FILE [--root DIR]           check a report's integrity (and source freshness)
  render --report FILE --format md|html --out FILE
  audit --out DIR [--root DIR] [--issues FILE]   independent audit: JSON + Markdown + HTML + SHA256SUMS
  install-skills --ide claude|cursor|codex|gemini|copilot|opencode --project DIR
  serve --report FILE [--port N]              localhost-only report endpoint (needs CONTRIBSUTRA_SERVER_TOKEN)
  demo                                        regenerate examples/reports from the bundled fixture
  version

Flags: --json (print JSON even with --out) · --quiet · --force (overwrite outputs) · -h/--help · -v/--version
--out writes FILE.json + FILE.md + FILE.html. Output must be outside the inspected repository.
Exit codes: 0 ok · 1 audit gaps/failed verification · 2 usage or input error.`;

export async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0] && !argv[0].startsWith('-') ? argv[0] : null;
  const {opts} = parse(cmd ? argv.slice(1) : argv);
  const out = s => process.stdout.write(s);
  if (!cmd && opts.version || cmd === 'version') return out(VERSION + '\n');
  if (!cmd || cmd === 'help' || opts.help) { out(HELP + '\n'); if (cmd && cmd !== 'help' && !opts.help) process.exitCode = 2; return; }
  let report;

  switch (cmd) {
    case 'doctor': {
      const requirements = opts.root ? (await scanRepository(await existingRoot(opts.root))).runtimeRequirements : [];
      report = environmentDoctor({requirements}); break;
    }
    case 'scan': {
      const root = await existingRoot(needed(opts, 'root'));
      if (opts.out) enforceOutputOutside(root, opts.out);
      report = await scanRepository(root); break;
    }
    case 'issues': {
      const snap = await loadIssueSnapshot(needed(opts, 'issues'));
      report = rankIssues(snap.issues, {skills: skillsOf(opts), sourceHash: snap.sourceHash, asOf: opts['as-of'] || null}); break;
    }
    case 'plan': {
      const root = await existingRoot(needed(opts, 'root'));
      if (opts.out) enforceOutputOutside(root, opts.out);
      const snap = await loadIssueSnapshot(needed(opts, 'issues'));
      const scan = await scanRepository(root);
      const ranked = rankIssues(snap.issues, {skills: skillsOf(opts), sourceHash: snap.sourceHash, asOf: opts['as-of'] || null});
      report = createLearningPlan(scan, ranked, num(needed(opts, 'issue'), 'issue'), {mode: opts.mode || 'guided'}); break;
    }
    case 'pr-check': {
      const root = await existingRoot(needed(opts, 'root'));
      if (opts.out) enforceOutputOutside(root, opts.out);
      const scan = await scanRepository(root);
      const evidence = opts.evidence ? parsedJSON(await readFile(opts.evidence, 'utf8'), 'Evidence') : {};
      report = checkPullRequest({scan, evidence, issueNumber: opts.issue ? num(opts.issue, 'issue') : undefined}); break;
    }
    case 'verify': {
      const result = await verifyReport(await readReport(needed(opts, 'report')), opts.root);
      out(JSON.stringify(result, null, 2) + '\n');
      if (!result.verified) process.exitCode = 1;
      return;
    }
    case 'render': {
      const input = await readReport(needed(opts, 'report'));
      if (!checkSeal(input)) throw new Error('Report integrity check failed; refusing to render');
      const format = opts.format || 'md';
      if (!['md', 'html'].includes(format)) throw new Error('--format must be md or html');
      const target = path.resolve(needed(opts, 'out'));
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, format === 'md' ? renderMarkdown(input) : renderHtml(input), {flag: opts.force ? 'w' : 'wx'});
      if (!opts.quiet) out(`Wrote ${target}\n`);
      return;
    }
    case 'audit': {
      const dir = path.resolve(needed(opts, 'out'));
      const root = opts.root ? await existingRoot(opts.root) : undefined;
      if (root) enforceOutputOutside(root, dir);
      const {summary, artifacts} = await runAudit({root, issuesFile: opts.issues});
      await mkdir(dir, {recursive: true});
      const sums = [];
      const put = async (name, text) => { await writeFile(path.join(dir, name), text, opts.force ? {flag: 'w'} : {flag: 'w'}); sums.push(`${sha256(Buffer.from(text))}  ${name}`); };
      for (const [name, art] of Object.entries(artifacts)) await put(name, JSON.stringify(art, null, 2) + '\n');
      const withHashes = {...summary, artifacts: Object.fromEntries(sums.map(l => { const [h, n] = l.split('  '); return [n, h]; }))};
      const sealed = {...withHashes}; // hashes added after sealing the findings: re-seal so the file is self-consistent
      const {reportSeal} = await import('../core/util.mjs');
      const final = reportSeal(sealed);
      await put('audit-report.json', JSON.stringify(final, null, 2) + '\n');
      await put('audit-report.md', renderMarkdown(final));
      await put('audit-report.html', renderHtml(final));
      await writeFile(path.join(dir, 'SHA256SUMS.txt'), sums.join('\n') + '\n');
      const result = {verdict: final.verdict, assurance: `${final.assurance.passed} passed, ${final.assurance.failed} failed, ${final.assurance.skipped} skipped`, outputDirectory: dir, files: [...Object.keys(artifacts), 'audit-report.json', 'audit-report.md', 'audit-report.html', 'SHA256SUMS.txt']};
      if (!opts.quiet) out(JSON.stringify(result, null, 2) + '\n');
      if (final.verdict === 'ASSURANCE_FAILED') process.exitCode = 1;
      return;
    }
    case 'install-skills': {
      const result = await installSkills(needed(opts, 'project'), needed(opts, 'ide'));
      out(JSON.stringify(result, null, 2) + '\n'); return;
    }
    case 'serve': {
      const token = process.env.CONTRIBSUTRA_SERVER_TOKEN;
      if (!token) throw new Error('CONTRIBSUTRA_SERVER_TOKEN must be set');
      const started = await startServer({reportFile: needed(opts, 'report'), token, port: opts.port ? Number(opts.port) : 0});
      out(`ContribSutra localhost API on http://127.0.0.1:${started.address.port}/report ; token not printed\n`); return;
    }
    case 'demo': {
      const root = path.join(SELF, 'fixtures/demo-repo');
      const dest = path.join(SELF, 'examples/reports');
      const scan = await scanRepository(root);
      const snap = await loadIssueSnapshot(path.join(SELF, 'fixtures/issues.json'));
      const issues = rankIssues(snap.issues, {skills: ['documentation', 'javascript'], sourceHash: snap.sourceHash, asOf: '2026-11-16T00:00:00Z'});
      const plan = createLearningPlan(scan, issues, 101);
      const evidence = parsedJSON(await readFile(path.join(SELF, 'fixtures/pr-evidence.json'), 'utf8'), 'Evidence');
      const pr = checkPullRequest({scan, evidence, issueNumber: 101});
      for (const [n, v] of Object.entries({scan, issues, plan, pr})) await writeAll(dest, n, v, {force: true});
      out('Demo completed; see examples/reports/*.json, *.md, *.html\n'); return;
    }
    default:
      out(HELP + '\n'); process.exitCode = 2; return;
  }
  if (opts.out) {
    const written = await persist(opts.out, report, !!opts.force);
    if (!opts.quiet) out(`Report written: ${written[0]} (+ .md, .html)\n`);
    if (opts.json) out(JSON.stringify(report, null, 2) + '\n');
  } else out(JSON.stringify(report, null, 2) + '\n');
}

// argv[1] can be a symlink created by npm (node_modules/.bin/contribsutra); compare real paths.
function isMain() {
  try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
}
if (isMain()) main().catch(e => { process.stderr.write('ContribSutra: ' + e.message + '\n'); process.exitCode = 2; });
