# Rule: bounded-execution

**Invariant:** Do not run arbitrary local scripts, network requests, or code from unfamiliar repositories. Future runners must sandbox.

Applies to every agent, IDE bridge, local CLI command and optional server adapter. A violation blocks promotion of an unverified result and must be disclosed in the audit report.
