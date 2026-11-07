import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Local Office landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Local Office — Work in the heart of NYC<\/title>/i);
  assert.match(html, /class="site-loader"/);
  assert.match(html, /Preparing your place in the city/);
  assert.match(html, /data-scrolly-container/);
  assert.match(html, /Work in the/);
  assert.match(html, /Make space/);
  assert.match(html, /Stay close/);
  assert.match(html, /Your next move/);
  assert.match(html, /Explore spaces/);
  assert.doesNotMatch(html, /editorial-section|site-footer|Spaces for/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("keeps the requested scroll-video and visual system in source", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(page, /scrolly-video\/dist\/ScrollyVideo\.esm\.jsx/);
  assert.match(page, /trackScroll/);
  assert.match(page, /sticky/);
  assert.match(page, /HEADLINES/);
  assert.match(page, /headlineInterval/);
  assert.match(page, /document\.fonts\?\.ready/);
  assert.match(page, /site-loading/);
  assert.match(page, /hf_20260824_104803_bb3f7d79/);
  assert.match(packageJson, /"scrolly-video": "0\.0\.24"/);
  assert.match(css, /font-family:\s*Arial, Helvetica, sans-serif/);
  assert.match(css, /height:\s*500svh/);
  assert.doesNotMatch(css, /font-family:\s*serif\b/i);
  assert.doesNotMatch(layout, /codex-preview|_sites-preview|Starter Project/);
});
