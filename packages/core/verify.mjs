import {readFile} from 'node:fs/promises';
import {existingRoot, within, parsedJSON, checkSeal} from './util.mjs';

export async function verifyReport(report, root) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) throw new Error('Report must be a JSON object');
  const intact = checkSeal(report);
  const findings = [];
  let sourceChecked = false;
  if (report.kind === 'contribsutra.repository-scan' && root) {
    const r = await existingRoot(root); sourceChecked = true;
    for (const item of report.artifacts || []) {
      let source = null;
      try { source = await within(r, item.path); } catch { source = null; }
      findings.push({path: item.path, status: source?.hash === item.sha256 ? 'MATCH' : 'STALE_OR_MISSING'});
    }
  }
  return {
    kind: report.kind ?? 'unknown', integrity: intact ? 'MATCH' : 'MISMATCH',
    sourceChecks: findings, sourceChecked,
    verified: intact && findings.every(f => f.status === 'MATCH'),
    note: 'A SHA-256 seal detects accidental change; it is not a signature and does not prove who made the report.'
  };
}
export async function readReport(file) {
  const content = await readFile(file);
  if (content.length > 8 * 1024 * 1024) throw new Error('Report too large');
  return parsedJSON(content.toString('utf8'), 'Report');
}
