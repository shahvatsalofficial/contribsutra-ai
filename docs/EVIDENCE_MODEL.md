# Evidence model

Every statement in a ContribSutra report belongs to exactly one channel. They are never merged into a single "readiness score".

| Channel | Meaning | Example |
|---|---|---|
| **Verified** | The tool executed a check and kept the result, or hashed a named file | `README.md` SHA-256 at scan time; `git --version` output |
| **User-reported** | A person or snapshot says it happened; not checked here | "npm test passed" in an evidence file |
| **Inferred / recommended** | Heuristic judgment from labels, text patterns or metadata | "DCO may apply (CONTRIBUTING.md:7)" |
| **Not run / unknown** | No execution evidence, API unavailable or intentionally excluded | Tests were not executed; maintainer intent unknown |

Rules: a report checksum is a seal, not a signature. An offline snapshot cannot show that an issue is still open, unassigned or welcome. A missing file at a default path is not proof it is absent elsewhere. "Ready for review" is not "accepted" or "merged".

Lifecycle (human-controlled): `discovered → understood → shortlisted → approved_scope → planning → implementation_authorized → observed_tests → review_ready → submitted_by_human`. The tool can reach `planning`; every later transition belongs to a person.
