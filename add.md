## Изменённые файлы

```text
A	.github/workflows/deploy-pages.yml
M	.github/workflows/rebuild-pdf.yml
M	index.html
M	public/export/full_code_all_pages.pdf
M	public/export/full_code_all_pages.txt
A	public/favicon.svg
M	src/App.tsx
M	src/components/Navbar.tsx
A	src/components/PythonCompiler.tsx
M	vite.config.ts
```

## `.github/workflows/deploy-pages.yml`

### Полное содержимое после изменений

````yaml
name: Deploy app to GitHub Pages

on:
  push:
    branches:
      - main
      # Позволяет проверить Pages прямо из рабочей ветки до слияния.
      - "arena/**"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    name: Build static site
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Build for the repository subpath
        env:
          VITE_BASE: /algv0/
        run: npm run build

      - name: Make GitHub Pages fallback
        run: cp dist/index.html dist/404.html

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

  deploy:
    name: Publish to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
````

### Patch относительно `main`

````diff
diff --git a/.github/workflows/deploy-pages.yml b/.github/workflows/deploy-pages.yml
new file mode 100644
index 0000000..17418e3
--- /dev/null
+++ b/.github/workflows/deploy-pages.yml
@@ -0,0 +1,60 @@
+name: Deploy app to GitHub Pages
+
+on:
+  push:
+    branches:
+      - main
+      # Позволяет проверить Pages прямо из рабочей ветки до слияния.
+      - "arena/**"
+  workflow_dispatch:
+
+permissions:
+  contents: read
+  pages: write
+  id-token: write
+
+concurrency:
+  group: pages
+  cancel-in-progress: true
+
+jobs:
+  build:
+    name: Build static site
+    runs-on: ubuntu-latest
+    steps:
+      - name: Checkout
+        uses: actions/checkout@v6
+
+      - name: Setup Node.js
+        uses: actions/setup-node@v7
+        with:
+          node-version: 24
+          cache: npm
+
+      - name: Install dependencies
+        run: npm ci --no-audit --no-fund
+
+      - name: Build for the repository subpath
+        env:
+          VITE_BASE: /algv0/
+        run: npm run build
+
+      - name: Make GitHub Pages fallback
+        run: cp dist/index.html dist/404.html
+
+      - name: Upload Pages artifact
+        uses: actions/upload-pages-artifact@v5
+        with:
+          path: ./dist
+
+  deploy:
+    name: Publish to GitHub Pages
+    needs: build
+    runs-on: ubuntu-latest
+    environment:
+      name: github-pages
+      url: ${{ steps.deployment.outputs.page_url }}
+    steps:
+      - name: Deploy
+        id: deployment
+        uses: actions/deploy-pages@v5
````

## `.github/workflows/rebuild-pdf.yml`

### Полное содержимое после изменений

````yaml
name: Rebuild code PDF

# Пайплайн пересборки PDF при каждом коммите:
#
#   исходный код  ──▶  full_code_all_pages.txt   (scripts/export/collect-code.mjs)
#        │
#        └──────────▶  page-0001.png … page-NNNN.png  (scripts/export/render-pages.mjs, ImageMagick)
#                              │
#                              └──▶  full_code_all_pages.pdf  (scripts/export/build-pdf.mjs, pdfkit)
#
# Готовые TXT и PDF коммитятся обратно в ветку (их отдаёт приложение по /export/...),
# промежуточные PNG сохраняются как artifacts запуска.

on:
  push:
    branches:
      - "**"
    paths-ignore:
      # чтобы коммит самого workflow не запускал бесконечный цикл
      - "public/export/**"
      - "**/*.md"
  workflow_dispatch:
    inputs:
      density:
        description: "DPI растеризации страниц (по умолчанию 150)"
        required: false
        default: "150"

concurrency:
  group: rebuild-pdf-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  rebuild-pdf:
    name: код → txt → png → pdf
    runs-on: ubuntu-latest
    # не реагируем на собственный коммит бота
    if: "!contains(github.event.head_commit.message, '[skip ci]') && github.actor != 'github-actions[bot]'"

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
          persist-credentials: true

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: "24"
          cache: npm

      - name: Install ImageMagick + DejaVu fonts
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y --no-install-recommends imagemagick fonts-dejavu-core
          # На Ubuntu политика ImageMagick иногда запрещает часть кодеков —
          # разрешаем то, что нужно пайплайну (text -> png -> pdf).
          for policy in /etc/ImageMagick-6/policy.xml /etc/ImageMagick-7/policy.xml; do
            if [ -f "$policy" ]; then
              sudo sed -i 's/rights="none" pattern="\(PDF\|PS\|TEXT\|LABEL\)"/rights="read|write" pattern="\1"/g' "$policy"
            fi
          done
          convert -version

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Step 1 — код → txt
        run: npm run export:txt

      - name: Step 2 — txt → png
        env:
          EXPORT_DENSITY: ${{ github.event.inputs.density || '150' }}
        run: npm run export:png

      - name: Step 3 — png → pdf
        run: npm run export:pdf

      - name: Type-check приложения
        run: npx tsc --noEmit
        continue-on-error: true

      - name: Summary
        run: |
          {
            echo "### 📄 Экспорт пересобран"
            echo ""
            echo "| Артефакт | Размер |"
            echo "| --- | --- |"
            echo "| \`public/export/full_code_all_pages.txt\` | $(du -h public/export/full_code_all_pages.txt | cut -f1) |"
            echo "| \`public/export/full_code_all_pages.pdf\` | $(du -h public/export/full_code_all_pages.pdf | cut -f1) |"
            echo "| PNG-страниц | $(ls tmp/export-pages/*.png | wc -l) |"
          } >> "$GITHUB_STEP_SUMMARY"

      - name: Upload artifacts (PDF + TXT)
        uses: actions/upload-artifact@v7
        with:
          name: full-code-export
          path: |
            public/export/full_code_all_pages.pdf
            public/export/full_code_all_pages.txt
          if-no-files-found: error
          retention-days: 30

      - name: Upload artifacts (PNG-страницы)
        uses: actions/upload-artifact@v7
        with:
          name: full-code-pages-png
          path: tmp/export-pages/*.png
          if-no-files-found: error
          retention-days: 7

      - name: Commit rebuilt export back to the branch
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -- public/export/full_code_all_pages.txt public/export/full_code_all_pages.pdf
          if git diff --cached --quiet; then
            echo "Экспорт не изменился — коммит не нужен."
            exit 0
          fi
          git commit -m "chore(export): пересборка full_code_all_pages.pdf/.txt [skip ci]"
          git push origin "HEAD:${GITHUB_REF_NAME}"
````

### Patch относительно `main`

````diff
diff --git a/.github/workflows/rebuild-pdf.yml b/.github/workflows/rebuild-pdf.yml
index bdcb3c3..ff49c0c 100644
--- a/.github/workflows/rebuild-pdf.yml
+++ b/.github/workflows/rebuild-pdf.yml
@@ -42,15 +42,15 @@ jobs:
 
     steps:
       - name: Checkout
-        uses: actions/checkout@v4
+        uses: actions/checkout@v6
         with:
           fetch-depth: 0
           persist-credentials: true
 
       - name: Setup Node.js
-        uses: actions/setup-node@v4
+        uses: actions/setup-node@v7
         with:
-          node-version: "22"
+          node-version: "24"
           cache: npm
 
       - name: Install ImageMagick + DejaVu fonts
@@ -97,7 +97,7 @@ jobs:
           } >> "$GITHUB_STEP_SUMMARY"
 
       - name: Upload artifacts (PDF + TXT)
-        uses: actions/upload-artifact@v4
+        uses: actions/upload-artifact@v7
         with:
           name: full-code-export
           path: |
@@ -107,7 +107,7 @@ jobs:
           retention-days: 30
 
       - name: Upload artifacts (PNG-страницы)
-        uses: actions/upload-artifact@v4
+        uses: actions/upload-artifact@v7
         with:
           name: full-code-pages-png
           path: tmp/export-pages/*.png
````

## `index.html`

### Полное содержимое после изменений

````html
<!doctype html>
<html lang="ru" class="dark bg-slate-950 text-slate-100">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="%BASE_URL%favicon.svg" />
    <title>🧠 Дискретка для тупых — Интерактивный гид по графам</title>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

### Patch относительно `main`

````diff
diff --git a/index.html b/index.html
index cdea4c7..a44c135 100644
--- a/index.html
+++ b/index.html
@@ -3,6 +3,7 @@
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <link rel="icon" type="image/svg+xml" href="%BASE_URL%favicon.svg" />
     <title>🧠 Дискретка для тупых — Интерактивный гид по графам</title>
   </head>
   <body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
````

## `public/favicon.svg`

### Полное содержимое после изменений

````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Алгоритмы">
  <rect width="64" height="64" rx="16" fill="#4f46e5"/>
  <path d="M18 17h28v8H26v8h16v8H26v8h20v8H18z" fill="#fff"/>
  <circle cx="47" cy="21" r="4" fill="#34d399"/>
</svg>
````

### Patch относительно `main`

````diff
diff --git a/public/favicon.svg b/public/favicon.svg
new file mode 100644
index 0000000..3bbbba0
--- /dev/null
+++ b/public/favicon.svg
@@ -0,0 +1,5 @@
+<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Алгоритмы">
+  <rect width="64" height="64" rx="16" fill="#4f46e5"/>
+  <path d="M18 17h28v8H26v8h16v8H26v8h20v8H18z" fill="#fff"/>
+  <circle cx="47" cy="21" r="4" fill="#34d399"/>
+</svg>
````

## `src/App.tsx`

### Полное содержимое после изменений

````tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { chapters } from "./data/content";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileToc } from "./components/MobileToc";
import { ChapterView } from "./components/ChapterView";
import { ChapterNav } from "./components/ChapterNav";
import { SimulatorModal } from "./components/hints/SimulatorModal";
import { SimulatorHub } from "./components/SimulatorHub";
import { PythonCompiler } from "./components/PythonCompiler";

export default function App() {
  const [activeTab, setActiveTab] = useState<"guide" | "simulator" | "compiler">("guide");
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0].id);
  const [modalVizId, setModalVizId] = useState<string | null>(null);

  const index = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapterId)
  );
  const activeChapter = chapters[index] ?? chapters[0];
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  const goTo = useCallback((id: string) => {
    setActiveChapterId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Стрелки ← → листают темы (как на обучающих сайтах)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) goTo(next.id);
      if (e.key === "ArrowLeft" && prev) goTo(prev.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, next, prev]);

  const progress = useMemo(() => ((index + 1) / chapters.length) * 100, [index]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "guide" ? (
        <>
          <MobileToc
            selectedChapterId={activeChapterId}
            setSelectedChapterId={goTo}
            currentTitle={activeChapter.title}
            index={index}
            total={chapters.length}
          />

          <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto items-start">
            {/* Сайдбар только на десктопе — на мобильном он в шторке */}
            <div className="hidden lg:block lg:w-80 shrink-0 border-r border-slate-800 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
              <Sidebar selectedChapterId={activeChapterId} setSelectedChapterId={goTo} />
            </div>

            <main id="main-content" className="flex-1 min-w-0 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-5 lg:py-8">
              {/* Шапка главы с быстрыми переходами */}
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                    {activeChapter.category || "Универсальное пособие"}
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight truncate">
                    {activeChapter.title}
                  </h2>
                </div>
                <ChapterNav prev={prev} next={next} index={index} total={chapters.length} onGo={goTo} compact />
              </div>

              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ChapterView
                key={activeChapter.id}
                chapter={activeChapter}
                prev={prev}
                next={next}
                index={index}
                total={chapters.length}
                onGo={goTo}
                onOpenSimulator={setModalVizId}
              />
            </main>
          </div>
        </>
      ) : activeTab === "simulator" ? (
        <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-screen-2xl mx-auto">
          <SimulatorHub
            onOpen={setModalVizId}
            onGoChapter={(id) => {
              setActiveTab("guide");
              goTo(id);
            }}
          />
        </main>
      ) : (
        <PythonCompiler />
      )}

      <SimulatorModal vizId={modalVizId} onClose={() => setModalVizId(null)} />

      <footer className="p-8 text-center text-slate-600 text-xs border-t border-slate-900 mt-12 bg-slate-950">
        © 2026 Universal Educational Guide. Интерактивные визуализации алгоритмов.
      </footer>
    </div>
  );
}
````

### Patch относительно `main`

````diff
diff --git a/src/App.tsx b/src/App.tsx
index 2091f33..4583756 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -7,9 +7,10 @@ import { ChapterView } from "./components/ChapterView";
 import { ChapterNav } from "./components/ChapterNav";
 import { SimulatorModal } from "./components/hints/SimulatorModal";
 import { SimulatorHub } from "./components/SimulatorHub";
+import { PythonCompiler } from "./components/PythonCompiler";
 
 export default function App() {
-  const [activeTab, setActiveTab] = useState<"guide" | "simulator">("guide");
+  const [activeTab, setActiveTab] = useState<"guide" | "simulator" | "compiler">("guide");
   const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0].id);
   const [modalVizId, setModalVizId] = useState<string | null>(null);
 
@@ -95,7 +96,7 @@ export default function App() {
             </main>
           </div>
         </>
-      ) : (
+      ) : activeTab === "simulator" ? (
         <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-screen-2xl mx-auto">
           <SimulatorHub
             onOpen={setModalVizId}
@@ -105,6 +106,8 @@ export default function App() {
             }}
           />
         </main>
+      ) : (
+        <PythonCompiler />
       )}
 
       <SimulatorModal vizId={modalVizId} onClose={() => setModalVizId(null)} />
````

## `src/components/Navbar.tsx`

### Полное содержимое после изменений

````tsx
import React, { useState } from 'react';
import { BookOpen, Cpu, Sparkles, FileDown, FileText, Code2, Loader2, Terminal } from 'lucide-react';
import { chapters } from '../data/content';
import { downloadBookHtml } from '../utils/exportHtml';

interface NavbarProps {
  activeTab: 'guide' | 'simulator' | 'compiler';
  setActiveTab: (tab: 'guide' | 'simulator' | 'compiler') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [busy, setBusy] = useState(false);

  const saveBook = async () => {
    setBusy(true);
    try {
      await downloadBookHtml(chapters);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-0 lg:h-16 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
              Универсальное пособие
            </h1>
            <p className="text-xs text-indigo-400 font-medium truncate">
              Подготовка к экзаменам: Алгоритмы, Структуры данных, Билеты 1–24
            </p>
          </div>
        </div>

        <div className="flex items-center w-full lg:w-auto gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 overflow-x-auto">
          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Учебное пособие
          </button>
          <button
            id="tab-simulator-btn"
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> Тренажёры
          </button>
          <button
            id="tab-compiler-btn"
            onClick={() => setActiveTab('compiler')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'compiler'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" /> Python
          </button>
          <a
            id="download-pdf-btn"
            href={`${import.meta.env.BASE_URL}export/full_code_all_pages.pdf`}
            download="full_code_all_pages.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-600/20 border border-emerald-500/30 transition-all duration-200 whitespace-nowrap"
            title="Скачать полный PDF сборник всех страниц и кода (370+ страниц)"
          >
            <FileDown className="w-4 h-4" /> Скачать PDF
          </a>
          <a
            id="download-txt-btn"
            href={`${import.meta.env.BASE_URL}export/full_code_all_pages.txt`}
            download="full_code_all_pages.txt"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-sky-400 hover:text-white hover:bg-sky-600/20 border border-sky-500/30 transition-all duration-200 whitespace-nowrap"
            title="Скачать полный TXT файл со всем кодом"
          >
            <FileText className="w-4 h-4" /> TXT
          </a>
          <button
            id="download-html-btn"
            onClick={saveBook}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-amber-400 hover:text-white hover:bg-amber-600/20 border border-amber-500/30 disabled:opacity-60 transition-all duration-200 whitespace-nowrap"
            title="Скачать всё пособие одним автономным HTML-файлом (отдельную тему можно выгрузить кнопкой над текстом)"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />} HTML
          </button>
        </div>
      </div>
    </header>
  );
};
````

### Patch относительно `main`

````diff
diff --git a/src/components/Navbar.tsx b/src/components/Navbar.tsx
index a528778..6f8cd36 100644
--- a/src/components/Navbar.tsx
+++ b/src/components/Navbar.tsx
@@ -1,11 +1,11 @@
 import React, { useState } from 'react';
-import { BookOpen, Cpu, Sparkles, FileDown, FileText, Code2, Loader2 } from 'lucide-react';
+import { BookOpen, Cpu, Sparkles, FileDown, FileText, Code2, Loader2, Terminal } from 'lucide-react';
 import { chapters } from '../data/content';
 import { downloadBookHtml } from '../utils/exportHtml';
 
 interface NavbarProps {
-  activeTab: 'guide' | 'simulator';
-  setActiveTab: (tab: 'guide' | 'simulator') => void;
+  activeTab: 'guide' | 'simulator' | 'compiler';
+  setActiveTab: (tab: 'guide' | 'simulator' | 'compiler') => void;
 }
 
 export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
@@ -60,9 +60,20 @@ export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
           >
             <Cpu className="w-4 h-4" /> Тренажёры
           </button>
+          <button
+            id="tab-compiler-btn"
+            onClick={() => setActiveTab('compiler')}
+            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
+              activeTab === 'compiler'
+                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
+                : 'text-slate-400 hover:text-white'
+            }`}
+          >
+            <Terminal className="w-4 h-4" /> Python
+          </button>
           <a
             id="download-pdf-btn"
-            href="/export/full_code_all_pages.pdf"
+            href={`${import.meta.env.BASE_URL}export/full_code_all_pages.pdf`}
             download="full_code_all_pages.pdf"
             target="_blank"
             rel="noreferrer"
@@ -73,7 +84,7 @@ export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
           </a>
           <a
             id="download-txt-btn"
-            href="/export/full_code_all_pages.txt"
+            href={`${import.meta.env.BASE_URL}export/full_code_all_pages.txt`}
             download="full_code_all_pages.txt"
             target="_blank"
             rel="noreferrer"
````

## `src/components/PythonCompiler.tsx`

### Полное содержимое после изменений

````tsx
import { useCallback, useState } from "react";
import { CheckCircle2, ExternalLink, Info, Loader2, Play, RotateCcw, Terminal } from "lucide-react";

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const STARTER_CODE = `# Первый запуск загрузит Python в браузер.
name = "алгоритмы"

for number in range(1, 4):
    print(f"{number}. Учим {name}!")
`;

type PyodideRuntime = {
  runPythonAsync: (source: string) => Promise<unknown>;
  setStdout: (options: { batched: (message: string) => void }) => void;
  setStderr: (options: { batched: (message: string) => void }) => void;
  setStdin: (options: { stdin: () => string | number | null }) => void;
};

type PyodideModule = {
  loadPyodide: (options: { indexURL: string }) => Promise<PyodideRuntime>;
};

let runtimePromise: Promise<PyodideRuntime> | null = null;

function getPythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = import(/* @vite-ignore */ PYODIDE_MODULE_URL).then((module) =>
      (module as PyodideModule).loadPyodide({ indexURL: PYODIDE_INDEX_URL })
    );
  }
  return runtimePromise;
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function PythonCompiler() {
  const [code, setCode] = useState(STARTER_CODE);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Нажмите «Запустить», чтобы увидеть результат.");
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("Python загружается только после первого запуска");

  const runCode = useCallback(async () => {
    if (running) return;

    setRunning(true);
    setOutput("");
    setRuntimeMessage(runtimeReady ? "Выполняю код…" : "Загружаю Python в браузер…");

    const stdout: string[] = [];
    const stderr: string[] = [];
    const inputLines = stdin.split(/\r?\n/);

    try {
      const runtime = await getPythonRuntime();
      setRuntimeReady(true);
      setRuntimeMessage("Python готов — код выполняется локально в браузере");

      runtime.setStdout({ batched: (message) => stdout.push(message) });
      runtime.setStderr({ batched: (message) => stderr.push(message) });
      runtime.setStdin({ stdin: () => (inputLines.length > 0 ? inputLines.shift() ?? "" : null) });
      await runtime.runPythonAsync(code);

      const text = [...stdout, ...stderr].join("");
      setOutput(text || "Готово: программа ничего не вывела.");
    } catch (error) {
      const captured = [...stdout, ...stderr].join("");
      setOutput(`${captured}${captured && !captured.endsWith("\n") ? "\n" : ""}Ошибка:\n${errorText(error)}`);
      setRuntimeMessage("Не удалось выполнить код — проверьте программу и соединение для загрузки Pyodide");
    } finally {
      setRunning(false);
    }
  }, [code, stdin, running, runtimeReady]);

  const reset = () => {
    setCode(STARTER_CODE);
    setStdin("");
    setOutput("Нажмите «Запустить», чтобы увидеть результат.");
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Terminal className="w-4 h-4" /> Боковая вкладка · Python
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Мини-компилятор Python</h2>
            <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Пишите небольшой код и запускайте его прямо в браузере. Установка Python не нужна: используется Pyodide,
              который переводит CPython в WebAssembly.
            </p>
          </div>
          <a
            href="https://pyodide.org/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Как это работает <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-5 items-start">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-white">main.py</span>
                <span className="text-[11px] text-slate-500">Python 3 · Pyodide</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Сбросить
                </button>
                <button
                  type="button"
                  onClick={() => void runCode()}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {running ? "Запускаю…" : "Запустить"}
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  void runCode();
                }
              }}
              spellCheck={false}
              aria-label="Код Python"
              className="block w-full min-h-[360px] resize-y bg-[#0b1220] px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 placeholder:text-slate-600"
              placeholder="Напишите Python-код…"
            />

            <div className="border-t border-slate-800 bg-slate-950/70">
              <label className="block px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="python-stdin">
                Ввод для input() · по одной строке на каждый вызов
              </label>
              <textarea
                id="python-stdin"
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                spellCheck={false}
                rows={2}
                placeholder={'Например:\nАлиса'}
                className="block w-full resize-y bg-transparent px-4 py-2 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="w-4 h-4 text-emerald-400" /> Результат
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${runtimeReady ? "text-emerald-400" : "text-slate-500"}`}>
                {runtimeReady && <CheckCircle2 className="w-3.5 h-3.5" />}
                {runtimeReady ? "готов" : "не загружен"}
              </span>
            </div>
            <pre className="min-h-[360px] max-h-[560px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] p-4 font-mono text-[13px] leading-6 text-slate-300">
              {output}
            </pre>
            <div className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">{runtimeMessage}</div>
          </section>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>Ctrl или Cmd + Enter запускает код. Вывод и ошибки появляются справа.</span>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>Первый запуск скачивает примерно несколько мегабайт Pyodide и может занять время.</span>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>Код выполняется в браузере и не отправляется на сервер пособия.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
````

### Patch относительно `main`

````diff
diff --git a/src/components/PythonCompiler.tsx b/src/components/PythonCompiler.tsx
new file mode 100644
index 0000000..1113e0f
--- /dev/null
+++ b/src/components/PythonCompiler.tsx
@@ -0,0 +1,205 @@
+import { useCallback, useState } from "react";
+import { CheckCircle2, ExternalLink, Info, Loader2, Play, RotateCcw, Terminal } from "lucide-react";
+
+const PYODIDE_VERSION = "0.27.7";
+const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
+const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
+
+const STARTER_CODE = `# Первый запуск загрузит Python в браузер.
+name = "алгоритмы"
+
+for number in range(1, 4):
+    print(f"{number}. Учим {name}!")
+`;
+
+type PyodideRuntime = {
+  runPythonAsync: (source: string) => Promise<unknown>;
+  setStdout: (options: { batched: (message: string) => void }) => void;
+  setStderr: (options: { batched: (message: string) => void }) => void;
+  setStdin: (options: { stdin: () => string | number | null }) => void;
+};
+
+type PyodideModule = {
+  loadPyodide: (options: { indexURL: string }) => Promise<PyodideRuntime>;
+};
+
+let runtimePromise: Promise<PyodideRuntime> | null = null;
+
+function getPythonRuntime() {
+  if (!runtimePromise) {
+    runtimePromise = import(/* @vite-ignore */ PYODIDE_MODULE_URL).then((module) =>
+      (module as PyodideModule).loadPyodide({ indexURL: PYODIDE_INDEX_URL })
+    );
+  }
+  return runtimePromise;
+}
+
+function errorText(error: unknown) {
+  if (error instanceof Error) return error.message;
+  return String(error);
+}
+
+export function PythonCompiler() {
+  const [code, setCode] = useState(STARTER_CODE);
+  const [stdin, setStdin] = useState("");
+  const [output, setOutput] = useState("Нажмите «Запустить», чтобы увидеть результат.");
+  const [running, setRunning] = useState(false);
+  const [runtimeReady, setRuntimeReady] = useState(false);
+  const [runtimeMessage, setRuntimeMessage] = useState("Python загружается только после первого запуска");
+
+  const runCode = useCallback(async () => {
+    if (running) return;
+
+    setRunning(true);
+    setOutput("");
+    setRuntimeMessage(runtimeReady ? "Выполняю код…" : "Загружаю Python в браузер…");
+
+    const stdout: string[] = [];
+    const stderr: string[] = [];
+    const inputLines = stdin.split(/\r?\n/);
+
+    try {
+      const runtime = await getPythonRuntime();
+      setRuntimeReady(true);
+      setRuntimeMessage("Python готов — код выполняется локально в браузере");
+
+      runtime.setStdout({ batched: (message) => stdout.push(message) });
+      runtime.setStderr({ batched: (message) => stderr.push(message) });
+      runtime.setStdin({ stdin: () => (inputLines.length > 0 ? inputLines.shift() ?? "" : null) });
+      await runtime.runPythonAsync(code);
+
+      const text = [...stdout, ...stderr].join("");
+      setOutput(text || "Готово: программа ничего не вывела.");
+    } catch (error) {
+      const captured = [...stdout, ...stderr].join("");
+      setOutput(`${captured}${captured && !captured.endsWith("\n") ? "\n" : ""}Ошибка:\n${errorText(error)}`);
+      setRuntimeMessage("Не удалось выполнить код — проверьте программу и соединение для загрузки Pyodide");
+    } finally {
+      setRunning(false);
+    }
+  }, [code, stdin, running, runtimeReady]);
+
+  const reset = () => {
+    setCode(STARTER_CODE);
+    setStdin("");
+    setOutput("Нажмите «Запустить», чтобы увидеть результат.");
+  };
+
+  return (
+    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
+      <div className="max-w-6xl mx-auto">
+        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
+          <div>
+            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
+              <Terminal className="w-4 h-4" /> Боковая вкладка · Python
+            </div>
+            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Мини-компилятор Python</h2>
+            <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed">
+              Пишите небольшой код и запускайте его прямо в браузере. Установка Python не нужна: используется Pyodide,
+              который переводит CPython в WebAssembly.
+            </p>
+          </div>
+          <a
+            href="https://pyodide.org/"
+            target="_blank"
+            rel="noreferrer"
+            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
+          >
+            Как это работает <ExternalLink className="w-3.5 h-3.5" />
+          </a>
+        </div>
+
+        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-5 items-start">
+          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
+            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
+              <div className="flex items-center gap-2">
+                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
+                <span className="text-sm font-bold text-white">main.py</span>
+                <span className="text-[11px] text-slate-500">Python 3 · Pyodide</span>
+              </div>
+              <div className="flex items-center gap-2">
+                <button
+                  type="button"
+                  onClick={reset}
+                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
+                >
+                  <RotateCcw className="w-3.5 h-3.5" /> Сбросить
+                </button>
+                <button
+                  type="button"
+                  onClick={() => void runCode()}
+                  disabled={running}
+                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
+                >
+                  {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
+                  {running ? "Запускаю…" : "Запустить"}
+                </button>
+              </div>
+            </div>
+
+            <textarea
+              value={code}
+              onChange={(event) => setCode(event.target.value)}
+              onKeyDown={(event) => {
+                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
+                  event.preventDefault();
+                  void runCode();
+                }
+              }}
+              spellCheck={false}
+              aria-label="Код Python"
+              className="block w-full min-h-[360px] resize-y bg-[#0b1220] px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 placeholder:text-slate-600"
+              placeholder="Напишите Python-код…"
+            />
+
+            <div className="border-t border-slate-800 bg-slate-950/70">
+              <label className="block px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="python-stdin">
+                Ввод для input() · по одной строке на каждый вызов
+              </label>
+              <textarea
+                id="python-stdin"
+                value={stdin}
+                onChange={(event) => setStdin(event.target.value)}
+                spellCheck={false}
+                rows={2}
+                placeholder={'Например:\nАлиса'}
+                className="block w-full resize-y bg-transparent px-4 py-2 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700"
+              />
+            </div>
+          </section>
+
+          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
+            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
+              <div className="flex items-center gap-2 text-sm font-bold text-white">
+                <Terminal className="w-4 h-4 text-emerald-400" /> Результат
+              </div>
+              <span className={`inline-flex items-center gap-1.5 text-[11px] ${runtimeReady ? "text-emerald-400" : "text-slate-500"}`}>
+                {runtimeReady && <CheckCircle2 className="w-3.5 h-3.5" />}
+                {runtimeReady ? "готов" : "не загружен"}
+              </span>
+            </div>
+            <pre className="min-h-[360px] max-h-[560px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] p-4 font-mono text-[13px] leading-6 text-slate-300">
+              {output}
+            </pre>
+            <div className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">{runtimeMessage}</div>
+          </section>
+        </div>
+
+        <div className="mt-5 grid md:grid-cols-3 gap-3 text-xs leading-relaxed">
+          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
+            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
+            <span>Ctrl или Cmd + Enter запускает код. Вывод и ошибки появляются справа.</span>
+          </div>
+          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
+            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
+            <span>Первый запуск скачивает примерно несколько мегабайт Pyodide и может занять время.</span>
+          </div>
+          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
+            <Info className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
+            <span>Код выполняется в браузере и не отправляется на сервер пособия.</span>
+          </div>
+        </div>
+      </div>
+    </main>
+  );
+}
````

## `vite.config.ts`

### Полное содержимое после изменений

````typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // На GitHub Pages приложение живёт в /algv0/, локально — в корне.
  // VITE_BASE можно переопределить, если репозиторий будет переименован.
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // предпросмотр может открываться через внешний прокси-хост
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
});
````

### Patch относительно `main`

````diff
diff --git a/vite.config.ts b/vite.config.ts
index c0456e7..e19d945 100644
--- a/vite.config.ts
+++ b/vite.config.ts
@@ -10,6 +10,9 @@ const __dirname = path.dirname(__filename);
 
 // https://vite.dev/config/
 export default defineConfig({
+  // На GitHub Pages приложение живёт в /algv0/, локально — в корне.
+  // VITE_BASE можно переопределить, если репозиторий будет переименован.
+  base: process.env.VITE_BASE || "/",
   plugins: [react(), tailwindcss(), viteSingleFile()],
   resolve: {
     alias: {
````
