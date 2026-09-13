import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCitation } from "./update-daily-content.mjs";

const sourcePath = resolve("data/rcl-three-year-semi-continuous.json");
const outputPath = resolve("data/rcl-required-chapters.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const chapters = new Map();
const unsupported = new Set();

for (const day of source.days) {
  for (const kind of ["psalm", "old", "new"]) {
    for (const citation of day.citations[kind]) {
      const parsed = parseCitation(citation);
      if (!parsed.book) {
        unsupported.add(citation);
        continue;
      }

      if (!chapters.has(parsed.book.code)) {
        chapters.set(parsed.book.code, {
          code: parsed.book.code,
          english: parsed.book.english,
          chinese: parsed.book.chinese,
          chapters: new Set(),
        });
      }
      const record = chapters.get(parsed.book.code);
      for (const range of parsed.ranges) {
        for (let chapter = range.startChapter; chapter <= range.endChapter; chapter += 1) {
          record.chapters.add(chapter);
        }
      }
    }
  }
}

const books = [...chapters.values()]
  .map((book) => ({ ...book, chapters: [...book.chapters].sort((a, b) => a - b) }))
  .sort((a, b) => a.code.localeCompare(b.code));
const chapterCount = books.reduce((total, book) => total + book.chapters.length, 0);

await writeFile(outputPath, `${JSON.stringify({
  source: sourcePath,
  bookCount: books.length,
  chapterCount,
  unsupportedCitations: [...unsupported].sort(),
  books,
}, null, 2)}\n`);

console.log(`Prepared ${chapterCount} required chapters across ${books.length} books.`);
if (unsupported.size) console.log(`Recorded ${unsupported.size} unsupported citations.`);
