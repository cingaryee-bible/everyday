import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCitation, selectPassage } from "./update-daily-content.mjs";

const options = { size: 12, from: "2026-09-13", output: resolve("../outputs/editorial-workbench-next.md") };
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (argument === "--size") options.size = Number(process.argv[++index]);
  else if (argument === "--from") options.from = process.argv[++index];
  else if (argument === "--out") options.output = resolve(process.argv[++index]);
  else throw new Error(`Unknown argument: ${argument}`);
}

const rcl = JSON.parse(await readFile(resolve("data/rcl-three-year-semi-continuous.json"), "utf8"));
const corpus = JSON.parse(await readFile(resolve("data/cuv-required-chapters.json"), "utf8"));
const plan = JSON.parse(await readFile(resolve("data/editorial-plan.json"), "utf8"));
const bible = new Map();

for (const chapter of Object.values(corpus.chapters)) {
  if (!bible.has(chapter.code)) bible.set(chapter.code, new Map());
  bible.get(chapter.code).set(chapter.chapter, new Map(chapter.verses));
}

const signatureOf = (citations) => ["psalm", "old", "new"]
  .flatMap((kind) => citations[kind].map((citation) => citation.toLowerCase().replace(/\s+/g, " ").trim()))
  .join("|");
const orderedDays = [
  ...rcl.days.filter((day) => day.date >= options.from),
  ...rcl.days.filter((day) => day.date < options.from),
];
const seen = new Set();
const pending = [];

for (const day of orderedDays) {
  const signature = signatureOf(day.citations);
  if (seen.has(signature) || plan.entries?.[signature]) continue;
  seen.add(signature);
  pending.push({ ...day, signature });
}

const batch = pending.slice(0, options.size);
const lines = [
  "# Editorial workbench",
  "",
  `Reviewed: ${Object.keys(plan.entries ?? {}).length} / ${rcl.uniqueSignatureCount}`,
  `This batch: ${batch.length}`,
  "",
];

for (const [dayIndex, day] of batch.entries()) {
  lines.push(`## ${dayIndex + 1}. ${day.date}`, "", `Signature: \`${day.signature}\``, "");
  for (const kind of ["psalm", "old", "new"]) {
    lines.push(`### ${kind}`);
    for (const [citationIndex, citation] of day.citations[kind].entries()) {
      const parsed = parseCitation(citation);
      lines.push("", `#### [${citationIndex}] ${citation}`);
      if (!parsed.book) {
        lines.push("", "（和合本六十六卷沒有此書卷。）", "");
        continue;
      }
      const passage = selectPassage(bible, citation);
      lines.push("", ...passage.records.map(({ chapter, verse, text }) => `${chapter}:${verse} ${text}`), "");
    }
  }
}

await mkdir(resolve(options.output, ".."), { recursive: true });
await writeFile(options.output, `${lines.join("\n")}\n`);
console.log(`Prepared ${batch.length} unreviewed entries in ${options.output}.`);
