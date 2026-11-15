---
name: contribsutra-pull-request-check
description: Create human-reviewable PR readiness report and prevent unsolicited submission.
license: Apache-2.0
metadata:
  author: Vatsal Shah
---
# Pull Request Check

Create human-reviewable PR readiness report and prevent unsolicited submission.

1. Inspect only user-selected repository/issue inputs.
2. Call documented offline CLI commands when available; do not execute arbitrary repository scripts.
3. Cite source files or issue identifiers and preserve evidence integrity.
4. Report unknown and not-run status explicitly.
5. Obtain human authorization for modifications, account actions, downloads, tests or submissions.
