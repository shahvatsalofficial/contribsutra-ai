import {createHash} from 'node:crypto';
import {readFile, lstat, realpath} from 'node:fs/promises';
import path from 'node:path';

export function sha256(value) { return createHash('sha256').update(value).digest('hex'); }

// Heuristic redaction. It reduces accidental leakage; it cannot prove that no sensitive text remains.
export function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/(?:gh[pousr]_[A-Za-z0-9_]{15,}|github_pat_[A-Za-z0-9_]{15,}|npm_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,})/g, '[REDACTED_TOKEN]')
    .replace(/(https?:\/\/)[^\s/@:]+:[^\s/@]+@/gi, '$1[REDACTED_CREDENTIALS]@')
    .replace(/\b([\w.+-]+)@[\w.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(/((?:password|passwd|api[_-]?key|auth[_-]?token|access[_-]?token|secret)\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}
export function safeText(value, max = 180) {
  return sanitize(String(value ?? '').replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max));
}
export async function existingRoot(root) {
  const resolved = path.resolve(root);
  let st;
  try { st = await lstat(resolved); } catch (e) { if (e.code === 'ENOENT') throw new Error(`Target repository not found: ${path.basename(resolved)}`); throw e; }
  if (!st.isDirectory() || st.isSymbolicLink()) throw new Error('Target repository must be a real directory');
  return resolved;
}
// Read one file below root. Returns null when absent, a symlink, or outside the real root.
export async function within(root, relative, maxBytes = 256 * 1024) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).some(x => x === '..')) throw new Error('Unsafe source path');
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Unsafe source path');
  const realRoot = await realpath(root);
  let st;
  try { st = await lstat(target); } catch (e) { if (e.code === 'ENOENT' || e.code === 'ENOTDIR') return null; throw e; }
  if (st.isSymbolicLink() || !st.isFile()) return null;
  const actual = await realpath(target);
  if (!actual.startsWith(realRoot + path.sep)) return null;
  if (st.size > maxBytes) throw new Error(`Source file too large: ${relative}`);
  const content = await readFile(target);
  return {relative, content, hash: sha256(content), size: content.length};
}
export function parsedJSON(value, context = 'Input') { try { return JSON.parse(value); } catch { throw new Error(`${context} must contain valid JSON`); } }
export function reportSeal(data) { const {seal, ...rest} = data; return {...rest, seal: {method: 'SHA-256 JSON serialization', hash: sha256(JSON.stringify(rest))}}; }
export function checkSeal(report) { return !!report?.seal && report.seal.hash === sha256(JSON.stringify(Object.fromEntries(Object.entries(report).filter(([k]) => k !== 'seal')))); }
export function enforceOutputOutside(root, output) {
  const p = path.resolve(output); const r = path.resolve(root);
  if (p === r || p.startsWith(r + path.sep)) throw new Error('Report output must be outside the inspected repository; use a separate reports directory');
  return p;
}
export function markdownSafe(v) { return safeText(v, 240).replaceAll('|', '\\|').replaceAll('`', "'").replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
// 1-based line number of the first match of `re` in `text`, or 1 when absent.
export function lineOf(text, re) {
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i + 1;
  return 1;
}
export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, x => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[x]));
