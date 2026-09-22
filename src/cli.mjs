#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { buildAgentHit } from "./hit.mjs";
import { buildReport } from "./report.mjs";
import { readHits } from "./supabase-reader.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

const input = argument("--input");
const hitFile = argument("--hits");
const remote = process.argv.includes("--supabase");
if ([input, hitFile, remote].filter(Boolean).length !== 1) {
  console.error("Choose --input requests.jsonl, --hits hits.jsonl, or --supabase --from ISO --to ISO");
  process.exitCode = 2;
} else {
  const requests = remote ? await readHits({url: process.env.AGENT_HITS_URL, key: process.env.AGENT_HITS_REPORT_KEY, from: argument("--from"), to: argument("--to")}) : readFileSync(input || hitFile, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const hits = input ? requests
    .map((request) => buildAgentHit(request, { now: request.occurred_at }))
    .filter(Boolean) : requests;
  console.log(JSON.stringify({ report: buildReport(hits), hits }, null, 2));
}
