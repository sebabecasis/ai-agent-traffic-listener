# AI Agent Traffic Listener

Measure how AI agents interact with a website without turning human browsing into a new tracking dataset.

## What is implemented

This repository contains a generalised server-side AI-agent traffic listener.

```text
request
→ classify known AI agent or unknown bot-shaped traffic
→ discard ordinary human-shaped traffic
→ remove IP and query-string data
→ write asynchronously
→ report by agent, vendor, purpose and page
→ review unrecognised agents
```

It is extracted from a production pattern originally built for a Next.js site on Vercel. Organisation-specific code, traffic and credentials are not included.

This measures agent visits to a site. It does **not** solve LLM visibility: measuring how a company is represented, cited or recommended inside model answers is a separate future project.

## Run the safe fixture

Requires Node.js 20+ and has no runtime dependencies.

```bash
npm run demo
npm test
```

The fixture includes recognised agents, an unknown research crawler, ordinary browser traffic and an ignored preview bot. Only agent-shaped requests appear in the output.

## Deploy the listener

1. Apply [`sql/agent_hits.sql`](sql/agent_hits.sql) to a Supabase project.
2. Add `AGENT_HITS_URL` and `AGENT_HITS_ANON_KEY` to the deployment environment.
3. Adapt [`examples/next-proxy.ts`](examples/next-proxy.ts) into a Next.js 16 application.
4. Keep reporting credentials server-side and separate from the insert-only key.
5. Review the privacy notice and retention policy for the actual deployment.

The classifier registry is editable in [`data/ai-agents.json`](data/ai-agents.json). Validate agent claims against vendor documentation before using a label for security or access-control decisions; user-agent strings can be spoofed.

See [`docs/architecture.md`](docs/architecture.md) for the system contract and privacy choices.
