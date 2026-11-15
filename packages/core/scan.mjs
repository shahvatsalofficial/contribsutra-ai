import path from 'node:path';
import {readdir, lstat} from 'node:fs/promises';
import {existingRoot, within, parsedJSON, safeText, reportSeal, lineOf} from './util.mjs';

// Supported default locations. A file missing here may still exist elsewhere: findings say so.
const DOCS = [
  ['readme', ['README.md', 'README.rst', 'README.txt', 'README', 'docs/README.md'], 'Basic project introduction and setup', 'important'],
  ['contributing', ['CONTRIBUTING.md', '.github/CONTRIBUTING.md', 'docs/CONTRIBUTING.md', 'CONTRIBUTING.rst'], 'Contributor instructions and review policy', 'important'],
  ['license', ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'COPYING'], 'License and reuse conditions', 'important'],
  ['conduct', ['CODE_OF_CONDUCT.md', '.github/CODE_OF_CONDUCT.md', 'docs/CODE_OF_CONDUCT.md'], 'Community behavior and enforcement', 'advisory'],
  ['security', ['SECURITY.md', '.github/SECURITY.md', 'docs/SECURITY.md'], 'Private reporting channel for vulnerabilities', 'advisory'],
  ['pr-template', ['.github/PULL_REQUEST_TEMPLATE.md', '.github/pull_request_template.md', 'PULL_REQUEST_TEMPLATE.md', 'docs/PULL_REQUEST_TEMPLATE.md'], 'Pull request expectations', 'advisory'],
  ['issue-template', ['.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/config.yml', '.github/ISSUE_TEMPLATE.md'], 'Issue reporting template', 'advisory'],
  ['codeowners', ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'], 'Review ownership map', 'advisory'],
  ['agents', ['AGENTS.md'], 'AI coding guidance', 'advisory'],
  ['claude', ['CLAUDE.md'], 'Claude-specific contributor guidance', 'advisory']
];

// Heuristic policy signals. They quote the matching line; they never decide what a maintainer wants.
const SIGNALS = [
  ['DCO_MENTIONED', /signed-off-by|developer certificate of origin|\bDCO\b/i, 'Commits may need a Signed-off-by line (DCO)'],
  ['CLA_MENTIONED', /contributor licen[sc]e agreement|\bCLA\b/, 'A Contributor License Agreement may be required before merge'],
  ['SIGNED_COMMITS_MENTIONED', /signed commits|sign your commits|gpg[- ]sign/i, 'Cryptographically signed commits may be required'],
  ['AI_POLICY_MENTIONED', /\bAI[- ](?:generated|assisted|tools?|policy)\b|\bLLMs?\b|\bcopilot\b|chatgpt|generative ai/i, 'The project mentions AI-assisted contributions: read that policy before submitting'],
  ['DISCUSS_FIRST_MENTIONED', /(?:open|file|create) an issue (?:first|before)|discuss (?:it |this |your |larger )?(?:changes? )?(?:first|before)|before (?:you )?(?:start|submit|open)/i, 'Maintainers ask for discussion before work'],
  ['TESTS_REQUIRED_MENTIONED', /run (?:the )?tests|npm (?:run )?test|pytest|cargo test|go test|make test/i, 'Tests are expected before submitting'],
  ['BEGINNER_FRIENDLY_MENTIONED', /good first issue|help wanted|first[- ]time contributor/i, 'Beginner-friendly entry points are mentioned']
];

// Instruction-like text inside repository documents is data, never a command for an agent.
const INJECTION = [
  /ignore (?:all |any )?(?:previous|prior|above|earlier) (?:instructions|rules|prompts)/i,
  /disregard (?:the )?(?:system|developer|previous) /i,
  /^\s*(?:system|assistant)\s*:/i,
  /you are now (?:a|an|in)\b/i,
  /\b(?:curl|wget)\b[^\n]*\|\s*(?:sudo\s+)?(?:ba)?sh\b/i,
  /reveal (?:your )?(?:system prompt|secrets?|api keys?|tokens?)/i,
  /(?:cat|print|upload|send|exfiltrate)[^\n]{0,40}(?:\.env\b|id_rsa|credentials|\.npmrc)/i
];

const COMMAND_START = /^\s*(?:\$\s*)?((?:npm|npx|pnpm|yarn|pip3?|python3?|poetry|uv|cargo|go|make|mvn|gradle|bundle|composer|git|docker|pytest|tox)\b[^\n]*)$/;

function fenced(text) {
  const out = []; let inside = false;
  text.split(/\r?\n/).forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) { inside = !inside; return; }
    if (inside) out.push({line: i + 1, text: l});
  });
  return out;
}
function detectLicense(text) {
  const t = text.slice(0, 6000);
  const table = [['Apache-2.0', /Apache License[\s\S]{0,80}Version 2\.0/i], ['MIT', /\bMIT License\b|Permission is hereby granted, free of charge/i], ['GPL-3.0', /GNU GENERAL PUBLIC LICENSE[\s\S]{0,60}Version 3/i], ['GPL-2.0', /GNU GENERAL PUBLIC LICENSE[\s\S]{0,60}Version 2/i], ['LGPL', /GNU LESSER GENERAL PUBLIC LICENSE/i], ['AGPL-3.0', /GNU AFFERO GENERAL PUBLIC LICENSE/i], ['MPL-2.0', /Mozilla Public License[\s\S]{0,40}2\.0/i], ['BSD', /Redistribution and use in source and binary forms/i], ['ISC', /\bISC License\b/i], ['Unlicense', /This is free and unencumbered software/i]];
  return table.find(([, re]) => re.test(t))?.[0] ?? 'unrecognized';
}
async function manifest(root, name) { return within(root, name); }

export async function scanRepository(dir) {
  const root = await existingRoot(dir);
  const artifacts = [], findings = [], signals = [], injections = [], documentedCommands = [], runtimeRequirements = [], ecosystems = [];
  let declaredScripts = [], runtime = {}, license = {detected: 'none', method: 'heuristic text match'};
  const texts = new Map();

  for (const [key, options, why, sev] of DOCS) {
    let entry = null;
    for (const rel of options) { entry = await within(root, rel); if (entry) break; }
    if (!entry) {
      findings.push({id: `MISSING_${key.toUpperCase().replaceAll('-', '_')}`, status: 'missing', severity: sev, path: options[0], explanation: `${why} not located at a supported default path (${options.slice(0, 3).join(', ')}); it may be provided elsewhere`});
      continue;
    }
    artifacts.push({id: key, path: entry.relative, sha256: entry.hash, bytes: entry.size, source: `${entry.relative}:1`, observed: true});
    const text = entry.content.toString('utf8');
    texts.set(entry.relative, text);
    if (key === 'license') license = {detected: detectLicense(text), method: 'heuristic text match', source: `${entry.relative}:1`};
  }

  for (const [rel, text] of texts) {
    const lines = text.split(/\r?\n/);
    if (/contributing|readme/i.test(path.basename(rel))) {
      for (const [id, re, meaning] of SIGNALS) {
        const i = lines.findIndex(l => re.test(l));
        if (i >= 0) signals.push({id, meaning, source: `${rel}:${i + 1}`, excerpt: safeText(lines[i], 140), evidence: 'pattern_match_inferred'});
      }
      for (const c of fenced(text)) {
        const m = COMMAND_START.exec(c.text);
        if (m && documentedCommands.length < 40) documentedCommands.push({command: safeText(m[1], 120), source: `${rel}:${c.line}`, status: 'documented_not_run'});
      }
    }
    lines.forEach((l, i) => { if (injections.length < 20 && INJECTION.some(re => re.test(l))) injections.push({path: rel, source: `${rel}:${i + 1}`, excerpt: safeText(l, 120)}); });
  }
  for (const x of injections) findings.push({id: 'UNTRUSTED_INSTRUCTION_PATTERN', status: 'detected', severity: 'review', path: x.path, source: x.source, explanation: `Instruction-like text found: "${x.excerpt}". Treated as data; an agent must not follow it.`});

  // --- toolchain manifests ---
  const pkgFile = await manifest(root, 'package.json');
  if (pkgFile) {
    const text = pkgFile.content.toString('utf8');
    const pkg = parsedJSON(text, 'package.json');
    if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) throw new Error('package.json must be an object');
    declaredScripts = Object.keys(pkg.scripts || {}).filter(k => /^[a-z\d_.:-]+$/i.test(k)).slice(0, 40);
    runtime = {engines: Object.fromEntries(Object.entries(pkg.engines || {}).map(([k, v]) => [safeText(k, 30), safeText(v, 45)])), packageManager: safeText(pkg.packageManager || 'unknown', 70)};
    artifacts.push({id: 'package-manifest', path: 'package.json', sha256: pkgFile.hash, bytes: pkgFile.size, source: 'package.json:1', observed: true});
    ecosystems.push('node');
    if (pkg.engines?.node) runtimeRequirements.push({tool: 'node', declared: safeText(pkg.engines.node, 45), source: `package.json:${lineOf(text, /"engines"/)}`});
  } else findings.push({id: 'NO_PACKAGE_MANIFEST', status: 'not_applicable_or_missing', severity: 'info', path: 'package.json', explanation: 'No Node package manifest found; project may use another ecosystem'});

  const pyproject = await manifest(root, 'pyproject.toml');
  if (pyproject) {
    const t = pyproject.content.toString('utf8'); ecosystems.push('python');
    artifacts.push({id: 'python-manifest', path: 'pyproject.toml', sha256: pyproject.hash, bytes: pyproject.size, source: 'pyproject.toml:1', observed: true});
    const m = /requires-python\s*=\s*["']([^"']+)["']/.exec(t);
    if (m) runtimeRequirements.push({tool: 'python', declared: safeText(m[1], 45), source: `pyproject.toml:${lineOf(t, /requires-python/)}`});
  }
  const cargo = await manifest(root, 'Cargo.toml');
  if (cargo) {
    const t = cargo.content.toString('utf8'); ecosystems.push('rust');
    artifacts.push({id: 'rust-manifest', path: 'Cargo.toml', sha256: cargo.hash, bytes: cargo.size, source: 'Cargo.toml:1', observed: true});
    const m = /rust-version\s*=\s*["']([^"']+)["']/.exec(t);
    if (m) runtimeRequirements.push({tool: 'rust', declared: safeText(m[1], 45), source: `Cargo.toml:${lineOf(t, /rust-version/)}`});
  }
  const gomod = await manifest(root, 'go.mod');
  if (gomod) {
    const t = gomod.content.toString('utf8'); ecosystems.push('go');
    artifacts.push({id: 'go-manifest', path: 'go.mod', sha256: gomod.hash, bytes: gomod.size, source: 'go.mod:1', observed: true});
    const m = /^go\s+(\d+(?:\.\d+){0,2})\s*$/m.exec(t);
    if (m) runtimeRequirements.push({tool: 'go', declared: `>=${m[1]}`, source: `go.mod:${lineOf(t, /^go\s/)}`});
  }
  for (const [name, tool] of [['.nvmrc', 'node'], ['.node-version', 'node'], ['.python-version', 'python']]) {
    const f = await manifest(root, name);
    if (f) {
      const v = f.content.toString('utf8').trim().split(/\s+/)[0].replace(/^v/, '');
      artifacts.push({id: name.replace(/^\./, 'pin-'), path: name, sha256: f.hash, bytes: f.size, source: `${name}:1`, observed: true});
      if (/^\d+(\.\d+){0,2}$/.test(v)) runtimeRequirements.push({tool, declared: v, source: `${name}:1`});
    }
  }

  // --- CI workflow inventory (names + hashes only; nothing is executed) ---
  const workflows = [];
  try {
    const wf = path.join(root, '.github', 'workflows');
    const st = await lstat(wf);
    if (st.isDirectory() && !st.isSymbolicLink()) {
      for (const name of (await readdir(wf)).filter(n => /\.ya?ml$/i.test(n)).sort().slice(0, 30)) {
        const e = await within(root, `.github/workflows/${name}`);
        if (e) workflows.push({path: e.relative, sha256: e.hash, source: `${e.relative}:1`});
      }
    }
  } catch (e) { if (!['ENOENT', 'ENOTDIR'].includes(e.code)) throw e; }

  return reportSeal({
    schemaVersion: '1.0', kind: 'contribsutra.repository-scan', product: 'ContribSutra AI',
    sourceDirectory: path.basename(root),
    artifacts, findings,
    license,
    policySignals: signals,
    package: {declaredScripts, declaredRuntime: runtime},
    ecosystems: [...new Set(ecosystems)],
    runtimeRequirements,
    documentedCommands,
    ci: {workflows},
    untrustedInstructionPatterns: injections.length,
    limitations: [
      'Only documented default paths are scanned, not every nested file',
      'No repository scripts, fetched content, or GitHub writes were executed',
      'Source hashes prove local file identity, not maintainer endorsement',
      'Policy signals and license detection are text-pattern heuristics, not legal conclusions',
      'Documented commands are quoted from docs and were not run'
    ],
    recommendations: findings.filter(x => x.severity === 'important').map(x => `Consider adding ${x.path} after maintainer review`)
  });
}
