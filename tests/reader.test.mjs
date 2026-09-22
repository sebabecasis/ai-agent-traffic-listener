import test from "node:test";
import assert from "node:assert/strict";
import { readHits } from "../src/supabase-reader.mjs";

const config = { url: "https://example.test/rest/v1/agent_hits", key: "test", from: "2026-01-01", to: "2026-01-02" };
test("server reporting paginates with a stable order and bounded window", async () => {
  const calls = [];
  const rows = await readHits({ ...config, pageSize: 1, fetchImpl: async (url) => {
    calls.push(new URL(url));
    return { ok: true, json: async () => calls.length === 1 ? [{ agent: "Example" }] : [] };
  }});
  assert.equal(rows.length, 1);
  assert.equal(calls[1].searchParams.get("offset"), "1");
  assert.equal(calls[0].searchParams.getAll("occurred_at").length, 2);
  assert.equal(calls[0].searchParams.get("order"), "occurred_at.asc,id.asc");
});
test("unauthorised reads and oversized results never return partial reports", async () => {
  await assert.rejects(readHits({ ...config, fetchImpl: async () => ({ok: false, status: 403}) }), /403/);
  await assert.rejects(readHits({ ...config, maxPages: 1, pageSize: 1, fetchImpl: async () => ({ok: true, json: async () => [{}]}) }), /pagination limit/);
});
test("bad window and missing reporting key fail before network", async () => {
  await assert.rejects(readHits({ ...config, key: "" }), /required/);
  await assert.rejects(readHits({ ...config, to: "2025-01-01" }), /window/);
});
