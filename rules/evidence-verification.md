# Rule: evidence-verification

**Invariant:** Only actually executed tests may be called verified. User-supplied claims must be explicitly unverified.

Applies to every agent, IDE bridge, local CLI command and optional server adapter. A violation blocks promotion of an unverified result and must be disclosed in the audit report.
