import {spawnSync} from 'node:child_process';
import {mkdtempSync, openSync, closeSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {reportSeal, safeText} from './util.mjs';

const NOT_FOUND = 'not found or failed';
const PROBE_TIMEOUT_MS = 10000;
// Fixed binaries and fixed arguments only: no repository-controlled string ever reaches a process.
const PROBES = [['git', ['--version']], ['npm', ['--version']], ['gh', ['--version']], ['python3', ['--version']], ['python', ['--version']], ['cargo', ['--version']], ['rustc', ['--version']], ['go', ['version']], ['docker', ['--version']]];

// Output goes to a temp file, not a pipe: if a probe spawns a grandchild (for example the Windows Store python
// alias) and the timeout kills only the direct child, a pipe would keep the caller blocked until the grandchild exits.
function binaryVersion(bin, args = ['--version']) {
  let dir;
  try {
    // npm is a .cmd shim on Windows; Node refuses to spawn it directly. Route it through cmd.exe with constant arguments.
    const [file, argv] = process.platform === 'win32' && bin === 'npm' ? ['cmd.exe', ['/d', '/c', 'npm', '--version']] : [bin, args];
    dir = mkdtempSync(path.join(os.tmpdir(), 'cs-probe-'));
    const outFile = path.join(dir, 'out.txt');
    const fd = openSync(outFile, 'w');
    let r;
    try { r = spawnSync(file, argv, {timeout: PROBE_TIMEOUT_MS, stdio: ['ignore', fd, 'ignore'], windowsHide: true}); } finally { closeSync(fd); }
    if (r.error || r.status !== 0) return NOT_FOUND;
    return safeText(readFileSync(outFile, 'utf8').trim().split(String.fromCharCode(10))[0].trim()) || NOT_FOUND;
  } catch { return NOT_FOUND; }
  finally { if (dir) rmSync(dir, {recursive: true, force: true}); }
}
// Versions do not change during one run; probing once keeps slow or hanging shims from being paid repeatedly.
const cache = new Map();
const probe = (bin, args) => cache.get(bin) ?? cache.set(bin, binaryVersion(bin, args)).get(bin);
const parts = v => String(v).replace(/^v/i, '').match(/\d+/g)?.slice(0, 3).map(Number) ?? null;
function cmp(a, b) { for (let i = 0; i < 3; i++) { const d = (a[i] ?? 0) - (b[i] ?? 0); if (d) return d; } return 0; }
function atom(version, token) {
  const m = /^(>=|<=|>|<|=|\^|~)?\s*v?(\d+(?:\.(?:\d+|x|\*))*)(?:\.[xX*])?$/.exec(token);
  if (!m) return null;
  const op = m[1] || '', want = m[2].replace(/\.(x|\*)/gi, '').split('.').map(Number);
  const c = cmp(version, want);
  if (op === '>=') return c >= 0; if (op === '>') return c > 0; if (op === '<=') return c <= 0; if (op === '<') return c < 0;
  if (op === '^') return c >= 0 && (want[0] > 0 ? version[0] === want[0] : version[0] === 0 && version[1] === (want[1] ?? 0));
  if (op === '~') return c >= 0 && version[0] === want[0] && version[1] === (want[1] ?? version[1]);
  // bare "20" / "20.x" / "3.11": same prefix; "3.11.2" must match all given parts.
  return want.every((n, i) => version[i] === n);
}
// Returns true/false, or null when the range syntax is not understood (never guess).
export function satisfies(installed, range) {
  const v = parts(installed); if (!v) return null;
  let understood = true;
  const ok = String(range).split('||').some(group => group.trim().split(/\s+/).filter(Boolean).every(tok => { const r = atom(v, tok); if (r === null) understood = false; return r; }));
  return understood ? ok : null;
}
function installedVersion(tool, tools) {
  if (tool === 'node') return process.version;
  const line = tool === 'python' ? (tools.python3 !== NOT_FOUND ? tools.python3 : tools.python) : tool === 'rust' ? tools.rustc : tools[tool];
  return line && line !== NOT_FOUND ? line : null;
}

export function environmentDoctor({requirements = []} = {}) {
  const tools = {};
  for (const [bin, args] of PROBES) tools[bin] = probe(bin, args);
  const recommendations = [];
  if (tools.git === NOT_FOUND) recommendations.push('Git not available from PATH; consult official https://git-scm.com/downloads for your OS and rerun doctor');
  if (tools.npm === NOT_FOUND) recommendations.push('npm not available from PATH; check a supported Node.js installation and official https://nodejs.org/en/download instructions');
  const observations = requirements.slice(0, 20).map(r => {
    const inst = installedVersion(r.tool, tools);
    if (!inst) return {tool: r.tool, declared: r.declared, installed: null, verdict: 'tool_missing', source: r.source};
    const ok = satisfies(inst, r.declared);
    return {tool: r.tool, declared: r.declared, installed: safeText(inst, 60), verdict: ok === null ? 'cannot_determine' : ok ? 'satisfied' : 'not_satisfied', source: r.source};
  });
  for (const o of observations) {
    if (o.verdict === 'tool_missing') recommendations.push(`${o.tool} is required (${o.declared}, ${o.source}) but was not found on PATH`);
    if (o.verdict === 'not_satisfied') recommendations.push(`Installed ${o.tool} ${o.installed} does not satisfy the declared ${o.declared} (${o.source})`);
  }
  return reportSeal({
    schemaVersion: '1.0', kind: 'contribsutra.environment-doctor',
    host: {platform: process.platform, arch: process.arch, node: process.version, cpuCount: os.cpus().length},
    tools, requirementChecks: observations, recommendations, status: 'INFORMATION_ONLY',
    restrictions: [
      'Only fixed version probes (git, npm, gh, python, cargo, rustc, go, docker) are launched; no repository scripts executed',
      'A tool version cannot establish that the full project setup has succeeded',
      'Declared ranges are compared with a small built-in matcher; unusual syntax yields cannot_determine, never a guess',
      'No credentials, user home path or environment variables exported'
    ]
  });
}
