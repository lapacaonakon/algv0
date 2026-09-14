import React, { useMemo } from "react";
import { chapters, chapterTopics } from "../data/content";
import { getViz } from "./vizRegistry";
import { PAGE_SYNC } from "../data/vizSync";
import { linkifyTicketsHtml } from "../utils/ticketLinks";
import { quizzes } from "../data/quizzes";

/**
 * «Лёгкая» текстовая версия пособия.
 *
 * Открывается по адресу `?lite=1` (весь список тем) или `?lite=1&topic=mst`
 * (одна тема). Здесь НЕТ навигации, сайдбара, интерактивных демонстраций и
 * панели компилятора — только сам текст тем, чтобы:
 *   1) любую страницу можно было распечатать/сохранить в PDF как есть;
 *   2) внешний парсер (ридер, «версия для слабовидящих», поисковый робот,
 *      LLM-индексатор) получал чистый текст без служебных элементов.
 *
 * Все спойлеры <details> раскрыты, визуализация описана текстом: что она
 * показывает, какие у неё вкладки и какие переменные кода её двигают.
 */

const LIGHT_CSS = `
  :root { color-scheme: light; }
  body { background: #ffffff !important; color: #111827 !important; }
  .lite-wrap { max-width: 46rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; }
  .lite-wrap h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 .25rem; color: #111827; }
  .lite-wrap h2 { font-size: 1.35rem; font-weight: 700; margin: 2.5rem 0 .5rem; padding-bottom: .35rem; border-bottom: 2px solid #d1d5db; color: #111827; }
  .lite-wrap h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 .4rem; color: #1f2937; }
  .lite-wrap h4 { font-size: 1rem; font-weight: 700; margin: 1.2rem 0 .3rem; color: #1f2937; }
  .lite-wrap p, .lite-wrap li { color: #1f2937; font-size: .98rem; }
  .lite-wrap a { color: #1d4ed8; }
  .lite-meta { color: #4b5563; font-size: .85rem; margin: 0 0 1.5rem; }
  .lite-topics { font-size: .8rem; color: #374151; margin: 0 0 2rem; padding: .6rem .8rem; border-left: 3px solid #9ca3af; background: #f9fafb; }
  .lite-viz { margin: 1.25rem 0; padding: .8rem 1rem; border: 1px solid #d1d5db; background: #f9fafb; font-size: .88rem; }
  .lite-viz h4 { margin: 0 0 .35rem; font-size: .95rem; color: #111827; }
  .lite-viz ul { margin: .35rem 0 0 1.1rem; padding: 0; }
  .lite-viz code, .lite-wrap code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .85em; background: #f3f4f6; padding: 0 .25rem; }
  .lite-wrap pre { background: #f3f4f6; border: 1px solid #e5e7eb; padding: .7rem .8rem; overflow-x: auto; font-size: .8rem; line-height: 1.45; }
  .lite-wrap table { border-collapse: collapse; width: 100%; margin: .8rem 0; font-size: .9rem; }
  .lite-wrap th, .lite-wrap td { border: 1px solid #d1d5db; padding: .35rem .5rem; text-align: left; }
  .lite-wrap th { background: #f3f4f6; }
  .lite-wrap details { margin: .6rem 0; border: 1px solid #e5e7eb; padding: .5rem .7rem; background: #fcfcfd; }
  .lite-wrap summary { cursor: default; font-weight: 700; color: #1f2937; }
  .lite-toc { font-size: .92rem; }
  .lite-toc ol { margin: .4rem 0 0 1.2rem; }
  @media print {
    .lite-wrap { max-width: none; padding: 0; }
    h2 { page-break-before: always; }
    h2:first-of-type { page-break-before: avoid; }
    pre, table, details { page-break-inside: avoid; }
  }
`;

/** Раскрываем все спойлеры и вычищаем служебную разметку. */
function toPlainTextHtml(html: string): string {
  return html
    .replace(/<details(?![^>]*\bopen\b)/g, "<details open")
    // кнопки/иконки внутри текста не нужны в текстовой версии
    .replace(/<button[\s\S]*?<\/button>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    // интерактивные подсказки терминов оставляем как обычный текст
    .replace(/\sdata-term-id="[^"]*"/g, "")
    .replace(/class="term-hint[^"]*"/g, "")
    // ссылки на другие билеты должны вести в текстовую версию, а не в приложение
    .replace(/href="\?topic=/g, 'href="?lite=1&topic=')
    .replace(/class="ticket-link"/g, "");
}

interface Props {
  /** id одной темы; undefined — все темы подряд. */
  topicId?: string;
}

export const LiteGuide: React.FC<Props> = ({ topicId }) => {
  const list = useMemo(() => {
    if (!topicId) return chapters;
    const one = chapters.filter((c) => c.id === topicId);
    return one.length ? one : chapters;
  }, [topicId]);

  return (
    <div className="lite-wrap">
      <style dangerouslySetInnerHTML={{ __html: LIGHT_CSS }} />

      <h1>Универсальное пособие: алгоритмы и структуры данных</h1>
      <p className="lite-meta">
        Билеты 1–24 · текстовая версия (без навигации, интерактивных демонстраций и панели компилятора) ·{" "}
        {topicId ? `одна тема: ${list[0]?.title ?? topicId}` : `${list.length} страниц`} ·{" "}
        <a href="?">полная интерактивная версия</a>
      </p>

      {!topicId && (
        <nav className="lite-toc">
          <h3>Содержание</h3>
          <ol>
            {list.map((c) => (
              <li key={c.id}>
                <a href={`?lite=1&topic=${encodeURIComponent(c.id)}`}>{c.title}</a>
                {chapterTopics[c.id]?.length ? ` — билет${chapterTopics[c.id].length > 1 ? "ы" : ""} ${chapterTopics[c.id].join(", ")}` : ""}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {list.map((chapter) => {
        const viz = getViz(chapter.id);
        const topics = chapterTopics[chapter.id] ?? [];
        const syncKeys = Object.keys(PAGE_SYNC).filter((k) => k === chapter.id || k.startsWith(`${chapter.id}#`));
        return (
          <article key={chapter.id} id={chapter.id}>
            <h2>{chapter.title}</h2>
            <p className="lite-topics">
              {topics.length > 0 && <>Билет{topics.length > 1 ? "ы" : ""}: {topics.join(", ")}. </>}
              {chapter.category ? <>Раздел: {chapter.category}. </> : null}
              id страницы: <code>{chapter.id}</code>
            </p>

            <div
              dangerouslySetInnerHTML={{
                __html: linkifyTicketsHtml(toPlainTextHtml(chapter.content), { selfId: chapter.id, lite: true }),
              }}
            />

            {viz && (
              <div className="lite-viz">
                <h4>Визуализация: {viz.title}</h4>
                {viz.hint && <p>{viz.hint}</p>}
                {syncKeys.map((k) => {
                  const sync = PAGE_SYNC[k];
                  const demo = k.includes("#") ? k.split("#")[1] : null;
                  return (
                    <div key={k}>
                      <p>
                        <b>{demo ? `Вкладка «${demo}»` : "Основной режим"}</b>
                        {sync.vizTitle ? ` — ${sync.vizTitle}` : ""}
                        {sync.stepNote ? <> Шаг демонстрации: {sync.stepNote}</> : null}
                      </p>
                      {sync.variables.length > 0 && (
                        <ul>
                          {sync.variables.map((v) => (
                            <li key={v.name}>
                              <code>{v.name}</code> — {v.role}
                              {v.range ? ` (${v.range})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
                <p className="lite-meta" style={{ marginTop: ".5rem" }}>
                  В интерактивной версии эта демонстрация управляется кодом на Python: значения перечисленных
                  переменных перерисовывают её напрямую.
                </p>
              </div>
            )}

            {(quizzes[chapter.id] ?? []).length > 0 && (
              <div className="lite-quiz">
                <h3>Блиц: вопросы по теме</h3>
                <ol>
                  {(quizzes[chapter.id] ?? []).map((q, i) => (
                    <li key={i}>
                      <p>
                        <b>{q.question}</b>
                      </p>
                      <ul>
                        {q.options.map((option, j) => (
                          <li key={j}>
                            {j === q.correctIndex ? <b>Верно: {option}</b> : option}
                          </li>
                        ))}
                      </ul>
                      <p className="lite-meta">{q.explanation}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default LiteGuide;
