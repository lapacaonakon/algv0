/**
 * HTML страницы пособия → плоский список блоков для печати/PDF/текстового дампа.
 *
 * Задача: вытащить из Tailwind-разметки САМ ТЕКСТ (как «лёгкая» версия статьи
 * в ридере), сохранив структуру и ПОРЯДОК слов: заголовки, абзацы, списки,
 * таблицы, код, спойлеры <details>. Служебная разметка (div-обёртки, классы,
 * svg, кнопки) отбрасывается, содержимое спойлеров — наоборот, раскрывается.
 *
 * Никаких внешних зависимостей: собственный мини-парсер на стеке. Текстовые
 * куски хранятся отдельными узлами #text, поэтому инлайн-разметка
 * (<b>, <code>, <span>) не «уезжает» в конец абзаца.
 */

/** Содержимое этих тегов не нужно в текстовой версии. */
const SKIP = new Set([
  "svg", "script", "style", "button", "iframe", "video", "audio", "img",
  "path", "circle", "rect", "line", "polyline", "polygon", "text", "g",
  "defs", "marker", "tspan", "ellipse", "use", "clipPath", "lineargradient", "stop",
]);

/** Пустые элементы (без закрывающего тега). */
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

/** Блочные теги: их содержимое собирается в отдельный блок. */
const BLOCK = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "pre", "blockquote",
  "summary", "figcaption", "table", "tr", "td", "th", "div", "section",
  "article", "ul", "ol", "details", "figure", "header", "footer", "aside", "nav",
]);

const HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/**
 * Разбор HTML в дерево: { tag, attrs, children }, текстовые куски — узлы #text.
 * Намеренно простой: страницы пособия генерируются нами и валидны.
 */
export function parseHtml(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^>]*?)?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [full, closeTag, openTag, attrsStr, selfClose, textChunk] = m;
    if (full.startsWith("<!--")) continue;

    if (closeTag) {
      const tag = closeTag.toLowerCase();
      // закрываем до совпадения (прощает незакрытые <p>/<li>)
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    if (openTag) {
      const tag = openTag.toLowerCase();
      const attrs = {};
      const attrRe = /([a-zA-Z-_:]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let a;
      while ((a = attrRe.exec(attrsStr || "")) !== null) attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? "";
      const node = { tag, attrs, children: [] };
      stack[stack.length - 1].children.push(node);
      if (!VOID.has(tag) && !selfClose) stack.push(node);
      continue;
    }

    if (textChunk !== undefined && textChunk.length) {
      stack[stack.length - 1].children.push({ tag: "#text", attrs: {}, children: [], text: textChunk });
    }
  }
  return root;
}

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&hellip;/g, "…")
    .replace(/&times;/g, "×")
    .replace(/&le;/g, "≤")
    .replace(/&ge;/g, "≥")
    .replace(/&ne;/g, "≠")
    .replace(/&infin;/g, "∞")
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));

const clean = (s) => decodeEntities(s).replace(/\s+/g, " ").trim();

const isEl = (n) => n.tag !== "#text";
const isBlockEl = (n) => isEl(n) && BLOCK.has(n.tag) && !SKIP.has(n.tag);

/** Есть ли у узла блочные потомки (тогда его текст «размазан» по детям). */
const hasBlockChild = (node) => node.children.some(isBlockEl);

/** Текст инлайнового поддерева в порядке документа. */
function inlineText(node) {
  let out = "";
  for (const c of node.children) {
    if (c.tag === "#text") {
      out += c.text;
    } else if (SKIP.has(c.tag)) {
      continue;
    } else if (BLOCK.has(c.tag)) {
      continue;
    } else if (c.tag === "br") {
      out += "\n";
    } else {
      out += inlineText(c);
    }
  }
  return clean(out);
}

/** Весь текст поддерева (для ячеек таблиц и подписей). */
function collectText(node) {
  if (node.tag === "#text") return clean(node.text);
  if (SKIP.has(node.tag)) return "";
  if (node.tag === "table") return tableRows(node).map((r) => r.join(" ")).join(" ");
  return clean(node.children.map(collectText).join(" "));
}

/** Сырой текст внутри <pre> — переносы строк важны. */
function collectRawPre(node) {
  if (node.tag === "#text") return node.text;
  if (node.tag === "br") return "\n";
  if (SKIP.has(node.tag) && node.tag !== "img") return "";
  return node.children.map(collectRawPre).join("");
}

/** Таблица → массив строк из массивов ячеек. */
function tableRows(node) {
  const rows = [];
  const visit = (n) => {
    if (n.tag === "tr") {
      const cells = n.children.filter((c) => c.tag === "td" || c.tag === "th").map((c) => collectText(c));
      if (cells.some((c) => c.length)) rows.push(cells);
      return;
    }
    n.children.forEach(visit);
  };
  node.children.forEach(visit);
  return rows;
}

/**
 * Обход дерева: собираем блоки в порядке документа.
 * @returns {Array<{type:string,text?:string,rows?:string[][],level?:number,ordinal?:number|null,depth?:number}>}
 */
export function htmlToBlocks(html) {
  const root = parseHtml(html);
  const out = [];

  const push = (block) => {
    const prev = out[out.length - 1];
    if (prev && prev.type === block.type && prev.text === block.text) return; // дубль из вложенной обёртки
    out.push(block);
  };

  const emitListItem = (li, ordinal, depth) => {
    const text = collectText(li);
    if (text) push({ type: "li", text, ordinal: ordinal ?? null, depth });
    // вложенные списки внутри li
    li.children.forEach((c) => {
      if (c.tag === "ul" || c.tag === "ol") emitList(c, depth + 1);
    });
  };

  const emitList = (list, depth) => {
    let i = 0;
    for (const li of list.children) {
      if (li.tag !== "li") continue;
      i += 1;
      emitListItem(li, list.tag === "ol" ? i : null, depth);
    }
  };

  const walk = (node, listDepth = 0) => {
    if (node.tag !== "#root" && SKIP.has(node.tag)) return;

    if (node.tag === "table") {
      const rows = tableRows(node);
      if (rows.length) push({ type: "table", rows });
      return;
    }
    if (node.tag === "pre") {
      const text = decodeEntities(collectRawPre(node)).replace(/\s+$/, "");
      if (text.trim()) push({ type: "code", text: text.replace(/\n{3,}/g, "\n\n") });
      return;
    }

    // есть блочные дети: идём по порядку, инлайн-пробеги склеиваем в абзацы
    if (hasBlockChild(node)) {
      let buf = "";
      const flush = () => {
        const t = clean(buf);
        if (t) push({ type: "p", text: t });
        buf = "";
      };
      for (const c of node.children) {
        if (c.tag === "#text") {
          buf += c.text;
          continue;
        }
        if (SKIP.has(c.tag)) continue;
        if (!BLOCK.has(c.tag)) {
          buf += inlineText(c) + " ";
          continue;
        }
        if (c.tag === "ul" || c.tag === "ol") {
          flush();
          emitList(c, listDepth);
          continue;
        }
        flush();
        walk(c, listDepth);
      }
      flush();
      return;
    }

    // листовой блок: один блок по типу тега
    const text = inlineText(node);
    if (!text) return;
    if (HEADING.has(node.tag)) push({ type: "heading", level: Number(node.tag[1]), text });
    else if (node.tag === "li") emitListItem(node, null, listDepth);
    else if (node.tag === "summary") push({ type: "summary", text });
    else if (node.tag === "blockquote") push({ type: "quote", text });
    else if (node.tag === "figcaption") push({ type: "caption", text });
    else push({ type: "p", text });
  };

  root.children.forEach((c) => walk(c, 0));
  return out;
}

/** То же самое, но простым текстом (для .txt-дампа и внешних парсеров). */
export function htmlToPlainText(html) {
  const lines = [];
  for (const b of htmlToBlocks(html)) {
    if (b.type === "heading") lines.push("", "#".repeat(b.level) + " " + b.text, "");
    else if (b.type === "summary") lines.push("", "▸ " + b.text);
    else if (b.type === "li") lines.push("  ".repeat(b.depth ?? 0) + (b.ordinal ? `${b.ordinal}. ` : "• ") + b.text);
    else if (b.type === "code") lines.push("", ...b.text.split("\n").map((l) => "    " + l), "");
    else if (b.type === "table") {
      lines.push("");
      b.rows.forEach((r) => lines.push("| " + r.join(" | ") + " |"));
      lines.push("");
    } else if (b.type === "quote") lines.push("> " + b.text);
    else if (b.type === "caption") lines.push("   " + b.text);
    else lines.push(b.text, "");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
