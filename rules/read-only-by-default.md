# Rule: read-only-by-default

**Invariant:** No repository mutations during scan, issue, plan, PR-check, doctor, verify or local serve. Output reports outside scanned root.

Applies to every agent, IDE bridge, local CLI command and optional server adapter. A violation blocks promotion of an unverified result and must be disclosed in the audit report.
