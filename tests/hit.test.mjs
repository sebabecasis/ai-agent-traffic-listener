import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentHit, recordAgentHit } from "../src/hit.mjs";

function request(userAgent = "ChatGPT-User/1.0") {
  return {
    method: "get",
    url: "https://example.test/pricing?email=private@example.test",
    headers: {
      "user-agent": userAgent,
      "x-vercel-id": "demo-123",
      "x-forwarded-for": "192.0.2.1",
    },
  };
}

test("builds a minimal event for agent traffic", () => {
  const hit = buildAgentHit(request(), { now: "2026-09-20T10:00:00Z" });
  assert.equal(hit.path, "/pricing");
  assert.equal(hit.method, "GET");
  assert.equal(hit.request_id, "demo-123");
});

test("event excludes client IP", () => {
  const hit = buildAgentHit(request());
  assert.equal("ip" in hit, false);
  assert.equal("client_ip" in hit, false);
  assert.equal(JSON.stringify(hit).includes("192.0.2.1"), false);
});

test("event excludes URL query string", () => {
  const hit = buildAgentHit(request());
  assert.equal(hit.path, "/pricing");
  assert.equal(JSON.stringify(hit).includes("private@example.test"), false);
});

test("human-shaped traffic returns null", () => {
  assert.equal(buildAgentHit(request("Mozilla/5.0 Safari/605.1")), null);
});

test("successful writer receives the hit", async () => {
  const stored = [];
  const result = await recordAgentHit(request(), async (hit) => stored.push(hit));
  assert.equal(result.captured, true);
  assert.equal(stored.length, 1);
});

test("write failures do not escape the capture path", async () => {
  let observed;
  const result = await recordAgentHit(
    request(),
    async () => { throw new Error("offline"); },
    { onError: (error) => { observed = error.message; } },
  );
  assert.equal(result.reason, "write_failed");
  assert.equal(observed, "offline");
});
