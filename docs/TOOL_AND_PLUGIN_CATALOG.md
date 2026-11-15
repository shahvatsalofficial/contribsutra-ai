# Tool, plugin, MCP and skill inventory

| Tool | Use | Priority | State |
|---|---|---|---|
| Node.js built-in test runner | Core CLI and unit tests | Required | Used |
| Git | Repository metadata/status | High | Bounded version probe only |
| GitHub CLI (`gh`) | Scoped authenticated issue discovery/PR draft | High later | Not integrated |
| Official GitHub REST/GraphQL APIs | Read issue labels and attribution | High later | Not integrated |
| GitHub MCP server | Explicit scoped source and issue interaction | Optional | Not integrated |
| GitHub Actions | CI on Linux/macOS/Windows | High | Workflow authored, not executed remotely |
| Dev Containers | Reproducible onboarding | High later | Not integrated |
| actionlint | Validate workflow YAML | High later | Not integrated |
| Gitleaks | Prevent secrets in code/reports | High later | Not integrated |
| OSV-Scanner | Dependency vulnerability audit | High later | Not integrated |
| OpenSSF Scorecard | Public repo security health | Optional | Not integrated |
| Renovate | Contributor environment dependency freshness | Optional | Not integrated |
| Context7 | Fresh official documentation in compatible IDE | Optional | Not integrated |
| Serena | Semantic codebase navigation | Optional | Not integrated |
| Playwright | Future onboarding dashboard E2E | Optional | Not integrated |
| OpenTelemetry | Optional audit-safe host telemetry | Optional | Not integrated |
| Docker/Podman | Future sandboxed local builds/tests | High later | Not integrated |

Choose tools based on task, maintainership, license and current compatibility. List installed tools first. Never globally install plugins, give write access, make paid calls, enable network access or download heavy dependencies without explicit permission. Minimum core needs only supported Node.js; no cloud model API key.

Official reference docs:
- https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors
- https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-open-source
- https://github.com/github/opensource.guide
- https://agentskills.io
- https://docs.github.com/en/rest
- https://docs.github.com/en/actions
- https://containers.dev
