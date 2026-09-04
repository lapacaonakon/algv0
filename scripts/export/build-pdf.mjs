/**
 * ШАГ 3: PNG -> PDF
 *
 * Склеивает отрендеренные страницы tmp/export-pages/page-*.png
 * в единый документ public/export/full_code_all_pages.pdf (A4, по странице на PNG).
 */
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { ROOT, OUT_DIR, PAGES_DIR, PDF_PATH, ensureDir, humanSize } from "./common.mjs";

// A4 в пунктах PDF
const A4 = { width: 595.28, height: 841.89 };

async function main() {
  if (!fs.existsSync(PAGES_DIR)) {
    throw new Error(`Нет ${path.relative(ROOT, PAGES_DIR)} — сначала запустите npm run export:png`);
  }

  const pages = fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();

  if (pages.length === 0) throw new Error("Не найдено ни одной PNG-страницы");

  ensureDir(OUT_DIR);

  const doc = new PDFDocument({
    size: [A4.width, A4.height],
    margin: 0,
    autoFirstPage: false,
    info: {
      Title: "Универсальное пособие — полный исходный код",
      Author: "CI: rebuild-pdf",
      Subject: "Экспорт всего кода проекта (код -> txt -> png -> pdf)",
      CreationDate: new Date(),
    },
  });

  const stream = fs.createWriteStream(PDF_PATH);
  doc.pipe(stream);

  for (const file of pages) {
    doc.addPage({ size: [A4.width, A4.height], margin: 0 });
    doc.image(path.join(PAGES_DIR, file), 0, 0, { width: A4.width, height: A4.height });
  }

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log("[3/3] png -> pdf");
  console.log(`      страниц: ${pages.length}`);
  console.log(`      выход:   ${path.relative(ROOT, PDF_PATH)} (${humanSize(fs.statSync(PDF_PATH).size)})`);
}

main().catch((err) => {
  console.error("Ошибка сборки PDF:", err.message);
  process.exit(1);
});
