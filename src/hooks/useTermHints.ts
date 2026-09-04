import { useEffect } from "react";
import { GLOSSARY_LABELS } from "../data/glossary";

/**
 * Ограничители, чтобы текст не рябил, но и чтобы подсказки не пропадали.
 *
 * Считаем не «сколько раз встретился термин», а «сколько раз встретилось конкретное
 * написание». Иначе в главе про splay первые же «Splay-дерево» и «Splay(v)» съедали
 * лимит, и слова «Zig-Zag», «вращений», «AVL-дереве» оставались без подсказки.
 */
const MAX_PER_SURFACE = 2;
const MAX_PER_TERM = 8;

const SKIP_SELECTOR = "code, pre, script, style, a, textarea, input, .term-hint, [data-no-hint]";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Одна большая регулярка из всех меток: длинные раньше коротких. */
function buildRegex(): RegExp {
  const alternation = GLOSSARY_LABELS.map((l) => escapeRe(l.label)).join("|");
  // границы «не буква/цифра» — \b не работает с кириллицей
  return new RegExp(`(?<![\\p{L}\\p{N}_-])(${alternation})(?![\\p{L}\\p{N}_-])`, "giu");
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
      const surface = m[1].toLowerCase();
      const id = labelToId.get(surface);
      if (!id) continue;

      const usedTerm = perTerm.get(id) ?? 0;
      const usedSurface = perSurface.get(surface) ?? 0;
      if (usedTerm >= MAX_PER_TERM || usedSurface >= MAX_PER_SURFACE) continue;
      perTerm.set(id, usedTerm + 1);
      perSurface.set(surface, usedSurface + 1);

      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement("span");
      span.className = "term-hint";
      span.dataset.termId = id;
      span.tabIndex = 0;
      span.setAttribute("role", "button");
      span.setAttribute("aria-label", `Подсказка: ${m[1]}`);
      span.textContent = m[1];
      frag.appendChild(span);
      last = m.index + m[1].length;
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
    if (!el.querySelector(".term-hint")) run();
  });
}
