import assert from "node:assert/strict";
import test from "node:test";
import { buildReport } from "../src/report.mjs";

const hits = [
  { agent: "ChatGPT-User", agent_vendor: "OpenAI", agent_kind: "agent", path: "/pricing", user_agent: "ChatGPT-User" },
  { agent: "GPTBot", agent_vendor: "OpenAI", agent_kind: "training", path: "/docs", user_agent: "GPTBot" },
  { agent: null, agent_vendor: null, agent_kind: null, path: "/pricing", user_agent: "ResearchCrawler" },
];

test("counts recognised and unknown traffic", () => {
  const report = buildReport(hits);
  assert.equal(report.total_requests, 3);
  assert.equal(report.recognised_requests, 2);
  assert.equal(report.unrecognised_requests, 1);
});

test("ranks pages by request count", () => {
  assert.deepEqual(buildReport(hits).by_page[0], { name: "/pricing", requests: 2 });
});

test("keeps unknown user agents in a discovery queue", () => {
  assert.deepEqual(buildReport(hits).discovery_queue, [{ name: "ResearchCrawler", requests: 1 }]);
});
