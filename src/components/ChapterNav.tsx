import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Chapter } from "../types";

interface Props {
  prev?: Chapter;
  next?: Chapter;
  index: number;
  total: number;
  onGo: (id: string) => void;
  compact?: boolean;
}

/**
 * Переходы «предыдущая / следующая тема» — как на Codeforces и других учебных сайтах.
 * Компактный вариант живёт в шапке главы, крупный — под текстом.
 */
export const ChapterNav: React.FC<Props> = ({ prev, next, index, total, onGo, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <button
          disabled={!prev}
          onClick={() => prev && onGo(prev.id)}
          title={prev ? prev.title : "Это первая тема"}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 enabled:hover:bg-slate-700 enabled:hover:text-white disabled:opacity-35 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </button>
        <span className="text-slate-500 font-mono tabular-nums whitespace-nowrap">
          {index + 1} / {total}
        </span>
        <button
          disabled={!next}
          onClick={() => next && onGo(next.id)}
          title={next ? next.title : "Это последняя тема"}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 enabled:hover:bg-slate-700 enabled:hover:text-white disabled:opacity-35 transition-colors"
        >
          <span className="hidden sm:inline">Вперёд</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 pt-6 border-t border-slate-800">
      {prev ? (
        <button
          onClick={() => onGo(prev.id)}
          className="group text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/70 transition-all"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-400 mb-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Предыдущая тема
          </div>
          <div className="text-sm font-bold text-slate-200 group-hover:text-white leading-snug">{prev.title}</div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next && (
        <button
          onClick={() => onGo(next.id)}
          className="group text-right p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/70 transition-all sm:col-start-2"
        >
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-400 mb-1">
            Следующая тема <ChevronRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-bold text-slate-200 group-hover:text-white leading-snug">{next.title}</div>
        </button>
      )}
    </nav>
  );
};
