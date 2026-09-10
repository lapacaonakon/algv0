/**
 * ШАГ 2: TXT -> PNG
 *
 * Разбивает full_code_all_pages.txt на страницы формата A4 и рендерит
 * каждую страницу в PNG через ImageMagick (шрифт DejaVu Sans Mono, кириллица).
 *
 * Результат: tmp/export-pages/page-0001.png, page-0002.png, ...
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  ROOT, PAGES_DIR, TXT_PATH, PAGE, ensureDir, humanSize, imageMagickCmd,
} from "./common.mjs";

const execFileAsync = promisify(execFile);

/** Раскрываем табы и жёстко переносим длинные строки, чтобы код не обрезался. */
function wrap(line) {
  const expanded = line.replace(/\t/g, "    ").replace(/\s+$/, "");
  if (expanded.length <= PAGE.cols) return [expanded];
  const parts = [];
  const indent = " ".repeat(Math.min((expanded.match(/^ */)?.[0].length ?? 0) + 2, 12));
  let rest = expanded;
  let first = true;
  while (rest.length > 0) {
    const width = first ? PAGE.cols : PAGE.cols - indent.length;
    parts.push((first ? "" : indent) + rest.slice(0, width));
    rest = rest.slice(width);
    first = false;
  }
  return parts;
}

function paginate(txt) {
  const source = txt.replace(/\r\n/g, "\n").split("\n").flatMap(wrap);
  const pages = [];
  for (let i = 0; i < source.length; i += PAGE.rows) {
    pages.push(source.slice(i, i + PAGE.rows));
  }
  return pages;
}

async function main() {
  if (!fs.existsSync(TXT_PATH)) {
    throw new Error(`Нет ${path.relative(ROOT, TXT_PATH)} — сначала запустите npm run export:txt`);
  }

  const im = imageMagickCmd();
  const pages = paginate(fs.readFileSync(TXT_PATH, "utf8"));

  fs.rmSync(PAGES_DIR, { recursive: true, force: true });
  ensureDir(PAGES_DIR);

  const total = pages.length;
  const jobs = pages.map((lines, idx) => {
    const num = String(idx + 1).padStart(4, "0");
    const header = `Универсальное пособие • полный исходный код${" ".repeat(
      Math.max(1, PAGE.cols - 44 - `стр. ${idx + 1} / ${total}`.length)
    )}стр. ${idx + 1} / ${total}`;
    const body = [header, "-".repeat(PAGE.cols), ...lines].join("\n");
    const txtFile = path.join(PAGES_DIR, `page-${num}.txt`);
    const pngFile = path.join(PAGES_DIR, `page-${num}.png`);
    fs.writeFileSync(txtFile, body + "\n", "utf8");
    return { txtFile, pngFile, num };
  });

  const args = (job) => [
    "-density", String(PAGE.density),
    "-page", PAGE.size,
    "-font", fs.existsSync(PAGE.fontFile) ? PAGE.fontFile : PAGE.font,
    "-pointsize", String(PAGE.pointsize),
    `text:${job.txtFile}`,
    "-background", "white",
    "-flatten",
    "-colorspace", "Gray",
    ...(PAGE.monochrome ? ["-monochrome"] : []),
    "-strip",
    "-define", "png:compression-level=9",
    job.pngFile,
  ];

  const concurrency = Math.max(2, Math.min(os.cpus().length, 8));
  let done = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      await execFileAsync(im, args(job));
      fs.rmSync(job.txtFile, { force: true });
      done += 1;
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`      отрендерено ${done}/${total} страниц\r`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  process.stdout.write("\n");

  const missing = jobs.filter((j) => !fs.existsSync(j.pngFile));
  if (missing.length) throw new Error(`Не отрендерены страницы: ${missing.length}`);

  const bytes = jobs.reduce((s, j) => s + fs.statSync(j.pngFile).size, 0);
  console.log("[2/3] txt -> png");
  console.log(`      страниц: ${total}`);
  console.log(`      выход:   ${path.relative(ROOT, PAGES_DIR)}/page-*.png (${humanSize(bytes)})`);
}

main().catch((err) => {
  console.error("Ошибка рендера страниц:", err.message);
  process.exit(1);
});
