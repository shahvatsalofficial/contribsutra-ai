import {safeText, reportSeal} from './util.mjs';

export const MODES = ['guided', 'collaborative', 'self-directed'];
// Human-controlled lifecycle. The tool may only ever advance to `planning`; the rest need a person.
export const STATES = ['discovered', 'understood', 'shortlisted', 'approved_scope', 'planning', 'implementation_authorized', 'observed_tests', 'review_ready', 'submitted_by_human'];

export function createLearningPlan(scan, issueReport, issueNumber, {mode = 'guided'} = {}) {
  if (!MODES.includes(mode)) throw new Error(`Learning mode must be one of: ${MODES.join(', ')}`);
  const issue = issueReport.ranked.find(x => x.number === issueNumber);
  if (!issue) throw new Error('Requested issue is not present in snapshot');
  const repoDocs = scan.artifacts.map(x => x.path);
  const hasContrib = repoDocs.some(p => /(^|\/)CONTRIBUTING\./i.test(p));
  const needApproval = issue.eligible ? issue.warnings.some(x => x.includes('Maintainer invitation')) : true;
  const sig = id => scan.policySignals?.find(s => s.id === id);
  const raw = [
    {id: 'learn-01', title: 'Read project contribution guidance', instructions: hasContrib ? 'Read the contribution guide, README, LICENSE and CODE_OF_CONDUCT; note relevant requirements' : 'Locate the correct contribution instructions, or ask a maintainer before proposing changes', hint: 'Look for: how to propose a change, branch naming, required checks, who reviews.', acceptance: 'You can state in two sentences how this project wants contributions.', verification: 'manual_review_pending', humanReview: false},
    {id: 'learn-02', title: 'Understand issue scope', instructions: `Read issue #${issue.number}, confirm it is open/unassigned and restate a small expected outcome; imported state may be stale`, hint: 'Write the outcome as "after this change, X behaves like Y".', acceptance: 'A one-sentence outcome that a maintainer could agree or disagree with.', verification: 'manual_review_pending', humanReview: true},
    {id: 'learn-03', title: 'Plan a minimal change', instructions: 'Identify affected files, limit scope, and write a small acceptance check before editing', hint: 'Smaller is better: one concern, as few files as possible.', acceptance: 'A list of files and one check that fails before and passes after.', verification: 'not_run', humanReview: true},
    {id: 'learn-04', title: 'Make change with human review', instructions: 'Work in an approved branch/fork; never edit or push a third-party repository automatically', hint: 'Make the check fail first, then make the smallest change that passes it.', acceptance: 'A reviewable diff you can explain line by line.', verification: 'not_run', humanReview: true},
    {id: 'learn-05', title: 'Validate with project procedures', instructions: 'Run explicit approved tests after checking scripts and dependencies; record actual output with environment and source revision', hint: 'Copy the exact command, the date, and the result. Failures are useful: record them too.', acceptance: 'Captured output of the project\'s own checks, or an honest "not run".', verification: 'not_run', humanReview: false},
    {id: 'learn-06', title: 'Prepare evidence-backed draft PR', instructions: 'Create a PR draft for human review; do not claim passing tests until independently executed and captured; do not submit without maintainer-aligned intent', hint: 'Use `contribsutra pr-check` to draft the description, then edit it in your own words.', acceptance: 'A draft a maintainer can review in minutes, with limits stated.', verification: 'not_run', humanReview: true}
  ];
  const steps = raw.map(({hint, ...s}) => mode === 'self-directed' ? s : mode === 'collaborative' ? {...s, discussion: `Which part of this step is least clear to you? ${hint}`} : {...s, hint});
  const policyReminders = [];
  if (sig('DCO_MENTIONED')) policyReminders.push(`DCO may apply (${sig('DCO_MENTIONED').source}): commits may need "git commit -s"`);
  if (sig('CLA_MENTIONED')) policyReminders.push(`A CLA may apply (${sig('CLA_MENTIONED').source}): check before opening a PR`);
  if (sig('AI_POLICY_MENTIONED')) policyReminders.push(`The project mentions AI-assisted work (${sig('AI_POLICY_MENTIONED').source}): read and follow that policy`);
  if (sig('DISCUSS_FIRST_MENTIONED')) policyReminders.push(`Maintainers ask for discussion first (${sig('DISCUSS_FIRST_MENTIONED').source})`);
  const blockedReasons = issue.eligible ? [] : issue.warnings.slice(0, 5);
  return reportSeal({
    schemaVersion: '1.0', kind: 'contribsutra.learning-plan', mode,
    issue: {number: issue.number, title: safeText(issue.title), score: issue.score, eligible: issue.eligible, source: issue.source},
    maintainerApprovalRecommended: needApproval,
    blocked: !issue.eligible, blockedReasons, policyReminders,
    lifecycle: {states: STATES, current: issue.eligible ? 'planning' : 'shortlisted', humanOnlyTransitions: ['approved_scope', 'implementation_authorized', 'observed_tests', 'review_ready', 'submitted_by_human']},
    steps,
    references: {sourceScanHash: scan.seal.hash, issueSnapshotHash: issueReport.seal.hash},
    status: 'PLANNED_NOT_EXECUTED',
    limitations: ['No source code was modified, no issue assigned, no PR submitted', 'Do not assume maintainer approval based on label alone', 'The plan teaches steps; it does not write the solution for you']
  });
}

const CLAIM = {pass: 'reported_passed', passed: 'reported_passed', fail: 'reported_failed', failed: 'reported_failed'};
export function checkPullRequest({scan, evidence = {}, issueNumber} = {}) {
  if (!scan) throw new Error('scan result required');
  const statements = [];
  const raw = Array.isArray(evidence.tests) ? evidence.tests : [];
  const tests = raw.slice(0, 100).map(x => ({
    name: safeText(x?.name || 'unnamed test', 100),
    userReportedStatus: CLAIM[String(x?.status || '').toLowerCase()] ?? 'not_run',
    verification: 'unverified_external_claim',
    evidenceFile: safeText(x?.evidenceFile || 'not_supplied', 100)
  }));
  if (!tests.length) statements.push({status: 'NOT_RUN', message: 'No test evidence supplied'});
  else statements.push({status: 'REVIEW', message: 'User-supplied test statuses are not independently executed or verified by ContribSutra'});
  for (const [key, label] of [['readme', 'README.md'], ['contributing', 'CONTRIBUTING.md'], ['license', 'LICENSE']]) {
    if (!scan.artifacts.some(x => x.id === key)) statements.push({status: 'GAP', message: `${label} missing at default path; maintainer policy must be checked`});
  }
  const issueOk = Number.isSafeInteger(issueNumber) && issueNumber >= 1;
  if (!issueOk) statements.push({status: 'GAP', message: 'Issue number missing; confirm the contribution is wanted'});
  const ai = ['none', 'assisted', 'generated'].includes(evidence.aiAssistance) ? evidence.aiAssistance : 'undeclared';
  if (ai === 'undeclared') statements.push({status: 'GAP', message: 'AI assistance not declared; disclose it if the project policy asks'});
  const files = (Array.isArray(evidence.changedFiles) ? evidence.changedFiles : []).slice(0, 60).map(f => safeText(f, 120));
  const checklist = ['Confirm maintainer issue or proposal invitation', 'Read security and contribution policies', 'Review the actual diff and protect sensitive files', 'Run approved tests and attach verifiable results', 'Disclose AI assistance if required by project policy', 'Ask a person to approve submission; never auto-open or auto-merge'];
  const sig = id => scan.policySignals?.find(s => s.id === id);
  if (sig('DCO_MENTIONED')) checklist.push(`Sign off commits if the project requires it (${sig('DCO_MENTIONED').source})`);
  if (sig('CLA_MENTIONED')) checklist.push(`Complete the CLA if required (${sig('CLA_MENTIONED').source})`);
  const channels = {
    verified: [`${scan.artifacts.length} repository files hashed at scan time (SHA-256)`],
    userReported: tests.filter(t => t.userReportedStatus !== 'not_run').map(t => `${t.name}: ${t.userReportedStatus}`),
    inferredOrRecommended: checklist.slice(0, 3),
    notRunOrUnknown: ['Tests were not executed by ContribSutra', 'Maintainer intent for this issue is unknown', ...tests.filter(t => t.userReportedStatus === 'not_run').map(t => `${t.name}: no pass/fail claim`)]
  };
  const description = [
    `## Purpose`, '', issueOk ? `Addresses #${issueNumber}. (Replace with one sentence in your own words.)` : '(Link the issue and state the purpose.)', '',
    `## Scope`, '', files.length ? files.map(f => `- ${f}`).join('\n') : '(List changed files.)', '',
    `## Tests`, '', tests.length ? tests.map(t => `- ${t.name}: ${t.userReportedStatus} (reported by author; not independently verified)`).join('\n') : '- Not run (no evidence supplied)', '',
    `## Not run / limits`, '', '- (List checks you did not run and risks you see.)', '',
    `## AI assistance`, '', ai === 'undeclared' ? '- (Declare whether AI tools helped, as the project requires.)' : `- ${ai}`, '',
    `## Checklist`, '', ...checklist.map(c => `- [ ] ${c}`)
  ].join('\n');
  return reportSeal({
    schemaVersion: '1.0', kind: 'contribsutra.pr-readiness',
    issueNumber: issueOk ? issueNumber : null, reviewGate: 'HUMAN_REVIEW_REQUIRED',
    aiAssistance: ai, changedFiles: files, tests, statements, channels, checklist, description,
    references: {scanHash: scan.seal.hash}, externalWrites: 0
  });
}
