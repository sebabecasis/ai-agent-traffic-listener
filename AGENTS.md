# Operating AI Agent Traffic Listener

Read `README.md` and `docs/architecture.md`. This package classifies incoming request user agents, discards ordinary browser-shaped traffic, builds limited event records and reports by agent/vendor/purpose/page. It includes a Supabase writer and a Next.js proxy example; it is not itself a deployed website or analytics dashboard.

## Start with the fixture

From the root, with Node.js 20+ (no runtime packages needed):

```bash
node src/cli.mjs --input examples/requests.jsonl
node --test
```

The CLI reads request JSONL and prints `{report, hits}`; it does not write to Supabase. Check that known agents and unknown bot-shaped requests are captured, ordinary browser traffic is omitted, and IP/query-string fields do not enter the hit records. Unknown agents remain nullable for later review.

## Operating an integration

1. Establish the application, environment, intended reporting window and whether work is local analysis or an authorized deployment.
2. Map the host application's requests to `buildAgentHit`/`recordAgentHit`. Review `examples/next-proxy.ts` with the application's existing proxy behavior before adapting it. Keep recording asynchronous via the host's lifecycle API.
3. For an authorized Supabase integration, apply `sql/agent_hits.sql` and configure `AGENT_HITS_URL` as the REST table endpoint plus `AGENT_HITS_ANON_KEY`. Never use a privileged reporting credential in browser code.
4. Verify known-agent and unknown-agent inserts and ordinary-traffic exclusion. Check failure reporting as well as successful requests: `recordAgentHit` catches writer failures and reports through its optional `onError` callback; the example does not wire this callback.
5. Use `buildReport` on hit rows for reporting. The CLI accepts raw request fixtures, not a Supabase hit export; there is no production fetch/report command yet. Read database rows only through an authorized server-side connection or approved tooling.
6. Deliver the report window, counts and interpretation. Review unknown user agents before changing `data/ai-agents.json`; a user-agent label is not proof of identity.

## Contracts and gaps

Retain no IP or URL query-string fields. Paths and user-agent strings are retained; this is not a guarantee that arbitrary inputs contain no personal information. Keep fixtures synthetic. Preserve nullable agent fields, request-ID deduplication and asynchronous writes. The example constructs its writer at module load, so missing environment values can throw before request handling; verify configuration before deployment.

The website's core listener claims are represented here. A reusable hosted reporting command, deployment diagnostics and failure-isolation tests would improve operation but are separate work. This measures visits, not model-answer visibility, citation share or recommendation frequency. Completion requires distinguishing fixture results from actual deployed traffic and showing evidence for any claim of live collection.
