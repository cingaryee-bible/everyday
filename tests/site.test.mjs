import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import worker from "../dist/server/index.js";

test("serves the daily reading page at the site root", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/?date=2026-09-11"),
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /毛毛聊/);
  assert.doesNotMatch(html, /mailto:/);
  assert.match(html, /cat-readings\.js/);
  assert.match(html, /cat-style\.css\?v=20260913c/);
  assert.match(html, /topic-art-image/);
  assert.match(html, /rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon"[^>]+icons\/icon-180\.png/);
  assert.match(html, /id="add-home-button"/);
  assert.match(
    html,
    /id="reflection"[\s\S]*class="add-home-area"[\s\S]*<footer>/,
  );
  assert.match(html, /id="install-dialog"/);
  assert.match(html, /iPhone／iPad/);
  assert.match(html, /Android／Chrome/);
  assert.match(html, /完成後，貓貓圖示會顯示於手機主畫面/);
  assert.doesNotMatch(html, /一撳|留喺|下面嘅|搵到|呢個網站/);
  assert.doesNotMatch(html, /id="day-picker"|兩星期/);
});

test("serves installable app metadata and the supplied icon", async () => {
  const manifestResponse = await worker.fetch(
    new Request("https://example.test/manifest.webmanifest"),
  );
  const manifest = await manifestResponse.json();
  const icon = await worker.fetch(
    new Request("https://example.test/icons/icon-512.png"),
  );
  const maskableIcon = await worker.fetch(
    new Request("https://example.test/icons/icon-maskable-512.png"),
  );

  assert.equal(manifestResponse.status, 200);
  assert.match(
    manifestResponse.headers.get("content-type"),
    /application\/manifest\+json/,
  );
  assert.equal(manifestResponse.headers.get("cache-control"), "no-cache");
  assert.equal(manifest.name, "毛毛聊每日經課");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(icon.headers.get("content-type"), "image/png");
  assert.equal(maskableIcon.headers.get("content-type"), "image/png");
  assert.ok((await icon.arrayBuffer()).byteLength > 20_000);
  assert.ok((await maskableIcon.arrayBuffer()).byteLength > 20_000);
});

test("serves the artwork and embedded reading data", async () => {
  const image = await worker.fetch(
    new Request("https://example.test/cat-psalm-cingaryee-v3.png"),
  );
  const readings = await worker.fetch(
    new Request("https://example.test/cat-full-texts.js"),
  );

  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.ok((await image.arrayBuffer()).byteLength > 100_000);
  assert.equal(readings.status, 200);
  assert.match(await readings.text(), /詩篇/);
});

test("revalidates styles and disables synthetic font weight", async () => {
  const stylesheet = await worker.fetch(
    new Request("https://example.test/cat-style.css?v=20260912f"),
  );
  const css = await stylesheet.text();

  assert.equal(stylesheet.status, 200);
  assert.equal(stylesheet.headers.get("cache-control"), "no-cache");
  assert.match(css, /--hand: "Huninn"/);
  assert.match(css, /font-synthesis: none/);
  assert.match(css, /font-size: 14px/);
  assert.match(
    css,
    /@media \(min-width: 560px\)[\s\S]*?body\s*{\s*padding-bottom: 112px;/,
  );
});

test("uses each day's topic in the topic position", async () => {
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(javascript, /getElementById\("page-title"\)\.textContent = day\.topic/);
});

test("selects the day from the visitor's local timezone", async () => {
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(javascript, /date\.getFullYear\(\)/);
  assert.match(javascript, /date\.getMonth\(\) \+ 1/);
  assert.match(javascript, /scheduleLocalMidnightUpdate\(\)/);
  assert.doesNotMatch(javascript, /Asia\/Hong_Kong|buildDayPicker/);
});

test("opens a platform-aware add-to-home-screen guide", async () => {
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(javascript, /showModal\(\)/);
  assert.match(javascript, /beforeinstallprompt/);
  assert.match(javascript, /navigator\.maxTouchPoints/);
  assert.match(javascript, /appinstalled/);
});

test("serves the complete topic artwork library without the design preview", async () => {
  const finalArtwork = await worker.fetch(
    new Request("https://example.test/assets/topics/topic-41.webp"),
  );
  const preview = await worker.fetch(
    new Request("https://example.test/design-preview.html"),
  );

  assert.equal(finalArtwork.status, 200);
  assert.equal(finalArtwork.headers.get("content-type"), "image/webp");
  assert.ok((await finalArtwork.arrayBuffer()).byteLength > 10_000);
  assert.equal(preview.status, 404);
});

test("includes an automatic GitHub Pages deployment", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path: \.\/public/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
