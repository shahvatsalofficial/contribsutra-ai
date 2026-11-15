# ContribSutra output contracts

Every JSON report has `schemaVersion` ("1.0"), `kind`, semantic fields and a `seal.hash` (SHA-256 over the JSON serialization of every field before the seal). The seal detects accidental change; it is **not** a signature and does not prove who made the report. Imported issue scores are heuristics, not acceptance probabilities. No cloud key is needed.

| Schema | Kind |
|---|---|
| `repository-scan.schema.json` | `contribsutra.repository-scan` |
| `environment-doctor.schema.json` | `contribsutra.environment-doctor` |
| `issue-shortlist.schema.json` | `contribsutra.issue-shortlist` |
| `learning-plan.schema.json` | `contribsutra.learning-plan` |
| `pr-readiness.schema.json` | `contribsutra.pr-readiness` |
| `audit-report.schema.json` | `contribsutra.audit-report` |
| `issue-snapshot.schema.json` | input: the issue snapshot file you supply |

Schemas are minimal (required fields and enumerations); `additionalProperties` is allowed for forward compatibility. Tests assert every emitted report carries the declared required fields.
