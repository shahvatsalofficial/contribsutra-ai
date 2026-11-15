# Rule: privacy-and-secrets

**Invariant:** Redact common credential patterns, avoid storing tokens or private paths, and do not transmit files by default.

Applies to every agent, IDE bridge, local CLI command and optional server adapter. A violation blocks promotion of an unverified result and must be disclosed in the audit report.
