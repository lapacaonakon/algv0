import { useEffect } from "react";
import { GLOSSARY_LABELS } from "../data/glossary";

/**
 * Ограничители, чтобы текст не рябил, но и чтобы подсказки не пропадали.
 *
 * Считаем не «сколько раз встретился термин», а «сколько раз встретилось конкретное
 * написание». Иначе в главе про splay первые же «Splay-дерево» и «Splay(v)» съедали
 * лимит, и слова «Zig-Zag», «вращений», «AVL-дереве» оставались без подсказки.
 */
const MAX_PER_SURFACE = 3;
const MAX_PER_TERM = 10;

const SKIP_SELECTOR = "code, pre, script, style, a, textarea, input, .term-hint, [data-no-hint]";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");

// Проверяем, поддерживает ли движок lookbehind с \p{L}
let supportsLookbehind = true;
try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  new RegExp("(?<![\\p{L}])test", "giu");
} catch {
  supportsLookbehind = false;
}

/** Одна большая регулярка из всех меток: длинные раньше коротких. */
function buildRegex(): RegExp {
  // Сортируем по длине убыв., чтобы длинные метки имели приоритет
  const sorted = [...GLOSSARY_LABELS].sort((a, b) => b.label.length - a.label.length);
  const alternation = sorted.map((l) => escapeRe(l.label)).join("|");
  if (supportsLookbehind) {
    // границы «не буква/цифра» — \b не работает с кириллицей
    return new RegExp(`(?<![\\p{L}\\p{N}_-])(${alternation})(?![\\p{L}\\p{N}_-])`, "giu");
  }
  // Фолбэк без lookbehind: захватываем границы в группы и проверяем вручную
  return new RegExp(`(^|[^\\p{L}\\p{N}_-])(${alternation})(?=[^\\p{L}\\p{N}_-]|$)`, "giu");
}

let cachedRegex: RegExp | null = null;
const labelToId = new Map(GLOSSARY_LABELS.map((l) => [l.label.toLowerCase(), l.id]));

/**
 * Проходит по тексту главы и оборачивает известные термины в
 * <span class="term-hint" data-term-id="…">, чтобы на них можно было
 * повесить всплывающую карточку (как превью ссылок в Википедии).
 */
export function annotateTerms(root: HTMLElement): void {
  if (!cachedRegex) cachedRegex = buildRegex();
  const re = cachedRegex;

  const perTerm = new Map<string, number>();
  const perSurface = new Map<string, number>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || node.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    targets.push(current as Text);
    current = walker.nextNode();
  }

  for (const textNode of targets) {
    const text = textNode.nodeValue ?? "";
    re.lastIndex = 0;
    if (!re.test(text)) continue;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      // Для фолбэка без lookbehind: группа 1 — разделитель, группа 2 — сам термин
      const hasPrefixGroup = !supportsLookbehind;
      const prefix = hasPrefixGroup ? m[1] ?? "" : "";
      const surfaceRaw = hasPrefixGroup ? m[2] : m[1];
      if (!surfaceRaw) continue;
      const surface = surfaceRaw.toLowerCase();
      const id = labelToId.get(surface);
      if (!id) continue;

      const usedTerm = perTerm.get(id) ?? 0;
      const usedSurface = perSurface.get(surface) ?? 0;
      if (usedTerm >= MAX_PER_TERM || usedSurface >= MAX_PER_SURFACE) continue;
      perTerm.set(id, usedTerm + 1);
      perSurface.set(surface, usedSurface + 1);

      // m.index указывает на начало всего совпадения (включая префикс в фолбэке)
      const matchStart = hasPrefixGroup ? m.index + prefix.length : m.index;
      const matchEnd = matchStart + surfaceRaw.length;

      if (matchStart > last) frag.appendChild(document.createTextNode(text.slice(last, matchStart)));
      // Если был префикс (пробел/знак), он уже в предыдущем текстовом узле, не дублируем
      if (hasPrefixGroup && prefix && last === m.index) {
        // prefix уже будет вставлен как часть slice выше? Нет, slice от last до matchStart исключает prefix,
        // поэтому нужно вставить prefix отдельно если он не пробел? Но prefix — это разделитель, который должен остаться.
        // Вставим его как текст перед термином.
        if (prefix) frag.appendChild(document.createTextNode(prefix));
      } else if (hasPrefixGroup && prefix && matchStart !== m.index) {
        // already handled
      }
      const span = document.createElement("span");
      span.className = "term-hint";
      span.dataset.termId = id;
      span.tabIndex = 0;
      span.setAttribute("role", "button");
      span.setAttribute("aria-label", `Подсказка: ${surfaceRaw}`);
      span.textContent = surfaceRaw;
      frag.appendChild(span);
      last = matchEnd;
    }

    if (last === 0) continue;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}

/**
 * Навешивает разметку терминов на контейнер при смене главы.
 *
 * Дополнительно перепроверяет разметку после каждого рендера: если React
 * (или что-то ещё) перезаписал innerHTML главы, подсказки восстанавливаются,
 * а не пропадают до перезагрузки страницы.
 */
export function useTermHints(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const run = () => {
    const el = ref.current;
    if (!el) return;
    try {
      annotateTerms(el);
    } catch {
      /* если браузер не умеет lookbehind — просто оставляем текст как есть */
    }
  };

  // при смене главы
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(run, deps);

  // страховка: контент перерисовали, а подсказок в нём нет — размечаем заново
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Если подсказок нет, сразу пробуем
    if (!el.querySelector(".term-hint")) run();

    // MutationObserver — ловим перерисовку innerHTML и повторно аннотируем
    const obs = new MutationObserver(() => {
      if (!el.querySelector(".term-hint")) run();
    });
    obs.observe(el, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  });
}
