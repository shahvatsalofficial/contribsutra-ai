# Roadmap

- **Done in 0.2.0:** deterministic offline scan with line-level sources, setup doctor with requirement comparison, adversarially tested issue shortlist, learning modes, PR evidence channels, audit pack (HTML + MD + JSON), proof pipeline.
- **Next (0.3):** safe `git` change summary and source-linked diff evidence for PR packets; CI annotations for `audit`; more manifest detectors (Gradle, Maven, Ruby, PHP); localization of report text.
- **Then:** read-only GitHub adapter (explicit token scope, ETag cache, rate-limit aware); Dev Container checks; sandboxed opt-in test runner with captured, hashed output.
- **Later:** real activation tests per IDE host; accessible local dashboard; signed releases; optional draft-PR flow behind four gates (explicit request, minimum-scope token, maintainer-aligned invitation, fresh human diff review).
- **Never:** unattended or bulk PR/issue creation; vanity metrics.
