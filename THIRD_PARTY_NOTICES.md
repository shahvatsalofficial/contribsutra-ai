# Third-party notices

**Runtime dependencies: none.** ContribSutra AI uses only Node.js built-in modules (`node:fs`, `node:path`, `node:crypto`, `node:http`, `node:child_process`, `node:test`, ...).

**Development dependencies: none.** Tests use the built-in `node:test` runner.

**Bundled content:** all code, skills, schemas, rules, workflows, fixtures and documents are original works by Vatsal Shah under Apache-2.0. Fixtures are synthetic. No scraped issue, README or license text from real repositories is included.

**Referenced standards and services (not bundled):** GitHub Docs, the Agent Skills specification, Dev Containers specification, GitHub Actions. They are linked for reference only; their content is not redistributed.

**CI actions used by workflows** (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`) are used from their upstream repositories under their own licenses and are not redistributed in the npm package.

Verify this claim yourself: `npm ls --all` shows no dependencies; `npm pack --dry-run` lists exactly what is published.
