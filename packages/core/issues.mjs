import {readFile} from 'node:fs/promises';
import {sha256, parsedJSON, safeText, reportSeal} from './util.mjs';

export async function loadIssueSnapshot(file) {
  const b = await readFile(file);
  if (b.length > 512 * 1024) throw new Error('Issue snapshot too large');
  const raw = parsedJSON(b.toString('utf8'), 'Issue snapshot');
  if (!Array.isArray(raw) || raw.length > 250) throw new Error('Issue snapshot must be an array of at most 250 issues');
  return {issues: raw, sourceHash: sha256(b)};
}
function labelsOf(issue) {
  return Array.isArray(issue.labels) ? issue.labels.slice(0, 30).map(x => typeof x === 'string' ? x : x?.name).filter(x => typeof x === 'string').map(x => x.toLowerCase().trim()) : [];
}
// Issue text is untrusted. These patterns only DETECT instruction-like text; matched text is never echoed.
const INJECTION = [/ignore (?:all |any )?(?:previous|prior|above|earlier) (?:instructions|rules|prompts)/i, /^\s*(?:system|assistant)\s*:/im, /you are now (?:a|an|in)\b/i, /\b(?:curl|wget)\b[^\n]*\|\s*(?:sudo\s+)?(?:ba)?sh\b/i, /(?:steal|exfiltrate|reveal|send|upload)[^\n]{0,40}(?:secrets?|tokens?|credentials|api keys?|\.env|id_rsa)/i, /disregard (?:the )?(?:system|developer|previous)/i];
const SECURITY_TITLE = /\b(?:vulnerabilit\w*|cve-\d{4}-\d+|exploit\w*|security|secret exposure|leak(?:ed|s)? (?:key|token|secret|password))\b/i;
const LARGE_TITLE = /\b(?:entire|rewrite|overhaul|migrat\w+ (?:the )?(?:whole|entire|all)|re-?architect\w*|from scratch)\b/i;
const LARGE_LABEL = /^(?:epic|large|major|breaking|breaking[- ]change|refactor|needs[- ]design|rfc)$/;
const normTitle = t => t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

export function rankIssues(items, {skills = [], sourceHash = 'unspecified', asOf = null, staleDays = 180} = {}) {
  if (!Array.isArray(items)) throw new Error('issues must be an array');
  const seen = new Set();
  const normalizedSkills = new Set(skills.map(s => s.toLowerCase().trim()).filter(Boolean));
  const asOfMs = asOf ? Date.parse(asOf) : NaN;
  if (asOf && Number.isNaN(asOfMs)) throw new Error('asOf must be an ISO date');
  const titleOwners = new Map();
  for (const issue of items) {
    if (issue && Number.isSafeInteger(issue.number) && String(issue.state || 'open').toLowerCase() === 'open' && !issue.pull_request) {
      const k = normTitle(String(issue.title ?? '')); if (k) titleOwners.set(k, [...(titleOwners.get(k) || []), issue.number]);
    }
  }
  const ranked = items.map(issue => {
    if (!issue || !Number.isSafeInteger(issue.number) || issue.number <= 0 || seen.has(issue.number)) throw new Error('Issue number must be a unique positive integer');
    seen.add(issue.number);
    const title = safeText(issue.title, 160), labels = labelsOf(issue), reasons = [], warnings = [];
    const rawTitle = String(issue.title ?? ''), rawBody = typeof issue.body === 'string' ? issue.body.slice(0, 20000) : '';
    let score = 0, eligible = true, freshness = 'unknown';
    const status = String(issue.state || 'open').toLowerCase();
    if (status !== 'open' || issue.pull_request) { eligible = false; warnings.push('Not an open issue'); }
    if (issue.assignee || (Array.isArray(issue.assignees) && issue.assignees.length)) { eligible = false; warnings.push('Issue appears assigned; check with maintainer before work'); }
    if (issue.locked) { eligible = false; warnings.push('Issue is locked; discussion is closed to contributors'); }
    if (labels.some(l => /^(security|private|blocked|wontfix|invalid|needs[- ]triage|duplicate)$/.test(l))) { eligible = false; warnings.push('Issue labels indicate restricted or non-actionable work'); }
    if (SECURITY_TITLE.test(rawTitle)) { eligible = false; warnings.push('Possible security-sensitive issue: follow the project SECURITY policy and report privately, not through a public PR'); }
    if (INJECTION.some(re => re.test(rawTitle) || re.test(rawBody))) { eligible = false; warnings.push('Issue text contains instruction-like content; it is treated as data and not recommended until a human reviews it'); }
    if (labels.includes('good first issue')) { score += 50; reasons.push('Maintainer-provided good first issue label'); }
    if (labels.includes('help wanted')) { score += 20; reasons.push('Maintainer-provided help wanted label'); }
    if (labels.includes('documentation') || labels.includes('docs')) { score += 8; reasons.push('Documentation contribution scope'); }
    const skillMatches = labels.filter(l => normalizedSkills.has(l));
    if (skillMatches.length) { score += 12; reasons.push(`Declared skill matches labels: ${skillMatches.join(', ')}`); }
    else { const t = normTitle(rawTitle).split(' '); const hit = [...normalizedSkills].filter(s => t.includes(s)); if (hit.length) { score += 6; reasons.push(`Declared skill appears in title: ${hit.join(', ')}`); } }
    if (!labels.some(l => l === 'good first issue' || l === 'help wanted')) warnings.push('Maintainer invitation is not evidenced by recognized labels; seek permission before proposing work');
    if (labels.some(l => LARGE_LABEL.test(l)) || LARGE_TITLE.test(rawTitle)) { score = Math.max(0, score - 25); warnings.push('Likely large scope for a first contribution; ask a maintainer to narrow it'); }
    if (!rawBody) warnings.push('Issue body is not in the snapshot; read the full issue before starting');
    else if (rawBody.trim().length < 40 && !/acceptance|expected/i.test(rawBody)) warnings.push('Little detail or acceptance criteria detected; clarify the expected outcome first');
    const dupes = (titleOwners.get(normTitle(rawTitle)) || []).filter(n => n !== issue.number);
    if (dupes.length) warnings.push(`Possible duplicate of #${dupes.slice(0, 3).join(', #')}`);
    const stamp = issue.updated_at || issue.updatedAt;
    if (stamp && !Number.isNaN(asOfMs)) {
      const days = Math.floor((asOfMs - Date.parse(stamp)) / 86400000);
      if (Number.isFinite(days)) { freshness = days > staleDays ? 'stale' : 'recent'; if (days > staleDays) { score = Math.max(0, score - 10); warnings.push(`No activity for ${days} days; confirm the issue is still wanted`); } }
    }
    if (!title) warnings.push('Issue lacks a usable title');
    const ok = eligible && !!title;
    return {number: issue.number, title, labels, score: ok ? score : 0, eligible: ok, reasons, warnings, freshness, source: `issue-snapshot:#${issue.number}`, verification: 'metadata_only_not_live_verified'};
  }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score || a.number - b.number);
  return reportSeal({
    schemaVersion: '1.0', kind: 'contribsutra.issue-shortlist', issueSnapshotSha256: sourceHash,
    filters: {declaredSkills: [...normalizedSkills], asOf: asOf || null, staleDays},
    summary: {total: ranked.length, eligible: ranked.filter(x => x.eligible).length, declined: ranked.filter(x => !x.eligible).length},
    ranked,
    limitations: ['Offline snapshot only; issue state/assignment can change', 'Scores are explainable heuristics, not predictions of acceptance', 'No issue comments, PRs or other GitHub mutations performed', 'Issue bodies are scanned for risk but never copied into reports']
  });
}
