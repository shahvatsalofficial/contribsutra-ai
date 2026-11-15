# IDE compatibility and capability matrix

| Host | Proposed per-project skill directory | Status |
|---|---|---|
| Claude Code | `.claude/skills/` | Skill copying tested locally; native host activation not tested |
| Cursor | `.cursor/skills/` | Skill copying tested locally; native host activation not tested |
| OpenAI Codex | `.agents/skills/` | Skill copying tested locally; native host activation not tested |
| Gemini CLI | `.gemini/skills/` | Skill copying tested locally; native host activation not tested |
| GitHub Copilot | `.github/skills/` | Skill copying tested locally; native host activation not tested |
| OpenCode | `.agents/skills/` | Skill copying tested locally; native host activation not tested |
| Any other IDE | Read `AGENTS.md` and the canonical `skills/` manually | Fallback guidance only |

The CLI runs without AI host inference; skills are instruction files. All paths should be periodically revalidated against each IDE release and installed version. Host-specific APIs, agent orchestration and native triggers vary; never promise universal support or credential-free proprietary inference.
