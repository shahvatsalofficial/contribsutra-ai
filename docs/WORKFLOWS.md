# Workflows

Eight reviewed workflow specifications live under `workflows/*.json`. They define intended steps and approvals; the starter does not implement an autonomous workflow runner. The working CLI supports `scan`, `doctor`, `issues`, `plan`, `pr-check`, `verify`, `install-skills` and `serve` as separate, user-initiated operations. The future orchestrator must preserve human decision boundaries and source provenance.

The recommended beginner journey: **Understand → Choose → Learn → Implement (authorized) → Verify (actually run) → Review → Submit (human approved)**.
