#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { buildAgentHit } from "./hit.mjs";
import { buildReport } from "./report.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

const input = argument("--input");
if (!input) {
  console.error("Usage: node src/cli.mjs --input examples/requests.jsonl");
  process.exitCode = 2;
} else {
  const requests = readFileSync(input, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const hits = requests
    .map((request) => buildAgentHit(request, { now: request.occurred_at }))
    .filter(Boolean);
  console.log(JSON.stringify({ report: buildReport(hits), hits }, null, 2));
}
