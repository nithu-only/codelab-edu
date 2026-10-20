/**
 * Downloads the Java 8 `tools.jar` (OpenJDK javac) used by the in-browser Java
 * engine (CheerpJ). ~18 MB, served statically at /tools.jar and mounted by
 * CheerpJ at /app/tools.jar.
 *
 * Run automatically by the `predev`/`prebuild` npm scripts, or manually:
 *   node scripts/fetch-tools-jar.mjs
 *
 * Same artifact the CheerpJ JavaFiddle uses. Source:
 *   https://github.com/leaningtech/javafiddle (static/tools.jar)
 * Override the source with TOOLS_JAR_URL.
 *
 * Non-fatal: if the download fails (e.g. offline), the build still succeeds and
 * Java simply reports "engine unavailable" at runtime, falling back to Judge0
 * when a remote provider is configured.
 */
import { existsSync, mkdirSync, createWriteStream, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dest = path.join(here, "..", "public", "tools.jar");
const url =
  process.env.TOOLS_JAR_URL ||
  "https://raw.githubusercontent.com/leaningtech/javafiddle/main/static/tools.jar";
const MIN_BYTES = 15_000_000;

if (existsSync(dest) && statSync(dest).size >= MIN_BYTES) {
  console.log(`tools.jar already present (${statSync(dest).size} bytes)`);
  process.exit(0);
}

mkdirSync(path.dirname(dest), { recursive: true });

try {
  console.log(`Downloading tools.jar → ${dest}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(dest));
  const size = statSync(dest).size;
  if (size < MIN_BYTES) throw new Error(`unexpected size ${size} bytes`);
  console.log(`tools.jar ready (${size} bytes)`);
} catch (err) {
  console.warn(
    `WARNING: could not fetch tools.jar (${err instanceof Error ? err.message : String(err)}).\n` +
      "In-browser Java will be unavailable until public/tools.jar exists. " +
      "Run `node scripts/fetch-tools-jar.mjs` when online.",
  );
}
