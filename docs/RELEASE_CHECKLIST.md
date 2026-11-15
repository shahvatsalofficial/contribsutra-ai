# Release checklist

1. `npm test` green locally; CI matrix green on the release commit.
2. `npm run proof` and `npm run audit`; commit refreshed `docs/proof/` and `examples/reports/`.
3. `node documents/ContribSutra-AI/build.mjs` to refresh the documentation set.
4. Update `CHANGELOG.md`, `docs/STATUS.md`, the version in `package.json` and `CITATION.cff`.
5. `npm pack --dry-run`: confirm only intended files and no secrets.
6. Tag `vX.Y.Z`; the Release workflow publishes with provenance (trusted publishing), or publish manually with 2FA.
7. Verify: `npm view contribsutra-ai version`, then `npx contribsutra-ai --version` from an empty directory.
8. GitHub release notes link to the audit sample and the CI run.
