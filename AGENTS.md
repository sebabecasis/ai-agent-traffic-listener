# Operating AI Agent Traffic Listener

Read README.md and docs/architecture.md. Node.js 20+, no runtime dependencies. This package classifies requests, discards ordinary browser-shaped traffic, writes limited hit records and reports visits. It is not a hosted website or an LLM-answer visibility tracker.

## Workflow

1. Establish the application, environment, authorized deployment/analysis and reporting window.
2. Start offline: node src/cli.mjs --input examples/requests.jsonl; node --test.
3. Adapt examples/next-proxy.ts to the host's existing proxy behavior. It lazily creates the writer and isolates missing configuration/writer failures, logging a generic once-per-instance warning. Keep the asynchronous host lifecycle hook.
4. For authorized storage apply sql/agent_hits.sql, configure AGENT_HITS_URL and AGENT_HITS_ANON_KEY. This credential is insert-only; never widen anonymous read access merely to make reporting work.
5. Verify known/unknown-agent inserts, normal-traffic exclusion and failure handling. User-agent labels are spoofable; do not use them as authentication.
6. Report existing JSONL hits with --hits, or use --supabase --from ISO --to ISO with AGENT_HITS_REPORT_KEY in a trusted server-side environment. Use a dedicated least-privilege reporting credential where available; never expose a service credential in browser code.
7. Explain counts, report window and unknown-agent review queue. Distinguish fixture output from actual collected traffic.

## Commands

```bash
node src/cli.mjs --input examples/requests.jsonl
node src/cli.mjs --hits /private/path/hits.jsonl
node src/cli.mjs --supabase --from 2026-09-01T00:00:00Z --to 2026-09-08T00:00:00Z
node --test
```

Choose one input mode. Remote reports page through [from,to) ordered by timestamp and database id. Failure or the pagination cap returns an error instead of a silently partial report. Narrow the window if the cap is reached. Use a completed historical window to minimize drift during offset pagination; this is not a transactional snapshot.

## Contracts and limits

No IP or query-string fields enter new hits. Paths and raw user agents remain, so do not claim all arbitrary input is free of personal data. Keep private hit exports untracked. Preserve nullable unknown-agent fields, request-ID deduplication and async writes. Reporting does not change registry labels.

A host integration and actual deployment verification are still required. The Next.js file is a template, not a compiled application. Tests cover classification, privacy fields, writes and mocked paginated reporting, not an actual Supabase deployment. This measures visits, not citation share or model recommendations.
