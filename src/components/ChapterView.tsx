import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, Loader2, Maximize2, MousePointerClick, Printer, Sparkles, Terminal } from "lucide-react";
import type { Chapter } from "../types";
import { useTermHints } from "../hooks/useTermHints";
import { TermPopover, type HintAnchor } from "./hints/TermPopover";
import { getViz } from "./vizRegistry";
import { VizChapterContext } from "../data/vizStepBus";
import { ChapterNav } from "./ChapterNav";
import { downloadChapterHtml } from "../utils/exportHtml";

interface Props {
  chapter: Chapter;
  prev?: Chapter;
  next?: Chapter;
  index: number;
  total: number;
  onGo: (id: string) => void;
  onOpenSimulator: (vizId: string) => void;
  /** Перейти во вкладку компилятора — там уже подставлены переменные этой демонстрации. */
  onOpenCompiler?: () => void;
}

const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export const ChapterView: React.FC<Props> = ({ chapter, prev, next, index, total, onGo, onOpenSimulator, onOpenCompiler }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HintAnchor | null>(null);
  const hideTimer = useRef<number | null>(null);
  const [saving, setSaving] = useState<"idle" | "work" | "done">("idle");

  useTermHints(contentRef, [chapter.id]);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setAnchor(null), 180);
  }, [cancelHide]);

  useEffect(() => {
    setAnchor(null);
    setSaving("idle");
  }, [chapter.id]);

  const saveHtml = useCallback(async () => {
    setSaving("work");
    try {
      await downloadChapterHtml(chapter);
      setSaving("done");
      window.setTimeout(() => setSaving("idle"), 2500);
    } catch {
      setSaving("idle");
    }
  }, [chapter]);

  const open = useCallback(
    (el: HTMLElement) => {
      const termId = el.dataset.termId;
      if (!termId) return;
      cancelHide();
      setAnchor({ termId, rect: el.getBoundingClientRect() });
    },
    [cancelHide]
  );

  const handlePointerOver = (e: React.MouseEvent) => {
    if (isTouch()) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(".term-hint");
    if (el) open(el);
  };

  const handlePointerOut = (e: React.MouseEvent) => {
    if (isTouch()) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(".term-hint");
    if (el) scheduleHide();
  };

  const handleClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".term-hint");
    if (!el) return;
    e.preventDefault();
    if (anchor && anchor.termId === el.dataset.termId) setAnchor(null);
    else open(el);
  };

  const handleFocus = (e: React.FocusEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".term-hint");
    if (el) open(el);
  };

  const viz = getViz(chapter.id);

  return (
    <>
      <article className="chapter-body">
        {/* панель выгрузки: сохранить именно эту страницу */}
        <div className="flex flex-wrap items-center gap-2 mb-4 -mt-1">
          <button
            onClick={saveHtml}
            disabled={saving === "work"}
            title="Сохранить эту тему одним автономным HTML-файлом (стили внутри, интернет не нужен)"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 disabled:opacity-60 transition-colors"
          >
            {saving === "work" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saving === "done" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {saving === "done" ? "Файл сохранён" : "Скачать HTML этой страницы"}
          </button>
          <button
            onClick={() => window.print()}
            title="Распечатать или сохранить в PDF средствами браузера"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Печать
          </button>
          <span className="text-[11px] text-slate-500">одна тема = один файл, открывается без интернета</span>
        </div>

        <div
          ref={contentRef}
          className="prose prose-invert max-w-none"
          onMouseOver={handlePointerOver}
          onMouseOut={handlePointerOut}
          onClick={handleClick}
          onFocus={handleFocus}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />

        <p className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
          <MousePointerClick className="w-4 h-4 shrink-0 text-indigo-400 mt-px" />
          <span>
            Подчёркнутые термины — интерактивные: наведите курсор (или тапните на телефоне), чтобы увидеть
            объяснение на пальцах, мини-анимацию и кнопку запуска полного симулятора.
          </span>
        </p>

        {viz && (
          <section id="chapter-viz" className="mt-8 scroll-mt-24">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Демонстрация: {viz.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSimulator(chapter.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Развернуть
                </button>
                {onOpenCompiler && (
                  <button
                    onClick={onOpenCompiler}
                    title="Открыть Python-компилятор: он синхронизирован с этой демонстрацией — покажет её переменные (i, j, k, n, m…) в комментарии"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 hover:text-white hover:border-emerald-500 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Переменные в компиляторе
                  </button>
                )}
              </div>
            </div>
            {viz.hint && <p className="text-xs text-slate-400 mb-3">{viz.hint}</p>}
            <VizChapterContext.Provider value={chapter.id}>
              <viz.Component />
            </VizChapterContext.Provider>
          </section>
        )}

        <ChapterNav prev={prev} next={next} index={index} total={total} onGo={onGo} />
      </article>

      <TermPopover
        anchor={anchor}
        onClose={() => setAnchor(null)}
        onOpenSimulator={(id) => {
          setAnchor(null);
          onOpenSimulator(id);
        }}
        onCardEnter={cancelHide}
        onCardLeave={scheduleHide}
      />
    </>
  );
};
