import { useEffect } from "react";
import { chapterTopics } from "../data/content";

/**
 * Перекрёстные ссылки между билетами.
 *
 * В тексте страниц десятки упоминаний вида «…берите Форда—Беллмана (билет 15)»
 * или «сердце Краскала (билет 18)». Раньше это был просто текст: читатель видел
 * номер, но попасть на него не мог — ссылка была «битой» в том смысле, что вела
 * в никуда. Здесь такие упоминания превращаются в настоящие переходы:
 *
 *   • в приложении — `<a data-goto="bellman-ford">`, клик перехватывает
 *     `ChapterView` и переключает страницу без перезагрузки;
 *   • в текстовой версии — `<a href="?lite=1&topic=…">`, то есть обычный
 *     работающий URL, который понимают парсеры и ридеры;
 *   • в PDF — остаётся текст (ссылки там всё равно не кликабельны).
 *
 * Номер билета → страница берётся из `chapterTopics`, поэтому ссылка на
 * «билет 19» корректно ведёт на общую страницу остовных деревьев `mst`
 * (она закрывает 18, 19 и 20 сразу).
 */

const ticketToChapter = new Map<number, string>();
for (const [id, tickets] of Object.entries(chapterTopics)) {
  for (const n of tickets) if (!ticketToChapter.has(n)) ticketToChapter.set(n, id);
}

/** id страницы по номеру билета (undefined, если такого билета в пособии нет). */
export const chapterForTicket = (ticket: number): string | undefined => ticketToChapter.get(ticket);

/** «билет», «билеты», «билетов», «билете», «билетам»… + номер или диапазон. */
const TICKET_RE = /билет(?:ы|ов|ам|ах|ом|у|а|е)?\s*(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?/gi;

/**
 * Константы TreeWalker числами: глобальный `NodeFilter` есть в браузере, но не
 * во всех окружениях (в jsdom его нет) — с числами разметка работает везде.
 */
const SHOW_TEXT = 4;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;

/** Внутри чего ссылки не ставим: код, уже существующие ссылки, элементы управления. */
const SKIP_SELECTOR = "code, pre, script, style, a, button, summary, textarea, input, [data-no-links]";

/** Одна страница на диапазон? «билеты 18–20» → mst, а «билеты 14–17» → четыре разные. */
function chapterForRange(from: number, to: number): string | undefined {
  let found: string | undefined;
  for (let n = from; n <= to; n += 1) {
    const id = ticketToChapter.get(n);
    if (!id) return undefined;
    if (found && found !== id) return undefined;
    found = id;
  }
  return found;
}

function hrefFor(id: string, lite: boolean): string {
  return lite ? `?lite=1&topic=${encodeURIComponent(id)}` : `?topic=${encodeURIComponent(id)}`;
}

/**
 * Строковая версия — для текстовой (`?lite=1`) версии, где контент вставляется
 * через `dangerouslySetInnerHTML`, а эффекты разметки там не запускаются.
 * HTML режется на «тег» и «текст», меняются только текстовые куски, и только
 * вне `pre/code/a`.
 */
export function linkifyTicketsHtml(html: string, opts: { selfId?: string; lite?: boolean } = {}): string {
  let inCode = 0;
  let inLink = 0;
  return html
    .split(/(<[^>]*>)/g)
    .map((part) => {
      if (!part) return part;
      if (part.startsWith("<")) {
        const closing = part.startsWith("</");
        const tag = part.slice(closing ? 2 : 1).split(/[\s>/]/)[0].toLowerCase();
        if (tag === "pre" || tag === "code" || tag === "script" || tag === "style" || tag === "textarea") {
          inCode = Math.max(0, inCode + (closing ? -1 : 1));
        } else if (tag === "a") {
          inLink = Math.max(0, inLink + (closing ? -1 : 1));
        }
        return part;
      }
      if (inCode > 0 || inLink > 0) return part;
      return part.replace(TICKET_RE, (whole, a: string, b?: string) => {
        const from = Number(a);
        const to = b ? Number(b) : from;
        const id = chapterForRange(from, to);
        if (!id || id === opts.selfId) return whole;
        return `<a class="ticket-link" data-goto="${id}" href="${hrefFor(id, opts.lite ?? false)}">${whole}</a>`;
      });
    })
    .join("");
}

/**
 * DOM-версия — для интерактивной страницы. Проходит только по текстовым узлам
 * (как `annotateTerms`), поэтому атрибуты и разметка не повреждаются.
 * Возвращает число созданных ссылок — его проверяют DOM-тесты.
 */
export function annotateTicketLinks(
  root: HTMLElement,
  opts: { selfId?: string; lite?: boolean } = {}
): number {
  if (typeof document === "undefined") return 0;
  const walker = document.createTreeWalker(root, SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return FILTER_REJECT;
      if (parent.closest(SKIP_SELECTOR)) return FILTER_REJECT;
      const text = node.nodeValue ?? "";
      if (!/билет/i.test(text)) return FILTER_REJECT;
      return FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    targets.push(current as Text);
    current = walker.nextNode();
  }

  let created = 0;
  for (const textNode of targets) {
    const text = textNode.nodeValue ?? "";
    TICKET_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = TICKET_RE.exec(text)) !== null) {
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : from;
      const id = chapterForRange(from, to);
      if (!id || id === opts.selfId) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const a = document.createElement("a");
      a.className = "ticket-link";
      a.dataset.goto = id;
      a.setAttribute("href", hrefFor(id, opts.lite ?? false));
      a.textContent = m[0];
      frag.appendChild(a);
      last = m.index + m[0].length;
      created += 1;
    }
    if (last === 0) continue;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode?.replaceChild(frag, textNode);
  }
  return created;
}

/** Размечает ссылки при смене главы и подстраховывается после перерисовок. */
export function useTicketLinks(
  ref: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  opts: { selfId?: string; lite?: boolean } = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (el) annotateTicketLinks(el, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
