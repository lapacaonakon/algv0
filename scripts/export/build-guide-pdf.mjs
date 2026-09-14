/**
 * Оркестратор: бандлит TSX-генератор и запускает его.
 * Использование: node scripts/export/build-guide-pdf.mjs [выход.pdf]
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(import.meta.dirname, "../..");
const outfile = path.join(root, "tmp/guide-pdf-bundle.cjs");

await build({
  entryPoints: [path.join(root, "scripts/export/guide-pdf-entry.tsx")],
  outfile,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  jsx: "automatic",
  loader: { ".jpg": "dataurl", ".png": "dataurl", ".css": "empty" },
  external: ["pdfkit", "svg-to-pdfkit", "pdfkit/js/pdfkit.standalone.js"],
  logLevel: "warning",
});

const outArg = process.argv[2];
await import(pathToFileURL(outfile).href);
