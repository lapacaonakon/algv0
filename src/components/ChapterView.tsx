import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, Loader2, Printer, Sparkles, Terminal, Eye, MousePointerClick } from "lucide-react";
import type { Chapter } from "../types";
import { useTermHints } from "../hooks/useTermHints";
import { TermPopover, type HintAnchor } from "./hints/TermPopover";
import { getViz } from "./vizRegistry";
import { ChapterNav } from "./ChapterNav";
import { downloadChapterHtml } from "../utils/exportHtml";
import { getFallbackMeta, getFullCode } from "../data/compilerVars";

interface Props {
  chapter: Chapter;
  prev?: Chapter;
  next?: Chapter;
  index: number;
  total: number;
  onGo: (id: string) => void;
  onOpenCompiler?: () => void;
}

const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export const ChapterView: React.FC<Props> = ({ chapter, prev, next, index, total, onGo, onOpenCompiler }) => {
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
  const meta = getFallbackMeta(chapter.id);
  const fullCode = getFullCode(chapter.id);
  const [showCode, setShowCode] = useState(false);
  useEffect(() => setShowCode(false), [chapter.id]);

  return (
    <>
      <article className="chapter-body">
        <div className="flex flex-wrap items-center gap-2 mb-4 -mt-1">
          <button
            onClick={saveHtml}
            disabled={saving === "work"}
            title="Сохранить эту тему одним автономным HTML-файлом"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 disabled:opacity-60 transition-colors"
          >
            {saving === "work" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saving === "done" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            {saving === "done" ? "Файл сохранён" : "Скачать HTML этой страницы"}
          </button>
          <button
            onClick={() => window.print()}
            title="Распечатать или сохранить в PDF"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Печать
          </button>
          <span className="text-[11px] text-slate-500 hidden sm:inline">одна тема = один файл, без интернета</span>
          {onOpenCompiler && (
            <button
              onClick={onOpenCompiler}
              className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
              title="Открыть компилятор — i,j и 4→1"
            >
              <Terminal className="w-3.5 h-3.5" /> Компилятор
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
            <Eye className="w-3.5 h-3.5" /> {meta.title}
          </span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="flex flex-wrap gap-1.5">
            {Object.entries(meta.vars).map(([k, v]) => (
              <span key={k} className="font-mono text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded" title={`${k} — ${v.desc}`}>
                {k}={v.example}
              </span>
            ))}
          </span>
          {onOpenCompiler && (
            <button onClick={onOpenCompiler} className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
              <Terminal className="w-3 h-3" /> Компилятор
            </button>
          )}
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
          <span>Подчёркнутые термины — интерактивные: наведите или тапните, всплывёт подсказка.</span>
        </p>

        {viz && (
          <section id="chapter-viz" className="mt-8 scroll-mt-24">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Демонстрация: {viz.title}
              </h3>
              <div className="flex items-center gap-2">
                {fullCode && (
                  <button
                    onClick={() => setShowCode((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> {showCode ? "скрыть код" : "показать код"}
                  </button>
                )}
                {onOpenCompiler && (
                  <button
                    onClick={onOpenCompiler}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Компилятор · Шаг
                  </button>
                )}
              </div>
            </div>
            {viz.hint && <p className="text-xs text-slate-400 mb-3">{viz.hint}</p>}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-1">
              <viz.Component />
            </div>
            {fullCode && showCode && (
              <div className="mt-3 rounded-xl border border-indigo-900/40 bg-[#0b1220] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-indigo-900/30 bg-indigo-950/20">
                  <span className="text-xs font-mono text-indigo-300">код под визуализацией — отдельный объект (наследники: Code + Vars)</span>
                  <button onClick={() => navigator.clipboard.writeText(fullCode).catch(()=>{})} className="text-[11px] text-slate-400 hover:text-white">копировать</button>
                </div>
                <pre className="p-3 text-xs leading-5 font-mono text-slate-300 whitespace-pre-wrap break-words">{fullCode}</pre>
              </div>
            )}
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Визуализация — отдельный объект (Vars + Code). Терминал по дефолту пустой с <span className="font-mono text-slate-400">i,j=0,0 и a,b,c,d</span> — пиши код сам. Кнопка выше показывает реализацию.
            </div>
          </section>
        )}

        <ChapterNav prev={prev} next={next} index={index} total={total} onGo={onGo} />
      </article>

      <TermPopover
        anchor={anchor}
        onClose={() => setAnchor(null)}
        onOpenSimulator={() => {}}
        onCardEnter={cancelHide}
        onCardLeave={scheduleHide}
      />
    </>
  );
};
