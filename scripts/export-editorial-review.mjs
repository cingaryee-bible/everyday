import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  THEME_DEFINITIONS,
  cycleSignature,
  editorialQuoteFromSelection,
  selectPassage,
} from "./update-daily-content.mjs";

const output = resolve(process.argv[2] ?? "review/editorial-cycle-review.txt");
const checkOutput = resolve(process.argv[3] ?? "review/editorial-cycle-check.txt");
const [rcl, corpus, plan] = await Promise.all([
  readFile(resolve("data/rcl-three-year-semi-continuous.json"), "utf8").then(JSON.parse),
  readFile(resolve("data/cuv-required-chapters.json"), "utf8").then(JSON.parse),
  readFile(resolve("data/editorial-plan.json"), "utf8").then(JSON.parse),
]);

if (plan.status !== "complete" || plan.entryCount !== plan.totalEntryCount) {
  throw new Error(`Editorial plan is not complete (${plan.entryCount}/${plan.totalEntryCount}).`);
}

const themes = new Map(THEME_DEFINITIONS.map((theme) => [theme.file, theme]));
const bible = new Map();
for (const chapter of Object.values(corpus.chapters)) {
  if (!bible.has(chapter.code)) bible.set(chapter.code, new Map());
  bible.get(chapter.code).set(chapter.chapter, new Map(chapter.verses));
}

const daysBySignature = new Map();
for (const day of rcl.days) {
  const signature = cycleSignature(day.citations);
  if (!daysBySignature.has(signature)) daysBySignature.set(signature, []);
  daysBySignature.get(signature).push(day);
}

function selectedQuote(citation, selection, theme, editorial) {
  const passage = selectPassage(bible, citation);
  const records = selection.verses.map(({ chapter, verse }) => {
    const record = passage.records.find((item) => item.chapter === chapter && item.verse === verse);
    if (!record) throw new Error(`Missing selected verse ${chapter}:${verse} in ${citation}.`);
    return record;
  });
  const verseLabels = records.map(({ chapter, verse }) => `${chapter}:${verse}`).join("、");
  const displayed = editorialQuoteFromSelection(passage, selection, theme, editorial);
  return {
    label: passage.label,
    verseLabels,
    candidateText: records.map(({ chapter, verse, text }) => `${chapter}:${verse} ${text}`).join("\n    "),
    displayed,
  };
}

const entries = Object.entries(plan.entries).map(([signature, entry]) => {
  const days = daysBySignature.get(signature);
  if (!days?.length) throw new Error(`No RCL dates found for ${signature}.`);
  return { signature, entry, days };
}).sort((a, b) => a.days[0].date.localeCompare(b.days[0].date));

const lines = [
  "毛毛聊每日經課｜三年循環人手核對清單",
  "",
  `經課範圍：${rcl.dateRange.from} 至 ${rcl.dateRange.to}`,
  `循環日數：${rcl.dayCount}`,
  `不重複經課組合：${entries.length}`,
  "版本：和合本（繁體）｜RCL Daily Readings 半連續讀經",
  "",
  "每項列出實際會使用的 topic 圖、經課出處、題下小字、卡面節錄及默想。",
  "每個出處的卡面只顯示一段節錄；其餘核對經節只供人手校對，不會全部顯示。",
  "如同一組經課在三年內重複，會一併列出所有循環日期。",
  "",
  "=".repeat(88),
];
const checkLines = [
  "毛毛聊每日經課｜三年循環人手核對版",
  "",
  `經課範圍：${rcl.dateRange.from} 至 ${rcl.dateRange.to}`,
  `循環日數：${rcl.dayCount}`,
  "版本：和合本（繁體）｜RCL Daily Readings 半連續讀經",
  "",
  "本檔只列出網站實際會顯示的內容，方便逐項核對。",
  "完整經文會保留在網站的「完整經文＋」內，不在本清單重複列出。",
  "",
  "=".repeat(72),
];

for (const [index, { signature, entry, days }] of entries.entries()) {
  const theme = themes.get(entry.themeFile);
  if (!theme) throw new Error(`Unknown topic image ${entry.themeFile} for ${signature}.`);
  const citations = days[0].citations;
  lines.push(
    "",
    `[${String(index + 1).padStart(4, "0")} / ${entries.length}]`,
    `循環日期：${days.map((day) => day.date).join("、")}`,
    `Topic：${theme.label}。`,
    `Topic 圖：public/assets/topics/topic-${entry.themeFile}.webp`,
    "經課出處：",
    `  詩篇：${citations.psalm.join("；")}`,
    `  舊約：${citations.old.join("；")}`,
    `  新約：${citations.new.join("；")}`,
    "題下小字：",
    entry.deck,
    ...(entry.editorialNote ? ["詳細編輯備註（不會顯示於網頁）：", entry.editorialNote] : []),
    "卡面節錄（實際顯示）：",
  );
  for (const [kind, label] of [["psalm", "詩篇"], ["old", "舊約"], ["new", "新約"]]) {
    const selections = [...entry.quotes[kind]].sort((a, b) => a.citationIndex - b.citationIndex);
    for (const selection of selections) {
      const quote = selectedQuote(citations[kind][selection.citationIndex], selection, theme, entry);
      lines.push(
        `  ${label}｜${quote.label}｜${quote.displayed.chapter}:${quote.displayed.verse}`,
        `  ${quote.displayed.text}`,
        `  核對候選經節（不會全部顯示）｜${quote.verseLabels}`,
        `    ${quote.candidateText}`,
      );
    }
  }
  lines.push(
    "今日默想（實際顯示）：",
    entry.reflection,
    ...(entry.reflectionNote
      ? ["詳細默想備註（不會顯示於網頁）：", entry.reflectionNote]
      : []),
    "",
    "-".repeat(88),
  );
}

for (const [index, day] of rcl.days.entries()) {
  const signature = cycleSignature(day.citations);
  const entry = plan.entries[signature];
  if (!entry) throw new Error(`No reviewed editorial entry for ${day.date}.`);
  const theme = themes.get(entry.themeFile);
  if (!theme) throw new Error(`Unknown topic image ${entry.themeFile} for ${signature}.`);
  const displayedQuotes = [];
  for (const [kind, label] of [["psalm", "詩篇"], ["old", "舊約"], ["new", "新約"]]) {
    const selections = [...entry.quotes[kind]].sort((a, b) => a.citationIndex - b.citationIndex);
    for (const selection of selections) {
      const quote = selectedQuote(
        day.citations[kind][selection.citationIndex],
        selection,
        theme,
        entry,
      );
      displayedQuotes.push({ kind: label, ...quote });
    }
  }
  checkLines.push(
    "",
    `[${String(index + 1).padStart(4, "0")} / ${rcl.dayCount}]`,
    `日期：${day.date}`,
    `Topic：${theme.label}。`,
    `Topic 圖：public/assets/topics/topic-${entry.themeFile}.webp`,
    "經課出處：",
    `  詩篇：${day.citations.psalm.join("；")}`,
    `  舊約：${day.citations.old.join("；")}`,
    `  新約：${day.citations.new.join("；")}`,
    `題下小字（${[...entry.deck].length} 字）：`,
    entry.deck,
    "卡面節錄（網站實際顯示）：",
    ...displayedQuotes.flatMap((quote) => [
      `  ${quote.kind}｜${quote.label}｜${quote.displayed.chapter}:${quote.displayed.verse}`,
      `  ${quote.displayed.text}`,
    ]),
    `今日默想（${[...entry.reflection].length} 字）：`,
    entry.reflection,
    "",
    "-".repeat(72),
  );
}

await mkdir(dirname(output), { recursive: true });
await mkdir(dirname(checkOutput), { recursive: true });
await Promise.all([
  writeFile(output, `${lines.join("\n")}\n`),
  writeFile(checkOutput, `${checkLines.join("\n")}\n`),
]);
console.log(`Exported ${entries.length} reviewed entries to ${output}.`);
console.log(`Exported ${rcl.dayCount} daily check entries to ${checkOutput}.`);
