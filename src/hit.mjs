import { classifyUserAgent } from "./classifier.mjs";

function header(request, name) {
  if (request?.headers?.get) return request.headers.get(name);
  const entries = request?.headers || {};
  return entries[name] ?? entries[name.toLowerCase()] ?? null;
}

export function buildAgentHit(request, options = {}) {
  const userAgent = header(request, "user-agent") || "";
  const decision = classifyUserAgent(userAgent, options.registry);
  if (!decision.capture) return null;

  const url = new URL(request.url);
  const hit = {
    occurred_at: options.now || new Date().toISOString(),
    request_id: header(request, "x-vercel-id") || options.requestId || null,
    method: String(request.method || "GET").toUpperCase(),
    host: url.host,
    path: url.pathname,
    user_agent: userAgent,
    agent: decision.classification?.agent || null,
    agent_kind: decision.classification?.agent_kind || null,
    agent_vendor: decision.classification?.agent_vendor || null,
    classification_reason: decision.reason,
  };

  // Deliberately omit IP-related and query-string fields, even when supplied.
  return hit;
}

export async function recordAgentHit(request, writer, options = {}) {
  const hit = buildAgentHit(request, options);
  if (!hit) return { captured: false, reason: "not_agent_traffic" };
  try {
    await writer(hit);
    return { captured: true, hit };
  } catch (error) {
    options.onError?.(error);
    return { captured: false, reason: "write_failed", hit };
  }
}
