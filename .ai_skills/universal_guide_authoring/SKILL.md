# Universal Guide Authoring — шаблоны страниц пособия

Обязательный справочник для **создания и правки контента** (билеты/главы) в этом
репозитории. На него ссылаются `AGENTS.md` и `GEMINI.md`: любую новую страницу
собираем **только** из блоков ниже — не придумываем новые классы и не пишем
«голый» markdown.

Контент живёт в `src/data/**/*.ts` как массив объектов `Chapter` и склеивается в
`src/data/content.ts` (при одинаковом `id` побеждает более поздний массив).

---

## 1. Объект главы

```ts
import { Chapter } from "../../types";

export const myChapters: Chapter[] = [
  {
    id: "dijkstra",            // = ключ VIZ_REGISTRY и (обычно) ключ PAGE_SYNC
    title: "14. Графы. Поиск кратчайшего пути. Дейкстра", // «N. Тема» — N даёт порядок в оглавлении
    type: "html",              // всегда "html": страница интерактивная
    category: "Графы. Пути",   // группа в навигации
    content: `...HTML ниже...`,
  },
];
```

Правила:

- `id` — kebab-case, уникальный, совпадает с ключом `VIZ_REGISTRY` (демонстрация
  подставляется автоматически, вручную `div#slot-*` вставлять **не нужно** —
  такие заглушки остались в старых главах и считаются мусором).
- `title` начинается с номера билета: сортировка оглавления и PDF идёт по первой
  цифре заголовка. Одна страница может закрывать несколько билетов
  (`mst` → 18, 19, 20) — тогда номер в заголовке один, а список билетов
  объявляется в `chapterTopics` (`src/data/content.ts`).
- `content` — шаблонная строка. Внутри **никаких** `` ` `` и `${` без
  экранирования: это сломает сборку.

---

## 2. Каркас страницы

```html
<section id="dijkstra-content" class="mb-12 scroll-mt-10">
  <!-- шапка: бейдж билета + заголовок -->
  <div class="flex items-center mb-6 flex-wrap gap-3">
    <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 14</span>
    <h2 class="text-2xl sm:text-3xl font-bold text-white">Дейкстра (Dijkstra)</h2>
  </div>

  <div class="space-y-8">
    <!-- смысловой блок (один или несколько) -->
    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
      <h3 class="text-xl font-bold text-emerald-400 mb-4">Суть алгоритма</h3>
      ...определение, абзацы, стат-сетка, аналогии, спойлеры, таблицы...
    </div>
  </div>
</section>
```

Цвет левой полосы и заголовка блока — семантика раздела:

| Полоса / цвет | Смысл раздела |
| --- | --- |
| `border-blue-500` + `text-blue-400` | определение, «одной фразой», база |
| `border-emerald-500` + `text-emerald-400` | алгоритм, как работает, код |
| `border-indigo-500` + `text-indigo-400` | теория, доказательства, свойства |
| `border-amber-500` + `text-amber-400` | ловушки, частые ошибки, границы применимости |
| `border-rose-500` + `text-rose-400` | ограничения, «когда ломается», сравнение |

---

## 3. Библиотека блоков (точные классы)

### 3.1 Определение / строгое правило — всегда по центру

```html
<div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
  <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
  <p class="text-xl font-mono text-white">if d[v] > d[u] + w(u,v) then d[v] = d[u] + w(u,v)</p>
</div>
```

### 3.2 Обычный абзац

```html
<p class="text-slate-300 text-sm mb-4">
  Текст с <b>акцентом</b> и инлайн-кодом
  <span class="font-mono text-emerald-300">dist[v]</span>.
</p>
```

Инлайн-«пилюля» для имени переменной/константы:

```html
<span class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O((V+E) log V)</span>
```

### 3.3 Сетка ключевых чисел (3 ячейки)

```html
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
  <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Время</p>
    <p class="font-mono text-emerald-300 text-sm">O((V+E) log V)</p>
  </div>
  <!-- 2-я и 3-я ячейки — тот же markup -->
</div>
```

### 3.4 Сетка аналогий — **обязательна** на каждой странице (2 колонки)

Слева — неформальная аналогия, справа — техническая альтернатива / ограничение.

```html
<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
  <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
      🌤️ Аналогия 1: Позитивное планирование
    </div>
    <p class="text-slate-300 text-sm mb-4">…</p>
  </div>

  <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
      💀 Ограничения
    </div>
    <p class="text-slate-300 text-sm mb-4">…</p>
  </div>
</div>
```

Второй карточкой может быть «Аналогия 2», «Ограничения», «Ловушка»,
«Когда не работает» — markup тот же (пунктирная rose-рамка).

### 3.5 Инфо-блок с таблицей

```html
<div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
  <p class="text-sm font-bold text-white mb-2">🎚️ Заголовок блока</p>
  <p class="text-slate-300 text-sm mb-3">Пояснение перед таблицей.</p>
  <table class="w-full text-xs text-left border-collapse">
    <thead>
      <tr class="text-slate-500 border-b border-slate-700">
        <th class="py-1.5 pr-2 font-bold">Колонка</th>
        <th class="py-1.5 pr-2 font-bold">Колонка</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-800 align-top">
        <td class="py-2 pr-3 font-bold">Значение</td>
        <td class="py-2 pr-3 font-mono">O(log n)</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 3.6 Спойлер `<details>` — **обязателен** для кода, формул и доказательств

```html
<details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
  <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
    ▸ Код: Дейкстра на куче (Python)
  </summary>
  <div class="p-5 text-sm text-slate-300 space-y-4">
    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>import heapq
…</code></pre>
    <p class="text-slate-300 text-sm">Комментарий после кода.</p>
  </div>
</details>
```

- Вложенные списки внутри спойлера: `<ul class="list-disc pl-5 space-y-1 text-sm text-slate-300">`.
- Подзаголовок внутри блока: `<h4 class="text-lg font-bold text-white mt-8 mb-3">…</h4>`
  или `<p class="text-lg font-bold text-white mt-8 mb-3">…</p>`.

### 3.7 Ловушки / частые ошибки

```html
<div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40 mt-6">
  <p class="text-sm font-bold text-rose-300 mb-3">⚠️ Где обычно теряют баллы</p>
  <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
    <li><b>Отрицательные веса.</b> Дейкстра их не переваривает — берите Форда—Беллмана.</li>
    <li>Переполнение: <span class="font-mono text-emerald-300">INF + w</span> уходит в минус.</li>
  </ul>
</div>
```

---

## 4. Порядок разделов на странице

1. Шапка: бейдж билета + `h2`.
2. «Одной фразой» / «Суть алгоритма» + центрированное определение (3.1).
3. 1–3 абзаца объяснения (3.2), затем сетка ключевых чисел (3.3).
4. Аналогии (3.4) — обязательный блок.
5. Механика: пошаговое описание, таблица состояний/сравнений (3.5).
6. Спойлеры (3.6): референсный код, доказательство, формулы, восстановление ответа.
7. Ловушки (3.7) + границы применимости.
8. Связь с другими билетами («тот же find/union — сердце Краскала (билет 18)»).

Демонстрацию вставлять не нужно: `ChapterView` монтирует её из `VIZ_REGISTRY`
по `id` главы после текста.

---

## 5. Контракт «демонстрация ↔ компилятор»

Каждая страница обязана иметь и визуализацию, и синхронизацию с панелью Python:

- `src/components/vizRegistry.tsx` — запись с ключом **= `id` главы**
  (`title`, опциональный `hint`, `Component`).
- `src/data/vizSync.ts` — запись `PAGE_SYNC[id]` или `PAGE_SYNC["id#demoId"]`,
  где `demoId` — второй аргумент `emitVizDemo(demoId, title)` внутри компонента
  (вкладки одной демонстрации).
- Поля записи: `vizTitle`, `stepNote` (что считается одним шагом),
  `variables: [{ name, role, range }]`, `code` (референсный код для кнопки «глаз»).
- Переменные, которые читает визуализация, должны быть **простыми**
  (`int`, `list`, `dict`, `str`): экземпляры классов снапшотятся как строка и
  до графики не доезжают.
- Стартовый шаблон в редакторе компилятора — `buildInitTemplate` (только
  инициализация переменных до строки `# --- тело алгоритма ---`).

Проверка перед коммитом: `npm run dev` → страница открывается, «глаз»
подставляет код, шаг демонстрации подсвечивает нужные переменные.

---

## 6. Экспорт в PDF (`npm run export:guide`)

Текст страниц парсится `scripts/export/html-to-blocks.mjs` и переносится в
`public/export/guide_lite.pdf` (текст + визуализации, без кода панели
компилятора и без навигации). Чтобы экспорт был полным:

- заголовки — только `h2/h3/h4`; списки — `ul/ol/li`; таблицы — `table`;
  код — `pre`; определения — обычный `p` (см. 3.1);
- **смысл не должен держаться на эмодзи**: в PDF используется DejaVu, у него
  нет эмодзи-глифов — пиктограммы вырезаются, остаётся только текст. Подпись
  «🎚️ Операции на отрезках» доедет как «Операции на отрезках» — это нормально,
  а вот «✅ значит да / ❌ значит нет» потеряет смысл, пишите словами;
- спойлеры в PDF раскрываются полностью — не прячьте туда «обязательный»
  минимум, но и не дублируйте его в основном тексте;
- картинки страниц берутся из `CHAPTER_IMAGES` (`scripts/export/build-guide-pdf.mjs`),
  снимки демонстраций — из `tmp/viz-shots/*.png` (их рендерит
  `npm run export:shots` в CI); локально без браузера вместо снимков печатается
  описание вкладок и переменных из `PAGE_SYNC`.

Цель по объёму: 40–60 страниц, жёсткий предел — 100.
