import { readFileSync } from "node:fs";

const DEFAULT_REGISTRY_URL = new URL("../data/ai-agents.json", import.meta.url);

export function loadRegistry(pathOrUrl = DEFAULT_REGISTRY_URL) {
  const raw = JSON.parse(readFileSync(pathOrUrl, "utf8"));
  if (!Array.isArray(raw.agents) || !Array.isArray(raw.ignorePatterns)) {
    throw new Error("Registry must contain agents and ignorePatterns arrays");
  }
  const names = new Set();
  for (const agent of raw.agents) {
    for (const key of ["name", "pattern", "vendor", "kind"]) {
      if (!agent[key]) throw new Error(`Agent entry is missing ${key}`);
    }
    if (names.has(agent.name)) throw new Error(`Duplicate agent name: ${agent.name}`);
    names.add(agent.name);
  }
  return raw;
}

export const defaultRegistry = loadRegistry();
