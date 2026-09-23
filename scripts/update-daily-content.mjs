import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RCL_DAILY_URL = "https://lectionary.library.vanderbilt.edu/daily-readings/";
export const HKBS_RCUV_URL = "https://rcuv.hkbs.org.hk/";
export const HKBS_RCUV_VERSION = "RCUV1";
export const DEFAULT_OUTPUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/daily-content.js",
);
export const DEFAULT_EDITORIAL_PLAN = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/editorial-plan.json",
);
export const DEFAULT_RCL_SNAPSHOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/rcl-three-year-semi-continuous.json",
);
const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const ENGLISH_WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const CHINESE_WEEKDAYS = [
  ["星期日", "日"], ["星期一", "一"], ["星期二", "二"], ["星期三", "三"],
  ["星期四", "四"], ["星期五", "五"], ["星期六", "六"],
];

const BOOKS = [
  ["Genesis", "GEN", "創世記"], ["Exodus", "EXO", "出埃及記"],
  ["Leviticus", "LEV", "利未記"], ["Numbers", "NUM", "民數記"],
  ["Deuteronomy", "DEU", "申命記"], ["Joshua", "JOS", "約書亞記"],
  ["Judges", "JDG", "士師記"], ["Ruth", "RUT", "路得記"],
  ["1 Samuel", "1SA", "撒母耳記上"], ["2 Samuel", "2SA", "撒母耳記下"],
  ["1 Kings", "1KI", "列王紀上"], ["2 Kings", "2KI", "列王紀下"],
  ["1 Chronicles", "1CH", "歷代志上"], ["2 Chronicles", "2CH", "歷代志下"],
  ["Ezra", "EZR", "以斯拉記"], ["Nehemiah", "NEH", "尼希米記"],
  ["Esther", "EST", "以斯帖記"], ["Job", "JOB", "約伯記"],
  ["Psalms", "PSA", "詩篇", ["Psalm"]], ["Proverbs", "PRO", "箴言"],
  ["Ecclesiastes", "ECC", "傳道書"],
  ["Song of Solomon", "SNG", "雅歌", ["Song of Songs"]],
  ["Isaiah", "ISA", "以賽亞書"], ["Jeremiah", "JER", "耶利米書"],
  ["Lamentations", "LAM", "耶利米哀歌"], ["Ezekiel", "EZK", "以西結書"],
  ["Daniel", "DAN", "但以理書"], ["Hosea", "HOS", "何西阿書"],
  ["Joel", "JOL", "約珥書"], ["Amos", "AMO", "阿摩司書"],
  ["Obadiah", "OBA", "俄巴底亞書"], ["Jonah", "JON", "約拿書"],
  ["Micah", "MIC", "彌迦書"], ["Nahum", "NAM", "那鴻書"],
  ["Habakkuk", "HAB", "哈巴谷書"], ["Zephaniah", "ZEP", "西番雅書"],
  ["Haggai", "HAG", "哈該書"], ["Zechariah", "ZEC", "撒迦利亞書"],
  ["Malachi", "MAL", "瑪拉基書"], ["Matthew", "MAT", "馬太福音"],
  ["Mark", "MRK", "馬可福音"], ["Luke", "LUK", "路加福音"],
  ["John", "JHN", "約翰福音"], ["Acts", "ACT", "使徒行傳"],
  ["Romans", "ROM", "羅馬書"], ["1 Corinthians", "1CO", "哥林多前書"],
  ["2 Corinthians", "2CO", "哥林多後書"], ["Galatians", "GAL", "加拉太書"],
  ["Ephesians", "EPH", "以弗所書"], ["Philippians", "PHP", "腓立比書"],
  ["Colossians", "COL", "歌羅西書"],
  ["1 Thessalonians", "1TH", "帖撒羅尼迦前書"],
  ["2 Thessalonians", "2TH", "帖撒羅尼迦後書"],
  ["1 Timothy", "1TI", "提摩太前書"], ["2 Timothy", "2TI", "提摩太後書"],
  ["Titus", "TIT", "提多書"], ["Philemon", "PHM", "腓利門書"],
  ["Hebrews", "HEB", "希伯來書"], ["James", "JAS", "雅各書"],
  ["1 Peter", "1PE", "彼得前書"], ["2 Peter", "2PE", "彼得後書"],
  ["1 John", "1JN", "約翰一書"], ["2 John", "2JN", "約翰二書"],
  ["3 John", "3JN", "約翰三書"], ["Jude", "JUD", "猶大書"],
  ["Revelation", "REV", "啟示錄"],
].map(([english, code, chinese, aliases = []]) => ({ english, code, chinese, aliases }));

const BOOK_ALIASES = BOOKS.flatMap((book) =>
  [book.english, ...book.aliases].map((alias) => ({ alias, book })),
).sort((a, b) => b.alias.length - a.alias.length);
const SINGLE_CHAPTER_BOOK_CODES = new Set(["OBA", "PHM", "2JN", "3JN", "JUD"]);

export const THEME_DEFINITIONS = [
  ["01", "一同歡呼", "一起為上帝的作為歡呼。", "今天有甚麼恩典，值得我開口讚美？", ["讚美", "喜樂", "群體"], ["歡呼", "歌頌", "讚美", "喜樂", "唱歌"]],
  ["02", "一起守護", "彼此守望，也彼此承擔。", "我今天可以怎樣守護身邊的人？", ["守望", "彼此", "承擔"], ["保守", "看守", "彼此", "擔當", "扶助"]],
  ["03", "不用怕", "在不安之中，仍可倚靠上帝。", "我願意把哪一份恐懼交給上帝？", ["勇氣", "信靠", "同在"], ["不要怕", "不要懼怕", "懼怕", "膽怯"]],
  ["04", "不要放棄", "即使路長，也繼續忠心。", "甚麼正催促我放棄？我可否再走一步？", ["忍耐", "忠心", "盼望"], ["忍耐", "堅忍", "喪膽", "堅持", "到底"]],
  ["05", "五旬節", "聖靈吹來，使人得著能力。", "我願意讓聖靈帶領我走向哪裏？", ["聖靈", "能力", "差遣"], ["聖靈", "方言", "五旬節"]],
  ["06", "仍要相信", "未看見以前，仍然選擇相信。", "我正學習在哪一件事上相信上帝？", ["信心", "等候", "交託"], ["信", "相信", "信心"]],
  ["07", "企穩", "風浪之中，仍在真理上站穩。", "今天有甚麼幫助我重新站穩？", ["站立", "堅定", "信靠"], ["站住", "站立", "堅固", "穩固"]],
  ["08", "光照進來", "黑暗不能勝過上帝的光。", "我願意讓真光照進哪一個角落？", ["真光", "盼望", "更新"], ["光", "照亮", "黑暗", "明亮"]],
  ["09", "再次生長", "上帝使枯乾之處重新生長。", "我生命中哪一處正在慢慢萌芽？", ["生長", "更新", "盼望"], ["生長", "發芽", "枝子", "結果子", "種子"]],
  ["10", "分給別人", "領受恩典，也慷慨地分享。", "我今天可以把甚麼分給別人？", ["分享", "慷慨", "鄰舍"], ["分給", "施捨", "給予", "賙濟", "慷慨"]],
  ["11", "受難週", "跟隨基督，走近十字架。", "面對基督的受苦，我要停下來看見甚麼？", ["十字架", "受苦", "愛"], ["十字架", "釘", "受苦", "苦難"]],
  ["12", "可以哭", "悲傷可以被看見，眼淚也被記念。", "我需要容許自己為甚麼流淚？", ["哀傷", "安慰", "同在"], ["哭", "哀", "眼淚", "悲傷", "哀哭"]],
  ["13", "多謝", "數算恩典，以感謝回應。", "今天，我最想為哪一件事感謝上帝？", ["感恩", "恩典", "回應"], ["感謝", "稱謝", "感恩", "謝恩"]],
  ["14", "大齋期", "回到上帝面前，整理內心。", "有甚麼需要放下，使我更專心跟隨主？", ["悔改", "禱告", "預備"], ["禁食", "悔改", "灰", "四十"]],
  ["15", "好好看顧", "上帝眷顧我們，也教我們彼此照料。", "誰需要我今天多看顧一點？", ["眷顧", "牧養", "關懷"], ["牧人", "牧養", "眷顧", "照顧", "羊群"]],
  ["16", "安心交托", "停止抓緊，安歇在上帝手中。", "我今天可以把甚麼真正交託給上帝？", ["安息", "平安", "信靠"], ["安息", "平安", "安穩", "交託", "安然"]],
  ["17", "將臨期", "在等候之中，預備迎接主。", "我可以怎樣為主的來臨預備道路？", ["等候", "預備", "盼望"], ["預備主的道", "降臨", "等候"]],
  ["18", "復活期", "死亡不是終局，新生命已經開始。", "復活的盼望今天如何改變我？", ["復活", "生命", "盼望"], ["復活", "從死裏", "空墳墓"]],
  ["19", "慢慢復原", "上帝的醫治，容許我們一步一步復原。", "我需要在哪一處接納緩慢的醫治？", ["醫治", "復原", "耐心"], ["醫治", "痊癒", "復原", "康復", "復興"]],
  ["20", "憐憫", "蒙上帝憐憫，也向人施憐憫。", "我今天可以怎樣以憐憫回應別人？", ["憐憫", "寬恕", "恩慈"], ["憐憫", "慈悲", "饒恕", "赦免", "憐恤"]],
  ["21", "晨光將到", "黑夜雖長，晨光仍會來到。", "哪一份盼望正陪我等候天明？", ["晨光", "盼望", "等候"], ["清晨", "黎明", "天亮", "早晨"]],
  ["22", "會有新事", "上帝仍在我們中間作新事。", "我可否留意上帝正在開展的新事？", ["更新", "可能", "盼望"], ["新事", "更新", "新造", "新天新地"]],
  ["23", "有人同行", "這條路不必獨自走過。", "我可以接住誰的同行，也陪伴誰？", ["同行", "陪伴", "群體"], ["同在", "同行", "陪伴", "一同"]],
  ["24", "求智慧", "先求智慧，再決定下一步。", "面前的選擇，需要怎樣的智慧？", ["智慧", "分辨", "禱告"], ["智慧", "聰明", "明哲", "分辨"]],
  ["25", "留心聽", "安靜下來，聆聽上帝的話。", "今天的經文正在提醒我甚麼？", ["聆聽", "話語", "回應"], ["聽", "留心", "側耳", "話語", "吩咐"]],
  ["26", "看清楚", "讓真理照明，看清自己的心。", "我需要在上帝面前看清甚麼？", ["省察", "真理", "清醒"], ["看見", "眼睛", "省察", "察看"]],
  ["27", "祂在這裡", "上帝臨在，就在此時此地。", "我今天在哪裏察覺上帝的同在？", ["臨在", "聖所", "相遇"], ["同在", "居住", "聖所", "住在"]],
  ["28", "等一等", "不急著催促，學習在主裏等候。", "我需要為哪一件事多等一等？", ["等候", "耐心", "信靠"], ["等候", "等到", "日期", "時候"]],
  ["29", "繼續走", "靠著恩典，忠心走前面的路。", "我今天要忠心走出的下一步是甚麼？", ["道路", "忠心", "前行"], ["行走", "道路", "前行", "腳步", "路上"]],
  ["30", "萬物都好", "在受造萬物中，看見上帝的美善。", "今天有甚麼微小的美好值得珍惜？", ["創造", "美善", "感恩"], ["創造", "天地", "萬物", "甚好", "受造"]],
  ["31", "行公義", "愛憐憫，也勇敢實踐公義。", "今天哪一個選擇更接近公義？", ["公義", "憐憫", "行動"], ["公義", "公平", "正直", "審判", "欺壓"]],
  ["32", "被帶出去", "上帝領我們離開熟悉之地。", "我正被帶離甚麼，又被帶往哪裏？", ["帶領", "出發", "信心"], ["領出", "帶領", "差遣", "出去", "離開"]],
  ["33", "記得恩典", "回望走過的路，記得上帝的恩典。", "哪一份恩典值得我今天再次記起？", ["記念", "恩典", "信實"], ["記念", "恩典", "恩惠", "慈愛", "不忘記"]],
  ["34", "走過荒地", "荒地不是終點，上帝仍然引路。", "在乾旱之中，我正在學習甚麼？", ["曠野", "供應", "引導"], ["曠野", "乾旱", "沙漠", "荒場", "乾渴"]],
  ["35", "起來", "聽見呼喚，就重新起來。", "今天，甚麼正邀請我再次起來？", ["呼召", "勇氣", "行動"], ["起來", "興起", "站起", "復起"]],
  ["36", "跟我來", "放下纏累，專心跟隨基督。", "耶穌今天邀請我跟隨祂到哪裏？", ["跟隨", "門徒", "回應"], ["跟從", "門徒", "跟我來", "撇下"]],
  ["37", "路會打開", "未走過的路，也可憑信前行。", "我願意相信上帝會為哪一步開路？", ["道路", "引導", "信心"], ["道路", "開門", "開路", "引導", "曠野開道路"]],
  ["38", "返轉頭", "回轉不是失敗，而是重新歸向上帝。", "我需要從哪一條路回轉？", ["回轉", "悔改", "歸回"], ["回轉", "悔改", "歸向", "回來"]],
  ["39", "重新開始", "恩典讓我們可以重新開始。", "今天有甚麼可以在上帝裏重新開始？", ["更新", "重建", "盼望"], ["重建", "重新", "新造", "復興", "再建"]],
  ["40", "靜下來", "停下喧鬧，在上帝面前安靜。", "我願意留一點空間，安靜聆聽嗎？", ["安靜", "聆聽", "同在"], ["靜默", "安靜", "止息", "肅靜"]],
  ["41", "顯現期", "真光顯明，照亮萬民。", "我可以怎樣回應已經顯明的基督？", ["顯現", "真光", "萬民"], ["顯現", "星", "博士", "萬民之光"]],
].map(([file, label, deck, reflection, tags, keywords]) => ({
  file, label, deck, reflection, tags, keywords,
}));

const THEMES_BY_FILE = new Map(THEME_DEFINITIONS.map((theme) => [theme.file, theme]));
const GENERAL_THEMES = THEME_DEFINITIONS.filter(
  ({ file }) => !["05", "11", "14", "17", "18", "41"].includes(file),
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function decodeHtml(value) {
  const named = {
    amp: "&", apos: "'", gt: ">", hellip: "…", laquo: "«", ldquo: "“",
    lt: "<", nbsp: " ", ndash: "–", quot: '"', raquo: "»", rdquo: "”",
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

export function stripHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function dateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function officialDateLabel(date) {
  return `${ENGLISH_WEEKDAYS[date.getUTCDay()]}, ${ENGLISH_MONTHS[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, "0")}, ${date.getUTCFullYear()}`;
}

export function extractDailyCandidates(html, date) {
  const needle = `${officialDateLabel(date)}:`;
  const candidates = [];
  let cursor = 0;

  while (cursor < html.length) {
    const found = html.indexOf(needle, cursor);
    if (found === -1) break;
    const liEnd = html.indexOf("</li>", found);
    const segmentEnd = liEnd !== -1 && liEnd - found < 5000 ? liEnd + 5 : found + 3500;
    const segment = html.slice(found + needle.length, segmentEnd);
    const anchor = segment.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);

    if (anchor) {
      const href = anchor[1].match(/href=["']([^"']+)["']/i)?.[1] ?? "";
      candidates.push({ href: decodeHtml(href), text: stripHtml(anchor[2]) });
    }
    cursor = found + needle.length;
  }

  return candidates;
}

export function chooseDailyCandidate(candidates) {
  return candidates.find(({ text }) => /Semi-continuous:/i.test(text))
    ?? candidates.find(({ href }) => /\/texts\//i.test(href))
    ?? candidates[0];
}

export function parseWeekdayCitations(text) {
  const semiContinuous = text.match(/Semi-continuous:\s*([\s\S]*?)(?:Complementary:|$)/i)?.[1]
    ?? text;
  return semiContinuous
    .split(";")
    .map((citation) => citation.trim())
    .filter(Boolean);
}

function capturePericope(html, id) {
  const pattern = new RegExp(
    `<a\\b[^>]*href=["']#${escapeRegExp(id)}["'][^>]*>([\\s\\S]*?)<\\/a>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : "";
}

export function parseSundayCitations(html) {
  const psalm = capturePericope(html, "pericope_psalm_reading");
  const old = capturePericope(html, "pericope_hebrew_reading");
  const epistle = capturePericope(html, "pericope_epistle_reading");
  const gospel = capturePericope(html, "pericope_gospel_reading");
  const newReadings = [epistle, gospel].filter(Boolean);

  if (!psalm || !old || !newReadings.length) {
    throw new Error("The RCL Sunday page did not contain the expected reading links.");
  }
  return { psalm: [psalm], old: [old], new: newReadings };
}

const PROTESTANT_CANONICAL_ALTERNATIVES = [
  {
    pattern: /^Baruch\s+5:1[-–—]9$/i,
    replacement: "Malachi 3:1-4",
  },
  {
    pattern: /^Baruch\s+3:9[-–—]15,\s*(?:3:)?32[-–—]4:4$/i,
    replacement: "Proverbs 8:1-8, 19-21; 9:4b-6",
  },
];

export function useProtestantCanonicalAlternatives(citations) {
  const result = {};
  for (const kind of ["psalm", "old", "new"]) {
    result[kind] = citations[kind].map((citation) => {
      const alternative = PROTESTANT_CANONICAL_ALTERNATIVES.find(({ pattern }) =>
        pattern.test(citation.trim()),
      );
      const selected = alternative?.replacement ?? citation;
      if (!parseCitation(selected).book) {
        throw new Error(
          `No Protestant 66-book alternative is configured for RCL citation: ${citation}`,
        );
      }
      return selected;
    });
  }
  return result;
}

function classifyCitations(citations) {
  if (citations.length < 3) {
    throw new Error(`Expected at least three daily citations, received: ${citations.join("; ")}`);
  }
  return { psalm: [citations[0]], old: [citations[1]], new: citations.slice(2) };
}

export function discoverYearPages(html, baseUrl = RCL_DAILY_URL) {
  const urls = new Set();
  const pattern = /href=["']([^"']*daily-readings\/?[^"']*[?&](?:amp;)?y=\d+[^"']*)["']/gi;
  for (const match of html.matchAll(pattern)) {
    urls.add(new URL(decodeHtml(match[1]), baseUrl).href);
  }
  return [...urls];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "CinGaryee-Daily-Readings/1.0 (+https://github.com/)" },
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

export async function loadRclDays(dates, fetcher = fetchText) {
  const pages = new Map();
  pages.set(RCL_DAILY_URL, await fetcher(RCL_DAILY_URL));

  async function findCandidate(date) {
    for (const [pageUrl, html] of pages) {
      const candidate = chooseDailyCandidate(extractDailyCandidates(html, date));
      if (candidate) return { candidate, pageUrl };
    }

    const discovered = [...pages].flatMap(([pageUrl, html]) => discoverYearPages(html, pageUrl));
    for (const url of discovered) {
      if (!pages.has(url)) pages.set(url, await fetcher(url));
    }

    for (const [pageUrl, html] of pages) {
      const candidate = chooseDailyCandidate(extractDailyCandidates(html, date));
      if (candidate) return { candidate, pageUrl };
    }
    throw new Error(`No official RCL entry found for ${dateKey(date)}.`);
  }

  const result = [];
  for (const date of dates) {
    const { candidate, pageUrl } = await findCandidate(date);
    let citations;
    if (/\/texts\//i.test(candidate.href)) {
      citations = parseSundayCitations(await fetcher(new URL(candidate.href, pageUrl).href));
    } else {
      citations = classifyCitations(parseWeekdayCitations(candidate.text));
    }
    result.push({
      date,
      citations: useProtestantCanonicalAlternatives(citations),
      sourceUrl: new URL(candidate.href, pageUrl).href,
    });
  }
  return result;
}

export async function loadRclSnapshotDays(dates, filename = DEFAULT_RCL_SNAPSHOT) {
  const snapshot = JSON.parse(await readFile(filename, "utf8"));
  const days = new Map(snapshot.days.map((day) => [day.date, day]));
  return dates.map((date) => {
    const key = dateKey(date);
    const day = days.get(key);
    if (!day) throw new Error(`The bundled RCL snapshot does not cover ${key}.`);
    return {
      date,
      citations: useProtestantCanonicalAlternatives(day.citations),
      sourceUrl: day.sourceUrl || snapshot.source || RCL_DAILY_URL,
      dataSource: "bundled-rcl-snapshot",
    };
  });
}

export async function loadRclDaysWithFallback(
  dates,
  { fetcher = fetchText, snapshotFile = DEFAULT_RCL_SNAPSHOT } = {},
) {
  let snapshotDays = null;
  try {
    snapshotDays = await loadRclSnapshotDays(dates, snapshotFile);
  } catch {
    // Dates beyond the bundled cycle can still use the official source. If that
    // source also fails, the workflow must stop and keep the last good deploy.
  }

  let officialDays;
  try {
    officialDays = await loadRclDays(dates, fetcher);
  } catch (error) {
    if (!snapshotDays) throw error;
    console.warn(`Official RCL source unavailable; using bundled snapshot: ${error.message}`);
    return snapshotDays;
  }

  if (snapshotDays) {
    const mismatch = officialDays.find((day, index) =>
      rclComparisonSignature(day.citations) !== rclComparisonSignature(snapshotDays[index].citations),
    );
    if (mismatch) {
      console.warn(
        `Official RCL citations did not match the reviewed snapshot for ${dateKey(mismatch.date)}; using bundled snapshot.`,
      );
      return snapshotDays;
    }
  }
  return officialDays.map((day) => ({ ...day, dataSource: "official-rcl" }));
}

export function hkbsChapterUrl(bookCode, chapter) {
  return new URL(
    `bb/${HKBS_RCUV_VERSION}/${bookCode}/${chapter}/`,
    HKBS_RCUV_URL,
  ).href;
}

export function parseHkbsChapter(html) {
  const verses = new Map();
  const paragraphPattern = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  let currentRange = null;

  function extractText(value) {
    return decodeHtml(value
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, "")
      .replace(/<b\b[\s\S]*?<\/b>/gi, "")
      .replace(/<[^>]+>/g, ""))
      .replace(/[~\u00a0]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function appendText(range, text) {
    if (!range || !text) return;
    const existing = verses.get(range.startVerse);
    if (!existing) return;
    const previousText = typeof existing === "string" ? existing : existing.text;
    const combinedText = `${previousText}${text}`;
    if (range.endVerse === range.startVerse) {
      verses.set(range.startVerse, combinedText);
      return;
    }
    const combinedVerse = { ...existing, text: combinedText };
    for (let verse = range.startVerse; verse <= range.endVerse; verse += 1) {
      verses.set(verse, combinedVerse);
    }
  }

  for (const match of html.matchAll(paragraphPattern)) {
    const attributes = match[1];
    const content = match[2];
    const versePattern = /<b\b[^>]*>\s*(\d+)(?:[-–](\d+))?\s*<\/b>/gi;
    const markers = [...content.matchAll(versePattern)];

    if (!markers.length) {
      const isContinuation = /\bclass\s*=\s*["'][^"']*\bp[2-9]\b[^"']*["']/i.test(attributes);
      if (isContinuation) appendText(currentRange, extractText(content));
      continue;
    }

    for (let index = 0; index < markers.length; index += 1) {
      const marker = markers[index];
      const startVerse = Number(marker[1]);
      const endVerse = Number(marker[2] ?? marker[1]);
      const segmentEnd = markers[index + 1]?.index ?? content.length;
      const text = extractText(content.slice(marker.index + marker[0].length, segmentEnd));
      currentRange = { startVerse, endVerse };
      if (!text) continue;
      if (endVerse === startVerse) {
        verses.set(startVerse, text);
        continue;
      }
      const combinedVerse = {
        text,
        displayVerse: `${startVerse}–${endVerse}`,
        group: `${startVerse}-${endVerse}`,
      };
      for (let verse = startVerse; verse <= endVerse; verse += 1) {
        verses.set(verse, combinedVerse);
      }
    }
  }

  if (!verses.size) {
    throw new Error("HKBS chapter response did not contain any verses.");
  }
  return verses;
}

export async function loadHkbsRcuvBible(rclDays, fetcher = fetchText) {
  const requestedChapters = new Map();
  for (const day of rclDays) {
    for (const kind of ["psalm", "old", "new"]) {
      for (const citation of day.citations[kind]) {
        const parsed = parseCitation(citation);
        if (!parsed.book) continue;
        for (const range of parsed.ranges) {
          for (let chapter = range.startChapter; chapter <= range.endChapter; chapter += 1) {
            requestedChapters.set(
              `${parsed.book.code}:${chapter}`,
              { bookCode: parsed.book.code, chapter },
            );
          }
        }
      }
    }
  }

  const bible = new Map();
  const queue = [...requestedChapters.values()];
  let cursor = 0;
  async function loadNextChapter() {
    while (cursor < queue.length) {
      const { bookCode, chapter } = queue[cursor++];
      const url = hkbsChapterUrl(bookCode, chapter);
      const verses = parseHkbsChapter(await fetcher(url));
      if (!bible.has(bookCode)) bible.set(bookCode, new Map());
      bible.get(bookCode).set(chapter, verses);
    }
  }
  await Promise.all(Array.from(
    { length: Math.min(6, queue.length) },
    () => loadNextChapter(),
  ));
  if (!bible.size) throw new Error("No RCUV 2010 chapters were loaded from HKBS.");
  return bible;
}

export function parseCitation(citation) {
  const normalized = citation.replace(/\s+/g, " ").trim();
  const matched = BOOK_ALIASES.find(({ alias }) =>
    normalized.toLowerCase().startsWith(`${alias.toLowerCase()} `),
  );
  if (!matched) return { citation: normalized, book: null, matchedAlias: "", ranges: [] };

  let remainder = normalized.slice(matched.alias.length).trim()
    .replace(/[–—]/g, "-")
    .replace(/\band\b/gi, ",")
    .replace(/;/g, ",")
    .replace(/(\d+[a-z]?)\s+\(/gi, "$1,(")
    .replace(/\)\s*,?\s*\(/g, ",")
    .replace(/\)\s+(?=\d)/g, "),")
    .replace(/[()]/g, "")
    .replace(/(\d+)[a-z]\b/gi, "$1")
    .replace(/\s+/g, "");
  const ranges = [];

  if (/^\d+$/.test(remainder)) {
    ranges.push({ startChapter: Number(remainder), startVerse: null, endChapter: Number(remainder), endVerse: null });
    return { citation: normalized, book: matched.book, matchedAlias: matched.alias, ranges };
  }
  if (/^\d+(?:,\d+)+$/.test(remainder)) {
    for (const chapter of remainder.split(",").map(Number)) {
      ranges.push({ startChapter: chapter, startVerse: null, endChapter: chapter, endVerse: null });
    }
    return { citation: normalized, book: matched.book, matchedAlias: matched.alias, ranges };
  }

  let activeChapter = null;
  for (const segment of remainder.split(",").filter(Boolean)) {
    const startAndEnd = segment.split("-");
    const startToken = startAndEnd[0];
    const endToken = startAndEnd.slice(1).join("-");
    let startChapter;
    let startVerse;

    if (startToken.includes(":")) {
      [startChapter, startVerse] = startToken.split(":").map(Number);
      activeChapter = startChapter;
    } else if (activeChapter) {
      startChapter = activeChapter;
      startVerse = Number(startToken);
    } else if (SINGLE_CHAPTER_BOOK_CODES.has(matched.book.code)) {
      startChapter = 1;
      startVerse = Number(startToken);
      activeChapter = 1;
    } else {
      throw new Error(`Cannot parse citation segment ${citation}.`);
    }

    let endChapter = startChapter;
    let endVerse = startVerse;
    if (endToken) {
      if (endToken.includes(":")) [endChapter, endVerse] = endToken.split(":").map(Number);
      else endVerse = Number(endToken);
    }
    if (![startChapter, startVerse, endChapter, endVerse].every(Number.isFinite)) {
      throw new Error(`Cannot parse citation ${citation}.`);
    }
    ranges.push({ startChapter, startVerse, endChapter, endVerse });
  }
  return { citation: normalized, book: matched.book, matchedAlias: matched.alias, ranges };
}

export function selectPassage(bible, citation) {
  const parsed = parseCitation(citation);
  const label = parsed.book
    ? `${parsed.book.chinese} ${citation.slice(parsed.matchedAlias.length).trim().replace(/-/g, "–")}`
    : citation;

  if (!parsed.book) {
    return {
      label,
      records: [],
      text: "此段經文不在《和合本》六十六卷版本之內，請按上方經課出處另行查閱。",
      unavailable: true,
    };
  }

  const chapters = bible.get(parsed.book.code);
  if (!chapters) throw new Error(`Missing USFM book ${parsed.book.code} for ${citation}.`);
  const records = [];
  const seen = new Set();

  function addRecord(chapter, verse, value) {
    const normalized = typeof value === "string"
      ? { text: value, displayVerse: String(verse), group: String(verse) }
      : value;
    records.push({
      chapter,
      verse,
      text: normalized.text,
      displayVerse: normalized.displayVerse ?? String(verse),
      verseGroup: `${chapter}:${normalized.group ?? verse}`,
    });
  }

  for (const range of parsed.ranges) {
    if (range.startVerse === null) {
      for (const [verse, value] of chapters.get(range.startChapter) ?? []) {
        addRecord(range.startChapter, verse, value);
      }
      continue;
    }

    for (let chapter = range.startChapter; chapter <= range.endChapter; chapter += 1) {
      const verses = chapters.get(chapter);
      if (!verses) continue;
      const first = chapter === range.startChapter ? range.startVerse : Math.min(...verses.keys());
      const last = chapter === range.endChapter ? range.endVerse : Math.max(...verses.keys());
      for (const [verse, value] of verses) {
        const key = `${chapter}:${verse}`;
        if (verse >= first && verse <= last && !seen.has(key)) {
          seen.add(key);
          addRecord(chapter, verse, value);
        }
      }
    }
  }

  if (!records.length) throw new Error(`No verses found for ${citation}.`);
  const multipleChapters = new Set(records.map(({ chapter }) => chapter)).size > 1;
  const displayedGroups = new Set();
  const displayedRecords = records.filter(({ verseGroup }) => {
    if (displayedGroups.has(verseGroup)) return false;
    displayedGroups.add(verseGroup);
    return true;
  });
  return {
    label,
    records,
    text: displayedRecords.map(({ chapter, displayVerse, text }) =>
      `${multipleChapters ? `${chapter}:` : ""}${displayVerse} ${text}`,
    ).join(" "),
    unavailable: false,
  };
}

function dateAtUtcMidnight(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`Invalid date: ${value}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function seasonalTheme(date) {
  const year = date.getUTCFullYear();
  const easter = easterDate(year);
  const offset = Math.round((date - easter) / 86_400_000);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const november27 = new Date(Date.UTC(year, 10, 27));
  const adventStart = addDays(november27, (7 - november27.getUTCDay()) % 7);
  const isAdventSunday = date >= adventStart
    && date <= new Date(Date.UTC(year, 11, 24))
    && date.getUTCDay() === 0;

  if (month === 1 && day === 6) return THEMES_BY_FILE.get("41");
  if (isAdventSunday) return THEMES_BY_FILE.get("17");
  if (offset >= -7 && offset <= -1) return THEMES_BY_FILE.get("11");
  if (offset === -46) return THEMES_BY_FILE.get("14");
  if (offset === 49) return THEMES_BY_FILE.get("05");
  if (offset >= 0 && offset <= 1) return THEMES_BY_FILE.get("18");
  return null;
}

export function stableHash(value) {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function cycleSignature(citations) {
  return ["psalm", "old", "new"]
    .flatMap((kind) => citations[kind].map((citation) => citation
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()))
    .join("|");
}

function rclComparisonSignature(citations) {
  return cycleSignature(citations).replace(/[–—]/g, "-");
}

export async function loadEditorialPlan(filename = DEFAULT_EDITORIAL_PLAN) {
  const source = JSON.parse(await readFile(filename, "utf8"));
  const entries = new Map();
  for (const [signature, entry] of Object.entries(source.entries ?? {})) {
    if (entry.reviewed !== true) continue;
    if (!THEMES_BY_FILE.has(entry.themeFile)) {
      throw new Error(`Editorial entry ${signature} uses unknown theme ${entry.themeFile}.`);
    }
    if (!entry.deck?.trim() || !entry.reflection?.trim()) {
      throw new Error(`Editorial entry ${signature} is missing its deck or reflection.`);
    }
    entries.set(signature, entry);
  }
  return entries;
}

function themeForDay(date, passages, signature) {
  const seasonal = seasonalTheme(date);
  if (seasonal) return seasonal;
  const corpus = passages.flatMap((passage) => passage.records.map(({ text }) => text)).join(" ");
  let best = null;
  let bestScore = 0;
  for (const theme of GENERAL_THEMES) {
    const score = theme.keywords.reduce((total, keyword) =>
      total + (corpus.split(keyword).length - 1) * Math.max(1, keyword.length - 1), 0);
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  if (best) return best;
  return GENERAL_THEMES[stableHash(signature) % GENERAL_THEMES.length];
}

function recordScore(record, theme) {
  return theme.keywords.reduce((score, keyword) =>
    score + (record.text.includes(keyword) ? Math.max(2, keyword.length) : 0), 0);
}

function chooseRecord(records, theme, seed) {
  const ranked = records.map((record, index) => ({
    ...record,
    index,
    score: recordScore(record, theme),
  })).filter(({ text }) => text.length >= 8);
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  const positive = ranked.filter(({ score }) => score > 0);
  const pool = (positive.length ? positive : ranked).slice(0, Math.min(6, ranked.length));
  return pool[stableHash(seed) % pool.length] ?? records[0];
}

function conciseQuoteText(text, maximumLength = 72) {
  const normalized = text
    .replace(/\s+/gu, " ")
    .replace(/([，。！？；：、])\s+/gu, "$1")
    .trim();
  const characters = [...normalized];

  function removeUnmatchedQuotationMarks(value) {
    let result = value;
    for (const [opening, closing] of [["「", "」"], ["『", "』"]]) {
      const openingCount = result.split(opening).length - 1;
      const closingCount = result.split(closing).length - 1;
      if (openingCount !== closingCount) result = result.replaceAll(opening, "").replaceAll(closing, "");
    }
    return result;
  }

  if (characters.length <= maximumLength) return removeUnmatchedQuotationMarks(normalized);

  const strongBoundaries = [...normalized.matchAll(/[。；！？]/gu)]
    .map((match) => match.index + match[0].length)
    .filter((index) => index >= 24 && index <= maximumLength - 2);
  const softBoundaries = [...normalized.matchAll(/[，：]/gu)]
    .map((match) => match.index + match[0].length)
    .filter((index) => index >= 32 && index <= maximumLength - 2);
  const boundary = strongBoundaries.at(-1) ?? softBoundaries.at(-1);
  const excerpt = boundary
    ? normalized.slice(0, boundary)
    : characters.slice(0, maximumLength - 2).join("").replace(/[，、：；\s]+$/u, "");
  return removeUnmatchedQuotationMarks(`${excerpt}……`);
}

function quoteFromPassage(passage, theme, seed) {
  if (passage.unavailable) return passage.text;
  const chosen = chooseRecord(passage.records, theme, seed);
  return conciseQuoteText(chosen.text);
}

function composeEditorialCopy(theme) {
  // Until a cycle entry has received its own editorial review, use the
  // hand-written theme copy verbatim. Never manufacture a sentence by copying
  // an arbitrary clause from Scripture into a generic template.
  return { deck: theme.deck, reflection: theme.reflection };
}

function displayReference(citation) {
  const parsed = parseCitation(citation);
  if (!parsed.book) return [citation];
  return [parsed.book.chinese, citation.slice(parsed.matchedAlias.length).trim().replace(/-/g, "–")];
}

const EDITORIAL_NGRAM_STOPLIST = new Set([
  "今日", "我們", "你們", "他們", "自己", "上帝", "耶和華", "可以", "怎樣", "甚麼",
  "一個", "一份", "這個", "這些", "那個", "那些", "仍然", "不要", "需要", "成為",
]);

function editorialNgrams(text) {
  const ngrams = new Set();
  for (const match of String(text ?? "").matchAll(/[\p{Script=Han}]{2,}/gu)) {
    const characters = [...match[0]];
    for (const size of [4, 3, 2]) {
      for (let index = 0; index <= characters.length - size; index += 1) {
        const phrase = characters.slice(index, index + size).join("");
        if (!EDITORIAL_NGRAM_STOPLIST.has(phrase)) ngrams.add(phrase);
      }
    }
  }
  return ngrams;
}

function editorialOverlapScore(scripture, editorialText, multiplier) {
  let score = 0;
  for (const phrase of editorialNgrams(editorialText)) {
    if (scripture.includes(phrase)) score += phrase.length * multiplier;
  }
  return score;
}

export function editorialQuoteFromSelection(passage, selection, theme, editorial = {}) {
  const selected = (selection?.verses ?? []).map(({ chapter, verse }) =>
    passage.records.find((record) => record.chapter === chapter && record.verse === verse),
  ).filter(Boolean);
  if (!selected.length) return null;

  const ranked = selected.map((record, index) => ({
    record,
    index,
    score: recordScore(record, theme) * 8
      + editorialOverlapScore(record.text, editorial.deck, 4)
      + editorialOverlapScore(record.text, editorial.reflection, 2)
      + editorialOverlapScore(record.text, editorial.editorialNote, 1)
      + (record.text.length >= 12 && record.text.length <= 72 ? 2 : 0),
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  const chosen = ranked[0].record;
  return {
    chapter: chosen.chapter,
    verse: chosen.verse,
    text: conciseQuoteText(chosen.text),
  };
}

function readingObject(citations, passages, kind, theme, signature, curatedEditorial) {
  const reference = citations.length === 1
    ? displayReference(citations[0])
    : citations.map((citation) => displayReference(citation).join(" "));
  const lead = kind === "psalm"
    ? "在詩歌中記念上帝的作為"
    : kind === "old"
      ? "在故事中聆聽上帝的帶領"
      : "在基督裏回應今日的召喚";
  return {
    reference,
    eyebrow: lead,
    quotes: passages.map((passage, index) => ({
      ...(passages.length > 1 ? { label: passage.label } : {}),
      text: editorialQuoteFromSelection(
        passage,
        curatedEditorial?.quotes?.[kind]?.find((selection) => selection.citationIndex === index),
        theme,
        curatedEditorial,
      )?.text ?? quoteFromPassage(passage, theme, `${signature}:${kind}:${index}`),
    })),
  };
}

export function buildDailyContent(
  rclDays,
  bible,
  generatedAt = new Date(),
  editorialPlan = new Map(),
) {
  const scriptureTexts = {};
  const fullReadingKeys = {};
  const readings = rclDays.map(({ date, citations, sourceUrl }) => {
    const key = dateKey(date);
    const selected = {};
    fullReadingKeys[key] = {};

    for (const kind of ["psalm", "old", "new"]) {
      selected[kind] = citations[kind].map((citation, index) => {
        const passage = selectPassage(bible, citation);
        const passageKey = `d${key.replaceAll("-", "")}_${kind}_${index + 1}`;
        scriptureTexts[passageKey] = { label: passage.label, text: passage.text };
        fullReadingKeys[key][kind] ??= [];
        fullReadingKeys[key][kind].push(passageKey);
        return passage;
      });
    }

    const allPassages = [...selected.psalm, ...selected.old, ...selected.new];
    const signature = cycleSignature(citations);
    const curatedEditorial = editorialPlan.get(signature);
    const theme = curatedEditorial
      ? THEMES_BY_FILE.get(curatedEditorial.themeFile)
      : themeForDay(date, allPassages, signature);
    const editorial = curatedEditorial ?? composeEditorialCopy(theme);
    const [weekday, shortWeekday] = CHINESE_WEEKDAYS[date.getUTCDay()];
    return {
      date: key,
      day: date.getUTCDate(),
      weekday,
      shortWeekday,
      editorialKey: `rcl-${stableHash(signature).toString(36)}`,
      editorialStatus: curatedEditorial ? "reviewed" : "theme-fallback",
      topic: `${theme.label}。`,
      deck: editorial.deck,
      artwork: { file: theme.file, label: theme.label },
      reflection: editorial.reflection,
      tags: theme.tags,
      sourceUrl,
      psalm: readingObject(citations.psalm, selected.psalm, "psalm", theme, signature, curatedEditorial),
      old: readingObject(citations.old, selected.old, "old", theme, signature, curatedEditorial),
      new: readingObject(citations.new, selected.new, "new", theme, signature, curatedEditorial),
    };
  });

  return {
    generatedAt: generatedAt.toISOString(),
    track: "RCL Daily Readings — Semi-continuous",
    translation: "和合本2010（和修・神版）",
    editorialPlan: "CinGaryee curated cycle plan v3",
    readings,
    fullReadingKeys,
    scriptureTexts,
  };
}

function serializeForBrowser(content) {
  return `/* Automatically generated. Do not edit by hand. */\nwindow.dailyReadingContent = ${JSON.stringify(content, null, 2)};\n`;
}

function parseArguments(argv) {
  const options = {
    date: null,
    window: 2,
    output: DEFAULT_OUTPUT,
    editorialPlan: DEFAULT_EDITORIAL_PLAN,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--date") options.date = argv[++index];
    else if (argument === "--window") options.window = Number(argv[++index]);
    else if (argument === "--out") options.output = resolve(argv[++index]);
    else if (argument === "--editorial-plan") options.editorialPlan = resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!Number.isInteger(options.window) || options.window < 0 || options.window > 7) {
    throw new Error("--window must be an integer between 0 and 7.");
  }
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const centre = dateAtUtcMidnight(options.date ?? new Date());
  const dates = [];
  for (let offset = -options.window; offset <= options.window; offset += 1) {
    dates.push(addDays(centre, offset));
  }
  const [rclDays, editorialPlan] = await Promise.all([
    loadRclDaysWithFallback(dates),
    loadEditorialPlan(options.editorialPlan),
  ]);
  const bible = await loadHkbsRcuvBible(rclDays);
  for (const day of rclDays) {
    const signature = cycleSignature(day.citations);
    if (!editorialPlan.has(signature)) {
      throw new Error(
        `No reviewed editorial entry matches ${dateKey(day.date)} (${signature}); refusing to publish.`,
      );
    }
  }
  const content = buildDailyContent(rclDays, bible, new Date(), editorialPlan);
  if (content.readings.some((day) => day.editorialStatus !== "reviewed")) {
    throw new Error("Unreviewed daily content was generated; refusing to publish.");
  }
  await mkdir(dirname(options.output), { recursive: true });
  await writeFile(options.output, serializeForBrowser(content));
  console.log(`Prepared ${content.readings.length} daily readings in ${basename(options.output)}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
