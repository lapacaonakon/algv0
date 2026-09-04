import React, { useMemo, useState } from "react";
import { BookOpen, Play, Search, X } from "lucide-react";
import { VIZ_REGISTRY } from "./vizRegistry";
import { chapters } from "../data/content";

interface Props {
  /** Открыть тренажёр в модальном окне. */
  onOpen: (vizId: string) => void;
  /** Перейти к теме, к которой привязан тренажёр. */
  onGoChapter: (chapterId: string) => void;
}

/**
 * Каталог всех интерактивных тренажёров.
 *
 * Раньше вкладка «Симулятор» показывала один случайный виджет со стеком и тарелками —
 * теперь это витрина: видно всё, что вообще можно потыкать, и к какой теме оно относится.
 */
export const SimulatorHub: React.FC<Props> = ({ onOpen, onGoChapter }) => {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const titleById = new Map(chapters.map((c) => [c.id, c.title]));
    const all = Object.entries(VIZ_REGISTRY).map(([id, entry]) => ({
      id,
      entry,
      chapterTitle: titleById.get(id),
    }));
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (i) =>
        i.entry.title.toLowerCase().includes(q) ||
        (i.entry.hint ?? "").toLowerCase().includes(q) ||
        (i.chapterTitle ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">Тренажёры</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Все интерактивные демонстрации в одном месте. Обычно они сами всплывают в тексте по наведению на термин —
          здесь их можно открыть напрямую.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск тренажёра…"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
            aria-label="Очистить поиск"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {items.length === 0 && <p className="text-slate-500 text-sm">Ничего не найдено.</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ id, entry, chapterTitle }) => (
          <div
            key={id}
            className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/60 transition-colors"
          >
            <h3 className="font-bold text-white text-sm leading-snug mb-1.5">{entry.title}</h3>
            {entry.hint && <p className="text-[12px] text-slate-400 leading-relaxed mb-3 flex-1">{entry.hint}</p>}
            {!entry.hint && <div className="flex-1" />}

            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => onOpen(id)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Запустить
              </button>
              {chapterTitle && (
                <button
                  onClick={() => onGoChapter(id)}
                  title={chapterTitle}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors min-w-0"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[9rem]">{chapterTitle}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
