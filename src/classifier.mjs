import { defaultRegistry } from "./registry.mjs";

function includesCaseInsensitive(haystack, needle) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

export function classifyUserAgent(userAgent, registry = defaultRegistry) {
  const value = String(userAgent || "").trim();
  if (!value) return { capture: false, reason: "missing_user_agent", classification: null };

  if (registry.ignorePatterns.some((pattern) => includesCaseInsensitive(value, pattern))) {
    return { capture: false, reason: "ignored", classification: null };
  }

  const match = registry.agents.find((agent) => includesCaseInsensitive(value, agent.pattern));
  if (match) {
    return {
      capture: true,
      reason: "recognised_agent",
      classification: { agent: match.name, agent_kind: match.kind, agent_vendor: match.vendor },
    };
  }

  const botShape = new RegExp(registry.botShapePattern, "i").test(value);
  return {
    capture: botShape,
    reason: botShape ? "unrecognised_bot_shape" : "not_agent_shaped",
    classification: null,
  };
}
