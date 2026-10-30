// test.js
import test from "node:test";
import assert from "node:assert/strict";
import { getTrendingTopics } from "./scrapeTrends.js";

test("getTrendingTopics returns a non-empty array of trending topics", async () => {
  const topics = await getTrendingTopics();
  assert.ok(Array.isArray(topics), "topics should be an array");
  assert.ok(topics.length > 0, "topics should contain at least 1 trend");
  assert.ok(typeof topics[0] === "string", "each topic should be a string");
});

test("getTrendingTopics falls back to Google Trends when trends24 fails", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    if (url.includes("trends24.in")) {
      return { ok: false, status: 403, text: async () => "" };
    }
    return origFetch(url, opts);
  };

  try {
    const topics = await getTrendingTopics();
    assert.ok(Array.isArray(topics), "topics should be an array");
    assert.ok(topics.length > 0, "fallback topics should contain at least 1 trend");
  } finally {
    globalThis.fetch = origFetch;
  }
});
