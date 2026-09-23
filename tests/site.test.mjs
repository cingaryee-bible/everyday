import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import worker from "../dist/server/index.js";
import {
  THEME_DEFINITIONS,
  buildDailyContent,
  cycleSignature,
  extractDailyCandidates,
  hkbsChapterUrl,
  loadHkbsRcuvBible,
  loadRclDaysWithFallback,
  parseHkbsChapter,
  parseCitation,
  parseSundayCitations,
  parseWeekdayCitations,
  useProtestantCanonicalAlternatives,
} from "../scripts/update-daily-content.mjs";

function parseTestUsfm(content) {
  const id = content.match(/^\\id\s+([A-Z0-9]{3})\b/m)?.[1];
  const chapters = new Map();
  let chapter = 0;
  for (const line of content.split("\n")) {
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = Number(chapterMatch[1]);
      chapters.set(chapter, new Map());
      continue;
    }
    const verseMatch = line.match(/^\\v\s+(\d+)\s+(.+)$/);
    if (verseMatch) chapters.get(chapter).set(Number(verseMatch[1]), verseMatch[2]);
  }
  return { id, chapters };
}

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
  assert.match(html, /cat-style\.css\?v=20260921a/);
  assert.match(html, /daily-content\.js\?v=20260915a/);
  assert.match(html, /cat-readings\.js\?v=20260921a/);
  assert.match(html, /id="topic-art-image"[\s\S]*draggable="false"/);
  assert.match(html, /rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon"[^>]+icons\/icon-180\.png/);
  assert.match(html, /id="add-home-button"/);
  assert.match(
    html,
    /id="reflection"[\s\S]*class="add-home-area"[\s\S]*<footer>/,
  );
  assert.match(html, /id="install-dialog"/);
  assert.match(html, /id="translation-picker-button"/);
  assert.match(html, /id="translation-dialog"/);
  assert.match(html, /新普及譯本/);
  assert.match(html, /授權申請中/);
  assert.match(html, /和合本2010/);
  assert.match(html, /蒙香港聖經公會授權使用/);
  assert.match(html, /https:\/\/rcuv\.hkbs\.org\.hk\//);
  assert.doesNotMatch(html, /eBible|Public Domain/i);
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

test("serves the artwork without a legacy embedded Bible", async () => {
  const image = await worker.fetch(
    new Request("https://example.test/cat-psalm-cingaryee-v3.png"),
  );
  const legacyReadings = await worker.fetch(
    new Request("https://example.test/cat-full-texts.js"),
  );

  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.ok((await image.arrayBuffer()).byteLength > 100_000);
  assert.equal(legacyReadings.status, 404);
});

test("serves valid reviewed daily content or its pre-generation placeholder", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/daily-content.js"),
  );
  const javascript = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-cache");
  assert.match(javascript, /window\.dailyReadingContent = (?:null|\{)/);
  if (!javascript.includes("window.dailyReadingContent = null")) {
    assert.match(javascript, /"editorialStatus": "reviewed"/);
    assert.match(javascript, /"readings": \[/);
  }
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
  assert.match(css, /\.topic-art-stage\s*{[\s\S]*?-webkit-touch-callout: none;[\s\S]*?user-select: none;/);
  assert.match(css, /\.daily-art\.topic-art-stage > \.topic-art-image\s*{[\s\S]*?pointer-events: none;/);
  assert.match(
    css,
    /@media \(min-width: 560px\)[\s\S]*?body\s*{\s*padding-bottom: 112px;/,
  );
  assert.match(
    css,
    /\.mobile-nav\s*{[\s\S]*?bottom: 0;[\s\S]*?position: fixed;/,
  );
  assert.doesNotMatch(
    css,
    /@media \(max-width: 559px\)[\s\S]*?\.mobile-nav\s*{[\s\S]*?position: static;/,
  );
  assert.doesNotMatch(
    css,
    /@media \(max-width: 559px\)[\s\S]*?\.mobile-nav\s*{[\s\S]*?transform: translateY/,
  );
});

test("uses each day's topic in the topic position", async () => {
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(javascript, /getElementById\("page-title"\)\.textContent = day\.topic/);
  assert.match(javascript, /addEventListener\("contextmenu"/);
  assert.match(javascript, /addEventListener\("dragstart"/);
  assert.match(javascript, /event\.target\.closest\?\.\("\.topic-art-stage"\)/);
});

test("selects the day from the visitor's local timezone", async () => {
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(javascript, /date\.getFullYear\(\)/);
  assert.match(javascript, /date\.getMonth\(\) \+ 1/);
  assert.match(javascript, /scheduleLocalMidnightUpdate\(\)/);
  assert.match(javascript, /generatedContent\?\.readings\?\.length/);
  assert.match(javascript, /daily-content\.js\?refresh=\$\{Date\.now\(\)\}/);
  assert.match(javascript, /refreshGeneratedContent\(\{ force: true \}\)/);
  assert.match(javascript, /visibilitychange/);
  assert.match(javascript, /dataset\.contentDateStatus = exactDay \? "current" : "fallback"/);
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

test("opens an accessible translation picker with the pending translation disabled", async () => {
  const page = await worker.fetch(
    new Request("https://example.test/"),
  );
  const html = await page.text();
  const script = await worker.fetch(
    new Request("https://example.test/cat-readings.js"),
  );
  const javascript = await script.text();

  assert.match(html, /aria-controls="translation-dialog"/);
  assert.match(html, /class="translation-option is-pending" type="button" disabled/);
  assert.match(javascript, /translationDialog\.showModal\(\)/);
  assert.match(javascript, /closeTranslationDialog\(\)/);
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
  assert.match(workflow, /cron: "17 0 \* \* \*"/);
  assert.match(workflow, /HKBS RCUV 2010/);
  assert.doesNotMatch(workflow, /eBible|cmn-cu89t/i);
  assert.match(workflow, /scripts\/update-daily-content\.mjs/);
  assert.match(workflow, /--window 2/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path: \.\/public/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("parses the official weekday semi-continuous track", () => {
  const html = `
    <li>Friday, September 11, 2026:
      <a href="https://www.biblegateway.com/passage/?search=x">
        <strong>Semi-continuous:</strong> Psalm 114; Exodus 14:1-18; Acts 7:9-16;
        <strong>Complementary:</strong> Psalm 103:8-13; Genesis 41:53-42:17; Acts 7:9-16;
      </a>
    </li>`;
  const date = new Date(Date.UTC(2026, 8, 11));
  const candidates = extractDailyCandidates(html, date);

  assert.equal(candidates.length, 1);
  assert.deepEqual(parseWeekdayCitations(candidates[0].text), [
    "Psalm 114", "Exodus 14:1-18", "Acts 7:9-16",
  ]);
});

test("selects the semi-continuous Sunday readings and groups epistle with gospel", () => {
  const html = `
    <a href="#pericope_hebrew_reading">Exodus 14:19-31</a>
    <a href="#pericope_psalm_reading">Psalm 114</a>
    <a href="#pericope_hebrew_oth_reading">Genesis 50:15-21</a>
    <a href="#pericope_psalm_oth_reading">Psalm 103:(1-7), 8-13</a>
    <a href="#pericope_epistle_reading">Romans 14:1-12</a>
    <a href="#pericope_gospel_reading">Matthew 18:21-35</a>`;

  assert.deepEqual(parseSundayCitations(html), {
    psalm: ["Psalm 114"],
    old: ["Exodus 14:19-31"],
    new: ["Romans 14:1-12", "Matthew 18:21-35"],
  });
});

test("uses the official Protestant alternatives whenever RCL lists Baruch", () => {
  assert.deepEqual(useProtestantCanonicalAlternatives({
    psalm: ["Luke 1:68-79"],
    old: ["Baruch 5:1-9"],
    new: ["Philippians 1:3-11", "Luke 3:1-6"],
  }), {
    psalm: ["Luke 1:68-79"],
    old: ["Malachi 3:1-4"],
    new: ["Philippians 1:3-11", "Luke 3:1-6"],
  });

  assert.deepEqual(useProtestantCanonicalAlternatives({
    psalm: ["Psalm 19"],
    old: ["Baruch 3:9-15, 3:32-4:4"],
    new: ["Romans 6:3-11", "Matthew 28:1-10"],
  }).old, ["Proverbs 8:1-8, 19-21; 9:4b-6"]);
});

test("falls back to the reviewed RCL snapshot when the official source fails or disagrees", async () => {
  const date = new Date(Date.UTC(2026, 8, 11));
  const unavailable = await loadRclDaysWithFallback([date], {
    fetcher: async () => { throw new Error("temporary outage"); },
  });
  assert.deepEqual(unavailable[0].citations, {
    psalm: ["Psalm 114"],
    old: ["Exodus 14:1-18"],
    new: ["Acts 7:9-16"],
  });
  assert.equal(unavailable[0].dataSource, "bundled-rcl-snapshot");

  const wrongOfficialHtml = `
    <li>Friday, September 11, 2026:
      <a href="https://www.biblegateway.com/passage/?search=wrong">
        <strong>Semi-continuous:</strong> Psalm 1; Genesis 1:1-2; John 1:1-5;
        <strong>Complementary:</strong> Psalm 2; Exodus 1:1-2; Mark 1:1-5;
      </a>
    </li>`;
  const disagrees = await loadRclDaysWithFallback([date], {
    fetcher: async () => wrongOfficialHtml,
  });
  assert.deepEqual(disagrees[0].citations, unavailable[0].citations);
  assert.equal(disagrees[0].dataSource, "bundled-rcl-snapshot");
});

test("parses and loads the required HKBS RCUV 2010 chapters", async () => {
  const sample = `
    <h3>上帝的創造</h3><p>
      <b>1</b><span>起初，上帝創造天地。<sup title="註腳"></sup></span>
      <b>2</b><span>地是空虛混沌，深淵上面一片黑暗。</span>
      <b>3-4</b><span>上帝說：「要有光」，就有了光。</span>
    </p>`;
  assert.deepEqual([...parseHkbsChapter(sample)], [
    [1, "起初，上帝創造天地。"],
    [2, "地是空虛混沌，深淵上面一片黑暗。"],
    [3, { text: "上帝說：「要有光」，就有了光。", displayVerse: "3–4", group: "3-4" }],
    [4, { text: "上帝說：「要有光」，就有了光。", displayVerse: "3–4", group: "3-4" }],
  ]);

  const days = [{
    date: new Date(Date.UTC(2026, 8, 10)),
    citations: {
      psalm: ["Psalm 1:1-2"],
      old: ["Genesis 1:1-2"],
      new: ["John 1:1-2"],
    },
  }];
  const requested = [];
  const bible = await loadHkbsRcuvBible(days, async (url) => {
    requested.push(url);
    return sample;
  });
  assert.deepEqual(new Set(requested), new Set([
    hkbsChapterUrl("PSA", 1),
    hkbsChapterUrl("GEN", 1),
    hkbsChapterUrl("JHN", 1),
  ]));
  assert.match(hkbsChapterUrl("GEN", 1), /\/bb\/RCUV1\/GEN\/1\/$/);
  assert.equal(bible.get("GEN").get(1).get(1), "起初，上帝創造天地。");
});

test("stops rather than silently publishing an unsupported RCL book", () => {
  assert.throws(() => useProtestantCanonicalAlternatives({
    psalm: ["Psalm 1"],
    old: ["Unknown Book 1:1-2"],
    new: ["John 1:1-5"],
  }), /No Protestant 66-book alternative/);
});

test("never publishes deuterocanonical books without an explicit Protestant alternative", () => {
  const unsupported = [
    "Baruch 1:1-3",
    "Tobit 1:1-2",
    "Judith 1:1-3",
    "Wisdom 4:7-15",
    "Sirach 15:15-20",
    "1 Maccabees 1:1-4",
    "2 Maccabees 1:1-4",
  ];

  for (const citation of unsupported) {
    assert.throws(() => useProtestantCanonicalAlternatives({
      psalm: ["Psalm 1"],
      old: [citation],
      new: ["John 1:1-5"],
    }), /No Protestant 66-book alternative/, citation);
  }
});

test("parses grouped and cross-chapter Bible references", () => {
  assert.deepEqual(parseCitation("Psalm 103:(1-7), 8-13").ranges, [
    { startChapter: 103, startVerse: 1, endChapter: 103, endVerse: 7 },
    { startChapter: 103, startVerse: 8, endChapter: 103, endVerse: 13 },
  ]);
  assert.deepEqual(parseCitation("Romans 14:13-15:2").ranges, [
    { startChapter: 14, startVerse: 13, endChapter: 15, endVerse: 2 },
  ]);
  assert.deepEqual(parseCitation("Jude 17-25").ranges, [
    { startChapter: 1, startVerse: 17, endChapter: 1, endVerse: 25 },
  ]);
  assert.deepEqual(parseCitation("Ruth 3:1-13; 4:13-22").ranges, [
    { startChapter: 3, startVerse: 1, endChapter: 3, endVerse: 13 },
    { startChapter: 4, startVerse: 13, endChapter: 4, endVerse: 22 },
  ]);
  assert.deepEqual(parseCitation("Psalm 42 and 43").ranges, [
    { startChapter: 42, startVerse: null, endChapter: 42, endVerse: null },
    { startChapter: 43, startVerse: null, endChapter: 43, endVerse: null },
  ]);
});

test("builds the current page format from RCL citations and Bible verses", () => {
  const bible = new Map();
  for (const usfm of [
    "\\id PSA\n\\c 1\n\\v 1 耶和華是我的牧者，我必不致缺乏。\n\\v 2 他使我躺臥在青草地上。",
    "\\id GEN\n\\c 1\n\\v 1 起初，上帝創造天地。\n\\v 2 上帝的靈運行在水面上。",
    "\\id JHN\n\\c 1\n\\v 1 太初有道，道與上帝同在，道就是上帝。\n\\v 2 這道太初與上帝同在。",
  ]) {
    const parsed = parseTestUsfm(usfm);
    bible.set(parsed.id, parsed.chapters);
  }
  const content = buildDailyContent([
    {
      date: new Date(Date.UTC(2026, 8, 13)),
      citations: { psalm: ["Psalm 1:1"], old: ["Genesis 1:1"], new: ["John 1:1"] },
      sourceUrl: "https://lectionary.library.vanderbilt.edu/daily-readings/",
    },
  ], bible, new Date("2026-09-13T00:00:00Z"));

  assert.equal(content.readings.length, 1);
  assert.equal(content.readings[0].date, "2026-09-13");
  assert.equal(content.readings[0].psalm.reference[0], "詩篇");
  assert.equal(content.readings[0].old.reference[0], "創世記");
  assert.equal(content.readings[0].new.reference[0], "約翰福音");
  assert.match(content.scriptureTexts.d20260913_psalm_1.text, /^1 /);
  assert.doesNotMatch(content.scriptureTexts.d20260913_psalm_1.text, /\n\n/);
});

test("keeps editorial copy fixed when the same RCL readings return in a later cycle", () => {
  const bible = new Map();
  for (const usfm of [
    "\\id PSA\n\\c 1\n\\v 1 惟喜愛耶和華的律法。\n\\v 2 他要像一棵樹栽在溪水旁。",
    "\\id GEN\n\\c 1\n\\v 1 起初，上帝創造天地。",
    "\\id JHN\n\\c 1\n\\v 1 太初有道，道與上帝同在。",
  ]) {
    const parsed = parseTestUsfm(usfm);
    bible.set(parsed.id, parsed.chapters);
  }
  const citations = { psalm: ["Psalm 1:1-2"], old: ["Genesis 1:1"], new: ["John 1:1"] };
  const makeDay = (date) => ({ date, citations, sourceUrl: "https://lectionary.library.vanderbilt.edu/" });
  const content = buildDailyContent([
    makeDay(new Date(Date.UTC(2026, 8, 13))),
    makeDay(new Date(Date.UTC(2029, 8, 13))),
  ], bible, new Date("2026-09-13T00:00:00Z"));
  const [firstCycle, nextCycle] = content.readings;

  assert.equal(firstCycle.editorialKey, nextCycle.editorialKey);
  assert.equal(firstCycle.topic, nextCycle.topic);
  assert.equal(firstCycle.deck, nextCycle.deck);
  assert.equal(firstCycle.reflection, nextCycle.reflection);
  assert.deepEqual(firstCycle.psalm.quotes, nextCycle.psalm.quotes);
});

test("uses reviewed editorial copy instead of inserting verse fragments into templates", () => {
  const bible = new Map();
  for (const usfm of [
    "\\id PSA\n\\c 78\n\\v 1 我的民哪，你們要留心聽我的訓誨。\n\\v 2 我要開口說比喻。\n\\v 3 是我們所聽見、所知道的。\n\\v 4 要將耶和華奇妙的作為述說給後代聽。\n\\v 5 他在以色列中設律法。\n\\v 6 後代子孫可以曉得。\n\\v 7 好叫他們仰望上帝。",
    "\\id JOS\n\\c 5\n\\v 10 以色列人在吉甲安營守逾越節。\n\\v 11 他們吃了那地的出產。\n\\v 12 第二日嗎哪就止住了。",
    "\\id REV\n\\c 8\n\\v 6 七位天使預備吹號。\n\\v 7 第一位天使吹號。\n\\v 8 第二位天使吹號。\n\\v 9 海中的活物死了三分之一。\n\\v 10 第三位天使吹號。\n\\v 11 眾水變苦。\n\\v 12 日月星的三分之一黑暗了。\n\\v 13 你們住在地上的民，禍哉。\n\\c 9\n\\v 1 第五位天使吹號。\n\\v 2 無底坑有煙冒上來。\n\\v 3 有蝗蟲從煙中出來。\n\\v 4 不可傷害地上的草。\n\\v 5 只叫他們受痛苦五個月。\n\\v 6 人要求死，決不得死。\n\\v 7 蝗蟲的形狀好像預備出戰的馬。\n\\v 8 牙齒像獅子的牙齒。\n\\v 9 胸前有甲。\n\\v 10 尾巴上的毒鉤能傷人。\n\\v 11 有無底坑的使者作牠們的王。\n\\v 12 第一樣災禍過去了。",
  ]) {
    const parsed = parseTestUsfm(usfm);
    bible.set(parsed.id, parsed.chapters);
  }
  const editorialPlan = new Map([[
    "psalm 78:1-7|joshua 5:10-12|revelation 8:6-9:12",
    {
      reviewed: true,
      themeFile: "25",
      deck: "這是編輯逐篇閱讀後寫成的題下小字，不是從經文截句再套入句式。",
      reflection: "這是當日獨立撰寫的默想問題。",
      quotes: {
        psalm: [{
          citationIndex: 0,
          verses: [
            { chapter: 78, verse: 1 },
            { chapter: 78, verse: 4 },
            { chapter: 78, verse: 7 },
          ],
        }],
        old: [{ citationIndex: 0, verses: [{ chapter: 5, verse: 12 }] }],
        new: [{ citationIndex: 0, verses: [{ chapter: 8, verse: 13 }] }],
      },
    },
  ]]);
  const content = buildDailyContent([{
    date: new Date(Date.UTC(2026, 10, 5)),
    citations: {
      psalm: ["Psalm 78:1-7"],
      old: ["Joshua 5:10-12"],
      new: ["Revelation 8:6-9:12"],
    },
    sourceUrl: "https://lectionary.library.vanderbilt.edu/",
  }], bible, new Date("2026-09-13T00:00:00Z"), editorialPlan);

  assert.equal(
    content.readings[0].deck,
    "這是編輯逐篇閱讀後寫成的題下小字，不是從經文截句再套入句式。",
  );
  assert.equal(
    content.readings[0].reflection,
    "這是當日獨立撰寫的默想問題。",
  );
  assert.equal(content.readings[0].artwork.file, "25");
  assert.equal(content.readings[0].editorialStatus, "reviewed");
  assert.equal(
    content.readings[0].psalm.quotes[0].text,
    "我的民哪，你們要留心聽我的訓誨。",
  );
  assert.doesNotMatch(
    content.readings[0].psalm.quotes[0].text,
    /奇妙的作為|仰望上帝/,
  );
});

test("covers the complete three-year RCL cycle with reviewed editorial copy", async () => {
  const [rcl, plan] = await Promise.all([
    readFile(new URL("../data/rcl-three-year-semi-continuous.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../data/editorial-plan.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  const entries = Object.values(plan.entries);
  const signatures = new Set(rcl.days.map((day) => cycleSignature(day.citations)));

  assert.equal(plan.status, "complete");
  assert.equal(plan.entryCount, 1072);
  assert.equal(plan.entryCount, plan.totalEntryCount);
  assert.equal(signatures.size, 1072);
  assert.ok([...signatures].every((signature) => plan.entries[signature]?.reviewed === true));
  assert.ok(entries.every((entry) => entry.deck.trim() && entry.reflection.trim()));
  assert.ok(entries.every((entry) =>
    (entry.deck.match(/[^。！？]+[。！？]?/gu) ?? []).length <= 3
      && [...entry.deck].length <= 30,
  ));
  assert.ok(entries.every((entry) =>
    (entry.deck.match(/；/gu) ?? []).length === 1
      && /；(?:願我們|讓我們|學習).+。$/u.test(entry.deck),
  ));
  assert.ok(entries.every((entry) =>
    (entry.reflection.match(/[^。！？]+[。！？]?/gu) ?? []).length === 1
      && [...entry.reflection].length <= 36,
  ));
  assert.equal(new Set(entries.map((entry) => entry.deck.trim())).size, 1072);
  assert.equal(new Set(entries.map((entry) => entry.reflection.trim())).size, 1072);
  const topicLabels = new Map(THEME_DEFINITIONS.map((theme) => [theme.file, theme.label]));
  assert.ok(entries.every((entry) =>
    !entry.deck.includes(topicLabels.get(entry.themeFile)),
  ));
});
