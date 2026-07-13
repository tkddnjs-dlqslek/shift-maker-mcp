An LLM will hand you a shift roster that *looks* right and is quietly illegal — double-booking one person, blowing past the 52-hour weekly cap, putting a minor on a midnight shift. So I stopped asking the model to do the math and handed generation to a solver.

Sharing shift-maker, my submission to Kakao AGENTIC PLAYER 10 (2026).

You set up the store, shifts, employees, and constraints through plain conversation, and an OR-Tools CP-SAT engine builds a weekly roster that respects the Korean Labor Standards Act — 52-hour weekly cap, a weekly paid rest day, and a night-work ban (22:00–06:00) for minor workers, all as hard constraints. When it can't be solved, it returns "infeasible + reason" instead of a plausible-looking violation.

It also handles day-of-week staffing overrides (3 on weekend nights), fixed day × shift assignments, overnight shifts that cross midnight, and self-serve availability links each employee fills in.

Verified: five mixed-industry scenarios — including an 84-slot cinema — all solved to OPTIMAL. Warm responses land in about 1 second.

Stack: Node/TypeScript MCP server over Streamable HTTP, hosted backend. Repo: https://github.com/tkddnjs-dlqslek/shift-maker-mcp / Live endpoint: https://shift-maker.playmcp-endpoint.kakaocloud.io/mcp

#MCP #ModelContextProtocol #AIAgents #ORTools #SideProject
