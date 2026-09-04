import { useEffect } from "react";
import { GLOSSARY_LABELS } from "../data/glossary";

/** Сколько раз один и тот же термин подсвечивается в главе (чтобы текст не рябил). */
const MAX_PER_TERM = 2;

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

  const counts = new Map<string, number>();
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
      const id = labelToId.get(m[1].toLowerCase());
      if (!id) continue;
      const used = counts.get(id) ?? 0;
      if (used >= MAX_PER_TERM) continue;
      counts.set(id, used + 1);

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

/** Навешивает разметку терминов на контейнер при каждой смене главы. */
export function useTermHints(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      annotateTerms(el);
    } catch {
      /* если браузер не умеет lookbehind — просто оставляем текст как есть */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
