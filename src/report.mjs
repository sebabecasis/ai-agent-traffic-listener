function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function ranked(map) {
  return [...map.entries()]
    .map(([name, requests]) => ({ name, requests }))
    .sort((a, b) => b.requests - a.requests || a.name.localeCompare(b.name));
}

export function buildReport(hits) {
  const byAgent = new Map();
  const byVendor = new Map();
  const byKind = new Map();
  const byPage = new Map();
  const unknownUserAgents = new Map();

  for (const hit of hits) {
    increment(byAgent, hit.agent || "Unrecognised");
    increment(byVendor, hit.agent_vendor || "Unrecognised");
    increment(byKind, hit.agent_kind || "unclassified");
    increment(byPage, hit.path);
    if (!hit.agent) increment(unknownUserAgents, hit.user_agent);
  }

  return {
    total_requests: hits.length,
    recognised_requests: hits.filter((hit) => hit.agent).length,
    unrecognised_requests: hits.filter((hit) => !hit.agent).length,
    by_agent: ranked(byAgent),
    by_vendor: ranked(byVendor),
    by_kind: ranked(byKind),
    by_page: ranked(byPage),
    discovery_queue: ranked(unknownUserAgents),
  };
}
