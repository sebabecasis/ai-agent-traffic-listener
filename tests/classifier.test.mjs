import assert from "node:assert/strict";
import test from "node:test";
import { classifyUserAgent } from "../src/classifier.mjs";
import { defaultRegistry } from "../src/registry.mjs";

test("registry contains 29 explicit labels", () => {
  assert.equal(defaultRegistry.agents.length, 29);
});

for (const [name, userAgent, expectedKind] of [
  ["OpenAI training", "Mozilla/5.0 GPTBot/1.2", "training"],
  ["OpenAI retrieval", "ChatGPT-User/1.0", "agent"],
  ["OpenAI search", "OAI-SearchBot/1.0", "search"],
  ["Anthropic training", "ClaudeBot/1.0", "training"],
  ["Anthropic retrieval", "Claude-User/1.0", "agent"],
  ["Perplexity search", "PerplexityBot/1.0", "search"],
  ["Exa search", "ExaSearchBot/1.0", "search"],
  ["Meta indexing", "meta-webindexer/1.0", "training"],
]) {
  test(`classifies ${name}`, () => {
    const result = classifyUserAgent(userAgent);
    assert.equal(result.capture, true);
    assert.equal(result.classification.agent_kind, expectedKind);
  });
}

test("matching is case-insensitive", () => {
  assert.equal(classifyUserAgent("META-EXTERNALAGENT/1.0").classification.agent, "Meta-ExternalAgent");
});

test("captures an unrecognised crawler without inventing a label", () => {
  const result = classifyUserAgent("NewResearchCrawler/0.1");
  assert.equal(result.capture, true);
  assert.equal(result.reason, "unrecognised_bot_shape");
  assert.equal(result.classification, null);
});

test("does not capture a normal browser", () => {
  assert.equal(classifyUserAgent("Mozilla/5.0 Safari/605.1").capture, false);
});

test("does not capture a missing user agent", () => {
  assert.equal(classifyUserAgent("").reason, "missing_user_agent");
});

test("ignore list wins over generic bot shape", () => {
  assert.equal(classifyUserAgent("facebookexternalhit/1.1").reason, "ignored");
});

test("AuthenticationServicesAgent is not mistaken for an AI agent", () => {
  assert.equal(classifyUserAgent("com.apple.AuthenticationServicesAgent").capture, false);
});
