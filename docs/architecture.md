# Architecture

```text
incoming request
      │
      ▼
recognised agent? ── yes ─┐
      │                   │
      no                  │
      ▼                   │
generic bot shape? ─ yes ─┤
      │                   ▼
      no            privacy-safe hit
      │          (no IP, no query string)
      ▼                   │
   ignore                 ▼
                  asynchronous writer
                          │
                          ▼
                 insert-only event store
                          │
                          ▼
          report + unknown-agent review queue
```

## Design decisions

- The registry labels known agents; it is not a gate. Unknown bot-shaped traffic is retained for review.
- Matching is case-insensitive.
- Common non-AI preview and search bots can be ignored explicitly.
- Human-shaped traffic is not stored.
- Client IPs and URL query strings never enter the event model.
- Capture is an asynchronous side channel and write failures never block a page response.
- Agent purpose is retained as `training`, `search` or `agent`, because raw volume alone is not a useful visibility signal.

The example Supabase schema grants the anonymous role insert access only. Reporting should run with a separate server-side credential.
