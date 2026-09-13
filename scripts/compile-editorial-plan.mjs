import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  THEME_DEFINITIONS,
  parseCitation,
  selectPassage,
  stableHash,
} from "./update-daily-content.mjs";

const sourceDirectory = resolve("data/editorial");
const outputPath = resolve("data/editorial-plan.json");
const rcl = JSON.parse(await readFile(resolve("data/rcl-three-year-semi-continuous.json"), "utf8"));
const corpus = JSON.parse(await readFile(resolve("data/cuv-required-chapters.json"), "utf8"));
const files = (await readdir(sourceDirectory))
  .filter((filename) => /^batch-\d+\.json$/.test(filename))
  .sort();
const entries = {};
const bible = new Map();
const signatureOf = (citations) => ["psalm", "old", "new"]
  .flatMap((kind) => citations[kind].map((citation) => citation.toLowerCase().replace(/\s+/g, " ").trim()))
  .join("|");
const daysBySignature = new Map();
const usedDecks = new Map();
const usedReflections = new Map();
const themesByFile = new Map(THEME_DEFINITIONS.map((theme) => [theme.file, theme]));
const mindsetCounselBases = new Map(Object.entries({
  "01": "常存感恩",
  "02": "以他人需要為念",
  "03": "以信靠代替恐懼",
  "04": "不輕易灰心",
  "05": "向聖靈保持開放",
  "06": "在未知中仍有信心",
  "07": "守住正直",
  "08": "選擇光明",
  "09": "相信生命有轉機",
  "10": "常存慷慨的心",
  "11": "以愛面對苦難",
  "12": "容許悲傷被看見",
  "13": "常存感謝",
  "14": "謙卑省察",
  "15": "以關懷看待別人",
  "16": "放下控制",
  "17": "耐心等候",
  "18": "懷着新生命盼望",
  "19": "給自己足夠時間",
  "20": "以體諒代替論斷",
  "21": "在黑暗中仍盼望",
  "22": "對改變保持開放",
  "23": "相信同行的力量",
  "24": "謙卑分辨",
  "25": "保持受教的心",
  "26": "不急着下判斷",
  "27": "相信並非獨自一人",
  "28": "尊重事情的節奏",
  "29": "以忠心面對前路",
  "30": "以珍惜看待萬物",
  "31": "以公平正直為念",
  "32": "以開放面對轉變",
  "33": "不忘所領受的恩惠",
  "34": "在困難中保持信靠",
  "35": "以勇氣回應召命",
  "36": "專心仰望基督",
  "37": "在未知中仍有盼望",
  "38": "謙卑承認偏差",
  "39": "相信生命仍可更新",
  "40": "保持內心安定",
  "41": "敞開心尋求真光",
}));
const mindsetCounselPrefixes = ["願我們", "讓我們", "學習"];
const bibleSummaryKeywords = [
  "上帝", "耶和華", "基督", "耶穌", "聖靈", "保羅", "彼得", "摩西", "大衛",
  "以色列", "約書亞", "亞伯拉罕", "亞伯蘭", "雅各", "約瑟", "馬利亞", "門徒",
  "先知", "但以理", "以賽亞", "耶利米", "撒母耳", "掃羅", "大衛", "約伯",
  "路得", "拿俄米", "羅得", "波阿斯", "以利", "巴比倫", "羔羊", "馬可", "路加",
  "約翰", "希伯來書", "詩篇", "福音", "教會", "百姓", "曠野", "十字架", "復活",
];
const weakSummaryOpening = /^(而|也|並|卻|但(?!以理)|所以|因此|才|仍|又|更|還|不是|就是|使|讓|在|為|與|及|或|若|當|面對|其中|前者|後者|成了|結果|真正|這樣|同時)/u;
const weakSummaryEnding = /(?:的|而|也|並|在|為|向|從|把|將|使|讓|因|若|當|時)$/u;
const summaryKeywords = [
  "上帝", "基督", "耶穌", "愛", "生命", "公義", "和平", "盼望", "恩典", "守護",
  "同在", "自由", "真理", "憐憫", "回轉", "聆聽", "照顧", "信心", "同行", "醫治",
  "安息", "記得", "記念", "分享", "誠實", "保護", "接納", "饒恕", "忠心", "智慧",
  "謙卑", "更新",
];
const weakOpening = /^(這|它|他|她|其|但|而|也|並|卻|所以|因此|不是|不能|不可|前者|後者)/u;
const everydayReflectionKeywords = [
  "今天", "今日", "現在", "生活", "身邊", "家庭", "朋友", "工作", "關係", "時間",
  "說話", "行動", "一步", "停止", "停下", "放下", "聯絡", "陪伴", "聆聽", "分享",
  "保護", "照顧", "道歉", "支持", "幫助", "安排", "改變", "練習", "休息", "界線",
  "資源", "安全",
];
const theologicalReflectionKeywords = [
  "上帝", "耶和華", "基督", "耶穌", "信仰", "信心", "恩典", "救恩", "教會", "禱告",
  "祈禱", "經文", "十字架", "審判", "聖靈", "屬靈", "神聖", "神學",
];

function splitSentences(value) {
  return value.match(/[^。！？]+[。！？]?/gu)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

function cleanSummary(value) {
  return value
    .replace(/[『』「」“”]/gu, "")
    .replace(/[。！？；，：]+$/u, "")
    .trim();
}

function summaryCandidatesFor(entry, maximumLength) {
  const themeLabel = themesByFile.get(entry.themeFile)?.label ?? "";
  const sources = [
    [entry.shortSummary, 100],
    [entry.shortDeck, 5],
    [entry.deck, 0],
  ].filter(([value]) => value?.trim());
  const candidates = new Map();

  for (const [source, sourceBonus] of sources) {
    const sentences = splitSentences(source).map((sentence) => sentence.replace(/[。！？]+$/u, ""));
    for (const [sentenceIndex, sentence] of sentences.entries()) {
      const clauses = sentence.split(/[；，：]/u).map(cleanSummary).filter(Boolean);
      for (let start = 0; start < clauses.length; start += 1) {
        const text = clauses[start];
        const length = [...text].length;
        if (length < 5 || length > maximumLength) continue;
        if (themeLabel && text.includes(themeLabel)) continue;
        if (weakSummaryOpening.test(text) || weakSummaryEnding.test(text)) continue;
        const bibleKeywordCount = bibleSummaryKeywords.reduce(
          (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
          0,
        );
        // A later clause is accepted only when it names its biblical subject;
        // this prevents an attractive but contextless fragment becoming the caption.
        if (start > 0 && bibleKeywordCount === 0) continue;
        const score = sourceBonus
          + bibleKeywordCount * 8
          + summaryKeywords.reduce(
            (total, keyword) => total + (text.includes(keyword) ? 1.5 : 0),
            0,
          )
          - sentenceIndex * 0.15
          - start * 1.5
          - Math.abs(length - 13) / 5
          + (start === clauses.length - 1 ? 0.5 : 0);
        if (!candidates.has(text) || candidates.get(text).score < score) {
          candidates.set(text, { text, score, length });
        }
      }
    }
  }
  return [...candidates.values()].sort((a, b) => b.score - a.score || b.length - a.length);
}

function displayDeckFor(entry, signature) {
  const counselBase = mindsetCounselBases.get(entry.themeFile);
  if (!counselBase) throw new Error(`No mindset counsel for topic ${entry.themeFile}.`);
  const prefixOffset = stableHash(signature) % mindsetCounselPrefixes.length;
  const candidates = [];

  for (let offset = 0; offset < mindsetCounselPrefixes.length; offset += 1) {
    const prefix = mindsetCounselPrefixes[(prefixOffset + offset) % mindsetCounselPrefixes.length];
    const counsel = `${prefix}${counselBase}`;
    const maximumSummaryLength = 30 - [...counsel].length - 2;
    for (const summary of summaryCandidatesFor(entry, maximumSummaryLength)) {
      const text = `${summary.text}；${counsel}。`;
      candidates.push({
        text,
        score: summary.score - offset * 0.25,
        length: [...text].length,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.length - a.length);
  const selected = candidates.find(({ text }) => !usedDecks.has(text));
  if (!selected) {
    throw new Error(`No unique summary-and-mindset deck could be selected for ${signature}; add shortSummary.`);
  }
  return selected.text;
}

function displayReflectionFor(entry) {
  if (entry.shortReflection?.trim()) return entry.shortReflection.trim();
  const candidates = splitSentences(entry.reflection.trim())
    .map((text, index) => {
      const length = [...text].length;
      const score = index * 3
        + (text.endsWith("？") ? 3 : 0)
        + (/[我你]/u.test(text) ? 2 : 0)
        - Math.abs(length - 24) / 8
        + everydayReflectionKeywords.reduce(
          (total, keyword) => total + (text.includes(keyword) ? 3 : 0),
          0,
        )
        - theologicalReflectionKeywords.reduce(
          (total, keyword) => total + (text.includes(keyword) ? 6 : 0),
          0,
        );
      return { text, length, score };
    })
    .filter(({ length }) => length >= 12 && length <= 36)
    .sort((a, b) => b.score - a.score || Math.abs(a.length - 24) - Math.abs(b.length - 24));
  if (!candidates.length) {
    throw new Error("No complete 36-character everyday reflection could be selected; add shortReflection.");
  }
  return candidates[0].text;
}

for (const chapter of Object.values(corpus.chapters)) {
  if (!bible.has(chapter.code)) bible.set(chapter.code, new Map());
  bible.get(chapter.code).set(chapter.chapter, new Map(chapter.verses));
}
for (const day of rcl.days) {
  const signature = signatureOf(day.citations);
  if (!daysBySignature.has(signature)) daysBySignature.set(signature, []);
  daysBySignature.get(signature).push(day);
}

for (const filename of files) {
  const batch = JSON.parse(await readFile(resolve(sourceDirectory, filename), "utf8"));
  for (const [signature, entry] of Object.entries(batch.entries ?? {})) {
    if (entries[signature]) throw new Error(`Duplicate editorial signature in ${filename}: ${signature}`);
    if (entry.reviewed !== true) throw new Error(`Unreviewed entry in ${filename}: ${signature}`);
    if (!/^\d{2}$/.test(entry.themeFile) || Number(entry.themeFile) < 1 || Number(entry.themeFile) > 41) {
      throw new Error(`Invalid theme in ${filename}: ${signature}`);
    }
    if (!entry.deck?.trim() || !entry.reflection?.trim()) {
      throw new Error(`Missing editorial copy in ${filename}: ${signature}`);
    }
    const matchingDays = daysBySignature.get(signature);
    if (!matchingDays?.length) throw new Error(`Unknown RCL signature in ${filename}: ${signature}`);
    for (const date of entry.dates ?? []) {
      if (!matchingDays.some((day) => day.date === date)) {
        throw new Error(`Date ${date} does not use ${signature} in ${filename}.`);
      }
    }
    const displayDeck = displayDeckFor(entry, signature);
    const displayReflection = displayReflectionFor(entry);
    if (splitSentences(displayDeck).length > 3 || [...displayDeck].length > 30) {
      throw new Error(`Display deck is too long in ${filename}: ${signature}`);
    }
    if (splitSentences(displayReflection).length > 1 || [...displayReflection].length > 36) {
      throw new Error(`Display reflection is too long in ${filename}: ${signature}`);
    }
    if (usedDecks.has(displayDeck)) {
      throw new Error(`Repeated deck in ${filename}: ${signature} and ${usedDecks.get(displayDeck)}`);
    }
    if (usedReflections.has(displayReflection)) {
      throw new Error(`Repeated reflection in ${filename}: ${signature} and ${usedReflections.get(displayReflection)}`);
    }
    usedDecks.set(displayDeck, signature);
    usedReflections.set(displayReflection, signature);

    const citations = matchingDays[0].citations;
    for (const kind of ["psalm", "old", "new"]) {
      if (!Array.isArray(entry.quotes?.[kind]) || !entry.quotes[kind].length) {
        throw new Error(`Missing ${kind} quote selection in ${filename}: ${signature}`);
      }
      const indexes = entry.quotes[kind].map(({ citationIndex }) => citationIndex);
      if (indexes.length !== citations[kind].length
        || new Set(indexes).size !== citations[kind].length
        || indexes.some((index) => !Number.isInteger(index) || index < 0 || index >= citations[kind].length)) {
        throw new Error(`Quote selections do not cover every ${kind} citation in ${filename}: ${signature}`);
      }
      for (const selection of entry.quotes[kind]) {
        if (!Array.isArray(selection.verses) || !selection.verses.length) {
          throw new Error(`Empty ${kind} quote selection in ${filename}: ${signature}`);
        }
        const citation = citations[kind][selection.citationIndex];
        const parsed = parseCitation(citation);
        if (!parsed.book) continue;
        const passage = selectPassage(bible, citation);
        for (const verse of selection.verses) {
          if (!passage.records.some((record) => record.chapter === verse.chapter && record.verse === verse.verse)) {
            throw new Error(`Selected verse ${verse.chapter}:${verse.verse} is outside ${citation} in ${filename}.`);
          }
        }
      }
    }
    const {
      shortDeck: _shortDeck,
      shortSummary: _shortSummary,
      shortReflection: _shortReflection,
      ...sourceEntry
    } = entry;
    entries[signature] = {
      ...sourceEntry,
      ...(displayDeck !== entry.deck.trim() ? { editorialNote: entry.deck.trim() } : {}),
      ...(displayReflection !== entry.reflection.trim()
        ? { reflectionNote: entry.reflection.trim() }
        : {}),
      deck: displayDeck,
      reflection: displayReflection,
    };
  }
}

await writeFile(outputPath, `${JSON.stringify({
  version: 1,
  status: Object.keys(entries).length === rcl.uniqueSignatureCount ? "complete" : "in-progress",
  track: "RCL Daily Readings — Semi-continuous",
  entryCount: Object.keys(entries).length,
  totalEntryCount: rcl.uniqueSignatureCount,
  batches: files,
  entries,
}, null, 2)}\n`);

console.log(`Compiled ${Object.keys(entries).length} reviewed editorial entries from ${files.length} batches.`);
