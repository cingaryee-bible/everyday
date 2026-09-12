import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(projectDir, "public");
const outputFile = join(projectDir, "dist", "server", "index.js");
const topicFiles = readdirSync(join(publicDir, "assets", "topics"))
  .filter((filename) => filename.endsWith(".webp"))
  .sort();

const files = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/cat-style.css", "cat-style.css", "text/css; charset=utf-8"],
  ["/cat-readings.js", "cat-readings.js", "text/javascript; charset=utf-8"],
  ["/cat-full-texts.js", "cat-full-texts.js", "text/javascript; charset=utf-8"],
  ["/manifest.webmanifest", "manifest.webmanifest", "application/manifest+json; charset=utf-8"],
  ["/logo-cingaryee.png", "logo-cingaryee.png", "image/png"],
  ["/cat-psalm-cingaryee-v3.png", "cat-psalm-cingaryee-v3.png", "image/png"],
  ["/cat-old-cingaryee-v3.png", "cat-old-cingaryee-v3.png", "image/png"],
  ["/cat-new-cingaryee-v3.png", "cat-new-cingaryee-v3.png", "image/png"],
  ["/cat-today-cingaryee.png", "cat-today-cingaryee.png", "image/png"],
  ["/icons/icon-16.png", "icons/icon-16.png", "image/png"],
  ["/icons/icon-32.png", "icons/icon-32.png", "image/png"],
  ["/icons/icon-180.png", "icons/icon-180.png", "image/png"],
  ["/icons/icon-192.png", "icons/icon-192.png", "image/png"],
  ["/icons/icon-512.png", "icons/icon-512.png", "image/png"],
  ["/icons/icon-maskable-512.png", "icons/icon-maskable-512.png", "image/png"],
  ["/assets/paper-background.jpg", "assets/paper-background.jpg", "image/jpeg"],
  ...topicFiles.map((filename) => [
    `/assets/topics/${filename}`,
    `assets/topics/${filename}`,
    "image/webp",
  ]),
];

const assets = Object.fromEntries(
  files.map(([route, filename, contentType]) => [
    route,
    {
      contentType,
      body: readFileSync(join(publicDir, filename)).toString("base64"),
    },
  ]),
);

const workerSource = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname];

    if (!asset) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const shouldRevalidate =
      asset.contentType.startsWith("text/html") ||
      asset.contentType.startsWith("text/css") ||
      asset.contentType.startsWith("text/javascript") ||
      asset.contentType.startsWith("application/manifest+json");
    return new Response(decodeBase64(asset.body), {
      headers: {
        "content-type": asset.contentType,
        "cache-control": shouldRevalidate
          ? "no-cache"
          : "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  },
};
`;

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, workerSource);
